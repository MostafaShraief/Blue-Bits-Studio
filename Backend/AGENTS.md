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

## 1. File Name and Directory
`Backend/Program.cs`

### 2. File Type
Backend — ASP.NET Core Web API entry point (top-level statements)

### 3. What the file does
Bootstraps the API: registers services (Serilog, JWT auth, EF Core SQLite, CORS, compression, Swagger, Rate Limiting, FluentValidation), configures middleware pipeline (CORS, compression, rate limiter, auth, static files), maps controllers and minimal API endpoints (Pandoc, Merge), ensures DB creation on startup, and serves uploaded files from `/uploads`.

### 4. User Stories
- As a user, I authenticate via JWT to access protected API endpoints.
- As a non-Admin user, I can execute workflow endpoints (Pandoc, Merge) without being blocked.
- As an Admin, I am denied access to all workflow endpoints via WorkflowPolicy.
- As a developer, the app auto-creates the SQLite DB and serves uploaded files on startup.
- As a developer, I can view API documentation and test endpoints via Swagger UI.
- As a developer, all requests are logged through Serilog to console and rolling files.

### 5. Functions Summary
Top-level statements (no named functions). Key logic blocks:
- Bootstrap logger: Serilog writes to Console and rolling file (`logs/bluebits-.log`)
- Service registration: Controllers, JWT auth, DbContext, CORS, compression, Swagger, Rate Limiting (FixedWindow 100/min), FluentValidation auto-validation, `IPromptCompilationService`, `OrphanFileCleanupService`
- Middleware pipeline: CORS → ResponseCompression → RateLimiter → Auth → StaticFiles → Controllers → Minimal endpoints
- `db.Database.EnsureCreated()`: Auto-creates SQLite DB
- Fatal exception caught at top-level with `Log.Fatal` / `Log.CloseAndFlush`
- `MapPandocEndpoints` / `MapMergeEndpoints`: Minimal API groups secured with `WorkflowPolicy`

### 6. Integration
- **Database:** SQLite via EF Core (`BlueBitsDbContext`)
- **Auth:** JWT bearer tokens (Issuer, Audience, SymmetricKey from config)
- **Background Service:** `OrphanFileCleanupService` for nightly file cleanup
- **Logging:** Serilog (Console + rolling File sinks)
- **Static Files:** Serves physical files from `./uploads/` at `/uploads` URL path

### 7. Imports Summary
- **External:** `Microsoft.AspNetCore.Authentication.JwtBearer`, `Microsoft.IdentityModel.Tokens`, `System.Security.Claims`, `System.Text`, `Microsoft.EntityFrameworkCore`, `Serilog`, `Microsoft.AspNetCore.RateLimiting`, `System.Threading.RateLimiting`, `FluentValidation.AspNetCore`
- **Internal:** `BlueBits.Api.Data`, `BlueBits.Api.Endpoints`, `BlueBits.Api.Services`

### 8. Additional Info
Uses C# 10 top-level statements. `WorkflowPolicy` blocks Admin but allows all other roles dynamically — new roles work automatically without code changes. HTTPS redirection is commented out for dev convenience. `ClockSkew` is set to zero for tighter JWT security. Swagger replaces the previous `Microsoft.AspNetCore.OpenApi` / `MapOpenApi` setup.
## 1. File Name and Directory
`Backend/Constants/AppConstants.cs`

### 2. File Type
Backend (C# .NET static constants)

### 3. What the file does
Defines immutable SystemCode string constants used to bridge C# code with the database. Contains two static classes: `AppWorkflows` (8 workflow types like lecture extraction, bank extraction, pandoc, etc.) and `AppPrompts` (6 prompt types tied to workflows).

### 4. User Stories
- As a developer, I want to reference workflows by `SystemCode` instead of magic numbers or DB IDs so the code stays decoupled from the database.
- As a developer, I want to map prompt types to workflows using consistent `SystemCode` constants so prompts and workflows stay in sync.

### 5. Functions Summary
No functions — the file contains only `public const string` field declarations.

### 6. Integration
Does not call APIs or databases directly. Provides string constants consumed throughout the backend (controllers, services, RBAC checks).

### 7. Imports Summary
No external imports. Uses only `namespace BlueBits.Api.Constants`.

### 8. Additional Info
Central reference point for the `SystemCode` pattern described in `Backend/AGENTS.md`. Any new workflow or prompt must add its constant here first.
## 1. File Name and Directory
`Backend/Controllers/AdminController.cs`

### 2. File Type
Backend — C# .NET Web API Controller

### 3. What the file does
Provides Admin-only CRUD endpoints for managing users. Admins can list, create, update, and delete users. Uses `CreateUserRequest` / `UpdateUserRequest` DTOs with validation. Enforces unique `TelegramUsername + UserRole` combinations and auto-prepends `@` to Telegram usernames.

### 4. User Stories
- As an Admin, I can view all registered users in the system.
- As an Admin, I can create a new user with a validated username and password.
- As an Admin, I can update a user's profile (password optional) and prevent duplicate Telegram+Role combos.
- As an Admin, I can delete a user from the system.

### 5. Functions Summary
- `GetUsers()`: Returns all users from the database.
- `CreateUser(CreateUserRequest)`: Validates input, checks Telegram+Role uniqueness, creates a user.
- `UpdateUser(int, UpdateUserRequest)`: Validates input, checks uniqueness excluding current user, updates fields (password/join date optional).
- `DeleteUser(int)`: Finds and removes a user by ID.

### 6. Integration
Interacts directly with `BlueBitsDbContext` (SQLite via EF Core). No external APIs or services.

### 7. Imports Summary
- **External:** `Microsoft.AspNetCore.Authorization`, `Mvc`, `EntityFrameworkCore`, `Logging`, `System.ComponentModel.DataAnnotations`
- **Internal:** `BlueBits.Api.Data` (DbContext), `BlueBits.Api.Models` (User entity)

### 8. Additional Info
- Controller is restricted to `[Authorize(Roles = "Admin")]`.
- DTOs are defined in the same file, separate from the entity to avoid validation conflicts.
- Telegram username duplication check is role-scoped (same Telegram + same role = conflict; same Telegram + different role = allowed).
## 1. File Name and Directory
`Backend/Controllers/AdminMaterialsController.cs`

### 2. File Type
Backend (C# .NET Web API Controller)

### 3. What the file does
Provides full CRUD (Create, Read, Update, Delete) for the `Material` entity through RESTful endpoints, restricted to users with the `Admin` role.

### 4. User Stories
- As an Admin, I can list all materials to manage them.
- As an Admin, I can view, create, update, or delete a specific material.

### 5. Functions Summary
- `GetAll()`: Returns all materials.
- `GetById(int id)`: Returns a single material by ID, or 404.
- `Create(Material material)`: Creates a new material, returns 201 with location header.
- `Update(int id, Material updated)`: Updates `MaterialName` and `MaterialYear`, returns the updated material.
- `Delete(int id)`: Deletes a material, returns 204 No Content.

### 6. Integration
Interacts with a SQLite database via Entity Framework Core (`BlueBitsDbContext.Materials` DbSet).

### 7. Imports Summary
- **ASP.NET Core:** `Authorize`, `ApiController`, `Route`, `HttpGet/Post/Put/Delete`, `FromBody`, `IActionResult`, `ControllerBase`
- **EF Core:** `ToListAsync`, `FindAsync`, `SaveChangesAsync`
- **Internal:** `BlueBitsDbContext` (Data), `Material` (Models)

### 8. Additional Info
- Entire controller decorated with `[Authorize(Roles = "Admin")]` — no non-admin access.
- Route prefix: `api/admin/materials`.
- All methods are async.
- Update only modifies `MaterialName` and `MaterialYear`, not all fields.
You are an Explore Agent. Your task is to analyze the provided code file and generate a highly concise summary document.
You MUST keep your summary for each file strictly under 500 tokens (approx 1500 words). Make it as short, direct, and useful as possible.

FORMAT YOUR RESPONSE EXACTLY LIKE THIS:
## 1. File Name and Directory
`Backend/Controllers/AdminPermissionsController.cs`

### 2. File Type
Backend — ASP.NET Core Web API Controller

### 3. What the file does
Admin-only CRUD controller for `WorkflowPermissions` (RBAC mappings between roles and workflows). Admins can list all permission mappings, create new role-to-workflow grants, and delete existing ones.

### 4. User Stories
- As an Admin, I can view all role-to-workflow permission mappings to audit who can access what.
- As an Admin, I can grant a `TechMember` or `ScientificMember` role access to a specific workflow.
- As an Admin, I can revoke a role's access to a workflow by deleting the permission mapping.

### 5. Functions Summary
- `GetAll()`: GET `/api/admin/permissions` — Returns all `WorkflowPermissions` with included `Workflow` nav property.
- `Create(CreatePermissionRequest)`: POST `/api/admin/permissions` — Creates a permission after validating roleName and checking for duplicates.
- `Delete(int id)`: DELETE `/api/admin/permissions/{id}` — Deletes a permission by ID; returns 404 if not found.

### 6. Integration
Directly queries and mutates `WorkflowPermissions` via `BlueBitsDbContext` (EF Core / SQLite).

### 7. Imports Summary
- `Microsoft.AspNetCore.Authorization`, `Microsoft.AspNetCore.Mvc` — ASP.NET Core attributes and base classes.
- `Microsoft.EntityFrameworkCore` — For `.Include()` and async queries.
- `BlueBits.Api.Data`, `BlueBits.Api.Models` — Internal DbContext and `WorkflowPermission` entity.

### 8. Additional Info
- Restricted to `Admin` role via `[Authorize(Roles = "Admin")]`.
- Accepts only `TechMember` or `ScientificMember` as valid role names.
- Nested DTO `CreatePermissionRequest` uses `required` keyword (C# 11+).
## 1. File Name and Directory
`Backend/Controllers/AdminPromptsController.cs`

### 2. File Type
Backend (C# ASP.NET Core API Controller)

### 3. What the file does
Admin-only CRUD controller for managing AI prompt templates. Exposes two endpoints — list all prompts and update a prompt's text. Restricted exclusively to the `Admin` role.

### 4. User Stories
- As an Admin, I want to view all system prompts so I can review current AI prompt configurations.
- As an Admin, I want to update the text of a specific prompt so I can refine AI assistant behavior.

### 5. Functions Summary
- `GetAll()`: Returns every prompt record from the database via `Prompts.ToListAsync()`.
- `UpdatePromptText(int id)`: Finds a prompt by primary key, sets `PromptText` from the request body, and persists changes.

### 6. Integration
Directly interacts with the SQLite database through Entity Framework Core (`BlueBitsDbContext.Prompts`). No external API or service calls.

### 7. Imports Summary
- `Microsoft.AspNetCore.Authorization` / `Mvc`: ASP.NET Core auth filters and MVC controller base.
- `Microsoft.EntityFrameworkCore`: EF Core for async database queries.
- `BlueBits.Api.Data` / `Models`: Internal DbContext (`BlueBitsDbContext`) and entity models.

### 8. Additional Info
- Guarded by `[Authorize(Roles = "Admin")]` — strictly Admin-only.
- `UpdatePromptRequest` is an inline DTO with a single `PromptText` property.
- No delete endpoint — admins cannot delete prompts, in line with backend design rules.
## 1. File Name and Directory
`Backend/Controllers/AdminWorkflowsController.cs`

### 2. File Type
Backend — C# .NET Web API Controller

### 3. What the file does
Admin-only REST controller for managing workflows. Lists all workflows and toggles their `IsActive` status. Strictly adheres to the backend rule that admins cannot execute workflows — only perform CRUD toggles.

### 4. User Stories
- As an **Admin**, I can view all workflows in the system.
- As an **Admin**, I can enable or disable a workflow to control its availability.

### 5. Functions Summary
- `GetAll()`: Returns all workflows from the database.
- `ToggleActive(int id, ToggleWorkflowRequest req)`: Sets `IsActive` on a workflow by its ID.

### 6. Integration
Interacts directly with the SQLite database via Entity Framework Core (`BlueBitsDbContext`). No external API or service calls.

### 7. Imports Summary
- **ASP.NET Core**: `Authorize`, `ApiController`, `ControllerBase`, `HttpGet`, `HttpPut`, `FromBody`, `Route`, `IActionResult`
- **EF Core**: `DbContext`, `FindAsync`, `ToListAsync`
- **Internal**: `BlueBitsDbContext` (data context), `Workflow` (model)

### 8. Additional Info
- Role-locked to `Admin` via `[Authorize(Roles = "Admin")]`.
- Contains inline DTO `ToggleWorkflowRequest` with a single `bool IsActive` property.
- No session creation or workflow execution — strictly administrative toggle.
## 1. File Name and Directory
`Backend/Controllers/AuthController.cs`

### 2. File Type
Backend (C# .NET Web API Controller)

### 3. What the file does
Handles user authentication (login) and authorization (get current user). Issues JWT tokens, returns user profile + RBAC-based authorized workflow SystemCodes.

### 4. User Stories
- As a user, I can log in with my username/password and receive a JWT token along with my authorized workflows.
- As an authenticated user, I can retrieve my current profile and fresh permissions via a token-based endpoint.

### 5. Functions Summary
- `Login`: Validates credentials against DB, fetches authorized workflows via RBAC (`WorkflowPermissions`), generates & returns JWT + user profile.
- `GetCurrentUser`: Extracts user ID from JWT claims, fetches user profile and fresh authorized workflows from DB.

### 6. Integration
Interacts with SQLite via EF Core (`BlueBitsDbContext`). Reads JWT settings (`Key`, `ExpireDays`, `Issuer`, `Audience`) from `IConfiguration`.

### 7. Imports Summary
**External:** `Microsoft.AspNetCore.Authorization`, `Mvc`, `EntityFrameworkCore`; `Microsoft.IdentityModel.Tokens`; `System.IdentityModel.Tokens.Jwt`; `System.Security.Claims`; `System.Text`.  
**Internal:** `BlueBits.Api.Data` (`BlueBitsDbContext`).

### 8. Additional Info
- Passwords compared in plaintext (no hashing).
- `AuthorizedWorkflows` (list of SystemCodes) is the RBAC contract consumed by the frontend for dynamic UI rendering.
- `LoginRequest` and `LoginResponse` DTOs are defined at the bottom of the same file.
## 1. File Name and Directory
`Backend/Controllers/MaterialsController.cs`

### 2. File Type
Backend

### 3. What the file does
Provides an authenticated API endpoint that returns a distinct, alphabetically sorted list of all material (subject) names from the database.

### 4. User Stories
- As a user, I want to see a list of available materials so I can select which subject to work with.
- As a frontend developer, I need an endpoint that provides distinct material names for dropdown/list rendering.

### 5. Functions Summary
- `GetMaterials()`: GET `/api/materials` — queries `Materials` table, projects distinct `MaterialName`s, orders them alphabetically, returns as JSON array.

### 6. Integration
Interacts with the SQLite database via Entity Framework Core (`BlueBitsDbContext.Materials`).

### 7. Imports Summary
External: `Microsoft.AspNetCore.Authorization`, `Microsoft.AspNetCore.Mvc`, `Microsoft.EntityFrameworkCore`. Internal: `BlueBits.Api.Data` (DbContext), `BlueBits.Api.Models` (Entities).

### 8. Additional Info
Protected by `[Authorize]` — only authenticated users can call this endpoint. No pagination, filtering, or role-based restrictions on the materials list itself.
## 1. File Name and Directory
`Backend/Controllers/PromptsController.cs`

### 2. File Type
Backend API Controller (C# .NET)

### 3. What the file does
Provides authenticated endpoints for non-Admin users to retrieve AI prompt text for their active session and compile prompts with user notes. Admins are explicitly blocked from both operations.

### 4. User Stories
- As a TechMember/ScientificMember, I can fetch the AI prompt for my session so I can see what instructions the AI will follow.
- As a TechMember/ScientificMember, I can compile a prompt with my general and file-specific notes so the AI receives full context.

### 5. Functions Summary
- `GetPromptForSession`: Fetches prompt by sessionId and systemCode; validates session ownership and blocks Admins.
- `CompilePrompt`: Takes a CompilePromptRequest, compiles the prompt via IPromptCompilationService with notes, and returns the result.

### 6. Integration
Interacts with `BlueBitsDbContext` (SQLite) to query Sessions and Prompts tables. Uses `IPromptCompilationService` for prompt compilation logic.

### 7. Imports Summary
ASP.NET Core attributes (`[Authorize]`, `[ApiController]`, `[Route]`, `[HttpGet]`, `[HttpPost]`), Entity Framework Core (`DbContext`), `System.Security.Claims`, and internal project models/services (`BlueBits.Api.Data`, `BlueBits.Api.Models`, `BlueBits.Api.Services`).

### 8. Additional Info
The `CompilePromptRequest` DTO is defined at the bottom of the same file with fields: `systemCode`, `GeneralNotes`, `FileNotes`. Admins are forbidden from both endpoints (`return Forbid()`).
## 1. File Name and Directory
`Backend/Controllers/SessionsController.cs`

### 2. File Type
Backend (C# .NET Web API Controller)

### 3. What the file does
Manages the academic session lifecycle — listing, creating, viewing, saving content, and uploading files for user sessions. Enforces RBAC: users only see/manage their own sessions and only for workflows their role is permitted to access. Admins are blocked from session operations entirely.

### 4. User Stories
- As a user, I can view a paginated list of my sessions filtered by my role's workflow permissions
- As a user, I can create a new session for a specific material and workflow
- As a user, I can view full session details with compiled prompt, files, and notes
- As a user, I can save generated content (quiz/Pandoc) to a session
- As a user, I can upload files with per-file notes to my session

### 5. Functions Summary
- `GetSessions`: Returns paginated session summaries for the current user, filtered by `WorkflowPermissions`
- `GetSession`: Returns full session details with includes (User, Material, Workflow, Prompts, Notes, Files, SessionContents) plus a compiled prompt via `IPromptCompilationService`
- `CreateSession`: Validates material + workflow existence and role permission, creates a `Session` with optional `GeneralNote`
- `SaveSessionContent`: Upserts `SessionContent.ContentBody` for a given session (quiz/Pandoc output)
- `UploadFiles`: Saves uploaded files to disk (`uploads/sessions/{id}/`), creates `File` entities and optional `FileNote` records

### 6. Integration
- **Database**: All CRUD via `BlueBitsDbContext` (EF Core, SQLite)
- **Service**: `IPromptCompilationService.CompilePromptAsync` for dynamic prompt compilation
- **File System**: Saves uploaded files to `{ContentRootPath}/uploads/sessions/{id}/`

### 7. Imports Summary
- **ASP.NET Core**: `Authorization`, `Mvc`, `EntityFrameworkCore`, `IWebHostEnvironment`
- **System**: `Security.Claims`
- **Internal**: `BlueBits.Api.Data` (DbContext), `BlueBits.Api.Models` (entities/DTOs), `BlueBits.Api.Services` (IPromptCompilationService)

### 8. Additional Info
- Three DTOs defined at file bottom: `CreateSessionRequest`, `SaveSessionContentRequest`, `SessionSummaryDto`
- Admin role is **blocked** from `GetSessions`, `CreateSession`, and `UploadFiles`
- File notes are linked to files via `FileId` with type `"FileNote"`; general notes use `"GeneralNote"`
- Session content uses upsert logic (first `SessionContent` record)
## 1. File Name and Directory
`Backend/Data/BlueBitsDbContext.cs`

### 2. File Type
Backend — Entity Framework Core database context.

### 3. What the file does
Defines the application's EF Core `DbContext`: declares entity `DbSet<>` properties for all models (Users, Materials, Workflows, etc.), configures constraints (unique indexes, check constraints), defines relationships and foreign keys with cascade/restrict delete behavior, and seeds initial data (admin user, workflows, permissions, prompts).

### 4. User Stories
- As an Admin, I want a pre-configured database schema so that users, roles, and workflows are ready on first run.
- As a TechMember/ScientificMember, I want data integrity rules enforced (unique usernames, valid roles, cascade deletes) so that the system remains consistent.

### 5. Functions Summary
- `BlueBitsDbContext(DbContextOptions<BlueBitsDbContext> options)`: Constructor that accepts EF Core options.
- `OnModelCreating(ModelBuilder modelBuilder)`: Override that configures table constraints, unique indexes, check constraints, relationships, foreign keys, and seeds initial reference data.

### 6. Integration
Directly interacts with the **SQLite database** via Entity Framework Core. All database communication in the backend flows through this context.

### 7. Imports Summary
- **External:** `Microsoft.EntityFrameworkCore`
- **Internal:** `BlueBits.Api.Models` (User, Material, Workflow, WorkflowPermission, Prompt, Session, SessionContent, File, Note)

### 8. Additional Info
- Uses `using File = BlueBits.Api.Models.File` to resolve naming conflict with `System.IO.File`.
- Seeds 1 admin user, 8 workflows (via `SystemCode`), 5 RBAC `WorkflowPermission` entries, and 6 prompts.
- Check constraints enforce valid enums for `UserRole`, `LectureType`, `FileType`, `NoteType`, `RoleName`, and numeric ranges for `BatchNumber`, `MaterialYear`, and `LectureNumber`.
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
## 1. File Name and Directory
`Backend/Endpoints/PandocEndpoints.cs`

### 2. File Type
Backend (C# API Endpoint)

### 3. What the file does
Exposes a POST `/generate` endpoint that converts Markdown text to a formatted `.docx` file using the **pandoc** CLI, then post-processes the document: inline math placeholders (`{{{...}}}`) are converted to Office MathML objects (with fraction support via `/`), and the result is merged into a final `.dotx` template after the cover page section break.

### 4. User Stories
- As a user, I can submit markdown text and receive a fully formatted Word document based on a professional template.
- As a user, I can embed LaTeX-style equations in `{{{...}}}` delimiters and have them rendered as editable Office Math objects in the output.

### 5. Functions Summary
- `MapPandocEndpoints`: Registers the `POST /generate` route; invokes pandoc CLI, then calls post-processing and template merge.
- `ProcessEquations`: Scans paragraphs for `{{{...}}}`, flattens runs into character arrays, replaces equation placeholders with `OfficeMath` elements (fractions via `/` split).
- `CreateWordRuns`: Rebuilds `WRun` elements from a list of `CharFormat` objects, grouping consecutive characters with identical formatting.
- `CreateMathRuns`: Creates `MRun` elements for math content, preserving character-level formatting.
- `MergeWithTemplate`: Copies the final template, imports the generated document via `AltChunk`, and inserts it after the first section-break paragraph.

### 6. Integration
Calls the **pandoc** external CLI tool. Does **not** call any backend APIs or query any database. Uses OpenXml to manipulate `.docx`/`.dotx` files directly.

### 7. Imports Summary
- `System.Diagnostics` — for running the pandoc process.
- `Microsoft.AspNetCore.Mvc` — for route attributes (though using minimal API pattern).
- `DocumentFormat.OpenXml.*` — extensive use of Wordprocessing, Math, and Packaging namespaces for Office Open XML manipulation.

### 8. Additional Info
- Requires **pandoc** installed on the system PATH.
- Template `.dotx` files must exist in `Resources/PandocTemplates/` (a `Pandoc-Theo.dotx` and its `-Final-Step.dotx` counterpart).
- Output filename follows the convention `{MaterialName} ({Type}) - {LectureNumber}.docx`.
- No authentication or RBAC checks are performed in this endpoint (assumes gateway/middleware handles it).
## 1. File Name and Directory
`Backend/Models/File.cs`

### 2. File Type
Backend (C# Entity Model)

### 3. What the file does
Defines the `File` entity representing a physical file attached to a `Session`. Tracks the local storage path, file type (e.g., extension), and display ordering. Each file belongs to one Session and can have multiple Notes.

### 4. User Stories
- As a user, I can upload files associated with a session (e.g., lecture materials, attachments) and have them persisted with their type and order.
- As a user, I can add notes to individual files within a session.

### 5. Functions Summary
None — this is a pure data model class with no methods.

### 6. Integration
Interacts with the database via Entity Framework Core as a entity included in `DbContext`. No direct API or external service calls.

### 7. Imports Summary
- `System.ComponentModel.DataAnnotations` — for `[Key]` and `[Required]` attributes.

### 8. Additional Info
- Navigation properties: `Session` (parent, required) and `Notes` (child collection).
- The `LocalFilePath` stores the server-side path to the physical file; a background garbage collector service cleans orphaned files from disk (see Backend AGENTS.md).
## 1. File Name and Directory
`Backend/Models/Material.cs`

### 2. File Type
Backend (C# model class)

### 3. What the file does
Defines the `Material` entity — an academic material (e.g., a course subject) that groups `Session` records. Maps to a database table via Entity Framework Core.

### 4. User Stories
- As an admin, I can create and manage academic materials (name and year).
- As a user, I can start sessions tied to a specific material.

### 5. Functions Summary
- No methods; this is a plain data model with auto-properties.

### 6. Integration
Directly maps to the database via EF Core (`DbSet<Material>`). Does not call external APIs.

### 7. Imports Summary
- `System.ComponentModel.DataAnnotations` — for `[Key]` and `[Required]` attributes.

### 8. Additional Info
- `Sessions` is a navigation property (one-to-many from `Material` to `Session`).
## 1. File Name and Directory
`Backend/Models/Note.cs`

### 2. File Type
Backend — C# entity model

### 3. What the file does
Defines the `Note` entity for EF Core. Each note belongs to a `Session`, has required text and type fields, and can optionally reference a `File`.

### 4. User Stories
- As a user, I can create typed notes (e.g. observation, summary) within a session.
- As a user, I can optionally attach a file to a note.

### 5. Functions Summary
None — this is a POCO model class with only properties.

### 6. Integration
Database entity — maps to a `Notes` table via Entity Framework Core. Links to `Session` and `File` tables via navigation properties.

### 7. Imports Summary
- `System.ComponentModel.DataAnnotations` — `[Key]` and `[Required]` attributes.

### 8. Additional Info
- `NoteText` and `NoteType` use C# 11 `required` modifier.
- `FileId` is nullable; `File` nav property is optional.
- `Session` nav property is initialized to `null!` (non-nullable, set by EF).
## 1. File Name and Directory
`Backend/Models/Prompt.cs`

### 2. File Type
Backend (C# EF Core entity model)

### 3. What the file does
Defines the `Prompt` entity — a database model storing configurable AI/LLM prompt templates. Each prompt is linked to a specific workflow via `WorkflowId` and identified by an immutable `SystemCode`.

### 4. User Stories
- As a developer, I can create reusable prompt templates bound to a workflow so the system can dynamically render instructions for AI features.
- As an admin, I can update prompt text per workflow without redeploying, because prompts are stored in the database.

### 5. Functions Summary
None — this is a plain data class with auto-properties only.

### 6. Integration
EF Core entity mapped to a `Prompts` table in SQLite. Has a foreign key navigation property to `Workflow`.

### 7. Imports Summary
- `System.ComponentModel.DataAnnotations` — provides `[Key]` and `[Required]` attributes.

### 8. Additional Info
Uses C# 11 `required` modifier on string properties. The `Workflow` navigation property is suppressed with `null!` to satisfy non-nullable reference types.
## 1. File Name and Directory
`Backend/Models/Session.cs`

### 2. File Type
Backend — EF Core entity model

### 3. What the file does
Defines the `Session` entity that binds a `User`, `Material`, and `Workflow` together. Each session represents a single user-workflow-material interaction episode, tracking its associated lecture metadata and holding collections of generated `Files`, `Notes`, and `SessionContent` records.

### 4. User Stories
- As a user, I start a session when I begin working on a lecture material within a specific workflow so the system can track my state.
- As a user, I expect all files, notes, and content I generate during a session to be linked back to that session for review and continuity.

### 5. Functions Summary
None — the file is a pure data model with no methods. It declares properties and EF Core navigation collections only.

### 6. Integration
No direct API or external service calls. It is used by the EF Core `DbContext` to map to the `Sessions` database table.

### 7. Imports Summary
- `System.ComponentModel.DataAnnotations` — for `[Key]`, `[Required]` data annotations.

### 8. Additional Info
Uses C# 11 `required` modifier on `LectureType`. Navigation properties (`User`, `Material`, `Workflow`, `ICollection<File>`, `ICollection<Note>`, `ICollection<SessionContent>`) establish foreign-key relationships with automatic null-forgiving assignment (`= null!`). `CreatedAt` defaults to the current UTC timestamp in ISO 8601 format.
## 1. File Name and Directory
`Backend/Models/SessionContent.cs`

### 2. File Type
Backend — EF Core entity model

### 3. What the file does
Defines the `SessionContent` entity that stores the main textual content body produced during a user's session. Each record is linked to a parent `Session` via `SessionId`, holding the raw content payload.

### 4. User Stories
- As a user, when I generate content within a workflow session, the system persists it as a `SessionContent` record tied to that session.
- As a developer, I query `SessionContent` by `SessionId` to retrieve or display all content produced during a given session.

### 5. Functions Summary
None — pure data model with properties and a navigation reference only.

### 6. Integration
No direct API or external service calls. Used by EF Core `DbContext` to map to the `SessionContents` database table.

### 7. Imports Summary
- `System.ComponentModel.DataAnnotations` — for `[Key]` data annotation.

### 8. Additional Info
Uses C# 11 `required` modifier on `ContentBody`. The `Session` navigation property is assigned with null-forgiving (`= null!`). `ContentId` is the primary key; `SessionId` is the foreign key to the `Sessions` table.
## 1. File Name and Directory
`Backend/Models/User.cs`

### 2. File Type
Backend (C# Entity Model)

### 3. What the file does
Defines the `User` entity class mapped to the database Users table. Stores user identity, credentials, role, and metadata like batch number and Telegram username. Has a one-to-many navigation property to `Session`.

### 4. User Stories
- As an **admin**, I can create, edit, and manage user accounts with roles (`Admin`, `TechMember`, `ScientificMember`).
- As a **user**, I can log in with my username/password and maintain sessions for workflow operations.

### 5. Functions Summary
No methods — pure data model with properties and DataAnnotations validation.

### 6. Integration
Interacts with the database via Entity Framework Core (entity class with navigation property `Sessions`).

### 7. Imports Summary
- `System.ComponentModel.DataAnnotations` — validation attributes (`[Key]`, `[Required]`, `[RegularExpression]`, `[StringLength]`)
- `System.ComponentModel.DataAnnotations.Schema` — schema mapping attributes

### 8. Additional Info
- Uses C# 11 `required` keyword for mandatory properties.
- `CreatedAt` defaults to `DateTime.UtcNow.ToString("O")` (ISO 8601).
- Password stored as plain text with no hashing — consider adding password hashing.
- `Username` allows only English letters, numbers, dots, and underscores (3–20 chars).
- `Password` allows English letters, numbers, and standard symbols (6–100 chars).
## 1. File Name and Directory
`Backend/Models/Workflow.cs`

### 2. File Type
Backend — C# Entity Framework model

### 3. What the file does
Defines the `Workflow` entity representing a modular sub-system (tab/card) in the Unified Academic Platform. Each Workflow has a unique `SystemCode` (e.g. `"LEC_EXT"`), an active toggle, and navigation properties to its permissions, prompts, and sessions.

### 4. User Stories
- An admin can toggle a Workflow on/off via `IsActive` without affecting related data.
- A user's role determines which Workflows they can access, resolved through `WorkflowPermissions`.

### 5. Functions Summary
- (No methods — data-only model class)

### 6. Integration
Interacts with the database via Entity Framework Core — no direct API or external service calls.

### 7. Imports Summary
- `System.ComponentModel.DataAnnotations` — provides `[Key]` and `[Required]` attribute annotations.

### 8. Additional Info
- `IsActive` is an `int` (used as a boolean flag), defaulting to `1`.
- Navigation collections `Permissions`, `Prompts`, and `Sessions` establish one-to-many relationships.
- Always reference Workflows by their `SystemCode` (string), never by `WorkflowId`, per backend conventions.
## 1. File Name and Directory
`Backend/Models/WorkflowPermission.cs`

### 2. File Type
Backend — EF Core entity model

### 3. What the file does
Maps the many-to-many RBAC join table linking Workflows to roles. Each row grants a single role (`RoleName`) access to a specific workflow (`WorkflowId`). Used by authorization logic to determine which workflows a user can access.

### 4. User Stories
- As an admin, I can grant a role access to a specific workflow by creating a WorkflowPermission record.
- As an API endpoint, I can look up all SystemCodes a user can access by joining through WorkflowPermissions.

### 5. Functions Summary
- (None — data-only model class with no methods)

### 6. Integration
Interacts with the database via EF Core as a join table between `Workflow` and identity roles.

### 7. Imports Summary
- `System.ComponentModel.DataAnnotations` — for `[Key]`, `[Required]`
- `System.Text.Json.Serialization` — for JSON serialization attributes
- `BlueBits.Api.Models` — project namespace

### 8. Additional Info
The `Workflow` navigation property is eagerly/lazily loadable by EF Core. `PermissionId` is the auto-generated primary key.
## 1. File Name and Directory
`Backend/Services/OrphanFileCleanupService.cs`

### 2. File Type
Backend (C# `BackgroundService`)

### 3. What the file does
A nightly garbage-collector background service that reconciles physical files in the `uploads/` directory against `Files` records in the database. Any physical file with no matching DB record is treated as an orphan and deleted. Runs once every 24 hours.

### 4. User Stories
- As a system administrator, I want orphaned physical files (not referenced in the DB) to be automatically cleaned up nightly to prevent disk waste.
- As a developer, I want the system to automatically reconcile DB file records with physical disk files so the two never drift apart.

### 5. Functions Summary
- `ExecuteAsync`: Main loop — runs `CleanupOrphanFilesAsync` every 24 hours until `stoppingToken` is cancelled.
- `CleanupOrphanFilesAsync`: Lists all files in `uploads/`, fetches all `LocalFilePath` values from the DB, normalizes paths for OS-agnostic comparison, then deletes any physical file not present in the DB.

### 6. Integration
- **Database:** Reads `Files.LocalFilePath` via `BlueBitsDbContext` (EF Core).
- **File System:** Lists and deletes files in `{ContentRootPath}/uploads/`.

### 7. Imports Summary
- `BlueBits.Api.Data` — `BlueBitsDbContext` for DB queries.
- `Microsoft.EntityFrameworkCore` — async LINQ methods (`ToListAsync`).

### 8. Additional Info
- Registered as a hosted service; starts when the application starts.
- Errors during individual file deletion are logged as warnings (non-fatal) so one locked file does not halt cleanup of others.
- Paths are normalized with `Path.GetFullPath` and compared case-insensitively for cross-OS compatibility.
## 1. File Name and Directory
`Backend/Services/PromptCompilationService.cs`

### 2. File Type
Backend — Service layer

### 3. What the file does
Retrieves a prompt from the database by SystemCode, then assembles a final prompt string by appending optional general user instructions and file-specific notes. Used to construct the full context text sent to AI workflows.

### 4. User Stories
- As a user, I want my workflow's base prompt automatically fetched so I don't have to paste it manually.
- As a user, I want to attach general instructions and per-file notes that get appended to the prompt before submission.

### 5. Functions Summary
- `CompilePromptAsync(string systemCode, string? generalNotes, List<string> fileNotes)`: Looks up a Prompt entity by workflow SystemCode (or its own SystemCode), appends optional user instructions and file notes, and returns the compiled string.

### 6. Integration
Reads from the `Prompts` table via Entity Framework Core (`BlueBitsDbContext`). No external API calls.

### 7. Imports Summary
- **External:** `Microsoft.EntityFrameworkCore`, `System.Text`, `System.Linq`
- **Internal:** `BlueBits.Api.Data` (DbContext)

### 8. Additional Info
Lookup tries `Workflow.SystemCode` first, then falls back to `Prompt.SystemCode`, so callers can pass either identifier.
## 1. File Name and Directory
`Backend/BlueBits.Api.csproj`

### 2. File Type
Backend — .NET project file (MSBuild)

### 3. What the file does
Defines the .NET project configuration: target framework (`net9.0`), NuGet package dependencies, content includes, and nullable/implicit usings settings.

### 4. User Stories
- As a developer, I can run `dotnet restore` / `dotnet build` and have all dependencies resolved automatically.

### 5. Functions Summary
None — this is a declarative MSBuild project file.

### 6. Integration
References NuGet packages that provide: authentication (JwtBearer), database (EF Core SQLite), document processing (OpenXML), logging (Serilog), API documentation (Swashbuckle), validation (FluentValidation), and rate limiting (built-in ASP.NET Core).

### 7. Imports Summary
NuGet packages installed:
- `DocumentFormat.OpenXml` — DOCX file manipulation
- `FluentValidation.AspNetCore` — FluentValidation auto-validation integration
- `Microsoft.AspNetCore.Authentication.JwtBearer` — JWT authentication
- `Microsoft.EntityFrameworkCore.Sqlite` / `Design` — SQLite database with EF Core
- `Serilog.AspNetCore` / `Sinks.Console` / `Sinks.File` — structured logging
- `Swashbuckle.AspNetCore` — Swagger/OpenAPI UI

### 8. Additional Info
- `Microsoft.AspNetCore.OpenApi` was removed and replaced by `Swashbuckle.AspNetCore`.
- Rate limiting (`AddRateLimiter` / `UseRateLimiter`) uses the built-in ASP.NET Core framework types (no extra NuGet package needed in .NET 9).
- Target framework: `net9.0`.