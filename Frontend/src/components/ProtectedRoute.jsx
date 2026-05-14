import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router';
import { AuthContext } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

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

    // Admin users cannot access workflow routes → redirect to /403
    if (user.role === 'Admin') {
        return <Navigate to="/403" replace />;
    }

// Authenticated but lacks workflow access → redirect to unauthorized page
    if (requiredCode && !hasWorkflowAccess(requiredCode)) {
        return <Navigate to="/unauthorized" replace />;
    }

    return <Outlet />;
}
