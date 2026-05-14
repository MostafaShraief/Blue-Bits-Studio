## 1. File Name and Directory
`Frontend/src/components/SettingsModal.jsx`

### 2. File Type
Frontend

### 3. What the file does
Settings modal component with dark mode toggle, auto-save toggle (hidden for admin), default material selector with search, and logout with confirmation. Includes animated modal enter/exit transitions and a fully keyboard-accessible dropdown.

### 4. User Stories
- As a user, I can toggle dark mode, enable auto-save, and set my default material from a searchable dropdown
- As a user, I can log out after confirming my intent
- As an admin, the auto-save and default material settings are hidden

### 5. Functions Summary
- `MaterialSelector`: Custom searchable dropdown portal that fetches and sorts materials, supports keyboard navigation (ArrowUp/Down/Enter/Escape)
- `useModalExit`: Custom hook managing render state and exit animation timing (200ms)
- `SettingsModal`: Main modal composing all settings toggles, material selector, and logout flow

### 6. Integration
Calls backend API via `fetchMaterials()` from `../utils/api` → `GET /api/materials` (cached)

### 7. Imports Summary
- **External**: `react` (useState, useEffect, useRef), `react-dom` (createPortal), `lucide-react` (Moon, Sun, Save, LogOut, X, XCircle, ChevronDown)
- **Internal**: `fetchMaterials` from `../utils/api`

### 8. Additional Info
- Arabic-first: labels, placeholders, and confirmation text are in Arabic
- Uses Tailwind CSS v4 with logical properties and dark mode variants
- Admin sees neither auto-save toggle nor material selector (conditional rendering via `isAdmin` prop)

### 9. API
- **GET** `/api/materials` — fetches all materials (cached, sorted alphabetically). Returns an array of strings (material names). On failure, defaults to empty array `[]`.
