## 1. File Name and Directory
`Frontend/src/pages/DrawWizard.jsx`

### 2. File Type
Frontend

### 3. What the file does
A 3-step wizard (`إعداد الجلسة` → `المدخلات` → `المعاينة والنسخ`) for creating AI prompts that generate Python drawing code. Users configure session metadata, upload reference images + description, then preview/copy the compiled prompt.

### 4. User Stories
- As a user, I can create a drawing session by selecting a material, lecture number, and lecture type.
- As a user, I can upload up to 3 reference images, write a description, and generate an AI prompt for Python chart code.
- As a user, I can preview the compiled prompt and copy it to Google AI Studio.

### 5. Functions Summary
- `DrawWizard()`: Main component rendering the 3-step wizard flow.
- `addImage(file)`: Adds an image (max 3) to the images state.
- `removeImage(index)`: Removes an image by index and revokes its object URL.
- `updateImageNote(index, text)`: Updates the note for an image at given index.
- `goNext()`: Validates step 0 (session data), then creates a session + compiles prompt, advances to step 2.
- `goBack()`: Resets step to 0.
- `handleSave()`: Saves the session via `fetchSession` (no-op if already saved).

### 6. Integration
Calls backend REST APIs: `createSession`, `fetchSession`, `compilePromptStateless`. No direct DB interaction.

### 7. Imports Summary
- **External:** `react-router` (useSearchParams), `react` (useState, useEffect, useCallback)
- **Internal components:** WizardStepper, PromptPreview, GuidedCopyLoop, ImageUploader, PasteButton, PasteImageButton, MaterialAutocomplete
- **Utils:** `createSession`, `fetchSession`, `compilePromptStateless` from `../utils/api`
- **Context:** `useSettings` from `SettingsContext`

### 8. Additional Info
- Arabic-first RTL UI with Tailwind CSS v4.
- Global paste listener on step 1 to capture image pastes outside text inputs.
- Max 3 images with a quality warning if more than 1 is added.
- Supports both auto-save (persisted session) and stateless prompt compilation.

### 9. API
- `fetchSession(id)` → `GET` session data: `{ material, lectureNumber, lectureType, compiledPrompt, notes[], files[] }`
- `createSession({ materialName, lectureNumber, lectureType, workflowSystemCode: 'DRAW', generalNotes, files })` → `POST` returns `{ sessionId, id }`
- `compilePromptStateless({ systemCode: 'DRAW', generalNotes, fileNotes })` → `POST` returns `{ compiledPrompt }`
