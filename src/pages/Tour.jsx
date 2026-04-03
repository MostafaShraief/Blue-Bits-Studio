import React from 'react';
import { 
    BookOpen, 
    FlaskConical, 
    Palette, 
    Sparkles, 
    Code, 
    Database, 
    ArrowRight,
    CheckCircle2,
    Play,
    Zap
} from 'lucide-react';
import { useTour } from '../contexts/TourContext';

const WORKFLOWS = [
    {
        id: 'lecture',
        title: 'استخراج محاضرة',
        icon: BookOpen,
        color: 'text-primary',
        bgColor: 'bg-primary/10',
        borderColor: 'border-primary/20',
        description: 'خطوات استخراج المحاضرة من البداية وحتى التصدير.',
        steps: [
            'الذهاب إلى قسم الاستخراج (Extraction).',
            'تعبئة البيانات المطلوبة واختيار نوع: محاضرة.',
            'رفع صور المحاضرة وإضافة ملاحظات لكل صورة.',
            'توليد الموجه (Prompt) ونسخه لاستخدامه في AI Studio.',
            'استخراج النص من AI Studio ثم الانتقال إلى قسم التنسيق (Coordination).',
            'لصق النص المستخرج واختيار نوع التنسيق كمحاضرة لتوليد موجه التنسيق.',
            'تنسيق النص عبر AI Studio ثم مراجعته في Obsidian.',
            'الانتقال إلى قسم Pandoc للتحويل النهائي.',
            'لصق النص المنسق وتعبئة البيانات النهائية ثم الضغط على "تحويل" لتصدير ملف Word (.docx).'
        ],
        capabilities: [
            'تفريغ النصوص من الصور بدقة عالية.',
            'التعرف على التنسيقات والجداول من الصور وتحويلها لنصوص.',
            'إنشاء هيكل متسق ومنظم للمحاضرات.',
            'تصدير المحتوى لملفات Word جاهزة للطباعة والتوزيع.'
        ]
    },
    {
        id: 'bank',
        title: 'استخراج بنك أسئلة',
        icon: FlaskConical,
        color: 'text-cyan',
        bgColor: 'bg-cyan/10',
        borderColor: 'border-cyan/20',
        description: 'مسار عمل إنشاء وتنسيق بنك الأسئلة.',
        steps: [
            'الذهاب إلى قسم الاستخراج (Extraction).',
            'تعبئة البيانات المطلوبة واختيار نوع: بنك أسئلة.',
            'إرفاق صور الأسئلة وإضافة أية ملاحظات بشأن الإجابات أو طرق الحل.',
            'توليد الموجه (Prompt) ونسخه لاستخدامه في AI Studio لتفريغ الأسئلة.',
            'الذهاب إلى قسم التنسيق (Coordination) بعد استخراج الأسئلة.',
            'لصق الأسئلة واختيار نوع "بنك أسئلة" للحصول على موجه التنسيق.',
            'تنسيق الأسئلة عبر AI Studio والمراجعة النهائية.',
            'الانتقال إلى قسم Pandoc لتحويل الملف.',
            'تعبئة بيانات البنك النهائية وتصدير الملف كـ Word (.docx).'
        ],
        capabilities: [
            'استخراج الأسئلة المعقدة من الصور (بما فيها المعادلات).',
            'تنظيم الأسئلة في فئات وأنماط (خيارات، مقالية، صح وخطأ).',
            'توفير نماذج إجابة منسقة ومرتبطة بكل سؤال.',
            'إنشاء ملفات بنوك أسئلة احترافية بصيغة Word.'
        ]
    },
    {
        id: 'draw',
        title: 'رسم',
        icon: Palette,
        color: 'text-success',
        bgColor: 'bg-success/10',
        borderColor: 'border-success/20',
        description: 'خطوات توليد رسومات وإضافتها للمستندات.',
        steps: [
            'الذهاب إلى قسم الرسم (Draw).',
            'تعبئة البيانات الأساسية ووصف الرسمة أو المخطط بدقة.',
            'رفع صور توضيحية (إن وجدت) لدعم وصف الرسمة.',
            'توليد الموجه ونسخه لإرساله إلى AI Studio للحصول على كود (مثال: Python أو Mermaid).',
            'نسخ الكود ولصقه في بيئة VS Code المجهزة.',
            'تشغيل الكود لتوليد الصورة أو المخطط بشكل نهائي.',
            'إدراج الرسمة النهائية في مستند Word الخاص بك.'
        ],
        capabilities: [
            'توليد مخططات تدفق (Flowcharts) ورسوم بيانية.',
            'إنشاء رسوم توضيحية علمية بناءً على الأوصاف النصية.',
            'تحويل الأفكار المعقدة إلى رسوم مرئية بسهولة.',
            'دعم اللغات البرمجية لتوليد صور دقيقة عبر الكود.'
        ]
    }
];

export default function Tour() {
    const { startTour } = useTour();

    return (
        <div className="max-w-4xl mx-auto space-y-12 animate-fade-slide-in pb-12">
            {/* Header */}
            <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary mb-4">
                    <Sparkles size={32} strokeWidth={1.5} />
                </div>
                <h1 className="text-3xl font-bold text-text">جولة تعريفية</h1>
                <p className="text-text-secondary max-w-2xl mx-auto leading-relaxed">
                    تعرف على مسارات العمل الرئيسية في النظام وكيفية استخدام الأدوات المختلفة مثل استوديو الذكاء الاصطناعي، أوبسيديان، وفيجوال ستوديو كود لتحقيق أقصى استفادة.
                </p>
            </div>

            {/* Workflows */}
            <div className="space-y-8">
                {WORKFLOWS.map((workflow, index) => {
                    const Icon = workflow.icon;
                    return (
                        <div 
                            key={workflow.id}
                            className={`bg-surface-card border border-border rounded-3xl p-6 md:p-8 relative overflow-hidden group hover:shadow-lg transition-default`}
                        >
                            {/* Decorative background element */}
                            <div className={`absolute -end-12 -top-12 w-48 h-48 ${workflow.bgColor} rounded-full blur-3xl opacity-50 group-hover:opacity-70 transition-default`} />
                            
                            <div className="relative z-10">
                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-6">
                                    <div className="flex items-start gap-4">
                                        <div className={`w-14 h-14 rounded-2xl ${workflow.bgColor} flex items-center justify-center shrink-0 border ${workflow.borderColor}`}>
                                            <Icon size={28} className={workflow.color} strokeWidth={1.5} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-surface-hover text-xs font-bold text-text-secondary">
                                                    {index + 1}
                                                </span>
                                                <h2 className="text-2xl font-bold text-text">{workflow.title}</h2>
                                            </div>
                                            <p className="text-text-secondary">{workflow.description}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => startTour(workflow.id)}
                                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all whitespace-nowrap ${workflow.bgColor.replace('/10', '/20')} ${workflow.color} hover:brightness-110 active:scale-95`}
                                    >
                                        <Play size={16} className="fill-current" />
                                        ابدأ الجولة التفاعلية
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-surface rounded-2xl p-6 border border-border">
                                        <h3 className="text-sm font-bold text-text mb-4 flex items-center gap-2">
                                            <CheckCircle2 size={16} className={workflow.color} />
                                            خطوات سير العمل:
                                        </h3>
                                        <ul className="space-y-4">
                                            {workflow.steps.map((step, stepIndex) => (
                                                <li key={stepIndex} className="flex items-start gap-3">
                                                    <div className={`mt-1.5 w-1.5 h-1.5 rounded-full ${workflow.bgColor.replace('/10', '')} shrink-0`} />
                                                    <span className="text-sm text-text-secondary leading-relaxed">
                                                        {step}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="bg-surface rounded-2xl p-6 border border-border">
                                        <h3 className="text-sm font-bold text-text mb-4 flex items-center gap-2">
                                            <Zap size={16} className={workflow.color} />
                                            ماذا يمكن لهذا المسار أن يفعل؟
                                        </h3>
                                        <ul className="space-y-4">
                                            {workflow.capabilities.map((cap, capIndex) => (
                                                <li key={capIndex} className="flex items-start gap-3">
                                                    <div className={`mt-1.5 w-1.5 h-1.5 rounded-full ${workflow.bgColor.replace('/10', '')} shrink-0`} />
                                                    <span className="text-sm text-text-secondary leading-relaxed">
                                                        {cap}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Tools Section */}
            <div className="bg-surface-card border border-border rounded-3xl p-8 text-center mt-12">
                <h2 className="text-xl font-bold text-text mb-6">الأدوات المتكاملة</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex flex-col items-center p-4">
                        <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center mb-3">
                            <Sparkles size={24} />
                        </div>
                        <h3 className="font-bold text-text mb-2">AI Studio</h3>
                        <p className="text-xs text-text-muted">استوديو الذكاء الاصطناعي لتحليل ومعالجة النصوص المتقدمة.</p>
                    </div>
                    <div className="flex flex-col items-center p-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-3">
                            <Database size={24} />
                        </div>
                        <h3 className="font-bold text-text mb-2">Obsidian</h3>
                        <p className="text-xs text-text-muted">نظام إدارة المعرفة لربط وحفظ الملاحظات والمخرجات.</p>
                    </div>
                    <div className="flex flex-col items-center p-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-400/10 text-blue-400 flex items-center justify-center mb-3">
                            <Code size={24} />
                        </div>
                        <h3 className="font-bold text-text mb-2">VS Code</h3>
                        <p className="text-xs text-text-muted">بيئة التطوير المتقدمة لمراجعة التنسيقات والأكواد.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
