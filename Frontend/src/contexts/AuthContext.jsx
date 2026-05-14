import { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { fetchUserProfile } from '../utils/api';

const API_BASE = 'http://localhost:5135/api';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Hydrate from localStorage on mount
    useEffect(() => {
        const storedUser = localStorage.getItem('bluebits_user');
        const storedToken = localStorage.getItem('token');
        if (storedUser && storedToken) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (err) {
                console.error("AuthContext: Failed to parse stored user:", err);
                localStorage.removeItem('bluebits_user');
                localStorage.removeItem('token');
            }
        }
        
        // Sync permissions with backend on mount
        // Keep loading=true until sync completes to prevent UI flickering
        const syncUserProfile = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setLoading(false);
                return;
            }
            
            try {
                const profile = await fetchUserProfile();
                const userData = {
                    userId: profile.userId,
                    username: profile.username,
                    firstName: profile.firstName,
                    lastName: profile.lastName,
                    role: profile.role,
                    allowedWorkflows: profile.authorizedWorkflows || []
                };
                
                setUser(userData);
                localStorage.setItem('bluebits_user', JSON.stringify(userData));
            } catch (err) {
                // Token invalid or expired - clear storage and redirect
                console.error("AuthContext: Profile sync failed:", err);
                setUser(null);
                localStorage.removeItem('bluebits_user');
                localStorage.removeItem('token');
                // Redirect to login if not already there
                if (!window.location.pathname.includes('/login')) {
                    window.location.href = '/login';
                }
            } finally {
                setLoading(false);
            }
        };
        
        syncUserProfile();
    }, []);

    const login = async (username, password) => {
        const res = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.message || 'فشل تسجيل الدخول');
        }

        const data = await res.json();

        // Store the JWT token separately for authFetch
        localStorage.setItem('token', data.token);

        const userData = {
            userId: data.userId,
            username: data.username,
            firstName: data.firstName,
            lastName: data.lastName,
            role: data.role,
            allowedWorkflows: data.authorizedWorkflows || []
        };

        setUser(userData);
        localStorage.setItem('bluebits_user', JSON.stringify(userData));

        // Return userData so caller can access role immediately
        return userData;
    };

    const logout = useCallback(() => {
        setUser(null);
        localStorage.removeItem('bluebits_user');
        localStorage.removeItem('token');
    }, []);

    /**
     * Check if the current user has access to a specific workflow by SystemCode.
     * Admins bypass this check.
     */
const hasWorkflowAccess = useCallback((systemCode) => {
        if (!user) return false;
        if (user.role === 'Admin') return true;
        return user.allowedWorkflows?.includes(systemCode) ?? false;
    }, [user]);

    return (
        <AuthContext.Provider value={{ user, login, logout, loading, hasWorkflowAccess }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
