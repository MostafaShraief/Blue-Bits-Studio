import { createPortal } from 'react-dom';
import { useToast } from '../contexts/ToastContext';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const ICONS = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const STYLES = {
  success: 'bg-success/10 border-success/30 text-success',
  error: 'bg-danger/10 border-danger/30 text-danger',
  warning:
    'bg-amber-50 dark:bg-amber-900/20 border-amber-300 dark:border-amber-700/30 text-amber-800 dark:text-amber-200',
  info: 'bg-primary-light dark:bg-primary/10 border-primary/30 text-primary-dark dark:text-primary-light',
};

export default function Toast() {
  const { toasts, removeToast, exitingIds } = useToast();

  return createPortal(
    <div className="fixed max-md:top-[72px] md:top-4 z-[9999] flex flex-col items-center gap-2 pointer-events-none inset-x-0">
      {toasts.map((toast) => {
        const Icon = ICONS[toast.type] || ICONS.info;
        const style = STYLES[toast.type] || STYLES.info;
        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg w-[calc(100%-2rem)] max-w-sm backdrop-blur-lg ${exitingIds.has(toast.id) ? 'animate-fade-slide-out' : 'animate-fade-slide-in'} ${style}`}
            role="alert"
          >
            <Icon className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="flex-1 text-sm/relaxed">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="shrink-0 p-0.5 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
              aria-label="إغلاق"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>,
    document.body,
  );
}
