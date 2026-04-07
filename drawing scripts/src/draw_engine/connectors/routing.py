import numpy as np
from src.draw_engine.connectors.arrows import draw_arrow, draw_line

def draw_smart_connection(
    ax,
    shape_bounds_a,
    shape_bounds_b,
    style="elbow",
    text="",
    color="#0072BD",
    linewidth=2,
    margin=0.2,
    direction_pref=None,
):
    """
    Draw a smart connection between two bounding boxes.
    
    Args:
        ax: Matplotlib axes
        shape_bounds_a: (xmin, ymin, xmax, ymax) for shape A
        shape_bounds_b: (xmin, ymin, xmax, ymax) for shape B
        style: 'elbow' (orthogonal) or 'straight'
        text: Optional label
        color: Line color
        linewidth: Line width
        margin: Distance to pad from shape boundary
        direction_pref: Preferred exit direction from A ('top', 'bottom', 'left', 'right')
        
    Returns:
        Drawn annotation/line object
    """
    xa1, ya1, xa2, ya2 = shape_bounds_a
    xb1, yb1, xb2, yb2 = shape_bounds_b
    
    ca = ((xa1 + xa2) / 2, (ya1 + ya2) / 2)
    cb = ((xb1 + xb2) / 2, (yb1 + yb2) / 2)
    
    if style == "straight":
        # Connect centers
        return draw_arrow(ax, ca, cb, text=text, arrow_color=color, linewidth=linewidth)
        
    elif style == "elbow":
        # Simplified orthogonal routing: go out from A horizontally, then vertical, then horizontal to B
        # Start at right edge of A if B is to the right
        if cb[0] > ca[0]:
            p1 = (xa2, ca[1])
            p4 = (xb1, cb[1])
        else:
            p1 = (xa1, ca[1])
            p4 = (xb2, cb[1])
            
        mid_x = (p1[0] + p4[0]) / 2
        p2 = (mid_x, p1[1])
        p3 = (mid_x, p4[1])
        
        draw_line(ax, p1, p2, color=color, linewidth=linewidth)
        draw_line(ax, p2, p3, color=color, linewidth=linewidth)
        draw_arrow(ax, p3, p4, text=text, arrow_color=color, linewidth=linewidth)
        
        return None
