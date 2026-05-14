## 1. File Name and Directory
`Frontend/src/utils/api.js`

### 2. File Type
Frontend (API client utility)

### 3. What the file does
Centralized HTTP client for all backend communication. Wraps `fetch` with JWT auth, handles 401 auto-logout, and provides typed functions for sessions, materials, prompts, file uploads, Pandoc generation, document merging, and full admin CRUD (users, materials, workflows, prompts, permissions).

### 4. User Stories
- As a user, I can perform all workflow operations (create/view/delete sessions, upload files, compile prompts) without manually managing tokens.
- As an admin, I can manage users, materials, workflows, prompts, and permissions via dedicated API functions.
- As a user, I get automatically redirected to login when my token expires.

### 5. Functions Summary
- `authFetch`: Core wrapper — attaches JWT `Authorization` header, handles 401 globally (clears token, redirects to `/login`), preserves existing headers.
- `fetchUserProfile`: GET `/api/auth/me` — returns current user profile with authorized workflows.
- `fetchMaterials`: GET `/api/materials` — cached in-memory.
- `compilePromptStateless`: POST `/api/prompts/compile` — compiles a prompt statelessly.
- `fetchSessions`: GET `/api/sessions?page=&limit=` — paginated session list.
- `fetchSession`: GET `/api/sessions/{id}` — single session.
- `createSession`: POST `/api/sessions` + optional POST `/api/sessions/{id}/files` — creates session then uploads attached files.
- `uploadFiles`: POST `/api/sessions/{id}/files` — file upload via FormData.
- `fetchPrompt`: GET `/api/prompts/{sessionId}/{systemCode}`.
- `removeSession`: DELETE `/api/sessions/{id}`.
- `generatePandoc`: POST `/api/pandoc/generate` — generates DOCX via Pandoc.
- `mergeDocxFiles`: POST `/api/merge/execute` — uploads DOCX files, downloads merged blob.
- `fetchStats`: Aggregates session counts by `workflowType` with 60s cache TTL.
- `saveQuizSession`: POST `/api/sessions` then POST `/api/sessions/save?sessionId=` for quiz content.
- `saveSessionContent`: POST `/api/sessions/save` — saves JSON/Markdown content.
- `fetchAdminUsers` / `createAdminUser` / `updateAdminUser` / `deleteAdminUser`: Full CRUD on users.
- `fetchAdminMaterials` / `createAdminMaterial` / `updateAdminMaterial` / `deleteAdminMaterial`: Full CRUD on materials.
- `fetchAdminWorkflows` / `toggleAdminWorkflow`: Read and toggle workflows active state.
- `fetchAdminPrompts` / `updateAdminPrompt`: Read and update prompts.
- `fetchAdminPermissions` / `createAdminPermission` / `deleteAdminPermission`: Manage role-workflow permissions.

### 6. Integration
Calls the backend REST API exclusively. No direct database or external service calls from this file.

### 7. Imports Summary
**Zero imports** — uses native `fetch`, `Headers`, `FormData`, `localStorage`, `window.location`.

### 8. Additional Info
- In-memory cache (`apiCache` Map) for materials (indefinite) and stats (60s TTL).
- Handles 400 errors with Arabic fallback messages (`'يجب اختيار مادة صالحة لمتابعة العمل.'`).
- `createSession` extracts session ID from both `id` and `sessionId` response fields, plus falls back to `Location` header.
- File uploads use `FormData` (no explicit `Content-Type` header — browser sets `multipart/form-data` automatically).

### 9. API
**Request:** All calls go through `authFetch` which attaches `Authorization: Bearer <token>` from `localStorage`. JSON payloads get `Content-Type: application/json` automatically. File uploads use `FormData`.

**Response:** Functions parse JSON or blob. Errors are caught and logged with contextual messages. Non-OK responses throw with backend error message (Arabic where applicable). 401 triggers global logout + redirect.
