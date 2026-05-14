## 1. File Name and Directory
`Frontend/src/pages/admin/UsersManager.jsx`

### 2. File Type
Frontend (React component)

### 3. What the file does
Admin CRUD page for managing users. Displays a sortable/filterable table of users with role badges, batch info, Telegram copy, and dates. Provides a modal form for creating/editing users with field validation.

### 4. User Stories
- As an Admin, I can view all users in a table, filter by role/batch, and sort by name, role, batch, or dates.
- As an Admin, I can create, edit, or delete users via a modal form with input validation.

### 5. Functions Summary
- `loadUsers`: Fetches all users from backend and sets state
- `handleSubmit`: Validates inputs and calls create/update API
- `handleEdit`: Populates modal with user data for editing
- `handleDelete`: Confirms and deletes a user via API
- `resetForm`: Clears form state and resets editing ID
- `openCreateModal` / `closeModal`: Controls modal visibility with animation
- `handleUsernameInput` / `handlePasswordInput`: Real-time input guards (English alphanumeric + allowed symbols only)
- `getRoleBadge`: Renders colored role badge with icon
- `formatDate`: Formats dates to Arabic locale
- `handleCopyTelegram`: Copies Telegram username to clipboard
- `handleSort` / `getSortIcon`: Cycles sort state (asc → desc → none)
- `resetFilters`: Clears all filter and sort settings

### 6. Integration
Calls backend admin REST API via `authFetch`: `fetchAdminUsers`, `createAdminUser`, `updateAdminUser`, `deleteAdminUser`.

### 7. Imports Summary
- React hooks: `useState`, `useEffect`, `useMemo`
- Internal: `../../utils/api` (admin user CRUD functions)
- External: `lucide-react` icons (Users, Plus, Pencil, Trash2, etc.)

### 8. Additional Info
Arabic-first RTL UI. Telegram + role combination must be unique (handles 409 conflict). Protected `userId === 1` from deletion. Uses `onBeforeInput` for clean keyboard validation without blocking Ctrl combinations.

### 9. API
- `GET /api/admin/users` → returns array of user objects
- `POST /api/admin/users` → creates user; body: `{ firstName, lastName, username, password, userRole, batchNumber, telegramUsername?, teamJoinDate? }`
- `PUT /api/admin/users/{id}` → updates user; body: same as create without `username`
- `DELETE /api/admin/users/{id}` → deletes user
