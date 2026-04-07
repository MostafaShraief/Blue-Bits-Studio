import arabic_reshaper
from bidi.algorithm import get_display

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
            'delete_harakat': True,
            'shift_harakat_position': False,
            'support_ligatures': True,
            'use_unshaped_instead_of_isolated': True,
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
