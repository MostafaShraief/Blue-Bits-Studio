import pytest
import matplotlib.pyplot as plt
from src.draw_engine.text import (
    handle_arabic, draw_text, add_title
)

def test_handle_arabic():
    # Simple english
    assert handle_arabic("Hello") == "Hello"
    # Arabic string
    ar = handle_arabic("مرحبا")
    assert isinstance(ar, str)

def test_draw_text():
    fig, ax = plt.subplots()
    # It should not crash
    t = draw_text(ax, 0, 0, "Test")
    assert t is not None

def test_add_title():
    fig, ax = plt.subplots()
    add_title(ax, "My Title")
    # Title is drawn using add_text -> now draw_text
    assert len(ax.texts) > 0
