import sys

with open('template.py', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace config and fonts
start_str = "# =========================================================\n#                   TEXT HELPERS\n# ========================================================="
end_str = "def add_shape(ax"

if start_str in content and end_str in content:
    start_idx = content.find(start_str)
    end_idx = content.find(end_str)
    
    new_content = content[:start_idx] + content[end_idx:]
    
    with open('template.py', 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Updated template.py (text engine 2)")
else:
    print("Could not find start or end strings")
