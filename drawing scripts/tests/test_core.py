import pytest
from src.draw_engine.core import get_font_prop, BLUE

def test_constants():
    assert BLUE == "#0072BD"

def test_get_font_prop():
    prop = get_font_prop(16)
    assert prop.get_size() == 16
