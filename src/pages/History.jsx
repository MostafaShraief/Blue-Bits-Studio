import { useState, useMemo, useEffect } from 'react';
import { Clock, FileSearch, AlignRight, Palette, FileOutput, Trash2, Copy, Loader2, Image as ImageIcon } from 'lucide-react';
import { fetchSessions, fetchSession, removeSession } from '../utils/api';

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
    const [sessions, setSessions] = useState([]);
    const [filter, setFilter] = useState('all');
    const [expandedId, setExpandedId] = useState(null);
    const [copiedId, setCopiedId] = useState(null);
    
    // Details caching
    const [fullSessions, setFullSessions] = useState({});
    const [loadingDetails, setLoadingDetails] = useState(false);

    useEffect(() => {
        loadSessions();
    }, []);

    const loadSessions = async () => {
        const data = await fetchSessions();
        setSessions(data);
    };

    const filtered = useMemo(() => {
        if (filter === 'all') return sessions;
        return sessions.filter((s) => s.workflowType === filter);
    }, [sessions, filter]);

    const handleDelete = async (id) => {
        await removeSession(id);
        await loadSessions();
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

    const toggleExpand = async (id) => {
        if (expandedId === id) {
            setExpandedId(null);
            return;
        }
        
        setExpandedId(id);
        
        if (!fullSessions[id]) {
            setLoadingDetails(true);
            try {
                const details = await fetchSession(id);
                if (details) {
                    setFullSessions(prev => ({ ...prev, [id]: details }));
                }
            } catch (e) {
                console.error('Error fetching session details', e);
            } finally {
                setLoadingDetails(false);
            }
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
                        const meta = TYPE_META[s.workflowType] || TYPE_META.lecture;
                        const Icon = meta.icon;
                        const isExpanded = expandedId === s.id;
                        const details = fullSessions[s.id];
                        
                        const promptText = details?.prompt?.promptText || '';
                        const generalNotes = details?.notes?.filter(n => n.noteType === 'General').map(n => n.noteText).join('\n') || '';
                        const images = details?.images || [];
                        const isDetailsLoading = isExpanded && !details && loadingDetails;

                        return (
                            <div
                                key={s.id}
                                className="bg-surface-card border border-border rounded-2xl overflow-hidden transition-default hover:shadow-md"
                            >
                                {/* Header */}
                                <button
                                    onClick={() => toggleExpand(s.id)}
                                    className="w-full flex items-center gap-4 px-5 py-4 text-start hover:bg-surface-hover transition-colors"
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
                                    <div className="px-5 pb-5 border-t border-border-light pt-4 animate-fade-slide-in">
                                        {isDetailsLoading ? (
                                            <div className="flex items-center justify-center p-6">
                                                <Loader2 className="animate-spin text-primary" size={24} />
                                            </div>
                                        ) : details ? (
                                            <div className="space-y-4">
                                                {/* Prompt preview */}
                                                {promptText && (
                                                    <div>
                                                        <h4 className="text-xs font-bold text-text-secondary mb-2">البرومبت</h4>
                                                        <div className="bg-surface rounded-xl p-4 max-h-60 overflow-y-auto text-xs font-mono leading-relaxed border border-border">
                                                            {promptText.split('\n').map((line, i) => (
                                                                <p key={i} dir="auto" className="whitespace-pre-wrap min-h-[1em]">
                                                                    {line || '\u00A0'}
                                                                </p>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Notes */}
                                                {generalNotes && (
                                                    <div>
                                                        <h4 className="text-xs font-bold text-text-secondary mb-1">ملاحظات عامة</h4>
                                                        <p className="text-xs text-text leading-relaxed whitespace-pre-wrap bg-surface-hover p-3 rounded-lg">
                                                            {generalNotes}
                                                        </p>
                                                    </div>
                                                )}
                                                
                                                {/* Images */}
                                                {images.length > 0 && (
                                                    <div>
                                                        <h4 className="text-xs font-bold text-text-secondary mb-2 flex items-center gap-1.5">
                                                            <ImageIcon size={14} /> الصور المرفقة ({images.length})
                                                        </h4>
                                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                                            {images.map((img) => (
                                                                <div key={img.id} className="relative group rounded-xl overflow-hidden border border-border aspect-square bg-surface flex items-center justify-center p-2">
                                                                    <img 
                                                                        src={`http://localhost:5135/uploads/${img.localFilePath}`} 
                                                                        alt="مرفق" 
                                                                        className="max-w-full max-h-full object-contain rounded-lg"
                                                                        loading="lazy"
                                                                    />
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Actions */}
                                                <div className="flex gap-2 pt-2 border-t border-border mt-4">
                                                    {promptText && (
                                                        <button
                                                            onClick={() => handleCopyPrompt(s.id, promptText)}
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
                                                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium text-danger border border-danger/30 hover:bg-danger-light transition-default ms-auto"
                                                    >
                                                        <Trash2 size={13} />
                                                        حذف الجلسة
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-center py-4 text-xs text-text-muted">
                                                لا توجد تفاصيل لهذه الجلسة أو حدث خطأ أثناء الجلب.
                                            </div>
                                        )}
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
