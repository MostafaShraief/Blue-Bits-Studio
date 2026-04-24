import { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router';
import { Copy } from 'lucide-react';
import WizardStepper from '../components/WizardStepper';
import PromptPreview from '../components/PromptPreview';
import MaterialAutocomplete from '../components/common/MaterialAutocomplete';
import { createSession, fetchSession, compilePromptStateless } from '../utils/api';
import { useSettings } from '../contexts/SettingsContext';
const STEPS = ['إعداد الجلسة', 'إدراج النص', 'المعاينة والنسخ'];
export default function CoordinationWizard() {
    const [searchParams] = useSearchParams();
    const { autoSave, defaultMaterial } = useSettings();
    const id = searchParams.get('id');
    const [step, setStep] = useState(0);
    const [workflowSystemCode, setWorkflowSystemCode] = useState('LEC_COORD');
    
    // Metadata state
    const [materialName, setMaterialName] = useState(defaultMaterial || '');
    const [lectureNumber, setLectureNumber] = useState(1);
    const [lectureType, setLectureType] = useState('Theoretical');
    const [saveSessionEnabled, setSaveSessionEnabled] = useState(true);
    const [markdownText, setMarkdownText] = useState('');
    const [prompt, setPrompt] = useState('');
    const [copied, setCopied] = useState(false);
    const [saved, setSaved] = useState(false);
    const [isLoadingPrompt, setIsLoadingPrompt] = useState(false);
    useEffect(() => {
        if (id) {
            fetchSession(id).then(data => {
                if (data) {
                    if (data.compiledPrompt) setPrompt(data.compiledPrompt);
                    const notes = data.notes?.filter(n => n.noteType === 'GeneralNote').map(n => n.noteText).join('\n') || '';
                    if (notes) setMarkdownText(notes);
                    
                    setMaterialName(data.material?.materialName || '');
                    setLectureNumber(data.lectureNumber || 1);
                    setLectureType(data.lectureType || 'Theoretical');
                    
                    setSaved(true);
                    setStep(STEPS.length - 1);
                }
            }).catch(console.error);
        }
    }, [id]);
    const handleNextStep0 = () => {
        if (!materialName.trim() || !lectureNumber || !lectureType) {
            alert('الرجاء إدخال جميع البيانات المطلوبة (اسم المادة، رقم المحاضرة، نوع المحاضرة)');
            return;
        }
        setStep(1);
    };
    const goNext = async () => {
        setIsLoadingPrompt(true);
        try {
            if (saveSessionEnabled) {
                // 1. Create session to get ID
                const createdSession = await createSession({
                    materialName,
                    lectureNumber: Number(lectureNumber),
                    lectureType,
                    workflowSystemCode,
                    generalNotes: markdownText,
                });
                // 2. Fetch full session from API to get compiledPrompt
                const sessionData = await fetchSession(createdSession.sessionId || createdSession.id);
                setPrompt(sessionData?.compiledPrompt || '');
                setSaved(true);
            } else {
                // Compile statelessly
                const res = await compilePromptStateless({
                    systemCode: workflowSystemCode,
                    generalNotes: markdownText,
                    fileNotes: []
                });
                setPrompt(res?.compiledPrompt || '');
                setSaved(false);
            }
            
            setStep(2);
        } catch (err) {
            console.error("Failed to generate prompt or save session", err);
            alert("Failed to generate prompt. Please try again.");
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
                    <MaterialAutocomplete 
                        value={materialName} 
                        onChange={setMaterialName} 
                        required 
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-text mb-1.5">
                                رقم المحاضرة <span className="text-error">*</span>
                            </label>
                            <input
                                type="number"
                                min="1"
                                value={lectureNumber}
                                onChange={(e) => setLectureNumber(e.target.value)}
                                className="w-full rounded-xl border border-border bg-surface-card px-4 py-3 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-default"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text mb-1.5">
                                نوع المحاضرة <span className="text-error">*</span>
                            </label>
                            <select
                                value={lectureType}
                                onChange={(e) => setLectureType(e.target.value)}
                                className="w-full rounded-xl border border-border bg-surface-card px-4 py-3 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-default"
                            >
                                <option value="Theoretical">نظري</option>
                                <option value="Practical">عملي</option>
                            </select>
                        </div>
                    </div>
                    {/* Workflow type */}
                    <div className="flex gap-3 pt-2">
                        {[
                            { value: 'LEC_COORD', label: 'محاضرة' },
                            { value: 'BANK_COORD', label: 'بنك أسئلة' },
                        ].map(({ value, label }) => (
                            <button
                                key={value}
                                onClick={() => setWorkflowSystemCode(value)}
                                className={`flex-1 py-3 rounded-xl text-sm font-semibold border-2 transition-default ${workflowSystemCode === value
                                        ? 'border-primary bg-primary text-white'
                                        : 'border-border bg-surface-card text-text-secondary hover:border-primary/40'
                                    }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                    <label className="flex items-center gap-2 mt-4 cursor-pointer">
                        <input 
                            type="checkbox" 
                            checked={saveSessionEnabled}
                            onChange={(e) => setSaveSessionEnabled(e.target.checked)}
                            className="rounded border-border text-primary focus:ring-primary/30 h-4 w-4"
                        />
                        <span className="text-sm font-medium text-text">حفظ هذه الجلسة في النظام</span>
                    </label>
                    <button
                        onClick={handleNextStep0}
                        disabled={!materialName.trim() || !lectureNumber || !lectureType}
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
                    <div className="flex justify-center mt-4">
                        {saved && <span className="text-success text-sm font-bold">تم حفظ الجلسة في النظام بنجاح ✓</span>}
                        {!saved && !saveSessionEnabled && <span className="text-text-muted text-sm font-medium">الجلسة غير محفوظة</span>}
                    </div>
                </div>
            )}
        </div>
    );
}
