import { SearchX } from 'lucide-react';
import { Link } from 'react-router';
import { useAuth } from '../contexts/AuthContext';

export default function NotFound() {
    const { user } = useAuth();

    // Smart redirect: Admin goes to admin panel, others go to dashboard
    const redirectPath = user?.role === 'Admin' ? '/admin/users' : '/';

    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 animate-fade-slide-in">
            <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
                <SearchX size={40} className="text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-text">عذراً، الصفحة غير موجودة</h1>
            <p className="text-text-secondary text-sm max-w-md text-center">
                يبدو أنك سلكت مساراً خاطئاً أو أن الصفحة قد تم نقلها.
            </p>
            <Link
                to={redirectPath}
                className="mt-4 px-6 py-2.5 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary-dark transition-default shadow-lg shadow-primary/25"
            >
                {user?.role === 'Admin' ? 'العودة للوحة التحكم' : 'العودة للرئيسية'}
            </Link>
        </div>
    );
}