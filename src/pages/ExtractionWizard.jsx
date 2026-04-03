import { useState, useCallback, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router';
import WizardStepper from '../components/WizardStepper';
import ImageUploader from '../components/ImageUploader';
import PromptPreview from '../components/PromptPreview';
import GuidedCopyLoop from '../components/GuidedCopyLoop';
import PasteButton from '../components/PasteButton';
import PasteImageButton from '../components/PasteImageButton';
import { buildExtractionPrompt } from '../data/prompts';
import { createSession, fetchSession } from '../utils/api';
import { useSettings } from '../contexts/SettingsContext';

const STEPS = ['التسمية', 'المدخلات', 'المعاينة والنسخ'];

export default function ExtractionWizard() {
    const [searchParams] = useSearchParams();
    const initialType = searchParams.get('type') === 'bank' ? 'bank' : 'lecture';
    const id = searchParams.get('id');
    const { autoSave } = useSettings();

    const [step, setStep] = useState(0);

    // Step 1 — Naming
    const [workflowType, setWorkflowType] = useState(initialType);
    const [materialName, setMaterialName] = useState('');
    const [lectureNumber, setLectureNumber] = useState('');
    const [lectureType, setLectureType] = useState('theoretical');

    // Step 2 — Images + Notes
    const [images, setImages] = useState([]); // { file, url, note }
    const [generalNotes, setGeneralNotes] = useState('');

    // Step 3 — Generated prompt
    const [prompt, setPrompt] = useState('');
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        if (id) {
            fetchSession(id).then(data => {
                if (data) {
                    if (data.materialName) setMaterialName(data.materialName);
                    if (data.lectureNumber) setLectureNumber(data.lectureNumber);
                    if (data.lectureType) setLectureType(data.lectureType);
                    if (data.workflowType) setWorkflowType(data.workflowType);
                    if (data.prompt && data.prompt.promptText) setPrompt(data.prompt.promptText);
                    
                    const notes = data.notes?.filter(n => n.noteType === 'General').map(n => n.noteText).join('\n') || '';
                    if (notes) setGeneralNotes(notes);
                    
                    if (data.images && data.images.length > 0) {
                        const loadedImages = data.images.map(img => ({
                            file: null,
                            url: 'http://localhost:5135/uploads/' + img.localFilePath,
                            note: data.notes?.find(n => n.noteType === `Image-${img.orderIndex}`)?.noteText || ''
                        }));
                        setImages(loadedImages);
                    }
                    setSaved(true);
                    setStep(STEPS.length - 1);
                }
            });
        }
    }, [id]);

    /* ── Image handlers ─────────────────── */
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

    /* ── Global Paste Handler ────────────── */
    useEffect(() => {
        const handleGlobalPaste = (e) => {
            if (step !== 1) return;
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
    }, [addImage]);

    /* ── Step transitions ───────────────── */
    const goNext = () => {
        if (step === 1) {
            // Build prompt when moving to step 3
            const built = buildExtractionPrompt(
                workflowType,
                { materialName, lectureNumber, lectureType },
                images,
                generalNotes,
            );
            setPrompt(built);
            setSaved(false);
        }
        setStep((s) => Math.min(s + 1, STEPS.length - 1));
    };

    const goBack = () => setStep((s) => Math.max(s - 1, 0));

    /* ── Save session ───────────────────── */
    const handleSave = useCallback(async () => {
        if (saved) return;
        try {
            await createSession({
                materialName,
                lectureNumber,
                lectureType,
                workflowType,
                prompt,
                generalNotes,
                images,
                images,
                imageNotes: images.map((img) => ({ note: img.note })),
            });
            setSaved(true);
        } catch (e) {
            console.error("Failed to save session", e);
        }
    }, [materialName, lectureNumber, lectureType, workflowType, prompt, generalNotes, images, saved]);

    /* ── Auto Save ──────────────────────── */
    useEffect(() => {
        if (step === 2 && autoSave && !saved && prompt) {
            handleSave();
        }
    }, [step, autoSave, saved, prompt, handleSave]);

    const canProceedStep1 = materialName.trim() && lectureNumber.trim();

    return (
        <div className="max-w-3xl mx-auto animate-fade-slide-in">
            {/* Title */}
            <h1 className="text-2xl font-bold text-text mb-2">
                {workflowType === 'lecture' ? 'استخراج محاضرة' : 'استخراج بنك أسئلة'}
            </h1>
            <p className="text-sm text-text-secondary mb-6">
                معالج خطوة بخطوة لإنشاء البرومبت وتجهيز الصور
            </p>

            <WizardStepper steps={STEPS} current={step} />

            {/* ─── Step 1: Naming ─────────────────── */}
            {step === 0 && (
                <div className="space-y-5 animate-fade-slide-in">
                    {/* Workflow type toggle */}
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

                    {/* Material Name */}
                    <div>
                        <label className="block text-sm font-medium text-text mb-1.5">اسم المادة</label>
                        <input
                            type="text"
                            value={materialName}
                            onChange={(e) => setMaterialName(e.target.value)}
                            placeholder="مثال: قواعد البيانات"
                            className="w-full rounded-xl border border-border bg-surface-card px-4 py-3 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-default"
                        />
                    </div>

                    {/* Lecture Number */}
                    <div>
                        <label className="block text-sm font-medium text-text mb-1.5">رقم المحاضرة</label>
                        <input
                            type="number"
                            value={lectureNumber}
                            onChange={(e) => setLectureNumber(e.target.value)}
                            placeholder="مثال: 5"
                            className="w-full rounded-xl border border-border bg-surface-card px-4 py-3 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-default"
                        />
                    </div>

                    {/* Lecture Type */}
                    <div>
                        <label className="block text-sm font-medium text-text mb-1.5">نوع المحاضرة</label>
                        <div className="flex gap-3">
                            {[
                                { value: 'theoretical', label: 'نظري' },
                                { value: 'practical', label: 'عملي' },
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

            {/* ─── Step 2: Inputs ─────────────────── */}
            {step === 1 && (
                <div className="space-y-6 animate-fade-slide-in">
                    {/* Images */}
                    <div>
                        <div className="flex items-center justify-between mb-3"><h3 className="text-sm font-semibold text-text">الصور وملاحظات الصور</h3><PasteImageButton onPasteImage={addImage} /></div>
                        <ImageUploader
                            images={images}
                            onAdd={addImage}
                            onRemove={removeImage}
                            onNoteChange={updateImageNote}
                        />
                    </div>

                    {/* General Notes */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-semibold text-text">ملاحظات عامة</h3>
                            <PasteButton onPaste={(text) => setGeneralNotes(prev => (prev ? prev + '\n' + text : text))} />
                        </div>
                        <textarea
                            value={generalNotes}
                            onChange={(e) => setGeneralNotes(e.target.value)}
                            placeholder="أضف ملاحظات عامة للمحاضرة... (اختياري) أو اضغط Ctrl+V للصق من الحافظة مباشرة"
                            rows={4}
                            className="w-full resize-none rounded-xl border border-border bg-surface-card px-4 py-3 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-default"
                        />
                    </div>

                    {/* Navigation */}
                    <div className="flex gap-3">
                        <button
                            onClick={goBack}
                            className="flex-1 py-3 rounded-xl border border-border text-sm font-medium text-text-secondary hover:bg-surface-hover transition-default"
                        >
                            رجوع
                        </button>
                        <button
                            onClick={goNext}
                            className="flex-[2] py-3 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary-dark transition-default shadow-lg shadow-primary/25"
                        >
                            معاينة البرومبت
                        </button>
                    </div>
                </div>
            )}

            {/* ─── Step 3: Preview & Guided Copy ──── */}
            {step === 2 && (
                <div className="space-y-6 animate-fade-slide-in">
                    {/* PRD Clarification Text */}
                    <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 text-sm text-text-secondary">
                        <p className="mb-2 font-bold text-primary">خطوات العمل:</p>
                        <ul className="list-disc list-inside space-y-1 ms-2">
                            <li>قم بنسخ البرومبت والصور بالترتيب باستخدام الزر بالأسفل.</li>
                            <li>الصق المحتوى في <a href="https://aistudio.google.com/prompts/new_chat" target="_blank" rel="noreferrer" className="text-primary hover:underline">Google AI Studio</a>.</li>
                            <li>قم بنسخ الرد، ويفضل حفظه أولاً في برنامج <strong>Obsidian</strong> لمراجعته.</li>
                            <li>بعد المراجعة، انتقل إلى <Link to="/coordination" className="text-primary hover:underline">قسم التنسيق</Link> لتنظيف النص.</li>
                        </ul>
                    </div>

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

                    {/* Prompt preview */}
                    <div>
                        <h3 className="text-sm font-semibold text-text mb-3">البرومبت النهائي</h3>
                        <PromptPreview text={prompt} />
                    </div>

                    {/* Guided Copy Loop */}
                    <GuidedCopyLoop prompt={prompt} images={images} />

                    {/* Save + Back */}
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