import matplotlib.patches as patches
import numpy as np

from src.draw_engine.core import BLACK, BLUE, WHITE, DEFAULT_SIZE, get_font_prop
from src.draw_engine.text import handle_arabic

def draw_cloud(ax, x, y, width=3, height=2, text="", text_color=BLACK, fill_color=WHITE, border_color=BLUE, linewidth=2, text_size=None):
    if text_size is None:
        text_size = DEFAULT_SIZE
    
    # A simple cloud made of an ellipse and some circles around it
    cloud = patches.Ellipse((x, y), width*0.8, height*0.6, facecolor=fill_color, edgecolor=fill_color, zorder=4)
    ax.add_patch(cloud)
    
    # Add border circles
    c1 = patches.Circle((x - width*0.2, y + height*0.15), width*0.2, facecolor=fill_color, edgecolor=border_color, linewidth=linewidth, zorder=3)
    c2 = patches.Circle((x + width*0.15, y + height*0.2), width*0.25, facecolor=fill_color, edgecolor=border_color, linewidth=linewidth, zorder=3)
    c3 = patches.Circle((x - width*0.3, y - height*0.1), width*0.15, facecolor=fill_color, edgecolor=border_color, linewidth=linewidth, zorder=3)
    c4 = patches.Circle((x + width*0.25, y - height*0.15), width*0.2, facecolor=fill_color, edgecolor=border_color, linewidth=linewidth, zorder=3)
    c5 = patches.Circle((x, y - height*0.2), width*0.25, facecolor=fill_color, edgecolor=border_color, linewidth=linewidth, zorder=3)
    
    for c in [c1, c2, c3, c4, c5]:
        ax.add_patch(c)
        
    # Re-add central ellipse with border to hide inner lines
    cloud_inner = patches.Ellipse((x, y), width*0.8, height*0.6, facecolor=fill_color, edgecolor='none', zorder=4)
    ax.add_patch(cloud_inner)
    
    if text:
        disp = handle_arabic(text)
        ax.text(x, y, disp, color=text_color, fontproperties=get_font_prop(text_size), ha="center", va="center", zorder=20)
        
    return {
        "patch": cloud,
        "center": (x, y),
        "ports": {
            "top": (x, y + height*0.45),
            "bottom": (x, y - height*0.45),
            "left": (x - width*0.4, y),
            "right": (x + width*0.4, y)
        }
    }

def draw_router(ax, x, y, size=1.5, text="Router", text_color=BLACK, fill_color=WHITE, border_color=BLUE, linewidth=2, text_size=None):
    if text_size is None:
        text_size = DEFAULT_SIZE * 0.8
        
    r = size / 2
    circle = patches.Circle((x, y), r, facecolor=fill_color, edgecolor=border_color, linewidth=linewidth, zorder=5)
    ax.add_patch(circle)
    
    # Router arrows (typically 4 arrows pointing inward/outward)
    arrow_len = r * 0.6
    ax.arrow(x - arrow_len, y, arrow_len*0.8, 0, head_width=0.1, head_length=0.1, fc=border_color, ec=border_color, zorder=6)
    ax.arrow(x + arrow_len, y, -arrow_len*0.8, 0, head_width=0.1, head_length=0.1, fc=border_color, ec=border_color, zorder=6)
    ax.arrow(x, y - arrow_len, 0, arrow_len*0.8, head_width=0.1, head_length=0.1, fc=border_color, ec=border_color, zorder=6)
    ax.arrow(x, y + arrow_len, 0, -arrow_len*0.8, head_width=0.1, head_length=0.1, fc=border_color, ec=border_color, zorder=6)
    
    if text:
        disp = handle_arabic(text)
        ax.text(x, y - r - 0.3, disp, color=text_color, fontproperties=get_font_prop(text_size), ha="center", va="top", zorder=20)
        
    return {
        "patch": circle,
        "center": (x, y),
        "ports": {
            "top": (x, y + r),
            "bottom": (x, y - r),
            "left": (x - r, y),
            "right": (x + r, y)
        }
    }

def draw_switch(ax, x, y, width=2, height=1, text="Switch", text_color=BLACK, fill_color=WHITE, border_color=BLUE, linewidth=2, text_size=None):
    if text_size is None:
        text_size = DEFAULT_SIZE * 0.8
        
    box = patches.Rectangle((x - width/2, y - height/2), width, height, facecolor=fill_color, edgecolor=border_color, linewidth=linewidth, zorder=5)
    ax.add_patch(box)
    
    # Switch arrows (typically two opposing parallel arrows)
    arrow_len = width * 0.3
    ax.arrow(x - arrow_len/2, y + height*0.15, arrow_len, 0, head_width=0.1, head_length=0.1, fc=border_color, ec=border_color, zorder=6)
    ax.arrow(x + arrow_len/2, y - height*0.15, -arrow_len, 0, head_width=0.1, head_length=0.1, fc=border_color, ec=border_color, zorder=6)
    
    if text:
        disp = handle_arabic(text)
        ax.text(x, y - height/2 - 0.3, disp, color=text_color, fontproperties=get_font_prop(text_size), ha="center", va="top", zorder=20)
        
    return {
        "patch": box,
        "center": (x, y),
        "ports": {
            "top": (x, y + height/2),
            "bottom": (x, y - height/2),
            "left": (x - width/2, y),
            "right": (x + width/2, y)
        }
    }

def draw_server(ax, x, y, width=1.2, height=2, text="Server", text_color=BLACK, fill_color=WHITE, border_color=BLUE, linewidth=2, text_size=None):
    if text_size is None:
        text_size = DEFAULT_SIZE * 0.8
        
    box = patches.Rectangle((x - width/2, y - height/2), width, height, facecolor=fill_color, edgecolor=border_color, linewidth=linewidth, zorder=5)
    ax.add_patch(box)
    
    # Server drive bays
    for i in range(3):
        bay_y = y + height/4 - i * (height/4)
        ax.plot([x - width*0.4, x + width*0.4], [bay_y, bay_y], color=border_color, linewidth=1, zorder=6)
    
    if text:
        disp = handle_arabic(text)
        ax.text(x, y - height/2 - 0.3, disp, color=text_color, fontproperties=get_font_prop(text_size), ha="center", va="top", zorder=20)
        
    return {
        "patch": box,
        "center": (x, y),
        "ports": {
            "top": (x, y + height/2),
            "bottom": (x, y - height/2),
            "left": (x - width/2, y),
            "right": (x + width/2, y)
        }
    }


def draw_firewall(ax, x, y, width=1, height=1.5, text="Firewall", text_color=BLACK, fill_color=WHITE, border_color=BLUE, linewidth=2, text_size=None):
    if text_size is None:
        text_size = DEFAULT_SIZE * 0.8
        
    # Draw brick wall pattern
    wall = patches.Rectangle((x - width/2, y - height/2), width, height, facecolor=fill_color, edgecolor=border_color, linewidth=linewidth, zorder=5)
    ax.add_patch(wall)
    
    brick_h = height / 5
    for i in range(1, 5):
        line_y = y - height/2 + i * brick_h
        ax.plot([x - width/2, x + width/2], [line_y, line_y], color=border_color, linewidth=1, zorder=6)
        
        # Vertical brick lines
        offset = (width / 3) if i % 2 == 0 else 0
        for j in range(3):
            line_x = x - width/2 + j * (width/2) + offset
            if x - width/2 < line_x < x + width/2:
                ax.plot([line_x, line_x], [line_y - brick_h, line_y], color=border_color, linewidth=1, zorder=6)
    
    if text:
        disp = handle_arabic(text)
        ax.text(x, y - height/2 - 0.3, disp, color=text_color, fontproperties=get_font_prop(text_size), ha="center", va="top", zorder=20)
        
    return {
        "patch": wall,
        "center": (x, y),
        "ports": {
            "top": (x, y + height/2),
            "bottom": (x, y - height/2),
            "left": (x - width/2, y),
            "right": (x + width/2, y)
        }
    }

def draw_wireless_signal(ax, x, y, radius=0.5, arcs=3, color=BLUE, linewidth=2):
    """Draw a wifi/wireless broadcast signal arc."""
    for i in range(1, arcs + 1):
        arc_r = radius * (i / arcs)
        arc = patches.Arc((x, y), arc_r*2, arc_r*2, angle=0, theta1=45, theta2=135, color=color, linewidth=linewidth, zorder=5)
        ax.add_patch(arc)
    
    # Dot at origin
    dot = patches.Circle((x, y), radius*0.1, facecolor=color, edgecolor=color, zorder=5)
    ax.add_patch(dot)

    return {
        "center": (x, y),
        "radius": radius
    }

def draw_queue_node(ax, x, y, servers=1, q_len=4, width=1.5, height=1, text="Queue", text_color=BLACK, fill_color=WHITE, border_color=BLUE, linewidth=2, text_size=None):
    """Draw a queuing theory node (e.g. M/M/1, M/M/c)"""
    if text_size is None:
        text_size = DEFAULT_SIZE * 0.8
        
    # Queue lines (wait line)
    q_x_start = x - width
    ax.plot([q_x_start, x], [y + height/2, y + height/2], color=border_color, linewidth=linewidth, zorder=5)
    ax.plot([q_x_start, x], [y - height/2, y - height/2], color=border_color, linewidth=linewidth, zorder=5)
    
    # Customer dividers in queue
    for i in range(1, q_len):
        div_x = x - (i * width/q_len)
        ax.plot([div_x, div_x], [y - height/2, y + height/2], color=border_color, linewidth=linewidth/2, zorder=5)

    # Server circles
    server_r = height * 0.4
    server_centers = []
    
    if servers == 1:
        c = patches.Circle((x + server_r*1.5, y), server_r, facecolor=fill_color, edgecolor=border_color, linewidth=linewidth, zorder=5)
        ax.add_patch(c)
        server_centers.append((x + server_r*1.5, y))
    else:
        for i in range(servers):
            sy = y + height/2 - (i * height/(servers-1)) if servers > 1 else y
            c = patches.Circle((x + server_r*1.5, sy), server_r*0.6, facecolor=fill_color, edgecolor=border_color, linewidth=linewidth, zorder=5)
            ax.add_patch(c)
            server_centers.append((x + server_r*1.5, sy))
            
    if text:
        disp = handle_arabic(text)
        ax.text(x, y - height/2 - 0.4, disp, color=text_color, fontproperties=get_font_prop(text_size), ha="center", va="top", zorder=20)
        
    return {
        "center": (x, y),
        "servers": server_centers,
        "ports": {
            "in": (q_x_start, y),
            "out": (x + server_r*3, y)
        }
    }
