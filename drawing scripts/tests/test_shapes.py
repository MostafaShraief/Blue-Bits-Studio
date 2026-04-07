import pytest
import matplotlib.pyplot as plt
from src.draw_engine.shapes import draw_box, draw_circle, draw_diamond

@pytest.fixture
def ax():
    fig, ax = plt.subplots()
    yield ax
    plt.close(fig)

def test_draw_box(ax):
    patch, bbox = draw_box(ax, 0, 0, 4, 2, text="Test Box")
    assert patch is not None
    assert bbox == (0, 0, 4, 2)
    assert len(ax.patches) == 1
    assert len(ax.texts) == 1

def test_draw_circle(ax):
    patch, bbox = draw_circle(ax, 5, 5, 2, text="Test Circle")
    assert patch is not None
    assert bbox == (3, 3, 7, 7)
    assert len(ax.patches) == 1
    assert len(ax.texts) == 1

def test_draw_diamond(ax):
    patch, bbox = draw_diamond(ax, 10, 10, 4, 6, text="Test Diamond")
    assert patch is not None
    assert bbox == (8.0, 7.0, 12.0, 13.0)
    assert len(ax.patches) == 1
    assert len(ax.texts) == 1
