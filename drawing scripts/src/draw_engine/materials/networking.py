import matplotlib.pyplot as plt
import matplotlib.patches as patches
import numpy as np
from src.draw_engine.core import *
from src.draw_engine.text import *
from src.draw_engine.shapes.primitives import *
from src.draw_engine.connectors.arrows import *
from src.draw_engine.connectors.routing import *

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


