import { useState, useMemo, useEffect } from 'react';
import { Clock, FileSearch, AlignRight, Palette, FileOutput, Trash2, Eye } from 'lucide-react';
import { fetchSessions, removeSession } from '../utils/api';
import { Link } from 'react-router';

const FILTERS = [
    { value: 'all', label: 'الكل' },
    { value: 'lecture', label: 'محاضرات' },
    { value: 'bank', label: 'بنوك' },
    { value: 'quiz', label: 'اختبارات' },
    { value: 'coordination', label: 'تنسيق' },
    { value: 'draw', label: 'رسم' },
    { value: 'pandoc', label: 'Pandoc' },
];

// Map workflow system codes to filter keys
const WORKFLOW_CATEGORIES = {
    'LEC_EXT': 'lecture',
    'BANK_EXT': 'bank',
    'LEC_COORD': 'coordination',
    'BANK_COORD': 'coordination',
    'BANK_QS': 'quiz',
    'DRAW': 'draw',
    'PANDOC': 'pandoc',
};

const TYPE_META = {
    lecture: { label: 'استخراج محاضرة', icon: FileSearch, bgClass: 'bg-primary/10', textClass: 'text-primary' },
    bank: { label: 'بنك أسئلة', icon: FileSearch, bgClass: 'bg-cyan/10', textClass: 'text-cyan' },
    quiz: { label: 'اختبار', icon: FileSearch, bgClass: 'bg-green-500/10', textClass: 'text-green-600' },
    coordination: { label: 'تنسيق', icon: AlignRight, bgClass: 'bg-success/10', textClass: 'text-success' },
    draw: { label: 'رسم', icon: Palette, bgClass: 'bg-primary/10', textClass: 'text-primary' },
    pandoc: { label: 'تحويل Pandoc', icon: FileOutput, bgClass: 'bg-success/10', textClass: 'text-success' },
};

export default function History() {
    const [sessions, setSessions] = useState([]);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        loadSessions();
    }, []);

    const loadSessions = async () => {
        const data = await fetchSessions();
        setSessions(data);
    };

    const filtered = useMemo(() => {
        if (filter === 'all') return sessions;
        return sessions.filter((s) => {
            const category = WORKFLOW_CATEGORIES[s.workflowType];
            return category === filter;
        });
    }, [sessions, filter]);

    const handleDelete = async (id) => {
        if (window.confirm('هل أنت متأكد من حذف هذه الجلسة؟ لا يمكن التراجع عن هذا الإجراء.')) {
            await removeSession(id);
            await loadSessions();
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
                        const category = WORKFLOW_CATEGORIES[s.workflowType] || 'lecture';
                        const meta = TYPE_META[category] || TYPE_META.lecture;
                        const Icon = meta.icon;
                        
                        // Route logic: Use actual workflow system code from backend to build route
                        // Map systemCode -> route path
                        const ROUTE_MAP = {
                            'LEC_EXT': '/extraction?type=lecture',
                            'BANK_EXT': '/bank',
                            'LEC_COORD': '/coordination',
                            'BANK_COORD': '/bank-coord',
                            'BANK_QS': '/quiz',
                            'PANDOC': '/pandoc',
                            'MERGE': '/merge',
                            'DRAW': '/draw',
                        };
                        
                        const routePrefix = ROUTE_MAP[s.workflowType] || '/extraction';
                        const linkTo = `${routePrefix}&id=${s.id}`;

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
                                            {s.materialName || 'بدون اسم'} — {meta.label}
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
                </div>
            )}
        </div>
    );
}
