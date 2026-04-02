import { createContext, useContext, useState, useEffect } from 'react';

export const SettingsContext = createContext(undefined);

export function SettingsProvider({ children }) {
    const [darkMode, setDarkMode] = useState(() => {
        const saved = localStorage.getItem('bluebits_dark_mode');
        return saved ? JSON.parse(saved) : window.matchMedia('(prefers-color-scheme: dark)').matches;
    });

    const [autoSave, setAutoSave] = useState(() => {
        const saved = localStorage.getItem('bluebits_auto_save');
        return saved ? JSON.parse(saved) : true;
    });

    const [docxSavePrompt, setDocxSavePrompt] = useState(() => {
        const saved = localStorage.getItem('bluebits_docx_prompt');
        return saved ? JSON.parse(saved) : true;
    });

    useEffect(() => {
        localStorage.setItem('bluebits_dark_mode', JSON.stringify(darkMode));
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [darkMode]);

    useEffect(() => {
        localStorage.setItem('bluebits_auto_save', JSON.stringify(autoSave));
    }, [autoSave]);

    useEffect(() => {
        localStorage.setItem('bluebits_docx_prompt', JSON.stringify(docxSavePrompt));
    }, [docxSavePrompt]);

    return (
        <SettingsContext.Provider
            value={{
                darkMode,
                setDarkMode,
                autoSave,
                setAutoSave,
                docxSavePrompt,
                setDocxSavePrompt
            }}
        >
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
}
