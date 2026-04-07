# AI Prompt Guide: Blue Bits Smart Drawing Engine

You are an AI assistant tasked with generating educational diagrams and architectures using the `draw_engine` framework.
This framework is built on top of Matplotlib but heavily abstracts coordinates, bounding boxes, text reshaping (Arabic/BiDi), and shape routing.

## 🏗️ Architecture & Imports

The 8,900+ lines `template.py` has been completely modularized into `src/draw_engine/`. 
Always use these imports for your diagrams:

```python
import matplotlib.pyplot as plt

# 1. Core (Canvas, Saving, Themes, Colors)
from src.draw_engine.core import setup_canvas, save_figure, BLUE, WHITE, BLACK, GRAY, RED, GREEN

# 2. Text (Arabic Reshaper, Rich Text)
from src.draw_engine.text import handle_arabic, add_rich_text

# 3. Shapes & Layouts (Primitives, Annotations, Grids)
from src.draw_engine.shapes.primitives import draw_box, draw_circle, draw_diamond
from src.draw_engine.shapes.layout import draw_grid
from src.draw_engine.shapes.annotations import draw_comment_box, draw_pseudocode_block

# 4. Connectors (Smart routing, Arrows)
from src.draw_engine.connectors.arrows import draw_arrow, draw_line
from src.draw_engine.connectors.routing import draw_smart_arrow, route_orthogonal
from src.draw_engine.connectors.advanced import draw_curved_arrow

# 5. Curriculum Materials (Domain-specific diagrams)
from src.draw_engine.materials.software_engineering import draw_table, draw_entity
from src.draw_engine.materials.hardware import draw_logic_gate
from src.draw_engine.materials.networking import draw_router, draw_server
from src.draw_engine.materials.ai import draw_neural_network
from src.draw_engine.materials.computer_science import draw_array
```

## ✨ Smart Features & Rules

1. **Auto-Bounding (No Canvas Clipping)**
   You do NOT need to calculate `xlim` or `ylim` anymore. `save_figure` automatically detects all drawn elements and pads the canvas.
   ```python
   fig, ax = setup_canvas()
   # ... draw anything anywhere ...
   save_figure(fig, 'output_name') # Auto-bounds internally!
   ```

2. **Smart Shape Bounds**
   All primitive shapes (`draw_box`, `draw_circle`, etc.) now return a dictionary containing the matplotlib `patch` AND `bounds` / `ports`.
   ```python
   # Returns: {'patch': <Rectangle>, 'bounds': (xmin, ymin, xmax, ymax)}
   node_a = draw_box(ax, 0, 0, 4, 2, text="Node A")
   node_b = draw_box(ax, 8, 0, 4, 2, text="Node B")
   ```

3. **Smart Routing (Dynamic Arrows)**
   You can connect two shapes automatically without doing math for the arrow tail/head. Just pass the returned shape dictionaries to `draw_smart_arrow`.
   ```python
   # Automatically calculates the shortest non-overlapping path!
   draw_smart_arrow(ax, node_a, node_b, text="Connects to")
   ```

4. **Arabic First**
   Never use `arabic_reshaper` or `bidi.algorithm` directly. The engine handles this automatically in EVERY `text="..."` parameter across all functions.

## 📝 Example Script to Generate

When asked to generate a diagram, output a clean Python script like this:

```python
import matplotlib.pyplot as plt
from src.draw_engine.core import setup_canvas, save_figure, BLUE, WHITE
from src.draw_engine.shapes.primitives import draw_box
from src.draw_engine.connectors.routing import draw_smart_arrow

def generate_my_diagram():
    fig, ax = setup_canvas()
    
    # Draw components (Math is easy, just place them!)
    client = draw_box(ax, 0, 5, 3, 2, text="العميل", fill_color=WHITE)
    server = draw_box(ax, 8, 5, 3, 2, text="الخادم", fill_color=BLUE, text_color=WHITE)
    database = draw_box(ax, 8, 0, 3, 2, text="قاعدة البيانات")
    
    # Connect them smartly
    draw_smart_arrow(ax, client, server, text="طلب HTTP")
    draw_smart_arrow(ax, server, database, text="استعلام SQL")
    
    # Save and auto-bound
    save_figure(fig, 'architecture_diagram')

if __name__ == "__main__":
    generate_my_diagram()
```

## 🔍 Testing your code
Always remember to test your visual output mentally.
- Did I import correctly from `src.draw_engine`?
- Am I using `save_figure` to leverage auto-bounding?
- Am I storing the returned objects to pass into `draw_smart_arrow`?
