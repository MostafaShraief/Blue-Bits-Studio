import { NavLink } from 'react-router';
import {
    LayoutDashboard,
    FileSearch,
    AlignRight,
    FileOutput,
    Palette,
    Clock,
} from 'lucide-react';

const NAV_ITEMS = [
    { to: '/', label: 'الرئيسية', icon: LayoutDashboard },
    { to: '/extraction', label: 'استخراج', icon: FileSearch },
    { to: '/coordination', label: 'تنسيق', icon: AlignRight },
    { to: '/pandoc', label: 'محوّل Pandoc', icon: FileOutput },
    { to: '/draw', label: 'الرسم', icon: Palette },
    { to: '/history', label: 'السجل', icon: Clock },
];
export default function Sidebar() {
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
        </aside>
    );
}
