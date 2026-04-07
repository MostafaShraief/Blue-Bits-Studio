with open("src/draw_engine/materials/computer_science.py", "r", encoding="utf-8") as f:
    lines = f.readlines()

new_lines = []
for line in lines:
    if 'anchors["top"] = anchors["n"]' in line:
        new_lines.append('    anchors = {\n')
        new_lines.append('        "top": (x, y + r),\n')
        new_lines.append('        "bottom": (x, y - r),\n')
        new_lines.append('        "left": (x - r, y),\n')
        new_lines.append('        "right": (x + r, y)\n')
        new_lines.append('    }\n')
    elif 'anchors["bottom"] = anchors["s"]' in line or 'anchors["left"] = anchors["w"]' in line or 'anchors["right"] = anchors["e"]' in line:
        continue
    elif 'return box, bbox, anchors' in line and 'if not processes:' in ''.join(lines):
        new_lines.append('        anchors = {"left": (x, y+cell_h/2), "right": (x+cell_w*2, y+cell_h/2)}\n')
        new_lines.append(line)
    else:
        new_lines.append(line)

with open("src/draw_engine/materials/computer_science.py", "w", encoding="utf-8") as f:
    f.writelines(new_lines)
