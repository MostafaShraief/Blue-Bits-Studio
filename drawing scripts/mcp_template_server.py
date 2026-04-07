"""
Blue Bits - Template Building Blocks MCP Server
================================================
MCP Server that exposes individual template functions as tools.
Unlike the generator-based server (predefined diagrams), this gives
you low-level building blocks to compose unlimited custom diagrams.

Usage:
    python mcp_template_server.py

Then configure LM Studio to connect to this MCP server.

Requirements:
    pip install mcp
"""

import os
import sys
from datetime import datetime

# Add current directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Import the template library only
from template import *

# Import FastMCP
from mcp.server.fastmcp import FastMCP

# Create MCP server
mcp = FastMCP("Blue Bits Template Builder")

# =========================================================
#                   OUTPUT DIRECTORY
# =========================================================
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "docs", "outputs")
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Global figure tracker
_current_fig = None
_current_ax = None


def get_canvas(w=12, h=8, xlim=(-6, 6), ylim=(-4, 4)):
    """Get or create current canvas"""
    global _current_fig, _current_ax
    _current_fig, _current_ax = setup_canvas(w=w, h=h, xlim=xlim, ylim=ylim)
    return _current_fig, _current_ax


def save_current(name=None):
    """Save current figure"""
    global _current_fig
    if _current_fig is None:
        return "No figure to save"
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = name or f"template_build_{ts}"
    output_path = os.path.join(OUTPUT_DIR, filename)
    save_figure(_current_fig, output_path)
    return f"Saved: {output_path}.svg and {output_path}.png"


# =========================================================
#                   TOOL: CANVAS
# =========================================================


@mcp.tool()
def create_canvas(
    width: float = 12,
    height: float = 8,
    x_min: float = -6,
    x_max: float = 6,
    y_min: float = -4,
    y_max: float = 4,
) -> str:
    """Create a new canvas for drawing. Call this first!"""
    get_canvas(w=width, h=height, xlim=(x_min, x_max), ylim=(y_min, y_max))
    return f"Canvas created: {width}x{height}, xlim=({x_min},{x_max}), ylim=({y_min},{y_max})"


@mcp.tool()
def save_diagram(name: str = None) -> str:
    """Save the current diagram. Call this last!"""
    return save_current(name)


# =========================================================
#                   TOOL: BASIC SHAPES
# =========================================================


@mcp.tool()
def draw_rect(
    x: float,
    y: float,
    width: float,
    height: float,
    text: str = "",
    text_color: str = "black",
    border_color: str = "#0072BD",
    fill_color: str = "white",
    rounded: bool = True,
    linewidth: float = 2,
) -> str:
    """Draw a rectangle (box) with centered text"""
    global _current_ax
    if _current_ax is None:
        get_canvas()
    draw_box(
        _current_ax,
        x,
        y,
        width,
        height,
        text=text,
        text_color=text_color,
        border_color=border_color,
        fill_color=fill_color,
        rounded=rounded,
        linewidth=linewidth,
    )
    return f"Drew rectangle at ({x},{y}) size {width}x{height}"


@mcp.tool()
def draw_circle_shape(
    x: float,
    y: float,
    radius: float = 0.5,
    text: str = "",
    text_color: str = "black",
    border_color: str = "#0072BD",
    fill_color: str = "white",
    linewidth: float = 2,
) -> str:
    """Draw a circle with centered text"""
    global _current_ax
    if _current_ax is None:
        get_canvas()
    draw_circle(
        _current_ax,
        x,
        y,
        radius,
        text=text,
        text_color=text_color,
        border_color=border_color,
        fill_color=fill_color,
        linewidth=linewidth,
    )
    return f"Drew circle at ({x},{y}) radius={radius}"


@mcp.tool()
def draw_rhombus(
    x: float,
    y: float,
    width: float = 3,
    height: float = 2,
    text: str = "",
    text_color: str = "black",
    border_color: str = "#0072BD",
    fill_color: str = "white",
    linewidth: float = 2,
) -> str:
    """Draw a diamond/rhombus shape (good for ER relationships)"""
    global _current_ax
    if _current_ax is None:
        get_canvas()
    draw_diamond(
        _current_ax,
        x,
        y,
        width,
        height,
        text=text,
        text_color=text_color,
        border_color=border_color,
        fill_color=fill_color,
        linewidth=linewidth,
    )
    return f"Drew diamond at ({x},{y}) size {width}x{height}"


@mcp.tool()
def draw_line_arrow(
    x1: float,
    y1: float,
    x2: float,
    y2: float,
    label: str = "",
    color: str = "#0072BD",
    curve: float = 0,
    linewidth: float = 2,
) -> str:
    """Draw an arrow between two points"""
    global _current_ax
    if _current_ax is None:
        get_canvas()
    draw_arrow(
        _current_ax,
        (x1, y1),
        (x2, y2),
        text=label,
        arrow_color=color,
        rad=curve,
        linewidth=linewidth,
    )
    return f"Drew arrow from ({x1},{y1}) to ({x2},{y2})"


# =========================================================
#                   TOOL: LABELS & TITLES
# =========================================================


@mcp.tool()
def add_main_title(
    text: str, y_pos: float = None, size: int = 26, color: str = "#0072BD"
) -> str:
    """Add a centered title at the top"""
    global _current_ax
    if _current_ax is None:
        get_canvas()
    add_title(_current_ax, text, y=y_pos, size=size, color=color)
    return f"Added title: {text}"


@mcp.tool()
def add_sub_title(
    text: str, y_pos: float = None, size: int = 18, color: str = "#9E9E9E"
) -> str:
    """Add a subtitle below the title"""
    global _current_ax
    if _current_ax is None:
        get_canvas()
    add_subtitle(_current_ax, text, y=y_pos, size=size, color=color)
    return f"Added subtitle: {text}"


@mcp.tool()
def add_annotation(
    x: float,
    y: float,
    text: str,
    color: str = "#0072BD",
    size: int = 14,
    bg_color: str = None,
) -> str:
    """Add a small label at a position"""
    global _current_ax
    if _current_ax is None:
        get_canvas()
    add_label(_current_ax, x, y, text, color=color, size=size, bg_color=bg_color)
    return f"Added label at ({x},{y}): {text}"


@mcp.tool()
def add_legend_box(
    items: list[str],
    title: str = "",
    x_pos: float = None,
    y_pos: float = None,
    size: int = 12,
) -> str:
    """Add a legend box (items as 'color:text' pairs)"""
    global _current_ax
    if _current_ax is None:
        get_canvas()
    parsed_items = []
    for item in items:
        parts = item.split(":")
        if len(parts) == 2:
            parsed_items.append((parts[0], parts[1]))
        else:
            parsed_items.append(("#0072BD", item))
    add_legend(_current_ax, parsed_items, x=x_pos, y=y_pos, title=title, size=size)
    return f"Added legend with {len(items)} items"


# =========================================================
#                   TOOL: FLOWCHART SHAPES
# =========================================================


@mcp.tool()
def draw_io_box(
    x: float,
    y: float,
    width: float = 4,
    height: float = 1.2,
    text: str = "",
    **kwargs,
) -> str:
    """Draw a parallelogram (I/O shape)"""
    global _current_ax
    if _current_ax is None:
        get_canvas()
    draw_parallelogram(_current_ax, x, y, width, height, text=text, **kwargs)
    return f"Drew I/O box at ({x},{y})"


@mcp.tool()
def draw_decision(
    x: float,
    y: float,
    size: float = 2,
    text: str = "",
    **kwargs,
) -> str:
    """Draw a hexagon (decision shape)"""
    global _current_ax
    if _current_ax is None:
        get_canvas()
    draw_hexagon(_current_ax, x, y, size, text=text, **kwargs)
    return f"Drew decision at ({x},{y})"


@mcp.tool()
def draw_start_end(
    x: float,
    y: float,
    width: float = 4,
    height: float = 1.5,
    text: str = "",
    is_start: bool = True,
) -> str:
    """Draw a stadium shape (Start/End)"""
    global _current_ax
    if _current_ax is None:
        get_canvas()
    fill_color = "#009E73" if is_start else "#D32F2F"
    draw_stadium(
        _current_ax,
        x,
        y,
        width,
        height,
        text=text,
        fill_color=fill_color,
        text_color="white",
    )
    return f"Drew {'start' if is_start else 'end'} at ({x},{y})"


@mcp.tool()
def draw_cloud_box(
    x: float,
    y: float,
    width: float = 6,
    height: float = 3,
    text: str = "",
    **kwargs,
) -> str:
    """Draw a cloud shape (cloud computing)"""
    global _current_ax
    if _current_ax is None:
        get_canvas()
    draw_cloud(_current_ax, x, y, width, height, text=text, **kwargs)
    return f"Drew cloud at ({x},{y})"


@mcp.tool()
def draw_database(
    x: float,
    y: float,
    width: float = 4,
    height: float = 2,
    text: str = "",
    **kwargs,
) -> str:
    """Draw a cylinder shape (database/storage)"""
    global _current_ax
    if _current_ax is None:
        get_canvas()
    draw_cylinder(_current_ax, x, y, width, height, text=text, **kwargs)
    return f"Drew database at ({x},{y})"


# =========================================================
#                   TOOL: UML
# =========================================================


@mcp.tool()
def draw_uml_package(
    x: float,
    y: float,
    width: float = 4,
    height: float = 2.5,
    name: str = "",
    text: str = "",
    **kwargs,
) -> str:
    """Draw a UML package with tab"""
    global _current_ax
    if _current_ax is None:
        get_canvas()
    draw_package(_current_ax, x, y, width, height, name=name, text=text, **kwargs)
    return f"Drew UML package at ({x},{y})"


@mcp.tool()
def draw_deployment_node(
    x: float,
    y: float,
    width: float = 3,
    height: float = 2,
    node_name: str = "",
    text: str = "",
    **kwargs,
) -> str:
    """Draw a deployment node (3D box)"""
    global _current_ax
    if _current_ax is None:
        get_canvas()
    draw_node(_current_ax, x, y, width, height, name=node_name, text=text, **kwargs)
    return f"Drew node at ({x},{y})"


@mcp.tool()
def draw_interface_lollipop(
    x: float,
    y: float,
    name: str = "",
    **kwargs,
) -> str:
    """Draw a UML interface (lollipop style)"""
    global _current_ax
    if _current_ax is None:
        get_canvas()
    draw_interface(_current_ax, x, y, name=name, **kwargs)
    return f"Drew interface at ({x},{y})"


# =========================================================
#                   TOOL: NETWORK
# =========================================================


@mcp.tool()
def draw_server_box(
    x: float,
    y: float,
    width: float = 3,
    height: float = 2,
    text: str = "",
    **kwargs,
) -> str:
    """Draw a server box"""
    global _current_ax
    if _current_ax is None:
        get_canvas()
    draw_server(_current_ax, x, y, width, height, text=text, **kwargs)
    return f"Drew server at ({x},{y})"


@mcp.tool()
def draw_db_cylinder(
    x: float,
    y: float,
    width: float = 3,
    height: float = 2,
    text: str = "",
    **kwargs,
) -> str:
    """Draw a database cylinder"""
    global _current_ax
    if _current_ax is None:
        get_canvas()
    draw_database_cylinder(_current_ax, x, y, width, height, text=text, **kwargs)
    return f"Drew database at ({x},{y})"


@mcp.tool()
def draw_network_device(
    x: float,
    y: float,
    width: float = 3,
    height: float = 2,
    text: str = "",
    **kwargs,
) -> str:
    """Draw a network device"""
    global _current_ax
    if _current_ax is None:
        get_canvas()
    draw_device(_current_ax, x, y, width, height, text=text, **kwargs)
    return f"Drew device at ({x},{y})"


# =========================================================
#                   TOOL: ADVANCED ARROWS
# =========================================================


@mcp.tool()
def draw_right_angle_arrow(
    x1: float,
    y1: float,
    x2: float,
    y2: float,
    color: str = "#0072BD",
    linewidth: float = 2,
) -> str:
    """Draw an orthogonal (right-angle) arrow"""
    global _current_ax
    if _current_ax is None:
        get_canvas()
    draw_orthogonal_arrow(
        _current_ax, (x1, y1), (x2, y2), color=color, linewidth=linewidth
    )
    return f"Drew orthogonal arrow from ({x1},{y1}) to ({x2},{y2})"


@mcp.tool()
def draw_curve_arrow(
    x1: float,
    y1: float,
    x2: float,
    y2: float,
    curve_strength: float = 0.3,
    color: str = "#0072BD",
    linewidth: float = 2,
) -> str:
    """Draw a curved (Bezier) arrow"""
    global _current_ax
    if _current_ax is None:
        get_canvas()
    draw_curved_arrow(
        _current_ax,
        (x1, y1),
        (x2, y2),
        curve_strength=curve_strength,
        color=color,
        linewidth=linewidth,
    )
    return f"Drew curved arrow from ({x1},{y1}) to ({x2},{y2})"


@mcp.tool()
def draw_dashed_line(
    x1: float,
    y1: float,
    x2: float,
    y2: float,
    color: str = "#9E9E9E",
    linewidth: float = 2,
) -> str:
    """Draw a dashed arrow (optional relationship)"""
    global _current_ax
    if _current_ax is None:
        get_canvas()
    draw_dashed_arrow(_current_ax, (x1, y1), (x2, y2), color=color, linewidth=linewidth)
    return f"Drew dashed arrow from ({x1},{y1}) to ({x2},{y2})"


@mcp.tool()
def draw_bidirectional_arrow(
    x1: float,
    y1: float,
    x2: float,
    y2: float,
    color: str = "#0072BD",
    linewidth: float = 2,
) -> str:
    """Draw a bidirectional arrow"""
    global _current_ax
    if _current_ax is None:
        get_canvas()
    draw_double_arrow(_current_ax, (x1, y1), (x2, y2), color=color, linewidth=linewidth)
    return f"Drew bidirectional arrow from ({x1},{y1}) to ({x2},{y2})"


# =========================================================
#                   TOOL: TABLE
# =========================================================


@mcp.tool()
def draw_data_table(
    x: float,
    y: float,
    headers: list[str],
    rows: list[list[str]],
    cell_width: float = 2.5,
    cell_height: float = 0.8,
    header_bg: str = "#0072BD",
    header_text: str = "white",
) -> str:
    """Draw a table with headers and data rows"""
    global _current_ax
    if _current_ax is None:
        get_canvas()
    draw_table(
        _current_ax,
        x,
        y,
        headers,
        rows,
        cell_w=cell_width,
        cell_h=cell_height,
        header_color=header_bg,
        header_text_color=header_text,
    )
    return f"Drew table with {len(headers)} headers and {len(rows)} rows"


# =========================================================
#                   TOOL: ER DIAGRAM
# =========================================================


@mcp.tool()
def draw_entity_box(
    x: float,
    y: float,
    text: str = "",
    weak: bool = False,
    width: float = 4.5,
    height: float = 1.8,
) -> str:
    """Draw an ER entity (rectangle)"""
    global _current_ax
    if _current_ax is None:
        get_canvas()
    draw_entity(_current_ax, x, y, text, w=width, h=height, weak=weak)
    return f"Drew ER entity at ({x},{y}): {text}"


@mcp.tool()
def draw_relationship_diamond(
    x: float,
    y: float,
    text: str = "",
    identifying: bool = False,
    width: float = 4,
    height: float = 2.5,
) -> str:
    """Draw an ER relationship (diamond)"""
    global _current_ax
    if _current_ax is None:
        get_canvas()
    draw_relationship(
        _current_ax, x, y, text, w=width, h=height, identifying=identifying
    )
    return f"Drew ER relationship at ({x},{y}): {text}"


@mcp.tool()
def draw_attribute_ellipse(
    x: float,
    y: float,
    text: str = "",
    is_key: bool = False,
    is_multivalued: bool = False,
    is_derived: bool = False,
    width: float = 3.5,
    height: float = 1.8,
) -> str:
    """Draw an ER attribute (ellipse)"""
    global _current_ax
    if _current_ax is None:
        get_canvas()
    draw_attribute(
        _current_ax,
        x,
        y,
        text,
        w=width,
        h=height,
        underline=is_key,
        multivalued=is_multivalued,
        derived=is_derived,
    )
    return f"Drew ER attribute at ({x},{y}): {text}"


@mcp.tool()
def connect_elements(
    x1: float,
    y1: float,
    x2: float,
    y2: float,
    double_line: bool = False,
) -> str:
    """Connect two ER elements with a line"""
    global _current_ax
    if _current_ax is None:
        get_canvas()
    connect(_current_ax, (x1, y1), (x2, y2), double=double_line)
    return f"Connected ({x1},{y1}) to ({x2},{y2})"


# =========================================================
#                   TOOL: ANNOTATIONS
# =========================================================


@mcp.tool()
def add_code_block(
    x: float,
    y: float,
    lines: list[str],
    bg_color: str = "#E3F2FD",
) -> str:
    """Add a code block"""
    global _current_ax
    if _current_ax is None:
        get_canvas()
    add_code_block(_current_ax, x, y, lines, bg_color=bg_color)
    return f"Added code block with {len(lines)} lines"


@mcp.tool()
def add_division_line(
    y_pos: float,
    x_start: float = None,
    x_end: float = None,
    color: str = "#9E9E9E",
    style: str = "-",
) -> str:
    """Add a horizontal divider line"""
    global _current_ax
    if _current_ax is None:
        get_canvas()
    add_divider(
        _current_ax,
        y_pos,
        x_range=(x_start, x_end) if x_start else None,
        color=color,
        linestyle=style,
    )
    return f"Added divider at y={y_pos}"


@mcp.tool()
def add_watermark(text: str = "BlueBits", alpha: float = 0.08) -> str:
    """Add a watermark"""
    global _current_ax
    if _current_ax is None:
        get_canvas()
    add_watermark(_current_ax, text=text, alpha=alpha)
    return f"Added watermark: {text}"


# =========================================================
#                   TOOL: ALGORITHM HELPERS
# =========================================================


@mcp.tool()
def add_complexity(
    label: str = "O(n)", x: float = 0, y: float = 0, color: str = "#D32F2F"
) -> str:
    """Add Big-O complexity label"""
    global _current_ax
    if _current_ax is None:
        get_canvas()
    draw_complexity_label(_current_ax, x, y, label, color=color)
    return f"Added complexity label: {label}"


@mcp.tool()
def add_step_marker(
    step: int,
    x: float,
    y: float,
    active: bool = True,
) -> str:
    """Add an algorithm step indicator (numbered circle)"""
    global _current_ax
    if _current_ax is None:
        get_canvas()
    draw_step_indicator(_current_ax, step, x, y, active=active)
    return f"Added step {step} at ({x},{y})"


@mcp.tool()
def add_pseudo_code(
    x: float,
    y: float,
    code_lines: list[str],
    highlight: list[int] = None,
    show_numbers: bool = True,
) -> str:
    """Add a pseudo-code block"""
    global _current_ax
    if _current_ax is None:
        get_canvas()
    draw_pseudocode_block(
        _current_ax,
        x,
        y,
        code_lines,
        line_numbers=show_numbers,
        highlight_lines=highlight or [],
    )
    return f"Added pseudo-code with {len(code_lines)} lines"


# =========================================================
#                   TOOL: ELECTRONICS
# =========================================================


@mcp.tool()
def draw_logic_gate(
    gate_type: str,
    x: float,
    y: float,
    **kwargs,
) -> str:
    """Draw a logic gate (AND, OR, NOT, NAND, NOR, XOR)"""
    global _current_ax
    if _current_ax is None:
        get_canvas()
    draw_logic_gate(_current_ax, gate_type, x, y, **kwargs)
    return f"Drew {gate_type} gate at ({x},{y})"


@mcp.tool()
def draw_register(
    x: float,
    y: float,
    name: str = "REG",
    bits: int = 8,
    **kwargs,
) -> str:
    """Draw a register block"""
    global _current_ax
    if _current_ax is None:
        get_canvas()
    draw_register_box(_current_ax, x, y, name=name, bits=bits, **kwargs)
    return f"Drew {bits}-bit register at ({x},{y})"


@mcp.tool()
def draw_alu(
    x: float,
    y: float,
    operations: list[str] = None,
    **kwargs,
) -> str:
    """Draw an ALU block"""
    global _current_ax
    if _current_ax is None:
        get_canvas()
    draw_alu_block(_current_ax, x, y, ops=operations or ["+", "-", "*", "/"], **kwargs)
    return f"Drew ALU at ({x},{y})"


# =========================================================
#                   TOOL: PROCESS/OS
# =========================================================


@mcp.tool()
def draw_process_box(
    x: float,
    y: float,
    name: str = "P1",
    **kwargs,
) -> str:
    """Draw a process block"""
    global _current_ax
    if _current_ax is None:
        get_canvas()
    draw_thread_block(_current_ax, x, y, thread_id=name, **kwargs)
    return f"Drew process {name} at ({x},{y})"


@mcp.tool()
def draw_memory_segment(
    x: float,
    y: float,
    width: float,
    height: float,
    label: str = "",
    **kwargs,
) -> str:
    """Draw a memory segment (stack/heap/data)"""
    global _current_ax
    if _current_ax is None:
        get_canvas()
    draw_box(_current_ax, x, y, width, height, text=label, **kwargs)
    return f"Drew memory segment at ({x},{y})"


# =========================================================
#                   TOOL: DATA VIZ
# =========================================================


@mcp.tool()
def draw_bar_chart(
    x: float,
    y: float,
    width: float,
    height: float,
    label: str = "",
    color: str = "#0072BD",
) -> str:
    """Draw a bar chart element"""
    global _current_ax
    if _current_ax is None:
        get_canvas()
    draw_bar(_current_ax, x, y, width, height, color=color, label=label)
    return f"Drew bar at ({x},{y}) height={height}"


# =========================================================
#                   TOOL: UTILITIES
# =========================================================


@mcp.tool()
def get_help() -> str:
    """Get help on available template building block tools"""
    return """
# Blue Bits Template Building Blocks - Available Tools

## Canvas (2 tools)
- create_canvas(width, height, x_min, x_max, y_min, y_max) - Create canvas
- save_diagram(name) - Save current diagram

## Basic Shapes (4 tools)
- draw_rect(x, y, width, height, text, ...) - Rectangle
- draw_circle_shape(x, y, radius, text, ...) - Circle
- draw_rhombus(x, y, width, height, text, ...) - Diamond
- draw_line_arrow(x1, y1, x2, y2, label, ...) - Arrow

## Labels & Titles (4 tools)
- add_main_title(text, y_pos, size, color) - Title
- add_sub_title(text, y_pos, size, color) - Subtitle
- add_annotation(x, y, text, color, size, bg_color) - Label
- add_legend_box(items, title, ...) - Legend

## Flowchart Shapes (5 tools)
- draw_io_box(x, y, width, height, text) - Parallelogram
- draw_decision(x, y, size, text) - Hexagon
- draw_start_end(x, y, width, height, text, is_start) - Stadium
- draw_cloud_box(x, y, width, height, text) - Cloud
- draw_database(x, y, width, height, text) - Cylinder

## UML (3 tools)
- draw_uml_package(x, y, width, height, name, text) - Package
- draw_deployment_node(x, y, width, height, name, text) - Node
- draw_interface_lollipop(x, y, name) - Interface

## Network (3 tools)
- draw_server_box(x, y, width, height, text) - Server
- draw_db_cylinder(x, y, width, height, text) - Database
- draw_network_device(x, y, width, height, text) - Device

## Advanced Arrows (4 tools)
- draw_right_angle_arrow(x1, y1, x2, y2, ...) - Orthogonal
- draw_curve_arrow(x1, y1, x2, y2, curve_strength, ...) - Curved
- draw_dashed_line(x1, y1, x2, y2, ...) - Dashed
- draw_bidirectional_arrow(x1, y1, x2, y2, ...) - Double arrow

## Table (1 tool)
- draw_data_table(x, y, headers, rows, ...) - Data table

## ER Diagram (4 tools)
- draw_entity_box(x, y, text, weak) - Entity
- draw_relationship_diamond(x, y, text, identifying) - Relationship
- draw_attribute_ellipse(x, y, text, is_key, ...) - Attribute
- connect_elements(x1, y1, x2, y2, double_line) - Connect

## Annotations (3 tools)
- add_code_block(x, y, lines, bg_color) - Code block
- add_division_line(y_pos, ...) - Divider
- add_watermark(text, alpha) - Watermark

## Algorithm (3 tools)
- add_complexity(label, x, y, color) - Big-O label
- add_step_marker(step, x, y, active) - Step circle
- add_pseudo_code(x, y, code_lines, highlight, show_numbers) - Pseudo-code

## Electronics (3 tools)
- draw_logic_gate(gate_type, x, y, ...) - Logic gate
- draw_register(x, y, name, bits, ...) - Register
- draw_alu(x, y, operations, ...) - ALU

## Process/OS (2 tools)
- draw_process_box(x, y, name, ...) - Process
- draw_memory_segment(x, y, width, height, label, ...) - Memory

## Data Viz (1 tool)
- draw_bar_chart(x, y, width, height, label, color) - Bar

Total: 40+ building block tools for unlimited combinations!
"""


# =========================================================
#                   MAIN
# =========================================================


if __name__ == "__main__":
    print("=" * 60)
    print("Blue Bits - Template Building Blocks MCP Server")
    print("=" * 60)
    print(f"\nOutput directory: {OUTPUT_DIR}")
    print("\nStarting MCP server (stdio mode)...")
    print("\nThis server provides 40+ building block tools:")
    print("  - Canvas & Shapes (rect, circle, diamond, arrow)")
    print("  - Flowchart (I/O, decision, start/end, cloud, DB)")
    print("  - UML (package, node, interface)")
    print("  - Network (server, device, database)")
    print("  - ER Diagram (entity, relationship, attribute)")
    print("  - Algorithm (complexity, steps, pseudocode)")
    print("  - And more...")
    print("\nTo use with LM Studio:")
    print("1. Open LM Studio")
    print("2. Go to Settings > MCP Servers")
    print("3. Add a new server:")
    print("   - Command: python /path/to/mcp_template_server.py")
    print("4. Load Qwen2.5-VL model")
    print("5. The AI can now compose unlimited custom diagrams!\n")

    # Run the server
    mcp.run(transport="stdio")
