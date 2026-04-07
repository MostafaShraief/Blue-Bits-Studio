# Blue Bits - MCP Server Guide

## Overview

This MCP server exposes all **57+ diagram generators** as tools that AI agents can call directly. It's designed to work with vision-enabled AI models (like Qwen2.5-VL in LM Studio) to analyze handwritten diagrams and generate clean digital outputs.

---

## Quick Start

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

If you get an error about MCP not found, install it separately:

```bash
pip install mcp
```

### 2. Start the MCP Server

```bash
python mcp_server.py
```

The server will start and wait for connections from MCP clients.

### 3. Connect to LM Studio

1. Open **LM Studio**
2. Go to **Settings** → **MCP Servers**
3. Add a new server:
   - **Name**: Blue Bits Diagram Generator
   - **Command**: `python /full/path/to/mcp_server.py`
   - **Working Directory**: `/full/path/to/`
4. Click **Save** and **Connect**
5. Load your vision model (Qwen2.5-VL or similar)

---

## How It Works

### Workflow

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────────┐
│  Handwritten    │    │  Vision AI       │    │  MCP Server         │
│  Diagram Image  │───▶│  (Qwen2.5-VL)    │───▶│  (diagram tools)    │
└─────────────────┘    │  analyzes what   │    │  generates clean    │
                     │  it sees         │    │  digital diagram    │
                     └──────────────────┘    └─────────────────────┘
```

### Example Usage

**User's Handwritten Image**: A rough ER diagram on paper showing:
- Entities: Student, Course, Department
- Relationships: Student enrolls in Course, Department offers Course

**AI Analysis** (Qwen2.5-VL sees the image):

> "This is an ER diagram for a university database. It has three entities: Student (with attributes: id, name), Course (with attributes: code, name), and Department (with attributes: name). There are two relationships: Student -> Course (enrollment, 1:N) and Department -> Course (offers, 1:N)."

**AI calling the MCP tool**:

```
Tool: er_diagram
Arguments: {
    "entities": ["Student (id, name)", "Course (code, name)", "Department (name)"],
    "relationships": ["Student → Course (enrollment, 1:N)", "Department → Course (offers, 1:N)"]
}
```

**Result**: The MCP server generates a clean, professional ER diagram and saves it to `docs/outputs/`.

---

## Template Functions Available (104 Total)

The template.py provides a comprehensive set of drawing functions:

### Basic Helpers (29)
- `setup_canvas()` - Create figure with transparent background
- `save_figure()` - Save as SVG+PNG
- `get_font_prop()` / `get_code_font_prop()` - Font properties
- `handle_arabic()` - Arabic text reshaping
- `add_rich_text()` - Multi-colored mixed text
- `add_text()` - Simple Arabic text
- `draw_box()` - Rectangle with centered text
- `draw_circle()` - Circle with text
- `draw_diamond()` - Diamond shape (ER relationships)
- `draw_arrow()` - Arrow with optional label
- `draw_table()` - Table grid
- `draw_entity()` / `draw_relationship()` / `draw_attribute()` - ER components
- `add_title()` / `add_subtitle()` / `add_label()` / `add_legend()` - Labels
- `add_code_block()` / `add_math_expression()` - Code & math
- `add_watermark()` / `add_divider()` / `add_caption()` - Visual extras

### Flowchart Shapes (5)
- `draw_parallelogram()` - I/O shape
- `draw_hexagon()` - Decision shape
- `draw_stadium()` - Start/End shape
- `draw_cloud()` - Cloud shape
- `draw_cylinder()` - Database shape

### UML/Software Diagram (5)
- `draw_package()` - UML package
- `draw_port()` - UML port
- `draw_node()` - Deployment node
- `draw_interface()` - UML interface (lollipop)
- `draw_artifact()` - Deployment artifact

### Network/Cloud (4)
- `draw_cloud_shape()` - Cloud computing shape
- `draw_server()` - Server box
- `draw_database_cylinder()` - Database cylinder
- `draw_device()` - Network device

### Advanced Connectors (5)
- `draw_orthogonal_arrow()` - Right-angle arrow
- `draw_curved_arrow()` - Curved arrow
- `draw_dashed_arrow()` - Dashed arrow
- `draw_double_arrow()` - Bidirectional arrow
- `draw_arrow_with_label()` - Arrow with text label

### Layout & Grid (4)
- `draw_grid()` - Grid overlay
- `add_axis()` - X/Y axis
- `draw_ruler()` - Ruler marks
- `snap_to_grid()` - Grid snapping

### Visual Annotations (5)
- `draw_callout()` - Callout bubble
- `draw_bubble()` - Speech bubble
- `draw_footnote()` - Footnote
- `draw_sticky_note()` - Sticky note
- `draw_highlight_box()` - Highlight box

### Grouping & Styling (3)
- `draw_group()` - Group container
- `draw_shadow()` - Drop shadow
- `draw_dotted_box()` - Dotted border box

### Data Visualization (4)
- `draw_bar()` - Bar chart element
- `draw_pie_slice()` - Pie chart slice
- `draw_legend_item()` - Legend entry
- `draw_axis_line()` - Axis line

### Advanced Text (4)
- `add_rotated_text()` - Rotated text
- `add_vertical_text()` - Vertical text
- `add_text_with_bg()` - Text with background
- `add_code_with_syntax()` - Syntax highlighted code

### Math & Statistics (7)
- `draw_function_graph()` - Math function plot
- `draw_histogram()` - Statistical histogram
- `draw_boxplot()` - Box and whisker
- `draw_scatter_plot()` - Scatter with regression
- `draw_normal_curve()` - Bell curve
- `draw_vector_field()` - Vector field arrows
- `draw_equation()` - Math equation

### Algorithm & CS (6)
- `draw_pseudocode_block()` - Pseudo-code block
- `draw_complexity_label()` - Big-O notation
- `draw_step_indicator()` - Step number circle
- `draw_state_diagram()` - State machine
- `draw_transition_table()` - Transition table
- `draw_recursion_tree_enhanced()` - Enhanced recursion tree

### Timing & Signal (4)
- `draw_timing_diagram()` - Timing waveforms
- `draw_signal_waveform()` - Signal timing
- `draw_pipeline_stage()` - CPU pipeline stage
- `draw_bus_diagram()` - Data bus diagram

### Electronics & Circuits (5)
- `draw_logic_gate()` - Logic gate (AND/OR/NOT/NAND/NOR)
- `draw_register_box()` - Register block
- `draw_alu_block()` - ALU component
- `draw_memory_array()` - Memory layout
- `draw_mux_demux()` - Multiplexer/demultiplexer

### Enhanced UML (3)
- `draw_sequence_fragment()` - Sequence diagram fragment (loop/alt)
- `draw_activation_box()` - Activation duration box
- `draw_self_message()` - Self-referential message

### Process/OS (4)
- `draw_process_tree()` - Process tree
- `draw_memory_layout()` - Memory layout (stack/heap)
- `draw_page_table()` - MMU page table
- `draw_thread_block()` - Thread visualization

### Database Enhancements (3)
- `draw_foreign_key_arrow()` - FK relationship
- `draw_primary_key_indicator()` - PK marker
- `draw_view_box()` - SQL view box

### Network Enhancements (3)
- `draw_packet_header()` - Protocol header
- `draw_protocol_stack()` - OSI/TCP-IP stack
- `draw_network_timeline()` - Network event timeline

---

## Available Diagram Generators (57 Total)

### Categories

| Category | Tool Count | Examples |
|----------|------------|----------|
| Computer Principles | 3 | von_neumann, cpu_cycle, memory_hierarchy |
| Programming | 6 | flowchart_basic, loop_trace_table, stack, queue, linked_list, recursion_tree |
| Data Structures & Algorithms | 8 | binary_tree, bst, hash_table, sorting, dijkstra, big_o_comparison, dfs_bfs, dynamic_programming |
| Databases | 6 | er_diagram, relational_schema, normalization, bplus_tree, query_execution, transaction |
| UML | 7 | uml_class, uml_sequence, uml_state, uml_activity, uml_use_case, uml_component, uml_deployment |
| Networks | 6 | osi_model, tcp_ip_model, network_topology, routing_table, packet_flow, dns_resolution |
| Operating Systems | 5 | process_state, scheduling_gantt, memory_management, deadlock_graph, semaphore_ops |
| Electronics | 5 | logic_gates, karnaugh_map, flip_flop_circuit, combinational_circuit, transistor_circuit |
| Mathematics | 5 | function_plot, derivative_visualization, matrix_operations, vector_space, fourier_transform |
| AI/ML | 5 | neural_network, decision_tree, search_tree, genetic_algorithm, fuzzy_logic_sets |
| Computer Architecture | 4 | cpu_datapath, pipeline_diagram, cache_organization, instruction_format |
| Formal Languages | 3 | dfa_diagram, nfa_diagram, parse_tree_formal |

**Total: 57+ diagram generators**

---

## Tool Reference

### Basic Usage

```python
# Example: Generate an ER diagram
Tool: er_diagram
Arguments: {
    "entities": ["Student(id, name)", "Course(code, name)", "Department(name)"],
    "relationships": ["Student -enrolls-> Course", "Department -offers-> Course"]
}
```

### Common Tools

| Tool ID | Description | Parameters |
|---------|-------------|------------|
| `er_diagram` | ER Diagram | entities, relationships |
| `flowchart_basic` | Basic Flowchart | steps (array) |
| `binary_tree` | Binary Tree | root_value |
| `uml_class` | UML Class Diagram | class_name, attributes, methods |
| `osi_model` | OSI Model 7 Layers | (none) |
| `neural_network` | Neural Network Architecture | layers (array) |
| `von_neumann` | Von Neumann Architecture | (none) |
| `function_plot` | Math Function Graph | expr, x_range |
| `logic_gates` | Logic Gates Diagram | gates (array) |
| `process_state` | Process State Diagram | states (array) |

---

## Output

Generated diagrams are saved to:

```
docs/outputs/
├── er_diagram_20260118_143022.svg
├── er_diagram_20260118_143022.png
├── flowchart_basic_20260118_143045.svg
├── flowchart_basic_20260118_143045.png
└── ...
```

The server creates:
- **SVG** file (vector, scalable)
- **PNG** file (300 DPI, high quality)

---

## Prompt Template for Vision AI

When using the vision AI, you can provide this context:

```
You are a diagram generation assistant. The Blue Bits library provides 57+ diagram generators and 104 template functions.

Available template functions:
- Basic shapes: draw_box, draw_circle, draw_diamond, draw_arrow, draw_table
- Flowchart: draw_parallelogram, draw_hexagon, draw_stadium, draw_cloud, draw_cylinder
- UML: draw_package, draw_port, draw_node, draw_interface, draw_artifact
- Advanced: draw_curved_arrow, draw_orthogonal_arrow, draw_dashed_arrow
- Math: draw_function_graph, draw_histogram, draw_scatter_plot, draw_normal_curve
- Algorithms: draw_pseudocode_block, draw_state_diagram, draw_complexity_label

Available generators:
- Computer: von_neumann, cpu_cycle, memory_hierarchy
- Programming: flowchart, loop_trace, stack, queue, linked_list
- Data Structures: binary_tree, hash_table, sorting, dijkstra
- Databases: er_diagram, relational_schema, normalization
- UML: uml_class, uml_sequence, uml_state, uml_activity
- Networks: osi_model, tcp_ip, network_topology
- OS: process_state, scheduling_gantt, deadlock
- AI: neural_network, decision_tree, genetic_algorithm

When the user shows you a handwritten diagram:
1. Identify the diagram type
2. Extract the key elements (entities, nodes, labels)
3. Call the appropriate MCP tool with the right parameters
4. The diagram will be generated and saved automatically

Output format: "Generated [diagram_type] diagram: [output_path]"
```

---

## Troubleshooting

### MCP package not found
```bash
pip install mcp
```

### Server won't start
- Make sure you're in the correct directory
- Check that all dependencies are installed: `pip install -r requirements.txt`

### LM Studio can't connect
- Ensure the path to mcp_server.py is absolute (full path)
- Check that Python is in your PATH

### Diagram not generating
- Check the docs/outputs/ folder for error files
- Look at console output for error messages

---

## For Developers

### Adding New Diagram Tools

Edit `mcp_server.py` and add entries to `DIAGRAM_TOOLS`:

```python
"my_diagram": {
    "function": "generate_my_diagram",  # Must match function name in generators.py
    "description": "Description of what this diagram shows",
    "parameters": {
        "param1": {"type": "string", "description": "Description"},
        "param2": {"type": "integer", "description": "Description"},
    },
},
```

### Testing Locally

```bash
# Start server
python mcp_server.py

# In another terminal, test a diagram
# (requires MCP client)
```

---

## License

This project is part of the Blue Bits - University Diagram Generation Library.