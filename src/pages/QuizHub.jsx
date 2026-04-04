import { useState, useRef, useMemo } from 'react';
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
  MessageCircle,
  Wand2,
  Save,
  Download,
  ArrowLeft,
  ExternalLink,
  Copy,
  Code,
  Settings,
  Edit3,
  Trash2,
  Plus
} from 'lucide-react';
import { PROMPTS } from '../data/prompts';

export default function QuizHub() {
  const [activeSection, setActiveSection] = useState('home'); // home | prompt | editor | publish
  const [editorSubSection, setEditorSubSection] = useState('menu'); // menu | copy | json | publish
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

  // Publisher (Telegram) state
  const [botToken, setBotToken] = useState('');
  const [chatId, setChatId] = useState('');
  const [publishStatus, setPublishStatus] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishDelayMs, setPublishDelayMs] = useState(1200);

  const fileInputRef = useRef(null);

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

  // Telegram publisher: sends each question as a quiz poll (single correct only)
  const publishToTelegram = async () => {
    setPublishStatus('');

    if (!botToken.trim()) {
      setPublishStatus('يرجى إدخال Bot Token');
      return;
    }
    if (!chatId.trim()) {
      setPublishStatus('يرجى إدخال Chat ID أو @channel');
      return;
    }

    const source = editorParsed.ok && editorText.trim() ? editorParsed.data : quizData;

    if (!Array.isArray(source) || source.length === 0) {
      setPublishStatus('لا توجد أسئلة لإرسالها');
      return;
    }

    setIsPublishing(true);
    let sent = 0;
    let failed = 0;

    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

    try {
      for (let i = 0; i < source.length; i++) {
        const q = source[i];

        if (!q || !q.question || !Array.isArray(q.options) || !Array.isArray(q.correct_options)) {
          failed++;
          continue;
        }
        if (q.correct_options.length !== 1) {
          // Telegram quiz poll supports single correct
          failed++;
          continue;
        }

        const url = `https://api.telegram.org/bot${botToken.trim()}/sendPoll`;
        const payload = {
          chat_id: chatId.trim(),
          question: String(q.question).slice(0, 300),
          options: q.options.slice(0, 10).map((x) => String(x).slice(0, 100)),
          type: 'quiz',
          correct_option_id: q.correct_options[0],
          is_anonymous: true,
        };

        if (q.explanation) {
          payload.explanation = String(q.explanation).slice(0, 200);
        }

        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();

        if (data?.ok) sent++;
        else failed++;

        await sleep(Math.max(300, Number(publishDelayMs) || 0));
      }

      setPublishStatus(`تم الإرسال: ${sent} | فشل: ${failed}`);
    } catch (e) {
      setPublishStatus(`خطأ أثناء الإرسال: ${e?.message || String(e)}`);
    } finally {
      setIsPublishing(false);
    }
  };

  const SectionHeader = ({ title, subtitle }) => (
    <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
          {subtitle ? <p className="text-muted-foreground mt-1">{subtitle}</p> : null}
        </div>
        <button
          onClick={() => setActiveSection('home')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm text-muted-foreground hover:bg-muted transition-all"
        >
          <ArrowLeft size={18} />
          رجوع
        </button>
      </div>
    </div>
  );

  if (activeSection === 'home') {
    return (
      <div className="max-w-5xl mx-auto space-y-6 pb-20">
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
          <h1 className="text-2xl font-bold text-foreground">قسم الاختبارات</h1>
          <p className="text-muted-foreground mt-1">
            اختر ما تريد فعله: نسخ برومبت بناء بنك أسئلة، أو تعديل/معاينة ملف JSON، أو نشره على تيليجرام.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => setActiveSection('prompt')}
            className="text-start bg-card rounded-2xl border border-border p-5 hover:border-primary/40 hover:shadow-lg transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Wand2 size={22} />
              </div>
              <div>
                <div className="font-bold text-foreground">برومبت بناء بنك أسئلة</div>
                <div className="text-sm text-muted-foreground">انسخ البرومبت الجاهز للاستخدام</div>
              </div>
            </div>
          </button>

          <button
            onClick={() => setActiveSection('editor')
            }
            className="text-start bg-card rounded-2xl border border-border p-5 hover:border-primary/40 hover:shadow-lg transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600">
                <FileJson size={22} />
              </div>
              <div>
                <div className="font-bold text-foreground">عارض ومحرر JSON</div>
                <div className="text-sm text-muted-foreground">رفع ملف، تعديل، معاينة، حفظ</div>
              </div>
            </div>
          </button>

          <button
            onClick={() => navigateToEditorSection('publish')}
            className="text-start bg-card rounded-2xl border border-border p-5 hover:border-primary/40 hover:shadow-lg transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-green-500/10 flex items-center justify-center text-green-600">
                <MessageCircle size={22} />
              </div>
              <div>
                <div className="font-bold text-foreground">الناشر (Telegram)</div>
                <div className="text-sm text-muted-foreground">أرسل الاختبار بعد التصحيح</div>
              </div>
            </div>
          </button>
        </div>
      </div>
    );
  }

  const resetEditorSubSection = () => {
    setEditorSubSection('menu');
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

  const addOption = (qIdx) => {
    const updated = [...formQuizData];
    const opts = [...(updated[qIdx].options || []), ''];
    updated[qIdx] = { ...updated[qIdx], options: opts };
    syncFormToEditor(updated);
  };

  // const removeOption = (qIdx, oIdx) => {
  //   const updated = [...formQuizData];
  //   const opts = [...(updated[qIdx].options || [])];
  //   opts.splice(oIdx, 1);
  //   const correct = (updated[qIdx].correct_options || []).filter((c) => c !== oIdx).map((c) => (c > oIdx ? c - 1 : c));
  //   updated[qIdx] = { ...updated[qIdx], options: opts, correct_options: correct };
  //   syncFormToEditor(updated);
  // };

  const setCorrectOption = (qIdx, oIdx) => {
    const updated = [...formQuizData];
    updated[qIdx] = { ...updated[qIdx], correct_options: [oIdx] };
    syncFormToEditor(updated);
  };

  // const addOption = (qIdx) => {
  //   const updated = [...formQuizData];
  //   const opts = [...(updated[qIdx].options || []), ''];
  //   updated[qIdx] = { ...updated[qIdx], options: opts };
  //   syncFormToEditor(updated);
  // };

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
  };

  if (activeSection === 'prompt') {
    const promptText = PROMPTS?.mcqGeneration || '';

    return (
      <div className="max-w-5xl mx-auto space-y-6 pb-20">
        <SectionHeader title="برومبت بناء بنك أسئلة" subtitle="انسخ البرومبت ثم الصقه في أداة الذكاء الاصطناعي." />

        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm space-y-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => copyTextOrAlert(promptText)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-all font-medium"
            >
              <Clipboard size={18} />
              نسخ البرومبت
            </button>

            <button
              onClick={() => copyTextOrAlert(promptText)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm text-muted-foreground hover:bg-muted transition-all"
            >
              <ExternalLink size={18} />
              نسخ فقط
            </button>
          </div>

          <textarea
            readOnly
            value={promptText}
            className="w-full min-h-[420px] rounded-xl border border-border bg-background p-4 font-mono text-sm"
          />
        </div>
      </div>
    );
  }

  if (activeSection === 'editor') {
    if (editorSubSection === 'menu') {
      return (
        <div className="max-w-5xl mx-auto space-y-6 pb-20">
          <SectionHeader title="قسم الاختبارات" subtitle="اختر ما تريد فعله." />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => setEditorSubSection('copy')}
              className="text-start bg-card rounded-2xl border border-border p-5 hover:border-primary/40 hover:shadow-lg transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600">
                  <Copy size={22} />
                </div>
                <div>
                  <div className="font-bold text-foreground">نسخ البرومبت</div>
                  <div className="text-sm text-muted-foreground">انسخ برومبت بناء بنك الأسئلة</div>
                </div>
              </div>
            </button>

            <button
              onClick={() => setEditorSubSection('json')}
              className="text-start bg-card rounded-2xl border border-border p-5 hover:border-blue-500/40 hover:shadow-lg transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600">
                  <FileJson size={22} />
                </div>
                <div>
                  <div className="font-bold text-foreground">عارض ومحرر JSON</div>
                  <div className="text-sm text-muted-foreground">رفع، تعديل، معاينة، حفظ</div>
                </div>
              </div>
            </button>

            <button
              onClick={() => setEditorSubSection('publish')}
              className="text-start bg-card rounded-2xl border border-border p-5 hover:border-green-500/40 hover:shadow-lg transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-green-500/10 flex items-center justify-center text-green-600">
                  <MessageCircle size={22} />
                </div>
                <div>
                  <div className="font-bold text-foreground">الناشر (Telegram)</div>
                  <div className="text-sm text-muted-foreground">أرسل الاختبار بعد التصحيح</div>
                </div>
              </div>
            </button>
          </div>
        </div>
      );
    }

    if (editorSubSection === 'copy') {
      const promptText = PROMPTS?.mcqGeneration || '';

      return (
        <div className="max-w-5xl mx-auto space-y-6 pb-20">
          <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-foreground">نسخ البرومبت</h1>
                <p className="text-muted-foreground mt-1">انسخ برومبت بناء بنك الأسئلة للاستخدام مع أدوات الذكاء الاصطناعي.</p>
              </div>
              <button
                onClick={resetEditorSubSection}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm text-muted-foreground hover:bg-muted transition-all"
              >
                <ArrowLeft size={18} />
                رجوع
              </button>
            </div>
          </div>

          <div className="bg-card p-6 rounded-2xl border border-border shadow-sm space-y-4">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => copyTextOrAlert(promptText)}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-all font-medium"
              >
                <Clipboard size={18} />
                نسخ البرومبت
              </button>
            </div>

            <textarea
              readOnly
              value={promptText}
              className="w-full min-h-[420px] rounded-xl border border-border bg-background p-4 font-mono text-sm"
            />
          </div>
        </div>
      );
    }

    if (editorSubSection === 'json') {
      return (
        <div className="max-w-7xl mx-auto space-y-6 pb-28">
          <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-foreground">عارض ومحرر JSON</h1>
                <p className="text-muted-foreground mt-1">ارفع ملف JSON، عدّله، ثم طبّق التعديلات للمعاينة والاختبار.</p>
              </div>
              <button
                onClick={resetEditorSubSection}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm text-muted-foreground hover:bg-muted transition-all"
              >
                <ArrowLeft size={18} />
                رجوع
              </button>
            </div>
          </div>

          <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">الملف الحالي</div>
                <div className="font-bold text-foreground">{currentFile || 'لم يتم اختيار ملف بعد'}</div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-all font-medium"
                >
                  <Upload size={18} />
                  رفع ملف JSON
                </button>
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".json" className="hidden" />

                <button
                  onClick={downloadJson}
                  disabled={!editorText.trim()}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm text-muted-foreground hover:bg-muted disabled:opacity-50 transition-all"
                >
                  <Download size={18} />
                  تنزيل JSON
                </button>

                <button
                  onClick={() => setEditorSubSection('publish')}
                  disabled={formQuizData.length === 0 && quizData.length === 0}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm text-muted-foreground hover:bg-muted disabled:opacity-50 transition-all"
                >
                  <MessageCircle size={18} />
                  الانتقال للنشر
                </button>

                <div className="flex bg-muted rounded-lg p-1">
                  <button
                    onClick={() => setEditMode('form')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-all ${editMode === 'form' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    <Edit3 size={14} />
                    نموذج
                  </button>
                  <button
                    onClick={() => setEditMode('raw')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-all ${editMode === 'raw' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    <Code size={14} />
                    JSON خام
                  </button>
                </div>
              </div>
            </div>

            {!editorParsed.ok && (
              <div className="mt-4 p-4 rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm">
                JSON غير صالح: {editorParsed.error}
              </div>
            )}
            {editorError && (
              <div className="mt-4 p-4 rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm">{editorError}</div>
            )}
          </div>

          {editMode === 'form' ? (
            <div className="space-y-4">
              {formQuizData.length > 0 ? (
                <>
                  <div className="flex justify-end">
                    <button
                      onClick={addQuestion}
                      className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-all font-medium"
                    >
                      <Plus size={16} />
                      إضافة سؤال
                    </button>
                  </div>

                  {formQuizData.map((q, qIdx) => (
                    <div key={qIdx} className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                      <div className="bg-muted/50 px-6 py-3 flex items-center justify-between border-b border-border">
                        <div className="flex items-center gap-3">
                          <span className="text-primary font-mono font-bold">#{qIdx + 1}</span>
                          <span className="text-sm text-muted-foreground">
                            {q.type === 'mcq' ? 'اختيار متعدد' : q.type || 'mcq'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleFlag(qIdx)}
                            className={`p-1.5 rounded-lg transition-colors ${flags[qIdx] ? 'bg-yellow-100 text-yellow-600' : 'text-muted-foreground hover:bg-yellow-50 hover:text-yellow-600'}`}
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
                              <label className="text-sm font-medium text-foreground">السؤال</label>
                              <span className={`text-xs font-mono ${q.question.length > 300 ? 'text-red-500' : 'text-muted-foreground'}`}>
                                {q.question.length}
                              </span>
                            </div>
                            <textarea
                              value={q.question || ''}
                              onChange={(e) => updateFormField(qIdx, 'question', e.target.value)}
                              className="w-full rounded-xl border border-border bg-background p-3 text-sm resize-y"
                              rows={2}
                            />
                          </div>

                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <label className="text-sm font-medium text-foreground">الخيارات</label>
                              {/* <button
                                onClick={() => addOption(qIdx)}
                                className="text-xs text-primary hover:underline flex items-center gap-1"
                              >
                                <Plus size={12} />
                                إضافة خيار
                              </button> */}
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
                                        className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                                        placeholder={`الخيار ${String.fromCharCode(65 + oIdx)}`}
                                      />
                                      <div className={`text-xs font-mono mt-0.5 text-end ${opt.length > 100 ? 'text-red-500' : 'text-muted-foreground'}`}>
                                        {opt.length}
                                      </div>
                                    </div>
                                    {/* {(q.options || []).length > 2 && (
                                      <button
                                        onClick={() => removeOption(qIdx, oIdx)}
                                        className="mt-2 p-1 text-red-400 hover:text-red-600 transition-colors"
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    )} */}
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="text-sm font-medium text-foreground">الشرح</label>
                              <span className={`text-xs font-mono ${(q.explanation || '').length > 200 ? 'text-red-500' : 'text-muted-foreground'}`}>
                                {(q.explanation || '').length}
                              </span>
                            </div>
                            <textarea
                              value={q.explanation || ''}
                              onChange={(e) => updateFormField(qIdx, 'explanation', e.target.value)}
                              className="w-full rounded-xl border border-border bg-background p-3 text-sm resize-y"
                              rows={2}
                            />
                          </div>
                        </div>

                        <div className="p-5">
                          <div className="text-sm text-muted-foreground mb-3">المعاينة المباشرة</div>
                          <div className={`bg-card rounded-xl border transition-all p-4 ${flags[qIdx] ? 'border-yellow-400' : 'border-border'}`}>
                            <div className="text-base font-semibold text-foreground leading-relaxed mb-3">
                              <span className="text-primary/40 me-2 font-mono">#{qIdx + 1}</span>
                              {q.question || <span className="text-muted-foreground italic">لم يتم إدخال السؤال بعد</span>}
                            </div>

                            {(q.options || []).map((opt, oIdx) => {
                              let btnClass = 'border-border text-foreground';
                              if ((q.correct_options || []).includes(oIdx)) {
                                btnClass = 'bg-green-500/10 border-green-500/30 text-green-700 font-medium';
                              }
                              return (
                                <div
                                  key={oIdx}
                                  className={`text-start px-4 py-2.5 rounded-xl border transition-all mb-2 ${btnClass}`}
                                >
                                  <span className="me-3 font-bold opacity-30">{String.fromCharCode(65 + oIdx)}</span>
                                  {opt || <span className="text-muted-foreground italic">فارغ</span>}
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
                <div className="text-center py-16 bg-card rounded-2xl border border-dashed border-border">
                  <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileJson className="text-muted-foreground" size={32} />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">لا توجد أسئلة</h3>
                  <p className="text-muted-foreground">ارفع ملف JSON أو الصق محتوى صالح في المحرر</p>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-card p-6 rounded-2xl border border-border shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-foreground">محرر JSON الخام</div>
                    <div className="text-sm text-muted-foreground">عدّل البيانات مباشرة</div>
                  </div>
                  <div className="text-xs text-muted-foreground">{editorParsed.ok ? 'جاهز' : 'به أخطاء'}</div>
                </div>

                <textarea
                  value={editorText}
                  onChange={(e) => setEditorText(e.target.value)}
                  className="w-full min-h-[700px] rounded-xl border border-border bg-background p-4 font-mono text-sm"
                  placeholder="الصق هنا JSON..."
                />
              </div>

              <div className="space-y-4">
                <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex bg-muted rounded-lg p-1">
                      <button
                        onClick={() => setViewMode('preview')}
                        className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm transition-all ${viewMode === 'preview' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                      >
                        <Eye size={16} />
                        وضع المعاينة
                      </button>
                      <button
                        onClick={() => setViewMode('quiz')}
                        className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm transition-all ${viewMode === 'quiz' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                      >
                        <Send size={16} />
                        وضع الاختبار
                      </button>
                    </div>

                    <button
                      onClick={() => setShowOnlyFlagged(!showOnlyFlagged)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm transition-all ${showOnlyFlagged ? 'bg-yellow-500/10 border-yellow-500/50 text-yellow-600' : 'border-border text-muted-foreground hover:bg-muted'}`}
                    >
                      <Flag size={16} fill={showOnlyFlagged ? 'currentColor' : 'none'} />
                      {showOnlyFlagged ? 'عرض الكل' : 'عرض المعلّم فقط'}
                    </button>

                    <button
                      onClick={() => copyToClipboard(false)}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border text-sm text-muted-foreground hover:bg-muted transition-all"
                    >
                      <Clipboard size={16} />
                      نسخ الكل كنص
                    </button>

                    <button
                      onClick={() => copyToClipboard(true)}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border text-sm text-muted-foreground hover:bg-muted transition-all"
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
                          className={`group bg-card rounded-2xl border transition-all p-5 ${isFlagged ? 'border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.1)]' : 'border-border hover:border-primary/30'}`}
                        >
                          <div className="flex justify-between items-start gap-4 mb-4">
                            <h3 className="text-base font-semibold text-foreground leading-relaxed flex-1">
                              <span className="text-primary/40 me-2 font-mono">#{originalIndex + 1}</span>
                              {q.question}
                            </h3>
                            <button
                              onClick={() => toggleFlag(originalIndex)}
                              className={`p-2 rounded-lg transition-colors ${isFlagged ? 'bg-yellow-100 text-yellow-600' : 'bg-muted text-muted-foreground hover:bg-yellow-50 hover:text-yellow-600'}`}
                            >
                              <Flag size={18} fill={isFlagged ? 'currentColor' : 'none'} />
                            </button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {(q.options || []).map((opt, oIdx) => {
                              let btnClass = 'border-border hover:bg-muted text-foreground';

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
                    <div className="text-center py-16 bg-card rounded-2xl border border-dashed border-border">
                      <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileJson className="text-muted-foreground" size={32} />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground">لا توجد أسئلة للمعاينة</h3>
                      <p className="text-muted-foreground">ارفع ملف JSON أو الصق محتوى صالح في المحرر</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {viewMode === 'quiz' && quizData.length > 0 && (
            <div className="fixed bottom-6 inset-x-0 mx-auto max-w-xl bg-card border border-border shadow-2xl rounded-2xl p-4 flex items-center justify-between z-40">
              <div className="flex gap-4 items-center">
                {isSubmitted ? (
                  <div className="bg-green-50 py-2 px-4 rounded-xl border border-green-100">
                    <span className="text-muted-foreground text-sm ms-2">النتيجة:</span>
                    <span className="text-xl font-bold text-green-700">
                      {calculateScore().correct} / {calculateScore().total}
                    </span>
                  </div>
                ) : (
                  <div className="text-muted-foreground text-sm">
                    تمت الإجابة على:{' '}
                    <span className="text-foreground font-bold">
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
                    className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-primary/25 disabled:opacity-50 hover:scale-[1.02] transition-transform"
                  >
                    تسليم الاختبار
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setAnswers({});
                      setIsSubmitted(false);
                    }}
                    className="flex items-center gap-2 bg-muted text-foreground px-4 py-2.5 rounded-xl font-bold hover:bg-muted/80 transition-colors"
                  >
                    <RotateCcw size={18} />
                    إعادة الاختبار
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      );
    }

    if (editorSubSection === 'publish') {
      return (
        <div className="max-w-5xl mx-auto space-y-6 pb-20">
          <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-foreground">الناشر (Telegram)</h1>
                <p className="text-muted-foreground mt-1">أرسل الأسئلة مباشرة كـ Quiz Polls إلى chat أو channel.</p>
              </div>
              <button
                onClick={resetEditorSubSection}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm text-muted-foreground hover:bg-muted transition-all"
              >
                <ArrowLeft size={18} />
                رجوع
              </button>
            </div>
          </div>

          <div className="bg-card p-6 rounded-2xl border border-border shadow-sm space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground">Bot Token</label>
                <input
                  value={botToken}
                  onChange={(e) => setBotToken(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-2.5"
                  placeholder="123456:ABC-DEF..."
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Chat ID أو @channel</label>
                <input
                  value={chatId}
                  onChange={(e) => setChatId(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-2.5"
                  placeholder="-100xxxxxxxxx أو @yourchannel"
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-muted-foreground">Delay بين الأسئلة (ms)</label>
              <input
                type="number"
                value={publishDelayMs}
                onChange={(e) => setPublishDelayMs(Number(e.target.value))}
                className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-2.5"
                min={300}
                step={100}
              />
              <div className="text-xs text-muted-foreground mt-1">مفيد لتجنب ضغط Telegram (rate limits)</div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-all font-medium"
              >
                <Upload size={18} />
                رفع ملف JSON
              </button>
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".json" className="hidden" />

              <button
                onClick={publishToTelegram}
                disabled={isPublishing}
                className="flex items-center gap-2 px-5 py-2 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-all font-bold disabled:opacity-50"
              >
                <Send size={18} />
                {isPublishing ? 'جارٍ الإرسال...' : 'نشر إلى Telegram'}
              </button>
            </div>

            <div className="text-sm text-muted-foreground">
              الملف الحالي: <span className="font-bold text-foreground">{currentFile || 'لم يتم اختيار ملف بعد'}</span>
            </div>

            {publishStatus && (
              <div className="mt-2 p-4 rounded-xl border border-border bg-muted text-sm text-foreground">{publishStatus}</div>
            )}

            <div className="text-xs text-muted-foreground">
              ملاحظة: Telegram Quiz Poll يدعم إجابة صحيحة واحدة فقط لكل سؤال. الأسئلة متعددة الإجابات سيتم تخطيها.
            </div>
          </div>
        </div>
      );
    }
  }

  return null;
}
