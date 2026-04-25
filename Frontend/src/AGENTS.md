# Frontend AI Agent Instructions

## Working Directory
All frontend commands should be run from the `Frontend/` folder:
```bash
cd Frontend
pnpm dev      # Start development server
pnpm build   # Production build
pnpm preview # Preview production build
```

## Project Vision & UI Paradigm
It is a unified hub containing multiple sub-systems (Workflows). 
- **Categorization:** Tools must be grouped logically (e.g., "Extraction Tools", "Processing Tools", "Question Bank Tools").
- **Dynamic Rendering:** The UI is strictly dictated by the backend permissions. If the API does not return a specific `SystemCode` in the user's `allowedWorkflows` array, that tool/tab must be completely hidden from the UI.

## Tech Stack & Styling
- **Stack:** Vite 7, React 19, React Router 7.
- **Styling:** Tailwind CSS v4 (Vite plugin).
- **Icons:** Use `lucide-react` exclusively.
- **Localization (i18n):** This is an **Arabic-first** application (RTL).
  - Use logical Tailwind properties (`ms-` instead of `ml-`, `pe-` instead of `pr-`, `start/end` instead of `left/right`).
  - Use the `SystemCode` (e.g., `LEC_EXT`) as the translation key mapping to Arabic/English text in JSON files. Do not expect translated feature names from the backend.
- **Theme:** Respect system preferences (`dark:` variants). Never use hardcoded hex colors; use Tailwind theme variables.

## Coding Rules & Patterns
1. **Route Guards:** Implement strict React Router guards. If a user manually navigates to `/workflow/pandoc` but lacks the `PANDOC` system code, redirect them to a 403 or Dashboard page.
2. **Forms & Sessions:** Workflows require Sessions. Ensure UI flows seamlessly.

## AI Prompt Instructions
When generating frontend code:
- Always assume RTL context by default. 
- Ensure responsive.
- Validate UI states (Loading, Error, Success) beautifully, providing clear Arabic feedback to the user.

# Files

Update this section constantly for **any** minor change you do in each file.

how to do?:
```
You are an Explore Agent. Your task is to analyze the provided code file and generate a highly concise summary document.
You MUST keep your summary for each file strictly under 500 tokens (approx 1500 words). Make it as short, direct, and useful as possible.

FORMAT YOUR RESPONSE EXACTLY LIKE THIS:
## 1. File Name and Directory
[Filename and path]

### 2. File Type
[backend, frontend, library, testing, etc.]

### 3. What the file does
[Brief overview]

### 4. User Stories
- [Simple and short user story 1]
- [Simple and short user story 2]

### 5. Functions Summary
- \`functionName\`: [What it does]

### 6. Integration
[Does it call backend APIs, interact with databases, or external services?]

### 7. Imports Summary
[Summary of internal and external imports]

### 8. Additional Info
[Any extra context, or "None"]

### 9. API
[How frontend handle request and response body from & to backend]

---

## Components - Part 1

## 1. AdminLayout.jsx
**File:** `src/components/AdminLayout.jsx`
**Type:** Frontend - Layout Component

### What it does
Admin-specific layout with fixed sidebar navigation containing 3 items (Users, Materials, System), dark mode toggle, and logout button. Renders child routes via React Router `Outlet`.

### User Stories
- Admin views admin panel sidebar with dark mode support
- Admin logs out from admin panel and is redirected

### Functions Summary
- `AdminLayout`: Main component combining sidebar + Outlet

### Integration
- Reads `darkMode`/`setDarkMode` from `SettingsContext`
- Calls `logout()` from `AuthContext`

### Imports Summary
- react-router (NavLink, Outlet)
- lucide-react (Users, BookOpen, Settings2, LogOut, Moon, Sun, Crown)
- SettingsContext, AuthContext

### API
N/A - Layout component only

---

## 2. AdminRoute.jsx
**File:** `src/components/AdminRoute.jsx`
**Type:** Frontend - Route Guard

### What it does
Protects admin routes with 3-level auth check: loading spinner → redirect to `/login` if unauthenticated → redirect to `/` if not Admin → render child routes.

### User Stories
- Unauthenticated user navigates to `/admin/*` → redirected to login
- Non-admin user navigates to `/admin/*` → shown "غير مصرح" (Unauthorized) screen with Arabic error message

### Functions Summary
- `AdminRoute`: Main component with loading/auth/role checks

### Integration
- Reads `user`, `loading` from `AuthContext`
- Navigates using React Router `Navigate`

### Imports Summary
- react-router (Navigate, Outlet)
- AuthContext, lucide-react (Loader2, ShieldX, Crown)

### API
N/A - Route guard only

---

## 3. GuidedCopyLoop.jsx
**File:** `src/components/GuidedCopyLoop.jsx`
**Type:** Frontend - Interactive UI Component

### What it does
Cycles through: Prompt → Image 1 → Image 2 → ... with prev/next navigation. Each step has a copy button that copies text or images to clipboard with fallback for browsers that don't support clipboard API.

### User Stories
- User copies AI prompt to clipboard with visual feedback
- User copies images one by one from wizard results

### Functions Summary
- `GuidedCopyLoop`: Main component managing step state
- `handleCopy`: Async copy handler with clipboard API and fallback
- `next`/`prev`/`reset`: Step navigation functions

### Integration
- Uses `navigator.clipboard.writeText()` and `ClipboardItem` API for images
- Falls back to `execCommand('copy')` for text

### Imports Summary
- react (useState, useCallback)
- lucide-react (Copy, ChevronRight, ChevronLeft, RotateCcw, ImageIcon, FileText)

### API
N/A - Client-side clipboard operations only

---

## 4. ImageUploader.jsx
**File:** `src/components/ImageUploader.jsx`
**Type:** Frontend - Form Component

### What it does
Image upload card with drag-and-drop support, per-image note textarea, thumbnail preview, and remove button. Enforces `maxImages` limit.

### User Stories
- User drags and drops images onto upload zone
- User adds notes to uploaded images before submission
- User removes uploaded images before submission

### Functions Summary
- `ImageUploader`: Main component rendering image list + upload zone
- `handleFiles`: Filters valid image files within maxImages limit
- `handleDrop`: Handles drag-and-drop file input

### Integration
- No backend calls
- Uses `URL.createObjectURL()` for image previews (called externally)

### Imports Summary
- react (useRef)
- lucide-react (ImagePlus, X)

### API
N/A - Local state management only

---

## 5. Layout.jsx
**File:** `src/components/Layout.jsx`
**Type:** Frontend - Layout Component

### What it does
Main user layout combining `Sidebar` + main content area (`Outlet`) + `TourOverlay` for onboarding.

### User Stories
- Regular user sees sidebar navigation and main content area
- Tour overlay appears for first-time users

### Functions Summary
- `Layout`: Main component combining Sidebar + Outlet + TourOverlay

### Integration
- Renders `Sidebar` and `TourOverlay` child components

### Imports Summary
- react-router (Outlet)
- Sidebar, TourOverlay (local components)

### API
N/A - Layout wrapper only

---

## Components - Part 2

## 6. PasteButton.jsx
**File:** `src/components/PasteButton.jsx`
**Type:** Frontend - UI Component

### What it does
Button that reads text from clipboard using the Clipboard API and calls `onPaste(text)` callback. Shows Arabic error alert if clipboard access fails.

### User Stories
- User pastes text from clipboard into a form field
- User sees Arabic error message if clipboard access is denied

### Functions Summary
- `PasteButton`: Main component
- `handlePaste`: Async handler that reads clipboard text and passes to `onPaste`

### Integration
- Uses `navigator.clipboard.readText()` API
- Calls `onPaste` callback with clipboard content

### Imports Summary
- lucide-react (ClipboardPaste)

### API
N/A - Client-side clipboard only

---

## 7. PasteImageButton.jsx
**File:** `src/components/PasteImageButton.jsx`
**Type:** Frontend - UI Component

### What it does
Button that reads images from clipboard using the Clipboard Read API, converts blobs to File objects, and calls `onPasteImage(file)` callback.

### User Stories
- User pastes image from clipboard into upload queue
- User sees Arabic error message if no image found or access denied

### Functions Summary
- `PasteImageButton`: Main component
- `handlePaste`: Async handler that reads clipboard, extracts image blobs, creates File objects

### Integration
- Uses `navigator.clipboard.read()` API
- Converts Blob to File with timestamped filename
- Calls `onPasteImage` callback

### Imports Summary
- lucide-react (ClipboardPaste)

### API
N/A - Client-side clipboard only

---

## 8. PromptPreview.jsx
**File:** `src/components/PromptPreview.jsx`
**Type:** Frontend - Display Component

### What it does
Renders assembled prompt text with per-line `dir="auto"` for proper RTL/LTR rendering. Each line is a separate `<p>` element with monospace font.

### User Stories
- User views formatted AI prompt with proper Arabic text direction
- User scrolls through long prompts in a bounded container

### Functions Summary
- `PromptPreview`: Main component with line-by-line rendering

### Integration
- No external calls - pure display component

### Imports Summary
- None (pure component)

### API
N/A - Display only

---

## 9. ProtectedRoute.jsx
**File:** `src/components/ProtectedRoute.jsx`
**Type:** Frontend - Route Guard

### What it does
Protects routes requiring authentication and optional workflow access. Checks: loading → unauthenticated → workflow access. Supports `requiredCode` prop for RBAC enforcement.

### User Stories
- Unauthenticated user navigates to protected route → redirected to `/login`
- Authenticated user without workflow permission → shown "غير مصرح" (403) screen

### Functions Summary
- `ProtectedRoute`: Main component with 3-level auth check
- `hasWorkflowAccess(requiredCode)`: Checked from AuthContext

### Integration
- Reads `user`, `loading`, `hasWorkflowAccess` from `AuthContext`
- Navigates using React Router `Navigate`

### Imports Summary
- react-router (Navigate, Outlet)
- AuthContext, lucide-react (Loader2, ShieldX)

### API
N/A - Route guard only

---

## 10. Sidebar.jsx
**File:** `src/components/Sidebar.jsx`
**Type:** Frontend - Layout Component

### What it does
Main user sidebar with dynamic navigation based on RBAC. Shows/hides workflow items based on `user.allowedWorkflows`. Includes dark mode toggle and auto-save toggle.

### User Stories
- User sees only authorized workflow items in sidebar
- User toggles dark mode and auto-save settings
- Admin sees admin panel link (if role === 'Admin')

### Functions Summary
- `Sidebar`: Main component with NAV_ITEMS mapping
- `isAuthorized` check per nav item using `user.allowedWorkflows`

### Integration
- Reads `darkMode`, `setDarkMode`, `autoSave`, `setAutoSave` from `SettingsContext`
- Reads `user` from `AuthContext`
- Renders logo from `/logos/Horizontal logo.png`

### Imports Summary
- react-router (NavLink)
- lucide-react (LayoutDashboard, FileSearch, AlignRight, etc.)
- SettingsContext, AuthContext

### API
N/A - Layout only

### SystemCodes Used
- `LEC_EXT` - Extraction
- `COORD` - Coordination
- `PANDOC` - Pandoc converter
- `MERGE` - File merge
- `DRAW` - Drawing
- `QUIZ` - Quiz bank
- `HIST` - History

---

## Components - Part 3

## 11. TourOverlay.jsx
**File:** `src/components/TourOverlay.jsx`
**Type:** Frontend - Onboarding Component

### What it does
Onboarding tour overlay that highlights target UI elements with a spotlight effect. Uses portal rendering to overlay on top of all content. Navigates through steps with prev/next controls.

### User Stories
- First-time user sees guided tour highlighting UI elements
- User can skip or navigate through tour steps

### Functions Summary
- `TourOverlay`: Main component with position calculation
- `updatePosition`: Calculates target element rect, adds highlight ring, scrolls into view

### Integration
- Uses `useTour()` from `TourContext`
- Uses `createPortal` to render at document body level
- Listens to `resize` and `scroll` events for position updates

### Imports Summary
- react, react-router (createPortal)
- TourContext, lucide-react (X, ArrowRight, ArrowLeft)

### API
N/A - UI overlay only

---

## 12. WizardStepper.jsx
**File:** `src/components/WizardStepper.jsx`
**Type:** Frontend - UI Component

### What it does
Horizontal step indicator for multi-step wizards. Shows circles with numbers/Check icon, labels, and connector lines. States: done (green), active (primary), pending (gray).

### User Stories
- User sees visual progress through wizard steps
- User knows which step they are currently on

### Functions Summary
- `WizardStepper`: Main component rendering step circles and connectors

### Integration
- No external calls - pure display component

### Imports Summary
- lucide-react (Check)

### API
N/A - Display only

---

## 13. MaterialAutocomplete.jsx
**File:** `src/components/common/MaterialAutocomplete.jsx`
**Type:** Frontend - Form Component

### What it does
Autocomplete dropdown for selecting academic materials. Fetches materials list from API on mount, filters locally based on user input, shows dropdown on focus/typing.

### User Stories
- Admin selects or types material name from existing list
- User types to filter through materials

### Functions Summary
- `MaterialAutocomplete`: Main component with controlled input
- `handleInputChange`: Filters materials list based on input
- `selectMaterial`: Closes dropdown and sets selected value

### Integration
- Calls `fetchMaterials()` from `utils/api` on mount
- Controlled input with `onChange` callback

### Imports Summary
- react (useState, useEffect, useRef)
- utils/api (fetchMaterials)

### API
- **Request:** `GET /api/materials`
- **Response:** Array of material name strings

---

## Contexts - Part 1

## 14. AuthContext.jsx
**File:** `src/contexts/AuthContext.jsx`
**Type:** Frontend - React Context

### What it does
Global authentication context providing login/logout functions, current user state, and RBAC workflow access checking. Persists auth state to localStorage.

### User Stories
- User logs in with username/password, receives JWT token and workflow permissions
- Protected routes check user's allowedWorkflows against required SystemCodes
- Admin bypasses all workflow access checks

### Functions Summary
- `AuthProvider`: Wraps app with auth state and functions
- `login(username, password)`: POST to `/api/auth/login`, stores token + user data
- `logout()`: Clears user state and localStorage
- `hasWorkflowAccess(systemCode)`: Returns true if user has workflow permission (or is Admin)

### Integration
- Calls `POST /api/auth/login` with username/password
- Stores JWT token and user data in localStorage
- Reads/stores from `localStorage` keys: `token`, `bluebits_user`

### Imports Summary
- react (createContext, useState, useEffect, useCallback)

### API
- **Login Request:** `POST /api/auth/login` → `{ username, password }`
- **Login Response:** `{ token, userId, username, firstName, lastName, role, authorizedWorkflows[] }`
- **RBAC:** `authorizedWorkflows[]` contains SystemCode strings like `LEC_EXT`, `COORD`, `PANDOC`, etc.

---

## 15. SettingsContext.jsx
**File:** `src/contexts/SettingsContext.jsx`
**Type:** Frontend - React Context

### What it does
Global settings context managing dark mode toggle and auto-save toggle. Persists settings to localStorage and applies dark class to document root.

### User Stories
- User toggles dark mode, UI theme changes immediately
- User toggles auto-save preference for workflows

### Functions Summary
- `SettingsProvider`: Wraps app with settings state
- `SettingsProvider` effect: Applies/removes `dark` class on `<html>` based on `darkMode`
- `useSettings()`: Custom hook to access settings context values

### Integration
- Persists to localStorage keys: `darkMode`, `autoSave`
- Manipulates `document.documentElement.classList`

### Imports Summary
- react (createContext, useContext, useState, useEffect)

### API
N/A - Client-side settings only

---

## 16. TourContext.jsx
**File:** `src/contexts/TourContext.jsx`
**Type:** Frontend - React Context

### What it does
Onboarding tour system with 3 workflows (lecture, bank, draw). Defines step-by-step guidance with auto-fill capabilities, target selectors, and navigation between routes.

### User Stories
- User starts guided tour from dashboard, follows steps through workflows
- Tour auto-fills form fields with demo data to demonstrate the workflow
- Tour ends after completing all steps or user clicks "إنهاء الجولة"

### Functions Summary
- `TourProvider`: Wraps app with tour state and navigation functions
- `startTour(workflowId)`: Begins tour for 'lecture', 'bank', or 'draw' workflow
- `stopTour()`: Ends current tour, clears state
- `nextStep()`/`prevStep()`: Navigate through tour steps
- `currentStep`: Object with `path`, `selector`, `title`, `content`, and optional `autoFill()` function

### Integration
- Uses `useNavigate` and `useLocation` from react-router
- `TOUR_DATA` constant contains 3 workflows with step definitions
- Each step has CSS `selector` for highlighting and optional `autoFill()` function

### Imports Summary
- react (createContext, useContext, useState, useEffect)
- react-router (useLocation, useNavigate)

### API
N/A - Onboarding system only

---

## Pages - Part 1

## 17. Dashboard.jsx
**File:** `src/pages/Dashboard.jsx`
**Type:** Frontend - Page

### What it does
Main dashboard page displaying stats cards, quick action buttons for workflows, and recent sessions list. Fetches stats and session history from API on mount.

### User Stories
- User views summary stats (lectures, banks, draws, total sessions)
- User clicks quick actions to start new workflows
- User views and navigates to recent sessions

### Functions Summary
- `Dashboard`: Main component with stats/sessions fetching
- `load()`: Async function fetching `fetchStats()` and `fetchSessions()`
- Route logic for linking to session types (quiz, bank, lecture, etc.)

### Integration
- Calls `fetchStats()` from `utils/api` for dashboard statistics
- Calls `fetchSessions()` from `utils/api` for recent sessions list
- Links to `/tour` for guided onboarding tour

### Imports Summary
- react (useState, useEffect)
- react-router (Link)
- lucide-react (FileSearch, AlignRight, FileOutput, Palette, etc.)
- utils/api (fetchSessions, fetchStats)

### API
- **Stats Request:** `GET /api/sessions/stats`
- **Stats Response:** `{ total, lecture, bank, quiz, draw, pandoc, coordination }`
- **Sessions Request:** `GET /api/sessions`
- **Sessions Response:** Array of session objects with `id`, `workflowType`, `materialName`, `createdAt`

---

## 18. Login.jsx
**File:** `src/pages/Login.jsx`
**Type:** Frontend - Page

### What it does
Login page with username/password form. Calls `login()` from AuthContext, stores JWT token, redirects to `/` or `/admin/users` based on role.

### User Stories
- User enters credentials and logs in
- User sees error message on invalid credentials
- Admin user is redirected to admin panel after login

### Functions Summary
- `Login`: Main component with form state
- `handleSubmit`: Calls `login(username, password)`, handles redirect

### Integration
- Calls `login()` from `AuthContext`
- Uses `useNavigate` for redirect after login
- Redirects admins to `/admin/users`, others to `/`

### Imports Summary
- react (useState, useContext, useEffect)
- react-router (useNavigate)
- AuthContext, lucide-react (LogIn, User, Lock, Loader2, AlertCircle)

### API
- **Login Request:** `POST /api/auth/login` → `{ username, password }`
- **Login Response:** `{ token, userId, username, firstName, lastName, role, authorizedWorkflows[] }`

---

## 19. History.jsx
**File:** `src/pages/History.jsx`
**Type:** Frontend - Page

### What it does
Session history page with filter buttons by workflow type. Displays sessions with material name, type, timestamp. Allows viewing and deleting sessions.

### User Stories
- User views all past sessions with filtering
- User clicks "عرض الجلسة" to reopen a session
- User deletes sessions with confirmation dialog

### Functions Summary
- `History`: Main component with sessions list
- `loadSessions()`: Fetches all sessions from API
- `handleDelete(id)`: Calls `removeSession(id)` with confirmation

### Integration
- Calls `fetchSessions()` and `removeSession()` from `utils/api`
- Links to session-specific pages based on `workflowType`

### Imports Summary
- react (useState, useMemo, useEffect)
- react-router (Link)
- lucide-react (Clock, FileSearch, AlignRight, Palette, FileOutput, Trash2, Eye)
- utils/api (fetchSessions, removeSession)

### API
- **List Request:** `GET /api/sessions`
- **List Response:** Array of session objects
- **Delete Request:** `DELETE /api/sessions/{id}`

---

## 20. QuizHub.jsx
**File:** `src/pages/QuizHub.jsx`
**Type:** Frontend - Page

### What it does
Multi-step wizard for quiz bank management with 4 steps: Menu → Session Setup → Prompt Generation → JSON Editor. Supports upload/edit/quiz mode for question banks.

### User Stories
- User creates prompt for quiz bank generation
- User uploads JSON file to edit question bank
- User takes quiz in test mode with answer validation
- User saves/updates quiz session to database

### Functions Summary
- `QuizHub`: Main multi-step wizard component
- `handleFileUpload`: Reads JSON file, parses quiz array
- `handleAnswer/calculateScore`: Quiz mode answer tracking
- `handleSaveSession`: Saves quiz data to API
- `copyToClipboard/downloadJson`: Export functions
- `handleAddQuestions/removeQuestion`: Edit question bank

### Integration
- Calls `createSession`, `saveQuizSession`, `fetchSession`, `compilePromptStateless` from `utils/api`
- Uses `WizardStepper`, `MaterialAutocomplete` components
- Supports URL param `?id=` for loading saved sessions

### Imports Summary
- react (useState, useRef, useEffect)
- react-router (useSearchParams, useNavigate)
- lucide-react (FileJson, Upload, Eye, CheckCircle2, etc.)
- components (WizardStepper, MaterialAutocomplete)
- utils/api (saveQuizSession, fetchSession, createSession, compilePromptStateless)

### API
- **Create Session:** `POST /api/sessions` → `{ materialName, lectureNumber, lectureType, workflowSystemCode }`
- **Save Quiz:** `POST /api/sessions/save` with `quizData[]` in body
- **Fetch Session:** `GET /api/sessions/{id}`
- **Compile Prompt (stateless):** `POST /api/prompts/compile` → `{ systemCode, generalNotes, fileNotes[] }`

---

## 21. Tour.jsx
**File:** `src/pages/Tour.jsx`
**Type:** Frontend - Page

### What it does
Tour selection page displaying 3 workflow guides (lecture, bank, draw) with steps and capabilities. Allows user to start interactive guided tour.

### User Stories
- User views overview of all workflows and their capabilities
- User starts interactive tour for any workflow
- User learns about integrated tools (AI Studio, Obsidian, VS Code)

### Functions Summary
- `Tour`: Main component with WORKFLOWS data
- `startTour(workflowId)`: Called from TourContext to begin guided tour

### Integration
- Uses `useTour()` from `TourContext`
- `startTour()` navigates to first step and activates overlay

### Imports Summary
- react
- lucide-react (BookOpen, FlaskConical, Palette, Sparkles, Code, Database, etc.)
- TourContext

### API
N/A - Static content page

---

## Pages - Part 2 (Wizards)

## 22. CoordinationWizard.jsx
**File:** `src/pages/CoordinationWizard.jsx`
**Type:** Frontend - Page (Wizard)

### What it does
3-step wizard: Session Setup → Insert Markdown Text → Preview & Copy Prompt. Generates coordination prompts for lecture or bank workflows.

### User Stories
- User enters metadata and workflow type (lecture/bank)
- User pastes revised markdown text from Obsidian
- User copies generated coordination prompt for AI Studio

### Functions Summary
- `CoordinationWizard`: Main wizard with 3 steps
- `handleNextStep0`: Validates metadata before step 1
- `goNext`: Creates session and compiles prompt via API
- `handleCopy`: Copies prompt to clipboard

### Integration
- Calls `createSession`, `fetchSession`, `compilePromptStateless` from `utils/api`
- Uses `WizardStepper`, `PromptPreview`, `MaterialAutocomplete` components
- Uses `useSettings()` for auto-save preference

### Imports Summary
- react (useState, useCallback, useEffect)
- react-router (useSearchParams)
- lucide-react (Copy)
- components (WizardStepper, PromptPreview, MaterialAutocomplete)
- utils/api, SettingsContext

### API
- **Create Session:** `POST /api/sessions` → `{ materialName, lectureNumber, lectureType, workflowSystemCode, generalNotes }`
- **Compile Prompt:** `POST /api/prompts/compile` → `{ systemCode, generalNotes, fileNotes[] }`
- **SystemCodes:** `LEC_COORD`, `BANK_COORD`

---

## 23. DrawWizard.jsx
**File:** `src/pages/DrawWizard.jsx`
**Type:** Frontend - Page (Wizard)

### What it does
2-step wizard for AI-assisted drawing: Insert (metadata + images + description) → Preview & Guided Copy. Generates Python code prompts for charts/diagrams.

### User Stories
- User enters metadata and description of desired drawing
- User uploads up to 3 reference images with notes
- User copies generated prompt with images via GuidedCopyLoop

### Functions Summary
- `DrawWizard`: Main wizard with 2 steps
- `addImage/removeImage/updateImageNote`: Image management
- `goNext`: Creates session with files, fetches compiled prompt
- `handleGlobalPaste`: Listens for global paste events to add images

### Integration
- Calls `createSession`, `fetchSession`, `compilePromptStateless` from `utils/api`
- Uses `WizardStepper`, `PromptPreview`, `GuidedCopyLoop`, `ImageUploader` components
- Supports URL param `?id=` for loading saved sessions

### Imports Summary
- react-router (useSearchParams), react hooks
- components (WizardStepper, PromptPreview, GuidedCopyLoop, ImageUploader, PasteButton, PasteImageButton, MaterialAutocomplete)
- utils/api, SettingsContext

### API
- **Create Session:** `POST /api/sessions` with files array
- **SystemCode:** `DRAW`
- **Max Images:** 3

---

## 24. ExtractionWizard.jsx
**File:** `src/pages/ExtractionWizard.jsx`
**Type:** Frontend - Page (Wizard)

### What it does
3-step wizard for content extraction: Naming → Images & Notes → Preview & Guided Copy. Supports lecture or bank type workflows.

### User Stories
- User selects workflow type (lecture/bank) and enters metadata
- User uploads images with per-image notes
- User copies generated extraction prompt with images via GuidedCopyLoop

### Functions Summary
- `ExtractionWizard`: Main wizard with 3 steps
- `addImage/removeImage/updateImageNote`: Image management
- `handleGlobalPaste`: Listens for global paste events
- `goNext`: Creates session with images/files, fetches compiled prompt

### Integration
- Calls `createSession`, `fetchSession` from `utils/api`
- Uses `WizardStepper`, `PromptPreview`, `GuidedCopyLoop`, `ImageUploader` components
- Supports URL params `?type=lecture|bank&id=` for loading/reopening sessions

### Imports Summary
- react-router (useSearchParams, Link), react hooks
- components (WizardStepper, ImageUploader, PromptPreview, GuidedCopyLoop, PasteButton, PasteImageButton, MaterialAutocomplete)
- utils/api, SettingsContext

### API
- **Create Session:** `POST /api/sessions` → `{ materialName, lectureNumber, lectureType, workflowSystemCode, generalNotes, files[] }`
- **SystemCodes:** `LEC_EXT`, `BANK_EXT`

---

## 25. MergeWizard.jsx
**File:** `src/pages/MergeWizard.jsx`
**Type:** Frontend - Page (Wizard)

### What it does
3-step wizard for merging multiple Word documents: Naming → Upload & Reorder → Merge & Download. Client-side merging using mammoth.js library.

### User Stories
- User enters metadata for merged file
- User uploads .docx files and reorder them using up/down buttons
- User triggers merge and downloads the combined document

### Functions Summary
- `MergeWizard`: Main wizard with 3 steps
- `handleFileSelect`: Filters and adds only .docx files
- `moveFile`: Reorders files up/down
- `handleMerge`: Calls `mergeDocxFiles` utility, creates download URL

### Integration
- Calls `mergeDocxFiles` from `utils/api` (client-side processing)
- Uses `WizardStepper`, `MaterialAutocomplete` components
- **No backend session** - purely client-side operation

### Imports Summary
- react (useState, useRef)
- lucide-react (Layers, Upload, Loader2, File, Download, etc.)
- components (WizardStepper, MaterialAutocomplete)
- utils/api (mergeDocxFiles)

### API
- **Merge Request:** `mergeDocxFiles(files, options)` - client-side docx processing

---

## 26. PandocWizard.jsx
**File:** `src/pages/PandocWizard.jsx`
**Type:** Frontend - Page (Wizard)

### What it does
3-step wizard for Markdown to Word conversion: Naming → Insert Markdown → Generate & Download. Uses backend Pandoc service for conversion.

### User Stories
- User enters metadata (material name, lecture number, type)
- User pastes or drag-drops markdown text or .md file
- User triggers conversion and downloads generated .docx file

### Functions Summary
- `PandocWizard`: Main wizard with 3 steps
- `handleFileOpen`: Reads .md/.markdown/.txt files
- `handleDrop`: Drag & drop support for .md files
- `handleGenerate`: Calls `generatePandoc` API with markdown text and template

### Integration
- Calls `createSession`, `fetchSession`, `generatePandoc` from `utils/api`
- Uses `WizardStepper`, `PasteButton`, `MaterialAutocomplete` components
- Templates: `Pandoc-Theo.dotx` (Theoretical) or `Pandoc-Prac.dotx` (Practical)
- Supports URL param `?id=` for loading saved sessions

### Imports Summary
- react-router (useSearchParams), react hooks
- lucide-react (FileOutput, Upload, Loader2, FolderOpen, File, Download)
- components (WizardStepper, PasteButton, MaterialAutocomplete)
- utils/api, SettingsContext

### API
- **Create Session:** `POST /api/sessions` → `{ materialName, lectureNumber, lectureType, workflowSystemCode: 'PANDOC' }`
- **Generate Pandoc:** `POST /api/pandoc/generate` → `{ markdownText, templateName, materialName, lectureNumber, lectureType }`
- **Response:** `{ fileUrl, downloadUrl }` for downloading .docx file

---

## Admin Pages

## 27. AdminMaterials.jsx
**File:** `src/pages/admin/AdminMaterials.jsx`
**Type:** Frontend - Admin Page

### What it does
CRUD table for managing academic materials. Displays materials in a table with add/edit/delete actions in a modal form.

### User Stories
- Admin views all materials in a table
- Admin adds/edits/deletes materials

### Functions Summary
- `fetchMaterials`: GET `/admin/materials`
- `handleSubmit`: POST or PUT `/admin/materials`
- `handleDelete`: DELETE `/admin/materials/{id}`

### Integration
- Uses `authFetch` from `utils/api` for authenticated requests

### API
- **GET** `/api/admin/materials`
- **POST** `/api/admin/materials` → `{ materialName, materialYear }`
- **PUT** `/api/admin/materials/{id}` → `{ materialName, materialYear }`
- **DELETE** `/api/admin/materials/{id}`

---

## 28. MaterialsManager.jsx
**File:** `src/pages/admin/MaterialsManager.jsx`
**Type:** Frontend - Admin Page

### What it does
Card-based materials management with grid layout. Uses dedicated API functions instead of `authFetch`.

### User Stories
- Admin views materials as cards in a grid
- Admin hovers to reveal edit/delete actions

### Functions Summary
- `loadMaterials`: GET via `fetchAdminMaterials`
- `handleSubmit`: POST/PUT via `createAdminMaterial`/`updateAdminMaterial`
- `handleDelete`: DELETE via `deleteAdminMaterial`

### Integration
- Uses `fetchAdminMaterials`, `createAdminMaterial`, `updateAdminMaterial`, `deleteAdminMaterial` from `utils/api`

### API
- Same as AdminMaterials.jsx but using named API functions

---

## 29. AdminSystem.jsx
**File:** `src/pages/admin/AdminSystem.jsx`
**Type:** Frontend - Admin Page

### What it does
Admin system settings page showing workflows toggle, prompts editing, and permissions table. Uses `authFetch` directly.

### User Stories
- Admin toggles workflow active status
- Admin edits prompt text inline
- Admin views role-permission mappings

### Functions Summary
- `toggleWorkflow`: PUT `/admin/workflows/{id}/toggle`
- `savePrompt`: PUT `/admin/prompts/{id}`

### Integration
- Uses `authFetch` for all requests
- Fetches workflows, prompts, and permissions in parallel

### API
- **GET** `/api/admin/workflows`
- **PUT** `/api/admin/workflows/{id}/toggle` → `{ isActive }`
- **GET** `/api/admin/prompts`
- **PUT** `/api/admin/prompts/{id}` → `{ promptText }`
- **GET** `/api/admin/permissions`

---

## 30. SystemConfig.jsx
**File:** `src/pages/admin/SystemConfig.jsx`
**Type:** Frontend - Admin Page

### What it does
Tabbed system config with workflows+permissions tab and prompts tab. Uses named API functions for cleaner separation.

### User Stories
- Admin views workflows with their assigned role permissions
- Admin adds/removes role permissions per workflow
- Admin expands and edits prompt text in collapsible cards

### Functions Summary
- `loadData`: Fetches all 3 data types in parallel
- `handleToggleWorkflow`: PUT via `toggleAdminWorkflow`
- `handleSavePrompt`: PUT via `updateAdminPrompt`
- `handleAddPermission`: POST via `createAdminPermission`
- `handleDeletePermission`: DELETE via `deleteAdminPermission`

### Integration
- Uses `fetchAdminWorkflows`, `fetchAdminPrompts`, `fetchAdminPermissions`
- Uses `toggleAdminWorkflow`, `updateAdminPrompt`, `createAdminPermission`, `deleteAdminPermission`

### API
- **GET** `/api/admin/workflows`
- **PUT** `/api/admin/workflows/{id}/toggle` → `{ isActive }`
- **GET** `/api/admin/prompts`
- **PUT** `/api/admin/prompts/{id}` → `{ promptText }`
- **GET** `/api/admin/permissions`
- **POST** `/api/admin/permissions` → `{ roleName, workflowId }`
- **DELETE** `/api/admin/permissions/{id}`

---

## 31. AdminUsers.jsx
**File:** `src/pages/admin/AdminUsers.jsx`
**Type:** Frontend - Admin Page

### What it does
Table-based user management with create/edit/delete. Uses `authFetch` directly.

### User Stories
- Admin views all users in a table
- Admin adds new users with role assignment
- Admin edits user details or deletes users

### Functions Summary
- `handleSubmit`: POST/PUT via `authFetch`
- `handleDelete`: DELETE via `authFetch`

### Integration
- Uses `authFetch` for direct API calls
- User roles: `Admin`, `TechMember`, `ScientificMember`

### API
- **GET** `/api/admin/users`
- **POST** `/api/admin/users` → `{ firstName, lastName, username, password, userRole, batchNumber, telegramUsername }`
- **PUT** `/api/admin/users/{id}` → same fields
- **DELETE** `/api/admin/users/{id}`

---

## 32. UsersManager.jsx
**File:** `src/pages/admin/UsersManager.jsx`
**Type:** Frontend - Admin Page

### What it does
Enhanced user management with table view, hover actions, and role badges. Uses named API functions.

### User Stories
- Admin views users with avatar initials, role badges, batch number, join date
- Admin creates/edits users with modal form

### Functions Summary
- `loadUsers`: GET via `fetchAdminUsers`
- `handleSubmit`: POST/PUT via `createAdminUser`/`updateAdminUser`
- `handleDelete`: DELETE via `deleteAdminUser`
- `getRoleBadge`: Returns styled role badge JSX

### Integration
- Uses `fetchAdminUsers`, `createAdminUser`, `updateAdminUser`, `deleteAdminUser` from `utils/api`

### API
- Same as AdminUsers.jsx but using named API functions

---

## Utils & Types

## 33. api.js
**File:** `src/utils/api.js`
**Type:** Frontend - Utility (API Client)

### What it does
Central API client with JWT token attachment, auto Content-Type detection, 401 redirect handling, and named functions for all backend endpoints.

### Functions Summary
- `authFetch`: Wraps fetch with JWT Bearer token, auto JSON headers, 401 redirect
- `fetchMaterials`, `compilePromptStateless`: General API calls
- `fetchSessions`, `fetchSession`, `createSession`, `removeSession`: Session CRUD
- `uploadFiles`, `fetchPrompt`: File and prompt operations
- `generatePandoc`, `mergeDocxFiles`: Document processing
- `saveQuizSession`, `fetchStats`: Quiz and stats
- Admin functions: `fetchAdminUsers`, `createAdminUser`, `updateAdminUser`, `deleteAdminUser`, `fetchAdminMaterials`, `createAdminMaterial`, `updateAdminMaterial`, `deleteAdminMaterial`, `fetchAdminWorkflows`, `toggleAdminWorkflow`, `fetchAdminPrompts`, `updateAdminPrompt`, `fetchAdminPermissions`, `createAdminPermission`, `deleteAdminPermission`

### Integration
- All API calls go through `authFetch`
- Token stored in localStorage as `token`
- 401 triggers localStorage cleanup and redirect to `/login`

### API Base
- Sessions: `/api/sessions`
- Admin: `/api/admin`
- Materials: `/api/materials`
- Pandoc: `/api/pandoc/generate`
- Merge: `/api/merge/execute`

---

## 34. storage.js
**File:** `src/utils/storage.js`
**Type:** Frontend - Utility (localStorage)

### What it does
Local session storage helper for offline/fallback session management. Used when backend is unavailable.

### Functions Summary
- `saveSession`: Saves new session to localStorage with UID
- `getSessions`: Returns all sessions (newest first)
- `getSession`: Returns single session by ID
- `deleteSession`: Removes session by ID
- `getSessionsByType`: Filters by workflowType
- `getStats`: Returns counts by type

### Integration
- Uses localStorage key `bluebits_sessions`
- No backend calls - purely client-side

### API
N/A - Client-side storage only

---

## 35. auth.d.ts
**File:** `src/types/auth.d.ts`
**Type:** Frontend - TypeScript Definitions

### What it does
TypeScript type definitions for authentication context and user object.

### Types Defined
- `User`: `{ token, userId, username, firstName, lastName, role, allowedWorkflows[] }`
- `AuthContextType`: `{ user, login, logout, loading }`

---

## 36. models.d.ts
**File:** `src/types/models.d.ts`
**Type:** Frontend - TypeScript Definitions

### What it does
TypeScript type definitions for data models used throughout the app.

### Types Defined
- `Material`: `{ materialId, materialName, materialYear }`
- `Workflow`: `{ workflowId, systemCode, adminNote, isActive }`
- `File`: `{ fileId, sessionId, localFilePath, fileType, orderIndex }`
- `Note`: `{ noteId, sessionId, noteText, noteType, fileId }`
- `Session`: Full session with navigational properties
- `SessionSummary`: Lightweight session for list views

### Integration
Used by API responses and component props throughout the app

---

## Entry & Styling

## 37. App.jsx
**File:** `src/App.jsx`
**Type:** Frontend - Application Entry

### What it does
Main application router wiring all routes with auth and RBAC protection. Sets up nested routes for admin panel, protected user routes, and workflow-specific access.

### Routes Structure
- **Public:** `/login`
- **Admin routes** (requires `Admin` role): `/admin/users`, `/admin/materials`, `/admin/system`
- **Protected routes** (requires authentication): `/`, `/tour`
- **Workflow routes** (requires specific SystemCode):
  - `LEC_EXT` → `/extraction`
  - `COORD` → `/coordination`
  - `PANDOC` → `/pandoc`
  - `DRAW` → `/draw`
  - `MERGE` → `/merge`
  - `QUIZ` → `/quiz`
  - `HIST` → `/history`

### Integration
- Wraps with `AuthProvider`, `BrowserRouter`, `TourProvider`
- Uses route guards: `AdminRoute`, `ProtectedRoute` with `requiredCode`

### SystemCodes for Route Guards
| SystemCode | Route | Feature |
|---|---|---|
| `LEC_EXT` | `/extraction` | Lecture extraction |
| `COORD` | `/coordination` | Coordination |
| `PANDOC` | `/pandoc` | Pandoc conversion |
| `DRAW` | `/draw` | Drawing |
| `MERGE` | `/merge` | File merge |
| `QUIZ` | `/quiz` | Quiz hub |
| `HIST` | `/history` | History |

---

## 38. main.jsx
**File:** `src/main.jsx`
**Type:** Frontend - Bootstrap Entry

### What it does
React application bootstrap entry point. Mounts the app with `StrictMode` and `SettingsProvider` for global settings (dark mode, auto-save).

### Integration
- `SettingsProvider` wraps entire app for theme/settings access
- Imports global styles from `index.css`

---

## 39. index.css
**File:** `src/index.css`
**Type:** Frontend - Global Stylesheet

### What it does
Global CSS with Tailwind CSS v4 import, custom theme colors, RTL base styles, scrollbar styling, and keyframe animations.

### Theme Colors (CSS Variables)
| Variable | Light | Dark |
|---|---|---|
| `primary` | `#0072BD` | - |
| `cyan` | `#33C9FF` | - |
| `success` | `#009E73` | - |
| `danger` | `#D32F2F` | - |
| `sidebar` | `#0a1628` | - |
| `surface` | `#f8fafc` | `#0a1628` |
| `surface-card` | `#ffffff` | `#132240` |
| `text` | `#1e293b` | `#f8fafc` |
| `border` | `#e2e8f0` | `#1e3a5f` |

### Custom Animations
- `fadeSlideIn`: Page content entry animation
- `copyFlash`: Button feedback on copy

### Additional Features
- Custom scrollbar styling (WebKit)
- IBM Plex Sans Arabic font via `@theme`
- RTL direction by default
- `.dark` class toggles dark mode palette

---

## Summary

### Total Files Documented: 39

| Category | Count | Files |
|---|---|---|
| Components | 13 | AdminLayout, AdminRoute, GuidedCopyLoop, ImageUploader, Layout, PasteButton, PasteImageButton, PromptPreview, ProtectedRoute, Sidebar, TourOverlay, WizardStepper, MaterialAutocomplete |
| Contexts | 3 | AuthContext, SettingsContext, TourContext |
| Pages | 16 | Dashboard, Login, History, QuizHub, Tour, CoordinationWizard, DrawWizard, ExtractionWizard, MergeWizard, PandocWizard, AdminMaterials, MaterialsManager, AdminSystem, SystemConfig, AdminUsers, UsersManager |
| Utils | 2 | api.js, storage.js |
| Types | 2 | auth.d.ts, models.d.ts |
| Entry | 3 | App.jsx, main.jsx, index.css |

### API Endpoints Used
| Base | Endpoints |
|---|---|
| `/api/sessions` | GET, POST, GET/{id}, DELETE/{id}, POST/{id}/files |
| `/api/admin` | users (CRUD), materials (CRUD), workflows (GET, PUT toggle), prompts (GET, PUT), permissions (CRUD) |
| `/api/materials` | GET |
| `/api/prompts` | POST /compile |
| `/api/pandoc` | POST /generate |
| `/api/merge` | POST /execute |

### SystemCodes Reference
`LEC_EXT`, `LEC_COORD`, `BANK_EXT`, `BANK_COORD`, `BANK_QS`, `DRAW`, `PANDOC`, `MERGE`, `QUIZ`, `HIST`