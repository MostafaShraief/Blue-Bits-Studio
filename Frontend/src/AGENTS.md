# Frontend AI Agent Instructions

## Working Directory
All frontend commands should be run from the `Frontend/` folder:
```bash
cd Frontend
pnpm dev      # Start development server
pnpm build   # Production build
pnpm preview # Preview production build
```

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

# Files

Update this section constantly for **any** minor change you do in each file.

how to do?:
```
You are an Explore Agent. Your task is to analyze the provided code file and generate a highly concise summary document.
You MUST keep your summary for each file strictly under 500 tokens (approx 1500 words). Make it as short, direct, and useful as possible.

FORMAT YOUR RESPONSE EXACTLY LIKE THIS:
## 1. File Name and Directory
[Filename and path]

### 2. File Type
[backend, frontend, library, testing, etc.]

### 3. What the file does
[Brief overview]

### 4. User Stories
- [Simple and short user story 1]
- [Simple and short user story 2]

### 5. Functions Summary
- \`functionName\`: [What it does]

### 6. Integration
[Does it call backend APIs, interact with databases, or external services?]

### 7. Imports Summary
[Summary of internal and external imports]

### 8. Additional Info
[Any extra context, or "None"]

### 9. API
[How frontend handle request and response body from & to backend]
```
