## 1. File Name and Directory
Frontend/src/pages/admin/SystemConfig.jsx

### 2. File Type
Frontend (React admin page component)

### 3. What the file does
Admin configuration panel with three management areas: toggle workflow activation, edit AI prompts per workflow, and manage role-based permissions (add/remove roles) per workflow.

### 4. User Stories
- As an admin, I can activate/deactivate any workflow server
- As an admin, I can edit the system prompt text for any workflow
- As an admin, I can assign or remove roles (TechMember / ScientificMember) per workflow

### 5. Functions Summary
- `loadData()`: Fetches workflows, prompts, and permissions in parallel via Promise.all
- `handleToggleWorkflow(id, currentActive)`: Toggles workflow active state via API and updates local state optimistically
- `handleSavePrompt(id)`: Saves edited prompt text and collapses the editor
- `handleAddPermission()`: Creates a new role permission for a workflow, then reloads data
- `handleDeletePermission(id)`: Deletes a permission after confirmation, then reloads data
- `closePermissionModal()`: Closes the permission modal with a fade-out animation
- `getWorkflowName(id)`: Looks up a workflow's adminNote by ID
- `getRoleInfo(roleName)`: Returns role-specific styling, icon, and Arabic label
- `formatDate(date)`: Formats a date using ar-SY locale

### 6. Integration
Calls backend admin REST API endpoints for workflows, prompts, and permissions CRUD.

### 7. Imports Summary
- `useState`, `useEffect`, `useMemo` (React)
- `fetchAdminWorkflows`, `fetchAdminPrompts`, `fetchAdminPermissions`, `toggleAdminWorkflow`, `updateAdminPrompt`, `createAdminPermission`, `deleteAdminPermission` (../../utils/api)
- `lucide-react` icons: Settings2, Power, PowerOff, Loader2, AlertCircle, X, Plus, Trash2, FileText, ChevronDown, ChevronUp, Save, RefreshCw, Shield, Sparkles, FlaskConical, Crown, Scroll, Server, UserCog

### 8. Additional Info
Arabic-first UI (`dir="rtl"`). Includes modal with fade/scale animations for adding permissions. Prompts tab uses an accordion expand/collapse pattern.

### 9. API
- `fetchAdminWorkflows()` → GET workflows list
- `fetchAdminPrompts()` → GET prompts list
- `fetchAdminPermissions()` → GET permissions list
- `toggleAdminWorkflow(id, active)` → POST toggle active state
- `updateAdminPrompt(id, promptText)` → POST update prompt text
- `createAdminPermission({ roleName, workflowId })` → POST create new permission
- `deleteAdminPermission(id)` → DELETE remove a permission
