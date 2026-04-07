import pytest
import matplotlib.pyplot as plt
from src.draw_engine.materials.networking import (
    draw_cloud,
    draw_router,
    draw_switch,
    draw_server,
    draw_firewall,
    draw_wireless_signal,
    draw_queue_node
)

@pytest.fixture
def ax():
    fig, ax = plt.subplots()
    yield ax
    plt.close(fig)

def test_draw_cloud(ax):
    result = draw_cloud(ax, 0, 0, text="Internet")
    assert result is not None
    assert "patch" in result
    assert "ports" in result
    assert result["center"] == (0, 0)
    assert len(ax.patches) > 0

def test_draw_network_devices(ax):
    r1 = draw_router(ax, 2, 2, text="R1")
    assert "ports" in r1
    
    s1 = draw_switch(ax, 4, 4, text="SW1")
    assert "ports" in s1
    
    srv = draw_server(ax, 6, 6, text="S1")
    assert "ports" in srv
    
    fw = draw_firewall(ax, 8, 8, text="FW")
    assert "ports" in fw
    
    assert len(ax.patches) >= 4  # Includes circles, rects, and walls

def test_draw_wireless_signal(ax):
    res = draw_wireless_signal(ax, 0, 0, radius=2, arcs=3)
    assert res is not None
    assert res["center"] == (0, 0)
    assert len(ax.patches) > 0

def test_draw_queue_node(ax):
    res = draw_queue_node(ax, 0, 0, servers=3, q_len=5)
    assert res is not None
    assert len(res["servers"]) == 3
    assert "in" in res["ports"]
    assert "out" in res["ports"]

