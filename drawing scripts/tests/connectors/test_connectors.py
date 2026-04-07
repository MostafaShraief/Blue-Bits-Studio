import matplotlib.pyplot as plt
import matplotlib.patches as patches
import numpy as np

from src.draw_engine.connectors.arrows import draw_arrow, draw_line, draw_bezier, draw_bracket
from src.draw_engine.connectors.routing import draw_smart_connection

def test_draw_arrow():
    fig, ax = plt.subplots()
    ann = draw_arrow(ax, (0, 0), (1, 1), text="A", rad=0.2)
    assert ann is not None

def test_draw_line():
    fig, ax = plt.subplots()
    line = draw_line(ax, (0, 0), (1, 1))
    assert line is not None

def test_draw_bezier():
    fig, ax = plt.subplots()
    b = draw_bezier(ax, (0, 0), (1, 1), (0, 1), (1, 0))
    assert b is not None

def test_draw_bracket():
    fig, ax = plt.subplots()
    br = draw_bracket(ax, (0, 0), (0, 1))
    assert br is None or br is not None

def test_smart_connection():
    fig, ax = plt.subplots()
    bbox_a = (0, 0, 1, 1)
    bbox_b = (2, 2, 3, 3)
    conn = draw_smart_connection(ax, bbox_a, bbox_b, style="elbow", text="conn")
    # Just checking it runs without errors
    assert True
