import pytest
import matplotlib.pyplot as plt
from src.draw_engine.materials.computer_science import (
    draw_array, draw_tree_node, draw_page_table, draw_scheduling_queue
)

def test_draw_array():
    fig, ax = plt.subplots()
    patch, bbox, anchors = draw_array(ax, 0, 0, ["A", "B", "C"])
    assert bbox is not None
    assert "top_1" in anchors
    assert "left" in anchors

def test_draw_tree_node():
    fig, ax = plt.subplots()
    patch, bbox, anchors = draw_tree_node(ax, 0, 0, 1.0, "Root")
    assert bbox is not None
    assert "top" in anchors
    assert "bottom" in anchors

def test_draw_page_table():
    fig, ax = plt.subplots()
    entries = [
        (0, "0x1A", "1", "RW"),
        (1, "0x2B", "0", "R-")
    ]
    patch, bbox, anchors = draw_page_table(ax, 0, 0, entries)
    assert bbox is not None
    assert "row0_col0" in anchors
    assert "left" in anchors

def test_draw_scheduling_queue():
    fig, ax = plt.subplots()
    patch, bbox, anchors = draw_scheduling_queue(ax, 0, 0, ["P1", "P2", "P3"])
    assert bbox is not None
    assert "top_0" in anchors

def test_draw_scheduling_queue_empty():
    fig, ax = plt.subplots()
    patch, bbox, anchors = draw_scheduling_queue(ax, 0, 0, [])
    assert bbox is not None
    assert "left" in anchors
