import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { SettingsProvider, useSettings } from '../SettingsContext';
import React from 'react';

function TestComponent() {
    const { darkMode, setDarkMode, autoSave, setAutoSave, docxSavePrompt, setDocxSavePrompt } = useSettings();
    return (
        <div>
            <div data-testid="dark-mode">{darkMode.toString()}</div>
            <button data-testid="toggle-dark" onClick={() => setDarkMode(!darkMode)}>Toggle Dark</button>

            <div data-testid="auto-save">{autoSave.toString()}</div>
            <button data-testid="toggle-auto-save" onClick={() => setAutoSave(!autoSave)}>Toggle Auto</button>

            <div data-testid="docx-prompt">{docxSavePrompt.toString()}</div>
            <button data-testid="toggle-docx-prompt" onClick={() => setDocxSavePrompt(!docxSavePrompt)}>Toggle Docx</button>
        </div>
    );
}

describe('SettingsContext - Isolated Tests', () => {
    beforeEach(() => {
        localStorage.clear();
        document.documentElement.className = '';
        Object.defineProperty(window, 'matchMedia', {
            writable: true,
            value: vi.fn().mockImplementation(query => ({
                matches: false,
                media: query,
                onchange: null,
                addListener: vi.fn(), // Deprecated
                removeListener: vi.fn(), // Deprecated
                addEventListener: vi.fn(),
                removeEventListener: vi.fn(),
                dispatchEvent: vi.fn(),
            })),
        });
    });

    it('provides default values and updates dark mode', () => {
        render(
            <SettingsProvider>
                <TestComponent />
            </SettingsProvider>
        );

        expect(screen.getByTestId('dark-mode').textContent).toBe('false');
        
        act(() => {
            screen.getByTestId('toggle-dark').click();
        });

        expect(screen.getByTestId('dark-mode').textContent).toBe('true');
        expect(localStorage.getItem('bluebits_dark_mode')).toBe('true');
        expect(document.documentElement.classList.contains('dark')).toBe(true);
    });
});
