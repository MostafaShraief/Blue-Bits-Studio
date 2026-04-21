# Frontend AI Agent Instructions

## Project Vision & UI Paradigm
It is a unified hub containing multiple sub-systems (Workflows). 
- **Categorization:** Tools must be grouped logically (e.g., "Extraction Tools", "Processing Tools", "Question Bank Tools").
- **Dynamic Rendering:** The UI is strictly dictated by the backend permissions. If the API does not return a specific `SystemCode` in the user's `allowedWorkflows` array, that tool/tab must be completely hidden from the UI.

## Tech Stack & Styling
- **Stack:** Vite 7, React 19, React Router 7.
- **Styling:** Tailwind CSS v4 (Vite plugin).
- **Icons:** Use `lucide-react` exclusively.
- **Localization (i18n):** This is an **Arabic-first** application (RTL).
  - Use logical Tailwind properties (`ms-` instead of `ml-`, `pe-` instead of `pr-`, `start/end` instead of `left/right`).
  - Use the `SystemCode` (e.g., `LEC_EXT`) as the translation key mapping to Arabic/English text in JSON files. Do not expect translated feature names from the backend.
- **Theme:** Respect system preferences (`dark:` variants). Never use hardcoded hex colors; use Tailwind theme variables.

## Coding Rules & Patterns
1. **Route Guards:** Implement strict React Router guards. If a user manually navigates to `/workflow/pandoc` but lacks the `PANDOC` system code, redirect them to a 403 or Dashboard page.
2. **Forms & Sessions:** Workflows require Sessions. Ensure UI flows seamlessly.

## AI Prompt Instructions
When generating frontend code:
- Always assume RTL context by default. 
- Ensure responsive.
- Validate UI states (Loading, Error, Success) beautifully, providing clear Arabic feedback to the user.