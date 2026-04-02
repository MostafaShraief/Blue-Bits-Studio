import { useState, useCallback } from 'react';
import WizardStepper from '../components/WizardStepper';
import PromptPreview from '../components/PromptPreview';
import GuidedCopyLoop from '../components/GuidedCopyLoop';
import ImageUploader from '../components/ImageUploader';
import PasteButton from '../components/PasteButton';
import { buildDrawingPrompt } from '../data/prompts';
import { createSession } from '../utils/api';

const STEPS = ['الإدراج', 'المعاينة والنسخ'];

export default function DrawWizard() {
    const [step, setStep] = useState(0);
    const [description, setDescription] = useState('');
    const [images, setImages] = useState([]); // { file, url, note }
    const [prompt, setPrompt] = useState('');
    const [saved, setSaved] = useState(false);

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

    const goNext = () => {
        const p = buildDrawingPrompt(description, images);
        setPrompt(p);
        setSaved(false);
        setStep(1);
    };

    const goBack = () => setStep(0);

    const handleSave = async () => {
        try {
            await createSession({
                materialName: 'رسم بياني',
                lectureNumber: '',
                lectureType: '',
                workflowType: 'draw',
                prompt,
                generalNotes: description,
                imageNotes: images.map((img) => ({ note: img.note })),
            });
            setSaved(true);
        } catch (e) {
            console.error("Failed to save session", e);
        }
    };

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
                        <h3 className="text-sm font-semibold text-text mb-3">الصور المرجعية (اختياري)</h3>
                        <ImageUploader
                            images={images}
                            onAdd={addImage}
                            onRemove={removeImage}
                            onNoteChange={updateImageNote}
                        />
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
                    <PromptPreview text={prompt} />
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
