## 1. File Name and Directory
`Frontend/src/types/models.d.ts`

### 2. File Type
Frontend — TypeScript type definitions

### 3. What the file does
Defines TypeScript interfaces for all domain models used across the frontend: `Material`, `Workflow`, `File`, `Note`, `SessionContent`, `Session`, and `SessionSummary`. These mirror backend DTOs and ensure type safety when handling API responses.

### 4. User Stories
- As a developer, I can type-check all API response data against these interfaces.
- As a developer, I can navigate related session data (material, workflow, notes, files) via optional navigational properties on `Session`.

### 5. Functions Summary
None — this file contains only type definitions, no runtime code.

### 6. Integration
Does not call APIs or databases directly. Used across the frontend to type responses from the backend REST API.

### 7. Imports Summary
No imports. These are standalone interface declarations meant to be imported by other frontend modules via `import type { ... }`.

### 8. Additional Info
- `Session.compiledPrompt` is an optional string likely populated by a backend endpoint after prompt compilation.
- `File.fileType` is restricted to `'Image' | 'Docx' | 'Other'`.
- `Note.noteType` is restricted to `'GeneralNote' | 'FileNote'`.
- `isActive` on `Workflow` is typed as `number` (0/1) rather than `boolean`, matching SQLite convention.

### 9. API
Frontend fetches data from REST endpoints (e.g., `GET /api/session/{id}`) and casts the JSON response to these interfaces. No request/response transformation is handled here — models are direct mappings of backend DTOs.
