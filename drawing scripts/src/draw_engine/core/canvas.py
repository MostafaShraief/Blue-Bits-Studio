import matplotlib.pyplot as plt

def setup_canvas(w=12, h=8, xlim=(-8, 8), ylim=(-5, 5)):
    """
    Create a matplotlib figure with transparent background.

    Args:
        w: Figure width in inches
        h: Figure height in inches
        xlim: X-axis limits tuple (min, max)
        ylim: Y-axis limits tuple (min, max)

    Returns:
        (fig, ax) tuple
    """
    fig, ax = plt.subplots(figsize=(w, h))
    ax.set_xlim(xlim)
    ax.set_ylim(ylim)
    ax.axis("off")
    # Transparent background
    fig.patch.set_alpha(0)
    ax.patch.set_alpha(0)
    return fig, ax

def auto_bounds(ax, margin=1.0):
    """
    Calculate the bounds of all plotted elements in ax and adjust limits.

    Args:
        ax: matplotlib Axes object
        margin: Extra space to add around the bounds
    """
    # Force a draw so bounding boxes are calculated correctly
    ax.figure.canvas.draw()
    
    x_min, x_max = float('inf'), float('-inf')
    y_min, y_max = float('inf'), float('-inf')
    
    # Consider patches explicitly
    for patch in ax.patches:
        extents = patch.get_extents()
        x_min = min(x_min, extents.xmin)
        x_max = max(x_max, extents.xmax)
        y_min = min(y_min, extents.ymin)
        y_max = max(y_max, extents.ymax)
        
    # Consider text explicitly
    for text in ax.texts:
        extents = text.get_window_extent(renderer=ax.figure.canvas.get_renderer()).transformed(ax.transData.inverted())
        x_min = min(x_min, extents.xmin)
        x_max = max(x_max, extents.xmax)
        y_min = min(y_min, extents.ymin)
        y_max = max(y_max, extents.ymax)
        
    # Consider lines explicitly
    for line in ax.lines:
        xdata = line.get_xdata()
        ydata = line.get_ydata()
        if len(xdata) > 0 and len(ydata) > 0:
            x_min = min(x_min, min(xdata))
            x_max = max(x_max, max(xdata))
            y_min = min(y_min, min(ydata))
            y_max = max(y_max, max(ydata))
            
    # Consider collections explicitly
    for collection in ax.collections:
        paths = collection.get_paths()
        for path in paths:
            extents = path.get_extents()
            x_min = min(x_min, extents.xmin)
            x_max = max(x_max, extents.xmax)
            y_min = min(y_min, extents.ymin)
            y_max = max(y_max, extents.ymax)
            
    if x_min != float('inf') and x_max != float('-inf'):
        ax.set_xlim(x_min - margin, x_max + margin)
        ax.set_ylim(y_min - margin, y_max + margin)
    else:
        # Default limits if empty
        ax.set_xlim(-margin, margin)
        ax.set_ylim(-margin, margin)


def save_figure(fig, filename, dpi=300):
    """
    Save figure as both SVG and PNG with transparent background.

    Args:
        fig: matplotlib figure
        filename: Base filename without extension
        dpi: Resolution for PNG output
    """
    fig.savefig(
        f"{filename}.svg", transparent=True, bbox_inches="tight", pad_inches=0.1
    )
    fig.savefig(
        f"{filename}.png",
        transparent=True,
        bbox_inches="tight",
        dpi=dpi,
        pad_inches=0.1,
    )
    print(f"Saved: {filename}.svg and {filename}.png")
    plt.close(fig)
