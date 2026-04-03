import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';

const TourContext = createContext();

const TOUR_DATA = {
    lecture: [
        { path: '/extraction?type=lecture', selector: '[data-tour="extraction-type"]', title: 'تحديد نوع المستند', content: 'في هذه الخطوة الأولى، نحدد نوع الملف كـ "محاضرة". هذا يضمن اختيار الموجه (Prompt) الصحيح للذكاء الاصطناعي.' },
        { path: '/extraction?type=lecture', selector: '[data-tour="extraction-metadata"]', title: 'بيانات المحاضرة', content: 'نقوم بإدخال اسم المادة ورقم المحاضرة. هذه البيانات مهمة لتسمية الملف النهائي لاحقاً بشكل صحيح.' },
        { path: '/extraction?type=lecture', selector: '[data-tour="extraction-images"]', title: 'رفع الصور والملاحظات', content: 'أضف الصور هنا، واكتب ملاحظاتك الخاصة بكل صورة لتوجيه الذكاء الاصطناعي لاستخراج المحتوى بدقة.' },
        { path: '/extraction?type=lecture', selector: '[data-tour="extraction-preview"]', title: 'توليد ونسخ الموجه (Prompt)', content: 'يقوم النظام بدمج معلوماتك مع الموجه الأساسي. يمكنك النسخ والتوجه إلى AI Studio لاستخراج النص.' },
        { path: '/coordination', selector: '[data-tour="coordination-type"]', title: 'مرحلة التنسيق', content: 'بعد تصحيح النص في Obsidian، ألصقه هنا مع تحديد نوع المحتوى كـ "محاضرة" للحصول على موجه التنسيق.' },
        { path: '/pandoc', selector: '[data-tour="pandoc-metadata"]', title: 'التحويل النهائي', content: 'ألصق النص المنسق، وتأكد من البيانات ليتم التحويل إلى ملف Word جاهز ومنسق عبر Pandoc.' }
    ],
    bank: [
        { path: '/extraction?type=bank', selector: '[data-tour="extraction-type"]', title: 'تحديد نوع المستند', content: 'اختر "بنك أسئلة" ليقوم النظام باختيار الموجه المخصص لاستخراج وبناء الأسئلة بشكل منظم.' },
        { path: '/extraction?type=bank', selector: '[data-tour="extraction-metadata"]', title: 'بيانات البنك', content: 'أدخل اسم المادة واسم البنك لتنظيم الملفات النهائية.' },
        { path: '/extraction?type=bank', selector: '[data-tour="extraction-images"]', title: 'رفع الصور والملاحظات', content: 'أضف صور الأسئلة، ويمكنك إضافة ملاحظات لحل أو الانتباه لأسئلة معينة.' },
        { path: '/extraction?type=bank', selector: '[data-tour="extraction-preview"]', title: 'توليد الموجه', content: 'انسخ الموجه واذهب إلى AI Studio ليقوم باستخراج وتحليل البنك.' },
        { path: '/coordination', selector: '[data-tour="coordination-type"]', title: 'تنسيق البنك', content: 'ألصق أسئلة البنك هنا وتأكد من اختيار "بنك أسئلة" للحصول على تنسيق البنوك.' },
        { path: '/pandoc', selector: '[data-tour="pandoc-metadata"]', title: 'تحويل البنك لـ Word', content: 'قم بإتمام الخطوة لتحويل النص المنسق إلى ملف Word لبنك الأسئلة.' }
    ],
    draw: [
        { path: '/draw', selector: '[data-tour="draw-metadata"]', title: 'بيانات الرسمة', content: 'أدخل اسم المادة ورقم المحاضرة المتعلقة بالرسمة.' },
        { path: '/draw', selector: '[data-tour="draw-images"]', title: 'الصور الوصفية', content: 'يمكنك رفع 3 صور كحد أقصى لتوضيح المخطط للذكاء الاصطناعي مع كتابة ملاحظة لكل صورة.' },
        { path: '/draw', selector: '[data-tour="draw-description"]', title: 'وصف الرسمة العام', content: 'اشرح تفاصيل الرسمة المطلوبة بدقة (مثلاً: مخطط تدفقي، شجرة بيانية).' },
        { path: '/draw', selector: '[data-tour="draw-preview"]', title: 'استخراج الكود', content: 'انسخ الموجه وأرسله لـ AI Studio للحصول على كود بايثون للرسمة.' },
        { path: '/draw', selector: '.vscode-step-fallback', title: 'بيئة VS Code', content: 'قم بفتح بيئة VS Code المجهزة بمشروعك، والصق الكود لتوليد الصورة وإضافتها لـ Word.' }
    ]
};

export const TourProvider = ({ children }) => {
    const [isActive, setIsActive] = useState(false);
    const [currentWorkflow, setCurrentWorkflow] = useState(null);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const navigate = useNavigate();
    const location = useLocation();

    const startTour = (workflowId) => {
        if (TOUR_DATA[workflowId]) {
            setCurrentWorkflow(workflowId);
            setCurrentStepIndex(0);
            setIsActive(true);
            const initialPath = TOUR_DATA[workflowId][0].path;
            if (location.pathname + location.search !== initialPath) {
                navigate(initialPath);
            }
        }
    };

    const stopTour = () => {
        setIsActive(false);
        setCurrentWorkflow(null);
        setCurrentStepIndex(0);
    };

    const nextStep = () => {
        if (!isActive || !currentWorkflow) return;
        const workflow = TOUR_DATA[currentWorkflow];
        if (currentStepIndex < workflow.length - 1) {
            const nextIdx = currentStepIndex + 1;
            setCurrentStepIndex(nextIdx);
            const nextPath = workflow[nextIdx].path;
            
            // Normalize current path by stripping trailing query string if needed
            // But we actually use specific paths with query strings like ?type=lecture
            // So we compare exact paths
            navigate(nextPath);
        } else {
            stopTour();
        }
    };

    const prevStep = () => {
        if (currentStepIndex > 0) {
            const prevIdx = currentStepIndex - 1;
            setCurrentStepIndex(prevIdx);
            navigate(TOUR_DATA[currentWorkflow][prevIdx].path);
        }
    };

    const currentStep = isActive && currentWorkflow ? TOUR_DATA[currentWorkflow][currentStepIndex] : null;

    return (
        <TourContext.Provider value={{ isActive, currentStep, startTour, stopTour, nextStep, prevStep, currentStepIndex, totalSteps: currentWorkflow ? TOUR_DATA[currentWorkflow].length : 0 }}>
            {children}
        </TourContext.Provider>
    );
};

export const useTour = () => useContext(TourContext);
