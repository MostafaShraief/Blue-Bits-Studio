import pytest
import matplotlib.pyplot as plt
from src.draw_engine.shapes.layout import draw_grid

@pytest.fixture
def ax():
    fig, ax = plt.subplots()
    yield ax
    plt.close(fig)

def test_draw_grid(ax):
    rects = draw_grid(ax, 0, 0, 3, 3, 1, 1)
    assert len(rects) == 9
    assert len(ax.patches) > 0
