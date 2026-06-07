import { useState, useRef } from 'react';
import { Layers, Upload, Loader2, File, Download, ArrowUp, ArrowDown, X, CheckCircle2 } from 'lucide-react';
import WizardStepper from '../components/WizardStepper';
import MaterialAutocomplete from '../components/common/MaterialAutocomplete';
import MergeApi from '../api/MergeApi';
import { ApiError, RateLimitError } from '../api/HttpClient';
import { useWizard } from '../hooks/useWizard';
import { useToast } from '../contexts/ToastContext';
import { useSettings } from '../contexts/SettingsContext';

const STEPS = ['إعداد الجلسة', 'تحميل الملفات (بالترتيب)', 'الدمج والنتيجة'];

export default function MergeWizard() {
    const { currentStep, next, prev, goTo, createSession } = useWizard({ totalSteps: 3 });
    const { showToast } = useToast();
    const fileInputRef = useRef(null);
    const { defaultMaterial } = useSettings();

    const [materialName, setMaterialName] = useState(defaultMaterial || '');
    const [materialValid, setMaterialValid] = useState(false);
    const [lectureType, setLectureType] = useState('');
    const [lectureNumber, setLectureNumber] = useState('');
    const [files, setFiles] = useState([]);

    const [status, setStatus] = useState('idle');
    const [downloadUrl, setDownloadUrl] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});

    const handleStep0Next = () => {
        const errors = {};
        if (!materialValid) errors.materialname = 'الرجاء اختيار مادة صالحة';
        if (!lectureNumber) errors.lecturenumber = 'الرجاء إدخال رقم المحاضرة';
        if (!lectureType) errors.lecturetype = 'الرجاء اختيار نوع المحاضرة';
        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            return;
        }
        next();
    };

    const canProceedStep2 = files.length > 1;

    const handleFileSelect = (e) => {
        if (!e.target.files) return;
        const newFiles = Array.from(e.target.files).filter(f => f.name.endsWith('.docx'));
        setFiles(prev => [...prev, ...newFiles]);
        e.target.value = null;
    };

    const removeFile = (index) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const moveFile = (index, dir) => {
        if ((dir === -1 && index === 0) || (dir === 1 && index === files.length - 1)) return;
        setFiles(prev => {
            const arr = [...prev];
            const temp = arr[index];
            arr[index] = arr[index + dir];
            arr[index + dir] = temp;
            return arr;
        });
    };

    const clearFieldError = (field) => {
        setFieldErrors(prev => {
            if (!prev[field]) return prev;
            const next = { ...prev };
            delete next[field];
            return next;
        });
    };

    const handleMerge = async () => {
        try {
            setStatus('loading');
            setFieldErrors({});
            setErrorMessage('');

            try {
                await createSession({
                    materialName,
                    lectureNumber: parseInt(lectureNumber),
                    lectureType,
                    workflowSystemCode: 'MERGE',
                });
            } catch (sessionError) {
                if (sessionError instanceof RateLimitError) {
                    showToast(sessionError.message, 'warning');
                    setStatus('idle');
                    return;
                }
                console.warn('Session creation failed, proceeding with merge:', sessionError);
            }

            const result = await MergeApi.execute(files, materialName, lectureType);

            setDownloadUrl(result.url);
            setStatus('success');
        } catch (error) {
            console.error('Merge failed:', error);

            if (error instanceof RateLimitError) {
                showToast(error.message, 'warning');
                setStatus('idle');
                return;
            }

            if (error instanceof ApiError && error.status === 400 && error.errors) {
                const normalized = {};
                for (const [key, value] of Object.entries(error.errors)) {
                    normalized[key.toLowerCase()] = value;
                }
                setFieldErrors(normalized);
                setErrorMessage(error.message);
                setStatus('error');
                return;
            }

            setErrorMessage(error.message || 'حدث خطأ أثناء الدمج');
            setStatus('error');
        }
    };

    const getDownloadFileName = () => {
        const typeLabel = lectureType === 'Practical' ? 'عملي' : 'نظري';
        return `${materialName} - ${typeLabel} - ملف شامل.docx`;
    };

    const handleReset = () => {
        goTo(0);
        setFiles([]);
        setStatus('idle');
        setDownloadUrl(null);
        setErrorMessage('');
        setFieldErrors({});
    };

    const getTypeLabel = () => lectureType === 'Practical' ? 'عملي' : 'نظري';

    return (
        <div className="max-w-3xl mx-auto animate-fade-slide-in">
            <h1 className="text-2xl font-bold text-text mb-2">دمج الملفات</h1>
            <p className="text-sm text-text-secondary mb-6">دمج عدة ملفات Word معاً بالترتيب الصحيح</p>

            <WizardStepper steps={STEPS} current={currentStep} />

            {currentStep === 0 && (
                <div data-tour="merge-metadata" className="bg-surface-card border border-border rounded-2xl p-5 space-y-4 animate-fade-slide-in">
                    <h3 className="text-sm font-semibold text-text mb-2">بيانات الجلسة</h3>

                    <div>
                        <MaterialAutocomplete
                            value={materialName}
                            onChange={(val) => { setMaterialName(val); clearFieldError('materialname'); }}
                            onValidChange={setMaterialValid}
                        />
                        {fieldErrors.materialname && (
                            <p className="text-xs text-danger mt-1">{fieldErrors.materialname}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text mb-1.5">رقم المحاضرة</label>
                        <input
                            type="number"
                            min="1"
                            max="99"
                            value={lectureNumber}
                            onChange={(e) => { setLectureNumber(e.target.value); clearFieldError('lecturenumber'); }}
                            placeholder="مثال: 5"
                            className={`w-full rounded-xl border bg-surface-card px-4 py-3 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 transition-default ${fieldErrors.lecturenumber ? 'border-danger focus:ring-danger/30 focus:border-danger' : 'border-border focus:ring-primary/30 focus:border-primary'}`}
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
                <div className="space-y-5 animate-fade-slide-in">
                    {files.length === 0 ? (
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl bg-surface-card hover:bg-surface-hover transition-default cursor-pointer py-16"
                        >
                            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4">
                                <Upload size={32} />
                            </div>
                            <h3 className="text-lg font-semibold text-text mb-1">اضغط لاختيار ملفات Word</h3>
                            <p className="text-sm text-text-muted">صيغة .docx فقط</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <div className="bg-surface-card border border-border rounded-xl p-4 space-y-2 max-h-64 overflow-y-auto">
                                {files.map((file, index) => (
                                    <div
                                        key={`${file.name}-${index}`}
                                        className="flex items-center gap-3 p-2 rounded-lg bg-surface-hover/50 hover:bg-surface-hover transition-default"
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                            <span className="text-xs font-bold text-primary">{index + 1}</span>
                                        </div>
                                        <div className="flex-1 min-w-0 flex items-center gap-2">
                                            <File size={14} className="text-text-muted shrink-0" />
                                            <span className="text-sm font-medium text-text truncate" dir="ltr">{file.name}</span>
                                        </div>
                                        <div className="flex items-center gap-1 shrink-0">
                                            <button
                                                className={`p-1.5 rounded-md transition-default ${index === 0 ? 'text-text-muted cursor-not-allowed' : 'text-text-secondary hover:bg-surface-hover'}`}
                                                onClick={() => moveFile(index, -1)}
                                                disabled={index === 0}
                                                title="تحريك لأعلى"
                                            >
                                                <ArrowUp size={16} />
                                            </button>
                                            <button
                                                className={`p-1.5 rounded-md transition-default ${index === files.length - 1 ? 'text-text-muted cursor-not-allowed' : 'text-text-secondary hover:bg-surface-hover'}`}
                                                onClick={() => moveFile(index, 1)}
                                                disabled={index === files.length - 1}
                                                title="تحريك لأسفل"
                                            >
                                                <ArrowDown size={16} />
                                            </button>
                                            <div className="w-px h-4 bg-border mx-1"></div>
                                            <button
                                                className="p-1.5 rounded-md text-text-muted hover:bg-danger/10 hover:text-danger transition-default"
                                                onClick={() => removeFile(index)}
                                                title="حذف"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button
                                className="w-full py-3 rounded-xl border border-dashed border-border bg-surface-card hover:bg-surface-hover text-text-secondary flex items-center justify-center gap-2 transition-default"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <Upload size={18} className="text-text-muted" />
                                <span>إضافة المزيد من الملفات</span>
                            </button>
                        </div>
                    )}

                    <input
                        type="file"
                        multiple
                        accept=".docx"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={handleFileSelect}
                    />

                    <div className="flex gap-3">
                        <button
                            onClick={prev}
                            className="flex-1 py-3 rounded-xl border border-border text-sm font-medium text-text-secondary hover:bg-surface-hover transition-default"
                        >
                            رجوع
                        </button>
                        <button
                            onClick={next}
                            disabled={!canProceedStep2}
                            className="flex-[2] py-3 rounded-xl bg-primary text-white font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary-dark transition-default shadow-lg shadow-primary/25"
                        >
                            التالي
                        </button>
                    </div>
                </div>
            )}

            {currentStep === 2 && (
                <div className="space-y-6 animate-fade-slide-in">
                    <div className="bg-surface-card border border-border rounded-2xl p-8 text-center space-y-4">
                        {status === 'idle' && (
                            <>
                                <Layers size={48} className="mx-auto text-primary" strokeWidth={1.3} />
                                <p className="text-sm text-text">جاهز لدمج {files.length} ملفات معاً</p>
                                <p className="text-xs text-text-secondary bg-surface-hover rounded-xl p-4 text-start">
                                    <strong>ملاحظة:</strong> قد تستغرق عملية الدمج عدة ثوانٍ حسب حجم الملفات.
                                </p>

                                <button
                                    onClick={handleMerge}
                                    className="px-8 py-3 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary-dark transition-default shadow-lg shadow-primary/25"
                                >
                                    بدء الدمج
                                </button>
                            </>
                        )}

                        {status === 'loading' && (
                            <>
                                <Loader2 size={48} className="mx-auto text-primary animate-spin" strokeWidth={1.5} />
                                <p className="text-sm text-text-secondary">جاري دمج الملفات...</p>
                                <p className="text-xs text-text-muted">يرجى الانتظار، تتم معالجة {files.length} ملفات</p>
                            </>
                        )}

                        {status === 'success' && downloadUrl && (
                            <>
                                <div className="w-16 h-16 mx-auto bg-success/10 rounded-full flex items-center justify-center">
                                    <CheckCircle2 size={32} className="text-success" strokeWidth={1.5} />
                                </div>
                                <p className="text-sm font-semibold text-success">تم الدمج بنجاح!</p>
                                <p className="text-sm text-text-secondary">الملف جاهز للتحميل الآن</p>
                                <div className="flex gap-3 justify-center">
                                    <a
                                        href={downloadUrl}
                                        download={getDownloadFileName()}
                                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-success text-white font-bold text-sm hover:bg-success/90 transition-default shadow-lg shadow-success/25"
                                    >
                                        <Download size={16} />
                                        تحميل الملف المدمج
                                    </a>
                                </div>
                                <button
                                    onClick={handleReset}
                                    className="text-sm text-text-muted hover:text-text underline underline-offset-4 transition-default"
                                >
                                    دمج ملفات أخرى
                                </button>
                            </>
                        )}

                        {status === 'error' && (
                            <>
                                <div className="w-16 h-16 mx-auto bg-danger/10 rounded-full flex items-center justify-center">
                                    <X size={32} className="text-danger" strokeWidth={1.5} />
                                </div>
                                <p className="text-sm font-semibold text-danger">حدث خطأ أثناء الدمج</p>
                                {errorMessage && (
                                    <p className="text-xs text-text-secondary">{errorMessage}</p>
                                )}
                                <button
                                    onClick={() => setStatus('idle')}
                                    className="mt-4 px-6 py-2 bg-surface-card border border-border text-text rounded-lg hover:bg-surface-hover transition-default"
                                >
                                    رجوع
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
