## 1. File Name and Directory
`Frontend/src/pages/ExtractionWizard.jsx`

### 2. File Type
Frontend (React page component)

### 3. What the file does
Multi-step wizard (3 steps) for extracting lecture/question-bank content: Step 1 — session metadata entry, Step 2 — image uploads + general notes, Step 3 — prompt preview + guided copy loop. Supports both `LEC_EXT` (lecture extraction) and `BANK_EXT` (bank extraction) workflows.

### 4. User Stories
- As a user, I can select extraction type (lecture/bank), pick a material, enter lecture number & type, then proceed.
- As a user, I can upload images with per-image notes and add general notes to build the extraction prompt.
- As a user, I can preview the compiled prompt, copy it along with images to clipboard, and save the session.

### 5. Functions Summary
- `ExtractionWizard` (default export): Main component; manages 3-step state, handles session creation, prompt compilation, and navigation.
- `addImage`: Appends a file to the images array with an object URL.
- `removeImage`: Removes an image by index and revokes its object URL.
- `updateImageNote`: Updates the note for a specific image.
- `goNext`: Advances step; on step 1→2, creates a session (with file uploads) and compiles the prompt (via DB fetch or stateless API).
- `goBack`: Decrements step.
- `handleSave`: Marks session as saved by re-fetching it.

### 6. Integration
Calls backend REST API (`/api/sessions`, `/api/prompts/compile`) via `createSession`, `fetchSession`, and `compilePromptStateless` utility functions.

### 7. Imports Summary
- **External:** `useState`, `useCallback`, `useEffect`, `useContext` (React), `useSearchParams`, `Link`, `useNavigate` (React Router).
- **Internal:** `WizardStepper`, `ImageUploader`, `PromptPreview`, `GuidedCopyLoop`, `PasteButton`, `PasteImageButton`, `MaterialAutocomplete`, `createSession`/`fetchSession`/`compilePromptStateless` from `../utils/api`, `useSettings` context, `AuthContext`.

### 8. Additional Info
Enforces RBAC: redirects to `/unauthorized` if user lacks both `LEC_EXT` and `BANK_EXT` permissions. Admins bypass permission checks. Supports both auto-save (fetch compiled prompt from DB) and stateless prompt compilation modes. Handles session restoration via `?id=` query param and `?type=bank` URL param.

### 9. API
- **`POST /api/sessions`** — `createSession({ materialName, workflowSystemCode, lectureNumber, lectureType, generalNotes })` → creates session, then uploads files via `POST /api/sessions/{id}/files` with `FormData` (files + notes). Returns session object with `id`/`sessionId`.
- **`GET /api/sessions/{id}`** — `fetchSession(id)` → fetches session data including `materialName`, `lectureNumber`, `lectureType`, `workflowType`, `compiledPrompt`, `notes[]`, `files[]`.
- **`POST /api/prompts/compile`** — `compilePromptStateless({ systemCode, generalNotes, fileNotes })` → returns `{ compiledPrompt }` without persisting.
