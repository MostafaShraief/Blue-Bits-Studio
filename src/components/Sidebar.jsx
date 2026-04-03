import { NavLink } from 'react-router';
import {
    LayoutDashboard,
    FileSearch,
    AlignRight,
    FileOutput,
    Palette,
    Clock,
    Moon,
    Sun,
    Save,
    Sparkles
} from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

const NAV_ITEMS = [
    { to: '/', label: 'الرئيسية', icon: LayoutDashboard },
    { to: '/extraction', label: 'استخراج', icon: FileSearch },
    { to: '/coordination', label: 'تنسيق', icon: AlignRight },
    { to: '/pandoc', label: 'محوّل Pandoc', icon: FileOutput },
    { to: '/draw', label: 'الرسم', icon: Palette },
    { to: '/history', label: 'السجل', icon: Clock },
    { to: '/tour', label: 'الجولة التعريفية', icon: Sparkles },
];
export default function Sidebar() {
    const { darkMode, setDarkMode, autoSave, setAutoSave } = useSettings();

    return (
        <aside className="hidden md:flex flex-col fixed inset-y-0 start-0 z-50 w-64 bg-sidebar text-white shrink-0">
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
                {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
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
                ))}
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
