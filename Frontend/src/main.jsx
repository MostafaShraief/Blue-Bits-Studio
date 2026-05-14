import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { SettingsProvider } from './contexts/SettingsContext.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <SettingsProvider>
            <App />
        </SettingsProvider>
    </StrictMode>,
);
