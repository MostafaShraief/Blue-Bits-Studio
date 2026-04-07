import os
import matplotlib.font_manager as fm

# =========================================================
#                   USER CONFIGURATION
# =========================================================
# IMPORTANT: Put the .ttf file in the same folder as this script
FONT_FILENAME = "BoutrosMBCDinkum Medium.ttf"
CODE_FONT = "Cascadia Code Light"
DEFAULT_SIZE = 22

# =========================================================
#                   THEME CONSTANTS
# =========================================================
BLUE = "#0072BD"
GREEN = "#009E73"
CYAN = "#33C9FF"
BLACK = "black"
WHITE = "white"
RED = "#D32F2F"
LIGHT_BLUE = "#E3F2FD"
LIGHT_GREEN = "#E8F5E9"
LIGHT_RED = "#FFEBEE"
GRAY = "#9E9E9E"

# =========================================================
#                   FONT LOADERS
# =========================================================
def get_font_prop(size=DEFAULT_SIZE):
    """Get Arabic font properties (BoutrosMBCDinkum Medium)."""
    if os.path.exists(FONT_FILENAME):
        return fm.FontProperties(fname=FONT_FILENAME, size=size)
    # Fallback: search system fonts
    print(f"WARNING: Could not find '{FONT_FILENAME}'. Searching system...")
    for f in fm.fontManager.ttflist:
        if "boutros" in f.name.lower() and "dinkum" in f.name.lower():
            return fm.FontProperties(fname=f.fname, size=size)
    # Final fallback: try common Arabic fonts
    for fallback in ["Arial", "Tahoma", "Times New Roman"]:
        try:
            return fm.FontProperties(family=fallback, size=size)
        except Exception:
            continue
    return fm.FontProperties(size=size)

def get_code_font_prop(size=None):
    """Get code/monospace font properties (Cascadia Code Light)."""
    if size is None:
        size = int(DEFAULT_SIZE * 0.9)
    return fm.FontProperties(family="monospace", size=size)
