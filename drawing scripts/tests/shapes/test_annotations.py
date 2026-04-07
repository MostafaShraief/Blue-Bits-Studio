import pytest
import matplotlib.pyplot as plt
from src.draw_engine.shapes.annotations import draw_pseudocode_block

@pytest.fixture
def ax():
    fig, ax = plt.subplots()
    yield ax
    plt.close(fig)

def test_draw_pseudocode_block(ax):
    draw_pseudocode_block(ax, 0, 0, ["test"])
    assert len(ax.patches) > 0
