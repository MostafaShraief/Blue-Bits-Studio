## 1. File Name and Directory
Frontend/src/utils/storage.js

### 2. File Type
Frontend — localStorage session persistence utility

### 3. What the file does
Provides CRUD operations for user workflow sessions using browser `localStorage`. Sessions store metadata (material name, lecture number, type, workflow type, prompt text, notes) and are persisted under the key `bluebits_sessions`. Results are always returned newest-first.

### 4. User Stories
- As a user, I save a new session so I can review or resume my work later.
- As a user, I view my session history and filter by workflow type on the dashboard.
- As a user, I delete old sessions I no longer need.

### 5. Functions Summary
- `saveSession(session)`: Prepends a new session with generated `id` and `createdAt`, persists it, returns the saved entry.
- `getSessions()`: Returns all sessions (newest first).
- `getSession(id)`: Returns a single session by id, or `null`.
- `deleteSession(id)`: Removes a session by id.
- `getSessionsByType(workflowType)`: Filters sessions by workflow type (`lecture`, `bank`, `draw`, `pandoc`, `coordination`).
- `getStats()`: Returns counts per workflow type plus total.

### 6. Integration
No backend calls — purely client-side `localStorage` reads/writes.

### 7. Imports Summary
Zero imports. Standalone utility with a single private constant (`STORAGE_KEY`) and two private helpers (`readSessions`, `writeSessions`).

### 8. Additional Info
Sessions are stored as JSON under `localStorage['bluebits_sessions']`. All read operations are wrapped in try/catch returning `[]` on parse failure. IDs are generated as `${Date.now()}-${random9chars}`. No size limit except browser storage quota (~5–10 MB).

### 9. API
No HTTP requests. All data flows to/from `localStorage` synchronously via `JSON.parse`/`JSON.stringify`.
