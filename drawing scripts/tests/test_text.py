import pytest
from src.draw_engine.text import handle_arabic

def test_handle_arabic_english():
    assert handle_arabic("Hello World") == "Hello World"

def test_handle_arabic_null():
    assert handle_arabic(None) == ""
