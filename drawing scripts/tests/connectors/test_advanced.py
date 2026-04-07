import pytest
import matplotlib.pyplot as plt
from src.draw_engine.connectors.advanced import draw_orthogonal_arrow

@pytest.fixture
def ax():
    fig, ax = plt.subplots()
    yield ax
    plt.close(fig)

def test_draw_orthogonal(ax):
    draw_orthogonal_arrow(ax, (0,0), (2,2))
    assert True
