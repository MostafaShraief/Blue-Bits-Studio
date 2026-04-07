"""
Unit Tests for NEW utility functions in template.py
====================================================
Tests: title, subtitle, label, legend, caption, page_number,
       watermark, divider, code_block, numbered_list, math_expression, section_header
Run: python test_new_utilities.py
"""

import matplotlib

matplotlib.use("Agg")

import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

import matplotlib.pyplot as plt
import matplotlib.patches as patches
import os

from template import *

OUTPUT_DIR = "test-output/unit"
os.makedirs(OUTPUT_DIR, exist_ok=True)

results = []


def log(test_name, status, details=""):
    results.append((test_name, status, details))
    icon = "PASS" if status == "PASS" else "FAIL"
    print(f"  [{icon}] {test_name}")
    if details and status == "FAIL":
        print(f"     Details: {details}")


def test_title():
    print("\n--- Title/Subtitle ---")
    try:
        fig, ax = setup_canvas()
        add_title(ax, "عنوان المخطط")
        children = [
            c
            for c in ax.get_children()
            if hasattr(c, "get_text") and c.get_text() != ""
        ]
        assert len(children) > 0
        log("add_title places title", "PASS")
        plt.close(fig)
    except Exception as e:
        log("add_title places title", "FAIL", str(e))
        plt.close("all")

    try:
        fig, ax = setup_canvas()
        add_title(ax, "العنوان", y=4, size=30, color=RED)
        log("add_title custom params", "PASS")
        plt.close(fig)
    except Exception as e:
        log("add_title custom params", "FAIL", str(e))
        plt.close("all")

    try:
        fig, ax = setup_canvas()
        add_subtitle(ax, "وصف فرعي")
        log("add_subtitle places subtitle", "PASS")
        plt.close(fig)
    except Exception as e:
        log("add_subtitle places subtitle", "FAIL", str(e))
        plt.close("all")


def test_label():
    print("\n--- Label ---")
    try:
        fig, ax = setup_canvas()
        add_label(ax, 0, 0, "ملصق")
        log("add_label basic", "PASS")
        plt.close(fig)
    except Exception as e:
        log("add_label basic", "FAIL", str(e))
        plt.close("all")

    try:
        fig, ax = setup_canvas()
        add_label(ax, 0, 0, "خلفية", bg_color=LIGHT_GREEN)
        log("add_label with background", "PASS")
        plt.close(fig)
    except Exception as e:
        log("add_label with background", "FAIL", str(e))
        plt.close("all")


def test_legend():
    print("\n--- Legend ---")
    try:
        fig, ax = setup_canvas(w=16, h=10)
        add_legend(
            ax, [(BLUE, "كيان"), (GREEN, "خاصية"), (RED, "علاقة")], title="المفتاح"
        )
        patches_list = [
            p for p in ax.get_children() if isinstance(p, patches.Rectangle)
        ]
        assert len(patches_list) >= 4  # legend box + 3 swatches
        log("add_legend with items and title", "PASS")
        plt.close(fig)
    except Exception as e:
        log("add_legend with items and title", "FAIL", str(e))
        plt.close("all")


def test_caption():
    print("\n--- Caption ---")
    try:
        fig, ax = setup_canvas()
        add_caption(ax, "شكل 1: مخطط كيان-علاقة")
        log("add_caption places caption", "PASS")
        plt.close(fig)
    except Exception as e:
        log("add_caption places caption", "FAIL", str(e))
        plt.close("all")


def test_page_number():
    print("\n--- Page Number ---")
    try:
        fig, ax = setup_canvas()
        add_page_number(ax, 1, total=5)
        log("add_page_number with total", "PASS")
        plt.close(fig)
    except Exception as e:
        log("add_page_number with total", "FAIL", str(e))
        plt.close("all")

    try:
        fig, ax = setup_canvas()
        add_page_number(ax, 3)
        log("add_page_number without total", "PASS")
        plt.close(fig)
    except Exception as e:
        log("add_page_number without total", "FAIL", str(e))
        plt.close("all")


def test_watermark():
    print("\n--- Watermark ---")
    try:
        fig, ax = setup_canvas()
        add_watermark(ax, "BlueBits")
        log("add_watermark basic", "PASS")
        plt.close(fig)
    except Exception as e:
        log("add_watermark basic", "FAIL", str(e))
        plt.close("all")


def test_divider():
    print("\n--- Divider ---")
    try:
        fig, ax = setup_canvas()
        add_divider(ax, y=0)
        log("add_divider basic", "PASS")
        plt.close(fig)
    except Exception as e:
        log("add_divider basic", "FAIL", str(e))
        plt.close("all")

    try:
        fig, ax = setup_canvas()
        add_divider(ax, y=2, x_range=(-3, 3), color=BLUE, linestyle="--")
        log("add_divider custom params", "PASS")
        plt.close(fig)
    except Exception as e:
        log("add_divider custom params", "FAIL", str(e))
        plt.close("all")


def test_code_block():
    print("\n--- Code Block ---")
    try:
        fig, ax = setup_canvas(w=16, h=10)
        add_code_block(
            ax,
            -5,
            3,
            [
                "def hello():",
                "    print('مرحبا')",
                "    return True",
            ],
        )
        patches_list = [
            p for p in ax.get_children() if isinstance(p, patches.FancyBboxPatch)
        ]
        assert len(patches_list) >= 1
        log("add_code_block renders", "PASS")
        plt.close(fig)
    except Exception as e:
        log("add_code_block renders", "FAIL", str(e))
        plt.close("all")


def test_numbered_list():
    print("\n--- Numbered List ---")
    try:
        fig, ax = setup_canvas(w=16, h=10)
        add_numbered_list(ax, -5, 3, ["العنصر الأول", "العنصر الثاني", "العنصر الثالث"])
        circles = [p for p in ax.get_children() if isinstance(p, patches.Circle)]
        assert len(circles) >= 3
        log("add_numbered_list renders", "PASS")
        plt.close(fig)
    except Exception as e:
        log("add_numbered_list renders", "FAIL", str(e))
        plt.close("all")


def test_math_expression():
    print("\n--- Math Expression ---")
    try:
        fig, ax = setup_canvas()
        add_math_expression(ax, 0, 0, r"$\int_0^1 x^2 dx = \frac{1}{3}$")
        log("add_math_expression renders", "PASS")
        plt.close(fig)
    except Exception as e:
        log("add_math_expression renders", "FAIL", str(e))
        plt.close("all")


def test_section_header():
    print("\n--- Section Header ---")
    try:
        fig, ax = setup_canvas(w=16, h=10)
        add_section_header(ax, -6, 3, "القسم الأول")
        log("add_section_header renders", "PASS")
        plt.close(fig)
    except Exception as e:
        log("add_section_header renders", "FAIL", str(e))
        plt.close("all")


if __name__ == "__main__":
    print("=" * 60)
    print("  NEW UTILITY FUNCTIONS - UNIT TESTS")
    print("=" * 60)

    test_title()
    test_label()
    test_legend()
    test_caption()
    test_page_number()
    test_watermark()
    test_divider()
    test_code_block()
    test_numbered_list()
    test_math_expression()
    test_section_header()

    passed = sum(1 for _, s, _ in results if s == "PASS")
    failed = sum(1 for _, s, _ in results if s == "FAIL")
    total = len(results)

    print(f"\n{'=' * 60}")
    print(f"  RESULTS: {passed}/{total} passed, {failed}/{total} failed")
    print(f"{'=' * 60}")

    report = f"""# New Utility Functions - Test Results

**Total:** {total} | **Passed:** {passed} | **Failed:** {failed}

| # | Test | Status |
|---|------|--------|
"""
    for i, (name, status, details) in enumerate(results, 1):
        report += f"| {i} | {name} | {'✅ PASS' if status == 'PASS' else '❌ FAIL'} |\n"

    with open(f"{OUTPUT_DIR}/new-utilities-report.md", "w", encoding="utf-8") as f:
        f.write(report)

    print(f"\nReport saved to: {OUTPUT_DIR}/new-utilities-report.md")
    sys.exit(0 if failed == 0 else 1)
