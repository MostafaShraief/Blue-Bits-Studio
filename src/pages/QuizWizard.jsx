import { useState, useRef } from 'react';
import { 
  FileJson, 
  Upload, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle,
  Clipboard,
  Flag,
  FileText,
  RotateCcw,
  Send
} from 'lucide-react';

export default function QuizWizard() {
  const [quizData, setQuizData] = useState([]);
  const [currentFile, setCurrentFile] = useState(null);
  const [viewMode, setViewMode] = useState('preview'); // 'preview' or 'quiz'
  const [flags, setFlags] = useState({});
  const [notes, setNotes] = useState({});
  const [answers, setAnswers] = useState({});
  const [showOnlyFlagged, setShowOnlyFlagged] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const fileInputRef = useRef(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setCurrentFile(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target.result);
        setQuizData(Array.isArray(json) ? json : []);
        setAnswers({});
        setFlags({});
        setNotes({});
        setIsSubmitted(false);
      } catch (err) {
        alert('خطأ في قراءة ملف JSON');
      }
    };
    reader.readAsText(file);
  };

  const toggleFlag = (index) => {
    setFlags(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const handleAnswer = (qIndex, oIndex) => {
    if (isSubmitted) return;
    setAnswers(prev => ({ ...prev, [qIndex]: [oIndex] }));
  };

  const calculateScore = () => {
    let correct = 0;
    quizData.forEach((q, i) => {
      if (answers[i] && q.correct_options.includes(answers[i][0])) {
        correct++;
      }
    });
    return { correct, total: quizData.length };
  };

  const copyToClipboard = (onlyFlagged = false) => {
    const questionsToExport = onlyFlagged 
      ? quizData.filter((_, i) => flags[i])
      : quizData;
    
    const text = questionsToExport.map((q, i) => {
      const options = q.options.map((opt, oi) => `${String.fromCharCode(65 + oi)}) ${opt}`).join('\n');
      const correct = q.correct_options.map(idx => q.options[idx]).join(', ');
      return `Q: ${q.question}\n${options}\nCorrect: ${correct}\nExpl: ${q.explanation || 'N/A'}\n`;
    }).join('\n---\n\n');

    navigator.clipboard.writeText(text);
    alert('تم النسخ إلى الحافظة');
  };

  const filteredQuestions = showOnlyFlagged 
    ? quizData.map((q, i) => ({ ...q, originalIndex: i })).filter(q => flags[q.originalIndex])
    : quizData.map((q, i) => ({ ...q, originalIndex: i }));

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      {/* Header & Controls */}
      <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">عارض الاختبارات الذكي</h1>
            <p className="text-muted-foreground mt-1">
              قم برفع ملف JSON للمعاينة أو إجراء اختبار تجريبي
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-all font-medium"
            >
              <Upload size={18} />
              اختر ملف JSON
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              accept=".json" 
              className="hidden" 
            />
          </div>
        </div>

        {currentFile && (
          <div className="mt-6 flex flex-wrap items-center gap-3 pt-6 border-t border-border">
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

            <div className="h-6 w-px bg-border mx-2 hidden sm:block" />

            <button 
              onClick={() => setShowOnlyFlagged(!showOnlyFlagged)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm transition-all ${showOnlyFlagged ? 'bg-yellow-500/10 border-yellow-500/50 text-yellow-600' : 'border-border text-muted-foreground hover:bg-muted'}`}
            >
              <Flag size={16} fill={showOnlyFlagged ? "currentColor" : "none"} />
              {showOnlyFlagged ? 'عرض الكل' : 'عرض المعلّم فقط'}
            </button>

            <button 
              onClick={() => copyToClipboard(false)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border text-sm text-muted-foreground hover:bg-muted transition-all"
            >
              <Clipboard size={16} />
              نسخ الكل
            </button>
          </div>
        )}
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {filteredQuestions.length > 0 ? (
          filteredQuestions.map((q, idx) => {
            const originalIndex = q.originalIndex;
            const isFlagged = flags[originalIndex];
            const userAnswer = answers[originalIndex]?.[0];
            const isCorrect = userAnswer !== undefined && q.correct_options.includes(userAnswer);

            return (
              <div 
                key={originalIndex} 
                className={`group bg-card rounded-2xl border transition-all p-5 ${isFlagged ? 'border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.1)]' : 'border-border hover:border-primary/30'}`}
              >
                <div className="flex justify-between items-start gap-4 mb-4">
                  <h3 className="text-lg font-semibold text-foreground leading-relaxed flex-1">
                    <span className="text-primary/40 me-2 font-mono">#{originalIndex + 1}</span>
                    {q.question}
                  </h3>
                  <button 
                    onClick={() => toggleFlag(originalIndex)}
                    className={`p-2 rounded-lg transition-colors ${isFlagged ? 'bg-yellow-100 text-yellow-600' : 'bg-muted text-muted-foreground hover:bg-yellow-50 hover:text-yellow-600'}`}
                  >
                    <Flag size={18} fill={isFlagged ? "currentColor" : "none"} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {q.options.map((opt, oIdx) => {
                    let btnClass = "border-border hover:bg-muted text-foreground";
                    
                    if (viewMode === 'quiz') {
                      if (userAnswer === oIdx) {
                        btnClass = isSubmitted 
                          ? (isCorrect ? "bg-green-500/20 border-green-500 text-green-700" : "bg-red-500/20 border-red-500 text-red-700")
                          : "bg-primary/10 border-primary text-primary";
                      } else if (isSubmitted && q.correct_options.includes(oIdx)) {
                        btnClass = "bg-green-500/20 border-green-500 text-green-700";
                      }
                    } else {
                      if (q.correct_options.includes(oIdx)) {
                        btnClass = "bg-green-500/10 border-green-500/30 text-green-700 font-medium";
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
                        {opt}                        {isSubmitted && q.correct_options.includes(oIdx) && (
                          <CheckCircle2 size={16} className="absolute inline top-1/2 -translate-y-1/2 inset-e-4 text-green-600" />
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
          <div className="text-center py-20 bg-card rounded-2xl border border-dashed border-border">
            <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileJson className="text-muted-foreground" size={32} />
            </div>
            <h3 className="text-xl font-semibold text-foreground">لا توجد أسئلة</h3>
            <p className="text-muted-foreground">قم برفع ملف JSON للبدء</p>
          </div>
        )}
      </div>

      {/* Quiz Controls Footer */}
      {viewMode === 'quiz' && quizData.length > 0 && (
        <div className="fixed bottom-6 inset-x-0 mx-auto max-w-xl bg-card border border-border shadow-2xl rounded-2xl p-4 flex items-center justify-between z-40">
          <div className="flex gap-4 items-center">
            {isSubmitted ? (
              <div className="bg-green-50 py-2 px-4 rounded-xl border border-green-100">
                <span className="text-muted-foreground text-sm ms-2">النتيجة:</span>
                <span className="text-xl font-bold text-green-700">{calculateScore().correct} / {calculateScore().total}</span>
              </div>
            ) : (
              <div className="text-muted-foreground text-sm">
                تمت الإجابة على: <span className="text-foreground font-bold">{Object.keys(answers).length} / {quizData.length}</span>
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
