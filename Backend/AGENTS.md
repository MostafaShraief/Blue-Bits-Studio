# Backend AI Agent Instructions

Read `DATABASE.md`.

## Project Vision
This backend powers a **Unified Academic Workflow Platform**. It acts as a modular "Super App" where different features (Workflows) are dynamically managed, heavily relying on Role-Based Access Control (RBAC).

## Architecture & Database
- **Tech Stack:** C# .NET (Web API), Entity Framework Core, SQLite.
- **Dynamic Workflows:** Do **not** hardcode workflow logic to Database IDs (e.g., `WorkflowId == 3`). Always use the immutable `SystemCode` (e.g., `"LEC_EXT"`, `"BANK_QS"`) to bridge C# and the Database.
- **RBAC Matrix:** Access is strictly controlled via `WorkflowPermissions`. Users (`Admin`, `TechMember`, `ScientificMember`) can only access workflows tied to their role.
- **Session-Based State:** All user operations happen within a `Session` (tied to a User, Material, and Workflow).

## Coding Rules & Patterns
1. **API Responses:** When authenticating a user, the API must return a list of authorized `SystemCodes` (e.g., `["LEC_EXT", "PANDOC"]`). The frontend relies entirely on this array for UI rendering.
2. **File Management (Crucial):** Never rely solely on SQLite's `ON DELETE CASCADE` for physical files. Implement and maintain a C# `BackgroundService` (Garbage Collector) that nightly compares database `Files` records against physical disk files and deletes orphans.
3. **Admin Endpoints:** Admins cannot execute workflows. Admin endpoints should only provide CRUD for Users, Materials, and toggling `IsActive` on Workflows. Admin cannot delete system Workflows or Prompts (only update text or visibility).
4. **Error Logging:** Log exceptions with context: UserID, SystemCode, SessionID, and the exact physical file path if applicable.

## AI Prompt Instructions
When generating code for this backend:
- Always use `SystemCode` static constants instead of magic numbers.
- Ensure endpoints strictly validate the user's role against the `WorkflowPermissions` table before allowing any Session creation.

# Files

Update this section constantly for **any** minor change you do in each file.

how to do?:
```
You are an Explore Agent. Your task is to analyze the provided code file and generate a highly concise summary document.
You MUST keep your summary for each file strictly under 500 tokens (approx 1500 words). Make it as short, direct, and useful as possible.

FORMAT YOUR RESPONSE EXACTLY LIKE THIS:
## 1. File Name and Directory
[Filename and path]

### 2. File Type
[backend, frontend, library, testing, etc.]

### 3. What the file does
[Brief overview]

### 4. User Stories
- [Simple and short user story 1]
- [Simple and short user story 2]

### 5. Functions Summary
- \`functionName\`: [What it does]

### 6. Integration[Does it call backend APIs, interact with databases, or external services?]

### 7. Imports Summary
[Summary of internal and external imports]

### 8. Additional Info
[Any extra context, or "None"]
```

Also, you must update `Endpoint Reference` section if there is **any** change for any endpoint.

## Core & Infrastructure (Program.cs, DbContext, Constants, Models)

## 1. File Name and Directory
Backend/Program.cs

### 2. File Type
backend (entry point)

### 3. What the file does
Main entry point for the .NET Web API application. Configures and bootstraps the entire backend including JWT authentication, CORS, database context, static file serving, and minimal API endpoints.

### 4. User Stories
- Backend server starts and initializes all services
- API accepts authenticated requests via JWT tokens
- Static uploaded files are served under /uploads

### 5. Functions Summary
- `builder.Build()`: Creates the web application
- `AddAuthentication().AddJwtBearer()`: Configures JWT Bearer authentication
- `AddDbContext<BlueBitsDbContext>`: Registers EF Core with SQLite
- `app.MapControllers()`: Maps all MVC controllers
- `app.MapGroup("/api/pandoc")`: Maps Pandoc minimal endpoints
- `OrphanFileCleanupService`: Background service for file cleanup

### 6. Integration
- SQLite database (bluebits.db)
- JWT authentication (appsettings.json)
- Static file serving (uploads folder)

### 7. Imports Summary
- Microsoft.AspNetCore.Authentication.JwtBearer
- Microsoft.EntityFrameworkCore
- BlueBits.Api.Data, Endpoints, Services

### 8. Additional Info
Commented out HTTPS redirection for local development.

---

## 2. File Name and Directory
Backend/Data/BlueBitsDbContext.cs

### 2. File Type
backend (database context)

### 3. What the file does
Entity Framework Core DbContext that defines all database tables, relationships, constraints, and initial seed data for workflows, permissions, and prompts.

### 4. User Stories
- Database tables are created automatically
- System workflows are seeded on first run
- Role-based permissions are pre-configured

### 5. Functions Summary
- `OnModelCreating()`: Configures entities, constraints, relationships, and seed data
- `db.Database.EnsureCreated()`: Auto-creates database in Program.cs

### 6. Integration
- SQLite database via EF Core
- Seeds 8 workflows, 5 permissions, 6 prompts

### 7. Imports Summary
- Microsoft.EntityFrameworkCore
- BlueBits.Api.Models

### 8. Additional Info
Default admin user: Username=admin, Password=Admin@123

---

## 3. File Name and Directory
Backend/Constants/AppConstants.cs

### 2. File Type
backend (constants)

### 4. User Stories
- Standardizes SystemCode strings across C# and database

### 5. Functions Summary
- `AppWorkflows`: Static constants for workflow SystemCodes (LEC_EXT, BANK_EXT, etc.)
- `AppPrompts`: Static constants for prompt SystemCodes (PROMPT_LEC_EXT, etc.)

### 8. Additional Info
Matches seed data in BlueBitsDbContext.cs

---

## 4. File Name and Directory
Backend/Models/User.cs

### 2. File Type
backend (model/entity)

### 3. What the file does
Entity model representing platform users (Admin, TechMember, ScientificMember).

### 4. User Stories
- Users authenticate to access the platform
- Each user has a role determining workflow access

### 5. Functions Summary
- Properties: UserId, FirstName, LastName, UserRole, BatchNumber, Username, Password, TelegramUsername, TeamJoinDate

### 6. Integration
- One-to-many with Sessions

### 8. Additional Info
UserRole enum values: Admin, TechMember, ScientificMember

---

## 5. File Name and Directory
Backend/Models/Workflow.cs

### 2. File Type
backend (model/entity)

### 3. What the file does
Entity model representing system workflows (e.g., Lecture Extraction, Bank Questions).

### 4. User Stories
- Users can only access workflows they have permission for
- Workflows are identified by immutable SystemCode

### 5. Functions Summary
- Properties: WorkflowId, SystemCode, AdminNote, IsActive
- Navigation: Permissions, Prompts, Sessions

### 8. Additional Info
8 seeded workflows: LEC_EXT, BANK_EXT, LEC_COORD, BANK_COORD, PANDOC, BANK_QS, DRAW, MERGE

---

## Data Models (Session, Material, Prompt, File, Note)

## 6. File Name and Directory
Backend/Models/Session.cs

### 2. File Type
backend (model/entity)

### 3. What the file does
Entity representing a user's work session within a specific workflow and material. Tracks lecture number, type, and quiz data.

### 4. User Stories
- User starts a session to work on a specific lecture
- Sessions track progress and store generated files

### 5. Functions Summary
- Properties: SessionId, UserId, MaterialId, WorkflowId, LectureNumber, LectureType, QuizData, CreatedAt

### 6. Integration
- Foreign keys to User, Material, Workflow
- One-to-many with Files, Notes

### 8. Additional Info
LectureType values: Theoretical, Practical

---

## 7. File Name and Directory
Backend/Models/Material.cs

### 2. File Type
backend (model/entity)

### 3. What the file does
Entity representing a course material (subject/year).

### 4. User Stories
- Materials represent academic courses (e.g., Networks Year 2)

### 5. Functions Summary
- Properties: MaterialId, MaterialName, MaterialYear

### 8. Additional Info
MaterialYear constraint: 1-5

---

## 8. File Name and Directory
Backend/Models/Prompt.cs

### 2. File Type
backend (model/entity)

### 3. What the file does
Entity representing AI prompts tied to workflows. Each workflow has multiple prompt variants.

### 4. User Stories
- AI generates content based on prompt text for the workflow

### 5. Functions Summary
- Properties: PromptId, WorkflowId, SystemCode, PromptName, PromptText

### 6. Integration
- Foreign key to Workflow

### 8. Additional Info
6 seeded prompts in database

---

## 9. File Name and Directory
Backend/Models/File.cs

### 2. File Type
backend (model/entity)

### 3. What the file does
Entity representing uploaded/generated files associated with a session.

### 4. User Stories
- Users upload images or receive generated docx files

### 5. Functions Summary
- Properties: FileId, SessionId, LocalFilePath, FileType, OrderIndex

### 6. Integration
- Foreign key to Session
- One-to-many with Notes

### 8. Additional Info
FileType values: Image, Docx, Other

---

## 10. File Name and Directory
Backend/Models/Note.cs

### 2. File Type
backend (model/entity)

### 3. What the file does
Entity representing notes attached to sessions or specific files.

### 4. User Stories
- Users add general notes or file-specific notes to sessions

### 5. Functions Summary
- Properties: NoteId, SessionId, NoteText, NoteType, FileId

### 6. Integration
- Foreign keys to Session, File

### 8. Additional Info
NoteType values: GeneralNote, FileNote

---

## Permission Model & Auth Controllers

## 11. File Name and Directory
Backend/Models/WorkflowPermission.cs

### 2. File Type
backend (model/entity)

### 3. What the file does
Entity defining which roles can access which workflows (RBAC matrix).

### 4. User Stories
- TechMembers access LEC_EXT, BANK_EXT, LEC_COORD, BANK_COORD
- ScientificMembers access PANDOC

### 5. Functions Summary
- Properties: PermissionId, RoleName, WorkflowId

### 8. Additional Info
RoleName values: TechMember, ScientificMember

---

## 12. File Name and Directory
Backend/Controllers/AuthController.cs

### 2. File Type
backend (controller)

### 3. What the file does
Handles user authentication. Validates credentials and returns JWT with authorized SystemCodes.

### 4. User Stories
- User logs in with username/password
- LoginResponse includes authorized workflows array for UI rendering

### 5. Functions Summary
- `Login()`: Authenticates user, generates JWT, returns authorized workflows

### 6. Integration
- Queries WorkflowPermissions table to get authorized SystemCodes

### 8. Additional Info
Key endpoint: POST /api/auth/login

---

## 13. File Name and Directory
Backend/Controllers/SessionsController.cs

### 2. File Type
backend (controller)

### 3. What the file does
Manages user sessions - CRUD operations, file uploads, and prompt compilation.

### 4. User Stories
- User creates session for a specific workflow
- User uploads images to session with notes
- User retrieves compiled AI prompt

### 5. Functions Summary
- `GetSessions()`: List user's sessions
- `GetSession(id)`: Get session with files/notes/compiled prompt
- `CreateSession()`: Create new session (validates workflow permission)
- `UploadFiles(id)`: Upload files with optional notes

### 6. Integration
- Validates role permissions before session creation
- Calls PromptCompilationService for AI prompts
- Saves files to uploads/sessions/{id}/

### 8. Additional Info
Key endpoints: GET/POST /api/sessions, POST /api/sessions/{id}/files

---

## 14. File Name and Directory
Backend/Controllers/AdminController.cs

### 2. File Type
backend (controller)

### 3. What the file does
Admin-only CRUD for user management.

### 4. User Stories
- Admin creates/updates/deletes users
- Admin resets passwords

### 5. Functions Summary
- `GetUsers()`: List all users
- `CreateUser()`: Create new user
- `UpdateUser(id)`: Update user details
- `DeleteUser(id)`: Delete user

### 8. Additional Info
Admin-only: Requires Role=Admin. Key endpoints: /api/admin/users

---

## 15. File Name and Directory
Backend/Controllers/AdminWorkflowsController.cs

### 2. File Type
backend (controller)

### 3. What the file does
Admin-only workflow visibility toggle.

### 4. User Stories
- Admin enables/disables workflows (not delete)

### 5. Functions Summary
- `GetAll()`: List all workflows
- `ToggleActive(id)`: Toggle workflow IsActive flag

### 8. Additional Info
Admin-only: Cannot delete system workflows. Key endpoint: PUT /api/admin/workflows/{id}/toggle

---

## Admin Controllers (Materials, Prompts, Permissions)

## 16. File Name and Directory
Backend/Controllers/AdminMaterialsController.cs

### 2. File Type
backend (controller)

### 3. What the file does
Admin-only CRUD for managing academic materials (subjects/years).

### 4. User Stories
- Admin creates/updates/deletes materials

### 5. Functions Summary
- `GetAll()`: List all materials
- `GetById(id)`: Get material by ID
- `Create()`: Create new material
- `Update(id)`: Update material
- `Delete(id)`: Delete material

### 8. Additional Info
Key endpoints: /api/admin/materials. MaterialYear: 1-5

---

## 17. File Name and Directory
Backend/Controllers/AdminPromptsController.cs

### 2. File Type
backend (controller)

### 3. What the file does
Admin-only update for prompt text (cannot delete system prompts).

### 4. User Stories
- Admin updates AI prompt text for workflows

### 5. Functions Summary
- `GetAll()`: List all prompts
- `UpdatePromptText(id)`: Update prompt text

### 8. Additional Info
Cannot delete system prompts. Key endpoint: PUT /api/admin/prompts/{id}

---

## 18. File Name and Directory
Backend/Controllers/AdminPermissionsController.cs

### 2. File Type
backend (controller)

### 3. What the file does
Admin-only RBAC management - mapping roles to workflows.

### 4. User Stories
- Admin assigns workflows to TechMember/ScientificMember roles

### 5. Functions Summary
- `GetAll()`: List all role-workflow mappings
- `Create()`: Create new mapping (validates role)
- `Delete(id)`: Remove mapping

### 8. Additional Info
Validates role values (TechMember/ScientificMember). Key endpoints: /api/admin/permissions

---

## 19. File Name and Directory
Backend/Controllers/PromptsController.cs

### 2. File Type
backend (controller)

### 3. What the file does
User-facing prompt retrieval and compilation.

### 4. User Stories
- User gets compiled AI prompt for a session
- User compiles custom prompt with notes

### 5. Functions Summary
- `GetPromptForSession(sessionId, systemCode)`: Get prompt for workflow
- `CompilePrompt()`: Compile custom prompt with notes

### 6. Integration
- Calls PromptCompilationService

### 8. Additional Info
Key endpoints: GET /api/prompts/{sessionId}/{systemCode}, POST /api/prompts/compile

---

## 20. File Name and Directory
Backend/Controllers/MaterialsController.cs

### 2. File Type
backend (controller)

### 3. What the file does
User-facing material listing.

### 4. User Stories
- User views available materials

### 5. Functions Summary
- `GetMaterials()`: List distinct material names

### 8. Additional Info
Key endpoint: GET /api/materials

---

## Endpoints & Services

## 21. File Name and Directory
Backend/Endpoints/PandocEndpoints.cs

### 2. File Type
backend (minimal API endpoint)

### 3. What the file does
Converts Markdown to formatted DOCX using Pandoc, with equation processing and template merging.

### 4. User Stories
- User submits Markdown text
- Service converts to DOCX with math equations ({{{a/b}}}) and professional template

### 5. Functions Summary
- `MapPandocEndpoints()`: Maps /api/pandoc/generate endpoint
- `ProcessEquations()`: Converts {{{x/y}}} to Office Math
- `MergeWithTemplate()`: Merges content with cover/back template

### 6. Integration
- Calls external `pandoc` CLI
- Uses DocumentFormat.OpenXml for DOCX manipulation
- Templates from Resources/PandocTemplates/

### 8. Additional Info
Key endpoint: POST /api/pandoc/generate

---

## 22. File Name and Directory
Backend/Endpoints/MergeEndpoints.cs

### 2. File Type
backend (minimal API endpoint)

### 3. What the file does
Merges multiple DOCX files into a single document with proper page breaks and formatting.

### 4. User Stories
- User uploads multiple DOCX files
- Service merges with cover/template

### 5. Functions Summary
- `MapMergeEndpoints()`: Maps /api/merge endpoints
- `/test`: Health check
- `/execute`: Merge files with template

### 8. Additional Info
Key endpoint: POST /api/merge/execute

---

## 23. File Name and Directory
Backend/Services/PromptCompilationService.cs

### 2. File Type
backend (service)

### 3. What the file does
Compiles AI prompts by combining base prompt text with user notes.

### 4. User Stories
- User requests compiled prompt
- Service combines workflow prompt with notes

### 5. Functions Summary
- `CompilePromptAsync(systemCode, generalNotes, fileNotes)`: Returns combined prompt

### 6. Integration
- Queries Prompts table by SystemCode

### 8. Additional Info
Interface: IPromptCompilationService

---

## 24. File Name and Directory
Backend/Services/OrphanFileCleanupService.cs

### 2. File Type
backend (BackgroundService)

### 3. What the file does
Background service that runs daily, compares DB File records with physical disk files and deletes orphans.

### 4. User Stories
- System runs nightly cleanup
- Orphan files are deleted automatically

### 5. Functions Summary
- `ExecuteAsync()`: Runs cleanup loop every 24 hours
- `CleanupOrphanFilesAsync()`: Finds and deletes orphan files

### 6. Integration
- Queries Files table via DbContext

### 8. Additional Info
Registered in Program.cs as hosted service

---

## 25. File Name and Directory
Backend/BlueBits.Api.csproj

### 2. File Type
backend (project file)

### 3. What the file does
.NET 9 Web API project configuration.

### 4. User Stories
- Defines project dependencies and build settings

### 5. Functions Summary
- NuGet packages: DocumentFormat.OpenXml, JwtBearer, EF Core SQLite, OpenApi

### 8. Additional Info
TargetFramework: net9.0

---

# Endpoint Reference

All API endpoints with request/response structures.

## Auth Endpoints

### POST /api/auth/login
**Source File:** Controllers/AuthController.cs

**Request Body:**
```json
{
  "Username": "string",
  "Password": "string"
}
```

**Response Body (200 OK):**
```json
{
  "Token": "string",
  "UserId": "int",
  "Username": "string",
  "FirstName": "string",
  "LastName": "string",
  "Role": "string",
  "AuthorizedWorkflows": ["string"]
}
```

**Error Responses:** 401 Unauthorized

---

## Sessions Endpoints

### GET /api/sessions
**Source File:** Controllers/SessionsController.cs

**Headers:** Authorization: Bearer {token}

**Response Body (200 OK):**
```json
[
  {
    "id": "int",
    "materialName": "string",
    "lectureNumber": "int",
    "type": "string",
    "workflowType": "string",
    "quizData": "string?",
    "createdAt": "string"
  }
]
```

---

### GET /api/sessions/{id}
**Source File:** Controllers/SessionsController.cs

**Response Body (200 OK):**
```json
{
  "id": "int",
  "sessionId": "int",
  "UserId": "int",
  "MaterialId": "int?",
  "WorkflowId": "int",
  "lectureNumber": "int",
  "lectureType": "string",
  "quizData": "string?",
  "createdAt": "string",
  "User": { "UserId": "int", "FirstName": "string", ... },
  "Material": { "MaterialId": "int", "MaterialName": "string", ... } | null,
  "Workflow": { "WorkflowId": "int", "SystemCode": "string", ... },
  "Files": [{ "FileId": "int", "LocalFilePath": "string", "FileType": "string", ... }],
  "Notes": [{ "NoteId": "int", "NoteText": "string", "NoteType": "string", ... }],
  "compiledPrompt": "string"
}
```

---

### POST /api/sessions
**Source File:** Controllers/SessionsController.cs

**Request Body:**
```json
{
  "WorkflowSystemCode": "string",
  "MaterialName": "string",
  "LectureNumber": "int",
  "LectureType": "string",
  "QuizData": "string?",
  "GeneralNotes": "string?"
}
```

**Response Body (201 Created):**
```json
{
  "SessionId": "int",
  "WorkflowId": "int"
}
```

**Error Responses:** 400 BadRequest, 403 Forbidden

---

### POST /api/sessions/{id}/files
**Source File:** Controllers/SessionsController.cs

**Content-Type:** multipart/form-data

**Request Body (Form Data):**
```
files: [File..., File...]
notes: ["string?", "string?"]
```

**Response Body (200 OK):** Empty

**Error Responses:** 400 BadRequest, 403 Forbidden, 404 NotFound

---

## Admin - Users Endpoints

### GET /api/admin/users
**Source File:** Controllers/AdminController.cs

**Headers:** Authorization: Bearer {token}, Requires Role=Admin

**Response Body (200 OK):**
```json
[
  { "UserId": "int", "FirstName": "string", "LastName": "string", "UserRole": "string", ... }
]
```

---

### POST /api/admin/users
**Source File:** Controllers/AdminController.cs

**Request Body:**
```json
{
  "FirstName": "string",
  "LastName": "string",
  "UserRole": "string",
  "BatchNumber": "int",
  "Username": "string",
  "Password": "string",
  "TelegramUsername": "string?",
  "TeamJoinDate": "string?"
}
```

**Response Body (201 Created):**
```json
{ "UserId": "int", ... }
```

---

### PUT /api/admin/users/{id}
**Source File:** Controllers/AdminController.cs

**Request Body:**
```json
{
  "FirstName": "string",
  "LastName": "string",
  "UserRole": "string",
  "BatchNumber": "int",
  "TelegramUsername": "string?",
  "Password": "string?"
}
```

**Response Body (200 OK):**
```json
{ "UserId": "int", ... }
```

---

### DELETE /api/admin/users/{id}
**Source File:** Controllers/AdminController.cs

**Response Body (204 No Content):** Empty

---

## Admin - Workflows Endpoints

### GET /api/admin/workflows
**Source File:** Controllers/AdminWorkflowsController.cs

**Response Body (200 OK):**
```json
[
  { "WorkflowId": "int", "SystemCode": "string", "AdminNote": "string", "IsActive": "int" }
]
```

---

### PUT /api/admin/workflows/{id}/toggle
**Source File:** Controllers/AdminWorkflowsController.cs

**Request Body:**
```json
{
  "IsActive": "boolean"
}
```

**Response Body (200 OK):**
```json
{ "WorkflowId": "int", "SystemCode": "string", "AdminNote": "string", "IsActive": "int" }
```

---

## Admin - Materials Endpoints

### GET /api/admin/materials
**Source File:** Controllers/AdminMaterialsController.cs

**Response Body (200 OK):**
```json
[
  { "MaterialId": "int", "MaterialName": "string", "MaterialYear": "int" }
]
```

---

### POST /api/admin/materials
**Source File:** Controllers/AdminMaterialsController.cs

**Request Body:**
```json
{
  "MaterialName": "string",
  "MaterialYear": "int"
}
```

**Response Body (201 Created):**
```json
{ "MaterialId": "int", ... }
```

---

### PUT /api/admin/materials/{id}
**Source File:** Controllers/AdminMaterialsController.cs

**Request Body:**
```json
{
  "MaterialName": "string",
  "MaterialYear": "int"
}
```

**Response Body (200 OK):**
```json
{ "MaterialId": "int", ... }
```

---

### DELETE /api/admin/materials/{id}
**Source File:** Controllers/AdminMaterialsController.cs

**Response Body (204 No Content):** Empty

---

## Admin - Prompts Endpoints

### GET /api/admin/prompts
**Source File:** Controllers/AdminPromptsController.cs

**Response Body (200 OK):**
```json
[
  { "PromptId": "int", "WorkflowId": "int", "SystemCode": "string", "PromptName": "string", "PromptText": "string" }
]
```

---

### PUT /api/admin/prompts/{id}
**Source File:** Controllers/AdminPromptsController.cs

**Request Body:**
```json
{
  "PromptText": "string"
}
```

**Response Body (200 OK):**
```json
{ "PromptId": "int", ... }
```

---

## Admin - Permissions Endpoints

### GET /api/admin/permissions
**Source File:** Controllers/AdminPermissionsController.cs

**Response Body (200 OK):**
```json
[
  { "PermissionId": "int", "RoleName": "string", "WorkflowId": "int", "Workflow": { ... } }
]
```

---

### POST /api/admin/permissions
**Source File:** Controllers/AdminPermissionsController.cs

**Request Body:**
```json
{
  "RoleName": "string",
  "WorkflowId": "int"
}
```

**Response Body (201 Created):**
```json
{ "PermissionId": "int", ... }
```

**Error Responses:** 400 BadRequest

---

### DELETE /api/admin/permissions/{id}
**Source File:** Controllers/AdminPermissionsController.cs

**Response Body (204 No Content):** Empty

---

## Prompts Endpoints

### GET /api/prompts/{sessionId}/{systemCode}
**Source File:** Controllers/PromptsController.cs

**Response Body (200 OK):**
```json
{
  "PromptText": "string",
  "PromptName": "string"
}
```

---

### POST /api/prompts/compile
**Source File:** Controllers/PromptsController.cs

**Request Body:**
```json
{
  "systemCode": "string",
  "GeneralNotes": "string?",
  "FileNotes": ["string?"]
}
```

**Response Body (200 OK):**
```json
{
  "CompiledPrompt": "string"
}
```

---

## Materials Endpoints

### GET /api/materials
**Source File:** Controllers/MaterialsController.cs

**Response Body (200 OK):**
```json
["string", "string", ...]
```

---

## Pandoc Endpoints

### POST /api/pandoc/generate
**Source File:** Endpoints/PandocEndpoints.cs

**Request Body:**
```json
{
  "MarkdownText": "string",
  "TemplateName": "string?",
  "MaterialName": "string?",
  "Type": "string?",
  "LectureNumber": "string?"
}
```

**Response Body (200 OK):**
```json
{
  "fileUrl": "string"
}
```

**Error Responses:** 400 BadRequest

---

## Merge Endpoints

### GET /api/merge/test
**Source File:** Endpoints/MergeEndpoints.cs

**Response Body (200 OK):** "string"

---

### POST /api/merge/execute
**Source File:** Endpoints/MergeEndpoints.cs

**Content-Type:** multipart/form-data

**Request Body (Form Data):**
```
files: [File..., File...]
materialName: "string"
lectureType: "string?"  // "theoretical" or "practical"
```

**Response Body (200 OK):**
```json
{
  "url": "string",
  "finalFileName": "string"
}
```

**Error Responses:** 400 BadRequest, 404 NotFound