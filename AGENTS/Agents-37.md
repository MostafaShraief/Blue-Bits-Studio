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
