## 1. File Name and Directory
`Frontend/src/components/PromptPreview.jsx`

### 2. File Type
Frontend - React presentational component

### 3. What the file does
Renders a block of text line-by-line inside a scrollable card, with per-line `dir="auto"` to dynamically handle mixed RTL/LTR content (Arabic/English).

### 4. User Stories
- As a user, I want to see the assembled prompt previewed with proper Arabic text direction so I can verify it before submitting.
- As a user, I want long prompts to be scrollable so the UI doesn't overflow.

### 5. Functions Summary
- `PromptPreview({ text })`: Splits `text` by newline and renders each line as a `<p>` with `dir="auto"`. Returns `null` if `text` is falsy.

### 6. Integration
None — purely presentational, no backend/API calls.

### 7. Imports Summary
No imports (no external dependencies).

### 8. Additional Info
Uses Tailwind v4 semantic tokens (`bg-surface-card`, `border-border`). Empty lines render as `\u00A0` (non-breaking space) to preserve height.

### 9. API
No API interaction. Receives `text` string via props only.
