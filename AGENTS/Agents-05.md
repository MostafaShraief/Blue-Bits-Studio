## 1. File Name and Directory
`Frontend/src/components/GuidedCopyLoop.jsx`

### 2. File Type
Frontend – React component

### 3. What the file does
A stepper UI that cycles through a prompt text followed by N images. Users navigate prev/next, copy the current item to clipboard (text via `navigator.clipboard.writeText`, images via `ClipboardItem` blob), and auto-advance after copy. Displays a thumbnail preview on image steps.

### 4. User Stories
- As a user, I can step through a prompt and its generated images one-by-one and copy each to clipboard.
- As a user, I see a visual flash confirmation when an item is copied, then automatically advance to the next step.

### 5. Functions Summary
- `GuidedCopyLoop({ prompt, images })`: Main component; renders step indicator, preview card, and navigation/copy buttons.
- `handleCopy`: Copies current step content (prompt text or image blob) to clipboard, sets copied state, auto-advances after 800ms. Falls back to `document.execCommand('copy')` on error.
- `next`/`prev`: Cycle step index forward/backward with wraparound.
- `reset`: Resets step index to 0 (prompt).

### 6. Integration
None. Operates purely client-side – no backend API or database calls.

### 7. Imports Summary
- **External:** `react` (`useState`, `useCallback`), `lucide-react` icons (`Copy`, `ChevronRight`, `ChevronLeft`, `RotateCcw`, `ImageIcon`, `FileText`).

### 8. Additional Info
Arabic-first UI with RTL layout. Uses Tailwind CSS v4 classes. Copy confirmation triggers a brief success animation (`animate-copy-flash`) and auto-advance.

### 9. API
No backend interaction. Accepts `prompt` (string) and `images` (array of `{ file: File, url: string }`) as props. All clipboard operations use browser APIs (`navigator.clipboard`).
