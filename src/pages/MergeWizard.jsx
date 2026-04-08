import { useState, useRef } from 'react';
import { Layers, Upload, Loader2, File, Download, ArrowUp, ArrowDown, X, CheckCircle2 } from 'lucide-react';
import WizardStepper from '../components/WizardStepper';
import { mergeDocxFiles, createSession } from '../utils/api';

const STEPS = ['التسمية', 'تحميل الملفات (بالترتيب)', 'الدمج والنتيجة'];

export default function MergeWizard() {
    const [step, setStep] = useState(0);
    const fileInputRef = useRef(null);

    const [materialName, setMaterialName] = useState('');
    const [finalFileName, setFinalFileName] = useState('');
    const [lectureType, setLectureType] = useState('theoretical');

    const [files, setFiles] = useState([]);

    const [status, setStatus] = useState('idle'); // idle, loading, success, error
    const [downloadUrl, setDownloadUrl] = useState(null);

    const canProceedStep1 = materialName.trim() && finalFileName.trim();
    const canProceedStep2 = files.length > 1;

    const goNext = () => setStep((s) => Math.min(s + 1, 2));
    const goPrev = () => setStep((s) => Math.max(s - 1, 0));

    const handleFileSelect = (e) => {
        if (!e.target.files) return;
        const newFiles = Array.from(e.target.files).filter(f => f.name.endsWith('.docx'));
        setFiles(prev => [...prev, ...newFiles]);
        e.target.value = null; // reset
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

    const handleMerge = async () => {
        try {
            setStatus('loading');
            
            // Generate merged docx
            const blob = await mergeDocxFiles(files, { materialName, type: lectureType });
            
            // Create object URL
            const url = URL.createObjectURL(blob);
            setDownloadUrl(url);
            
            // Save session
            await createSession({
                materialName: materialName,
                lectureNumber: '1',
                lectureType: lectureType,
                workflowType: 'merge',
                prompt: 'Merged files: ' + files.map(f => f.name).join(', ')
            });

            setStatus('success');
        } catch (error) {
            console.error('Merge failed:', error);
            setStatus('error');
        }
    };

    return (
        <div className="flex flex-col h-full bg-background font-sans" dir="rtl">
            {/* Header */}
            <header className="flex items-center gap-4 px-6 py-5 border-b border-white/5 shrink-0 bg-surface/50">
                <div className="w-10 h-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center">
                    <Layers size={24} />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-white">دمج الملفات</h1>
                    <p className="text-sm text-white/50">دمج عدة ملفات Word معاً بالترتيب الصحيح</p>
                </div>
            </header>

            {/* Stepper */}
            <div className="px-6 py-4 border-b border-white/5 bg-surface/30">
                <div className="max-w-2xl mx-auto">
                    <WizardStepper steps={STEPS} currentStep={step} />
                </div>
            </div>

            {/* Main Content */}
            <main className="flex-1 overflow-auto p-6">
                <div className="max-w-3xl mx-auto min-h-full flex flex-col">
                    <div className="bg-surface border border-white/5 rounded-2xl p-6 flex-1 flex flex-col shadow-xl">
                        
                        {/* STEP 0: Naming */}
                        {step === 0 && (
                            <div className="flex-1 animate-fade-in flex flex-col gap-6">
                                <div className="space-y-1">
                                    <h2 className="text-lg font-bold text-white">معلومات الملف</h2>
                                    <p className="text-sm text-white/50">أدخل اسم المادة واسم الملف النهائي للدمج</p>
                                </div>
                                <div className="grid gap-6 mt-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-white/70">اسم المادة</label>
                                        <input
                                            type="text"
                                            value={materialName}
                                            onChange={e => {
                                                setMaterialName(e.target.value);
                                                if (!finalFileName || finalFileName === materialName) {
                                                    setFinalFileName(e.target.value);
                                                }
                                            }}
                                            placeholder="مثال: باطنة 1"
                                            className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-white/70">اسم الملف النهائي</label>
                                        <input
                                            type="text"
                                            value={finalFileName}
                                            onChange={e => setFinalFileName(e.target.value)}
                                            placeholder="اسم الملف بعد الدمج"
                                            className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                                        />
                                    </div>
                                    <div className="space-y-3 pt-2 border-t border-white/5">
                                        <label className="text-sm font-medium text-white/70">النوع</label>
                                        <div className="flex gap-4">
                                            <label className="flex items-center gap-2 cursor-pointer group">
                                                <div className="relative flex items-center justify-center">
                                                    <input 
                                                        type="radio" 
                                                        name="type" 
                                                        checked={lectureType === 'theoretical'}
                                                        onChange={() => setLectureType('theoretical')}
                                                        className="peer sr-only"
                                                    />
                                                    <div className="w-5 h-5 rounded-full border-2 border-white/20 peer-checked:border-primary transition-colors"></div>
                                                    <div className="absolute w-2.5 h-2.5 rounded-full bg-primary opacity-0 peer-checked:opacity-100 transition-opacity"></div>
                                                </div>
                                                <span className="text-white/80 group-hover:text-white transition-colors">نظري</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer group">
                                                <div className="relative flex items-center justify-center">
                                                    <input 
                                                        type="radio" 
                                                        name="type" 
                                                        checked={lectureType === 'practical'}
                                                        onChange={() => setLectureType('practical')}
                                                        className="peer sr-only"
                                                    />
                                                    <div className="w-5 h-5 rounded-full border-2 border-white/20 peer-checked:border-primary transition-colors"></div>
                                                    <div className="absolute w-2.5 h-2.5 rounded-full bg-primary opacity-0 peer-checked:opacity-100 transition-opacity"></div>
                                                </div>
                                                <span className="text-white/80 group-hover:text-white transition-colors">عملي</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 1: Upload & Reorder */}
                        {step === 1 && (
                            <div className="flex-1 animate-fade-in flex flex-col gap-4">
                                <div className="space-y-1 mb-2">
                                    <h2 className="text-lg font-bold text-white">ترتيب الملفات</h2>
                                    <p className="text-sm text-white/50">قم بتحميل الملفات ورتبها حسب الرغبة (الأول في الأعلى)</p>
                                </div>
                                
                                <div className="flex-1 flex flex-col gap-4 min-h-0">
                                    {files.length === 0 ? (
                                        <div 
                                            className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-xl bg-background/50 hover:bg-background/80 transition-colors cursor-pointer group"
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-white/40 group-hover:text-primary group-hover:scale-110 transition-all mb-4">
                                                <Upload size={32} />
                                            </div>
                                            <h3 className="text-lg font-medium text-white mb-1">اضغط لاختيار ملفات Word</h3>
                                            <p className="text-sm text-white/40">صيغة .docx فقط</p>
                                        </div>
                                    ) : (
                                        <div className="flex-1 overflow-y-auto bg-background/30 rounded-xl border border-white/5 p-2 space-y-2">
                                            {files.map((file, index) => (
                                                <div 
                                                    key={`${file.name}-${index}`} 
                                                    className="flex items-center gap-4 bg-surface p-3 rounded-lg border border-white/5 shadow-sm group hover:border-white/10 transition-colors"
                                                >
                                                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                                        <span className="text-xs font-bold text-primary">{index + 1}</span>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <File size={14} className="text-white/40" />
                                                            <span className="text-sm font-medium text-white truncate" dir="ltr">{file.name}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-1 shrink-0">
                                                        <button 
                                                            className={`p-1.5 rounded-md transition-colors ${index === 0 ? 'text-white/10 cursor-not-allowed' : 'text-white/40 hover:bg-white/10 hover:text-white'}`}
                                                            onClick={() => moveFile(index, -1)}
                                                            disabled={index === 0}
                                                            title="تحريك لأعلى"
                                                        >
                                                            <ArrowUp size={16} />
                                                        </button>
                                                        <button 
                                                            className={`p-1.5 rounded-md transition-colors ${index === files.length - 1 ? 'text-white/10 cursor-not-allowed' : 'text-white/40 hover:bg-white/10 hover:text-white'}`}
                                                            onClick={() => moveFile(index, 1)}
                                                            disabled={index === files.length - 1}
                                                            title="تحريك لأسفل"
                                                        >
                                                            <ArrowDown size={16} />
                                                        </button>
                                                        <div className="w-px h-4 bg-white/10 mx-1"></div>
                                                        <button 
                                                            className="p-1.5 rounded-md text-white/40 hover:bg-danger/20 hover:text-danger transition-colors"
                                                            onClick={() => removeFile(index)}
                                                            title="حذف"
                                                        >
                                                            <X size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    
                                    {files.length > 0 && (
                                        <button 
                                            className="w-full py-3 rounded-xl border border-white/10 bg-background hover:bg-white/5 text-white flex items-center justify-center gap-2 transition-colors border-dashed"
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            <Upload size={18} className="text-white/50" />
                                            <span>إضافة المزيد من الملفات</span>
                                        </button>
                                    )}
                                </div>
                                
                                <input
                                    type="file"
                                    multiple
                                    accept=".docx"
                                    ref={fileInputRef}
                                    className="hidden"
                                    onChange={handleFileSelect}
                                />
                            </div>
                        )}

                        {/* STEP 2: Execution */}
                        {step === 2 && (
                            <div className="flex-1 animate-fade-in flex flex-col items-center justify-center p-8 text-center">
                                {status === 'idle' && (
                                    <>
                                        <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6">
                                            <Layers size={40} />
                                        </div>
                                        <h2 className="text-2xl font-bold text-white mb-2">جاهز للدمج</h2>
                                        <p className="text-white/50 mb-8 max-w-md">
                                            سيتم دمج {files.length} ملفات معاً باستخدام المنهجية المحددة. قد تستغرق هذه العملية عدة ثوانٍ.
                                        </p>
                                        <button
                                            onClick={handleMerge}
                                            className="px-8 py-3.5 bg-primary text-white rounded-xl hover:bg-primary-hover shadow-lg shadow-primary/20 font-medium transition-all hover:-translate-y-0.5 active:translate-y-0 text-lg flex items-center gap-2"
                                        >
                                            <Layers size={20} />
                                            <span>بدء الدمج</span>
                                        </button>
                                    </>
                                )}

                                {status === 'loading' && (
                                    <div className="flex flex-col items-center gap-4 animate-pulse-slow">
                                        <Loader2 size={48} className="text-primary animate-spin" />
                                        <div className="text-lg font-medium text-white">جاري دمج الملفات...</div>
                                        <p className="text-sm text-white/50">يرجى الانتظار، تتم معالجة {files.length} ملفات</p>
                                    </div>
                                )}

                                {status === 'success' && downloadUrl && (
                                    <div className="flex flex-col items-center gap-6 animate-fade-in">
                                        <div className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center text-success animate-scale-in">
                                            <CheckCircle2 size={40} />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-bold text-white mb-2">تم الدمج بنجاح!</h2>
                                            <p className="text-white/50">الملف جاهز للتحميل الآن</p>
                                        </div>
                                        <a
                                            href={downloadUrl}
                                            download={`${finalFileName}.docx`}
                                            className="flex items-center gap-3 px-8 py-4 bg-success hover:bg-success/90 text-white rounded-xl font-medium transition-all shadow-lg shadow-success/20 hover:-translate-y-1"
                                        >
                                            <Download size={20} />
                                            <span>تحميل الملف المدمج</span>
                                        </a>
                                        <button
                                            onClick={() => {
                                                setStep(0);
                                                setFiles([]);
                                                setStatus('idle');
                                                setDownloadUrl(null);
                                            }}
                                            className="text-white/50 hover:text-white underline underline-offset-4 text-sm mt-4"
                                        >
                                            دمج ملفات أخرى
                                        </button>
                                    </div>
                                )}

                                {status === 'error' && (
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="w-16 h-16 rounded-full bg-danger/20 flex items-center justify-center text-danger">
                                            <X size={32} />
                                        </div>
                                        <div className="text-lg font-bold text-white">حدث خطأ أثناء الدمج</div>
                                        <p className="text-sm text-white/50">يرجى المحاولة مرة أخرى</p>
                                        <button
                                            onClick={() => setStatus('idle')}
                                            className="mt-4 px-6 py-2 bg-surface text-white rounded-lg hover:bg-white/5 border border-white/10"
                                        >
                                            رجوع
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Navigation Footer */}
                        <div className="mt-auto pt-6 flex items-center justify-between border-t border-white/5">
                            {step > 0 && status === 'idle' ? (
                                <button
                                    onClick={goPrev}
                                    className="px-5 py-2.5 text-sm font-medium text-white/70 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                                >
                                    السابق
                                </button>
                            ) : <div></div>}

                            {step < 2 ? (
                                <button
                                    onClick={goNext}
                                    disabled={(step === 0 && !canProceedStep1) || (step === 1 && !canProceedStep2)}
                                    className="px-6 py-2.5 bg-white text-black hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-medium transition-all shadow-lg"
                                >
                                    التالي
                                </button>
                            ) : null}
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
}