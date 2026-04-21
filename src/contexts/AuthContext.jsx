import { createContext, useState, useEffect, useCallback } from 'react';

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
        setLoading(false);
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
