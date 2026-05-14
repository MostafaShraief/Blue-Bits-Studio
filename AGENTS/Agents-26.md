## 1. File Name and Directory
`Frontend/src/pages/CoordinationWizard.jsx`

### 2. File Type
Frontend (React component)

### 3. What the file does
A 3-step wizard (`إعداد الجلسة`, `إدراج النص`, `المعاينة والنسخ`) for coordinating lecture/question-bank formatting. Users select a workflow type, enter session metadata, paste reviewed Markdown text, then preview/copy the compiled prompt for use in Google AI Studio.

### 4. User Stories
- As a coordinator, I want to select a material, lecture number, and type (Theoretical/Practical), so the system knows the context.
- As a coordinator, I want to paste reviewed Markdown and get a compiled prompt, so I can send it to Google AI Studio for formatting.
- As a coordinator, I want to save my session or copy the prompt, so I can resume later or use it immediately.

### 5. Functions Summary
- `getInitialWorkflowCode`: Determines default workflow from URL param `type` respecting user permissions.
- `handleNextStep0`: Validates metadata fields (material, lecture number/type, workflow) before advancing to step 1.
- `goNext`: Creates a session, compiles prompt (auto-save path: fetch from DB; else stateless), then advances to step 2.
- `goBack`: Decrements step (min 0).
- `handleCopy`: Copies prompt text to clipboard with a fallback using `document.execCommand`.
- `handleSave`: Refetches session to mark it as saved.

### 6. Integration
Calls three backend APIs: `createSession` (POST), `fetchSession` (GET), `compilePromptStateless` (POST).

### 7. Imports Summary
- **External:** `react` (useState, useCallback, useEffect, useContext), `react-router` (useSearchParams, useNavigate), `lucide-react` (Copy icon).
- **Internal:** `WizardStepper`, `PromptPreview`, `MaterialAutocomplete`, `AuthContext`, `useSettings`, `api` utils (createSession, fetchSession, compilePromptStateless).

### 8. Additional Info
- Arabic-first UI with RTL support.
- RBAC enforced: redirects to `/unauthorized` if user lacks both `LEC_COORD` and `BANK_COORD` workflows.
- Admins bypass workflow permission checks and see both toggle options.
- Supports session restore via `?id=` and `?type=bank|lecture` query params.

### 9. API
- **createSession (POST):** Sends `{ materialName, lectureNumber, lectureType, workflowSystemCode, generalNotes }`. Receives `{ sessionId, id }`.
- **fetchSession (GET):** Fetches session by ID. Returns `{ compiledPrompt, notes, material, lectureNumber, lectureType, workflowType }`.
- **compilePromptStateless (POST):** Sends `{ systemCode, generalNotes, fileNotes }`. Receives `{ compiledPrompt }`.
