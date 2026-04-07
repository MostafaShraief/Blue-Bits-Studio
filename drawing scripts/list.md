# Feature Backlog & TODO

> Track all planned features, enhancements, and improvements.
> Each item should be atomic and independently testable.

---

## Status Legend
| Tag | Meaning |
|-----|---------|
| `[ ]` | Not started |
| `[~]` | In progress |
| `[x]` | Completed & tested |
| `[!]` | Blocked (needs clarification) |
| `[-]` | Cancelled |

## Priority Levels
- 🔴 **P0** — Critical / Must have
- 🟡 **P1** — Important / Should have
- 🟢 **P2** — Nice to have / Could have
- ⚪ **P3** — Future / Wishlist

---

## Phase 1: Core Infrastructure ✅ COMPLETE

- [x] `.gitignore` — Python + Node.js project coverage
- [x] `AGENTS.md` — Atomic commit guidelines for all agents
- [x] `template.py` — Core drawing template with 104 functions
- [x] `generators.py` — 57 diagram generators across 18 sections
- [x] Unit tests — 47/47 PASS
- [x] Integration tests — 8/8 PASS
- [x] New utilities tests — 16/16 PASS
- [x] `test-output/` — Separate folder for test results

---

## Phase 2: University-Level Professional Functions ✅ COMPLETE

### Category A: Advanced Math & Statistics (7/7)
- [x] A1: `draw_function_graph(ax, expr, x_range, ...)` - Plot mathematical functions
- [x] A2: `draw_3d_surface(ax, z_func, ...)` - 3D surface plot (via matplotlib)
- [x] A3: `draw_histogram(ax, data, bins, ...)` - Statistical histogram
- [x] A4: `draw_boxplot(ax, data, ...)` - Box and whisker plot
- [x] A5: `draw_scatter_plot(ax, x_data, y_data, ...)` - Scatter with optional regression
- [x] A6: `draw_normal_curve(ax, mu, sigma, ...)` - Bell curve overlay
- [x] A7: `draw_vector_field(ax, u_func, v_func, ...)` - Vector field arrows

### Category B: Algorithm & CS Visualization (6/6)
- [x] B1: `draw_pseudocode_block(ax, x, y, lines, ...)` - Algorithm pseudo-code
- [x] B2: `draw_complexity_label(ax, x, y, complexity, ...)` - Big-O notation
- [x] B3: `draw_step_indicator(ax, step_num, x, y, ...)` - Algorithm step marker
- [x] B4: `draw_state_diagram(ax, states, transitions, ...)` - State machine
- [x] B5: `draw_transition_table(ax, states, inputs, ...)` - State transition table
- [x] B6: `draw_recursion_tree_enhanced(ax, nodes, ...)` - Enhanced recursion tree

### Category C: Timing & Signal Diagrams (4/4)
- [x] C1: `draw_timing_diagram(ax, signals, time_scale, ...)` - Timing waveforms
- [x] C2: `draw_signal_waveform(ax, x, y, pattern, ...)` - Signal timing
- [x] C3: `draw_pipeline_stage(ax, x, y, stage_name, ...)` - CPU pipeline
- [x] C4: `draw_bus_diagram(ax, x, y, width, data_labels, ...)` - Data bus

### Category D: Circuit & Electronics (5/5)
- [x] D1: `draw_logic_gate(ax, gate_type, x, y, ...)` - AND, OR, NOT, NAND, NOR gates
- [x] D2: `draw_register_box(ax, x, y, name, bits, ...)` - Register block
- [x] D3: `draw_alu_block(ax, x, y, ops, ...)` - ALU component
- [x] D4: `draw_memory_array(ax, x, y, rows, cols, ...)` - Memory layout
- [x] D5: `draw_mux_demux(ax, x, y, inputs, outputs, ...)` - Multiplexer

### Category E: Enhanced UML/Sequence (3/3)
- [x] E1: `draw_sequence_fragment(ax, x, y, w, h, fragment_type, ...)` - Loop/alt fragments
- [x] E2: `draw_activation_box(ax, x, y, w, h, ...)` - Activation duration
- [x] E3: `draw_self_message(ax, x, y, label, ...)` - Self-referential message

### Category F: Process/OS Diagrams (4/4)
- [x] F1: `draw_process_tree(ax, processes, ...)` - Tree of processes
- [x] F2: `draw_memory_layout(ax, segments, ...)` - Stack/heap/segment layout
- [x] F3: `draw_page_table(ax, entries, ...)` - MMU page table
- [x] F4: `draw_thread_block(ax, x, y, thread_id, ...)` - Thread visualization

### Category G: Database Enhancements (3/3)
- [x] G1: `draw_foreign_key_arrow(ax, p1, p2, ...)` - FK relationship line
- [x] G2: `draw_primary_key_indicator(ax, x, y, ...)` - PK marker
- [x] G3: `draw_view_box(ax, x, y, name, query, ...)` - SQL view

### Category H: Network Enhancements (3/3)
- [x] H1: `draw_packet_header(ax, x, y, fields, ...)` - Protocol header
- [x] H2: `draw_protocol_stack(ax, layers, ...)` - OSI/TCP-IP stack
- [x] H3: `draw_network_timeline(ax, events, ...)` - Network event timeline

---

## Phase 3: Additional Categories

### Flowchart Shapes (5/5) ✅
- [x] draw_parallelogram - متوازي أضلاع (I/O)
- [x] draw_hexagon - مسدس (decision)
- [x] draw_stadium - ملعب (start/end)
- [x] draw_cloud - سحابة (cloud computing)
- [x] draw_cylinder - أسطوانة (database)

### UML/Software Diagram Helpers (5/5) ✅
- [x] draw_package - حزمة UML
- [x] draw_port - منفذ UML
- [x] draw_node - عقدة نشر
- [x] draw_interface - واجهة UML
- [x] draw_artifact - قطعة نشر

### Network/Cloud Shapes (4/4) ✅
- [x] draw_cloud_shape - شكل سحابة
- [x] draw_server - خادم
- [x] draw_database_cylinder - قاعدة بيانات
- [x] draw_device - جهاز شبكة

### Advanced Connectors (5/5) ✅
- [x] draw_orthogonal_arrow - سهم زاوية قائمة
- [x] draw_curved_arrow - سهم منحني
- [x] draw_dashed_arrow - سهم متقطع
- [x] draw_double_arrow - سهم ثنائي الاتجاه
- [x] draw_arrow_with_label - سهم مع تسمية

### Layout & Grid (4/4) ✅
- [x] draw_grid - شبكة
- [x] add_axis - محور
- [x] draw_ruler - مسطرة
- [x] snap_to_grid - محاذاة للشبكة

### Visual Annotations (5/5) ✅
- [x] draw_callout - تعليق
- [x] draw_bubble - فقاعة
- [x] draw_footnote - حاشية
- [x] draw_sticky_note - ملاحظة لاصقة
- [x] draw_highlight_box - صندوق تمييز

### Grouping & Styling (3/3) ✅
- [x] draw_group - مجموعة
- [x] draw_shadow - ظل
- [x] draw_dotted_box - صندوق منقط

### Data Visualization (4/4) ✅
- [x] draw_bar - شريط
- [x] draw_pie_slice - قطاع
- [x] draw_legend_item - عنصر مفتاح
- [x] draw_axis_line - خط المحور

### Advanced Text (4/4) ✅
- [x] add_rotated_text - نص مقلوب
- [x] add_vertical_text - نص عمودي
- [x] add_text_with_bg - نص مع خلفية
- [x] add_code_with_syntax - كود ملون

---

## Template Functions Summary (104 Total)

| Category | Count | Functions |
|----------|-------|-----------|
| Basic Helpers | 29 | setup_canvas, save_figure, get_font_prop, handle_arabic, add_rich_text, add_text, draw_box, draw_circle, draw_diamond, draw_arrow, draw_table, draw_entity, draw_relationship, draw_attribute, connect, add_title, add_subtitle, add_label, add_legend, add_caption, add_page_number, add_watermark, add_divider, add_code_block, add_math_expression, add_numbered_list, add_section_header |
| Flowchart Shapes | 5 | draw_parallelogram, draw_hexagon, draw_stadium, draw_cloud, draw_cylinder |
| UML/Software | 5 | draw_package, draw_port, draw_node, draw_interface, draw_artifact |
| Network/Cloud | 4 | draw_cloud_shape, draw_server, draw_database_cylinder, draw_device |
| Advanced Connectors | 5 | draw_orthogonal_arrow, draw_curved_arrow, draw_dashed_arrow, draw_double_arrow, draw_arrow_with_label |
| Layout & Grid | 4 | draw_grid, add_axis, draw_ruler, snap_to_grid |
| Visual Annotations | 5 | draw_callout, draw_bubble, draw_footnote, draw_sticky_note, draw_highlight_box |
| Grouping & Styling | 3 | draw_group, draw_shadow, draw_dotted_box |
| Data Visualization | 4 | draw_bar, draw_pie_slice, draw_legend_item, draw_axis_line |
| Advanced Text | 4 | add_rotated_text, add_vertical_text, add_text_with_bg, add_code_with_syntax |
| Math & Statistics | 7 | draw_function_graph, draw_histogram, draw_boxplot, draw_scatter_plot, draw_normal_curve, draw_vector_field, draw_equation |
| Algorithm & CS | 6 | draw_pseudocode_block, draw_complexity_label, draw_step_indicator, draw_state_diagram, draw_transition_table, draw_recursion_tree_enhanced |
| Timing & Signal | 4 | draw_timing_diagram, draw_signal_waveform, draw_pipeline_stage, draw_bus_diagram |
| Electronics & Circuits | 5 | draw_logic_gate, draw_register_box, draw_alu_block, draw_memory_array, draw_mux_demux |
| Enhanced UML | 3 | draw_sequence_fragment, draw_activation_box, draw_self_message |
| Process/OS | 4 | draw_process_tree, draw_memory_layout, draw_page_table, draw_thread_block |
| Database Enhancements | 3 | draw_foreign_key_arrow, draw_primary_key_indicator, draw_view_box |
| Network Enhancements | 3 | draw_packet_header, draw_protocol_stack, draw_network_timeline |

---

## Generator Functions (57 Total)

| Section | Generators | Count |
|---------|-----------|-------|
| 1. Computer Principles | von_neumann, cpu_cycle, memory_hierarchy | 3 |
| 2. Programming | flowchart, loop_trace, recursion_tree, linked_list, stack, queue | 6 |
| 3. Data Structures | binary_tree, bst, hash_table, sorting, dijkstra, dfs_bfs, big_o, dp | 8 |
| 4. Databases | er_university, relational_schema, normalization, bplus_tree, query_plan, transaction | 6 |
| 5. UML | class, sequence, state, activity, use_case, component, deployment | 7 |
| 6. Networks | osi, tcp_ip, topology, routing, packet_flow, dns | 6 |
| 7. OS | process_states, scheduling_gantt, memory_mgmt, deadlock, semaphore | 5 |
| 8. Electronics | logic_gates, karnaugh, flip_flop, combinational, transistor | 5 |
| 9. Math/Physics | function_plot, derivative, matrix, vector_space, fourier | 5 |
| 10. AI/ML | neural_network, decision_tree, search_tree, genetic_algorithm, fuzzy_logic | 5 |
| 11. Architecture | cpu_datapath, pipeline, cache, instruction_format | 4 |
| 12. Compiler | compiler_phases, parse_tree_formal, dfa, nfa | 4 |

---

## Lecture Map — All 5 Years

### السنة الأولى — Year 1

#### الفصل الأول — Semester 1
| Lecture | English | Diagrams Needed |
|---------|---------|-----------------|
| مبادئ عمل الحاسوب | Computer Principles | Von Neumann architecture, CPU cycle, memory hierarchy, bus diagram |
| تحليل 1 | Calculus 1 | Function plots, limits, derivatives, integrals, epsilon-delta |
| فيزياء 1 | Physics 1 | Force diagrams, kinematics graphs, projectile motion, free-body |
| رياضيات متقطعة | Discrete Math | Venn diagrams, truth tables, set operations, relations, graphs |
| لغة 1 | Language 1 | Grammar trees, sentence structure diagrams |
| برمجة 1 | Programming 1 | Flowcharts, variable memory, loops, conditionals, trace tables |

#### الفصل الثاني — Semester 2
| Lecture | English | Diagrams Needed |
|---------|---------|-----------------|
| الجبر الخطي | Linear Algebra | Matrix operations, vector spaces, transformations, eigenvalues |
| التحليل 2 | Calculus 2 | Series, sequences, multivariable plots, Taylor series |
| الدارات الكهربائية | Electric Circuits | Circuit diagrams (R, L, C), Kirchhoff laws, Thevenin/Norton |
| فيزياء 2 | Physics 2 | Electromagnetism, waves, optics diagrams |
| لغة 2 | Language 2 | Grammar trees, sentence structure |
| اللغة العربية | Arabic Language | Morphology trees, syntax diagrams |
| برمجة 2 | Programming 2 | Recursion trees, stack traces, OOP class diagrams, linked lists |

---

### السنة الثانية — Year 2

#### الفصل الأول — Semester 3
| Lecture | English | Diagrams Needed |
|---------|---------|-----------------|
| التحليل 3 | Calculus 3 | Vector calculus, surface plots, line integrals |
| التحليل العددي 1 | Numerical Analysis 1 | Root finding, interpolation, numerical integration plots |
| لغة 3 | Language 3 | Advanced grammar, discourse analysis |
| برمجة 3 | Programming 3 | OOP diagrams, design patterns, inheritance trees, UML |
| الكترونيات | Electronics | Transistor circuits, logic gates, amplifier diagrams |
| احتمالات | Probability | Probability trees, distributions, Bayes diagrams |
| برمجة رياضية | Mathematical Programming | Optimization graphs, simplex tableau, feasible regions |

#### الفصل الثاني — Semester 4
| Lecture | English | Diagrams Needed |
|---------|---------|-----------------|
| تحليل عددي 2 | Numerical Analysis 2 | ODE solvers, numerical differentiation, error analysis |
| مهارات التواصل | Communication Skills | Communication models, feedback loops, network diagrams |
| خوارزميات 1 | Algorithms 1 | Sorting visualization, searching, complexity graphs, Big-O |
| تحليل 4 | Calculus 4 | Fourier series, differential equations |
| إحصاء | Statistics | Histograms, box plots, regression lines, hypothesis testing |
| دارات منطقية | Logic Circuits | Truth tables, Karnaugh maps, combinational/sequential circuits |
| لغة 4 | Language 4 | Advanced discourse, technical writing structure |

---

### السنة الثالثة — Year 3

#### الفصل الأول — Semester 5
| Lecture | English | Diagrams Needed |
|---------|---------|-----------------|
| رسوميات حاسوبية | Computer Graphics | 2D/3D transforms, rasterization, shading, projection matrices |
| خوارزميات 2 | Algorithms 2 | Graph algorithms (BFS/DFS/Dijkstra), DP tables, greedy |
| نظرية المخططات | Graph Theory | Graph representations, trees, planar graphs, coloring |
| معالج مصغر | Microprocessor | CPU architecture, instruction pipeline, memory mapping, assembly |
| معالجة الإشارة | Signal Processing | Time/frequency domain, FFT, filters, convolution |
| نظرية المعلومات | Information Theory | Entropy diagrams, channel models, Huffman trees, coding |
| قواعد المعطيات 1 | Databases 1 | **ER diagrams**, relational schema, normalization, SQL trees |

#### الفصل الثاني — Semester 6
| Lecture | English | Diagrams Needed |
|---------|---------|-----------------|
| مبادئ الذكاء الاصطناعي | AI Principles | Search trees, game trees, neural network basics, logic |
| خوارزميات 3 | Algorithms 3 | NP-completeness reductions, approximation, randomized |
| اتصالات تشابهية ورقمية | Analog & Digital Comm | Modulation diagrams, signal constellations, channel models |
| بنية وتنظيم الحاسب 1 | Computer Architecture 1 | CPU datapath, control unit, cache hierarchy, pipelining |
| شبكات حاسوبية | Computer Networks | OSI/TCP-IP layers, routing tables, packet flow, topologies |
| لغات صورية | Formal Languages | DFA/NFA diagrams, parse trees, regular expressions, grammars |
| هندسة البرمجيات 1 | Software Eng 1 | **UML diagrams** (use case, class, sequence, activity) |

---

### السنة الرابعة — Year 4

#### الفصل الأول — Semester 7
| Lecture | English | Diagrams Needed |
|---------|---------|-----------------|
| نظرية الأرتال | Queueing Theory | Queue models (M/M/1, M/M/c), state diagrams, performance graphs |
| نظم تشغيل 1 | Operating Systems 1 | Process states, memory management, scheduling Gantt charts |
| تصميم المترجمات | Compiler Design | Lexical analysis, parse trees, AST, symbol tables, code gen |
| قواعد المعطيات 2 | Databases 2 | Query execution trees, B+tree indexes, transaction diagrams |
| بنية وتنظيم الحواسيب 2 | Computer Architecture 2 | Advanced pipelining, cache coherence, multiprocessor |
| شبكات متقدمة | Advanced Networks | BGP/OSPF diagrams, SDN architecture, QoS models |
| نظم وسائط متعددة | Multimedia Systems | Audio/video encoding, streaming architecture, compression |
| برمجة منطقية | Logic Programming | Resolution trees, unification diagrams, Prolog trace |
| بحوث عمليات | Operations Research | Network flow, PERT/CPM, decision trees, linear programming |

#### الفصل الثاني — Semester 8
| Lecture | English | Diagrams Needed |
|---------|---------|-----------------|
| تسويق وإدارة مشاريع | Marketing & Project Mgmt | Gantt charts, WBS, PERT network, stakeholder maps |
| شبكات عصبونية ومنطق الترجيح | Neural Networks & Fuzzy Logic | **Neural network diagrams**, activation functions, fuzzy sets |
| نظم تشغيل 2 | Operating Systems 2 | Deadlock graphs, file system structures, I/O scheduling |
| روبوتية | Robotics | Kinematic chains, workspace diagrams, sensor fusion |
| أمن المعلومات | Information Security | Attack trees, crypto flow diagrams, security models, PKI |
| هندسة البرمجيات 2 | Software Eng 2 | **UML** (state machine, component, deployment, timing) |
| نظم رقمية مبرمجة | Programmable Digital Systems | FPGA architecture, state machines, HDL simulation |
| برمجة تفرعية | Parallel Programming | Thread diagrams, synchronization, race conditions, MPI |
| تطبيقات الانترنت | Web Applications | Client-server architecture, REST APIs, MVC, database schema |

---

### السنة الخامسة — Year 5

#### الفصل الأول — Semester 9
| Lecture | English | Diagrams Needed |
|---------|---------|-----------------|
| أمن الشبكات | Network Security | Firewall diagrams, IDS/IPS, VPN tunnels, attack vectors |
| هندسة البرمجيات 3 | Software Eng 3 | **UML** (advanced patterns, microservices, CI/CD pipelines) |
| تحكم منطقي مبرمج PLC | PLC Control | Ladder logic, state diagrams, I/O mapping, control loops |
| نظم خبيرة | Expert Systems | Knowledge graphs, inference engines, decision trees, rules |
| رؤية حاسوبية | Computer Vision | Image processing pipeline, feature detection, CNN architecture |
| نمذجة ومحاكاة | Modeling & Simulation | State machines, event graphs, Monte Carlo, system dynamics |
| جودة ووثوقية | Quality & Reliability | Reliability block diagrams, fault trees, control charts |
| نظم موزعة | Distributed Systems | Distributed architecture, consensus protocols, replication |

#### الفصل الثاني — Semester 10
| Lecture | English | Diagrams Needed |
|---------|---------|-----------------|
| معالجة لغات طبيعية | NLP | Parse trees, dependency graphs, word embeddings, attention |
| تنقيب المعطيات | Data Mining | Decision trees, clustering diagrams, association rules |
| إدارة نظم إنتاجية | Production Systems | ERP architecture, supply chain, inventory models |
| نظم الزمن الحقيقي | Real-Time Systems | Timing diagrams, scheduling analysis, task graphs |
| الشبكات اللاسلكية | Wireless Networks | Signal propagation, cell layouts, protocol stacks |
| إدارة الشبكات | Network Management | SNMP architecture, network monitoring, fault management |
| قواعد معطيات موزعة | Distributed Databases | Replication diagrams, sharding, distributed transactions |

---

## Brainstorming Phase

### Future Enhancements (P1-P3)
- [ ] Auto-test Runner — Single script runs all tests + combined report
- [ ] Font Validation at Startup — Warn early if Arabic font missing
- [ ] SVG Optimization — Reduce SVG file size for web
- [ ] Batch Diagram Generator — Generate multiple diagrams from JSON/YAML spec
- [ ] MCP Server Enhancement — Add more tools for AI integration
- [ ] Animation Support — Animated diagrams for presentations

---

## How to Add Features

1. **Brainstorm** → Add to "Brainstorming Phase" section
2. **Refine** → After discussion, assign priority (P0-P3) and move to "Active Backlog"
3. **Implement** → Agent picks up task, marks `[~]` in progress
4. **Test** → Tests pass, output saved to `test-output/`
5. **Complete** → Mark `[x]`, move to "Completed" with date

## Naming Convention
```
[Priority] Short description
  - Details: what it does
  - Scope: which files/modules affected
  - Tests: what needs to be verified
```