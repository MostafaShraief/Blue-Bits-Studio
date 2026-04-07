# Blue Bits - Diagram Generation Library

مكتبة رسم المخططات التعليمية للجامعة - لرسم المخططات باستخدام Python وmatplotlib.

---

## 📁 هيكل المشروع

```
drawing-scripts/
├── 📂 docs/                     # التوثيق
│   ├── ai-prompt-guide.md       # دليل استخدام الذكاء الاصطناعي
│   ├── mcp-guide.md            # دليل خادم MCP
│   ├── 📂 outputs/              # مخرجات الـ AI (الصور المُنتَجة)
│
├── 📂 test-output/             # نتائج الاختبارات
│   ├── unit/                   # اختبارات الوحدة
│   └── integration/            # الاختبارات المتكاملة
│
├── template.py                  # القالب الأساسي (104 دالة شاملة)
├── generators.py               # 57 مُنتج مخططات
├── list.md                     # قائمة المهام والمميزات
├── AGENTS.md                   # دليل العمل الذري
├── .gitignore                  # تجاهل الملفات
└── requirements.txt            # المتطلبات
```

---

## 🚀 البدء السريع

### 1. التثبيت

```bash
pip install matplotlib numpy arabic-reshaper python-bidi
```

### 2. إنشاء مخطط

```python
from template import *
from generators import *

# مثال: رسم مخطط فون نيومان
fig = generate_von_neumann_architecture()
save_figure(fig, 'von-neumann')

# مثال: رسم شجرة ثنائية
fig = generate_binary_tree()
save_figure(fig, 'binary-tree')

# مثال: رسم OSI
fig = generate_osi_model()
save_figure(fig, 'osi-model')
```

### 3. النتيجة

يُنتج ملفين لكل مخطط:
- `filename.svg` - صورة متجهة (للتكبير)
- `filename.png` - صورة عادية (300 DPI)

---

## 📋 القالب الشامل (104 دالة)

### الدوال الأساسية (29)
| الدالة | الوصف |
|--------|-------|
| `setup_canvas()` | إنشاء canvas مع خلفية شفافة |
| `save_figure()` | حفظ كـ SVG + PNG |
| `get_font_prop()` | الحصول على خط عربي |
| `get_code_font_prop()` | الحصول على خط الكود |
| `handle_arabic()` | معالجة النص العربي |
| `add_rich_text()` | نص ملون متعدد الأجزاء |
| `add_text()` | نص عربي بسيط |
| `draw_box()` | مستطيل مع نص |
| `draw_circle()` | دائرة مع نص |
| `draw_diamond()` | معين (علاقات ER) |
| `draw_arrow()` | سهم مع نص |
| `draw_table()` | جدول بصفوف وأعمدة |
| `draw_entity()` | كيان ER |
| `draw_relationship()` | علاقة ER |
| `draw_attribute()` | خاصية ER |
| `connect()` | خط ربط |
| `add_title()` | عنوان المخطط |
| `add_subtitle()` | عنوان فرعي |
| `add_label()` | تسمية صغيرة |
| `add_legend()` | مفتاح الألوان |
| `add_caption()` | شرح أسفل المخطط |
| `add_page_number()` | رقم الصفحة |
| `add_watermark()` | علامة مائية |
| `add_divider()` | خط فاصل |
| `add_code_block()` | كتلة كود |
| `add_math_expression()` | تعبير رياضي |
| `add_numbered_list()` | قائمة مرقمة |
| `add_section_header()` | عنوان قسم |

### أشكال الانسياب (5)
| الدالة | الوصف |
|--------|-------|
| `draw_parallelogram()` | متوازي أضلاع (I/O) |
| `draw_hexagon()` | مسدس (decision) |
| `draw_stadium()` | ملعب (start/end) |
| `draw_cloud()` | سحابة (cloud computing) |
| `draw_cylinder()` | أسطوانة (database) |

### UML/البرمجيات (5)
| الدالة | الوصف |
|--------|-------|
| `draw_package()` | حزمة UML |
| `draw_port()` | منفذ UML |
| `draw_node()` | عقدة نشر |
| `draw_interface()` | واجهة UML |
| `draw_artifact()` | قطعة نشر |

### الشبكات/الحوسبة السحابية (4)
| الدالة | الوصف |
|--------|-------|
| `draw_cloud_shape()` | شكل سحابة |
| `draw_server()` | خادم |
| `draw_database_cylinder()` | قاعدة بيانات |
| `draw_device()` | جهاز شبكة |

### الموصلات المتقدمة (5)
| الدالة | الوصف |
|--------|-------|
| `draw_orthogonal_arrow()` | سهم زاوية قائمة |
| `draw_curved_arrow()` | سهم منحني |
| `draw_dashed_arrow()` | سهم متقطع |
| `draw_double_arrow()` | سهم ثنائي الاتجاه |
| `draw_arrow_with_label()` | سهم مع تسمية |

### التخطيط (4)
| الدالة | الوصف |
|--------|-------|
| `draw_grid()` | شبكة |
| `add_axis()` | محور |
| `draw_ruler()` | مسطرة |
| `snap_to_grid()` | محاذاة للشبكة |

### التعليقات البصرية (5)
| الدالة | الوصف |
|--------|-------|
| `draw_callout()` | تعليق |
| `draw_bubble()` | فقاعة |
| `draw_footnote()` | حاشية |
| `draw_sticky_note()` | ملاحظة لاصقة |
| `draw_highlight_box()` | صندوق تمييز |

### التجميع/التنسيق (3)
| الدالة | الوصف |
|--------|-------|
| `draw_group()` | مجموعة |
| `draw_shadow()` | ظل |
| `draw_dotted_box()` | صندوق منقط |

### تصور البيانات (4)
| الدالة | الوصف |
|--------|-------|
| `draw_bar()` | شريط |
| `draw_pie_slice()` | قطاع |
| `draw_legend_item()` | عنصر مفتاح |
| `draw_axis_line()` | خط المحور |

### النص المتقدم (4)
| الدالة | الوصف |
|--------|-------|
| `add_rotated_text()` | نص مقلوب |
| `add_vertical_text()` | نص عمودي |
| `add_text_with_bg()` | نص مع خلفية |
| `add_code_with_syntax()` | كود ملون |

### الرياضيات والإحصاء (7)
| الدالة | الوصف |
|--------|-------|
| `draw_function_graph()` | رسم دالة رياضية |
| `draw_histogram()` | مدرج تكراري |
| `draw_boxplot()` | صندوق وذراع |
| `draw_scatter_plot()` | رسم نقاط |
| `draw_normal_curve()` | منحنى طبيعي |
| `draw_vector_field()` | حقل متجهات |
| `draw_equation()` | معادلة رياضية |

### الخوارزميات (6)
| الدالة | الوصف |
|--------|-------|
| `draw_pseudocode_block()` | كتلة pseudo-code |
| `draw_complexity_label()` | تسمية Big-O |
| `draw_step_indicator()` | مؤشر الخطوة |
| `draw_state_diagram()` | رسم حالة |
| `draw_transition_table()` | جدول انتقالات |
| `draw_recursion_tree_enhanced()` | شجرة استدعاء محسنة |

### التوقيت والإشارات (4)
| الدالة | الوصف |
|--------|-------|
| `draw_timing_diagram()` | رسم توقيت |
| `draw_signal_waveform()` | موجة إشارة |
| `draw_pipeline_stage()` | مرحلة خط أنابيب |
| `draw_bus_diagram()` | ناقل بيانات |

### الإلكترونيات والدارات (5)
| الدالة | الوصف |
|--------|-------|
| `draw_logic_gate()` | بوابة منطقية |
| `draw_register_box()` | مسجل |
| `draw_alu_block()` | وحدة ALU |
| `draw_memory_array()` | مصفوفة ذاكرة |
| `draw_mux_demux()` | متعدد/فات |

### UML المحسن (3)
| الدالة | الوصف |
|--------|-------|
| `draw_sequence_fragment()` | جزء تسلسل |
| `draw_activation_box()` | صندوق تفعيل |
| `draw_self_message()` | رسالة ذاتية |

### نظم التشغيل (4)
| الدالة | الوصف |
|--------|-------|
| `draw_process_tree()` | شجرة عمليات |
| `draw_memory_layout()` | تخطيط الذاكرة |
| `draw_page_table()` | جدول الصفحات |
| `draw_thread_block()` | كتلة مؤشر ترابط |

### قواعد البيانات المحسن (3)
| الدالة | الوصف |
|--------|-------|
| `draw_foreign_key_arrow()` | سهم مفتاح خارجي |
| `draw_primary_key_indicator()` | مؤشر المفتاح الأساسي |
| `draw_view_box()` | صندوق عرض |

### الشبكات المحسن (3)
| الدالة | الوصف |
|--------|-------|
| `draw_packet_header()` |头部 paquete |
| `draw_protocol_stack()` | مكدس بروتوكول |
| `draw_network_timeline()` | جدول زمني للشبكة |

---

## 📋 قائمة المخططات المتاحة (57 مخطط)

### 1. مبادئ الحاسوب
- `generate_von_neumann_architecture()` - بنية فون نيومان
- `generate_cpu_cycle()` - دورة المعالجة
- `generate_memory_hierarchy()` - الهرمية الذاكري

### 2. البرمجة
- `generate_flowchart_basic()` - مخطط انسيابي
- `generate_loop_trace_table()` - جدول تتبع الحلقة
- `generate_recursion_tree()` - شجرة الاستدعاء الذاتي
- `generate_linked_list_viz()` - قائمة مرتبطة
- `generate_stack_viz()` - المكدس
- `generate_queue_viz()` - الرتل

### 3. هياكل البيانات والخوارزميات
- `generate_binary_tree()` - شجرة ثنائية
- `generate_binary_search_tree()` - شجرة بحث ثنائية
- `generate_hash_table()` - جدول التجزئة
- `generate_sorting_visualization()` - الترتيب
- `generate_graph_dijkstra()` - خوارزمية ديكسترا
- `generate_big_o_comparison()` - مقارنة التعقيد
- `generate_dfs_bfs_traversal()` -DFS/BFS
- `generate_dynamic_programming_table()` - برمجة ديناميكية

### 4. قواعد البيانات
- `generate_er_diagram_university()` - مخطط ER
- `generate_relational_schema()` - المخطط العلائقي
- `generate_bplus_tree()` - شجرة B+
- `generate_normalization_steps()` - التسوية
- `generate_query_execution_tree()` - خطة الاستعلام
- `generate_transaction_schedule()` - جدول المعاملات

### 5. UML
- `generate_uml_class_diagram()` - مخطط الفئات
- `generate_uml_sequence_diagram()` - مخطط التسلسل
- `generate_uml_state_machine()` - مخطط الحالة
- `generate_uml_activity_diagram()` - مخطط النشاط
- `generate_uml_use_case_diagram()` - حالات الاستخدام
- `generate_uml_component_diagram()` - المكونات
- `generate_uml_deployment_diagram()` - النشر

### 6. الشبكات
- `generate_osi_model()` - نموذج OSI
- `generate_tcp_ip_model()` - نموذج TCP/IP
- `generate_network_topology()` - الطوبولوجيا
- `generate_routing_table()` - جدول التوجيه
- `generate_packet_flow()` - تدفق الحزمة
- `generate_dns_resolution()` - حل DNS

### 7. نظم التشغيل
- `generate_process_state_diagram()` - حالات العملية
- `generate_scheduling_gantt()` - مخطط غانت
- `generate_memory_management()` - إدارة الذاكرة
- `generate_deadlock_graph()` - Deadlock
- `generate_semaphore_operations()` - Semaphore

### 8. الإلكترونيات
- `generate_logic_gates()` - البوابات المنطقية
- `generate_karnaugh_map()` - خريطة كارنوف
- `generate_flip_flop_circuit()` - Flip-Flop
- `generate_combinational_circuit()` - دارة توافقية
- `generate_transistor_circuit()` - دارة الترانزستور

### 9. الرياضيات
- `generate_function_plot()` - رسم الدالة
- `generate_derivative_visualization()` - المشتقة
- `generate_matrix_operations()` - المصفوفات
- `generate_vector_space()` - فضاء المتجهات
- `generate_fourier_transform()` - فورييه

### 10. الذكاء الاصطناعي
- `generate_neural_network()` - الشبكة العصبية
- `generate_decision_tree()` - شجرة القرار
- `generate_search_tree()` - شجرة البحث
- `generate_genetic_algorithm()` - الخوارزمية الجينية
- `generate_fuzzy_logic_sets()` - المجموعات الضبابية

### 11. بنية الحاسب
- `generate_cpu_datapath()` - CPU Datapath
- `generate_pipeline_diagram()` - خط الأنابيب
- `generate_cache_organization()` - تنظيم Cache
- `generate_instruction_format()` - تنسيق التعليمات

### 12. لغات صورية
- `generate_dfa_diagram()` - DFA
- `generate_nfa_diagram()` - NFA
- `generate_parse_tree_formal()` - شجرة التحليل

---

## 🤖 استخدام الذكاء الاصطناعي مع الرؤية

### الطريقة:

1. **اكتب ملاحظاتك** في `docs/inputs/`:
   ```markdown
   # ملاحظات للمخطط
   أريد مخطط ER لجامعة عربي
   الكيانات: طالب، مادة، قسم
   العلاقات: طالب->يسجل<-مادة
   ```

2. **أرسل للصورة AI** مع:
   - `الرسم بالذكاء الاصطناعي.md` كمرجع
   - ملاحظاتك من `docs/inputs/`

3. **احفظ النتيجة** في `docs/outputs/`

### مثال علىprompt للـ AI:

```
أنت متخصص في رسم المخططات باستخدام matplotlib.

استخدم ملف template.py الموجود.
اتبع الدليل في docs/ai-prompt-guide.md
استخدم الألوان:
- BLUE = '#0072BD'
- GREEN = '#009E73'  
- RED = '#D32F2F'

المطلوب: مخطط ER لجامعة
- كيانات: طالب(رقم، اسم)، مادة(رمز، اسم)، قسم(اسم)
- علاقات: طالب يسجل مادة (1:N)، قسم يدرس مادة (1:N)

اكتب الكود وطبقه واحفظه في docs/outputs/er-diagram
```

---

## 🧪 الاختبارات

### تشغيل جميع الاختبارات:

```bash
python test_template_unit.py      # 47 اختبار
python test_template_integration.py # 8 اختبارات
python test_new_utilities.py      # 16 اختبار
```

### نتائج الاختبارات:

| النوع | العدد | الحالة |
|-------|-------|--------|
| Unit Tests | 47 | ✅ PASS |
| Integration Tests | 8 | ✅ PASS |
| New Utilities | 16 | ✅ PASS |

**الإجمالي: 71/71 ✅**

---

## 🎨 الألوان المستخدمة

```python
BLUE  = '#0072BD'  # الرئيسي
GREEN = '#009E73'  # للنجاح/البيانات
CYAN  = '#33C9FF'  # للتأكيد
RED   = '#D32F2F'  # للأخطاء/التوقف
BLACK = 'black'    # للنص
WHITE = 'white'    # للخلفية
GRAY  = '#9E9E9E'  # للثانوي
```

---

## 📝 الالتزام بالعمل الذري

ارجع إلى `AGENTS.md` للتأكد من:
- كل commit يحتوي على تغيير واحد فقط
- رسائل واضحة تشرح"Why" وليس"What"
- حجم الالتزام: 1-5 ملفات، <200 سطر

---

## 📞 المساعدة

- `list.md` - قائمة كل المميزات
- `docs/ai-prompt-guide.md` - دليل الذكاء الاصطناعي
- `docs/mcp-guide.md` - دليل خادم MCP
- `test-output/` - أمثلة على المخططات المُنتَجة
- `.opencode/todo.md` - مهام التطوير القادمة

---

**ملف المشروع التأسيسي للجامعة - 2026**