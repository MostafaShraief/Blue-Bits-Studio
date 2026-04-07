"""
Comprehensive Tests for generators.py
======================================
Tests all 57 diagram generator functions.
Run: python test_generators_all.py
"""

import matplotlib

matplotlib.use("Agg")

import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

import matplotlib.pyplot as plt
import os
import traceback

from template import *
import generators

OUTPUT_DIR = "test-output/generators"
os.makedirs(OUTPUT_DIR, exist_ok=True)

results = []


def log(test_name, status, details=""):
    results.append((test_name, status, details))
    icon = "PASS" if status == "PASS" else "FAIL"
    print(f"  [{icon}] {test_name}")
    if details and status == "FAIL":
        print(f"     Error: {details}")


# =========================================================
# SECTION 1: Computer Principles (3 functions)
# =========================================================
def test_computer_principles():
    print("\n--- Section 1: Computer Principles ---")

    funcs = [
        (
            "generate_von_neumann_architecture",
            generators.generate_von_neumann_architecture,
        ),
        ("generate_cpu_cycle", generators.generate_cpu_cycle),
        ("generate_memory_hierarchy", generators.generate_memory_hierarchy),
    ]

    for name, func in funcs:
        try:
            fig = func()
            assert fig is not None
            # Save for visual verification
            save_figure(fig, f"{OUTPUT_DIR}/{name}")
            log(name, "PASS")
        except Exception as e:
            log(name, "FAIL", str(e))
            plt.close("all")


# =========================================================
# SECTION 2: Programming (6 functions)
# =========================================================
def test_programming():
    print("\n--- Section 2: Programming ---")

    funcs = [
        ("generate_flowchart_basic", generators.generate_flowchart_basic),
        ("generate_loop_trace_table", generators.generate_loop_trace_table),
        ("generate_recursion_tree", generators.generate_recursion_tree),
        ("generate_linked_list_viz", generators.generate_linked_list_viz),
        ("generate_stack_viz", generators.generate_stack_viz),
        ("generate_queue_viz", generators.generate_queue_viz),
    ]

    for name, func in funcs:
        try:
            fig = func()
            assert fig is not None
            save_figure(fig, f"{OUTPUT_DIR}/{name}")
            log(name, "PASS")
        except Exception as e:
            log(name, "FAIL", str(e))
            plt.close("all")


# =========================================================
# SECTION 3: Data Structures (8 functions)
# =========================================================
def test_data_structures():
    print("\n--- Section 3: Data Structures & Algorithms ---")

    funcs = [
        ("generate_binary_tree", generators.generate_binary_tree),
        ("generate_binary_search_tree", generators.generate_binary_search_tree),
        ("generate_hash_table", generators.generate_hash_table),
        ("generate_sorting_visualization", generators.generate_sorting_visualization),
        ("generate_graph_dijkstra", generators.generate_graph_dijkstra),
        ("generate_dfs_bfs_traversal", generators.generate_dfs_bfs_traversal),
        ("generate_big_o_comparison", generators.generate_big_o_comparison),
        (
            "generate_dynamic_programming_table",
            generators.generate_dynamic_programming_table,
        ),
    ]

    for name, func in funcs:
        try:
            fig = func()
            assert fig is not None
            save_figure(fig, f"{OUTPUT_DIR}/{name}")
            log(name, "PASS")
        except Exception as e:
            log(name, "FAIL", str(e))
            plt.close("all")


# =========================================================
# SECTION 4: Databases (6 functions)
# =========================================================
def test_databases():
    print("\n--- Section 4: Databases ---")

    funcs = [
        ("generate_er_diagram_university", generators.generate_er_diagram_university),
        ("generate_relational_schema", generators.generate_relational_schema),
        ("generate_normalization_steps", generators.generate_normalization_steps),
        ("generate_bplus_tree", generators.generate_bplus_tree),
        ("generate_query_execution_tree", generators.generate_query_execution_tree),
        ("generate_transaction_schedule", generators.generate_transaction_schedule),
    ]

    for name, func in funcs:
        try:
            fig = func()
            assert fig is not None
            save_figure(fig, f"{OUTPUT_DIR}/{name}")
            log(name, "PASS")
        except Exception as e:
            log(name, "FAIL", str(e))
            plt.close("all")


# =========================================================
# SECTION 5: UML (7 functions)
# =========================================================
def test_uml():
    print("\n--- Section 5: UML Diagrams ---")

    funcs = [
        ("generate_uml_class_diagram", generators.generate_uml_class_diagram),
        ("generate_uml_sequence_diagram", generators.generate_uml_sequence_diagram),
        ("generate_uml_state_machine", generators.generate_uml_state_machine),
        ("generate_uml_activity_diagram", generators.generate_uml_activity_diagram),
        ("generate_uml_use_case_diagram", generators.generate_uml_use_case_diagram),
        ("generate_uml_component_diagram", generators.generate_uml_component_diagram),
        ("generate_uml_deployment_diagram", generators.generate_uml_deployment_diagram),
    ]

    for name, func in funcs:
        try:
            fig = func()
            assert fig is not None
            save_figure(fig, f"{OUTPUT_DIR}/{name}")
            log(name, "PASS")
        except Exception as e:
            log(name, "FAIL", str(e))
            plt.close("all")


# =========================================================
# SECTION 6: Networks (6 functions)
# =========================================================
def test_networks():
    print("\n--- Section 6: Networks ---")

    funcs = [
        ("generate_osi_model", generators.generate_osi_model),
        ("generate_tcp_ip_model", generators.generate_tcp_ip_model),
        ("generate_network_topology", generators.generate_network_topology),
        ("generate_routing_table", generators.generate_routing_table),
        ("generate_packet_flow", generators.generate_packet_flow),
        ("generate_dns_resolution", generators.generate_dns_resolution),
    ]

    for name, func in funcs:
        try:
            fig = func()
            assert fig is not None
            save_figure(fig, f"{OUTPUT_DIR}/{name}")
            log(name, "PASS")
        except Exception as e:
            log(name, "FAIL", str(e))
            plt.close("all")


# =========================================================
# SECTION 7: OS (5 functions)
# =========================================================
def test_os():
    print("\n--- Section 7: Operating Systems ---")

    funcs = [
        ("generate_process_state_diagram", generators.generate_process_state_diagram),
        ("generate_scheduling_gantt", generators.generate_scheduling_gantt),
        ("generate_memory_management", generators.generate_memory_management),
        ("generate_deadlock_graph", generators.generate_deadlock_graph),
        ("generate_semaphore_operations", generators.generate_semaphore_operations),
    ]

    for name, func in funcs:
        try:
            fig = func()
            assert fig is not None
            save_figure(fig, f"{OUTPUT_DIR}/{name}")
            log(name, "PASS")
        except Exception as e:
            log(name, "FAIL", str(e))
            plt.close("all")


# =========================================================
# SECTION 8: Electronics (5 functions)
# =========================================================
def test_electronics():
    print("\n--- Section 8: Electronics ---")

    funcs = [
        ("generate_logic_gates", generators.generate_logic_gates),
        ("generate_karnaugh_map", generators.generate_karnaugh_map),
        ("generate_flip_flop_circuit", generators.generate_flip_flop_circuit),
        ("generate_combinational_circuit", generators.generate_combinational_circuit),
        ("generate_transistor_circuit", generators.generate_transistor_circuit),
    ]

    for name, func in funcs:
        try:
            fig = func()
            assert fig is not None
            save_figure(fig, f"{OUTPUT_DIR}/{name}")
            log(name, "PASS")
        except Exception as e:
            log(name, "FAIL", str(e))
            plt.close("all")


# =========================================================
# SECTION 9: Math & Physics (5 functions)
# =========================================================
def test_math():
    print("\n--- Section 9: Math & Physics ---")

    funcs = [
        ("generate_function_plot", generators.generate_function_plot),
        (
            "generate_derivative_visualization",
            generators.generate_derivative_visualization,
        ),
        ("generate_matrix_operations", generators.generate_matrix_operations),
        ("generate_vector_space", generators.generate_vector_space),
        ("generate_fourier_transform", generators.generate_fourier_transform),
    ]

    for name, func in funcs:
        try:
            fig = func()
            assert fig is not None
            save_figure(fig, f"{OUTPUT_DIR}/{name}")
            log(name, "PASS")
        except Exception as e:
            log(name, "FAIL", str(e))
            plt.close("all")


# =========================================================
# SECTION 10: AI/ML (5 functions)
# =========================================================
def test_ai():
    print("\n--- Section 10: AI & ML ---")

    funcs = [
        ("generate_neural_network", generators.generate_neural_network),
        ("generate_decision_tree", generators.generate_decision_tree),
        ("generate_search_tree", generators.generate_search_tree),
        ("generate_genetic_algorithm", generators.generate_genetic_algorithm),
        ("generate_fuzzy_logic_sets", generators.generate_fuzzy_logic_sets),
    ]

    for name, func in funcs:
        try:
            fig = func()
            assert fig is not None
            save_figure(fig, f"{OUTPUT_DIR}/{name}")
            log(name, "PASS")
        except Exception as e:
            log(name, "FAIL", str(e))
            plt.close("all")


# =========================================================
# SECTION 11: Architecture (4 functions)
# =========================================================
def test_architecture():
    print("\n--- Section 11: Computer Architecture ---")

    funcs = [
        ("generate_cpu_datapath", generators.generate_cpu_datapath),
        ("generate_pipeline_diagram", generators.generate_pipeline_diagram),
        ("generate_cache_organization", generators.generate_cache_organization),
        ("generate_instruction_format", generators.generate_instruction_format),
    ]

    for name, func in funcs:
        try:
            fig = func()
            assert fig is not None
            save_figure(fig, f"{OUTPUT_DIR}/{name}")
            log(name, "PASS")
        except Exception as e:
            log(name, "FAIL", str(e))
            plt.close("all")


# =========================================================
# SECTION 12: Compiler (4 functions)
# =========================================================
def test_compiler():
    print("\n--- Section 12: Compiler Design ---")

    funcs = [
        ("generate_compiler_phases", generators.generate_compiler_phases),
        ("generate_parse_tree", generators.generate_parse_tree),
        ("generate_symbol_table", generators.generate_symbol_table),
        ("generate_ast_diagram", generators.generate_ast_diagram),
    ]

    for name, func in funcs:
        try:
            fig = func()
            assert fig is not None
            save_figure(fig, f"{OUTPUT_DIR}/{name}")
            log(name, "PASS")
        except Exception as e:
            log(name, "FAIL", str(e))
            plt.close("all")


# =========================================================
# SECTION 13: Signal Processing (3 functions)
# =========================================================
def test_signal():
    print("\n--- Section 13: Signal Processing ---")

    funcs = [
        ("generate_signal_time_frequency", generators.generate_signal_time_frequency),
        ("generate_filter_response", generators.generate_filter_response),
        ("generate_convolution_visual", generators.generate_convolution_visual),
    ]

    for name, func in funcs:
        try:
            fig = func()
            assert fig is not None
            save_figure(fig, f"{OUTPUT_DIR}/{name}")
            log(name, "PASS")
        except Exception as e:
            log(name, "FAIL", str(e))
            plt.close("all")


# =========================================================
# SECTION 14: Formal Languages (3 functions)
# =========================================================
def test_formal_languages():
    print("\n--- Section 14: Formal Languages ---")

    funcs = [
        ("generate_dfa_diagram", generators.generate_dfa_diagram),
        ("generate_parse_tree_formal", generators.generate_parse_tree_formal),
        ("generate_nfa_diagram", generators.generate_nfa_diagram),
    ]

    for name, func in funcs:
        try:
            fig = func()
            assert fig is not None
            save_figure(fig, f"{OUTPUT_DIR}/{name}")
            log(name, "PASS")
        except Exception as e:
            log(name, "FAIL", str(e))
            plt.close("all")


# =========================================================
# SECTION 15: Security (3 functions)
# =========================================================
def test_security():
    print("\n--- Section 15: Security ---")

    funcs = [
        ("generate_encryption_flow", generators.generate_encryption_flow),
        ("generate_attack_tree", generators.generate_attack_tree),
        ("generate_pki_diagram", generators.generate_pki_diagram),
    ]

    for name, func in funcs:
        try:
            fig = func()
            assert fig is not None
            save_figure(fig, f"{OUTPUT_DIR}/{name}")
            log(name, "PASS")
        except Exception as e:
            log(name, "FAIL", str(e))
            plt.close("all")


# =========================================================
# SECTION 16: Software Engineering (3 functions)
# =========================================================
def test_se():
    print("\n--- Section 16: Software Engineering ---")

    funcs = [
        ("generate_sdlc_waterfall", generators.generate_sdlc_waterfall),
        ("generate_agile_scrum", generators.generate_agile_scrum),
        ("generate_design_patterns", generators.generate_design_patterns),
    ]

    for name, func in funcs:
        try:
            fig = func()
            assert fig is not None
            save_figure(fig, f"{OUTPUT_DIR}/{name}")
            log(name, "PASS")
        except Exception as e:
            log(name, "FAIL", str(e))
            plt.close("all")


# =========================================================
# SECTION 17: Graphics (3 functions)
# =========================================================
def test_graphics():
    print("\n--- Section 17: Graphics & Vision ---")

    funcs = [
        ("generate_2d_transforms", generators.generate_2d_transforms),
        ("generate_projection_types", generators.generate_projection_types),
        ("generate_cnn_architecture", generators.generate_cnn_architecture),
    ]

    for name, func in funcs:
        try:
            fig = func()
            assert fig is not None
            save_figure(fig, f"{OUTPUT_DIR}/{name}")
            log(name, "PASS")
        except Exception as e:
            log(name, "FAIL", str(e))
            plt.close("all")


# =========================================================
# SECTION 18: Distributed Systems (3 functions)
# =========================================================
def test_distributed():
    print("\n--- Section 18: Distributed Systems ---")

    funcs = [
        (
            "generate_distributed_architecture",
            generators.generate_distributed_architecture,
        ),
        ("generate_consensus_protocol", generators.generate_consensus_protocol),
        ("generate_replication_diagram", generators.generate_replication_diagram),
    ]

    for name, func in funcs:
        try:
            fig = func()
            assert fig is not None
            save_figure(fig, f"{OUTPUT_DIR}/{name}")
            log(name, "PASS")
        except Exception as e:
            log(name, "FAIL", str(e))
            plt.close("all")


# =========================================================
# RUN ALL TESTS
# =========================================================
if __name__ == "__main__":
    print("=" * 60)
    print("  GENERATORS MODULE - COMPREHENSIVE TESTS")
    print("  Testing all 57 diagram generators")
    print("=" * 60)

    test_computer_principles()
    test_programming()
    test_data_structures()
    test_databases()
    test_uml()
    test_networks()
    test_os()
    test_electronics()
    test_math()
    test_ai()
    test_architecture()
    test_compiler()
    test_signal()
    test_formal_languages()
    test_security()
    test_se()
    test_graphics()
    test_distributed()

    # Summary
    passed = sum(1 for _, s, _ in results if s == "PASS")
    failed = sum(1 for _, s, _ in results if s == "FAIL")
    total = len(results)

    print(f"\n{'=' * 60}")
    print(f"  RESULTS: {passed}/{total} passed, {failed}/{total} failed")
    print(f"{'=' * 60}")

    # Save report
    report = f"""# Generator Tests Report
## All 57 Diagram Generators

**Total:** {total} | **Passed:** {passed} | **Failed:** {failed}

| Section | Passed | Failed |
|---------|---------|---------|
| 1. Computer Principles | {sum(1 for n, s, _ in results if s == "PASS" and "von_neumann" in n or "cpu" in n or "memory_hierarchy" in n)} | 0 |
| 2. Programming | {sum(1 for n, s, _ in results if s == "PASS" and "flowchart" in n or "loop" in n or "recursion" in n or "linked" in n or "stack" in n or "queue" in n)} | 0 |
| 3. Data Structures | {sum(1 for n, s, _ in results if s == "PASS" and ("binary" in n or "hash" in n or "sorting" in n or "graph" in n or "dfs" in n or "big_o" in n or "dynamic" in n))} | 0 |
| 4. Databases | {sum(1 for n, s, _ in results if s == "PASS" and ("er_" in n or "relational" in n or "normalization" in n or "bplus" in n or "query" in n or "transaction" in n))} | 0 |
| 5. UML | {sum(1 for n, s, _ in results if s == "PASS" and "uml" in n)} | 0 |
| 6. Networks | {sum(1 for n, s, _ in results if s == "PASS" and ("osi" in n or "tcp" in n or "topology" in n or "routing" in n or "packet" in n or "dns" in n))} | 0 |
| 7. OS | {sum(1 for n, s, _ in results if s == "PASS" and ("process" in n or "scheduling" in n or "memory" in n or "deadlock" in n or "semaphore" in n))} | 0 |
| 8. Electronics | {sum(1 for n, s, _ in results if s == "PASS" and ("logic" in n or "karnaugh" in n or "flip" in n or "combinational" in n or "transistor" in n))} | 0 |
| 9. Math | {sum(1 for n, s, _ in results if s == "PASS" and ("function" in n or "derivative" in n or "matrix" in n or "vector" in n or "fourier" in n))} | 0 |
| 10. AI/ML | {sum(1 for n, s, _ in results if s == "PASS" and ("neural" in n or "decision" in n or "search_tree" in n or "genetic" in n or "fuzzy" in n))} | 0 |
| 11. Architecture | {sum(1 for n, s, _ in results if s == "PASS" and ("cpu_datapath" in n or "pipeline" in n or "cache" in n or "instruction" in n))} | 0 |
| 12. Compiler | {sum(1 for n, s, _ in results if s == "PASS" and ("compiler" in n or "parse" in n or "symbol" in n or "ast" in n))} | 0 |
| 13. Signal | {sum(1 for n, s, _ in results if s == "PASS" and ("signal" in n or "filter" in n or "convolution" in n))} | 0 |
| 14. Formal Lang | {sum(1 for n, s, _ in results if s == "PASS" and ("dfa" in n or "nfa" in n))} | 0 |
| 15. Security | {sum(1 for n, s, _ in results if s == "PASS" and ("encryption" in n or "attack" in n or "pki" in n))} | 0 |
| 16. SE | {sum(1 for n, s, _ in results if s == "PASS" and ("sdlc" in n or "agile" in n or "design_patterns" in n))} | 0 |
| 17. Graphics | {sum(1 for n, s, _ in results if s == "PASS" and ("2d_transforms" in n or "projection" in n or "cnn" in n))} | 0 |
| 18. Distributed | {sum(1 for n, s, _ in results if s == "PASS" and ("distributed" in n or "consensus" in n or "replication" in n))} | 0 |

## Details
"""
    for i, (name, status, details) in enumerate(results, 1):
        report += f"| {i} | {name} | {'PASS' if status == 'PASS' else 'FAIL'} |\n"

    if failed > 0:
        report += "\n## Failures\n"
        for name, status, details in results:
            if status == "FAIL":
                report += f"- **{name}**: {details}\n"

    report_path = f"{OUTPUT_DIR}/generators-test-report.md"
    with open(report_path, "w", encoding="utf-8") as f:
        f.write(report)

    print(f"\nReport saved to: {report_path}")
    print(f"Images saved to: {OUTPUT_DIR}/")

    sys.exit(0 if failed == 0 else 1)
