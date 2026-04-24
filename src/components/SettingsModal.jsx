import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
    Moon,
    Sun,
    Save,
    LogOut,
    X,
    XCircle,
    ChevronDown
} from 'lucide-react';
import { fetchMaterials } from '../utils/api';

// Custom Material Selector for Settings Modal
function MaterialSelector({ value, onChange }) {
    const [materials, setMaterials] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const buttonRef = useRef(null);
    const searchInputRef = useRef(null);
    const listRef = useRef(null);

    useEffect(() => {
        fetchMaterials().then(data => {
            // Sort materials alphabetically ascending (case-insensitive)
            const sorted = (data || []).sort((a, b) => 
                a.toLowerCase().localeCompare(b.toLowerCase(), 'ar')
            );
            setMaterials(sorted);
        });
    }, []);

    // Search function: match from start of words
    const filtered = search 
        ? materials.filter(m => {
            const searchLower = search.toLowerCase();
            // Check if search matches from the beginning of any word
            const words = m.toLowerCase().split(/[\s\-_]+/);
            return words.some(word => word.startsWith(searchLower));
        })
        : materials;

    // Handle keyboard navigation
    const handleKeyDown = (e) => {
        const totalItems = filtered.length;
        // No clear option - removed "إزالة التحديد"
        const hasClearOption = false;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (highlightedIndex < totalItems - 1) {
                // Go to next item
                setHighlightedIndex(highlightedIndex + 1);
                scrollToHighlighted(highlightedIndex + 1);
            }
            // At last item, stay there (no wrapping to prevent overflow confusion)
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (highlightedIndex > 0) {
                // Go to previous item
                setHighlightedIndex(highlightedIndex - 1);
                scrollToHighlighted(highlightedIndex - 1);
            }
            // At first item, stay there (no wrapping to prevent confusion)
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (highlightedIndex >= 0 && highlightedIndex < filtered.length) {
                onChange(filtered[highlightedIndex]);
                setIsOpen(false);
                setSearch('');
                setHighlightedIndex(-1);
            } else if (filtered.length > 0) {
                onChange(filtered[0]);
                setIsOpen(false);
                setSearch('');
            }
        } else if (e.key === 'Escape') {
            setIsOpen(false);
            setSearch('');
            setHighlightedIndex(-1);
        }
    };

    // Scroll to highlighted item
    const scrollToHighlighted = (index) => {
        setTimeout(() => {
            const list = listRef.current;
            if (!list) return;
            const items = list.children;
            if (items[index]) {
                items[index].scrollIntoView({ block: 'nearest' });
            }
        }, 0);
    };

    // Calculate position when opening and focus search input
    const handleToggle = (open) => {
        setIsOpen(open);
        if (open && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            setCoords({
                top: rect.bottom + 4,
                left: rect.left,
                width: rect.width
            });
            setHighlightedIndex(-1);
            // Focus search input after portal renders
            setTimeout(() => {
                searchInputRef.current?.focus();
            }, 0);
        }
    };

    const selectedMaterial = materials.find(m => m === value);

    // Handle item click
    const handleSelect = (mat) => {
        onChange(mat);
        setIsOpen(false);
        setSearch('');
        setHighlightedIndex(-1);
    };

    // Portal dropdown
    const dropdownPortal = isOpen ? createPortal(
        <div 
            className="fixed z-[70] rounded-xl border border-border bg-surface-card shadow-xl overflow-hidden"
            style={{ 
                top: coords.top, 
                left: coords.left, 
                width: coords.width,
                maxHeight: '240px'
            }}
        >
            <div className="p-2 border-b border-border">
                <input
                    ref={searchInputRef}
                    type="text"
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setHighlightedIndex(-1); }}
                    onKeyDown={handleKeyDown}
                    placeholder="ابحث..."
                    className="w-full px-3 py-2 text-sm bg-surface rounded-lg focus:outline-none text-text"
                />
            </div>
            <ul className="max-h-44 overflow-y-auto p-1" ref={listRef}>
                {filtered.map((mat, idx) => (
                    <li
                        key={idx}
                        onClick={() => handleSelect(mat)}
                        className={`px-3 py-2.5 text-sm cursor-pointer rounded-lg transition-colors ${
                            idx === highlightedIndex
                                ? 'bg-primary/20 text-primary font-medium ring-1 ring-primary/30'
                                : mat === value 
                                    ? 'bg-surface-hover text-text font-medium' 
                                    : 'text-text hover:bg-surface-hover'
                        }`}
                    >
                        {mat}
                    </li>
                ))}
            </ul>
        </div>,
        document.body
    ) : null;

    return (
        <div className="relative">
            <label className="block text-sm font-medium text-text mb-1.5">
                المادة الافتراضية
            </label>
            <div className="relative" ref={buttonRef}>
                <div
                    role="button"
                    tabIndex={0}
                    onClick={() => handleToggle(!isOpen)}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleToggle(!isOpen); }}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-border bg-surface-card text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-default cursor-pointer"
                >
                    <span className={selectedMaterial ? 'text-text' : 'text-text-muted'}>
                        {selectedMaterial || 'اختر المادة الافتراضية...'}
                    </span>
                    <div className="flex items-center gap-1">
                        {selectedMaterial && (
                            <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); onChange(''); }}
                                className="p-0.5 rounded-full hover:bg-surface-hover text-text-muted hover:text-danger"
                            >
                                <XCircle size={16} />
                            </button>
                        )}
                        <ChevronDown 
                            size={18} 
                            className={`text-text-muted transition-transform ${isOpen ? 'rotate-180' : ''}`}
                        />
                    </div>
                </div>
                {dropdownPortal}
            </div>
        </div>
    );
}

// Custom hook for managing modal exit animation
function useModalExit(isOpen) {
    const [shouldRender, setShouldRender] = useState(isOpen);
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setShouldRender(true);
            setIsExiting(false);
        } else if (shouldRender) {
            // Start exit animation
            setIsExiting(true);
            const timer = setTimeout(() => {
                setShouldRender(false);
                setIsExiting(false);
            }, 200);
            return () => clearTimeout(timer);
        }
    }, [isOpen, shouldRender]);

    return { shouldRender, isExiting };
}

function SettingsModal({ isOpen, onClose, darkMode, setDarkMode, autoSave, setAutoSave, defaultMaterial, setDefaultMaterial, onLogout }) {
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const { shouldRender, isExiting } = useModalExit(isOpen);

    // Handle close with animation
    const handleClose = () => {
        onClose();
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

    if (!shouldRender) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Dark Overlay with fade animation */}
            <div 
                className={`absolute inset-0 bg-black/60 backdrop-blur-sm ${isExiting ? 'animate-fadeOut' : 'animate-fadeIn'}`}
                onClick={handleClose}
            />
            
            {/* Modal Content with scale animation - overflow-hidden fixes grey corners */}
            <div className={`relative bg-surface-card rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden ${isExiting ? 'animate-scaleOut' : 'animate-scaleIn'}`}>
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

                {/* Content - overflow-y-auto allows scrolling without breaking corners */}
                <div className="p-6 space-y-6 overflow-y-auto max-h-[60vh]">
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
                            {/* Visible toggle: gray background in off state, primary in on state */}
                            <div className="w-9 h-5 bg-gray-300 dark:bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-400 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
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
                            {/* Visible toggle: gray background in off state, primary in on state */}
                            <div className="w-9 h-5 bg-gray-300 dark:bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-400 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                        </div>
                    </label>

                    {/* Default Material */}
                    <MaterialSelector
                        value={defaultMaterial}
                        onChange={setDefaultMaterial}
                    />
                </div>

                {/* Footer with Logout - bg-surface-card matches parent to fix grey corners */}
                <div className="px-6 py-4 border-t border-border bg-surface-card">
                    {!showLogoutConfirm ? (
                        <button
                            onClick={() => setShowLogoutConfirm(true)}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-danger/10 text-danger hover:bg-danger hover:text-white font-medium transition-all duration-200"
                        >
                            <LogOut size={18} />
                            <span>تسجيل الخروج</span>
                        </button>
                    ) : (
                        <div className="space-y-2 animate-fade-slide-in">
                            <p className="text-sm text-text text-center font-medium">
                                هل أنت متأكد من عملية تسجيل الخروج؟
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setShowLogoutConfirm(false)}
                                    className="flex-1 px-4 py-3 rounded-xl bg-surface text-text hover:bg-surface-hover font-medium transition-colors"
                                >
                                    إلغاء
                                </button>
                                <button
                                    onClick={onLogout}
                                    className="flex-1 px-4 py-3 rounded-xl bg-danger text-white hover:bg-danger/80 font-medium transition-colors"
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

export default SettingsModal;