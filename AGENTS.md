# Master Project Orchestration Agent

If you are working on Backend, read `BACKEND_AGENTS.md`.

**System Vision:** This is a Unified Academic Platform. It acts as a single centralized portal where various AI-assisted workflows are categorized and accessible as independent sub-systems (tabs/cards), strictly governed by dynamic Role-Based Access Control (RBAC).

**Server Ready:** Ensure that your current step can work on a server (VPS), not only in the current local host machine.

### Tech Stack

| Layer       | Technology                       |
| :---------- | :------------------------------- |
| Frontend    | Vite 7, React 19, React Router 7 |
| Styling     | Tailwind CSS v4 (Vite plugin)    |
| Backend     | C# .NET                          |
| DB          | SQLite                           |
| API         | RESTful                          |
| Package Mgr | pnpm                             |

### Reference
To understand both frontend and backend, **always** read:
- **AGENTS.md for Backend:** Read `Backend/AGENTS.md` and `DATABASE.md` for C#, DB structure, SystemCodes, physical file management, and files documentation.
- **AGENTS.md for Frontend:** Read `src/AGENTS.md` for UI categorization, Arabic RTL styling, dynamic feature rendering, Tailwind v4 rules, and files documentation.

### Master Code Rules

*   **Tailwind CSS v4 exclusively** — no inline `style={}` unless dynamic values require it.
*   Never use hardcoded hex color values in Tailwind classes.
*   Dark mode: use `dark:` variant (respects `prefers-color-scheme`).
*   Use `lucide-react` for icons; do not create custom inline SVG icons from scratch.
*   RTL: this is an Arabic-first app. Use logical properties instead of physical `left` / `right` properties.
*   Log errors with sufficient context (function name, relevant IDs, SystemCodes).
*   `main` branch is protected. Always create new feature/fix branches for tasks if you're not already on one.
*   Always do atomic commits.
*   Keep `.gitignore` updated.

### Quality Assurance (QA)

*   For end-to-end testing, always use DevTools MCP tool to test changes *yourself*.
*   If you did a significant change, ensure that your work is clean through a full E2E test.
*   Verify RBAC UI enforcement: Ensure users cannot see or navigate to UI tabs they do not have database permission for.