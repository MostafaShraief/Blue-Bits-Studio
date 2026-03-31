"""
Blue Bits - Drawing Template
=============================
ملف القالب الأساسي لرسم المخططات باستخدام matplotlib.
يحتوي على جميع الدوال المساعدة والثوابت والخطوط.

الاستخدام:
    from template import *
    
    fig, ax = setup_canvas(w=16, h=10)
    # ... كود الرسم ...
    save_figure(fig, 'output')

المتطلبات:
    pip install matplotlib numpy arabic-reshaper python-bidi
"""

import matplotlib.pyplot as plt
import matplotlib.patches as patches
import matplotlib.font_manager as fm
import numpy as np
import os

# --- 1. DEPENDENCIES ---
import arabic_reshaper
from bidi.algorithm import get_display

# =========================================================
#                   USER CONFIGURATION
# =========================================================
# IMPORTANT: Put the .ttf file in the same folder as this script
FONT_FILENAME = "BoutrosMBCDinkum Medium.ttf"
CODE_FONT = "Cascadia Code Light"
DEFAULT_SIZE = 22

# =========================================================
#                   THEME CONSTANTS
# =========================================================
BLUE  = '#0072BD'
GREEN = '#009E73'
CYAN  = '#33C9FF'
BLACK = 'black'
WHITE = 'white'
RED   = '#D32F2F'
LIGHT_BLUE = '#E3F2FD'
LIGHT_GREEN = '#E8F5E9'
LIGHT_RED = '#FFEBEE'
GRAY = '#9E9E9E'

# =========================================================
#                   FONT LOADERS
# =========================================================
def get_font_prop(size=DEFAULT_SIZE):
    """Get Arabic font properties (BoutrosMBCDinkum Medium)."""
    if os.path.exists(FONT_FILENAME):
        return fm.FontProperties(fname=FONT_FILENAME, size=size)
    # Fallback: search system fonts
    print(f"WARNING: Could not find '{FONT_FILENAME}'. Searching system...")
    for f in fm.fontManager.ttflist:
        if "boutros" in f.name.lower() and "dinkum" in f.name.lower():
            return fm.FontProperties(fname=f.fname, size=size)
    # Final fallback: try common Arabic fonts
    for fallback in ['Arial', 'Tahoma', 'Times New Roman']:
        try:
            return fm.FontProperties(family=fallback, size=size)
        except:
            continue
    return fm.FontProperties(size=size)


def get_code_font_prop(size=None):
    """Get code/monospace font properties (Cascadia Code Light)."""
    if size is None:
        size = int(DEFAULT_SIZE * 0.9)
    return fm.FontProperties(family='monospace', size=size)


# =========================================================
#                   ARABIC TEXT ENGINE
# =========================================================
def handle_arabic(text):
    """Reshape Arabic text for correct display in matplotlib."""
    if not text:
        return ""
    text = str(text)
    config = {
        'delete_harakat': True,
        'shift_harakat_position': False,
        'support_ligatures': True,
        'use_unshaped_instead_of_isolated': True,
    }
    reshaper = arabic_reshaper.ArabicReshaper(configuration=config)
    reshaped = reshaper.reshape(text)
    bidi_text = get_display(reshaped)
    return bidi_text


# =========================================================
#                   CANVAS & SAVING
# =========================================================
def setup_canvas(w=12, h=8, xlim=(-8, 8), ylim=(-5, 5)):
    """
    Create a matplotlib figure with transparent background.
    
    Args:
        w: Figure width in inches
        h: Figure height in inches
        xlim: X-axis limits tuple (min, max)
        ylim: Y-axis limits tuple (min, max)
    
    Returns:
        (fig, ax) tuple
    """
    fig, ax = plt.subplots(figsize=(w, h))
    ax.set_xlim(xlim)
    ax.set_ylim(ylim)
    ax.axis('off')
    # Transparent background
    fig.patch.set_alpha(0)
    ax.patch.set_alpha(0)
    return fig, ax


def save_figure(fig, filename, dpi=300):
    """
    Save figure as both SVG and PNG with transparent background.
    
    Args:
        fig: matplotlib figure
        filename: Base filename without extension
        dpi: Resolution for PNG output
    """
    fig.savefig(
        f'{filename}.svg',
        transparent=True,
        bbox_inches='tight',
        pad_inches=0.1
    )
    fig.savefig(
        f'{filename}.png',
        transparent=True,
        bbox_inches='tight',
        dpi=dpi,
        pad_inches=0.1
    )
    print(f"Saved: {filename}.svg and {filename}.png")
    plt.close(fig)


# =========================================================
#                   TEXT HELPERS
# =========================================================
def add_rich_text(ax, x, y, segments, size=DEFAULT_SIZE, direction='rtl'):
    """
    Draw multi-colored text composed of segments.
    
    Args:
        ax: matplotlib axes
        x, y: Center position
        segments: List of tuples -> (text_string, color, is_code_bool)
        size: Font size
        direction: 'rtl' for Arabic-primary, 'ltr' for English/code
    """
    fig = ax.figure
    fig.canvas.draw()
    renderer = fig.canvas.get_renderer()

    # 1. Measure widths
    widths = []
    total_w = 0
    for text, _, is_code in segments:
        font = get_code_font_prop(size) if is_code else get_font_prop(size)
        disp = text if is_code else handle_arabic(text)
        t = ax.text(x, y, disp, fontproperties=font, alpha=0)
        bbox = t.get_window_extent(renderer)
        inv = ax.transData.inverted()
        p1 = inv.transform(bbox.p0)
        p2 = inv.transform(bbox.p1)
        w = abs(p2[0] - p1[0])
        widths.append(w)
        total_w += w
        t.remove()

    # 2. Draw aligned
    if direction == 'rtl':
        cur_x = x + (total_w / 2)
        for i, (text, color, is_code) in enumerate(segments):
            w = widths[i]
            font = get_code_font_prop(size) if is_code else get_font_prop(size)
            disp = text if is_code else handle_arabic(text)
            ax.text(cur_x, y, disp, color=color, fontproperties=font,
                    ha='right', va='center', zorder=20)
            cur_x -= w
    else:  # ltr
        cur_x = x - (total_w / 2)
        for i, (text, color, is_code) in enumerate(segments):
            w = widths[i]
            font = get_code_font_prop(size) if is_code else get_font_prop(size)
            disp = text if is_code else handle_arabic(text)
            ax.text(cur_x, y, disp, color=color, fontproperties=font,
                    ha='left', va='center', zorder=20)
            cur_x += w


def add_text(ax, x, y, text, color=BLACK, size=DEFAULT_SIZE, ha='center', va='center'):
    """Simple wrapper for single-color Arabic text."""
    add_rich_text(ax, x, y, [(text, color, False)], size=size, direction='rtl')


# =========================================================
#                   SHAPE HELPERS
# =========================================================
def draw_box(ax, x, y, w, h, text="", text_color=BLACK, border_color=BLUE,
             fill_color=WHITE, text_size=None, rounded=True, linewidth=2,
             zorder_box=5, zorder_text=20):
    """
    Draw a rectangle (rounded or sharp corners) with centered text.
    
    Args:
        ax: matplotlib axes
        x, y: Bottom-left corner position
        w, h: Width and height
        text: Text to display (Arabic supported)
        text_color: Text color
        border_color: Border color
        fill_color: Fill color
        text_size: Font size (default: DEFAULT_SIZE)
        rounded: Use rounded corners (FancyBboxPatch) or Rectangle
        linewidth: Border width
    
    Returns:
        The patch object
    """
    if text_size is None:
        text_size = DEFAULT_SIZE

    if rounded:
        box = patches.FancyBboxPatch(
            (x, y), w, h,
            boxstyle="round,pad=0.1",
            facecolor=fill_color,
            edgecolor=border_color,
            linewidth=linewidth,
            zorder=zorder_box
        )
    else:
        box = patches.Rectangle(
            (x, y), w, h,
            facecolor=fill_color,
            edgecolor=border_color,
            linewidth=linewidth,
            zorder=zorder_box
        )
    ax.add_patch(box)

    if text:
        cx = x + w / 2
        cy = y + h / 2
        disp = handle_arabic(text)
        ax.text(cx, cy, disp, color=text_color,
                fontproperties=get_font_prop(text_size),
                ha='center', va='center', zorder=zorder_text)

    return box


def draw_circle(ax, x, y, r, text="", text_color=BLACK, border_color=BLUE,
                fill_color=WHITE, text_size=None, linewidth=2):
    """
    Draw a circle with centered text (useful for ER attributes, tree nodes).
    
    Args:
        x, y: Center position
        r: Radius
        text: Text to display
    
    Returns:
        The Circle patch
    """
    if text_size is None:
        text_size = DEFAULT_SIZE * 0.8

    circle = patches.Circle(
        (x, y), r,
        facecolor=fill_color,
        edgecolor=border_color,
        linewidth=linewidth,
        zorder=5
    )
    ax.add_patch(circle)

    if text:
        disp = handle_arabic(text)
        ax.text(x, y, disp, color=text_color,
                fontproperties=get_font_prop(text_size),
                ha='center', va='center', zorder=20)

    return circle


def draw_diamond(ax, x, y, w, h, text="", text_color=WHITE, border_color=BLUE,
                 fill_color=BLUE, text_size=None, linewidth=2):
    """
    Draw a diamond shape (useful for ER relationships, flowchart decisions).
    
    Args:
        x, y: Center position
        w, h: Width and height of the diamond
        text: Text to display
    
    Returns:
        The Polygon patch
    """
    if text_size is None:
        text_size = DEFAULT_SIZE * 0.8

    # Diamond vertices: top, right, bottom, left
    diamond = patches.Polygon(
        [(x, y + h/2), (x + w/2, y), (x, y - h/2), (x - w/2, y)],
        closed=True,
        facecolor=fill_color,
        edgecolor=border_color,
        linewidth=linewidth,
        zorder=5
    )
    ax.add_patch(diamond)

    if text:
        disp = handle_arabic(text)
        ax.text(x, y, disp, color=text_color,
                fontproperties=get_font_prop(text_size),
                ha='center', va='center', zorder=20)

    return diamond


def draw_arrow(ax, start, end, text="", text_color=BLACK, arrow_color=BLUE,
               text_size=None, linewidth=2, rad=0.0, text_offset=(0, 0.3)):
    """
    Draw an arrow between two points with optional label.
    
    Args:
        start: (x, y) start point
        end: (x, y) end point
        text: Optional label text
        arrow_color: Arrow color
        rad: Curve radius (0 for straight, positive/negative for curves)
        text_offset: (dx, dy) offset for the label from arrow midpoint
    
    Returns:
        The annotation object
    """
    if text_size is None:
        text_size = DEFAULT_SIZE * 0.7

    style = f"arc3,rad={rad}" if rad != 0 else "arc3,rad=0"
    
    annotation = ax.annotate(
        "", xy=end, xytext=start,
        arrowprops=dict(
            arrowstyle="->",
            color=arrow_color,
            lw=linewidth,
            connectionstyle=style
        ),
        zorder=10
    )

    if text:
        mid_x = (start[0] + end[0]) / 2 + text_offset[0]
        mid_y = (start[1] + end[1]) / 2 + text_offset[1]
        disp = handle_arabic(text)
        ax.text(mid_x, mid_y, disp, color=text_color,
                fontproperties=get_font_prop(text_size),
                ha='center', va='center', zorder=20)

    return annotation


def draw_table(ax, x, y, headers, rows, cell_w=2.5, cell_h=0.8,
               header_color=BLUE, header_text_color=WHITE,
               cell_color=WHITE, border_color=BLUE, text_size=None):
    """
    Draw a table grid with headers and data rows.
    
    Args:
        ax: matplotlib axes
        x, y: Top-left corner position
        headers: List of header strings
        rows: List of row lists (each row is a list of cell strings)
        cell_w: Cell width
        cell_h: Cell height
        header_color: Header background color
        cell_color: Data cell background color
    """
    if text_size is None:
        text_size = DEFAULT_SIZE * 0.7

    n_cols = len(headers)
    
    # Draw header row
    for j, header in enumerate(headers):
        cx = x + j * cell_w
        draw_box(ax, cx, y - cell_h, cell_w, cell_h,
                 text=header, text_color=header_text_color,
                 border_color=border_color, fill_color=header_color,
                 text_size=text_size, rounded=False)

    # Draw data rows
    for i, row in enumerate(rows):
        for j, cell in enumerate(row):
            cx = x + j * cell_w
            cy = y - (i + 2) * cell_h
            
            # Determine if cell content is English/numbers
            is_english = all(ord(c) < 128 or c in ' .-+' for c in str(cell))
            
            draw_box(ax, cx, cy, cell_w, cell_h,
                     text=str(cell), text_color=GREEN if is_english else BLACK,
                     border_color=border_color, fill_color=cell_color,
                     text_size=text_size, rounded=False)

# =========================================================
#                   CUSTOM HELPERS FOR ER DIAGRAMS
# =========================================================

def draw_entity(ax, cx, cy, text, w=4.5, h=1.8, weak=False):
    """
    رسم كيان (Entity).
    - weak=True : يرسم مستطيل مزدوج للكيان الضعيف (Weak Entity).
    """
    # المستطيل الأساسي (الخارجي)
    draw_box(ax, cx - w/2, cy - h/2, w, h, text=text, text_color=BLACK, 
             border_color=BLUE, fill_color=WHITE, rounded=False, zorder_box=5)
    
    # المستطيل الداخلي إذا كان الكيان ضعيفاً
    if weak:
        draw_box(ax, cx - w/2 + 0.15, cy - h/2 + 0.15, w - 0.3, h - 0.3, text="", 
                 border_color=BLUE, fill_color='none', rounded=False, zorder_box=6, linewidth=1.5)


def draw_relationship(ax, cx, cy, text, w=4.5, h=2.5, identifying=False):
    """
    رسم علاقة (Relationship).
    - identifying=True : يرسم معين مزدوج للعلاقة التعريفية (Identifying Relationship).
    """
    # المعين الأساسي
    draw_diamond(ax, cx, cy, w, h, text=text, text_color=BLACK, border_color=BLUE, fill_color=WHITE)
    
    # المعين الداخلي إذا كانت العلاقة تعريفية
    if identifying:
        draw_diamond(ax, cx, cy, w - 0.6, h - 0.6, text="", border_color=BLUE, fill_color='none', linewidth=1.5)


def draw_attribute(ax, cx, cy, text, w=3.5, h=1.8, 
                   underline=False, dashed_underline=False, 
                   multivalued=False, derived=False):
    """
    رسم خاصية (Attribute).
    - underline=True : مفتاح أساسي (Primary Key) خط متصل.
    - dashed_underline=True : مفتاح جزئي (Partial Key) خط متقطع.
    - multivalued=True : خاصية متعددة القيم (شكل بيضوي مزدوج).
    - derived=True : خاصية مشتقة (شكل بيضوي متقطع).
    """
    linestyle = '--' if derived else '-'
    
    # الشكل البيضوي الأساسي
    ellipse = patches.Ellipse((cx, cy), w, h, facecolor=WHITE, edgecolor=BLUE, 
                              linewidth=1.5, linestyle=linestyle, zorder=5)
    ax.add_patch(ellipse)

    # إطار إضافي للخاصية متعددة القيم
    if multivalued:
        ellipse2 = patches.Ellipse((cx, cy), w + 0.6, h + 0.4, facecolor='none', 
                                   edgecolor=BLUE, linewidth=1.5, zorder=4)
        ax.add_patch(ellipse2)

    # النص
    if text:
        disp = handle_arabic(text)
        ax.text(cx, cy, disp, color=BLACK, fontproperties=get_font_prop(DEFAULT_SIZE * 0.8),
                ha='center', va='center', zorder=20)

    # خط المفتاح الأساسي أو الجزئي
    if underline or dashed_underline:
        line_w = len(text) * 0.15
        ls = '--' if dashed_underline else '-'
        ax.plot([cx - line_w, cx + line_w], [cy - 0.35, cy - 0.35], 
                color=BLACK, linewidth=1.5, linestyle=ls, zorder=21)


def connect(ax, p1, p2, double=False):
    """
    رسم خط اتصال بين عنصرين.
    - double=True : يرسم خطين متوازيين للتعبير عن المشاركة الكلية (Total Participation).
    """
    if double:
        dx, dy = p2[0] - p1[0], p2[1] - p1[1]
        length = np.hypot(dx, dy)
        if length == 0: return
        # حساب المتجه العمودي لعمل إزاحة للخطين (Parallel Offset)
        nx, ny = -dy/length * 0.15, dx/length * 0.15
        ax.plot([p1[0] + nx, p2[0] + nx], [p1[1] + ny, p2[1] + ny], color=BLUE, zorder=1, linewidth=1.5)
        ax.plot([p1[0] - nx, p2[0] - nx], [p1[1] - ny, p2[1] - ny], color=BLUE, zorder=1, linewidth=1.5)
    else:
        # خط عادي
        ax.plot([p1[0], p2[0]], [p1[1], p2[1]], color=BLUE, zorder=1, linewidth=1.5)


def draw_inheritance_circle(ax, cx, cy, text="", r=0.7):
    """
    رسم دائرة الوراثة (Inheritance / Specialization).
    - text : نضع فيها حرف 'o' للـ Overlapping أو 'd' للـ Disjoint (أو نتركها فارغة).
    """
    draw_circle(ax, cx, cy, r, text=text, border_color=BLUE, fill_color=WHITE)

# =========================================================
#       PASTE AI GENERATED CODE BELOW THIS LINE
# =========================================================