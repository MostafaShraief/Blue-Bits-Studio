import matplotlib.pyplot as plt
import matplotlib.patches as patches
import numpy as np
from src.draw_engine.core import *
from src.draw_engine.text import *
from src.draw_engine.shapes.primitives import *
from src.draw_engine.connectors.arrows import *
from src.draw_engine.connectors.routing import *

import matplotlib.patches as patches
import arabic_reshaper
from bidi.algorithm import get_display

def handle_arabic(text):
    if not text: return ""
    text = str(text)
    reshaper = arabic_reshaper.ArabicReshaper(configuration={"delete_harakat": True})
    return get_display(reshaper.reshape(text))

# Primitive helpers
def _draw_box(ax, x, y, w, h, text="", text_color="black", border_color="#0072BD", fill_color="white", rounded=False):
    if rounded:
        box = patches.FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.1", facecolor=fill_color, edgecolor=border_color, linewidth=2, zorder=5)
    else:
        box = patches.Rectangle((x, y), w, h, facecolor=fill_color, edgecolor=border_color, linewidth=2, zorder=5)
    ax.add_patch(box)
    if text:
        ax.text(x + w/2, y + h/2, handle_arabic(text), color=text_color, ha="center", va="center", zorder=20)
    return box

def _draw_diamond(ax, x, y, w, h, text="", text_color="black", border_color="#0072BD", fill_color="white"):
    diamond = patches.Polygon(
        [(x, y + h / 2), (x + w / 2, y), (x, y - h / 2), (x - w / 2, y)],
        closed=True, facecolor=fill_color, edgecolor=border_color, linewidth=2, zorder=5
    )
    ax.add_patch(diamond)
    if text:
        ax.text(x, y, handle_arabic(text), color=text_color, ha="center", va="center", zorder=20)
    return diamond

def _draw_ellipse(ax, cx, cy, w, h, text="", text_color="black", border_color="#0072BD", fill_color="white", linestyle="-", underline=False, dashed_underline=False):
    ellipse = patches.Ellipse((cx, cy), w, h, facecolor=fill_color, edgecolor=border_color, linewidth=2, linestyle=linestyle, zorder=5)
    ax.add_patch(ellipse)
    if text:
        ax.text(cx, cy, handle_arabic(text), color=text_color, ha="center", va="center", zorder=20)
        if underline or dashed_underline:
            ls = "--" if dashed_underline else "-"
            # rough estimate for text width
            text_w = len(text) * 0.15
            ax.plot([cx - text_w/2, cx + text_w/2], [cy - 0.2, cy - 0.2], color=text_color, linestyle=ls, linewidth=1.5, zorder=21)
    return ellipse

class BaseSmartComponent:
    def __init__(self, cx, cy, text=""):
        self.cx = cx
        self.cy = cy
        self.text = text
        self.w = max(2.5, len(str(text)) * 0.25 + 0.5) if text else 2.5
        self.h = 1.5
    
    def anchors(self):
        return {
            'top': (self.cx, self.cy + self.h/2),
            'bottom': (self.cx, self.cy - self.h/2),
            'left': (self.cx - self.w/2, self.cy),
            'right': (self.cx + self.w/2, self.cy),
            'center': (self.cx, self.cy)
        }

class EREntity(BaseSmartComponent):
    def __init__(self, cx, cy, text, weak=False):
        super().__init__(cx, cy, text)
        self.weak = weak
        
    def draw(self, ax):
        _draw_box(ax, self.cx - self.w/2, self.cy - self.h/2, self.w, self.h, text=self.text, rounded=False)
        if self.weak:
            _draw_box(ax, self.cx - self.w/2 + 0.15, self.cy - self.h/2 + 0.15, self.w - 0.3, self.h - 0.3, border_color="#0072BD", fill_color="none", rounded=False)

class ERRelation(BaseSmartComponent):
    def __init__(self, cx, cy, text, identifying=False):
        super().__init__(cx, cy, text)
        self.w = max(3.0, len(str(text)) * 0.3 + 0.5)
        self.h = 2.0
        self.identifying = identifying

    def draw(self, ax):
        _draw_diamond(ax, self.cx, self.cy, self.w, self.h, text=self.text)
        if self.identifying:
            _draw_diamond(ax, self.cx, self.cy, self.w - 0.6, self.h - 0.6, text="", fill_color="none")

class ERAttribute(BaseSmartComponent):
    def __init__(self, cx, cy, text, is_primary=False, is_partial=False, is_multivalued=False, is_derived=False):
        super().__init__(cx, cy, text)
        self.w = max(2.5, len(str(text)) * 0.25 + 0.5)
        self.h = 1.2
        self.is_primary = is_primary
        self.is_partial = is_partial
        self.is_multivalued = is_multivalued
        self.is_derived = is_derived

    def draw(self, ax):
        ls = "--" if self.is_derived else "-"
        _draw_ellipse(ax, self.cx, self.cy, self.w, self.h, text=self.text, linestyle=ls, underline=self.is_primary, dashed_underline=self.is_partial)
        if self.is_multivalued:
            _draw_ellipse(ax, self.cx, self.cy, self.w - 0.3, self.h - 0.3, text="", fill_color="none")

class UseCaseActor(BaseSmartComponent):
    def __init__(self, cx, cy, text="Actor"):
        super().__init__(cx, cy, text)
        self.w = 1.5
        self.h = 2.5
        
    def draw(self, ax):
        # Head
        circle = patches.Circle((self.cx, self.cy + 0.5), 0.3, facecolor="white", edgecolor="#0072BD", linewidth=2, zorder=5)
        ax.add_patch(circle)
        # Body
        ax.plot([self.cx, self.cx], [self.cy + 0.2, self.cy - 0.5], color="#0072BD", linewidth=2, zorder=5)
        # Arms
        ax.plot([self.cx - 0.5, self.cx + 0.5], [self.cy, self.cy], color="#0072BD", linewidth=2, zorder=5)
        # Legs
        ax.plot([self.cx, self.cx - 0.4], [self.cy - 0.5, self.cy - 1.2], color="#0072BD", linewidth=2, zorder=5)
        ax.plot([self.cx, self.cx + 0.4], [self.cy - 0.5, self.cy - 1.2], color="#0072BD", linewidth=2, zorder=5)
        # Text
        ax.text(self.cx, self.cy - 1.5, handle_arabic(self.text), color="black", ha="center", va="center", zorder=20)

class UMLClass(BaseSmartComponent):
    def __init__(self, cx, cy, class_name, attributes=[], methods=[]):
        self.cx = cx
        self.cy = cy
        self.class_name = class_name
        self.attributes = attributes
        self.methods = methods
        
        max_len = len(class_name)
        for a in attributes: max_len = max(max_len, len(a))
        for m in methods: max_len = max(max_len, len(m))
        
        self.w = max(3.0, max_len * 0.25 + 0.5)
        self.attr_h = max(0.5, len(attributes) * 0.4)
        self.meth_h = max(0.5, len(methods) * 0.4)
        self.h = 1.0 + self.attr_h + self.meth_h

    def draw(self, ax):
        y_top = self.cy + self.h/2
        
        # Main box
        _draw_box(ax, self.cx - self.w/2, self.cy - self.h/2, self.w, self.h, text="", rounded=False)
        
        # Class Name Box
        name_y = y_top - 0.5
        ax.text(self.cx, name_y, handle_arabic(self.class_name), color="black", ha="center", va="center", zorder=20, weight="bold")
        ax.plot([self.cx - self.w/2, self.cx + self.w/2], [y_top - 1.0, y_top - 1.0], color="#0072BD", linewidth=2, zorder=5)
        
        # Attributes
        attr_start_y = y_top - 1.0 - 0.2
        for i, attr in enumerate(self.attributes):
            ax.text(self.cx - self.w/2 + 0.2, attr_start_y - i*0.4, handle_arabic(attr), color="black", ha="left", va="center", zorder=20)
            
        ax.plot([self.cx - self.w/2, self.cx + self.w/2], [y_top - 1.0 - self.attr_h, y_top - 1.0 - self.attr_h], color="#0072BD", linewidth=2, zorder=5)
        
        # Methods
        meth_start_y = y_top - 1.0 - self.attr_h - 0.2
        for i, meth in enumerate(self.methods):
            ax.text(self.cx - self.w/2 + 0.2, meth_start_y - i*0.4, handle_arabic(meth), color="black", ha="left", va="center", zorder=20)


def draw_table(
    ax,
    x,
    y,
    headers,
    rows,
    cell_w=2.5,
    cell_h=0.8,
    header_color=BLUE,
    header_text_color=WHITE,
    cell_color=WHITE,
    border_color=BLUE,
    text_size=None,
):
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
        draw_box(
            ax,
            cx,
            y - cell_h,
            cell_w,
            cell_h,
            text=header,
            text_color=header_text_color,
            border_color=border_color,
            fill_color=header_color,
            text_size=text_size,
            rounded=False,
        )

    # Draw data rows
    for i, row in enumerate(rows):
        for j, cell in enumerate(row):
            cx = x + j * cell_w
            cy = y - (i + 2) * cell_h

            # Determine if cell content is English/numbers
            is_english = all(ord(c) < 128 or c in " .-+" for c in str(cell))

            draw_box(
                ax,
                cx,
                cy,
                cell_w,
                cell_h,
                text=str(cell),
                text_color=GREEN if is_english else BLACK,
                border_color=border_color,
                fill_color=cell_color,
                text_size=text_size,
                rounded=False,
            )


# =========================================================
#                   CUSTOM HELPERS FOR ER DIAGRAMS
# =========================================================


def draw_entity(ax, cx, cy, text, w=4.5, h=1.8, weak=False):
    """
    رسم كيان (Entity).
    - weak=True : يرسم مستطيل مزدوج للكيان الضعيف (Weak Entity).
    """
    # المستطيل الأساسي (الخارجي)
    draw_box(
        ax,
        cx - w / 2,
        cy - h / 2,
        w,
        h,
        text=text,
        text_color=BLACK,
        border_color=BLUE,
        fill_color=WHITE,
        rounded=False,
        zorder_box=5,
    )

    # المستطيل الداخلي إذا كان الكيان ضعيفاً
    if weak:
        draw_box(
            ax,
            cx - w / 2 + 0.15,
            cy - h / 2 + 0.15,
            w - 0.3,
            h - 0.3,
            text="",
            border_color=BLUE,
            fill_color="none",
            rounded=False,
            zorder_box=6,
            linewidth=1.5,
        )


def draw_relationship(ax, cx, cy, text, w=4.5, h=2.5, identifying=False):
    """
    رسم علاقة (Relationship).
    - identifying=True : يرسم معين مزدوج للعلاقة التعريفية (Identifying Relationship).
    """
    # المعين الأساسي
    draw_diamond(
        ax,
        cx,
        cy,
        w,
        h,
        text=text,
        text_color=BLACK,
        border_color=BLUE,
        fill_color=WHITE,
    )

    # المعين الداخلي إذا كانت العلاقة تعريفية
    if identifying:
        draw_diamond(
            ax,
            cx,
            cy,
            w - 0.6,
            h - 0.6,
            text="",
            border_color=BLUE,
            fill_color="none",
            linewidth=1.5,
        )


def draw_attribute(
    ax,
    cx,
    cy,
    text,
    w=3.5,
    h=1.8,
    underline=False,
    dashed_underline=False,
    multivalued=False,
    derived=False,
):
    """
    رسم خاصية (Attribute).
    - underline=True : مفتاح أساسي (Primary Key) خط متصل.
    - dashed_underline=True : مفتاح جزئي (Partial Key) خط متقطع.
    - multivalued=True : خاصية متعددة القيم (شكل بيضوي مزدوج).
    - derived=True : خاصية مشتقة (شكل بيضوي متقطع).
    """
    linestyle = "--" if derived else "-"

    # الشكل البيضوي الأساسي
    ellipse = patches.Ellipse(
        (cx, cy),
        w,
        h,
        facecolor=WHITE,
        edgecolor=BLUE,
        linewidth=1.5,
        linestyle=linestyle,
        zorder=5,
    )
    ax.add_patch(ellipse)

    # إطار إضافي للخاصية متعددة القيم
    if multivalued:
        ellipse2 = patches.Ellipse(
            (cx, cy),
            w + 0.6,
            h + 0.4,
            facecolor="none",
            edgecolor=BLUE,
            linewidth=1.5,
            zorder=4,
        )
        ax.add_patch(ellipse2)

    # النص
    if text:
        disp = handle_arabic(text)
        ax.text(
            cx,
            cy,
            disp,
            color=BLACK,
            fontproperties=get_font_prop(DEFAULT_SIZE * 0.8),
            ha="center",
            va="center",
            zorder=20,
        )

    # خط المفتاح الأساسي أو الجزئي
    if underline or dashed_underline:
        line_w = len(text) * 0.15
        ls = "--" if dashed_underline else "-"
        ax.plot(
            [cx - line_w, cx + line_w],
            [cy - 0.35, cy - 0.35],
            color=BLACK,
            linewidth=1.5,
            linestyle=ls,
            zorder=21,
        )


def connect(ax, p1, p2, double=False):
    """
    رسم خط اتصال بين عنصرين.
    - double=True : يرسم خطين متوازيين للتعبير عن المشاركة الكلية (Total Participation).
    """
    if double:
        dx, dy = p2[0] - p1[0], p2[1] - p1[1]
        length = np.hypot(dx, dy)
        if length == 0:
            return
        # حساب المتجه العمودي لعمل إزاحة للخطين (Parallel Offset)
        nx, ny = -dy / length * 0.15, dx / length * 0.15
        ax.plot(
            [p1[0] + nx, p2[0] + nx],
            [p1[1] + ny, p2[1] + ny],
            color=BLUE,
            zorder=1,
            linewidth=1.5,
        )
        ax.plot(
            [p1[0] - nx, p2[0] - nx],
            [p1[1] - ny, p2[1] - ny],
            color=BLUE,
            zorder=1,
            linewidth=1.5,
        )
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

# =========================================================
#       CATEGORY 2: UML/SOFTWARE DIAGRAM HELPERS
# =========================================================


def draw_package(
    ax,
    x,
    y,
    w,
    h,
    name="",
    text="",
    text_color=BLACK,
    border_color=BLUE,
    fill_color=WHITE,
    text_size=None,
    linewidth=2,
):
    """
    Draw a UML package (folder-style with tab at top-left).

    Args:
        ax: matplotlib axes
        x, y: Bottom-left corner position
        w, h: Width and height
        name: Package name (displayed in tab)
        text: Main text to display inside the package
        text_color: Text color
        border_color: Border color
        fill_color: Fill color
        text_size: Font size (default: DEFAULT_SIZE)
        linewidth: Border width

    Returns:
        The main box patch object
    """
    if text_size is None:
        text_size = DEFAULT_SIZE

    # Tab parameters
    tab_w = w * 0.4
    tab_h = h * 0.15

    # Main body (rectangle below tab)
    main_h = h - tab_h
    box = patches.Rectangle(
        (x, y),
        w,
        main_h,
        facecolor=fill_color,
        edgecolor=border_color,
        linewidth=linewidth,
        zorder=5,
    )
    ax.add_patch(box)

    # Tab at top-left (folder header)
    tab = patches.Polygon(
        [
            (x, y + main_h),
            (x + tab_w, y + main_h),
            (x + tab_w, y + main_h + tab_h),
            (x, y + main_h + tab_h),
        ],
        closed=True,
        facecolor=fill_color,
        edgecolor=border_color,
        linewidth=linewidth,
        zorder=5,
    )
    ax.add_patch(tab)

    # Tab border line (separate tab from body)
    ax.plot(
        [x, x + tab_w, x + tab_w, x + w],
        [y + main_h, y + main_h, y + main_h + tab_h, y + main_h + tab_h],
        color=border_color,
        linewidth=linewidth,
        zorder=5,
    )

    # Package name in tab
    if name:
        disp = handle_arabic(name)
        font = get_font_prop(int(text_size * 0.8))
        ax.text(
            x + tab_w / 2,
            y + main_h + tab_h / 2,
            disp,
            color=text_color,
            fontproperties=font,
            ha="center",
            va="center",
            zorder=20,
        )

    # Main text inside package
    if text:
        cx = x + w / 2
        cy = y + main_h / 2
        disp = handle_arabic(text)
        ax.text(
            cx,
            cy,
            disp,
            color=text_color,
            fontproperties=get_font_prop(text_size),
            ha="center",
            va="center",
            zorder=20,
        )

    return box


def draw_port(
    ax,
    x,
    y,
    direction="right",
    text="",
    text_color=BLACK,
    border_color=BLUE,
    fill_color=WHITE,
):
    """
    Draw a UML port (small square for component interface).

    Args:
        ax: matplotlib axes
        x, y: Center position of the port
        direction: Direction of port ("right", "left", "up", "down")
        text: Optional text label
        text_color: Text color
        border_color: Border color
        fill_color: Fill color

    Returns:
        The Rectangle patch object
    """
    port_size = 0.3

    # Small square port
    port = patches.Rectangle(
        (x - port_size / 2, y - port_size / 2),
        port_size,
        port_size,
        facecolor=fill_color,
        edgecolor=border_color,
        linewidth=1.5,
        zorder=5,
    )
    ax.add_patch(port)

    # Direction indicator (small triangle or line)
    offset = 0.15
    if direction == "right":
        ax.plot(
            [x + port_size / 2, x + offset + port_size / 2],
            [y, y],
            color=border_color,
            linewidth=1.5,
            zorder=6,
        )
    elif direction == "left":
        ax.plot(
            [x - port_size / 2, x - offset - port_size / 2],
            [y, y],
            color=border_color,
            linewidth=1.5,
            zorder=6,
        )
    elif direction == "up":
        ax.plot(
            [x, x],
            [y + port_size / 2, y + offset + port_size / 2],
            color=border_color,
            linewidth=1.5,
            zorder=6,
        )
    elif direction == "down":
        ax.plot(
            [x, x],
            [y - port_size / 2, y - offset - port_size / 2],
            color=border_color,
            linewidth=1.5,
            zorder=6,
        )

    # Optional text label
    if text:
        text_offset = 0.5
        if direction == "right":
            tx, ty = x + text_offset, y
        elif direction == "left":
            tx, ty = x - text_offset, y
        elif direction == "up":
            tx, ty = x, y + text_offset
        else:  # down
            tx, ty = x, y - text_offset

        disp = handle_arabic(text)
        ax.text(
            tx,
            ty,
            disp,
            color=text_color,
            fontproperties=get_font_prop(DEFAULT_SIZE * 0.6),
            ha="center",
            va="center",
            zorder=20,
        )

    return port


def draw_node(
    ax,
    x,
    y,
    w,
    h,
    name="",
    text="",
    text_color=BLACK,
    border_color=BLUE,
    fill_color=WHITE,
    text_size=None,
    linewidth=2,
):
    """
    Draw a deployment diagram node (3D-looking box with thicker bottom/right border).

    Args:
        ax: matplotlib axes
        x, y: Bottom-left corner position
        w, h: Width and height
        name: Node name (displayed at top)
        text: Main text to display inside the node
        text_color: Text color
        border_color: Border color
        fill_color: Fill color
        text_size: Font size (default: DEFAULT_SIZE)
        linewidth: Border width

    Returns:
        The main box patch object
    """
    if text_size is None:
        text_size = DEFAULT_SIZE

    # Main front face (white/light)
    front_face = patches.Rectangle(
        (x, y),
        w,
        h,
        facecolor=fill_color,
        edgecolor=border_color,
        linewidth=linewidth,
        zorder=5,
    )
    ax.add_patch(front_face)

    # 3D effect - darker edge at bottom
    bottom_edge = patches.Polygon(
        [
            (x, y),
            (x + w, y),
            (x + w + 0.15, y + 0.15),
            (x + 0.15, y + 0.15),
        ],
        closed=True,
        facecolor=_darken_color(border_color, 0.3),
        edgecolor="none",
        zorder=4,
    )
    ax.add_patch(bottom_edge)

    # 3D effect - darker edge at right
    right_edge = patches.Polygon(
        [
            (x + w, y),
            (x + w, y + h),
            (x + w + 0.15, y + h + 0.15),
            (x + w + 0.15, y + 0.15),
        ],
        closed=True,
        facecolor=_darken_color(border_color, 0.5),
        edgecolor="none",
        zorder=3,
    )
    ax.add_patch(right_edge)

    # Node name at top
    if name:
        disp = handle_arabic(name)
        ax.text(
            x + w / 2,
            y + h - 0.3,
            disp,
            color=text_color,
            fontproperties=get_font_prop(int(text_size * 1.1)),
            ha="center",
            va="top",
            zorder=20,
        )

    # Main text inside node
    if text:
        cx = x + w / 2
        cy = y + h / 2 - 0.2
        disp = handle_arabic(text)
        ax.text(
            cx,
            cy,
            disp,
            color=text_color,
            fontproperties=get_font_prop(text_size),
            ha="center",
            va="center",
            zorder=20,
        )

    return front_face


def _darken_color(color, amount=0.3):
    """Helper to darken a color by a given amount (0-1)."""
    import matplotlib.colors as mcolors

    if isinstance(color, str):
        color = mcolors.to_rgba(color)
    r, g, b, a = color
    return (
        max(0, r - amount),
        max(0, g - amount),
        max(0, b - amount),
        a,
    )


def draw_interface(
    ax,
    x,
    y,
    name="",
    text_color=BLACK,
    border_color=BLUE,
    fill_color=WHITE,
):
    """
    Draw a UML interface (lollipop style - circle with line to text label).

    Args:
        ax: matplotlib axes
        x, y: Center position of the interface circle
        name: Interface name (displayed next to the circle)
        text_color: Text color
        border_color: Border color
        fill_color: Fill color

    Returns:
        The Circle patch object
    """
    # Small circle (lollipop head)
    circle_r = 0.4
    circle = patches.Circle(
        (x, y),
        circle_r,
        facecolor=fill_color,
        edgecolor=border_color,
        linewidth=2,
        zorder=5,
    )
    ax.add_patch(circle)

    # Small stem/line extending to the right
    stem_length = 0.8
    ax.plot(
        [x + circle_r, x + circle_r + stem_length],
        [y, y],
        color=border_color,
        linewidth=2,
        zorder=5,
    )

    # Interface name label
    if name:
        label_x = x + circle_r + stem_length + 0.3
        disp = handle_arabic(name)
        ax.text(
            label_x,
            y,
            disp,
            color=text_color,
            fontproperties=get_font_prop(DEFAULT_SIZE * 0.9),
            ha="left",
            va="center",
            zorder=20,
        )

    return circle


def draw_artifact(
    ax,
    x,
    y,
    w,
    h,
    text="",
    text_color=BLACK,
    border_color=BLUE,
    fill_color=WHITE,
    text_size=None,
    linewidth=2,
):
    """
    Draw a deployment diagram artifact (rectangle with dog-ear fold at top-right).

    Args:
        ax: matplotlib axes
        x, y: Bottom-left corner position
        w, h: Width and height
        text: Text to display inside the artifact
        text_color: Text color
        border_color: Border color
        fill_color: Fill color
        text_size: Font size (default: DEFAULT_SIZE)
        linewidth: Border width

    Returns:
        The Polygon patch object
    """
    if text_size is None:
        text_size = DEFAULT_SIZE

    # Dog-ear fold size
    fold_size = min(w * 0.2, h * 0.2, 0.6)

    # Main rectangle with cut corner at top-right
    # Vertices: bottom-left, bottom-right, top-right (cut), top-left
    vertices = [
        (x, y),  # bottom-left
        (x + w, y),  # bottom-right
        (x + w, y + h - fold_size),  # right side before fold
        (x + w - fold_size, y + h),  # top side after fold
        (x, y + h),  # top-left
    ]

    artifact = patches.Polygon(
        vertices,
        closed=True,
        facecolor=fill_color,
        edgecolor=border_color,
        linewidth=linewidth,
        zorder=5,
    )
    ax.add_patch(artifact)

    # Dog-ear fold triangle (darker to show the fold)
    fold = patches.Polygon(
        [
            (x + w - fold_size, y + h),
            (x + w - fold_size, y + h - fold_size),
            (x + w, y + h - fold_size),
        ],
        closed=True,
        facecolor=_darken_color(fill_color, 0.15),
        edgecolor=border_color,
        linewidth=linewidth - 0.5,
        zorder=6,
    )
    ax.add_patch(fold)

    # Inner fold line (to show the fold edge)
    ax.plot(
        [x + w - fold_size, x + w],
        [y + h, y + h - fold_size],
        color=border_color,
        linewidth=linewidth - 0.5,
        zorder=7,
    )

    # Text inside artifact
    if text:
        cx = x + w / 2
        cy = y + h / 2
        disp = handle_arabic(text)
        ax.text(
            cx,
            cy,
            disp,
            color=text_color,
            fontproperties=get_font_prop(text_size),
            ha="center",
            va="center",
            zorder=20,
        )

    return artifact


# =========================================================
#           FLOWCHART SHAPE FUNCTIONS (Category 1)
# =========================================================


def draw_parallelogram(
    ax,
    x,
    y,
    w,
    h,
    text="",
    text_color=BLACK,
    border_color=BLUE,
    fill_color=WHITE,
    text_size=None,
    linewidth=2,
):
    """
    Draw a parallelogram shape (for input/output documents).

    Args:
        ax: matplotlib axes
        x, y: Bottom-left corner position
        w, h: Width and height
        text: Text to display (Arabic supported)
        text_color: Text color
        border_color: Border color
        fill_color: Fill color
        text_size: Font size (default: DEFAULT_SIZE)
        linewidth: Border width

    Returns:
        The Polygon patch object
    """
    if text_size is None:
        text_size = DEFAULT_SIZE

    # Parallelogram vertices (skewed rectangle)
    skew = w * 0.25  # Skew offset
    vertices = [
        (x + skew, y),  # Top-left offset
        (x + w + skew, y),  # Top-right offset
        (x + w, y + h),  # Bottom-right
        (x, y + h),  # Bottom-left
    ]

    para = patches.Polygon(
        vertices,
        closed=True,
        facecolor=fill_color,
        edgecolor=border_color,
        linewidth=linewidth,
        zorder=5,
    )
    ax.add_patch(para)

    if text:
        cx = x + w / 2 + skew / 2
        cy = y + h / 2
        disp = handle_arabic(text)
        ax.text(
            cx,
            cy,
            disp,
            color=text_color,
            fontproperties=get_font_prop(text_size),
            ha="center",
            va="center",
            zorder=20,
        )

    return para


def draw_hexagon(
    ax,
    x,
    y,
    w,
    h,
    text="",
    text_color=BLACK,
    border_color=BLUE,
    fill_color=WHITE,
    text_size=None,
    linewidth=2,
):
    """
    Draw a regular hexagon (for preparation/process).

    Args:
        ax: matplotlib axes
        x, y: Center position
        w, h: Width and height (used to calculate radius)
        text: Text to display (Arabic supported)
        text_color: Text color
        border_color: Border color
        fill_color: Fill color
        text_size: Font size (default: DEFAULT_SIZE)
        linewidth: Border width

    Returns:
        The Polygon patch object
    """
    if text_size is None:
        text_size = DEFAULT_SIZE

    # Calculate radius from width (using circumcircle)
    r = min(w, h) / 2

    # Hexagon vertices (6 points)
    angles = np.linspace(0, 2 * np.pi, 7)[:-1]  # 0 to 2*pi, 6 points
    vertices = [(x + r * np.cos(a), y + r * np.sin(a)) for a in angles]

    hex_patch = patches.Polygon(
        vertices,
        closed=True,
        facecolor=fill_color,
        edgecolor=border_color,
        linewidth=linewidth,
        zorder=5,
    )
    ax.add_patch(hex_patch)

    if text:
        disp = handle_arabic(text)
        ax.text(
            x,
            y,
            disp,
            color=text_color,
            fontproperties=get_font_prop(text_size),
            ha="center",
            va="center",
            zorder=20,
        )

    return hex_patch


def draw_stadium(
    ax,
    x,
    y,
    w,
    h,
    text="",
    text_color=BLACK,
    border_color=BLUE,
    fill_color=WHITE,
    text_size=None,
    linewidth=2,
):
    """
    Draw a stadium shape - rectangle with semicircles at ends (for start/end events).

    Args:
        ax: matplotlib axes
        x, y: Bottom-left corner position
        w, h: Width and height (height should be >= width/2 for semicircles)
        text: Text to display (Arabic supported)
        text_color: Text color
        border_color: Border color
        fill_color: Fill color
        text_size: Font size (default: DEFAULT_SIZE)
        linewidth: Border width

    Returns:
        The patch object (FancyBboxPatch with stadium boxstyle)
    """
    if text_size is None:
        text_size = DEFAULT_SIZE

    # Stadium = rectangle with fully rounded ends
    # Use FancyBboxPatch with round padding
    stadium = patches.FancyBboxPatch(
        (x, y),
        w,
        h,
        boxstyle="round,pad=0.05,rounding_size=" + str(h / 2),
        facecolor=fill_color,
        edgecolor=border_color,
        linewidth=linewidth,
        zorder=5,
    )
    ax.add_patch(stadium)

    if text:
        cx = x + w / 2
        cy = y + h / 2
        disp = handle_arabic(text)
        ax.text(
            cx,
            cy,
            disp,
            color=text_color,
            fontproperties=get_font_prop(text_size),
            ha="center",
            va="center",
            zorder=20,
        )

    return stadium


def draw_cloud(
    ax,
    x,
    y,
    w,
    h,
    text="",
    text_color=BLACK,
    border_color=BLUE,
    fill_color=WHITE,
    text_size=None,
    linewidth=2,
):
    """
    Draw a cloud shape (for cloud/internet symbols).
    Uses multiple overlapping circles.

    Args:
        ax: matplotlib axes
        x, y: Center position
        w, h: Width and height (approximate bounds)
        text: Text to display (Arabic supported)
        text_color: Text color
        border_color: Border color
        fill_color: Fill color
        text_size: Font size (default: DEFAULT_SIZE)
        linewidth: Border width

    Returns:
        The Patch object
    """
    if text_size is None:
        text_size = DEFAULT_SIZE

    # Create cloud from overlapping circles
    # Define circle positions relative to center (x, y)
    # Pattern: 3-4 circles arranged in a cloud-like shape
    circles = [
        (-w * 0.25, h * 0.1, w * 0.35),  # Left lobe
        (w * 0.25, h * 0.1, w * 0.35),  # Right lobe
        (0, h * 0.2, w * 0.4),  # Top center
        (-w * 0.35, -h * 0.1, w * 0.25),  # Bottom left
        (w * 0.35, -h * 0.1, w * 0.25),  # Bottom right
    ]

    # Create a patch collection for the cloud outline
    # We need to draw all circles and then add border
    # For simplicity, we'll create a Path that combines all circles

    from matplotlib.patches import Circle as MplCircle
    from matplotlib.collections import PatchCollection

    # Draw individual circles
    patches_list = []
    for cx_off, cy_off, r in circles:
        circle = MplCircle((x + cx_off, y + cy_off), r)
        patches_list.append(circle)

    # Add the main cloud patch (using the largest circle as base)
    # For proper border, we use a single Polygon that approximates cloud
    # Or we can just draw circles and let them overlap

    # Create merged path for outline effect
    # For now, draw individual circles and merge visually
    for cx_off, cy_off, r in circles:
        circle_patch = patches.Circle(
            (x + cx_off, y + cy_off),
            r,
            facecolor=fill_color,
            edgecolor=border_color,
            linewidth=linewidth,
            zorder=5,
        )
        ax.add_patch(circle_patch)

    if text:
        # Position text in center of cloud
        disp = handle_arabic(text)
        ax.text(
            x,
            y - h * 0.1,
            disp,
            color=text_color,
            fontproperties=get_font_prop(text_size),
            ha="center",
            va="center",
            zorder=20,
        )

    # Return a patch collection-like object (the last circle added)
    return patches_list[-1] if patches_list else None


def draw_cylinder(
    ax,
    x,
    y,
    w,
    h,
    text="",
    text_color=BLACK,
    border_color=BLUE,
    fill_color=WHITE,
    text_size=None,
    linewidth=2,
):
    """
    Draw a cylinder shape (for database/storage).
    Cylinder with ellipse top and bottom, rectangular body.

    Args:
        ax: matplotlib axes
        x, y: Bottom-left corner position
        w, h: Width and height
        text: Text to display (Arabic supported)
        text_color: Text color
        border_color: Border color
        fill_color: Fill color
        text_size: Font size (default: DEFAULT_SIZE)
        linewidth: Border width

    Returns:
        The patch object (top ellipse)
    """
    if text_size is None:
        text_size = DEFAULT_SIZE

    # Cylinder parameters
    ellipse_height = h * 0.15  # Height of top/bottom ellipses

    # 1. Draw the body (rectangle with curved bottom)
    # Bottom ellipse
    bottom_ellipse = patches.Ellipse(
        (x + w / 2, y + ellipse_height),
        w,
        ellipse_height * 2,
        facecolor=fill_color,
        edgecolor=border_color,
        linewidth=linewidth,
        zorder=5,
    )
    ax.add_patch(bottom_ellipse)

    # Body rectangle (from top ellipse to bottom ellipse)
    body = patches.Rectangle(
        (x, y + ellipse_height),
        w,
        h - ellipse_height * 2,
        facecolor=fill_color,
        edgecolor=border_color,
        linewidth=linewidth,
        zorder=5,
    )
    ax.add_patch(body)

    # Left and right edges (vertical lines connecting ellipses)
    ax.plot(
        [x, x],
        [y + ellipse_height, y + h - ellipse_height],
        color=border_color,
        linewidth=linewidth,
        zorder=5,
    )
    ax.plot(
        [x + w, x + w],
        [y + ellipse_height, y + h - ellipse_height],
        color=border_color,
        linewidth=linewidth,
        zorder=5,
    )

    # 2. Draw top ellipse
    top_ellipse = patches.Ellipse(
        (x + w / 2, y + h - ellipse_height),
        w,
        ellipse_height * 2,
        facecolor=fill_color,
        edgecolor=border_color,
        linewidth=linewidth,
        zorder=6,  # Slightly higher to be in front
    )
    ax.add_patch(top_ellipse)

    if text:
        # Position text in middle of cylinder body
        cx = x + w / 2
        cy = y + h / 2
        disp = handle_arabic(text)
        ax.text(
            cx,
            cy,
            disp,
            color=text_color,
            fontproperties=get_font_prop(text_size),
            ha="center",
            va="center",
            zorder=20,
        )

    return top_ellipse


