import { useState, useCallback, useRef } from 'react';
import { ImagePlus, X } from 'lucide-react';
import WizardStepper from '../components/WizardStepper';
import PromptPreview from '../components/PromptPreview';
import GuidedCopyLoop from '../components/GuidedCopyLoop';
import { buildDrawingPrompt } from '../data/prompts';
import { createSession } from '../utils/api';

const STEPS = ['الإدراج', 'المعاينة والنسخ'];

export default function DrawWizard() {
    const [step, setStep] = useState(0);
    const [description, setDescription] = useState('');
    const [image, setImage] = useState(null); // { file, url }
    const [prompt, setPrompt] = useState('');
    const [saved, setSaved] = useState(false);
    const inputRef = useRef(null);

    const handleAddImage = (file) => {
        if (image) URL.revokeObjectURL(image.url);
        setImage({ file, url: URL.createObjectURL(file) });
    };

    const handleRemoveImage = () => {
        if (image) URL.revokeObjectURL(image.url);
        setImage(null);
    };

    const goNext = () => {
        const p = buildDrawingPrompt(description);
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
            });
            setSaved(true);
        } catch (e) {
            console.error("Failed to save session", e);
        }
    };

    const imagesForLoop = image ? [image] : [];

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
                        <label className="block text-sm font-medium text-text mb-2">صورة مرجعية (اختياري)</label>
                        {image ? (
                            <div className="relative inline-block">
                                <img
                                    src={image.url}
                                    alt="مرجع"
                                    className="max-h-48 rounded-xl border border-border object-contain"
                                />
                                <button
                                    onClick={handleRemoveImage}
                                    className="absolute -top-2 -left-2 bg-danger text-white rounded-full w-6 h-6 flex items-center justify-center shadow-lg hover:scale-110 transition-default"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        ) : (
                            <div
                                onClick={() => inputRef.current?.click()}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    const f = e.dataTransfer.files[0];
                                    if (f?.type.startsWith('image/')) handleAddImage(f);
                                }}
                                onDragOver={(e) => e.preventDefault()}
                                className="flex flex-col items-center justify-center gap-2 py-8 border-2 border-dashed border-primary/30 rounded-2xl cursor-pointer hover:border-primary hover:bg-primary-light/30 transition-default"
                            >
                                <ImagePlus size={32} className="text-primary" strokeWidth={1.5} />
                                <p className="text-sm text-text-secondary">اضغط أو اسحب صورة هنا</p>
                                <input
                                    ref={inputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                        const f = e.target.files[0];
                                        if (f) handleAddImage(f);
                                        e.target.value = '';
                                    }}
                                />
                            </div>
                        )}
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-text mb-1.5">وصف الرسم المطلوب</label>
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
                    <GuidedCopyLoop prompt={prompt} images={imagesForLoop} />

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
