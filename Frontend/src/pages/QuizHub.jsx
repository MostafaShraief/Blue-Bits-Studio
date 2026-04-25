import { useState, useRef, useEffect, useContext } from 'react';
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
  Trash2,
  Plus,
  Save,
  X,
  Circle
} from 'lucide-react';
import WizardStepper from '../components/WizardStepper';
import MaterialAutocomplete from '../components/common/MaterialAutocomplete';
import { saveQuizSession, fetchSession, createSession, compilePromptStateless } from '../utils/api';
import { useSettings } from '../contexts/SettingsContext';

const STEPS = ['إعداد الجلسة', 'محرر JSON'];

export default function QuizHub() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { defaultMaterial } = useSettings();
  
  const [step, setStep] = useState(0);
  const fileInputRef = useRef(null);

  const [formQuizData, setFormQuizData] = useState([]);
  const [currentFile, setCurrentFile] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  
  // Metadata state for prompts
  const [materialName, setMaterialName] = useState(defaultMaterial || '');
  const [materialValid, setMaterialValid] = useState(false);
  const [lectureNumber, setLectureNumber] = useState(1);
  const [lectureType, setLectureType] = useState('Theoretical');

  const [promptText, setPromptText] = useState('');
  const [isLoadingPrompt, setIsLoadingPrompt] = useState(false);

  // Button feedback states
  const [copyPromptCopied, setCopyPromptCopied] = useState(false);
  const [copyTextCopied, setCopyTextCopied] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // null | 'saved' | 'updated'

  // Confirm modal state
  const [showConfirmModal, setShowConfirmModal] = useState(false);

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
      const sessionContent = session.sessionContents?.[0];
      if (sessionContent?.contentBody) {
        const quizArray = typeof sessionContent.contentBody === 'string' 
          ? JSON.parse(sessionContent.contentBody) 
          : sessionContent.contentBody;
        setFormQuizData(quizArray.map(q => ({ ...q })));
        
        setMaterialName(session.material?.materialName || defaultMaterial || '');
        setLectureNumber(session.lectureNumber || 1);
        setLectureType(session.lectureType || 'Theoretical');
        setCurrentFile(session.material?.materialName || 'بنك محفوظ');
        
        setSessionId(id);
        setHasUnsavedChanges(false);
        setStep(1); // Go directly to JSON Editor (Step 2 - index 1)
      }
    } catch (err) {
      console.error('Failed to load session:', err);
    }
  };

  // Track unsaved changes
  useEffect(() => {
    if (formQuizData.length > 0 && step === 1) {
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

  const handleSaveSession = async () => {
    if (formQuizData.length === 0) {
      alert('لا توجد أسئلة لحفظها');
      return;
    }

    if (!materialName.trim()) {
        alert('الرجاء إدخال اسم المادة قبل الحفظ.');
        setStep(0); // go back to metadata
        return;
    }

    setIsSaving(true);
    try {
      const result = await saveQuizSession({
        id: sessionId || undefined,
        materialName: materialName,
        lectureNumber: Number(lectureNumber),
        lectureType: lectureType,
        workflowSystemCode: 'BANK_QS',
        generalNotes: '',
        quizData: formQuizData,
      });
      
      setSessionId(result.id);
      setHasUnsavedChanges(false);
      setSaveStatus(sessionId ? 'updated' : 'saved');
      setTimeout(() => setSaveStatus(null), 2000);
    } catch (err) {
      console.error('Failed to save session:', err);
      alert(err.message || 'فشل في حفظ البنك. يجب اختيار مادة صالحة.');
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
    // Check for unsaved changes when going back to step 0 - show modal instead of browser confirm
    if (newStep === 0 && hasUnsavedChanges) {
      setShowConfirmModal(true);
      return;
    }
    setStep(newStep);
  };

  const handleConfirmModalConfirm = () => {
    setShowConfirmModal(false);
    setStep(0);
  };

  const handleConfirmModalCancel = () => {
    setShowConfirmModal(false);
  };

  const handleNextStep0 = async () => {
    if (!materialValid || !lectureNumber || !lectureType) {
        alert('الرجاء اختيار مادة صالحة وإدخال جميع البيانات المطلوبة');
        return;
    }
    
    setIsLoadingPrompt(true);
    try {
      const res = await compilePromptStateless({
          systemCode: 'BANK_QS',
          generalNotes: '',
          fileNotes: []
      });
      setPromptText(res?.compiledPrompt || '');
      setStep(1); // Go directly to JSON Editor
    } catch (e) {
      console.error(e);
      alert('حدث خطأ أثناء تحضير البرومبت');
    }
    setIsLoadingPrompt(false);
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

  const copyTextOrAlert = async (text, setCopiedState) => {
    try {
      await navigator.clipboard.writeText(text);
      if (setCopiedState) {
        setCopiedState(true);
        setTimeout(() => setCopiedState(false), 2000);
      }
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

    copyTextOrAlert(text, setCopyTextCopied);
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

    setTimeout(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }, 100);
  };

  const removeQuestion = (qIdx) => {
    const updated = [...formQuizData];
    updated.splice(qIdx, 1);
    syncQuizData(updated);
  };

  // Step 0: Session Setup
  return (
    <div className="max-w-3xl mx-auto animate-fade-slide-in">
      {/* Header */}
      <h1 className="text-2xl font-bold text-text mb-2">إعداد الجلسة</h1>
      <p className="text-sm text-text-secondary mb-6">أدخل بيانات المحاضرة لإنشاء البرومبت المخصص</p>

      <WizardStepper steps={STEPS} current={step} />

      {/* Step 0: Setup */}
      {step === 0 && (
        <div className="space-y-5 animate-fade-slide-in">
          {/* Metadata Card */}
          <div className="bg-surface-card border border-border rounded-2xl p-6 space-y-4 mt-8">
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

          <div className="flex gap-3 mt-6">
              <button 
                  onClick={handleNextStep0}
                  disabled={isLoadingPrompt || !materialValid || !lectureNumber || !lectureType} 
                  className="flex-1 py-3 rounded-xl bg-primary text-white font-bold text-sm disabled:opacity-50 hover:bg-primary-dark transition-default shadow-lg shadow-primary/25"
              >
                  {isLoadingPrompt ? 'جاري التحضير...' : 'متابعة للمحرر'}
              </button>
          </div>
        </div>
      )}

      {/* Step 1: JSON Editor */}
      {step === 1 && (
        <div className="space-y-6 animate-fade-slide-in">
          {/* Header */}
          <h1 className="text-2xl font-bold text-text mb-2">عارض ومحرر JSON</h1>
          <p className="text-sm text-text-secondary mb-6">
            ارفع ملف JSON، عدّله، ثم طبّق التعديلات للمعاينة والاختبار
          </p>

          {/* Header Card with Upload/Download */}
          <div className="bg-surface-card border border-border rounded-2xl p-6">
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
                
                {/* Copy Generation Prompt Button */}
                <button
                  onClick={() => copyTextOrAlert(promptText, setCopyPromptCopied)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm font-medium text-text-secondary hover:bg-surface-hover transition-default"
                >
                  <Wand2 size={18} />
                  {copyPromptCopied ? 'تم النسخ' : 'نسخ برومبت التوليد'}
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
              {/* Unsaved indicator - beside save button */}
              {hasUnsavedChanges && (
                <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-2.5 py-1 rounded-full border border-amber-200/50 dark:border-amber-800/30">
                  <Circle size={6} fill="currentColor" className="text-amber-500" />
                  <span>تغييرات غير محفوظة</span>
                </div>
              )}
              <button
                onClick={handleSaveSession}
                disabled={formQuizData.length === 0 || isSaving}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-600 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-default shadow-sm shadow-green-600/20"
              >
                <Save size={16} />
                {isSaving ? 'جاري الحفظ...' : saveStatus === 'saved' ? 'تم الحفظ' : saveStatus === 'updated' ? 'تم التحديث' : sessionId ? 'تحديث البنك' : 'حفظ البنك'}
              </button>
              <button
                onClick={copyToClipboard}
                disabled={formQuizData.length === 0}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm font-medium text-text-secondary hover:bg-surface transition-default disabled:opacity-50"
              >
                <Clipboard size={16} />
                {copyTextCopied ? 'تم النسخ' : 'نسخ الكل كنص'}
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
              رجوع للإعداد
            </button>
          </div>
        </div>
      )}

      {/* Confirm Modal - replaces browser confirm for unsaved changes */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Overlay */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleConfirmModalCancel}
          />
          
          {/* Modal Content */}
          <div className="relative bg-surface-card rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden animate-scaleIn">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h2 className="text-lg font-semibold text-text">تأكيد</h2>
              <button
                onClick={handleConfirmModalCancel}
                className="p-2 rounded-lg hover:bg-surface-hover text-text-muted hover:text-text transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="p-5 text-center">
              <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-4">
                <AlertCircle size={24} className="text-amber-600 dark:text-amber-400" />
              </div>
              <p className="text-text mb-2">لديك تغييرات غير محفوظة</p>
              <p className="text-sm text-text-secondary">هل أنت متأكد من الرجوع للإعداد؟ سيتم فقدان التغييرات.</p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 px-5 pb-5">
              <button
                onClick={handleConfirmModalCancel}
                className="flex-1 py-2.5 rounded-xl border border-border text-text font-medium hover:bg-surface-hover transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={handleConfirmModalConfirm}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 text-white font-medium hover:bg-amber-600 transition-colors"
              >
                نعم، رجوع
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}