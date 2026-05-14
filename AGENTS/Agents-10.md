## 1. File Name and Directory
`Frontend/src/components/PasteImageButton.jsx`

### 2. File Type
frontend

### 3. What the file does
A reusable button that reads images from the system clipboard via the browser Clipboard API and passes the resulting `File` object to a parent callback.

### 4. User Stories
- As a user, I can click the paste button to paste an image from my clipboard into the current workflow.
- As a developer, I can drop this button anywhere by passing an `onPasteImage` handler that receives the pasted `File`.

### 5. Functions Summary
- `PasteImageButton({ onPasteImage })`: Renders a styled paste button; on click reads clipboard images and calls `onPasteImage(file)` per found image.
- `handlePaste`: Internal async handler — reads `navigator.clipboard.read()`, filters for `image/*` MIME types, converts each to a `File` object, and passes it to `onPasteImage`. Shows Arabic error/alerts on failure.

### 6. Integration
None. Purely client-side — uses the browser's `navigator.clipboard.read()` API.

### 7. Imports Summary
- `ClipboardPaste` icon from `lucide-react` (external)

### 8. Additional Info
Arabic-first UX: button label and alerts are in Arabic. Generates a unique filename per pasted image using `Date.now()`. Styled with Tailwind v4 logical properties respecting RTL.

### 9. API
No backend calls. Reads clipboard content via the browser Clipboard API (`navigator.clipboard.read()`) and converts image blobs to `File` objects for the parent component.
