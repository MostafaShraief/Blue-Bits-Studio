## 1. File Name and Directory
`Frontend/src/pages/QuizHub.jsx`

### 2. File Type
Frontend

### 3. What the file does
A dual-mode Quiz Hub page with a 2-step wizard: (1) Session setup — enter lecture metadata (material, number, type) and compile a prompt; (2) JSON Editor — upload/edit/add/remove questions, preview them, take a quiz, and save/load sessions to/from the backend.

### 4. User Stories
- As a user, I can enter lecture metadata to prepare a generation prompt and proceed to the editor.
- As a user, I can upload, edit, add, remove, preview, quiz-test, and save/update JSON question banks.

### 5. Functions Summary
- `loadSession`: Fetches a saved session by ID and populates all state.
- `handleSaveSession`: Saves or updates the quiz session to the backend.
- `goNext`/`goBack`/`goToStep`: Navigates wizard steps.
- `handleConfirmModalConfirm`/`handleConfirmModalCancel`: Confirmation modal for unsaved changes.
- `handleNextStep0`: Validates metadata, compiles prompt, advances to editor.
- `safeParseQuizArray`: Parses JSON string and validates it's an array.
- `setQuizFromArray`: Sets quiz data and resets answers/submission.
- `handleFileUpload`: Reads uploaded JSON file and parses into quiz data.
- `handleAnswer`: Records a user's selected answer for a question.
- `calculateScore`: Returns `{correct, total}` score.
- `copyTextOrAlert`: Copies text to clipboard with feedback state.
- `copyToClipboard`: Formats quiz data as readable text and copies.
- `downloadJson`: Downloads formQuizData as a `.json` file.
- `syncQuizData`: Sets formQuizData state.
- `updateFormField`: Updates a single field of a question.
- `updateOption`: Updates an option text by question/option index.
- `setCorrectOption`: Toggles the correct option for a question.
- `handleAddQuestions`: Appends empty question objects to the list.
- `removeQuestion`: Removes a question by index.

### 6. Integration
Calls backend APIs via `../utils/api`: `fetchSession`, `saveQuizSession`, `compilePromptStateless`.

### 7. Imports Summary
- **React**: `useState`, `useRef`, `useEffect`, `useContext`
- **Router**: `useSearchParams`, `useNavigate`
- **Icons**: 18 icons from `lucide-react`
- **Internal**: `WizardStepper`, `MaterialAutocomplete`, `saveQuizSession`/`fetchSession`/`createSession`/`compilePromptStateless`, `useSettings`

### 8. Additional Info
Uses a 2-step wizard (`WizardStepper`). Two view modes: `preview` (inline editing of questions) and `quiz` (interactive test with scoring). Tracks unsaved changes with `beforeunload` and a custom confirmation modal. Handles `sessionId` from URL `?id=` query param for loading existing sessions.

### 9. API
- `fetchSession(id)` → returns `{ sessionContents: [{ contentBody }], material, lectureNumber, lectureType }`
- `saveQuizSession({ id?, materialName, lectureNumber, lectureType, workflowSystemCode: 'BANK_QS', generalNotes, quizData })` → returns `{ id }`
- `compilePromptStateless({ systemCode: 'BANK_QS', generalNotes, fileNotes })` → returns `{ compiledPrompt }`
