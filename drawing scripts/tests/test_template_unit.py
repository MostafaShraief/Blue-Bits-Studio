"""
Unit Tests for template.py - Individual Function Tests
======================================================
Each test isolates ONE helper function and verifies it works correctly.
Run: python test_template_unit.py
"""

import matplotlib

matplotlib.use("Agg")  # Non-interactive backend for CI

import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

import matplotlib.pyplot as plt
import matplotlib.patches as patches
import os
import traceback

# Import all template functions
from template import *

OUTPUT_DIR = "test-output/unit"
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
# TEST 1: Font Loading
# =========================================================
def test_font_loading():
    print("\n--- TEST 1: Font Loading ---")

    # 1a: get_font_prop returns valid properties
    try:
        prop = get_font_prop(size=20)
        assert prop is not None, "FontProperties is None"
        assert prop.get_size() == 20, f"Size mismatch: {prop.get_size()} != 20"
        log("get_font_prop returns valid properties", "PASS")
    except Exception as e:
        log("get_font_prop returns valid properties", "FAIL", str(e))

    # 1b: get_font_prop with custom size
    try:
        prop = get_font_prop(size=30)
        assert prop.get_size() == 30
        log("get_font_prop custom size", "PASS")
    except Exception as e:
        log("get_font_prop custom size", "FAIL", str(e))

    # 1c: get_code_font_prop returns monospace
    try:
        prop = get_code_font_prop(size=16)
        assert prop is not None
        assert prop.get_size() == 16
        log("get_code_font_prop returns valid properties", "PASS")
    except Exception as e:
        log("get_code_font_prop returns valid properties", "FAIL", str(e))

    # 1d: get_code_font_prop default size
    try:
        prop = get_code_font_prop()
        expected = int(DEFAULT_SIZE * 0.9)
        assert prop.get_size() == expected, f"{prop.get_size()} != {expected}"
        log("get_code_font_prop default size", "PASS")
    except Exception as e:
        log("get_code_font_prop default size", "FAIL", str(e))


# =========================================================
# TEST 2: Arabic Text Engine
# =========================================================
def test_arabic_text():
    print("\n--- TEST 2: Arabic Text Engine ---")

    # 2a: handle_arabic with valid Arabic text
    try:
        result = handle_arabic("مرحبا بالعالم")
        assert isinstance(result, str), "Result is not a string"
        assert len(result) > 0, "Result is empty"
        log("handle_arabic processes Arabic text", "PASS")
    except Exception as e:
        log("handle_arabic processes Arabic text", "FAIL", str(e))

    # 2b: handle_arabic with empty string
    try:
        result = handle_arabic("")
        assert result == "", f"Expected empty, got '{result}'"
        log("handle_arabic handles empty string", "PASS")
    except Exception as e:
        log("handle_arabic handles empty string", "FAIL", str(e))

    # 2c: handle_arabic with None-like input
    try:
        result = handle_arabic(None)
        assert result == "", f"Expected empty for None, got '{result}'"
        log("handle_arabic handles None input", "PASS")
    except Exception as e:
        log("handle_arabic handles None input", "FAIL", str(e))

    # 2d: handle_arabic with English text (should not break)
    try:
        result = handle_arabic("Hello World")
        assert isinstance(result, str)
        log("handle_arabic handles English text", "PASS")
    except Exception as e:
        log("handle_arabic handles English text", "FAIL", str(e))

    # 2e: handle_arabic with numbers
    try:
        result = handle_arabic("123 + 456 = 579")
        assert isinstance(result, str)
        log("handle_arabic handles numbers", "PASS")
    except Exception as e:
        log("handle_arabic handles numbers", "FAIL", str(e))


# =========================================================
# TEST 3: Canvas Setup
# =========================================================
def test_canvas_setup():
    print("\n--- TEST 3: Canvas Setup ---")

    # 3a: Default canvas
    try:
        fig, ax = setup_canvas()
        assert fig is not None
        assert ax is not None
        assert fig.get_size_inches()[0] == 12
        assert fig.get_size_inches()[1] == 8
        log("setup_canvas default dimensions", "PASS")
        plt.close(fig)
    except Exception as e:
        log("setup_canvas default dimensions", "FAIL", str(e))

    # 3b: Custom canvas
    try:
        fig, ax = setup_canvas(w=20, h=12, xlim=(-10, 10), ylim=(-6, 6))
        assert fig.get_size_inches()[0] == 20
        assert fig.get_size_inches()[1] == 12
        assert ax.get_xlim() == (-10, 10)
        assert ax.get_ylim() == (-6, 6)
        log("setup_canvas custom dimensions", "PASS")
        plt.close(fig)
    except Exception as e:
        log("setup_canvas custom dimensions", "FAIL", str(e))

    # 3c: Transparent background
    try:
        fig, ax = setup_canvas()
        assert fig.patch.get_alpha() == 0, "Figure background not transparent"
        assert ax.patch.get_alpha() == 0, "Axes background not transparent"
        log("setup_canvas transparent background", "PASS")
        plt.close(fig)
    except Exception as e:
        log("setup_canvas transparent background", "FAIL", str(e))

    # 3d: Axes off
    try:
        fig, ax = setup_canvas()
        assert not ax.axison, "Axes should be off"
        log("setup_canvas axes off", "PASS")
        plt.close(fig)
    except Exception as e:
        log("setup_canvas axes off", "FAIL", str(e))


# =========================================================
# TEST 4: Save Figure
# =========================================================
def test_save_figure():
    print("\n--- TEST 4: Save Figure ---")

    # 4a: Save as SVG and PNG
    try:
        fig, ax = setup_canvas()
        ax.text(0, 0, "Test", fontproperties=get_font_prop())
        filename = f"{OUTPUT_DIR}/test_save"
        save_figure(fig, filename)

        assert os.path.exists(f"{filename}.svg"), "SVG not created"
        assert os.path.exists(f"{filename}.png"), "PNG not created"
        assert os.path.getsize(f"{filename}.png") > 0, "PNG is empty"
        assert os.path.getsize(f"{filename}.svg") > 0, "SVG is empty"
        log("save_figure creates SVG and PNG", "PASS")

        # Cleanup
        os.remove(f"{filename}.svg")
        os.remove(f"{filename}.png")
    except Exception as e:
        log("save_figure creates SVG and PNG", "FAIL", str(e))
        plt.close("all")


# =========================================================
# TEST 5: Text Helpers
# =========================================================
def test_text_helpers():
    print("\n--- TEST 5: Text Helpers ---")

    # 5a: add_text basic
    try:
        fig, ax = setup_canvas()
        add_text(ax, 0, 0, "نص عربي")
        children = [c for c in ax.get_children() if hasattr(c, "get_text")]
        text_children = [c for c in children if c.get_text() != ""]
        assert len(text_children) > 0, "No text children found"
        log("add_text places text on axes", "PASS")
        plt.close(fig)
    except Exception as e:
        log("add_text places text on axes", "FAIL", str(e))
        plt.close("all")

    # 5b: add_rich_text RTL
    try:
        fig, ax = setup_canvas()
        segments = [("مرحبا", BLUE, False), (" ", BLACK, False), ("عالم", GREEN, False)]
        add_rich_text(ax, 0, 0, segments, direction="rtl")
        log("add_rich_text RTL direction", "PASS")
        plt.close(fig)
    except Exception as e:
        log("add_rich_text RTL direction", "FAIL", str(e))
        plt.close("all")

    # 5c: add_rich_text LTR
    try:
        fig, ax = setup_canvas()
        segments = [("x = ", BLACK, True), ("42", GREEN, True)]
        add_rich_text(ax, 0, 0, segments, direction="ltr")
        log("add_rich_text LTR direction", "PASS")
        plt.close(fig)
    except Exception as e:
        log("add_rich_text LTR direction", "FAIL", str(e))
        plt.close("all")

    # 5d: add_rich_text mixed code and Arabic
    try:
        fig, ax = setup_canvas()
        segments = [
            ("المتغير", BLACK, False),
            (" x ", GREEN, True),
            ("= 10", BLACK, True),
        ]
        add_rich_text(ax, 0, 0, segments, direction="rtl")
        log("add_rich_text mixed Arabic + code", "PASS")
        plt.close(fig)
    except Exception as e:
        log("add_rich_text mixed Arabic + code", "FAIL", str(e))
        plt.close("all")


# =========================================================
# TEST 6: Shape Helpers
# =========================================================
def test_shape_helpers():
    print("\n--- TEST 6: Shape Helpers ---")

    # 6a: draw_box rounded
    try:
        fig, ax = setup_canvas()
        box = draw_box(ax, -2, -1, 4, 2, text="صندوق", rounded=True)
        assert isinstance(box, patches.FancyBboxPatch)
        patches_list = [
            p for p in ax.get_children() if isinstance(p, patches.FancyBboxPatch)
        ]
        assert len(patches_list) > 0
        log("draw_box rounded corners", "PASS")
        plt.close(fig)
    except Exception as e:
        log("draw_box rounded corners", "FAIL", str(e))
        plt.close("all")

    # 6b: draw_box sharp
    try:
        fig, ax = setup_canvas()
        box = draw_box(ax, -2, -1, 4, 2, text="صندوق", rounded=False)
        assert isinstance(box, patches.Rectangle)
        log("draw_box sharp corners", "PASS")
        plt.close(fig)
    except Exception as e:
        log("draw_box sharp corners", "FAIL", str(e))
        plt.close("all")

    # 6c: draw_box no text
    try:
        fig, ax = setup_canvas()
        box = draw_box(ax, -2, -1, 4, 2, text="")
        assert box is not None
        log("draw_box without text", "PASS")
        plt.close(fig)
    except Exception as e:
        log("draw_box without text", "FAIL", str(e))
        plt.close("all")

    # 6d: draw_circle
    try:
        fig, ax = setup_canvas()
        circle = draw_circle(ax, 0, 0, 1, text="دائرة")
        assert isinstance(circle, patches.Circle)
        log("draw_circle with text", "PASS")
        plt.close(fig)
    except Exception as e:
        log("draw_circle with text", "FAIL", str(e))
        plt.close("all")

    # 6e: draw_diamond
    try:
        fig, ax = setup_canvas()
        diamond = draw_diamond(ax, 0, 0, 3, 2, text="علاقة")
        assert isinstance(diamond, patches.Polygon)
        log("draw_diamond with text", "PASS")
        plt.close(fig)
    except Exception as e:
        log("draw_diamond with text", "FAIL", str(e))
        plt.close("all")

    # 6f: draw_arrow straight
    try:
        fig, ax = setup_canvas()
        arrow = draw_arrow(ax, (-3, 0), (3, 0), text="سهم")
        assert arrow is not None
        log("draw_arrow straight line", "PASS")
        plt.close(fig)
    except Exception as e:
        log("draw_arrow straight line", "FAIL", str(e))
        plt.close("all")

    # 6g: draw_arrow curved
    try:
        fig, ax = setup_canvas()
        arrow = draw_arrow(ax, (-3, 0), (3, 0), text="منحني", rad=0.3)
        assert arrow is not None
        log("draw_arrow curved line", "PASS")
        plt.close(fig)
    except Exception as e:
        log("draw_arrow curved line", "FAIL", str(e))
        plt.close("all")

    # 6h: draw_table
    try:
        fig, ax = setup_canvas(w=16, h=10)
        draw_table(ax, -5, 3, ["العمود 1", "العمود 2"], [["أ", "ب"], ["ج", "د"]])
        patches_list = [
            p for p in ax.get_children() if isinstance(p, patches.Rectangle)
        ]
        assert len(patches_list) >= 6  # 2 headers + 4 cells
        log("draw_table creates grid", "PASS")
        plt.close(fig)
    except Exception as e:
        log("draw_table creates grid", "FAIL", str(e))
        plt.close("all")


# =========================================================
# TEST 7: ER Diagram Helpers
# =========================================================
def test_er_helpers():
    print("\n--- TEST 7: ER Diagram Helpers ---")

    # 7a: draw_entity normal
    try:
        fig, ax = setup_canvas()
        draw_entity(ax, 0, 0, "طالب")
        patches_list = [
            p for p in ax.get_children() if isinstance(p, patches.Rectangle)
        ]
        assert len(patches_list) >= 1
        log("draw_entity normal", "PASS")
        plt.close(fig)
    except Exception as e:
        log("draw_entity normal", "FAIL", str(e))
        plt.close("all")

    # 7b: draw_entity weak
    try:
        fig, ax = setup_canvas()
        draw_entity(ax, 0, 0, "تسجيل", weak=True)
        patches_list = [
            p for p in ax.get_children() if isinstance(p, patches.Rectangle)
        ]
        assert len(patches_list) >= 2  # Outer + inner rectangle
        log("draw_entity weak (double border)", "PASS")
        plt.close(fig)
    except Exception as e:
        log("draw_entity weak (double border)", "FAIL", str(e))
        plt.close("all")

    # 7c: draw_relationship normal
    try:
        fig, ax = setup_canvas()
        draw_relationship(ax, 0, 0, "يسجل")
        patches_list = [p for p in ax.get_children() if isinstance(p, patches.Polygon)]
        assert len(patches_list) >= 1
        log("draw_relationship normal", "PASS")
        plt.close(fig)
    except Exception as e:
        log("draw_relationship normal", "FAIL", str(e))
        plt.close("all")

    # 7d: draw_relationship identifying
    try:
        fig, ax = setup_canvas()
        draw_relationship(ax, 0, 0, "يملك", identifying=True)
        patches_list = [p for p in ax.get_children() if isinstance(p, patches.Polygon)]
        assert len(patches_list) >= 2  # Outer + inner diamond
        log("draw_relationship identifying (double diamond)", "PASS")
        plt.close(fig)
    except Exception as e:
        log("draw_relationship identifying (double diamond)", "FAIL", str(e))
        plt.close("all")

    # 7e: draw_attribute normal
    try:
        fig, ax = setup_canvas()
        draw_attribute(ax, 0, 0, "الاسم")
        patches_list = [p for p in ax.get_children() if isinstance(p, patches.Ellipse)]
        assert len(patches_list) >= 1
        log("draw_attribute normal", "PASS")
        plt.close(fig)
    except Exception as e:
        log("draw_attribute normal", "FAIL", str(e))
        plt.close("all")

    # 7f: draw_attribute primary key (underline)
    try:
        fig, ax = setup_canvas()
        draw_attribute(ax, 0, 0, "الرقم", underline=True)
        log("draw_attribute primary key (underline)", "PASS")
        plt.close(fig)
    except Exception as e:
        log("draw_attribute primary key (underline)", "FAIL", str(e))
        plt.close("all")

    # 7g: draw_attribute multivalued
    try:
        fig, ax = setup_canvas()
        draw_attribute(ax, 0, 0, "هوايات", multivalued=True)
        patches_list = [p for p in ax.get_children() if isinstance(p, patches.Ellipse)]
        assert len(patches_list) >= 2  # Outer + inner ellipse
        log("draw_attribute multivalued (double ellipse)", "PASS")
        plt.close(fig)
    except Exception as e:
        log("draw_attribute multivalued (double ellipse)", "FAIL", str(e))
        plt.close("all")

    # 7h: draw_attribute derived
    try:
        fig, ax = setup_canvas()
        draw_attribute(ax, 0, 0, "العمر", derived=True)
        patches_list = [p for p in ax.get_children() if isinstance(p, patches.Ellipse)]
        assert len(patches_list) >= 1
        log("draw_attribute derived (dashed)", "PASS")
        plt.close(fig)
    except Exception as e:
        log("draw_attribute derived (dashed)", "FAIL", str(e))
        plt.close("all")

    # 7i: connect single line
    try:
        fig, ax = setup_canvas()
        connect(ax, (-3, 0), (3, 0))
        log("connect single line", "PASS")
        plt.close(fig)
    except Exception as e:
        log("connect single line", "FAIL", str(e))
        plt.close("all")

    # 7j: connect double line
    try:
        fig, ax = setup_canvas()
        connect(ax, (-3, 0), (3, 0), double=True)
        log("connect double line (total participation)", "PASS")
        plt.close(fig)
    except Exception as e:
        log("connect double line (total participation)", "FAIL", str(e))
        plt.close("all")

    # 7k: draw_inheritance_circle
    try:
        fig, ax = setup_canvas()
        draw_inheritance_circle(ax, 0, 0, text="d")
        patches_list = [p for p in ax.get_children() if isinstance(p, patches.Circle)]
        assert len(patches_list) >= 1
        log("draw_inheritance_circle", "PASS")
        plt.close(fig)
    except Exception as e:
        log("draw_inheritance_circle", "FAIL", str(e))
        plt.close("all")


# =========================================================
# TEST 8: Theme Constants
# =========================================================
def test_theme_constants():
    print("\n--- TEST 8: Theme Constants ---")

    constants = {
        "BLUE": "#0072BD",
        "GREEN": "#009E73",
        "CYAN": "#33C9FF",
        "BLACK": "black",
        "WHITE": "white",
        "RED": "#D32F2F",
        "LIGHT_BLUE": "#E3F2FD",
        "LIGHT_GREEN": "#E8F5E9",
        "LIGHT_RED": "#FFEBEE",
        "GRAY": "#9E9E9E",
    }

    for name, expected in constants.items():
        try:
            actual = globals()[name]
            assert actual == expected, f"{name}: '{actual}' != '{expected}'"
            log(f"Theme constant {name}", "PASS")
        except Exception as e:
            log(f"Theme constant {name}", "FAIL", str(e))


# =========================================================
# RUN ALL TESTS
# =========================================================
if __name__ == "__main__":
    print("=" * 60)
    print("  TEMPLATE.PY - UNIT TESTS")
    print("=" * 60)

    test_font_loading()
    test_arabic_text()
    test_canvas_setup()
    test_save_figure()
    test_text_helpers()
    test_shape_helpers()
    test_er_helpers()
    test_theme_constants()

    # Summary
    passed = sum(1 for _, s, _ in results if s == "PASS")
    failed = sum(1 for _, s, _ in results if s == "FAIL")
    total = len(results)

    print("\n" + "=" * 60)
    print(f"  RESULTS: {passed}/{total} passed, {failed}/{total} failed")
    print("=" * 60)

    # Save report
    report = f"""# Unit Test Results
## Template.py - Individual Function Tests

**Date:** Auto-generated
**Total:** {total} tests
**Passed:** {passed}
**Failed:** {failed}

## Details

| # | Test | Status |
|---|------|--------|
"""
    for i, (name, status, details) in enumerate(results, 1):
        report += f"| {i} | {name} | {'✅ PASS' if status == 'PASS' else '❌ FAIL'} |\n"

    if failed > 0:
        report += "\n## Failures\n"
        for name, status, details in results:
            if status == "FAIL":
                report += f"- **{name}**: {details}\n"

    report_path = f"{OUTPUT_DIR}/unit-test-report.md"
    with open(report_path, "w", encoding="utf-8") as f:
        f.write(report)

    print(f"\nReport saved to: {report_path}")

    sys.exit(0 if failed == 0 else 1)
