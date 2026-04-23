import { useState, useCallback, useEffect, useContext } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router';
import WizardStepper from '../components/WizardStepper';
import ImageUploader from '../components/ImageUploader';
import PromptPreview from '../components/PromptPreview';
import GuidedCopyLoop from '../components/GuidedCopyLoop';
import PasteButton from '../components/PasteButton';
import PasteImageButton from '../components/PasteImageButton';
import MaterialAutocomplete from '../components/common/MaterialAutocomplete';
import { createSession, fetchSession } from '../utils/api';
import { useSettings } from '../contexts/SettingsContext';
import { AuthContext } from '../contexts/AuthContext';

const STEPS = ['التسمية', 'المدخلات', 'المعاينة والنسخ'];

export default function ExtractionWizard() {
    const [searchParams] = useSearchParams();
    const initialType = searchParams.get('type') === 'bank' ? 'bank' : 'lecture';
    const id = searchParams.get('id');
    const { autoSave } = useSettings();
    const { user, loading } = useContext(AuthContext);
    const navigate = useNavigate();

    // Permission checks - wait until auth is loaded
    const isAdmin = user?.role === 'Admin';
    const canDoLecture = user?.allowedWorkflows?.includes('LEC_EXT') ?? false;
    const canDoBank = user?.allowedWorkflows?.includes('BANK_EXT') ?? false;

    // Helper function to determine initial workflow code - must be defined before useState
    const getInitialWorkflowCode = () => {
        // Check if the requested type in URL is actually allowed
        if (initialType === 'bank' && canDoBank) return 'BANK_EXT';
        if (initialType === 'lecture' && canDoLecture) return 'LEC_EXT';
        // Fallback: prioritize the enabled workflow
        if (canDoLecture) return 'LEC_EXT';
        if (canDoBank) return 'BANK_EXT';
        return 'LEC_EXT'; // Default (will be blocked by useEffect above)
    };

    // Access control: redirect to 403 if both workflows are disabled and user is not admin
    // Only check after auth is loaded to avoid race condition
    useEffect(() => {
        if (loading) return; // Wait for auth to load
        if (!isAdmin && !canDoLecture && !canDoBank) {
            navigate('/403', { replace: true });
        }
    }, [loading, isAdmin, canDoLecture, canDoBank, navigate]);

    // Update workflow state after auth loads
    useEffect(() => {
        if (loading) return;
        setWorkflowSystemCode(getInitialWorkflowCode());
    }, [loading, canDoLecture, canDoBank]);

    // Initial state - default to LEC_EXT while loading, will be updated after auth loads
    const [step, setStep] = useState(0);

    // Step 1 — Naming
    const [workflowSystemCode, setWorkflowSystemCode] = useState(() => {
        if (loading) return 'LEC_EXT'; // Default while loading
        return getInitialWorkflowCode();
    });
    const [materialName, setMaterialName] = useState('');
    const [lectureNumber, setLectureNumber] = useState('');
    const [lectureType, setLectureType] = useState('Theoretical');

    // Step 2 — Images + Notes
    const [images, setImages] = useState([]); // { file, url, note }
    const [generalNotes, setGeneralNotes] = useState('');

    // Step 3 — Generated prompt
    const [prompt, setPrompt] = useState('');
    const [saved, setSaved] = useState(false);
    const [isLoadingPrompt, setIsLoadingPrompt] = useState(false);

    useEffect(() => {
        if (id) {
            fetchSession(id).then(data => {
                if (data) {
                    if (data.materialName) setMaterialName(data.materialName);
                    if (data.lectureNumber) setLectureNumber(data.lectureNumber);
                    if (data.lectureType) setLectureType(data.lectureType);
                    if (data.workflowType) setWorkflowSystemCode(data.workflowType);
                    if (data.compiledPrompt) setPrompt(data.compiledPrompt);
                    
                    const notes = data.notes?.filter(n => n.noteType === 'GeneralNote').map(n => n.noteText).join('\n') || '';
                    if (notes) setGeneralNotes(notes);
                    
                    if (data.files && data.files.length > 0) {
                        const loadedImages = data.files.map(img => ({
                            file: null,
                            url: '/uploads/' + img.localFilePath,
                            note: data.notes?.find(n => n.noteType === `FileNote` && n.fileId === img.fileId)?.noteText || ''
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
    }, [addImage, step]);

    /* ── Step transitions ───────────────── */
    const goNext = async () => {
        if (step === 1) {
            setIsLoadingPrompt(true);
            try {
                // 1) Prepare images
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

                // 2) Create session in DB to get SessionId
                const createdSession = await createSession({
                    materialName,
                    lectureNumber: parseInt(lectureNumber, 10),
                    lectureType,
                    workflowSystemCode,
                    generalNotes,
                    files: processedImages.map(img => ({ file: img.file, note: img.note }))
                });

                // 3) Fetch session to get compiled prompt
                const idToFetch = createdSession.sessionId || createdSession.id;
                const sessionData = await fetchSession(idToFetch);
                const finalPrompt = sessionData?.compiledPrompt || '';
                
                setPrompt(finalPrompt);
                setSaved(true);
            } catch (err) {
                console.error("Failed to generate prompt or save session", err);
                alert("Failed to generate prompt. Please try again.");
                setIsLoadingPrompt(false);
                return; // Stop step transition
            }
            setIsLoadingPrompt(false);
        }
        setStep((s) => Math.min(s + 1, STEPS.length - 1));
    };

    const goBack = () => setStep((s) => Math.max(s - 1, 0));

    /* ── Save session ───────────────────── */
    const handleSave = useCallback(async () => {
        // Session is now saved automatically during goNext.
    }, []);

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
                {workflowSystemCode === 'LEC_EXT' ? 'استخراج محاضرة' : 'استخراج بنك أسئلة'}
            </h1>
            <p className="text-sm text-text-secondary mb-6">
                معالج خطوة بخطوة لإنشاء البرومبت وتجهيز الصور
            </p>

            <WizardStepper steps={STEPS} current={step} />

            {/* ─── Step 1: Naming ─────────────────── */}
            {step === 0 && (
                <div className="space-y-5 animate-fade-slide-in">
                    {/* Workflow type toggle */}
                    <div data-tour="extraction-type" className="flex gap-3">
                        {[
                            { value: 'LEC_EXT', label: 'محاضرة', enabled: canDoLecture || isAdmin },
                            { value: 'BANK_EXT', label: 'بنك أسئلة', enabled: canDoBank || isAdmin },
                        ].filter(opt => opt.enabled).map(({ value, label }) => (
                            <button
                                key={value}
                                onClick={() => setWorkflowSystemCode(value)}
                                className={`flex-1 py-3 rounded-xl text-sm font-semibold border-2 transition-default ${workflowSystemCode === value
                                    ? 'border-primary bg-primary text-white'
                                    : 'border-border bg-surface-card text-text-secondary hover:border-primary/40'
                                    }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>

                    <div data-tour="extraction-metadata" className="space-y-5">
                        {/* Material Name */}
                        <MaterialAutocomplete value={materialName} onChange={setMaterialName} />

                        {/* Lecture Number */}
                        <div>
                            <label className="block text-sm font-medium text-text mb-1.5">رقم المحاضرة</label>
                            <input
                                type="number"
                                value={lectureNumber}
                                onChange={(e) => {
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
                        </div>

                        {/* Lecture Type */}
                        <div>
                            <label className="block text-sm font-medium text-text mb-1.5">نوع المحاضرة</label>
                            <div className="flex gap-3">
                                {[
                                    { value: 'Theoretical', label: 'نظري' },
                                    { value: 'Practical', label: 'عملي' },
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
                <div data-tour="extraction-images" className="space-y-6 animate-fade-slide-in">
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

            {/* ─── Step 3: Preview & Guided Copy ──── */}
            {step === 2 && (
                <div data-tour="extraction-preview" className="space-y-6 animate-fade-slide-in">
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