import { useContext } from 'react';
import { Navigate, Outlet, Link } from 'react-router';
import { AuthContext } from '../contexts/AuthContext';
import { Loader2, ShieldX } from 'lucide-react';
import { INTERNAL_ROUTES } from '../config/links';

/**
 * AdminRoute — wraps routes that require Admin role.
 * 
 * If user is not logged in → redirect to /login
 * If user is not Admin → redirect to / (dashboard)
 * If user is Admin → render the route
 */
export default function AdminRoute() {
    const { user, loading } = useContext(AuthContext);

    // Still loading auth state from localStorage
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-surface">
                <Loader2 className="animate-spin text-primary" size={36} />
            </div>
        );
    }

    if (!user) {
        return <Navigate to={INTERNAL_ROUTES.LOGIN} replace />;
    }

    if (user.role !== 'Admin') {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 animate-fade-slide-in">
                <div className="w-20 h-20 rounded-2xl bg-danger/10 flex items-center justify-center">
                    <ShieldX size={40} className="text-danger" />
                </div>
                <h1 className="text-2xl font-bold text-text">غير مصرح</h1>
                <p className="text-text-secondary text-sm max-w-md text-center">
                    هذه الصفحة مخصصة للمسؤولين فقط.
                </p>
                <Link
                    to={INTERNAL_ROUTES.DASHBOARD}
                    className="mt-4 px-6 py-2.5 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary-dark transition-default shadow-lg shadow-primary/25"
                >
                    العودة للرئيسية
                </Link>
            </div>
        );
    }

    return <Outlet />;
}