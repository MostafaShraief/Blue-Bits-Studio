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
