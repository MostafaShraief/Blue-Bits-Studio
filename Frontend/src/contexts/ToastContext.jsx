import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [exitingIds, setExitingIds] = useState(new Set());

  const removeToast = useCallback((id) => {
    setExitingIds(prev => new Set([...prev, id]));
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
      setExitingIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 300);
  }, []);

  const showToast = useCallback((message, type = 'error') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 5000);
  }, [removeToast]);

  useEffect(() => {
    const handler = (e) => showToast(e.detail.message, e.detail.type);
    window.addEventListener('app:showToast', handler);
    return () => window.removeEventListener('app:showToast', handler);
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast, exitingIds }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

export function showToastGlobal(message, type = 'error') {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('app:showToast', { detail: { message, type } })
    );
  }
}
