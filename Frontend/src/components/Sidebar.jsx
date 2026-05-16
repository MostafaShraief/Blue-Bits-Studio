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
    X,
} from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import { AuthContext } from '../contexts/AuthContext';
import SettingsModal from './SettingsModal';

const NAV_ITEMS = [
    { to: '/', label: 'الرئيسية', icon: LayoutDashboard, systemCode: null, role: 'Member' },
    { to: '/extraction', label: 'استخراج', icon: FileSearch, systemCode: 'LEC_EXT', role: 'Member' },
    { to: '/coordination', label: 'تنسيق', icon: AlignRight, systemCode: 'LEC_COORD', role: 'Member' },
    { to: '/pandoc', label: 'محوّل Pandoc', icon: FileOutput, systemCode: 'PANDOC', role: 'Member' },
    { to: '/merge', label: 'دمج الملفات', icon: Layers, systemCode: 'MERGE', role: 'Member' },
    { to: '/draw', label: 'الرسم', icon: Palette, systemCode: 'DRAW', role: 'Member' },
    { to: '/quiz', label: 'الاختبارات', icon: FileJson, systemCode: 'BANK_QS', role: 'Member' },
    { to: '/history', label: 'السجل', icon: Clock, systemCode: 'HIST', role: 'Member' },

    // Admin routes
    { to: '/admin/users', label: 'إدارة المستخدمين', icon: Users, systemCode: null, role: 'Admin' },
    { to: '/admin/materials', label: 'إدارة المواد', icon: BookOpen, systemCode: null, role: 'Admin' },
    { to: '/admin/system', label: 'إعدادات النظام', icon: Settings2, systemCode: null, role: 'Admin' },
];

export default function Sidebar({ isMobileOpen, onMobileClose }) {
    const { darkMode, setDarkMode, autoSave, setAutoSave, defaultMaterial, setDefaultMaterial } = useSettings();
    const { user, loading, logout } = useContext(AuthContext);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    const handleLogout = () => {
        logout();
        window.location.href = '/login';
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
            <div className="flex items-center justify-between px-4 py-6 border-b border-white/10">
                <img
                    src="/logos/Horizontal logo.png"
                    alt="Blue Bits Studio"
                    className="h-10 object-contain brightness-0 invert"
                />
                <button
                    onClick={onMobileClose}
                    className="p-1 rounded-lg hover:bg-white/10 text-white/70 hover:text-white md:hidden"
                    aria-label="إغلاق القائمة"
                >
                    <X size={20} />
                </button>
            </div>

            <nav className="flex-1 flex flex-col gap-1 p-3 mt-2">
                {NAV_ITEMS.map(({ to, label, icon: Icon, systemCode, role }) => {
                    const isAdmin = user?.role === 'Admin';
                    if (isAdmin && role !== 'Admin') return null;
                    if (!isAdmin && role === 'Admin') return null;

                    const isHistory = systemCode === 'HIST';
                    const isExtraction = systemCode === 'LEC_EXT';
                    const isCoordination = systemCode === 'LEC_COORD';

                    let isAuthorized = true;
                    if (!isAdmin) {
                        if (isHistory) {
                            isAuthorized = !!user;
                        } else if (isExtraction) {
                            isAuthorized = user?.allowedWorkflows?.includes('LEC_EXT') || user?.allowedWorkflows?.includes('BANK_EXT');
                        } else if (isCoordination) {
                            isAuthorized = user?.allowedWorkflows?.includes('LEC_COORD') || user?.allowedWorkflows?.includes('BANK_COORD');
                        } else if (systemCode) {
                            isAuthorized = user?.allowedWorkflows?.includes(systemCode);
                        }
                    }

                    if (!isAuthorized) return null;

                    const isExact = to === '/' || to.startsWith('/admin/');

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

            {isMobileOpen && (
                <aside className="fixed inset-y-0 inset-s-0 z-50 w-64 bg-sidebar text-white shadow-2xl md:hidden animate-fade-slide-in">
                    {sidebarContent}
                </aside>
            )}

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
