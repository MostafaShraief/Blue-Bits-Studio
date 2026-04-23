import { NavLink } from 'react-router';
import { useContext } from 'react';
import {
    LayoutDashboard,
    FileSearch,
    AlignRight,
    FileOutput,
    Palette,
    Layers,
    FileJson,
    Clock,
    Moon,
    Sun,
    Save,
    Sparkles
} from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import { AuthContext } from '../contexts/AuthContext';

const NAV_ITEMS = [
    { to: '/', label: 'الرئيسية', icon: LayoutDashboard, systemCode: null },
    { to: '/extraction', label: 'استخراج', icon: FileSearch, systemCode: 'LEC_EXT' },
    { to: '/coordination', label: 'تنسيق', icon: AlignRight, systemCode: 'COORD' },
    { to: '/pandoc', label: 'محوّل Pandoc', icon: FileOutput, systemCode: 'PANDOC' },
    { to: '/merge', label: 'دمج الملفات', icon: Layers, systemCode: 'MERGE' },
    { to: '/draw', label: 'الرسم', icon: Palette, systemCode: 'DRAW' },
    { to: '/quiz', label: 'الاختبارات', icon: FileJson, systemCode: 'QUIZ' },
    { to: '/history', label: 'السجل', icon: Clock, systemCode: 'HIST' },
];
export default function Sidebar() {
    const { darkMode, setDarkMode, autoSave, setAutoSave } = useSettings();
    const { user, loading } = useContext(AuthContext);

    // Wait for auth to load to avoid race condition
    if (loading) {
        return (
            <aside className="hidden md:flex flex-col fixed inset-y-0 inset-s-0 z-50 w-64 bg-sidebar text-white shrink-0">
                <div className="flex items-center justify-center h-full">
                    <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                </div>
            </aside>
        );
    }

    return (
        <aside className="hidden md:flex flex-col fixed inset-y-0 inset-s-0 z-50 w-64 bg-sidebar text-white shrink-0">
            {/* Logo */}
            <div className="flex items-center justify-center px-4 py-6 border-b border-white/10">
                <img
                    src="/logos/Horizontal logo.png"
                    alt="Blue Bits Studio"
                    className="h-10 object-contain brightness-0 invert"
                />
            </div>

            {/* Navigation */}
            <nav className="flex-1 flex flex-col gap-1 p-3 mt-2">
                {NAV_ITEMS.map(({ to, label, icon: Icon, systemCode }) => {
                    // History is universal for authenticated non-Admins, not a workflow SystemCode
                    const isHistory = systemCode === 'HIST';
                    // Extraction is a special case: check for either LEC_EXT or BANK_EXT
                    const isExtraction = systemCode === 'LEC_EXT';
                    const isAuthorized = isHistory
                        ? (!!user && user.role !== 'Admin')
                        : isExtraction
                            ? (user?.allowedWorkflows?.includes('LEC_EXT') || user?.allowedWorkflows?.includes('BANK_EXT'))
                            : (!systemCode || user?.allowedWorkflows?.includes(systemCode));
                    if (!isAuthorized) return null;
                    return (
                        <NavLink
                            key={to}
                            to={to}
                            end={to === '/'}
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

            {/* Settings */}
            <div className="p-4 border-t border-white/10">
                <div className="flex flex-col gap-4">
                    <label className="flex items-center justify-between cursor-pointer group">
                        <div className="flex items-center gap-3 text-sm text-white/70 group-hover:text-white transition-colors">
                            {darkMode ? <Moon size={18} /> : <Sun size={18} />}
                            <span>الوضع الليلي</span>
                        </div>
                        <div className="relative">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={darkMode}
                                onChange={(e) => setDarkMode(e.target.checked)}
                            />
                            <div className="w-9 h-5 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                        </div>
                    </label>

                    <label className="flex items-center justify-between cursor-pointer group">
                        <div className="flex items-center gap-3 text-sm text-white/70 group-hover:text-white transition-colors">
                            <Save size={18} />
                            <span>الحفظ التلقائي</span>
                        </div>
                        <div className="relative">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={autoSave}
                                onChange={(e) => setAutoSave(e.target.checked)}
                            />
                            <div className="w-9 h-5 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                        </div>
                    </label>
                </div>
            </div>
        </aside>
    );
}
