import sys

with open('template.py', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace config and fonts
start_str = "# =========================================================\n#                   ARABIC TEXT ENGINE\n# ========================================================="
end_str = "# =========================================================\n#                   CANVAS & SAVING\n# ========================================================="

if start_str in content and end_str in content:
    start_idx = content.find(start_str)
    end_idx = content.find(end_str)
    
    new_content = content[:start_idx] + "from src.draw_engine.text import *\n\n" + content[end_idx:]
    
    with open('template.py', 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Updated template.py (text engine 1)")
else:
    print("Could not find start or end strings")
