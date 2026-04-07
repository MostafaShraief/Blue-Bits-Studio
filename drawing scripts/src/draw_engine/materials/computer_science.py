import matplotlib.patches as patches
import numpy as np
from ..core import DEFAULT_SIZE, BLACK, BLUE, WHITE, GRAY, LIGHT_GREEN, LIGHT_RED, LIGHT_BLUE, get_font_prop, get_code_font_prop
from ..shapes.primitives import draw_box, draw_circle

def draw_array(
    ax,
    x,
    y,
    elements,
    cell_w=1.2,
    cell_h=0.8,
    border_color=BLUE,
    fill_color=WHITE,
    text_color=BLACK,
    text_size=None,
    highlight_indices=None,
    highlight_color=LIGHT_GREEN
):
    """
    Draw a contiguous array/list of elements.
    
    Returns:
        (patch, (xmin, ymin, xmax, ymax), anchors)
    """
    if text_size is None:
        text_size = DEFAULT_SIZE
    if highlight_indices is None:
        highlight_indices = []
        
    num_elements = len(elements)
    w = num_elements * cell_w
    h = cell_h
    
    anchors = {}
    main_patch = None
    
    for i, el in enumerate(elements):
        cx = x + i * cell_w
        cy = y
        bg = highlight_color if i in highlight_indices else fill_color
        
        # draw_box handles drawing but we need the patch to be the whole array outline, 
        # so we just draw individual cells.
        box, bbox = draw_box(
            ax, cx, cy, cell_w, cell_h, text=str(el),
            text_color=text_color, border_color=border_color, fill_color=bg,
            text_size=text_size, rounded=False
        )
        
        if i == 0:
            main_patch = box
            
        anchors[f"top_{i}"] = (cx + cell_w/2, cy + cell_h)
        anchors[f"bottom_{i}"] = (cx + cell_w/2, cy)
        anchors[f"center_{i}"] = (cx + cell_w/2, cy + cell_h/2)

    xmin = x
    ymin = y
    xmax = x + w
    ymax = y + h
    
    anchors["left"] = (xmin, ymin + h/2)
    anchors["right"] = (xmax, ymin + h/2)
    anchors["top"] = (xmin + w/2, ymax)
    anchors["bottom"] = (xmin + w/2, ymin)
    
    return main_patch, (xmin, ymin, xmax, ymax), anchors

def draw_tree_node(
    ax,
    x,
    y,
    r,
    text,
    border_color=BLUE,
    fill_color=WHITE,
    text_color=BLACK,
    text_size=None,
    highlight=False
):
    """
    Draw a graph/tree node.
    """
    if text_size is None:
        text_size = DEFAULT_SIZE
        
    bg = LIGHT_GREEN if highlight else fill_color
    circle, bbox = draw_circle(
        ax, x, y, r, text=str(text),
        text_color=text_color, border_color=border_color, fill_color=bg,
        text_size=text_size
    )
    
    # Aliases
    anchors = {
        "top": (x, y + r),
        "bottom": (x, y - r),
        "left": (x - r, y),
        "right": (x + r, y)
    }
    
    return circle, bbox, anchors

def draw_page_table(
    ax,
    x,
    y,
    entries,
    cell_w=2.5,
    cell_h=0.7,
    border_color=BLUE,
    text_size=None
):
    """
    Draw an OS page table.
    entries: List of tuples (vpn, ppn, valid_flag, permissions)
    """
    if text_size is None:
        text_size = int(DEFAULT_SIZE * 0.7)
        
    # Draw header
    headers = ["VPN", "PPN", "Valid", "Flags"]
    num_cols = len(headers)
    w = num_cols * cell_w
    h = (len(entries) + 1) * cell_h
    
    anchors = {}
    main_patch = None
    
    # Draw Headers
    for j, h_text in enumerate(headers):
        hx = x + j * cell_w
        hy = y
        box, bbox = draw_box(
            ax, hx, hy, cell_w, cell_h, text=h_text,
            fill_color=GRAY, border_color=border_color, text_size=text_size, rounded=False
        )
        if j == 0: main_patch = box
        
    # Draw Entries
    for i, entry in enumerate(entries):
        ey = y - (i + 1) * cell_h
        for j, val in enumerate(entry):
            ex = x + j * cell_w
            # valid bits often colored
            bg = WHITE
            if j == 2:
                bg = LIGHT_GREEN if str(val).lower() in ["1", "true", "v", "yes"] else LIGHT_RED
            
            draw_box(
                ax, ex, ey, cell_w, cell_h, text=str(val),
                fill_color=bg, border_color=border_color, text_size=text_size, rounded=False
            )
            anchors[f"row{i}_col{j}"] = (ex + cell_w/2, ey + cell_h/2)
            
    xmin = x
    ymin = y - len(entries) * cell_h
    xmax = x + w
    ymax = y + cell_h
    
    anchors["left"] = (xmin, (ymin+ymax)/2)
    anchors["right"] = (xmax, (ymin+ymax)/2)
    anchors["top"] = (xmin + w/2, ymax)
    anchors["bottom"] = (xmin + w/2, ymin)
    
    return main_patch, (xmin, ymin, xmax, ymax), anchors
    
def draw_scheduling_queue(
    ax,
    x,
    y,
    processes,
    queue_name="Ready Queue",
    cell_w=1.5,
    cell_h=0.8,
    border_color=BLUE,
    text_size=None
):
    """
    Draw an OS scheduling queue with its name and process cells.
    processes: List of PIDs or names.
    """
    if text_size is None:
        text_size = DEFAULT_SIZE
        
    ax.text(x, y + cell_h + 0.2, queue_name, color=BLACK, fontproperties=get_font_prop(text_size), ha="left")
    
    if not processes:
        box, bbox = draw_box(
            ax, x, y, cell_w*2, cell_h, text="Empty",
            fill_color=GRAY, border_color=border_color, text_size=text_size, rounded=False
        )
        anchors = {"left": (x, y+cell_h/2), "right": (x+cell_w*2, y+cell_h/2)}
        return box, bbox, anchors
        
    return draw_array(
        ax, x, y, processes, cell_w=cell_w, cell_h=cell_h,
        border_color=border_color, text_size=text_size
    )
