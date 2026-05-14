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
