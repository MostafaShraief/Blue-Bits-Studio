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
5. **Global Exception Handling:** Use `NotFoundException` for missing-resource errors. Avoid inline `return NotFound()` in favor of throwing `NotFoundException` when the error should propagate through the global `ExceptionHandlingMiddleware`. The middleware returns standardized JSON `{error, statusCode, traceId}` and logs full diagnostic context.

## AI Prompt Instructions
When generating code for this backend:
- Always use `SystemCode` static constants instead of magic numbers.
- Ensure endpoints strictly validate the user's role against the `WorkflowPermissions` table before allowing any Session creation.

# Files

Update this section constantly for **any** minor change you do in each file.

## 1. File Name and Directory
`Backend/Program.cs`

### 2. File Type
Backend — ASP.NET Core Web API entry point (top-level statements)

### 3. What the file does
Bootstraps the API: delegates all service registration to `ServiceCollectionExtensions` via `AddInfrastructure`, `AddPersistence`, `AddAuthLayer`, `AddApiLayer`, configures middleware pipeline (global exception handler, CORS, compression, rate limiter, auth, static files), maps controllers and minimal API endpoints (Pandoc, Merge), ensures DB creation on startup, and serves uploaded files from `/uploads`.

### 4. User Stories
- As a user, I authenticate via JWT to access protected API endpoints.
- As a non-Admin user, I can execute workflow endpoints (Pandoc, Merge) without being blocked.
- As an Admin, I am denied access to all workflow endpoints via WorkflowPolicy.
- As a developer, the app auto-creates the SQLite DB and serves uploaded files on startup.
- As a developer, I can view API documentation and test endpoints via Swagger UI.
- As a developer, all requests are logged through Serilog to console and rolling files.

### 5. Functions Summary
Top-level statements (no named functions). Key logic blocks:
- Bootstrap logger: minimal Console-only Serilog bootstrap logger (full sink config — colored Console + JSON rolling file `Logs/bluebits-.log` — read from `appsettings.json`)
- Service registration: delegates to `ServiceCollectionExtensions.AddInfrastructure` (CORS, compression, rate limiting, background services), `AddPersistence` (DbContext, `IPromptCompilationService`), `AddAuthLayer` (JWT, `WorkflowPolicy`), `AddApiLayer` (controllers, FluentValidation, Swagger)
- Middleware pipeline: ExceptionHandler → CORS → ResponseCompression → RateLimiter → Auth → StaticFiles → Controllers → Minimal endpoints
- `db.Database.EnsureCreated()`: Auto-creates SQLite DB
- Fatal exception caught at top-level with `Log.Fatal` / `Log.CloseAndFlush`
- `MapPandocEndpoints` / `MapMergeEndpoints`: Minimal API groups secured with `WorkflowPolicy`

### 6. Integration
- **Database:** SQLite via EF Core (`BlueBitsDbContext`)
- **Auth:** JWT bearer tokens (Issuer, Audience, SymmetricKey from config)
- **Background Service:** `OrphanFileCleanupService` for nightly file cleanup
- **Logging:** Serilog sink configuration from `appsettings.json` — Console (AnsiConsoleTheme colored) + rolling File (`Logs/bluebits-.log`, JSON format)
- **Static Files:** Serves physical files from `./uploads/` at `/uploads` URL path

### 7. Imports Summary
- **External:** `Serilog`
- **Internal:** `BlueBits.Api.Data`, `BlueBits.Api.Endpoints`, `BlueBits.Api.Extensions`, `BlueBits.Api.Middleware`

### 8. Additional Info
Uses C# 10 top-level statements. Service registration is fully delegated to `ServiceCollectionExtensions` (`AddInfrastructure`, `AddPersistence`, `AddAuthLayer`, `AddApiLayer`). `WorkflowPolicy` blocks Admin but allows all other roles dynamically — new roles work automatically without code changes. HTTPS redirection is commented out for dev convenience. `ClockSkew` is set to zero for tighter JWT security. Swagger configuration is delegated to `Extensions/SwaggerExtensions.cs` (`AddSwaggerWithConfig` / `UseSwaggerWithUI`). Bootstrap logger (Console-only) enables early startup error logging before full config is loaded; `builder.Host.UseSerilog()` then reads the complete sink setup from `appsettings.json`. Rate limiting is delegated to `RateLimitingExtensions.AddRateLimiting()` (5 req/s per IP, Swagger/health excluded, 429 with `Retry-After` header).
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
- **External:** `Microsoft.AspNetCore.Authorization`, `Mvc`, `EntityFrameworkCore`, `Logging`
- **Internal:** `BlueBits.Api.Data` (DbContext), `BlueBits.Api.Models` (User entity), `BlueBits.Api.DTOs.Requests` (CreateUserRequest, UpdateUserRequest)

### 8. Additional Info
- Controller is restricted to `[Authorize(Roles = "Admin")]`.
- DTOs (`CreateUserRequest`, `UpdateUserRequest`) are imported from `BlueBits.Api.DTOs.Requests` namespace — previously defined inline, now extracted to `Backend/DTOs/Requests/`.
- Validation moved from DataAnnotations to FluentValidation (`CreateUserRequestValidator`, `UpdateUserRequestValidator`).
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
- `BlueBits.Api.DTOs.Requests` — `CreatePermissionRequest` DTO.

### 8. Additional Info
- Restricted to `Admin` role via `[Authorize(Roles = "Admin")]`.
- Accepts only `TechMember` or `ScientificMember` as valid role names.
- `CreatePermissionRequest` was previously a nested class inside this controller; now imported from `BlueBits.Api.DTOs.Requests`.
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
- `UpdatePromptRequest` is imported from `BlueBits.Api.DTOs.Requests` — previously an inline DTO, now extracted to `Backend/DTOs/Requests/`.
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
- `ToggleWorkflowRequest` is imported from `BlueBits.Api.DTOs.Requests` — previously an inline DTO, now extracted to `Backend/DTOs/Requests/`.
- No session creation or workflow execution — strictly administrative toggle.
## 1. File Name and Directory
`Backend/Controllers/AuthController.cs`

### 2. File Type
Backend (C# .NET Web API Controller)

### 3. What the file does
Handles user authentication (login) and authorization (get current user). Delegates all business logic (credential validation, RBAC workflow lookup, JWT generation) to `IAuthService`.

### 4. User Stories
- As a user, I can log in with my username/password and receive a JWT token along with my authorized workflows.
- As an authenticated user, I can retrieve my current profile and fresh permissions via a token-based endpoint.

### 5. Functions Summary
- `Login`: Delegates to `IAuthService.LoginAsync`, returns `LoginResponse` with token + user profile + authorized workflows.
- `GetCurrentUser`: Extracts user ID from JWT claims, delegates to `IAuthService.GetCurrentUserAsync`, returns `LoginResponse`.

### 6. Integration
Depends solely on `IAuthService` (injected via DI). No direct database or configuration access.

### 7. Imports Summary
**External:** `Microsoft.AspNetCore.Authorization`, `Mvc`, `System.Security.Claims`.  
**Internal:** `BlueBits.Api.DTOs.Responses` (`LoginResponse`), `BlueBits.Api.DTOs.Requests` (`LoginRequest`), `BlueBits.Api.Services.Interfaces` (`IAuthService`).

### 8. Additional Info
- JWT generation moved to `AuthService`.
- Controller is thin — only handles HTTP concerns (extracting claims, returning responses).
- `AuthorizedWorkflows` (list of SystemCodes) is the RBAC contract consumed by the frontend for dynamic UI rendering.
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
ASP.NET Core attributes (`[Authorize]`, `[ApiController]`, `[Route]`, `[HttpGet]`, `[HttpPost]`), Entity Framework Core (`DbContext`), `System.Security.Claims`, and internal project models/services (`BlueBits.Api.Data`, `BlueBits.Api.Models`, `BlueBits.Api.Services`, `BlueBits.Api.DTOs.Requests`).

### 8. Additional Info
`CompilePromptRequest` is imported from `BlueBits.Api.DTOs.Requests` — previously an inline DTO, now extracted to `Backend/DTOs/Requests/`. Admins are forbidden from both endpoints (`return Forbid()`).
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
- **Internal**: `BlueBits.Api.Data` (DbContext), `BlueBits.Api.Models` (entities/DTOs), `BlueBits.Api.Services` (IPromptCompilationService), `BlueBits.Api.DTOs.Responses` (`SessionSummaryDto`), `BlueBits.Api.DTOs.Requests` (`CreateSessionRequest`, `SaveSessionContentRequest`)

### 8. Additional Info
- DTOs (`CreateSessionRequest`, `SaveSessionContentRequest`) are imported from `BlueBits.Api.DTOs.Requests` — previously defined inline, now extracted to `Backend/DTOs/Requests/`.
- `SessionSummaryDto` DTO is extracted to `BlueBits.Api.DTOs.Responses`
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
Provides a POST `/execute` endpoint that merges multiple uploaded DOCX files into a single document. Delegates all OpenXML manipulation (cover stripping, AltChunk injection, page layout) to `IMergeService`. Returns a download URL.

### 4. User Stories
- As a user, I can upload multiple DOCX files and merge them into one formatted document with proper margins and page breaks.
- As a user, I can select a lecture type (theoretical/practical) to apply the correct Pandoc template.

### 5. Functions Summary
- `MapMergeEndpoints`: Registers GET `/test` (health check) and POST `/execute` (document merge) endpoints on a route group. Reads form data and delegates to `IMergeService`.

### 6. Integration
No database calls. Relies on `IMergeService` for all DOCX processing logic.

### 7. Imports Summary
- **Internal**: `BlueBits.Api.Services.Interfaces` (`IMergeService`, `MergeResult`)

### 8. Additional Info
- Antiforgery is disabled on the POST endpoint.
- All merge logic moved to `MergeService`.
## 1. File Name and Directory
`Backend/Endpoints/PandocEndpoints.cs`

### 2. File Type
Backend (C# API Endpoint)

### 3. What the file does
Exposes a POST `/generate` endpoint that converts Markdown text to a formatted `.docx` file. Delegates all logic — Pandoc CLI invocation, equation processing (`ProcessEquations`, `CreateWordRuns`, `CreateMathRuns`), and template merge (`MergeWithTemplate`) — to `IPandocService`.

### 4. User Stories
- As a user, I can submit markdown text and receive a fully formatted Word document based on a professional template.
- As a user, I can embed LaTeX-style equations in `{{{...}}}` delimiters and have them rendered as editable Office Math objects in the output.

### 5. Functions Summary
- `MapPandocEndpoints`: Registers the `POST /generate` route; reads the `GenerateDocxRequest` and delegates to `IPandocService.GenerateDocxAsync`.

### 6. Integration
Relies on `IPandocService` for all Pandoc CLI and OpenXML processing.

### 7. Imports Summary
- **Internal**: `BlueBits.Api.Services.Interfaces` (`IPandocService`, `PandocResult`)

### 8. Additional Info
- Requires **pandoc** installed on the system PATH.
- Template `.dotx` files must exist in `Resources/PandocTemplates/`.
- All OpenXML/math processing moved to `PandocService`.
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
`Backend/Extensions/SwaggerExtensions.cs`

### 2. File Type
Backend — ASP.NET Core extension methods for Swagger/Swashbuckle configuration

### 3. What the file does
Provides two extension methods: `AddSwaggerWithConfig` (registers SwaggerGen with OpenAPI doc info, XML comments, JWT security definition, and controller-based endpoint grouping) and `UseSwaggerWithUI` (configures Swagger middleware and Swagger UI at `/swagger` route prefix).

### 4. User Stories
- As a developer, I can call a single extension method to fully configure Swagger with XML docs, JWT auth, and endpoint grouping.
- As a developer, I can access Swagger UI at `/swagger` in development to explore and test API endpoints.

### 5. Functions Summary
- `AddSwaggerWithConfig(IServiceCollection)`: Configures SwaggerGen with `OpenApiInfo`, XML doc file path, Bearer JWT security definition + requirement, and endpoint tagging by controller name.
- `UseSwaggerWithUI(IApplicationBuilder)`: Enables Swagger middleware with route template `swagger/{documentName}/swagger.json` and Swagger UI at `/swagger` pointing to `/swagger/v1/swagger.json`.

### 6. Integration
Reads the assembly's XML documentation file from the build output directory. Does not call external services or databases.

### 7. Imports Summary
- `Microsoft.OpenApi.Models` — OpenAPI schema types (`OpenApiInfo`, `OpenApiSecurityScheme`, etc.)
- `System.Reflection` — `Assembly.GetExecutingAssembly()` to locate the XML doc file

### 8. Additional Info
- XML doc generation is enabled via `<GenerateDocumentationFile>true</GenerateDocumentationFile>` in `BlueBits.Api.csproj` with `<NoWarn>1591</NoWarn>` to suppress warnings for undocumented public members.
- Used in `Program.cs` replacing the bare `AddSwaggerGen()` / `UseSwagger()` / `UseSwaggerUI()` calls.
## 1. File Name and Directory
`Backend/BlueBits.Api.csproj`

### 2. File Type
Backend — .NET project file (MSBuild)

### 3. What the file does
Defines the .NET project configuration: target framework (`net9.0`), NuGet package dependencies, content includes, nullable/implicit usings settings, and XML documentation file generation.

### 4. User Stories
- As a developer, I can run `dotnet restore` / `dotnet build` and have all dependencies resolved automatically.
- As a developer, XML doc comments are automatically compiled into an `.xml` file for Swagger consumption.

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
- `<GenerateDocumentationFile>true</GenerateDocumentationFile>` enables XML doc generation; `<NoWarn>1591</NoWarn>` suppresses missing-comment warnings on public members.
- Rate limiting (`AddRateLimiter` / `UseRateLimiter`) uses the built-in ASP.NET Core framework types (no extra NuGet package needed in .NET 9).
- Target framework: `net9.0`.
## 1. File Name and Directory
`Backend/Exceptions/NotFoundException.cs`

### 2. File Type
Backend — Custom exception class

### 3. What the file does
Defines a `NotFoundException` thrown when a requested resource (entity, record) is not found. Accepts either a plain message or a resource name + identifier for automatic message formatting. Caught and handled by `ExceptionHandlingMiddleware` returning 404.

### 4. User Stories
- As a controller/service, I can throw `NotFoundException` to signal a missing resource and have the global middleware return a standardized 404 JSON response.

### 5. Functions Summary
- `NotFoundException(string message)`: Plain message constructor.
- `NotFoundException(string resourceName, object resourceId)`: Auto-formats `"{resourceName} with identifier '{resourceId}' was not found"`.

### 6. Integration
Consumed by the `ExceptionHandlingMiddleware` and any backend service/controller that needs to signal a not-found condition.

### 7. Imports Summary
None — pure `System.Exception` subclass in `BlueBits.Api.Exceptions` namespace.

### 8. Additional Info
Part of the global exception handling strategy. Replaces ad-hoc `return NotFound()` calls with a throwable exception that the middleware formats consistently.
## 1. File Name and Directory
`Backend/Middleware/ExceptionHandlingMiddleware.cs`

### 2. File Type
Backend — ASP.NET Core middleware

### 3. What the file does
Global exception handling middleware that catches all unhandled exceptions, logs UserID/SystemCode/SessionId/request path via Serilog, and returns a standardized JSON error envelope `{error, statusCode, traceId}`. Handles three exception categories: FluentValidation `ValidationException` → 400 with per-field error details, `NotFoundException` → 404, and all other unhandled exceptions → 500.

### 4. User Stories
- As a developer, all unhandled exceptions produce a consistent JSON error response instead of HTML or raw 500s.
- As a developer, FluentValidation failures return field-level error maps for frontend form validation.
- As a developer, `NotFoundException` throws from anywhere produce a clean 404 response.
- As an operator, all errors are logged with diagnostic context (UserID, SystemCode, SessionId, request path) for debugging.

### 5. Functions Summary
- `InvokeAsync(HttpContext)`: Wraps the next middleware in try/catch dispatching to per-type handlers.
- `HandleValidationExceptionAsync`: 400 with grouped `{field: [errors]}` map.
- `HandleNotFoundExceptionAsync`: 404 with exception message as error.
- `HandleGenericExceptionAsync`: 500 with generic "An unexpected error occurred" message.
- `ExtractSystemCode`: Best-effort extraction from route values `systemCode`, then query params `systemCode`/`workflowSystemCode`.
- `ExtractSessionId`: Best-effort extraction from route values `id`/`sessionId`, then query param `sessionId`.

### 6. Integration
Registered early in `Program.cs` via `app.UseMiddleware<ExceptionHandlingMiddleware>()`. Logs through standard `ILogger<ExceptionHandlingMiddleware>`. Consumes `FluentValidation.ValidationException` and `BlueBits.Api.Exceptions.NotFoundException`.

### 7. Imports Summary
- `System.Diagnostics` — `Activity.Current` for trace ID
- `System.Security.Claims` — `ClaimTypes.NameIdentifier` for user ID extraction
- `System.Text.Json` — `JsonSerializer` for writing JSON responses
- `FluentValidation` — `ValidationException` for validation error handling
- `BlueBits.Api.Exceptions` — `NotFoundException`

### 8. Additional Info
Placed after Swagger but before all other middleware to catch every unhandled exception across the entire pipeline. Uses best-effort extraction for SystemCode/SessionId (may be "N/A" if not present in route/query). Trace ID uses `Activity.Current.Id` when available, falling back to `HttpContext.TraceIdentifier`. `ValidationException` errors are grouped by `PropertyName` to produce `{fieldName: [errorMessage, ...]}` maps matching common frontend validation patterns.
## 1. File Name and Directory
`Backend/Extensions/ServiceCollectionExtensions.cs`

### 2. File Type
Backend — ASP.NET Core extension methods for DI service registration

### 3. What the file does
Provides four extension methods on `IServiceCollection` that cleanly separate service registration into logical layers: `AddInfrastructure` (CORS, compression, rate limiting, background services), `AddPersistence` (EF Core DbContext, `IPromptCompilationService`), `AddAuthLayer` (JWT bearer auth, `WorkflowPolicy` authorization), and `AddApiLayer` (controllers, FluentValidation, Swagger). All called from `Program.cs` for a cleaner entry point.

### 4. User Stories
- As a developer, I can call `builder.Services.AddInfrastructure()` to register CORS, compression, rate limiting, and background services in one line.
- As a developer, I can call `builder.Services.AddPersistence()` to wire up EF Core SQLite and data services.
- As a developer, I can call `builder.Services.AddAuthLayer()` to configure JWT authentication and role policies.
- As a developer, I can call `builder.Services.AddApiLayer()` to register controllers, FluentValidation, and Swagger.

### 5. Functions Summary
- `AddInfrastructure(IServiceCollection, IConfiguration)`: Registers CORS (`AllowFrontend` policy), response compression (Brotli + Gzip), rate limiting via `AddRateLimiting()`, and `OrphanFileCleanupService` as a hosted service.
- `AddPersistence(IServiceCollection, IConfiguration, IWebHostEnvironment)`: Registers `BlueBitsDbContext` with SQLite connection string derived from `ContentRootPath`, `IAuthService`, `IPromptCompilationService`, `IPandocService`, `IMergeService` as scoped services, `IRepository<>` / `GenericRepository<>` as scoped open generics, and all 9 specific repositories (`IUserRepository`, `IMaterialRepository`, `IWorkflowRepository`, `IWorkflowPermissionRepository`, `IPromptRepository`, `ISessionRepository`, `ISessionContentRepository`, `IFileRepository`, `INoteRepository`) as scoped.
- `AddAuthLayer(IServiceCollection, IConfiguration)`: Reads JWT settings (`Key`, `Issuer`, `Audience`) from config, configures `AddAuthentication` + `AddJwtBearer` with symmetric key validation, and `AddAuthorization` with `WorkflowPolicy` that blocks Admin but allows all other roles.
- `AddApiLayer(IServiceCollection)`: Registers controllers with JSON cycle-ignore serialization, configures `HttpJsonOptions` for minimal API serialization, adds FluentValidation auto-validation from the `Program` assembly, and Swagger via `AddSwaggerWithConfig()`.

### 6. Integration
Delegates to built-in ASP.NET Core middleware (CORS, compression, auth) and existing project extensions (`AddRateLimiting` from `RateLimitingExtensions`, `AddSwaggerWithConfig` from `SwaggerExtensions`). Configures EF Core SQLite via `BlueBitsDbContext`.

### 7. Imports Summary
- **External:** `System.Security.Claims`, `System.Text`, `System.Text.Json.Serialization`, `Microsoft.AspNetCore.Authentication.JwtBearer`, `Microsoft.AspNetCore.ResponseCompression`, `Microsoft.IdentityModel.Tokens`, `Microsoft.EntityFrameworkCore`, `FluentValidation`, `FluentValidation.AspNetCore`
- **Internal:** `BlueBits.Api.Data`, `BlueBits.Api.Repositories`, `BlueBits.Api.Services`, `BlueBits.Api.Services.Interfaces`

### 8. Additional Info
Centralizes all DI registration logic that was previously inline in `Program.cs`, making the entry point more readable and maintainable. Each layer can be extended or toggled independently. Registers `IAuthService`, `IPandocService`, and `IMergeService` as scoped services, and all 9 specific repositories alongside the open generic `IRepository<>`, in `AddPersistence`.
## 1. File Name and Directory
`Backend/DTOs/Requests/`

### 2. File Type
Backend — Request DTOs (C# classes)

### 3. What the file does
Contains 10 request DTO classes in the `BlueBits.Api.DTOs.Requests` namespace. These are the canonical definitions consumed by all controllers and endpoints. Previously, each DTO was defined inline in its respective controller/endpoint file; now extracted for centralized reuse.

Files:
- `LoginRequest.cs` — Username + Password (from `AuthController.cs`)
- `CreateUserRequest.cs` — Full user creation with validation attributes (from `AdminController.cs`)
- `UpdateUserRequest.cs` — User update with optional password (from `AdminController.cs`)
- `CreateSessionRequest.cs` — Session creation with WorkflowSystemCode, MaterialName, etc. (from `SessionsController.cs`)
- `SaveSessionContentRequest.cs` — Single ContentBody property (from `SessionsController.cs`)
- `CompilePromptRequest.cs` — Prompt compilation with systemCode, notes (from `PromptsController.cs`)
- `CreatePermissionRequest.cs` — RBAC permission grant (from `AdminPermissionsController.cs`, originally a nested class)
- `ToggleWorkflowRequest.cs` — IsActive toggle (from `AdminWorkflowsController.cs`)
- `UpdatePromptRequest.cs` — PromptText update (from `AdminPromptsController.cs`)
- `GenerateDocxRequest.cs` — DOCX generation parameters (from `PandocEndpoints.cs`)

### 4. User Stories
- As a developer, I can reference all request DTOs from a single namespace `BlueBits.Api.DTOs.Requests` for reuse and discoverability.
- As a developer, I can add new request DTOs without polluting controller files.

### 5. Functions Summary
None — pure data classes with auto-properties only.

### 6. Integration
Does not call any APIs or databases. These are plain data contracts consumed by controllers and endpoints.

### 7. Imports Summary
- (No external imports — DataAnnotations were removed in favor of FluentValidation validators in `Backend/Validators/`.)

### 8. Additional Info
- All DataAnnotation attributes were removed from `CreateUserRequest.cs` and `UpdateUserRequest.cs` — validation is now fully handled by FluentValidation validators (`CreateUserRequestValidator`, `UpdateUserRequestValidator`).
- `CreatePermissionRequest` was originally a nested class inside `AdminPermissionsController`; it is now a standalone top-level class in its own file.
## 1. File Name and Directory
`Backend/DTOs/Responses/LoginResponse.cs`

### 2. File Type
Backend — Response DTO

### 3. What the file does
Defines the `LoginResponse` DTO returned after successful authentication. Contains JWT token, user profile (ID, username, name, role), and the list of authorized workflow SystemCodes for RBAC-driven frontend rendering.

### 4. User Stories
- As a user, I receive my JWT token and profile upon login.
- As a frontend developer, I consume the `AuthorizedWorkflows` list to dynamically render UI tabs.

### 5. Functions Summary
None — pure data class with auto-properties.

### 6. Integration
Returned by `AuthController.Login` and `AuthController.GetCurrentUser`. No direct database or service calls.

### 7. Imports Summary
None — uses only `namespace BlueBits.Api.DTOs.Responses`.

### 8. Additional Info
Extracted from the inline DTO originally defined in `AuthController.cs`. `AuthorizedWorkflows` is the RBAC contract consumed by the frontend.
## 1. File Name and Directory
`Backend/DTOs/Responses/SessionSummaryDto.cs`

### 2. File Type
Backend — Response DTO

### 3. What the file does
Defines the `SessionSummaryDto` used for paginated session list responses. Lightweight projection that avoids fetching heavy fields like `QuizData` or `CompiledPrompt`.

### 4. User Stories
- As a user, I can view a paginated list of my sessions with key metadata (material name, workflow type, creation date, lecture number).

### 5. Functions Summary
None — pure data class with auto-properties.

### 6. Integration
Returned by `SessionsController.GetSessions`. No direct database or service calls.

### 7. Imports Summary
None — uses only `namespace BlueBits.Api.DTOs.Responses`.

### 8. Additional Info
Extracted from the inline DTO originally defined in `SessionsController.cs`. Used in LINQ `Select` projections for efficient querying.
## 1. File Name and Directory
`Backend/DTOs/Responses/ErrorResponse.cs`

### 2. File Type
Backend — Response DTO

### 3. What the file does
Defines the `ErrorResponse` DTO used by `ExceptionHandlingMiddleware` for standardized JSON error responses. Contains `Error` (message), `StatusCode` (HTTP status), and `TraceId` (correlation identifier for debugging).

### 4. User Stories
- As a frontend developer, I receive a consistent `{error, statusCode, traceId}` JSON envelope for all API errors.

### 5. Functions Summary
None — pure data class with auto-properties.

### 6. Integration
Returned by `ExceptionHandlingMiddleware` for all unhandled exceptions. No direct database or service calls.

### 7. Imports Summary
None — uses only `namespace BlueBits.Api.DTOs.Responses`.

### 8. Additional Info
Follows the standardized error envelope pattern described in Backend AGENTS.md. Matches the JSON shape already returned by `ExceptionHandlingMiddleware`.
## 1. File Name and Directory
`Backend/Repositories/IRepository.cs`

### 2. File Type
Backend — C# generic repository interface

### 3. What the file does
Defines the `IRepository<T>` generic interface for abstracting data access operations over any entity type. Declares the standard CRUD contract: `GetByIdAsync`, `GetAllAsync`, `AddAsync`, `Update`, `Delete`, `SaveChangesAsync`, and `FindAsync(Expression)`.

### 4. User Stories
- As a developer, I can inject `IRepository<T>` instead of directly depending on `BlueBitsDbContext`, enabling unit-testable and decoupled data access.
- As a developer, I can perform common CRUD and query operations through a consistent interface without writing raw EF Core code.

### 5. Functions Summary
- `GetByIdAsync(object id)`: Finds an entity by its primary key.
- `GetAllAsync()`: Returns all entities of type T.
- `AddAsync(T entity)`: Inserts a new entity asynchronously.
- `Update(T entity)`: Marks an entity as modified.
- `Delete(T entity)`: Removes an entity.
- `SaveChangesAsync()`: Persists all pending changes to the database.
- `FindAsync(Expression<Func<T, bool>> predicate)`: Queries entities matching a predicate expression.

### 6. Integration
Consumed by services and controllers via DI. Implemented by `GenericRepository<T>` which wraps `BlueBitsDbContext`.

### 7. Imports Summary
- `System.Linq.Expressions` — for `Expression<Func<T, bool>>`

### 8. Additional Info
The interface is generic (`where T : class`) and designed to work with any EF Core entity type. Registration in DI is scoped via `services.AddScoped(typeof(IRepository<>), typeof(GenericRepository<>))` in `ServiceCollectionExtensions`.
## 1. File Name and Directory
`Backend/Repositories/GenericRepository.cs`

### 2. File Type
Backend — C# generic repository implementation

### 3. What the file does
Implements `IRepository<T>` by wrapping `BlueBitsDbContext` and delegating all operations to EF Core's `DbSet<T>` and `DbContext` APIs. Provides the concrete data access logic for the generic repository pattern.

### 4. User Stories
- As a developer, injecting `GenericRepository<T>` (via the `IRepository<T>` interface) gives me a ready-to-use data access layer for any entity without writing repetitive queries.
- As a developer, I can call `SaveChangesAsync()` on the repository to commit all changes in a unit-of-work fashion.

### 5. Functions Summary
- `GetByIdAsync(object id)`: Delegates to `DbSet.FindAsync(id)`.
- `GetAllAsync()`: Delegates to `DbSet.ToListAsync()`.
- `AddAsync(T entity)`: Delegates to `DbSet.AddAsync(entity)`.
- `Update(T entity)`: Delegates to `DbSet.Update(entity)`.
- `Delete(T entity)`: Delegates to `DbSet.Remove(entity)`.
- `SaveChangesAsync()`: Delegates to `DbContext.SaveChangesAsync()`.
- `FindAsync(Expression<Func<T, bool>> predicate)`: Filters the DbSet with `Where(predicate).ToListAsync()`.

### 6. Integration
Directly depends on `BlueBitsDbContext` (injected via constructor). Registered as a scoped service in DI. All database communication flows through EF Core's DbSet and DbContext APIs.

### 7. Imports Summary
- **External:** `System.Linq.Expressions`, `Microsoft.EntityFrameworkCore`
- **Internal:** `BlueBits.Api.Data` (BlueBitsDbContext)

### 8. Additional Info
The generic constraint `where T : class` matches EF Core's entity type requirements. The class uses `_context.Set<T>()` to obtain the correct DbSet dynamically.
## 1. File Name and Directory
## 1. File Name and Directory
`Backend/Repositories/IUserRepository.cs` + `Backend/Repositories/UserRepository.cs`

### 2. File Type
Backend — C# specific repository interface + implementation

### 3. What the file does
Extends `IRepository<User>` with user-specific queries. `IUserRepository` declares `GetByUsernameAsync` and `ExistsByTelegramAndRoleAsync`. `UserRepository` implements these against `BlueBitsDbContext`.

### 4. User Stories
- As the AuthController, I can look up a user by username for login without writing raw EF Core queries.
- As the AdminController, I can check for duplicate Telegram+Role combinations before creating a user.

### 5. Functions Summary
- `GetByUsernameAsync(string username)`: Returns the first `User` matching the given username, or null.
- `ExistsByTelegramAndRoleAsync(string telegramUsername, string role)`: Returns true if a user with the given Telegram username and role already exists.

### 6. Integration
Injected as `IUserRepository` (scoped). Wraps `BlueBitsDbContext.Users` via the generic `GenericRepository<User>` base.

### 7. Imports Summary
- **External:** `Microsoft.EntityFrameworkCore`
- **Internal:** `BlueBits.Api.Data` (BlueBitsDbContext), `BlueBits.Api.Models` (User)

### 8. Additional Info
Registered in `AddPersistence` alongside the other specific repositories in `ServiceCollectionExtensions`.
## 1. File Name and Directory
`Backend/Repositories/IMaterialRepository.cs` + `Backend/Repositories/MaterialRepository.cs`

### 2. File Type
Backend — C# specific repository interface + implementation

### 3. What the file does
Extends `IRepository<Material>` with no additional methods. Provides the standard CRUD contract for the `Material` entity. `MaterialRepository` is a thin wrapper around `GenericRepository<Material>`.

### 4. User Stories
- As a developer, I can inject `IMaterialRepository` to perform CRUD on materials without coupling to `BlueBitsDbContext` directly.

### 5. Functions Summary
Inherits all methods from `IRepository<Material>` (GetByIdAsync, GetAllAsync, AddAsync, Update, Delete, SaveChangesAsync, FindAsync).

### 6. Integration
Injected as `IMaterialRepository` (scoped). All CRUD operations delegate to `GenericRepository<Material>`.

### 7. Imports Summary
- **Internal:** `BlueBits.Api.Data` (BlueBitsDbContext), `BlueBits.Api.Models` (Material)

### 8. Additional Info
Registered in `AddPersistence` alongside the other specific repositories. Part of the 9-repository family of specific interfaces.
## 1. File Name and Directory
`Backend/Repositories/IWorkflowRepository.cs` + `Backend/Repositories/WorkflowRepository.cs`

### 2. File Type
Backend — C# specific repository interface + implementation

### 3. What the file does
Extends `IRepository<Workflow>` with workflow-specific queries. `IWorkflowRepository` declares `GetBySystemCodeAsync` and `GetActiveWorkflowsForRoleAsync`. `WorkflowRepository` implements these with EF Core includes and filtering.

### 4. User Stories
- As the SessionsController, I can look up a workflow by SystemCode (with Permissions included) to validate session creation.
- As the AuthController, I can fetch all active workflows that a given role is permitted to access.

### 5. Functions Summary
- `GetBySystemCodeAsync(string systemCode)`: Returns a `Workflow` with its `Permissions` collection included, or null.
- `GetActiveWorkflowsForRoleAsync(string role)`: Returns all active workflows (`IsActive == 1`) where the given role has a matching `WorkflowPermission`.

### 6. Integration
Injected as `IWorkflowRepository` (scoped). Wraps `BlueBitsDbContext.Workflows` and uses `Include` / `Any` for permission-aware queries.

### 7. Imports Summary
- **External:** `Microsoft.EntityFrameworkCore`
- **Internal:** `BlueBits.Api.Data` (BlueBitsDbContext), `BlueBits.Api.Models` (Workflow)

### 8. Additional Info
`GetBySystemCodeAsync` eagerly loads `Permissions` so callers can immediately check role access without a second query. `GetActiveWorkflowsForRoleAsync` uses the RBAC join through `WorkflowPermissions`.
## 1. File Name and Directory
`Backend/Repositories/IWorkflowPermissionRepository.cs` + `Backend/Repositories/WorkflowPermissionRepository.cs`

### 2. File Type
Backend — C# specific repository interface + implementation

### 3. What the file does
Extends `IRepository<WorkflowPermission>` with RBAC-specific query. `IWorkflowPermissionRepository` declares `ExistsByRoleAndWorkflowAsync`. `WorkflowPermissionRepository` implements it against `BlueBitsDbContext`.

### 4. User Stories
- As a controller, I can quickly check whether a given role has permission to access a specific workflow by its ID.

### 5. Functions Summary
- `ExistsByRoleAndWorkflowAsync(string role, int workflowId)`: Returns true if a `WorkflowPermission` record exists matching both the role name and workflow ID.

### 6. Integration
Injected as `IWorkflowPermissionRepository` (scoped). Wraps `BlueBitsDbContext.WorkflowPermissions`.

### 7. Imports Summary
- **External:** `Microsoft.EntityFrameworkCore`
- **Internal:** `BlueBits.Api.Data` (BlueBitsDbContext), `BlueBits.Api.Models` (WorkflowPermission)

### 8. Additional Info
Used by the SessionsController to verify a user's role has access to a session's workflow before returning session details.
## 1. File Name and Directory
`Backend/Repositories/IPromptRepository.cs` + `Backend/Repositories/PromptRepository.cs`

### 2. File Type
Backend — C# specific repository interface + implementation

### 3. What the file does
Extends `IRepository<Prompt>` with no additional methods. `PromptRepository` is a thin wrapper around `GenericRepository<Prompt>`.

### 4. User Stories
- As a developer, I can inject `IPromptRepository` to perform CRUD on prompt templates without coupling to `BlueBitsDbContext` directly.

### 5. Functions Summary
Inherits all methods from `IRepository<Prompt>` (GetByIdAsync, GetAllAsync, AddAsync, Update, Delete, SaveChangesAsync, FindAsync).

### 6. Integration
Injected as `IPromptRepository` (scoped). All CRUD operations delegate to `GenericRepository<Prompt>`.

### 7. Imports Summary
- **Internal:** `BlueBits.Api.Data` (BlueBitsDbContext), `BlueBits.Api.Models` (Prompt)

### 8. Additional Info
Part of the 9-repository family. Prompts are managed by admins through `AdminPromptsController`.
## 1. File Name and Directory
`Backend/Repositories/ISessionRepository.cs` + `Backend/Repositories/SessionRepository.cs`

### 2. File Type
Backend — C# specific repository interface + implementation

### 3. What the file does
Extends `IRepository<Session>` with session-specific pagination, eager-loading, and utility queries. `ISessionRepository` declares three specialized methods. `SessionRepository` implements them against `BlueBitsDbContext`.

### 4. User Stories
- As a user, I can view a paginated list of my sessions with Material and Workflow metadata loaded.
- As a user, viewing a session loads all related data (User, Material, Workflow, Prompts, Notes, Files, SessionContent) in a single query.
- As the UploadFiles endpoint, I can determine the next `OrderIndex` for file ordering within a session.

### 5. Functions Summary
- `GetSessionsByUserIdPaginatedAsync(int userId, int page, int limit)`: Returns a tuple of `(IEnumerable<Session> Sessions, int TotalCount)` — paginated sessions for a user, ordered by `CreatedAt` desc, with `Material` and `Workflow` included.
- `GetSessionWithAllIncludesAsync(int sessionId)`: Returns a `Session` with all navigation properties eagerly loaded (User, Material, Workflow, Workflow.Prompts, Notes, Files ordered by OrderIndex, SessionContents).
- `GetMaxOrderIndexAsync(int sessionId)`: Returns the maximum `OrderIndex` among files in the given session, or 0 if no files exist.

### 6. Integration
Injected as `ISessionRepository` (scoped). Wraps `BlueBitsDbContext.Sessions` with multiple `Include` chains for complex eager-loading.

### 7. Imports Summary
- **External:** `Microsoft.EntityFrameworkCore`
- **Internal:** `BlueBits.Api.Data` (BlueBitsDbContext), `BlueBits.Api.Models` (Session)

### 8. Additional Info
`GetMaxOrderIndexAsync` uses a nullable int `Max` trick to handle empty result sets gracefully, returning 0 when no files exist.
## 1. File Name and Directory
`Backend/Repositories/ISessionContentRepository.cs` + `Backend/Repositories/SessionContentRepository.cs`

### 2. File Type
Backend — C# specific repository interface + implementation

### 3. What the file does
Extends `IRepository<SessionContent>` with no additional methods. `SessionContentRepository` is a thin wrapper around `GenericRepository<SessionContent>`.

### 4. User Stories
- As a developer, I can inject `ISessionContentRepository` to perform CRUD on session content (quiz/Pandoc output) without coupling to `BlueBitsDbContext` directly.

### 5. Functions Summary
Inherits all methods from `IRepository<SessionContent>` (GetByIdAsync, GetAllAsync, AddAsync, Update, Delete, SaveChangesAsync, FindAsync).

### 6. Integration
Injected as `ISessionContentRepository` (scoped). All CRUD operations delegate to `GenericRepository<SessionContent>`.

### 7. Imports Summary
- **Internal:** `BlueBits.Api.Data` (BlueBitsDbContext), `BlueBits.Api.Models` (SessionContent)

### 8. Additional Info
Part of the 9-repository family. SessionContent is managed through the `SessionsController.SaveSessionContent` endpoint using upsert logic.
## 1. File Name and Directory
`Backend/Repositories/IFileRepository.cs` + `Backend/Repositories/FileRepository.cs`

### 2. File Type
Backend — C# specific repository interface + implementation

### 3. What the file does
Extends `IRepository<File>` with a specialized query for file path enumeration. `IFileRepository` declares `GetAllLocalPathsAsync`. `FileRepository` implements it and uses the `File = BlueBits.Api.Models.File` alias to avoid naming conflicts with `System.IO.File`.

### 4. User Stories
- As the `OrphanFileCleanupService`, I can retrieve all `LocalFilePath` values from the database to compare against physical disk files during nightly cleanup.

### 5. Functions Summary
- `GetAllLocalPathsAsync()`: Returns a `List<string>` of all `LocalFilePath` values from the `Files` table.

### 6. Integration
Injected as `IFileRepository` (scoped). Used by `OrphanFileCleanupService` for nightly orphan file reconciliation.

### 7. Imports Summary
- **External:** `Microsoft.EntityFrameworkCore`
- **Internal:** `BlueBits.Api.Data` (BlueBitsDbContext), `File = BlueBits.Api.Models.File`

### 8. Additional Info
Uses `using File = BlueBits.Api.Models.File` to disambiguate from `System.IO.File`, consistent with the pattern used in `BlueBitsDbContext.cs`.
## 1. File Name and Directory
`Backend/Repositories/INoteRepository.cs` + `Backend/Repositories/NoteRepository.cs`

### 2. File Type
Backend — C# specific repository interface + implementation

### 3. What the file does
Extends `IRepository<Note>` with no additional methods. `NoteRepository` is a thin wrapper around `GenericRepository<Note>`.

### 4. User Stories
- As a developer, I can inject `INoteRepository` to perform CRUD on notes (general notes and file notes) without coupling to `BlueBitsDbContext` directly.

### 5. Functions Summary
Inherits all methods from `IRepository<Note>` (GetByIdAsync, GetAllAsync, AddAsync, Update, Delete, SaveChangesAsync, FindAsync).

### 6. Integration
Injected as `INoteRepository` (scoped). All CRUD operations delegate to `GenericRepository<Note>`.

### 7. Imports Summary
- **Internal:** `BlueBits.Api.Data` (BlueBitsDbContext), `BlueBits.Api.Models` (Note)

### 8. Additional Info
Part of the 9-repository family. Notes are managed through the `SessionsController` during session creation (GeneralNote) and file upload (FileNote).
## 1. File Name and Directory
`Backend/Services/Interfaces/IPandocService.cs`

### 2. File Type
Backend — Service interface

### 3. What the file does
Defines the `IPandocService` interface for Pandoc document generation. Contains `GenerateDocxAsync` which runs the pandoc CLI, processes equations (`{{{...}}}` → OfficeMath), and merges the result into a final template. Also defines the `PandocResult` record with `Success`, `FileUrl`, `Error`, and `Details` properties.

### 4. User Stories
- As a developer, I can inject `IPandocService` to generate formatted DOCX documents from markdown without coupling to OpenXML or CLI details.

### 5. Functions Summary
- `GenerateDocxAsync`: Takes markdown text, template name, material/type/lecture metadata, and content root path. Returns a `PandocResult`.

### 6. Integration
No database calls. Consumed by `PandocEndpoints`. Implemented by `PandocService`.

### 7. Imports Summary
- **External:** None (pure interface + record DTO)

### 8. Additional Info
Created as part of the service extraction refactor. All Pandoc/OpenXML logic lives in `PandocService`.
## 1. File Name and Directory
`Backend/Services/Interfaces/IMergeService.cs`

### 2. File Type
Backend — Service interface

### 3. What the file does
Defines the `IMergeService` interface for merging multiple DOCX files into a single formatted document. Contains `MergeDocxFilesAsync` which handles cover stripping, AltChunk injection, page layout normalization, and returns a `MergeResult` with `Url`, `FinalFileName`, and `Error` properties.

### 4. User Stories
- As a developer, I can inject `IMergeService` to merge multiple DOCX files without coupling to OpenXML manipulation details.

### 5. Functions Summary
- `MergeDocxFilesAsync`: Takes uploaded files, material name, lecture type, and content root path. Returns a `MergeResult`.

### 6. Integration
No database calls. Consumed by `MergeEndpoints`. Implemented by `MergeService`.

### 7. Imports Summary
- **External:** `Microsoft.AspNetCore.Http` (`IFormFileCollection`)

### 8. Additional Info
Created as part of the service extraction refactor. All merge OpenXML logic lives in `MergeService`.
## 1. File Name and Directory
`Backend/Services/Interfaces/IAuthService.cs`

### 2. File Type
Backend — Service interface

### 3. What the file does
Defines the `IAuthService` interface for authentication operations. Declares `LoginAsync` (username/password validation, JWT generation, RBAC workflow lookup) and `GetCurrentUserAsync` (user profile + fresh permissions by user ID). Uses named value tuples as return types.

### 4. User Stories
- As a developer, I can inject `IAuthService` to authenticate users and retrieve current user data without coupling to EF Core or JWT implementation details.

### 5. Functions Summary
- `LoginAsync(string username, string password)`: Returns `(User user, string token, List<string> workflows)?` — null when credentials are invalid.
- `GetCurrentUserAsync(int userId)`: Returns `(User user, List<string> workflows)?` — null when user not found.

### 6. Integration
Consumed by `AuthController`. Implemented by `AuthService`.

### 7. Imports Summary
- **Internal:** `BlueBits.Api.Models` (User)

### 8. Additional Info
Created as part of the service extraction refactor. All JWT generation and RBAC workflow fetching moved from `AuthController` into `AuthService`.
## 1. File Name and Directory
`Backend/Services/AuthService.cs`

### 2. File Type
Backend — Service implementation

### 3. What the file does
Implements `IAuthService`. Contains all authentication logic: user lookup via `IUserRepository`, RBAC-authorized workflow fetching via `IWorkflowRepository`, and JWT token generation using configurable settings (`Key`, `Issuer`, `Audience`, `ExpireDays` from `appsettings.json`).

### 4. User Stories
- As a user, I can log in and receive a signed JWT containing my user ID, username, and role claims.
- As a developer, JWT creation logic is centralized in one place instead of inline in the controller.

### 5. Functions Summary
- `LoginAsync`: Looks up user by username via `IUserRepository`, validates plaintext password, fetches active workflows for the user's role, generates and returns a JWT.
- `GetCurrentUserAsync`: Looks up user by ID via `IUserRepository`, fetches active workflows for the user's role, returns user profile + workflows.
- `GenerateJwt(User)`: Private helper — builds claims (Sub, NameIdentifier, Name, Role), creates a `JwtSecurityToken` with configurable expiry/issuer/audience, signs with HMAC-SHA256.

### 6. Integration
- **Repositories:** `IUserRepository` for user lookup, `IWorkflowRepository` for RBAC-authorized workflow querying.
- **Configuration:** Reads Jwt:Key, Jwt:Issuer, Jwt:Audience, Jwt:ExpireDays from `IConfiguration`.

### 7. Imports Summary
- **External:** `System.IdentityModel.Tokens.Jwt`, `System.Security.Claims`, `System.Text`, `Microsoft.Extensions.Configuration`, `Microsoft.IdentityModel.Tokens`
- **Internal:** `BlueBits.Api.Models` (User), `BlueBits.Api.Repositories` (`IUserRepository`, `IWorkflowRepository`), `BlueBits.Api.Services.Interfaces` (`IAuthService`)

### 8. Additional Info
- Registered as scoped in DI via `ServiceCollectionExtensions.AddPersistence`.
- Passwords compared in plaintext (no hashing) — consistent with existing codebase convention.
- JWT generation logic extracted from `AuthController` to enable unit testing and reuse.
## 1. File Name and Directory
`Backend/Services/PandocService.cs`

### 2. File Type
Backend — Service implementation

### 3. What the file does
Implements `IPandocService`. Contains all Pandoc CLI invocation logic, equation processing (`ProcessEquations`, `CreateWordRuns`, `CreateMathRuns`), and template merge (`MergeWithTemplate`) extracted from `PandocEndpoints`. The private `CharFormat` helper class tracks per-character formatting during equation parsing.

### 4. User Stories
- As a developer, I can call `PandocService.GenerateDocxAsync` to convert markdown to a formatted `.docx` with math equations.

### 5. Functions Summary
- `GenerateDocxAsync`: Runs pandoc CLI, post-processes equations, merges with final template, returns result.
- `ProcessEquations`: Scans paragraphs for `{{{...}}}`, flattens runs into character arrays, replaces equation placeholders with `OfficeMath` elements.
- `CreateWordRuns`: Rebuilds `WRun` elements from `CharFormat` lists, grouping consecutive characters with identical formatting.
- `CreateMathRuns`: Creates `MRun` elements for math content, preserving character-level formatting.
- `MergeWithTemplate`: Copies the final template, imports via `AltChunk`, inserts after first section-break paragraph.

### 6. Integration
Calls the **pandoc** external CLI tool. Uses OpenXML SDK for DOCX manipulation. Does not call backend APIs or database.

### 7. Imports Summary
- **External:** `System.Diagnostics`, `DocumentFormat.OpenXml.*` (Wordprocessing, Math, Packaging)
- **Internal:** `BlueBits.Api.Services.Interfaces` (`IPandocService`, `PandocResult`)

### 8. Additional Info
Requires **pandoc** on system PATH. Template `.dotx` files in `Resources/PandocTemplates/`.
## 1. File Name and Directory
`Backend/Services/MergeService.cs`

### 2. File Type
Backend — Service implementation

### 3. What the file does
Implements `IMergeService`. Contains all DOCX merge logic (cover stripping, AltChunk injection, page layout normalization) extracted from `MergeEndpoints`.

### 4. User Stories
- As a developer, I can call `MergeService.MergeDocxFilesAsync` to merge multiple DOCX files into one formatted document.

### 5. Functions Summary
- `MergeDocxFilesAsync`: Strips cover/back cover pages from each input file, injects content via AltChunk, preserves template page size/margin, applies page breaks between files, and normalizes all section properties.

### 6. Integration
Uses OpenXML SDK for DOCX manipulation. No database calls.

### 7. Imports Summary
- **External:** `DocumentFormat.OpenXml.*` (Wordprocessing, Packaging), `Microsoft.AspNetCore.Http` (`IFormFileCollection`)
- **Internal:** `BlueBits.Api.Services.Interfaces` (`IMergeService`, `MergeResult`)

### 8. Additional Info
Template files: `Pandoc-Theo-Final-Step.dotx` (theoretical) / `Pandoc-Prac-Final-Step.dotx` (practical). All merge logic moved from `MergeEndpoints`.
## 1. File Name and Directory
`Backend/Validators/`

### 2. File Type
Backend — FluentValidation validator classes (10 validators)

### 3. What the file does
Contains 10 `AbstractValidator<T>` implementations in the `BlueBits.Api.Validators` namespace, one for each request DTO. These replace the `System.ComponentModel.DataAnnotations` attributes previously on `CreateUserRequest` and `UpdateUserRequest`, and add validation for DTOs that had no DataAnnotations. All validators are auto-discovered by `AddValidatorsFromAssemblyContaining<Program>()` in `ServiceCollectionExtensions.cs` and executed via `AddFluentValidationAutoValidation()` before controller actions.

Validators:
- `LoginRequestValidator` — ensures Username and Password are not empty.
- `CreateUserRequestValidator` — ports existing DataAnnotations (Required, StringLength, Regex on Username/Password), adds Telegram @ prefix normalization validation (5-32 alphanumeric chars or underscores, strips leading @).
- `UpdateUserRequestValidator` — ports existing DataAnnotations on Password (conditional), adds Telegram @ prefix normalization validation.
- `CreateSessionRequestValidator` — ensures WorkflowSystemCode, MaterialName, LectureType are not empty; LectureNumber > 0.
- `SaveSessionContentRequestValidator` — ensures ContentBody is not empty.
- `CompilePromptRequestValidator` — ensures systemCode is not empty.
- `CreatePermissionRequestValidator` — ensures roleName is `TechMember` or `ScientificMember`; workflowId > 0.
- `ToggleWorkflowRequestValidator` — no rules (bool-only DTO).
- `UpdatePromptRequestValidator` — ensures PromptText is not empty.
- `GenerateDocxRequestValidator` — ensures MarkdownText, MaterialName, Type, LectureNumber are not empty.

### 4. User Stories
- As a developer, validation rules are centralized in dedicated validator classes instead of scattered as DataAnnotation attributes on DTOs.
- As a frontend developer, I receive consistent 400 responses with per-field error maps (via `ExceptionHandlingMiddleware`) for all invalid requests.
- As a user, Telegram usernames are validated for correct format (5-32 alphanumeric chars, with or without @ prefix) before reaching the controller.

### 5. Functions Summary
Each validator exposes an `AbstractValidator<T>` constructor that configures `RuleFor` chains. Shared logic (`BeValidTelegramUsername`) is implemented as a private static method in `CreateUserRequestValidator` and `UpdateUserRequestValidator`.

### 6. Integration
- **FluentValidation auto-validation:** Registered via `services.AddFluentValidationAutoValidation()` in `ServiceCollectionExtensions.AddApiLayer()`.
- **Assembly scanning:** `services.AddValidatorsFromAssemblyContaining<Program>()` discovers all validators in the `BlueBits.Api.Validators` namespace.
- **Exception handling:** `ExceptionHandlingMiddleware` catches `FluentValidation.ValidationException` and returns 400 with `{field: [errors]}` format.

### 7. Imports Summary
Each validator imports:
- `FluentValidation` — `AbstractValidator<T>`, `RuleFor`, `NotEmpty`, `Length`, `Matches`, `GreaterThan`, `When`
- `BlueBits.Api.DTOs.Requests` — the corresponding request DTO class

### 8. Additional Info
- All DataAnnotation attributes (`[Required]`, `[RegularExpression]`, `[StringLength]`) were removed from `CreateUserRequest` and `UpdateUserRequest` in `DTOs/Requests/` — validation is fully handled by FluentValidation validators now.
- Inline DTO class definitions in controllers (`AdminController.cs`, `AuthController.cs`, `SessionsController.cs`, `PromptsController.cs`, `AdminPermissionsController.cs`, `AdminWorkflowsController.cs`, `AdminPromptsController.cs`, `PandocEndpoints.cs`) were deleted — all DTOs now live exclusively in `BlueBits.Api.DTOs.Requests` namespace.
- Telegram username validation strips the `@` prefix (if present) before checking format, accepting both `@username` and `username` forms. The actual normalization (adding `@` prefix) remains in the controller's `CreateUser`/`UpdateUser` methods. 
- `ToggleWorkflowRequestValidator` has no rules because the DTO contains only a `bool IsActive` property.
- The `CompilePromptRequest` property `systemCode` intentionally uses camelCase (matching JSON serialization conventions of the original inline DTO).
