import { useState, useRef, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router';
import {
  FileJson,
  Upload,
  Eye,
  CheckCircle2,
  AlertCircle,
  Clipboard,
  RotateCcw,
  Send,
  Wand2,
  Download,
  ArrowLeft,
  ExternalLink,
  Trash2,
  Plus,
  Save
} from 'lucide-react';
import WizardStepper from '../components/WizardStepper';
import { PROMPTS } from '../data/prompts';
import { saveQuizSession, fetchSession } from '../utils/api';

const STEPS = ['القائمة', 'برومبت الأسئلة', 'محرر JSON'];

export default function QuizHub() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const fileInputRef = useRef(null);

  const [formQuizData, setFormQuizData] = useState([]);
  const [currentFile, setCurrentFile] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [sessionId, setSessionId] = useState(null);

  // Load session from URL param on mount
  useEffect(() => {
    const id = searchParams.get('id');
    if (id) {
      loadSession(id);
    }
  }, [searchParams]);

  const loadSession = async (id) => {
    try {
      const session = await fetchSession(id);
      if (session && session.quizData) {
        const quizArray = typeof session.quizData === 'string' 
          ? JSON.parse(session.quizData) 
          : session.quizData;
        setFormQuizData(quizArray.map(q => ({ ...q })));
        setCurrentFile(session.materialName || 'بنك محفوظ');
        setSessionId(id);
        setHasUnsavedChanges(false);
        // Go to step 2 (JSON Editor)
        setStep(2);
      }
    } catch (err) {
      console.error('Failed to load session:', err);
    }
  };

  // Track unsaved changes
  useEffect(() => {
    if (formQuizData.length > 0 && step === 2) {
      setHasUnsavedChanges(true);
    }
  }, [formQuizData, step]);

  // beforeunload warning
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Handle navigation attempt
  const handleNavigateAway = () => {
    if (!hasUnsavedChanges) return true;
    
    const userChoice = window.confirm(
      'لديك تغييرات غير محفوظة. هل تريد المتابعة بدون حفظ؟\n\nاضغط "موافق" لتجاهل التغييرات أو "إلغاء" للبقاء.'
    );
    
    if (userChoice) {
      setHasUnsavedChanges(false);
      return true;
    }
    return false;
  };

  const handleSaveSession = async () => {
    if (formQuizData.length === 0) {
      alert('لا توجد أسئلة لحفظها');
      return;
    }

    setIsSaving(true);
    try {
      const result = await saveQuizSession({
        id: sessionId || undefined,
        materialName: currentFile || 'بنك أسئلة',
        quizData: formQuizData,
        workflowType: 'quiz'
      });
      
      setSessionId(result.id);
      setHasUnsavedChanges(false);
      alert(sessionId ? 'تم تحديث البنك بنجاح!' : 'تم حفظ البنك بنجاح!');
    } catch (err) {
      console.error('Failed to save session:', err);
      alert('فشل في حفظ البنك. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsSaving(false);
    }
  };

  // Viewer/Quiz mode state
  const [viewMode, setViewMode] = useState('preview'); // preview | quiz
  const [answers, setAnswers] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [addCount, setAddCount] = useState(1);

  const goNext = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const goBack = () => setStep((s) => Math.max(s - 1, 0));

  const goToStep = (newStep) => {
    setStep(newStep);
  };

  const safeParseQuizArray = (value) => {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) throw new Error('الملف لا يحتوي على مصفوفة JSON');
    return parsed;
  };

  const setQuizFromArray = (arr, fileName = null) => {
    setCurrentFile(fileName);
    setAnswers({});
    setIsSubmitted(false);
    setFormQuizData(arr.map((q) => ({ ...q })));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const arr = safeParseQuizArray(event.target.result);
        setQuizFromArray(arr, file.name);
      } catch (err) {
        alert('خطأ في قراءة ملف JSON');
      }
    };
    reader.readAsText(file);
  };

  const handleAnswer = (qIndex, oIndex) => {
    if (isSubmitted) return;
    setAnswers((prev) => ({ ...prev, [qIndex]: [oIndex] }));
  };

  const calculateScore = () => {
    let correct = 0;
    formQuizData.forEach((q, i) => {
      if (answers[i] && Array.isArray(q.correct_options) && q.correct_options.includes(answers[i][0])) {
        correct++;
      }
    });
    return { correct, total: formQuizData.length };
  };

  const copyTextOrAlert = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('تم النسخ إلى الحافظة');
    } catch {
      alert('تعذر النسخ تلقائياً. انسخ يدوياً من النص.');
    }
  };

  const copyToClipboard = () => {
    const text = formQuizData
      .map((q) => {
        const options = (q.options || [])
          .map((opt, oi) => `${String.fromCharCode(65 + oi)}) ${opt}`)
          .join('\n');
        const correct = (q.correct_options || []).map((idx) => (q.options || [])[idx]).join(', ');
        return `Q: ${q.question}\n${options}\nCorrect: ${correct}\nExpl: ${q.explanation || 'N/A'}\n`;
      })
      .join('\n---\n\n');

    copyTextOrAlert(text);
  };

  const downloadJson = () => {
    const text = JSON.stringify(formQuizData, null, 2);
    const blob = new Blob([text], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = (currentFile ? currentFile.replace('.json', '') : 'quiz') + '_edited.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const syncQuizData = (data) => {
    setFormQuizData(data);
  };

  const updateFormField = (qIdx, field, value) => {
    const updated = [...formQuizData];
    updated[qIdx] = { ...updated[qIdx], [field]: value };
    syncQuizData(updated);
  };

  const updateOption = (qIdx, oIdx, value) => {
    const updated = [...formQuizData];
    const opts = [...(updated[qIdx].options || [])];
    opts[oIdx] = value;
    updated[qIdx] = { ...updated[qIdx], options: opts };
    syncQuizData(updated);
  };

  const setCorrectOption = (qIdx, oIdx) => {
    const updated = [...formQuizData];
    updated[qIdx] = { ...updated[qIdx], correct_options: [oIdx] };
    syncQuizData(updated);
  };

  const handleAddQuestions = () => {
    const newQs = Array.from({ length: addCount }, () => ({
      type: 'mcq',
      question: '',
      options: ['', '', '', ''],
      correct_options: [],
      explanation: ''
    }));
    const updated = [...formQuizData, ...newQs];
    syncQuizData(updated);

    // Scroll to the bottom of the page to show new questions
    setTimeout(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }, 100);
  };

  const removeQuestion = (qIdx) => {
    const updated = [...formQuizData];
    updated.splice(qIdx, 1);
    syncQuizData(updated);
  };

  // Step 0: Main Menu
  if (step === 0) {
    return (
      <div className="max-w-3xl mx-auto animate-fade-slide-in">
        <h1 className="text-2xl font-bold text-text mb-2">قسم الاختبارات</h1>
        <p className="text-sm text-text-secondary mb-6">
          أنشئ أو عدّل بنك أسئلة من خلال نسخ البرومبت أو رفع ملف JSON
        </p>

        <WizardStepper steps={STEPS} current={step} />

        <div className="space-y-5 mt-8">
          <button
            onClick={() => goToStep(1)}
            className="w-full bg-surface-card border border-border rounded-2xl p-6 flex items-center gap-4 hover:border-primary/40 hover:shadow-lg transition-default group"
          >
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-default">
              <Wand2 size={24} />
            </div>
            <div className="text-start flex-1">
              <div className="font-bold text-text text-lg">برومبت بناء بنك أسئلة</div>
              <div className="text-sm text-text-secondary">انسخ البرومبت الجاهز للاستخدام مع الذكاء الاصطناعي</div>
            </div>
          </button>

          <button
            onClick={() => setStep(2)}
            className="w-full bg-surface-card border border-border rounded-2xl p-6 flex items-center gap-4 hover:border-primary/40 hover:shadow-lg transition-default group"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-default">
              <FileJson size={24} />
            </div>
            <div className="text-start flex-1">
              <div className="font-bold text-text text-lg">عارض ومحرر JSON</div>
              <div className="text-sm text-text-secondary">ارفع ملف JSON، عدّله، ثم طبّق التعديلات للمعاينة والاختبار</div>
            </div>
          </button>
        </div>
      </div>
    );
  }

  // Step 1: Prompt Copy
  if (step === 1) {
    const promptText = PROMPTS?.mcqGeneration || '';

    return (
      <div className="max-w-3xl mx-auto animate-fade-slide-in">
        <h1 className="text-2xl font-bold text-text mb-2">برومبت بناء بنك أسئلة</h1>
        <p className="text-sm text-text-secondary mb-6">
          انسخ البرومبت ثم الصقه في أداة الذكاء الاصطناعي
        </p>

        <WizardStepper steps={STEPS} current={step} />

        <div className="bg-surface-card border border-border rounded-2xl p-6 space-y-4 mt-8">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => copyTextOrAlert(promptText)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary-dark transition-default font-medium"
            >
              <Clipboard size={18} />
              نسخ البرومبت
            </button>

            <button
              onClick={() => copyTextOrAlert(promptText)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm text-text-secondary hover:bg-surface-hover transition-default"
            >
              <ExternalLink size={18} />
              نسخ فقط
            </button>
          </div>

          <textarea
            readOnly
            value={promptText}
            className="w-full min-h-[420px] rounded-xl border border-border bg-surface px-4 py-4 font-mono text-sm text-text resize-y"
          />
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={() => goToStep(0)}
            className="flex-1 py-3 rounded-xl border border-border text-sm font-medium text-text-secondary hover:bg-surface-hover transition-default"
          >
            رجوع
          </button>
          <button
            onClick={() => goToStep(2)}
            className="flex-[2] py-3 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary-dark transition-default shadow-lg shadow-primary/25"
          >
            الانتقال للمحرر
          </button>
        </div>
      </div>
    );
  }

  // Step 2: JSON Editor
  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-28 animate-fade-slide-in">
      <h1 className="text-2xl font-bold text-text mb-2">عارض ومحرر JSON</h1>
      <p className="text-sm text-text-secondary mb-6">
        ارفع ملف JSON، عدّله، ثم طبّق التعديلات للمعاينة والاختبار
      </p>

      {/* Unsaved changes indicator */}
      {hasUnsavedChanges && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl p-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
            <AlertCircle size={18} className="text-amber-600 dark:text-amber-400" />
          </div>
          <div className="flex-1">
            <span className="text-sm font-medium text-amber-800 dark:text-amber-200">لديك تغييرات غير محفوظة</span>
            <span className="text-xs text-amber-600 dark:text-amber-400 ms-2">فضّل حفظ التعديلات قبل المغادرة</span>
          </div>
        </div>
      )}

      <WizardStepper steps={STEPS} current={step} />

      {/* Header */}
      <div className="bg-surface-card border border-border rounded-2xl p-6 mt-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary-dark transition-default font-medium shadow-sm shadow-primary/20"
            >
              <Upload size={18} />
              رفع ملف JSON
            </button>
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".json" className="hidden" />

            <button
              onClick={downloadJson}
              disabled={formQuizData.length === 0}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm text-text-secondary hover:bg-surface-hover disabled:opacity-50 transition-default"
            >
              <Download size={18} />
              تنزيل JSON
            </button>
          </div>

          {currentFile && (
            <div className="text-sm text-text-secondary">
              الملف الحالي: <span className="font-bold text-text bg-surface px-2 py-1 rounded-md border border-border">{currentFile}</span>
            </div>
          )}
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-surface-card p-4 rounded-2xl border border-border flex flex-wrap items-center justify-between gap-4">
        <div className="flex bg-surface rounded-lg p-1">
          <button
            onClick={() => setViewMode('preview')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${viewMode === 'preview' ? 'bg-surface-card shadow-sm text-text' : 'text-text-secondary hover:text-text'}`}
          >
            <Eye size={16} />
            وضع المعاينة
          </button>
          <button
            onClick={() => setViewMode('quiz')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${viewMode === 'quiz' ? 'bg-surface-card shadow-sm text-text' : 'text-text-secondary hover:text-text'}`}
          >
            <Send size={16} />
            وضع الاختبار
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSaveSession}
            disabled={formQuizData.length === 0 || isSaving}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-600 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-default shadow-sm shadow-green-600/20"
          >
            <Save size={16} />
            {isSaving ? 'جاري الحفظ...' : sessionId ? 'تحديث البنك' : 'حفظ البنك'}
          </button>
          <button
            onClick={copyToClipboard}
            disabled={formQuizData.length === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm font-medium text-text-secondary hover:bg-surface transition-default disabled:opacity-50"
          >
            <Clipboard size={16} />
            نسخ الكل كنص
          </button>
        </div>
      </div>

      {/* Editor/Quiz Area */}
      <div className="space-y-4">
        {formQuizData.length > 0 ? (
          <>
            {viewMode === 'preview' && (
              <div className="flex justify-end items-center gap-3 mb-2">
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={addCount}
                  onChange={(e) => setAddCount(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-20 rounded-xl border border-border bg-surface-card px-3 py-2 text-center text-sm font-bold text-text focus:outline-none focus:border-primary transition-all"
                />
                <button
                  onClick={handleAddQuestions}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary-dark transition-default font-medium shadow-lg shadow-primary/25"
                >
                  <Plus size={16} />
                  إضافة سؤال
                </button>
              </div>
            )}

            {formQuizData.map((q, qIdx) => {
              if (viewMode === 'preview') {
                return (
                  <div key={qIdx} className="bg-surface-card rounded-2xl border border-border overflow-hidden shadow-sm hover:border-primary/20 transition-all">
                    <div className="bg-surface px-6 py-3 flex items-center justify-between border-b border-border">
                      <div className="flex items-center gap-3">
                        <span className="text-primary font-mono font-bold">#{qIdx + 1}</span>
                        <span className="text-sm text-text-secondary">
                          {q.type === 'mcq' ? 'اختيار متعدد' : q.type || 'mcq'}
                        </span>
                      </div>
                      <button
                        onClick={() => removeQuestion(qIdx)}
                        className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                        title="حذف السؤال"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="p-5 space-y-5">
                      {/* Question */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-sm font-medium text-text">السؤال</label>
                          <span className={`text-xs font-mono ${q.question.length > 300 ? 'text-red-500' : 'text-text-muted'}`}>{q.question.length}</span>
                        </div>
                        <textarea
                          value={q.question || ''}
                          onChange={(e) => updateFormField(qIdx, 'question', e.target.value)}
                          className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text placeholder:text-text-muted resize-y focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                          rows={2}
                        />
                      </div>
                      {/* Options */}
                      <div>
                        <label className="text-sm font-medium text-text block mb-2">الخيارات</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {(q.options || []).map((opt, oIdx) => {
                            const isCorrect = (q.correct_options || []).includes(oIdx);
                            return (
                              <div key={oIdx} className="flex items-start gap-2">
                                <button
                                  onClick={() => setCorrectOption(qIdx, oIdx)}
                                  className={`mt-2 w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${isCorrect ? 'border-green-500 bg-green-500' : 'border-border hover:border-green-400'}`}
                                >
                                  {isCorrect && <CheckCircle2 size={12} className="text-white" />}
                                </button>
                                <div className="flex-1 relative">
                                  <input
                                    value={opt}
                                    onChange={(e) => updateOption(qIdx, oIdx, e.target.value)}
                                    className={`w-full rounded-xl border ${isCorrect ? 'border-green-500/50 bg-green-50/10' : 'border-border bg-surface'} px-3 py-2 text-sm text-text placeholder:text-text-muted focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all outline-none`}
                                    placeholder={`الخيار ${String.fromCharCode(65 + oIdx)}`}
                                  />
                                  <div className={`absolute top-0 bottom-0 left-2 flex items-center text-[10px] font-mono ${opt.length > 100 ? 'text-red-500' : 'text-text-muted/50'}`}>
                                    {opt.length}
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                      {/* Explanation */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-sm font-medium text-text">الشرح</label>
                          <span className={`text-xs font-mono ${(q.explanation || '').length > 200 ? 'text-red-500' : 'text-text-muted'}`}>{(q.explanation || '').length}</span>
                        </div>
                        <textarea
                          value={q.explanation || ''}
                          onChange={(e) => updateFormField(qIdx, 'explanation', e.target.value)}
                          className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text placeholder:text-text-muted resize-y focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                          rows={2}
                        />
                      </div>
                    </div>
                  </div>
                );
              } else {
                // viewMode === 'quiz'
                const userAnswer = answers[qIdx]?.[0];
                const isCorrect = userAnswer !== undefined && Array.isArray(q.correct_options) && q.correct_options.includes(userAnswer);

                return (
                  <div key={qIdx} className="group bg-surface-card rounded-2xl border border-border transition-all p-6 hover:border-primary/30 shadow-sm">
                    <div className="flex justify-between items-start gap-4 mb-5">
                      <h3 className="text-lg font-semibold text-text leading-relaxed flex-1">
                        <span className="text-primary/60 me-3 font-mono">#{qIdx + 1}</span>
                        <span dir="auto">{q.question || <span className="text-text-muted italic">بدون سؤال</span>}</span>
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {(q.options || []).map((opt, oIdx) => {
                        let btnClass = 'border-border hover:bg-surface text-text';
                        if (userAnswer === oIdx) {
                          btnClass = isSubmitted
                            ? isCorrect
                              ? 'bg-green-500/20 border-green-500 text-green-700'
                              : 'bg-red-500/20 border-red-500 text-red-700'
                            : 'bg-primary/10 border-primary text-primary';
                        } else if (isSubmitted && Array.isArray(q.correct_options) && q.correct_options.includes(oIdx)) {
                          btnClass = 'bg-green-500/20 border-green-500 text-green-700';
                        }

                        return (
                          <button
                            key={oIdx}
                            disabled={isSubmitted}
                            onClick={() => handleAnswer(qIdx, oIdx)}
                            className={`text-start px-4 py-3.5 rounded-xl border transition-all relative overflow-hidden ${btnClass}`}
                          >
                            <span className="me-3 font-bold opacity-40">{String.fromCharCode(65 + oIdx)}</span>
                            <span dir="auto">{opt || <span className="text-text-muted italic">فارغ</span>}</span>
                            {isSubmitted && Array.isArray(q.correct_options) && q.correct_options.includes(oIdx) && (
                              <CheckCircle2 size={18} className="absolute inline top-1/2 -translate-y-1/2 inset-e-4 text-green-600" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                    {isSubmitted && q.explanation && (
                      <div className="mt-5 p-4 bg-blue-500/5 rounded-xl border border-blue-500/20 flex gap-3 text-text-secondary text-sm leading-relaxed">
                        <AlertCircle size={20} className="shrink-0 text-blue-500" />
                        <div>
                          <span className="font-bold block mb-1 text-text">الشرح والتوضيح:</span>
                          {q.explanation}
                        </div>
                      </div>
                    )}
                  </div>
                );
              }
            })}
          </>
        ) : (
          <div className="text-center py-20 bg-surface-card rounded-2xl border border-dashed border-border">
            <div className="bg-surface w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileJson className="text-text-secondary" size={32} />
            </div>
            <h3 className="text-lg font-semibold text-text">لا توجد أسئلة</h3>
            <p className="text-text-secondary mt-1">ارفع ملف JSON للبدء أو يمكنك إضافة أسئلة يدوياً</p>
            {viewMode === 'preview' && (
              <div className="flex justify-center items-center gap-3 mt-6">
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={addCount}
                  onChange={(e) => setAddCount(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-20 rounded-xl border border-border bg-surface px-3 py-2 text-center text-sm font-bold text-text focus:outline-none focus:border-primary"
                />
                <button
                  onClick={handleAddQuestions}
                  className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl hover:bg-primary-dark transition-default font-medium shadow-lg shadow-primary/25"
                >
                  <Plus size={18} />
                  إضافة أسئلة فارغة
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quiz Controls Footer */}
      {viewMode === 'quiz' && formQuizData.length > 0 && (
        <div className="fixed bottom-6 inset-x-0 mx-auto max-w-xl bg-surface-card border border-border shadow-2xl rounded-2xl p-4 flex items-center justify-between z-40">
          <div className="flex gap-4 items-center">
            {isSubmitted ? (
              <div className="bg-green-50 py-2 px-4 rounded-xl border border-green-100">
                <span className="text-text-secondary text-sm ms-2">النتيجة:</span>
                <span className="text-xl font-bold text-green-700">
                  {calculateScore().correct} / {calculateScore().total}
                </span>
              </div>
            ) : (
              <div className="text-text-secondary text-sm">
                تمت الإجابة على:{' '}
                <span className="text-text font-bold">
                  {Object.keys(answers).length} / {formQuizData.length}
                </span>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            {!isSubmitted ? (
              <button
                onClick={() => setIsSubmitted(true)}
                disabled={Object.keys(answers).length === 0}
                className="bg-primary text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-primary/25 disabled:opacity-50 hover:bg-primary-dark transition-default"
              >
                تسليم الاختبار
              </button>
            ) : (
              <button
                onClick={() => {
                  setAnswers({});
                  setIsSubmitted(false);
                }}
                className="flex items-center gap-2 bg-surface text-text px-4 py-2.5 rounded-xl font-bold hover:bg-surface-hover transition-default"
              >
                <RotateCcw size={18} />
                إعادة الاختبار
              </button>
            )}
          </div>
        </div>
      )}

      {/* Back Button */}
      <div className="flex gap-3 pt-4">
        <button
          onClick={() => goToStep(0)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border text-sm font-bold text-text-secondary hover:bg-surface-hover transition-default"
        >
          <ArrowLeft size={18} />
          رجوع للقائمة
        </button>
      </div>
    </div>
  );
}