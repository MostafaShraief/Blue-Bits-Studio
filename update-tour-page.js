const fs = require('fs');

const content = `import React from 'react';
import { 
    BookOpen, 
    FlaskConical, 
    Palette, 
    Sparkles, 
    Code, 
    Database, 
    ArrowRight,
    CheckCircle2,
    Play
} from 'lucide-react';
import { useTour } from '../contexts/TourContext';

const WORKFLOWS = [
    {
        id: 'lecture',
        title: 'استخراج وتنسيق محاضرة',
        icon: BookOpen,
        color: 'text-primary',
        bgColor: 'bg-primary/10',
        borderColor: 'border-primary/20',
        description: 'مسار عمل كامل مخصص لاستخراج المحاضرات الدراسية بدقة وتنسيقها ثم تحويلها إلى ملف Word احترافي.',
        capabilities: [
            'استخراج النصوص المعقدة من صور المحاضرات بشكل دقيق عبر AI Studio.',
            'دمج ملاحظات مخصصة لكل شريحة/صورة لتوجيه الذكاء الاصطناعي.',
            'تنسيق المحتوى المستخرج إلى هيكل نظيف باستخدام Obsidian.',
            'تحويل المحتوى المنسق إلى ملف Word (.docx) متوافق مع قوالب المشروع.'
        ],
        steps: [
            'قسم الاستخراج (Extraction): تحديد نوع المستند كـ "محاضرة".',
            'إدخال البيانات الأساسية: اسم المادة، ورقم المحاضرة، والنوع (نظري/عملي).',
            'رفع صور شرائح المحاضرة وإضافة الملاحظات المخصصة لكل صورة.',
            'توليد الموجه (Prompt) ونسخه إلى AI Studio.',
            'قسم التنسيق (Coordination): اختيار نوع التنسيق "محاضرة" ولصق النص المُراجع من Obsidian.',
            'توليد موجه التنسيق ونسخه لـ AI Studio للحصول على النص النهائي المنسق.',
            'قسم Pandoc: لصق النص المنسق النهائي، التأكد من البيانات، وتوليد ملف Word.'
        ]
    },
    {
        id: 'bank',
        title: 'استخراج وبناء بنك أسئلة',
        icon: FlaskConical,
        color: 'text-cyan',
        bgColor: 'bg-cyan/10',
        borderColor: 'border-cyan/20',
        description: 'مسار مخصص لرقمنة وتنظيم بنوك الأسئلة، مع الحفاظ على هيكل الأسئلة والخيارات والحلول.',
        capabilities: [
            'التعرف الدقيق على أسئلة الاختيار من متعدد مع خياراتها والحل الصحيح.',
            'توجيه الذكاء الاصطناعي لتنسيق أسئلة الدورات بشكل موحد ومنظم.',
            'معالجة الصور التي تحتوي على معادلات أو أسئلة علمية معقدة.',
            'توليد ملف Word نهائي لبنك الأسئلة جاهز للطباعة والنشر.'
        ],
        steps: [
            'قسم الاستخراج (Extraction): تحديد نوع المستند كـ "بنك أسئلة".',
            'إدخال اسم المادة والمرحلة التي يتبع لها البنك.',
            'رفع صور الأسئلة وإرفاق أي ملاحظات هامة.',
            'توليد موجه استخراج البنك وإرساله لـ AI Studio.',
            'قسم التنسيق (Coordination): اختيار نوع التنسيق "بنك أسئلة" ولصق أسئلة البنك المُراجعة.',
            'توليد موجه تنسيق البنوك لضبط مسافات الأسئلة وترقيمها.',
            'قسم Pandoc: لصق بنك الأسئلة المنسق لتوليد ملف Word النهائي.'
        ]
    },
    {
        id: 'draw',
        title: 'الرسم والمخططات البيانية',
        icon: Palette,
        color: 'text-success',
        bgColor: 'bg-success/10',
        borderColor: 'border-success/20',
        description: 'مسار عمل يستخدم الذكاء الاصطناعي لتوليد أكواد Python (باستخدام Matplotlib) لرسم المخططات البيانية وتصديرها كصور.',
        capabilities: [
            'تحويل الأوصاف النصية أو المخططات اليدوية إلى كود برمجي دقيق.',
            'إنشاء مخططات تدفقية، وخرائط مفاهيمية، وشبكات بيانية.',
            'توفير قالب Python لضمان توافق الألوان والخطوط مع هوية المشروع.',
            'تسهيل إدراج الرسومات المولدة داخل مستندات المحاضرة في Word.'
        ],
        steps: [
            'قسم الرسم (Draw): إدخال بيانات المادة والمحاضرة الخاصة بالرسمة.',
            'رفع ما يصل إلى 3 صور مرجعية للرسمة (إن وجدت).',
            'كتابة وصف تفصيلي ودقيق للمخطط أو الرسمة المطلوبة.',
            'توليد الموجه ونسخه إلى AI Studio لإنشاء كود Python.',
            'نسخ الكود المولد ولصقه في بيئة VS Code لتشغيله.',
            'حفظ الصورة الناتجة وإدراجها في ملف Word النهائي.'
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
                <h1 className="text-3xl font-bold text-text">جولة تعريفية مفصلة</h1>
                <p className="text-text-secondary max-w-2xl mx-auto leading-relaxed">
                    تعرف بشكل شامل على قدرات نظام Blue Bits Studio، وكيف تتكامل مسارات العمل المتعددة مع أدوات مثل استوديو الذكاء الاصطناعي، أوبسيديان، وفيجوال ستوديو كود لتحقيق أعلى كفاءة.
                </p>
            </div>

            {/* Workflows */}
            <div className="space-y-8">
                {WORKFLOWS.map((workflow, index) => {
                    const Icon = workflow.icon;
                    return (
                        <div 
                            key={workflow.id}
                            className={\`bg-surface-card border border-border rounded-3xl p-6 md:p-8 relative overflow-hidden group hover:shadow-lg transition-default\`}
                        >
                            <div className={\`absolute -end-12 -top-12 w-48 h-48 \${workflow.bgColor} rounded-full blur-3xl opacity-50 group-hover:opacity-70 transition-default\`} />
                            
                            <div className="relative z-10">
                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-6">
                                    <div className="flex items-start gap-4">
                                        <div className={\`w-14 h-14 rounded-2xl \${workflow.bgColor} flex items-center justify-center shrink-0 border \${workflow.borderColor}\`}>
                                            <Icon size={28} className={workflow.color} strokeWidth={1.5} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-surface-hover text-xs font-bold text-text-secondary">
                                                    {index + 1}
                                                </span>
                                                <h2 className="text-2xl font-bold text-text">{workflow.title}</h2>
                                            </div>
                                            <p className="text-text-secondary leading-relaxed max-w-2xl">{workflow.description}</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => startTour(workflow.id)}
                                        className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-default shadow-lg shadow-primary/20 w-full md:w-auto justify-center"
                                    >
                                        <Play size={18} fill="currentColor" />
                                        ابدأ الجولة التفاعلية
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-surface rounded-2xl p-6 border border-border">
                                        <h3 className="text-sm font-bold text-text mb-4 flex items-center gap-2">
                                            <Sparkles size={16} className={workflow.color} />
                                            ماذا يمكن لهذا المسار أن يفعل؟
                                        </h3>
                                        <ul className="space-y-4">
                                            {workflow.capabilities.map((cap, idx) => (
                                           
