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
