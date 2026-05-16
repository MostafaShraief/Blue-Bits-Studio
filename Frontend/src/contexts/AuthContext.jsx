import { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { login as authApiLogin, getCurrentUser } from '../api/AuthApi';

export const AuthContext = createContext();

function mapUser(data) {
    return {
        userId: data.userId,
        username: data.username,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
        allowedWorkflows: data.authorizedWorkflows || []
    };
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Auto-restore session via getCurrentUser() on mount
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            setLoading(false);
            return;
        }

        getCurrentUser()
            .then(data => {
                const userData = mapUser(data);
                setUser(userData);
                localStorage.setItem('bluebits_user', JSON.stringify(userData));
            })
            .catch(() => {
                setUser(null);
                localStorage.removeItem('bluebits_user');
                localStorage.removeItem('token');
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    const login = async (username, password) => {
        const data = await authApiLogin(username, password);

        localStorage.setItem('token', data.token);

        const userData = mapUser(data);
        setUser(userData);
        localStorage.setItem('bluebits_user', JSON.stringify(userData));

        return userData;
    };

    const logout = useCallback(() => {
        setUser(null);
        localStorage.removeItem('bluebits_user');
        localStorage.removeItem('token');
    }, []);

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
