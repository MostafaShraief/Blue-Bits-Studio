import sys

with open('template.py', 'r', encoding='utf-8') as f:
    content = f.read()

start_str = "# =========================================================\n#                   TEXT HELPERS\n# ========================================================="
end_str = "# =========================================================\n#                   SHAPE HELPERS\n# ========================================================="

if start_str in content and end_str in content:
    start_idx = content.find(start_str)
    end_idx = content.find(end_str)
    
    new_content = content[:start_idx] + content[end_idx:]
    
    with open('template.py', 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Updated template.py (text engine 3)")
else:
    print("Could not find start or end strings")
