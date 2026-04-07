import pytest
import matplotlib.pyplot as plt
from src.draw_engine.connectors import get_intersection, get_box_center, draw_smart_arrow

@pytest.fixture
def ax():
    fig, ax = plt.subplots()
    yield ax
    plt.close(fig)

def test_get_box_center():
    assert get_box_center((0, 0, 4, 2)) == (2, 1)

def test_get_intersection():
    bbox = (0, 0, 4, 4)
    # Target right
    assert get_intersection(bbox, (10, 2)) == (4, 2)
    # Target top
    assert get_intersection(bbox, (2, 10)) == (2, 4)

def test_draw_smart_arrow(ax):
    bbox1 = (0, 0, 2, 2)
    bbox2 = (4, 0, 6, 2)
    annotation = draw_smart_arrow(ax, bbox1, bbox2, text="Test Arrow")
    assert annotation is not None
    assert len(ax.texts) == 2  # The annotation text and the custom text
