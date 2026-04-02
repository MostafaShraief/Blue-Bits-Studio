import { useState, useCallback } from 'react';
import { Copy, ChevronRight, ChevronLeft, RotateCcw, ImageIcon, FileText } from 'lucide-react';

/**
 * Guided Copy Loop
 *
 * Cycles through:  Prompt → Image 1 → Image 2 → … → (back to Prompt)
 *
 * @param {{ prompt: string, images: { file: File, url: string }[] }} props
 */
export default function GuidedCopyLoop({ prompt, images = [] }) {
    // 0 = prompt, 1…N = images
    const totalSteps = 1 + images.length;
    const [step, setStep] = useState(0);
    const [copied, setCopied] = useState(false);

    const isPromptStep = step === 0;
    const imageIndex = step - 1; // only valid when step > 0

    /* ── Copy handler ─────────────────────── */
    const handleCopy = useCallback(async () => {
        try {
            if (isPromptStep) {
                await navigator.clipboard.writeText(prompt);
            } else {
                // Copy image as blob to clipboard
                const img = images[imageIndex];
                if (img?.file) {
                    const blob = img.file;
                    // If file type is supported for clipboard
                    const clipboardItem = new ClipboardItem({
                        [blob.type]: blob,
                    });
                    await navigator.clipboard.write([clipboardItem]);
                }
            }
            setCopied(true);
            setTimeout(() => setCopied(false), 1200);
        } catch (err) {
            // Fallback: copy text representation
            if (isPromptStep) {
                const ta = document.createElement('textarea');
                ta.value = prompt;
                document.body.appendChild(ta);
                ta.select();
                document.execCommand('copy');
                document.body.removeChild(ta);
                setCopied(true);
                setTimeout(() => setCopied(false), 1200);
            }
            console.error('GuidedCopyLoop: copy failed', err);
        }
    }, [step, prompt, images, isPromptStep, imageIndex]);

    const next = () => setStep((s) => (s + 1) % totalSteps);
    const prev = () => setStep((s) => (s - 1 + totalSteps) % totalSteps);
    const reset = () => setStep(0);

    /* ── Current label ─────────────────────── */
    const currentLabel = isPromptStep
        ? 'نسخ البرومبت'
        : `نسخ الصورة ${imageIndex + 1}`;

    const CurrentIcon = isPromptStep ? FileText : ImageIcon;

    return (
        <div className="bg-surface-card border border-border rounded-2xl p-5 space-y-4">
            {/* Step indicator */}
            <div className="flex items-center justify-between">
                <span className="text-xs text-text-muted">
                    الخطوة {step + 1} من {totalSteps}
                </span>
                <button
                    onClick={reset}
                    className="flex items-center gap-1 text-xs text-text-muted hover:text-primary transition-default"
                >
                    <RotateCcw size={14} />
                    إعادة
                </button>
            </div>

            {/* Current step card */}
            <div
                className={`flex flex-col items-center gap-3 py-6 rounded-xl border-2 border-dashed transition-default ${copied ? 'border-success bg-success-light' : 'border-primary/30 bg-primary-light/50'
                    }`}
            >
                <CurrentIcon
                    size={36}
                    className={copied ? 'text-success' : 'text-primary'}
                    strokeWidth={1.5}
                />
                <p className="text-sm font-semibold text-text">
                    {currentLabel}
                </p>

                {/* Preview: show image thumbnail when on image step */}
                {!isPromptStep && images[imageIndex] && (
                    <img
                        src={images[imageIndex].url}
                        alt={`صورة ${imageIndex + 1}`}
                        className="max-h-28 rounded-lg border border-border object-contain"
                    />
                )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
                <button
                    onClick={prev}
                    className="flex-1 flex items-center justify-center gap-1 py-2.5 rounded-xl border border-border text-sm text-text-secondary hover:bg-surface-hover transition-default"
                >
                    <ChevronRight size={16} />
                    السابق
                </button>

                <button
                    onClick={handleCopy}
                    className={`flex-[2] flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white transition-default ${copied
                            ? 'bg-success animate-copy-flash'
                            : 'bg-primary hover:bg-primary-dark shadow-lg shadow-primary/25'
                        }`}
                >
                    <Copy size={16} />
                    {copied ? 'تم النسخ ✓' : 'نسخ'}
                </button>

                <button
                    onClick={next}
                    className="flex-1 flex items-center justify-center gap-1 py-2.5 rounded-xl border border-border text-sm text-text-secondary hover:bg-surface-hover transition-default"
                >
                    التالي
                    <ChevronLeft size={16} />
                </button>
            </div>
        </div>
    );
}
