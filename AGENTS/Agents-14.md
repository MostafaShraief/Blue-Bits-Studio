## 1. File Name and Directory
Frontend/src/components/Sidebar.jsx

### 2. File Type
Frontend — React component (sidebar navigation)

### 3. What the file does
Renders the main sidebar with navigation items filtered by user role (Member/Admin) and allowedWorkflows SystemCodes. Shows user profile section (avatar initials, name, username) with a settings button that opens SettingsModal. Handles loading state with a spinner while auth context resolves.

### 4. User Stories
- As a user, I see only the workflows I have permission for in the sidebar navigation.
- As an admin, I see admin management links (users, materials, system) instead of regular workflow links.
- As a user, I can view my profile info and open settings/logout from the bottom of the sidebar.

### 5. Functions Summary
- `Sidebar`: Main component; renders logo, RBAC-filtered NavLink list, and profile section with settings trigger.
- `handleLogout`: Calls `logout()` from AuthContext then redirects to `/login`.
- `getInitials`: Extracts first letters of `user.firstName` and `user.lastName`, uppercased.

### 6. Integration
No direct API calls. Reads `user` and `loading` from `AuthContext` (backend auth state), and settings from `SettingsContext`. The `SettingsModal` child component may trigger API calls indirectly.

### 7. Imports Summary
- **External:** `react-router` (NavLink), `react` (useContext, useState), `lucide-react` (11 icons: LayoutDashboard, FileSearch, AlignRight, FileOutput, Palette, Layers, FileJson, Clock, Settings, Users, BookOpen, Settings2)
- **Internal:** `useSettings` from `../contexts/SettingsContext`, `AuthContext` from `../contexts/AuthContext`, `SettingsModal` from `./SettingsModal`

### 8. Additional Info
NAV_ITEMS array centralizes all route definitions with `systemCode` for RBAC and `role` for admin/member filtering. Extraction and Coordination check two possible SystemCodes (LEC_EXT/BANK_EXT, LEC_COORD/BANK_COORD). History (HIST) bypasses systemCode check and only requires an authenticated user.

### 9. API
No direct request/response handling. Relies on AuthContext to provide user object with `role`, `allowedWorkflows` array, `firstName`, `lastName`, and `username` — populated by the backend after login.
