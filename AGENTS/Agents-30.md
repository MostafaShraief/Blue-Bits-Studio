## 1. File Name and Directory
`Frontend/src/pages/History.jsx`

### 2. File Type
Frontend

### 3. What the file does
Displays a paginated, filterable list of all user workflow sessions (extraction, coordination, quiz, pandoc, draw). Users can view or delete any session. Filter buttons are RBAC-gated via `hasWorkflowAccess`.

### 4. User Stories
- As a user, I want to browse my past sessions filtered by workflow type so I can quickly resume work.
- As a user, I want to delete old/unwanted sessions.

### 5. Functions Summary
- `getSessionRoute(session)`: Maps backend `workflowType` SystemCode + session `id` to a frontend route.
- `History` (default export): Main component — manages sessions state, filter, pagination, delete, and renders the UI.
- `loadSessions(pageNum)`: Calls `fetchSessions` API and updates state (appends or replaces).
- `handleLoadMore()`: Increments page and loads next batch.
- `handleDelete(id)`: Confirms via `window.confirm`, calls `removeSession` API, then reloads from page 1.

### 6. Integration
Calls `fetchSessions` and `removeSession` from `../utils/api`.

### 7. Imports Summary
- **React hooks**: `useState`, `useMemo`, `useEffect`
- **Icons**: `Clock`, `FileSearch`, `AlignRight`, `Palette`, `FileOutput`, `Trash2`, `Eye`, `Loader2` from `lucide-react`
- **Internal**: `fetchSessions`, `removeSession` from `../utils/api`; `Link` from `react-router`; `useAuth` from `../contexts/AuthContext`

### 8. Additional Info
Arabic-first RTL. Dual-layer RBAC security: (1) filter buttons only shown for permitted workflows, (2) client-side re-filters sessions to block unauthorized ones (defense-in-depth against stale/cached data).

### 9. API
- `fetchSessions(pageNum, limit)` → returns `{ sessions: Session[], hasMore: boolean, totalCount: number }`
- `removeSession(id)` → `DELETE` endpoint, returns success/error.
