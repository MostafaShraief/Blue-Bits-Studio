import { useState, useMemo, useEffect } from 'react';
import { Clock, FileSearch, AlignRight, Palette, FileOutput, Trash2, Eye, Loader2 } from 'lucide-react';
import { fetchSessions, removeSession } from '../utils/api';
import { Link } from 'react-router';

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

const FILTERS = [
    { value: 'all', label: 'الكل' },
    { value: 'LEC_EXT', label: 'محاضرات' },
    { value: 'BANK_EXT', label: 'بنوك' },
    { value: 'BANK_QS', label: 'اختبارات' },
    { value: 'LEC_COORD', label: 'تنسيق محاضرات' },
    { value: 'BANK_COORD', label: 'تنسيق بنوك' },
    { value: 'DRAW', label: 'رسم' },
    { value: 'PANDOC', label: 'Pandoc' },
];

/** TYPE_META now uses SystemCodes to match backend workflowType values */
const TYPE_META = {
    LEC_EXT: { label: 'استخراج محاضرة', icon: FileSearch, bgClass: 'bg-primary/10', textClass: 'text-primary' },
    BANK_EXT: { label: 'استخراج بنك', icon: FileSearch, bgClass: 'bg-cyan/10', textClass: 'text-cyan' },
    LEC_COORD: { label: 'تنسيق محاضرة', icon: AlignRight, bgClass: 'bg-purple-500/10', textClass: 'text-purple-600' },
    BANK_COORD: { label: 'تنسيق بنك', icon: AlignRight, bgClass: 'bg-purple-500/10', textClass: 'text-purple-600' },
    BANK_QS: { label: 'اختبار', icon: FileSearch, bgClass: 'bg-green-500/10', textClass: 'text-green-600' },
    PANDOC: { label: 'تحويل Pandoc', icon: FileOutput, bgClass: 'bg-success/10', textClass: 'text-success' },
    DRAW: { label: 'رسم', icon: Palette, bgClass: 'bg-primary/10', textClass: 'text-primary' },
};

export default function History() {
    const [sessions, setSessions] = useState([]);
    const [filter, setFilter] = useState('all');
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [totalCount, setTotalCount] = useState(0);

    const limit = 20;

    useEffect(() => {
        // Reset sessions when filter changes
        setSessions([]);
        setPage(1);
        setHasMore(false);
        loadSessions(1);
    }, [filter]);

    const loadSessions = async (pageNum) => {
        const data = await fetchSessions(pageNum, limit);
        if (data.sessions) {
            if (pageNum === 1) {
                setSessions(data.sessions);
            } else {
                setSessions(prev => [...prev, ...data.sessions]);
            }
            setHasMore(data.hasMore);
            setTotalCount(data.totalCount);
        }
    };

    const handleLoadMore = async () => {
        if (loadingMore || !hasMore) return;
        setLoadingMore(true);
        const nextPage = page + 1;
        await loadSessions(nextPage);
        setPage(nextPage);
        setLoadingMore(false);
    };

    const filtered = useMemo(() => {
        if (filter === 'all') return sessions;
        return sessions.filter((s) => s.workflowType === filter);
    }, [sessions, filter]);

    const handleDelete = async (id) => {
        if (window.confirm('هل أنت متأكد من حذف هذه الجلسة؟ لا يمكن التراجع عن هذا الإجراء.')) {
            await removeSession(id);
            // Reload from page 1 after deletion
            setSessions([]);
            setPage(1);
            setHasMore(false);
            await loadSessions(1);
        }
    };

    return (
        <div className="max-w-4xl mx-auto animate-fade-slide-in">
            <h1 className="text-2xl font-bold text-text mb-2">السجل</h1>
            <p className="text-sm text-text-secondary mb-6">جميع الجلسات السابقة</p>

            {/* Filters */}
            <div className="flex flex-wrap gap-2 mb-6">
                {FILTERS.map(({ value, label }) => (
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

            {/* List */}
            {filtered.length === 0 ? (
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

                        return (
                            <div
                                key={s.id}
                                className="bg-surface-card border border-border rounded-2xl overflow-hidden transition-default hover:shadow-md"
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
                                            {s.lectureNumber && <> — محاضرة {s.lectureNumber}</>}
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
                                        <Link
                                            to={linkTo}
                                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium text-primary border border-primary/30 hover:bg-primary-light transition-default bg-surface-card"
                                        >
                                            <Eye size={13} />
                                            عرض الجلسة
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(s.id)}
                                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium text-danger border border-danger/30 hover:bg-danger-light transition-default"
                                        >
                                            <Trash2 size={13} />
                                            حذف
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {/* Load More Button */}
                    {hasMore && (
                        <div className="mt-6 text-center">
                            <button
                                onClick={handleLoadMore}
                                disabled={loadingMore}
                                className="px-6 py-3 rounded-xl text-sm font-medium text-primary border border-primary/30 hover:bg-primary-light transition-default disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
                            >
                                {loadingMore ? (
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

                    {/* Sessions Count */}
                    {filtered.length > 0 && (
                        <p className="text-xs text-text-muted text-center mt-4">
                            عرض {filtered.length} من {totalCount} جلسة
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}
