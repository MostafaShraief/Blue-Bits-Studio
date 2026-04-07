import numpy as np
import matplotlib.patches as patches
import matplotlib.pyplot as plt
from src.draw_engine.core import DEFAULT_SIZE, BLACK, BLUE, WHITE, GRAY, RED, get_font_prop
from src.draw_engine.shapes.primitives import draw_circle, draw_box
from src.draw_engine.connectors.lines import draw_line, draw_arrow

def draw_neural_network(ax, x, y, layers, radius=0.4, layer_gap=2.5, node_gap=1.2, fill_color=WHITE, border_color=BLUE):
    """
    Draw a neural network architecture.
    layers: list of integers [input_nodes, hidden_1, ..., output_nodes]
    Returns: a dict mapping (layer_idx, node_idx) to (nx, ny) coordinates.
    """
    positions = {}
    max_nodes = max(layers)
    max_height = max_nodes * node_gap
    
    for i, num_nodes in enumerate(layers):
        layer_x = x + i * layer_gap
        # Center the nodes vertically
        start_y = y + (num_nodes - 1) * node_gap / 2
        
        for j in range(num_nodes):
            node_y = start_y - j * node_gap
            positions[(i, j)] = (layer_x, node_y)
            draw_circle(ax, layer_x, node_y, radius, fill_color=fill_color, border_color=border_color)
            
    # Draw connections
    for i in range(len(layers) - 1):
        for j in range(layers[i]):
            for k in range(layers[i+1]):
                start = positions[(i, j)]
                end = positions[(i+1, k)]
                draw_line(ax, start, end, color=GRAY, linewidth=1.0, zorder=0)
                
    return positions

def draw_expert_system(ax, x, y, w=4, h=2, gap=2):
    """
    Draw a basic expert system diagram.
    """
    boxes = {}
    # User
    boxes["User"] = draw_box(ax, x, y, w, h, text="User")
    # User Interface
    boxes["UI"] = draw_box(ax, x + w + gap, y, w, h, text="User Interface")
    # Inference Engine
    boxes["IE"] = draw_box(ax, x + 2*(w + gap), y, w, h, text="Inference Engine")
    # Knowledge Base
    boxes["KB"] = draw_box(ax, x + 2*(w + gap), y - h - gap, w, h, text="Knowledge Base")
    
    # Connections
    # User <-> UI
    draw_arrow(ax, (x + w, y + h/2), (x + w + gap, y + h/2))
    # UI <-> IE
    draw_arrow(ax, (x + w + gap + w, y + h/2), (x + 2*(w + gap), y + h/2))
    # IE <-> KB
    draw_arrow(ax, (x + 2*(w + gap) + w/2, y), (x + 2*(w + gap) + w/2, y - gap))
    
    return boxes

def draw_fuzzy_set(ax, x_vals, memberships, labels=None, x=0, y=0, w=10, h=4):
    """
    Draw fuzzy logic membership functions.
    x_vals: array-like of x coordinates for the universe of discourse
    memberships: list of arrays containing membership values [0, 1]
    labels: list of labels for each membership function
    """
    if labels is None:
        labels = [f"Set {i+1}" for i in range(len(memberships))]
        
    # Draw axes
    draw_line(ax, (x, y), (x + w, y), color=BLACK, linewidth=2) # X axis
    draw_line(ax, (x, y), (x, y + h), color=BLACK, linewidth=2) # Y axis
    
    # Scale x_vals and memberships to fit the width/height
    min_x, max_x = min(x_vals), max(x_vals)
    range_x = max_x - min_x if max_x > min_x else 1
    
    scaled_x = [x + (val - min_x) / range_x * w for val in x_vals]
    
    colors = [BLUE, RED, GRAY] # Extend as needed or use a colormap
    
    for i, mem in enumerate(memberships):
        scaled_y = [y + val * h for val in mem]
        color = colors[i % len(colors)]
        ax.plot(scaled_x, scaled_y, color=color, linewidth=2, label=labels[i])
        
    ax.legend(loc="upper right")
    return (x, y, x + w, y + h)
