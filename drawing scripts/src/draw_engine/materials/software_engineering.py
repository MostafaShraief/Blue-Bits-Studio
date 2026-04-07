import matplotlib.patches as patches
import arabic_reshaper
from bidi.algorithm import get_display

def handle_arabic(text):
    if not text: return ""
    text = str(text)
    reshaper = arabic_reshaper.ArabicReshaper(configuration={"delete_harakat": True})
    return get_display(reshaper.reshape(text))

# Primitive helpers
def _draw_box(ax, x, y, w, h, text="", text_color="black", border_color="#0072BD", fill_color="white", rounded=False):
    if rounded:
        box = patches.FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.1", facecolor=fill_color, edgecolor=border_color, linewidth=2, zorder=5)
    else:
        box = patches.Rectangle((x, y), w, h, facecolor=fill_color, edgecolor=border_color, linewidth=2, zorder=5)
    ax.add_patch(box)
    if text:
        ax.text(x + w/2, y + h/2, handle_arabic(text), color=text_color, ha="center", va="center", zorder=20)
    return box

def _draw_diamond(ax, x, y, w, h, text="", text_color="black", border_color="#0072BD", fill_color="white"):
    diamond = patches.Polygon(
        [(x, y + h / 2), (x + w / 2, y), (x, y - h / 2), (x - w / 2, y)],
        closed=True, facecolor=fill_color, edgecolor=border_color, linewidth=2, zorder=5
    )
    ax.add_patch(diamond)
    if text:
        ax.text(x, y, handle_arabic(text), color=text_color, ha="center", va="center", zorder=20)
    return diamond

def _draw_ellipse(ax, cx, cy, w, h, text="", text_color="black", border_color="#0072BD", fill_color="white", linestyle="-", underline=False, dashed_underline=False):
    ellipse = patches.Ellipse((cx, cy), w, h, facecolor=fill_color, edgecolor=border_color, linewidth=2, linestyle=linestyle, zorder=5)
    ax.add_patch(ellipse)
    if text:
        ax.text(cx, cy, handle_arabic(text), color=text_color, ha="center", va="center", zorder=20)
        if underline or dashed_underline:
            ls = "--" if dashed_underline else "-"
            # rough estimate for text width
            text_w = len(text) * 0.15
            ax.plot([cx - text_w/2, cx + text_w/2], [cy - 0.2, cy - 0.2], color=text_color, linestyle=ls, linewidth=1.5, zorder=21)
    return ellipse

class BaseSmartComponent:
    def __init__(self, cx, cy, text=""):
        self.cx = cx
        self.cy = cy
        self.text = text
        self.w = max(2.5, len(str(text)) * 0.25 + 0.5) if text else 2.5
        self.h = 1.5
    
    def anchors(self):
        return {
            'top': (self.cx, self.cy + self.h/2),
            'bottom': (self.cx, self.cy - self.h/2),
            'left': (self.cx - self.w/2, self.cy),
            'right': (self.cx + self.w/2, self.cy),
            'center': (self.cx, self.cy)
        }

class EREntity(BaseSmartComponent):
    def __init__(self, cx, cy, text, weak=False):
        super().__init__(cx, cy, text)
        self.weak = weak
        
    def draw(self, ax):
        _draw_box(ax, self.cx - self.w/2, self.cy - self.h/2, self.w, self.h, text=self.text, rounded=False)
        if self.weak:
            _draw_box(ax, self.cx - self.w/2 + 0.15, self.cy - self.h/2 + 0.15, self.w - 0.3, self.h - 0.3, border_color="#0072BD", fill_color="none", rounded=False)

class ERRelation(BaseSmartComponent):
    def __init__(self, cx, cy, text, identifying=False):
        super().__init__(cx, cy, text)
        self.w = max(3.0, len(str(text)) * 0.3 + 0.5)
        self.h = 2.0
        self.identifying = identifying

    def draw(self, ax):
        _draw_diamond(ax, self.cx, self.cy, self.w, self.h, text=self.text)
        if self.identifying:
            _draw_diamond(ax, self.cx, self.cy, self.w - 0.6, self.h - 0.6, text="", fill_color="none")

class ERAttribute(BaseSmartComponent):
    def __init__(self, cx, cy, text, is_primary=False, is_partial=False, is_multivalued=False, is_derived=False):
        super().__init__(cx, cy, text)
        self.w = max(2.5, len(str(text)) * 0.25 + 0.5)
        self.h = 1.2
        self.is_primary = is_primary
        self.is_partial = is_partial
        self.is_multivalued = is_multivalued
        self.is_derived = is_derived

    def draw(self, ax):
        ls = "--" if self.is_derived else "-"
        _draw_ellipse(ax, self.cx, self.cy, self.w, self.h, text=self.text, linestyle=ls, underline=self.is_primary, dashed_underline=self.is_partial)
        if self.is_multivalued:
            _draw_ellipse(ax, self.cx, self.cy, self.w - 0.3, self.h - 0.3, text="", fill_color="none")

class UseCaseActor(BaseSmartComponent):
    def __init__(self, cx, cy, text="Actor"):
        super().__init__(cx, cy, text)
        self.w = 1.5
        self.h = 2.5
        
    def draw(self, ax):
        # Head
        circle = patches.Circle((self.cx, self.cy + 0.5), 0.3, facecolor="white", edgecolor="#0072BD", linewidth=2, zorder=5)
        ax.add_patch(circle)
        # Body
        ax.plot([self.cx, self.cx], [self.cy + 0.2, self.cy - 0.5], color="#0072BD", linewidth=2, zorder=5)
        # Arms
        ax.plot([self.cx - 0.5, self.cx + 0.5], [self.cy, self.cy], color="#0072BD", linewidth=2, zorder=5)
        # Legs
        ax.plot([self.cx, self.cx - 0.4], [self.cy - 0.5, self.cy - 1.2], color="#0072BD", linewidth=2, zorder=5)
        ax.plot([self.cx, self.cx + 0.4], [self.cy - 0.5, self.cy - 1.2], color="#0072BD", linewidth=2, zorder=5)
        # Text
        ax.text(self.cx, self.cy - 1.5, handle_arabic(self.text), color="black", ha="center", va="center", zorder=20)

class UMLClass(BaseSmartComponent):
    def __init__(self, cx, cy, class_name, attributes=[], methods=[]):
        self.cx = cx
        self.cy = cy
        self.class_name = class_name
        self.attributes = attributes
        self.methods = methods
        
        max_len = len(class_name)
        for a in attributes: max_len = max(max_len, len(a))
        for m in methods: max_len = max(max_len, len(m))
        
        self.w = max(3.0, max_len * 0.25 + 0.5)
        self.attr_h = max(0.5, len(attributes) * 0.4)
        self.meth_h = max(0.5, len(methods) * 0.4)
        self.h = 1.0 + self.attr_h + self.meth_h

    def draw(self, ax):
        y_top = self.cy + self.h/2
        
        # Main box
        _draw_box(ax, self.cx - self.w/2, self.cy - self.h/2, self.w, self.h, text="", rounded=False)
        
        # Class Name Box
        name_y = y_top - 0.5
        ax.text(self.cx, name_y, handle_arabic(self.class_name), color="black", ha="center", va="center", zorder=20, weight="bold")
        ax.plot([self.cx - self.w/2, self.cx + self.w/2], [y_top - 1.0, y_top - 1.0], color="#0072BD", linewidth=2, zorder=5)
        
        # Attributes
        attr_start_y = y_top - 1.0 - 0.2
        for i, attr in enumerate(self.attributes):
            ax.text(self.cx - self.w/2 + 0.2, attr_start_y - i*0.4, handle_arabic(attr), color="black", ha="left", va="center", zorder=20)
            
        ax.plot([self.cx - self.w/2, self.cx + self.w/2], [y_top - 1.0 - self.attr_h, y_top - 1.0 - self.attr_h], color="#0072BD", linewidth=2, zorder=5)
        
        # Methods
        meth_start_y = y_top - 1.0 - self.attr_h - 0.2
        for i, meth in enumerate(self.methods):
            ax.text(self.cx - self.w/2 + 0.2, meth_start_y - i*0.4, handle_arabic(meth), color="black", ha="left", va="center", zorder=20)

