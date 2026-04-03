import { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router';
import { Copy } from 'lucide-react';
import WizardStepper from '../components/WizardStepper';
import PromptPreview from '../components/PromptPreview';
import { buildCoordinationPrompt } from '../data/prompts';
import { createSession, fetchSession } from '../utils/api';

const STEPS = ['إدراج النص', 'المعاينة والنسخ'];

export default function CoordinationWizard() {
    const [searchParams] = useSearchParams();
    const id = searchParams.get('id');

    const [step, setStep] = useState(0);
    const [workflowType, setWorkflowType] = useState('lecture');
    const [markdownText, setMarkdownText] = useState('');
    const [prompt, setPrompt] = useState('');
    const [copied, setCopied] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        if (id) {
            fetchSession(id).then(data => {
                if (data) {
                    if (data.prompt && data.prompt.promptText) setPrompt(data.prompt.promptText);
                    const notes = data.notes?.filter(n => n.noteType === 'General').map(n => n.noteText).join('\n') || '';
                    if (notes) setMarkdownText(notes);
                }
            }).catch(console.error);
        }
    }, [id]);

    const goNext = () => {
        const p = buildCoordinationPrompt(workflowType, markdownText);
        setPrompt(p);
        setSaved(false);
        setStep(1);
    };

    const goBack = () => setStep(0);

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

    const handleSave = async () => {
        try {
            await createSession({
                materialName: 'تنسيق ' + (workflowType === 'lecture' ? 'محاضرة' : 'بنك'),
                lectureNumber: '',
                lectureType: '',
                workflowType: 'coordination',
                prompt,
                generalNotes: markdownText,
            });
            setSaved(true);
        } catch (e) {
            console.error("Failed to save session", e);
        }
    };

    return (
        <div className="max-w-3xl mx-auto animate-fade-slide-in">
            <h1 className="text-2xl font-bold text-text mb-2">تنسيق</h1>
            <p className="text-sm text-text-secondary mb-6">
                ادرج النص المراجَع من Obsidian لدمجه مع قواعد التنسيق
            </p>

            <WizardStepper steps={STEPS} current={step} />

            {/* Step 1: Insertion */}
            {step === 0 && (
                <div className="space-y-5 animate-fade-slide-in">
                    {/* Workflow type */}
                    <div className="flex gap-3">
                        {[
                            { value: 'lecture', label: 'محاضرة' },
                            { value: 'bank', label: 'بنك أسئلة' },
                        ].map(({ value, label }) => (
                            <button
                                key={value}
                                onClick={() => setWorkflowType(value)}
                                className={`flex-1 py-3 rounded-xl text-sm font-semibold border-2 transition-default ${workflowType === value
                                        ? 'border-primary bg-primary text-white'
                                        : 'border-border bg-surface-card text-text-secondary hover:border-primary/40'
                                    }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>

                    {/* Markdown textarea */}
                    <div>
                        <div className="flex justify-between items-end mb-1.5">
                            <label className="block text-sm font-medium text-text">
                                نص الـ Markdown المراجَع
                            </label>
                            <span className="text-xs text-text-muted">قم بإزالة أي أسطر فارغة إضافية أو نصوص غير ضرورية قبل اللصق</span>
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

                    <button
                        onClick={goNext}
                        disabled={!markdownText.trim()}
                        className="w-full py-3 rounded-xl bg-primary text-white font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary-dark transition-default shadow-lg shadow-primary/25"
                    >
                        معاينة البرومبت
                    </button>
                </div>
            )}

            {/* Step 2: Preview & Copy */}
            {step === 1 && (
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
                </div>
            )}
        </div>
    );
}
