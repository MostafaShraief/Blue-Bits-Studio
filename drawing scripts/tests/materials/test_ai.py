import pytest
import matplotlib.pyplot as plt
import numpy as np
from src.draw_engine.materials.ai import draw_neural_network, draw_expert_system, draw_fuzzy_set

def test_draw_neural_network():
    fig, ax = plt.subplots()
    layers = [2, 3, 1]
    positions = draw_neural_network(ax, 0, 0, layers)
    
    # We expect 2+3+1 = 6 nodes
    assert len(positions) == 6
    
    # Check that positions contains the correct layer indices
    assert (0, 0) in positions
    assert (0, 1) in positions
    assert (1, 0) in positions
    assert (1, 1) in positions
    assert (1, 2) in positions
    assert (2, 0) in positions

def test_draw_expert_system():
    fig, ax = plt.subplots()
    boxes = draw_expert_system(ax, 0, 0)
    
    assert "User" in boxes
    assert "UI" in boxes
    assert "IE" in boxes
    assert "KB" in boxes
    
def test_draw_fuzzy_set():
    fig, ax = plt.subplots()
    x_vals = np.linspace(0, 10, 100)
    mem1 = np.clip(x_vals / 5, 0, 1)
    mem2 = np.clip((10 - x_vals) / 5, 0, 1)
    
    bounds = draw_fuzzy_set(ax, x_vals, [mem1, mem2], labels=["Low", "High"])
    assert len(bounds) == 4
    # Check if bounds match expected
    x, y, x2, y2 = bounds
    assert x == 0
    assert y == 0
    assert x2 == 10
    assert y2 == 4
