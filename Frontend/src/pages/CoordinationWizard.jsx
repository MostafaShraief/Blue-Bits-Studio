import { useState, useCallback, useEffect, useContext } from 'react';
import { useSearchParams, useNavigate } from 'react-router';
import { Copy } from 'lucide-react';
import WizardStepper from '../components/WizardStepper';
import PromptPreview from '../components/PromptPreview';
import MaterialAutocomplete from '../components/common/MaterialAutocomplete';
import { createSession, fetchSession, compilePromptStateless } from '../utils/api';
import { useSettings } from '../contexts/SettingsContext';
import { AuthContext } from '../contexts/AuthContext';

const STEPS = ['إعداد الجلسة', 'إدراج النص', 'المعاينة والنسخ'];
export default function CoordinationWizard() {
    const [searchParams] = useSearchParams();
    const initialType = searchParams.get('type') === 'bank' ? 'bank' : 'lecture';
    const id = searchParams.get('id');
    const { autoSave, defaultMaterial } = useSettings();
    const { user, loading } = useContext(AuthContext);
    const navigate = useNavigate();

    // Permission checks - wait until auth is loaded
    const isAdmin = user?.role === 'Admin';
    const canDoLectureCoord = user?.allowedWorkflows?.includes('LEC_COORD') ?? false;
    const canDoBankCoord = user?.allowedWorkflows?.includes('BANK_COORD') ?? false;

    // Helper function to determine initial workflow code - must be defined before useState
    const getInitialWorkflowCode = () => {
        // Check if the requested type in URL is actually allowed
        if (initialType === 'bank' && canDoBankCoord) return 'BANK_COORD';
        if (initialType === 'lecture' && canDoLectureCoord) return 'LEC_COORD';
        // Fallback: prioritize the enabled workflow
        if (canDoLectureCoord) return 'LEC_COORD';
        if (canDoBankCoord) return 'BANK_COORD';
        return 'LEC_COORD'; // Default (will be blocked by useEffect above)
    };

    // Access control: redirect to 403 if both workflows are disabled and user is not admin
    useEffect(() => {
        if (loading) return; // Wait for auth to load
        if (!isAdmin && !canDoLectureCoord && !canDoBankCoord) {
            navigate('/unauthorized', { replace: true });
        }
    }, [loading, isAdmin, canDoLectureCoord, canDoBankCoord, navigate]);

    // Update workflow state after auth loads
    useEffect(() => {
        if (loading) return;
        // Only set from URL if we're loading a session (id param)
        if (id) {
            setWorkflowSystemCode(getInitialWorkflowCode());
        }
        // Otherwise, leave workflowSystemCode empty - user must choose manually
    }, [loading, canDoLectureCoord, canDoBankCoord, id]);

    const [step, setStep] = useState(0);

    // Initial state - start with empty selection, user must choose
    const [workflowSystemCode, setWorkflowSystemCode] = useState('');
    
    // Metadata state
    const [materialName, setMaterialName] = useState(defaultMaterial || '');
    const [materialValid, setMaterialValid] = useState(false);
    const [lectureNumber, setLectureNumber] = useState('');
    const [lectureType, setLectureType] = useState('');
    const [markdownText, setMarkdownText] = useState('');
    const [prompt, setPrompt] = useState('');
    const [copied, setCopied] = useState(false);
    const [saved, setSaved] = useState(false);
    const [sessionId, setSessionId] = useState(null);
    const [isLoadingPrompt, setIsLoadingPrompt] = useState(false);
    useEffect(() => {
        if (id) {
            fetchSession(id).then(data => {
                if (data) {
                    if (data.compiledPrompt) setPrompt(data.compiledPrompt);
                    const notes = data.notes?.filter(n => n.noteType === 'GeneralNote').map(n => n.noteText).join('\n') || '';
                    if (notes) setMarkdownText(notes);
                    
                    setMaterialName(data.material?.materialName || '');
                    setSessionId(id);
                    setLectureNumber(data.lectureNumber || 1);
                    setLectureType(data.lectureType || '');
                    if (data.workflowType) setWorkflowSystemCode(data.workflowType);
                    
                    setSaved(true);
                    setStep(STEPS.length - 1);
                }
            }).catch(console.error);
        }
    }, [id]);
    const handleNextStep0 = () => {
        if (!materialValid || !lectureNumber || !lectureType || !workflowSystemCode) {
            alert('الرجاء اختيار مادة صالحة وإدخال جميع البيانات المطلوبة');
            return;
        }
        setStep(1);
    };
    const goNext = async () => {
        setIsLoadingPrompt(true);
        try {
            // Always create session to get an ID (handleSave will need it)
            const createdSession = await createSession({
                materialName,
                lectureNumber: Number(lectureNumber),
                lectureType,
                workflowSystemCode,
                generalNotes: markdownText,
            });

            const idToFetch = createdSession.sessionId || createdSession.id;
            setSessionId(idToFetch);

            let finalPrompt = '';

            if (autoSave) {
                // Fetch compiled prompt from saved session
                const sessionData = await fetchSession(idToFetch);
                finalPrompt = sessionData?.compiledPrompt || '';
                setSaved(true);
            } else {
                // Compile prompt stateless (no DB fetch needed)
                const res = await compilePromptStateless({
                    systemCode: workflowSystemCode,
                    generalNotes: markdownText,
                    fileNotes: []
                });
                finalPrompt = res?.compiledPrompt || '';
            }
            
            setPrompt(finalPrompt);
            setStep(2);
        } catch (err) {
            console.error("Failed to generate prompt or save session", err);
            alert(err.message || "Failed to generate prompt. Please try again.");
        }
        setIsLoadingPrompt(false);
    };
    const goBack = () => setStep(s => Math.max(0, s - 1));
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
            await fetchSession(sessionId);
            setSaved(true);
        } catch (err) {
            console.error("Failed to save session", err);
        }
    }, [sessionId, saved]);

    /* ── Auto Save ──────────────────────── */
    useEffect(() => {
        // No-op: session is always created in goNext
    }, [step, autoSave, saved, prompt, sessionId, handleSave]);

    return (
        <div className="max-w-3xl mx-auto animate-fade-slide-in">
            <h1 className="text-2xl font-bold text-text mb-2">تنسيق</h1>
            <p className="text-sm text-text-secondary mb-6">
                ادرج النص المراجَع من Obsidian لدمجه مع قواعد التنسيق
            </p>
            <WizardStepper steps={STEPS} current={step} />
            {/* Step 0: Metadata */}
            {step === 0 && (
                <div className="space-y-5 animate-fade-slide-in">
                    {/* Workflow type toggle + Metadata in a rounded box */}
                    <div className="bg-surface-card border border-border rounded-2xl p-5 space-y-4">
                        <h3 className="text-sm font-semibold text-text mb-2">بيانات الجلسة</h3>

                        {/* Workflow type toggle - with label */}
                        <div>
                            <label className="block text-sm font-medium text-text mb-1.5">نوع التنسيق</label>
                            <div data-tour="coordination-type" className="flex gap-3">
                                {[
                                    { value: 'LEC_COORD', label: 'محاضرة', enabled: canDoLectureCoord || isAdmin },
                                    { value: 'BANK_COORD', label: 'بنك أسئلة', enabled: canDoBankCoord || isAdmin },
                                ].filter(opt => opt.enabled).map(({ value, label }) => (
                                    <button
                                        key={value}
                                        onClick={() => setWorkflowSystemCode(value)}
                                        className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-default ${workflowSystemCode === value
                                                ? 'border-primary bg-primary-light text-primary'
                                                : 'border-border bg-surface-card text-text-secondary hover:border-primary/40'
                                            }`}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Material Name */}
                        <MaterialAutocomplete 
                            value={materialName} 
                            onChange={setMaterialName}
                            onValidChange={setMaterialValid}
                            required 
                        />

                        {/* Lecture Number */}
                        <div>
                            <label className="block text-sm font-medium text-text mb-1.5">رقم المحاضرة</label>
                            <input
                                type="number"
                                value={lectureNumber}
                                onChange={(e) => {
                                    let val = e.target.value;
                                    if (val === '') {
                                        setLectureNumber('');
                                        return;
                                    }
                                    const num = parseInt(val, 10);
                                    if (!isNaN(num)) {
                                        if (num > 99) val = '99';
                                        else if (num < 1) val = '1';
                                        else val = num.toString();
                                    }
                                    setLectureNumber(val);
                                }}
                                placeholder="مثال: 5"
                                min="1"
                                max="99"
                                className="w-full rounded-xl border border-border bg-surface-card px-4 py-3 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-default"
                            />
                        </div>

                        {/* Lecture Type - BUTTON style like ExtractionWizard */}
                        <div>
                            <label className="block text-sm font-medium text-text mb-1.5">نوع المحاضرة</label>
                            <div className="flex gap-3">
                                {[
                                    { value: 'Theoretical', label: 'نظري' },
                                    { value: 'Practical', label: 'عملي' },
                                ].map(({ value, label }) => (
                                    <button
                                        key={value}
                                        onClick={() => setLectureType(value)}
                                        className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-default ${lectureType === value
                                                ? 'border-primary bg-primary-light text-primary'
                                                : 'border-border bg-surface-card text-text-secondary hover:border-primary/40'
                                            }`}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleNextStep0}
                        disabled={!materialValid || !lectureNumber || !lectureType || !workflowSystemCode}
                        className="w-full py-3 rounded-xl bg-primary text-white font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary-dark transition-default shadow-lg shadow-primary/25"
                    >
                        التالي
                    </button>
                </div>
            )}
            {/* Step 1: Insertion */}
            {step === 1 && (
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
                            className="flex-1 py-3 rounded-xl border border-border text-sm font-medium text-text-secondary hover:bg-surface-hover transition-default"
                        >
                            رجوع
                        </button>
                        <button
                            onClick={goNext}
                            disabled={!markdownText.trim() || isLoadingPrompt}
                            className="flex-[2] py-3 rounded-xl bg-primary text-white font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary-dark transition-default shadow-lg shadow-primary/25"
                        >
                            {isLoadingPrompt ? 'جاري التحضير...' : 'معاينة البرومبت'}
                        </button>
                    </div>
                </div>
            )}
            {/* Step 2: Preview & Copy */}
            {step === 2 && (
                <div className="space-y-6 animate-fade-slide-in">
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
