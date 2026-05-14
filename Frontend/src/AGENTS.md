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
```

## 1. File Name and Directory
Frontend/src/App.jsx

### 2. File Type
Frontend — Root React component / Router entry point

### 3. What the file does
Sets up the top-level app shell: wraps the app in AuthProvider, BrowserRouter, ToastProvider, and TourProvider; lazy-loads all page components; defines nested Routes with cascade guards (ProtectedRoute → Layout → optional ProtectedRoute per workflow; AdminRoute for admin pages; AuthOnlyRoute for 404). Renders the global `<Toast />` component outside Suspense so it is always mounted.

### 4. User Stories
- As a user, I log in and land on the Dashboard, then access workflows I have permission for.
- As an admin, I navigate to /admin/users, /admin/materials, or /admin/system to manage the platform.
- As an unauthenticated visitor, I am redirected to /login for any protected path.

### 5. Functions Summary
- `App`: Returns the root JSX tree — provider wrappers, `<Suspense>` with `PageLoader` fallback, and all `<Routes>`.

### 6. Integration
No direct API calls. Relies on `AuthContext` which communicates with backend authentication endpoints; route guards (`ProtectedRoute`, `AdminRoute`, `AuthOnlyRoute`) read auth state from context.

### 7. Imports Summary
- **External:** `react-router` (BrowserRouter, Routes, Route, Navigate), `react` (Suspense, lazy)
- **Internal:** `AuthContext`, `TourContext`, `ToastContext`, `Layout`, 3 route guards (`AdminRoute`, `AuthOnlyRoute`, `ProtectedRoute`), `PageLoader`, `Toast`, and 16 lazy-loaded page components (Dashboard, ExtractionWizard, CoordinationWizard, PandocWizard, DrawWizard, QuizHub, History, Tour, MergeWizard, Login, Unauthorized, NotFound, AdminUnauthorized, AdminUsers, AdminMaterials, AdminSystem).

### 8. Additional Info
Every page is lazy-loaded via `React.lazy`. Route guard nesting: outer `ProtectedRoute` checks auth → `Layout` provides sidebar → individual `ProtectedRoute` with `requiredCode` prop enforces per-workflow SystemCode access. Extraction and Coordination use double-gate logic (guarded by ProtectedRoute, then validated inside the wizard component itself).

### 9. API
No request/response handling here. Guards and contexts handle API communication invisibly to this file — `ProtectedRoute` likely calls an auth API via AuthContext to verify tokens/permissions, and `AdminRoute` checks for admin role.

## 1. File Name and Directory
`Frontend/src/components/AdminRoute.jsx`

### 2. File Type
Frontend (React Router guard component)

### 3. What the file does
Protects admin-only routes. Checks authentication state from `AuthContext`; renders a loading spinner while resolving, redirects unauthenticated users to `/login`, shows an Arabic unauthorized page for non-Admin users, and renders `<Outlet />` for Admin users.

### 4. User Stories
- As an Admin user, I can access admin-only pages seamlessly after login.
- As a non-Admin logged-in user, I see an Arabic "غير مصرح" unauthorized page when visiting admin routes.
- As an unauthenticated visitor, I am redirected to `/login` when trying to access admin routes.

### 5. Functions Summary
- `AdminRoute`: Default export route guard. Returns spinner while loading, `<Navigate to="/login">` if no user, unauthorized UI if role !== `'Admin'`, or `<Outlet />` if authorized.

### 6. Integration
No direct backend calls. Consumes `AuthContext` for `user` and `loading` state.

### 7. Imports Summary
- `useContext` (React)
- `Navigate`, `Outlet` (react-router)
- `AuthContext` (internal context)
- `Loader2`, `ShieldX`, `Crown` (lucide-react icons — `Crown` is unused)

### 8. Additional Info
Arabic-first UI (RTL). `Crown` icon imported but not used in the component.

### 9. API
No direct API calls. Relies on `AuthContext` for `user.role` to gate access.

## 1. File Name and Directory
`Frontend/src/components/AuthOnlyRoute.jsx`

### 2. File Type
frontend — React route guard component

### 3. What the file does
Protects routes behind authentication. Renders a loading spinner while auth state resolves, redirects unauthenticated users to `/login`, and renders child routes via `<Outlet />` for authenticated users.

### 4. User Stories
- As a logged-in user, I can access pages wrapped by this guard.
- As a guest, I am redirected to the login page when I visit a protected route.

### 5. Functions Summary
- `AuthOnlyRoute`: Reads `user` and `loading` from `AuthContext`; shows a centered spinner while loading; redirects to `/login` if `user` is null; otherwise renders `<Outlet />`.

### 6. Integration
Does not call backend APIs directly. Relies on `AuthContext` which hydrates user state from localStorage on mount.

### 7. Imports Summary
- `useContext` (React)
- `Navigate`, `Outlet` (react-router)
- `AuthContext` (internal — `../contexts/AuthContext`)
- `Loader2` (lucide-react)

### 8. Additional Info
Unlike `ProtectedRoute`, this guard allows Admin users through. It is a thin wrapper — no role-based filtering beyond the existence of a `user` object.

### 9. API
No direct API interaction. Auth state is managed entirely via `AuthContext` (localStorage hydration on the frontend).

## 1. File Name and Directory
Frontend/src/components/common/MaterialAutocomplete.jsx

### 2. File Type
Frontend — Reusable React component

### 3. What the file does
A controlled autocomplete input for selecting a material from a server-fetched list. As the user types, it filters suggestions, shows success/error inline icons, and validates the selection against the known list. Exposes validity changes to the parent via `onValidChange` callback.

### 4. User Stories
- As a user filling a form, I type a material name and see matching suggestions filtered in real time.
- As a form designer, I use `onValidChange` to know whether the selected material is valid without extra logic.

### 5. Functions Summary
- `MaterialAutocomplete({ value, onChange, label, required, onValidChange })`: Main component — renders label, input with validation icons, dropdown list, and error messages. Manages open/close state, click-outside dismissal, and material fetching on mount.

### 6. Integration
Calls `fetchMaterials()` from `utils/api` on mount — this hits `GET /api/materials` (with client-side caching). No database or external service calls.

### 7. Imports Summary
- **External:** `react` (useState, useEffect, useRef, useMemo, useCallback)
- **Internal:** `fetchMaterials` from `../../utils/api`

### 8. Additional Info
Arabic-first: label defaults to `"اسم المادة"`, placeholder is `"اكتب أو اختر اسم المادة..."`, error message is Arabic. Uses logical Tailwind properties (`end-3`). Validation is done client-side by comparing the input value against the fetched materials list (case-insensitive).

### 9. API
**Request:** `GET /api/materials` — no body, no params.
**Response:** Array of strings (`["مادة 1", "مادة 2", ...]`) — the full list of valid material names. The component caches the result client-side via `apiCache`.

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

## 1. File Name and Directory
Frontend/src/components/Layout.jsx

### 2. File Type
Frontend — Layout component / Shell wrapper

### 3. What the file does
Renders the persistent app shell: a sidebar on the left, a scrollable main content area that renders nested route pages via `<Outlet>`, and a tour overlay. Wraps all authenticated pages.

### 4. User Stories
- As a user, I see the sidebar navigation on every authenticated page without re-mounting.
- As a user, I can scroll through page content independently of the sidebar.

### 5. Functions Summary
- `Layout`: Returns the shell JSX — flex container with `Sidebar`, `<Outlet />` inside `<main>`, and `TourOverlay`.

### 6. Integration
No direct backend API calls. Works with React Router's `<Outlet>` to render child routes; `Sidebar` and `TourOverlay` handle their own logic.

### 7. Imports Summary
- **External:** `Outlet` from `react-router`
- **Internal:** `Sidebar` (`./Sidebar`), `TourOverlay` (`./TourOverlay`)

### 8. Additional Info
Uses `ms-64` (logical margin-inline-start) for sidebar offset on `md:` screens, consistent with RTL compatibility. The `h-dvh` and `overflow-hidden` ensure no double scrollbars.

### 9. API
No request/response handling. Acts as a passive shell — data fetching is delegated to child route components rendered via `<Outlet>`.

## 1. File Name and Directory
`Frontend/src/components/PageLoader.jsx`

### 2. File Type
Frontend (React component)

### 3. What the file does
Renders a full-screen centered loading spinner with Arabic text "جاري التحميل..." using the `Loader2` icon from `lucide-react`. Used as a fallback UI while async operations (data fetching, lazy loading) are in progress.

### 4. User Stories
- As a user, when the app is fetching data, I see a centered loading spinner so I know the app is working.
- As a developer, I drop `<PageLoader />` into any route/lazy boundary for a consistent loading state.

### 5. Functions Summary
- `PageLoader`: Default export. Returns a full-viewport flex container with a spinning `Loader2` icon and an Arabic loading label.

### 6. Integration
None. Pure presentational component — no API calls, no state management, no side effects.

### 7. Imports Summary
- **External:** `Loader2` from `lucide-react`

### 8. Additional Info
- Uses Tailwind theme variables (`bg-surface`, `text-primary`) for theming.
- Supports dark mode via `dark:bg-surface` and `dark:text-white/80`.
- Arabic-first text ("جاري التحميل...").

### 9. API
None. No backend interaction.

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

## 1. File Name and Directory
`Frontend/src/components/PromptPreview.jsx`

### 2. File Type
Frontend - React presentational component

### 3. What the file does
Renders a block of text line-by-line inside a scrollable card, with per-line `dir="auto"` to dynamically handle mixed RTL/LTR content (Arabic/English).

### 4. User Stories
- As a user, I want to see the assembled prompt previewed with proper Arabic text direction so I can verify it before submitting.
- As a user, I want long prompts to be scrollable so the UI doesn't overflow.

### 5. Functions Summary
- `PromptPreview({ text })`: Splits `text` by newline and renders each line as a `<p>` with `dir="auto"`. Returns `null` if `text` is falsy.

### 6. Integration
None — purely presentational, no backend/API calls.

### 7. Imports Summary
No imports (no external dependencies).

### 8. Additional Info
Uses Tailwind v4 semantic tokens (`bg-surface-card`, `border-border`). Empty lines render as `\u00A0` (non-breaking space) to preserve height.

### 9. API
No API interaction. Receives `text` string via props only.

## 1. File Name and Directory
Frontend/src/components/ProtectedRoute.jsx

### 2. File Type
Frontend (React Router guard component)

### 3. What the file does
Conditionally renders child routes based on authentication status and optional SystemCode workflow permissions. Shows a loading spinner while auth state is being resolved, redirects unauthenticated users to `/login`, admin users to `/403`, and users without the required workflow permission to `/unauthorized`.

### 4. User Stories
- As an unauthenticated user, I get redirected to `/login` when visiting any protected route
- As an authenticated user lacking a specific SystemCode, I see an `/unauthorized` page
- As an Admin user, I am blocked from workflow routes and redirected to `/403`
- As a developer, I can protect any route tree with an optional permission check via `requiredCode` prop

### 5. Functions Summary
- `ProtectedRoute({ requiredCode })`: Reads `user`, `loading`, `hasWorkflowAccess` from AuthContext and decides to render `<Outlet />`, a spinner, or a redirect

### 6. Integration
No direct backend API calls. Relies entirely on AuthContext which manages auth state (likely hydrated from login API response).

### 7. Imports Summary
- `useContext` (React) — consume AuthContext
- `Navigate`, `Outlet` (react-router) — redirect and render child routes
- `AuthContext` (../contexts/AuthContext) — user, loading, hasWorkflowAccess
- `Loader2` (lucide-react) — loading spinner icon

### 8. Additional Info
Admin users are explicitly blocked from workflow routes (redirected to `/403`), enforcing separation between admin panel and workflow UI. The `requiredCode` prop maps to SystemCodes from the backend RBAC.

### 9. API
Does not directly call APIs. AuthContext is populated by a parent provider that fetches user data (including `allowedWorkflows`) from the backend login/session endpoint.

## 1. File Name and Directory
`Frontend/src/components/SettingsModal.jsx`

### 2. File Type
Frontend

### 3. What the file does
Settings modal component with dark mode toggle, auto-save toggle (hidden for admin), default material selector with search, and logout with confirmation. Includes animated modal enter/exit transitions and a fully keyboard-accessible dropdown.

### 4. User Stories
- As a user, I can toggle dark mode, enable auto-save, and set my default material from a searchable dropdown
- As a user, I can log out after confirming my intent
- As an admin, the auto-save and default material settings are hidden

### 5. Functions Summary
- `MaterialSelector`: Custom searchable dropdown portal that fetches and sorts materials, supports keyboard navigation (ArrowUp/Down/Enter/Escape)
- `useModalExit`: Custom hook managing render state and exit animation timing (200ms)
- `SettingsModal`: Main modal composing all settings toggles, material selector, and logout flow

### 6. Integration
Calls backend API via `fetchMaterials()` from `../utils/api` → `GET /api/materials` (cached)

### 7. Imports Summary
- **External**: `react` (useState, useEffect, useRef), `react-dom` (createPortal), `lucide-react` (Moon, Sun, Save, LogOut, X, XCircle, ChevronDown)
- **Internal**: `fetchMaterials` from `../utils/api`

### 8. Additional Info
- Arabic-first: labels, placeholders, and confirmation text are in Arabic
- Uses Tailwind CSS v4 with logical properties and dark mode variants
- Admin sees neither auto-save toggle nor material selector (conditional rendering via `isAdmin` prop)

### 9. API
- **GET** `/api/materials` — fetches all materials (cached, sorted alphabetically). Returns an array of strings (material names). On failure, defaults to empty array `[]`.

## 1. File Name and Directory
Frontend/src/components/Sidebar.jsx

### 2. File Type
Frontend — React component (sidebar navigation)

### 3. What the file does
Renders the main sidebar with navigation items filtered by user role (Member/Admin) and allowedWorkflows SystemCodes. Shows user profile section (avatar initials, name, username) with a settings button that opens SettingsModal. Handles loading state with a spinner while auth context resolves.

### 4. User Stories
- As a user, I see only the workflows I have permission for in the sidebar navigation.
- As an admin, I see admin management links (users, materials, system) instead of regular workflow links.
- As a user, I can view my profile info and open settings/logout from the bottom of the sidebar.

### 5. Functions Summary
- `Sidebar`: Main component; renders logo, RBAC-filtered NavLink list, and profile section with settings trigger.
- `handleLogout`: Calls `logout()` from AuthContext then redirects to `/login`.
- `getInitials`: Extracts first letters of `user.firstName` and `user.lastName`, uppercased.

### 6. Integration
No direct API calls. Reads `user` and `loading` from `AuthContext` (backend auth state), and settings from `SettingsContext`. The `SettingsModal` child component may trigger API calls indirectly.

### 7. Imports Summary
- **External:** `react-router` (NavLink), `react` (useContext, useState), `lucide-react` (11 icons: LayoutDashboard, FileSearch, AlignRight, FileOutput, Palette, Layers, FileJson, Clock, Settings, Users, BookOpen, Settings2)
- **Internal:** `useSettings` from `../contexts/SettingsContext`, `AuthContext` from `../contexts/AuthContext`, `SettingsModal` from `./SettingsModal`

### 8. Additional Info
NAV_ITEMS array centralizes all route definitions with `systemCode` for RBAC and `role` for admin/member filtering. Extraction and Coordination check two possible SystemCodes (LEC_EXT/BANK_EXT, LEC_COORD/BANK_COORD). History (HIST) bypasses systemCode check and only requires an authenticated user.

### 9. API
No direct request/response handling. Relies on AuthContext to provide user object with `role`, `allowedWorkflows` array, `firstName`, `lastName`, and `username` — populated by the backend after login.

## 1. File Name and Directory
Frontend/src/components/TourOverlay.jsx

### 2. File Type
Frontend — React component (guided tour overlay)

### 3. What the file does
Renders a floating tooltip/overlay card during an interactive app tour. It highlights the target element with a ring, positions the card near it (below by default, above if no space), and provides step navigation (prev/next) with a progress indicator. Renders via `createPortal` at `document.body`.

### 4. User Stories
- As a new user, I follow a guided step-by-step tour that highlights UI elements and explains what they do.
- As a user, I navigate through tour steps, skip the tour, or finish it early.

### 5. Functions Summary
- `TourOverlay`: Main component — reads tour state from `TourContext`, queries the DOM for the target element via CSS selector, computes its bounding rect for absolute positioning, renders a styled card with title, content, navigation buttons, step counter, and a directional arrow.

### 6. Integration
No backend calls. Purely client-side: uses DOM API (`querySelector`, `getBoundingClientRect`, `scrollIntoView`, classList) and the `TourContext` state machine.

### 7. Imports Summary
- **External:** `react` (useEffect, useState), `lucide-react` (X, ArrowRight, ArrowLeft), `react-dom` (createPortal)
- **Internal:** `../contexts/TourContext` (useTour — provides isActive, currentStep, stopTour, nextStep, prevStep, currentStepIndex, totalSteps)

### 8. Additional Info
Smart positioning: if the card would overflow below the viewport, it renders above the target instead. The arrow indicator flips accordingly. A highlight ring (`ring-4 ring-primary`) is added/removed from the target element on mount/unmount. Supports window resize and scroll events. Arabic-first (RTL layout, Arabic button labels).

### 9. API
No API communication. All state comes from `TourContext` (client-side context). UI-only component.

## 1. File Name and Directory
`Frontend/src/components/WizardStepper.jsx`

### 2. File Type
Frontend (React component)

### 3. What the file does
Renders a horizontal step indicator for multi-step wizard workflows. Displays numbered circles with checkmarks for completed steps, highlights the active step, and shows connector lines between steps. Labels are hidden on small screens (`sm:inline`).

### 4. User Stories
- As a user, I can see my current position in a multi-step process at a glance
- As a user, I can visually distinguish completed, active, and pending steps

### 5. Functions Summary
- `WizardStepper({ steps, current })`: Maps an array of step labels and a 0-indexed `current` index into a horizontal stepper UI with circles, labels, and connectors

### 6. Integration
None — pure presentational component with no backend, database, or external service calls

### 7. Imports Summary
- **External:** `Check` icon from `lucide-react`
- **Internal:** None

### 8. Additional Info
Arabic-first RTL app; uses Tailwind v4 theme variables (`bg-success`, `bg-primary`, `bg-border`, `text-text-secondary`, `text-text-muted`) — no hardcoded colors. Responsive: labels hidden on mobile via `hidden sm:inline`.

### 9. API
N/A — no backend communication

## 1. File Name and Directory
`Frontend/src/contexts/AuthContext.jsx`

### 2. File Type
Frontend (React Context Provider)

### 3. What the file does
Manages authentication state — login, logout, session auto-restore via `AuthApi.getCurrentUser()` on mount, and workflow-level RBAC authorization checks. Uses `AuthApi` (which wraps HttpClient) for all backend communication and `showToastGlobal` for error display.

### 4. User Stories
- As a user, I can log in with my username/password and have my session persisted across page reloads via auto-restore.
- As an admin, I automatically bypass all workflow permission checks and see all tools.

### 5. Functions Summary
- `mapUser(data)`: Maps `LoginResponse` (backend shape with `authorizedWorkflows`) to frontend `User` shape (`allowedWorkflows`).
- `AuthProvider`: Context provider wrapping children with auth state (`user`, `login`, `logout`, `loading`, `hasWorkflowAccess`)
- `login(username, password)`: Calls `AuthApi.login()` to POST credentials, stores JWT + mapped user profile in localStorage. Shows error toast on failure via `showToastGlobal`.
- `logout()`: Clears user state and localStorage
- `hasWorkflowAccess(systemCode)`: Returns `true` if user is Admin or their `allowedWorkflows` includes the given SystemCode
- `useAuth()`: Hook to consume `AuthContext`

### 6. Integration
Calls backend via `AuthApi` (`HttpClient`): `POST /api/auth/login` and `GET /api/auth/me`. Uses `showToastGlobal` from ToastContext for error toasts.

### 7. Imports Summary
- **External:** React hooks (`createContext`, `useState`, `useEffect`, `useCallback`, `useContext`)
- **Internal:** `login, getCurrentUser` from `../api/AuthApi`; `showToastGlobal` from `./ToastContext`

### 8. Additional Info
- Session is persisted in localStorage under keys `bluebits_user` and `token`.
- On mount, no hydration from localStorage — calls `getCurrentUser()` directly to verify token and fetch fresh profile.
- `loading` stays `true` until `getCurrentUser()` resolves (or token is absent) to prevent UI flicker.
- AuthProvider wraps ToastProvider in the component tree, so `useToast()` cannot be called here — `showToastGlobal` (CustomEvent on window) is used instead.

### 9. API
| Endpoint | Method | Request Body | Response Body |
|---|---|---|---|
| `/api/auth/login` | POST | `{ username, password }` | `{ token, userId, username, firstName, lastName, role, authorizedWorkflows }` |
| `/api/auth/me` | GET | JWT in Authorization header (auto via HttpClient) | `{ token, userId, username, firstName, lastName, role, authorizedWorkflows }` |

# SettingsContext.jsx

## 1. File Name and Directory
`Frontend/src/contexts/SettingsContext.jsx`

### 2. File Type
Frontend (React Context)

### 3. What the file does
Provides global app settings (dark mode, auto-save, default material) via React Context, persisted to `localStorage`.

### 4. User Stories
- As a user, I can toggle dark mode and have my preference remembered across sessions.
- As a user, I can set auto-save on/off and choose a default material, and those persist locally.

### 5. Functions Summary
- `SettingsProvider`: React component that initializes state from localStorage, wraps children with context, and syncs state changes back to localStorage & `<html>` class.
- `useSettings`: Hook to consume settings context from any child component.

### 6. Integration
Does not call backend APIs. All state is persisted purely in browser `localStorage`.

### 7. Imports Summary
- `react`: `createContext`, `useContext`, `useState`, `useEffect`

### 8. Additional Info
Dark mode toggling also adds/removes the `dark` class on `document.documentElement` for Tailwind dark mode support.

### 9. API
No backend communication. Settings are read/written synchronously to `localStorage` on init and on every state change via `useEffect`.

## 1. File Name and Directory
`Frontend/src/contexts/TourContext.jsx`

### 2. File Type
Frontend (React Context)

### 3. What the file does
Manages an interactive guided tour (walkthrough) for three workflows: lecture extraction (`LEC_EXT`), bank extraction (`BANK_EXT`), and drawing (`DRAW`). Each tour consists of sequential steps that auto-navigate between routes and auto-fill form fields with dummy data for demonstration. Enforces RBAC before starting a tour.

### 4. User Stories
- As a user, I can start a guided tour that walks me through the lecture/bank/draw workflow step-by-step.
- As a user, I can navigate forward/backward through tour steps with forms auto-populated for me.

### 5. Functions Summary
- `TourProvider`: Context provider; holds `isActive`, `currentWorkflow`, `currentStepIndex` state
- `startTour(workflowId)`: Validates RBAC via `hasWorkflowAccess`, initializes tour, navigates to first step
- `stopTour()`: Resets tour state to inactive
- `nextStep()`: Advances tour to next step or stops if at end
- `prevStep()`: Goes back one step
- `useTour()`: Hook to consume `TourContext`
- `useEffect`: Watches location; runs `autoFill()` when arriving at a step's route

### 6. Integration
No backend/database calls. Integrates with React Router (`useNavigate`, `useLocation`) for step navigation and `AuthContext` (`hasWorkflowAccess`) for permission gating.

### 7. Imports Summary
- `react`: `createContext`, `useContext`, `useState`, `useEffect`
- `react-router`: `useLocation`, `useNavigate`
- `./AuthContext`: `useAuth`

### 8. Additional Info
- `TOUR_DATA` object defines steps per workflow with Arabic titles/content and optional `autoFill` functions that simulate user input via native value setters
- `WORKFLOW_SYSTEM_CODES` maps workflow IDs to backend SystemCodes for RBAC enforcement

### 9. API
No backend API. Pure frontend context; only reads `hasWorkflowAccess` from `AuthContext` for permission checks.

## 1. File Name and Directory
Frontend/src/index.css

### 2. File Type
Frontend — Global styles / Tailwind CSS v4 theme configuration

### 3. What the file does
Defines the app-wide CSS foundation using Tailwind v4's CSS-first config (`@import "tailwindcss"` + `@theme`). Sets custom design tokens (colors, font), RTL direction, scrollbar styling, and reusable animation keyframes for modals, copy feedback, and wizard step transitions. Dark mode overrides are declared in `@layer base .dark`.

### 4. User Stories
- As a user, I see a consistent color scheme (primary blue, success green, danger red) across all pages.
- As a user, I experience smooth fade/scale animations when modals open and close.
- As a user who prefers dark mode, the app surfaces respect system preference with appropriate dark colors.

### 5. Functions Summary
No JavaScript functions — pure CSS. Key custom properties and keyframe animations:
- `@theme tokens`: `--font-sans`, `--color-*` palette (primary, cyan, success, danger, sidebar, surface, text, border)
- `.transition-default`: Generic 0.2s ease transition utility
- `.animate-fade-slide-in`: Wizard step entry animation (opacity + translateY)
- `.animate-copy-flash`: Copy-to-clipboard scale pulse
- `.animate-fadeIn` / `.animate-scaleIn`: Modal entrance animations
- `.animate-fadeOut` / `.animate-scaleOut`: Modal exit animations

### 6. Integration
None. Pure stylesheet — no API calls, database access, or external service interaction.

### 7. Imports Summary
- `@import "tailwindcss"` — Tailwind CSS v4 framework (Vite plugin-processed)

### 8. Additional Info
Arabic-first RTL is enforced at the `html` level (`direction: rtl`). All colors use CSS custom properties for dynamic dark-mode switching. The dark palette in `@layer base .dark` reassigns surface/text/border tokens for dark backgrounds.

### 9. API
No request/response handling.

## 1. File Name and Directory
`Frontend/src/main.jsx`

### 2. File Type
Frontend (React entry point)

### 3. What the file does
Bootstraps the React application by mounting the root `<App />` component inside `<StrictMode>` and `<SettingsProvider>`, targeting the `#root` DOM element.

### 4. User Stories
- As a user, the app renders and initializes the global settings context on load.
- As a developer, the app runs in StrictMode to catch potential issues during development.

### 5. Functions Summary
- `createRoot().render()`: Mounts the React component tree into the DOM.

### 6. Integration
None. It is the client-side entry point with no direct backend calls.

### 7. Imports Summary
- **External:** `react` (StrictMode), `react-dom/client` (createRoot)
- **Internal:** `./App.jsx`, `./contexts/SettingsContext.jsx` (SettingsProvider), `./index.css`

### 8. Additional Info
None

### 9. API
None

## 1. File Name and Directory
`Frontend/src/pages/admin/MaterialsManager.jsx`

### 2. File Type
Frontend (React admin page component)

### 3. What the file does
Admin CRUD interface for managing academic materials (subjects). Displays a sortable/filterable table of materials with a modal form for creating/editing, and delete with confirmation.

### 4. User Stories
- As an admin, I can view all materials, filter by academic year, and sort by name or year.
- As an admin, I can add, edit, or delete a material with a name and academic year.

### 5. Functions Summary
- `loadMaterials()`: Fetches all materials from API and updates state.
- `handleSubmit()`: Creates or updates a material via API, then reloads list.
- `handleEdit(material)`: Pre-fills modal form with material data for editing.
- `handleDelete(id)`: Confirms then deletes a material via API.
- `resetForm()`: Clears form state and resets editing ID.
- `openCreateModal()`: Resets form and opens modal for new material.
- `closeModal()`: Closes modal with a brief closing animation.
- `getYearLabel(year)`: Maps year number to Arabic label.
- `getYearBadge(year)`: Renders a colored badge for the academic year.
- `formatDate(date)`: Formats a date string using Arabic locale.
- `handleSort(key)`: Cycles sort state (asc → desc → none).
- `getSortIcon(key)`: Returns the appropriate sort arrow icon.
- `resetFilters()`: Clears year filter and sort config.

### 6. Integration
Calls backend REST API via `fetchAdminMaterials`, `createAdminMaterial`, `updateAdminMaterial`, `deleteAdminMaterial` at `/api/admin/materials`.

### 7. Imports Summary
- **External:** `react` (useState, useEffect, useMemo), `lucide-react` (BookOpen, Plus, Pencil, Trash2, Loader2, AlertCircle, X, Sparkles, Eye, EyeOff, Calendar, ArrowUpDown, ArrowUp, ArrowDown, Filter, GraduationCap, Hash)
- **Internal:** `../../utils/api` (fetchAdminMaterials, createAdminMaterial, updateAdminMaterial, deleteAdminMaterial)

### 8. Additional Info
Arabic RTL UI with dark mode support, animated modal (fade/scale in/out), loading spinner, error alerts, and empty-state sparkles illustration.

### 9. API
| Method | Endpoint | Request Body | Response |
|--------|----------|-------------|----------|
| GET | `/api/admin/materials` | — | Array of `{ materialId, materialName, materialYear, ... }` |
| POST | `/api/admin/materials` | `{ materialName, materialYear }` | Created material object |
| PUT | `/api/admin/materials/:id` | `{ materialName, materialYear }` | Updated material object |
| DELETE | `/api/admin/materials/:id` | — | (no content / success) |

## 1. File Name and Directory
Frontend/src/pages/admin/SystemConfig.jsx

### 2. File Type
Frontend (React admin page component)

### 3. What the file does
Admin configuration panel with three management areas: toggle workflow activation, edit AI prompts per workflow, and manage role-based permissions (add/remove roles) per workflow.

### 4. User Stories
- As an admin, I can activate/deactivate any workflow server
- As an admin, I can edit the system prompt text for any workflow
- As an admin, I can assign or remove roles (TechMember / ScientificMember) per workflow

### 5. Functions Summary
- `loadData()`: Fetches workflows, prompts, and permissions in parallel via Promise.all
- `handleToggleWorkflow(id, currentActive)`: Toggles workflow active state via API and updates local state optimistically
- `handleSavePrompt(id)`: Saves edited prompt text and collapses the editor
- `handleAddPermission()`: Creates a new role permission for a workflow, then reloads data
- `handleDeletePermission(id)`: Deletes a permission after confirmation, then reloads data
- `closePermissionModal()`: Closes the permission modal with a fade-out animation
- `getWorkflowName(id)`: Looks up a workflow's adminNote by ID
- `getRoleInfo(roleName)`: Returns role-specific styling, icon, and Arabic label
- `formatDate(date)`: Formats a date using ar-SY locale

### 6. Integration
Calls backend admin REST API endpoints for workflows, prompts, and permissions CRUD.

### 7. Imports Summary
- `useState`, `useEffect`, `useMemo` (React)
- `fetchAdminWorkflows`, `fetchAdminPrompts`, `fetchAdminPermissions`, `toggleAdminWorkflow`, `updateAdminPrompt`, `createAdminPermission`, `deleteAdminPermission` (../../utils/api)
- `lucide-react` icons: Settings2, Power, PowerOff, Loader2, AlertCircle, X, Plus, Trash2, FileText, ChevronDown, ChevronUp, Save, RefreshCw, Shield, Sparkles, FlaskConical, Crown, Scroll, Server, UserCog

### 8. Additional Info
Arabic-first UI (`dir="rtl"`). Includes modal with fade/scale animations for adding permissions. Prompts tab uses an accordion expand/collapse pattern.

### 9. API
- `fetchAdminWorkflows()` → GET workflows list
- `fetchAdminPrompts()` → GET prompts list
- `fetchAdminPermissions()` → GET permissions list
- `toggleAdminWorkflow(id, active)` → POST toggle active state
- `updateAdminPrompt(id, promptText)` → POST update prompt text
- `createAdminPermission({ roleName, workflowId })` → POST create new permission
- `deleteAdminPermission(id)` → DELETE remove a permission

## 1. File Name and Directory
`Frontend/src/pages/admin/UsersManager.jsx`

### 2. File Type
Frontend (React component)

### 3. What the file does
Admin CRUD page for managing users. Displays a sortable/filterable table of users with role badges, batch info, Telegram copy, and dates. Provides a modal form for creating/editing users with field validation.

### 4. User Stories
- As an Admin, I can view all users in a table, filter by role/batch, and sort by name, role, batch, or dates.
- As an Admin, I can create, edit, or delete users via a modal form with input validation.

### 5. Functions Summary
- `loadUsers`: Fetches all users from backend and sets state
- `handleSubmit`: Validates inputs and calls create/update API
- `handleEdit`: Populates modal with user data for editing
- `handleDelete`: Confirms and deletes a user via API
- `resetForm`: Clears form state and resets editing ID
- `openCreateModal` / `closeModal`: Controls modal visibility with animation
- `handleUsernameInput` / `handlePasswordInput`: Real-time input guards (English alphanumeric + allowed symbols only)
- `getRoleBadge`: Renders colored role badge with icon
- `formatDate`: Formats dates to Arabic locale
- `handleCopyTelegram`: Copies Telegram username to clipboard
- `handleSort` / `getSortIcon`: Cycles sort state (asc → desc → none)
- `resetFilters`: Clears all filter and sort settings

### 6. Integration
Calls backend admin REST API via `authFetch`: `fetchAdminUsers`, `createAdminUser`, `updateAdminUser`, `deleteAdminUser`.

### 7. Imports Summary
- React hooks: `useState`, `useEffect`, `useMemo`
- Internal: `../../utils/api` (admin user CRUD functions)
- External: `lucide-react` icons (Users, Plus, Pencil, Trash2, etc.)

### 8. Additional Info
Arabic-first RTL UI. Telegram + role combination must be unique (handles 409 conflict). Protected `userId === 1` from deletion. Uses `onBeforeInput` for clean keyboard validation without blocking Ctrl combinations.

### 9. API
- `GET /api/admin/users` → returns array of user objects
- `POST /api/admin/users` → creates user; body: `{ firstName, lastName, username, password, userRole, batchNumber, telegramUsername?, teamJoinDate? }`
- `PUT /api/admin/users/{id}` → updates user; body: same as create without `username`
- `DELETE /api/admin/users/{id}` → deletes user

## 1. File Name and Directory
`Frontend/src/pages/Admin-Unauthorized.jsx`

### 2. File Type
Frontend (React component)

### 3. What the file does
Renders an Arabic unauthorized access page for admin users who navigate to member-only routes. Displays a shield alert icon, a message explaining the page is members-only, and a link back to admin user management.

### 4. User Stories
- As an admin, I want to see a clear Arabic message when I access a member-only page so I understand the restriction.
- As an admin, I want a one-click link back to the admin panel to quickly navigate away.

### 5. Functions Summary
- `AdminUnauthorized`: Default-exported React component rendering the unauthorized UI.

### 6. Integration
None. Purely static presentation component. No API, database, or external service calls.

### 7. Imports Summary
- External: `ShieldAlert` (icon) from `lucide-react`, `Link` (router navigation) from `react-router`.

### 8. Additional Info
Arabic-first (RTL) page. Uses Tailwind CSS v4 for styling (`animate-fade-slide-in`, `bg-danger/10`, `text-danger`, `shadow-primary/25`). No props or state.

### 9. API
No API interaction.

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

## 1. File Name and Directory
Frontend/src/pages/Dashboard.jsx

### 2. File Type
Frontend — Main dashboard page component

### 3. What the file does
Renders the app's landing page after login: shows a welcome tour banner, stat cards (lectures, question banks, drawings, total sessions), RBAC-filtered quick-action buttons, and the 5 most recent user sessions with RBAC filtering.

### 4. User Stories
- As a user, I see aggregate stats and quick-action links for workflows I have permission to use.
- As a user, I can click a recent session to resume where I left off.
- As an Admin user, I am automatically redirected to `/admin/users`.

### 5. Functions Summary
- `getSessionRoute`: Maps backend `workflowType` SystemCode (e.g. `LEC_EXT`) to a frontend route with session ID.
- `Dashboard`: Main component — fetches stats & recent sessions, filters by RBAC via `hasWorkflowAccess`, renders the full dashboard UI.

### 6. Integration
Calls backend via `fetchStats()` and `fetchSessions(1, 5)` from `../utils/api`. Uses `useAuth()` context for RBAC checks and user role detection.

### 7. Imports Summary
- **External:** `react` (useState, useEffect), `react-router` (Link, useNavigate), `lucide-react` (7 icons)
- **Internal:** `../utils/api` (fetchSessions, fetchStats), `../contexts/AuthContext` (useAuth)

### 8. Additional Info
Arabic-first UI with RTL layout. Admin users are immediately redirected away. Quick actions and recent sessions list are filtered client-side using `hasWorkflowAccess()` from AuthContext. Stat card values default to 0 for missing keys. Tour banner is conditionally rendered only if user has access to any of `LEC_EXT`, `BANK_EXT`, or `DRAW`.

### 9. API
- **GET stats:** `fetchStats()` → returns `{ total, LEC_EXT, BANK_EXT, BANK_QS, DRAW, PANDOC, LEC_COORD }` — numeric counts per workflow type.
- **GET sessions:** `fetchSessions(1, 5)` → returns `{ sessions: [{ id, workflowType, materialName, lectureNumber, createdAt }] }` — paginated recent sessions; frontend filters the first 5 by RBAC.

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

## 1. File Name and Directory
`Frontend/src/pages/History.jsx`

### 2. File Type
Frontend

### 3. What the file does
Displays a paginated, filterable list of all user workflow sessions (extraction, coordination, quiz, pandoc, draw). Users can view or delete any session. Filter buttons are RBAC-gated via `hasWorkflowAccess`.

### 4. User Stories
- As a user, I want to browse my past sessions filtered by workflow type so I can quickly resume work.
- As a user, I want to delete old/unwanted sessions.

### 5. Functions Summary
- `getSessionRoute(session)`: Maps backend `workflowType` SystemCode + session `id` to a frontend route.
- `History` (default export): Main component — manages sessions state, filter, pagination, delete, and renders the UI.
- `loadSessions(pageNum)`: Calls `fetchSessions` API and updates state (appends or replaces).
- `handleLoadMore()`: Increments page and loads next batch.
- `handleDelete(id)`: Confirms via `window.confirm`, calls `removeSession` API, then reloads from page 1.

### 6. Integration
Calls `fetchSessions` and `removeSession` from `../utils/api`.

### 7. Imports Summary
- **React hooks**: `useState`, `useMemo`, `useEffect`
- **Icons**: `Clock`, `FileSearch`, `AlignRight`, `Palette`, `FileOutput`, `Trash2`, `Eye`, `Loader2` from `lucide-react`
- **Internal**: `fetchSessions`, `removeSession` from `../utils/api`; `Link` from `react-router`; `useAuth` from `../contexts/AuthContext`

### 8. Additional Info
Arabic-first RTL. Dual-layer RBAC security: (1) filter buttons only shown for permitted workflows, (2) client-side re-filters sessions to block unauthorized ones (defense-in-depth against stale/cached data).

### 9. API
- `fetchSessions(pageNum, limit)` → returns `{ sessions: Session[], hasMore: boolean, totalCount: number }`
- `removeSession(id)` → `DELETE` endpoint, returns success/error.

## 1. File Name and Directory
`Frontend/src/pages/Login.jsx`

### 2. File Type
Frontend (React component)

### 3. What the file does
Renders a full-page RTL login form with username/password fields, show/hide password toggle, error banner, loading spinner, and post-login role-based redirect (Admin → `/admin/users`, others → `/`). Redirects already-authenticated users on mount.

### 4. User Stories
- As a user, I can log in with my credentials and be redirected based on my role.
- As an already logged-in user, I am automatically redirected away from the login page.

### 5. Functions Summary
- `Login` (default export): Main component — manages form state, calls `AuthContext.login`, handles errors, renders UI.
- `handleSubmit`: Prevents default form submission, calls `login(username, password)`, navigates on success or sets error on failure.

### 6. Integration
Calls `AuthContext.login()` which POSTs to `/auth/login` backend endpoint. No direct API calls in this file.

### 7. Imports Summary
- **React hooks:** `useState`, `useContext`, `useEffect`
- **React Router:** `useNavigate`
- **Internal:** `AuthContext` from `../contexts/AuthContext`
- **Icons:** `LogIn`, `User`, `Lock`, `Loader2`, `AlertCircle`, `Eye`, `EyeOff` from `lucide-react`

### 8. Additional Info
Arabic-first (RTL) with Tailwind v4 styling, dark mode support, and logical property classes (`ms-`, `pe-`, `start`, `end`). Logo inverts in dark mode.

### 9. API
- **Endpoint:** `POST /auth/login`
- **Request body:** `{ username, password }`
- **Response (success):** `{ token, userId, username, firstName, lastName, role, authorizedWorkflows[] }` — token saved to `localStorage`, user object set in AuthContext.
- **Response (error):** throws with `errData.message` (Arabic fallback: "فشل تسجيل الدخول").

## 1. File Name and Directory
Frontend/src/pages/MergeWizard.jsx

### 2. File Type
Frontend — Page component (Wizard)

### 3. What the file does
A 3-step wizard that lets users set session metadata (material, type, lecture number), upload and reorder multiple .docx files, then merge them into a single combined Word document for download.

### 4. User Stories
- As a user, I want to merge several .docx files in a specific order into one file.
- As a user, I want to reorder, add, or remove files before merging, and download the result.

### 5. Functions Summary
- `MergeWizard`: Main component — manages 3-step wizard state (session setup → file upload/reorder → merge & download)
- `goNext/goBack`: Navigate between wizard steps
- `getTypeLabel`: Returns Arabic label for lecture type ("نظري" / "عملي")
- `handleFileSelect`: Filters and appends selected .docx files to state
- `removeFile`: Removes a file by index
- `moveFile`: Swaps file position (move up/down) for reordering
- `handleMerge`: Calls `mergeDocxFiles` API, creates an object URL from the returned blob, sets success/error status
- `getDownloadFileName`: Generates Arabic download filename from material name and type

### 6. Integration
Calls backend via `mergeDocxFiles` utility: sends multipart FormData (`files[]`, `materialName`, `lectureType`) to `/api/merge/execute`, then fetches the returned file URL to obtain the merged .docx blob.

### 7. Imports Summary
- **External:** `react` (useState, useRef), `lucide-react` (Layers, Upload, Loader2, File, Download, ArrowUp, ArrowDown, X, CheckCircle2)
- **Internal:** `WizardStepper` (step indicator), `MaterialAutocomplete` (material name selector), `mergeDocxFiles` from `utils/api`, `useSettings` from `contexts/SettingsContext`

### 8. Additional Info
Arabic-first RTL interface. Uses MaterialAutocomplete which fetches materials from backend via settings context. Status machine: idle → loading → success/error. Uses `URL.createObjectURL` for client-side download without server-side file persistence.

### 9. API
**Request:** `POST /api/merge/execute` with `Content-Type: multipart/form-data`
- Body: `files[]` (FileList), `materialName` (string), `lectureType` (string)
**Response:** `{ url: string }` — URL to the generated .docx file
**Client flow:** Fetches the URL → converts to blob → creates object URL → renders `<a download>` for user to save.

## 1. File Name and Directory
Frontend/src/pages/NotFound.jsx

### 2. File Type
Frontend — 404 Not Found page component

### 3. What the file does
Renders a user-friendly "page not found" view in Arabic with a smart redirect link that routes admins to `/admin/users` and regular users to `/`.

### 4. User Stories
- As a user, I see a clear Arabic 404 message with a button to return to the dashboard.
- As an admin, I see a 404 page with a link back to the admin panel instead of the public dashboard.

### 5. Functions Summary
- `NotFound`: Returns the 404 UI — SearchX icon, title, description, and a contextual `<Link>` button.

### 6. Integration
No direct API calls. Reads `user` from `AuthContext` to determine redirect target.

### 7. Imports Summary
- **External:** `lucide-react` (SearchX icon), `react-router` (Link)
- **Internal:** `AuthContext` (useAuth hook)

### 8. Additional Info
RTL-oriented Arabic content. Uses smart role-based routing: Admin users are redirected to `/admin/users`, others to `/`. No lazy loading applied.

### 9. API
No request/response handling. Relies solely on auth context state for redirect logic.

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

## 1. File Name and Directory
`Frontend/src/pages/Tour.jsx`

### 2. File Type
Frontend

### 3. What the file does
Renders an interactive "guided tour" page displaying available workflows (lecture extraction, question bank extraction, drawing) with their steps, capabilities, and a "start tour" button. Filters visible tours based on user RBAC permissions.

### 4. User Stories
- As a user, I can see which guided tour workflows are available to me based on my permissions.
- As a user, I can start an interactive tour for a workflow to learn the step-by-step process.

### 5. Functions Summary
- `Tour` (default export): Main page component. Filters `TOUR_WORKFLOWS` by user's `hasWorkflowAccess`, renders workflow cards with steps, capabilities, and a start button.

### 6. Integration
No backend API calls. Uses `TourContext.startTour()` (internal state) and `AuthContext.hasWorkflowAccess()` for RBAC filtering.

### 7. Imports Summary
- **External:** `lucide-react` (BookOpen, FlaskConical, Palette, Sparkles, Code, Database, ArrowRight, CheckCircle2, Play, Zap)
- **Internal:** `useTour` from `../contexts/TourContext`, `useAuth` from `../contexts/AuthContext`

### 8. Additional Info
- Arabic-first UI with RTL-friendly Tailwind classes.
- Defines 3 hardcoded workflows: lecture (`LEC_EXT`), question bank (`BANK_EXT`), drawing (`DRAW`).
- Empty state shown when user has no workflow access.

### 9. API
No API interactions. Purely presentational with context-driven RBAC filtering.

## 1. File Name and Directory
`Frontend/src/pages/Unauthorized.jsx`

### 2. File Type
Frontend – React page component

### 3. What the file does
Renders a static 403 "غير مصرح" (Unauthorized) page with a warning icon, explanation text, and a link back to the dashboard. Used as a route-level guard fallback when the user lacks permission for a page.

### 4. User Stories
- As a user without permission for a page, I see a clear Arabic message explaining I'm unauthorized instead of a broken screen.
- As a user, I can click a button to return to the main dashboard.

### 5. Functions Summary
- `Unauthorized()`: Returns a centered layout with a `ShieldX` icon, "غير مصرح" heading, explanation paragraph, and a `Link` to `/`.

### 6. Integration
None. Purely presentational – no backend API, database, or external service calls.

### 7. Imports Summary
- **External:** `ShieldX` from `lucide-react`, `Link` from `react-router`.

### 8. Additional Info
Arabic-first RTL layout. Uses Tailwind CSS v4 classes (`animate-fade-slide-in`, `bg-danger/10`, `text-danger`, `shadow-lg shadow-primary/25`). No props or state – fully static.

### 9. API
No backend interaction. No request/response handling. Acts as a static error page within the React Router setup.

## 1. File Name and Directory
`Frontend/src/types/auth.d.ts`

### 2. File Type
Frontend (TypeScript type definitions)

### 3. What the file does
Defines TypeScript interfaces for authentication domain objects — `LoginResponse` (matches backend `LoginResponse` DTO), the `User` model, and the `AuthContextType` contract used by React context throughout the frontend.

### 4. User Stories
- As a user, I can log in and have my identity (userId, username, role, permissions) available app-wide
- As the app, I can enforce RBAC by checking `allowedWorkflows` from the authenticated user object
- As a developer, I can type the raw API login response via `LoginResponse` (which uses `authorizedWorkflows` matching the backend)

### 5. Functions Summary
None (pure type declarations, no runtime code)

### 6. Integration
No direct API calls or database interaction. Types shape the response consumed from the backend auth endpoint (login).

### 7. Imports Summary
No imports. All interfaces are exported for external consumption.

### 8. Additional Info
- `LoginResponse` matches the backend `LoginResponse` DTO exactly (`authorizedWorkflows` field name from JSON).
- `allowedWorkflows` on `User` is a string array of `SystemCode` values (e.g. `LEC_EXT`, `PANDOC`) used by the UI to conditionally render tabs.
- `AuthContextType` is the contract fulfilled by the AuthProvider context wrapper.

### 9. API
Login endpoint is expected to return a JSON body matching the `LoginResponse` / `User` interface (token, userId, username, firstName, lastName, role, authorizedWorkflows). `AuthContextType.login` calls this endpoint and hydates context state with the response.

## 1. File Name and Directory
`Frontend/src/types/models.d.ts`

### 2. File Type
Frontend — TypeScript type definitions

### 3. What the file does
Defines TypeScript interfaces for all domain models used across the frontend: `Material`, `Workflow`, `File`, `Note`, `SessionContent`, `Session`, `SessionSummary`, `SessionSummaryDto`, and `SessionDetail`. These mirror backend DTOs and ensure type safety when handling API responses.

### 4. User Stories
- As a developer, I can type-check all API response data against these interfaces.
- As a developer, I can navigate related session data (material, workflow, notes, files) via optional navigational properties on `Session`.
- As a developer, I can type the paginated session list response via `SessionSummaryDto` and the full session detail response via `SessionDetail`.

### 5. Functions Summary
None — this file contains only type definitions, no runtime code.

### 6. Integration
Does not call APIs or databases directly. Used across the frontend to type responses from the backend REST API.

### 7. Imports Summary
No imports. These are standalone interface declarations meant to be imported by other frontend modules via `import type { ... }`.

### 8. Additional Info
- `Session.compiledPrompt` is an optional string likely populated by a backend endpoint after prompt compilation.
- `SessionSummaryDto` matches the backend `SessionSummaryDto` response DTO (`id`, `materialName`, `workflowType`, `createdAt`, `lectureNumber`), used for paginated session list responses.
- `SessionDetail` matches the backend `SessionDetailResult` record, wrapping a `Session` with an optional `compiledPrompt`.
- `File.fileType` is restricted to `'Image' | 'Docx' | 'Other'`.
- `Note.noteType` is restricted to `'GeneralNote' | 'FileNote'`.
- `isActive` on `Workflow` is typed as `number` (0/1) rather than `boolean`, matching SQLite convention.

### 9. API
Frontend fetches data from REST endpoints (e.g., `GET /api/session/{id}`) and casts the JSON response to these interfaces. No request/response transformation is handled here — models are direct mappings of backend DTOs.

## 1. File Name and Directory
`Frontend/src/types/api.d.ts`

### 2. File Type
Frontend — TypeScript type definitions

### 3. What the file does
Defines TypeScript interfaces for API-specific response shapes: `ErrorResponse` (standard error envelope), `PandocResult` (Pandoc generation result), `MergeResult` (DOCX merge result), `ValidationErrors` (per-field validation error maps), and `PaginatedResponse<T>` (generic paginated list wrapper). These mirror backend DTOs and result records from `ExceptionHandlingMiddleware`, `IPandocService`, `IMergeService`, and `ISessionService`.

### 4. User Stories
- As a developer, I can type API error responses consistently across the app.
- As a developer, I can type Pandoc DOCX generation and DOCX merge results.
- As a developer, I can type paginated API list responses using the generic `PaginatedResponse<T>`.
- As a developer, I can type per-field validation errors returned by the backend middleware.

### 5. Functions Summary
None — pure type declarations, no runtime code.

### 6. Integration
No direct API calls or database interaction. Types are consumed by the API utility layer (`utils/api.js`) and page components when processing backend responses.

### 7. Imports Summary
No imports. All types are exported for external consumption.

### 8. Additional Info
- `ErrorResponse` matches the backend `ErrorResponse` DTO (`error`, `statusCode`, `traceId`) returned by `ExceptionHandlingMiddleware` for non-validation errors.
- `PandocResult` matches the backend `PandocResult` record (`success`, `fileUrl?`, `error?`, `details?`) from `IPandocService`.
- `MergeResult` matches the backend `MergeResult` record (`url?`, `finalFileName?`, `error?`) from `IMergeService`.
- `ValidationErrors` is a `Record<string, string[]>` matching the per-field error map returned by `ExceptionHandlingMiddleware` for FluentValidation failures.
- `PaginatedResponse<T>` is generic over item type with `items`, `totalCount`, `page`, `limit`, `hasMore` — matching the pagination metadata from `SessionListResult` backend DTO.

### 9. API
These types shape the JSON responses from various backend endpoints. The actual parsing and transformation is handled by `utils/api.js` — these declarations provide static type guarantees at dev/build time.

## 1. File Name and Directory
`Frontend/src/utils/api.js`

### 2. File Type
Frontend (API client utility)

### 3. What the file does
Centralized HTTP client for all backend communication. Wraps `fetch` with JWT auth, handles 401 auto-logout, and provides typed functions for sessions, materials, prompts, file uploads, Pandoc generation, document merging, and full admin CRUD (users, materials, workflows, prompts, permissions).

### 4. User Stories
- As a user, I can perform all workflow operations (create/view/delete sessions, upload files, compile prompts) without manually managing tokens.
- As an admin, I can manage users, materials, workflows, prompts, and permissions via dedicated API functions.
- As a user, I get automatically redirected to login when my token expires.

### 5. Functions Summary
- `authFetch`: Core wrapper — attaches JWT `Authorization` header, handles 401 globally (clears token, redirects to `/login`), shows Arabic toast for 429 (rate limit), 403 (forbidden), and 500 (server error), preserves existing headers.
- `showToastGlobal` (internal): Dispatches a `CustomEvent('app:showToast')` for the Toast system to pick up.
- `formatRateLimitError` (internal): Formats retry-after seconds into an Arabic rate-limit message.
- `fetchUserProfile`: GET `/api/auth/me` — returns current user profile with authorized workflows.
- `fetchMaterials`: GET `/api/materials` — cached in-memory.
- `compilePromptStateless`: POST `/api/prompts/compile` — compiles a prompt statelessly.
- `fetchSessions`: GET `/api/sessions?page=&limit=` — paginated session list.
- `fetchSession`: GET `/api/sessions/{id}` — single session.
- `createSession`: POST `/api/sessions` + optional POST `/api/sessions/{id}/files` — creates session then uploads attached files.
- `uploadFiles`: POST `/api/sessions/{id}/files` — file upload via FormData.
- `fetchPrompt`: GET `/api/prompts/{sessionId}/{systemCode}`.
- `removeSession`: DELETE `/api/sessions/{id}`.
- `generatePandoc`: POST `/api/pandoc/generate` — generates DOCX via Pandoc.
- `mergeDocxFiles`: POST `/api/merge/execute` — uploads DOCX files, downloads merged blob.
- `fetchStats`: Aggregates session counts by `workflowType` with 60s cache TTL.
- `saveQuizSession`: POST `/api/sessions` then POST `/api/sessions/save?sessionId=` for quiz content.
- `saveSessionContent`: POST `/api/sessions/save` — saves JSON/Markdown content.
- `fetchAdminUsers` / `createAdminUser` / `updateAdminUser` / `deleteAdminUser`: Full CRUD on users.
- `fetchAdminMaterials` / `createAdminMaterial` / `updateAdminMaterial` / `deleteAdminMaterial`: Full CRUD on materials.
- `fetchAdminWorkflows` / `toggleAdminWorkflow`: Read and toggle workflows active state.
- `fetchAdminPrompts` / `updateAdminPrompt`: Read and update prompts.
- `fetchAdminPermissions` / `createAdminPermission` / `deleteAdminPermission`: Manage role-workflow permissions.

### 6. Integration
Calls the backend REST API exclusively. No direct database or external service calls from this file.

### 7. Imports Summary
**No module imports** — uses native `fetch`, `Headers`, `FormData`, `localStorage`, `window.location`, `CustomEvent`.

### 8. Additional Info
- In-memory cache (`apiCache` Map) for materials (indefinite) and stats (60s TTL).
- Handles 400 errors with Arabic fallback messages (`'يجب اختيار مادة صالحة لمتابعة العمل.'`).
- `createSession` extracts session ID from both `id` and `sessionId` response fields, plus falls back to `Location` header.
- File uploads use `FormData` (no explicit `Content-Type` header — browser sets `multipart/form-data` automatically).
- `authFetch` auto-dispatches Arabic toast notifications via `CustomEvent('app:showToast')` for 429 (warning), 403 (error), and 500 (error) status codes.

### 9. API
**Request:** All calls go through `authFetch` which attaches `Authorization: Bearer <token>` from `localStorage`. JSON payloads get `Content-Type: application/json` automatically. File uploads use `FormData`.

**Response:** Functions parse JSON or blob. Errors are caught and logged with contextual messages. Non-OK responses throw with backend error message (Arabic where applicable). 401 triggers global logout + redirect.

## 1. File Name and Directory
Frontend/src/utils/storage.js

### 2. File Type
Frontend — localStorage session persistence utility

### 3. What the file does
Provides CRUD operations for user workflow sessions using browser `localStorage`. Sessions store metadata (material name, lecture number, type, workflow type, prompt text, notes) and are persisted under the key `bluebits_sessions`. Results are always returned newest-first.

### 4. User Stories
- As a user, I save a new session so I can review or resume my work later.
- As a user, I view my session history and filter by workflow type on the dashboard.
- As a user, I delete old sessions I no longer need.

### 5. Functions Summary
- `saveSession(session)`: Prepends a new session with generated `id` and `createdAt`, persists it, returns the saved entry.
- `getSessions()`: Returns all sessions (newest first).
- `getSession(id)`: Returns a single session by id, or `null`.
- `deleteSession(id)`: Removes a session by id.
- `getSessionsByType(workflowType)`: Filters sessions by workflow type (`lecture`, `bank`, `draw`, `pandoc`, `coordination`).
- `getStats()`: Returns counts per workflow type plus total.

### 6. Integration
No backend calls — purely client-side `localStorage` reads/writes.

### 7. Imports Summary
Zero imports. Standalone utility with a single private constant (`STORAGE_KEY`) and two private helpers (`readSessions`, `writeSessions`).

### 8. Additional Info
Sessions are stored as JSON under `localStorage['bluebits_sessions']`. All read operations are wrapped in try/catch returning `[]` on parse failure. IDs are generated as `${Date.now()}-${random9chars}`. No size limit except browser storage quota (~5–10 MB).

### 9. API
No HTTP requests. All data flows to/from `localStorage` synchronously via `JSON.parse`/`JSON.stringify`.

## 1. File Name and Directory
`Frontend/src/utils/errorFormatter.js`

### 2. File Type
Frontend — Arabic error formatting utility

### 3. What the file does
Provides three helper functions to format API errors into human-readable Arabic messages and structured validation error maps. Designed to be used by the API utility layer and UI components for consistent error presentation.

### 4. User Stories
- As a user, I see clear Arabic messages when rate-limited, with the exact wait time.
- As a developer, I call `formatValidationErrors(raw)` to flatten backend validation errors into `{field: message}` for per-field display.
- As a user, I see context-aware Arabic fallback messages for common HTTP errors (404, 403, 409, 500, 503).

### 5. Functions Summary
- `formatRateLimitError(retryAfter)`: Converts seconds to Arabic "طلبات كثيرة جداً..." message with minutes/seconds.
- `formatValidationErrors(raw)`: Flattens `Record<string, string[]>` into `Record<string, string>` taking the first message per field.
- `formatGeneralError(apiError)`: Returns Arabic message based on HTTP status or falls back to `apiError.message`. Default: "حدث خطأ غير متوقع."

### 6. Integration
No backend calls. Pure utility — consumes error objects thrown by `utils/api.js` or caught in UI components.

### 7. Imports Summary
Zero imports. Standalone utility with no dependencies.

### 8. Additional Info
- `formatRateLimitError` defaults to 60 seconds if `retryAfter` is falsy/non-numeric.
- `formatValidationErrors` returns `{}` for null/non-object input.
- `formatGeneralError` checks both `status` and message text to detect error type resiliently.

### 9. API
No direct API interaction. Designed to format errors from backend responses (429, 400 with validation errors, 4xx/5xx).

## 1. File Name and Directory
`Frontend/src/api/HttpClient.js`

### 2. File Type
Frontend — Base HTTP client with auth/error/rate-limit interception

### 3. What the file does
Thin fetch wrapper that automatically attaches the JWT token from localStorage, handles response status codes with typed errors, and exports `httpGet`/`httpPost`/`httpPut`/`httpDelete` convenience functions. Reuses `formatValidationErrors` from the existing error utility for 400 field errors.

### 4. User Stories
- As a developer, I call `httpGet('/api/sessions')` and get back parsed JSON or a typed `ApiError`/`RateLimitError`.
- As a developer, I catch `ApiError` to access `error.status`, `error.errors` (validation map), `error.traceId`, and `error.data` (raw body).
- As a developer, I catch `RateLimitError` to access `error.retryAfter` (seconds).

### 5. Functions Summary
- `ApiError`: Custom error class with `status`, `data`, `errors`, `traceId`.
- `RateLimitError`: Custom error class with `retryAfter` and `status = 429`.
- `baseRequest(method, path, options)`: Core fetch wrapper — builds URL, attaches JWT header, serializes JSON body, delegates to `handleResponse`.
- `handleResponse(response)`: Parses JSON body, inspects status: 2xx → return data; 401 → clear localStorage + redirect `/login` + throw `ApiError`; 429 → throw `RateLimitError`; 400 → throw `ApiError` with `errors` map; 404 → throw `ApiError`; 5xx → throw `ApiError`.
- `httpGet(path, options)`: GET shorthand.
- `httpPost(path, body, options)`: POST shorthand.
- `httpPut(path, body, options)`: PUT shorthand.
- `httpDelete(path, options)`: DELETE shorthand.

### 6. Integration
Calls backend REST API via `fetch`. Handles 401 (auth expiry), 429 (rate limit), 400 (validation), 404 (not found), and 5xx (server error) statuses. Reuses `formatValidationErrors` from `utils/errorFormatter`.

### 7. Imports Summary
- **Internal:** `formatValidationErrors` from `../utils/errorFormatter`

### 8. Additional Info
- `API_BASE` is empty by default (relative URLs). Pass absolute URLs or override by editing `API_BASE`.
- `FormData` bodies skip `Content-Type` auto-set (browser sets multipart boundary).
- Non-JSON 2xx responses (e.g. empty body, blob) return `null` or throw on parse; designed for JSON APIs.
- `utils/api.js` is left untouched — this client is opt-in for new code.

### 9. API
**Request:** All requests auto-attach `Authorization: Bearer <token>`. JSON objects get `Content-Type: application/json`. `FormData` passes through unmodified.

**Response:** 2xx → parsed JSON (or `null` for empty). Errors → one of:
- `ApiError` (400): `{ message, status: 400, errors: {field: msg}, data, traceId }`
- `ApiError` (401): `{ message, status: 401, data, traceId }` + auto-redirect to `/login`
- `RateLimitError` (429): `{ message, status: 429, retryAfter }`
- `ApiError` (404): `{ message, status: 404, data, traceId }`
- `ApiError` (5xx): `{ message, status, data, traceId }`
`Frontend/src/contexts/ToastContext.jsx`

### 2. File Type
Frontend (React Context Provider)

### 3. What the file does
Manages a global toast notification queue. Provides `showToast(message, type)` for React components and `showToastGlobal(message, type)` for dispatching toasts from non-React code (e.g., `api.js`). Toasts auto-dismiss after 5 seconds. Supports types: `success`, `error`, `warning`, `info`.

### 4. User Stories
- As a user, I see a styled toast notification when an API error (429, 403, 500) occurs.
- As a developer, I call `showToast` from any component or `showToastGlobal` from utility code to trigger a notification.

### 5. Functions Summary
- `ToastProvider`: Context provider — wraps children with toast state, listens for global `app:showToast` custom events.
- `useToast()`: Hook returning `{ toasts, showToast, removeToast }`.
- `showToastGlobal(message, type)`: Dispatches a `CustomEvent('app:showToast')` on `window` for non-React callers.
- `removeToast(id)`: Removes a toast by ID (supports manual dismissal).
- `showToast(message, type)`: Adds a toast to the queue and schedules auto-removal after 5s.

### 6. Integration
No backend calls. Communicates with non-React code via `window` custom events (`app:showToast`). Consumed by `Toast.jsx` component and `utils/api.js`.

### 7. Imports Summary
- **External:** `react` (createContext, useContext, useState, useCallback, useEffect)

### 8. Additional Info
- Toast IDs are generated via `Date.now() + Math.random()` — sufficient for local state.
- Uses `useCallback` for stable references to `showToast` and `removeToast`.
- The global event listener is cleaned up on provider unmount.

### 9. API
- `event.detail.message` (string) — toast text
- `event.detail.type` (string) — one of `success`, `error`, `warning`, `info`

## 1. File Name and Directory
`Frontend/src/components/Toast.jsx`

### 2. File Type
Frontend (React component)

### 3. What the file does
Renders all active toasts as a fixed overlay at the top of the viewport, using `createPortal` to `document.body`. Each toast shows a `lucide-react` icon (CheckCircle/error, XCircle/error, AlertTriangle/warning, Info/info), the message text, and a close button. Animated entrance via `animate-fade-slide-in`.

### 4. User Stories
- As a user, I see stacked toast notifications at the top of the screen with color-coded icons for success, error, warning, and info.
- As a user, I can manually dismiss a toast by clicking its close button.

### 5. Functions Summary
- `Toast` (default export): Reads `toasts` from `ToastContext`, renders a portal container with individual toast cards.

### 6. Integration
No backend/database calls. Renders via portal at `document.body` to ensure z-index stacking above all content.

### 7. Imports Summary
- **External:** `react-dom` (createPortal), `lucide-react` (CheckCircle, XCircle, AlertTriangle, Info, X)
- **Internal:** `useToast` from `../contexts/ToastContext`

### 8. Additional Info
- Arabic-first: button `aria-label` is "إغلاق", RTL-compatible logical positioning (`start-1/2 -translate-x-1/2`).
- Supports dark mode via Tailwind `dark:` variants (warning uses amber palette).
- Toasts stack vertically with a 0.5rem gap.
- Max width is `max-w-sm` (384px), full width with 2rem padding on mobile.

## 1. File Name and Directory
`Frontend/src/api/MaterialsApi.js`

### 2. File Type
Frontend — API service module

### 3. What the file does
Provides a dedicated function to fetch distinct material names from the backend via `HttpClient`. Acts as a clean, tree-shakeable alternative to the legacy `utils/api.js` `fetchMaterials` function.

### 4. User Stories
- As a developer, I call `getDistinctNames()` to get a `string[]` of all material names for autocomplete/dropdown UIs.

### 5. Functions Summary
- `getDistinctNames()`: Calls `httpGet('/api/materials')` and returns the parsed JSON response (`string[]`).

### 6. Integration
Calls `GET /api/materials` via `HttpClient` (`./HttpClient`). No direct database interaction.

### 7. Imports Summary
- **Internal:** `httpGet` from `./HttpClient`

### 8. Additional Info
- Response is an array of strings (material names), e.g. `["مادة 1", "مادة 2"]`.
- Auth token is automatically attached by `HttpClient` (JWT from localStorage).
- Error handling is inherited from `HttpClient`'s `handleResponse` (401 auto-logout, rate limiting, etc.).

### 9. API
**Request:** `GET /api/materials` — no body, no params.
**Response:** `string[]` — array of material name strings.

## 1. File Name and Directory
`Frontend/src/api/PromptsApi.js`

### 2. File Type
Frontend — API service module

### 3. What the file does
Provides two functions for prompt-related API calls using the HttpClient base client. `getPromptForSession` fetches a prompt for a given session and workflow. `compilePrompt` sends user notes to the backend and returns the compiled prompt text.

### 4. User Stories
- As a developer, I can call `getPromptForSession(sessionId, systemCode)` to fetch prompt text and name for a session.
- As a developer, I can call `compilePrompt(systemCode, generalNotes, fileNotes)` to compile a prompt with user notes attached.

### 5. Functions Summary
- `getPromptForSession(sessionId, systemCode)`: Calls `httpGet` on `/api/prompts/{sessionId}/{systemCode}`, returns `{ promptText, promptName }`.
- `compilePrompt(systemCode, generalNotes, fileNotes)`: Calls `httpPost` on `/api/prompts/compile` with `{ systemCode, GeneralNotes, FileNotes }`, returns `{ compiledPrompt }`.

### 6. Integration
Calls the backend REST API via HttpClient. No direct database or external service calls.

### 7. Imports Summary
- **Internal:** `httpGet`, `httpPost` from `./HttpClient`

### 8. Additional Info
Uses the HttpClient client (which auto-attaches JWT and handles errors). Designed as an opt-in replacement for the older `compilePromptStateless` and `fetchPrompt` in `utils/api.js`.

### 9. API
- **GET** `/api/prompts/{sessionId}/{systemCode}` — Returns `{ promptText, promptName }`.
- **POST** `/api/prompts/compile` — Body: `{ systemCode, GeneralNotes, FileNotes }`. Returns `{ compiledPrompt }`.

## 1. File Name and Directory
`Frontend/src/api/AuthApi.js`

### 2. File Type
Frontend — API service

### 3. What the file does
Provides authentication API methods using `HttpClient`. Exposes `login` (POST credentials) and `getCurrentUser` (GET current profile) — both return `LoginResponse` with JWT token, user profile, and authorized workflow SystemCodes.

### 4. User Stories
- As a user, I can log in with my username and password and receive a token + profile.
- As a user, I can fetch my current profile and permissions using my stored token.

### 5. Functions Summary
- `login(username, password)`: POSTs to `/api/auth/login`, returns parsed `LoginResponse`.
- `getCurrentUser()`: GETs `/api/auth/me`, returns parsed `LoginResponse`.

### 6. Integration
Calls backend REST API at `/api/auth/login` and `/api/auth/me`. Uses `HttpClient` which auto-attaches JWT tokens and handles error responses (401 auto-redirect, 429 rate limit, etc.).

### 7. Imports Summary
- **Internal:** `httpPost`, `httpGet` from `./HttpClient`

### 8. Additional Info
Designed as a thin service layer over `HttpClient` — no custom error handling, serialization, or token management. Errors propagate as `ApiError` / `RateLimitError` from `HttpClient`. Old `utils/api.js` remains untouched.

## 1. File Name and Directory
`Frontend/src/api/SessionsApi.js`

### 2. File Type
Frontend — API service module

### 3. What the file does
Provides dedicated functions for all session-related API calls using the `HttpClient` base module. Covers paginated session listing, single session retrieval, session creation, session content saving, and multipart file uploads with notes.

### 4. User Stories
- As a developer, I can import `getSessions(page, limit)` from SessionsApi to fetch a paginated list of sessions.
- As a developer, I can import `uploadFiles(sessionId, files, notes)` to upload files with per-file notes via multipart FormData.
- As a developer, I can import `createSession(data)` and `saveSessionContent(sessionId, body)` to create/update sessions.

### 5. Functions Summary
- `getSessions(page, limit)`: GET `/api/sessions?page=&limit=` — returns paginated session list.
- `getSession(id)`: GET `/api/sessions/{id}` — returns single session detail.
- `createSession(data)`: POST `/api/sessions` with JSON body — creates a new session.
- `saveSessionContent(sessionId, body)`: POST `/api/sessions/save` — saves session content (quiz, markdown, etc).
- `uploadFiles(sessionId, files, notes)`: POST `/api/sessions/{id}/files` with `FormData` (multipart) — uploads files with optional per-file notes.

### 6. Integration
Calls backend REST API through the shared `HttpClient` (`./HttpClient.js`). All requests automatically get JWT auth, error handling, and rate-limit interception from HttpClient.

### 7. Imports Summary
- **Internal:** `httpGet`, `httpPost` from `./HttpClient`

### 8. Additional Info
- `uploadFiles` constructs a `FormData` object: appends each file under `'files'` key and each note under `'notes'` key. The browser automatically sets `Content-Type: multipart/form-data`.
- Default pagination: `page=1`, `limit=10`.
- Uses HttpClient's typed error classes (`ApiError`, `RateLimitError`).

### 9. API
| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| GET | `/api/sessions?page=&limit=` | — | Paginated session list |
| GET | `/api/sessions/{id}` | — | Single session detail |
| POST | `/api/sessions` | `{ materialName, lectureNumber, lectureType, workflowSystemCode, generalNotes }` | Create session |
| POST | `/api/sessions/save` | `{ sessionId, contentBody }` | Save session content |
| POST | `/api/sessions/{id}/files` | `FormData` (files + notes) | Upload files via multipart |

## 1. File Name and Directory
`Frontend/src/api/PandocApi.js`

### 2. File Type
Frontend — API service module

### 3. What the file does
Provides a `PandocApi` object with a single `generate` method that converts Markdown text to a formatted `.docx` file via the backend Pandoc endpoint. Uses `HttpClient` for authenticated requests with automatic error handling.

### 4. User Stories
- As a user, I can submit markdown text and receive a file URL to a formatted Word document.

### 5. Functions Summary
- `PandocApi.generate(markdownText, templateName, materialName, type, lectureNumber)`: POSTs to `/api/pandoc/generate` with the payload, returns `{ fileUrl }`.

### 6. Integration
Calls the backend Pandoc endpoint (`POST /api/pandoc/generate`). Depends on `HttpClient.js` for JWT auth and error handling.

### 7. Imports Summary
- **Internal:** `httpPost` from `./HttpClient`

### 8. Additional Info
JSON payload matches the backend `GenerateDocxRequest` DTO. `type` maps to the lecture type field expected by the backend.

### 9. API
**POST** `/api/pandoc/generate` — body: `{ markdownText, templateName, materialName, type, lectureNumber }` → response: `{ fileUrl: string }`

## 1. File Name and Directory
`Frontend/src/api/MergeApi.js`

### 2. File Type
Frontend — API service module

### 3. What the file does
Provides a `MergeApi` object with an `execute` method that uploads multiple DOCX files and merges them into one document via the backend Merge endpoint. Sends `multipart/form-data` via `HttpClient`.

### 4. User Stories
- As a user, I can upload multiple DOCX files and get back a download URL for the merged document.

### 5. Functions Summary
- `MergeApi.execute(files, materialName, lectureType)`: Builds a `FormData` with the file list and metadata, POSTs to `/api/merge/execute`, returns `{ url, finalFileName }`.

### 6. Integration
Calls the backend Merge endpoint (`POST /api/merge/execute`). Depends on `HttpClient.js` for JWT auth and error handling.

### 7. Imports Summary
- **Internal:** `httpPost` from `./HttpClient`

### 8. Additional Info
FormData is built without explicit `Content-Type` headers — the browser sets the multipart boundary automatically. Files are appended under the `files` field name expected by the backend.

### 9. API
**POST** `/api/merge/execute` — body: `FormData` with `files[]` (FileList), `materialName` (string), `lectureType` (string) → response: `{ url: string, finalFileName: string }`

## 1. File Name and Directory
`Frontend/src/api/AdminApi.js`

### 2. File Type
Frontend — Admin API service module

### 3. What the file does
Provides a namespaced interface (`admin.*`) for all admin-related REST API calls using `HttpClient`. Groups endpoints by domain: `users`, `materials`, `permissions`, `prompts`, and `workflows`.

### 4. User Stories
- As an admin, I can CRUD users via `admin.users.*`.
- As an admin, I can CRUD materials via `admin.materials.*`.
- As an admin, I can list, create, and delete permissions via `admin.permissions.*`.
- As an admin, I can list and update prompt text via `admin.prompts.*`.
- As an admin, I can list and toggle workflow active state via `admin.workflows.*`.

### 5. Functions Summary
- `admin.users.fetch()`: GET `/api/admin/users`
- `admin.users.create(data)`: POST `/api/admin/users`
- `admin.users.update(id, data)`: PUT `/api/admin/users/{id}`
- `admin.users.delete(id)`: DELETE `/api/admin/users/{id}`
- `admin.materials.fetch()`: GET `/api/admin/materials`
- `admin.materials.create(data)`: POST `/api/admin/materials`
- `admin.materials.update(id, data)`: PUT `/api/admin/materials/{id}`
- `admin.materials.delete(id)`: DELETE `/api/admin/materials/{id}`
- `admin.permissions.fetch()`: GET `/api/admin/permissions`
- `admin.permissions.create(data)`: POST `/api/admin/permissions`
- `admin.permissions.delete(id)`: DELETE `/api/admin/permissions/{id}`
- `admin.prompts.fetch()`: GET `/api/admin/prompts`
- `admin.prompts.updateText(id, promptText)`: PUT `/api/admin/prompts/{id}`
- `admin.workflows.fetch()`: GET `/api/admin/workflows`
- `admin.workflows.toggleActive(id, isActive)`: PUT `/api/admin/workflows/{id}/toggle`

### 6. Integration
Calls the backend REST API at `/api/admin/*` endpoints through the `HttpClient` module which handles JWT auth, error/rate-limit handling, and response parsing.

### 7. Imports Summary
- **Internal:** `httpGet`, `httpPost`, `httpPut`, `httpDelete` from `./HttpClient`

### 8. Additional Info
All functions delegate error handling to `HttpClient` — they return parsed JSON on success or throw `ApiError`/`RateLimitError` on failure. The `admin` object is also the default export.

### 9. API
| Namespace | Endpoint | Method | Body |
|---|---|---|---|
| users.fetch | `/api/admin/users` | GET | — |
| users.create | `/api/admin/users` | POST | user data |
| users.update | `/api/admin/users/{id}` | PUT | user data |
| users.delete | `/api/admin/users/{id}` | DELETE | — |
| materials.fetch | `/api/admin/materials` | GET | — |
| materials.create | `/api/admin/materials` | POST | material data |
| materials.update | `/api/admin/materials/{id}` | PUT | material data |
| materials.delete | `/api/admin/materials/{id}` | DELETE | — |
| permissions.fetch | `/api/admin/permissions` | GET | — |
| permissions.create | `/api/admin/permissions` | POST | permission data |
| permissions.delete | `/api/admin/permissions/{id}` | DELETE | — |
| prompts.fetch | `/api/admin/prompts` | GET | — |
| prompts.updateText | `/api/admin/prompts/{id}` | PUT | `{ promptText }` |
| workflows.fetch | `/api/admin/workflows` | GET | — |
| workflows.toggleActive | `/api/admin/workflows/{id}/toggle` | PUT | `{ isActive }` |

## 1. File Name and Directory
`Frontend/src/hooks/useSessions.js`

### 2. File Type
Frontend — Custom React hook

### 3. What the file does
Provides a reusable hook for paginated session lifecycle management. Auto-fetches the first page on mount, supports "load more" pagination, and wraps all SessionsApi calls with ToastContext notifications.

### 4. User Stories
- As a developer, I call `useSessions()` and get `{ sessions, totalCount, page, hasMore, isLoading, error }` for a paginated session list.
- As a developer, I call `loadMore()` to append the next page of sessions.
- As a developer, I call `createSession(data)`, `getSession(id)`, `saveContent(sessionId, body)`, or `uploadFiles(sessionId, files, notes)` and get toast feedback on success/error.

### 5. Functions Summary
- `useSessions({ initialPage, limit })`: Hook — accepts optional `initialPage` (default 1) and `limit` (default 10). Returns state and action methods.
- `loadMore()`: Increments page and appends results if `hasMore` is true and not already loading.
- `createSession(data)`: Calls `SessionsApi.createSession`, shows success/error toast, returns created session.
- `getSession(id)`: Calls `SessionsApi.getSession`, shows error toast on failure, returns session.
- `saveContent(sessionId, body)`: Calls `SessionsApi.saveSessionContent`, shows success/error toast, returns result.
- `uploadFiles(sessionId, files, notes)`: Calls `SessionsApi.uploadFiles`, shows success/error toast, returns result.

### 6. Integration
Calls `SessionsApi` (which uses `HttpClient` for JWT auth, error/rate-limit handling). Uses `ToastContext` for user-facing success/error notifications.

### 7. Imports Summary
- **External:** `react` (useState, useEffect, useCallback)
- **Internal:** `SessionsApi` functions from `../api/SessionsApi`, `useToast` from `../contexts/ToastContext`

### 8. Additional Info
- Load errors are set in `error` state for programmatic handling; no toast is shown for list load failures to avoid spamming the user.
- Mutation methods (`createSession`, `saveContent`, `uploadFiles`) show toasts and re-throw so callers can chain `.catch()` if needed.
- `loadMore` is a no-op guard (ignores call if already loading or `hasMore` is false).

### 9. API
- **Internal:** Delegates all HTTP to `SessionsApi` (SessionsApi.js). See SessionsApi.md for endpoint details.
- **Toast:** Calls `showToast(message, type)` from `ToastContext` — `type` is `'success'` on success, `'error'` on failure.

## 1. File Name and Directory
`Frontend/src/hooks/useWizard.js`

### 2. File Type
Frontend — Custom React hook

### 3. What the file does
Provides a generic multi-step wizard state manager. Manages `currentStep` navigation (`next`, `prev`, `goTo`), `sessionId` (auto-set from createSession API response), and `wizardData` for arbitrary workflow data. Integrates with `useSessions` for session create/save and uses `ToastContext` for error handling.

### 4. User Stories
- As a developer, I call `useWizard({ totalSteps: 3 })` and get `{ currentStep, next, prev, goTo, sessionId, wizardData, setWizardData }` to manage wizard state.
- As a developer, I call `createSession(data)` which creates a backend session and auto-stores the returned `sessionId`.
- As a developer, I call `saveContent(body)` to persist wizard data against the current session.

### 5. Functions Summary
- `useWizard({ totalSteps })`: Hook — accepts `totalSteps` (default 1). Returns wizard state and actions.
- `next()`: Advances to the next step, clamped to `totalSteps - 1`.
- `prev()`: Goes back one step, clamped to 0.
- `goTo(step)`: Jumps to a specific step index (validated against bounds).
- `createSession(data)`: Wraps `useSessions.createSession`, stores the returned session ID, shows error toast on failure.
- `saveContent(body)`: Wraps `useSessions.saveContent` for the current session; shows error toast if no session exists or on API failure.
- `setSessionId(id)`: Allows external restoration of a session ID (e.g., from URL params).
- `setWizardData(data)`: Replaces the entire wizard data object.

### 6. Integration
Uses `useSessions` (which delegates to `SessionsApi` / `HttpClient` for REST calls). Uses `ToastContext` via both `useSessions` and direct `showToast` calls for error handling.

### 7. Imports Summary
- **External:** `react` (useState, useCallback)
- **Internal:** `useSessions` from `./useSessions`, `useToast` from `../contexts/ToastContext`

### 8. Additional Info
- Step navigation is bounded: `next` stops at `totalSteps - 1`, `prev` stops at 0, `goTo` silently ignores out-of-range steps.
- `sessionId` is automatically set from `session.id ?? session.sessionId` after a successful `createSession` call.
- `saveContent` silently returns `undefined` if no `sessionId` is set and shows an error toast.

### 9. API
No direct API calls. Delegates all HTTP to `useSessions` → `SessionsApi` (`SessionsApi.js`). See SessionsApi.md for endpoint details.