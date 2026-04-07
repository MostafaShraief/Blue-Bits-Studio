"""
Integration Tests for template.py - Combined Function Tests
===========================================================
Each test combines MULTIPLE helper functions to simulate real diagram generation.
Run: python test_template_integration.py
"""

import matplotlib

matplotlib.use("Agg")  # Non-interactive backend for CI

import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

import matplotlib.pyplot as plt
import os
import traceback

from template import *

OUTPUT_DIR = "test-output/integration"
os.makedirs(OUTPUT_DIR, exist_ok=True)

results = []


def log(test_name, status, details=""):
    """Log test result."""
    results.append((test_name, status, details))
    icon = "✅" if status == "PASS" else "❌"
    print(f"  {icon} {test_name}: {status}")
    if details and status == "FAIL":
        print(f"     Details: {details}")


# =========================================================
# INTEGRATION TEST 1: Complete ER Diagram
# =========================================================
def test_er_diagram():
    """Test: Entity-Relationship diagram with all ER components."""
    print("\n--- INTEGRATION TEST 1: Complete ER Diagram ---")
    try:
        fig, ax = setup_canvas(w=20, h=12, xlim=(-10, 10), ylim=(-6, 6))

        # Entities
        draw_entity(ax, -6, 0, "طالب", w=4, h=1.5)
        draw_entity(ax, 6, 0, "مقرر", w=4, h=1.5)

        # Relationship
        draw_relationship(ax, 0, 0, "يسجل", w=3, h=2)

        # Attributes for طالب
        draw_attribute(ax, -6, 3, "الرقم الجامعي", underline=True)
        draw_attribute(ax, -9, 0, "الاسم")
        draw_attribute(ax, -6, -3, "العمر", derived=True)

        # Attributes for مقرر
        draw_attribute(ax, 6, 3, "رمز المقرر", underline=True)
        draw_attribute(ax, 9, 0, "اسم المقرر")
        draw_attribute(ax, 6, -3, "الساعات", multivalued=True)

        # Connections
        connect(ax, (-4, 0), (-1.5, 0))
        connect(ax, (1.5, 0), (4, 0))
        connect(ax, (-6, 1.5), (-6, 2))
        connect(ax, (-7.5, 0), (-8, 0))
        connect(ax, (6, 1.5), (6, 2))
        connect(ax, (7.5, 0), (8, 0))

        # Save
        save_figure(fig, f"{OUTPUT_DIR}/er-diagram")
        log("Complete ER diagram renders and saves", "PASS")
    except Exception as e:
        log("Complete ER diagram renders and saves", "FAIL", str(e))
        plt.close("all")


# =========================================================
# INTEGRATION TEST 2: Flowchart
# =========================================================
def test_flowchart():
    """Test: Flowchart with boxes, diamonds, arrows."""
    print("\n--- INTEGRATION TEST 2: Flowchart ---")
    try:
        fig, ax = setup_canvas(w=14, h=14, xlim=(-7, 7), ylim=(-7, 7))

        # Start
        draw_box(ax, -1.5, 5, 3, 1, text="بداية", rounded=True)

        # Process 1
        draw_box(ax, -2, 3, 4, 1, text="قراءة البيانات", rounded=False)

        # Decision
        draw_diamond(ax, 0, 0.5, 4, 2, text="هل البيانات صحيحة؟")

        # Yes branch
        draw_box(ax, -2, -2, 4, 1, text="معالجة البيانات", rounded=False)
        draw_arrow(ax, (0, 4), (0, 3.5), text="", rad=0)
        draw_arrow(ax, (0, 2.5), (0, 1.5), text="", rad=0)
        draw_arrow(ax, (0, -0.5), (0, -1.5), text="نعم", rad=0)

        # No branch
        draw_box(ax, 3, -0.5, 3, 1, text="خطأ", rounded=False)
        draw_arrow(ax, (2, 0.5), (3, 0), text="لا", rad=0.2)

        # End
        draw_box(ax, -1.5, -4, 3, 1, text="نهاية", rounded=True)
        draw_arrow(ax, (0, -2.5), (0, -3.5), text="", rad=0)

        save_figure(fig, f"{OUTPUT_DIR}/flowchart")
        log("Flowchart renders and saves", "PASS")
    except Exception as e:
        log("Flowchart renders and saves", "FAIL", str(e))
        plt.close("all")


# =========================================================
# INTEGRATION TEST 3: Memory Diagram
# =========================================================
def test_memory_diagram():
    """Test: Memory layout with tables and annotations."""
    print("\n--- INTEGRATION TEST 3: Memory Diagram ---")
    try:
        fig, ax = setup_canvas(w=16, h=10, xlim=(-8, 8), ylim=(-5, 5))

        # Title
        add_rich_text(
            ax, 0, 4, [("مخطط الذاكرة", BLUE, False)], size=26, direction="rtl"
        )

        # Stack
        add_text(ax, -5, 3, "Stack", color=BLUE, size=18)
        draw_table(
            ax,
            -6.5,
            2.5,
            ["العنوان", "القيمة"],
            [
                ["0xFF00", "42"],
                ["0xFF01", "100"],
                ["0xFF02", "0"],
            ],
        )

        # Heap
        add_text(ax, 3, 3, "Heap", color=GREEN, size=18)
        draw_table(
            ax,
            1.5,
            2.5,
            ["العنوان", "القيمة"],
            [
                ["0xA000", "obj1"],
                ["0xA001", "obj2"],
                ["0xA002", "null"],
            ],
        )

        # Arrow between stack and heap
        draw_arrow(ax, (-4, 1), (1.5, 1), text="مؤشر", rad=0.2)

        # Code annotation
        add_rich_text(
            ax,
            0,
            -2,
            [
                ("int ", BLACK, True),
                ("x", GREEN, True),
                (" = ", BLACK, True),
                ("42", GREEN, True),
                (";", BLACK, True),
            ],
            size=18,
            direction="ltr",
        )

        save_figure(fig, f"{OUTPUT_DIR}/memory-diagram")
        log("Memory diagram renders and saves", "PASS")
    except Exception as e:
        log("Memory diagram renders and saves", "FAIL", str(e))
        plt.close("all")


# =========================================================
# INTEGRATION TEST 4: Tree Diagram
# =========================================================
def test_tree_diagram():
    """Test: Binary tree with circles and arrows."""
    print("\n--- INTEGRATION TEST 4: Tree Diagram ---")
    try:
        fig, ax = setup_canvas(w=16, h=10, xlim=(-8, 8), ylim=(-5, 5))

        # Title
        add_text(ax, 0, 4.5, "شجرة ثنائية", color=BLUE, size=26)

        # Level 0 - Root
        draw_circle(ax, 0, 3, 0.6, text="10")

        # Level 1
        draw_circle(ax, -3, 1, 0.6, text="5")
        draw_circle(ax, 3, 1, 0.6, text="15")

        # Level 2
        draw_circle(ax, -4.5, -1, 0.6, text="3")
        draw_circle(ax, -1.5, -1, 0.6, text="7")
        draw_circle(ax, 1.5, -1, 0.6, text="12")
        draw_circle(ax, 4.5, -1, 0.6, text="20")

        # Edges
        draw_arrow(ax, (-0.3, 2.5), (-2.7, 1.5), rad=-0.1)
        draw_arrow(ax, (0.3, 2.5), (2.7, 1.5), rad=0.1)
        draw_arrow(ax, (-3, 0.4), (-4.2, -0.4), rad=-0.1)
        draw_arrow(ax, (-3, 0.4), (-1.8, -0.4), rad=0.1)
        draw_arrow(ax, (3, 0.4), (1.8, -0.4), rad=-0.1)
        draw_arrow(ax, (3, 0.4), (4.2, -0.4), rad=0.1)

        # Labels
        add_rich_text(ax, -1.5, 2.2, [("يسار", GREEN, False)], size=14, direction="rtl")
        add_rich_text(ax, 1.5, 2.2, [("يمين", RED, False)], size=14, direction="rtl")

        save_figure(fig, f"{OUTPUT_DIR}/tree-diagram")
        log("Tree diagram renders and saves", "PASS")
    except Exception as e:
        log("Tree diagram renders and saves", "FAIL", str(e))
        plt.close("all")


# =========================================================
# INTEGRATION TEST 5: Data Table with Mixed Content
# =========================================================
def test_data_table():
    """Test: Table with Arabic headers and mixed data."""
    print("\n--- INTEGRATION TEST 5: Data Table ---")
    try:
        fig, ax = setup_canvas(w=16, h=10, xlim=(-8, 8), ylim=(-5, 5))

        # Title
        add_text(ax, 0, 4, "جدول قاعدة البيانات", color=BLUE, size=26)

        # Main table
        draw_table(
            ax,
            -7.5,
            3,
            ["الرقم", "الاسم", "البريد", "الحالة"],
            [
                ["1", "أحمد", "ahmed@uni.edu", "نشط"],
                ["2", "سارة", "sara@uni.edu", "نشط"],
                ["3", "محمد", "moh@uni.edu", "متوقف"],
                ["4", "فاطمة", "fat@uni.edu", "نشط"],
            ],
        )

        # Legend
        add_rich_text(
            ax,
            0,
            -3,
            [
                ("مفتاح أساسي: ", BLACK, False),
                ("الرقم", GREEN, True),
            ],
            size=16,
            direction="rtl",
        )

        add_rich_text(
            ax,
            0,
            -4,
            [
                ("إجمالي السجلات: ", BLACK, False),
                ("4", GREEN, True),
            ],
            size=16,
            direction="rtl",
        )

        save_figure(fig, f"{OUTPUT_DIR}/data-table")
        log("Data table renders and saves", "PASS")
    except Exception as e:
        log("Data table renders and saves", "FAIL", str(e))
        plt.close("all")


# =========================================================
# INTEGRATION TEST 6: Algorithm Visualization
# =========================================================
def test_algorithm_viz():
    """Test: Array sorting visualization with mixed text and colors."""
    print("\n--- INTEGRATION TEST 6: Algorithm Visualization ---")
    try:
        fig, ax = setup_canvas(w=16, h=8, xlim=(-8, 8), ylim=(-4, 4))

        # Title
        add_rich_text(
            ax,
            0,
            3.5,
            [
                ("خوارزمية ", BLACK, False),
                ("Bubble Sort", BLUE, True),
            ],
            size=24,
            direction="rtl",
        )

        # Array visualization
        values = [5, 2, 8, 1, 9, 3]
        x_start = -5
        cell_w = 1.5
        cell_h = 1.2

        for i, val in enumerate(values):
            x = x_start + i * cell_w
            # Color: highlight min/max
            if val == min(values):
                color = GREEN
            elif val == max(values):
                color = RED
            else:
                color = BLUE

            draw_box(
                ax,
                x,
                0,
                cell_w,
                cell_h,
                text=str(val),
                text_color=color,
                border_color=color,
                text_size=20,
                rounded=False,
            )

            # Index label
            add_rich_text(
                ax,
                x + cell_w / 2,
                -1.2,
                [
                    (f"[{i}]", GRAY, True),
                ],
                size=14,
                direction="ltr",
            )

        # Code snippet
        add_rich_text(
            ax,
            0,
            -2.5,
            [
                ("for ", BLACK, True),
                ("i ", GREEN, True),
                ("in ", BLACK, True),
                ("range(n)", GREEN, True),
                (":", BLACK, True),
            ],
            size=16,
            direction="ltr",
        )

        save_figure(fig, f"{OUTPUT_DIR}/algorithm-viz")
        log("Algorithm visualization renders and saves", "PASS")
    except Exception as e:
        log("Algorithm visualization renders and saves", "FAIL", str(e))
        plt.close("all")


# =========================================================
# INTEGRATION TEST 7: Weak Entity ER Diagram
# =========================================================
def test_weak_entity_er():
    """Test: ER diagram with weak entities and identifying relationships."""
    print("\n--- INTEGRATION TEST 7: Weak Entity ER Diagram ---")
    try:
        fig, ax = setup_canvas(w=20, h=12, xlim=(-10, 10), ylim=(-6, 6))

        # Strong entity
        draw_entity(ax, -6, 0, "قسم", w=4, h=1.5)
        draw_attribute(ax, -6, 3, "رقم القسم", underline=True)
        draw_attribute(ax, -9, 0, "اسم القسم")

        # Weak entity
        draw_entity(ax, 6, 0, "موظف", w=4, h=1.5, weak=True)
        draw_attribute(ax, 6, 3, "الرقم التسلسلي", dashed_underline=True)
        draw_attribute(ax, 9, 0, "الاسم")
        draw_attribute(ax, 6, -3, "الراتب")

        # Identifying relationship
        draw_relationship(ax, 0, 0, "يتبع", w=3, h=2, identifying=True)

        # Connections
        connect(ax, (-4, 0), (-1.5, 0))
        connect(ax, (1.5, 0), (4, 0), double=True)  # Total participation
        connect(ax, (-6, 1.5), (-6, 2))
        connect(ax, (-7.5, 0), (-8, 0))
        connect(ax, (6, 1.5), (6, 2))
        connect(ax, (7.5, 0), (8, 0))
        connect(ax, (6, -1.5), (6, -2))

        save_figure(fig, f"{OUTPUT_DIR}/weak-entity-er")
        log("Weak entity ER diagram renders and saves", "PASS")
    except Exception as e:
        log("Weak entity ER diagram renders and saves", "FAIL", str(e))
        plt.close("all")


# =========================================================
# INTEGRATION TEST 8: Inheritance Diagram
# =========================================================
def test_inheritance_diagram():
    """Test: Class inheritance with specialization/generalization."""
    print("\n--- INTEGRATION TEST 8: Inheritance Diagram ---")
    try:
        fig, ax = setup_canvas(w=16, h=10, xlim=(-8, 8), ylim=(-5, 5))

        # Parent class
        draw_box(ax, -2, 3, 4, 1.5, text="شخص", rounded=False)

        # Inheritance circle
        draw_inheritance_circle(ax, 0, 1, text="d", r=0.5)

        # Child classes
        draw_box(ax, -5, -1, 3.5, 1.5, text="طالب", rounded=False)
        draw_box(ax, 1.5, -1, 3.5, 1.5, text="موظف", rounded=False)

        # Connections
        connect(ax, (0, 2.25), (0, 1.5))
        connect(ax, (0, 0.5), (-3.25, -0.25))
        connect(ax, (0, 0.5), (3.25, -0.25))

        # Attributes for each
        draw_attribute(ax, 0, 4.5, "الاسم")
        draw_attribute(ax, -6.5, 0, "المعدل", underline=True)
        draw_attribute(ax, 5, 0, "الراتب")

        save_figure(fig, f"{OUTPUT_DIR}/inheritance-diagram")
        log("Inheritance diagram renders and saves", "PASS")
    except Exception as e:
        log("Inheritance diagram renders and saves", "FAIL", str(e))
        plt.close("all")


# =========================================================
# RUN ALL TESTS
# =========================================================
if __name__ == "__main__":
    print("=" * 60)
    print("  TEMPLATE.PY - INTEGRATION TESTS")
    print("=" * 60)

    test_er_diagram()
    test_flowchart()
    test_memory_diagram()
    test_tree_diagram()
    test_data_table()
    test_algorithm_viz()
    test_weak_entity_er()
    test_inheritance_diagram()

    # Summary
    passed = sum(1 for _, s, _ in results if s == "PASS")
    failed = sum(1 for _, s, _ in results if s == "FAIL")
    total = len(results)

    print("\n" + "=" * 60)
    print(f"  RESULTS: {passed}/{total} passed, {failed}/{total} failed")
    print("=" * 60)

    # Save report
    report = f"""# Integration Test Results
## Template.py - Combined Function Tests

**Date:** Auto-generated
**Total:** {total} tests
**Passed:** {passed}
**Failed:** {failed}

## Tests

| # | Test | Status | Output |
|---|------|--------|--------|
"""
    for i, (name, status, details) in enumerate(results, 1):
        output_file = name.lower().replace(" ", "-").replace("renders and saves", "")
        report += f"| {i} | {name} | {'✅ PASS' if status == 'PASS' else '❌ FAIL'} | `{output_file}.png` |\n"

    if failed > 0:
        report += "\n## Failures\n"
        for name, status, details in results:
            if status == "FAIL":
                report += f"- **{name}**: {details}\n"

    report_path = f"{OUTPUT_DIR}/integration-test-report.md"
    with open(report_path, "w", encoding="utf-8") as f:
        f.write(report)

    print(f"\nReport saved to: {report_path}")

    sys.exit(0 if failed == 0 else 1)
