## 1. File Name and Directory
`Frontend/src/pages/admin/MaterialsManager.jsx`

### 2. File Type
Frontend (React admin page component)

### 3. What the file does
Admin CRUD interface for managing academic materials (subjects). Displays a sortable/filterable table of materials with a modal form for creating/editing, and delete with confirmation.

### 4. User Stories
- As an admin, I can view all materials, filter by academic year, and sort by name or year.
- As an admin, I can add, edit, or delete a material with a name and academic year.

### 5. Functions Summary
- `loadMaterials()`: Fetches all materials from API and updates state.
- `handleSubmit()`: Creates or updates a material via API, then reloads list.
- `handleEdit(material)`: Pre-fills modal form with material data for editing.
- `handleDelete(id)`: Confirms then deletes a material via API.
- `resetForm()`: Clears form state and resets editing ID.
- `openCreateModal()`: Resets form and opens modal for new material.
- `closeModal()`: Closes modal with a brief closing animation.
- `getYearLabel(year)`: Maps year number to Arabic label.
- `getYearBadge(year)`: Renders a colored badge for the academic year.
- `formatDate(date)`: Formats a date string using Arabic locale.
- `handleSort(key)`: Cycles sort state (asc → desc → none).
- `getSortIcon(key)`: Returns the appropriate sort arrow icon.
- `resetFilters()`: Clears year filter and sort config.

### 6. Integration
Calls backend REST API via `fetchAdminMaterials`, `createAdminMaterial`, `updateAdminMaterial`, `deleteAdminMaterial` at `/api/admin/materials`.

### 7. Imports Summary
- **External:** `react` (useState, useEffect, useMemo), `lucide-react` (BookOpen, Plus, Pencil, Trash2, Loader2, AlertCircle, X, Sparkles, Eye, EyeOff, Calendar, ArrowUpDown, ArrowUp, ArrowDown, Filter, GraduationCap, Hash)
- **Internal:** `../../utils/api` (fetchAdminMaterials, createAdminMaterial, updateAdminMaterial, deleteAdminMaterial)

### 8. Additional Info
Arabic RTL UI with dark mode support, animated modal (fade/scale in/out), loading spinner, error alerts, and empty-state sparkles illustration.

### 9. API
| Method | Endpoint | Request Body | Response |
|--------|----------|-------------|----------|
| GET | `/api/admin/materials` | — | Array of `{ materialId, materialName, materialYear, ... }` |
| POST | `/api/admin/materials` | `{ materialName, materialYear }` | Created material object |
| PUT | `/api/admin/materials/:id` | `{ materialName, materialYear }` | Updated material object |
| DELETE | `/api/admin/materials/:id` | — | (no content / success) |
