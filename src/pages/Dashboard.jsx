import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import {
    FileSearch,
    AlignRight,
    FileOutput,
    Palette,
    BookOpen,
    FlaskConical,
    Sparkles,
    Clock,
    ArrowLeft,
} from 'lucide-react';
import { fetchSessions, fetchStats } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

/**
 * Centralized route mapping from backend SystemCode to frontend route.
 * Fixes broken routing where backend returns SystemCodes like 'LEC_EXT'
 * but frontend was checking for friendly names like 'lecture'.
 */
const getSessionRoute = (session) => {
    const { workflowType, id } = session;
    switch (workflowType) {
        case 'LEC_EXT': return `/extraction?type=lecture&id=${id}`;
        case 'BANK_EXT': return `/extraction?type=bank&id=${id}`;
        case 'LEC_COORD': return `/coordination?type=lecture&id=${id}`;
        case 'BANK_COORD': return `/coordination?type=bank&id=${id}`;
        case 'BANK_QS': return `/quiz?id=${id}`;
        case 'PANDOC': return `/pandoc?id=${id}`;
        case 'DRAW': return `/draw?id=${id}`;
        default: return '/'; // Fallback to dashboard instead of broken route
    }
};

/** Labels for display by SystemCode */
const SYSTEM_CODE_LABELS = {
    LEC_EXT: 'استخراج محاضرة',
    BANK_EXT: 'استخراج بنك',
    LEC_COORD: 'تنسيق محاضرة',
    BANK_COORD: 'تنسيق بنك',
    BANK_QS: 'اختبار',
    PANDOC: 'تحويل Pandoc',
    DRAW: 'رسم',
};

const STAT_CARDS = [
    { label: 'محاضرات', value: 'LEC_EXT', icon: BookOpen, bgClass: 'bg-primary/10', textClass: 'text-primary' },
    { label: 'بنوك أسئلة', value: 'BANK_EXT', icon: FlaskConical, bgClass: 'bg-cyan/10', textClass: 'text-cyan' },
    { label: 'رسم', value: 'DRAW', icon: Palette, bgClass: 'bg-success/10', textClass: 'text-success' },
    { label: 'إجمالي الجلسات', value: 'total', icon: Sparkles, bgClass: 'bg-primary/10', textClass: 'text-primary' },
];

const QUICK_ACTIONS = [
    {
        to: '/extraction?type=lecture', label: 'محاضرة جديدة', icon: FileSearch,
        cls: 'border-primary/20 bg-primary/5 hover:bg-primary/10 hover:border-primary/40',
        iconCls: 'text-primary',
        systemCode: 'LEC_EXT',
    },
    {
        to: '/extraction?type=bank', label: 'بنك جديد', icon: FlaskConical,
        cls: 'border-cyan/20 bg-cyan/5 hover:bg-cyan/10 hover:border-cyan/40',
        iconCls: 'text-cyan',
        systemCode: 'BANK_EXT',
    },
    {
        to: '/pandoc', label: 'تحويل Pandoc', icon: FileOutput,
        cls: 'border-success/20 bg-success/5 hover:bg-success/10 hover:border-success/40',
        iconCls: 'text-success',
        systemCode: 'PANDOC',
    },
    {
        to: '/draw', label: 'رسم بالذكاء', icon: Palette,
        cls: 'border-primary/20 bg-primary/5 hover:bg-primary/10 hover:border-primary/40',
        iconCls: 'text-primary',
        systemCode: 'DRAW',
    },
];

export default function Dashboard() {
    const [stats, setStats] = useState({ total: 0, LEC_EXT: 0, BANK_EXT: 0, BANK_QS: 0, DRAW: 0, PANDOC: 0, LEC_COORD: 0 });
    const [recent, setRecent] = useState([]);
    const { hasWorkflowAccess } = useAuth();

    // Filter quick actions based on user's RBAC permissions
    const authorizedActions = QUICK_ACTIONS.filter(action => {
        if (!action.systemCode) return true;
        return hasWorkflowAccess(action.systemCode);
    });

    useEffect(() => {
        const load = async () => {
            const s = await fetchStats();
            setStats(s);
            const data = await fetchSessions();
            setRecent(data.slice(0, 5));
        };
        load();
    }, []);

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-fade-slide-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-text">لوحة التحكم</h1>
                    <p className="text-sm text-text-secondary mt-1">مرحباً بك في Blue Bits Studio</p>
                </div>
            </div>

            {/* Welcome Tour Banner */}
            <div className="bg-gradient-to-r from-primary to-blue-600 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-xl shadow-primary/20">
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                            <Sparkles className="text-yellow-300" />
                            مرحباً بك في Blue Bits Studio
                        </h2>
                        <p className="text-white/80 max-w-xl text-sm leading-relaxed">
                            تعرف على مسارات العمل الرئيسية في النظام وكيفية استخدام الأدوات المختلفة مثل الذكاء الاصطناعي لاستخراج وتنسيق المحاضرات وبنوك الأسئلة والرسم.
                        </p>
                    </div>
                    <Link
                        to="/tour"
                        className="shrink-0 inline-flex items-center gap-2 px-6 py-3 bg-white text-primary font-bold rounded-xl hover:bg-gray-50 transition-default shadow-sm"
                    >
                        ابدأ الجولة التعريفية
                        <ArrowLeft size={18} />
                    </Link>
                </div>
                {/* Decorative background elements */}
                <div className="absolute -end-20 -top-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {STAT_CARDS.map(({ label, value, icon: Icon, bgClass, textClass }) => (
                    <div
                        key={label}
                        className="bg-surface-card border border-border rounded-2xl p-5 flex items-center gap-4 hover:shadow-lg hover:-translate-y-0.5 transition-default"
                    >
                        <div className={`w-12 h-12 rounded-xl ${bgClass} flex items-center justify-center`}>
                            <Icon size={22} className={textClass} strokeWidth={1.8} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-text">{stats[value]}</p>
                            <p className="text-xs text-text-secondary">{label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            {authorizedActions.length > 0 && (
                <section>
                    <h2 className="text-lg font-semibold text-text mb-4">إجراء سريع</h2>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                        {authorizedActions.map(({ to, label, icon: Icon, cls, iconCls }) => (
                            <Link
                                key={to}
                                to={to}
                                className={`flex flex-col items-center gap-3 py-6 rounded-2xl border-2 ${cls} transition-default group`}
                            >
                                <Icon
                                    size={28}
                                    className={`${iconCls} group-hover:scale-110 transition-default`}
                                    strokeWidth={1.5}
                                />
                                <span className="text-sm font-medium text-text">{label}</span>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {/* Recent Sessions */}
            <section>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-text">آخر الجلسات</h2>
                    {recent.length > 0 && (
                        <Link
                            to="/history"
                            className="flex items-center gap-1 text-xs text-primary hover:text-primary-dark transition-default"
                        >
                            عرض الكل
                            <ArrowLeft size={14} />
                        </Link>
                    )}
                </div>

                {recent.length === 0 ? (
                    <div className="bg-surface-card border border-border rounded-2xl p-8 text-center">
                        <Clock size={36} className="mx-auto text-text-muted mb-2" strokeWidth={1.3} />
                        <p className="text-sm text-text-muted">لا توجد جلسات بعد. ابدأ بإنشاء جلسة جديدة!</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {recent.map((s) => {
                            const linkTo = getSessionRoute(s);
                            const workflowLabel = SYSTEM_CODE_LABELS[s.workflowType] || s.workflowType;
                            return (
                                <Link
                                    key={s.id}
                                    to={linkTo}
                                    className="flex items-center justify-between bg-surface-card border border-border rounded-xl px-5 py-3 hover:bg-surface-hover transition-default group block"
                                >
                                    <div>
                                        <p className="text-sm font-medium text-text group-hover:text-primary transition-default">
                                            {s.materialName || 'بدون اسم'}
                                            {s.lectureNumber && <> — محاضرة {s.lectureNumber}</>}
                                            <> ({workflowLabel})</>
                                        </p>
                                        <p className="text-xs text-text-muted mt-0.5">
                                            {new Intl.DateTimeFormat('ar-SY', {
                                                timeZone: 'Asia/Damascus',
                                                day: 'numeric',
                                                month: 'short',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                                hour12: true
                                            }).format(new Date(s.createdAt))}
                                        </p>
                                    </div>
                                    <ArrowLeft size={16} className="text-text-muted group-hover:text-primary transition-default group-hover:-translate-x-1" />
                                </Link>
                            );
                        })}
                    </div>
                )}
            </section>
        </div>
    );
}
