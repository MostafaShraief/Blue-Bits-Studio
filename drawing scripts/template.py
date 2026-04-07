"""
Blue Bits - Drawing Template
=============================
ملف القالب الأساسي لرسم المخططات باستخدام matplotlib.
يحتوي على جميع الدوال المساعدة والثوابت والخطوط.

الاستخدام:
    from template import *

    fig, ax = setup_canvas(w=16, h=10)
    # ... كود الرسم ...
    save_figure(fig, 'output')

المتطلبات:
    pip install matplotlib numpy arabic-reshaper python-bidi
"""

import matplotlib.pyplot as plt
import matplotlib.patches as patches
import matplotlib.font_manager as fm
import numpy as np
import os

# =========================================================
#                   DRAW ENGINE EXPORTS
# =========================================================
from src.draw_engine.core import *
from src.draw_engine.text import *
from src.draw_engine.shapes.primitives import *
from src.draw_engine.connectors.arrows import *
from src.draw_engine.connectors.routing import *
try:
    from src.draw_engine.materials.ai import *
    from src.draw_engine.materials.hardware import *
    from src.draw_engine.materials.networking import *
    from src.draw_engine.materials.software_engineering import *
    from src.draw_engine.materials.computer_science import *
    from src.draw_engine.materials.legacy import *
except ImportError:
    pass
try:
    from src.draw_engine.shapes.layout import *
    from src.draw_engine.shapes.annotations import *
    from src.draw_engine.connectors.advanced import *
except ImportError:
    pass
