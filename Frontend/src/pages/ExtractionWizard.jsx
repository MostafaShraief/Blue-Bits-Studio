import { useState, useCallback, useEffect, useContext } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router';
import WizardStepper from '../components/WizardStepper';
import ImageUploader from '../components/ImageUploader';
import PromptPreview from '../components/PromptPreview';
import GuidedCopyLoop from '../components/GuidedCopyLoop';
import PasteButton from '../components/PasteButton';
import PasteImageButton from '../components/PasteImageButton';
import MaterialAutocomplete from '../components/common/MaterialAutocomplete';
import { useWizard } from '../hooks/useWizard';
import { getSession, createSession as apiCreateSession, uploadFiles as apiUploadFiles } from '../api/SessionsApi';
import { compilePrompt as apiCompilePrompt } from '../api/PromptsApi';
import { useToast } from '../contexts/ToastContext';
import { useSettings } from '../contexts/SettingsContext';
import { AuthContext } from '../contexts/AuthContext';
import { formatRateLimitError } from '../utils/errorFormatter';

const STEPS = ['إعداد الجلسة', 'المدخلات', 'المعاينة والنسخ'];

export default function ExtractionWizard() {
    const [searchParams] = useSearchParams();
    const initialType = searchParams.get('type') === 'bank' ? 'bank' : 'lecture';
    const id = searchParams.get('id');
    const { autoSave, defaultMaterial } = useSettings();
    const { user, loading } = useContext(AuthContext);
    const navigate = useNavigate();
    const { showToast } = useToast();

    const { currentStep, next, prev, goTo, sessionId, setSessionId } = useWizard({ totalSteps: 3 });

    const isAdmin = user?.role === 'Admin';
    const canDoLecture = user?.allowedWorkflows?.includes('LEC_EXT') ?? false;
    const canDoBank = user?.allowedWorkflows?.includes('BANK_EXT') ?? false;

    const getInitialWorkflowCode = () => {
        if (initialType === 'bank' && canDoBank) return 'BANK_EXT';
        if (initialType === 'lecture' && canDoLecture) return 'LEC_EXT';
        if (canDoLecture) return 'LEC_EXT';
        if (canDoBank) return 'BANK_EXT';
        return 'LEC_EXT';
    };

    useEffect(() => {
        if (loading) return;
        if (!isAdmin && !canDoLecture && !canDoBank) {
            navigate('/unauthorized', { replace: true });
        }
    }, [loading, isAdmin, canDoLecture, canDoBank, navigate]);

    useEffect(() => {
        if (loading) return;
        if (id) {
            setWorkflowSystemCode(getInitialWorkflowCode());
        }
    }, [loading, canDoLecture, canDoBank, id]);

    const [fieldErrors, setFieldErrors] = useState({});

    const clearFieldError = useCallback((field) => {
        setFieldErrors((prev) => {
            if (!prev[field]) return prev;
            const next = { ...prev };
            delete next[field];
            return next;
        });
    }, []);

    const [workflowSystemCode, setWorkflowSystemCode] = useState('');
    const [materialName, setMaterialName] = useState(defaultMaterial || '');
    const [materialValid, setMaterialValid] = useState(false);
    const [lectureNumber, setLectureNumber] = useState('');
    const [lectureType, setLectureType] = useState('');

    const [images, setImages] = useState([]);
    const [generalNotes, setGeneralNotes] = useState('');

    const [prompt, setPrompt] = useState('');
    const [saved, setSaved] = useState(false);
    const [isLoadingPrompt, setIsLoadingPrompt] = useState(false);

    useEffect(() => {
        if (id) {
            getSession(id).then(data => {
                if (!data) return;
                if (data.material?.materialName) setMaterialName(data.material.materialName);
                if (data.lectureNumber) setLectureNumber(data.lectureNumber);
                if (data.lectureType) setLectureType(data.lectureType);
                if (data.workflow?.systemCode) setWorkflowSystemCode(data.workflow.systemCode);
                if (data.compiledPrompt) setPrompt(data.compiledPrompt);

                const notes = data.notes?.filter(n => n.noteType === 'GeneralNote').map(n => n.noteText).join('\n') || '';
                if (notes) setGeneralNotes(notes);

                if (data.files && data.files.length > 0) {
                    const loadedImages = data.files.map(img => ({
                        file: null,
                        url: '/uploads/' + img.localFilePath,
                        note: data.notes?.find(n => n.noteType === 'FileNote' && n.fileId === img.fileId)?.noteText || ''
                    }));
                    setImages(loadedImages);
                }
                setSessionId(id);
                setSaved(true);
                goTo(STEPS.length - 1);
            });
        }
    }, [id]);

    const addImage = useCallback((file) => {
        const url = URL.createObjectURL(file);
        setImages((prev) => [...prev, { file, url, note: '' }]);
    }, []);

    const removeImage = useCallback((index) => {
        setImages((prev) => {
            URL.revokeObjectURL(prev[index].url);
            return prev.filter((_, i) => i !== index);
        });
    }, []);

    const updateImageNote = useCallback((index, text) => {
        setImages((prev) => prev.map((img, i) => (i === index ? { ...img, note: text } : img)));
    }, []);

    useEffect(() => {
        const handleGlobalPaste = (e) => {
            if (currentStep !== 1) return;
            if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;

            const items = e.clipboardData?.items;
            if (!items) return;

            let textContent = '';
            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                if (item.type.indexOf('image') !== -1) {
                    const file = item.getAsFile();
                    if (file) addImage(file);
                } else if (item.type === 'text/plain') {
                    item.getAsString((text) => {
                        textContent += text + '\n';
                    });
                }
            }

            setTimeout(() => {
                if (textContent.trim()) {
                    setGeneralNotes(prev => (prev ? prev + '\n' + textContent.trim() : textContent.trim()));
                }
            }, 50);
        };

        window.addEventListener('paste', handleGlobalPaste);
        return () => window.removeEventListener('paste', handleGlobalPaste);
    }, [addImage, currentStep]);

    const goNext = useCallback(async () => {
        setFieldErrors({});
        if (currentStep === 1) {
            setIsLoadingPrompt(true);
            try {
                const processedImages = await Promise.all(images.map(async (img, i) => {
                    if (!img.file && img.url) {
                        try {
                            const res = await fetch(img.url);
                            const blob = await res.blob();
                            const file = new File([blob], `image-${i}.png`, { type: blob.type || 'image/png' });
                            return { ...img, file };
                        } catch {
                            return img;
                        }
                    }
                    return img;
                }));

                let finalPrompt = '';

                const createdSession = await apiCreateSession({
                    materialName,
                    lectureNumber: parseInt(lectureNumber, 10),
                    lectureType,
                    workflowSystemCode,
                    generalNotes,
                });
                const newSessionId = createdSession.sessionId || createdSession.id;
                setSessionId(newSessionId);

                const filesWithNotes = processedImages.filter(img => img.file).map(img => img.file);
                const fileNotes = processedImages.map(img => img.note || '');
                if (filesWithNotes.length > 0) {
                    await apiUploadFiles(newSessionId, filesWithNotes, fileNotes);
                }

                if (autoSave) {
                    const sessionData = await getSession(newSessionId);
                    finalPrompt = sessionData?.compiledPrompt || '';
                    setSaved(true);
                } else {
                    const res = await apiCompilePrompt(workflowSystemCode, generalNotes, fileNotes);
                    finalPrompt = res?.compiledPrompt || '';
                }

                setPrompt(finalPrompt);
                next();
            } catch (err) {
                if (err?.status === 429) {
                    showToast(formatRateLimitError(err.retryAfter), 'warning');
                } else if (err?.status === 400 && err?.errors) {
                    const normalized = {};
                    for (const [key, value] of Object.entries(err.errors)) {
                        const camelKey = key.charAt(0).toLowerCase() + key.slice(1);
                        normalized[camelKey] = value;
                    }
                    setFieldErrors(normalized);
                    showToast(err.message || 'بيانات غير صالحة. يرجى التحقق من الحقول.', 'error');
                } else {
                    showToast(err?.message || 'فشل إنشاء الجلسة. يرجى المحاولة مرة أخرى.', 'error');
                }
                setIsLoadingPrompt(false);
                return;
            }
            setIsLoadingPrompt(false);
        } else {
            next();
        }
    }, [currentStep, next, images, materialName, lectureNumber, lectureType, workflowSystemCode, generalNotes, autoSave, setSessionId, showToast]);

    const goBack = useCallback(() => {
        prev();
    }, [prev]);

    const handleSave = useCallback(async () => {
        if (saved || !sessionId) return;
        try {
            await getSession(sessionId);
            setSaved(true);
        } catch (err) {
            console.error("Failed to save session", err);
        }
    }, [sessionId, saved]);

    const canProceedStep1 = materialValid && String(lectureNumber).trim() && workflowSystemCode && lectureType;

    const fieldInputClass = (field) =>
        `w-full rounded-xl border px-4 py-3 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 transition-default ${
            fieldErrors[field]
                ? 'border-danger focus:ring-danger/30 focus:border-danger bg-surface-card'
                : 'border-border bg-surface-card focus:ring-primary/30 focus:border-primary'
        }`;

    return (
        <div className="max-w-3xl mx-auto animate-fade-slide-in">
            <h1 className="text-2xl font-bold text-text mb-2">
                {workflowSystemCode === 'LEC_EXT' ? 'استخراج محاضرة' : 'استخراج بنك أسئلة'}
            </h1>
            <p className="text-sm text-text-secondary mb-6">
                معالج خطوة بخطوة لإنشاء البرومبت وتجهيز الصور
            </p>

            <WizardStepper steps={STEPS} current={currentStep} />

            {/* ─── Step 0: Session setup ─────────────────── */}
            {currentStep === 0 && (
                <div className="space-y-5 animate-fade-slide-in">
                    <div data-tour="extraction-metadata" className="bg-surface-card border border-border rounded-2xl p-5 space-y-4">
                        <h3 className="text-sm font-semibold text-text mb-2">بيانات الجلسة</h3>

                        <div>
                            <label className="block text-sm font-medium text-text mb-1.5">نوع الاستخراج</label>
                            <div data-tour="extraction-type" className="flex gap-3">
                                {[
                                    { value: 'LEC_EXT', label: 'محاضرة', enabled: canDoLecture || isAdmin },
                                    { value: 'BANK_EXT', label: 'بنك أسئلة', enabled: canDoBank || isAdmin },
                                ].filter(opt => opt.enabled).map(({ value, label }) => (
                                    <button
                                        key={value}
                                        onClick={() => { setWorkflowSystemCode(value); clearFieldError('workflowSystemCode'); }}
                                        className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-default ${
                                            workflowSystemCode === value
                                                ? 'border-primary bg-primary-light text-primary'
                                                : 'border-border bg-surface-card text-text-secondary hover:border-primary/40'
                                        }`}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                            {fieldErrors.workflowSystemCode && (
                                <p className="text-xs text-danger mt-1">{fieldErrors.workflowSystemCode}</p>
                            )}
                        </div>

                        <div>
                            <MaterialAutocomplete
                                value={materialName}
                                onChange={(v) => { setMaterialName(v); clearFieldError('materialName'); }}
                                onValidChange={(v) => { setMaterialValid(v); if (v) clearFieldError('materialName'); }}
                            />
                            {fieldErrors.materialName && (
                                <p className="text-xs text-danger mt-1">{fieldErrors.materialName}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text mb-1.5">رقم المحاضرة</label>
                            <input
                                type="number"
                                value={lectureNumber}
                                onChange={(e) => {
                                    let val = e.target.value;
                                    if (val === '') {
                                        setLectureNumber('');
                                        clearFieldError('lectureNumber');
                                        return;
                                    }
                                    const num = parseInt(val, 10);
                                    if (!isNaN(num)) {
                                        if (num > 99) val = '99';
                                        else if (num < 1) val = '1';
                                        else val = num.toString();
                                    }
                                    setLectureNumber(val);
                                    clearFieldError('lectureNumber');
                                }}
                                placeholder="مثال: 5"
                                min="1"
                                max="99"
                                className={fieldInputClass('lectureNumber')}
                            />
                            {fieldErrors.lectureNumber && (
                                <p className="text-xs text-danger mt-1">{fieldErrors.lectureNumber}</p>
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
                                        onClick={() => { setLectureType(value); clearFieldError('lectureType'); }}
                                        className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-default ${
                                            lectureType === value
                                                ? 'border-primary bg-primary-light text-primary'
                                                : 'border-border bg-surface-card text-text-secondary hover:border-primary/40'
                                        }`}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                            {fieldErrors.lectureType && (
                                <p className="text-xs text-danger mt-1">{fieldErrors.lectureType}</p>
                            )}
                        </div>
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

            {/* ─── Step 1: Inputs ─────────────────── */}
            {currentStep === 1 && (
                <div data-tour="extraction-images" className="space-y-6 animate-fade-slide-in">
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-semibold text-text">الصور وملاحظات الصور</h3>
                            <PasteImageButton onPasteImage={addImage} />
                        </div>
                        <ImageUploader
                            images={images}
                            onAdd={addImage}
                            onRemove={removeImage}
                            onNoteChange={updateImageNote}
                        />
                        {fieldErrors.files && (
                            <p className="text-xs text-danger mt-1">{fieldErrors.files}</p>
                        )}
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-semibold text-text">ملاحظات عامة</h3>
                            <PasteButton onPaste={(text) => {
                                setGeneralNotes(prev => (prev ? prev + '\n' + text : text));
                                clearFieldError('generalNotes');
                            }} />
                        </div>
                        <textarea
                            onPaste={(e) => {
                                const items = e.clipboardData?.items;
                                if (!items) return;
                                let hasImage = false;
                                for (let i = 0; i < items.length; i++) {
                                    if (items[i].type.indexOf('image') !== -1) {
                                        hasImage = true;
                                        const file = items[i].getAsFile();
                                        if (file) addImage(file);
                                    }
                                }
                                if (hasImage) e.preventDefault();
                            }}
                            value={generalNotes}
                            onChange={(e) => { setGeneralNotes(e.target.value); clearFieldError('generalNotes'); }}
                            placeholder="أضف ملاحظات عامة للمحاضرة... (اختياري) أو اضغط Ctrl+V للصق من الحافظة مباشرة"
                            rows={4}
                            className={fieldInputClass('generalNotes')}
                        />
                        {fieldErrors.generalNotes && (
                            <p className="text-xs text-danger mt-1">{fieldErrors.generalNotes}</p>
                        )}
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
                            disabled={isLoadingPrompt}
                            className="flex-[2] py-3 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary-dark transition-default shadow-lg shadow-primary/25 disabled:opacity-40"
                        >
                            {isLoadingPrompt ? 'جاري التحضير...' : 'معاينة البرومبت'}
                        </button>
                    </div>
                </div>
            )}

            {/* ─── Step 2: Preview & Guided Copy ──── */}
            {currentStep === 2 && (
                <div data-tour="extraction-preview" className="space-y-6 animate-fade-slide-in">
                    {images.length > 0 && (
                        <div>
                            <h3 className="text-sm font-semibold text-text mb-3">الصور المرفقة</h3>
                            <div className="flex gap-3 overflow-x-auto pb-2">
                                {images.map((img, i) => (
                                    <div key={i} className="relative shrink-0">
                                        <img
                                            src={img.url}
                                            alt={`صورة ${i + 1}`}
                                            className="w-24 h-24 object-cover rounded-xl border border-border"
                                        />
                                        <span className="absolute bottom-1 right-1 bg-primary text-white text-xs font-bold rounded-md px-1.5 py-0.5">
                                            {i + 1}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div>
                        <h3 className="text-sm font-semibold text-text mb-3">البرومبت النهائي</h3>
                        <PromptPreview text={prompt} />
                    </div>

                    <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 text-sm text-text-secondary">
                        <p className="mb-2 font-bold text-primary">خطوات العمل:</p>
                        <ul className="list-disc list-inside space-y-1 ms-2">
                            <li>قم بنسخ البرومبت والصور بالترتيب باستخدام الزر بالأسفل.</li>
                            <li>الصق المحتوى في <a href="https://aistudio.google.com/prompts/new_chat" target="_blank" rel="noreferrer" className="text-primary hover:underline">Google AI Studio</a>.</li>
                            <li>قم بنسخ الرد، ويفضل حفظه أولاً في برنامج <strong>Obsidian</strong> لمراجعته.</li>
                            <li>بعد المراجعة، انتقل إلى <Link to="/coordination" className="text-primary hover:underline">قسم التنسيق</Link> لتنظيف النص.</li>
                        </ul>
                    </div>

                    <GuidedCopyLoop prompt={prompt} images={images} />

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
                            className={`flex-[2] py-3 rounded-xl text-sm font-bold transition-default ${
                                saved
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
