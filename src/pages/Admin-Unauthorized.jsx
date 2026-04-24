import { ShieldAlert } from 'lucide-react';
import { Link } from 'react-router';

export default function AdminUnauthorized() {
    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 animate-fade-slide-in">
            <div className="w-20 h-20 rounded-2xl bg-danger/10 flex items-center justify-center">
                <ShieldAlert size={40} className="text-danger" />
            </div>
            <h1 className="text-2xl font-bold text-text">عذراً، هذه الصفحة مخصصة للأعضاء فقط</h1>
            <p className="text-text-secondary text-sm max-w-md text-center">
                عذراً، هذه الصفحة مخصصة للأعضاء فقط. لا يمكن للمسؤولين الوصول إلى مسارات العمل.
            </p>
            <Link
                to="/admin/users"
                className="mt-4 px-6 py-2.5 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary-dark transition-default shadow-lg shadow-primary/25"
            >
                الذهاب إلى إدارة المستخدمين
            </Link>
        </div>
    );
}