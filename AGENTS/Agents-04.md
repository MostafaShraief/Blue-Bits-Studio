## 1. File Name and Directory
Frontend/src/components/common/MaterialAutocomplete.jsx

### 2. File Type
Frontend — Reusable React component

### 3. What the file does
A controlled autocomplete input for selecting a material from a server-fetched list. As the user types, it filters suggestions, shows success/error inline icons, and validates the selection against the known list. Exposes validity changes to the parent via `onValidChange` callback.

### 4. User Stories
- As a user filling a form, I type a material name and see matching suggestions filtered in real time.
- As a form designer, I use `onValidChange` to know whether the selected material is valid without extra logic.

### 5. Functions Summary
- `MaterialAutocomplete({ value, onChange, label, required, onValidChange })`: Main component — renders label, input with validation icons, dropdown list, and error messages. Manages open/close state, click-outside dismissal, and material fetching on mount.

### 6. Integration
Calls `fetchMaterials()` from `utils/api` on mount — this hits `GET /api/materials` (with client-side caching). No database or external service calls.

### 7. Imports Summary
- **External:** `react` (useState, useEffect, useRef, useMemo, useCallback)
- **Internal:** `fetchMaterials` from `../../utils/api`

### 8. Additional Info
Arabic-first: label defaults to `"اسم المادة"`, placeholder is `"اكتب أو اختر اسم المادة..."`, error message is Arabic. Uses logical Tailwind properties (`end-3`). Validation is done client-side by comparing the input value against the fetched materials list (case-insensitive).

### 9. API
**Request:** `GET /api/materials` — no body, no params.
**Response:** Array of strings (`["مادة 1", "مادة 2", ...]`) — the full list of valid material names. The component caches the result client-side via `apiCache`.
