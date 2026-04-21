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