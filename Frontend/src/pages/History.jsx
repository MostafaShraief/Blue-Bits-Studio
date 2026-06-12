import { useState, useMemo, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Clock, FileSearch, AlignRight, Palette, FileOutput, Trash2, Eye, Loader2, X, Info, Layers } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { useSessions } from '../hooks/useSessions';

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
        case 'MERGE': return `/merge?id=${id}`;
        default: return '/';
    }
};

const FILTERS = [
    { value: 'all', label: 'الكل', systemCode: null },
    { value: 'LEC_EXT', label: 'محاضرات', systemCode: 'LEC_EXT' },
    { value: 'BANK_EXT', label: 'بنوك', systemCode: 'BANK_EXT' },
    { value: 'BANK_QS', label: 'اختبارات', systemCode: 'BANK_QS' },
    { value: 'LEC_COORD', label: 'تنسيق', systemCode: 'LEC_COORD' },
    { value: 'BANK_COORD', label: 'تنسيق بنوك', systemCode: 'BANK_COORD' },
    { value: 'DRAW', label: 'رسم', systemCode: 'DRAW' },
    { value: 'PANDOC', label: 'Pandoc', systemCode: 'PANDOC' },
    { value: 'MERGE', label: 'دمج', systemCode: 'MERGE' },
];

const TYPE_META = {
    LEC_EXT: { label: 'استخراج محاضرة', icon: FileSearch, bgClass: 'bg-primary/10', textClass: 'text-primary' },
    BANK_EXT: { label: 'استخراج بنك', icon: FileSearch, bgClass: 'bg-cyan/10', textClass: 'text-cyan' },
    LEC_COORD: { label: 'تنسيق محاضرة', icon: AlignRight, bgClass: 'bg-purple-500/10', textClass: 'text-purple-600' },
    BANK_COORD: { label: 'تنسيق بنك', icon: AlignRight, bgClass: 'bg-purple-500/10', textClass: 'text-purple-600' },
    BANK_QS: { label: 'اختبار', icon: FileSearch, bgClass: 'bg-green-500/10', textClass: 'text-green-600' },
    PANDOC: { label: 'تحويل Pandoc', icon: FileOutput, bgClass: 'bg-success/10', textClass: 'text-success' },
    DRAW: { label: 'رسم', icon: Palette, bgClass: 'bg-primary/10', textClass: 'text-primary' },
    MERGE: { label: 'دمج ملفات', icon: Layers, bgClass: 'bg-primary/10', textClass: 'text-primary' },
};

function useModalExit(isOpen) {
    const [shouldRender, setShouldRender] = useState(isOpen);
    const [isExiting, setIsExiting] = useState(false);
    useEffect(() => {
        if (isOpen) {
            setShouldRender(true);
            setIsExiting(false);
        } else if (shouldRender) {
            setIsExiting(true);
            const timer = setTimeout(() => {
                setShouldRender(false);
                setIsExiting(false);
            }, 200);
            return () => clearTimeout(timer);
        }
    }, [isOpen, shouldRender]);
    return { shouldRender, isExiting };
}

function SessionDetailModal({ session, onClose, getSession }) {
    const { shouldRender, isExiting } = useModalExit(!!session);
    const [detail, setDetail] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (session) {
            setLoading(true);
            getSession(session.id)
                .then(setDetail)
                .catch(() => setDetail(null))
                .finally(() => setLoading(false));
        }
    }, [session, getSession]);

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') onClose();
        };
        if (session) document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [session, onClose]);

    if (!shouldRender) return null;

    const meta = session ? (TYPE_META[session.workflowType] || TYPE_META.LEC_EXT) : null;
    const Icon = meta?.icon;

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
                className={`absolute inset-0 bg-black/60 backdrop-blur-sm ${isExiting ? 'animate-fadeOut' : 'animate-fadeIn'}`}
                onClick={onClose}
            />
            <div className={`relative bg-surface-card rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden ${isExiting ? 'animate-scaleOut' : 'animate-scaleIn'}`}>
                <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                    <h2 className="text-lg font-semibold text-text">تفاصيل الجلسة</h2>
                    <button onClick={onClose}
                        className="p-2 rounded-lg hover:bg-surface-hover text-text-muted hover:text-text transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-4 overflow-y-auto max-h-[60vh]">
                    {!session ? null : loading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 size={24} className="animate-spin text-primary" />
                        </div>
                    ) : detail ? (
                        <>
                            <div className="flex items-center gap-3 pb-3 border-b border-border">
                                {Icon && (
                                    <div className={`w-10 h-10 rounded-xl ${meta.bgClass} flex items-center justify-center shrink-0`}>
                                        <Icon size={18} className={meta.textClass} strokeWidth={1.8} />
                                    </div>
                                )}
                                <div>
                                    <p className="text-sm font-medium text-text">{meta?.label || session.workflowType}</p>
                                    <p className="text-xs text-text-muted">رقم الجلسة: {session.id}</p>
                                </div>
                            </div>

                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-text-muted">اسم المادة</span>
                                    <span className="text-text font-medium">{detail.materialName || session.materialName || '—'}</span>
                                </div>
                                {detail.lectureNumber && (
                                    <div className="flex justify-between">
                                        <span className="text-text-muted">رقم المحاضرة</span>
                                        <span className="text-text font-medium">{detail.lectureNumber}</span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span className="text-text-muted">تاريخ الإنشاء</span>
                                    <span className="text-text font-medium">
                                        {new Intl.DateTimeFormat('ar-SY', {
                                            timeZone: 'Asia/Damascus',
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            hour12: true
                                        }).format(new Date(detail.createdAt || session.createdAt))}
                                    </span>
                                </div>
                            </div>

                        </>
                    ) : (
                        <div className="text-center py-8 text-text-muted">
                            <p className="text-sm">تعذر تحميل التفاصيل</p>
                        </div>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
}

export default function History() {
    const [filter, setFilter] = useState('all');
    const { hasWorkflowAccess } = useAuth();

    const {
        sessions,
        totalCount,
        hasMore,
        isLoading,
        loadMore,
        getSession,
        removeSession,
    } = useSessions({ limit: 20 });

    const navigate = useNavigate();

    const [detailSession, setDetailSession] = useState(null);
    const [deleting, setDeleting] = useState(null);
    const [viewingId, setViewingId] = useState(null);

    const handleViewSession = useCallback(async (session) => {
        const linkTo = getSessionRoute(session);
        setViewingId(session.id);
        try {
            await getSession(session.id);
            navigate(linkTo);
        } catch {
            setViewingId(null);
        }
    }, [getSession, navigate]);

    const visibleFilters = useMemo(() => {
        return FILTERS.filter(f => f.systemCode === null || hasWorkflowAccess(f.systemCode));
    }, [hasWorkflowAccess]);

    const filtered = useMemo(() => {
        let result = filter === 'all' ? sessions : sessions.filter((s) => s.workflowType === filter);
        result = result.filter(s => hasWorkflowAccess(s.workflowType));
        return result;
    }, [sessions, filter, hasWorkflowAccess]);

    const handleDelete = async (id) => {
        if (!window.confirm('هل أنت متأكد من حذف هذه الجلسة؟ لا يمكن التراجع عن هذا الإجراء.')) return;
        setDeleting(id);
        try {
            await removeSession(id);
        } catch {
        } finally {
            setDeleting(null);
        }
    };

    return (
        <div className="max-w-4xl mx-auto animate-fade-slide-in">
            <h1 className="text-2xl font-bold text-text mb-2">السجل</h1>
            <p className="text-sm text-text-secondary mb-6">جميع الجلسات السابقة</p>

            <div className="flex flex-wrap gap-2 mb-6">
                {visibleFilters.map(({ value, label }) => (
                    <button
                        key={value}
                        onClick={() => setFilter(value)}
                        className={`px-4 py-2 rounded-xl text-xs font-medium border transition-default ${filter === value
                                ? 'border-primary bg-primary text-white'
                                : 'border-border bg-surface-card text-text-secondary hover:border-primary/40'
                            }`}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {isLoading && sessions.length === 0 ? (
                <div className="bg-surface-card border border-border rounded-2xl p-14 text-center">
                    <Loader2 size={36} className="mx-auto text-primary mb-4 animate-spin" />
                    <p className="text-sm text-text-muted">جارٍ تحميل الجلسات...</p>
                </div>
            ) : filtered.length === 0 ? (
                <div className="bg-surface-card border border-border rounded-2xl p-10 text-center">
                    <Clock size={40} className="mx-auto text-text-muted mb-3" strokeWidth={1.3} />
                    <p className="text-sm text-text-muted">لا توجد جلسات</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered.map((s) => {
                        const meta = TYPE_META[s.workflowType] || TYPE_META.LEC_EXT;
                        const Icon = meta.icon;
                        const linkTo = getSessionRoute(s);
                        const isDeleting = deleting === s.id;

                        return (
                            <div
                                key={s.id}
                                className={`bg-surface-card border border-border rounded-2xl overflow-hidden transition-default hover:shadow-md ${isDeleting ? 'opacity-50 pointer-events-none' : ''}`}
                            >
                                <div className="w-full flex flex-wrap items-center gap-4 px-5 py-4 text-start">
                                    <div
                                        className={`w-10 h-10 rounded-xl ${meta.bgClass} flex items-center justify-center shrink-0`}
                                    >
                                        <Icon size={18} className={meta.textClass} strokeWidth={1.8} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-text truncate">
                                            {s.materialName || 'بدون اسم'}
                                            {s.lectureNumber && <> — {s.lectureType === 'Practical' ? 'عملي' : 'نظري'} {s.lectureNumber}</>}
                                            <> ({meta.label})</>
                                        </p>
                                        <p className="text-xs text-text-muted mt-0.5">
                                            {new Intl.DateTimeFormat('ar-SY', {
                                                timeZone: 'Asia/Damascus',
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                                hour12: true
                                            }).format(new Date(s.createdAt))}
                                        </p>
                                    </div>

                                    <div className="flex gap-2 shrink-0">
                                        <button
                                            onClick={() => setDetailSession(s)}
                                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-text-muted border border-border hover:bg-surface-hover transition-default"
                                        >
                                            <Info size={13} />
                                        </button>
                                        <button
                                            onClick={() => handleViewSession(s)}
                                            disabled={viewingId === s.id}
                                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium text-primary border border-primary/30 hover:bg-primary-light transition-default bg-surface-card disabled:opacity-50"
                                        >
                                            {viewingId === s.id ? <Loader2 size={13} className="animate-spin" /> : <Eye size={13} />}
                                            {viewingId === s.id ? 'جارٍ التحميل...' : 'عرض الجلسة'}
                                        </button>
                                        <button
                                            onClick={() => handleDelete(s.id)}
                                            disabled={isDeleting}
                                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium text-danger border border-danger/30 hover:bg-danger-light transition-default disabled:opacity-50"
                                        >
                                            {isDeleting ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                                            حذف
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {hasMore && (
                        <div className="mt-6 text-center">
                            <button
                                onClick={loadMore}
                                disabled={isLoading}
                                className="px-6 py-3 rounded-xl text-sm font-medium text-primary border border-primary/30 hover:bg-primary-light transition-default disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        جارٍ التحميل...
                                    </>
                                ) : (
                                    'تحميل المزيد'
                                )}
                            </button>
                        </div>
                    )}

                    {filtered.length > 0 && (
                        <p className="text-xs text-text-muted text-center mt-4">
                            عرض {filtered.length} من {totalCount} جلسة
                        </p>
                    )}
                </div>
            )}

            <SessionDetailModal
                session={detailSession}
                onClose={() => setDetailSession(null)}
                getSession={getSession}
            />
        </div>
    );
}
