import os
import matplotlib.pyplot as plt
from src.draw_engine.core import setup_canvas, save_figure, auto_bounds, BLUE, GREEN, RED, GRAY, BLACK, WHITE
from src.draw_engine.text import draw_text
from src.draw_engine.shapes import draw_box, draw_circle, draw_diamond
from src.draw_engine.connectors import draw_smart_arrow

def main():
    # 1. Setup Canvas
    fig, ax = setup_canvas()

    # 2. Draw Some Shapes 
    # Notice that shape functions return a tuple: (patch, bbox)
    _, box1_bbox = draw_box(ax, 0, 0, 4, 2, text="النظام الأساسي", fill_color=BLUE, text_color=WHITE)
    _, box2_bbox = draw_box(ax, 6, 2, 4, 2, text="قاعدة البيانات", fill_color=GREEN, text_color=WHITE)
    _, circle1_bbox = draw_circle(ax, 8, -2, 1.5, text="مستخدم", fill_color=RED, text_color=WHITE)
    _, diamond1_bbox = draw_diamond(ax, 2, -4, 3, 2, text="هل مسجل؟", fill_color=GRAY, text_color=BLACK)

    # 3. Add Some Text
    draw_text(ax, "مخطط توضيحي للمحرك الجديد", 4, 5, size=28, color=BLACK)
    
    # 4. Connect Shapes using smart connectors (automatically finds edges based on bounding boxes)
    draw_smart_arrow(ax, box1_bbox, box2_bbox, text="طلب بيانات", arrow_color=BLUE)
    draw_smart_arrow(ax, box1_bbox, circle1_bbox, text="تفاعل", arrow_color=RED)
    draw_smart_arrow(ax, circle1_bbox, diamond1_bbox, text="تسجيل الدخول", arrow_color=GRAY)
    
    # 5. Auto Bounds
    auto_bounds(ax, margin=2.0)

    # 6. Save Figure
    save_figure(fig, "example_output")
    print("Success! Example generated.")

if __name__ == "__main__":
    main()
