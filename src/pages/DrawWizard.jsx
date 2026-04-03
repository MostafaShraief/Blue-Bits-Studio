import { useSearchParams } from 'react-router';
import { useEffect, useState, useCallback } from 'react';
import WizardStepper from '../components/WizardStepper';
import PromptPreview from '../components/PromptPreview';
import GuidedCopyLoop from '../components/GuidedCopyLoop';
import ImageUploader from '../components/ImageUploader';
import PasteButton from '../components/PasteButton';
import PasteImageButton from '../components/PasteImageButton';
import { buildDrawingPrompt } from '../data/prompts';
import { createSession, fetchSession } from '../utils/api';
import { useSettings } from '../contexts/SettingsContext';

const STEPS = ['الإدراج', 'المعاينة والنسخ'];

export default function DrawWizard() {
    const [searchParams] = useSearchParams();
    const { autoSave } = useSettings();
    const id = searchParams.get('id');

    useEffect(() => {
        if (id) {
            fetchSession(id).then(data => {
                if (data) {
                    if (data.prompt && data.prompt.promptText) setPrompt(data.prompt.promptText);
                    const notes = data.notes?.filter(n => n.noteType === 'General').map(n => n.noteText).join('\n') || '';
                    if (notes) setDescription(notes);

                    if (data.images && data.images.length > 0) {
                        const loadedImages = data.images.map(img => ({
                            file: null,
                            url: 'http://localhost:5135/uploads/' + img.localFilePath,
                            note: data.notes?.find(n => n.noteType === `Image-${img.orderIndex}`)?.noteText || ''
                        }));
                        setImages(loadedImages);
                    }
                    setSaved(true);
                    setStep(1);
                }
            });
        }
    }, [id]);

    const [step, setStep] = useState(0);
    const [description, setDescription] = useState('');
    const [images, setImages] = useState([]); // { file, url, note }
    const [prompt, setPrompt] = useState('');
    const [saved, setSaved] = useState(false);

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
            if (step !== 0) return;
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

    const goNext = () => {
        const p = buildDrawingPrompt(description, images);
        setPrompt(p);
        setSaved(false);
        setStep(1);
    };

    const goBack = () => setStep(0);

    const handleSave = useCallback(async () => {
        if (saved) return;
        try {
            await createSession({
                materialName: 'رسم بياني',
                lectureNumber: '',
                lectureType: '',
                workflowType: 'draw',
                prompt,
                generalNotes: description,
                images,
                images,
                imageNotes: images.map((img) => ({ note: img.note })),
            });
            setSaved(true);
        } catch (e) {
            console.error("Failed to save session", e);
        }
    }, [saved, prompt, description, images]);

    /* ── Auto Save ──────────────────────── */
    useEffect(() => {
        if (step === 1 && autoSave && !saved && prompt) {
            handleSave();
        }
    }, [step, autoSave, saved, prompt, handleSave]);

    return (
        <div className="max-w-3xl mx-auto animate-fade-slide-in">
            <h1 className="text-2xl font-bold text-text mb-2">الرسم بالذكاء الاصطناعي</h1>
            <p className="text-sm text-text-secondary mb-6">
                أنشئ برومبت لتوليد أكواد Python للرسم البياني
            </p>

            <WizardStepper steps={STEPS} current={step} />

            {/* Step 1: Insertion */}
            {step === 0 && (
                <div className="space-y-5 animate-fade-slide-in">
                    {/* Image upload (optional) */}
                    <div>
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
                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <label className="block text-sm font-medium text-text">وصف الرسم المطلوب</label>
                            <PasteButton onPaste={(text) => setDescription(prev => (prev ? prev + '\n' + text : text))} />
                        </div>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="اكتب وصفاً تفصيلياً للمخطط أو الرسم البياني المطلوب..."
                            rows={6}
                            dir="auto"
                            className="w-full resize-none rounded-xl border border-border bg-surface-card px-4 py-3 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-default"
                        />
                    </div>

                    <button
                        onClick={goNext}
                        disabled={!description.trim()}
                        className="w-full py-3 rounded-xl bg-primary text-white font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary-dark transition-default shadow-lg shadow-primary/25"
                    >
                        معاينة البرومبت
                    </button>
                </div>
            )}

            {/* Step 2: Preview & Guided Copy */}
            {step === 1 && (
                <div className="space-y-6 animate-fade-slide-in">

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

                    <div className="bg-surface-card border border-border rounded-2xl p-5 text-sm text-text-secondary space-y-2">
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
