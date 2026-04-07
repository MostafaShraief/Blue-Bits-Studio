import matplotlib.font_manager as fm
import matplotlib.patches as patches
import numpy as np

from src.draw_engine.core import CODE_FONT, DEFAULT_SIZE, BLACK, BLUE, GRAY, LIGHT_BLUE, RED, get_font_prop
from src.draw_engine.text.arabic_support import handle_arabic

def draw_text(ax, x, y, text, size=DEFAULT_SIZE, color=BLACK, ha="center", va="center", weight="normal", **kwargs):
    """Draw properly shaped Arabic text or standard English text."""
    is_code = kwargs.pop('is_code', False)
    
    if is_code:
        # Use code font, skip Arabic reshaping
        font_prop = fm.FontProperties(family=CODE_FONT, size=size, weight=weight)
        display_text = text
    else:
        # Default text (assumed potentially Arabic)
        font_prop = get_font_prop(size=size)
        font_prop.set_weight(weight)
        display_text = handle_arabic(text)
    
    return ax.text(
        x, y, display_text,
        fontsize=size,
        color=color,
        ha=ha,
        va=va,
        fontproperties=font_prop,
        **kwargs
    )

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
    draw_text(ax, 0, y, text, color=color, size=size)


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
    draw_text(ax, 0, y, text, color=color, size=size)


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

    draw_text(ax, x, y, text, color=color, size=size, ha=ha, va=va)


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
        draw_text(ax, x + 1.3, cy, title, color=BLUE, size=size)
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
        draw_text(ax, x + 1.3, cy, text, color=BLACK, size=size, ha="left")
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
    draw_text(ax, 0, y, text, color=color, size=size)


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
    draw_text(
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
    draw_text(ax, 0, 0, text, color=BLUE, size=size)
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
        draw_text(
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
            draw_text(
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

        draw_text(
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
    draw_text(
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
        draw_text(ax, x + 0.6, num_y, item, color=BLACK, size=size, ha="left")


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
    if size is None:
        size = DEFAULT_SIZE
    draw_text(ax, x, y, text, color=color, size=size, ha="left")

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


add_text = draw_text
add_text = draw_text
