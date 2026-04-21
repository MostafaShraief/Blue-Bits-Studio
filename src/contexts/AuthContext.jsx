import { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('bluebits_user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (err) {
                console.error("Failed to parse stored user:", err);
                localStorage.removeItem('bluebits_user');
            }
        }
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        const res = await fetch('http://localhost:5135/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.message || 'فشل تسجيل الدخول');
        }

        const data = await res.json();
        const userData = {
            ...data,
            allowedWorkflows: data.authorizedWorkflows || []
        };
        setUser(userData);
        localStorage.setItem('bluebits_user', JSON.stringify(userData));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('bluebits_user');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
}
