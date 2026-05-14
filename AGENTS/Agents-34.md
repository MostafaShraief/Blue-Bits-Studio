## 1. File Name and Directory
Frontend/src/pages/PandocWizard.jsx

### 2. File Type
frontend

### 3. What the file does
Three-step wizard that lets users prepare a session, paste/upload Markdown content, and generate a formatted Word document via Pandoc backend conversion.

### 4. User Stories
- As a user, I can select a material, lecture number, and type, then paste or upload a `.md` file.
- As a user, I can click "إنشاء ملف Word" to convert my Markdown to a `.docx` and download it.

### 5. Functions Summary
- `handleFileOpen`: Reads a selected `.md` file and sets its content as markdown text.
- `handleDrop`: Handles drag-and-drop of `.md` files into the textarea.
- `handleGenerate`: Creates a session, saves markdown content, calls Pandoc generation API, and provides download link.
- `goNext`/`goBack`: Stepper navigation between wizard steps.

### 6. Integration
Calls backend REST APIs via `createSession`, `saveSessionContent`, `fetchSession`, and `generatePandoc` to create sessions, store markdown, and generate Word documents.

### 7. Imports Summary
External: `react-router` (useSearchParams), `react` (useEffect, useState, useRef), `lucide-react` (icons). Internal: `WizardStepper`, `PasteButton`, `MaterialAutocomplete`, `SettingsContext`, `utils/api`.

### 8. Additional Info
Arabic-first UI with RTL layout. Uses `WizardStepper` for step progress. Session loading is supported via `?id=` query param for resuming existing sessions. Drag-and-drop file upload is supported.

### 9. API
**Create Session:** `POST /api/sessions` with `{ materialName, lectureNumber, lectureType, workflowSystemCode: 'PANDOC' }` → returns `{ sessionId }`. **Save Content:** `POST /api/session-contents` with `{ sessionId, contentBody }`. **Generate:** `POST /api/pandoc/generate` with `{ markdownText, templateName, materialName, lectureNumber, lectureType }` → returns `{ fileUrl }`. **Fetch Session:** `GET /api/sessions?id=...` → returns session data with `sessionContents[0].contentBody`.
