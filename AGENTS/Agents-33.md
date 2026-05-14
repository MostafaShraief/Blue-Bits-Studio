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
