import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router';
import { AuthContext } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

/**
 * AuthOnlyRoute — wraps routes that require authentication (any role).
 * Unlike ProtectedRoute, this allows Admin users through.
 */
export default function AuthOnlyRoute() {
    const { user, loading } = useContext(AuthContext);

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

    return <Outlet />;
}