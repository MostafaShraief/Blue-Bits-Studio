import { useState, useRef, useMemo } from 'react';
import { useSearchParams } from 'react-router';
import {
  FileJson,
  Upload,
  Eye,
  CheckCircle2,
  AlertCircle,
  Clipboard,
  Flag,
  RotateCcw,
  Send,
  Wand2,
  Download,
  ArrowLeft,
  ExternalLink,
  Copy,
  Code,
  Edit3,
  Trash2,
  Plus
} from 'lucide-react';
import WizardStepper from '../components/WizardStepper';
import PasteButton from '../components/PasteButton';
import { PROMPTS } from '../data/prompts';

const STEPS = ['القائمة', 'برومبت الأسئلة', 'محرر JSON'];

export default function QuizHub() {
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState(0);
  const fileInputRef = useRef(null);

  const [activeSection, setActiveSection] = useState('home'); // home | prompt | editor
  const [editorSubSection, setEditorSubSection] = useState('menu'); // menu | copy | json
  const [editMode, setEditMode] = useState('form'); // form | raw
  const [formQuizData, setFormQuizData] = useState([]);

  // Shared quiz state (used by Editor + Publisher)
  const [quizData, setQuizData] = useState([]);
  const [currentFile, setCurrentFile] = useState(null);

  // Viewer/Quiz mode state
  const [viewMode, setViewMode] = useState('preview'); // preview | quiz
  const [flags, setFlags] = useState({});
  const [answers, setAnswers] = useState({});
  const [showOnlyFlagged, setShowOnlyFlagged] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Editor state (raw JSON text)
  const [editorText, setEditorText] = useState('');
  const [editorError, setEditorError] = useState('');

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
    setQuizData(arr);
    setCurrentFile(fileName);
    setAnswers({});
    setFlags({});
    setShowOnlyFlagged(false);
    setIsSubmitted(false);
    setEditorText(JSON.stringify(arr, null, 2));
    setEditorError('');
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

  const toggleFlag = (index) => {
    setFlags((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const handleAnswer = (qIndex, oIndex) => {
    if (isSubmitted) return;
    setAnswers((prev) => ({ ...prev, [qIndex]: [oIndex] }));
  };

  const calculateScore = () => {
    let correct = 0;
    quizData.forEach((q, i) => {
      if (answers[i] && Array.isArray(q.correct_options) && q.correct_options.includes(answers[i][0])) {
        correct++;
      }
    });
    return { correct, total: quizData.length };
  };

  const copyTextOrAlert = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('تم النسخ إلى الحافظة');
    } catch {
      alert('تعذر النسخ تلقائياً. انسخ يدوياً من النص.');
    }
  };

  const copyToClipboard = (onlyFlagged = false) => {
    const questionsToExport = onlyFlagged ? quizData.filter((_, i) => flags[i]) : quizData;

    const text = questionsToExport
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

  const filteredQuestions = showOnlyFlagged
    ? quizData.map((q, i) => ({ ...q, originalIndex: i })).filter((q) => flags[q.originalIndex])
    : quizData.map((q, i) => ({ ...q, originalIndex: i }));

  // Editor parse (live)
  const editorParsed = useMemo(() => {
    try {
      if (!editorText.trim()) return { ok: true, data: [] };
      const arr = safeParseQuizArray(editorText);
      return { ok: true, data: arr };
    } catch (e) {
      return { ok: false, error: e?.message || 'JSON غير صالح' };
    }
  }, [editorText]);

  const applyEditorToViewer = () => {
    if (!editorParsed.ok) {
      setEditorError(editorParsed.error);
      return;
    }
    setQuizFromArray(editorParsed.data, currentFile);
    setEditorError('');
  };

  const downloadJson = () => {
    const text = editorText || JSON.stringify(quizData, null, 2);
    const blob = new Blob([text], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = (currentFile ? currentFile.replace('.json', '') : 'quiz') + '_edited.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const syncFormToEditor = (data) => {
    setFormQuizData(data);
    setEditorText(JSON.stringify(data, null, 2));
    setEditorError('');
  };

  const updateFormField = (qIdx, field, value) => {
    const updated = [...formQuizData];
    updated[qIdx] = { ...updated[qIdx], [field]: value };
    syncFormToEditor(updated);
  };

  const updateOption = (qIdx, oIdx, value) => {
    const updated = [...formQuizData];
    const opts = [...(updated[qIdx].options || [])];
    opts[oIdx] = value;
    updated[qIdx] = { ...updated[qIdx], options: opts };
    syncFormToEditor(updated);
  };

  const setCorrectOption = (qIdx, oIdx) => {
    const updated = [...formQuizData];
    updated[qIdx] = { ...updated[qIdx], correct_options: [oIdx] };
    syncFormToEditor(updated);
  };

  const addQuestion = () => {
    const newQ = { type: 'mcq', question: '', options: ['', '', '', ''], correct_options: [], explanation: '' };
    const updated = [...formQuizData, newQ];
    syncFormToEditor(updated);
  };

  const removeQuestion = (qIdx) => {
    const updated = [...formQuizData];
    updated.splice(qIdx, 1);
    syncFormToEditor(updated);
  };

  const navigateToEditorSection = (sub) => {
    setEditorSubSection(sub);
    setActiveSection('editor');
    goToStep(2);
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
            onClick={() => goToStep(2)}
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
    <div className="max-w-7xl mx-auto space-y-6 pb-28 animate-fade-slide-in">
      {/* Header */}
      <div className="bg-surface-card border border-border rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-text">عارض ومحرر JSON</h1>
            <p className="text-sm text-text-secondary mt-1">
              ارفع ملف JSON، عدّله، ثم طبّق التعديلات للمعاينة والاختبار
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary-dark transition-default font-medium"
            >
              <Upload size={18} />
              رفع ملف JSON
            </button>
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".json" className="hidden" />

            <button
              onClick={downloadJson}
              disabled={!editorText.trim()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm text-text-secondary hover:bg-surface-hover disabled:opacity-50 transition-default"
            >
              <Download size={18} />
              تنزيل JSON
            </button>

            <div className="flex bg-surface rounded-lg p-1">
              <button
                onClick={() => setEditMode('form')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-all ${editMode === 'form' ? 'bg-surface-card shadow-sm text-text' : 'text-text-secondary hover:text-text'}`}
              >
                <Edit3 size={14} />
                نموذج
              </button>
              <button
                onClick={() => setEditMode('raw')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-all ${editMode === 'raw' ? 'bg-surface-card shadow-sm text-text' : 'text-text-secondary hover:text-text'}`}
              >
                <Code size={14} />
                JSON خام
              </button>
            </div>
          </div>
        </div>

        {currentFile && (
          <div className="mt-4 pt-4 border-t border-border flex flex-wrap items-center gap-3">
            <div className="text-sm text-text-secondary">الملف الحالي:</div>
            <div className="font-bold text-text">{currentFile}</div>
          </div>
        )}

        {!editorParsed.ok && (
          <div className="mt-4 p-4 rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm">
            JSON غير صالح: {editorParsed.error}
          </div>
        )}
        {editorError && (
          <div className="mt-4 p-4 rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm">{editorError}</div>
        )}
      </div>

      {/* Form Mode */}
      {editMode === 'form' ? (
        <div className="space-y-4">
          {formQuizData.length > 0 ? (
            <>
              <div className="flex justify-end">
                <button
                  onClick={addQuestion}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary-dark transition-default font-medium"
                >
                  <Plus size={16} />
                  إضافة سؤال
                </button>
              </div>

              {formQuizData.map((q, qIdx) => (
                <div key={qIdx} className="bg-surface-card rounded-2xl border border-border overflow-hidden">
                  <div className="bg-surface px-6 py-3 flex items-center justify-between border-b border-border">
                    <div className="flex items-center gap-3">
                      <span className="text-primary font-mono font-bold">#{qIdx + 1}</span>
                      <span className="text-sm text-text-secondary">
                        {q.type === 'mcq' ? 'اختيار متعدد' : q.type || 'mcq'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleFlag(qIdx)}
                        className={`p-1.5 rounded-lg transition-colors ${flags[qIdx] ? 'bg-yellow-100 text-yellow-600' : 'text-text-secondary hover:bg-yellow-50 hover:text-yellow-600'}`}
                      >
                        <Flag size={16} fill={flags[qIdx] ? 'currentColor' : 'none'} />
                      </button>
                      <button
                        onClick={() => removeQuestion(qIdx)}
                        className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x rtl:lg:divide-x-reverse divide-border">
                    <div className="p-5 space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-sm font-medium text-text">السؤال</label>
                          <span className={`text-xs font-mono ${q.question.length > 300 ? 'text-red-500' : 'text-text-muted'}`}>
                            {q.question.length}
                          </span>
                        </div>
                        <textarea
                          value={q.question || ''}
                          onChange={(e) => updateFormField(qIdx, 'question', e.target.value)}
                          className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-muted resize-y"
                          rows={2}
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-sm font-medium text-text">الخيارات</label>
                        </div>
                        <div className="space-y-2">
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
                                <div className="flex-1">
                                  <input
                                    value={opt}
                                    onChange={(e) => updateOption(qIdx, oIdx, e.target.value)}
                                    className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-muted"
                                    placeholder={`الخيار ${String.fromCharCode(65 + oIdx)}`}
                                  />
                                  <div className={`text-xs font-mono mt-0.5 text-end ${opt.length > 100 ? 'text-red-500' : 'text-text-muted'}`}>
                                    {opt.length}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-sm font-medium text-text">الشرح</label>
                          <span className={`text-xs font-mono ${(q.explanation || '').length > 200 ? 'text-red-500' : 'text-text-muted'}`}>
                            {(q.explanation || '').length}
                          </span>
                        </div>
                        <textarea
                          value={q.explanation || ''}
                          onChange={(e) => updateFormField(qIdx, 'explanation', e.target.value)}
                          className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-muted resize-y"
                          rows={2}
                        />
                      </div>
                    </div>

                    <div className="p-5">
                      <div className="text-sm text-text-secondary mb-3">المعاينة المباشرة</div>
                      <div className={`bg-surface rounded-xl border transition-all p-4 ${flags[qIdx] ? 'border-yellow-400' : 'border-border'}`}>
                        <div className="text-base font-semibold text-text leading-relaxed mb-3">
                          <span className="text-primary/40 me-2 font-mono">#{qIdx + 1}</span>
                          {q.question || <span className="text-text-secondary italic">لم يتم إدخال السؤال بعد</span>}
                        </div>

                        {(q.options || []).map((opt, oIdx) => {
                          let btnClass = 'border-border text-text';
                          if ((q.correct_options || []).includes(oIdx)) {
                            btnClass = 'bg-green-500/10 border-green-500/30 text-green-700 font-medium';
                          }
                          return (
                            <div
                              key={oIdx}
                              className={`text-start px-4 py-2.5 rounded-xl border transition-all mb-2 ${btnClass}`}
                            >
                              <span className="me-3 font-bold opacity-30">{String.fromCharCode(65 + oIdx)}</span>
                              {opt || <span className="text-text-secondary italic">فارغ</span>}
                              {(q.correct_options || []).includes(oIdx) && (
                                <CheckCircle2 size={14} className="inline me-2 text-green-600" />
                              )}
                            </div>
                          );
                        })}

                        {q.explanation && (
                          <div className="mt-3 p-3 bg-blue-50/50 rounded-xl border border-blue-100 flex gap-2 text-blue-900/80 text-sm">
                            <AlertCircle size={16} className="shrink-0 text-blue-500 mt-0.5" />
                            <div>
                              <span className="font-bold block mb-0.5">الشرح:</span>
                              {q.explanation}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <div className="text-center py-20 bg-surface-card rounded-2xl border border-dashed border-border">
              <div className="bg-surface w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileJson className="text-text-secondary" size={32} />
              </div>
              <h3 className="text-lg font-semibold text-text">لا توجد أسئلة</h3>
              <p className="text-text-secondary">ارفع ملف JSON أو الصق محتوى صالح في المحرر</p>
            </div>
          )}
        </div>
      ) : (
        /* Raw JSON Mode */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-surface-card p-6 rounded-2xl border border-border space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold text-text">محرر JSON الخام</div>
                <div className="text-sm text-text-secondary">عدّل البيانات مباشرة</div>
              </div>
              <div className="text-xs text-text-muted">{editorParsed.ok ? 'جاهز' : 'به أخطاء'}</div>
            </div>

            <textarea
              value={editorText}
              onChange={(e) => setEditorText(e.target.value)}
              className="w-full min-h-[700px] rounded-xl border border-border bg-surface px-4 py-4 font-mono text-sm text-text resize-y"
              placeholder="الصق هنا JSON..."
            />
          </div>

          <div className="space-y-4">
            <div className="bg-surface-card p-6 rounded-2xl border border-border">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex bg-surface rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('preview')}
                    className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm transition-all ${viewMode === 'preview' ? 'bg-surface-card shadow-sm text-text' : 'text-text-secondary hover:text-text'}`}
                  >
                    <Eye size={16} />
                    وضع المعاينة
                  </button>
                  <button
                    onClick={() => setViewMode('quiz')}
                    className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm transition-all ${viewMode === 'quiz' ? 'bg-surface-card shadow-sm text-text' : 'text-text-secondary hover:text-text'}`}
                  >
                    <Send size={16} />
                    وضع الاختبار
                  </button>
                </div>

                <button
                  onClick={() => setShowOnlyFlagged(!showOnlyFlagged)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm transition-all ${showOnlyFlagged ? 'bg-yellow-500/10 border-yellow-500/50 text-yellow-600' : 'border-border text-text-secondary hover:bg-surface'}`}
                >
                  <Flag size={16} fill={showOnlyFlagged ? 'currentColor' : 'none'} />
                  {showOnlyFlagged ? 'عرض الكل' : 'عرض المعلّم فقط'}
                </button>

                <button
                  onClick={() => copyToClipboard(false)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border text-sm text-text-secondary hover:bg-surface transition-default"
                >
                  <Clipboard size={16} />
                  نسخ الكل كنص
                </button>

                <button
                  onClick={() => copyToClipboard(true)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border text-sm text-text-secondary hover:bg-surface transition-default"
                >
                  <Clipboard size={16} />
                  نسخ المعلّم فقط
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {filteredQuestions.length > 0 ? (
                filteredQuestions.map((q) => {
                  const originalIndex = q.originalIndex;
                  const isFlagged = flags[originalIndex];
                  const userAnswer = answers[originalIndex]?.[0];
                  const isCorrect =
                    userAnswer !== undefined && Array.isArray(q.correct_options) && q.correct_options.includes(userAnswer);

                  return (
                    <div
                      key={originalIndex}
                      className={`group bg-surface-card rounded-2xl border transition-all p-5 ${isFlagged ? 'border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.1)]' : 'border-border hover:border-primary/30'}`}
                    >
                      <div className="flex justify-between items-start gap-4 mb-4">
                        <h3 className="text-base font-semibold text-text leading-relaxed flex-1">
                          <span className="text-primary/40 me-2 font-mono">#{originalIndex + 1}</span>
                          {q.question}
                        </h3>
                        <button
                          onClick={() => toggleFlag(originalIndex)}
                          className={`p-2 rounded-lg transition-colors ${isFlagged ? 'bg-yellow-100 text-yellow-600' : 'bg-surface text-text-secondary hover:bg-yellow-50 hover:text-yellow-600'}`}
                        >
                          <Flag size={18} fill={isFlagged ? 'currentColor' : 'none'} />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {(q.options || []).map((opt, oIdx) => {
                          let btnClass = 'border-border hover:bg-surface text-text';

                          if (viewMode === 'quiz') {
                            if (userAnswer === oIdx) {
                              btnClass = isSubmitted
                                ? isCorrect
                                  ? 'bg-green-500/20 border-green-500 text-green-700'
                                  : 'bg-red-500/20 border-red-500 text-red-700'
                                : 'bg-primary/10 border-primary text-primary';
                            } else if (isSubmitted && Array.isArray(q.correct_options) && q.correct_options.includes(oIdx)) {
                              btnClass = 'bg-green-500/20 border-green-500 text-green-700';
                            }
                          } else {
                            if (Array.isArray(q.correct_options) && q.correct_options.includes(oIdx)) {
                              btnClass = 'bg-green-500/10 border-green-500/30 text-green-700 font-medium';
                            }
                          }

                          return (
                            <button
                              key={oIdx}
                              disabled={isSubmitted}
                              onClick={() => handleAnswer(originalIndex, oIdx)}
                              className={`text-start px-4 py-3 rounded-xl border transition-all relative overflow-hidden ${btnClass}`}
                            >
                              <span className="me-3 font-bold opacity-30">{String.fromCharCode(65 + oIdx)}</span>
                              {opt}
                              {isSubmitted && Array.isArray(q.correct_options) && q.correct_options.includes(oIdx) && (
                                <CheckCircle2
                                  size={16}
                                  className="absolute inline top-1/2 -translate-y-1/2 inset-e-4 text-green-600"
                                />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {(viewMode === 'preview' || isSubmitted) && q.explanation && (
                        <div className="mt-4 p-4 bg-blue-50/50 rounded-xl border border-blue-100 flex gap-3 text-blue-900/80 text-sm leading-relaxed">
                          <AlertCircle size={18} className="shrink-0 text-blue-500" />
                          <div>
                            <span className="font-bold block mb-1">الشرح والتوضيح:</span>
                            {q.explanation}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-20 bg-surface-card rounded-2xl border border-dashed border-border">
                  <div className="bg-surface w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileJson className="text-text-secondary" size={32} />
                  </div>
                  <h3 className="text-lg font-semibold text-text">لا توجد أسئلة للمعاينة</h3>
                  <p className="text-text-secondary">ارفع ملف JSON أو الصق محتوى صالح في المحرر</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Quiz Controls Footer */}
      {viewMode === 'quiz' && quizData.length > 0 && (
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
                  {Object.keys(answers).length} / {quizData.length}
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
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm font-medium text-text-secondary hover:bg-surface-hover transition-default"
        >
          <ArrowLeft size={18} />
          رجوع للقائمة
        </button>
      </div>
    </div>
  );
}