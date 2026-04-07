# Product Requirements Document: Smart Drawing Engine Refactor

## 1. Purpose & Goals
*   **Refactor `template.py`**: Break down the monolithic `template.py` (8900+ lines) into a modular, flexible Python package.
*   **Smart Drawing Engine**: Ensure functions are not just extracted, but *expanded* to cover edge cases, provide smart defaults, and be highly resilient.
*   **AI-Assistive Automation**: Make the API declarative. It should help AI models draw complex layouts easily without complex math.
*   **Auto-Bounding (No-Cuts)**: Implement an intelligent system to detect the `plt` workspace (all drawn elements) and auto-scale/adjust bounds so no elements are cut off.
*   **Maintain Arabic-First**: Native support for Arabic reshaping and BiDi text handling.

## 2. Architecture Plan
The new package structure will be localized under `src/draw_engine/`:

```
src/
└── draw_engine/
    ├── __init__.py
    ├── core.py         # Canvas setup, themes, saving, auto-bounding
    ├── text.py         # Arabic engine, font loaders, rich text
    ├── shapes.py       # Boxes, circles, polygons, relative positioning
    ├── connectors.py   # Dynamic routing, arrows between objects
    └── utils.py        # Math helpers, coordinate calculators
tests/                  # Pytest unit tests
```

## 3. Execution Phases (Atomic Commits required)

### Phase 1: Setup & Cleanup
- Clean up outdated files (`list.md`, redundant server scripts) if verified unused.
- Create base directories.
- Update `requirements.txt` to include `pytest`.
- Update `README.md`.

### Phase 2: Core & Text Engine
- Extract Theme Constants, Font Loaders, and Arabic Text Engine.
- Extract Canvas & Saving. Include the **Auto-Bounding** feature to smartly detect limits.

### Phase 3: Shapes & Connectors
- Extract Shape Helpers (make them smart: returning bounding boxes, anchoring).
- Extract smart Connectors (dynamic arrows connecting `shape A` to `shape B`).

### Phase 4: Integration
- Verify all original capabilities of `template.py` exist in the new engine.
- Ensure the E2E behavior matches or exceeds the original script.

## 4. Coding Rules
- Add comprehensive docstrings and type hints.
- Tests must pass for each module extracted.
- Follow `AGENTS.md` atomic commit guidelines.
