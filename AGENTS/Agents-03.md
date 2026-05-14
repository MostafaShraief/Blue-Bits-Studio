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
