import { Outlet, NavLink } from 'react-router';
import { useContext } from 'react';
import {
    Users,
    BookOpen,
    Settings2,
    LogOut,
    Moon,
    Sun,
    Palette
} from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import { AuthContext } from '../contexts/AuthContext';

const ADMIN_NAV_ITEMS = [
    { to: '/admin/users', label: 'إدارة المستخدمين', icon: Users },
    { to: '/admin/materials', label: 'إدارة المواد', icon: BookOpen },
    { to: '/admin/system', label: 'إعدادات النظام', icon: Settings2 },
];

export default function AdminLayout() {
    const { darkMode, setDarkMode } = useSettings();
    const { logout } = useContext(AuthContext);

    return (
        <div className="flex h-dvh overflow-hidden">
            {/* Admin Sidebar */}
            <aside className="hidden md:flex flex-col fixed inset-y-0 inset-s-0 z-50 w-64 bg-slate-900 text-white shrink-0">
                {/* Logo */}
                <div className="flex items-center justify-center px-4 py-6 border-b border-white/10">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber to-orange flex items-center justify-center">
                            <Crown size={18} className="text-white" />
                        </div>
                        <span className="text-lg font-bold">لوحة المسؤول</span>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 flex flex-col gap-1 p-3 mt-2">
                    {ADMIN_NAV_ITEMS.map(({ to, label, icon: Icon }) => (
                        <NavLink
                            key={to}
                            to={to}
                            end={to === '/admin/users'}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-default
                               ${isActive
                                    ? 'bg-amber text-white shadow-lg shadow-amber/30'
                                    : 'text-white/70 hover:bg-slate-800 hover:text-white'
                                }`
                            }
                        >
                            <Icon size={20} strokeWidth={1.8} />
                            <span>{label}</span>
                        </NavLink>
                    ))}
                </nav>

                {/* Settings & Logout */}
                <div className="p-4 border-t border-white/10 space-y-4">
                    {/* Dark Mode Toggle */}
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
                            <div className="w-9 h-5 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber"></div>
                        </div>
                    </label>

                    {/* Logout */}
                    <button
                        onClick={logout}
                        className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-white/70 hover:bg-red-600/20 hover:text-red-400 transition-default"
                    >
                        <LogOut size={20} strokeWidth={1.8} />
                        <span>تسجيل الخروج</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-6 lg:p-8 md:ms-64">
                <Outlet />
            </main>
        </div>
    );
}