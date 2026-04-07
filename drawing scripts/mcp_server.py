"""
Blue Bits - MCP Server
======================
MCP Server for diagram generation using the Blue Bits library.
Exposes all 57+ diagram generators as tools for AI agents.

Usage:
    python mcp_server.py

Then configure LM Studio to connect to this MCP server.

Requirements:
    pip install mcp
"""

import os
import sys
from datetime import datetime

# Add current directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Import the library
from template import *
from generators import *

# Import FastMCP
from mcp.server.fastmcp import FastMCP

# Create MCP server
mcp = FastMCP("Blue Bits Diagram Generator")

# =========================================================
#                   OUTPUT DIRECTORY
# =========================================================
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "docs", "outputs")
os.makedirs(OUTPUT_DIR, exist_ok=True)


# =========================================================
#                   TOOLS
# =========================================================


@mcp.tool()
def list_diagrams() -> str:
    """
    List all available diagram generators.
    Returns a categorized list of all 57+ diagram types.
    """
    diagrams = """
# Available Diagram Generators

## Computer Principles (3)
- **von_neumann**: Von Neumann Architecture
- **cpu_cycle**: CPU cycle (Fetch, Decode, Execute)
- **memory_hierarchy**: Memory hierarchy

## Programming (6)
- **flowchart_basic**: Basic flowchart
- **loop_trace_table**: Loop trace table
- **recursion_tree**: Recursion call tree
- **linked_list**: Linked list visualization
- **stack**: Stack data structure
- **queue**: Queue data structure

## Data Structures & Algorithms (8)
- **binary_tree**: Binary tree
- **binary_search_tree**: Binary Search Tree
- **hash_table**: Hash table
- **sorting_visualization**: Sorting algorithms
- **dijkstra**: Dijkstra's algorithm
- **dfs_bfs**: DFS vs BFS traversal
- **big_o_comparison**: Big-O complexity
- **dynamic_programming**: Dynamic programming

## Databases (6)
- **er_diagram**: ER Diagram
- **relational_schema**: Relational schema
- **normalization**: Normalization steps
- **bplus_tree**: B+ Tree
- **query_tree**: Query execution tree
- **transaction_schedule**: Transaction schedule

## UML (7)
- **uml_class**: UML Class diagram
- **uml_sequence**: UML Sequence diagram
- **uml_state**: UML State machine
- **uml_activity**: UML Activity diagram
- **uml_use_case**: UML Use Case
- **uml_component**: UML Component
- **uml_deployment**: UML Deployment

## Networks (6)
- **osi_model**: OSI model 7 layers
- **tcp_ip**: TCP/IP model
- **network_topology**: Network topology
- **routing_table**: Routing table
- **packet_flow**: Packet flow
- **dns_resolution**: DNS resolution

## Operating Systems (5)
- **process_state**: Process states
- **scheduling_gantt**: Gantt chart
- **memory_management**: Memory management
- **deadlock**: Deadlock graph
- **semaphore**: Semaphore operations

## Electronics (5)
- **logic_gates**: Logic gates
- **karnaugh_map**: Karnaugh map
- **flip_flop**: Flip-Flop circuit
- **combinational_circuit**: Combinational circuit
- **transistor_circuit**: Transistor circuit

## Mathematics (5)
- **function_plot**: Function plot
- **derivative**: Derivative visualization
- **matrix_operations**: Matrix operations
- **vector_space**: Vector space
- **fourier**: Fourier transform

## AI/ML (5)
- **neural_network**: Neural network
- **decision_tree**: Decision tree
- **search_tree**: Search tree
- **genetic_algorithm**: Genetic algorithm
- **fuzzy_logic**: Fuzzy logic

## Compilers (8)
- **cpu_datapath**: CPU datapath
- **pipeline**: Instruction pipeline
- **cache**: Cache organization
- **instruction_format**: Instruction format
- **compiler_phases**: Compiler phases
- **parse_tree**: Parse tree
- **symbol_table**: Symbol table
- **ast**: Abstract Syntax Tree

## Signal Processing (3)
- **signal_time_freq**: Signal time/frequency
- **filter_response**: Filter response
- **convolution**: Convolution

## Automata (3)
- **dfa**: DFA diagram
- **nfa**: NFA diagram
- **formal_parse_tree**: Formal parse tree

## Security (3)
- **encryption**: Encryption flow
- **attack_tree**: Attack tree
- **pki**: PKI diagram

## Software Engineering (3)
- **sdlc**: SDLC Waterfall
- **agile_scrum**: Agile Scrum
- **design_patterns**: Design patterns

## Computer Graphics (3)
- **2d_transforms**: 2D transforms
- **projection**: 3D projections
- **cnn**: CNN architecture

## Distributed Systems (3)
- **distributed_arch**: Distributed architecture
- **consensus**: Consensus protocol
- **replication**: Data replication
"""
    return diagrams


# --- Section 1: Computer Principles ---


@mcp.tool()
def von_neumann() -> str:
    """Generate Von Neumann Architecture diagram"""
    try:
        fig = generate_von_neumann_architecture()
        ts = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_path = os.path.join(OUTPUT_DIR, f"von_neumann_{ts}")
        save_figure(fig, output_path)
        return f"Generated: {output_path}.svg and {output_path}.png"
    except Exception as e:
        return f"Error: {str(e)}"


@mcp.tool()
def cpu_cycle() -> str:
    """Generate CPU cycle diagram"""
    try:
        fig = generate_cpu_cycle()
        ts = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_path = os.path.join(OUTPUT_DIR, f"cpu_cycle_{ts}")
        save_figure(fig, output_path)
        return f"Generated: {output_path}.svg and {output_path}.png"
    except Exception as e:
        return f"Error: {str(e)}"


@mcp.tool()
def memory_hierarchy() -> str:
    """Generate Memory hierarchy diagram"""
    try:
        fig = generate_memory_hierarchy()
        ts = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_path = os.path.join(OUTPUT_DIR, f"memory_hierarchy_{ts}")
        save_figure(fig, output_path)
        return f"Generated: {output_path}.svg and {output_path}.png"
    except Exception as e:
        return f"Error: {str(e)}"


# --- Section 2: Programming ---


@mcp.tool()
def flowchart_basic(steps: list[str] = None) -> str:
    """Generate basic flowchart"""
    try:
        fig = generate_flowchart_basic()
        ts = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_path = os.path.join(OUTPUT_DIR, f"flowchart_basic_{ts}")
        save_figure(fig, output_path)
        return f"Generated: {output_path}.svg and {output_path}.png"
    except Exception as e:
        return f"Error: {str(e)}"


@mcp.tool()
def loop_trace_table(variable: str = "i", start: int = 1, end: int = 5) -> str:
    """Generate loop trace table"""
    try:
        fig = generate_loop_trace_table()
        ts = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_path = os.path.join(OUTPUT_DIR, f"loop_trace_table_{ts}")
        save_figure(fig, output_path)
        return f"Generated: {output_path}.svg and {output_path}.png"
    except Exception as e:
        return f"Error: {str(e)}"


@mcp.tool()
def recursion_tree(function_name: str = "factorial", depth: int = 3) -> str:
    """Generate recursion tree"""
    try:
        fig = generate_recursion_tree()
        ts = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_path = os.path.join(OUTPUT_DIR, f"recursion_tree_{ts}")
        save_figure(fig, output_path)
        return f"Generated: {output_path}.svg and {output_path}.png"
    except Exception as e:
        return f"Error: {str(e)}"


@mcp.tool()
def linked_list(values: list[str] = None) -> str:
    """Generate linked list visualization"""
    try:
        fig = generate_linked_list_viz()
        ts = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_path = os.path.join(OUTPUT_DIR, f"linked_list_{ts}")
        save_figure(fig, output_path)
        return f"Generated: {output_path}.svg and {output_path}.png"
    except Exception as e:
        return f"Error: {str(e)}"


@mcp.tool()
def stack(values: list[str] = None, operations: list[str] = None) -> str:
    """Generate stack visualization"""
    try:
        fig = generate_stack_viz()
        ts = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_path = os.path.join(OUTPUT_DIR, f"stack_{ts}")
        save_figure(fig, output_path)
        return f"Generated: {output_path}.svg and {output_path}.png"
    except Exception as e:
        return f"Error: {str(e)}"


@mcp.tool()
def queue(values: list[str] = None, operations: list[str] = None) -> str:
    """Generate queue visualization"""
    try:
        fig = generate_queue_viz()
        ts = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_path = os.path.join(OUTPUT_DIR, f"queue_{ts}")
        save_figure(fig, output_path)
        return f"Generated: {output_path}.svg and {output_path}.png"
    except Exception as e:
        return f"Error: {str(e)}"


# --- Section 3: Data Structures & Algorithms ---


@mcp.tool()
def binary_tree(root_value: str = "A") -> str:
    """Generate binary tree"""
    try:
        fig = generate_binary_tree()
        ts = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_path = os.path.join(OUTPUT_DIR, f"binary_tree_{ts}")
        save_figure(fig, output_path)
        return f"Generated: {output_path}.svg and {output_path}.png"
    except Exception as e:
        return f"Error: {str(e)}"


@mcp.tool()
def binary_search_tree(values: list[int] = None) -> str:
    """Generate Binary Search Tree"""
    try:
        fig = generate_binary_search_tree()
        ts = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_path = os.path.join(OUTPUT_DIR, f"binary_search_tree_{ts}")
        save_figure(fig, output_path)
        return f"Generated: {output_path}.svg and {output_path}.png"
    except Exception as e:
        return f"Error: {str(e)}"


@mcp.tool()
def hash_table(entries: list[str] = None) -> str:
    """Generate hash table"""
    try:
        fig = generate_hash_table()
        ts = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_path = os.path.join(OUTPUT_DIR, f"hash_table_{ts}")
        save_figure(fig, output_path)
        return f"Generated: {output_path}.svg and {output_path}.png"
    except Exception as e:
        return f"Error: {str(e)}"


@mcp.tool()
def sorting_visualization(algorithm: str = "bubble") -> str:
    """Generate sorting visualization"""
    try:
        fig = generate_sorting_visualization()
        ts = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_path = os.path.join(OUTPUT_DIR, f"sorting_{ts}")
        save_figure(fig, output_path)
        return f"Generated: {output_path}.svg and {output_path}.png"
    except Exception as e:
        return f"Error: {str(e)}"


@mcp.tool()
def dijkstra(graph_type: str = "weighted") -> str:
    """Generate Dijkstra's algorithm diagram"""
    try:
        fig = generate_graph_dijkstra()
        ts = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_path = os.path.join(OUTPUT_DIR, f"dijkstra_{ts}")
        save_figure(fig, output_path)
        return f"Generated: {output_path}.svg and {output_path}.png"
    except Exception as e:
        return f"Error: {str(e)}"


@mcp.tool()
def dfs_bfs() -> str:
    """Generate DFS vs BFS diagram"""
    try:
        fig = generate_dfs_bfs_traversal()
        ts = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_path = os.path.join(OUTPUT_DIR, f"dfs_bfs_{ts}")
        save_figure(fig, output_path)
        return f"Generated: {output_path}.svg and {output_path}.png"
    except Exception as e:
        return f"Error: {str(e)}"


@mcp.tool()
def big_o_comparison() -> str:
    """Generate Big-O comparison chart"""
    try:
        fig = generate_big_o_comparison()
        ts = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_path = os.path.join(OUTPUT_DIR, f"big_o_{ts}")
        save_figure(fig, output_path)
        return f"Generated: {output_path}.svg and {output_path}.png"
    except Exception as e:
        return f"Error: {str(e)}"


@mcp.tool()
def dynamic_programming(problem: str = "fibonacci") -> str:
    """Generate dynamic programming table"""
    try:
        fig = generate_dynamic_programming_table()
        ts = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_path = os.path.join(OUTPUT_DIR, f"dp_{ts}")
        save_figure(fig, output_path)
        return f"Generated: {output_path}.svg and {output_path}.png"
    except Exception as e:
        return f"Error: {str(e)}"


# --- Section 4: Databases ---


@mcp.tool()
def er_diagram(entities: list[str] = None, relationships: list[str] = None) -> str:
    """Generate ER diagram for university database"""
    try:
        fig = generate_er_diagram_university()
        ts = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_path = os.path.join(OUTPUT_DIR, f"er_diagram_{ts}")
        save_figure(fig, output_path)
        return f"Generated: {output_path}.svg and {output_path}.png"
    except Exception as e:
        return f"Error: {str(e)}"


@mcp.tool()
def relational_schema(tables: list[str] = None) -> str:
    """Generate relational schema"""
    try:
        fig = generate_relational_schema()
        ts = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_path = os.path.join(OUTPUT_DIR, f"relational_schema_{ts}")
        save_figure(fig, output_path)
        return f"Generated: {output_path}.svg and {output_path}.png"
    except Exception as e:
        return f"Error: {str(e)}"


@mcp.tool()
def normalization() -> str:
    """Generate normalization steps diagram"""
    try:
        fig = generate_normalization_steps()
        ts = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_path = os.path.join(OUTPUT_DIR, f"normalization_{ts}")
        save_figure(fig, output_path)
        return f"Generated: {output_path}.svg and {output_path}.png"
    except Exception as e:
        return f"Error: {str(e)}"


@mcp.tool()
def bplus_tree(order: int = 3) -> str:
    """Generate B+ Tree"""
    try:
        fig = generate_bplus_tree()
        ts = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_path = os.path.join(OUTPUT_DIR, f"bplus_tree_{ts}")
        save_figure(fig, output_path)
        return f"Generated: {output_path}.svg and {output_path}.png"
    except Exception as e:
        return f"Error: {str(e)}"


@mcp.tool()
def query_tree() -> str:
    """Generate query execution tree"""
    try:
        fig = generate_query_execution_tree()
        ts = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_path = os.path.join(OUTPUT_DIR, f"query_tree_{ts}")
        save_figure(fig, output_path)
        return f"Generated: {output_path}.svg and {output_path}.png"
    except Exception as e:
        return f"Error: {str(e)}"


@mcp.tool()
def transaction_schedule() -> str:
    """Generate transaction schedule"""
    try:
        fig = generate_transaction_schedule()
        ts = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_path = os.path.join(OUTPUT_DIR, f"transaction_{ts}")
        save_figure(fig, output_path)
        return f"Generated: {output_path}.svg and {output_path}.png"
    except Exception as e:
        return f"Error: {str(e)}"


# --- Section 5: UML ---


@mcp.tool()
def uml_class(
    class_name: str = "MyClass", attributes: list[str] = None, methods: list[str] = None
) -> str:
    """Generate UML Class diagram"""
    try:
        fig = generate_uml_class_diagram()
        ts = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_path = os.path.join(OUTPUT_DIR, f"uml_class_{ts}")
        save_figure(fig, output_path)
        return f"Generated: {output_path}.svg and {output_path}.png"
    except Exception as e:
        return f"Error: {str(e)}"


@mcp.tool()
def uml_sequence(actors: list[str] = None) -> str:
    """Generate UML Sequence diagram"""
    try:
        fig = generate_uml_sequence_diagram()
        ts = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_path = os.path.join(OUTPUT_DIR, f"uml_sequence_{ts}")
        save_figure(fig, output_path)
        return f"Generated: {output_path}.svg and {output_path}.png"
    except Exception as e:
        return f"Error: {str(e)}"


@mcp.tool()
def uml_state(states: list[str] = None) -> str:
    """Generate UML State machine"""
    try:
        fig = generate_uml_state_machine()
        ts = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_path = os.path.join(OUTPUT_DIR, f"uml_state_{ts}")
        save_figure(fig, output_path)
        return f"Generated: {output_path}.svg and {output_path}.png"
    except Exception as e:
        return f"Error: {str(e)}"


@mcp.tool()
def uml_activity() -> str:
    """Generate UML Activity diagram"""
    try:
        fig = generate_uml_activity_diagram()
        ts = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_path = os.path.join(OUTPUT_DIR, f"uml_activity_{ts}")
        save_figure(fig, output_path)
        return f"Generated: {output_path}.svg and {output_path}.png"
    except Exception as e:
        return f"Error: {str(e)}"


@mcp.tool()
def uml_use_case(
    system: str = "System", actors: list[str] = None, use_cases: list[str] = None
) -> str:
    """Generate UML Use Case diagram"""
    try:
        fig = generate_uml_use_case_diagram()
        ts = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_path = os.path.join(OUTPUT_DIR, f"uml_use_case_{ts}")
        save_figure(fig, output_path)
        return f"Generated: {output_path}.svg and {output_path}.png"
    except Exception as e:
        return f"Error: {str(e)}"


@mcp.tool()
def uml_component() -> str:
    """Generate UML Component diagram"""
    try:
        fig = generate_uml_component_diagram()
        ts = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_path = os.path.join(OUTPUT_DIR, f"uml_component_{ts}")
        save_figure(fig, output_path)
        return f"Generated: {output_path}.svg and {output_path}.png"
    except Exception as e:
        return f"Error: {str(e)}"


@mcp.tool()
def uml_deployment() -> str:
    """Generate UML Deployment diagram"""
    try:
        fig = generate_uml_deployment_diagram()
        ts = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_path = os.path.join(OUTPUT_DIR, f"uml_deployment_{ts}")
        save_figure(fig, output_path)
        return f"Generated: {output_path}.svg and {output_path}.png"
    except Exception as e:
        return f"Error: {str(e)}"


# --- Section 6: Networks ---


@mcp.tool()
def osi_model() -> str:
    """Generate OSI model 7 layers"""
    try:
        fig = generate_osi_model()
        ts = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_path = os.path.join(OUTPUT_DIR, f"osi_model_{ts}")
        save_figure(fig, output_path)
        return f"Generated: {output_path}.svg and {output_path}.png"
    except Exception as e:
        return f"Error: {str(e)}"


@mcp.tool()
def tcp_ip() -> str:
    """Generate TCP/IP model"""
    try:
        fig = generate_tcp_ip_model()
        ts = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_path = os.path.join(OUTPUT_DIR, f"tcp_ip_{ts}")
        save_figure(fig, output_path)
        return f"Generated: {output_path}.svg and {output_path}.png"
    except Exception as e:
        return f"Error: {str(e)}"


@mcp.tool()
def network_topology(topology_type: str = "star") -> str:
    """Generate network topology"""
    try:
        fig = generate_network_topology()
        ts = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_path = os.path.join(OUTPUT_DIR, f"network_topology_{ts}")
        save_figure(fig, output_path)
        return f"Generated: {output_path}.svg and {output_path}.png"
    except Exception as e:
        return f"Error: {str(e)}"


@mcp.tool()
def routing_table() -> str:
    """Generate routing table"""
    try:
        fig = generate_routing_table()
        ts = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_path = os.path.join(OUTPUT_DIR, f"routing_table_{ts}")
        save_figure(fig, output_path)
        return f"Generated: {output_path}.svg and {output_path}.png"
    except Exception as e:
        return f"Error: {str(e)}"


@mcp.tool()
def packet_flow() -> str:
    """Generate packet flow diagram"""
    try:
        fig = generate_packet_flow()
        ts = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_path = os.path.join(OUTPUT_DIR, f"packet_flow_{ts}")
        save_figure(fig, output_path)
        return f"Generated: {output_path}.svg and {output_path}.png"
    except Exception as e:
        return f"Error: {str(e)}"


@mcp.tool()
def dns_resolution() -> str:
    """Generate DNS resolution"""
    try:
        fig = generate_dns_resolution()
        ts = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_path = os.path.join(OUTPUT_DIR, f"dns_{ts}")
        save_figure(fig, output_path)
        return f"Generated: {output_path}.svg and {output_path}.png"
    except Exception as e:
        return f"Error: {str(e)}"


# --- Section 7: Operating Systems ---


@mcp.tool()
def process_state() -> str:
    """Generate process state diagram"""
    try:
        fig = generate_process_state_diagram()
        ts = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_path = os.path.join(OUTPUT_DIR, f"process_state_{ts}")
        save_figure(fig, output_path)
        return f"Generated: {output_path}.svg and {output_path}.png"
    except Exception as e:
        return f"Error: {str(e)}"


@mcp.tool()
def scheduling_gantt(processes: list[str] = None) -> str:
    """Generate Gantt chart for CPU scheduling"""
    try:
        fig = generate_scheduling_gantt()
        ts = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_path = os.path.join(OUTPUT_DIR, f"gantt_{ts}")
        save_figure(fig, output_path)
        return f"Generated: {output_path}.svg and {output_path}.png"
    except Exception as e:
        return f"Error: {str(e)}"


@mcp.tool()
def memory_management() -> str:
    """Generate memory management diagram"""
    try:
        fig = generate_memory_management()
        ts = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_path = os.path.join(OUTPUT_DIR, f"memory_mgmt_{ts}")
        save_figure(fig, output_path)
        return f"Generated: {output_path}.svg and {output_path}.png"
    except Exception as e:
        return f"Error: {str(e)}"


@mcp.tool()
def deadlock() -> str:
    """Generate deadlock graph"""
    try:
        fig = generate_deadlock_graph()
        ts = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_path = os.path.join(OUTPUT_DIR, f"deadlock_{ts}")
        save_figure(fig, output_path)
        return f"Generated: {output_path}.svg and {output_path}.png"
    except Exception as e:
        return f"Error: {str(e)}"


@mcp.tool()
def semaphore() -> str:
    """Generate semaphore operations"""
    try:
        fig = generate_semaphore_operations()
        ts = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_path = os.path.join(OUTPUT_DIR, f"semaphore_{ts}")
        save_figure(fig, output_path)
        return f"Generated: {output_path}.svg and {output_path}.png"
    except Exception as e:
        return f"Error: {str(e)}"


# --- Section 8: Electronics ---


@mcp.tool()
def logic_gates() -> str:
    """Generate logic gates"""
    try:
        fig = generate_logic_gates()
        ts = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_path = os.path.join(OUTPUT_DIR, f"logic_gates_{ts}")
        save_figure(fig, output_path)
        return f"Generated: {output_path}.svg and {output_path}.png"
    except Exception as e:
        return f"Error: {str(e)}"


@mcp.tool()
def karnaugh_map(variables: int = 2) -> str:
    """Generate Karnaugh map"""
    try:
        fig = generate_karnaugh_map()
        ts = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_path = os.path.join(OUTPUT_DIR, f"karnaugh_{ts}")
        save_figure(fig, output_path)
        return f"Generated: {output_path}.svg and {output_path}.png"
    except Exception as e:
        return f"Error: {str(e)}"


@mcp.tool()
def flip_flop(ff_type: str = "SR") -> str:
    """Generate Flip-Flop circuit"""
    try:
        fig = generate_flip_flop_circuit()
        ts = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_path = os.path.join(OUTPUT_DIR, f"flip_flop_{ts}")
        save_figure(fig, output_path)
        return f"Generated: {output_path}.svg and {output_path}.png"
    except Exception as e:
        return f"Error: {str(e)}"


@mcp.tool()
def combinational_circuit() -> str:
    """Generate combinational circuit"""
    try:
        fig = generate_combinational_circuit()
        ts = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_path = os.path.join(OUTPUT_DIR, f"combinational_{ts}")
        save_figure(fig, output_path)
        return f"Generated: {output_path}.svg and {output_path}.png"
    except Exception as e:
        return f"Error: {str(e)}"


@mcp.tool()
def transistor_circuit() -> str:
    """Generate transistor circuit"""
    try:
        fig = generate_transistor_circuit()
        ts = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_path = os.path.join(OUTPUT_DIR, f"transistor_{ts}")
        save_figure(fig, output_path)
        return f"Generated: {output_path}.svg and {output_path}.png"
    except Exception as e:
        return f"Error: {str(e)}"


# --- Section 9: Mathematics ---


@mcp.tool()
def function_plot(expression: str = "x^2") -> str:
    """Generate function plot"""
    try:
        fig = generate_function_plot()
        ts = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_path = os.path.join(OUTPUT_DIR, f"function_{ts}")
        save_figure(fig, output_path)
        return f"Generated: {output_path}.svg and {output_path}.png"
    except Exception as e:
        return f"Error: {str(e)}"


@mcp.tool()
def derivative(function: str = "x^2") -> str:
    """Generate derivative visualization"""
    try:
        fig = generate_derivative_visualization()
        ts = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_path = os.path.join(OUTPUT_DIR, f"derivative_{ts}")
        save_figure(fig, output_path)
        return f"Generated: {output_path}.svg and {output_path}.png"
    except Exception as e:
        return f"Error: {str(e)}"


@mcp.tool()
def matrix_operations() -> str:
    """Generate matrix operations"""
    try:
        fig = generate_matrix_operations()
        ts = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_path = os.path.join(OUTPUT_DIR, f"matrix_{ts}")
        save_figure(fig, output_path)
        return f"Generated: {output_path}.svg and {output_path}.png"
    except Exception as e:
        return f"Error: {str(e)}"


@mcp.tool()
def vector_space() -> str:
    """Generate vector space"""
    try:
        fig = generate_vector_space()
        ts = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_path = os.path.join(OUTPUT_DIR, f"vector_space_{ts}")
        save_figure(fig, output_path)
        return f"Generated: {output_path}.svg and {output_path}.png"
    except Exception as e:
        return f"Error: {str(e)}"


@mcp.tool()
def fourier() -> str:
    """Generate Fourier transform"""
    try:
        fig = generate_fourier_transform()
        ts = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_path = os.path.join(OUTPUT_DIR, f"fourier_{ts}")
        save_figure(fig, output_path)
        return f"Generated: {output_path}.svg and {output_path}.png"
    except Exception as e:
        return f"Error: {str(e)}"


# --- Section 10: AI/ML ---


@mcp.tool()
def neural_network(layers: list[int] = None) -> str:
    """Generate neural network architecture"""
    try:
        fig = generate_neural_network()
        ts = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_path = os.path.join(OUTPUT_DIR, f"neural_network_{ts}")
        save_figure(fig, output_path)
        return f"Generated: {output_path}.svg and {output_path}.png"
    except Exception as e:
        return f"Error: {str(e)}"


@mcp.tool()
def decision_tree() -> str:
    """Generate decision tree"""
    try:
        fig = generate_decision_tree()
        ts = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_path = os.path.join(OUTPUT_DIR, f"decision_tree_{ts}")
        save_figure(fig, output_path)
        return f"Generated: {output_path}.svg and {output_path}.png"
    except Exception as e:
        return f"Error: {str(e)}"


@mcp.tool()
def search_tree() -> str:
    """Generate search tree"""
    try:
        fig = generate_search_tree()
        ts = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_path = os.path.join(OUTPUT_DIR, f"search_tree_{ts}")
        save_figure(fig, output_path)
        return f"Generated: {output_path}.svg and {output_path}.png"
    except Exception as e:
        return f"Error: {str(e)}"


@mcp.tool()
def genetic_algorithm() -> str:
    """Generate genetic algorithm"""
    try:
        fig = generate_genetic_algorithm()
        ts = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_path = os.path.join(OUTPUT_DIR, f"genetic_{ts}")
        save_figure(fig, output_path)
        return f"Generated: {output_path}.svg and {output_path}.png"
    except Exception as e:
        return f"Error: {str(e)}"


@mcp.tool()
def fuzzy_logic() -> str:
    """Generate fuzzy logic sets"""
    try:
        fig = generate_fuzzy_logic_sets()
        ts = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_path = os.path.join(OUTPUT_DIR, f"fuzzy_{ts}")
        save_figure(fig, output_path)
        return f"Generated: {output_path}.svg and {output_path}.png"
    except Exception as e:
        return f"Error: {str(e)}"


# --- Section 11: Compilers ---


@mcp.tool()
def cpu_datapath() -> str:
    """Generate CPU datapath"""
    try:
        fig = generate_cpu_datapath()
        ts = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_path = os.path.join(OUTPUT_DIR, f"cpu_datapath_{ts}")
        save_figure(fig, output_path)
        return f"Generated: {output_path}.svg and {output_path}.png"
    except Exception as e:
        return f"Error: {str(e)}"


@mcp.tool()
def pipeline() -> str:
    """Generate pipeline diagram"""
    try:
        fig = generate_pipeline_diagram()
        ts = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_path = os.path.join(OUTPUT_DIR, f"pipeline_{ts}")
        save_figure(fig, output_path)
        return f"Generated: {output_path}.svg and {output_path}.png"
    except Exception as e:
        return f"Error: {str(e)}"


@mcp.tool()
def cache() -> str:
    """Generate cache organization"""
    try:
        fig = generate_cache_organization()
        ts = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_path = os.path.join(OUTPUT_DIR, f"cache_{ts}")
        save_figure(fig, output_path)
        return f"Generated: {output_path}.svg and {output_path}.png"
    except Exception as e:
        return f"Error: {str(e)}"


@mcp.tool()
def instruction_format() -> str:
    """Generate instruction format"""
    try:
        fig = generate_instruction_format()
        ts = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_path = os.path.join(OUTPUT_DIR, f"instruction_{ts}")
        save_figure(fig, output_path)
        return f"Generated: {output_path}.svg and {output_path}.png"
    except Exception as e:
        return f"Error: {str(e)}"


@mcp.tool()
def compiler_phases() -> str:
    """Generate compiler phases"""
    try:
        fig = generate_compiler_phases()
        ts = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_path = os.path.join(OUTPUT_DIR, f"compiler_{ts}")
        save_figure(fig, output_path)
        return f"Generated: {output_path}.svg and {output_path}.png"
    except Exception as e:
        return f"Error: {str(e)}"


@mcp.tool()
def parse_tree() -> str:
    """Generate parse tree"""
    try:
        fig = generate_parse_tree()
        ts = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_path = os.path.join(OUTPUT_DIR, f"parse_tree_{ts}")
        save_figure(fig, output_path)
        return f"Generated: {output_path}.svg and {output_path}.png"
    except Exception as e:
        return f"Error: {str(e)}"


@mcp.tool()
def symbol_table() -> str:
    """Generate symbol table"""
    try:
        fig = generate_symbol_table()
        ts = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_path = os.path.join(OUTPUT_DIR, f"symbol_table_{ts}")
        save_figure(fig, output_path)
        return f"Generated: {output_path}.svg and {output_path}.png"
    except Exception as e:
        return f"Error: {str(e)}"


@mcp.tool()
def ast() -> str:
    """Generate Abstract Syntax Tree"""
    try:
        fig = generate_ast_diagram()
        ts = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_path = os.path.join(OUTPUT_DIR, f"ast_{ts}")
        save_figure(fig, output_path)
        return f"Generated: {output_path}.svg and {output_path}.png"
    except Exception as e:
        return f"Error: {str(e)}"


# --- Section 12: Signal Processing ---


@mcp.tool()
def signal_time_freq() -> str:
    """Generate signal time/frequency"""
    try:
        fig = generate_signal_time_frequency()
        ts = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_path = os.path.join(OUTPUT_DIR, f"signal_{ts}")
        save_figure(fig, output_path)
        return f"Generated: {output_path}.svg and {output_path}.png"
    except Exception as e:
        return f"Error: {str(e)}"


@mcp.tool()
def filter_response() -> str:
    """Generate filter response"""
    try:
        fig = generate_filter_response()
        ts = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_path = os.path.join(OUTPUT_DIR, f"filter_{ts}")
        save_figure(fig, output_path)
        return f"Generated: {output_path}.svg and {output_path}.png"
    except Exception as e:
        return f"Error: {str(e)}"


@mcp.tool()
def convolution() -> str:
    """Generate convolution visualization"""
    try:
        fig = generate_convolution_visual()
        ts = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_path = os.path.join(OUTPUT_DIR, f"convolution_{ts}")
        save_figure(fig, output_path)
        return f"Generated: {output_path}.svg and {output_path}.png"
    except Exception as e:
        return f"Error: {str(e)}"


# --- Section 13: Automata ---


@mcp.tool()
def dfa(states: list[str] = None, alphabet: list[str] = None) -> str:
    """Generate DFA diagram"""
    try:
        fig = generate_dfa_diagram()
        ts = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_path = os.path.join(OUTPUT_DIR, f"dfa_{ts}")
        save_figure(fig, output_path)
        return f"Generated: {output_path}.svg and {output_path}.png"
    except Exception as e:
        return f"Error: {str(e)}"


@mcp.tool()
def nfa() -> str:
    """Generate NFA diagram"""
    try:
        fig = generate_nfa_diagram()
        ts = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_path = os.path.join(OUTPUT_DIR, f"nfa_{ts}")
        save_figure(fig, output_path)
        return f"Generated: {output_path}.svg and {output_path}.png"
    except Exception as e:
        return f"Error: {str(e)}"


@mcp.tool()
def formal_parse_tree() -> str:
    """Generate formal parse tree"""
    try:
        fig = generate_parse_tree_formal()
        ts = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_path = os.path.join(OUTPUT_DIR, f"formal_parse_{ts}")
        save_figure(fig, output_path)
        return f"Generated: {output_path}.svg and {output_path}.png"
    except Exception as e:
        return f"Error: {str(e)}"


# --- Section 14: Security ---


@mcp.tool()
def encryption() -> str:
    """Generate encryption flow"""
    try:
        fig = generate_encryption_flow()
        ts = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_path = os.path.join(OUTPUT_DIR, f"encryption_{ts}")
        save_figure(fig, output_path)
        return f"Generated: {output_path}.svg and {output_path}.png"
    except Exception as e:
        return f"Error: {str(e)}"


@mcp.tool()
def attack_tree() -> str:
    """Generate attack tree"""
    try:
        fig = generate_attack_tree()
        ts = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_path = os.path.join(OUTPUT_DIR, f"attack_tree_{ts}")
        save_figure(fig, output_path)
        return f"Generated: {output_path}.svg and {output_path}.png"
    except Exception as e:
        return f"Error: {str(e)}"


@mcp.tool()
def pki() -> str:
    """Generate PKI diagram"""
    try:
        fig = generate_pki_diagram()
        ts = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_path = os.path.join(OUTPUT_DIR, f"pki_{ts}")
        save_figure(fig, output_path)
        return f"Generated: {output_path}.svg and {output_path}.png"
    except Exception as e:
        return f"Error: {str(e)}"


# --- Section 15: Software Engineering ---


@mcp.tool()
def sdlc() -> str:
    """Generate SDLC Waterfall"""
    try:
        fig = generate_sdlc_waterfall()
        ts = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_path = os.path.join(OUTPUT_DIR, f"sdlc_{ts}")
        save_figure(fig, output_path)
        return f"Generated: {output_path}.svg and {output_path}.png"
    except Exception as e:
        return f"Error: {str(e)}"


@mcp.tool()
def agile_scrum() -> str:
    """Generate Agile Scrum"""
    try:
        fig = generate_agile_scrum()
        ts = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_path = os.path.join(OUTPUT_DIR, f"scrum_{ts}")
        save_figure(fig, output_path)
        return f"Generated: {output_path}.svg and {output_path}.png"
    except Exception as e:
        return f"Error: {str(e)}"


@mcp.tool()
def design_patterns() -> str:
    """Generate design patterns"""
    try:
        fig = generate_design_patterns()
        ts = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_path = os.path.join(OUTPUT_DIR, f"design_patterns_{ts}")
        save_figure(fig, output_path)
        return f"Generated: {output_path}.svg and {output_path}.png"
    except Exception as e:
        return f"Error: {str(e)}"


# --- Section 16: Computer Graphics ---


@mcp.tool()
def transforms_2d() -> str:
    """Generate 2D transforms"""
    try:
        fig = generate_2d_transforms()
        ts = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_path = os.path.join(OUTPUT_DIR, f"2d_transforms_{ts}")
        save_figure(fig, output_path)
        return f"Generated: {output_path}.svg and {output_path}.png"
    except Exception as e:
        return f"Error: {str(e)}"


@mcp.tool()
def projection() -> str:
    """Generate 3D projections"""
    try:
        fig = generate_projection_types()
        ts = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_path = os.path.join(OUTPUT_DIR, f"projection_{ts}")
        save_figure(fig, output_path)
        return f"Generated: {output_path}.svg and {output_path}.png"
    except Exception as e:
        return f"Error: {str(e)}"


@mcp.tool()
def cnn() -> str:
    """Generate CNN architecture"""
    try:
        fig = generate_cnn_architecture()
        ts = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_path = os.path.join(OUTPUT_DIR, f"cnn_{ts}")
        save_figure(fig, output_path)
        return f"Generated: {output_path}.svg and {output_path}.png"
    except Exception as e:
        return f"Error: {str(e)}"


# --- Section 17: Distributed Systems ---


@mcp.tool()
def distributed_arch() -> str:
    """Generate distributed architecture"""
    try:
        fig = generate_distributed_architecture()
        ts = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_path = os.path.join(OUTPUT_DIR, f"distributed_{ts}")
        save_figure(fig, output_path)
        return f"Generated: {output_path}.svg and {output_path}.png"
    except Exception as e:
        return f"Error: {str(e)}"


@mcp.tool()
def consensus() -> str:
    """Generate consensus protocol"""
    try:
        fig = generate_consensus_protocol()
        ts = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_path = os.path.join(OUTPUT_DIR, f"consensus_{ts}")
        save_figure(fig, output_path)
        return f"Generated: {output_path}.svg and {output_path}.png"
    except Exception as e:
        return f"Error: {str(e)}"


@mcp.tool()
def replication() -> str:
    """Generate data replication"""
    try:
        fig = generate_replication_diagram()
        ts = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_path = os.path.join(OUTPUT_DIR, f"replication_{ts}")
        save_figure(fig, output_path)
        return f"Generated: {output_path}.svg and {output_path}.png"
    except Exception as e:
        return f"Error: {str(e)}"


# =========================================================
#                   MAIN
# =========================================================

if __name__ == "__main__":
    print("=" * 60)
    print("Blue Bits - MCP Diagram Generator Server")
    print("=" * 60)
    print(f"\nOutput directory: {OUTPUT_DIR}")
    print("\nStarting MCP server (stdio mode)...")
    print("\nTo use with LM Studio:")
    print("1. Open LM Studio")
    print("2. Go to Settings > MCP Servers")
    print("3. Add a new server:")
    print("   - Command: python /path/to/mcp_server.py")
    print("4. Load Qwen2.5-VL model")
    print("5. The AI can now call diagram generation tools!\n")

    # Run the server
    mcp.run(transport="stdio")
