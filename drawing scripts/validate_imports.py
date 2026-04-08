import os
import importlib
import sys

success = True
for root, dirs, files in os.walk('src/draw_engine'):
    for f in files:
        if f.endswith('.py') and f != '__init__.py':
            path = os.path.join(root, f)
            # Use raw strings or proper escapes
            mod_name = path.replace('.py', '').replace(os.sep, '.')
            
            try:
                importlib.import_module(mod_name)
                print(f"✅ Successfully imported {mod_name}")
            except Exception as e:
                print(f"❌ Failed to import {mod_name}: {e}")
                success = False

if not success:
    sys.exit(1)
