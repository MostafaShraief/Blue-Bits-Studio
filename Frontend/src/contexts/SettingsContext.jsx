import React, { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext();

export function SettingsProvider({ children }) {
    const [darkMode, setDarkMode] = useState(() => {
        const saved = localStorage.getItem('darkMode');
        return saved ? JSON.parse(saved) : false;
    });

    const [autoSave, setAutoSave] = useState(() => {
        const saved = localStorage.getItem('autoSave');
        return saved ? JSON.parse(saved) : true;
    });

    const [defaultMaterial, setDefaultMaterial] = useState(() => {
        const saved = localStorage.getItem('bluebits_default_material');
        return saved || '';
    });

    useEffect(() => {
        localStorage.setItem('darkMode', JSON.stringify(darkMode));
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [darkMode]);

    useEffect(() => {
        localStorage.setItem('autoSave', JSON.stringify(autoSave));
    }, [autoSave]);

    useEffect(() => {
        localStorage.setItem('bluebits_default_material', defaultMaterial);
    }, [defaultMaterial]);

    return (
        <SettingsContext.Provider value={{ darkMode, setDarkMode, autoSave, setAutoSave, defaultMaterial, setDefaultMaterial }}>
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    return useContext(SettingsContext);
}
