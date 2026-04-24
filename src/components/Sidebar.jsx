import { NavLink } from 'react-router';
import { useContext, useState, useEffect } from 'react';
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
    Settings,
    LogOut,
    X,
    ChevronDown
} from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import { AuthContext } from '../contexts/AuthContext';
import { fetchMaterials } from '../utils/api';

const NAV_ITEMS = [
    { to: '/', label: 'الرئيسية', icon: LayoutDashboard, systemCode: null },
    { to: '/extraction', label: 'استخراج', icon: FileSearch, systemCode: 'LEC_EXT' },
    { to: '/coordination', label: 'تنسيق', icon: AlignRight, systemCode: 'COORD' },
    { to: '/pandoc', label: 'محوّل Pandoc', icon: FileOutput, systemCode: 'PANDOC' },
    { to: '/merge', label: 'دمج الملفات', icon: Layers, systemCode: 'MERGE' },
    { to: '/draw', label: 'الرسم', icon: Palette, systemCode: 'DRAW' },
    { to: '/quiz', label: 'الاختبارات', icon: FileJson, systemCode: 'BANK_QS' },
    { to: '/history', label: 'السجل', icon: Clock, systemCode: 'HIST' },
];

// Custom Material Selector for Settings Modal (no overflow issues)
function MaterialSelector({ value, onChange }) {
    const [materials, setMaterials] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchMaterials().then(data => setMaterials(data || []));
    }, []);

    const filtered = search 
        ? materials.filter(m => m.toLowerCase().includes(search.toLowerCase()))
        : materials;

    const selectedMaterial = materials.find(m => m === value);

    return (
        <div className="relative">
            <label className="block text-sm font-medium text-text mb-1.5">
                المادة الافتراضية
            </label>
            <div className="relative">
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-border bg-surface-card text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-default"
                >
                    <span className={selectedMaterial ? 'text-text' : 'text-text-muted'}>
                        {selectedMaterial || 'اختر المادة الافتراضية...'}
                    </span>
                    <ChevronDown 
                        size={18} 
                        className={`text-text-muted transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    />
                </button>
                
                {isOpen && (
                    <div className="absolute z-50 mt-1 w-full max-h-60 rounded-xl border border-border bg-surface-card shadow-xl overflow-hidden">
                        <div className="p-2 border-b border-border">
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="ابحث..."
                                className="w-full px-3 py-2 text-sm bg-surface rounded-lg focus:outline-none text-text"
                            />
                        </div>
                        <ul className="max-h-44 overflow-auto p-1">
                            <li
                                onClick={() => { onChange(''); setIsOpen(false); setSearch(''); }}
                                className="px-3 py-2.5 text-sm text-text-muted hover:bg-surface-hover cursor-pointer rounded-lg"
                            >
                                إزالة التحديد
                            </li>
                            {filtered.map((mat, idx) => (
                                <li
                                    key={idx}
                                    onClick={() => { onChange(mat); setIsOpen(false); setSearch(''); }}
                                    className={`px-3 py-2.5 text-sm hover:bg-surface-hover cursor-pointer rounded-lg transition-colors ${
                                        mat === value ? 'bg-primary/10 text-primary' : 'text-text'
                                    }`}
                                >
                                    {mat}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}

function SettingsModal({ isOpen, onClose, darkMode, setDarkMode, autoSave, setAutoSave, defaultMaterial, setDefaultMaterial, onLogout }) {
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [isExiting, setIsExiting] = useState(false);

    // Handle close with animation
    const handleClose = () => {
        setIsExiting(true);
        // Wait for animation to complete
        setTimeout(() => {
            setIsExiting(false);
            onClose();
        }, 200);
    };

    // Reset confirmation when modal opens
    useEffect(() => {
        if (isOpen) setShowLogoutConfirm(false);
    }, [isOpen]);

    // Close on escape key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isOpen) handleClose();
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen]);

    if (!isOpen && !isExiting) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Dark Overlay with fade animation */}
            <div 
                className={`absolute inset-0 bg-black/60 backdrop-blur-sm ${isExiting ? 'animate-fadeOut' : 'animate-fadeIn'}`}
                onClick={handleClose}
            />
            
            {/* Modal Content with scale animation */}
            <div className={`relative bg-surface-card rounded-2xl shadow-2xl w-full max-w-md mx-4 ${isExiting ? 'animate-scaleOut' : 'animate-scaleIn'}`}>
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                    <h2 className="text-lg font-semibold text-text">الإعدادات</h2>
                    <button
                        onClick={handleClose}
                        className="p-2 rounded-lg hover:bg-surface-hover text-text-muted hover:text-text transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Dark Mode Toggle */}
                    <label className="flex items-center justify-between cursor-pointer group">
                        <div className="flex items-center gap-3 text-sm text-text">
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

                    {/* Auto Save Toggle */}
                    <label className="flex items-center justify-between cursor-pointer group">
                        <div className="flex items-center gap-3 text-sm text-text">
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

                    {/* Default Material */}
                    <MaterialSelector
                        value={defaultMaterial}
                        onChange={setDefaultMaterial}
                    />
                </div>

                {/* Footer with Logout */}
                <div className="px-6 py-4 border-t border-border bg-surface/50">
                    {!showLogoutConfirm ? (
                        <button
                            onClick={() => setShowLogoutConfirm(true)}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-error/10 text-error hover:bg-error hover:text-white font-medium transition-all duration-200"
                        >
                            <LogOut size={18} />
                            <span>تسجيل الخروج</span>
                        </button>
                    ) : (
                        <div className="space-y-2">
                            <p className="text-sm text-text text-center font-medium">
                                هل أنت متأكد من عملية تسجيل الخروج؟
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setShowLogoutConfirm(false)}
                                    className="flex-1 px-4 py-3 rounded-xl bg-surface-hover text-text hover:bg-error hover:text-white font-medium transition-colors"
                                >
                                    إلغاء
                                </button>
                                <button
                                    onClick={onLogout}
                                    className="flex-1 px-4 py-3 rounded-xl bg-error text-white hover:bg-error/80 font-medium transition-colors"
                                >
                                    تأكيد
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function Sidebar() {
    const { darkMode, setDarkMode, autoSave, setAutoSave } = useSettings();
    const { user, loading, logout } = useContext(AuthContext);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [defaultMaterial, setDefaultMaterial] = useState(() => {
        return localStorage.getItem('defaultMaterial') || '';
    });

    // Save default material to localStorage when changed
    const handleDefaultMaterialChange = (value) => {
        setDefaultMaterial(value);
        localStorage.setItem('defaultMaterial', value);
    };

    const handleLogout = () => {
        logout();
        window.location.href = '/login';
    };

    // Get user initials
    const getInitials = () => {
        if (!user) return '';
        const first = user.firstName?.[0] || '';
        const last = user.lastName?.[0] || '';
        return (first + last).toUpperCase();
    };

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
        <>
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

                {/* Profile Section */}
                <div className="p-4 border-t border-white/10">
                    <div className="flex items-center gap-3">
                        {/* Avatar with initials */}
                        <div className="w-10 h-10 rounded-full bg-primary/80 flex items-center justify-center text-white font-medium text-sm shrink-0">
                            {getInitials()}
                        </div>
                        
                        {/* Name and username */}
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">
                                {user?.firstName} {user?.lastName}
                            </p>
                            <p className="text-xs text-white/60 truncate">
                                @{user?.username}
                            </p>
                        </div>

                        {/* Settings Icon */}
                        <button
                            onClick={() => setIsSettingsOpen(true)}
                            className="p-2 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                        >
                            <Settings size={20} />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Settings Modal */}
            <SettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                darkMode={darkMode}
                setDarkMode={setDarkMode}
                autoSave={autoSave}
                setAutoSave={setAutoSave}
                defaultMaterial={defaultMaterial}
                setDefaultMaterial={handleDefaultMaterialChange}
                onLogout={handleLogout}
            />
        </>
    );
}