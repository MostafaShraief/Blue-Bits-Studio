const fs = require('fs');

let content = fs.readFileSync('src/pages/Dashboard.jsx', 'utf8');

// Replace the header part that had the small button
content = content.replace(
    /<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">([\s\S]*?)<\/div>\s*<\/div>/,
    `<div>
                <h1 className="text-2xl font-bold text-text">لوحة التحكم</h1>
                <p className="text-sm text-text-secondary mt-1">مرحباً بك في Blue Bits Studio</p>
            </div>`
);

// Insert the banner after Header and before Stats
content = content.replace(
    /\{\/\* Stats \*\/\}/,
    `{/* Welcome Tour Banner */}
            <div className="bg-gradient-to-r from-primary to-blue-600 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-xl shadow-primary/20">
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                            <Sparkles className="text-yellow-300" />
                            مرحباً بك في نظام Blue Bits Studio
                        </h2>
                        <p className="text-white/80 max-w-xl text-sm leading-relaxed">
                            تعرف على مسارات العمل الرئيسية في النظام وكيفية استخدام الأدوات المختلفة مثل الذكاء الاصطناعي لاستخراج وتنسيق المحاضرات وبنوك الأسئلة والرسم.
                        </p>
                    </div>
                    <Link
                        to="/tour"
                        className="shrink-0 inline-flex items-center gap-2 px-6 py-3 bg-white text-primary font-bold rounded-xl hover:bg-gray-50 transition-default shadow-sm"
                    >
                        ابدأ الجولة التعريفية
                        <ArrowLeft size={18} />
                    </Link>
                </div>
                <div className="absolute -end-20 -top-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            </div>

            {/* Stats */}`
);

fs.writeFileSync('src/pages/Dashboard.jsx', content);
