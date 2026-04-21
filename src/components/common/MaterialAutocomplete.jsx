import { useState, useEffect, useRef } from 'react';
import { fetchMaterials } from '../../utils/api';

export default function MaterialAutocomplete({ value, onChange, label = 'اسم المادة', required = false }) {
    const [materials, setMaterials] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [filtered, setFiltered] = useState([]);
    const wrapperRef = useRef(null);

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
        if (val) {
            setFiltered(materials.filter(m => m.toLowerCase().includes(val.toLowerCase())));
        } else {
            setFiltered(materials);
        }
    };

    const selectMaterial = (mat) => {
        onChange(mat);
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={wrapperRef}>
            <label className="block text-sm font-medium text-text mb-1.5">
                {label} {required && <span className="text-error">*</span>}
            </label>
            <input
                type="text"
                value={value || ''}
                onChange={handleInputChange}
                onFocus={() => setIsOpen(true)}
                placeholder="اكتب أو اختر اسم المادة..."
                className="w-full rounded-xl border border-border bg-surface-card px-4 py-3 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-default"
                required={required}
            />
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
