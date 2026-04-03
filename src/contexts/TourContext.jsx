import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';

const TourContext = createContext();

const TOUR_DATA = {
    lecture: [
        { path: '/extraction?type=lecture', selector: '[data-tour="extraction-type"]', title: 'تحديد نوع المستند', content: 'في هذه الخطوة الأولى، نحدد نوع الملف كـ "محاضرة". هذا يضمن اختيار الموجه (Prompt) الصحيح للذكاء الاصطناعي.', autoFill: () => {
            const btn = document.querySelector('button[value="lecture"]');
            if (btn) btn.click();
        }},
        { path: '/extraction?type=lecture', selector: '[data-tour="extraction-metadata"]', title: 'بيانات المحاضرة', content: 'نقوم بإدخال اسم المادة ورقم المحاضرة. هذه البيانات مهمة لتسمية الملف النهائي لاحقاً بشكل صحيح.', autoFill: () => {
            const matName = document.querySelector('input[placeholder*="اسم المادة"]');
            const lecNum = document.querySelector('input[placeholder*="رقم المحاضرة"]');
            if (matName) {
                const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
                nativeInputValueSetter.call(matName, 'مقدمة في قواعد البيانات');
                matName.dispatchEvent(new Event('input', { bubbles: true }));
            }
            if (lecNum) {
                const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
                nativeInputValueSetter.call(lecNum, '1');
                lecNum.dispatchEvent(new Event('input', { bubbles: true }));
            }
        }},
        { path: '/extraction?type=lecture', selector: '[data-tour="extraction-images"]', title: 'رفع الصور والملاحظات', content: 'أضف الصور هنا، واكتب ملاحظاتك الخاصة بكل صورة لتوجيه الذكاء الاصطناعي لاستخراج المحتوى بدقة.', autoFill: async () => {
            try {
                // Create a dummy blank image blob
                const canvas = document.createElement('canvas');
                canvas.width = 100; canvas.height = 100;
                const ctx = canvas.getContext('2d');
                ctx.fillStyle = '#ccc';
                ctx.fillRect(0, 0, 100, 100);
                const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
                const file = new File([blob], 'dummy.png', { type: 'image/png' });
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(file);
                const event = new ClipboardEvent('paste', {
                    clipboardData: dataTransfer,
                    bubbles: true
                });
                window.dispatchEvent(event);
                
                setTimeout(() => {
                    const notesArea = document.querySelector('textarea[placeholder*="ملاحظات لهذه الصورة"]');
                    if (notesArea) {
                        const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value").set;
                        nativeSetter.call(notesArea, 'استخرج النصوص كما هي مع الحفاظ على التنسيق.');
                        notesArea.dispatchEvent(new Event('input', { bubbles: true }));
                    }
                }, 100);
            } catch (e) {}
        }},
        { path: '/extraction?type=lecture', selector: '[data-tour="extraction-preview"]', title: 'توليد ونسخ الموجه (Prompt)', content: 'يقوم النظام بدمج معلوماتك مع الموجه الأساسي. يمكنك النسخ والتوجه إلى AI Studio لاستخراج النص.' },
        { path: '/coordination', selector: '[data-tour="coordination-type"]', title: 'مرحلة التنسيق', content: 'بعد تصحيح النص في Obsidian، ألصقه هنا مع تحديد نوع المحتوى كـ "محاضرة" للحصول على موجه التنسيق.', autoFill: () => {
            const btn = document.querySelector('button[value="lecture"]');
            if (btn) btn.click();
            const textArea = document.querySelector('textarea');
            if (textArea) {
                const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value").set;
                nativeSetter.call(textArea, 'محتوى المحاضرة المستخرج هنا...');
                textArea.dispatchEvent(new Event('input', { bubbles: true }));
            }
        }},
        { path: '/pandoc', selector: '[data-tour="pandoc-metadata"]', title: 'التحويل النهائي', content: 'ألصق النص المنسق، وتأكد من البيانات ليتم التحويل إلى ملف Word جاهز ومنسق عبر Pandoc.', autoFill: () => {
            const contentArea = document.querySelector('textarea[placeholder*="محتوى"]');
            if (contentArea) {
                const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value").set;
                nativeSetter.call(contentArea, '# مقدمة\nهذا محتوى منسق وجاهز للتحويل.');
                contentArea.dispatchEvent(new Event('input', { bubbles: true }));
            }
            const matName = document.querySelector('input[placeholder*="اسم المادة"]');
            if (matName) {
                const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
                nativeSetter.call(matName, 'مقدمة في قواعد البيانات');
                matName.dispatchEvent(new Event('input', { bubbles: true }));
            }
            
            setTimeout(() => {
                const genBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('تحويل') || b.textContent.includes('Generate'));
                if (genBtn) genBtn.click();
            }, 100);
        }}
    ],
    bank: [
        { path: '/extraction?type=bank', selector: '[data-tour="extraction-type"]', title: 'تحديد نوع المستند', content: 'اختر "بنك أسئلة" ليقوم النظام باختيار الموجه المخصص لاستخراج وبناء الأسئلة بشكل منظم.', autoFill: () => {
            const btn = document.querySelector('button[value="bank"]');
            if (btn) btn.click();
        }},
        { path: '/extraction?type=bank', selector: '[data-tour="extraction-metadata"]', title: 'بيانات البنك', content: 'أدخل اسم المادة واسم البنك لتنظيم الملفات النهائية.', autoFill: () => {
            const matName = document.querySelector('input[placeholder*="اسم المادة"]');
            const bankName = document.querySelector('input[placeholder*="اسم البنك"]');
            if (matName) {
                const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
                nativeSetter.call(matName, 'فيزياء عامة');
                matName.dispatchEvent(new Event('input', { bubbles: true }));
            }
            if (bankName) {
                const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
                nativeSetter.call(bankName, 'بنك الميدتيرم');
                bankName.dispatchEvent(new Event('input', { bubbles: true }));
            }
        }},
        { path: '/extraction?type=bank', selector: '[data-tour="extraction-images"]', title: 'رفع الصور والملاحظات', content: 'أضف صور الأسئلة، ويمكنك إضافة ملاحظات لحل أو الانتباه لأسئلة معينة.', autoFill: async () => {
            try {
                const canvas = document.createElement('canvas');
                canvas.width = 100; canvas.height = 100;
                const ctx = canvas.getContext('2d');
                ctx.fillStyle = '#10b981';
                ctx.fillRect(0, 0, 100, 100);
                const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
                const file = new File([blob], 'dummy-bank.png', { type: 'image/png' });
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(file);
                const event = new ClipboardEvent('paste', { clipboardData: dataTransfer, bubbles: true });
                window.dispatchEvent(event);
                
                setTimeout(() => {
                    const notesArea = document.querySelector('textarea[placeholder*="ملاحظات لهذه الصورة"]');
                    if (notesArea) {
                        const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value").set;
                        nativeSetter.call(notesArea, 'رجاء استخراج الخيارات المتعددة بشكل واضح.');
                        notesArea.dispatchEvent(new Event('input', { bubbles: true }));
                    }
                }, 100);
            } catch(e) {}
        }},
        { path: '/extraction?type=bank', selector: '[data-tour="extraction-preview"]', title: 'توليد الموجه', content: 'انسخ الموجه واذهب إلى AI Studio ليقوم باستخراج وتحليل البنك.' },
        { path: '/coordination', selector: '[data-tour="coordination-type"]', title: 'تنسيق البنك', content: 'ألصق أسئلة البنك هنا وتأكد من اختيار "بنك أسئلة" للحصول على تنسيق البنوك.', autoFill: () => {
            const btn = document.querySelector('button[value="bank"]');
            if (btn) btn.click();
            const textArea = document.querySelector('textarea');
            if (textArea) {
                const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value").set;
                nativeSetter.call(textArea, 'السؤال الأول: ما هي السرعة؟\nأ) مسافة ب) زمن');
                textArea.dispatchEvent(new Event('input', { bubbles: true }));
            }
        }},
        { path: '/pandoc', selector: '[data-tour="pandoc-metadata"]', title: 'تحويل البنك لـ Word', content: 'قم بإتمام الخطوة لتحويل النص المنسق إلى ملف Word لبنك الأسئلة.', autoFill: () => {
            const matName = document.querySelector('input[placeholder*="اسم المادة"]');
            if (matName) {
                const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
                nativeSetter.call(matName, 'فيزياء عامة');
                matName.dispatchEvent(new Event('input', { bubbles: true }));
            }
        }}
    ],
    draw: [
        { path: '/draw', selector: '[data-tour="draw-metadata"]', title: 'بيانات الرسمة', content: 'أدخل اسم المادة ورقم المحاضرة المتعلقة بالرسمة.', autoFill: () => {
            const matName = document.querySelector('input[placeholder*="المادة"]');
            const lecNum = document.querySelector('input[placeholder*="رقم"]');
            if (matName) {
                const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
                nativeSetter.call(matName, 'خوارزميات');
                matName.dispatchEvent(new Event('input', { bubbles: true }));
            }
            if (lecNum) {
                const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
                nativeSetter.call(lecNum, '3');
                lecNum.dispatchEvent(new Event('input', { bubbles: true }));
            }
        }},
        { path: '/draw', selector: '[data-tour="draw-images"]', title: 'الصور الوصفية', content: 'يمكنك رفع 3 صور كحد أقصى لتوضيح المخطط للذكاء الاصطناعي مع كتابة ملاحظة لكل صورة.', autoFill: async () => {
            try {
                const canvas = document.createElement('canvas');
                canvas.width = 100; canvas.height = 100;
                const ctx = canvas.getContext('2d');
                ctx.fillStyle = '#f59e0b';
                ctx.fillRect(0, 0, 100, 100);
                const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
                const file = new File([blob], 'dummy-draw.png', { type: 'image/png' });
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(file);
                const event = new ClipboardEvent('paste', { clipboardData: dataTransfer, bubbles: true });
                window.dispatchEvent(event);
            } catch(e) {}
        }},
        { path: '/draw', selector: '[data-tour="draw-description"]', title: 'وصف الرسمة العام', content: 'اشرح تفاصيل الرسمة المطلوبة بدقة (مثلاً: مخطط تدفقي، شجرة بيانية).', autoFill: () => {
            const textArea = document.querySelector('textarea[placeholder*="اكتب وصفاً دقيقاً"]');
            if (textArea) {
                const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value").set;
                nativeSetter.call(textArea, 'ارسم شجرة بحث ثنائية مع توضيح العقد الجذري.');
                textArea.dispatchEvent(new Event('input', { bubbles: true }));
            }
        }},
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

    const nextStep = async () => {
        if (!isActive || !currentWorkflow) return;
        const workflow = TOUR_DATA[currentWorkflow];
        
        // Execute autoFill of current step before proceeding
        const currentStepData = workflow[currentStepIndex];
        if (currentStepData && typeof currentStepData.autoFill === 'function') {
            try {
                await currentStepData.autoFill();
            } catch(e) {
                console.error("AutoFill error:", e);
            }
        }

        setTimeout(() => {
            if (currentStepIndex < workflow.length - 1) {
                const nextIdx = currentStepIndex + 1;
                setCurrentStepIndex(nextIdx);
                const nextPath = workflow[nextIdx].path;
                navigate(nextPath);
            } else {
                stopTour();
            }
        }, 300); // Wait briefly before navigating
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
