# Product Requirements Document: Comprehensive Drawing Engine

## 1. Purpose & Goals
*   **Complete Refactor of `template.py`**: Methodically break down the monolithic 8,900+ line script into a robust, modular Python package.
*   **Smart Core Engine**: Functions must be expanded to be intelligent (e.g., auto-bounding workspace, smart routing, relative positioning, auto-handling Arabic/Bidi text, and comprehensive kwargs).
*   **Curriculum-Specific Material Libraries**: Build specific drawing toolsets tailored to university engineering subjects (Databases/ER diagrams, Logic Circuits, Algorithms, AI, Networking, etc.).
*   **AI-Assistive Automation**: Provide an API that allows AI models to generate complex diagrams with minimal code by using relative anchors and automatic math calculations.

## 2. Architecture Plan
The new package structure will be localized under `src/draw_engine/`:

```
src/
└── draw_engine/
    ├── __init__.py
    ├── core/           # Canvas setup, themes, saving, auto-bounding logic
    ├── text/           # Arabic engine, font loaders, equations
    ├── shapes/         # Smart primitive shapes returning bounding boxes
    ├── connectors/     # Dynamic routing (shape-to-shape arrows, bezier curves)
    └── materials/      # Domain-specific libraries:
        ├── software_engineering.py  # ER diagrams, UML, Flowcharts
        ├── hardware.py              # Logic gates, Microprocessors, Circuits
        ├── computer_science.py      # Graphs, Trees, Algorithms, OS scheduling
        ├── ai.py                    # Neural Networks, Expert Systems, Fuzzy Logic
        ├── networking.py            # Topologies, Queuing Theory
        └── math_physics.py          # Calculus, Linear Algebra, Signal Processing
tests/                  # Strict Pytest coverage for every single function
```

## 3. Execution Methodology (MANDATORY)
1. **Section by Section**: No massive cut-and-paste. Every function from `template.py` must be extracted individually, reviewed for improvements (smart bounds, edge cases), and tested.
2. **Subagents**: The Commander will delegate specific domains to specialized Workers. Reviewers will verify tests pass before checking off TODOs.
3. **Atomic Commits**: Each extracted module or specific feature set must be committed independently with `feat:` or `refactor:` prefixes, adhering strictly to `AGENTS.md`.

## 4. Coding Rules
- Every drawing function MUST return bounding box data `(xmin, ymin, xmax, ymax)` or an anchor dictionary.
- Auto-bounding must detect elements and prevent canvas clipping.
- Comprehensive docstrings and type hints are required for AI context.