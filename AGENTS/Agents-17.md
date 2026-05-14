## 1. File Name and Directory
`Frontend/src/contexts/AuthContext.jsx`

### 2. File Type
Frontend (React Context Provider)

### 3. What the file does
Manages authentication state — login, logout, session hydration from localStorage, profile sync with backend, and workflow-level RBAC authorization checks.

### 4. User Stories
- As a user, I can log in with my username/password and have my session persisted across page reloads.
- As an admin, I automatically bypass all workflow permission checks and see all tools.

### 5. Functions Summary
- `AuthProvider`: Context provider wrapping children with auth state (`user`, `login`, `logout`, `loading`, `hasWorkflowAccess`)
- `login(username, password)`: POSTs credentials to `/api/auth/login`, stores JWT + user profile in localStorage
- `logout()`: Clears user state and localStorage
- `hasWorkflowAccess(systemCode)`: Returns `true` if user is Admin or their `allowedWorkflows` includes the given SystemCode
- `useAuth()`: Hook to consume `AuthContext`

### 6. Integration
Calls backend API: `POST /api/auth/login` and `fetchUserProfile()` (GET /api/auth/profile via utils/api).

### 7. Imports Summary
- **External:** React hooks (`createContext`, `useState`, `useEffect`, `useCallback`, `useContext`)
- **Internal:** `fetchUserProfile` from `../utils/api`

### 8. Additional Info
- Session is persisted in localStorage under keys `bluebits_user` and `token`.
- On mount, it hydrates from localStorage then syncs with backend for up-to-date permissions.
- Sync failure (expired/invalid token) clears session and redirects to `/login`.
- `loading` stays `true` until profile sync completes to prevent UI flicker.

### 9. API
| Endpoint | Method | Request Body | Response Body |
|---|---|---|---|
| `/api/auth/login` | POST | `{ username, password }` | `{ token, userId, username, firstName, lastName, role, authorizedWorkflows }` |
| `/api/auth/profile` | GET (via `fetchUserProfile`) | JWT in Authorization header | `{ userId, username, firstName, lastName, role, authorizedWorkflows }` |
