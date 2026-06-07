import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { AuthContext } from '../contexts/AuthContext';
import { LogIn, User, Lock, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const { login, user } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            const redirectPath = user.role === 'Admin' ? '/admin/users' : '/';
            navigate(redirectPath, { replace: true });
        }
    }, [user, navigate]);

    const clearFieldError = (field) => {
        setFieldErrors((prev) => {
            if (!prev[field]) return prev;
            const next = { ...prev };
            delete next[field];
            return next;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setFieldErrors({});
        setIsSubmitting(true);

        try {
            const userData = await login(username, password);
            const redirectPath = userData?.role === 'Admin' ? '/admin/users' : '/';
            navigate(redirectPath);
        } catch (err) {
            if (err?.status === 401) {
                setError('اسم المستخدم أو كلمة المرور غير صحيحة');
            } else if (err?.status === 400 && err?.errors) {
                const normalized = {};
                for (const [key, value] of Object.entries(err.errors)) {
                    normalized[key.toLowerCase()] = value;
                }
                setFieldErrors(normalized);
            } else {
                setError(err?.message || 'حدث خطأ غير متوقع. الرجاء المحاولة مرة أخرى.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-surface flex items-center justify-center p-4" dir="rtl">
            {/* Background decoration */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] start-[-10%] w-[500px] h-[500px] rounded-full bg-primary/5 blur-3xl" />
                <div className="absolute bottom-[-15%] end-[-5%] w-[400px] h-[400px] rounded-full bg-cyan/5 blur-3xl" />
            </div>

            <div className="relative w-full max-w-md">
                {/* Logo */}
                <div className="flex justify-center mb-8">
                    <img
                        src="/logos/Horizontal logo.png"
                        alt="Blue Bits Studio"
                        className="h-12 object-contain dark:brightness-0 dark:invert"
                    />
                </div>

                {/* Card */}
                <div className="bg-surface-card border border-border rounded-2xl shadow-xl shadow-primary/5 p-8 space-y-6">
                    <div className="text-center space-y-1.5">
                        <h1 className="text-2xl font-bold text-text">تسجيل الدخول</h1>
                        <p className="text-sm text-text-secondary">أدخل بياناتك للوصول إلى المنصة</p>
                    </div>

                    {/* Error banner */}
                    {error && (
                        <div className="flex items-center gap-3 bg-danger-light border border-danger/20 text-danger rounded-xl px-4 py-3 text-sm animate-fade-slide-in">
                            <AlertCircle size={18} className="shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Username */}
                        <div>
                            <label htmlFor="login-username" className="block text-sm font-medium text-text mb-1.5">
                                اسم المستخدم
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 start-0 ps-3.5 flex items-center pointer-events-none">
                                    <User className="h-[18px] w-[18px] text-text-muted" />
                                </div>
                                <input
                                    id="login-username"
                                    type="text"
                                    value={username}
                                    onChange={(e) => { setUsername(e.target.value); clearFieldError('username'); }}
                                    className={`w-full pe-10 ps-4 py-3 rounded-xl border bg-surface text-sm text-text placeholder:text-text-muted text-start focus:outline-none focus:ring-2 transition-default ${fieldErrors.username ? 'border-danger focus:ring-danger/30 focus:border-danger' : 'border-border focus:ring-primary/30 focus:border-primary'}`}
                                    placeholder="أدخل اسم المستخدم"
                                    required
                                    autoComplete="username"
                                    autoFocus
                                    dir="ltr"
                                />
                            </div>
                            {fieldErrors.username && (
                                <p className="text-xs text-danger mt-1">{fieldErrors.username}</p>
                            )}
                        </div>

                        {/* Password */}
                        <div>
                            <label htmlFor="login-password" className="block text-sm font-medium text-text mb-1.5">
                                كلمة المرور
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 start-0 ps-3.5 flex items-center pointer-events-none">
                                    <Lock className="h-[18px] w-[18px] text-text-muted" />
                                </div>
                                <input
                                    id="login-password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => { setPassword(e.target.value); clearFieldError('password'); }}
                                    className={`w-full ps-16 pe-4 py-3 rounded-xl border bg-surface text-sm text-text placeholder:text-text-muted text-start focus:outline-none focus:ring-2 transition-default ${fieldErrors.password ? 'border-danger focus:ring-danger/30 focus:border-danger' : 'border-border focus:ring-primary/30 focus:border-primary'}`}
                                    placeholder="أدخل كلمة المرور"
                                    required
                                    autoComplete="current-password"
                                    dir="ltr"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 start-0 ps-10 flex items-center text-text-muted hover:text-text transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {fieldErrors.password && (
                                <p className="text-xs text-danger mt-1">{fieldErrors.password}</p>
                            )}
                        </div>

                        {/* Submit */}
                        <button
                            id="login-submit"
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full flex justify-center items-center gap-2 py-3 rounded-xl bg-primary text-white font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-dark transition-default shadow-lg shadow-primary/25"
                        >
                            {isSubmitting ? (
                                <Loader2 className="animate-spin h-5 w-5" />
                            ) : (
                                <>
                                    <LogIn className="h-5 w-5" />
                                    دخول
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Footer */}
                <p className="text-center text-xs text-text-muted mt-6">
                    Blue Bits Studio &copy; {new Date().getFullYear()}
                </p>
            </div>
        </div>
    );
}
