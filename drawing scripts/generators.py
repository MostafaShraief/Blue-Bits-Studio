"""
Blue Bits - Diagram Generators
===============================
ALL diagram generator functions for the 80 university lectures.
Each generator is a self-contained function that produces a complete diagram.

Usage:
    from template import *
    from generators import *

    fig = generate_von_neumann_architecture()
    save_figure(fig, 'output')

All generators follow the BlueBits theme and use template.py helpers.
"""

from template import *

# =========================================================
#       SECTION 1: Computer Principles
# =========================================================


def generate_von_neumann_architecture():
    fig, ax = setup_canvas(w=18, h=12, xlim=(-9, 9), ylim=(-6, 6))
    add_title(ax, "بنية فون نيومان")
    add_subtitle(ax, "Von Neumann Architecture")
    draw_box(
        ax,
        -3,
        -1,
        6,
        4,
        text="CPU - وحدة المعالجة",
        text_color=WHITE,
        border_color=BLUE,
        fill_color=BLUE,
        rounded=True,
        text_size=20,
    )
    draw_box(
        ax,
        -2.5,
        1.5,
        2.2,
        1.2,
        text="ALU",
        text_color=BLACK,
        border_color=CYAN,
        fill_color=LIGHT_BLUE,
        rounded=False,
        text_size=16,
    )
    draw_box(
        ax,
        0.3,
        1.5,
        2.2,
        1.2,
        text="وحدة التحكم",
        text_color=BLACK,
        border_color=CYAN,
        fill_color=LIGHT_BLUE,
        rounded=False,
        text_size=14,
    )
    draw_box(
        ax,
        -1.1,
        -0.5,
        2.2,
        1,
        text="السجلات",
        text_color=BLACK,
        border_color=GREEN,
        fill_color=LIGHT_GREEN,
        rounded=False,
        text_size=14,
    )
    draw_box(
        ax,
        -3,
        -4.5,
        6,
        2.5,
        text="الذاكرة (Memory)",
        text_color=WHITE,
        border_color=GREEN,
        fill_color=GREEN,
        rounded=True,
        text_size=20,
    )
    draw_box(
        ax,
        -3,
        -6.5,
        2.5,
        1.5,
        text="إدخال",
        text_color=BLACK,
        border_color=RED,
        fill_color=LIGHT_RED,
        rounded=True,
        text_size=16,
    )
    draw_box(
        ax,
        0.5,
        -6.5,
        2.5,
        1.5,
        text="إخراج",
        text_color=BLACK,
        border_color=RED,
        fill_color=LIGHT_RED,
        rounded=True,
        text_size=16,
    )
    draw_arrow(ax, (0, -1), (0, -2), text="Bus", rad=0, text_size=14)
    draw_arrow(ax, (-1.75, -5.5), (-1.75, -6.2), text="", rad=0.15)
    draw_arrow(ax, (1.75, -6.2), (1.75, -5.5), text="", rad=-0.15)
    add_legend(
        ax,
        [(BLUE, "CPU"), (GREEN, "Memory"), (RED, "I/O"), (CYAN, "ALU/Control")],
        title="المفتاح",
    )
    return fig


def generate_cpu_cycle():
    fig, ax = setup_canvas(w=14, h=10, xlim=(-7, 7), ylim=(-5, 5))
    add_title(ax, "دورة المعالجة")
    add_subtitle(ax, "Fetch -> Decode -> Execute Cycle")
    draw_box(
        ax,
        -1.5,
        2,
        3,
        1.5,
        text="جلب (Fetch)",
        text_color=WHITE,
        border_color=BLUE,
        fill_color=BLUE,
        rounded=True,
        text_size=18,
    )
    draw_box(
        ax,
        2,
        -1,
        3,
        1.5,
        text="فك التشفير (Decode)",
        text_color=WHITE,
        border_color=GREEN,
        fill_color=GREEN,
        rounded=True,
        text_size=16,
    )
    draw_box(
        ax,
        -5,
        -1,
        3,
        1.5,
        text="تنفيذ (Execute)",
        text_color=WHITE,
        border_color=RED,
        fill_color=RED,
        rounded=True,
        text_size=16,
    )
    draw_arrow(ax, (0, 2), (2, 0.5), text="", rad=0.1)
    draw_arrow(ax, (0.5, -1), (-2, -1), text="", rad=0.1)
    draw_arrow(ax, (-3.5, 0.5), (-1.5, 2), text="", rad=0.1)
    return fig


def generate_memory_hierarchy():
    fig, ax = setup_canvas(w=14, h=12, xlim=(-7, 7), ylim=(-6, 6))
    add_title(ax, "الهرم الذاكري")
    add_subtitle(ax, "Memory Hierarchy")
    levels = [
        ("السجلات", "Registers", RED, 1.5, 0.6, 4.5),
        ("Cache L1", "L1 Cache", "#FF6B35", 2.5, 0.8, 3.5),
        ("Cache L2", "L2 Cache", "#FFB347", 3.5, 0.8, 2.3),
        ("Cache L3", "L3 Cache", "#FFD700", 4.5, 0.8, 1.1),
        ("الذاكرة الرئيسية", "RAM", GREEN, 5.5, 0.8, -0.1),
        ("التخزين الثانوي", "SSD/HDD", BLUE, 6.5, 0.8, -1.3),
    ]
    for name_ar, name_en, color, w, h, y in levels:
        tc = WHITE if color not in ["#FFD700", "#FFB347"] else BLACK
        draw_box(
            ax,
            -w / 2,
            y - h / 2,
            w,
            h,
            text=f"{name_ar}/{name_en}",
            text_color=tc,
            border_color=color,
            fill_color=color,
            rounded=True,
            text_size=14,
        )
    add_text(ax, 5.5, 2, "اسرع", color=RED, size=14)
    add_text(ax, 5.5, -3, "اكبر", color=BLUE, size=14)
    return fig


# =========================================================
#       SECTION 2: Programming (برمجة)
# =========================================================


def generate_flowchart_basic():
    fig, ax = setup_canvas(w=14, h=14, xlim=(-7, 7), ylim=(-7, 7))
    add_title(ax, "مخطط انسيابي")
    draw_box(
        ax,
        -1.5,
        5.5,
        3,
        1,
        text="بداية",
        text_color=WHITE,
        border_color=GREEN,
        fill_color=GREEN,
        rounded=True,
        text_size=18,
    )
    draw_box(
        ax,
        -2,
        3.5,
        4,
        1,
        text="قراءة المدخلات",
        text_color=BLACK,
        border_color=BLUE,
        fill_color=WHITE,
        rounded=False,
        text_size=16,
    )
    draw_diamond(
        ax,
        0,
        1,
        4,
        2,
        text="هل الشرط صحيح؟",
        text_color=BLACK,
        border_color=BLUE,
        fill_color=LIGHT_BLUE,
        text_size=14,
    )
    draw_box(
        ax,
        -2,
        -1.5,
        4,
        1,
        text="معالجة البيانات",
        text_color=BLACK,
        border_color=BLUE,
        fill_color=WHITE,
        rounded=False,
        text_size=16,
    )
    draw_box(
        ax,
        3,
        0,
        3,
        1,
        text="عرض خطأ",
        text_color=WHITE,
        border_color=RED,
        fill_color=RED,
        rounded=False,
        text_size=14,
    )
    draw_box(
        ax,
        -1.5,
        -4,
        3,
        1,
        text="نهاية",
        text_color=WHITE,
        border_color=RED,
        fill_color=RED,
        rounded=True,
        text_size=18,
    )
    draw_arrow(ax, (0, 4.5), (0, 3.5), text="", rad=0)
    draw_arrow(ax, (0, 2.5), (0, 1.5), text="", rad=0)
    draw_arrow(ax, (0, 0), (0, -0.5), text="نعم", rad=0, text_size=14)
    draw_arrow(ax, (2, 1), (3, 0.5), text="لا", rad=0.2, text_size=14)
    draw_arrow(ax, (0, -2.5), (0, -3.5), text="", rad=0)
    return fig


def generate_loop_trace_table():
    fig, ax = setup_canvas(w=16, h=10, xlim=(-8, 8), ylim=(-5, 5))
    add_title(ax, "جدول تتبع الحلقة")
    add_code_block(
        ax, -7, 4, ["sum = 0", "for i in range(5):", "    sum += i", "print(sum)  # 10"]
    )
    draw_table(
        ax,
        -1,
        4,
        ["التكرار", "i", "sum"],
        [
            ["1", "0", "0"],
            ["2", "1", "1"],
            ["3", "2", "3"],
            ["4", "3", "6"],
            ["5", "4", "10"],
        ],
    )
    return fig


def generate_recursion_tree():
    fig, ax = setup_canvas(w=16, h=12, xlim=(-8, 8), ylim=(-6, 6))
    add_title(ax, "شجرة الاستدعاء الذاتي")
    draw_circle(ax, 0, 4.5, 0.6, text="fib(4)", text_size=14)
    draw_circle(ax, -3, 2.5, 0.6, text="fib(3)", text_size=14)
    draw_circle(ax, 3, 2.5, 0.6, text="fib(2)", text_size=14)
    draw_circle(ax, -4.5, 0.5, 0.6, text="fib(2)", text_size=14)
    draw_circle(ax, -1.5, 0.5, 0.6, text="fib(1)", text_size=14)
    draw_circle(ax, 1.5, 0.5, 0.6, text="fib(1)", text_size=14)
    draw_circle(ax, 4.5, 0.5, 0.6, text="fib(0)", text_size=14)
    draw_circle(ax, -5.5, -1.5, 0.6, text="fib(1)", text_size=14)
    draw_circle(ax, -3.5, -1.5, 0.6, text="fib(0)", text_size=14)
    draw_arrow(ax, (-0.3, 3.9), (-2.7, 3), rad=-0.1)
    draw_arrow(ax, (0.3, 3.9), (2.7, 3), rad=0.1)
    draw_arrow(ax, (-3, 1.9), (-4.2, 1), rad=-0.1)
    draw_arrow(ax, (-3, 1.9), (-1.8, 1), rad=0.1)
    draw_arrow(ax, (3, 1.9), (1.8, 1), rad=-0.1)
    draw_arrow(ax, (3, 1.9), (4.2, 1), rad=0.1)
    for x in [-1.5, 1.5, 4.5, -5.5, -3.5]:
        draw_circle(
            ax,
            x,
            -1.5,
            0.65,
            text="",
            border_color=GREEN,
            fill_color="none",
            linewidth=2.5,
        )
    add_label(
        ax, 0, -4, "الحالات الاساسية = 1", color=GREEN, size=14, bg_color=LIGHT_GREEN
    )
    return fig


def generate_linked_list_viz():
    fig, ax = setup_canvas(w=16, h=8, xlim=(-8, 8), ylim=(-4, 4))
    add_title(ax, "قائمة مرتبطة")
    nodes = [("10", -6), ("20", -3), ("30", 0), ("40", 3), ("NULL", 6)]
    for i, (val, x) in enumerate(nodes):
        draw_box(
            ax,
            x - 1.2,
            -0.5,
            1.2,
            1,
            text=val,
            text_color=GREEN if val != "NULL" else RED,
            border_color=BLUE,
            fill_color=WHITE,
            rounded=False,
            text_size=16,
        )
        if val != "NULL":
            draw_box(
                ax,
                x,
                -0.5,
                1.2,
                1,
                text="->",
                text_color=BLUE,
                border_color=BLUE,
                fill_color=LIGHT_BLUE,
                rounded=False,
                text_size=16,
            )
            if i < len(nodes) - 1:
                draw_arrow(
                    ax,
                    (x + 1.2, 0),
                    (nodes[i + 1][1] - 1.2, 0),
                    text="",
                    rad=0,
                    linewidth=2,
                )
        else:
            draw_box(
                ax,
                x,
                -0.5,
                1.2,
                1,
                text="null",
                text_color=RED,
                border_color=RED,
                fill_color=LIGHT_RED,
                rounded=False,
                text_size=16,
            )
    draw_arrow(ax, (-7, 1.5), (-6, 0.5), text="head", rad=0.1, text_size=14)
    return fig


def generate_stack_viz():
    fig, ax = setup_canvas(w=14, h=10, xlim=(-7, 7), ylim=(-5, 5))
    add_title(ax, "المكدس - Stack")
    draw_box(
        ax,
        -2,
        -3,
        4,
        6,
        text="",
        border_color=BLUE,
        fill_color=LIGHT_BLUE,
        rounded=False,
        linewidth=3,
    )
    elements = [("A", -2.5, GREEN), ("B", -1.3, BLUE), ("C", -0.1, CYAN)]
    for text, y, color in elements:
        draw_box(
            ax,
            -1.8,
            y,
            3.6,
            1,
            text=text,
            text_color=WHITE,
            border_color=color,
            fill_color=color,
            rounded=False,
            text_size=18,
        )
    draw_arrow(ax, (3, 0.5), (2, 0.5), text="TOP", rad=0, arrow_color=RED, text_size=16)
    add_label(ax, 4, 3, "push(D)", color=GREEN, size=14)
    add_label(ax, 4, 1.5, "pop() = C", color=RED, size=14)
    return fig


def generate_queue_viz():
    fig, ax = setup_canvas(w=16, h=8, xlim=(-8, 8), ylim=(-4, 4))
    add_title(ax, "الرتل - Queue")
    elements = [("A", -5), ("B", -3), ("C", -1), ("D", 1)]
    for text, x in elements:
        draw_box(
            ax,
            x,
            -0.5,
            1.8,
            1,
            text=text,
            text_color=WHITE,
            border_color=BLUE,
            fill_color=BLUE,
            rounded=False,
            text_size=18,
        )
    add_label(ax, -6, -2, "FRONT", color=RED, size=14)
    add_label(ax, 2.5, -2, "REAR", color=GREEN, size=14)
    return fig


# =========================================================
#       SECTION 3: Data Structures & Algorithms
# =========================================================


def generate_binary_tree():
    fig, ax = setup_canvas(w=16, h=10, xlim=(-8, 8), ylim=(-5, 5))
    add_title(ax, "شجرة ثنائية")
    nodes = [
        (0, 3.5, "10"),
        (-3, 1.5, "5"),
        (3, 1.5, "15"),
        (-4.5, -0.5, "3"),
        (-1.5, -0.5, "7"),
        (1.5, -0.5, "12"),
        (4.5, -0.5, "20"),
    ]
    edges = [
        ((0, 2.9), (-2.7, 2)),
        ((0, 2.9), (2.7, 2)),
        ((-3, 0.9), (-4.2, 0)),
        ((-3, 0.9), (-1.8, 0)),
        ((3, 0.9), (1.8, 0)),
        ((3, 0.9), (4.2, 0)),
    ]
    for edge in edges:
        x1, y1 = edge[0]
        x2, y2 = edge[1]
        draw_arrow(ax, (x1, y1), (x2, y2), rad=0.05)
    for x, y, val in nodes:
        draw_circle(ax, x, y, 0.5, text=val, text_size=14)
    add_label(ax, -1.5, 2.5, "يسار", color=GREEN, size=12)
    add_label(ax, 1.5, 2.5, "يمين", color=RED, size=12)
    return fig


def generate_binary_search_tree():
    fig, ax = setup_canvas(w=16, h=12, xlim=(-8, 8), ylim=(-6, 6))
    add_title(ax, "شجرة بحث ثنائية")
    nodes = [
        (0, 4.5, "10"),
        (-3, 2.5, "5"),
        (3, 2.5, "15"),
        (-4.5, 0.5, "3"),
        (-1.5, 0.5, "7"),
        (1.5, 0.5, "12"),
        (4.5, 0.5, "18"),
    ]
    edges = [
        ((0, 4), (-2.7, 3)),
        ((0, 4), (2.7, 3)),
        ((-3, 2), (-4.2, 1)),
        ((-3, 2), (-1.8, 1)),
        ((3, 2), (1.8, 1)),
        ((3, 2), (4.2, 1)),
    ]
    for edge in edges:
        x1, y1 = edge[0]
        x2, y2 = edge[1]
        draw_arrow(ax, (x1, y1), (x2, y2), rad=0.05)
    for x, y, val in nodes:
        draw_circle(ax, x, y, 0.5, text=val, text_size=14)
    draw_arrow(ax, (-1.5, 0), (-2.5, -1), rad=-0.1, arrow_color=RED, linewidth=3)
    draw_circle(
        ax,
        -3,
        -1.5,
        0.5,
        text="8",
        text_size=14,
        border_color=RED,
        fill_color=LIGHT_RED,
    )
    add_label(ax, -3, -2.5, "ادراج 8", color=RED, size=12, bg_color=LIGHT_RED)
    return fig


def generate_hash_table():
    fig, ax = setup_canvas(w=16, h=10, xlim=(-8, 8), ylim=(-5, 5))
    add_title(ax, "جدول التجزئة")
    indices = ["0", "1", "2", "3", "4"]
    values = ["A -> D", "B", "null", "C -> E -> F", "null"]
    colors = [GREEN, GREEN, GRAY, GREEN, GRAY]
    for i, (idx, val, color) in enumerate(zip(indices, values, colors)):
        y = 3 - i * 1.5
        draw_box(
            ax,
            -5,
            y - 0.4,
            1.5,
            0.8,
            text=f"[{idx}]",
            text_color=WHITE,
            border_color=BLUE,
            fill_color=BLUE,
            rounded=False,
            text_size=14,
        )
        draw_box(
            ax,
            -3.5,
            y - 0.4,
            4,
            0.8,
            text=val,
            text_color=color,
            border_color=BLUE,
            fill_color=WHITE,
            rounded=False,
            text_size=14,
        )
    add_label(ax, 0, -3.5, "h(key) = key % 5", color=BLUE, size=16, bg_color=LIGHT_BLUE)
    return fig


def generate_sorting_visualization():
    fig, ax = setup_canvas(w=18, h=10, xlim=(-9, 9), ylim=(-5, 5))
    add_title(ax, "خوارزمية الترتيب بالفقاعات")
    steps = [
        [5, 3, 8, 1, 9],
        [3, 5, 8, 1, 9],
        [3, 5, 1, 8, 9],
        [3, 1, 5, 8, 9],
        [1, 3, 5, 8, 9],
    ]
    for step_idx, arr in enumerate(steps):
        x_start = -7 + step_idx * 3.5
        for i, val in enumerate(arr):
            h = val * 0.3
            draw_box(
                ax,
                x_start + i * 0.8,
                -2,
                0.7,
                h,
                text=str(val),
                text_color=WHITE,
                border_color=BLUE,
                fill_color=BLUE,
                rounded=False,
                text_size=12,
            )
    return fig


def generate_graph_dijkstra():
    fig, ax = setup_canvas(w=16, h=10, xlim=(-8, 8), ylim=(-5, 5))
    add_title(ax, "خوارزمية ديكسترا")
    nodes = [
        ("A", -5, 2),
        ("B", -2, 4),
        ("C", -2, 0),
        ("D", 2, 4),
        ("E", 2, 0),
        ("F", 5, 2),
    ]
    for label, x, y in nodes:
        draw_circle(ax, x, y, 0.5, text=label, text_size=14)
    edges = [
        ((-4.5, 2), (-2.3, 3.5), "4"),
        ((-4.5, 2), (-2.3, 0.5), "2"),
        ((-1.7, 4), (1.7, 4), "3"),
        ((-1.7, 0), (1.7, 0), "5"),
        ((1.7, 4), (4.5, 2), "4"),
        ((1.7, 0), (4.5, 2), "3"),
    ]
    for edge in edges:
        (x1, y1), (x2, y2), w = edge
        draw_arrow(ax, (x1, y1), (x2, y2), text=w, text_size=12)
    draw_arrow(ax, (-5, 1), (-5, 0), text="0", rad=0, arrow_color=GREEN)
    return fig


def generate_dfs_bfs_traversal():
    fig, ax = setup_canvas(w=16, h=10, xlim=(-8, 8), ylim=(-5, 5))
    add_title(ax, "DFS/BFS traversal")
    nodes = [
        (0, 3, "1"),
        (-3, 1, "2"),
        (3, 1, "3"),
        (-4.5, -1, "4"),
        (-1.5, -1, "5"),
        (1.5, -1, "6"),
        (4.5, -1, "7"),
    ]
    for x, y, label in nodes:
        draw_circle(ax, x, y, 0.5, text=label, text_size=14)
    edges = [
        ((0, 2.5), (-2.7, 1.5)),
        ((0, 2.5), (2.7, 1.5)),
        ((-3, 0.5), (-4.2, -0.5)),
        ((-3, 0.5), (-1.8, -0.5)),
        ((3, 0.5), (1.8, -0.5)),
        ((3, 0.5), (4.2, -0.5)),
    ]
    for (x1, y1), (x2, y2) in edges:
        draw_arrow(ax, (x1, y1), (x2, y2), rad=0.05)
    add_label(ax, 0, -3, "DFS: 1-2-4-5-3-6-7   BFS: 1-2-3-4-5-6-7", color=BLUE, size=12)
    return fig


def generate_big_o_comparison():
    fig, ax = setup_canvas(w=14, h=10, xlim=(0, 10), ylim=(0, 25))
    add_title(ax, "مقارنة التعقيد الزمني")
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 25)
    x = np.linspace(1, 10, 100)
    ax.plot(x, np.ones_like(x), color=BLUE, linewidth=2, label="O(1)")
    ax.plot(x, np.log(x), color=GREEN, linewidth=2, label="O(log n)")
    ax.plot(x, x, color=RED, linewidth=2, label="O(n)")
    ax.plot(x, x * np.log(x), color=CYAN, linewidth=2, label="O(n log n)")
    ax.plot(x, x**2, color="orange", linewidth=2, label="O(n^2)")
    ax.legend(loc="upper left")
    return fig


def generate_dynamic_programming_table():
    fig, ax = setup_canvas(w=16, h=10, xlim=(-8, 8), ylim=(-5, 5))
    add_title(ax, "البرمجة الديناميكية")
    draw_table(
        ax,
        -5,
        4,
        ["i", "0", "1", "2", "3", "4", "5"],
        [
            ["0", "0", "0", "0", "0", "0", "0"],
            ["1", "0", "1", "1", "1", "1", "1"],
            ["2", "0", "1", "1", "2", "2", "2"],
            ["3", "0", "1", "2", "2", "3", "3"],
            ["4", "0", "1", "2", "3", "3", "4"],
        ],
    )
    add_label(ax, 0, -2, "fib(5) = 5", color=GREEN, size=16, bg_color=LIGHT_GREEN)
    return fig


# =========================================================
#       SECTION 4: Databases (قواعد المعطيات)
# =========================================================


def generate_er_diagram_university():
    fig, ax = setup_canvas(w=20, h=12, xlim=(-10, 10), ylim=(-6, 6))
    add_title(ax, "مخطط ER - جامعة")
    draw_entity(ax, -6, 0, "طالب")
    draw_entity(ax, 0, 0, "يسجل")
    draw_entity(ax, 6, 0, "مقرر")
    draw_attribute(ax, -6, 3, "رقم الطالب", underline=True)
    draw_attribute(ax, -8, 0, "الاسم")
    draw_attribute(ax, 6, 3, "رمز المقرر", underline=True)
    draw_attribute(ax, 8, 0, "اسم المقرر")
    connect(ax, (-4, 0), (-2, 0))
    connect(ax, (2, 0), (4, 0))
    add_label(ax, -3, -1, "1:N", color=BLUE, size=14)
    add_label(ax, 3, -1, "N:1", color=BLUE, size=14)
    return fig


def generate_relational_schema():
    fig, ax = setup_canvas(w=16, h=10, xlim=(-8, 8), ylim=(-5, 5))
    add_title(ax, "المخطط العلائقي")
    draw_table(
        ax, -6, 3, ["Student"], [["ID (PK)"], ["Name"], ["Age"]], cell_w=4, cell_h=0.8
    )
    draw_table(
        ax,
        2,
        3,
        ["Enroll"],
        [["StudentID (FK)"], ["CourseID (PK, FK)"], ["Grade"]],
        cell_w=4,
        cell_h=0.8,
    )
    draw_arrow(ax, (-2, 1), (2, 1), text="FK", rad=0, text_size=14)
    return fig


def generate_normalization_steps():
    fig, ax = setup_canvas(w=18, h=10, xlim=(-9, 9), ylim=(-5, 5))
    add_title(ax, "تسوية البيانات")
    draw_box(
        ax,
        -6,
        2,
        4,
        1.5,
        text="1NF",
        text_color=WHITE,
        border_color=BLUE,
        fill_color=BLUE,
        rounded=True,
        text_size=18,
    )
    draw_arrow(ax, (-4, 1.2), (-2, 1.2), text="", rad=0)
    draw_box(
        ax,
        -1,
        2,
        4,
        1.5,
        text="2NF",
        text_color=WHITE,
        border_color=GREEN,
        fill_color=GREEN,
        rounded=True,
        text_size=18,
    )
    draw_arrow(ax, (1, 1.2), (3, 1.2), text="", rad=0)
    draw_box(
        ax,
        4,
        2,
        4,
        1.5,
        text="3NF",
        text_color=WHITE,
        border_color=RED,
        fill_color=RED,
        rounded=True,
        text_size=18,
    )
    add_text(ax, 0, -2, "تقليل التكرار + ازالة الاعتماديات غير الضرورية", size=14)
    return fig


def generate_bplus_tree():
    fig, ax = setup_canvas(w=16, h=12, xlim=(-8, 8), ylim=(-6, 6))
    add_title(ax, "شجرة B+")
    internal = [(0, 4, "25"), (-4, 2, "10"), (4, 2, "40")]
    for x, y, v in internal:
        draw_box(
            ax,
            x - 1,
            y - 0.5,
            2,
            1,
            text=v,
            text_color=WHITE,
            border_color=BLUE,
            fill_color=BLUE,
            rounded=True,
            text_size=14,
        )
    leaves = [(-6, 0, "5"), (-3, 0, "10"), (0, 0, "15"), (3, 0, "25"), (6, 0, "40")]
    for x, y, v in leaves:
        draw_box(
            ax,
            x - 1,
            y - 0.5,
            2,
            1,
            text=v,
            text_color=BLACK,
            border_color=GREEN,
            fill_color=LIGHT_GREEN,
            rounded=True,
            text_size=14,
        )
    for x in [-5, -2, 1, 4]:
        draw_arrow(ax, (x, 0.5), (x + 1, 0.5), text="", rad=0)
    return fig


def generate_query_execution_tree():
    fig, ax = setup_canvas(w=14, h=10, xlim=(-7, 7), ylim=(-5, 5))
    add_title(ax, "خطة تنفيذ الاستعلام")
    draw_box(
        ax,
        0,
        4,
        3,
        1,
        text="Project",
        text_color=WHITE,
        border_color=BLUE,
        fill_color=BLUE,
        rounded=True,
        text_size=16,
    )
    draw_box(
        ax,
        0,
        1.5,
        3,
        1,
        text="Join",
        text_color=WHITE,
        border_color=GREEN,
        fill_color=GREEN,
        rounded=True,
        text_size=16,
    )
    draw_box(
        ax,
        -3,
        -1,
        2.5,
        1,
        text="Select",
        text_color=BLACK,
        border_color=RED,
        fill_color=LIGHT_RED,
        rounded=True,
        text_size=14,
    )
    draw_box(
        ax,
        3,
        -1,
        2.5,
        1,
        text="Scan",
        text_color=BLACK,
        border_color=RED,
        fill_color=LIGHT_RED,
        rounded=True,
        text_size=14,
    )
    draw_arrow(ax, (0, 3), (0, 2.5), text="", rad=0)
    draw_arrow(ax, (0, 1), (-1.5, -0.5), text="", rad=0)
    draw_arrow(ax, (0, 1), (1.5, -0.5), text="", rad=0)
    return fig


def generate_transaction_schedule():
    fig, ax = setup_canvas(w=16, h=8, xlim=(-8, 8), ylim=(-4, 4))
    add_title(ax, "جدول المعاملات")
    draw_table(
        ax,
        -6,
        3,
        ["العملية", "T1", "T2"],
        [
            ["Read(X)", "X=10", "-"],
            ["Write(Y)", "Y=20", "-"],
            ["Read(Y)", "-", "Y=20"],
            ["Commit", "OK", "-"],
        ],
    )
    return fig


# =========================================================
#       SECTION 5: UML Diagrams (هندسة البرمجيات)
# =========================================================


def generate_uml_class_diagram():
    fig, ax = setup_canvas(w=18, h=12, xlim=(-9, 9), ylim=(-6, 6))
    add_title(ax, "مخطط UML للفئات")
    draw_box(
        ax,
        -7,
        4,
        4,
        2.5,
        text="شخص",
        text_color=BLACK,
        border_color=BLUE,
        fill_color=WHITE,
        rounded=False,
        text_size=16,
    )
    draw_box(
        ax,
        -2,
        4,
        4,
        2.5,
        text="طالب",
        text_color=BLACK,
        border_color=BLUE,
        fill_color=WHITE,
        rounded=False,
        text_size=16,
    )
    draw_box(
        ax,
        3,
        4,
        4,
        2.5,
        text="Universities",
        text_color=BLACK,
        border_color=BLUE,
        fill_color=WHITE,
        rounded=False,
        text_size=14,
    )
    draw_arrow(ax, (-5, 4), (-3, 4), text="يتبع", rad=0)
    draw_diamond(ax, -1, 3, 0.8, 0.8, text="", fill_color=BLUE, border_color=BLUE)
    return fig


def generate_uml_sequence_diagram():
    fig, ax = setup_canvas(w=16, h=12, xlim=(-8, 8), ylim=(-6, 6))
    add_title(ax, "مخطط UML التسلسلي")
    for i, name in enumerate(["Client", "Server", "Database"]):
        x = -5 + i * 5
        ax.plot([x, x], [-5, 5], color=GRAY, linestyle="--", linewidth=2)
        draw_circle(ax, x, 5, 0.3, text=name, text_size=12)
    draw_box(
        ax,
        -5,
        2,
        2,
        1.5,
        text="Request",
        text_color=WHITE,
        border_color=BLUE,
        fill_color=BLUE,
        rounded=True,
        text_size=12,
    )
    draw_arrow(ax, (-5, 2), (0, 2), text="", rad=0)
    draw_arrow(ax, (0, 2), (5, 2), text="", rad=0)
    return fig


def generate_uml_state_machine():
    fig, ax = setup_canvas(w=14, h=10, xlim=(-7, 7), ylim=(-5, 5))
    add_title(ax, "مخطط UML للحالة")
    draw_circle(ax, -5, 3, 0.3, text="", fill_color=BLACK, border_color=BLACK)
    states = [
        (-2, 3, "Ready"),
        (3, 3, "Running"),
        (3, -2, "Waiting"),
        (-2, -2, "Terminated"),
    ]
    for x, y, s in states:
        draw_box(
            ax,
            x - 1.5,
            y - 0.6,
            3,
            1.2,
            text=s,
            text_color=BLACK,
            border_color=BLUE,
            fill_color=WHITE,
            rounded=True,
            text_size=14,
        )
    return fig


def generate_uml_activity_diagram():
    fig, ax = setup_canvas(w=14, h=12, xlim=(-7, 7), ylim=(-6, 6))
    add_title(ax, "مخطط UML للنشاط")
    draw_circle(ax, -4, 5, 0.4, text="", fill_color=GREEN, border_color=GREEN)
    draw_box(
        ax,
        -4,
        3,
        3,
        1,
        text="بداية",
        text_color=BLACK,
        border_color=BLUE,
        fill_color=WHITE,
        rounded=False,
        text_size=14,
    )
    draw_diamond(
        ax,
        -4,
        0.5,
        3,
        1.5,
        text="شرط",
        text_color=BLACK,
        border_color=BLUE,
        fill_color=LIGHT_BLUE,
        text_size=12,
    )
    draw_box(
        ax,
        -6,
        -2.5,
        2.5,
        1,
        text="فعل 1",
        text_color=BLACK,
        border_color=GREEN,
        fill_color=LIGHT_GREEN,
        rounded=False,
        text_size=12,
    )
    draw_box(
        ax,
        -1.5,
        -2.5,
        2.5,
        1,
        text="فعل 2",
        text_color=BLACK,
        border_color=RED,
        fill_color=LIGHT_RED,
        rounded=False,
        text_size=12,
    )
    return fig


def generate_uml_use_case_diagram():
    fig, ax = setup_canvas(w=16, h=10, xlim=(-8, 8), ylim=(-5, 5))
    add_title(ax, "مخطط UML لحالات الاستخدام")
    draw_box(
        ax,
        0,
        -1,
        8,
        6,
        text="النظام",
        text_color=BLACK,
        border_color=BLUE,
        fill_color=LIGHT_BLUE,
        rounded=True,
        text_size=20,
        linewidth=3,
    )
    draw_circle(
        ax,
        -6,
        2,
        0.8,
        text="مستخدم",
        text_color=WHITE,
        border_color=GREEN,
        fill_color=GREEN,
    )
    draw_circle(
        ax,
        -6,
        -1,
        0.8,
        text="مشغل",
        text_color=WHITE,
        border_color=GREEN,
        fill_color=GREEN,
    )
    draw_circle(
        ax,
        0,
        4,
        0.8,
        text="تسجيل",
        text_color=BLACK,
        border_color=BLUE,
        fill_color=WHITE,
    )
    draw_circle(
        ax,
        3,
        2,
        0.8,
        text="شراء",
        text_color=BLACK,
        border_color=BLUE,
        fill_color=WHITE,
    )
    return fig


def generate_uml_component_diagram():
    fig, ax = setup_canvas(w=16, h=10, xlim=(-8, 8), ylim=(-5, 5))
    add_title(ax, "مخطط UML للمكونات")
    comps = [(-5, 2, "API"), (0, 2, "Service"), (5, 2, "DB")]
    for x, y, c in comps:
        draw_box(
            ax,
            x - 2,
            y - 1,
            4,
            2,
            text=c,
            text_color=BLACK,
            border_color=BLUE,
            fill_color=WHITE,
            rounded=False,
            text_size=16,
        )
    draw_arrow(ax, (-3, 2), (-1, 2), text="uses", rad=0, text_size=12)
    draw_arrow(ax, (1, 2), (3, 2), text="queries", rad=0, text_size=12)
    return fig


def generate_uml_deployment_diagram():
    fig, ax = setup_canvas(w=16, h=10, xlim=(-8, 8), ylim=(-5, 5))
    add_title(ax, "مخطط UML للنشر")
    draw_box(
        ax,
        -5,
        2,
        3,
        2,
        text="Server",
        text_color=WHITE,
        border_color=BLUE,
        fill_color=BLUE,
        rounded=False,
        text_size=16,
    )
    draw_box(
        ax,
        2,
        2,
        3,
        2,
        text="Client",
        text_color=WHITE,
        border_color=GREEN,
        fill_color=GREEN,
        rounded=False,
        text_size=16,
    )
    draw_arrow(ax, (-3.5, 2), (2, 2), text="HTTP", rad=0.2, text_size=14)
    return fig


# =========================================================
#       SECTION 6: Networks (شبكات)
# =========================================================


def generate_osi_model():
    fig, ax = setup_canvas(w=12, h=14, xlim=(-6, 6), ylim=(-7, 7))
    add_title(ax, "نموذج OSI")
    layers = [
        ("7. Application", "HTTP, DNS"),
        ("6. Presentation", "SSL, JPEG"),
        ("5. Session", "RPC, NetBIOS"),
        ("4. Transport", "TCP, UDP"),
        ("3. Network", "IP, ICMP"),
        ("2. Data Link", "Ethernet"),
        ("1. Physical", "Cables"),
    ]
    for i, (layer, proto) in enumerate(layers):
        y = 6 - i * 1.8
        draw_box(
            ax,
            -4,
            y,
            8,
            1.5,
            text=layer,
            text_color=WHITE,
            border_color=BLUE,
            fill_color=BLUE,
            rounded=False,
            text_size=14,
        )
        ax.text(3, y + 0.75, proto, fontsize=10, color=GRAY, ha="center", va="center")
    return fig


def generate_tcp_ip_model():
    fig, ax = setup_canvas(w=14, h=10, xlim=(-7, 7), ylim=(-5, 5))
    add_title(ax, "نموذج TCP/IP")
    layers = [
        ("Application", "HTTP, DNS, SMTP"),
        ("Transport", "TCP, UDP"),
        ("Internet", "IP, ICMP"),
        ("Link", "Ethernet, WiFi"),
    ]
    for i, (layer, proto) in enumerate(layers):
        y = 4 - i * 2.2
        draw_box(
            ax,
            -4,
            y,
            8,
            1.8,
            text=layer,
            text_color=WHITE,
            border_color=BLUE,
            fill_color=BLUE,
            rounded=True,
            text_size=16,
        )
        ax.text(3, y + 0.9, proto, fontsize=10, color=GRAY, ha="center", va="center")
    return fig


def generate_network_topology():
    fig, ax = setup_canvas(w=18, h=12, xlim=(-9, 9), ylim=(-6, 6))
    add_title(ax, "طوبولوجيا الشبكات")
    tops = [(-7, 4, "Star"), (0, 4, "Bus"), (7, 4, "Ring"), (-7, -2, "Mesh")]
    for x, y, name in tops:
        ax.text(
            x, y + 1.5, name, fontsize=12, ha="center", fontproperties=get_font_prop(12)
        )
        center = (x, y)
        if name == "Star":
            for dx, dy in [(0, 1), (1, 0), (0, -1), (-1, 0)]:
                draw_circle(
                    ax, x + dx * 1.5, y + dy * 1.5, 0.3, text="", border_color=BLUE
                )
            draw_arrow(ax, (x, y), (x, y + 1), text="", rad=0)
        elif name == "Bus":
            ax.plot([x - 2, x + 2], [y, y], color=BLUE, linewidth=2)
            for dx in [-1.5, -0.5, 0.5, 1.5]:
                draw_circle(ax, x + dx, y + 0.5, 0.3, text="", border_color=BLUE)
    return fig


def generate_routing_table():
    fig, ax = setup_canvas(w=16, h=10, xlim=(-8, 8), ylim=(-5, 5))
    add_title(ax, "جدول التوجيه")
    draw_table(
        ax,
        -5,
        4,
        ["Destination", "Next Hop", "Interface", "Metric"],
        [
            ["192.168.1.0", "10.0.0.1", "eth0", "1"],
            ["10.0.0.0", "Direct", "eth0", "0"],
            ["0.0.0.0", "10.0.0.2", "eth1", "2"],
        ],
    )
    return fig


def generate_packet_flow():
    fig, ax = setup_canvas(w=14, h=10, xlim=(-7, 7), ylim=(-5, 5))
    add_title(ax, "تدفق الحزمة")
    layers = ["Application", "Transport", "Network", "Link"]
    for i, layer in enumerate(layers):
        y = 4 - i * 2.5
        draw_box(
            ax,
            -2,
            y,
            4,
            1.5,
            text=layer,
            text_color=WHITE,
            border_color=BLUE,
            fill_color=BLUE,
            rounded=True,
            text_size=14,
        )
        if i > 0:
            draw_arrow(
                ax, (0, y + 2), (0, y + 0.75), text="Encaps", rad=0, text_size=10
            )
    return fig


def generate_dns_resolution():
    fig, ax = setup_canvas(w=16, h=10, xlim=(-8, 8), ylim=(-5, 5))
    add_title(ax, "حل DNS")
    steps = [("Client", -6), ("Resolver", -2), ("Root", 2), ("TLD", 5)]
    for name, x in steps:
        draw_box(
            ax,
            x - 1.5,
            0,
            3,
            1.5,
            text=name,
            text_color=WHITE,
            border_color=BLUE,
            fill_color=BLUE,
            rounded=True,
            text_size=14,
        )
    for i in range(len(steps) - 1):
        draw_arrow(
            ax, (steps[i][1] + 1.5, 0.75), (steps[i + 1][1] - 1.5, 0.75), text="", rad=0
        )
    return fig


# =========================================================
#       SECTION 7: Operating Systems (نظم تشغيل)
# =========================================================


def generate_process_state_diagram():
    fig, ax = setup_canvas(w=16, h=10, xlim=(-8, 8), ylim=(-5, 5))
    add_title(ax, "حالات العملية")
    states = [
        (-5, 3, "New"),
        (-2, 3, "Ready"),
        (2, 3, "Running"),
        (5, 0, "Waiting"),
        (2, -3, "Terminated"),
    ]
    for x, y, s in states:
        draw_box(
            ax,
            x - 1,
            y - 0.6,
            2,
            1.2,
            text=s,
            text_color=BLACK,
            border_color=BLUE,
            fill_color=WHITE,
            rounded=True,
            text_size=14,
        )
    return fig


def generate_scheduling_gantt():
    fig, ax = setup_canvas(w=18, h=10, xlim=(-9, 9), ylim=(-5, 5))
    add_title(ax, "مخطط غانت للجدولة")
    processes = [(1, "P1", 3, BLUE), (2, "P2", 2, GREEN), (3, "P3", 4, RED)]
    for idx, name, dur, color in processes:
        x = -8 + idx * 2
        draw_box(
            ax,
            x,
            3,
            dur * 1.5,
            1,
            text=name,
            text_color=WHITE,
            border_color=color,
            fill_color=color,
            rounded=False,
            text_size=14,
        )
    return fig


def generate_memory_management():
    fig, ax = setup_canvas(w=16, h=12, xlim=(-8, 8), ylim=(-6, 6))
    add_title(ax, "ادارة الذاكرة")
    segs = [("Code", 4, BLUE), ("Data", 2, GREEN), ("Heap", 3, RED), ("Stack", 2, CYAN)]
    y = 5
    for name, h, color in segs:
        draw_box(
            ax,
            -3,
            y,
            6,
            h,
            text=name,
            text_color=WHITE,
            border_color=color,
            fill_color=color,
            rounded=False,
            text_size=16,
        )
        y -= h + 0.5
    draw_table(ax, 3, 5, ["Page", "Frame"], [["0", "5"], ["1", "2"], ["2", "7"]])
    return fig


def generate_deadlock_graph():
    fig, ax = setup_canvas(w=14, h=10, xlim=(-7, 7), ylim=(-5, 5))
    add_title(ax, "رسم deadlock")
    processes = [(-3, 3, "P1"), (3, 3, "P2")]
    resources = [(-3, -2, "R1"), (3, -2, "R2")]
    for x, y, p in processes:
        draw_circle(ax, x, y, 0.8, text=p, text_size=14)
    for x, y, r in resources:
        draw_box(
            ax,
            x - 0.8,
            y - 0.5,
            1.6,
            1,
            text=r,
            text_color=WHITE,
            border_color=RED,
            fill_color=RED,
            rounded=False,
            text_size=14,
        )
    draw_arrow(ax, (-3, 2.2), (-3, -0.5), text="hold", rad=0, text_size=10)
    draw_arrow(ax, (3, 2.2), (3, -0.5), text="hold", rad=0, text_size=10)
    draw_arrow(ax, (-3, -1.5), (0, 1), text="req", rad=0.2, text_size=10)
    draw_arrow(ax, (3, -1.5), (0, 1), text="req", rad=-0.2, text_size=10)
    return fig


def generate_semaphore_operations():
    fig, ax = setup_canvas(w=14, h=10, xlim=(-7, 7), ylim=(-5, 5))
    add_title(ax, "عمليات Semaphore")
    draw_box(
        ax,
        -3,
        3,
        6,
        1.5,
        text="Section الحرجة",
        text_color=WHITE,
        border_color=BLUE,
        fill_color=BLUE,
        rounded=True,
        text_size=16,
    )
    add_code_block(ax, -3, 0, ["wait(S):", "    S = S - 1", "    if S < 0: block"])
    add_code_block(ax, 3, 0, ["signal(S):", "    S = S + 1", "    if S <= 0: wake"])
    return fig


# =========================================================
#       SECTION 8: Electronics & Logic (إلكترونيات)
# =========================================================


def generate_logic_gates():
    fig, ax = setup_canvas(w=18, h=12, xlim=(-9, 9), ylim=(-6, 6))
    add_title(ax, "بوابات المنطق")
    gates = [
        (-7, 4, "AND"),
        (-3, 4, "OR"),
        (1, 4, "NOT"),
        (5, 4, "NAND"),
        (-7, 0, "NOR"),
        (-3, 0, "XOR"),
    ]
    for x, y, g in gates:
        draw_box(
            ax,
            x - 1,
            y - 0.8,
            2,
            1.6,
            text=g,
            text_color=BLACK,
            border_color=BLUE,
            fill_color=WHITE,
            rounded=True,
            text_size=16,
        )
    return fig


def generate_karnaugh_map():
    fig, ax = setup_canvas(w=14, h=10, xlim=(-7, 7), ylim=(-5, 5))
    add_title(ax, "خريطة Karnaugh")
    draw_table(
        ax,
        -4,
        3,
        ["BC\\A", "0", "1", "00", "01", "11", "10"],
        [["0", "1", "0", "1", "1"], ["1", "0", "1", "0", "0"]],
    )
    add_label(ax, 0, -2, "تجميع:group1(A=0,B=0) + group2(A=1)", color=GREEN, size=12)
    return fig


def generate_flip_flop_circuit():
    fig, ax = setup_canvas(w=16, h=8, xlim=(-8, 8), ylim=(-4, 4))
    add_title(ax, "دارات Flip-Flop")
    ffs = [(-5, 2, "SR"), (-1, 2, "D"), (3, 2, "JK")]
    for x, y, f in ffs:
        draw_box(
            ax,
            x - 1.5,
            y - 0.8,
            3,
            1.6,
            text=f"{f} FF",
            text_color=BLACK,
            border_color=BLUE,
            fill_color=WHITE,
            rounded=True,
            text_size=16,
        )
    return fig


def generate_combinational_circuit():
    fig, ax = setup_canvas(w=16, h=8, xlim=(-8, 8), ylim=(-4, 4))
    add_title(ax, "دارة Combinational - Adder")
    draw_box(
        ax,
        -6,
        1,
        1.5,
        1,
        text="A",
        text_color=BLACK,
        border_color=BLUE,
        fill_color=LIGHT_BLUE,
        rounded=False,
        text_size=14,
    )
    draw_box(
        ax,
        -6,
        -1,
        1.5,
        1,
        text="B",
        text_color=BLACK,
        border_color=BLUE,
        fill_color=LIGHT_BLUE,
        rounded=False,
        text_size=14,
    )
    draw_box(
        ax,
        0,
        0,
        3,
        2,
        text="Adder",
        text_color=WHITE,
        border_color=GREEN,
        fill_color=GREEN,
        rounded=True,
        text_size=18,
    )
    draw_box(
        ax,
        6,
        0.5,
        1.5,
        1,
        text="Sum",
        text_color=BLACK,
        border_color=RED,
        fill_color=LIGHT_RED,
        rounded=False,
        text_size=14,
    )
    draw_box(
        ax,
        6,
        -0.5,
        1.5,
        1,
        text="Carry",
        text_color=BLACK,
        border_color=RED,
        fill_color=LIGHT_RED,
        rounded=False,
        text_size=14,
    )
    return fig


def generate_transistor_circuit():
    fig, ax = setup_canvas(w=14, h=10, xlim=(-7, 7), ylim=(-5, 5))
    add_title(ax, "دارة الترانزستور")
    draw_box(
        ax,
        -2,
        2,
        4,
        1.5,
        text="مضخم الترانزستور",
        text_color=BLACK,
        border_color=BLUE,
        fill_color=WHITE,
        rounded=True,
        text_size=16,
    )
    add_label(ax, -2, 0, "المدخل", color=GREEN, size=12)
    add_label(ax, 4, 0, "المخرج", color=RED, size=12)
    return fig


# =========================================================
#       SECTION 9: Math & Physics (الرياضيات والفيزياء)
# =========================================================


def generate_function_plot():
    fig, ax = setup_canvas(w=14, h=10, xlim=(-7, 7), ylim=(-5, 5))
    add_title(ax, "رسم الدالة")
    x = np.linspace(-np.pi, np.pi, 200)
    ax.plot(x, np.sin(x), color=BLUE, linewidth=2)
    ax.plot(x, np.cos(x), color=RED, linewidth=2)
    ax.set_xlabel("x", fontsize=14)
    ax.set_ylabel("y", fontsize=14)
    add_legend(ax, [(BLUE, "sin(x)"), (RED, "cos(x)")], title="الدوال")
    return fig


def generate_derivative_visualization():
    fig, ax = setup_canvas(w=14, h=10, xlim=(-5, 5), ylim=(-2, 6))
    add_title(ax, "المشتقة - المماس")
    x = np.linspace(-2, 4, 100)
    ax.plot(x, (x - 1) ** 2 + 1, color=BLUE, linewidth=2)
    x0 = 2
    slope = 2 * (x0 - 1)
    y0 = (x0 - 1) ** 2 + 1
    ax.plot(
        [x0 - 1.5, x0 + 1.5],
        [y0 - slope * 1.5, y0 + slope * 1.5],
        color=RED,
        linewidth=2,
        linestyle="--",
    )
    ax.plot([x0], [y0], "ro", markersize=10)
    add_label(ax, x0, y0 + 0.5, f"y' = {slope}", color=RED, size=14)
    return fig


def generate_matrix_operations():
    fig, ax = setup_canvas(w=16, h=8, xlim=(-8, 8), ylim=(-4, 4))
    add_title(ax, "عمليات المصفوفات")
    add_text(ax, -5, 2, "A", size=24)
    draw_table(ax, -4, 2, ["2", "1"], [["3", "4"]], cell_w=1.2, cell_h=1)
    add_text(ax, 0, 2, "x", size=24)
    draw_table(ax, 1, 2, ["1"], [["2"]], cell_w=1.2, cell_h=1)
    add_text(ax, 4, 2, "=", size=24)
    draw_table(ax, 5, 2, ["8"], [["11"]], cell_w=1.2, cell_h=1)
    return fig


def generate_vector_space():
    fig, ax = setup_canvas(w=14, h=10, xlim=(-7, 7), ylim=(-5, 5))
    add_title(ax, "فضاء المتجهات")
    ax.plot([0, 0], [-5, 5], color=BLACK, linewidth=1)
    ax.plot([-7, 7], [0, 0], color=BLACK, linewidth=1)
    ax.arrow(0, 0, 4, 2, head_width=0.2, head_length=0.2, fc=BLUE, ec=BLUE)
    ax.arrow(0, 0, 2, 3, head_width=0.2, head_length=0.2, fc=RED, ec=RED)
    add_label(ax, 4.5, 2, "v1", color=BLUE, size=14)
    add_label(ax, 2.5, 3.5, "v2", color=RED, size=14)
    return fig


def generate_fourier_transform():
    fig, ax = setup_canvas(w=16, h=8, xlim=(-8, 8), ylim=(-3, 5))
    add_title(ax, "تحويل فورييه")
    t = np.linspace(0, 4 * np.pi, 200)
    ax.plot(t, np.sin(t) + np.sin(3 * t), color=BLUE, linewidth=2)
    ax.set_title("المجال الزمني", fontproperties=get_font_prop(14))
    return fig


# =========================================================
#       SECTION 10: AI & ML (ذكاء اصطناعي)
# =========================================================


def generate_neural_network():
    fig, ax = setup_canvas(w=16, h=10, xlim=(-8, 8), ylim=(-5, 5))
    add_title(ax, "الشبكة العصبية")
    layers = [(0, "Input"), (-3, "Hidden"), (-6, "Output")]
    for i, (x_off, label) in enumerate(layers):
        nodes = [2, 3, 2] if i < 2 else [1]
        for j, n in enumerate(nodes):
            y_off = 4 - j * 2
            draw_circle(ax, x_off, y_off, 0.4, text="", border_color=BLUE)
    draw_arrow(ax, (-0.5, 3), (-2.5, 3), text="", rad=0)
    draw_arrow(ax, (-3.5, 3), (-5.5, 3), text="", rad=0)
    add_label(ax, 0, -4, "Input Layer", color=GREEN, size=12)
    add_label(ax, -3, -4, "Hidden Layers", color=BLUE, size=12)
    add_label(ax, -6, -4, "Output", color=RED, size=12)
    return fig


def generate_decision_tree():
    fig, ax = setup_canvas(w=16, h=12, xlim=(-8, 8), ylim=(-6, 6))
    add_title(ax, "شجرة القرار")
    draw_diamond(
        ax,
        0,
        4.5,
        3,
        1.5,
        text="درجة؟",
        text_color=BLACK,
        border_color=BLUE,
        fill_color=LIGHT_BLUE,
        text_size=14,
    )
    draw_box(
        ax,
        -4,
        2,
        2.5,
        1.2,
        text="مرتفع",
        text_color=WHITE,
        border_color=GREEN,
        fill_color=GREEN,
        rounded=True,
        text_size=14,
    )
    draw_box(
        ax,
        0,
        2,
        2.5,
        1.2,
        text="متوسط",
        text_color=BLACK,
        border_color=BLUE,
        fill_color=WHITE,
        rounded=True,
        text_size=14,
    )
    draw_box(
        ax,
        4,
        2,
        2.5,
        1.2,
        text="منخفض",
        text_color=WHITE,
        border_color=RED,
        fill_color=RED,
        rounded=True,
        text_size=14,
    )
    draw_arrow(ax, (-1.5, 4), (-4, 2.5), text="", rad=0)
    draw_arrow(ax, (0, 4), (0, 2.5), text="", rad=0)
    draw_arrow(ax, (1.5, 4), (4, 2.5), text="", rad=0)
    return fig


def generate_search_tree():
    fig, ax = setup_canvas(w=16, h=10, xlim=(-8, 8), ylim=(-5, 5))
    add_title(ax, "شجرة البحث - Minimax")
    nodes = [
        (0, 3, "Max"),
        (-3, 1, "Min"),
        (3, 1, "Min"),
        (-5, -1, "10"),
        (-1, -1, "5"),
        (1, -1, "8"),
        (5, -1, "12"),
    ]
    for x, y, v in nodes:
        draw_circle(ax, x, y, 0.6, text=v, text_size=14)
    edges = [
        ((0, 2.4), (-2.4, 1.5)),
        ((0, 2.4), (2.4, 1.5)),
        ((-3, 0.4), (-4.4, -0.5)),
        ((-3, 0.4), (-1.6, -0.5)),
        ((3, 0.4), (1.6, -0.5)),
        ((3, 0.4), (4.4, -0.5)),
    ]
    for (x1, y1), (x2, y2) in edges:
        draw_arrow(ax, (x1, y1), (x2, y2), rad=0.1)
    return fig


def generate_genetic_algorithm():
    fig, ax = setup_canvas(w=16, h=10, xlim=(-8, 8), ylim=(-5, 5))
    add_title(ax, "الخوارزمية الجينية")
    steps = ["Population", "Selection", "Crossover", "Mutation", "New Gen"]
    for i, step in enumerate(steps):
        x = -6 + i * 3
        draw_box(
            ax,
            x,
            2,
            2.5,
            1,
            text=step,
            text_color=WHITE if i % 2 == 0 else BLACK,
            border_color=BLUE,
            fill_color=BLUE if i % 2 == 0 else WHITE,
            rounded=True,
            text_size=12,
        )
        if i > 0:
            draw_arrow(ax, (x - 1.5, 2), (x - 0.2, 2), text="", rad=0)
    return fig


def generate_fuzzy_logic_sets():
    fig, ax = setup_canvas(w=14, h=10, xlim=(-7, 7), ylim=(-5, 5))
    add_title(ax, "مجموعات fuzzy logic")
    x = np.linspace(0, 10, 100)
    ax.plot(x, np.exp(-((x - 3) ** 2) / 4), color=BLUE, linewidth=2, label="Low")
    ax.plot(x, np.exp(-((x - 5) ** 2) / 4), color=GREEN, linewidth=2, label="Medium")
    ax.plot(x, np.exp(-((x - 7) ** 2) / 4), color=RED, linewidth=2, label="High")
    ax.legend()
    return fig


# =========================================================
#       SECTION 11: Computer Architecture (بنية الحاسب)
# =========================================================


def generate_cpu_datapath():
    fig, ax = setup_canvas(w=16, h=10, xlim=(-8, 8), ylim=(-5, 5))
    add_title(ax, "CPU Datapath")
    draw_box(
        ax,
        -6,
        3,
        2.5,
        1.5,
        text="Registers",
        text_color=WHITE,
        border_color=BLUE,
        fill_color=BLUE,
        rounded=True,
        text_size=14,
    )
    draw_box(
        ax,
        -1,
        3,
        3,
        2,
        text="ALU",
        text_color=WHITE,
        border_color=GREEN,
        fill_color=GREEN,
        rounded=True,
        text_size=16,
    )
    draw_box(
        ax,
        4,
        3,
        3,
        1.5,
        text="Memory",
        text_color=WHITE,
        border_color=RED,
        fill_color=RED,
        rounded=True,
        text_size=14,
    )
    draw_arrow(ax, (-4.5, 3), (-2.5, 3), text="", rad=0)
    draw_arrow(ax, (1, 3), (4, 3), text="", rad=0)
    return fig


def generate_pipeline_diagram():
    fig, ax = setup_canvas(w=18, h=8, xlim=(-9, 9), ylim=(-4, 4))
    add_title(ax, "CPU Pipeline - 5 Stages")
    stages = ["IF", "ID", "EX", "MEM", "WB"]
    for i, stage in enumerate(stages):
        x = -7 + i * 3.5
        draw_box(
            ax,
            x,
            2,
            2.5,
            1,
            text=stage,
            text_color=WHITE,
            border_color=BLUE,
            fill_color=BLUE,
            rounded=True,
            text_size=16,
        )
    add_label(ax, 0, -2, "كل دورة = 5 تعليمات متوازية", color=GREEN, size=14)
    return fig


def generate_cache_organization():
    fig, ax = setup_canvas(w=16, h=10, xlim=(-8, 8), ylim=(-5, 5))
    add_title(ax, "Cache Organization")
    draw_table(
        ax,
        -5,
        4,
        ["Index", "Tag", "Data", "Valid"],
        [
            ["0", "101", "X", "1"],
            ["1", "011", "Y", "1"],
            ["2", "000", "-", "0"],
            ["3", "111", "Z", "1"],
        ],
    )
    add_label(ax, 0, -2, "Direct-Mapped Cache", color=BLUE, size=14)
    return fig


def generate_instruction_format():
    fig, ax = setup_canvas(w=16, h=8, xlim=(-8, 8), ylim=(-4, 4))
    add_title(ax, "Instruction Format")
    draw_box(
        ax,
        -6,
        2,
        2,
        1.2,
        text="Op",
        text_color=WHITE,
        border_color=BLUE,
        fill_color=BLUE,
        rounded=False,
        text_size=14,
    )
    draw_box(
        ax,
        -3.5,
        2,
        2,
        1.2,
        text="Rs",
        text_color=WHITE,
        border_color=GREEN,
        fill_color=GREEN,
        rounded=False,
        text_size=14,
    )
    draw_box(
        ax,
        -1,
        2,
        2,
        1.2,
        text="Rt",
        text_color=WHITE,
        border_color=RED,
        fill_color=RED,
        rounded=False,
        text_size=14,
    )
    draw_box(
        ax,
        1.5,
        2,
        2,
        1.2,
        text="Rd",
        text_color=WHITE,
        border_color=CYAN,
        fill_color=CYAN,
        rounded=False,
        text_size=14,
    )
    draw_box(
        ax,
        4,
        2,
        2,
        1.2,
        text="Shamt",
        text_color=WHITE,
        border_color=GRAY,
        fill_color=GRAY,
        rounded=False,
        text_size=14,
    )
    return fig


# =========================================================
#       SECTION 12: Compiler Design (تصميم المترجمات)
# =========================================================


def generate_compiler_phases():
    fig, ax = setup_canvas(w=18, h=8, xlim=(-9, 9), ylim=(-4, 4))
    add_title(ax, "مراحل المترجم")
    phases = ["Lexical", "Syntax", "Semantic", "IR", "Optim", "CodeGen"]
    for i, phase in enumerate(phases):
        x = -7 + i * 3
        draw_box(
            ax,
            x,
            2,
            2.5,
            1.5,
            text=phase,
            text_color=WHITE,
            border_color=BLUE,
            fill_color=BLUE,
            rounded=True,
            text_size=14,
        )
        if i > 0:
            draw_arrow(ax, (x - 1.5, 2), (x - 0.2, 2), text="", rad=0)
    return fig


def generate_parse_tree():
    fig, ax = setup_canvas(w=14, h=10, xlim=(-7, 7), ylim=(-5, 5))
    add_title(ax, "Parse Tree")
    draw_box(
        ax,
        0,
        4,
        2,
        1,
        text="E",
        text_color=WHITE,
        border_color=BLUE,
        fill_color=BLUE,
        rounded=True,
        text_size=16,
    )
    draw_box(
        ax,
        -2,
        2,
        1.5,
        0.8,
        text="E",
        text_color=BLACK,
        border_color=GREEN,
        fill_color=LIGHT_GREEN,
        rounded=True,
        text_size=14,
    )
    draw_box(
        ax,
        2,
        2,
        1.5,
        0.8,
        text="T",
        text_color=BLACK,
        border_color=GREEN,
        fill_color=LIGHT_GREEN,
        rounded=True,
        text_size=14,
    )
    draw_arrow(ax, (-1, 3.5), (-2, 2.8), text="", rad=0)
    draw_arrow(ax, (1, 3.5), (2, 2.8), text="", rad=0)
    return fig


def generate_symbol_table():
    fig, ax = setup_canvas(w=16, h=10, xlim=(-8, 8), ylim=(-5, 5))
    add_title(ax, "Symbol Table")
    draw_table(
        ax,
        -5,
        4,
        ["Name", "Type", "Scope", "Address"],
        [
            ["x", "int", "global", "100"],
            ["y", "float", "global", "104"],
            ["foo", "func", "global", "200"],
        ],
    )
    return fig


def generate_ast_diagram():
    fig, ax = setup_canvas(w=14, h=10, xlim=(-7, 7), ylim=(-5, 5))
    add_title(ax, "AST - Abstract Syntax Tree")
    draw_box(
        ax,
        0,
        4,
        2,
        1,
        text="+",
        text_color=WHITE,
        border_color=BLUE,
        fill_color=BLUE,
        rounded=True,
        text_size=16,
    )
    draw_circle(ax, -2, 2, 0.5, text="a", text_size=14)
    draw_circle(ax, 2, 2, 0.5, text="b", text_size=14)
    draw_arrow(ax, (-1, 3.5), (-2, 2.5), text="", rad=0)
    draw_arrow(ax, (1, 3.5), (2, 2.5), text="", rad=0)
    return fig


# =========================================================
#       SECTION 13: Signal Processing (معالجة الاشارة)
# =========================================================


def generate_signal_time_frequency():
    fig, ax = plt.subplots(1, 2, figsize=(14, 5))
    ax[0].set_title("المجال الزمني")
    t = np.linspace(0, 2, 200)
    ax[0].plot(t, np.sin(2 * np.pi * 5 * t), color=BLUE)
    ax[1].set_title("المجال الترددي")
    freq = np.fft.fft(np.sin(2 * np.pi * 5 * t))
    ax[1].plot(np.abs(freq[:50]), color=RED)
    return fig


def generate_filter_response():
    fig, ax = setup_canvas(w=14, h=10, xlim=(-7, 7), ylim=(-5, 5))
    add_title(ax, "استجابة المرشح")
    freq = np.linspace(0, 10, 100)
    low_pass = 1 / (1 + (freq / 3) ** 2)
    ax.plot(freq, low_pass, color=BLUE, linewidth=2)
    add_label(ax, 0, 4, "Low-Pass Filter", color=GREEN, size=14)
    return fig


def generate_convolution_visual():
    fig, ax = setup_canvas(w=14, h=10, xlim=(-7, 7), ylim=(-5, 5))
    add_title(ax, "Convolution")
    x = np.array([1, 2, 1])
    h = np.array([1, 1, 1])
    y = np.convolve(x, h)
    draw_table(ax, -4, 3, ["x"], [["1,2,1"]], cell_w=3, cell_h=0.8)
    draw_table(ax, 0, 3, ["h"], [["1,1,1"]], cell_w=3, cell_h=0.8)
    add_label(ax, 0, 0, "y = x * h = [1,3,4,3,1]", color=BLUE, size=14)
    return fig


# =========================================================
#       SECTION 14: Formal Languages (لغات صورية)
# =========================================================


def generate_dfa_diagram():
    fig, ax = setup_canvas(w=14, h=10, xlim=(-7, 7), ylim=(-5, 5))
    add_title(ax, "DFA - State Machine")
    states = [(-4, 2, "q0", GREEN), (0, 2, "q1", BLUE), (4, 2, "q2", RED)]
    for x, y, label, color in states:
        draw_circle(
            ax,
            x,
            y,
            0.8,
            text=label,
            border_color=color,
            fill_color=WHITE,
            text_size=16,
        )
    draw_arrow(ax, (-3.2, 2), (-0.8, 2), text="1", rad=0)
    draw_arrow(ax, (0.8, 2), (3.2, 2), text="1", rad=0)
    draw_arrow(ax, (4, 1.2), (4, -1), text="0", rad=0)
    return fig


def generate_parse_tree_formal():
    fig, ax = setup_canvas(w=14, h=10, xlim=(-7, 7), ylim=(-5, 5))
    add_title(ax, "Parse Tree - CFG")
    draw_box(
        ax,
        0,
        4,
        2,
        1,
        text="S",
        text_color=WHITE,
        border_color=BLUE,
        fill_color=BLUE,
        rounded=True,
        text_size=18,
    )
    draw_box(
        ax,
        -2,
        2,
        1.5,
        0.8,
        text="A",
        text_color=BLACK,
        border_color=GREEN,
        fill_color=LIGHT_GREEN,
        rounded=True,
        text_size=14,
    )
    draw_box(
        ax,
        2,
        2,
        1.5,
        0.8,
        text="B",
        text_color=BLACK,
        border_color=GREEN,
        fill_color=LIGHT_GREEN,
        rounded=True,
        text_size=14,
    )
    draw_arrow(ax, (-1, 3.5), (-2, 2.8), text="", rad=0)
    draw_arrow(ax, (1, 3.5), (2, 2.8), text="", rad=0)
    return fig


def generate_nfa_diagram():
    fig, ax = setup_canvas(w=14, h=10, xlim=(-7, 7), ylim=(-5, 5))
    add_title(ax, "NFA with epsilon")
    states = [(-4, 2, "q0"), (0, 2, "q1"), (4, 2, "q2")]
    for x, y, label in states:
        draw_circle(ax, x, y, 0.8, text=label, text_size=16)
    draw_arrow(ax, (-3.2, 2), (-0.8, 2), text="a", rad=0)
    draw_arrow(ax, (0.8, 2), (3.2, 2), text="b", rad=0)
    draw_arrow(ax, (-4, 1.2), (-4, -0.5), text="e", rad=0, arrow_color=GRAY)
    return fig


# =========================================================
#       SECTION 15: Security (امن)
# =========================================================


def generate_encryption_flow():
    fig, ax = setup_canvas(w=16, h=10, xlim=(-8, 8), ylim=(-5, 5))
    add_title(ax, "Encryption Flow")
    draw_box(
        ax,
        -6,
        2,
        3,
        1.5,
        text="Plaintext",
        text_color=BLACK,
        border_color=GREEN,
        fill_color=LIGHT_GREEN,
        rounded=True,
        text_size=14,
    )
    draw_box(
        ax,
        -1,
        2,
        3,
        1.5,
        text="Encryption",
        text_color=WHITE,
        border_color=BLUE,
        fill_color=BLUE,
        rounded=True,
        text_size=14,
    )
    draw_box(
        ax,
        4,
        2,
        3,
        1.5,
        text="Ciphertext",
        text_color=WHITE,
        border_color=RED,
        fill_color=RED,
        rounded=True,
        text_size=14,
    )
    draw_arrow(ax, (-4.5, 2), (-2.5, 2), text="Key", rad=0, text_size=10)
    draw_arrow(ax, (1, 2), (4, 2), text="", rad=0)
    return fig


def generate_attack_tree():
    fig, ax = setup_canvas(w=14, h=10, xlim=(-7, 7), ylim=(-5, 5))
    add_title(ax, "Attack Tree")
    draw_box(
        ax,
        0,
        4,
        3,
        1.2,
        text="الهدف: اختراق النظام",
        text_color=WHITE,
        border_color=RED,
        fill_color=RED,
        rounded=True,
        text_size=14,
    )
    draw_box(
        ax,
        -3,
        1.5,
        2.5,
        1,
        text="Phishing",
        text_color=BLACK,
        border_color=GREEN,
        fill_color=LIGHT_GREEN,
        rounded=True,
        text_size=12,
    )
    draw_box(
        ax,
        0,
        1.5,
        2.5,
        1,
        text="Brute Force",
        text_color=BLACK,
        border_color=GREEN,
        fill_color=LIGHT_GREEN,
        rounded=True,
        text_size=12,
    )
    draw_box(
        ax,
        3,
        1.5,
        2.5,
        1,
        text="Zero Day",
        text_color=BLACK,
        border_color=GREEN,
        fill_color=LIGHT_GREEN,
        rounded=True,
        text_size=12,
    )
    draw_arrow(ax, (-1.5, 3.5), (-3, 2), text="", rad=0)
    draw_arrow(ax, (0, 3.5), (0, 2), text="", rad=0)
    draw_arrow(ax, (1.5, 3.5), (3, 2), text="", rad=0)
    return fig


def generate_pki_diagram():
    fig, ax = setup_canvas(w=16, h=10, xlim=(-8, 8), ylim=(-5, 5))
    add_title(ax, "PKI - Certificate Authority")
    boxes = [(-5, 2, "Root CA"), (-1, 2, "Intermediate"), (3, 2, "End Entity")]
    for x, y, label in boxes:
        draw_box(
            ax,
            x - 1.5,
            y - 0.8,
            3,
            1.6,
            text=label,
            text_color=WHITE,
            border_color=BLUE,
            fill_color=BLUE,
            rounded=True,
            text_size=14,
        )
    draw_arrow(ax, (-3.5, 2), (-1, 2), text="signs", rad=0)
    draw_arrow(ax, (1.5, 2), (3, 2), text="signs", rad=0)
    return fig


# =========================================================
#       SECTION 16: Software Engineering (هندسة البرمجيات)
# =========================================================


def generate_sdlc_waterfall():
    fig, ax = setup_canvas(w=18, h=10, xlim=(-9, 9), ylim=(-5, 5))
    add_title(ax, "SDLC - Waterfall Model")
    phases = [
        "Requirements",
        "Design",
        "Implementation",
        "Testing",
        "Deployment",
        "Maintenance",
    ]
    for i, phase in enumerate(phases):
        x = -7 + i * 2.8
        draw_box(
            ax,
            x,
            3,
            2.2,
            1.2,
            text=phase,
            text_color=WHITE if i % 2 == 0 else BLACK,
            border_color=BLUE,
            fill_color=BLUE if i % 2 == 0 else WHITE,
            rounded=True,
            text_size=10,
        )
        if i > 0:
            draw_arrow(ax, (x - 1.3, 3), (x - 0.2, 3), text="", rad=0)
    return fig


def generate_agile_scrum():
    fig, ax = setup_canvas(w=16, h=10, xlim=(-8, 8), ylim=(-5, 5))
    add_title(ax, "Scrum Cycle")
    draw_box(
        ax,
        0,
        3,
        6,
        1.5,
        text="Sprint (2-4 weeks)",
        text_color=WHITE,
        border_color=BLUE,
        fill_color=BLUE,
        rounded=True,
        text_size=16,
    )
    items = [
        ("Planning", -5, 0),
        ("Daily", -2, 0),
        ("Review", 2, 0),
        ("Retrospective", 5, 0),
    ]
    for name, x, y in items:
        draw_circle(ax, x, y, 0.8, text=name, text_size=10)
    draw_arrow(ax, (-4.2, 0), (-2.2, 0), text="", rad=0)
    draw_arrow(ax, (-1.2, 0), (1.2, 0), text="", rad=0)
    draw_arrow(ax, (2.8, 0), (4.2, 0), text="", rad=0)
    return fig


def generate_design_patterns():
    fig, ax = setup_canvas(w=16, h=10, xlim=(-8, 8), ylim=(-5, 5))
    add_title(ax, "Design Pattern - Observer")
    draw_box(
        ax,
        -5,
        3,
        3,
        1.5,
        text="Subject",
        text_color=WHITE,
        border_color=BLUE,
        fill_color=BLUE,
        rounded=True,
        text_size=14,
    )
    draw_box(
        ax,
        -5,
        0,
        3,
        1.5,
        text="Observer 1",
        text_color=BLACK,
        border_color=GREEN,
        fill_color=LIGHT_GREEN,
        rounded=True,
        text_size=12,
    )
    draw_box(
        ax,
        0,
        0,
        3,
        1.5,
        text="Observer 2",
        text_color=BLACK,
        border_color=GREEN,
        fill_color=LIGHT_GREEN,
        rounded=True,
        text_size=12,
    )
    draw_arrow(ax, (-3.5, 2), (-3.5, 1.5), text="attach", rad=0, text_size=10)
    draw_arrow(ax, (-1.5, 2), (0, 1.5), text="attach", rad=0, text_size=10)
    return fig


# =========================================================
#       SECTION 17: Graphics & Vision (رسوميات)
# =========================================================


def generate_2d_transforms():
    fig, ax = setup_canvas(w=14, h=10, xlim=(-7, 7), ylim=(-5, 5))
    add_title(ax, "2D Transformations")
    transform_types = [(-5, 3, "Translation"), (0, 3, "Rotation"), (5, 3, "Scaling")]
    for x, y, t in transform_types:
        draw_box(
            ax,
            x - 1.5,
            y - 0.8,
            3,
            1.6,
            text=t,
            text_color=WHITE,
            border_color=BLUE,
            fill_color=BLUE,
            rounded=True,
            text_size=14,
        )
    return fig


def generate_projection_types():
    fig, ax = setup_canvas(w=16, h=10, xlim=(-8, 8), ylim=(-5, 5))
    add_title(ax, "Projection Types")
    proj = [(-5, 2, "Orthographic"), (2, 2, "Perspective")]
    for x, y, p in proj:
        draw_box(
            ax,
            x - 2,
            y - 1,
            4,
            2,
            text=p,
            text_color=WHITE,
            border_color=BLUE,
            fill_color=BLUE,
            rounded=True,
            text_size=14,
        )
    return fig


def generate_cnn_architecture():
    fig, ax = setup_canvas(w=18, h=8, xlim=(-9, 9), ylim=(-4, 4))
    add_title(ax, "CNN Architecture")
    layers = [("Input", -7), ("Conv", -4), ("Pool", -1), ("FC", 2), ("Output", 5)]
    for name, x in layers:
        draw_box(
            ax,
            x - 1.5,
            2,
            3,
            1.5,
            text=name,
            text_color=WHITE,
            border_color=BLUE,
            fill_color=BLUE,
            rounded=True,
            text_size=14,
        )
        if layers.index((name, x)) < len(layers) - 1:
            next_x = layers[layers.index((name, x)) + 1][1]
            draw_arrow(ax, (x + 1.5, 2), (next_x - 1.5, 2), text="", rad=0)
    return fig


# =========================================================
#       SECTION 18: Distributed Systems (نظم موزعة)
# =========================================================


def generate_distributed_architecture():
    fig, ax = setup_canvas(w=16, h=10, xlim=(-8, 8), ylim=(-5, 5))
    add_title(ax, "Distributed Architecture")
    archs = [(-5, 2, "Client-Server"), (0, 2, "P2P"), (5, 2, "Microservices")]
    for x, y, a in archs:
        draw_box(
            ax,
            x - 2,
            y - 1,
            4,
            2,
            text=a,
            text_color=WHITE,
            border_color=BLUE,
            fill_color=BLUE,
            rounded=True,
            text_size=14,
        )
    return fig


def generate_consensus_protocol():
    fig, ax = setup_canvas(w=14, h=10, xlim=(-7, 7), ylim=(-5, 5))
    add_title(ax, "Consensus Protocol - Raft")
    states = [("Leader", -4, GREEN), ("Follower", 0, BLUE), ("Follower", 4, BLUE)]
    for name, x, color in states:
        draw_circle(
            ax,
            x,
            2,
            0.8,
            text=name,
            text_color=WHITE,
            border_color=color,
            fill_color=color,
        )
    return fig


def generate_replication_diagram():
    fig, ax = setup_canvas(w=16, h=10, xlim=(-8, 8), ylim=(-5, 5))
    add_title(ax, "Replication - Master-Slave")
    draw_box(
        ax,
        -5,
        2,
        3,
        1.5,
        text="Master",
        text_color=WHITE,
        border_color=GREEN,
        fill_color=GREEN,
        rounded=True,
        text_size=16,
    )
    draw_box(
        ax,
        0,
        3,
        2.5,
        1,
        text="Slave 1",
        text_color=BLACK,
        border_color=BLUE,
        fill_color=LIGHT_BLUE,
        rounded=True,
        text_size=14,
    )
    draw_box(
        ax,
        0,
        0.5,
        2.5,
        1,
        text="Slave 2",
        text_color=BLACK,
        border_color=BLUE,
        fill_color=LIGHT_BLUE,
        rounded=True,
        text_size=14,
    )
    draw_arrow(ax, (-3.5, 2), (0, 3), text="replicate", rad=0.1, text_size=10)
    draw_arrow(ax, (-3.5, 2), (0, 1), text="replicate", rad=0.1, text_size=10)
    return fig
