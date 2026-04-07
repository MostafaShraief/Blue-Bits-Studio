import matplotlib.pyplot as plt
import matplotlib.patches as patches
import numpy as np
from src.draw_engine.core import *
from src.draw_engine.text import *
from src.draw_engine.shapes.primitives import *
from src.draw_engine.connectors.arrows import *
from src.draw_engine.connectors.routing import *

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




