## 1. File Name and Directory
`Backend/Endpoints/MergeEndpoints.cs`

### 2. File Type
Backend

### 3. What the file does
Provides a POST `/execute` endpoint that merges multiple uploaded DOCX files into a single document using a Pandoc template (theoretical or practical). Strips cover pages from each input file, injects content via OpenXML AltChunk, applies template page layout consistently, and returns a download URL.

### 4. User Stories
- As a user, I can upload multiple DOCX files and merge them into one formatted document with proper margins and page breaks.
- As a user, I can select a lecture type (theoretical/practical) to apply the correct Pandoc template.

### 5. Functions Summary
- `MapMergeEndpoints`: Registers GET `/test` (health check) and POST `/execute` (document merge) endpoints on a route group.

### 6. Integration
No database calls. Interacts with the file system (uploads directory, Pandoc templates in `../Resources/PandocTemplates/`). Uses OpenXML SDK for DOCX manipulation.

### 7. Imports Summary
- **External**: `Microsoft.AspNetCore.Mvc`, `DocumentFormat.OpenXml`, `DocumentFormat.OpenXml.Packaging`, `DocumentFormat.OpenXml.Wordprocessing`

### 8. Additional Info
- Antiforgery is disabled on the POST endpoint.
- Uses `AltChunk` for efficient document merging.
- Template files: `Pandoc-Theo-Final-Step.dotx` (theoretical) / `Pandoc-Prac-Final-Step.dotx` (practical).
