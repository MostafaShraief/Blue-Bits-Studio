## 1. File Name and Directory
`Frontend/src/components/PasteButton.jsx`

### 2. File Type
frontend

### 3. What the file does
A reusable button that reads text from the system clipboard via the browser Clipboard API and passes it to a parent callback.

### 4. User Stories
- As a user, I can click the paste button to paste text from my clipboard into an input field.
- As a developer, I can drop this button into any form by passing an `onPaste` handler.

### 5. Functions Summary
- `PasteButton({ onPaste })`: Renders a styled paste button; on click reads clipboard and calls `onPaste(text)`.
- `handlePaste`: Internal async handler — reads `navigator.clipboard.readText()`, passes text to `onPaste`, catches errors and shows an Arabic alert.

### 6. Integration
None. Purely client-side — uses the browser's `navigator.clipboard.readText()` API.

### 7. Imports Summary
- `ClipboardPaste` icon from `lucide-react` (external)

### 8. Additional Info
Arabic-first UX: button label and error alert are in Arabic. Styled with Tailwind v4 logical properties respecting RTL.

### 9. API
No backend calls. Reads clipboard text via the browser Clipboard API (`navigator.clipboard.readText()`).
