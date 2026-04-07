# Blue Bits - Smart Drawing Engine (AI Ready)

مكتبة رسم المخططات التعليمية للجامعة - لرسم المخططات باستخدام Python وmatplotlib.
تم إعادة هيكلة المحرك بالكامل ليكون نموذجاً ذكياً مستقلاً عن قالب `template.py` القديم لدعم الذكاء الاصطناعي بشكل فائق التطور.

---

## 📁 هيكل المشروع الجديد (Modular Architecture)

```
drawing-scripts/
├── 📂 src/
│   └── 📂 draw_engine/          # محرك الرسم الذكي الجديد (أكثر من 8000 سطر مقسمة)
│       ├── 📂 core/             # إعداد اللوحة، حفظ الصور، والتأطير التلقائي (Auto-bounding)
│       ├── 📂 text/             # معالجة النصوص العربية والمعادلات
│       ├── 📂 shapes/           # الأشكال الذكية التي تعيد حدودها بدقة (primitives, layout, annotations)
│       ├── 📂 connectors/       # الموصلات الذكية والأسهم ذاتية التوجيه (routing)
│       └── 📂 materials/        # وحدات مخصصة لمناهج الجامعة:
│           ├── software_engineering.py  # UML, ER Diagrams, Flowcharts
│           ├── hardware.py              # Logic Gates, CPU, Memory
│           ├── networking.py            # Routers, Switches, Clouds, Topologies
│           ├── computer_science.py      # Trees, Graphs, Data Structures, OS
│           └── ai.py                    # Neural Networks, Fuzzy Logic, Expert Systems
│
├── 📂 tests/                    # اختبارات الوحدة والدمج (34+ Passing Tests)
├── AI_Prompt.md                 # دليل استخدام الذكاء الاصطناعي الحديث لإنتاج المخططات
├── template.py                  # القالب الأساسي القديم (محتفظ به كـ wrapper للتوافقية)
├── mcp_server.py               # خادم MCP
├── AGENTS.md                   # دليل العمل الذري
└── requirements.txt            # المتطلبات
```

---

## 🚀 البدء السريع المطور

### 1. التثبيت

```bash
pip install matplotlib numpy arabic-reshaper python-bidi pytest
```

### 2. إنشاء مخطط باستخدام الأشكال الذكية

```python
# استخدام المحرك الذكي الجديد - لا حاجة لحسابات رياضية معقدة
from src.draw_engine.core import setup_canvas, save_figure, BLUE, WHITE
from src.draw_engine.shapes.primitives import draw_box
from src.draw_engine.connectors.routing import draw_smart_arrow

# 1. إعداد مساحة العمل
fig, ax = setup_canvas()

# 2. رسم الأشكال (الدوال تعيد حدود الشكل تلقائياً)
client = draw_box(ax, 0, 0, 4, 2, text="النظام الأساسي", fill_color=BLUE, text_color=WHITE)
db = draw_box(ax, 6, 0, 4, 2, text="قاعدة البيانات", fill_color=BLUE, text_color=WHITE)

# 3. ربط الأشكال الذكي (يتجنب التداخل ويحدد الزوايا تلقائياً)
draw_smart_arrow(ax, client, db, text="طلب بيانات")

# 4. حفظ الصورة (يعمل auto-bounding لتوسيع اللوحة ومنع قص الأشكال تلقائياً)
save_figure(fig, 'example_output')
```

---

## 🧪 الاختبارات (Test Driven)

تم بناء أكثر من 30 اختبار (Unit Tests) لضمان متانة كافة المكونات الموزعة للمحرك:

```bash
set PYTHONPATH=. && pytest tests/
```

### نتائج الاختبارات الحالية:
- **Core & Text**: ✅ `PASSED`
- **Shapes & Layouts**: ✅ `PASSED` 
- **Connectors**: ✅ `PASSED`
- **Curriculum Materials (AI, Hardware, Networking, CS, SE)**: ✅ `PASSED`

**الإجمالي: 34/34 اجتازت بنجاح**