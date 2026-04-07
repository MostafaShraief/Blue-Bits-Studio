import matplotlib.patches as patches
from src.draw_engine.core import DEFAULT_SIZE, BLACK, BLUE, WHITE, get_font_prop
from src.draw_engine.text import handle_arabic

def draw_box(
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
    rounded=True,
    linewidth=2,
    zorder_box=5,
    zorder_text=20,
):
    """
    Draw a rectangle (rounded or sharp corners) with centered text.
    
    Args:
        ax: matplotlib axes
        x, y: Bottom-left corner position
        w, h: Width and height
        text: Text to display
        text_color: Text color
        border_color: Border color
        fill_color: Fill color
        text_size: Font size
        rounded: Use rounded corners
        linewidth: Border width
        
    Returns:
        tuple: (patch, (xmin, ymin, xmax, ymax))
    """
    if text_size is None:
        text_size = DEFAULT_SIZE

    if rounded:
        box = patches.FancyBboxPatch(
            (x, y),
            w,
            h,
            boxstyle="round,pad=0.1",
            facecolor=fill_color,
            edgecolor=border_color,
            linewidth=linewidth,
            zorder=zorder_box,
        )
    else:
        box = patches.Rectangle(
            (x, y),
            w,
            h,
            facecolor=fill_color,
            edgecolor=border_color,
            linewidth=linewidth,
            zorder=zorder_box,
        )
    ax.add_patch(box)

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
            zorder=zorder_text,
        )

    return (box, (x, y, x + w, y + h))


def draw_circle(
    ax,
    x,
    y,
    r,
    text="",
    text_color=BLACK,
    border_color=BLUE,
    fill_color=WHITE,
    text_size=None,
    linewidth=2,
):
    """
    Draw a circle with centered text.
    
    Args:
        ax: matplotlib axes
        x, y: Center position
        r: Radius
        text: Text to display
        
    Returns:
        tuple: (patch, (xmin, ymin, xmax, ymax))
    """
    if text_size is None:
        text_size = DEFAULT_SIZE * 0.8

    circle = patches.Circle(
        (x, y),
        r,
        facecolor=fill_color,
        edgecolor=border_color,
        linewidth=linewidth,
        zorder=5,
    )
    ax.add_patch(circle)

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

    return (circle, (x - r, y - r, x + r, y + r))


def draw_diamond(
    ax,
    x,
    y,
    w,
    h,
    text="",
    text_color=WHITE,
    border_color=BLUE,
    fill_color=BLUE,
    text_size=None,
    linewidth=2,
):
    """
    Draw a diamond shape.
    
    Args:
        ax: matplotlib axes
        x, y: Center position
        w, h: Width and height of the diamond
        
    Returns:
        tuple: (patch, (xmin, ymin, xmax, ymax))
    """
    if text_size is None:
        text_size = DEFAULT_SIZE * 0.8

    diamond = patches.Polygon(
        [(x, y + h / 2), (x + w / 2, y), (x, y - h / 2), (x - w / 2, y)],
        closed=True,
        facecolor=fill_color,
        edgecolor=border_color,
        linewidth=linewidth,
        zorder=5,
    )
    ax.add_patch(diamond)

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

    return (diamond, (x - w / 2, y - h / 2, x + w / 2, y + h / 2))
