import numpy as np
import matplotlib.patches as patches
from src.draw_engine.core import DEFAULT_SIZE, BLACK, BLUE, WHITE, GRAY, LIGHT_GREEN, get_font_prop, get_code_font_prop
from src.draw_engine.text import handle_arabic

def draw_logic_gate(
    ax,
    gate_type,
    x,
    y,
    size=1.5,
    inputs=2,
    label="",
    text_size=None,
    fill_color=WHITE,
    border_color=BLUE,
    text_color=BLACK,
):
    """
    Draw a logic gate symbol (AND, OR, NOT, NAND, NOR, XOR).
    Returns a smart tuple: (main_patch, (xmin, ymin, xmax, ymax), anchors_dict)
    """
    if text_size is None:
        text_size = DEFAULT_SIZE

    w = size * 1.2
    h = size
    gate_type = str(gate_type).upper()
    
    anchors = {}
    bbox = (x - w / 2, y - h / 2, x + w / 2, y + h / 2)

    if gate_type == "AND":
        vertices = [
            (x - w / 2, y - h / 2),
            (x - w / 2, y + h / 2),
            (x + w / 6, y + h / 2),
            (x + w / 2, y + h / 4),
            (x + w / 2, y - h / 4),
            (x + w / 6, y - h / 2),
        ]
        gate = patches.Polygon(
            vertices,
            closed=True,
            facecolor=fill_color,
            edgecolor=border_color,
            linewidth=2,
            zorder=5,
        )
        ax.add_patch(gate)

    elif gate_type == "OR":
        t = np.linspace(0, np.pi, 20)
        left_curve_x = x - w / 2 + 0.3
        left_curve = [
            (left_curve_x + 0.3 * np.cos(ang), y + 0.5 * h * np.sin(ang)) for ang in t
        ]
        right_curve_x = x + w / 2
        right_curve = [
            (right_curve_x - 0.3 * (1 - np.sin(ang)), y + 0.5 * h * np.sin(ang))
            for ang in t[::-1]
        ]
        vertices = (
            [(x - w / 2, y - h / 2), (x - w / 2, y + h / 2)] + left_curve + right_curve
        )
        gate = patches.Polygon(
            vertices,
            closed=True,
            facecolor=fill_color,
            edgecolor=border_color,
            linewidth=2,
            zorder=5,
        )
        ax.add_patch(gate)

    elif gate_type == "NOT":
        triangle_vertices = [
            (x - w / 2, y - h / 2),
            (x - w / 2, y + h / 2),
            (x + w / 3, y),
        ]
        gate = patches.Polygon(
            triangle_vertices,
            closed=True,
            facecolor=fill_color,
            edgecolor=border_color,
            linewidth=2,
            zorder=5,
        )
        ax.add_patch(gate)
        bubble = patches.Circle(
            (x + w / 3 + 0.15, y),
            0.12,
            facecolor=fill_color,
            edgecolor=border_color,
            linewidth=2,
            zorder=5,
        )
        ax.add_patch(bubble)

    elif gate_type == "NAND":
        vertices = [
            (x - w / 2 - 0.2, y - h / 2),
            (x - w / 2 - 0.2, y + h / 2),
            (x + w / 6 - 0.2, y + h / 2),
            (x + w / 2 - 0.2, y + h / 4),
            (x + w / 2 - 0.2, y - h / 4),
            (x + w / 6 - 0.2, y - h / 2),
        ]
        gate = patches.Polygon(
            vertices,
            closed=True,
            facecolor=fill_color,
            edgecolor=border_color,
            linewidth=2,
            zorder=5,
        )
        ax.add_patch(gate)
        bubble = patches.Circle(
            (x + w / 2 - 0.05, y),
            0.12,
            facecolor=fill_color,
            edgecolor=border_color,
            linewidth=2,
            zorder=5,
        )
        ax.add_patch(bubble)

    elif gate_type == "NOR":
        vertices = [
            (x - w / 2 - 0.1, y - h / 2),
            (x - w / 2 - 0.1, y + h / 2),
            (x - w / 6, y + h / 2),
            (x + w / 4, y + h / 4),
            (x + w / 4, y - h / 4),
            (x - w / 6, y - h / 2),
        ]
        gate = patches.Polygon(
            vertices,
            closed=True,
            facecolor=fill_color,
            edgecolor=border_color,
            linewidth=2,
            zorder=5,
        )
        ax.add_patch(gate)
        bubble = patches.Circle(
            (x + w / 4 + 0.15, y),
            0.12,
            facecolor=fill_color,
            edgecolor=border_color,
            linewidth=2,
            zorder=5,
        )
        ax.add_patch(bubble)

    elif gate_type == "XOR":
        vertices = [
            (x - w / 2 - 0.2, y - h / 2),
            (x - w / 2 - 0.2, y + h / 2),
            (x - w / 6, y + h / 2),
            (x + w / 4, y + h / 4),
            (x + w / 4, y - h / 4),
            (x - w / 6, y - h / 2),
        ]
        gate = patches.Polygon(
            vertices,
            closed=True,
            facecolor=fill_color,
            edgecolor=border_color,
            linewidth=2,
            zorder=5,
        )
        ax.add_patch(gate)
        xor_curve = patches.Arc(
            (x - w / 2 - 0.1, y),
            h * 0.8,
            h * 0.8,
            angle=0,
            theta1=-60,
            theta2=60,
            color=border_color,
            linewidth=2,
            zorder=5,
        )
        ax.add_patch(xor_curve)

    else:
        gate = patches.Rectangle(
            (x - w / 2, y - h / 2),
            w,
            h,
            facecolor=fill_color,
            edgecolor=border_color,
            linewidth=2,
            zorder=5,
        )
        ax.add_patch(gate)

    input_spacing = h / (inputs + 1)
    for i in range(inputs):
        input_y = y - h / 2 + (i + 1) * input_spacing
        anchors[f"in{i+1}"] = (x - w / 2, input_y)
        ax.plot(
            [x - w / 2 - 0.5, x - w / 2],
            [input_y, input_y],
            color=border_color,
            linewidth=2,
            zorder=5,
        )

    out_x = x + w / 2
    if gate_type in ["NOT", "NAND", "NOR"]:
        out_x = x + w / 3 + 0.27 if gate_type == "NOT" else x + w / 2 + 0.07
    elif gate_type == "XOR":
        out_x = x + w / 4 + 0.1
    
    anchors["out"] = (out_x, y)
    ax.plot(
        [out_x, out_x + 0.5],
        [y, y],
        color=border_color,
        linewidth=2,
        zorder=5,
    )

    ax.text(
        x,
        y,
        gate_type,
        color=text_color,
        fontproperties=get_code_font_prop(int(text_size * 0.8)),
        ha="center",
        va="center",
        zorder=20,
    )

    if label:
        disp_label = handle_arabic(label)
        ax.text(
            x,
            y - h / 2 - 0.4,
            disp_label,
            color=GRAY,
            fontproperties=get_font_prop(int(text_size * 0.7)),
            ha="center",
            va="top",
            zorder=20,
        )

    # Adjust bbox width considering the drawn extra lines (0.5 padding on left/right)
    bbox = (x - w/2 - 0.5, y - h/2, out_x + 0.5, y + h/2)
    return gate, bbox, anchors


def draw_alu_block(ax, x, y, operations=None, width=3, height=2, text_size=None, label="ALU"):
    """
    Draw an ALU or Microprocessor component with operation list.
    Returns: (main_patch, (xmin, ymin, xmax, ymax), anchors_dict)
    """
    if text_size is None:
        text_size = DEFAULT_SIZE
    
    border_color = BLUE
    fill_color = LIGHT_GREEN

    box = patches.Rectangle((x, y), width, height, facecolor=fill_color, edgecolor=border_color, linewidth=2, zorder=5)
    ax.add_patch(box)
    
    bbox = (x, y, x + width, y + height)
    anchors = {
        'A': (x, y + height * 0.7),
        'B': (x, y + height * 0.3),
        'out': (x + width, y + height / 2),
        'ctrl': (x + width / 2, y)
    }

    disp_label = handle_arabic(label)
    ax.text(x + width/2, y + height - 0.3, disp_label, color=BLUE, fontproperties=get_font_prop(int(text_size * 1.1)), ha="center", va="center", zorder=20)

    if operations:
        num_ops = len(operations)
        if num_ops <= 4:
            ops_text = "\n".join(operations)
        else:
            ops_text = "\n".join(operations[:3]) + f"\n... ({num_ops})"
        
        ax.text(x + width/2, y + height/2 - 0.2, ops_text, color=BLACK, fontproperties=get_code_font_prop(int(text_size * 0.7)), ha="center", va="center", zorder=20)

    # Input A
    ax.plot([x - 0.3, x], [y + height * 0.7, y + height * 0.7], color=border_color, linewidth=2, zorder=5)
    ax.text(x - 0.5, y + height * 0.7, "A", color=GRAY, fontproperties=get_code_font_prop(int(text_size * 0.6)), ha="center", va="center", zorder=20)
    
    # Input B
    ax.plot([x - 0.3, x], [y + height * 0.3, y + height * 0.3], color=border_color, linewidth=2, zorder=5)
    ax.text(x - 0.5, y + height * 0.3, "B", color=GRAY, fontproperties=get_code_font_prop(int(text_size * 0.6)), ha="center", va="center", zorder=20)
    
    # Output R
    ax.plot([x + width, x + width + 0.3], [y + height/2, y + height/2], color=border_color, linewidth=2, zorder=5)
    ax.text(x + width + 0.5, y + height/2, "R", color=GRAY, fontproperties=get_code_font_prop(int(text_size * 0.6)), ha="center", va="center", zorder=20)
    
    # Control
    ax.plot([x + width/2, x + width/2], [y, y - 0.3], color=border_color, linewidth=1.5, zorder=5)

    # Expanded BBox for connectors
    bbox = (x - 0.7, y - 0.3, x + width + 0.7, y + height)

    return box, bbox, anchors


def draw_memory_array(
    ax, x, y, rows=4, cols=4, cell_w=0.8, cell_h=0.5, addresses=None, labels=None
):
    """
    Draw memory layout grid.
    Returns: (main_patch, (xmin, ymin, xmax, ymax), anchors_dict)
    """
    border_color = BLUE
    fill_color = WHITE
    anchors = {}

    if addresses is None:
        addresses = [f"0{i}X" for i in range(rows * cols)]

    for row in range(rows):
        for col in range(cols):
            cell_x = x + col * cell_w
            cell_y = y - (row + 1) * cell_h
            cell = patches.Rectangle(
                (cell_x, cell_y),
                cell_w,
                cell_h,
                facecolor=fill_color,
                edgecolor=border_color,
                linewidth=1.5,
                zorder=5,
            )
            ax.add_patch(cell)
            anchors[f"R{row}_C{col}"] = (cell_x + cell_w / 2, cell_y + cell_h / 2)

            if addresses and row * cols + col < len(addresses):
                ax.text(
                    cell_x + cell_w / 2,
                    cell_y + cell_h + 0.08,
                    addresses[row * cols + col],
                    color=GRAY,
                    fontproperties=get_code_font_prop(int(DEFAULT_SIZE * 0.5)),
                    ha="center",
                    va="bottom",
                    zorder=20,
                )

            if labels and row * cols + col < len(labels):
                disp_label = handle_arabic(labels[row * cols + col])
                ax.text(
                    cell_x + cell_w / 2,
                    cell_y + cell_h / 2,
                    disp_label,
                    color=BLACK,
                    fontproperties=get_code_font_prop(int(DEFAULT_SIZE * 0.6)),
                    ha="center",
                    va="center",
                    zorder=20,
                )
            else:
                ax.text(
                    cell_x + cell_w / 2,
                    cell_y + cell_h / 2,
                    "—",
                    color=GRAY,
                    fontproperties=get_code_font_prop(int(DEFAULT_SIZE * 0.5)),
                    ha="center",
                    va="center",
                    zorder=20,
                )

    for col in range(cols):
        col_x = x + col * cell_w + cell_w / 2
        ax.text(
            col_x,
            y + 0.15,
            f"C{col}",
            color=BLUE,
            fontproperties=get_code_font_prop(int(DEFAULT_SIZE * 0.5)),
            ha="center",
            va="bottom",
            zorder=20,
        )
        anchors[f"top_C{col}"] = (col_x, y)
        anchors[f"bottom_C{col}"] = (col_x, y - rows * cell_h)

    for row in range(rows):
        row_y = y - row * cell_h - cell_h / 2
        ax.text(
            x - 0.2,
            row_y,
            f"R{row}",
            color=BLUE,
            fontproperties=get_code_font_prop(int(DEFAULT_SIZE * 0.5)),
            ha="center",
            va="center",
            zorder=20,
        )
        anchors[f"left_R{row}"] = (x, row_y)
        anchors[f"right_R{row}"] = (x + cols * cell_w, row_y)

    memory_border = patches.Rectangle(
        (x - 0.1, y - rows * cell_h - 0.1),
        cols * cell_w + 0.2,
        rows * cell_h + 0.3,
        facecolor="none",
        edgecolor=BLUE,
        linewidth=2,
        linestyle="--",
        zorder=4,
    )
    ax.add_patch(memory_border)
    
    bbox = (x - 0.5, y - rows * cell_h - 0.1, x + cols * cell_w + 0.2, y + 0.5)

    return memory_border, bbox, anchors
