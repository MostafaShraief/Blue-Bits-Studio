import pytest
import os
import matplotlib.pyplot as plt
import matplotlib.patches as patches
from src.draw_engine.core import setup_canvas, auto_bounds, save_figure

def test_setup_canvas():
    fig, ax = setup_canvas(w=10, h=6, xlim=(-10, 10), ylim=(-5, 5))
    assert fig.get_figwidth() == 10
    assert fig.get_figheight() == 6
    assert ax.get_xlim() == (-10.0, 10.0)
    assert ax.get_ylim() == (-5.0, 5.0)
    plt.close(fig)

def test_auto_bounds():
    fig, ax = setup_canvas()
    
    # Add a rectangle
    rect = patches.Rectangle((2, 2), 4, 4)
    ax.add_patch(rect)
    
    # Add some text
    ax.text(-2, -2, "Test text")
    
    auto_bounds(ax, margin=1.0)
    
    xlim = ax.get_xlim()
    ylim = ax.get_ylim()
    
    # Check boundaries logic
    assert xlim[0] <= -3.0  # -2 - margin
    assert xlim[1] >= 7.0   # 2+4 + margin
    assert ylim[0] <= -3.0  # -2 - margin
    assert ylim[1] >= 7.0   # 2+4 + margin
    
    plt.close(fig)

def test_save_figure(tmp_path):
    fig, ax = setup_canvas()
    ax.text(0, 0, "Test")
    
    filename = tmp_path / "test_fig"
    save_figure(fig, str(filename))
    
    assert os.path.exists(f"{filename}.png")
    assert os.path.exists(f"{filename}.svg")
