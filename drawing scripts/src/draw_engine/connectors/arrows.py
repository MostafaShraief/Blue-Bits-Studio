import matplotlib.patches as patches
import numpy as np

from src.draw_engine.core import BLACK, BLUE, DEFAULT_SIZE, get_font_prop
from src.draw_engine.text.arabic_support import handle_arabic

def draw_arrow(
    ax,
    start,
    end,
    text="",
    text_color=BLACK,
    arrow_color=BLUE,
    text_size=None,
    linewidth=2,
    rad=0.0,
    text_offset=(0, 0.3),
):
    """
    Draw an arrow between two points with optional label.
    """
    if text_size is None:
        text_size = DEFAULT_SIZE * 0.7

    style = f"arc3,rad={rad}" if rad != 0 else "arc3,rad=0"

    annotation = ax.annotate(
        "",
        xy=end,
        xytext=start,
        arrowprops=dict(
            arrowstyle="->", color=arrow_color, lw=linewidth, connectionstyle=style
        ),
    )

    if text:
        disp = handle_arabic(text)
        mid_x = (start[0] + end[0]) / 2 + text_offset[0]
        mid_y = (start[1] + end[1]) / 2 + text_offset[1]
        
        if rad != 0:
            # Approximate curve midpoint adjustment
            dx = end[0] - start[0]
            dy = end[1] - start[1]
            nx = -dy
            ny = dx
            mag = np.sqrt(nx**2 + ny**2)
            if mag > 0:
                nx /= mag
                ny /= mag
            mid_x += nx * rad * 2
            mid_y += ny * rad * 2

        ax.text(
            mid_x,
            mid_y,
            disp,
            color=text_color,
            fontproperties=get_font_prop(text_size),
            ha="center",
            va="center",
        )

    return annotation

def draw_line(
    ax,
    start,
    end,
    color=BLUE,
    linewidth=2,
    style="-",
):
    """
    Draw a straight line between two points.
    """
    line, = ax.plot([start[0], end[0]], [start[1], end[1]], color=color, linewidth=linewidth, linestyle=style, zorder=4)
    return line

def draw_bezier(
    ax,
    start,
    end,
    cp1,
    cp2,
    color=BLUE,
    linewidth=2,
    arrow=False,
):
    """
    Draw a cubic Bezier curve.
    """
    from matplotlib.path import Path
    
    verts = [start, cp1, cp2, end]
    codes = [Path.MOVETO, Path.CURVE4, Path.CURVE4, Path.CURVE4]
    
    path = Path(verts, codes)
    patch = patches.PathPatch(path, facecolor='none', lw=linewidth, edgecolor=color, zorder=4)
    ax.add_patch(patch)
    
    if arrow:
        # Draw small arrow head at the end
        pass # basic implementation for now
        
    return patch

def draw_bracket(
    ax,
    p1,
    p2,
    text="",
    direction="right",
    text_color=BLACK,
    bracket_color=BLUE,
    text_size=None,
    width=0.5,
):
    """
    Draw an architectural bracket / curly brace.
    """
    if text_size is None:
        text_size = DEFAULT_SIZE * 0.7
        
    # Simplified implementation
    ax.plot([p1[0], p2[0]], [p1[1], p2[1]], color=bracket_color, zorder=4)
    
    return None
