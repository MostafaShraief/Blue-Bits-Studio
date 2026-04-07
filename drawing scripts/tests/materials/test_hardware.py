import pytest
import matplotlib.pyplot as plt
from src.draw_engine.materials.hardware import draw_logic_gate, draw_alu_block, draw_memory_array

@pytest.fixture
def ax():
    fig, ax = plt.subplots()
    yield ax
    plt.close(fig)

def test_draw_logic_gate(ax):
    patch, bbox, anchors = draw_logic_gate(ax, "AND", 5, 5)
    assert patch is not None
    assert len(bbox) == 4
    assert "in1" in anchors
    assert "in2" in anchors
    assert "out" in anchors
    assert len(ax.patches) > 0

def test_draw_alu_block(ax):
    patch, bbox, anchors = draw_alu_block(ax, 10, 10, operations=["ADD", "SUB"])
    assert patch is not None
    assert len(bbox) == 4
    assert "A" in anchors
    assert "B" in anchors
    assert "out" in anchors
    assert "ctrl" in anchors
    assert len(ax.patches) > 0

def test_draw_memory_array(ax):
    patch, bbox, anchors = draw_memory_array(ax, 20, 20, rows=2, cols=2)
    assert patch is not None
    assert len(bbox) == 4
    assert "R0_C0" in anchors
    assert "R1_C1" in anchors
    assert len(ax.patches) > 0
