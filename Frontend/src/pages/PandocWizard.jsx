import { useSearchParams } from 'react-router';
import { useEffect, useState, useRef } from 'react';
import { FileOutput, Upload, Loader2, File, Download, AlertCircle } from 'lucide-react';
import WizardStepper from '../components/WizardStepper';
import PasteButton from '../components/PasteButton';
import MaterialAutocomplete from '../components/common/MaterialAutocomplete';
import { useWizard } from '../hooks/useWizard';
import { useToast } from '../contexts/ToastContext';
import { PandocApi } from '../api/PandocApi';
import { createSession as apiCreateSession, getSession as fetchSessionApi, saveSessionContent as apiSaveContent } from '../api/SessionsApi';
import { useSettings } from '../contexts/SettingsContext';
import { ApiError, RateLimitError } from '../api/HttpClient';
import { formatRateLimitError } from '../utils/errorFormatter';

const STEPS = ['إعداد الجلسة', 'إدراج Markdown', 'التنفيذ والنتيجة'];

export default function PandocWizard() {
    const [searchParams] = useSearchParams();
    const id = searchParams.get('id');
    const { defaultMaterial } = useSettings();
    const { showToast } = useToast();
    const { currentStep, next, prev, goTo } = useWizard({ totalSteps: STEPS.length });

    const [materialName, setMaterialName] = useState(defaultMaterial || '');
    const [materialValid, setMaterialValid] = useState(false);
    const [lectureNumber, setLectureNumber] = useState('');
    const [lectureType, setLectureType] = useState('');
    const [mdText, setMdText] = useState('');
    const [status, setStatus] = useState('idle');
    const [downloadUrl, setDownloadUrl] = useState(null);
    const [isSinglePage, setIsSinglePage] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});
    const fileInputRef = useRef(null);
    const [restoring, setRestoring] = useState(!!id);

    useEffect(() => {
        if (id) {
            fetchSessionApi(id).then(data => {
                if (data) {
                    if (data.material?.materialName) setMaterialName(data.material.materialName);
                    if (data.lectureNumber) setLectureNumber(data.lectureNumber);
                    if (data.lectureType) setLectureType(data.lectureType);
                    const sessionContent = data.sessionContents?.[0];
                    if (sessionContent?.contentBody) {
                        setMdText(sessionContent.contentBody);
                    } else if (data.compiledPrompt) {
                        setMdText(data.compiledPrompt);
                    }
                    goTo(STEPS.length - 1);
                }
            }).finally(() => setRestoring(false));
        }
    }, [id, goTo]);

    const handleStep0Next = () => {
        const errors = {};
        if (!materialValid) errors.materialname = 'الرجاء اختيار مادة صالحة';
        if (!String(lectureNumber).trim()) errors.lecturenumber = 'الرجاء إدخال رقم المحاضرة';
        if (!lectureType) errors.lecturetype = 'الرجاء اختيار نوع المحاضرة';
        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            return;
        }
        next();
    };

    const handleFileOpen = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => setMdText(ev.target.result);
        reader.readAsText(file);
        e.target.value = '';
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file && (file.name.endsWith('.md') || file.type === 'text/markdown' || file.type === 'text/plain')) {
            const reader = new FileReader();
            reader.onload = (ev) => setMdText(ev.target.result);
            reader.readAsText(file);
        }
    };

    const clearFieldError = (field) => {
        setFieldErrors(prev => {
            if (!prev[field]) return prev;
            const next = { ...prev };
            delete next[field];
            return next;
        });
    };

    const handleGenerate = async () => {
        setStatus('loading');
        setFieldErrors({});
        try {
            const session = await apiCreateSession({
                materialName,
                lectureNumber: Number(lectureNumber),
                lectureType,
                workflowSystemCode: 'PANDOC',
                generalNotes: '',
            });

            const sid = session.id || session.sessionId;

            await apiSaveContent(sid, { contentBody: mdText });

            const result = await PandocApi.generate(
                mdText,
                'Pandoc.dotx',
                materialName,
                lectureType,
                lectureNumber,
                isSinglePage,
            );

            setDownloadUrl(window.location.origin + (result.fileUrl || result.downloadUrl));
            setStatus('success');
        } catch (err) {
            if (err instanceof RateLimitError) {
                showToast(formatRateLimitError(err.retryAfter), 'warning');
            } else if (err instanceof ApiError && err.status === 400 && err.errors) {
                const normalized = {};
                for (const [key, msg] of Object.entries(err.errors)) {
                    normalized[key.toLowerCase()] = msg;
                }
                setFieldErrors(normalized);
                showToast(err.message || 'بيانات غير صالحة', 'error');
            } else {
                console.error('Pandoc generation failed', err);
                showToast(err.message || 'فشل في إنشاء المستند', 'error');
            }
            setStatus('error');
        }
    };

    if (restoring) {
        return (
            <div className="min-h-[60dvh] flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <p className="text-sm text-text-muted">جارٍ تحميل الجلسة...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto animate-fade-slide-in">
            <h1 className="text-2xl font-bold text-text mb-2">محوّل Pandoc</h1>
            <p className="text-sm text-text-secondary mb-6">
                تحويل ملف Markdown إلى مستند Word منسّق
            </p>

            <WizardStepper steps={STEPS} current={currentStep} />

            {currentStep === 0 && (
                <div data-tour="pandoc-metadata" className="bg-surface-card border border-border rounded-2xl p-5 space-y-4 animate-fade-slide-in">
                    <h3 className="text-sm font-semibold text-text mb-2">بيانات الجلسة</h3>

                    <MaterialAutocomplete
                        value={materialName}
                        onChange={(val) => { setMaterialName(val); clearFieldError('materialname'); }}
                        onValidChange={setMaterialValid}
                    />
                    {fieldErrors.materialname && (
                        <p className="text-xs text-danger mt-1">{fieldErrors.materialname}</p>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-text mb-1.5">رقم المحاضرة</label>
                        <input
                            id="lecture-number"
                            type="number"
                            value={lectureNumber}
                            onChange={(e) => {
                                clearFieldError('lecturenumber');
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
                        {fieldErrors.lecturenumber && (
                            <p className="text-xs text-danger mt-1">{fieldErrors.lecturenumber}</p>
                        )}
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

                    <div>
                        <label className="block text-sm font-medium text-text mb-2">نوع المستند الناتج</label>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setIsSinglePage(false)}
                                className={`flex-1 py-3 rounded-xl text-sm font-medium border transition-default ${!isSinglePage
                                        ? 'border-primary bg-primary-light text-primary'
                                        : 'border-border bg-surface-card text-text-secondary hover:border-primary/40'
                                    }`}
                            >
                                <div className="font-semibold">مستند كامل مع قالب</div>
                                <div className="text-xs mt-0.5 opacity-75">غلاف وتنسيق نهائي</div>
                            </button>
                            <button
                                onClick={() => setIsSinglePage(true)}
                                className={`flex-1 py-3 rounded-xl text-sm font-medium border transition-default ${isSinglePage
                                        ? 'border-primary bg-primary-light text-primary'
                                        : 'border-border bg-surface-card text-text-secondary hover:border-primary/40'
                                    }`}
                            >
                                <div className="font-semibold">صفحة بيضاء فردية</div>
                                <div className="text-xs mt-0.5 opacity-75">بالتنسيق الأساسي</div>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {currentStep === 0 && (
                <div className="mt-5">
                    <button
                        onClick={handleStep0Next}
                        className="w-full py-3 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary-dark transition-default shadow-lg shadow-primary/25"
                    >
                        التالي
                    </button>
                </div>
            )}

            {currentStep === 1 && (
                <div data-tour="pandoc-input" className="space-y-5 animate-fade-slide-in">
                    <div
                        onDrop={handleDrop}
                        onDragOver={(e) => e.preventDefault()}
                    >
                        <div className="flex items-center justify-between mb-1.5">
                            <label htmlFor="md-textarea" className="text-sm font-medium text-text">نص الـ Markdown</label>
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
                            id="md-textarea"
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
                            onClick={prev}
                            className="flex-1 py-3 rounded-xl border border-border text-sm font-medium text-text-secondary hover:bg-surface-hover transition-default"
                        >
                            رجوع
                        </button>
                        <button
                            onClick={next}
                            disabled={!mdText.trim()}
                            className="flex-[2] py-3 rounded-xl bg-primary text-white font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary-dark transition-default shadow-lg shadow-primary/25"
                        >
                            إنشاء المستند
                        </button>
                    </div>
                </div>
            )}

            {currentStep === 2 && (
                <div data-tour="pandoc-generate" className="space-y-6 animate-fade-slide-in">
                    <div className="bg-surface-card border border-border rounded-2xl p-8 text-center space-y-4">
                        {status === 'idle' && (
                            <>
                                <FileOutput size={48} className="mx-auto text-primary" strokeWidth={1.3} />
                                <p className="text-sm text-text">
                                    جاهز لتحويل الملف باستخدام{' '}
                                    <span className="font-mono text-primary">
                                        Pandoc.dotx
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

                        {status === 'error' && (
                            <>
                                <div className="w-16 h-16 mx-auto bg-danger/10 rounded-full flex items-center justify-center">
                                    <AlertCircle size={32} className="text-danger" strokeWidth={1.5} />
                                </div>
                                <p className="text-sm font-semibold text-danger">فشل في إنشاء المستند</p>
                                <button
                                    onClick={() => setStatus('idle')}
                                    className="px-8 py-3 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary-dark transition-default shadow-lg shadow-primary/25"
                                >
                                    إعادة المحاولة
                                </button>
                            </>
                        )}
                    </div>

                    <button
                        onClick={prev}
                        className="w-full py-3 rounded-xl border border-border text-sm font-medium text-text-secondary hover:bg-surface-hover transition-default"
                    >
                        رجوع
                    </button>
                </div>
            )}
        </div>
    );
}
