## 1. File Name and Directory
Frontend/src/pages/MergeWizard.jsx

### 2. File Type
Frontend — Page component (Wizard)

### 3. What the file does
A 3-step wizard that lets users set session metadata (material, type, lecture number), upload and reorder multiple .docx files, then merge them into a single combined Word document for download.

### 4. User Stories
- As a user, I want to merge several .docx files in a specific order into one file.
- As a user, I want to reorder, add, or remove files before merging, and download the result.

### 5. Functions Summary
- `MergeWizard`: Main component — manages 3-step wizard state (session setup → file upload/reorder → merge & download)
- `goNext/goBack`: Navigate between wizard steps
- `getTypeLabel`: Returns Arabic label for lecture type ("نظري" / "عملي")
- `handleFileSelect`: Filters and appends selected .docx files to state
- `removeFile`: Removes a file by index
- `moveFile`: Swaps file position (move up/down) for reordering
- `handleMerge`: Calls `mergeDocxFiles` API, creates an object URL from the returned blob, sets success/error status
- `getDownloadFileName`: Generates Arabic download filename from material name and type

### 6. Integration
Calls backend via `mergeDocxFiles` utility: sends multipart FormData (`files[]`, `materialName`, `lectureType`) to `/api/merge/execute`, then fetches the returned file URL to obtain the merged .docx blob.

### 7. Imports Summary
- **External:** `react` (useState, useRef), `lucide-react` (Layers, Upload, Loader2, File, Download, ArrowUp, ArrowDown, X, CheckCircle2)
- **Internal:** `WizardStepper` (step indicator), `MaterialAutocomplete` (material name selector), `mergeDocxFiles` from `utils/api`, `useSettings` from `contexts/SettingsContext`

### 8. Additional Info
Arabic-first RTL interface. Uses MaterialAutocomplete which fetches materials from backend via settings context. Status machine: idle → loading → success/error. Uses `URL.createObjectURL` for client-side download without server-side file persistence.

### 9. API
**Request:** `POST /api/merge/execute` with `Content-Type: multipart/form-data`
- Body: `files[]` (FileList), `materialName` (string), `lectureType` (string)
**Response:** `{ url: string }` — URL to the generated .docx file
**Client flow:** Fetches the URL → converts to blob → creates object URL → renders `<a download>` for user to save.
