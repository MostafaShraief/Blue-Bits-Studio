Implement PRD.md, continue where we are, mark what you have achived step by step in phases.

### Tech Stack

| Layer       | Technology                       |
| :---------- | :------------------------------- |
| Frontend    | Vite 7, React 19, React Router 7 |
| Styling     | Tailwind CSS v4 (Vite plugin)    |
| Backend     | C# .Net                          |
| DB          | PostgreSQL                       |
| API         | RESTful                          |
| Package Mgr | pnpm                             |

### **Code Rules**

*   **Tailwind CSS v4 exclusively** — no inline `style={}` unless dynamic values require it.
*   Never use hardcoded hex color values in Tailwind classes.
*   Dark mode: use `dark:` variant (respects `prefers-color-scheme`).
*   Use `lucide-react` for icons; do not create custom inline SVG icons from scratch.
*   RTL: this is an Arabic-first app. Use logical properties instead of physical `left` / `right` properties.
*   Log errors with sufficient context (function name, relevant IDs).
*   `main` is protected, always create new branches for tasks if you're not already on one.
*   Always do atomic commits.
*   After the job completed and branch finish its role, merge branch into main.
*   Update `.gitignore`.

### **QA**

*   For end-to-end testing, always use DevTools MCP tool to test changes *yourself*.
*   If you did a significant change, ensure that your work is clean through an E2E testing.