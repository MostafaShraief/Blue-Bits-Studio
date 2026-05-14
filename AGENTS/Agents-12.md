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
