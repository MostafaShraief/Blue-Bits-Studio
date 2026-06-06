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
Sets up the top-level app shell with provider order: ToastProvider > AuthProvider > BrowserRouter > TourProvider; lazy-loads all page components; defines nested Routes with cascade guards (ProtectedRoute → Layout → optional ProtectedRoute per workflow; AdminRoute for admin pages; AuthOnlyRoute for 404). Renders the global `<Toast />` component outside Suspense so it is always mounted.

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
A controlled autocomplete input for selecting a material from a server-fetched list. As the user types, it filters suggestions, shows success/error inline icons, and validates the selection against the known list. Exposes validity changes to the parent via `onValidChange` callback. Validation state (error messages, icons, border colors) only displays after user interaction (`isTouched`) or when a valid value is matched, never proactively on mount.

### 4. User Stories
- As a user filling a form, I type a material name and see matching suggestions filtered in real time.
- As a form designer, I use `onValidChange` to know whether the selected material is valid without extra logic.
- As a user, I never see validation errors on the material field before I have interacted with it (fixed proactive validation timing).

### 5. Functions Summary
- `MaterialAutocomplete({ value, onChange, label, required, onValidChange })`: Main component — renders label, input with validation icons, dropdown list, and error messages. Manages open/close state, click-outside dismissal, and material fetching on mount. Validation errors are gated on `isTouched` (interaction state). `onValidChange` is only reported after interaction or when the value is valid, preventing premature parent-state updates.

### 6. Integration
Calls `getDistinctNames()` from `MaterialsApi` on mount — this hits `GET /api/materials` (with client-side caching). No database or external service calls.

### 7. Imports Summary
- **External:** `react` (useState, useEffect, useRef, useMemo, useCallback)
- **Internal:** `getDistinctNames` from `../../api/MaterialsApi`

### 8. Additional Info
Arabic-first: label defaults to `"اسم المادة"`, placeholder is `"اكتب أو اختر اسم المادة..."`, error message is Arabic. Uses logical Tailwind properties (`end-3`). Validation is done client-side by comparing the input value against the fetched materials list (case-insensitive). API failure during fetch is silently caught (sets empty array) — the user sees no dropdown on network/backend error rather than a broken component. Validation timing: errors (red border, X icon, error text) only show after blur or typing (`isTouched`), not on focus alone. The `onValidChange` callback is not called on mount to avoid prematurely disabling the parent's proceed button.

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
Compression failures fall back to the original file. The `maxImages` prop defaults to `Infinity`. The UI is Arabic-first (placeholder text, positioning). Responsive layout: image cards use `flex-col sm:flex-row` (stacked on mobile, row on desktop), thumbnails are `w-full sm:w-28`, drop zone uses `py-6 sm:py-8`.

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
Uses Tailwind v4 semantic tokens (`bg-surface-card`, `border-border`). Empty lines render as `\u00A0` (non-breaking space) to preserve height. Responsive scroll: `max-h-[60dvh] sm:max-h-[500px]` (60% viewport on mobile, capped at 500px on desktop).

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
Calls backend API via `getDistinctNames()` from `../api/MaterialsApi` → `GET /api/materials` (cached)

### 7. Imports Summary
- **External**: `react` (useState, useEffect, useRef), `react-dom` (createPortal), `lucide-react` (Moon, Sun, Save, LogOut, X, XCircle, ChevronDown)
- **Internal**: `getDistinctNames` from `../api/MaterialsApi`

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
Renders a floating tooltip/overlay card during an interactive app tour. Highlights the target element with a Tailwind ring, positions the card dynamically (below by default, above if viewport space is insufficient). Uses `createPortal` at `document.body`. Fully RTL-aware: replaces physical `left`/`right` with logical `insetInlineStart` and checks `document.dir === 'rtl'`.

### 4. User Stories
- As a new user, I follow a guided step-by-step tour that highlights UI elements and explains what they do.
- As a user, I navigate through tour steps, skip the tour, or finish it early.

### 5. Functions Summary
- `TourOverlay`: Main component — reads tour state from `TourContext`, queries DOM for the target via CSS selector, computes bounding rect for absolute positioning, renders card with title, content, nav buttons, step counter, and a directional arrow.
- `isRTL()`: Returns `document.documentElement.dir === 'rtl'` for conditional styling.
- `measureCard()`: Measures the overlay card's actual height via `cardRef.offsetHeight` inside `requestAnimationFrame` to decide above/below placement (replaces hardcoded 200px).

### 6. Integration
No backend calls. Purely client-side: uses DOM API (`querySelector`, `getBoundingClientRect`, `scrollIntoView`, classList) and the `TourContext` state machine.

### 7. Imports Summary
- **External:** `react` (useEffect, useState, useRef, useCallback), `lucide-react` (X, ArrowRight, ArrowLeft), `react-dom` (createPortal)
- **Internal:** `../contexts/TourContext` (useTour — provides isActive, currentStep, stopTour, nextStep, prevStep, currentStepIndex, totalSteps)

### 8. Additional Info
- RTL positioning: overlay uses `right`/`left` based on `document.dir` (not hardcoded); arrow uses `insetInlineStart` for RTL layout.
- Above/below: `isAbove` state computed from actual card height (`cardRef.offsetHeight`) vs `spaceBelow`/`spaceAbove`. Fallback to bottom-center (no target) when selector element is not found.
- Highlight ring: `ring-4 ring-primary ring-offset-2 ring-offset-surface transition-shadow` classes added/removed from target element on mount/unmount. Cleanup runs when `isActive`/`currentStep` changes or component unmounts.
- Supports window resize and scroll events.
- Arabic-first (RTL layout, Arabic button labels).

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
Manages authentication state — login, logout, session auto-restore via `AuthApi.getCurrentUser()` on mount, and workflow-level RBAC authorization checks. Uses `AuthApi` (which wraps HttpClient) for all backend communication and `useToast()` for error display.

### 4. User Stories
- As a user, I can log in with my username/password and have my session persisted across page reloads via auto-restore.
- As an admin, I automatically bypass all workflow permission checks and see all tools.

### 5. Functions Summary
- `mapUser(data)`: Maps `LoginResponse` (backend shape with `authorizedWorkflows`) to frontend `User` shape (`allowedWorkflows`).
- `AuthProvider`: Context provider wrapping children with auth state (`user`, `login`, `logout`, `loading`, `hasWorkflowAccess`)
- `login(username, password)`: Calls `AuthApi.login()` to POST credentials, stores JWT + mapped user profile in localStorage. Shows error toast on failure via `useToast()`.
- `logout()`: Clears user state and localStorage
- `hasWorkflowAccess(systemCode)`: Returns `true` if user is Admin or their `allowedWorkflows` includes the given SystemCode
- `useAuth()`: Hook to consume `AuthContext`

### 6. Integration
Calls backend via `AuthApi` (`HttpClient`): `POST /api/auth/login` and `GET /api/auth/me`. Uses `useToast()` from ToastContext for error toasts.

### 7. Imports Summary
- **External:** React hooks (`createContext`, `useState`, `useEffect`, `useCallback`, `useContext`)
- **Internal:** `login, getCurrentUser` from `../api/AuthApi`; `useToast` from `./ToastContext`

### 8. Additional Info
- Session is persisted in localStorage under keys `bluebits_user` and `token`.
- On mount, no hydration from localStorage — calls `getCurrentUser()` directly to verify token and fetch fresh profile.
- `loading` stays `true` until `getCurrentUser()` resolves (or token is absent) to prevent UI flicker.
- ToastProvider wraps AuthProvider in the component tree, so `useToast()` (Context API hook) is used directly for toast display instead of the legacy `showToastGlobal` (CustomEvent).

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
- `setNativeInputValue(el, value)`: Sets input value via `Object.getOwnPropertyDescriptor` + `input()` event for React-controlled inputs.
- `findButtonByText(text)`: Finds a `<button>` by its text content (trimmed match) for auto-clicking toggle buttons.

### 6. Integration
No backend/database calls. Integrates with React Router (`useNavigate`, `useLocation`) for step navigation and `AuthContext` (`hasWorkflowAccess`) for permission gating.

### 7. Imports Summary
- `react`: `createContext`, `useContext`, `useState`, `useEffect`
- `react-router`: `useLocation`, `useNavigate`
- `./AuthContext`: `useAuth`

### 8. Additional Info
- `TOUR_DATA` object defines steps per workflow with Arabic titles/content and optional `autoFill` functions that simulate user input via native value setters
- Auto-fill fixes: lecture number uses `input[placeholder*="مثال: 5"]` (matches actual UI); bank metadata mentions `اسم المادة ورقم المحاضرة` (no bank name input exists); pandoc metadata uses `input[placeholder*="اسم المادة"]`
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
Admin CRUD interface for managing academic materials (subjects). Displays a sortable/filterable table of materials with a modal form for creating/editing, and delete with confirmation. Uses `useAdminMaterials` hook for all API calls, state management, toast notifications, and validation error handling.

### 4. User Stories
- As an admin, I can view all materials, filter by academic year, and sort by name or year.
- As an admin, I can add, edit, or delete a material with a name and academic year.
- As an admin, I see per-field validation errors inline in the modal form when the backend rejects invalid input.
- As an admin, I see toast notifications for success, errors, and rate-limiting (429).

### 5. Functions Summary
- `handleSubmit()`: Calls `create()` or `update()` from `useAdminMaterials` hook, closes modal on success.
- `handleEdit(material)`: Pre-fills modal form with material data for editing, clears validation errors.
- `handleDelete(id)`: Confirms then calls `remove()` from the hook.
- `resetForm()`: Clears form state and resets editing ID.
- `openCreateModal()`: Clears validation errors, resets form, opens modal for new material.
- `closeModal()`: Closes modal with a brief closing animation.
- `getYearLabel(year)`: Maps year number to Arabic label.
- `getYearBadge(year)`: Renders a colored badge for the academic year.
- `formatDate(date)`: Formats a date string using Arabic locale.
- `handleSort(key)`: Cycles sort state (asc → desc → none).
- `getSortIcon(key)`: Returns the appropriate sort arrow icon.
- `resetFilters()`: Clears year filter and sort config.

### 6. Integration
Calls backend REST API via `useAdminMaterials` hook → `AdminApi.materials.*` → `HttpClient` (JWT auth, rate-limit/error interception).

### 7. Imports Summary
- **External:** `react` (useState, useEffect, useMemo), `lucide-react` (BookOpen, Plus, Pencil, Trash2, Loader2, AlertCircle, X, Sparkles, Calendar, ArrowUpDown, ArrowUp, ArrowDown, Filter, GraduationCap)
- **Internal:** `../../hooks/useAdminMaterials` (useAdminMaterials hook)

### 8. Additional Info
Arabic RTL UI with dark mode support, animated modal (fade/scale in/out), loading spinner, error alerts, per-field validation errors, empty-state sparkles illustration, submit button loading state via `isSaving` from hook. 429 rate-limit errors show an Arabic toast via `HttpClient` interception.

### 9. API
Delegates to `useAdminMaterials` hook → `AdminApi.materials.*` (AdminApi.js) → `HttpClient`. Endpoints: GET/POST/PUT/DELETE `/api/admin/materials`. Per-field validation errors (400) displayed inline. 429 errors shown as toasts.

## 1. File Name and Directory
Frontend/src/pages/admin/SystemConfig.jsx

### 2. File Type
Frontend (React admin page component)

### 3. What the file does
Admin configuration panel with four management areas: toggle workflow activation, edit AI prompts per workflow, manage role-based permissions (add/remove roles) per workflow, and upload DOTX templates for نظري/عملي lecture types.

### 4. User Stories
- As an admin, I can activate/deactivate any workflow server
- As an admin, I can edit the system prompt text for any workflow
- As an admin, I can assign or remove roles (TechMember / ScientificMember) per workflow
- As an admin, I can upload DOTX templates for نظري and عملي lecture types with client-side validation (.dotx only, max 10 MB)

### 5. Functions Summary
- `useAdminWorkflows()`, `useAdminPrompts()`, `useAdminPermissions()`: Hooks providing items, loading/error states, validation errors, and CRUD methods (list, toggleActive, updateText, create, delete)
- `handleToggleWorkflow`: Calls `workflows.toggleActive()`, then refreshes via `workflows.list()` for UI sync
- `handleSavePrompt(id)`: Calls `prompts.updateText(id, promptText)`, collapses the editor on success; hook shows toast
- `handleAddPermission()`: Calls `permissions.create()`, refreshes list on success; captures 400 validation errors into `permFieldErrors` for inline display
- `handleDeletePermission(id)`: Confirms then calls `permissions.delete(id)`, refreshes list
- `closePermissionModal()`: Closes modal with fade-out animation, clears field errors
- `getFieldError(field)`: Looks up case-insensitive error for a field from `permFieldErrors`
- `formatDate(dateStr)`: Formats ISO date string to Arabic locale (ar-EG) with date and time
- `handleTemplateUpload(name, e)`: Validates file (.dotx, ≤ 10 MB), uploads via `admin.templates.upload()`, refreshes list on success, shows toast on success/error
- `fetchTemplates`: Calls `admin.templates.fetch()` to load template metadata on mount

### 6. Integration
Delegates API calls to hooks (`useAdminWorkflows`, `useAdminPrompts`, `useAdminPermissions`), which use `AdminApi` → `HttpClient` for JWT auth, rate-limit handling (429 toast), and error interception. Templates tab calls `admin.templates.*` directly from `AdminApi`.

### 7. Imports Summary
- `useState`, `useEffect`, `useMemo`, `useCallback` (React)
- `useAdminWorkflows`, `useAdminPrompts`, `useAdminPermissions` (`../../hooks/`)
- `admin` from `../../api/AdminApi`
- `useToast` from `../../contexts/ToastContext`
- `ApiError` from `../../api/HttpClient`
- `lucide-react` icons: Settings2, Power, PowerOff, Loader2, AlertCircle, X, Plus, Trash2, FileText, ChevronDown, ChevronUp, Save, Shield, Sparkles, FlaskConical, Crown, Scroll, Server, UserCog, Upload, Calendar

### 8. Additional Info
Arabic-first UI (`dir="rtl"`). Includes modal with fade/scale animations for adding permissions. Prompts tab uses an accordion expand/collapse pattern. Inline validation errors shown under the role select in permission modal and under the prompt textarea (via hook `validationErrors`). 429 rate-limit toasts handled automatically by HttpClient. Templates tab displays two cards (نظري/عملي) with current file info and upload button; per-card loading state during upload; client-side validation rejects non-.dotx files and files over 10 MB.

### 9. API
No direct API calls. Data flows through hooks:
- `useAdminWorkflows.list()` → GET `/api/admin/workflows` (via AdminApi)
- `useAdminWorkflows.toggleActive(id, isActive)` → PUT `/api/admin/workflows/{id}/toggle`
- `useAdminPrompts.list()` → GET `/api/admin/prompts`
- `useAdminPrompts.updateText(id, promptText)` → PUT `/api/admin/prompts/{id}`
- `useAdminPermissions.list()` → GET `/api/admin/permissions`
- `useAdminPermissions.create(data)` → POST `/api/admin/permissions`
- `useAdminPermissions.delete(id)` → DELETE `/api/admin/permissions/{id}`
- `admin.templates.fetch()` → GET `/api/admin/templates`
- `admin.templates.upload(name, file)` → PUT `/api/admin/templates/{name}` with FormData

## 1. File Name and Directory
`Frontend/src/pages/admin/UsersManager.jsx`

### 2. File Type
Frontend (React component)

### 3. What the file does
Admin CRUD page for managing users. Uses `useAdminUsers` hook for all data fetching and mutation. Displays a sortable/filterable table of users with role badges, batch info, Telegram copy, and dates. Provides a modal form for creating/editing users with client-side input guards and server-side per-field validation errors. Delete confirmation modal instead of `window.confirm()`. 429 rate-limit errors surface via toast (handled by HttpClient → hook's error handler).

### 4. User Stories
- As an Admin, I can view all users in a table, filter by role/batch, and sort by name, role, batch, or dates.
- As an Admin, I can create, edit, or delete users via a modal form with inline field-level validation errors from the backend.
- As an Admin, I get a clear Arabic toast when rate-limited (429).

### 5. Functions Summary
- `useAdminUsers()`: Hook providing users, form state, modal state, CRUD actions, and validation errors.
- `handleFormSubmit`: Validates inputs (username/password format/length), builds API payload, delegates to `hookHandleSubmit()`. Always sends `password` in create mode (so FluentValidation catches empty password). Only sends `password` in edit mode when non-empty. On 400 errors, hook sets `validationErrors` for per-field display.
- `openEditModal(user)` / `openCreateModal()`: Hook methods to open modal in edit/create mode. Cancels any pending close animation timeout to prevent race conditions.
- `closeModal()`: Hook method with 200ms closing animation; uses `closeTimeoutRef` for safe cancellation.
- `handleDelete(id)`: Sets `deleteConfirmId` to show confirm dialog; `confirmDelete`/`cancelDelete` complete the flow.
- `handleUsernameInput` / `handlePasswordInput`: Real-time input guards (English alphanumeric + allowed symbols only) via `onBeforeInput`.
- `getRoleBadge`: Renders colored role badge with icon.
- `formatDate`: Formats dates to Arabic locale.
- `handleCopyTelegram`: Copies Telegram username to clipboard.
- `handleSort` / `getSortIcon`: Cycles sort state (asc → desc → none).
- `resetFilters`: Clears all filter and sort settings.

### 6. Integration
Delegates all HTTP to `useAdminUsers` hook → `AdminApi` (HttpClient). HttpClient handles 429 (RateLimitError with toast via hook's catch), 400 (validation errors mapped to fields), and 401 (auto-logout redirect). The old `utils/api` functions are no longer used.

### 7. Imports Summary
- React hooks: `useState`, `useMemo`
- Internal: `useAdminUsers` from `../../hooks/useAdminUsers`
- External: `lucide-react` icons (Users, Pencil, Trash2, Loader2, etc.)

### 8. Additional Info
- Arabic-first RTL UI.
- Protected `userId === 1` from deletion.
- Uses `onBeforeInput` for clean keyboard validation without blocking Ctrl combinations.
- Client-side validation errors show under fields with auto-dismiss (2.5s); server-side `validationErrors` persist until modal closes.
- Delete uses a modal confirmation dialog instead of `window.confirm()`.
- 429 rate-limit toasts are auto-handled by HttpClient → hook's error handler (`showToast(err.message, 'error')`).
- Modal race condition prevented: `closeTimeoutRef` cancels pending close timeout when re-opening modal during animation.

### 9. API
All API calls go through `AdminApi` (HttpClient):
- `GET /api/admin/users` → returns array of user objects
- `POST /api/admin/users` → creates user; body: `{ firstName, lastName, username, password, userRole, batchNumber, telegramUsername?, teamJoinDate? }`
- `PUT /api/admin/users/{id}` → updates user; body: same as create without `username`
- `DELETE /api/admin/users/{id}` → deletes user
- 400 responses with `errors` map → `validationErrors` state for per-field inline display.
- 429 responses → `RateLimitError` thrown by HttpClient, caught by hook's `handleSubmit` → error toast.

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
A 3-step wizard (`إعداد الجلسة`, `النص`, `المعاينة والنسخ`) for coordinating lecture/question-bank formatting. Users select a workflow type, enter session metadata (step 0), paste reviewed Markdown text (step 1), then compile and preview/copy the prompt (step 2). Uses `useWizard({ totalSteps: 3 })` for step management and session lifecycle. Follows the same 3-step pattern as ExtractionWizard.

### 4. User Stories
- As a coordinator, I want to select a material, lecture number, and type (Theoretical/Practical), so the system knows the context.
- As a coordinator, I want to paste reviewed Markdown and compile a prompt, so I can send it to Google AI Studio for formatting.
- As a coordinator, I want to save my session or copy the prompt, so I can resume later or use it immediately.
- As a coordinator, I want to see per-field validation errors under inputs when the backend rejects my session data.
- As a coordinator, I want a toast notification when I hit a rate limit (429) instead of a confusing error.

### 5. Functions Summary
- `goNext`: Unified step-advance handler. Step 0→1 validates metadata fields only. Step 1→2 creates a session via `createSession`, compiles the prompt (auto-save path: fetch compiled from DB; else stateless via `compilePrompt`), then advances. Catches 400 with `err.errors` and sets `fieldErrors` for inline display. Catches `RateLimitError` and shows warning toast.
- `goBack`: Calls `prev()` to go back one step.
- `handleCopy`: Copies prompt text to clipboard with a fallback using `document.execCommand`.
- `handleSave`: Refetches session via `getSession` to mark as saved, shows success toast.
- `clearFieldError`: Removes a specific field error on input change (avoids stale validation markup).
- `fieldInputClass`: Returns Tailwind class string with `border-danger` styling when the field has an error.

### 6. Integration
Calls REST APIs via `SessionsApi.getSession` (GET) and `PromptsApi.compilePrompt` (POST) through HttpClient. Uses `useWizard` hook's `createSession` (which delegates to `useSessions` → `SessionsApi`) for session creation (POST).

### 7. Imports Summary
- **External:** `react` (useState, useCallback, useEffect, useContext), `react-router` (useSearchParams, useNavigate), `lucide-react` (Copy icon).
- **Internal:** `WizardStepper`, `PromptPreview`, `MaterialAutocomplete`, `useWizard`, `useToast`, `AuthContext`, `useSettings`, `SessionsApi.getSession`, `PromptsApi.compilePrompt`, `HttpClient.RateLimitError`.

### 8. Additional Info
- Arabic-first UI with RTL support.
- RBAC enforced: redirects to `/unauthorized` if user lacks both `LEC_COORD` and `BANK_COORD` workflows.
- Admins bypass workflow permission checks and see both toggle options.
- Coordination type (محاضرة / بنك أسئلة) starts unselected — user must explicitly pick one. URL param `?type=lecture` or `?type=bank` still pre-selects.
- **3 steps:** Step 0 = session metadata, Step 1 = Markdown input, Step 2 = prompt preview + copy + save.
- Wizard methods destructured from `useWizard`: `{ currentStep, next, prev, goTo, sessionId, setSessionId, createSession }`.
- Session restore via `?id=` and `?type=bank|lecture` jumps to step 2 (`goTo(2)`) with saved prompt and markdown.
- `goNext` branches on `currentStep` — step 0→1 validates fields (no API), step 1→2 creates session + compiles prompt.
- 429 errors trigger warning toast via `RateLimitError` from HttpClient.
- `fieldInputClass` utility provides consistent input styling with error-state red border.
- FluentValidation field errors from 400 responses are rendered as red text under each input (field names lowercased for matching).

### 9. API
- **`createSession` (POST /api/sessions):** Sends `{ materialName, lectureNumber, lectureType, workflowSystemCode, generalNotes }`. Returns `{ sessionId, id }`.
- **SessionsApi.getSession (GET /api/sessions/{id}):** Returns `{ compiledPrompt, notes, material: { materialName }, lectureNumber, lectureType, workflow: { systemCode } }`.
- **PromptsApi.compilePrompt (POST /api/prompts/compile):** Sends `{ systemCode, GeneralNotes, FileNotes }`. Returns `{ compiledPrompt }`.

## 1. File Name and Directory
Frontend/src/pages/Dashboard.jsx

### 2. File Type
Frontend — Main dashboard page component

### 3. What the file does
Renders the app's landing page after login: shows a welcome tour banner, dynamic stat cards built from `authorizedWorkflows` array (via config lookup), dynamically generated quick-action buttons from `authorizedWorkflows`, admin management links for Admin users, and the 5 most recent user sessions with RBAC filtering.

### 4. User Stories
- As a user, I see aggregate stats and quick-action links dynamically rendered based only on my `authorizedWorkflows` from AuthContext.
- As a user, I can click a recent session to resume where I left off.
- As an Admin user, I see management links (users, materials, system) on the dashboard instead of workflow quick actions.

### 5. Functions Summary
- `getSessionRoute`: Maps backend `workflowType` SystemCode (e.g. `LEC_EXT`, `MERGE`) to a frontend route with session ID.
- `Dashboard`: Main component — fetches stats & recent sessions, filters by RBAC via `hasWorkflowAccess`, builds stat cards and quick actions dynamically from `user.allowedWorkflows` (mapped from backend `authorizedWorkflows`).

### 6. Integration
Calls backend via a single `getSessions(1, 1000)` from `../api/SessionsApi` — the response is split client-side: the full array computes stat counts, and the first 5 elements are used for recent sessions (eliminating a redundant second API call). Uses `useAuth()` context for RBAC checks and user role detection. Stat cards and quick actions are derived from `user.allowedWorkflows` (the frontend mapping of `authorizedWorkflows`).

### 7. Imports Summary
- **External:** `react` (useState, useEffect), `react-router` (Link), `lucide-react` (12 icons: FileSearch, AlignRight, FileOutput, Palette, BookOpen, FlaskConical, Sparkles, Clock, ArrowLeft, Users, Settings2, FileJson, Layers)
- **Internal:** `getSessions` from `../api/SessionsApi`, `../contexts/AuthContext` (useAuth)

### 8. Additional Info
Arabic-first UI with RTL layout. Admin users are no longer redirected — they see admin management links on the dashboard. Quick actions (`WORKFLOW_CONFIG`) and stat cards (`STAT_CARD_CONFIG`) are generated by mapping `authorizedWorkflows` SystemCodes through lookup objects. Unknown SystemCodes are silently filtered out. Tour banner is conditionally rendered only if user has access to any of `LEC_EXT`, `BANK_EXT`, or `DRAW`. `getSessionRoute` maps SystemCode to route with MERGE support.

### 9. API
- **GET single call:** `getSessions(1, 1000)` → `{ sessions: [...] }` — returns up to 1000 sessions. The full list is used for stat counting; the first 5 are sliced client-side for the "recent sessions" section and filtered by RBAC.

## 1. File Name and Directory
`Frontend/src/pages/DrawWizard.jsx`

### 2. File Type
Frontend

### 3. What the file does
A 2-step wizard (`البرومبت` → `النتيجة`) for creating AI prompts that generate Python drawing code. Combines session metadata + image upload + description into one unified input step, then previews/copies the compiled prompt. Uses `useWizard` hook for step/session management, `SessionsApi` for CRUD, `PromptsApi.compilePrompt` for stateless compilation.

### 4. User Stories
- As a user, I can create a drawing session by selecting a material, lecture number, lecture type, uploading reference images, and writing a description — all in one step.
- As a user, I can preview the compiled prompt and copy it to Google AI Studio.
- As a user, I see inline Arabic validation errors under form fields when the backend rejects data.
- As a user, I see a warning toast when rate-limited (429).

### 5. Functions Summary
- `DrawWizard()`: Main component rendering the 2-step wizard flow.
- `addImage(file)`: Adds an image (max 3) to the images state.
- `removeImage(index)`: Removes an image by index and revokes its object URL.
- `updateImageNote(index, text)`: Updates the note for an image at given index.
- `handleNext()`: Validates all fields, creates a session via `SessionsApi.createSession`, uploads files via `SessionsApi.uploadFiles`, compiles prompt (auto-save: fetch from DB; otherwise via `PromptsApi.compilePrompt`), then advances to step 1.
- `handleSave()`: Re-fetches session to confirm persistence, sets saved state.
- `clearFieldError(field)`: Clears a single field validation error on input change.

### 6. Integration
Calls backend REST APIs via `SessionsApi.createSession`, `SessionsApi.getSession`, `SessionsApi.uploadFiles` (multipart), and `PromptsApi.compilePrompt`. Each uses `HttpClient` which handles JWT auth, 401 logout, 429 rate-limit, and 400 validation errors.

### 7. Imports Summary
- **External:** `react-router` (useSearchParams), `react` (useState, useEffect, useCallback)
- **Internal components:** WizardStepper, PromptPreview, GuidedCopyLoop, ImageUploader, PasteButton, PasteImageButton, MaterialAutocomplete
- **New API modules:** `useWizard` hook (returns `currentStep`, `next`, `prev`, `goTo`, `sessionId`, `setSessionId`), `getSession`/`createSession`/`uploadFiles` from `SessionsApi`, `compilePrompt` from `PromptsApi`
- **Contexts:** `useSettings` from `SettingsContext`, `useToast` from `ToastContext`
- **Errors:** `ApiError`, `RateLimitError` from `HttpClient`

### 8. Additional Info
- Arabic-first RTL UI with Tailwind CSS v4.
- Global paste listener on step 0 to capture image pastes outside text inputs.
- Max 3 images with a quality warning if more than 1 is added.
- Supports both auto-save (persisted session) and stateless prompt compilation.
- 429 errors show a warning toast with Arabic retry-after message (vs generic error toast).
- FluentValidation field errors from 400 responses are normalized to lowercase keys and displayed under each input with red border styling, matching the Login.jsx pattern.

### 9. API
- `SessionsApi.getSession(id)` → GET `/api/sessions/{id}` — returns session data with `compiledPrompt`, `notes[]`, `files[]`.
- `SessionsApi.createSession({ materialName, lectureNumber, lectureType, workflowSystemCode: 'DRAW', generalNotes })` → POST `/api/sessions` — returns `{ id, sessionId }`.
- `SessionsApi.uploadFiles(sessionId, files[], notes[])` → POST `/api/sessions/{id}/files` — multipart upload of image files with per-file notes.
- `PromptsApi.compilePrompt('DRAW', generalNotes, fileNotes[])` → POST `/api/prompts/compile` — returns `{ compiledPrompt }`.

## 1. File Name and Directory
`Frontend/src/pages/ExtractionWizard.jsx`

### 2. File Type
Frontend (React page component)

### 3. What the file does
Refactored 3-step wizard that uses `useWizard` hook for step navigation, `SessionsApi` + `PromptsApi` via HttpClient for all backend calls. Steps: session metadata entry → image uploads + notes → prompt preview + guided copy loop. Integrates `ToastContext` for 429 rate-limit warnings and FluentValidation field error binding.

### 4. User Stories
- As a user, I can select extraction type (lecture/bank), pick a material, enter lecture number & type, then proceed.
- As a user, I can upload images with per-image notes and add general notes to build the extraction prompt.
- As a user, I see inline field validation errors under inputs when the backend rejects data.
- As a user, I see an Arabic warning toast when rate-limited (429).

### 5. Functions Summary
- `ExtractionWizard` (default export): Main component; uses `useWizard` for step state, `SessionsApi.createSession`/`getSession`/`uploadFiles`, `PromptsApi.compilePrompt` for API calls, `useToast` for error toasts.
- `addImage`: Appends a file to the images array with an object URL.
- `removeImage`: Removes an image by index and revokes its object URL.
- `updateImageNote`: Updates the note for a specific image.
- `goNext`: Advances step; on step 1→2, creates session via `apiCreateSession`, uploads files via `apiUploadFiles`, compiles prompt via `apiCompilePrompt` (or fetches from DB in auto-save mode). Catches 400 validation errors and 429 rate-limit errors.
- `goBack`: Calls `prev()` from useWizard.
- `handleSave`: Marks session as saved by re-fetching via `getSession`.
- `clearFieldError(field)`: Removes a field-specific validation error on input change.

### 6. Integration
Calls backend REST API via `SessionsApi` (`apiCreateSession`, `getSession`, `apiUploadFiles`) and `PromptsApi` (`apiCompilePrompt`) — all through HttpClient which handles JWT auth, 401 auto-redirect, and typed errors. Uses `ToastContext` for 429 Arabic toast warnings and 400 validation toasts.

### 7. Imports Summary
- **External:** `useState`, `useCallback`, `useEffect`, `useContext` (React), `useSearchParams`, `Link`, `useNavigate` (React Router).
- **Internal:** `WizardStepper`, `ImageUploader`, `PromptPreview`, `GuidedCopyLoop`, `PasteButton`, `PasteImageButton`, `MaterialAutocomplete`, `useWizard` (hooks), `getSession`/`createSession`/`uploadFiles` from `SessionsApi`, `compilePrompt` from `PromptsApi`, `useToast` from `ToastContext`, `useSettings` from `SettingsContext`, `AuthContext`, `formatRateLimitError` from `errorFormatter`.

### 8. Additional Info
Enforces RBAC: redirects to `/unauthorized` if user lacks both `LEC_EXT` and `BANK_EXT` permissions. Admins bypass permission checks. Field errors from backend 400 responses are normalized from PascalCase to camelCase and rendered under respective inputs with red border + Arabic error text. 429 errors trigger Arabic `warning` toast via `formatRateLimitError`. Session restoration via `?id=` query param. Session restore reads `data.material?.materialName` (nested `material` object) and `data.workflow?.systemCode` (nested `workflow` object), not top-level fields. No inline `fetch` calls — all API communication goes through HttpClient-based services.

### 9. API
- **`POST /api/sessions`** — `apiCreateSession({ materialName, lectureNumber, lectureType, workflowSystemCode, generalNotes })` → returns `{ id, sessionId }`.
- **`POST /api/sessions/{id}/files`** — `apiUploadFiles(sessionId, files, notes)` with `FormData` → returns result.
- **`GET /api/sessions/{id}`** — `getSession(id)` → returns session data including `material: { materialName }`, `lectureNumber`, `lectureType`, `workflow: { systemCode }`, `compiledPrompt`, `notes[]`, `files[]`.
- **`POST /api/prompts/compile`** — `apiCompilePrompt(systemCode, generalNotes, fileNotes)` → returns `{ compiledPrompt }`.
- **Validation error handling:** 400 with `errors` map (FluentValidation) → `fieldErrors` camelCase state → inline red border + error `<p>` under each field. 429 → Arabic toast with retry-after duration via `formatRateLimitError`.

## 1. File Name and Directory
`Frontend/src/pages/History.jsx`

### 2. File Type
Frontend

### 3. What the file does
Displays a paginated, filterable list of all user workflow sessions (extraction, coordination, quiz, pandoc, draw, merge). Uses `useSessions` hook for data lifecycle. Includes detail modal with session info, loading state, empty state, and rate-limit toast handling. Filter buttons are RBAC-gated via `hasWorkflowAccess`.

### 4. User Stories
- As a user, I want to browse my past sessions filtered by workflow type so I can quickly resume work.
- As a user, I want to view session details in a modal (workflow type, material, date, compiled prompt).
- As a user, I want to delete old/unwanted sessions with a loading indicator.
- As a user, I see a loading spinner while the initial list loads.
- As a user, I see a warning toast when rate-limited (429).

### 5. Functions Summary
- `getSessionRoute(session)`: Maps backend `workflowType` SystemCode + session `id` to a frontend route.
- `useModalExit(isOpen)`: Custom hook managing modal render state with exit animation (200ms).
- `SessionDetailModal({ session, onClose, getSession })`: Portal-rendered modal that fetches and displays full session details (workflow type icon, material name, lecture number, creation date, compiled prompt).
- `History` (default export): Main component — consumes `useSessions({ limit: 20 })` for paginated sessions, manages filter/delete/detail state.
- `handleDelete(id)`: Confirms via `window.confirm`, calls `removeSession` from hook, manages per-item deleting state.

### 6. Integration
Consumes `useSessions` hook (which delegates to `SessionsApi` → `HttpClient`). Uses `useAuth` for RBAC filter gating.

### 7. Imports Summary
- **React hooks**: `useState`, `useMemo`, `useEffect`
- **Icons**: `Clock`, `FileSearch`, `AlignRight`, `Palette`, `FileOutput`, `Trash2`, `Eye`, `Loader2`, `X`, `Info`, `Layers` from `lucide-react`
- **Internal**: `Link` from `react-router`; `useAuth` from `../contexts/AuthContext`; `useSessions` from `../hooks/useSessions`; `createPortal` from `react-dom`

### 8. Additional Info
Arabic-first RTL. Dual-layer RBAC security: (1) filter buttons only shown for permitted workflows, (2) client-side re-filters sessions to block unauthorized ones. Detail modal fetches full session data via `getSession(id)` on open. 429 rate-limit errors produce warning toasts (handled by `useSessions` hook). Per-item loading state on delete. Supports all 8 workflow types including MERGE.

### 9. API
- **Read:** Delegated to `useSessions` → `SessionsApi.getSessions(page, limit)` → `GET /api/sessions?page=&limit=`.
- **Detail:** `getSession(id)` from `useSessions` → `GET /api/sessions/{id}`.
- **Delete:** `removeSession(id)` from `useSessions` → `DELETE /api/sessions/{id}`.

## 1. File Name and Directory
`Frontend/src/pages/Login.jsx`

### 2. File Type
Frontend (React component)

### 3. What the file does
Renders a full-page RTL login form with username/password fields, show/hide password toggle, error banner, field-level validation errors, loading spinner, and post-login role-based redirect (Admin → `/admin/users`, others → `/`). Redirects already-authenticated users on mount. Consumes `ApiError` from HttpClient — 401 sets Arabic general error, 400 with `errors` map sets per-field errors, others fall back to `err.message`.

### 4. User Stories
- As a user, I can log in with my credentials and be redirected based on my role.
- As a user, I see per-field Arabic validation errors under the relevant input when the backend rejects empty fields.
- As a user, I see a clear Arabic error "اسم المستخدم أو كلمة المرور غير صحيحة" when my credentials are wrong.
- As an already logged-in user, I am automatically redirected away from the login page.

### 5. Functions Summary
- `Login` (default export): Main component — manages form state, calls `AuthContext.login`, handles errors, renders UI.
- `handleSubmit`: Prevents default form submission, calls `login(username, password)`, navigates on success or sets error on failure. On 401 → Arabic invalid credentials message; on 400 with errors → binds per-field errors; otherwise → generic fallback.
- `clearFieldError(field)`: On input change, removes the field-specific error from `fieldErrors` state (avoids stale validation markup).

### 6. Integration
Calls `AuthContext.login()` which POSTs to `/auth/login` backend endpoint. No direct API calls in this file. `ApiError.errors` (from HttpClient) is consumed to populate `fieldErrors`.

### 7. Imports Summary
- **React hooks:** `useState`, `useContext`, `useEffect`
- **React Router:** `useNavigate`
- **Internal:** `AuthContext` from `../contexts/AuthContext`
- **Icons:** `LogIn`, `User`, `Lock`, `Loader2`, `AlertCircle`, `Eye`, `EyeOff` from `lucide-react`

### 8. Additional Info
Arabic-first (RTL) with Tailwind v4 styling, dark mode support, and logical property classes (`ms-`, `pe-`, `start`, `end`). Logo inverts in dark mode. Per-field errors are rendered as `<p className="text-xs text-danger mt-1">` below the input with red border via `border-danger`. Field names are normalized to lowercase (e.g. backend `Username` → `username`).

### 9. API
- **Endpoint:** `POST /auth/login`
- **Request body:** `{ username, password }`
- **Response (success):** `{ token, userId, username, firstName, lastName, role, authorizedWorkflows[] }` — token saved to `localStorage`, user object set in AuthContext.
- **Response error handling:**
  - **401:** sets `error` state to Arabic "اسم المستخدم أو كلمة المرور غير صحيحة"
  - **400 with `errors` map (FluentValidation):** flattens keys to lowercase, sets `fieldErrors` state for per-field display
  - **Other errors:** falls back to `err.message` or generic Arabic fallback

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
- `MergeWizard`: Main component — manages 3-step wizard via `useWizard` hook (session setup → file upload/reorder → merge & download)
- `handleFileSelect`: Filters and appends selected .docx files to state
- `removeFile`: Removes a file by index
- `moveFile`: Swaps file position (move up/down) for reordering
- `clearFieldError`: Removes a single field error from `fieldErrors` state on input change
- `handleMerge`: Creates a session via `useWizard.createSession({ materialName, lectureNumber, lectureType, workflowSystemCode: 'MERGE' })` (non-blocking — proceeds on failure), then calls `MergeApi.execute` with FormData (`files`, `materialName`, `lectureType`); catches `RateLimitError` to show warning toast, `ApiError` (400) with `errors` to populate `fieldErrors`, and other errors to show error state with server message
- `getDownloadFileName`: Generates Arabic download filename from material name and type
- `handleReset`: Resets wizard to step 0 and clears all state

### 6. Integration
Calls backend via `MergeApi.execute` (which wraps `HttpClient.httpPost`): sends multipart FormData (`files[]`, `materialName`, `lectureType`) to `/api/merge/execute`. Server returns `{ url, finalFileName }` — the download URL is used directly as the `<a download>` href (server-side file).

### 7. Imports Summary
- **External:** `react` (useState, useRef), `lucide-react` (Layers, Upload, Loader2, File, Download, ArrowUp, ArrowDown, X, CheckCircle2)
- **Internal:** `WizardStepper` (step indicator), `MaterialAutocomplete` (material name selector), `MergeApi` from `api/MergeApi`, `ApiError` and `RateLimitError` from `api/HttpClient`, `useWizard` from `hooks/useWizard`, `useToast` from `contexts/ToastContext`, `useSettings` from `contexts/SettingsContext`

### 8. Additional Info
Arabic-first RTL interface. Uses `useWizard({ totalSteps: 3 })` for step management (`currentStep`, `next`, `prev`, `goTo`). Uses `useToast` for 429 rate-limit warning toasts. Per-field validation errors from `ApiError.errors` are normalized to lowercase and bound under inputs with `border-danger` styling. Status machine: idle → loading → success/error. Download URL is served directly from the backend server (`/uploads/...`), no client-side blob creation.

### 9. API
**Request:** `POST /api/merge/execute` with `Content-Type: multipart/form-data`
- Body: `files[]` (FileList), `materialName` (string), `lectureType` (string)
**Response:** `{ url: string, finalFileName: string }` — server URL to download the merged file
**Client flow:** Calls `MergeApi.execute` → receives server URL → renders `<a download href={url}>` for direct download.
**Error handling:** `RateLimitError` → warning toast with retry message; `ApiError` (400) with `errors` → per-field errors under inputs; other errors → error state with server message displayed.

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
- `handleGenerate`: Creates a session via `SessionsApi`, saves markdown content, calls `PandocApi.generate`, and provides download link. Handles 429 with warning toast and 400 errors with per-field validation display.
- `clearFieldError`: Removes a single field error from `fieldErrors` state on user input.

### 6. Integration
Calls backend REST APIs via `SessionsApi` (createSession, getSession, saveSessionContent) and `PandocApi` (generate). Both use `HttpClient` for JWT auth, 429 rate-limit detection (throws `RateLimitError`), and 400 FluentValidation error binding (throws `ApiError.errors`).

### 7. Imports Summary
External: `react-router` (useSearchParams), `react` (useEffect, useState, useRef), `lucide-react` (icons). Internal: `useWizard` (step management), `useToast` (notifications), `PandocApi`, `SessionsApi`, `SettingsContext`, `HttpClient` (ApiError, RateLimitError), `errorFormatter` (formatRateLimitError).

### 8. Additional Info
Arabic-first UI with RTL layout. Uses `useWizard` for step navigation and `WizardStepper` for step progress. Session loading is supported via `?id=` query param for resuming existing sessions. Drag-and-drop file upload is supported. 429 responses show a warning toast with formatted Arabic retry-after message. 400 FluentValidation errors are normalized to lowercase keys and rendered inline under each input field, cleared on user interaction.

### 9. API
**Create Session:** `POST /api/sessions` (via `SessionsApi.createSession`) with `{ materialName, lectureNumber, lectureType, workflowSystemCode: 'PANDOC' }` → returns `{ id, sessionId }`. **Save Content:** `POST /api/sessions/save` (via `SessionsApi.saveSessionContent`) with `{ sessionId, contentBody }`. **Generate:** `POST /api/pandoc/generate` (via `PandocApi.generate`) with `{ markdownText, templateName, materialName, type, lectureNumber }` → returns `{ fileUrl }`. **Fetch Session:** `GET /api/sessions/{id}` (via `SessionsApi.getSession`) → returns session data with `sessionContents[0].contentBody`. **429:** `HttpClient` throws `RateLimitError` → caught and shown as warning toast via `formatRateLimitError`. **400:** `HttpClient` throws `ApiError` with `errors` map (flattened via `formatValidationErrors`) → normalized to lowercase and rendered per-field.

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
Calls backend APIs via `SessionsApi` (`getSession`, `createSession`, `saveSessionContent`) and `PromptsApi` (`compilePrompt`).

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
No direct API calls or database interaction. Types are consumed by page components via `src/api/*.js` services (`HttpClient`) when processing backend responses.

### 7. Imports Summary
No imports. All types are exported for external consumption.

### 8. Additional Info
- `ErrorResponse` matches the backend `ErrorResponse` DTO (`error`, `statusCode`, `traceId`) returned by `ExceptionHandlingMiddleware` for non-validation errors.
- `PandocResult` matches the backend `PandocResult` record (`success`, `fileUrl?`, `error?`, `details?`) from `IPandocService`.
- `MergeResult` matches the backend `MergeResult` record (`url?`, `finalFileName?`, `error?`) from `IMergeService`.
- `ValidationErrors` is a `Record<string, string[]>` matching the per-field error map returned by `ExceptionHandlingMiddleware` for FluentValidation failures.
- `PaginatedResponse<T>` is generic over item type with `items`, `totalCount`, `page`, `limit`, `hasMore` — matching the pagination metadata from `SessionListResult` backend DTO.

### 9. API
These types shape the JSON responses from various backend endpoints. The actual parsing and transformation is handled by `HttpClient` (`src/api/HttpClient.js`) — these declarations provide static type guarantees at dev/build time.

## 1. File Name and Directory
`Frontend/src/utils/api.js` — **DELETED**

### 2. File Type
Frontend (legacy API client — removed)

### 3. What the file did
Was the original centralized HTTP client for all backend communication. Has been replaced by domain-specific API modules in `src/api/` (`HttpClient.js`, `AuthApi.js`, `SessionsApi.js`, `MaterialsApi.js`, `PromptsApi.js`, `PandocApi.js`, `MergeApi.js`, `AdminApi.js`).

### 4. Why it was deleted
Strangler Fig pattern — all consumers have been migrated to `src/api/*.js`. The old monolithic `utils/api.js` is no longer imported anywhere.

### 5. Functions Summary
All functions have been moved to their respective domain modules:
| Legacy function | New module |
|---|---|
| `authFetch` | `HttpClient.js` (`baseRequest`/`handleResponse`) |
| `fetchUserProfile` | `AuthApi.js` (`getCurrentUser`) |
| `fetchMaterials` | `MaterialsApi.js` (`getDistinctNames`) |
| `compilePromptStateless` | `PromptsApi.js` (`compilePrompt`) |
| `fetchSessions`, `fetchSession`, `createSession`, `uploadFiles`, `removeSession`, `saveSessionContent` | `SessionsApi.js` |
| `fetchStats`, `saveQuizSession` | Replaced inline via `SessionsApi` calls |
| `generatePandoc` | `PandocApi.js` (`generate`) |
| `mergeDocxFiles` | `MergeApi.js` (`execute`) |
| `fetchAdminUsers`, `createAdminUser`, `updateAdminUser`, `deleteAdminUser` | `AdminApi.js` (`admin.users.*`) |
| `fetchAdminMaterials`, `createAdminMaterial`, `updateAdminMaterial`, `deleteAdminMaterial` | `AdminApi.js` (`admin.materials.*`) |
| `fetchAdminWorkflows`, `toggleAdminWorkflow` | `AdminApi.js` (`admin.workflows.*`) |
| `fetchAdminPrompts`, `updateAdminPrompt` | `AdminApi.js` (`admin.prompts.*`) |
| `fetchAdminPermissions`, `createAdminPermission`, `deleteAdminPermission` | `AdminApi.js` (`admin.permissions.*`) |

### 6. Integration
No longer exists. All backend communication now routes through `HttpClient.js` which provides JWT auth, 401 auto-logout, rate-limit interception (`RateLimitError`), and `ApiError` with validation error maps.

### 7. Additional Info
The deletion was verified by a full Vite build — zero lingering imports remain.

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
No backend calls. Pure utility — consumes error objects thrown by `HttpClient` or caught in UI components.

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
- The legacy `utils/api.js` has been deleted — all code now uses `HttpClient`.

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
No backend calls. Communicates with non-React code via `window` custom events (`app:showToast`). Consumed by `Toast.jsx` component.

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
Renders all active toasts as a fixed overlay at the top-center of the viewport, using `createPortal` to `document.body`. Each toast shows a `lucide-react` icon (CheckCircle/error, XCircle/error, AlertTriangle/warning, Info/info), the message text, and a close button. Animated entrance via `animate-fade-slide-in`.

### 4. User Stories
- As a user, I see stacked toast notifications centered at the top of the screen with color-coded icons for success, error, warning, and info.
- As a user, I can manually dismiss a toast by clicking its close button.

### 5. Functions Summary
- `Toast` (default export): Reads `toasts` from `ToastContext`, renders a portal container with individual toast cards.

### 6. Integration
No backend/database calls. Renders via portal at `document.body` to ensure z-index stacking above all content.

### 7. Imports Summary
- **External:** `react-dom` (createPortal), `lucide-react` (CheckCircle, XCircle, AlertTriangle, Info, X)
- **Internal:** `useToast` from `../contexts/ToastContext`

### 8. Additional Info
- Arabic-first: button `aria-label` is "إغلاق", centered via flexbox (`items-center` + `inset-x-0`).
- Supports dark mode via Tailwind `dark:` variants (warning uses amber palette).
- Toasts stack vertically with a 0.5rem gap.
- Each toast card has `max-w-sm` (384px) with `w-[calc(100%-2rem)]` on mobile.

## 1. File Name and Directory
`Frontend/src/api/MaterialsApi.js`

### 2. File Type
Frontend — API service module

### 3. What the file does
Provides a dedicated function to fetch distinct material names from the backend via `HttpClient`. Replaced the legacy `fetchMaterials` function from the deleted `utils/api.js`.

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
Uses the HttpClient client (which auto-attaches JWT and handles errors). Replaced the older `compilePromptStateless` and `fetchPrompt` from the deleted `utils/api.js`.

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
Designed as a thin service layer over `HttpClient` — no custom error handling, serialization, or token management. Errors propagate as `ApiError` / `RateLimitError` from `HttpClient`. Old `utils/api.js` has been deleted — all code now routes through `SessionsApi`.

## 1. File Name and Directory
`Frontend/src/api/SessionsApi.js`

### 2. File Type
Frontend — API service module

### 3. What the file does
Provides dedicated functions for all session-related API calls using the `HttpClient` base module. Covers paginated session listing, single session retrieval, session creation, session deletion, session content saving, and multipart file uploads with notes.

### 4. User Stories
- As a developer, I can import `getSessions(page, limit)` from SessionsApi to fetch a paginated list of sessions.
- As a developer, I can import `uploadFiles(sessionId, files, notes)` to upload files with per-file notes via multipart FormData.
- As a developer, I can import `createSession(data)` and `saveSessionContent(sessionId, body)` to create/update sessions.
- As a developer, I can import `removeSession(id)` to delete a session via `DELETE /api/sessions/{id}`.

### 5. Functions Summary
- `getSessions(page, limit)`: GET `/api/sessions?page=&limit=` — returns paginated session list.
- `getSession(id)`: GET `/api/sessions/{id}` — returns single session detail.
- `createSession(data)`: POST `/api/sessions` with JSON body — creates a new session.
- `removeSession(id)`: DELETE `/api/sessions/{id}` — deletes a session.
- `saveSessionContent(sessionId, body)`: POST `/api/sessions/save` — saves session content (quiz, markdown, etc).
- `uploadFiles(sessionId, files, notes)`: POST `/api/sessions/{id}/files` with `FormData` (multipart) — uploads files with optional per-file notes.

### 6. Integration
Calls backend REST API through the shared `HttpClient` (`./HttpClient.js`). All requests automatically get JWT auth, error handling, and rate-limit interception from HttpClient.

### 7. Imports Summary
- **Internal:** `httpGet`, `httpPost`, `httpDelete` from `./HttpClient`

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
| DELETE | `/api/sessions/{id}` | — | Delete session |
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
Provides a namespaced interface (`admin.*`) for all admin-related REST API calls using `HttpClient`. Groups endpoints by domain: `users`, `materials`, `permissions`, `prompts`, `workflows`, and `templates`.

### 4. User Stories
- As an admin, I can CRUD users via `admin.users.*`.
- As an admin, I can CRUD materials via `admin.materials.*`.
- As an admin, I can list, create, and delete permissions via `admin.permissions.*`.
- As an admin, I can list and update prompt text via `admin.prompts.*`.
- As an admin, I can list and toggle workflow active state via `admin.workflows.*`.
- As an admin, I can fetch template metadata and upload DOTX files via `admin.templates.*`.

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
- `admin.templates.fetch()`: GET `/api/admin/templates`
- `admin.templates.upload(name, file)`: PUT `/api/admin/templates/{name}` with FormData

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
| templates.fetch | `/api/admin/templates` | GET | — |
| templates.upload | `/api/admin/templates/{name}` | PUT | `FormData` (file) |

## 1. File Name and Directory
`Frontend/src/hooks/useSessions.js`

### 2. File Type
Frontend — Custom React hook

### 3. What the file does
Provides a reusable hook for paginated session lifecycle management. Auto-fetches the first page on mount, supports "load more" pagination, delete with auto-refresh, and wraps all SessionsApi calls with ToastContext notifications. Handles `RateLimitError` (429) with warning toasts.

### 4. User Stories
- As a developer, I call `useSessions()` and get `{ sessions, totalCount, page, hasMore, isLoading, error }` for a paginated session list.
- As a developer, I call `loadMore()` to append the next page of sessions.
- As a developer, I call `refresh()` to reload from page 1.
- As a developer, I call `removeSession(id)` to delete a session with success/429 toast + auto-refresh.
- As a developer, I call `createSession(data)`, `getSession(id)`, `saveContent(sessionId, body)`, or `uploadFiles(sessionId, files, notes)` and get toast feedback on success/error.
- As a developer, 429 rate-limit errors show a warning toast for load/list, get, and remove operations.

### 5. Functions Summary
- `useSessions({ initialPage, limit })`: Hook — accepts optional `initialPage` (default 1) and `limit` (default 10). Returns state and action methods.
- `loadMore()`: Increments page and appends results if `hasMore` is true and not already loading.
- `refresh()`: Reloads sessions from `initialPage` (replaces current list).
- `createSession(data)`: Calls `SessionsApi.createSession`, shows success/error toast, returns created session.
- `getSession(id)`: Calls `SessionsApi.getSession`, shows error/429 warning toast on failure, returns session.
- `removeSession(id)`: Calls `SessionsApi.removeSession`, shows success/429 warning toast, auto-refreshes list on success.
- `saveContent(sessionId, body)`: Calls `SessionsApi.saveSessionContent`, shows success/error toast, returns result.
- `uploadFiles(sessionId, files, notes)`: Calls `SessionsApi.uploadFiles`, shows success/error toast, returns result.

### 6. Integration
Calls `SessionsApi` (which uses `HttpClient` for JWT auth, error/rate-limit handling). Uses `ToastContext` for user-facing success/error/warning notifications.

### 7. Imports Summary
- **External:** `react` (useState, useEffect, useCallback)
- **Internal:** `SessionsApi` functions from `../api/SessionsApi` (including `removeSession`), `useToast` from `../contexts/ToastContext`

### 8. Additional Info
- Load errors are set in `error` state for programmatic handling. 429 errors during list loading show a warning toast.
- `loadMore` is a no-op guard (ignores call if already loading or `hasMore` is false).
- `removeSession` catches `RateLimitError` specifically to show a warning toast, other errors show generic error toast.
- `refresh()` re-calls `loadSessions(initialPage)` replacing the current list.
- Return value includes: `sessions`, `totalCount`, `page`, `hasMore`, `isLoading`, `error`, `loadMore`, `refresh`, `createSession`, `getSession`, `removeSession`, `saveContent`, `uploadFiles`.

### 9. API
- **Internal:** Delegates all HTTP to `SessionsApi` (SessionsApi.js). See SessionsApi.md for endpoint details.
- **Toast:** Calls `showToast(message, type)` from `ToastContext` — `type` is `'success'` on success, `'error'` on failure, `'warning'` for 429 rate-limit errors.

## 1. File Name and Directory
`Frontend/src/hooks/useAdminMaterials.js`

### 2. File Type
Frontend — Custom React hook

### 3. What the file does
Provides a reusable hook for admin materials CRUD. Wraps `AdminApi.materials.*` calls with loading/error states, toast notifications, and validation error mapping from backend `ApiError.errors`.

### 4. User Stories
- As an admin, I call `fetchAll()` to load all materials with loading/error state.
- As an admin, I call `create(data)`, `update(id, data)`, or `remove(id)` with toast feedback and automatic list refresh on success.

### 5. Functions Summary
- `useAdminMaterials()`: Hook — returns state and CRUD actions.
- `fetchAll()`: Fetches all materials from `admin.materials.fetch()`, sets `materials` state or `error` on failure.
- `create(data)`: Creates a material via `admin.materials.create(data)`, shows success toast, re-fetches list, maps validation errors on failure.
- `update(id, data)`: Updates a material via `admin.materials.update(id, data)`, shows success toast, re-fetches list, maps validation errors on failure.
- `remove(id)`: Deletes a material via `admin.materials.delete(id)`, shows success toast, re-fetches list on success.
- `clearValidationErrors()`: Resets `validationErrors` state to `null`.

### 6. Integration
Calls `admin.materials.*` from `AdminApi` (which uses `HttpClient` for JWT auth, error/rate-limit handling). Uses `ToastContext` for success/error notifications.

### 7. Imports Summary
- **External:** `react` (useState, useCallback)
- **Internal:** `admin` from `../api/AdminApi`, `useToast` from `../contexts/ToastContext`, `formatValidationErrors` from `../utils/errorFormatter`

### 8. Additional Info
- `validationErrors` is set from `err.errors` (flattened via `formatValidationErrors`) on 400 validation failures — useful for per-field inline error display.
- `clearValidationErrors()` resets validation errors (useful when opening modals or resetting forms).
- List errors show a toast and set `error` state for programmatic handling.
- Mutations re-throw after handling so callers can chain `.catch()` if needed.
- No auto-fetch on mount — caller must invoke `fetchAll()` explicitly.

### 9. API
- **Internal:** Delegates all HTTP to `admin.materials.*` (AdminApi.js). Endpoints: GET/POST/PUT/DELETE `/api/admin/materials`.
- **Toast:** Calls `showToast(message, type)` from `ToastContext`.
- **Validation Errors:** Maps `err.errors` via `formatValidationErrors` into `{ field: message }` shape.
- **Return:** `{ materials, isLoading, isSaving, error, validationErrors, fetchAll, create, update, remove, clearValidationErrors }`

## 1. File Name and Directory
`Frontend/src/hooks/useAdminPermissions.js`

### 2. File Type
Frontend — Custom React hook

### 3. What the file does
Lightweight admin hook for managing role-workflow permissions. Provides `list`, `create`, and `delete` operations via `admin.permissions.*` from AdminApi, with ToastContext notifications and `validationErrors` state from 400 responses.

### 4. User Stories
- As an admin, I can list all permissions, create new ones, and delete existing ones with toast feedback.
- As a developer, I read `validationErrors` from the hook to show per-field error messages.

### 5. Functions Summary
- `useAdminPermissions()`: Hook returning `{ items, isLoading, error, validationErrors, list, create, delete }`.
- `list()`: Fetches all permissions, sets `items`.
- `create(data)`: Creates a permission, shows success/error toast, sets `validationErrors` on 400.
- `delete(id)`: Deletes a permission, optimistically removes from `items`, shows toast.

### 6. Integration
Calls `admin.permissions` from `AdminApi` (which uses `HttpClient`). Uses `ToastContext` for notifications.

### 7. Imports Summary
- **External:** `react` (useState, useCallback)
- **Internal:** `admin` from `../api/AdminApi`, `useToast` from `../contexts/ToastContext`, `ApiError` from `../api/HttpClient`

### 8. Additional Info
Catches `ApiError` with `status === 400` to populate `validationErrors` (`Record<string, string>`). Re-throws all errors after toast so callers can chain `.catch()`.

### 9. API
Delegates to `AdminApi` (HttpClient). See `AdminApi.js` for endpoints. Toast via `ToastContext`.

## 1. File Name and Directory
`Frontend/src/hooks/useAdminPrompts.js`

### 2. File Type
Frontend — Custom React hook

### 3. What the file does
Lightweight admin hook for managing workflow AI prompts. Provides `list` and `updateText` operations via `admin.prompts.*` from AdminApi, with ToastContext notifications and `validationErrors` state from 400 responses.

### 4. User Stories
- As an admin, I can list all prompts and update their text with toast feedback.
- As a developer, I read `validationErrors` from the hook to show per-field error messages.

### 5. Functions Summary
- `useAdminPrompts()`: Hook returning `{ items, isLoading, error, validationErrors, list, updateText }`.
- `list()`: Fetches all prompts, sets `items`.
- `updateText(id, promptText)`: Updates a prompt's text, optimistic update of `items`, shows success/error toast, sets `validationErrors` on 400.

### 6. Integration
Calls `admin.prompts` from `AdminApi` (which uses `HttpClient`). Uses `ToastContext` for notifications.

### 7. Imports Summary
- **External:** `react` (useState, useCallback)
- **Internal:** `admin` from `../api/AdminApi`, `useToast` from `../contexts/ToastContext`, `ApiError` from `../api/HttpClient`

### 8. Additional Info
Catches `ApiError` with `status === 400` to populate `validationErrors`. Re-throws after toast.

### 9. API
Delegates to `AdminApi` (HttpClient). See `AdminApi.js` for endpoints. Toast via `ToastContext`.

## 1. File Name and Directory
`Frontend/src/hooks/useAdminWorkflows.js`

### 2. File Type
Frontend — Custom React hook

### 3. What the file does
Lightweight admin hook for managing workflow activation states. Provides `list` and `toggleActive` operations via `admin.workflows.*` from AdminApi, with ToastContext notifications and `validationErrors` state from 400 responses.

### 4. User Stories
- As an admin, I can list all workflows and toggle their active state with toast feedback.
- As a developer, I read `validationErrors` from the hook to show per-field error messages.

### 5. Functions Summary
- `useAdminWorkflows()`: Hook returning `{ items, isLoading, error, validationErrors, list, toggleActive }`.
- `list()`: Fetches all workflows, sets `items`.
- `toggleActive(id, isActive)`: Toggles a workflow's active state, optimistic update of `items`, shows success/error toast, sets `validationErrors` on 400.

### 6. Integration
Calls `admin.workflows` from `AdminApi` (which uses `HttpClient`). Uses `ToastContext` for notifications.

### 7. Imports Summary
- **External:** `react` (useState, useCallback)
- **Internal:** `admin` from `../api/AdminApi`, `useToast` from `../contexts/ToastContext`, `ApiError` from `../api/HttpClient`

### 8. Additional Info
Catches `ApiError` with `status === 400` to populate `validationErrors`. Re-throws after toast.

### 9. API
Delegates to `AdminApi` (HttpClient). See `AdminApi.js` for endpoints. Toast via `ToastContext`.

## 1. File Name and Directory
`Frontend/src/hooks/useAdminUsers.js`

### 2. File Type
Frontend — Custom React hook

### 3. What the file does
Provides a reusable hook for admin user CRUD lifecycle. Fetches all users on mount, manages modal create/edit flow with animated close, delete confirmation, and captures validation errors from 400 API responses. Uses `AdminApi.users.*` for all HTTP operations and `ToastContext` for user-facing notifications.

### 4. User Stories
- As an admin, I can view all users via `loadUsers()` and see loading/error states.
- As an admin, I can open a create modal or pre-filled edit modal, submit the form, and see success/error toasts with validation errors highlighted.
- As an admin, I can trigger delete confirmation and confirm/cancel deletion.

### 5. Functions Summary
- `useAdminUsers()`: Hook — returns all state and action methods.
- `loadUsers()`: Fetches all admin users via `AdminApi.users.fetch()` and sets `users` state.
- `openCreateModal()`: Resets form, opens modal in create mode. Cancels any pending close timeout.
- `openEditModal(user)`: Pre-fills form with user data, opens modal in edit mode. Cancels any pending close timeout.
- `closeModal()`: Triggers closing animation via `closeTimeoutRef` (200ms), then resets all modal state.
- `handleSubmit(data)`: Creates or updates user based on `editingId`, shows success toast, reloads list. On 400, sets `validationErrors` without error toast (errors shown inline). On other errors, shows error toast.
- `handleDelete(id)`: Sets `deleteConfirmId` to trigger confirm UI.
- `confirmDelete()`: Deletes the user at `deleteConfirmId`, shows toast, reloads list.
- `cancelDelete()`: Clears `deleteConfirmId` without deleting.

### 6. Integration
Calls `AdminApi.users.*` methods (`fetch`, `create`, `update`, `delete`) which use `HttpClient` for JWT auth and error handling. Uses `ToastContext` for success/error notifications. Captures `ApiError.errors` from 400 responses into `validationErrors` state.

### 7. Imports Summary
- **External:** `react` (useState, useEffect, useCallback, useRef)
- **Internal:** `admin` from `../api/AdminApi`, `useToast` from `../contexts/ToastContext`

### 8. Additional Info
- Load errors are set in `error` state without toasts to avoid spam.
- Submit errors (`err.errors`) from 400 responses set `validationErrors` for per-field display without redundant toast; other errors show a toast. Re-throws for caller chaining.
- `handleSubmit` strips `username` from the payload on update (only sent on create). Password always sent in create mode (even if empty) so FluentValidation catches it cleanly.
- Modal close animation uses `closeTimeoutRef` (200ms) with cancellation: `openCreateModal`/`openEditModal` clear the timeout to prevent race conditions when re-opening during animation.
- `closeTimeoutRef` is cleaned up on unmount.
- `deleteConfirmId` holds the user ID pending confirmation; set to `null` when idle.

### 9. API
- **Internal:** Delegates all HTTP to `AdminApi.users.*` (AdminApi.js). See AdminApi.md for endpoint details.
- **Toast:** Calls `showToast(message, type)` from `ToastContext` — `type` is `'success'` on success, `'error'` on failure (not shown for 400 validation errors).

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
- **No redundant toast:** `createSession` catch block only calls `showToast` for non-`RateLimitError` errors. The caller (e.g. CoordinationWizard) handles 400 with field errors and 429 with warning toasts, so the hook no longer adds a misleading generic error toast on top.

### 9. API
No direct API calls. Delegates all HTTP to `useSessions` → `SessionsApi` (`SessionsApi.js`). See SessionsApi.md for endpoint details.
