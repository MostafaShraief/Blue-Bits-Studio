import { useSearchParams } from 'react-router';
import { useEffect, useState, useRef } from 'react';
import { FileOutput, Upload, Loader2, FolderOpen, File, Download } from 'lucide-react';
import WizardStepper from '../components/WizardStepper';
import PasteButton from '../components/PasteButton';
import MaterialAutocomplete from '../components/common/MaterialAutocomplete';
import { createSession, fetchSession, generatePandoc } from '../utils/api';
import { useSettings } from '../contexts/SettingsContext';

const STEPS = ['التسمية', 'إدراج Markdown', 'التنفيذ والنتيجة'];

export default function PandocWizard() {
    const [searchParams] = useSearchParams();
    const id = searchParams.get('id');
    const { autoSave } = useSettings();

    

    useEffect(() => {
        if (id) {
            fetchSession(id).then(data => {
                if (data) {
                    if (data.materialName) setMaterialName(data.materialName);
                    if (data.lectureNumber) setLectureNumber(data.lectureNumber);
                    if (data.lectureType) setLectureType(data.lectureType);
                    if (data.prompt && data.prompt.promptText) setMdText(data.prompt.promptText);
                    setSaved(true);
                    setStep(STEPS.length - 1);
                }
            });
        }
    }, [id]);

    const [step, setStep] = useState(0);
    const fileInputRef = useRef(null);

    // Step 1
    const [materialName, setMaterialName] = useState('');
    const [lectureNumber, setLectureNumber] = useState('');
    const [lectureType, setLectureType] = useState('Theoretical');

    // Step 2
    const [mdText, setMdText] = useState('');
    const [saved, setSaved] = useState(false);

    // Step 3
    const [status, setStatus] = useState('idle'); // idle | loading | success | error
    const [downloadUrl, setDownloadUrl] = useState(null);

    const canProceedStep1 = materialName.trim() && lectureNumber.trim();

    const goNext = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
    const goBack = () => setStep((s) => Math.max(s - 1, 0));

    /* Handle file open */
    const handleFileOpen = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => setMdText(ev.target.result);
        reader.readAsText(file);
        e.target.value = '';
    };

    /* Handle drag & drop */
    const handleDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file && (file.name.endsWith('.md') || file.type === 'text/markdown' || file.type === 'text/plain')) {
            const reader = new FileReader();
            reader.onload = (ev) => setMdText(ev.target.result);
            reader.readAsText(file);
        }
    };

    /* Mock execution (backend required) */
    const handleGenerate = async () => {
        setStatus('loading');
        try {
            await createSession({
                materialName,
                lectureNumber: Number(lectureNumber),
                lectureType,
                workflowSystemCode: 'PANDOC',
                generalNotes: `Template: ${lectureType === 'Theoretical' ? 'Pandoc-Theo.dotx' : 'Pandoc-Prac.dotx'}`,
            });
            
            const result = await generatePandoc({
                markdownText: mdText,
                templateName: lectureType === 'Theoretical' ? 'Pandoc-Theo.dotx' : 'Pandoc-Prac.dotx',
                materialName,
                lectureNumber: Number(lectureNumber),
                lectureType
            });
            
            setDownloadUrl('http://localhost:5135' + (result.fileUrl || result.downloadUrl));
            setStatus('success');
        } catch (e) {
            console.error("Failed to save session", e);
            setStatus('error');
        }
    };

    return (
        <div className="max-w-3xl mx-auto animate-fade-slide-in">
            <h1 className="text-2xl font-bold text-text mb-2">محوّل Pandoc</h1>
            <p className="text-sm text-text-secondary mb-6">
                تحويل ملف Markdown إلى مستند Word منسّق
            </p>

            <WizardStepper steps={STEPS} current={step} />

            {/* Step 1: Naming */}
            {step === 0 && (
                <div data-tour="pandoc-metadata" className="space-y-5 animate-fade-slide-in">
                    <MaterialAutocomplete value={materialName} onChange={setMaterialName} />

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

                    <div>
                        <label className="block text-sm font-medium text-text mb-1.5">النوع</label>
                        <div className="flex gap-3">
                            {[
                                { value: 'Theoretical', label: 'نظري' },
                                { value: 'Practical', label: 'عملي' },
                            ].map(({ value, label }) => (
                                <button
                                    key={value}
                                    onClick={() => setLectureType(value)}
                                    className={`flex-1 py-3 rounded-xl text-sm font-medium border transition-default ${lectureType === value
                                            ? 'border-primary bg-primary-light text-primary'
                                            : 'border-border bg-surface-card text-text-secondary hover:border-primary/40'
                                        }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                        <p className="text-xs text-text-muted mt-2">
                            سيتم استخدام القالب:{' '}
                            <span className="font-mono text-primary">
                                {lectureType === 'Theoretical' ? 'Pandoc-Theo.dotx' : 'Pandoc-Prac.dotx'}
                            </span>
                        </p>
                    </div>

                    <button
                        onClick={goNext}
                        disabled={!canProceedStep1}
                        className="w-full py-3 rounded-xl bg-primary text-white font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary-dark transition-default shadow-lg shadow-primary/25"
                    >
                        التالي
                    </button>
                </div>
            )}

            {/* Step 2: Input MD */}
            {step === 1 && (
                <div data-tour="pandoc-input" className="space-y-5 animate-fade-slide-in">
                    <div
                        onDrop={handleDrop}
                        onDragOver={(e) => e.preventDefault()}
                    >
                        <div className="flex items-center justify-between mb-1.5">
                            <label className="text-sm font-medium text-text">نص الـ Markdown</label>
                            <div className="flex gap-2">
                                <PasteButton onPaste={(text) => setMdText(prev => (prev ? prev + '\n' + text : text))} />
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="flex items-center gap-1 text-xs text-primary hover:text-primary-dark transition-default bg-surface border border-primary/20 px-3 py-1.5 rounded-lg"
                                >
                                    <Upload size={14} />
                                    فتح ملف .md
                                </button>
                            </div>
                        </div>
                        <textarea
                            
                            value={mdText}
                            onChange={(e) => setMdText(e.target.value)}
                            placeholder="الصق نص الـ Markdown هنا، أو اسحب ملف .md ..."
                            rows={14}
                            dir="auto"
                            className="w-full resize-none rounded-xl border border-border bg-surface-card px-4 py-3 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-default font-mono"
                        />
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".md,.markdown,.txt"
                            className="hidden"
                            onChange={handleFileOpen}
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
                            disabled={!mdText.trim()}
                            className="flex-[2] py-3 rounded-xl bg-primary text-white font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary-dark transition-default shadow-lg shadow-primary/25"
                        >
                            إنشاء المستند
                        </button>
                    </div>
                </div>
            )}

            {/* Step 3: Execution & Result */}
            {step === 2 && (
                <div data-tour="pandoc-generate" className="space-y-6 animate-fade-slide-in">
                    <div className="bg-surface-card border border-border rounded-2xl p-8 text-center space-y-4">
                        {status === 'idle' && (
                            <>
                                <FileOutput size={48} className="mx-auto text-primary" strokeWidth={1.3} />
                                <p className="text-sm text-text">
                                    جاهز لتحويل الملف باستخدام{' '}
                                    <span className="font-mono text-primary">
                                        {lectureType === 'Theoretical' ? 'Pandoc-Theo.dotx' : 'Pandoc-Prac.dotx'}
                                    </span>
                                </p>
                                
                                <div className="text-xs text-text-secondary bg-surface rounded-xl p-4 text-start">
                                    <strong>ملاحظة:</strong> إذا كان المستند يحتوي على رسومات تحتاج تحويلها من كود لصور، 
                                    استخدم قسم <strong>الرسم</strong> أولاً لاستخراج الصور وحفظها، ثم أضفها إلى ملف الـ Markdown قبل التحويل.
                                </div>

                                <button
                                    onClick={handleGenerate}
                                    className="px-8 py-3 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary-dark transition-default shadow-lg shadow-primary/25"
                                >
                                    إنشاء ملف Word
                                </button>
                            </>
                        )}

                        {status === 'loading' && (
                            <>
                                <Loader2 size={48} className="mx-auto text-primary animate-spin" strokeWidth={1.5} />
                                <p className="text-sm text-text-secondary">جاري التحويل...</p>
                            </>
                        )}

                        {status === 'success' && (
                            <>
                                <div className="w-16 h-16 mx-auto bg-success/10 rounded-full flex items-center justify-center">
                                    <File size={32} className="text-success" strokeWidth={1.5} />
                                </div>
                                <p className="text-sm font-semibold text-success">تم إنشاء المستند بنجاح!</p>
                                <div className="flex gap-3 justify-center">
                                    {downloadUrl && (
                                        <button
                                            onClick={() => window.open(downloadUrl, '_blank')}
                                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary-dark transition-default shadow-lg shadow-primary/25"
                                        >
                                            <Download size={16} />
                                            تنزيل الملف
                                        </button>
                                    )}
                                </div>
                            </>
                        )}
                    </div>

                    <button
                        onClick={goBack}
                        className="w-full py-3 rounded-xl border border-border text-sm font-medium text-text-secondary hover:bg-surface-hover transition-default"
                    >
                        رجوع
                    </button>
                </div>
            )}
        </div>
    );
}
