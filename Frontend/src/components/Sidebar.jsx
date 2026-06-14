import { NavLink } from 'react-router';
import { useContext, useState } from 'react';
import {
    LayoutDashboard,
    FileSearch,
    AlignRight,
    FileOutput,
    Palette,
    Layers,
    FileJson,
    Clock,
    Settings,
    Users,
    BookOpen,
    Settings2,
} from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import { AuthContext } from '../contexts/AuthContext';
import SettingsModal from './SettingsModal';
import { INTERNAL_ROUTES } from '../config/links';

const NAV_ITEMS = [
    { to: INTERNAL_ROUTES.DASHBOARD, label: 'الرئيسية', icon: LayoutDashboard, systemCode: null, role: 'Member' },
    { to: INTERNAL_ROUTES.EXTRACTION, label: 'استخراج', icon: FileSearch, systemCode: 'LEC_EXT', role: 'Member' },
    { to: INTERNAL_ROUTES.COORDINATION, label: 'تنسيق', icon: AlignRight, systemCode: 'LEC_COORD', role: 'Member' },
    { to: INTERNAL_ROUTES.PANDOC, label: 'محوّل Pandoc', icon: FileOutput, systemCode: 'PANDOC_FULL', role: 'Member' },
    { to: INTERNAL_ROUTES.MERGE, label: 'دمج الملفات', icon: Layers, systemCode: 'MERGE', role: 'Member' },
    { to: INTERNAL_ROUTES.DRAW, label: 'الرسم', icon: Palette, systemCode: 'DRAW', role: 'Member' },
    { to: INTERNAL_ROUTES.QUIZ, label: 'الاختبارات', icon: FileJson, systemCode: 'BANK_QS', role: 'Member' },
    { to: INTERNAL_ROUTES.HISTORY, label: 'السجل', icon: Clock, systemCode: 'HIST', role: 'Member' },

    { to: INTERNAL_ROUTES.ADMIN_USERS, label: 'إدارة المستخدمين', icon: Users, systemCode: null, role: 'Admin' },
    { to: INTERNAL_ROUTES.ADMIN_MATERIALS, label: 'إدارة المواد', icon: BookOpen, systemCode: null, role: 'Admin' },
    { to: INTERNAL_ROUTES.ADMIN_SYSTEM, label: 'إعدادات النظام', icon: Settings2, systemCode: null, role: 'Admin' },
];

export default function Sidebar({ isMobileOpen, onMobileClose }) {
    const { darkMode, setDarkMode, autoSave, setAutoSave, defaultMaterial, setDefaultMaterial } = useSettings();
    const { user, loading, logout } = useContext(AuthContext);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    const handleLogout = () => {
        logout();
        window.location.href = INTERNAL_ROUTES.LOGIN;
    };

    const getInitials = () => {
        if (!user) return '';
        const first = user.firstName?.[0] || '';
        const last = user.lastName?.[0] || '';
        return (first + last).toUpperCase();
    };

    const handleNavClick = () => {
        if (window.innerWidth < 768) onMobileClose?.();
    };

    if (loading) {
        return (
            <aside className="hidden md:flex flex-col fixed inset-y-0 inset-s-0 z-50 w-64 bg-sidebar text-white shrink-0">
                <div className="flex items-center justify-center h-full">
                    <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                </div>
            </aside>
        );
    }

    const sidebarContent = (
        <>
            <div className="flex items-center justify-center px-4 py-6 border-b border-white/10">
                <img
                    src="/logos/Horizontal logo.png"
                    alt="Blue Bits Studio"
                    className="h-10 w-auto object-contain brightness-0 invert transition-all"
                />
            </div>

            <nav className="flex-1 flex flex-col gap-1 p-3 mt-2">
                {NAV_ITEMS.map(({ to, label, icon: Icon, systemCode, role }) => {
                    const isAdmin = user?.role === 'Admin';
                    if (isAdmin && role !== 'Admin') return null;
                    if (!isAdmin && role === 'Admin') return null;

                    const isHistory = systemCode === 'HIST';
                    const isExtraction = systemCode === 'LEC_EXT';
                    const isCoordination = systemCode === 'LEC_COORD';
                    const isPandoc = systemCode === 'PANDOC_FULL';

                    let isAuthorized = true;
                    if (!isAdmin) {
                        if (isHistory) {
                            isAuthorized = !!user;
                        } else if (isExtraction) {
                            isAuthorized = user?.allowedWorkflows?.includes('LEC_EXT') || user?.allowedWorkflows?.includes('BANK_EXT');
                        } else if (isCoordination) {
                            isAuthorized = user?.allowedWorkflows?.includes('LEC_COORD') || user?.allowedWorkflows?.includes('BANK_COORD');
                        } else if (isPandoc) {
                            isAuthorized = user?.allowedWorkflows?.includes('PANDOC_FULL') || user?.allowedWorkflows?.includes('PANDOC_BLANK');
                        } else if (systemCode) {
                            isAuthorized = user?.allowedWorkflows?.includes(systemCode);
                        }
                    }

                    if (!isAuthorized) return null;

                    const isExact = to === INTERNAL_ROUTES.DASHBOARD || to.startsWith('/admin/');

                    return (
                        <NavLink
                            key={to}
                            to={to}
                            end={isExact}
                            onClick={handleNavClick}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-default
                                ${isActive
                                    ? 'bg-primary text-white shadow-lg shadow-primary/30'
                                    : 'text-white/70 hover:bg-sidebar-hover hover:text-white'
                                }`
                            }
                        >
                            <Icon size={20} strokeWidth={1.8} />
                            <span>{label}</span>
                        </NavLink>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-white/10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/80 flex items-center justify-center text-white font-medium text-sm shrink-0">
                        {getInitials()}
                    </div>

                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                            {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-xs text-white/60 truncate">
                            @{user?.username}
                        </p>
                    </div>

                    <button
                        onClick={() => setIsSettingsOpen(true)}
                        className="p-2 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                    >
                        <Settings size={20} />
                    </button>
                </div>
            </div>
        </>
    );

    return (
        <>
            {isMobileOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 md:hidden animate-fadeIn"
                    onClick={onMobileClose}
                />
            )}

            <aside
                className={`fixed inset-y-0 inset-s-0 z-50 w-64 bg-sidebar text-white shadow-2xl md:hidden flex flex-col transition-transform duration-300 ease-out ${
                    isMobileOpen ? 'translate-x-0' : 'translate-x-full'
                }`}
            >
                {sidebarContent}
            </aside>

            <aside className="hidden md:flex flex-col fixed inset-y-0 inset-s-0 z-50 w-64 bg-sidebar text-white shrink-0">
                {sidebarContent}
            </aside>

            <SettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                darkMode={darkMode}
                setDarkMode={setDarkMode}
                autoSave={autoSave}
                setAutoSave={setAutoSave}
                defaultMaterial={defaultMaterial}
                setDefaultMaterial={setDefaultMaterial}
                onLogout={handleLogout}
                isAdmin={user?.role === 'Admin'}
            />
        </>
    );
}
