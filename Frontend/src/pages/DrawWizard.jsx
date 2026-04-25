import { useSearchParams } from 'react-router';
import { useEffect, useState, useCallback } from 'react';
import WizardStepper from '../components/WizardStepper';
import PromptPreview from '../components/PromptPreview';
import GuidedCopyLoop from '../components/GuidedCopyLoop';
import ImageUploader from '../components/ImageUploader';
import PasteButton from '../components/PasteButton';
import PasteImageButton from '../components/PasteImageButton';
import MaterialAutocomplete from '../components/common/MaterialAutocomplete';
import { createSession, fetchSession, compilePromptStateless } from '../utils/api';
import { useSettings } from '../contexts/SettingsContext';

const STEPS = ['التسمية', 'المدخلات', 'المعاينة والنسخ'];

export default function DrawWizard() {
    const [searchParams] = useSearchParams();
    const { autoSave, defaultMaterial } = useSettings();
    const id = searchParams.get('id');

    useEffect(() => {
        if (id) {
            fetchSession(id).then(data => {
                if (data) {
if (data.material && data.material.materialName) setMaterialName(data.material.materialName);
                    if (data.lectureNumber) setLectureNumber(data.lectureNumber);
                    if (data.lectureType) setLectureType(data.lectureType);
                    if (data.compiledPrompt) setPrompt(data.compiledPrompt);
                    setSessionId(data.id || data.sessionId || id);
                    const notes = data.notes?.filter(n => n.noteType === 'GeneralNote').map(n => n.noteText).join('\n') || '';
                    if (notes) setDescription(notes);

                    if (data.files && data.files.length > 0) {
                        const loadedImages = data.files.map(img => ({
                            file: null,
                            url: '/uploads/' + img.localFilePath,
                            note: data.notes?.find(n => n.noteType === 'FileNote' && n.fileId === img.fileId)?.noteText || ''
                        }));
                        setImages(loadedImages);
                    }
                    setSaved(true);
                    setStep(2);
                }
            });
        }
    }, [id]);

    const [step, setStep] = useState(0);
    const [materialName, setMaterialName] = useState(defaultMaterial || '');
    const [materialValid, setMaterialValid] = useState(false);
    const [lectureNumber, setLectureNumber] = useState(1);
    const [lectureType, setLectureType] = useState('Theoretical');
    const [sessionId, setSessionId] = useState(null);
    const [description, setDescription] = useState('');
    const [images, setImages] = useState([]); // { file, url, note }
    const [prompt, setPrompt] = useState('');
    const [saved, setSaved] = useState(false);
    const [isLoadingPrompt, setIsLoadingPrompt] = useState(false);

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
            if (step !== 1) return;
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
    }, [step, addImage]);

    const goNext = async () => {
        setIsLoadingPrompt(true);
        
        if (step === 0) {
            if (!materialValid || !lectureNumber || !lectureType) {
                alert('الرجاء اختيار مادة صالحة وإدخال جميع البيانات المطلوبة');
                setIsLoadingPrompt(false);
                return;
            }
            setStep(1);
            setIsLoadingPrompt(false);
            return;
        }

        if (step === 1) {
            try {
                const processedImages = await Promise.all(images.map(async (img, i) => {
                    if (!img.file && img.url) {
                        try {
                            const res = await fetch(img.url);
                            const blob = await res.blob();
                            const file = new File([blob], `image-${i}.png`, { type: blob.type || 'image/png' });
                            return { ...img, file };
                        } catch (err) {
                            return img;
                        }
                    }
                    return img;
                }));

                // Always create session to get an ID (handleSave will need it)
                const createdSession = await createSession({
                    materialId: null,
                    materialName,
                    lectureNumber: Number(lectureNumber),
                    lectureType,
                    workflowSystemCode: 'DRAW',
                    generalNotes: description,
                    files: processedImages.map(img => ({ file: img.file, note: img.note }))
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
                        systemCode: 'DRAW',
                        generalNotes: description,
                        fileNotes: processedImages.map(img => img.note || ''),
                    });
                    finalPrompt = res?.compiledPrompt || '';
                    setSaved(false);
                }

                setPrompt(finalPrompt);
                setStep(2);
            } catch (err) {
                console.error("Failed to generate prompt or save session", err);
                alert(err.message || "Failed to generate prompt. Please try again.");
            }
            setIsLoadingPrompt(false);
        }
    };

    const goBack = () => setStep(0);

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
            <div data-tour="draw-metadata">
                <h1 className="text-2xl font-bold text-text mb-2">الرسم بالذكاء الاصطناعي</h1>
                <p className="text-sm text-text-secondary mb-6">
                    أنشئ برومبت لتوليد أكواد Python للرسم البياني
                </p>
            </div>

            <WizardStepper steps={STEPS} current={step} />

            {/* Step 1: Naming */}
            {step === 0 && (
                <div className="space-y-5 animate-fade-slide-in">
                    <div className="bg-surface-card border border-border rounded-2xl p-5 space-y-4 mb-6">
                        <h3 className="text-sm font-semibold text-text mb-2">بيانات الجلسة</h3>
                        <MaterialAutocomplete value={materialName} onChange={setMaterialName} onValidChange={setMaterialValid} />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-text mb-1.5">رقم المحاضرة</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={lectureNumber}
                                    onChange={(e) => setLectureNumber(e.target.value)}
                                    className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-text focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text mb-1.5">نوع المحاضرة</label>
                                <select
                                    value={lectureType}
                                    onChange={(e) => setLectureType(e.target.value)}
                                    className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-text focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                >
                                    <option value="Theoretical">نظري</option>
                                    <option value="Practical">عملي</option>
                                    <option value="Summary">ملخص</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={goNext}
                        disabled={!materialValid || !lectureNumber}
                        className="w-full py-3 rounded-xl bg-primary text-white font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary-dark transition-default shadow-lg shadow-primary/25"
                    >
                        التالي
                    </button>
                </div>
            )}

            {/* Step 2: Inputs */}
            {step === 1 && (
                <div className="space-y-5 animate-fade-slide-in">
                    {/* Image upload (optional) */}
                    <div data-tour="draw-images">
                        <div className="flex items-center justify-between mb-3"><h3 className="text-sm font-semibold text-text">الصور المرجعية (اختياري)</h3><PasteImageButton onPasteImage={addImage} /></div>
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

                    {/* Description */}
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
                                        if (file) {
                                            addImage(file);
                                        }
                                    }
                                }
                                if (hasImage) e.preventDefault();
                            }}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="اكتب وصفاً تفصيلياً للمخطط أو الرسم البياني المطلوب..."
                            rows={6}
                            dir="auto"
                            className="w-full resize-none rounded-xl border border-border bg-surface-card px-4 py-3 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-default"
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
                            disabled={!description.trim() || isLoadingPrompt}
                            className="flex-[2] py-3 rounded-xl bg-primary text-white font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary-dark transition-default shadow-lg shadow-primary/25"
                        >
                            {isLoadingPrompt ? 'جاري التحضير...' : 'معاينة البرومبت'}
                        </button>
                    </div>
                </div>
            )}

            {/* Step 3: Preview & Guided Copy */}
            {step === 2 && (
                <div data-tour="draw-preview" className="space-y-6 animate-fade-slide-in">

                    {/* Image gallery */}
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
