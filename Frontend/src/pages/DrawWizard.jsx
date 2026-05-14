import { useSearchParams } from 'react-router';
import { useEffect, useState, useCallback } from 'react';
import WizardStepper from '../components/WizardStepper';
import PromptPreview from '../components/PromptPreview';
import GuidedCopyLoop from '../components/GuidedCopyLoop';
import ImageUploader from '../components/ImageUploader';
import PasteButton from '../components/PasteButton';
import PasteImageButton from '../components/PasteImageButton';
import MaterialAutocomplete from '../components/common/MaterialAutocomplete';
import { useWizard } from '../hooks/useWizard';
import { compilePrompt } from '../api/PromptsApi';
import { getSession, createSession, uploadFiles } from '../api/SessionsApi';
import { useSettings } from '../contexts/SettingsContext';
import { useToast } from '../contexts/ToastContext';
import { ApiError, RateLimitError } from '../api/HttpClient';

const STEPS = ['البرومبت', 'النتيجة'];

export default function DrawWizard() {
    const [searchParams] = useSearchParams();
    const { autoSave, defaultMaterial } = useSettings();
    const { showToast } = useToast();
    const id = searchParams.get('id');

    const { currentStep, next, prev, goTo, setSessionId } = useWizard({ totalSteps: 2 });

    const [materialName, setMaterialName] = useState(defaultMaterial || '');
    const [materialValid, setMaterialValid] = useState(false);
    const [lectureNumber, setLectureNumber] = useState('');
    const [lectureType, setLectureType] = useState('');
    const [description, setDescription] = useState('');
    const [images, setImages] = useState([]);
    const [prompt, setPrompt] = useState('');
    const [saved, setSaved] = useState(false);
    const [isLoadingPrompt, setIsLoadingPrompt] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});
    const [restoring, setRestoring] = useState(!!id);

    useEffect(() => {
        if (!id) { setRestoring(false); return; }

        getSession(id)
            .then(data => {
                if (!data) return;
                if (data.material?.materialName) setMaterialName(data.material.materialName);
                if (data.lectureNumber) setLectureNumber(String(data.lectureNumber));
                if (data.lectureType) setLectureType(data.lectureType);
                if (data.compiledPrompt) setPrompt(data.compiledPrompt);
                setSessionId(data.id || data.sessionId || id);

                const notes = data.notes?.filter(n => n.noteType === 'GeneralNote').map(n => n.noteText).join('\n') || '';
                if (notes) setDescription(notes);

                if (data.files?.length > 0) {
                    const loadedImages = data.files.map(img => ({
                        file: null,
                        url: '/uploads/' + img.localFilePath,
                        note: data.notes?.find(n => n.noteType === 'FileNote' && n.fileId === img.fileId)?.noteText || '',
                    }));
                    setImages(loadedImages);
                }

                setSaved(true);
                goTo(1);
            })
            .catch(() => {})
            .finally(() => setRestoring(false));
    }, [id]);

    const addImage = useCallback((file) => {
        setImages((prev) => {
            if (prev.length >= 3) return prev;
            const url = URL.createObjectURL(file);
            return [...prev, { file, url, note: '' }];
        });
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
            if (currentStep !== 0) return;
            if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;
            const items = e.clipboardData?.items;
            if (!items) return;

            let pastedImage = false;
            for (let i = 0; i < items.length; i++) {
                if (items[i].type.startsWith('image/')) {
                    const file = items[i].getAsFile();
                    if (file) {
                        addImage(file);
                        pastedImage = true;
                    }
                }
            }

            if (pastedImage && !e.clipboardData.getData('text/plain') && ['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) {
                e.preventDefault();
            }
        };

        window.addEventListener('paste', handleGlobalPaste);
        return () => window.removeEventListener('paste', handleGlobalPaste);
    }, [currentStep, addImage]);

    const clearFieldError = (field) => {
        setFieldErrors((prev) => {
            if (!prev[field]) return prev;
            const next = { ...prev };
            delete next[field];
            return next;
        });
    };

    const handleNext = async () => {
        const errors = {};
        if (!materialValid) errors.materialname = 'الرجاء اختيار مادة صالحة';
        if (!lectureNumber) errors.lecturenumber = 'الرجاء إدخال رقم المحاضرة';
        if (!lectureType) errors.lecturetype = 'الرجاء اختيار نوع المحاضرة';
        if (!description.trim()) errors.description = 'الرجاء إدخال وصف الرسم';
        if (Object.keys(errors).length > 0) { setFieldErrors(errors); return; }

        setIsLoadingPrompt(true);
        setFieldErrors({});

        try {
            const processedImages = await Promise.all(
                images.map(async (img, i) => {
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
                }),
            );

            const createdSession = await createSession({
                materialId: null,
                materialName,
                lectureNumber: Number(lectureNumber),
                lectureType,
                workflowSystemCode: 'DRAW',
                generalNotes: description,
            });

            const idToFetch = createdSession.id || createdSession.sessionId;
            setSessionId(idToFetch);

            const filesToUpload = processedImages.filter(img => img.file);
            if (filesToUpload.length > 0) {
                await uploadFiles(
                    idToFetch,
                    filesToUpload.map(img => img.file),
                    filesToUpload.map(img => img.note || ''),
                );
            }

            let finalPrompt = '';

            if (autoSave) {
                const sessionData = await getSession(idToFetch);
                finalPrompt = sessionData?.compiledPrompt || '';
                setSaved(true);
            } else {
                const res = await compilePrompt('DRAW', description, processedImages.map(img => img.note || ''));
                finalPrompt = res?.compiledPrompt || '';
                setSaved(false);
            }

            setPrompt(finalPrompt);
            next();
        } catch (err) {
            if (err instanceof RateLimitError) {
                showToast(err.message, 'warning');
            } else if (err instanceof ApiError && err.status === 400 && err.errors) {
                const normalized = {};
                for (const [key, value] of Object.entries(err.errors)) {
                    normalized[key.toLowerCase()] = value;
                }
                setFieldErrors(normalized);
            } else {
                showToast(err.message || 'حدث خطأ غير متوقع', 'error');
            }
        }

        setIsLoadingPrompt(false);
    };

    const handleSave = useCallback(async () => {
        if (saved || !sessionId) return;
        try {
            await getSession(sessionId);
            setSaved(true);
        } catch (err) {
            showToast(err.message || 'فشل حفظ الجلسة', 'error');
        }
    }, [sessionId, saved, showToast]);

    if (restoring) return null;

    return (
        <div className="max-w-3xl mx-auto animate-fade-slide-in">
            <div data-tour="draw-metadata">
                <h1 className="text-2xl font-bold text-text mb-2">الرسم بالذكاء الاصطناعي</h1>
                <p className="text-sm text-text-secondary mb-6">
                    أنشئ برومبت لتوليد أكواد Python للرسم البياني
                </p>
            </div>

            <WizardStepper steps={STEPS} current={currentStep} />

            {currentStep === 0 && (
                <div className="space-y-5 animate-fade-slide-in">
                    <div className="bg-surface-card border border-border rounded-2xl p-5 space-y-4">
                        <h3 className="text-sm font-semibold text-text mb-2">بيانات الجلسة</h3>

                        <div>
                            <MaterialAutocomplete
                                value={materialName}
                                onChange={(v) => { setMaterialName(v); clearFieldError('materialname'); }}
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
                                placeholder="مثال: 5"
                                value={lectureNumber}
                                onChange={(e) => { setLectureNumber(e.target.value); clearFieldError('lecturenumber'); }}
                                className={`w-full rounded-xl border bg-surface-card px-4 py-3 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 transition-default ${fieldErrors.lecturenumber ? 'border-danger focus:ring-danger/30 focus:border-danger' : 'border-border focus:ring-primary/30 focus:border-primary'}`}
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

                    <div data-tour="draw-images">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-semibold text-text">الصور المرجعية (اختياري)</h3>
                            <PasteImageButton onPasteImage={addImage} />
                        </div>
                        <ImageUploader
                            images={images}
                            onAdd={addImage}
                            onRemove={removeImage}
                            onNoteChange={updateImageNote}
                            maxImages={3}
                        />
                        {images.length > 1 && (
                            <p className="text-xs font-bold text-amber-500 mt-2">
                                ملاحظة: إضافة أكثر من صورة قد يؤثر سلبًا على جودة ودقة الرسم المستخرج.
                            </p>
                        )}
                        {images.length >= 3 && (
                            <p className="text-xs text-red-500 mt-1 font-bold">
                                لقد وصلت للحد الأقصى للصور (3 صور). لا يمكنك إضافة المزيد.
                            </p>
                        )}
                    </div>

                    <div data-tour="draw-description">
                        <div className="flex items-center justify-between mb-1.5">
                            <label className="block text-sm font-medium text-text">وصف الرسم المطلوب</label>
                            <PasteButton onPaste={(text) => setDescription(prev => (prev ? prev + '\n' + text : text))} />
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
                            value={description}
                            onChange={(e) => { setDescription(e.target.value); clearFieldError('description'); }}
                            placeholder="اكتب وصفاً تفصيلياً للمخطط أو الرسم البياني المطلوب..."
                            rows={6}
                            dir="auto"
                            className={`w-full resize-none rounded-xl border bg-surface-card px-4 py-3 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 transition-default ${fieldErrors.description ? 'border-danger focus:ring-danger/30 focus:border-danger' : 'border-border focus:ring-primary/30 focus:border-primary'}`}
                        />
                        {fieldErrors.description && (
                            <p className="text-xs text-danger mt-1">{fieldErrors.description}</p>
                        )}
                    </div>

                    <button
                        onClick={handleNext}
                        disabled={!description.trim() || isLoadingPrompt}
                        className="w-full py-3 rounded-xl bg-primary text-white font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary-dark transition-default shadow-lg shadow-primary/25"
                    >
                        {isLoadingPrompt ? 'جاري التحضير...' : 'توليد البرومبت'}
                    </button>
                </div>
            )}

            {currentStep === 1 && (
                <div data-tour="draw-preview" className="space-y-6 animate-fade-slide-in">
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

                    <PromptPreview text={prompt} />

                    <div className="vscode-step-fallback bg-surface-card border border-border rounded-2xl p-5 text-sm text-text-secondary space-y-2">
                        <p><strong>خطوات التنفيذ:</strong></p>
                        <ol className="list-decimal list-inside space-y-1">
                            <li>افتح <a href="https://aistudio.google.com/prompts/new_chat" target="_blank" rel="noreferrer" className="text-primary hover:underline">Google AI Studio</a>.</li>
                            <li>قم بلصق البرومبت (والصور إن وجدت) في حقل الإدخال.</li>
                            <li>قم بتشغيل الكود المستخرج في <strong>VS Code</strong> لرؤية النتيجة كصورة وحفظها.</li>
                        </ol>
                    </div>

                    <GuidedCopyLoop prompt={prompt} images={images} />

                    <div className="flex gap-3">
                        <button
                            onClick={prev}
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
