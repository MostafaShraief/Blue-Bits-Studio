## 1. File Name and Directory
Frontend/src/App.jsx

### 2. File Type
Frontend — Root React component / Router entry point

### 3. What the file does
Sets up the top-level app shell: wraps the app in AuthProvider, BrowserRouter, and TourProvider; lazy-loads all page components; defines nested Routes with cascade guards (ProtectedRoute → Layout → optional ProtectedRoute per workflow; AdminRoute for admin pages; AuthOnlyRoute for 404).

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
- **Internal:** `AuthContext`, `TourContext`, `Layout`, 3 route guards (`AdminRoute`, `AuthOnlyRoute`, `ProtectedRoute`), `PageLoader`, and 16 lazy-loaded page components (Dashboard, ExtractionWizard, CoordinationWizard, PandocWizard, DrawWizard, QuizHub, History, Tour, MergeWizard, Login, Unauthorized, NotFound, AdminUnauthorized, AdminUsers, AdminMaterials, AdminSystem).

### 8. Additional Info
Every page is lazy-loaded via `React.lazy`. Route guard nesting: outer `ProtectedRoute` checks auth → `Layout` provides sidebar → individual `ProtectedRoute` with `requiredCode` prop enforces per-workflow SystemCode access. Extraction and Coordination use double-gate logic (guarded by ProtectedRoute, then validated inside the wizard component itself).

### 9. API
No request/response handling here. Guards and contexts handle API communication invisibly to this file — `ProtectedRoute` likely calls an auth API via AuthContext to verify tokens/permissions, and `AdminRoute` checks for admin role.
