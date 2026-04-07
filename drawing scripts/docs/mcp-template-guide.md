# Blue Bits - Template Building Blocks MCP Server

## Overview

This MCP server exposes **104 individual template functions** as tools for creating custom, unlimited diagram combinations. Unlike the generator-based MCP server (which has predefined diagrams), this server gives you **low-level building blocks** to compose any diagram you can imagine.

---

## Quick Start

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Start the Template MCP Server

```bash
python mcp_template_server.py
```

The server will start and wait for connections from MCP clients.

---

## Philosophy: Building Blocks vs Generators

```
┌─────────────────────────────────────────────────────────────────┐
│                     GENERATOR APPROACH                         │
│  ┌─────────────┐                                               │
│  │ pre-defined │  generate_er_diagram() → single output        │
│  │   diagram   │  generate_flowchart() → single output        │
│  └─────────────┘  generate_uml_class() → single output        │
│                                                                  │
│  ✓ Easy to use    ✗ Limited combinations                       │
│  ✓ Reliable       ✗ Can't create custom layouts               │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                 TEMPLATE BUILDING BLOCKS                       │
│                                                                  │
│   draw_box() ──┐                                               │
│   draw_arrow() ──▶ combine in any order ──▶ unlimited designs │
│   draw_circle() ┘                                              │
│                                                                  │
│   ✓ Unlimited combinations    ✓ Custom layouts                 │
│   ✓ Fine-grained control     ✗ Requires more input             │
└─────────────────────────────────────────────────────────────────┘
```

---

## Available Tools (104 Functions)

### Category 1: Canvas & Core (9)

| Tool ID | Description | Parameters |
|---------|-------------|------------|
| `setup_canvas` | Create matplotlib figure with transparent background | `w`, `h`, `xlim`, `ylim` |
| `save_figure` | Save figure as SVG + PNG | `fig`, `filename`, `dpi` |
| `get_font_prop` | Get Arabic font properties | `size` |
| `get_code_font_prop` | Get code/monospace font | `size` |
| `handle_arabic` | Reshape Arabic text for display | `text` |
| `add_rich_text` | Multi-colored mixed text | `ax`, `x`, `y`, `segments`, `size`, `direction` |
| `add_text` | Simple Arabic text | `ax`, `x`, `y`, `text`, `color`, `size`, `ha`, `va` |
| `add_title` | Centered diagram title | `ax`, `text`, `y`, `size`, `color` |
| `add_subtitle` | Subtitle below title | `ax`, `text`, `y`, `size`, `color` |

### Category 2: Basic Shapes (4)

| Tool ID | Description | Parameters |
|---------|-------------|------------|
| `draw_box` | Rectangle with centered text | `ax`, `x`, `y`, `w`, `h`, `text`, `border_color`, `fill_color`, `rounded` |
| `draw_circle` | Circle with centered text | `ax`, `x`, `y`, `r`, `text`, `border_color`, `fill_color` |
| `draw_diamond` | Diamond/rhombus shape | `ax`, `x`, `y`, `w`, `h`, `text`, `border_color`, `fill_color` |
| `draw_arrow` | Arrow between two points | `ax`, `start`, `end`, `text`, `arrow_color`, `rad` |

### Category 3: Tables & Data (1)

| Tool ID | Description | Parameters |
|---------|-------------|------------|
| `draw_table` | Table grid with headers | `ax`, `x`, `y`, `headers`, `rows`, `cell_w`, `cell_h`, `header_color` |

### Category 4: ER Diagram Components (5)

| Tool ID | Description | Parameters |
|---------|-------------|------------|
| `draw_entity` | ER entity rectangle | `ax`, `cx`, `cy`, `text`, `w`, `h`, `weak` |
| `draw_relationship` | ER relationship diamond | `ax`, `cx`, `cy`, `text`, `w`, `h`, `identifying` |
| `draw_attribute` | ER attribute ellipse | `ax`, `cx`, `cy`, `text`, `w`, `h`, `underline`, `multivalued`, `derived` |
| `connect` | ER connection line | `ax`, `p1`, `p2`, `double` |
| `draw_inheritance_circle` | Inheritance circle | `ax`, `cx`, `cy`, `text`, `r` |

### Category 5: Flowchart Shapes (5)

| Tool ID | Description | Parameters |
|---------|-------------|------------|
| `draw_parallelogram` | I/O parallelogram | `ax`, `x`, `y`, `w`, `h`, `text`, ... |
| `draw_hexagon` | Decision hexagon | `ax`, `x`, `y`, `size`, `text`, ... |
| `draw_stadium` | Start/End stadium | `ax`, `x`, `y`, `w`, `h`, `text`, ... |
| `draw_cloud` | Cloud shape | `ax`, `x`, `y`, `w`, `h`, `text`, ... |
| `draw_cylinder` | Database cylinder | `ax`, `x`, `y`, `w`, `h`, `text`, ... |

### Category 6: UML/Software (5)

| Tool ID | Description | Parameters |
|---------|-------------|------------|
| `draw_package` | UML package with tab | `ax`, `x`, `y`, `w`, `h`, `name`, `text`, ... |
| `draw_port` | Component port | `ax`, `x`, `y`, `direction`, `text`, ... |
| `draw_node` | Deployment node (3D) | `ax`, `x`, `y`, `w`, `h`, `name`, `text`, ... |
| `draw_interface` | UML interface (lollipop) | `ax`, `x`, `y`, `name`, ... |
| `draw_artifact` | Artifact with dog-ear | `ax`, `x`, `y`, `w`, `h`, `text`, ... |

### Category 7: Network/Cloud (4)

| Tool ID | Description | Parameters |
|---------|-------------|------------|
| `draw_cloud_shape` | Cloud computing shape | `ax`, `x`, `y`, `w`, `h`, `text`, ... |
| `draw_server` | Server box | `ax`, `x`, `y`, `w`, `h`, `text`, ... |
| `draw_database_cylinder` | Database cylinder | `ax`, `x`, `y`, `w`, `h`, `text`, ... |
| `draw_device` | Network device | `ax`, `x`, `y`, `w`, `h`, `text`, ... |

### Category 8: Advanced Connectors (5)

| Tool ID | Description | Parameters |
|---------|-------------|------------|
| `draw_orthogonal_arrow` | Right-angle arrow | `ax`, `p1`, `p2`, `color`, `linewidth`, `arrow_size` |
| `draw_curved_arrow` | Bezier curved arrow | `ax`, `p1`, `p2`, `color`, `linewidth`, `curve_strength` |
| `draw_dashed_arrow` | Dashed line arrow | `ax`, `p1`, `p2`, `color`, `linewidth` |
| `draw_double_arrow` | Bidirectional arrow | `ax`, `p1`, `p2`, `color`, `linewidth` |
| `draw_arrow_with_label` | Arrow with positioned text | `ax`, `p1`, `p2`, `label`, `label_pos`, ... |

### Category 9: Labels & Annotations (9)

| Tool ID | Description | Parameters |
|---------|-------------|------------|
| `add_label` | Small label with optional bg | `ax`, `x`, `y`, `text`, `color`, `size`, `bg_color` |
| `add_legend` | Legend box | `ax`, `items`, `x`, `y`, `title`, `size` |
| `add_caption` | Caption below diagram | `ax`, `text`, `y`, `size`, `color` |
| `add_page_number` | Page number | `ax`, `number`, `total` |
| `add_watermark` | Semi-transparent watermark | `ax`, `text`, `alpha`, `size` |
| `add_divider` | Horizontal divider line | `ax`, `y`, `x_range`, `color`, `linestyle` |
| `add_code_block` | Multi-line code box | `ax`, `x`, `y`, `lines`, `size`, `bg_color` |
| `add_section_header` | Section header | `ax`, `x`, `y`, `text`, `size`, `color` |
| `add_numbered_list` | Numbered/bulleted list | `ax`, `x`, `y`, `items`, `size` |

### Category 10: Visual Annotations (5)

| Tool ID | Description | Parameters |
|---------|-------------|------------|
| `draw_callout` | Callout bubble | `ax`, `x`, `y`, `w`, `h`, `text`, ... |
| `draw_bubble` | Speech bubble | `ax`, `x`, `y`, `w`, `h`, `text`, ... |
| `draw_footnote` | Footnote | `ax`, `x`, `y`, `text`, `size` |
| `draw_sticky_note` | Sticky note | `ax`, `x`, `y`, `w`, `h`, `text`, ... |
| `draw_highlight_box` | Highlight box | `ax`, `x`, `y`, `w`, `h`, `text`, ... |

### Category 11: Layout & Grid (4)

| Tool ID | Description | Parameters |
|---------|-------------|------------|
| `draw_grid` | Grid overlay | `ax`, `x_min`, `x_max`, `y_min`, `y_max`, `spacing`, `color` |
| `add_axis` | X/Y axis | `ax`, `x_label`, `y_label`, `show_ticks` |
| `draw_ruler` | Ruler marks | `ax`, `x`, `y`, `length`, `direction`, `tick_spacing` |
| `snap_to_grid` | Round to grid | `value`, `grid_size` |

### Category 12: Grouping & Styling (3)

| Tool ID | Description | Parameters |
|---------|-------------|------------|
| `draw_group` | Group container | `ax`, `elements`, `label`, `color` |
| `draw_shadow` | Drop shadow | `ax`, `x`, `y`, `w`, `h`, `offset` |
| `draw_dotted_box` | Dotted border | `ax`, `x`, `y`, `w`, `h`, `text`, ... |

### Category 13: Data Visualization (4)

| Tool ID | Description | Parameters |
|---------|-------------|------------|
| `draw_bar` | Bar chart element | `ax`, `x`, `y`, `width`, `height`, `color`, `label` |
| `draw_pie_slice` | Pie chart slice | `ax`, `cx`, `cy`, `r`, `start_angle`, `end_angle`, `color` |
| `draw_legend_item` | Legend entry | `ax`, `x`, `y`, `color`, `label`, `marker_type` |
| `draw_axis_line` | Axis line | `ax`, `x1`, `y1`, `x2`, `y2`, `style` |

### Category 14: Advanced Text (4)

| Tool ID | Description | Parameters |
|---------|-------------|------------|
| `add_rotated_text` | Rotated text | `ax`, `x`, `y`, `text`, `angle`, `size`, `color` |
| `add_vertical_text` | Vertical text | `ax`, `x`, `y`, `text`, `size`, `color` |
| `add_text_with_bg` | Text with background | `ax`, `x`, `y`, `text`, `bg_color`, `text_color`, `size` |
| `add_code_with_syntax` | Syntax highlighted code | `ax`, `x`, `y`, `code`, `syntax_colors` |

### Category 15: Math & Statistics (7)

| Tool ID | Description | Parameters |
|---------|-------------|------------|
| `draw_function_graph` | Math function plot | `ax`, `expr`, `x_range`, ... |
| `draw_histogram` | Statistical histogram | `ax`, `data`, `bins`, ... |
| `draw_boxplot` | Box and whisker plot | `ax`, `data`, ... |
| `draw_scatter_plot` | Scatter with regression | `ax`, `x_data`, `y_data`, ... |
| `draw_normal_curve` | Bell curve | `ax`, `mu`, `sigma`, ... |
| `draw_vector_field` | Vector field | `ax`, `u_func`, `v_func`, ... |
| `draw_equation` | Math equation | `ax`, `x`, `y`, `expr`, `size` |

### Category 16: Algorithm & CS (6)

| Tool ID | Description | Parameters |
|---------|-------------|------------|
| `draw_pseudocode_block` | Pseudo-code block | `ax`, `x`, `y`, `lines`, `line_numbers`, `highlight_lines` |
| `draw_complexity_label` | Big-O notation | `ax`, `x`, `y`, `complexity`, `color` |
| `draw_step_indicator` | Step circle | `ax`, `step_num`, `x`, `y`, `active` |
| `draw_state_diagram` | State machine | `ax`, `states`, `transitions`, ... |
| `draw_transition_table` | State table | `ax`, `states`, `inputs`, ... |
| `draw_recursion_tree_enhanced` | Recursion tree | `ax`, `nodes`, ... |

### Category 17: Timing & Signal (4)

| Tool ID | Description | Parameters |
|---------|-------------|------------|
| `draw_timing_diagram` | Timing waveforms | `ax`, `signals`, `time_scale`, ... |
| `draw_signal_waveform` | Signal timing | `ax`, `x`, `y`, `pattern`, ... |
| `draw_pipeline_stage` | CPU pipeline | `ax`, `x`, `y`, `stage_name`, ... |
| `draw_bus_diagram` | Data bus | `ax`, `x`, `y`, `width`, `data_labels` |

### Category 18: Electronics & Circuits (5)

| Tool ID | Description | Parameters |
|---------|-------------|------------|
| `draw_logic_gate` | Logic gate | `ax`, `gate_type`, `x`, `y`, ... |
| `draw_register_box` | Register block | `ax`, `x`, `y`, `name`, `bits`, ... |
| `draw_alu_block` | ALU component | `ax`, `x`, `y`, `ops`, ... |
| `draw_memory_array` | Memory layout | `ax`, `x`, `y`, `rows`, `cols`, ... |
| `draw_mux_demux` | Mux/Demux | `ax`, `x`, `y`, `inputs`, `outputs` |

### Category 19: Enhanced UML (3)

| Tool ID | Description | Parameters |
|---------|-------------|------------|
| `draw_sequence_fragment` | Loop/alt fragment | `ax`, `x`, `y`, `w`, `h`, `fragment_type` |
| `draw_activation_box` | Activation duration | `ax`, `x`, `y`, `w`, `h` |
| `draw_self_message` | Self message | `ax`, `x`, `y`, `label` |

### Category 20: Process/OS (4)

| Tool ID | Description | Parameters |
|---------|-------------|------------|
| `draw_process_tree` | Process tree | `ax`, `processes` |
| `draw_memory_layout` | Memory layout | `ax`, `segments` |
| `draw_page_table` | Page table | `ax`, `entries` |
| `draw_thread_block` | Thread block | `ax`, `x`, `y`, `thread_id` |

### Category 21: Database (3)

| Tool ID | Description | Parameters |
|---------|-------------|------------|
| `draw_foreign_key_arrow` | FK arrow | `ax`, `p1`, `p2` |
| `draw_primary_key_indicator` | PK indicator | `ax`, `x`, `y` |
| `draw_view_box` | SQL view | `ax`, `x`, `y`, `name`, `query` |

### Category 22: Network (3)

| Tool ID | Description | Parameters |
|---------|-------------|------------|
| `draw_packet_header` | Protocol header | `ax`, `x`, `y`, `fields` |
| `draw_protocol_stack` | OSI/TCP-IP stack | `ax`, `layers` |
| `draw_network_timeline` | Network timeline | `ax`, `events` |

---

## Example Workflows

### Example 1: Custom ER Diagram with Extra Annotations

```python
# Step 1: Create canvas
fig, ax = setup_canvas(w=20, h=12, xlim=(-10, 10), ylim=(-6, 6))

# Step 2: Add title
add_title(ax, "مخطط ER مخصص")

# Step 3: Draw entities
draw_entity(ax, -6, 0, "طالب", w=4.5)
draw_entity(ax, 0, 0, "يسجل", w=4, h=2.5)
draw_entity(ax, 6, 0, "مقرر", w=4.5)

# Step 4: Add attributes (using circles)
draw_circle(ax, -6, 2.5, 0.7, text="رقم", border_color=BLUE)
draw_circle(ax, -7.5, 0, 0.7, text="اسم", border_color=BLUE)

# Step 5: Connect with arrows
draw_arrow(ax, (-4, 0), (-2, 0), text="1:N")
draw_arrow(ax, (2, 0), (4, 0), text="N:1")

# Step 6: Add a footnote
draw_footnote(ax, -8, -5, "المخطط يُظهر علاقة التسجيل")

# Step 7: Add legend
add_legend(ax, [(BLUE, "كيان"), (GREEN, "علاقة")], x=-8, y=4)

# Step 8: Save
save_figure(fig, "custom-er-diagram")
```

### Example 2: Custom Flowchart with Advanced Shapes

```python
fig, ax = setup_canvas(w=16, h=14, xlim=(-8, 8), ylim=(-7, 7))
add_title(ax, "مخطط انسيابي مخصص")

# Start - stadium shape
draw_stadium(ax, 0, 6, 4, 1.5, text="بداية", fill_color=GREEN)

# Process - regular box
draw_box(ax, -2, 4, 4, 1.2, text="معالجة البيانات")

# Decision - hexagon
draw_hexagon(ax, 0, 1.5, 2, text="شرط صحيح؟")

# I/O - parallelogram
draw_parallelogram(ax, 0, -1, 4, 1.2, text="إدخال/إخراج")

# Database - cylinder
draw_cylinder(ax, 0, -4, 4, 2, text="قاعدة البيانات")

# End - stadium
draw_stadium(ax, 0, -6.5, 4, 1.5, text="نهاية", fill_color=RED)

# Connect with arrows
draw_arrow(ax, (0, 4.5), (0, 4))
draw_arrow(ax, (0, 2.5), (0, 1))
draw_arrow(ax, (0, 0), (0, -0.4))

# Add complexity label
draw_complexity_label(ax, 5, 0, "O(n)")

# Save
save_figure(fig, "custom-flowchart")
```

---

## MCP Tool Usage Examples

### Tool Call: Create Custom Diagram

```
Tool: setup_canvas
Arguments: {"w": 18, "h": 12, "xlim": [-9, 9], "ylim": [-6, 6]}
```

```
Tool: add_title
Arguments: {"ax": "<auto>", "text": "مخططي المخصص"}
```

```
Tool: draw_box
Arguments: {"ax": "<auto>", "x": -4, "y": 0, "w": 4, "h": 2, "text": "مربع", "border_color": "BLUE"}
```

```
Tool: draw_arrow
Arguments: {"ax": "<auto>", "start": [0, 0], "end": [4, 0], "text": "سهم", "arrow_color": "BLUE"}
```

```
Tool: save_figure
Arguments: {"fig": "<auto>", "filename": "my-custom-diagram"}
```

---

## Advanced: Combining Multiple Tools

### Network Architecture Diagram

```python
# Create canvas
fig, ax = setup_canvas(w=20, h=12)

# Draw cloud
draw_cloud_shape(ax, 0, 4, 8, 3, text="إنترنت")

# Draw servers
draw_server(ax, -6, 0, 4, 2, text="خادم 1")
draw_server(ax, 0, 0, 4, 2, text="خادم 2")
draw_server(ax, 6, 0, 4, 2, text="خادم 3")

# Draw database
draw_database_cylinder(ax, 0, -4, 4, 2, text="قاعدة البيانات")

# Connect with orthogonal arrows
draw_orthogonal_arrow(ax, (-4, 4), (-6, 2))
draw_orthogonal_arrow(ax, (0, 4), (0, 2))
draw_orthogonal_arrow(ax, (4, 4), (6, 2))

# Connect to database
draw_curved_arrow(ax, (-6, 0), (0, -2), curve_strength=0.2)
draw_curved_arrow(ax, (0, 0), (0, -2))
draw_curved_arrow(ax, (6, 0), (0, -2), curve_strength=-0.2)

# Add labels
add_label(ax, 0, 5, "cloud", bg_color=LIGHT_BLUE)
add_label(ax, -6, -1, "API", size=14)
add_label(ax, 0, -1, "Web", size=14)
add_label(ax, 6, -1, "Mobile", size=14)

# Save
save_figure(fig, "network-architecture")
```

---

## Colors Available

```python
BLUE  = '#0072BD'  # Primary
GREEN = '#009E73'  # Success/Data
CYAN  = '#33C9FF'  # Accent
RED   = '#D32F2F'  # Error/Stop
BLACK = 'black'    # Text
WHITE = 'white'    # Background
GRAY  = '#9E9E9E'  # Secondary
LIGHT_BLUE = '#E3F2FD'
LIGHT_GREEN = '#E8F5E9'
LIGHT_RED = '#FFEBEE'
```

---

## For Developers

### Adding New Building Blocks

The template.py functions are designed to be composable. To add a new tool:

1. Ensure the function is in `template.py`
2. The function should accept `ax` as first parameter
3. Add entry to `TEMPLATE_TOOLS` in `mcp_template_server.py`:

```python
"my_new_tool": {
    "function": "my_new_function",
    "description": "Description of what this tool does",
    "parameters": {
        "param1": {"type": "string", "description": "Description"},
        "ax": {"type": "object", "description": "matplotlib axes (auto)", "default": "<auto>"}
    },
},
```

### Testing New Combinations

```bash
# Start server
python mcp_template_server.py

# In another terminal, test new combinations
# via MCP client
```

---

## File Structure

```
docs/
├── mcp-template-guide.md      # This file
├── mcp-guide.md               # Generator-based MCP
└── ai-prompt-guide.md         # AI prompt guide
```

---

## License

This project is part of the Blue Bits - University Diagram Generation Library.