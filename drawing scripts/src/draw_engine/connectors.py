import numpy as np
import matplotlib.patches as patches
from src.draw_engine.core import DEFAULT_SIZE, BLUE, BLACK, GRAY, get_font_prop
from src.draw_engine.text import handle_arabic

def get_intersection(bbox, target):
    """
    Get the point on the edge of a bounding box towards a target point.
    
    Args:
        bbox: (xmin, ymin, xmax, ymax)
        target: (x, y) target point
    Returns:
        (x, y) intersection point
    """
    xmin, ymin, xmax, ymax = bbox
    cx, cy = (xmin + xmax) / 2, (ymin + ymax) / 2
    tx, ty = target
    
    dx, dy = tx - cx, ty - cy
    if dx == 0 and dy == 0:
        return cx, cy
        
    w, h = xmax - xmin, ymax - ymin
    
    scale_x = abs(w / (2 * dx)) if dx != 0 else float('inf')
    scale_y = abs(h / (2 * dy)) if dy != 0 else float('inf')
    
    scale = min(scale_x, scale_y)
    return cx + dx * scale, cy + dy * scale

def get_box_center(bbox):
    return (bbox[0] + bbox[2]) / 2, (bbox[1] + bbox[3]) / 2

def draw_smart_arrow(
    ax,
    bbox1,
    bbox2,
    text="",
    text_color=BLACK,
    arrow_color=BLUE,
    text_size=None,
    linewidth=2,
    rad=0.0,
    text_offset=(0, 0.3),
):
    """
    Draw a smart arrow connecting two bounding boxes automatically linking their edges.
    """
    if text_size is None:
        text_size = DEFAULT_SIZE * 0.7

    c1 = get_box_center(bbox1)
    c2 = get_box_center(bbox2)
    
    start = get_intersection(bbox1, c2)
    end = get_intersection(bbox2, c1)

    style = f"arc3,rad={rad}" if rad != 0 else "arc3,rad=0"

    annotation = ax.annotate(
        "",
        xy=end,
        xytext=start,
        arrowprops=dict(
            arrowstyle="->", color=arrow_color, lw=linewidth, connectionstyle=style
        ),
        zorder=10,
    )

    if text:
        mid_x = (start[0] + end[0]) / 2 + text_offset[0]
        mid_y = (start[1] + end[1]) / 2 + text_offset[1]
        disp = handle_arabic(text)
        ax.text(
            mid_x,
            mid_y,
            disp,
            color=text_color,
            fontproperties=get_font_prop(text_size),
            ha="center",
            va="center",
            zorder=20,
        )

    return annotation
