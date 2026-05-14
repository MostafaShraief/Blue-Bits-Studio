## 1. File Name and Directory
`Frontend/src/components/ImageUploader.jsx`

### 2. File Type
frontend — React image upload component with drag-and-drop

### 3. What the file does
Provides an image upload card UI with per-image note textareas. Handles file selection via click or drag-and-drop, compresses images client-side via `browser-image-compression`, and delegates state management to the parent via callbacks.

### 4. User Stories
- As a user, I can click or drag-and-drop images to upload them with automatic compression.
- As a user, I can write an optional note for each uploaded image and remove individual images.

### 5. Functions Summary
- `handleFiles`: Accepts a `FileList`, filters for images up to `maxImages`, compresses each (max 1 MB / 1920px), then calls `onAdd` per file.
- `handleDrop`: Prevents default and delegates to `handleFiles`.
- Component renders: image thumbnails with remove button & note textarea, plus a dashed drop zone with hidden file input.

### 6. Integration
No backend API calls. Pure client-side component — image files and notes are managed by the parent component via `onAdd`, `onRemove`, and `onNoteChange` callbacks.

### 7. Imports Summary
- `useRef`, `useState` (React)
- `ImagePlus`, `X` (lucide-react)
- `imageCompression` from `browser-image-compression` (external library)

### 8. Additional Info
Compression failures fall back to the original file. The `maxImages` prop defaults to `Infinity`. The UI is Arabic-first (placeholder text, positioning).

### 9. API
No direct API interaction. Images are passed as `File` objects to the parent; the parent is responsible for uploading them to the backend.
