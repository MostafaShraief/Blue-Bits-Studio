import { useState, useCallback, useEffect, useContext } from 'react';
import { useSearchParams, useNavigate } from 'react-router';
import { Copy } from 'lucide-react';
import WizardStepper from '../components/WizardStepper';
import PromptPreview from '../components/PromptPreview';
import MaterialAutocomplete from '../components/common/MaterialAutocomplete';
import { useWizard } from '../hooks/useWizard';
import { useToast } from '../contexts/ToastContext';
import { AuthContext } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { getSession } from '../api/SessionsApi';
import { compilePrompt } from '../api/PromptsApi';
import { RateLimitError } from '../api/HttpClient';

const STEPS = ['إعداد الجلسة', 'النص', 'المعاينة والنسخ'];

export default function CoordinationWizard() {
    const [searchParams] = useSearchParams();
    const initialType = searchParams.get('type') === 'bank' ? 'bank' : 'lecture';
    const id = searchParams.get('id');
    const { autoSave, defaultMaterial } = useSettings();
    const { user, loading } = useContext(AuthContext);
    const { showToast } = useToast();
    const navigate = useNavigate();

    const { currentStep, next, prev, goTo, sessionId, setSessionId, createSession } = useWizard({ totalSteps: 3 });

    const isAdmin = user?.role === 'Admin';
    const canDoLectureCoord = user?.allowedWorkflows?.includes('LEC_COORD') ?? false;
    const canDoBankCoord = user?.allowedWorkflows?.includes('BANK_COORD') ?? false;

    const getInitialWorkflowCode = () => {
        if (initialType === 'bank' && canDoBankCoord) return 'BANK_COORD';
        if (initialType === 'lecture' && canDoLectureCoord) return 'LEC_COORD';
        if (canDoLectureCoord) return 'LEC_COORD';
        if (canDoBankCoord) return 'BANK_COORD';
        return 'LEC_COORD';
    };

    useEffect(() => {
        if (loading) return;
        if (!isAdmin && !canDoLectureCoord && !canDoBankCoord) {
            navigate('/unauthorized', { replace: true });
        }
    }, [loading, isAdmin, canDoLectureCoord, canDoBankCoord, navigate]);

    const [workflowSystemCode, setWorkflowSystemCode] = useState(
        initialType === 'bank' ? 'BANK_COORD' : 'LEC_COORD'
    );
    const [materialName, setMaterialName] = useState(defaultMaterial || '');
    const [materialValid, setMaterialValid] = useState(false);
    const [lectureNumber, setLectureNumber] = useState('');
    const [lectureType, setLectureType] = useState('');
    const [markdownText, setMarkdownText] = useState('');
    const [prompt, setPrompt] = useState('');
    const [copied, setCopied] = useState(false);
    const [isLoadingPrompt, setIsLoadingPrompt] = useState(false);
    const [saved, setSaved] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});

    const clearFieldError = (field) => {
        setFieldErrors((prev) => {
            if (!prev[field]) return prev;
            const next = { ...prev };
            delete next[field];
            return next;
        });
    };

    useEffect(() => {
        if (loading) return;
        if (!isAdmin && !canDoLectureCoord && !canDoBankCoord) return;
        if (id) return;
        const code = getInitialWorkflowCode();
        if (code) setWorkflowSystemCode(code);
    }, [loading, canDoLectureCoord, canDoBankCoord, id]);

    useEffect(() => {
        if (id) {
            getSession(id).then(data => {
                if (data) {
                    if (data.compiledPrompt) setPrompt(data.compiledPrompt);
                    const notes = data.notes?.filter(n => n.noteType === 'GeneralNote').map(n => n.noteText).join('\n') || '';
                    if (notes) setMarkdownText(notes);
                    setMaterialName(data.material?.materialName || '');
                    setSessionId(id);
                    setLectureNumber(data.lectureNumber || 1);
                    setLectureType(data.lectureType || '');
                    if (data.workflow?.systemCode) setWorkflowSystemCode(data.workflow.systemCode);
                    setSaved(true);
                    goTo(2);
                }
            }).catch(err => {
                if (err instanceof RateLimitError) {
                    showToast(err.message, 'warning');
                } else {
                    showToast(err.message || 'فشل في تحميل الجلسة', 'error');
                }
            });
        }
    }, [id]);

    const goNext = useCallback(async () => {
        setFieldErrors({});
        if (currentStep === 0) {
            if (!materialValid || !lectureNumber || !lectureType || !workflowSystemCode) {
                showToast('الرجاء اختيار مادة صالحة وإدخال جميع البيانات المطلوبة', 'error');
                return;
            }
            next();
        } else if (currentStep === 1) {
            if (!markdownText.trim()) {
                showToast('الرجاء إدخال نص الـ Markdown', 'error');
                return;
            }
            setIsLoadingPrompt(true);
            try {
                const session = await createSession({
                    materialName,
                    lectureNumber: Number(lectureNumber),
                    lectureType,
                    workflowSystemCode,
                    generalNotes: markdownText,
                });

                const sid = session.id || session.sessionId;
                let finalPrompt = '';

                if (autoSave) {
                    const sessionData = await getSession(sid);
                    finalPrompt = sessionData?.compiledPrompt || '';
                    setSaved(true);
                } else {
                    const res = await compilePrompt(workflowSystemCode, markdownText, []);
                    finalPrompt = res?.compiledPrompt || '';
                }

                setPrompt(finalPrompt);
                next();
            } catch (err) {
                if (err instanceof RateLimitError) {
                    showToast(err.message, 'warning');
                } else if (err?.status === 400 && err?.errors) {
                    const normalized = {};
                    for (const [key, value] of Object.entries(err.errors)) {
                        normalized[key.toLowerCase()] = value;
                    }
                    setFieldErrors(normalized);
                } else {
                    showToast(err?.message || 'حدث خطأ غير متوقع', 'error');
                }
            } finally {
                setIsLoadingPrompt(false);
            }
        }
    }, [currentStep, next, materialValid, lectureNumber, lectureType, workflowSystemCode, markdownText, materialName, autoSave, createSession]);

    const goBack = useCallback(() => {
        prev();
    }, [prev]);

    const handleCopy = useCallback(async () => {
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
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
    }, [prompt]);

    const handleSave = useCallback(async () => {
        if (saved || !sessionId) return;
        try {
            await getSession(sessionId);
            setSaved(true);
            showToast('تم حفظ الجلسة بنجاح', 'success');
        } catch (err) {
            if (err instanceof RateLimitError) {
                showToast(err.message, 'warning');
            } else {
                showToast(err.message || 'فشل في حفظ الجلسة', 'error');
            }
        }
    }, [sessionId, saved, showToast]);

    const fieldInputClass = (field) =>
        `w-full rounded-xl border px-4 py-3 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 transition-default ${
            fieldErrors[field]
                ? 'border-danger focus:ring-danger/30 focus:border-danger bg-surface-card'
                : 'border-border bg-surface-card focus:ring-primary/30 focus:border-primary'
        }`;

    return (
        <div className="max-w-3xl mx-auto animate-fade-slide-in">
            <h1 className="text-2xl font-bold text-text mb-2">تنسيق</h1>
            <p className="text-sm text-text-secondary mb-6">
                ادرج النص المراجَع من Obsidian لدمجه مع قواعد التنسيق
            </p>
            <WizardStepper steps={STEPS} current={currentStep} />

            {currentStep === 0 && (
                <div className="space-y-5 animate-fade-slide-in">
                    <div className="bg-surface-card border border-border rounded-2xl p-5 space-y-4">
                        <h3 className="text-sm font-semibold text-text mb-2">بيانات الجلسة</h3>

                        <div>
                            <label className="block text-sm font-medium text-text mb-1.5">نوع التنسيق</label>
                            <div data-tour="coordination-type" className="flex gap-3">
                                {[
                                    { value: 'LEC_COORD', label: 'محاضرة', enabled: canDoLectureCoord || isAdmin },
                                    { value: 'BANK_COORD', label: 'بنك أسئلة', enabled: canDoBankCoord || isAdmin },
                                ].filter(opt => opt.enabled).map(({ value, label }) => (
                                    <button
                                        key={value}
                                        onClick={() => { setWorkflowSystemCode(value); clearFieldError('workflowsystemcode'); }}
                                        className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-default ${workflowSystemCode === value
                                                ? 'border-primary bg-primary-light text-primary'
                                                : 'border-border bg-surface-card text-text-secondary hover:border-primary/40'
                                            }`}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                            {fieldErrors.workflowsystemcode && (
                                <p className="text-xs text-danger mt-1">{fieldErrors.workflowsystemcode}</p>
                            )}
                        </div>

                        <MaterialAutocomplete
                            value={materialName}
                            onChange={(v) => { setMaterialName(v); clearFieldError('materialname'); }}
                            onValidChange={setMaterialValid}
                            required
                        />
                        {fieldErrors.materialname && (
                            <p className="text-xs text-danger mt-1">{fieldErrors.materialname}</p>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-text mb-1.5">رقم المحاضرة</label>
                            <input
                                type="number"
                                value={lectureNumber}
                                onChange={(e) => {
                                    let val = e.target.value;
                                    if (val === '') { setLectureNumber(''); clearFieldError('lecturenumber'); return; }
                                    const num = parseInt(val, 10);
                                    if (!isNaN(num)) {
                                        if (num > 99) val = '99';
                                        else if (num < 1) val = '1';
                                        else val = num.toString();
                                    }
                                    setLectureNumber(val);
                                    clearFieldError('lecturenumber');
                                }}
                                placeholder="مثال: 5"
                                min="1"
                                max="99"
                                className={fieldInputClass('lecturenumber')}
                            />
                            {fieldErrors.lecturenumber && (
                                <p className="text-xs text-danger mt-1">{fieldErrors.lecturenumber}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text mb-1.5">نوع المحاضرة</label>
                            <div className="flex gap-3">
                                {[
                                    { value: 'Theoretical', label: 'نظري' },
                                    { value: 'Practical', label: 'عملي' },
                                ].map(({ value, label }) => (
                                    <button
                                        key={value}
                                        onClick={() => { setLectureType(value); clearFieldError('lecturetype'); }}
                                        className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-default ${lectureType === value
                                                ? 'border-primary bg-primary-light text-primary'
                                                : 'border-border bg-surface-card text-text-secondary hover:border-primary/40'
                                            }`}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                            {fieldErrors.lecturetype && (
                                <p className="text-xs text-danger mt-1">{fieldErrors.lecturetype}</p>
                            )}
                        </div>
                    </div>

                    <button
                        onClick={goNext}
                        disabled={!materialValid || !lectureNumber || !lectureType || !workflowSystemCode}
                        className="w-full py-3 rounded-xl bg-primary text-white font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary-dark transition-default shadow-lg shadow-primary/25"
                    >
                        التالي
                    </button>
                </div>
            )}

            {currentStep === 1 && (
                <div data-tour="coordination-input" className="space-y-5 animate-fade-slide-in">
                    <div>
                        <div className="flex justify-between items-end mb-1.5">
                            <label className="block text-sm font-medium text-text">
                                نص الـ Markdown المراجَع
                            </label>
                            <span className="text-xs text-text-muted">قم بإزالة أي أسطر فارغة إضافية قبل اللصق</span>
                        </div>
                        <textarea
                            value={markdownText}
                            onChange={(e) => setMarkdownText(e.target.value)}
                            placeholder="الصق هنا نص الـ Markdown بعد مراجعته..."
                            rows={12}
                            dir="auto"
                            className="w-full resize-none rounded-xl border border-border bg-surface-card px-4 py-3 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-default font-mono"
                        />
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={goBack}
                            disabled={isLoadingPrompt}
                            className="flex-1 py-3 rounded-xl border border-border text-sm font-medium text-text-secondary hover:bg-surface-hover transition-default disabled:opacity-40"
                        >
                            رجوع
                        </button>
                        <button
                            onClick={goNext}
                            disabled={!markdownText.trim() || isLoadingPrompt}
                            className="flex-[2] py-3 rounded-xl bg-primary text-white font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary-dark transition-default shadow-lg shadow-primary/25"
                        >
                            {isLoadingPrompt ? 'جاري التحضير...' : 'توليد البرومبت'}
                        </button>
                    </div>
                </div>
            )}

            {currentStep === 2 && prompt && (
                <div data-tour="coordination-preview" className="space-y-5 animate-fade-slide-in">
                    <PromptPreview text={prompt} />

                    <div className="bg-surface-card border border-border rounded-2xl p-5 text-sm text-text-secondary space-y-2">
                        <p><strong>خطوات التنفيذ:</strong></p>
                        <ol className="list-decimal list-inside space-y-1">
                            <li>افتح <a href="https://aistudio.google.com/prompts/new_chat" target="_blank" rel="noreferrer" className="text-primary hover:underline font-bold">Google AI Studio</a>.</li>
                            <li>قم بلصق البرومبت في حقل الإدخال لإنشاء النتيجة.</li>
                            <li>بعد الحصول على النتيجة، انتقل إلى قسم <strong className="text-primary">محوّل Pandoc</strong> في التطبيق والصقها هناك لتحويلها إلى ملف Word.</li>
                        </ol>
                    </div>

                    <button
                        onClick={handleCopy}
                        className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white transition-default ${copied
                                ? 'bg-success animate-copy-flash'
                                : 'bg-primary hover:bg-primary-dark shadow-lg shadow-primary/25'
                            }`}
                    >
                        <Copy size={16} />
                        {copied ? 'تم النسخ ✓' : 'نسخ البرومبت'}
                    </button>

                    <div className="flex gap-3">
                        <button
                            onClick={goBack}
                            className="flex-1 py-3 rounded-xl border border-border text-sm font-medium text-text-secondary hover:bg-surface-hover transition-default"
                        >
                            رجوع
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saved}
                            className={`flex-[2] py-3 rounded-xl text-sm font-bold transition-default ${saved
                                    ? 'bg-success text-white cursor-default'
                                    : 'bg-cyan text-white hover:bg-cyan/80 shadow-lg shadow-cyan/25'
                                }`}
                        >
                            {saved ? 'تم الحفظ ✓' : 'حفظ الجلسة'}
                        </button>
                    </div>

                    <div className="flex justify-center">
                        {!saved && !autoSave && <span className="text-text-muted text-sm font-medium">الجلسة غير محفوظة</span>}
                    </div>
                </div>
            )}
        </div>
    );
}
