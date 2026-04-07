import arabic_reshaper
from bidi.algorithm import get_display
from .core import CODE_FONT, DEFAULT_SIZE, get_font_prop

# =========================================================
#                   ARABIC TEXT ENGINE
# =========================================================
def handle_arabic(text):
    """
    Reshape and apply bidirectional algorithm for Arabic text.
    Handles multiline strings properly.
    """
    if text is None:
        return ""
    if not isinstance(text, str):
        text = str(text)

    # Simple heuristic to detect if text contains Arabic characters
    has_arabic = any('\u0600' <= c <= '\u06FF' or '\u0750' <= c <= '\u077F' for c in text)
    if not has_arabic:
        return text

    try:
        # Configuration matches standard Blue Bits expectations
        configuration = {
            'delete_harakat': False,
            'shift_harakat_position': False,
            'use_unshaped_instead_of_isolated': False,
        }
        reshaper = arabic_reshaper.ArabicReshaper(configuration=configuration)

        if '\n' in text:
            lines = text.split('\n')
            reshaped_lines = [get_display(reshaper.reshape(line)) for line in lines]
            return '\n'.join(reshaped_lines)
        
        reshaped_text = reshaper.reshape(text)
        bidi_text = get_display(reshaped_text)
        return bidi_text
    except Exception as e:
        print(f"Warning: Failed to reshape Arabic text '{text}': {e}")
        return text

# =========================================================
#                   TEXT HELPERS
# =========================================================
def draw_text(ax, text, x, y, size=DEFAULT_SIZE, color='black', align='center', weight='normal', **kwargs):
    """Draw properly shaped Arabic text or standard English text."""
    is_code = kwargs.pop('is_code', False)
    
    if is_code:
        # Use code font, skip Arabic reshaping
        font_prop = fm.FontProperties(family=CODE_FONT, size=size, weight=weight)
        display_text = text
    else:
        # Default text (assumed potentially Arabic)
        font_prop = get_font_prop(size=size)
        font_prop.set_weight(weight)
        display_text = handle_arabic(text)

    # Basic alignment mappings
    ha = align
    va = 'center'
    
    return ax.text(
        x, y, display_text,
        fontsize=size,
        color=color,
        ha=ha,
        va=va,
        fontproperties=font_prop,
        **kwargs
    )
