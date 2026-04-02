import { useState, useMemo } from 'react';
import { Clock, FileSearch, AlignRight, Palette, FileOutput, Trash2, Copy } from 'lucide-react';
import { getSessions, deleteSession } from '../utils/storage';

const FILTERS = [
    { value: 'all', label: 'الكل' },
    { value: 'lecture', label: 'محاضرات' },
    { value: 'bank', label: 'بنوك' },
    { value: 'coordination', label: 'تنسيق' },
    { value: 'draw', label: 'رسم' },
    { value: 'pandoc', label: 'Pandoc' },
];

const TYPE_META = {
    lecture: { label: 'استخراج محاضرة', icon: FileSearch, bgClass: 'bg-primary/10', textClass: 'text-primary' },
    bank: { label: 'استخراج بنك', icon: FileSearch, bgClass: 'bg-cyan/10', textClass: 'text-cyan' },
    coordination: { label: 'تنسيق', icon: AlignRight, bgClass: 'bg-success/10', textClass: 'text-success' },
    draw: { label: 'رسم', icon: Palette, bgClass: 'bg-primary/10', textClass: 'text-primary' },
    pandoc: { label: 'تحويل Pandoc', icon: FileOutput, bgClass: 'bg-success/10', textClass: 'text-success' },
};

export default function History() {
    const [sessions, setSessions] = useState(() => getSessions());
    const [filter, setFilter] = useState('all');
    const [expandedId, setExpandedId] = useState(null);
    const [copiedId, setCopiedId] = useState(null);

    const filtered = useMemo(() => {
        if (filter === 'all') return sessions;
        return sessions.filter((s) => s.workflowType === filter);
    }, [sessions, filter]);

    const handleDelete = (id) => {
        deleteSession(id);
        setSessions(getSessions());
        if (expandedId === id) setExpandedId(null);
    };

    const handleCopyPrompt = async (id, prompt) => {
        try {
            await navigator.clipboard.writeText(prompt);
        } catch {
            const ta = document.createElement('textarea');
            ta.value = prompt;
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
        }
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 1200);
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
                        const meta = TYPE_META[s.workflowType] || TYPE_META.lecture;
                        const Icon = meta.icon;
                        const isExpanded = expandedId === s.id;

                        return (
                            <div
                                key={s.id}
                                className="bg-surface-card border border-border rounded-2xl overflow-hidden transition-default hover:shadow-md"
                            >
                                {/* Header */}
                                <button
                                    onClick={() => setExpandedId(isExpanded ? null : s.id)}
                                    className="w-full flex items-center gap-4 px-5 py-4 text-start"
                                >
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
                                            {new Date(s.createdAt).toLocaleDateString('ar-EG', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </p>
                                    </div>
                                    <span className="text-xs text-text-muted">{isExpanded ? '▲' : '▼'}</span>
                                </button>

                                {/* Expanded details */}
                                {isExpanded && (
                                    <div className="px-5 pb-5 space-y-3 border-t border-border-light pt-4 animate-fade-slide-in">
                                        {/* Prompt preview */}
                                        {s.prompt && (
                                            <div className="bg-surface rounded-xl p-4 max-h-60 overflow-y-auto text-xs font-mono leading-relaxed">
                                                {s.prompt.split('\n').map((line, i) => (
                                                    <p key={i} dir="auto" className="whitespace-pre-wrap min-h-[1em]">
                                                        {line || '\u00A0'}
                                                    </p>
                                                ))}
                                            </div>
                                        )}

                                        {/* Notes */}
                                        {s.generalNotes && (
                                            <p className="text-xs text-text-secondary">
                                                <span className="font-semibold">ملاحظات:</span> {s.generalNotes.slice(0, 200)}
                                                {s.generalNotes.length > 200 && '...'}
                                            </p>
                                        )}

                                        {/* Actions */}
                                        <div className="flex gap-2">
                                            {s.prompt && (
                                                <button
                                                    onClick={() => handleCopyPrompt(s.id, s.prompt)}
                                                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium text-white transition-default ${copiedId === s.id
                                                            ? 'bg-success'
                                                            : 'bg-primary hover:bg-primary-dark'
                                                        }`}
                                                >
                                                    <Copy size={13} />
                                                    {copiedId === s.id ? 'تم النسخ' : 'نسخ البرومبت'}
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDelete(s.id)}
                                                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium text-danger border border-danger/30 hover:bg-danger-light transition-default"
                                            >
                                                <Trash2 size={13} />
                                                حذف
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
