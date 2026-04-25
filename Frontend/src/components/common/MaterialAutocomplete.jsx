import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { fetchMaterials } from '../../utils/api';

export default function MaterialAutocomplete({ value, onChange, label = 'اسم المادة', required = true, onValidChange }) {
    const [materials, setMaterials] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [filtered, setFiltered] = useState([]);
    const [isTouched, setIsTouched] = useState(false);
    const wrapperRef = useRef(null);

    // Check if the current value is a VALID material from the list
    const isValidValue = useMemo(() => {
        if (!value || !value.trim()) return false;
        return materials.some(m => m.toLowerCase() === value.trim().toLowerCase());
    }, [value, materials]);

    // Notify parent when validity changes
    useEffect(() => {
        if (onValidChange) {
            onValidChange(isValidValue);
        }
    }, [isValidValue, onValidChange]);

    // Expose validity through a data attribute for CSS/aria
    const showError = required && isTouched && !isValidValue;
    const hasInput = value && value.trim().length > 0;

    useEffect(() => {
        fetchMaterials().then(data => {
            setMaterials(data || []);
            setFiltered(data || []);
        });
    }, []);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleInputChange = (e) => {
        const val = e.target.value;
        onChange(val);
        setIsOpen(true);
        setIsTouched(true);
        if (val) {
            setFiltered(materials.filter(m => m.toLowerCase().includes(val.toLowerCase())));
        } else {
            setFiltered(materials);
        }
    };

    const selectMaterial = (mat) => {
        onChange(mat);
        setIsOpen(false);
        setIsTouched(true);
    };

    return (
        <div className="relative" ref={wrapperRef}>
            <label className="block text-sm font-medium text-text mb-1.5">
                {label} <span className="text-error">*</span>
            </label>
            <div className="relative">
                <input
                    type="text"
                    value={value || ''}
                    onChange={handleInputChange}
                    onFocus={() => { setIsOpen(true); setIsTouched(true); }}
                    onBlur={() => setIsTouched(true)}
                    placeholder="اكتب أو اختر اسم المادة..."
                    className={`w-full rounded-xl border bg-surface-card px-4 py-3 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-default ${showError ? 'border-danger ring-2 ring-danger/20' : isValidValue ? 'border-success ring-2 ring-success/20' : 'border-border'}`}
                    required={required}
                />
                {/* Validation icon */}
                {hasInput && (
                    <div className="absolute inset-y-0 end-3 flex items-center pointer-events-none">
                        {isValidValue ? (
                            <svg className="w-5 h-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        )}
                    </div>
                )}
            </div>
            {showError && (
                <p className="mt-1.5 text-xs text-danger">يجب اختيار مادة من القائمة المقترحة</p>
            )}
            {hasInput && !isValidValue && !showError && (
                <p className="mt-1.5 text-xs text-danger">المادة المدخلة غير موجودة — اختر من القائمة</p>
            )}
            {isOpen && filtered.length > 0 && (
                <ul className="absolute z-10 mt-1 w-full max-h-60 overflow-auto rounded-xl border border-border bg-surface-card shadow-lg">
                    {filtered.map((mat, idx) => (
                        <li
                            key={idx}
                            onClick={() => selectMaterial(mat)}
                            className="px-4 py-2.5 text-sm text-text hover:bg-surface-hover cursor-pointer transition-colors"
                        >
                            {mat}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
