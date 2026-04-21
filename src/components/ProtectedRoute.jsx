import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router';
import { AuthContext } from '../contexts/AuthContext';
import { Loader2, ShieldX } from 'lucide-react';

/**
 * ProtectedRoute — wraps routes that require authentication.
 * 
 * Props:
 * - requiredCode: optional SystemCode string. If provided, the user must
 *   have this code in their allowedWorkflows array (or be Admin).
 *   If the user is authenticated but lacks access, show a 403 page.
 */
export default function ProtectedRoute({ requiredCode }) {
    const { user, loading, hasWorkflowAccess } = useContext(AuthContext);

    // Still loading auth state from localStorage
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-surface">
                <Loader2 className="animate-spin text-primary" size={36} />
            </div>
        );
    }

    // Not authenticated → redirect to login
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Authenticated but lacks workflow access → show 403
    if (requiredCode && !hasWorkflowAccess(requiredCode)) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 animate-fade-slide-in">
                <div className="w-20 h-20 rounded-2xl bg-danger/10 flex items-center justify-center">
                    <ShieldX size={40} className="text-danger" />
                </div>
                <h1 className="text-2xl font-bold text-text">غير مصرح</h1>
                <p className="text-text-secondary text-sm max-w-md text-center">
                    ليس لديك صلاحية الوصول إلى هذه الأداة. تواصل مع المسؤول إذا كنت تعتقد أن هذا خطأ.
                </p>
                <a
                    href="/"
                    className="mt-4 px-6 py-2.5 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary-dark transition-default shadow-lg shadow-primary/25"
                >
                    العودة للرئيسية
                </a>
            </div>
        );
    }

    return <Outlet />;
}
