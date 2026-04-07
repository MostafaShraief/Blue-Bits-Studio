import matplotlib.pyplot as plt
import matplotlib.patches as patches
import numpy as np
from src.draw_engine.core import *
from src.draw_engine.text import *
from src.draw_engine.shapes.primitives import *
from src.draw_engine.connectors.arrows import *
from src.draw_engine.connectors.routing import *

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
#       CATEGORY 4: ADVANCED CONNECTOR FUNCTIONS
# =========================================================


def draw_orthogonal_arrow(ax, p1, p2, color=BLUE, linewidth=2, arrow_size=0.15):
    """
    Draw an orthogonal arrow with right-angle turns (horizontal then vertical or vice versa).

    Args:
        ax: matplotlib axes
        p1: (x, y) start point tuple
        p2: (x, y) end point tuple
        color: Arrow color (default: BLUE)
        linewidth: Line width
        arrow_size: Size of the arrow head

    Returns:
        The annotation object
    """
    # Determine whether to go horizontal-first or vertical-first
    # based on which creates a shorter path
    dx = p2[0] - p1[0]
    dy = p2[1] - p1[1]

    # Create intermediate point for orthogonal path
    if abs(dx) > abs(dy):
        # Horizontal-first: go to (p2.x, p1.y) then to p2
        mid_x = p2[0]
        mid_y = p1[1]
    else:
        # Vertical-first: go to (p1.x, p2.y) then to p2
        mid_x = p1[0]
        mid_y = p2[1]

    # Draw first segment
    style1 = patches.ConnectionStyle("Arc3", rad=0)
    arrow1 = ax.annotate(
        "",
        xy=(mid_x, mid_y),
        xytext=p1,
        arrowprops=dict(
            arrowstyle=patches.ArrowStyle.Simple(
                tail_width=linewidth * 0.5,
                head_width=arrow_size,
            ),
            color=color,
            lw=linewidth,
            connectionstyle=style1,
        ),
        zorder=10,
    )

    # Draw second segment with arrow at end
    style2 = patches.ConnectionStyle("Arc3", rad=0)
    arrow2 = ax.annotate(
        "",
        xy=p2,
        xytext=(mid_x, mid_y),
        arrowprops=dict(
            arrowstyle=patches.ArrowStyle.Simple(
                tail_width=linewidth * 0.5,
                head_width=arrow_size,
            ),
            color=color,
            lw=linewidth,
            connectionstyle=style2,
        ),
        zorder=10,
    )

    return arrow2


def draw_curved_arrow(
    ax, p1, p2, color=BLUE, linewidth=2, arrow_size=0.15, curve_strength=0.3
):
    """
    Draw a curved arrow using a Bezier curve connector.

    Args:
        ax: matplotlib axes
        p1: (x, y) start point tuple
        p2: (x, y) end point tuple
        color: Arrow color (default: BLUE)
        linewidth: Line width
        arrow_size: Size of the arrow head
        curve_strength: Controls the curvature amount (0-1, default: 0.3)

    Returns:
        The annotation object
    """
    # Calculate control point for quadratic Bezier
    # Control point is offset perpendicular to the line
    dx = p2[0] - p1[0]
    dy = p2[1] - p1[1]
    length = np.hypot(dx, dy)

    if length == 0:
        return None

    # Perpendicular offset for control point
    offset = length * curve_strength
    cx = (p1[0] + p2[0]) / 2 - (dy / length) * offset
    cy = (p1[1] + p2[1]) / 2 + (dx / length) * offset

    # Create curved path using quadratic Bezier
    # We'll use ConnectionStyle "CurveB" with explicitly computed control point
    connection_style = patches.ConnectionStyle.CurveB(
        ref=(cx, cy),  # Control point
    )

    arrow = ax.annotate(
        "",
        xy=p2,
        xytext=p1,
        arrowprops=dict(
            arrowstyle=patches.ArrowStyle.Simple(
                tail_width=linewidth * 0.5,
                head_width=arrow_size,
            ),
            color=color,
            lw=linewidth,
            connectionstyle=connection_style,
        ),
        zorder=10,
    )

    return arrow


def draw_dashed_arrow(ax, p1, p2, color=GRAY, linewidth=2, arrow_size=0.15):
    """
    Draw a dashed arrow connector (for optional flow).

    Args:
        ax: matplotlib axes
        p1: (x, y) start point tuple
        p2: (x, y) end point tuple
        color: Arrow color (default: GRAY)
        linewidth: Line width
        arrow_size: Size of the arrow head

    Returns:
        The annotation object
    """
    arrow = ax.annotate(
        "",
        xy=p2,
        xytext=p1,
        arrowprops=dict(
            arrowstyle=patches.ArrowStyle.Simple(
                tail_width=linewidth * 0.5,
                head_width=arrow_size,
            ),
            color=color,
            lw=linewidth,
            linestyle="--",
        ),
        zorder=10,
    )

    return arrow


def draw_double_arrow(ax, p1, p2, color=BLUE, linewidth=2, arrow_size=0.15):
    """
    Draw a bidirectional arrow with arrow heads on both ends.

    Args:
        ax: matplotlib axes
        p1: (x, y) start point tuple
        p2: (x, y) end point tuple
        color: Arrow color (default: BLUE)
        linewidth: Line width
        arrow_size: Size of the arrow head

    Returns:
        The annotation object
    """
    # Draw arrow from p1 to p2 (arrow at p2)
    arrow1 = ax.annotate(
        "",
        xy=p2,
        xytext=p1,
        arrowprops=dict(
            arrowstyle=patches.ArrowStyle.Simple(
                tail_width=linewidth * 0.5,
                head_width=arrow_size,
            ),
            color=color,
            lw=linewidth,
        ),
        zorder=10,
    )

    # Draw arrow from p2 to p1 (arrow at p1)
    arrow2 = ax.annotate(
        "",
        xy=p1,
        xytext=p2,
        arrowprops=dict(
            arrowstyle=patches.ArrowStyle.Simple(
                tail_width=linewidth * 0.5,
                head_width=arrow_size,
            ),
            color=color,
            lw=linewidth,
        ),
        zorder=10,
    )

    return arrow2




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
#                   NAMING & LABELING UTILITIES
# =========================================================


def add_title(ax, text, y=None, size=None, color=BLUE):
    """
    Add a centered diagram title at the top.

    Args:
        ax: matplotlib axes
        text: Title text (Arabic supported)
        y: Y position (default: top of ylim)
        size: Font size (default: DEFAULT_SIZE * 1.3)
        color: Title color (default: BLUE)
    """
    if size is None:
        size = int(DEFAULT_SIZE * 1.3)
    if y is None:
        _, ymax = ax.get_ylim()
        y = ymax - 0.5
    _, xmax = ax.get_xlim()
    add_text(ax, 0, y, text, color=color, size=size)


def add_subtitle(ax, text, y=None, size=None, color=GRAY):
    """
    Add a subtitle below the title.

    Args:
        ax: matplotlib axes
        text: Subtitle text
        y: Y position (default: below title)
        size: Font size (default: DEFAULT_SIZE * 0.8)
        color: Subtitle color (default: GRAY)
    """
    if size is None:
        size = int(DEFAULT_SIZE * 0.8)
    if y is None:
        _, ymax = ax.get_ylim()
        y = ymax - 1.5
    add_text(ax, 0, y, text, color=color, size=size)


def add_label(
    ax, x, y, text, color=BLUE, size=None, bg_color=None, ha="center", va="center"
):
    """
    Add a small label/annotation at any position with optional background.

    Args:
        ax: matplotlib axes
        x, y: Position
        text: Label text
        color: Text color
        size: Font size (default: DEFAULT_SIZE * 0.6)
        bg_color: Background box color (None for no background)
    """
    if size is None:
        size = int(DEFAULT_SIZE * 0.6)

    if bg_color:
        fig = ax.figure
        fig.canvas.draw()
        renderer = fig.canvas.get_renderer()
        font = get_font_prop(size)
        disp = handle_arabic(text)
        t = ax.text(x, y, disp, fontproperties=font, alpha=0)
        bbox = t.get_window_extent(renderer)
        inv = ax.transData.inverted()
        p1 = inv.transform(bbox.p0)
        p2 = inv.transform(bbox.p1)
        pad = 0.15
        draw_box(
            ax,
            p1[0] - pad,
            p1[1] - pad,
            (p2[0] - p1[0]) + 2 * pad,
            (p2[1] - p1[1]) + 2 * pad,
            text="",
            fill_color=bg_color,
            border_color=bg_color,
            rounded=True,
            zorder_box=3,
        )
        t.remove()

    add_text(ax, x, y, text, color=color, size=size, ha=ha, va=va)


def add_legend(ax, items, x=None, y=None, title="", size=None):
    """
    Add a legend box explaining colors/symbols used in the diagram.

    Args:
        ax: matplotlib axes
        items: List of (color, text) tuples
        x, y: Top-left position (default: top-right of canvas)
        title: Legend title
        size: Font size (default: DEFAULT_SIZE * 0.6)
    """
    if size is None:
        size = int(DEFAULT_SIZE * 0.6)
    if x is None:
        xmax, _ = ax.get_xlim()
        x = xmax - 3.5
    if y is None:
        _, ymax = ax.get_ylim()
        y = ymax - 1.5

    box_h = 0.5 * (len(items) + 1) + (0.5 if title else 0)
    draw_box(
        ax,
        x - 0.3,
        y - box_h,
        3.2,
        box_h,
        text="",
        fill_color=WHITE,
        border_color=GRAY,
        rounded=True,
        linewidth=1,
        zorder_box=15,
    )

    cy = y - 0.5
    if title:
        add_text(ax, x + 1.3, cy, title, color=BLUE, size=size)
        cy -= 0.5

    for color, text in items:
        # Color swatch
        swatch = patches.Rectangle(
            (x, cy - 0.15),
            0.4,
            0.3,
            facecolor=color,
            edgecolor=BLACK,
            linewidth=0.5,
            zorder=16,
        )
        ax.add_patch(swatch)
        add_text(ax, x + 1.3, cy, text, color=BLACK, size=size, ha="left")
        cy -= 0.5


def add_caption(ax, text, y=None, size=None, color=GRAY):
    """
    Add a caption below the diagram.

    Args:
        ax: matplotlib axes
        text: Caption text
        y: Y position (default: bottom of ylim)
        size: Font size (default: DEFAULT_SIZE * 0.7)
        color: Caption color (default: GRAY)
    """
    if size is None:
        size = int(DEFAULT_SIZE * 0.7)
    if y is None:
        _, ymin = ax.get_ylim()
        y = ymin + 0.5
    add_text(ax, 0, y, text, color=color, size=size)


def add_page_number(ax, number, total=None):
    """
    Add page number at bottom-right corner.

    Args:
        ax: matplotlib axes
        number: Current page number
        total: Total pages (optional)
    """
    _, ymin = ax.get_ylim()
    xmax, _ = ax.get_xlim()
    text = f"{number} / {total}" if total else str(number)
    add_text(
        ax,
        xmax - 1,
        ymin + 0.4,
        text,
        color=GRAY,
        size=int(DEFAULT_SIZE * 0.5),
        ha="right",
    )


def add_watermark(ax, text="BlueBits", alpha=0.08, size=None):
    """
    Add a subtle watermark across the center of the diagram.

    Args:
        ax: matplotlib axes
        text: Watermark text
        alpha: Transparency (default: 0.08)
        size: Font size (default: DEFAULT_SIZE * 3)
    """
    if size is None:
        size = int(DEFAULT_SIZE * 3)
    add_text(ax, 0, 0, text, color=BLUE, size=size)
    # Make all text children at center semi-transparent
    for child in ax.get_children():
        if hasattr(child, "get_text") and child.get_text() == handle_arabic(text):
            child.set_alpha(alpha)


def add_divider(ax, y, x_range=None, color=GRAY, linewidth=1, linestyle="-"):
    """
    Add a horizontal divider line across the diagram.

    Args:
        ax: matplotlib axes
        y: Y position
        x_range: (xmin, xmax) tuple (default: full xlim)
        color: Line color
        linewidth: Line width
        linestyle: Line style ('-', '--', ':')
    """
    if x_range is None:
        x_range = ax.get_xlim()
    ax.plot(
        x_range, [y, y], color=color, linewidth=linewidth, linestyle=linestyle, zorder=1
    )


def add_code_block(ax, x, y, lines, size=None, bg_color=LIGHT_BLUE):
    """
    Draw a multi-line code snippet box.

    Args:
        ax: matplotlib axes
        x, y: Top-left position
        lines: List of code strings
        size: Font size (default: DEFAULT_SIZE * 0.7)
        bg_color: Background color
    """
    if size is None:
        size = int(DEFAULT_SIZE * 0.7)

    line_h = 0.5
    max_w = max(len(line) for line in lines) * 0.25
    box_h = len(lines) * line_h + 0.4
    box_w = max(max_w, 4)

    # Background box
    draw_box(
        ax,
        x,
        y - box_h,
        box_w,
        box_h,
        text="",
        fill_color=bg_color,
        border_color=BLUE,
        rounded=True,
        linewidth=1.5,
        zorder_box=3,
    )

    # Code lines
    for i, line in enumerate(lines):
        add_text(
            ax,
            x + 0.3,
            y - 0.4 - i * line_h,
            line,
            color=BLACK,
            size=size,
            ha="left",
            va="top",
        )


def draw_pseudocode_block(
    ax,
    x,
    y,
    lines,
    line_numbers=True,
    highlight_lines=None,
    size=None,
    bg_color=LIGHT_BLUE,
):
    """
    Draw a pseudo-code block with optional line numbers and highlighting.

    Args:
        ax: matplotlib axes
        x, y: Top-left position
        lines: List of code/pseudo-code strings
        line_numbers: Show line numbers (default: True)
        highlight_lines: List of line indices to highlight (0-based)
        size: Font size (default: DEFAULT_SIZE * 0.65)
        bg_color: Background color for non-highlighted lines
    """
    if size is None:
        size = int(DEFAULT_SIZE * 0.65)

    if highlight_lines is None:
        highlight_lines = []

    line_h = 0.5
    num_w = 0.8 if line_numbers else 0
    max_w = max(len(line) for line in lines) * 0.22
    box_h = len(lines) * line_h + 0.3
    box_w = num_w + max_w + 0.6

    # Draw background box
    draw_box(
        ax,
        x,
        y - box_h,
        box_w,
        box_h,
        text="",
        fill_color=bg_color,
        border_color=BLUE,
        rounded=True,
        linewidth=1.5,
        zorder_box=3,
    )

    # Draw each line
    for i, line in enumerate(lines):
        line_y = y - 0.3 - i * line_h

        # Draw line number if enabled
        if line_numbers:
            add_text(
                ax,
                x + 0.25,
                line_y,
                str(i + 1),
                color=GRAY,
                size=size,
                ha="left",
                va="top",
            )

        # Draw code text
        code_x = x + num_w + 0.3
        text_color = RED if i in highlight_lines else BLACK

        # Draw highlight background for highlighted lines
        if i in highlight_lines:
            draw_box(
                ax,
                code_x - 0.1,
                line_y - 0.35,
                max_w + 0.2,
                0.45,
                text="",
                fill_color=LIGHT_RED,
                border_color=None,
                zorder_box=2,
            )

        add_text(
            ax,
            code_x,
            line_y,
            line,
            color=text_color,
            size=size,
            ha="left",
            va="top",
        )


def draw_complexity_label(ax, x, y, complexity="O(n)", size=None, color=RED):
    """
    Draw a Big-O complexity notation label.

    Args:
        ax: matplotlib axes
        x, y: Position
        complexity: String like "O(1)", "O(n)", "O(log n)", "O(n^2)", "O(n log n)"
        size: Font size (default: DEFAULT_SIZE * 0.9)
        color: Text color
    """
    if size is None:
        size = int(DEFAULT_SIZE * 0.9)

    # Use math text for proper rendering of superscripts etc
    add_text(
        ax,
        x,
        y,
        f"${complexity}$",
        color=color,
        size=size,
        ha="center",
        va="center",
    )


def draw_step_indicator(ax, step_num, x, y, size=None, active=True):
    """
    Draw an algorithm step indicator (numbered circle).

    Args:
        ax: matplotlib axes
        step_num: Step number (1, 2, 3, ...)
        x, y: Center position
        size: Font size (default: DEFAULT_SIZE * 0.8)
        active: If True, highlight the current step (filled); else dimmed
    """
    if size is None:
        size = int(DEFAULT_SIZE * 0.8)

    # Determine colors based on active state
    if active:
        fill_color = BLUE
        text_color = WHITE
        border_color = BLUE
        linewidth = 2
    else:
        fill_color = WHITE
        text_color = GRAY
        border_color = GRAY
        linewidth = 1

    # Draw circle
    draw_circle(
        ax,
        x,
        y,
        r=0.35,
        text=str(step_num),
        text_color=text_color,
        border_color=border_color,
        fill_color=fill_color,
        text_size=size,
        linewidth=linewidth,
    )


def add_numbered_list(ax, x, y, items, size=None, bullet_color=BLUE):
    """
    Draw a numbered or bulleted list.

    Args:
        ax: matplotlib axes
        x, y: Top-left position
        items: List of text strings
        size: Font size (default: DEFAULT_SIZE * 0.7)
        bullet_color: Bullet/number color
    """
    if size is None:
        size = int(DEFAULT_SIZE * 0.7)

    line_h = 0.7
    for i, item in enumerate(items):
        num_y = y - i * line_h
        # Number circle
        draw_circle(
            ax,
            x,
            num_y,
            0.25,
            text=str(i + 1),
            text_color=WHITE,
            border_color=bullet_color,
            fill_color=bullet_color,
            text_size=int(size * 0.7),
        )
        # Item text
        add_text(ax, x + 0.6, num_y, item, color=BLACK, size=size, ha="left")


def add_math_expression(ax, x, y, expression, size=None, color=BLACK):
    """
    Add a mathematical expression using matplotlib's mathtext.

    Args:
        ax: matplotlib axes
        x, y: Position
        expression: Math string (use LaTeX-like syntax, e.g. r'$x^2$')
        size: Font size
        color: Text color
    """
    if size is None:
        size = DEFAULT_SIZE
    ax.text(
        x,
        y,
        expression,
        fontsize=size,
        color=color,
        ha="center",
        va="center",
        zorder=20,
    )


def add_section_header(ax, x, y, text, size=None, color=BLUE):
    """
    Add a section header with underline.

    Args:
        ax: matplotlib axes
        x, y: Position (left-aligned)
        text: Header text
        size: Font size (default: DEFAULT_SIZE)
        color: Header color
    """
    if size is None:
        size = DEFAULT_SIZE
    add_text(ax, x, y, text, color=color, size=size, ha="left")

    # Underline
    fig = ax.figure
    fig.canvas.draw()
    renderer = fig.canvas.get_renderer()
    font = get_font_prop(size)
    disp = handle_arabic(text)
    t = ax.text(x, y, disp, fontproperties=font, alpha=0)
    bbox = t.get_window_extent(renderer)
    inv = ax.transData.inverted()
    p1 = inv.transform(bbox.p0)
    p2 = inv.transform(bbox.p1)
    t.remove()

    ax.plot([p1[0], p2[0]], [y - 0.2, y - 0.2], color=color, linewidth=1.5, zorder=1)


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


# =========================================================
#          NETWORK/CLOUD DIAGRAM FUNCTIONS
# =========================================================


def draw_cloud_shape(
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
    Draw a cloud computing symbol.
    Uses 5-6 overlapping circles arranged in a cloud pattern.

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
        The patch object (main cloud shape)
    """
    if text_size is None:
        text_size = DEFAULT_SIZE

    # Create cloud from 5-6 overlapping circles
    # Pattern: cloud-like arrangement with bumps
    circles = [
        (-w * 0.28, h * 0.05, w * 0.32),  # Left bottom lobe
        (w * 0.28, h * 0.05, w * 0.32),  # Right bottom lobe
        (0, h * 0.18, w * 0.38),  # Top center
        (-w * 0.38, -h * 0.05, w * 0.22),  # Bottom left small
        (w * 0.38, -h * 0.05, w * 0.22),  # Bottom right small
    ]

    patches_list = []

    # Draw individual circles with overlapping fills
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
        patches_list.append(circle_patch)

    if text:
        # Position text in center of cloud
        disp = handle_arabic(text)
        ax.text(
            x,
            y - h * 0.05,
            disp,
            color=text_color,
            fontproperties=get_font_prop(text_size),
            ha="center",
            va="center",
            zorder=20,
        )

    return patches_list[-1] if patches_list else None


def draw_server(
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
    Draw a server/storage rectangle with horizontal lines inside (rack units).

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
        The patch object (main rectangle)
    """
    if text_size is None:
        text_size = DEFAULT_SIZE

    # Main server body (rectangle)
    body = patches.Rectangle(
        (x, y),
        w,
        h,
        facecolor=fill_color,
        edgecolor=border_color,
        linewidth=linewidth,
        zorder=5,
    )
    ax.add_patch(body)

    # Draw horizontal lines to represent rack units (typically 3-4 lines)
    num_lines = 4
    line_spacing = h / (num_lines + 1)

    for i in range(1, num_lines + 1):
        line_y = y + i * line_spacing
        ax.plot(
            [x, x + w],
            [line_y, line_y],
            color=border_color,
            linewidth=linewidth * 0.7,
            zorder=6,
        )

    if text:
        # Position text in center
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

    return body


def draw_database_cylinder(
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
    Draw a cylinder for database symbol.
    Similar to draw_cylinder but with 3 horizontal ellipse lines
    to show disk platters.

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

    # 3. Draw 3 horizontal ellipse lines to represent disk platters
    num_platters = 3
    platter_spacing = (h - ellipse_height * 2) / (num_platters + 1)

    for i in range(1, num_platters + 1):
        platter_y = y + ellipse_height + i * platter_spacing
        platter_line = patches.Ellipse(
            (x + w / 2, platter_y),
            w,
            ellipse_height * 2,
            facecolor="none",
            edgecolor=border_color,
            linewidth=linewidth * 0.5,
            zorder=4,
        )
        ax.add_patch(platter_line)

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


def draw_device(
    ax,
    x,
    y,
    device_type="computer",
    text="",
    text_color=BLACK,
    border_color=BLUE,
    fill_color=WHITE,
    text_size=None,
    linewidth=2,
):
    """
    Draw router/switch/computer icons.
    Simple geometric representation for network devices.

    Args:
        ax: matplotlib axes
        x, y: Center position
        device_type: Type of device - "computer", "router", "switch", "phone", "server"
        text: Text to display (Arabic supported)
        text_color: Text color
        border_color: Border color
        fill_color: Fill color
        text_size: Font size (default: DEFAULT_SIZE)
        linewidth: Border width

    Returns:
        The main patch object
    """
    if text_size is None:
        text_size = DEFAULT_SIZE

    # Default size for device icons
    w = 1.2
    h = 1.0

    patch = None

    if device_type == "computer":
        # Monitor shape: rectangle with stand
        # Main monitor
        body = patches.Rectangle(
            (x - w / 2, y),
            w,
            h * 0.7,
            facecolor=fill_color,
            edgecolor=border_color,
            linewidth=linewidth,
            zorder=5,
        )
        ax.add_patch(body)
        patch = body

        # Stand
        ax.plot(
            [x, x],
            [y, y - h * 0.15],
            color=border_color,
            linewidth=linewidth,
            zorder=5,
        )
        ax.plot(
            [x - w * 0.2, x + w * 0.2],
            [y - h * 0.15, y - h * 0.15],
            color=border_color,
            linewidth=linewidth,
            zorder=5,
        )

    elif device_type == "router":
        # Router: rectangle with antennas
        body = patches.Rectangle(
            (x - w / 2, y - h * 0.3),
            w,
            h * 0.6,
            facecolor=fill_color,
            edgecolor=border_color,
            linewidth=linewidth,
            zorder=5,
        )
        ax.add_patch(body)
        patch = body

        # Antennas (2-3 lines)
        antenna_positions = [-w * 0.25, 0, w * 0.25]
        for ant_x in antenna_positions:
            ax.plot(
                [x + ant_x, x + ant_x],
                [y + h * 0.3, y + h * 0.5],
                color=border_color,
                linewidth=linewidth * 0.7,
                zorder=5,
            )

    elif device_type == "switch":
        # Switch: rectangle with port indicators
        body = patches.Rectangle(
            (x - w / 2, y - h * 0.3),
            w,
            h * 0.6,
            facecolor=fill_color,
            edgecolor=border_color,
            linewidth=linewidth,
            zorder=5,
        )
        ax.add_patch(body)
        patch = body

        # Port indicators (small squares)
        num_ports = 4
        port_spacing = w / (num_ports + 1)
        port_size = w * 0.08

        for i in range(1, num_ports + 1):
            port_x = x - w / 2 + i * port_spacing
            port = patches.Rectangle(
                (port_x - port_size / 2, y - h * 0.1),
                port_size,
                port_size,
                facecolor=fill_color,
                edgecolor=border_color,
                linewidth=linewidth * 0.5,
                zorder=6,
            )
            ax.add_patch(port)

    elif device_type == "phone":
        # Phone: rectangle with rounded corners
        from matplotlib.patches import FancyBboxPatch

        phone = FancyBboxPatch(
            (x - w * 0.4, y - h * 0.5),
            w * 0.8,
            h,
            boxstyle="round,pad_ratio=0.1",
            facecolor=fill_color,
            edgecolor=border_color,
            linewidth=linewidth,
            zorder=5,
        )
        ax.add_patch(phone)
        patch = phone

        # Screen indicator line
        ax.plot(
            [x - w * 0.25, x + w * 0.25],
            [y + h * 0.2, y + h * 0.2],
            color=border_color,
            linewidth=linewidth * 0.5,
            zorder=6,
        )

    elif device_type == "server":
        # Server: tall rectangle with lines (rack style)
        body = patches.Rectangle(
            (x - w / 2, y - h * 0.4),
            w,
            h * 0.8,
            facecolor=fill_color,
            edgecolor=border_color,
            linewidth=linewidth,
            zorder=5,
        )
        ax.add_patch(body)
        patch = body

        # Horizontal lines for rack units
        num_lines = 3
        line_spacing = h * 0.8 / (num_lines + 1)

        for i in range(1, num_lines + 1):
            line_y = y - h * 0.4 + i * line_spacing
            ax.plot(
                [x - w * 0.35, x + w * 0.35],
                [line_y, line_y],
                color=border_color,
                linewidth=linewidth * 0.7,
                zorder=6,
            )

    else:
        # Default: simple rectangle
        body = patches.Rectangle(
            (x - w / 2, y - h / 2),
            w,
            h,
            facecolor=fill_color,
            edgecolor=border_color,
            linewidth=linewidth,
            zorder=5,
        )
        ax.add_patch(body)
        patch = body

    if text:
        # Position text below the device
        disp = handle_arabic(text)
        ax.text(
            x,
            y - h * 0.7,
            disp,
            color=text_color,
            fontproperties=get_font_prop(text_size),
            ha="center",
            va="top",
            zorder=20,
        )

    return patch


# =========================================================
#       CATEGORY 6: VISUAL ANNOTATION FUNCTIONS
# =========================================================


def draw_callout(
    ax,
    x,
    y,
    text,
    pointer_x=None,
    pointer_y=None,
    text_color=BLACK,
    border_color=BLUE,
    fill_color=LIGHT_BLUE,
    text_size=None,
    linewidth=2,
):
    """
    Draw a text bubble with a pointer.

    Args:
        ax: matplotlib axes
        x, y: Center position of the text bubble
        text: Text to display inside the callout
        pointer_x, pointer_y: Coordinates where the pointer points to.
                               If not provided, points downward by default.
        text_color: Text color
        border_color: Border color
        fill_color: Fill color
        text_size: Font size (default: DEFAULT_SIZE)
        linewidth: Border width

    Returns:
        The text box patch object
    """
    if text_size is None:
        text_size = DEFAULT_SIZE

    # Bubble dimensions
    w = 2.5
    h = 1.2

    # Draw main bubble (rounded rectangle)
    bubble = patches.FancyBboxPatch(
        (x - w / 2, y - h / 2),
        w,
        h,
        boxstyle="round,pad=0.1,rounding_size=0.2",
        facecolor=fill_color,
        edgecolor=border_color,
        linewidth=linewidth,
        zorder=5,
    )
    ax.add_patch(bubble)

    # Draw text
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

    # Draw pointer
    if pointer_x is None and pointer_y is None:
        # Default: point downward
        pointer_x = x
        pointer_y = y - h / 2 - 0.3

    # Pointer is a triangle from bubble bottom to target point
    pointer_tip_y = y - h / 2 - 0.05

    # Triangle vertices: tip (pointer_x, pointer_y), base left, base right
    base_w = 0.4
    triangle = patches.Polygon(
        [
            (pointer_x, pointer_y),
            (pointer_x - base_w / 2, pointer_tip_y),
            (pointer_x + base_w / 2, pointer_tip_y),
        ],
        closed=True,
        facecolor=border_color,
        edgecolor=border_color,
        linewidth=linewidth - 1,
        zorder=4,
    )
    ax.add_patch(triangle)

    return bubble


def draw_bubble(
    ax,
    x,
    y,
    r,
    text="",
    bubble_type="speech",
    text_color=BLACK,
    border_color=BLUE,
    fill_color=WHITE,
    text_size=None,
    linewidth=2,
):
    """
    Draw a speech/thought bubble.

    Args:
        ax: matplotlib axes
        x, y: Center position of the bubble
        r: Radius (approximate size for the bubble)
        text: Text to display inside the bubble
        bubble_type: Type of bubble - "speech" (oval), "thought" (cloud-like), "exclamation" (burst)
        text_color: Text color
        border_color: Border color
        fill_color: Fill color
        text_size: Font size (default: DEFAULT_SIZE)
        linewidth: Border width

    Returns:
        The main patch object
    """
    if text_size is None:
        text_size = DEFAULT_SIZE

    if bubble_type == "speech":
        # Oval/ellipse shape
        bubble = patches.Ellipse(
            (x, y),
            r * 2,
            r * 1.3,
            facecolor=fill_color,
            edgecolor=border_color,
            linewidth=linewidth,
            zorder=5,
        )
        ax.add_patch(bubble)

    elif bubble_type == "thought":
        # Cloud-like shape using multiple overlapping circles
        circles = [
            (-r * 0.5, 0, r * 0.6),
            (r * 0.5, 0, r * 0.6),
            (0, r * 0.3, r * 0.55),
            (-r * 0.7, -r * 0.2, r * 0.4),
            (r * 0.7, -r * 0.2, r * 0.4),
        ]
        for cx_off, cy_off, cr in circles:
            circle = patches.Circle(
                (x + cx_off, y + cy_off),
                cr,
                facecolor=fill_color,
                edgecolor=border_color,
                linewidth=linewidth,
                zorder=5,
            )
            ax.add_patch(circle)
        bubble = circles[-1]  # Return last one as reference

    elif bubble_type == "exclamation":
        # Star/burst shape (pointed burst)
        num_points = 12
        outer_r = r
        inner_r = r * 0.6

        # Generate star vertices
        vertices = []
        for i in range(num_points * 2):
            angle = i * np.pi / num_points - np.pi / 2
            if i % 2 == 0:
                radius = outer_r
            else:
                radius = inner_r
            vertices.append((x + radius * np.cos(angle), y + radius * np.sin(angle)))

        bubble = patches.Polygon(
            vertices,
            closed=True,
            facecolor=fill_color,
            edgecolor=border_color,
            linewidth=linewidth,
            zorder=5,
        )
        ax.add_patch(bubble)

    else:
        # Default to ellipse
        bubble = patches.Ellipse(
            (x, y),
            r * 2,
            r * 1.3,
            facecolor=fill_color,
            edgecolor=border_color,
            linewidth=linewidth,
            zorder=5,
        )
        ax.add_patch(bubble)

    # Draw text if provided
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

    return bubble


def draw_footnote(ax, x, y, text, size=None, color=GRAY):
    """
    Draw a small footnote text at the bottom of the diagram.

    Args:
        ax: matplotlib axes
        x, y: Position for the footnote
        text: Footnote text
        size: Font size (default: DEFAULT_SIZE * 0.6)
        color: Text color (default: GRAY)
    """
    if size is None:
        size = int(DEFAULT_SIZE * 0.6)

    disp = handle_arabic(text)
    ax.text(
        x,
        y,
        disp,
        color=color,
        fontproperties=get_font_prop(size),
        ha="left",
        va="bottom",
        zorder=15,
    )


def draw_sticky_note(
    ax,
    x,
    y,
    w,
    h,
    text="",
    text_color=BLACK,
    text_size=None,
):
    """
    Draw a yellow sticky note rectangle with slight shadow.

    Args:
        ax: matplotlib axes
        x, y: Bottom-left corner position
        w, h: Width and height of the note
        text: Text to display inside the note
        text_color: Text color
        text_size: Font size (default: DEFAULT_SIZE * 0.9)

    Returns:
        The main rectangle patch object
    """
    if text_size is None:
        text_size = int(DEFAULT_SIZE * 0.9)

    # Shadow (offset rectangle)
    shadow = patches.Rectangle(
        (x + 0.1, y - 0.1),
        w,
        h,
        facecolor="#CCCCCC",
        edgecolor="none",
        zorder=4,
    )
    ax.add_patch(shadow)

    # Main note (yellow with slight border)
    note = patches.Rectangle(
        (x, y),
        w,
        h,
        facecolor="#FFEB3B",  # Yellow sticky note color
        edgecolor="#FBC02D",  # Slightly darker yellow border
        linewidth=1,
        zorder=5,
    )
    ax.add_patch(note)

    # Folded corner effect (top-right)
    fold_size = min(w * 0.15, h * 0.15, 0.3)
    fold = patches.Polygon(
        [
            (x + w - fold_size, y + h),
            (x + w - fold_size, y + h - fold_size),
            (x + w, y + h - fold_size),
        ],
        closed=True,
        facecolor="#FFF59D",  # Lighter yellow for fold
        edgecolor="#FBC02D",
        linewidth=0.5,
        zorder=6,
    )
    ax.add_patch(fold)

    # Text inside note
    if text:
        disp = handle_arabic(text)
        ax.text(
            x + w / 2,
            y + h / 2,
            disp,
            color=text_color,
            fontproperties=get_font_prop(text_size),
            ha="center",
            va="center",
            zorder=20,
        )

    return note


def draw_highlight_box(
    ax,
    x,
    y,
    w,
    h,
    color="yellow",
    alpha=0.3,
):
    """
    Draw a transparent highlight rectangle to emphasize an area.

    Args:
        ax: matplotlib axes
        x, y: Bottom-left corner position
        w, h: Width and height of the highlight area
        color: Highlight color (default: "yellow")
        alpha: Transparency (default: 0.3)

    Returns:
        The Rectangle patch object
    """
    highlight = patches.Rectangle(
        (x, y),
        w,
        h,
        facecolor=color,
        edgecolor="none",
        alpha=alpha,
        zorder=2,
    )
    ax.add_patch(highlight)

    return highlight


# =========================================================
#               ENHANCED LAYOUT HELPERS
# =========================================================
def draw_grid(
    ax, x, y, rows, cols, cell_w, cell_h, color=GRAY, linewidth=0.5, alpha=0.3
):
    """
    Draw alignment grid for positioning elements.

    Args:
        ax: matplotlib axes
        x, y: Starting position (bottom-left corner of grid)
        rows: Number of rows
        cols: Number of columns
        cell_w: Width of each cell
        cell_h: Height of each cell
        color: Grid line color
        linewidth: Line width
        alpha: Transparency

    Returns:
        List of Rectangle patches (one per cell, row-major order)
    """
    rects = []

    for row in range(rows):
        for col in range(cols):
            rect_x = x + col * cell_w
            rect_y = y + (rows - 1 - row) * cell_h  # Flip so row 0 is at top

            rect = patches.Rectangle(
                (rect_x, rect_y),
                cell_w,
                cell_h,
                facecolor="none",
                edgecolor=color,
                linewidth=linewidth,
                alpha=alpha,
                zorder=1,
            )
            ax.add_patch(rect)
            rects.append(rect)

    return rects


def add_axis(
    ax,
    x,
    y,
    direction="horizontal",
    length=5,
    labels=None,
    tick_size=0.1,
    size=None,
    color=BLACK,
):
    """
    Draw a simple axis with ticks and optional labels.

    Args:
        ax: matplotlib axes
        x, y: Starting position
        direction: "horizontal" or "vertical"
        length: Length of the axis line
        labels: List of (position_ratio, label_text) tuples (0.0 to 1.0)
        tick_size: Length of each tick
        size: Font size for labels (default: DEFAULT_SIZE * 0.7)
        color: Axis and tick color

    Returns:
        The axis line plot object
    """
    if size is None:
        size = DEFAULT_SIZE * 0.7

    if direction == "horizontal":
        # Main axis line
        axis_line = ax.plot(
            [x, x + length], [y, y], color=color, linewidth=1, zorder=5
        )[0]

        # Draw ticks at regular intervals
        num_ticks = 5
        for i in range(num_ticks + 1):
            tick_pos = x + (i / num_ticks) * length
            ax.plot(
                [tick_pos, tick_pos],
                [y - tick_size, y + tick_size],
                color=color,
                linewidth=0.8,
                zorder=5,
            )

        # Add custom labels if provided
        if labels:
            for pos_ratio, label_text in labels:
                tick_x = x + pos_ratio * length
                disp = handle_arabic(str(label_text))
                ax.text(
                    tick_x,
                    y - tick_size * 2,
                    disp,
                    color=color,
                    fontproperties=get_font_prop(size),
                    ha="center",
                    va="top",
                    zorder=20,
                )

    else:  # vertical
        # Main axis line
        axis_line = ax.plot(
            [x, x], [y, y + length], color=color, linewidth=1, zorder=5
        )[0]

        # Draw ticks at regular intervals
        num_ticks = 5
        for i in range(num_ticks + 1):
            tick_pos = y + (i / num_ticks) * length
            ax.plot(
                [x - tick_size, x + tick_size],
                [tick_pos, tick_pos],
                color=color,
                linewidth=0.8,
                zorder=5,
            )

        # Add custom labels if provided
        if labels:
            for pos_ratio, label_text in labels:
                tick_y = y + pos_ratio * length
                disp = handle_arabic(str(label_text))
                ax.text(
                    x - tick_size * 2,
                    tick_y,
                    disp,
                    color=color,
                    fontproperties=get_font_prop(size),
                    ha="right",
                    va="center",
                    zorder=20,
                )

    return axis_line


def draw_ruler(
    ax, x, y, length, direction="horizontal", tick_interval=1, size=None, color=BLACK
):
    """
    Draw a horizontal or vertical ruler with numbered ticks.

    Args:
        ax: matplotlib axes
        x, y: Starting position
        length: Length of the ruler
        direction: "horizontal" or "vertical"
        tick_interval: Interval between numbered ticks
        size: Font size for numbers (default: DEFAULT_SIZE * 0.6)
        color: Ruler color

    Returns:
        The ruler line plot object
    """
    if size is None:
        size = DEFAULT_SIZE * 0.6

    if direction == "horizontal":
        # Main ruler line
        ruler_line = ax.plot(
            [x, x + length], [y, y], color=color, linewidth=1, zorder=5
        )[0]

        # Calculate number of ticks based on length
        num_ticks = int(length // tick_interval) + 1

        for i in range(num_ticks):
            tick_x = x + i * tick_interval
            tick_y = y

            # Draw tick mark
            ax.plot(
                [tick_x, tick_x],
                [tick_y, tick_y + tick_interval * 0.3],
                color=color,
                linewidth=0.8,
                zorder=5,
            )

            # Add number label
            disp = handle_arabic(str(i * tick_interval))
            ax.text(
                tick_x,
                tick_y - tick_interval * 0.4,
                disp,
                color=color,
                fontproperties=get_font_prop(size),
                ha="center",
                va="top",
                zorder=20,
            )

    else:  # vertical
        # Main ruler line
        ruler_line = ax.plot(
            [x, x], [y, y + length], color=color, linewidth=1, zorder=5
        )[0]

        # Calculate number of ticks based on length
        num_ticks = int(length // tick_interval) + 1

        for i in range(num_ticks):
            tick_x = x
            tick_y = y + i * tick_interval

            # Draw tick mark
            ax.plot(
                [tick_x, tick_x + tick_interval * 0.3],
                [tick_y, tick_y],
                color=color,
                linewidth=0.8,
                zorder=5,
            )

            # Add number label
            disp = handle_arabic(str(i * tick_interval))
            ax.text(
                x - tick_interval * 0.4,
                tick_y,
                disp,
                color=color,
                fontproperties=get_font_prop(size),
                ha="right",
                va="center",
                zorder=20,
            )

    return ruler_line


def snap_to_grid(x, y, cell_w, cell_h):
    """
    Snap coordinates to the nearest grid position.

    Args:
        x, y: Original coordinates
        cell_w: Cell width
        cell_h: Cell height

    Returns:
        (snapped_x, snapped_y) tuple
    """
    snapped_x = round(x / cell_w) * cell_w
    snapped_y = round(y / cell_h) * cell_h
    return snapped_x, snapped_y


# =========================================================
#           GROUPING & STYLING FUNCTIONS
# =========================================================


def draw_group(
    ax,
    x,
    y,
    w,
    h,
    label="",
    border_color=GRAY,
    fill_color=None,
    alpha=0.1,
    linewidth=1,
    linestyle="--",
):
    """
    Draw grouping box with optional label.

    Args:
        ax: matplotlib axes
        x, y: Bottom-left corner position
        w, h: Width and height
        label: Optional label text
        border_color: Border color
        fill_color: Fill color
        alpha: Transparency
        linewidth: Border width
        linestyle: Line style

    Returns:
        The Rectangle patch object
    """
    if fill_color is None:
        fill_color = GRAY

    rect = patches.Rectangle(
        (x, y),
        w,
        h,
        facecolor=fill_color,
        alpha=alpha,
        edgecolor=border_color,
        linewidth=linewidth,
        linestyle=linestyle,
        zorder=2,
    )
    ax.add_patch(rect)

    if label:
        disp = handle_arabic(label)
        ax.text(
            x,
            y + h + 0.2,
            disp,
            fontsize=int(DEFAULT_SIZE * 0.7),
            color=border_color,
            ha="left",
            zorder=20,
        )

    return rect


def draw_shadow(ax, patch, offset=(3, -3), color="black", alpha=0.2):
    """
    Add shadow to any patch.

    Args:
        ax: matplotlib axes
        patch: The patch to add shadow to
        offset: (x, y) offset for shadow
        color: Shadow color
        alpha: Shadow transparency

    Returns:
        The shadow patch object
    """
    import copy
    import matplotlib.transforms as mtransforms

    shadow = copy.copy(patch)
    shadow.set_facecolor(color)
    shadow.set_alpha(alpha)
    shadow.set_edgecolor(color)
    shadow.set_transform(
        mtransforms.Affine2D().translate(offset[0], offset[1]) + ax.transData
    )
    ax.add_patch(shadow)
    return shadow


def draw_dotted_box(
    ax,
    x,
    y,
    w,
    h,
    text="",
    text_color=BLACK,
    border_color=GRAY,
    fill_color=WHITE,
    text_size=None,
    linewidth=1,
):
    """
    Draw dashed border box.

    Args:
        ax: matplotlib axes
        x, y: Bottom-left corner position
        w, h: Width and height
        text: Optional text to display
        text_color: Text color
        border_color: Border color
        fill_color: Fill color
        text_size: Font size
        linewidth: Border width

    Returns:
        The Rectangle patch object
    """
    if text_size is None:
        text_size = DEFAULT_SIZE

    box = patches.Rectangle(
        (x, y),
        w,
        h,
        facecolor=fill_color,
        edgecolor=border_color,
        linewidth=linewidth,
        linestyle=":",
        zorder=5,
    )
    ax.add_patch(box)

    if text:
        cx, cy = x + w / 2, y + h / 2
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


# =========================================================
#           DATA VISUALIZATION FUNCTIONS
# =========================================================


def draw_bar(
    ax,
    x,
    y,
    w,
    h,
    color=BLUE,
    border_color=None,
    text="",
    text_color=WHITE,
    text_size=None,
):
    """
    Draw a single bar for bar charts.

    Args:
        ax: matplotlib axes
        x, y: Bottom-left corner position
        w, h: Width and height
        color: Bar fill color
        border_color: Border color
        text: Optional text to display on bar
        text_color: Text color
        text_size: Font size

    Returns:
        The Rectangle patch object
    """
    if text_size is None:
        text_size = int(DEFAULT_SIZE * 0.7)
    if border_color is None:
        border_color = color

    bar = patches.Rectangle(
        (x, y), w, h, facecolor=color, edgecolor=border_color, linewidth=1, zorder=5
    )
    ax.add_patch(bar)

    if text:
        ax.text(
            x + w / 2,
            y + h / 2,
            text,
            color=text_color,
            fontproperties=get_font_prop(text_size),
            ha="center",
            va="center",
            zorder=20,
        )

    return bar


def draw_pie_slice(
    ax, cx, cy, r, start_angle, end_angle, color=BLUE, border_color=WHITE, linewidth=1
):
    """
    Draw pie chart slice.

    Args:
        ax: matplotlib axes
        cx, cy: Center position
        r: Radius
        start_angle: Start angle in degrees
        end_angle: End angle in degrees
        color: Slice fill color
        border_color: Border color
        linewidth: Border width

    Returns:
        The Wedge patch object
    """
    wedge = patches.Wedge(
        (cx, cy),
        r,
        start_angle,
        end_angle,
        facecolor=color,
        edgecolor=border_color,
        linewidth=linewidth,
        zorder=5,
    )
    ax.add_patch(wedge)
    return wedge


def draw_legend_item(
    ax, x, y, color, label, box_size=0.4, text_size=None, text_color=BLACK
):
    """
    Draw legend entry.

    Args:
        ax: matplotlib axes
        x, y: Position for the legend item
        color: Color swatch
        label: Label text
        box_size: Size of color box
        text_size: Font size
        text_color: Text color

    Returns:
        The Rectangle patch object
    """
    if text_size is None:
        text_size = int(DEFAULT_SIZE * 0.7)

    # Color box
    box = patches.Rectangle(
        (x, y - box_size / 2),
        box_size,
        box_size,
        facecolor=color,
        edgecolor=color,
        zorder=5,
    )
    ax.add_patch(box)

    # Label
    disp = handle_arabic(label)
    ax.text(
        x + box_size + 0.2,
        y,
        disp,
        color=text_color,
        fontproperties=get_font_prop(text_size),
        ha="left",
        va="center",
        zorder=20,
    )


# =========================================================
#           TIMING & SIGNAL DIAGRAMS (Category C)
# =========================================================


def draw_timing_diagram(
    ax, signals, time_range=(0, 10), x=0, y=0, signal_h=0.8, time_scale=1
):
    """Draw timing diagram with multiple signals."""
    for i, (name, levels) in enumerate(signals.items()):
        row_y = y - i * (signal_h + 0.4)
        # Signal name
        ax.text(
            x - 0.5,
            row_y,
            name,
            fontsize=DEFAULT_SIZE * 0.7,
            ha="right",
            va="center",
            zorder=20,
        )
        # Draw waveform segments
        for start, end, level in levels:
            color = BLUE if level else GRAY
            h = signal_h * 0.8 if level else signal_h * 0.3
            draw_box(
                ax,
                x + start * time_scale,
                row_y - h / 2,
                (end - start) * time_scale,
                h,
                "",
                fill_color=color,
            )


def draw_signal_waveform(ax, pattern, x, y, width=3, height=0.6, color=BLUE):
    """Draw single signal waveform from pattern string like '010110'."""
    for i, bit in enumerate(pattern):
        bit_h = height * 0.8 if bit == "1" else height * 0.2
        draw_box(
            ax,
            x + i * 0.5,
            y - bit_h / 2,
            0.5,
            bit_h,
            "",
            fill_color=color if bit == "1" else GRAY,
        )


def draw_pipeline_stage(
    ax, stage_name, x, y, width=2, height=1.5, stages_data=None, active_stage=None
):
    """Draw CPU pipeline stage visualization."""
    if stages_data:
        for i, stage in enumerate(stages_data):
            stage_x = x + i * (width + 0.3)
            is_active = (active_stage == i) if active_stage is not None else False
            fill = LIGHT_GREEN if is_active else WHITE
            draw_box(
                ax,
                stage_x,
                y,
                width,
                height,
                stage,
                fill_color=fill,
                border_color=GREEN if is_active else BLUE,
            )
    else:
        draw_box(
            ax,
            x,
            y,
            width,
            height,
            stage_name,
            fill_color=LIGHT_GREEN,
            border_color=GREEN,
        )


def draw_bus_diagram(ax, data_labels, x, y, width=4, direction="horizontal", size=None):
    """Draw data bus with multiple lines."""
    if size is None:
        size = int(DEFAULT_SIZE * 0.7)
    n = len(data_labels)
    if direction == "horizontal":
        for i, label in enumerate(data_labels):
            draw_arrow(ax, x, y - i * 0.5, x + width, y - i * 0.5, color=BLUE)
            ax.text(
                x + width + 0.2,
                y - i * 0.5,
                label,
                fontsize=size,
                ha="left",
                va="center",
                zorder=20,
            )
    else:
        for i, label in enumerate(data_labels):
            draw_arrow(ax, x - i * 0.5, y, x - i * 0.5, y + width, color=BLUE)
            ax.text(
                x - i * 0.5,
                y + width + 0.2,
                label,
                fontsize=size,
                ha="center",
                va="bottom",
                zorder=20,
            )


# =========================================================
#           CIRCUIT & ELECTRONICS (Category D)
# =========================================================




def draw_register_box(ax, x, y, name, bits=8, width=2, height=1, text_size=None):
    """Draw register block with name and bit width."""
    if text_size is None:
        text_size = int(DEFAULT_SIZE * 0.8)
    draw_box(
        ax,
        x,
        y - height / 2,
        width,
        height,
        name,
        text_size=text_size,
        fill_color=LIGHT_BLUE,
        border_color=BLUE,
    )
    ax.text(
        x + width / 2,
        y - height / 2 - 0.25,
        f"{bits}-bit",
        fontsize=int(text_size * 0.7),
        color=GRAY,
        ha="center",
        zorder=20,
    )






def draw_mux_demux(ax, x, y, num_inputs, num_outputs, mux=True, text_size=None):
    """Draw multiplexer (MUX) or demultiplexer (DEMUX)."""
    if text_size is None:
        text_size = int(DEFAULT_SIZE * 0.8)

    label = "MUX" if mux else "DEMUX"
    h = max(num_inputs, num_outputs) * 0.6 + 1
    draw_box(
        ax,
        x,
        y - h / 2,
        1.5,
        h,
        label,
        text_size=text_size,
        fill_color=LIGHT_BLUE,
        border_color=BLUE,
    )

    # Input/output lines
    if mux:
        for i in range(num_inputs):
            ax.plot(
                [x - 1, x],
                [y + (i - (num_inputs - 1) / 2) * 0.6, y],
                color=BLACK,
                linewidth=1.5,
                zorder=10,
            )
    else:
        for i in range(num_outputs):
            ax.plot(
                [x + 1.5, x + 2.5],
                [
                    y + (i - (num_outputs - 1) / 2) * 0.6,
                    y + (i - (num_outputs - 1) / 2) * 0.6,
                ],
                color=BLACK,
                linewidth=1.5,
                zorder=10,
            )


def draw_axis_line(ax, x1, y1, x2, y2, color=BLACK, linewidth=2, arrow="none"):
    """
    Draw simple axis line.

    Args:
        ax: matplotlib axes
        x1, y1: Start position
        x2, y2: End position
        color: Line color
        linewidth: Line width
        arrow: Arrow type ("none", "start", "end", "both")

    Returns:
        The plot line object
    """
    ax.plot([x1, x2], [y1, y2], color=color, linewidth=linewidth, zorder=2)


# =========================================================
#           ADVANCED TEXT FUNCTIONS
# =========================================================


def add_rotated_text(
    ax, x, y, text, angle=0, color=BLACK, size=None, ha="center", va="center"
):
    """
    Add rotated Arabic text.

    Args:
        ax: matplotlib axes
        x, y: Position
        text: Text to display
        angle: Rotation angle in degrees
        color: Text color
        size: Font size
        ha: Horizontal alignment
        va: Vertical alignment

    Returns:
        The text object
    """
    if size is None:
        size = DEFAULT_SIZE
    disp = handle_arabic(text)
    ax.text(
        x, y, disp, fontsize=size, color=color, rotation=angle, ha=ha, va=va, zorder=20
    )


def add_vertical_text(ax, x, y, text, color=BLACK, size=None):
    """
    Add vertical Arabic text (each character on new line).

    Args:
        ax: matplotlib axes
        x, y: Starting position
        text: Text to display
        color: Text color
        size: Font size

    Returns:
        List of text objects
    """
    if size is None:
        size = DEFAULT_SIZE
    disp = handle_arabic(text)
    chars = list(disp)
    text_objects = []
    for i, char in enumerate(chars):
        t = ax.text(
            x,
            y - i * 0.5,
            char,
            fontsize=size,
            color=color,
            ha="center",
            va="top",
            zorder=20,
        )
        text_objects.append(t)
    return text_objects


def add_text_with_bg(
    ax, x, y, text, bg_color=LIGHT_BLUE, text_color=BLACK, size=None, padding=0.2
):
    """
    Add text with background box.

    Args:
        ax: matplotlib axes
        x, y: Position
        text: Text to display
        bg_color: Background color
        text_color: Text color
        size: Font size
        padding: Padding around text

    Returns:
        The text object
    """
    if size is None:
        size = DEFAULT_SIZE

    disp = handle_arabic(text)
    font = get_font_prop(size)

    fig = ax.figure
    fig.canvas.draw()
    renderer = fig.canvas.get_renderer()
    t = ax.text(x, y, disp, fontproperties=font, alpha=0)
    bbox = t.get_window_extent(renderer)
    inv = ax.transData.inverted()
    p1 = inv.transform(bbox.p0)
    p2 = inv.transform(bbox.p1)
    w = p2[0] - p1[0]
    h = p2[1] - p1[1]
    t.remove()

    # Draw background
    bx = x - w / 2 - padding
    by = y - h / 2 - padding
    draw_box(
        ax,
        bx,
        by,
        w + padding * 2,
        h + padding * 2,
        "",
        fill_color=bg_color,
        rounded=False,
        linewidth=0,
    )

    # Draw text
    ax.text(
        x,
        y,
        disp,
        color=text_color,
        fontproperties=font,
        ha="center",
        va="center",
        zorder=20,
    )


def add_code_with_syntax(
    ax, x, y, code_lines, keywords=None, size=None, bg_color=LIGHT_BLUE
):
    """
    Add syntax-highlighted code block.

    Args:
        ax: matplotlib axes
        x, y: Top-left position
        code_lines: List of code strings
        keywords: List of keywords to highlight
        size: Font size
        bg_color: Background color

    Returns:
        The code block text objects
    """
    if keywords is None:
        keywords = ["if", "else", "for", "while", "return", "def", "class"]
    if size is None:
        size = int(DEFAULT_SIZE * 0.65)

    add_code_block(ax, x, y, code_lines, size=size, bg_color=bg_color)


# =========================================================
#           MATH & STATISTICS FUNCTIONS
# =========================================================


def draw_function_graph(
    ax,
    x_range=(-5, 5),
    func=None,
    points=100,
    color=BLUE,
    linewidth=2,
    show_axis=True,
    label="",
):
    """
    Plot a mathematical function curve.

    Args:
        ax: matplotlib axes
        x_range: Tuple of (min, max) x values
        func: Lambda function for y = f(x), e.g., lambda x: x**2
        points: Number of points to plot
        color: Line color
        linewidth: Line width
        show_axis: Whether to show x and y axes
        label: Label for the plot legend

    Returns:
        The line plot object
    """
    if func is None:
        func = lambda x: x

    x_vals = np.linspace(x_range[0], x_range[1], points)
    y_vals = func(x_vals)

    (line,) = ax.plot(
        x_vals,
        y_vals,
        color=color,
        linewidth=linewidth,
        label=label,
        zorder=10,
    )

    if show_axis:
        ax.axhline(y=0, color=BLACK, linewidth=1, zorder=5)
        ax.axvline(x=0, ymin=0, ymax=1, color=BLACK, linewidth=1, zorder=5)

    ax.spines["top"].set_visible(False)
    ax.spines["right"].set_visible(False)

    return line


def draw_histogram(
    ax,
    data,
    bins=10,
    x=0,
    y=0,
    bar_width=0.8,
    colors=None,
    labels=None,
):
    """
    Draw a histogram with bars.

    Args:
        ax: matplotlib axes
        data: List of values
        bins: Number of bins
        x, y: Bottom-left position offset
        bar_width: Width of bars (0-1 scale)
        colors: List of colors for bars
        labels: List of labels for each bin

    Returns:
        List of bar patch objects
    """
    if not data:
        return []

    hist, bin_edges = np.histogram(data, bins=bins)
    max_height = max(hist) if max(hist) > 0 else 1

    if colors is None:
        colors = [BLUE] * bins

    bars = []
    bin_centers = []

    for i in range(len(hist)):
        bar_x = i + x
        bar_h = hist[i]
        bar_h_scaled = (bar_h / max_height) * 3 if max_height > 0 else 0

        color = colors[i] if i < len(colors) else BLUE

        bar = patches.Rectangle(
            (bar_x + (1 - bar_width) / 2, y),
            bar_width,
            bar_h_scaled,
            facecolor=color,
            edgecolor=color,
            linewidth=1,
            zorder=5,
        )
        ax.add_patch(bar)
        bars.append(bar)
        bin_centers.append(bar_x + bar_width / 2)

        if labels and i < len(labels):
            label_text = str(labels[i])
            ax.text(
                bar_x + bar_width / 2,
                y + bar_h_scaled + 0.1,
                handle_arabic(label_text),
                color=BLACK,
                fontproperties=get_font_prop(int(DEFAULT_SIZE * 0.6)),
                ha="center",
                va="bottom",
                zorder=20,
            )

    return bars


def draw_boxplot(
    ax,
    data,
    x=0,
    y=0,
    width=3,
    height=2,
    color=BLUE,
    outliers=True,
):
    """
    Draw a box and whisker plot.

    Args:
        ax: matplotlib axes
        data: List of numerical values
        x, y: Bottom-left position
        width: Box width
        height: Box height
        color: Box color
        outliers: Whether to show outliers

    Returns:
        Dictionary with box, median_line, whiskers, outlier_points
    """
    if not data:
        return {}

    data_sorted = sorted(data)
    n = len(data_sorted)

    q1_idx = n // 4
    q2_idx = n // 2
    q3_idx = 3 * n // 4

    q1 = data_sorted[q1_idx]
    median = data_sorted[q2_idx]
    q3 = data_sorted[q3_idx]
    iqr = q3 - q1

    whisker_low = max(min(data_sorted), q1 - 1.5 * iqr)
    whisker_high = min(max(data_sorted), q3 + 1.5 * iqr)

    outlier_points = [v for v in data_sorted if v < whisker_low or v > whisker_high]
    whisker_data = [v for v in data_sorted if whisker_low <= v <= whisker_high]

    whisker_min = min(whisker_data) if whisker_data else whisker_low
    whisker_max = max(whisker_data) if whisker_data else whisker_high

    box_bottom = y
    box_top = y + height
    box_left = x
    box_right = x + width
    box_center = x + width / 2

    box = patches.Rectangle(
        (box_left, box_bottom),
        width,
        height,
        facecolor=LIGHT_BLUE,
        edgecolor=color,
        linewidth=2,
        zorder=10,
    )
    ax.add_patch(box)

    median_line = patches.Rectangle(
        (box_left, box_bottom + height / 2 - 0.05),
        width,
        0.1,
        facecolor=color,
        edgecolor=color,
        linewidth=0,
        zorder=15,
    )
    ax.add_patch(median_line)

    whisker_line_left = ax.plot(
        [box_center, box_center],
        [box_bottom, box_bottom + 0.3],
        color=color,
        linewidth=2,
        zorder=10,
    )[0]

    whisker_line_right = ax.plot(
        [box_center, box_center],
        [box_top - 0.3, box_top],
        color=color,
        linewidth=2,
        zorder=10,
    )[0]

    whisker_cap_low = ax.plot(
        [box_left + width * 0.3, box_right - width * 0.3],
        [box_bottom, box_bottom],
        color=color,
        linewidth=2,
        zorder=10,
    )[0]

    whisker_cap_high = ax.plot(
        [box_left + width * 0.3, box_right - width * 0.3],
        [box_top, box_top],
        color=color,
        linewidth=2,
        zorder=10,
    )[0]

    result = {
        "box": box,
        "median_line": median_line,
        "whiskers": [
            whisker_line_left,
            whisker_line_right,
            whisker_cap_low,
            whisker_cap_high,
        ],
    }

    if outliers and outlier_points:
        outlier_y = [box_bottom + height / 2] * len(outlier_points)
        outlier_x = [
            box_center + (np.random.rand() - 0.5) * width * 0.5 for _ in outlier_points
        ]
        outlier_scatter = ax.scatter(
            outlier_x,
            outlier_y,
            color=RED,
            s=30,
            marker="o",
            zorder=20,
            label="Outliers" if outliers else None,
        )
        result["outlier_points"] = outlier_scatter

    ax.set_xlim(x - 0.5, x + width + 0.5)
    ax.set_ylim(y - 0.5, y + height + 0.5)

    return result


def draw_scatter_plot(
    ax,
    x_data,
    y_data,
    x=0,
    y=0,
    point_color=BLUE,
    size=20,
    show_line=False,
    regression_params=None,
):
    """
    Draw a scatter plot with optional regression line.

    Args:
        ax: matplotlib axes
        x_data: List of x values
        y_data: List of y values
        x, y: Position offset
        point_color: Color of scatter points
        size: Point size
        show_line: Whether to draw regression line
        regression_params: Tuple (slope, intercept) for custom line

    Returns:
        Dictionary with scatter plot and optional line
    """
    if not x_data or not y_data:
        return {}

    x_shifted = [v + x for v in x_data]
    y_shifted = [v + y for v in y_data]

    scatter = ax.scatter(
        x_shifted,
        y_shifted,
        color=point_color,
        s=size,
        zorder=10,
        edgecolors=WHITE,
        linewidths=0.5,
    )

    result = {"scatter": scatter}

    if show_line:
        x_arr = np.array(x_data)
        y_arr = np.array(y_data)

        if regression_params:
            slope, intercept = regression_params
        else:
            n = len(x_arr)
            if n < 2:
                return result

            x_mean = np.mean(x_arr)
            y_mean = np.mean(y_arr)

            numerator = np.sum((x_arr - x_mean) * (y_arr - y_mean))
            denominator = np.sum((x_arr - x_mean) ** 2)

            if denominator == 0:
                slope = 0
            else:
                slope = numerator / denominator

            intercept = y_mean - slope * x_mean

        x_line = np.array([min(x_data), max(x_data)])
        y_line = slope * x_line + intercept

        y_line_shifted = [v + y for v in y_line]
        x_line_shifted = [v + x for v in x_line]

        line = ax.plot(
            x_line_shifted,
            y_line_shifted,
            color=RED,
            linewidth=2,
            linestyle="--",
            zorder=15,
            label=f"y = {slope:.2f}x + {intercept:.2f}",
        )
        result["line"] = line[0]

    ax.spines["top"].set_visible(False)
    ax.spines["right"].set_visible(False)

    return result


# =========================================================
#       CATEGORY: MATH & STATISTICS FUNCTIONS (A5-A7)
# =========================================================


def draw_normal_curve(
    ax,
    mu=0,
    sigma=1,
    x=0,
    y=0,
    width=6,
    height=3,
    color=BLUE,
    fill_alpha=0.3,
    show_parameters=True,
):
    """
    Draw a normal distribution bell curve.

    Args:
        ax: matplotlib axes
        mu: Mean of the normal distribution
        sigma: Standard deviation
        x, y: Position of the center of the curve
        width: Width of the curve in x-axis units
        height: Height scaling factor
        color: Curve color
        fill_alpha: Transparency of the filled area
        show_parameters: Whether to show mu and sigma labels

    Returns:
        Dictionary with curve line and fill patch
    """
    # Generate x values centered at mu
    x_min = mu - 4 * sigma
    x_max = mu + 4 * sigma
    x_vals = np.linspace(x_min, x_max, 200)

    # Calculate normal distribution (Gaussian)
    y_vals = (1 / (sigma * np.sqrt(2 * np.pi))) * np.exp(
        -0.5 * ((x_vals - mu) / sigma) ** 2
    )

    # Scale y values to fit desired height
    peak = 1 / (sigma * np.sqrt(2 * np.pi))
    y_scaled = y_vals * (height / peak)

    # Shift to position
    x_shifted = [v + x for v in x_vals]
    y_shifted = [v + y for v in y_scaled]

    # Draw the curve line
    line = ax.plot(
        x_shifted,
        y_shifted,
        color=color,
        linewidth=2.5,
        zorder=10,
    )

    # Fill under the curve
    fill = ax.fill_between(
        x_shifted,
        [y] * len(y_shifted),
        y_shifted,
        color=color,
        alpha=fill_alpha,
        zorder=5,
    )

    result = {"line": line[0], "fill": fill}

    # Show mu and sigma labels
    if show_parameters:
        # mu label at the peak
        ax.text(
            x + mu,
            y + height + 0.2,
            r"$\mu$",
            fontsize=DEFAULT_SIZE,
            ha="center",
            va="bottom",
            color=color,
            zorder=20,
        )

        # sigma label at the right side
        sigma_x = mu + sigma
        sigma_y = (1 / (sigma * np.sqrt(2 * np.pi))) * (height / peak) * np.exp(-0.5)
        ax.text(
            x + sigma_x,
            y + sigma_y + 0.1,
            r"$\sigma$",
            fontsize=int(DEFAULT_SIZE * 0.8),
            ha="center",
            va="bottom",
            color=color,
            zorder=20,
        )

    return result


def draw_vector_field(
    ax,
    x_range=(-3, 3),
    y_range=(-3, 3),
    u_func=None,
    v_func=None,
    spacing=0.5,
    color=GRAY,
    scale=0.3,
):
    """
    Draw a vector field with arrows.

    Args:
        ax: matplotlib axes
        x_range: Tuple (min, max) for x values
        y_range: Tuple (min, max) for y values
        u_func: Lambda function f(x, y) returning x-component of vector
        v_func: Lambda function f(x, y) returning y-component of vector
        spacing: Spacing between arrows
        color: Arrow color
        scale: Scaling factor for arrow length

    Returns:
        Dictionary with quiver object
    """
    # Generate grid points
    x_vals = np.arange(x_range[0], x_range[1] + spacing, spacing)
    y_vals = np.arange(y_range[0], y_range[1] + spacing, spacing)
    X, Y = np.meshgrid(x_vals, y_vals)

    # Calculate vector components
    if u_func is None:
        # Default: radial field pointing outward
        U = X
        V = Y
    else:
        U = np.array([[u_func(x, y) for x in x_vals] for y in y_vals])
        V = np.array([[v_func(x, y) for x in x_vals] for y in y_vals])

    # Normalize vectors for consistent arrow lengths
    magnitude = np.sqrt(U**2 + V**2)
    magnitude[magnitude == 0] = 1  # Avoid division by zero
    U_norm = U / magnitude * scale
    V_norm = V / magnitude * scale

    # Draw the vector field
    quiver = ax.quiver(
        X,
        Y,
        U_norm,
        V_norm,
        color=color,
        alpha=0.7,
        pivot="middle",
        headwidth=4,
        headlength=5,
        headaxislength=4,
        zorder=5,
    )

    return {"quiver": quiver}


def add_equation(ax, x, y, equation, size=None, color=BLACK):
    r"""
    Add a LaTeX equation using matplotlib's mathtext.

    Args:
        ax: matplotlib axes
        x, y: Position for the equation
        equation: LaTeX equation string (e.g., r"y = x^2 + \int f(x)\,dx")
        size: Font size (default: DEFAULT_SIZE)
        color: Text color

    Returns:
        The text object
    """
    if size is None:
        size = DEFAULT_SIZE

    text_obj = ax.text(
        x,
        y,
        f"${equation}$",
        fontsize=size,
        color=color,
        ha="center",
        va="center",
        zorder=20,
    )

    return text_obj


# =========================================================
#           ALGORITHM & CS VISUALIZATION (Category B)
# =========================================================


def draw_pseudocode_block(
    ax,
    x,
    y,
    lines,
    line_numbers=True,
    highlight_lines=None,
    size=None,
    bg_color=LIGHT_BLUE,
):
    """Draw algorithm pseudo-code block with optional line numbers and highlighting."""
    if size is None:
        size = int(DEFAULT_SIZE * 0.7)
    if highlight_lines is None:
        highlight_lines = []

    line_h = 0.5
    max_len = max(len(line) for line in lines)
    box_w = max_len * 0.18 + 0.8
    box_h = len(lines) * line_h + 0.4

    # Background
    draw_box(
        ax,
        x,
        y - box_h,
        box_w,
        box_h,
        "",
        fill_color=bg_color,
        rounded=True,
        linewidth=1,
    )

    # Lines
    for i, line in enumerate(lines):
        line_y = y - 0.3 - i * line_h

        # Line number
        if line_numbers:
            num_str = str(i + 1)
            ax.text(
                x + 0.2,
                line_y,
                num_str,
                fontsize=size * 0.8,
                color=GRAY,
                ha="left",
                va="top",
                zorder=20,
            )

        # Code
        disp = (
            handle_arabic(line)
            if any("\u0600" <= c <= "\u06ff" for c in line)
            else line
        )
        ax.text(
            x + 0.6,
            line_y,
            disp,
            fontsize=size,
            color=BLACK,
            ha="left",
            va="top",
            zorder=20,
        )


def draw_complexity_label(ax, x, y, complexity="O(n)", size=None, color=RED):
    """Draw Big-O complexity notation."""
    if size is None:
        size = int(DEFAULT_SIZE * 0.9)
    ax.text(
        x,
        y,
        f"${complexity}$",
        fontsize=size,
        color=color,
        ha="center",
        va="center",
        zorder=20,
    )


def draw_step_indicator(ax, step_num, x, y, size=None, active=True):
    """Draw algorithm step indicator (numbered circle)."""
    if size is None:
        size = int(DEFAULT_SIZE * 0.7)

    bg = GREEN if active else GRAY
    draw_circle(
        ax,
        x,
        y,
        0.4,
        str(step_num),
        text_color=WHITE,
        border_color=bg,
        fill_color=bg,
        text_size=size,
    )


def draw_state_diagram(
    ax, states, transitions, x=0, y=0, state_radius=0.8, text_size=None
):
    """Draw state machine diagram with states and transitions."""
    if text_size is None:
        text_size = int(DEFAULT_SIZE * 0.8)

    n = len(states)
    positions = []

    # Arrange states in a circle
    for i, state in enumerate(states):
        angle = 2 * np.pi * i / n - np.pi / 2
        cx = x + 4 * np.cos(angle)
        cy = y + 3 * np.sin(angle)
        positions.append((cx, cy))
        draw_circle(ax, cx, cy, state_radius, state, text_size=text_size)

    # Transitions
    for from_state, to_state, label in transitions:
        i = states.index(from_state)
        j = states.index(to_state)
        p1 = positions[i]
        p2 = positions[j]

        # Offset for self-loop
        if from_state == to_state:
            cx, cy = p1
            # Draw loop above
            loop_pts = [(cx, cy + 1.2), (cx - 0.3, cy + 1.8), (cx + 0.3, cy + 1.8)]
            ax.plot(
                [cx, cx + 0.4],
                [cy + state_radius, cy + 1.2],
                color=BLUE,
                linewidth=2,
                zorder=10,
            )
            if label:
                ax.text(
                    cx, cy + 2, label, fontsize=text_size * 0.8, ha="center", zorder=20
                )
        else:
            draw_arrow(ax, p1[0], p1[1], p2[0], p2[1], color=BLUE)
            if label:
                mid_x = (p1[0] + p2[0]) / 2
                mid_y = (p1[1] + p2[1]) / 2
                ax.text(
                    mid_x,
                    mid_y + 0.3,
                    label,
                    fontsize=text_size * 0.8,
                    ha="center",
                    zorder=20,
                )


def draw_transition_table(
    ax, states, inputs, transitions, x=0, y=0, cell_w=1.5, cell_h=0.6, size=None
):
    """Draw state transition table."""
    if size is None:
        size = int(DEFAULT_SIZE * 0.65)

    rows = len(states) + 1
    cols = len(inputs) + 1

    # Header row
    for j, inp in enumerate(inputs):
        draw_box(
            ax,
            x + j * cell_w,
            y,
            cell_w,
            cell_h,
            inp,
            text_size=size,
            fill_color=LIGHT_BLUE,
            border_color=BLUE,
        )

    # State column and cells
    for i, state in enumerate(states):
        row_y = y - (i + 1) * cell_h

        # State name
        draw_box(
            ax,
            x,
            row_y,
            cell_w,
            cell_h,
            state,
            text_size=size,
            fill_color=LIGHT_GREEN,
            border_color=GREEN,
        )

        # Transition cells
        for j, inp in enumerate(inputs):
            key = (state, inp)
            trans = transitions.get(key, "")
            draw_box(
                ax,
                x + (j + 1) * cell_w,
                row_y,
                cell_w,
                cell_h,
                str(trans),
                text_size=size,
            )


def draw_recursion_tree_enhanced(
    ax, nodes, x=0, y=0, level_gap=2, node_spacing=2, size=None
):
    """Draw enhanced recursion tree with detailed node information."""
    if size is None:
        size = int(DEFAULT_SIZE * 0.7)

    # nodes: list of (label, depth, x_offset) tuples
    for label, depth, x_off in nodes:
        node_y = y - depth * level_gap
        node_x = x + x_off
        draw_circle(ax, node_x, node_y, 0.6, label, text_size=size)

    # Connect parent to children (assuming nodes are ordered)
    for i in range(len(nodes) - 1):
        if nodes[i + 1][1] > nodes[i][1]:
            draw_arrow(
                ax,
                nodes[i][2],
                nodes[i][1] * -level_gap + y,
                nodes[i + 1][2],
                nodes[i + 1][1] * -level_gap + y,
            )


# =========================================================
#       CATEGORY B: ALGORITHM DIAGRAM FUNCTIONS
# =========================================================


def draw_state_diagram(
    ax,
    states,
    transitions,
    x=0,
    y=0,
    state_radius=0.8,
    text_size=None,
):
    """
    Draw a state machine diagram with states as circles and transitions as arrows.

    Args:
        ax: matplotlib axes
        states: List of state names (strings)
        transitions: List of tuples (from_state, to_state, label)
        x, y: Center position offset for the diagram
        state_radius: Radius of each state circle (default: 0.8)
        text_size: Font size (default: DEFAULT_SIZE * 0.8)

    Returns:
        Dictionary with state positions {state_name: (x, y)}
    """
    if text_size is None:
        text_size = DEFAULT_SIZE * 0.8

    n_states = len(states)
    if n_states == 0:
        return {}

    # Layout states in a circle
    state_positions = {}
    center_x = x
    center_y = y

    if n_states == 1:
        state_positions[states[0]] = (center_x, center_y)
    else:
        # Arrange states in a circle
        radius = max(2.5, n_states * 0.8)
        for i, state in enumerate(states):
            angle = 2 * np.pi * i / n_states - np.pi / 2
            sx = center_x + radius * np.cos(angle)
            sy = center_y + radius * np.sin(angle)
            state_positions[state] = (sx, sy)

    # Draw states (circles)
    for state, (sx, sy) in state_positions.items():
        # Determine if this is initial state (first in list)
        is_initial = state == states[0]
        initial_offset = -state_radius - 0.5

        # Draw initial state arrow if it's the first state
        if is_initial:
            ax.annotate(
                "",
                xy=(sx + initial_offset + state_radius, sy),
                xytext=(sx + initial_offset - 1, sy),
                arrowprops=dict(
                    arrowstyle="->", color=BLUE, lw=2, connectionstyle="arc3,rad=0"
                ),
                zorder=10,
            )

        # Draw state circle
        circle = patches.Circle(
            (sx, sy),
            state_radius,
            facecolor=WHITE,
            edgecolor=BLUE,
            linewidth=2,
            zorder=5,
        )
        ax.add_patch(circle)

        # Add state name
        disp = handle_arabic(state)
        ax.text(
            sx,
            sy,
            disp,
            color=BLACK,
            fontproperties=get_font_prop(text_size),
            ha="center",
            va="center",
            zorder=20,
        )

    # Draw transitions (arrows)
    for from_state, to_state, label in transitions:
        if from_state not in state_positions or to_state not in state_positions:
            continue

        start = state_positions[from_state]
        end = state_positions[to_state]

        # Calculate direction for arrow
        dx = end[0] - start[0]
        dy = end[1] - start[1]
        length = np.hypot(dx, dy)

        if length == 0:
            continue

        # Adjust start and end to be at circle edge
        offset = state_radius + 0.1
        start_x = start[0] + (dx / length) * offset
        start_y = start[1] + (dy / length) * offset
        end_x = end[0] - (dx / length) * offset
        end_y = end[1] - (dy / length) * offset

        # Check if it's a self-loop (same state)
        if from_state == to_state:
            # Draw a curved loop above the state
            loop_radius = state_radius * 0.8
            loop_center_x = start_x
            loop_center_y = start_y + loop_radius * 1.5

            # Draw arc for self-loop
            theta = np.linspace(-np.pi * 0.8, np.pi * 0.8, 50)
            loop_x = loop_center_x + loop_radius * np.cos(theta)
            loop_y = loop_center_y + loop_radius * np.sin(theta) * 0.5

            ax.plot(
                loop_x,
                loop_y,
                color=BLUE,
                linewidth=2,
                zorder=10,
            )

            # Arrow head
            arrow_idx = len(loop_x) // 2 + 5
            ax.annotate(
                "",
                xy=(loop_x[arrow_idx], loop_y[arrow_idx]),
                xytext=(loop_x[arrow_idx - 1], loop_y[arrow_idx - 1]),
                arrowprops=dict(arrowstyle="->", color=BLUE, lw=2),
                zorder=10,
            )

            # Label on self-loop
            label_x = start_x
            label_y = start_y + state_radius * 2.5
            disp = handle_arabic(label)
            ax.text(
                label_x,
                label_y,
                disp,
                color=BLACK,
                fontproperties=get_font_prop(int(text_size * 0.8)),
                ha="center",
                va="center",
                zorder=20,
                bbox=dict(facecolor=WHITE, edgecolor="none", alpha=0.8, pad=0.1),
            )
        else:
            # Check if we need to curve the arrow (multiple transitions between same states)
            # Use rad parameter to create slight curve
            rad = 0.15 if transitions.count((from_state, to_state, label)) > 1 else 0.0

            style = f"arc3,rad={rad}" if rad != 0 else "arc3,rad=0"

            ax.annotate(
                "",
                xy=(end_x, end_y),
                xytext=(start_x, start_y),
                arrowprops=dict(
                    arrowstyle="->",
                    color=BLUE,
                    lw=2,
                    connectionstyle=style,
                ),
                zorder=10,
            )

            # Add transition label
            mid_x = (start_x + end_x) / 2
            mid_y = (start_y + end_y) / 2

            # Offset label slightly perpendicular to the line
            offset_x = -dy / length * 0.3
            offset_y = dx / length * 0.3

            disp = handle_arabic(label)
            ax.text(
                mid_x + offset_x,
                mid_y + offset_y,
                disp,
                color=BLACK,
                fontproperties=get_font_prop(int(text_size * 0.8)),
                ha="center",
                va="center",
                zorder=20,
                bbox=dict(facecolor=WHITE, edgecolor="none", alpha=0.8, pad=0.1),
            )

    return state_positions


def draw_transition_table(
    ax,
    states,
    inputs,
    transitions,
    x=0,
    y=0,
    cell_w=1.5,
    cell_h=0.6,
    size=None,
):
    """
    Draw a state transition table.

    Args:
        ax: matplotlib axes
        states: List of state names (row labels)
        inputs: List of input names (column labels)
        transitions: Dictionary {(state, input): (next_state, output)}
        x, y: Top-left corner position
        cell_w: Cell width
        cell_h: Cell height
        size: Font size (default: DEFAULT_SIZE * 0.7)

    Returns:
        Dictionary with table dimensions
    """
    if size is None:
        size = DEFAULT_SIZE * 0.7

    n_cols = len(inputs) + 1  # +1 for state column
    n_rows = len(states) + 1  # +1 for header row

    # Calculate table dimensions
    table_w = n_cols * cell_w
    table_h = n_rows * cell_h

    # Draw border around table
    border = patches.Rectangle(
        (x - 0.1, y - table_h - 0.1),
        table_w + 0.2,
        table_h + 0.2,
        facecolor="none",
        edgecolor=BLUE,
        linewidth=2,
        zorder=4,
    )
    ax.add_patch(border)

    # Draw header row (first column: state, then inputs)
    # State column header
    draw_box(
        ax,
        x,
        y - cell_h,
        cell_w,
        cell_h,
        text="الحالة",
        text_color=WHITE,
        border_color=BLUE,
        fill_color=BLUE,
        text_size=size,
        rounded=False,
    )

    # Input column headers
    for j, input_name in enumerate(inputs):
        cx = x + (j + 1) * cell_w
        draw_box(
            ax,
            cx,
            y - cell_h,
            cell_w,
            cell_h,
            text=input_name,
            text_color=WHITE,
            border_color=BLUE,
            fill_color=BLUE,
            text_size=size,
            rounded=False,
        )

    # Draw data rows
    for i, state in enumerate(states):
        # State name in first column
        state_x = x
        state_y = y - (i + 2) * cell_h
        draw_box(
            ax,
            state_x,
            state_y,
            cell_w,
            cell_h,
            text=state,
            text_color=BLACK,
            border_color=BLUE,
            fill_color=LIGHT_BLUE,
            text_size=size,
            rounded=False,
        )

        # Transition cells for each input
        for j, input_name in enumerate(inputs):
            cell_x = x + (j + 1) * cell_w
            cell_y = y - (i + 2) * cell_h

            # Get transition from dict
            key = (state, input_name)
            if key in transitions:
                next_state, output = transitions[key]
                # Format as "next_state/output"
                cell_text = f"{next_state}/{output}"
            else:
                cell_text = "-"

            # Determine text color (English vs Arabic)
            is_english = all(ord(c) < 128 or c in " ./-" for c in str(cell_text))

            draw_box(
                ax,
                cell_x,
                cell_y,
                cell_w,
                cell_h,
                text=cell_text,
                text_color=GREEN if is_english else BLACK,
                border_color=BLUE,
                fill_color=WHITE,
                text_size=size,
                rounded=False,
            )

    return {"width": table_w, "height": table_h}


def draw_recursion_tree_enhanced(
    ax,
    nodes,
    x=0,
    y=0,
    level_gap=2,
    node_spacing=2,
    size=None,
):
    """
    Draw an enhanced recursion tree with detailed node information.

    Args:
        ax: matplotlib axes
        nodes: List of tuples (label, depth, position_info)
            - label: Node text/label
            - depth: Tree depth level (0 = root)
            - position_info: Dict with 'x', 'y', 'children', 'value' keys
        x, y: Root position offset
        level_gap: Vertical gap between levels (default: 2)
        node_spacing: Horizontal spacing between siblings (default: 2)
        size: Font size (default: DEFAULT_SIZE * 0.8)

    Returns:
        Dictionary with node positions {label: (x, y)}
    """
    if size is None:
        size = DEFAULT_SIZE * 0.8

    # Organize nodes by depth
    nodes_by_depth = {}
    for label, depth, pos_info in nodes:
        if depth not in nodes_by_depth:
            nodes_by_depth[depth] = []
        nodes_by_depth[depth].append((label, pos_info))

    # Calculate positions if not provided
    node_positions = {}
    max_depth = max(nodes_by_depth.keys()) if nodes_by_depth else 0

    # First pass: assign positions based on depth and index
    for depth in sorted(nodes_by_depth.keys()):
        depth_nodes = nodes_by_depth[depth]
        n_nodes = len(depth_nodes)

        # Calculate vertical position
        node_y = y + depth * level_gap

        # Calculate horizontal span
        total_width = (n_nodes - 1) * node_spacing
        start_x = x - total_width / 2

        for i, (label, pos_info) in enumerate(depth_nodes):
            # Use provided x position or calculate
            if "x" in pos_info:
                node_x = pos_info["x"]
            else:
                node_x = start_x + i * node_spacing

            node_positions[label] = (node_x, node_y)

    # Second pass: draw connections (edges)
    for label, depth, pos_info in nodes:
        if depth == 0:
            continue

        parent_label = pos_info.get("parent")
        if parent_label and parent_label in node_positions:
            start_pos = node_positions[parent_label]
            end_pos = node_positions[label]

            # Draw edge with slight curve
            mid_x = (start_pos[0] + end_pos[0]) / 2
            mid_y = (start_pos[1] + end_pos[1]) / 2

            # Determine edge style based on node properties
            edge_style = pos_info.get("edge_style", "solid")
            edge_color = pos_info.get("edge_color", BLUE)
            linewidth = pos_info.get("linewidth", 2)

            if edge_style == "dashed":
                ax.plot(
                    [start_pos[0], end_pos[0]],
                    [start_pos[1], end_pos[1]],
                    color=edge_color,
                    linewidth=linewidth,
                    linestyle="--",
                    zorder=3,
                )
            else:
                ax.plot(
                    [start_pos[0], end_pos[0]],
                    [start_pos[1], end_pos[1]],
                    color=edge_color,
                    linewidth=linewidth,
                    zorder=3,
                )

    # Third pass: draw nodes
    for label, depth, pos_info in nodes:
        node_x, node_y = node_positions[label]

        # Determine node style based on properties
        node_type = pos_info.get("type", "circle")
        node_color = pos_info.get("fill_color", WHITE)
        border_color = pos_info.get("border_color", BLUE)
        has_value = "value" in pos_info
        value = pos_info.get("value", "")

        if node_type == "circle":
            radius = pos_info.get("radius", 0.6)
            draw_circle(
                ax,
                node_x,
                node_y,
                radius,
                text=label,
                text_color=BLACK,
                border_color=border_color,
                fill_color=node_color,
                text_size=size,
            )

            # Draw value below node if present
            if has_value:
                ax.text(
                    node_x,
                    node_y - radius - 0.3,
                    str(value),
                    color=GRAY,
                    fontproperties=get_font_prop(int(size * 0.7)),
                    ha="center",
                    va="top",
                    zorder=20,
                )

        elif node_type == "box":
            w = pos_info.get("width", 2.0)
            h = pos_info.get("height", 1.0)
            draw_box(
                ax,
                node_x - w / 2,
                node_y - h / 2,
                w,
                h,
                text=label,
                text_color=BLACK,
                border_color=border_color,
                fill_color=node_color,
                text_size=size,
                rounded=True,
            )

            if has_value:
                ax.text(
                    node_x,
                    node_y - h / 2 - 0.3,
                    str(value),
                    color=GRAY,
                    fontproperties=get_font_prop(int(size * 0.7)),
                    ha="center",
                    va="top",
                    zorder=20,
                )

        elif node_type == "diamond":
            w = pos_info.get("width", 1.5)
            h = pos_info.get("height", 1.5)
            draw_diamond(
                ax,
                node_x,
                node_y,
                w,
                h,
                text=label,
                text_color=WHITE if node_color == BLUE else BLACK,
                border_color=border_color,
                fill_color=node_color,
                text_size=size,
            )

            if has_value:
                ax.text(
                    node_x,
                    node_y - h / 2 - 0.3,
                    str(value),
                    color=GRAY,
                    fontproperties=get_font_prop(int(size * 0.7)),
                    ha="center",
                    va="top",
                    zorder=20,
                )

        # Highlight special nodes
        if pos_info.get("highlight", False):
            highlight_color = pos_info.get("highlight_color", GREEN)
            highlight_radius = pos_info.get("radius", 0.6) + 0.15
            highlight = patches.Circle(
                (node_x, node_y),
                highlight_radius,
                facecolor="none",
                edgecolor=highlight_color,
                linewidth=3,
                zorder=4,
            )
            ax.add_patch(highlight)

    return node_positions


# =========================================================
#       CATEGORY C: TIMING & SIGNAL DIAGRAM FUNCTIONS
# =========================================================


def draw_timing_diagram(
    ax,
    signals,
    time_range=(0, 10),
    x=0,
    y=0,
    signal_h=0.8,
    time_scale=1,
):
    """
    Draw timing diagram with multiple signals.

    Args:
        ax: matplotlib axes
        signals: Dict {signal_name: [(start, end, level), ...]}
                 Each signal has high/low intervals where level is 1 (high) or 0 (low)
        time_range: Tuple (min_time, max_time)
        x, y: Starting position (bottom-left)
        signal_h: Height of each signal row
        time_scale: Time scaling factor

    Returns:
        Dictionary with signal positions {signal_name: y_position}
    """
    signal_names = list(signals.keys())
    n_signals = len(signal_names)

    # Calculate total height
    total_h = n_signals * signal_h + 1.5  # +1.5 for time axis

    # Draw time axis
    axis_y = y
    ax.plot(
        [x, x + (time_range[1] - time_range[0]) * time_scale],
        [axis_y, axis_y],
        color=BLACK,
        linewidth=1.5,
        zorder=5,
    )

    # Draw time ticks
    tick_interval = 1 * time_scale
    for t in np.arange(time_range[0], time_range[1] + 0.01, tick_interval):
        tick_x = x + t * time_scale
        ax.plot(
            [tick_x, tick_x],
            [axis_y - 0.1, axis_y + 0.1],
            color=BLACK,
            linewidth=1,
            zorder=5,
        )
        ax.text(
            tick_x,
            axis_y - 0.3,
            str(int(t)),
            fontsize=int(DEFAULT_SIZE * 0.6),
            ha="center",
            va="top",
            color=BLACK,
            zorder=20,
        )

    # Draw time axis label
    ax.text(
        x + (time_range[1] - time_range[0]) * time_scale / 2,
        axis_y - 0.6,
        "الوقت",
        fontsize=int(DEFAULT_SIZE * 0.7),
        ha="center",
        va="top",
        color=BLACK,
        zorder=20,
    )

    # Draw each signal
    signal_positions = {}

    for i, sig_name in enumerate(signal_names):
        sig_y = y + signal_h + i * signal_h

        # Draw signal name on the left
        ax.text(
            x - 0.5,
            sig_y + signal_h / 2,
            handle_arabic(sig_name),
            fontsize=int(DEFAULT_SIZE * 0.7),
            ha="right",
            va="center",
            color=BLACK,
            zorder=20,
        )

        signal_positions[sig_name] = sig_y

        # Draw signal baseline
        ax.plot(
            [x, x + (time_range[1] - time_range[0]) * time_scale],
            [sig_y, sig_y],
            color=GRAY,
            linewidth=0.5,
            linestyle="--",
            zorder=3,
        )

        # Draw high/low intervals
        intervals = signals[sig_name]
        for start, end, level in intervals:
            start_x = x + start * time_scale
            end_x = x + end * time_scale
            width = end_x - start_x

            if level == 1:
                # High level (filled rectangle)
                rect = patches.Rectangle(
                    (start_x, sig_y),
                    width,
                    signal_h * 0.8,
                    facecolor=BLUE,
                    edgecolor=BLUE,
                    linewidth=1,
                    zorder=4,
                )
            else:
                # Low level (outline only)
                rect = patches.Rectangle(
                    (start_x, sig_y),
                    width,
                    signal_h * 0.8,
                    facecolor="none",
                    edgecolor=BLUE,
                    linewidth=1.5,
                    zorder=4,
                )
            ax.add_patch(rect)

    return signal_positions


def draw_signal_waveform(
    ax,
    pattern,
    x,
    y,
    width=3,
    height=0.6,
    color=BLUE,
):
    """
    Draw single signal waveform.

    Args:
        ax: matplotlib axes
        pattern: String like "010110" or "10101010" (each char is 0 or 1)
        x, y: Starting position (bottom-left)
        width: Total width of the waveform
        height: Height of the signal (high level)
        color: Line/color for the waveform

    Returns:
        The polygon patch object
    """
    if not pattern:
        return None

    n_bits = len(pattern)
    bit_width = width / n_bits

    # Build waveform vertices
    vertices = []

    # Start point
    vertices.append((x, y))

    # First bit determines initial level
    if pattern[0] == "1":
        vertices.append((x, y + height))
    else:
        vertices.append((x, y))

    # Draw each bit transition
    for i in range(1, n_bits):
        prev_bit = pattern[i - 1]
        curr_bit = pattern[i]

        prev_x = x + (i - 1) * bit_width
        curr_x = x + i * bit_width

        if prev_bit == "1" and curr_bit == "1":
            vertices.append((curr_x, y + height))
        elif prev_bit == "0" and curr_bit == "0":
            vertices.append((curr_x, y))
        elif prev_bit == "0" and curr_bit == "1":
            vertices.append((prev_x, y + height))
            vertices.append((curr_x, y + height))
        elif prev_bit == "1" and curr_bit == "0":
            vertices.append((prev_x, y))
            vertices.append((curr_x, y))

    # Add final vertical transition to baseline
    last_bit = pattern[-1]
    if last_bit == "1":
        vertices.append((x + width, y))
    else:
        vertices.append((x + width, y + height))

    # Close the shape back to baseline
    vertices.append((x + width, y))
    vertices.append((x, y))

    # Draw filled waveform
    waveform = patches.Polygon(
        vertices,
        closed=True,
        facecolor=color,
        edgecolor=color,
        linewidth=1,
        alpha=0.8,
        zorder=5,
    )
    ax.add_patch(waveform)

    # Add bit labels below
    for i in range(n_bits):
        bit_x = x + (i + 0.5) * bit_width
        ax.text(
            bit_x,
            y - 0.2,
            pattern[i],
            fontsize=int(DEFAULT_SIZE * 0.5),
            ha="center",
            va="top",
            color=color,
            fontproperties=get_code_font_prop(int(DEFAULT_SIZE * 0.5)),
            zorder=20,
        )

    return waveform


def draw_pipeline_stage(
    ax,
    stage_name,
    x,
    y,
    width=2,
    height=1.5,
    stages_data=None,
    active_stage=None,
):
    """
    Draw CPU pipeline stage visualization.
    Show multiple pipeline stages horizontally.

    Args:
        ax: matplotlib axes
        stage_name: Name of this stage (e.g., "IF", "ID", "EX", "MEM", "WB")
        x, y: Center position of this stage
        width: Width of each stage box
        height: Height of each stage box
        stages_data: List of all stage names for drawing connected pipeline
        active_stage: Name of the currently active stage (to highlight)

    Returns:
        The stage box patch object
    """
    is_active = active_stage is not None and stage_name == active_stage

    if is_active:
        fill_color = LIGHT_BLUE
        border_color = BLUE
        text_color = BLACK
    else:
        fill_color = WHITE
        border_color = GRAY
        text_color = GRAY

    box = patches.FancyBboxPatch(
        (x - width / 2, y - height / 2),
        width,
        height,
        boxstyle="round,pad=0.05,rounding_size=0.15",
        facecolor=fill_color,
        edgecolor=border_color,
        linewidth=2 if is_active else 1.5,
        zorder=5,
    )
    ax.add_patch(box)

    disp = handle_arabic(stage_name)
    ax.text(
        x,
        y,
        disp,
        fontsize=int(DEFAULT_SIZE * 0.9),
        color=text_color,
        fontproperties=get_font_prop(int(DEFAULT_SIZE * 0.9)),
        ha="center",
        va="center",
        zorder=20,
    )

    if stages_data:
        stage_idx = stages_data.index(stage_name) if stage_name in stages_data else -1

        if stage_idx < len(stages_data) - 1:
            next_x = x + width + 0.3
            ax.annotate(
                "",
                xy=(next_x, y),
                xytext=(x + width / 2, y),
                arrowprops=dict(
                    arrowstyle="->",
                    color=GRAY,
                    lw=1.5,
                    connectionstyle="arc3,rad=0",
                ),
                zorder=10,
            )

        if stage_idx > 0:
            prev_x = x - width - 0.3
            ax.annotate(
                "",
                xy=(x - width / 2, y),
                xytext=(prev_x, y),
                arrowprops=dict(
                    arrowstyle="->",
                    color=GRAY,
                    lw=1.5,
                    connectionstyle="arc3,rad=0",
                ),
                zorder=10,
            )

    return box


def draw_bus_diagram(
    ax,
    data_labels,
    x,
    y,
    width=4,
    direction="horizontal",
    size=None,
):
    """
    Draw data bus with multiple lines.

    Args:
        ax: matplotlib axes
        data_labels: List of labels for each line
        x, y: Starting position (top-left corner)
        width: Total width of the bus
        direction: "horizontal" or "vertical"
        size: Font size (default: DEFAULT_SIZE * 0.7)

    Returns:
        Dictionary with line positions {label: position}
    """
    if size is None:
        size = int(DEFAULT_SIZE * 0.7)

    n_lines = len(data_labels)
    if n_lines == 0:
        return {}

    if direction == "horizontal":
        line_spacing = 0.5
        total_h = line_spacing * n_lines + 1
        bus_h = total_h

        ax.plot(
            [x, x + width],
            [y - bus_h / 2, y - bus_h / 2],
            color=BLUE,
            linewidth=2,
            zorder=5,
        )

        positions = {}
        for i, label in enumerate(data_labels):
            line_y = y - 0.5 - i * line_spacing
            branch_x = x + width / 2

            ax.plot(
                [branch_x, branch_x],
                [y - bus_h / 2, line_y],
                color=BLUE,
                linewidth=1.5,
                zorder=5,
            )

            label_x = x + width + 0.5
            ax.plot(
                [branch_x, label_x],
                [line_y, line_y],
                color=BLUE,
                linewidth=1.5,
                zorder=5,
            )

            ax.annotate(
                "",
                xy=(label_x + 0.1, line_y),
                xytext=(label_x - 0.1, line_y),
                arrowprops=dict(
                    arrowstyle="->",
                    color=BLUE,
                    lw=1.5,
                ),
                zorder=10,
            )

            disp = handle_arabic(str(label))
            ax.text(
                label_x + 0.3,
                line_y,
                disp,
                fontsize=size,
                color=BLACK,
                fontproperties=get_font_prop(size),
                ha="left",
                va="center",
                zorder=20,
            )

            positions[label] = (label_x, line_y)

        ax.text(
            x + width / 2,
            y - bus_h / 2 + 0.3,
            "الناقل",
            fontsize=int(size * 0.8),
            color=BLUE,
            fontproperties=get_font_prop(int(size * 0.8)),
            ha="center",
            va="bottom",
            zorder=20,
        )

    else:  # vertical
        line_spacing = 0.5
        total_w = line_spacing * n_lines + 1
        bus_w = total_w

        ax.plot(
            [x + bus_w / 2, x + bus_w / 2],
            [y, y - width],
            color=BLUE,
            linewidth=2,
            zorder=5,
        )

        positions = {}
        for i, label in enumerate(data_labels):
            line_x = x + 0.5 + i * line_spacing
            branch_y = y - width / 2

            ax.plot(
                [x + bus_w / 2, line_x],
                [branch_y, branch_y],
                color=BLUE,
                linewidth=1.5,
                zorder=5,
            )

            label_y = y - width - 0.5
            ax.plot(
                [line_x, line_x],
                [branch_y, label_y],
                color=BLUE,
                linewidth=1.5,
                zorder=5,
            )

            ax.annotate(
                "",
                xy=(line_x, label_y - 0.1),
                xytext=(line_x, label_y + 0.1),
                arrowprops=dict(
                    arrowstyle="->",
                    color=BLUE,
                    lw=1.5,
                ),
                zorder=10,
            )

            disp = handle_arabic(str(label))
            ax.text(
                line_x,
                label_y - 0.3,
                disp,
                fontsize=size,
                color=BLACK,
                fontproperties=get_font_prop(size),
                ha="center",
                va="top",
                zorder=20,
            )

            positions[label] = (line_x, label_y)

        ax.text(
            x + bus_w / 2 + 0.3,
            y - width / 2,
            "الناقل",
            fontsize=int(size * 0.8),
            color=BLUE,
            fontproperties=get_font_prop(int(size * 0.8)),
            ha="left",
            va="center",
            zorder=20,
        )

    return positions


# =========================================================
#           TIMING & SIGNAL DIAGRAMS (Category C)
# =========================================================


def draw_timing_diagram(
    ax, signals, time_range=(0, 10), x=0, y=0, signal_h=0.8, time_scale=1
):
    """Draw timing diagram with multiple signals."""
    for i, (name, levels) in enumerate(signals.items()):
        row_y = y - i * (signal_h + 0.4)
        # Signal name
        ax.text(
            x - 0.5,
            row_y,
            name,
            fontsize=DEFAULT_SIZE * 0.7,
            ha="right",
            va="center",
            zorder=20,
        )
        # Draw waveform segments
        for start, end, level in levels:
            color = BLUE if level else GRAY
            h = signal_h * 0.8 if level else signal_h * 0.3
            draw_box(
                ax,
                x + start * time_scale,
                row_y - h / 2,
                (end - start) * time_scale,
                h,
                "",
                fill_color=color,
            )


def draw_signal_waveform(ax, pattern, x, y, width=3, height=0.6, color=BLUE):
    """Draw single signal waveform from pattern string like '010110'."""
    for i, bit in enumerate(pattern):
        bit_h = height * 0.8 if bit == "1" else height * 0.2
        draw_box(
            ax,
            x + i * 0.5,
            y - bit_h / 2,
            0.5,
            bit_h,
            "",
            fill_color=color if bit == "1" else GRAY,
        )


def draw_pipeline_stage(
    ax, stage_name, x, y, width=2, height=1.5, stages_data=None, active_stage=None
):
    """Draw CPU pipeline stage visualization."""
    if stages_data:
        for i, stage in enumerate(stages_data):
            stage_x = x + i * (width + 0.3)
            is_active = (active_stage == i) if active_stage is not None else False
            fill = LIGHT_GREEN if is_active else WHITE
            draw_box(
                ax,
                stage_x,
                y,
                width,
                height,
                stage,
                fill_color=fill,
                border_color=GREEN if is_active else BLUE,
            )
    else:
        draw_box(
            ax,
            x,
            y,
            width,
            height,
            stage_name,
            fill_color=LIGHT_GREEN,
            border_color=GREEN,
        )


def draw_bus_diagram(ax, data_labels, x, y, width=4, direction="horizontal", size=None):
    """Draw data bus with multiple lines."""
    if size is None:
        size = int(DEFAULT_SIZE * 0.7)
    n = len(data_labels)
    if direction == "horizontal":
        for i, label in enumerate(data_labels):
            draw_arrow(ax, x, y - i * 0.5, x + width, y - i * 0.5, color=BLUE)
            ax.text(
                x + width + 0.2,
                y - i * 0.5,
                label,
                fontsize=size,
                ha="left",
                va="center",
                zorder=20,
            )
    else:
        for i, label in enumerate(data_labels):
            draw_arrow(ax, x - i * 0.5, y, x - i * 0.5, y + width, color=BLUE)
            ax.text(
                x - i * 0.5,
                y + width + 0.2,
                label,
                fontsize=size,
                ha="center",
                va="bottom",
                zorder=20,
            )


# =========================================================
#           CIRCUIT & ELECTRONICS (Category D)
# =========================================================




def draw_register_box(ax, x, y, name, bits=8, width=2, height=1, text_size=None):
    """Draw register block with name and bit width."""
    if text_size is None:
        text_size = int(DEFAULT_SIZE * 0.8)
    draw_box(
        ax,
        x,
        y - height / 2,
        width,
        height,
        name,
        text_size=text_size,
        fill_color=LIGHT_BLUE,
        border_color=BLUE,
    )
    ax.text(
        x + width / 2,
        y - height / 2 - 0.25,
        f"{bits}-bit",
        fontsize=int(text_size * 0.7),
        color=GRAY,
        ha="center",
        zorder=20,
    )






def draw_mux_demux(ax, x, y, num_inputs, num_outputs, mux=True, text_size=None):
    """Draw multiplexer (MUX) or demultiplexer (DEMUX)."""
    if text_size is None:
        text_size = int(DEFAULT_SIZE * 0.8)

    label = "MUX" if mux else "DEMUX"
    h = max(num_inputs, num_outputs) * 0.6 + 1
    draw_box(
        ax,
        x,
        y - h / 2,
        1.5,
        h,
        label,
        text_size=text_size,
        fill_color=LIGHT_BLUE,
        border_color=BLUE,
    )

    # Input/output lines
    if mux:
        for i in range(num_inputs):
            ax.plot(
                [x - 1, x],
                [y + (i - (num_inputs - 1) / 2) * 0.6, y],
                color=BLACK,
                linewidth=1.5,
                zorder=10,
            )
    else:
        for i in range(num_outputs):
            ax.plot(
                [x + 1.5, x + 2.5],
                [
                    y + (i - (num_outputs - 1) / 2) * 0.6,
                    y + (i - (num_outputs - 1) / 2) * 0.6,
                ],
                color=BLACK,
                linewidth=1.5,
                zorder=10,
            )


# =========================================================
#       CIRCUIT & ELECTRONICS FUNCTIONS (Category 7)
# =========================================================




def draw_register_box(ax, x, y, name, bits=8, width=2, height=1, text_size=None):
    """
    Draw a register block showing name and bit width.

    Args:
        ax: matplotlib axes
        x, y: Bottom-left corner position
        name: Register name (e.g., "PC", "IR", "ACC")
        bits: Bit width (default: 8)
        width: Box width (default: 2)
        height: Box height (default: 1)
        text_size: Font size (default: DEFAULT_SIZE)

    Returns:
        The box patch object
    """
    if text_size is None:
        text_size = DEFAULT_SIZE

    border_color = BLUE
    fill_color = LIGHT_BLUE

    box = patches.Rectangle(
        (x, y),
        width,
        height,
        facecolor=fill_color,
        edgecolor=border_color,
        linewidth=2,
        zorder=5,
    )
    ax.add_patch(box)

    ax.text(
        x + width / 2,
        y + height - 0.25,
        name,
        color=BLACK,
        fontproperties=get_font_prop(int(text_size * 0.9)),
        ha="center",
        va="center",
        zorder=20,
    )
    ax.text(
        x + width / 2,
        y + 0.25,
        f"{bits}-bit",
        color=GRAY,
        fontproperties=get_code_font_prop(int(text_size * 0.7)),
        ha="center",
        va="center",
        zorder=20,
    )

    line_y = y + height / 2
    ax.plot(
        [x + width, x + width + 0.3],
        [line_y, line_y],
        color=border_color,
        linewidth=2,
        zorder=5,
    )
    ax.plot([x - 0.3, x], [line_y, line_y], color=border_color, linewidth=2, zorder=5)

    return box




# =========================================================
#       CIRCUIT & ELECTRONICS FUNCTIONS (Category 7)
# =========================================================




def draw_register_box(ax, x, y, name, bits=8, width=2, height=1, text_size=None):
    if text_size is None:
        text_size = DEFAULT_SIZE
    border_color = BLUE
    fill_color = LIGHT_BLUE

    box = patches.Rectangle(
        (x, y),
        width,
        height,
        facecolor=fill_color,
        edgecolor=border_color,
        linewidth=2,
        zorder=5,
    )
    ax.add_patch(box)

    ax.text(
        x + width / 2,
        y + height - 0.25,
        name,
        color=BLACK,
        fontproperties=get_font_prop(int(text_size * 0.9)),
        ha="center",
        va="center",
        zorder=20,
    )
    ax.text(
        x + width / 2,
        y + 0.25,
        f"{bits}-bit",
        color=GRAY,
        fontproperties=get_code_font_prop(int(text_size * 0.7)),
        ha="center",
        va="center",
        zorder=20,
    )

    line_y = y + height / 2
    ax.plot(
        [x + width, x + width + 0.3],
        [line_y, line_y],
        color=border_color,
        linewidth=2,
        zorder=5,
    )
    ax.plot([x - 0.3, x], [line_y, line_y], color=border_color, linewidth=2, zorder=5)
    return box






def draw_mux_demux(ax, x, y, num_inputs, num_outputs, mux=True, text_size=None):
    if text_size is None:
        text_size = DEFAULT_SIZE
    border_color = BLUE
    fill_color = LIGHT_BLUE if mux else LIGHT_GREEN

    h = max(num_inputs, num_outputs) * 0.5 + 1.0
    w = 1.5

    if mux:
        vertices = [
            (x - w / 2, y + h / 2),
            (x + w / 2, y + h / 4),
            (x + w / 2, y - h / 4),
            (x - w / 2, y - h / 2),
        ]
        label_text = "MUX"
    else:
        vertices = [
            (x - w / 2, y + h / 4),
            (x + w / 2, y + h / 2),
            (x + w / 2, y - h / 2),
            (x - w / 2, y - h / 4),
        ]
        label_text = "DEMUX"

    shape = patches.Polygon(
        vertices,
        closed=True,
        facecolor=fill_color,
        edgecolor=border_color,
        linewidth=2,
        zorder=5,
    )
    ax.add_patch(shape)
    ax.text(
        x,
        y,
        label_text,
        color=BLACK,
        fontproperties=get_font_prop(int(text_size * 0.9)),
        ha="center",
        va="center",
        zorder=20,
    )

    line_color = border_color

    if mux:
        input_spacing = h / (num_inputs + 1)
        for i in range(num_inputs):
            line_y = y - h / 2 + (i + 1) * input_spacing
            ax.plot(
                [x - w / 2 - 0.4, x - w / 2 + 0.05],
                [line_y, line_y],
                color=line_color,
                linewidth=2,
                zorder=5,
            )
            ax.text(
                x - w / 2 - 0.6,
                line_y,
                f"I{i}",
                color=GRAY,
                fontproperties=get_code_font_prop(int(text_size * 0.6)),
                ha="center",
                va="center",
                zorder=20,
            )
        ax.plot(
            [x + w / 2 - 0.05, x + w / 2 + 0.4],
            [y, y],
            color=line_color,
            linewidth=2,
            zorder=5,
        )
        ax.text(
            x + w / 2 + 0.6,
            y,
            "Y",
            color=GRAY,
            fontproperties=get_code_font_prop(int(text_size * 0.6)),
            ha="center",
            va="center",
            zorder=20,
        )
        ax.plot(
            [x - 0.2, x + 0.2],
            [y - h / 2 - 0.15, y - h / 2 - 0.15],
            color=line_color,
            linewidth=1.5,
            zorder=5,
        )
        ax.text(
            x,
            y - h / 2 - 0.35,
            f"S:{int(np.ceil(np.log2(num_inputs)))}",
            color=GRAY,
            fontproperties=get_code_font_prop(int(text_size * 0.5)),
            ha="center",
            va="top",
            zorder=20,
        )
    else:
        ax.plot(
            [x - w / 2 - 0.4, x - w / 2 + 0.05],
            [y, y],
            color=line_color,
            linewidth=2,
            zorder=5,
        )
        ax.text(
            x - w / 2 - 0.6,
            y,
            "I",
            color=GRAY,
            fontproperties=get_code_font_prop(int(text_size * 0.6)),
            ha="center",
            va="center",
            zorder=20,
        )
        output_spacing = h / (num_outputs + 1)
        for i in range(num_outputs):
            line_y = y - h / 2 + (i + 1) * output_spacing
            ax.plot(
                [x + w / 2 - 0.05, x + w / 2 + 0.4],
                [line_y, line_y],
                color=line_color,
                linewidth=2,
                zorder=5,
            )
            ax.text(
                x + w / 2 + 0.6,
                line_y,
                f"Y{i}",
                color=GRAY,
                fontproperties=get_code_font_prop(int(text_size * 0.6)),
                ha="center",
                va="center",
                zorder=20,
            )
        ax.plot(
            [x - 0.2, x + 0.2],
            [y - h / 2 - 0.15, y - h / 2 - 0.15],
            color=line_color,
            linewidth=1.5,
            zorder=5,
        )
        ax.text(
            x,
            y - h / 2 - 0.35,
            f"S:{int(np.ceil(np.log2(num_outputs)))}",
            color=GRAY,
            fontproperties=get_code_font_prop(int(text_size * 0.5)),
            ha="center",
            va="top",
            zorder=20,
        )
    return shape


# =========================================================
#       CATEGORY E: UML SEQUENCE DIAGRAM FUNCTIONS
# =========================================================


def draw_sequence_fragment(
    ax,
    x,
    y,
    w,
    h,
    fragment_type="alt",
    label="",
    size=None,
    border_color=BLUE,
    fill_color=LIGHT_BLUE,
):
    """
    Draw a UML sequence diagram fragment (alt, loop, par).

    Args:
        ax: matplotlib axes
        x, y: Bottom-left corner position
        w, h: Width and height of the fragment
        fragment_type: Type of fragment - "alt" (alternatives), "loop", "par" (parallel)
        label: Optional label text (e.g., "alt", "loop", "par")
        size: Font size (default: DEFAULT_SIZE)
        border_color: Border color
        fill_color: Fill color

    Returns:
        The Polygon patch object
    """
    if size is None:
        size = DEFAULT_SIZE

    if fragment_type == "alt":
        # Alternatives: rectangle with dashed border and middle divider
        rect = patches.Rectangle(
            (x, y),
            w,
            h,
            facecolor=fill_color,
            edgecolor=border_color,
            linewidth=2,
            linestyle="--",
            zorder=5,
        )
        ax.add_patch(rect)

        # Middle divider line
        divider_y = y + h / 2
        ax.plot(
            [x, x + w],
            [divider_y, divider_y],
            color=border_color,
            linewidth=1.5,
            linestyle="-",
            zorder=6,
        )

        # "alt" label at top-left
        if label:
            disp = handle_arabic(label)
            ax.text(
                x + 0.3,
                y + h - 0.3,
                disp,
                color=border_color,
                fontproperties=get_font_prop(int(size * 0.8)),
                ha="left",
                va="top",
                zorder=20,
            )
        else:
            ax.text(
                x + 0.3,
                y + h - 0.3,
                "alt",
                color=border_color,
                fontproperties=get_font_prop(int(size * 0.8)),
                ha="left",
                va="top",
                zorder=20,
            )

    elif fragment_type == "loop":
        # Loop: rectangle with starred border (simulated with dashed)
        rect = patches.Rectangle(
            (x, y),
            w,
            h,
            facecolor=fill_color,
            edgecolor=border_color,
            linewidth=2,
            linestyle="--",
            zorder=5,
        )
        ax.add_patch(rect)

        # "loop" label at top-left
        label_text = label if label else "loop"
        disp = handle_arabic(label_text)
        ax.text(
            x + 0.3,
            y + h - 0.3,
            disp,
            color=border_color,
            fontproperties=get_font_prop(int(size * 0.8)),
            ha="left",
            va="top",
            zorder=20,
        )

    elif fragment_type == "par":
        # Parallel: rectangle with multiple dividers
        rect = patches.Rectangle(
            (x, y),
            w,
            h,
            facecolor=fill_color,
            edgecolor=border_color,
            linewidth=2,
            linestyle="--",
            zorder=5,
        )
        ax.add_patch(rect)

        # Two divider lines for parallel sections
        div1_y = y + h / 3
        div2_y = y + 2 * h / 3
        ax.plot(
            [x, x + w],
            [div1_y, div1_y],
            color=border_color,
            linewidth=1.5,
            zorder=6,
        )
        ax.plot(
            [x, x + w],
            [div2_y, div2_y],
            color=border_color,
            linewidth=1.5,
            zorder=6,
        )

        # "par" label at top-left
        label_text = label if label else "par"
        disp = handle_arabic(label_text)
        ax.text(
            x + 0.3,
            y + h - 0.3,
            disp,
            color=border_color,
            fontproperties=get_font_prop(int(size * 0.8)),
            ha="left",
            va="top",
            zorder=20,
        )

    else:
        # Generic fragment
        rect = patches.Rectangle(
            (x, y),
            w,
            h,
            facecolor=fill_color,
            edgecolor=border_color,
            linewidth=2,
            linestyle="--",
            zorder=5,
        )
        ax.add_patch(rect)

        if label:
            disp = handle_arabic(label)
            ax.text(
                x + 0.3,
                y + h - 0.3,
                disp,
                color=border_color,
                fontproperties=get_font_prop(int(size * 0.8)),
                ha="left",
                va="top",
                zorder=20,
            )

    return rect


def draw_activation_box(
    ax,
    x,
    y,
    w,
    h,
    color=LIGHT_GREEN,
    border_color=GREEN,
    linewidth=2,
):
    """
    Draw a UML sequence activation duration box.

    Args:
        ax: matplotlib axes
        x, y: Bottom-left corner position
        w, h: Width and height of the activation box
        color: Fill color (default: LIGHT_GREEN)
        border_color: Border color (default: GREEN)
        linewidth: Border width

    Returns:
        The Rectangle patch object
    """
    rect = patches.Rectangle(
        (x, y),
        w,
        h,
        facecolor=color,
        edgecolor=border_color,
        linewidth=linewidth,
        zorder=5,
    )
    ax.add_patch(rect)

    return rect


def draw_self_message(
    ax,
    x,
    y,
    label="",
    size=None,
    color=BLUE,
    arrow_size=0.15,
):
    """
    Draw a self-referential message in a sequence diagram.

    Args:
        ax: matplotlib axes
        x, y: Position (start and end point)
        label: Text label for the message
        size: Font size (default: DEFAULT_SIZE * 0.7)
        color: Arrow color (default: BLUE)
        arrow_size: Size of the arrow head

    Returns:
        Tuple of (arc line, text object)
    """
    if size is None:
        size = int(DEFAULT_SIZE * 0.7)

    # Draw curved arc for self-message
    arc_radius = 0.8

    # Arc path (curved loop going up and back down)
    theta = np.linspace(-np.pi * 0.8, np.pi * 0.8, 50)
    arc_x = x + arc_radius * np.cos(theta)
    arc_y = y + arc_radius * np.sin(theta) * 1.2 + arc_radius

    ax.plot(
        arc_x,
        arc_y,
        color=color,
        linewidth=2,
        zorder=10,
    )

    # Arrow head at the end of the arc
    arrow_idx = len(arc_x) // 2 + 5
    ax.annotate(
        "",
        xy=(arc_x[arrow_idx], arc_y[arrow_idx]),
        xytext=(arc_x[arrow_idx - 1], arc_y[arrow_idx - 1]),
        arrowprops=dict(
            arrowstyle=patches.ArrowStyle.Simple(
                tail_width=2 * 0.5,
                head_width=arrow_size,
            ),
            color=color,
            lw=2,
        ),
        zorder=10,
    )

    # Label text above the arc
    text_obj = None
    if label:
        disp = handle_arabic(label)
        text_obj = ax.text(
            x + arc_radius + 0.3,
            y + arc_radius * 1.5,
            disp,
            color=color,
            fontproperties=get_font_prop(size),
            ha="center",
            va="bottom",
            zorder=20,
            bbox=dict(
                facecolor=WHITE,
                edgecolor="none",
                alpha=0.8,
                pad=0.1,
            ),
        )

    return arc_x, text_obj


# =========================================================
#       CATEGORY F: PROCESS/OS DIAGRAM FUNCTIONS
# =========================================================


def draw_process_tree(
    ax,
    processes,
    x=0,
    y=0,
    size=None,
    node_radius=0.5,
    level_gap=2,
    sibling_gap=2,
    border_color=BLUE,
    fill_color=LIGHT_BLUE,
):
    """
    Draw a tree of processes (parent-child relationships).

    Args:
        ax: matplotlib axes
        processes: List of tuples (pid, parent_pid, name)
                   - pid: Process ID
                   - parent_pid: Parent PID (None for root)
                   - name: Display name
        x, y: Root position
        size: Font size (default: DEFAULT_SIZE * 0.8)
        node_radius: Radius of each process node
        level_gap: Vertical gap between tree levels
        sibling_gap: Horizontal gap between siblings
        border_color: Border color for nodes
        fill_color: Fill color for nodes

    Returns:
        Dictionary with node positions {pid: (x, y)}
    """
    if size is None:
        size = int(DEFAULT_SIZE * 0.8)

    # Build tree structure
    children_map = {}
    root = None

    for pid, parent_pid, name in processes:
        if parent_pid is None:
            root = pid
        else:
            if parent_pid not in children_map:
                children_map[parent_pid] = []
            children_map[parent_pid].append(pid)

    if root is None:
        return {}

    # Calculate positions using simple tree layout
    positions = {}
    subtree_widths = {}

    def get_subtree_width(pid):
        if pid not in children_map or not children_map[pid]:
            return 1
        width = 0
        for child in children_map[pid]:
            width += get_subtree_width(child)
        subtree_widths[pid] = width
        return width

    get_subtree_width(root)

    def position_nodes(pid, px, py, level_width):
        positions[pid] = (px, py)
        if pid in children_map:
            current_x = px - level_width / 2
            for child in children_map[pid]:
                child_width = subtree_widths[child] * sibling_gap
                child_x = current_x + child_width / 2
                position_nodes(child, child_x, py - level_gap, child_width)
                current_x += child_width

    # Calculate total tree width
    total_width = subtree_widths[root] * sibling_gap if root in subtree_widths else 1

    # Position root
    position_nodes(root, x, y, total_width)

    # Draw nodes and connections
    for pid, parent_pid, name in processes:
        if pid in positions:
            node_x, node_y = positions[pid]

            # Draw node (circle)
            circle = patches.Circle(
                (node_x, node_y),
                node_radius,
                facecolor=fill_color,
                edgecolor=border_color,
                linewidth=2,
                zorder=5,
            )
            ax.add_patch(circle)

            # Draw process ID/name
            disp = handle_arabic(str(name))
            ax.text(
                node_x,
                node_y,
                disp,
                color=BLACK,
                fontproperties=get_font_prop(size),
                ha="center",
                va="center",
                zorder=20,
            )

            # Draw connection to parent
            if parent_pid is not None and parent_pid in positions:
                parent_x, parent_y = positions[parent_pid]
                ax.plot(
                    [parent_x, node_x],
                    [parent_y - node_radius, node_y + node_radius],
                    color=border_color,
                    linewidth=1.5,
                    zorder=3,
                )

    return positions


def draw_memory_layout(
    ax,
    segments,
    x=0,
    y=0,
    size=None,
    cell_width=3,
    cell_height=1,
    border_color=BLUE,
):
    """
    Draw stack/heap/segment memory layout.

    Args:
        ax: matplotlib axes
        segments: List of tuples (name, size, memory_type)
                  - name: Segment name (e.g., "Stack", "Heap", "Code", "Data")
                  - size: Relative size (used for height)
                  - memory_type: Type for coloring ("stack", "heap", "code", "data", "free")
        x, y: Starting position (top-left)
        size: Font size (default: DEFAULT_SIZE * 0.8)
        cell_width: Width of each segment box
        cell_height: Height of each segment box
        border_color: Border color

    Returns:
        Dictionary with segment positions {name: (x, y, w, h)}
    """
    if size is None:
        size = int(DEFAULT_SIZE * 0.8)

    # Color mapping for memory types
    type_colors = {
        "stack": LIGHT_BLUE,
        "heap": LIGHT_GREEN,
        "code": LIGHT_RED,
        "data": "#FFF3E0",  # Light orange
        "free": "#F5F5F5",  # Light gray
    }

    positions = {}
    current_y = y

    # Calculate total height for vertical stacking (stack grows down)
    total_size = sum(seg[1] for seg in segments)
    if total_size == 0:
        total_size = 1

    for name, seg_size, mem_type in segments:
        # Calculate segment height based on relative size
        seg_h = (seg_size / total_size) * (len(segments) * cell_height)
        seg_h = max(seg_h, 0.5)  # Minimum height

        fill_color = type_colors.get(mem_type, WHITE)

        # Draw segment box
        rect = patches.Rectangle(
            (x, current_y - seg_h),
            cell_width,
            seg_h,
            facecolor=fill_color,
            edgecolor=border_color,
            linewidth=2,
            zorder=5,
        )
        ax.add_patch(rect)

        # Store position
        positions[name] = (x, current_y - seg_h, cell_width, seg_h)

        # Draw segment name and type
        ax.text(
            x + cell_width / 2,
            current_y - seg_h / 2,
            handle_arabic(name),
            color=BLACK,
            fontproperties=get_font_prop(size),
            ha="center",
            va="center",
            zorder=20,
        )

        # Add type label
        ax.text(
            x + cell_width / 2,
            current_y - seg_h / 2 - 0.25,
            mem_type,
            color=GRAY,
            fontproperties=get_code_font_prop(int(size * 0.7)),
            ha="center",
            va="top",
            zorder=20,
        )

        current_y -= seg_h

    return positions




def draw_thread_block(
    ax,
    x,
    y,
    thread_id,
    state="running",
    size=None,
    w=2.5,
    h=1.5,
    border_color=BLUE,
):
    """
    Draw a thread visualization block.

    Args:
        ax: matplotlib axes
        x, y: Bottom-left corner position
        thread_id: Thread ID or name
        state: Thread state - "running", "blocked", "ready", "terminated"
        size: Font size (default: DEFAULT_SIZE)
        w, h: Width and height of the thread block
        border_color: Border color

    Returns:
        The box patch object
    """
    if size is None:
        size = DEFAULT_SIZE

    # Color mapping for states
    state_colors = {
        "running": LIGHT_GREEN,
        "blocked": LIGHT_RED,
        "ready": LIGHT_BLUE,
        "terminated": "#F5F5F5",
    }

    state_border_colors = {
        "running": GREEN,
        "blocked": RED,
        "ready": BLUE,
        "terminated": GRAY,
    }

    fill_color = state_colors.get(state, WHITE)
    border = state_border_colors.get(state, border_color)

    # Draw thread block
    box = patches.Rectangle(
        (x, y),
        w,
        h,
        facecolor=fill_color,
        edgecolor=border,
        linewidth=2,
        zorder=5,
    )
    ax.add_patch(box)

    # Draw thread ID
    ax.text(
        x + w / 2,
        y + h / 2 + 0.15,
        f"TID: {thread_id}",
        color=BLACK,
        fontproperties=get_font_prop(int(size * 0.9)),
        ha="center",
        va="center",
        zorder=20,
    )

    # Draw state
    ax.text(
        x + w / 2,
        y + h / 2 - 0.35,
        state.upper(),
        color=border,
        fontproperties=get_code_font_prop(int(size * 0.7)),
        ha="center",
        va="center",
        zorder=20,
    )

    return box


# =========================================================
#       CATEGORY G: DATABASE DIAGRAM FUNCTIONS
# =========================================================


def draw_foreign_key_arrow(
    ax,
    p1,
    p2,
    label="FK",
    size=None,
    color=RED,
    arrow_size=0.15,
):
    """
    Draw a foreign key relationship line.

    Args:
        ax: matplotlib axes
        p1: (x, y) start point (foreign key column)
        p2: (x, y) end point (primary key referenced)
        label: Label text (default: "FK")
        size: Font size (default: DEFAULT_SIZE * 0.7)
        color: Arrow color (default: RED)
        arrow_size: Size of the arrow head

    Returns:
        The annotation object
    """
    if size is None:
        size = int(DEFAULT_SIZE * 0.7)

    # Draw arrow with dashed line
    arrow = ax.annotate(
        "",
        xy=p2,
        xytext=p1,
        arrowprops=dict(
            arrowstyle=patches.ArrowStyle.Simple(
                tail_width=1.5 * 0.5,
                head_width=arrow_size,
            ),
            color=color,
            lw=2,
            linestyle="--",
        ),
        zorder=10,
    )

    # Add FK label
    if label:
        mid_x = (p1[0] + p2[0]) / 2
        mid_y = (p1[1] + p2[1]) / 2
        disp = handle_arabic(label)
        ax.text(
            mid_x,
            mid_y + 0.3,
            disp,
            color=color,
            fontproperties=get_font_prop(size),
            ha="center",
            va="center",
            zorder=20,
            bbox=dict(
                facecolor=WHITE,
                edgecolor="none",
                alpha=0.8,
                pad=0.1,
            ),
        )

    return arrow


def draw_primary_key_indicator(
    ax,
    x,
    y,
    num_keys=1,
    size=None,
    color=BLUE,
):
    """
    Draw a primary key marker (key icon).

    Args:
        ax: matplotlib axes
        x, y: Center position
        num_keys: Number of key icons to draw
        size: Font size (default: DEFAULT_SIZE * 0.6)
        color: Key color (default: BLUE)

    Returns:
        List of key patch objects
    """
    if size is None:
        size = int(DEFAULT_SIZE * 0.6)

    key_patches = []

    for i in range(num_keys):
        offset_x = i * 0.3

        # Draw simplified key icon using shapes
        # Key head (circle)
        head = patches.Circle(
            (x + offset_x, y),
            0.15,
            facecolor="none",
            edgecolor=color,
            linewidth=1.5,
            zorder=5,
        )
        ax.add_patch(head)
        key_patches.append(head)

        # Key shaft (line)
        ax.plot(
            [x + offset_x + 0.15, x + offset_x + 0.45],
            [y, y],
            color=color,
            linewidth=1.5,
            zorder=5,
        )

        # Key teeth (small lines)
        ax.plot(
            [x + offset_x + 0.35, x + offset_x + 0.35],
            [y, y + 0.1],
            color=color,
            linewidth=1.5,
            zorder=5,
        )
        ax.plot(
            [x + offset_x + 0.42, x + offset_x + 0.42],
            [y, y + 0.07],
            color=color,
            linewidth=1.5,
            zorder=5,
        )

    return key_patches


def draw_view_box(
    ax,
    x,
    y,
    name,
    query="",
    size=None,
    w=4,
    h=2,
    border_color=BLUE,
    fill_color=LIGHT_BLUE,
):
    """
    Draw a SQL view definition box.

    Args:
        ax: matplotlib axes
        x, y: Bottom-left corner position
        name: View name
        query: SQL query string
        size: Font size (default: DEFAULT_SIZE)
        w, h: Width and height of the view box
        border_color: Border color
        fill_color: Fill color

    Returns:
        The box patch object
    """
    if size is None:
        size = DEFAULT_SIZE

    # Draw main view box (double border for view)
    outer_box = patches.Rectangle(
        (x, y),
        w,
        h,
        facecolor=fill_color,
        edgecolor=border_color,
        linewidth=2,
        zorder=5,
    )
    ax.add_patch(outer_box)

    inner_box = patches.Rectangle(
        (x + 0.15, y + 0.15),
        w - 0.3,
        h - 0.3,
        facecolor="none",
        edgecolor=border_color,
        linewidth=1,
        zorder=6,
    )
    ax.add_patch(inner_box)

    # View name at top
    ax.text(
        x + w / 2,
        y + h - 0.4,
        f"VIEW: {name}",
        color=BLUE,
        fontproperties=get_font_prop(int(size * 0.9)),
        ha="center",
        va="center",
        zorder=20,
    )

    # Query text
    if query:
        # Truncate query if too long
        query_lines = query.split("\n") if "\n" in query else [query]
        query_display = query_lines[0][:30]
        if len(query_lines[0]) > 30:
            query_display += "..."

        ax.text(
            x + w / 2,
            y + h / 2,
            query_display,
            color=BLACK,
            fontproperties=get_code_font_prop(int(size * 0.65)),
            ha="center",
            va="center",
            zorder=20,
        )

    return outer_box


# =========================================================
#       CATEGORY H: NETWORK DIAGRAM FUNCTIONS
# =========================================================


def draw_packet_header(
    ax,
    x,
    y,
    fields,
    size=None,
    cell_w=2,
    cell_h=0.6,
    border_color=BLUE,
    header_color=LIGHT_BLUE,
):
    """
    Draw a protocol header (TCP/IP style).

    Args:
        ax: matplotlib axes
        x, y: Top-left corner position
        fields: List of tuples (field_name, bit_width, value)
                - field_name: Name of the field
                - bit_width: Width in bits (for display)
                - value: Actual value (optional)
        size: Font size (default: DEFAULT_SIZE * 0.65)
        cell_w: Cell width
        cell_h: Cell height
        border_color: Border color
        header_color: Header fill color

    Returns:
        Dictionary with field positions {field_name: (x, y)}
    """
    if size is None:
        size = int(DEFAULT_SIZE * 0.65)

    positions = {}

    # Draw each field as a cell
    current_x = x

    for field_name, bit_width, value in fields:
        # Draw field box
        draw_box(
            ax,
            current_x,
            y - cell_h,
            cell_w,
            cell_h,
            text=field_name,
            text_size=size,
            border_color=border_color,
            fill_color=header_color
            if field_name in ["Source", "Dest", "Src Port", "Dst Port"]
            else WHITE,
            rounded=False,
        )

        # Draw bit width below
        ax.text(
            current_x + cell_w / 2,
            y - cell_h - 0.2,
            f"{bit_width} bits",
            color=GRAY,
            fontproperties=get_code_font_prop(int(size * 0.6)),
            ha="center",
            va="top",
            zorder=20,
        )

        # Store position
        positions[field_name] = (current_x, y - cell_h, cell_w, cell_h)

        current_x += cell_w

    return positions


def draw_protocol_stack(
    ax,
    layers,
    x=0,
    y=0,
    size=None,
    w=3,
    layer_h=1,
    border_color=BLUE,
):
    """
    Draw OSI/TCP-IP protocol stack with layers.

    Args:
        ax: matplotlib axes
        layers: List of layer names (e.g., ["Application", "Transport", "Network", "Link"])
                or tuples (name, protocol) for additional info
        x, y: Bottom-left corner position
        size: Font size (default: DEFAULT_SIZE)
        w: Width of each layer box
        layer_h: Height of each layer
        border_color: Border color

    Returns:
        Dictionary with layer positions {layer_name: (x, y)}
    """
    if size is None:
        size = DEFAULT_SIZE

    # Color gradient from top to bottom (application to physical)
    layer_colors = [
        "#E3F2FD",  # Application - light blue
        "#E8F5E9",  # Transport - light green
        "#FFF3E0",  # Network - light orange
        "#FCE4EC",  # Link - light pink
        "#F5F5F5",  # Physical - gray
    ]

    positions = {}
    current_y = y

    for i, layer in enumerate(layers):
        # Extract layer name
        if isinstance(layer, tuple):
            layer_name, protocol = layer
        else:
            layer_name = layer
            protocol = None

        # Get color from list or use default
        fill_color = (
            layer_colors[i % len(layer_colors)] if i < len(layer_colors) else WHITE
        )

        # Draw layer box
        rect = patches.Rectangle(
            (x, current_y),
            w,
            layer_h,
            facecolor=fill_color,
            edgecolor=border_color,
            linewidth=2,
            zorder=5,
        )
        ax.add_patch(rect)

        # Store position
        positions[layer_name] = (x, current_y, w, layer_h)

        # Draw layer name
        ax.text(
            x + w / 2,
            current_y + layer_h / 2 + 0.1,
            handle_arabic(layer_name),
            color=BLACK,
            fontproperties=get_font_prop(int(size * 0.9)),
            ha="center",
            va="center",
            zorder=20,
        )

        # Draw protocol if provided
        if protocol:
            ax.text(
                x + w / 2,
                current_y + layer_h / 2 - 0.35,
                protocol,
                color=GRAY,
                fontproperties=get_code_font_prop(int(size * 0.6)),
                ha="center",
                va="center",
                zorder=20,
            )

        current_y += layer_h

    # Draw arrows between layers to show communication
    layer_names = [layer[0] if isinstance(layer, tuple) else layer for layer in layers]
    for i in range(len(layer_names) - 1):
        layer_y = positions[layer_names[i]][1]
        next_layer_y = positions[layer_names[i + 1]][1]

        ax.annotate(
            "",
            xy=(x + w / 2, next_layer_y),
            xytext=(x + w / 2, layer_y),
            arrowprops=dict(
                arrowstyle="->",
                color=GRAY,
                lw=1,
                connectionstyle="arc3,rad=0",
            ),
            zorder=10,
        )

    return positions


def draw_network_timeline(
    ax,
    events,
    x=0,
    y=0,
    size=None,
    event_h=0.8,
    time_scale=1,
    border_color=BLUE,
):
    """
    Draw a network event timeline.

    Args:
        ax: matplotlib axes
        events: List of tuples (time, event_type, source, dest, description)
                - time: Timestamp
                - event_type: Type ("send", "receive", "ack", "timeout")
                - source: Source node
                - dest: Destination node
                - description: Event description
        x, y: Starting position (top-left)
        size: Font size (default: DEFAULT_SIZE * 0.65)
        event_h: Height of each event row
        time_scale: Time scaling factor
        border_color: Border color

    Returns:
        Dictionary with event positions {event_index: (x, y)}
    """
    if size is None:
        size = int(DEFAULT_SIZE * 0.65)

    # Event type colors
    event_colors = {
        "send": BLUE,
        "receive": GREEN,
        "ack": CYAN,
        "timeout": RED,
    }

    positions = {}

    # Draw timeline axis
    max_time = max(e[0] for e in events) if events else 10
    axis_length = max_time * time_scale + 2

    ax.plot(
        [x, x + axis_length],
        [y, y],
        color=GRAY,
        linewidth=1.5,
        zorder=5,
    )

    # Draw time markers
    for t in range(int(max_time) + 1):
        tick_x = x + t * time_scale
        ax.plot(
            [tick_x, tick_x],
            [y - 0.1, y + 0.1],
            color=GRAY,
            linewidth=1,
            zorder=5,
        )
        ax.text(
            tick_x,
            y - 0.3,
            f"t{t}",
            fontsize=int(size * 0.8),
            ha="center",
            va="top",
            color=GRAY,
            zorder=20,
        )

    # Draw each event
    for i, (time, event_type, source, dest, description) in enumerate(events):
        event_y = y - (i + 1) * (event_h + 0.3)
        event_x = x + time * time_scale

        # Draw event marker
        color = event_colors.get(event_type, BLUE)

        marker = patches.Circle(
            (event_x, event_y),
            0.15,
            facecolor=color,
            edgecolor=color,
            linewidth=1,
            zorder=10,
        )
        ax.add_patch(marker)

        # Draw vertical line to timeline
        ax.plot(
            [event_x, event_x],
            [y, event_y],
            color=color,
            linewidth=1,
            linestyle="--",
            alpha=0.5,
            zorder=3,
        )

        # Draw event description
        desc_text = f"{source} -> {dest}"
        ax.text(
            event_x + 0.5,
            event_y,
            desc_text,
            fontsize=size,
            color=BLACK,
            fontproperties=get_font_prop(size),
            ha="left",
            va="center",
            zorder=20,
        )

        # Store position
        positions[i] = (event_x, event_y)

    return positions
# =========================================================
#       CIRCUIT & ELECTRONICS FUNCTIONS (Category 7)
# =========================================================




def draw_register_box(ax, x, y, name, bits=8, width=2, height=1, text_size=None):
    if text_size is None:
        text_size = DEFAULT_SIZE
    border_color = BLUE
    fill_color = LIGHT_BLUE

    box = patches.Rectangle((x, y), width, height, facecolor=fill_color, edgecolor=border_color, linewidth=2, zorder=5)
    ax.add_patch(box)

    ax.text(x + width/2, y + height - 0.25, name, color=BLACK, fontproperties=get_font_prop(int(text_size * 0.9)), ha="center", va="center", zorder=20)
    ax.text(x + width/2, y + 0.25, f"{bits}-bit", color=GRAY, fontproperties=get_code_font_prop(int(text_size * 0.7)), ha="center", va="center", zorder=20)

    line_y = y + height/2
    ax.plot([x + width, x + width + 0.3], [line_y, line_y], color=border_color, linewidth=2, zorder=5)
    ax.plot([x - 0.3, x], [line_y, line_y], color=border_color, linewidth=2, zorder=5)
    return box






def draw_mux_demux(ax, x, y, num_inputs, num_outputs, mux=True, text_size=None):
    if text_size is None:
        text_size = DEFAULT_SIZE
    border_color = BLUE
    fill_color = LIGHT_BLUE if mux else LIGHT_GREEN

    h = max(num_inputs, num_outputs) * 0.5 + 1.0
    w = 1.5

    if mux:
        vertices = [(x - w/2, y + h/2), (x + w/2, y + h/4), (x + w/2, y - h/4), (x - w/2, y - h/2)]
        label_text = "MUX"
    else:
        vertices = [(x - w/2, y + h/4), (x + w/2, y + h/2), (x + w/2, y - h/2), (x - w/2, y - h/4)]
        label_text = "DEMUX"

    shape = patches.Polygon(vertices, closed=True, facecolor=fill_color, edgecolor=border_color, linewidth=2, zorder=5)
    ax.add_patch(shape)
    ax.text(x, y, label_text, color=BLACK, fontproperties=get_font_prop(int(text_size * 0.9)), ha="center", va="center", zorder=20)

    line_color = border_color

    if mux:
        input_spacing = h / (num_inputs + 1)
        for i in range(num_inputs):
            line_y = y - h/2 + (i + 1) * input_spacing
            ax.plot([x - w/2 - 0.4, x - w/2 + 0.05], [line_y, line_y], color=line_color, linewidth=2, zorder=5)
            ax.text(x - w/2 - 0.6, line_y, f"I{i}", color=GRAY, fontproperties=get_code_font_prop(int(text_size * 0.6)), ha="center", va="center", zorder=20)
        ax.plot([x + w/2 - 0.05, x + w/2 + 0.4], [y, y], color=line_color, linewidth=2, zorder=5)
        ax.text(x + w/2 + 0.6, y, "Y", color=GRAY, fontproperties=get_code_font_prop(int(text_size * 0.6)), ha="center", va="center", zorder=20)
        ax.plot([x - 0.2, x + 0.2], [y - h/2 - 0.15, y - h/2 - 0.15], color=line_color, linewidth=1.5, zorder=5)
        ax.text(x, y - h/2 - 0.35, f"S:{int(np.ceil(np.log2(num_inputs)))}", color=GRAY, fontproperties=get_code_font_prop(int(text_size * 0.5)), ha="center", va="top", zorder=20)
    else:
        ax.plot([x - w/2 - 0.4, x - w/2 + 0.05], [y, y], color=line_color, linewidth=2, zorder=5)
        ax.text(x - w/2 - 0.6, y, "I", color=GRAY, fontproperties=get_code_font_prop(int(text_size * 0.6)), ha="center", va="center", zorder=20)
        output_spacing = h / (num_outputs + 1)
        for i in range(num_outputs):
            line_y = y - h/2 + (i + 1) * output_spacing
            ax.plot([x + w/2 - 0.05, x + w/2 + 0.4], [line_y, line_y], color=line_color, linewidth=2, zorder=5)
            ax.text(x + w/2 + 0.6, line_y, f"Y{i}", color=GRAY, fontproperties=get_code_font_prop(int(text_size * 0.6)), ha="center", va="center", zorder=20)
        ax.plot([x - 0.2, x + 0.2], [y - h/2 - 0.15, y - h/2 - 0.15], color=line_color, linewidth=1.5, zorder=5)
        ax.text(x, y - h/2 - 0.35, f"S:{int(np.ceil(np.log2(num_outputs)))}", color=GRAY, fontproperties=get_code_font_prop(int(text_size * 0.5)), ha="center", va="top", zorder=20)
    return shape