# Master Architecture & Database Documentation
**System:** AI-Assisted Academic Workflow System (SQLite / C# Backend / Frontend UI)
**Document Purpose:** Single Source of Truth for Database Schema, Application Integration, Role Architecture, and Troubleshooting.

---

## Part 1: The Master SQL Schema
Below is the complete, optimized SQLite schema. It includes strict typing, foreign key constraints, auto-incrementing primary keys, indexing for performance, trigger-based cleanup, and initial seed data.

```sql
---------------------------------------------------------------------
-- 1. TABLES CREATION
---------------------------------------------------------------------

-- Users Table (Handles Authentication and Roles)
CREATE TABLE "Users" (
    "UserId" INTEGER NOT NULL CONSTRAINT "PK_Users" PRIMARY KEY AUTOINCREMENT,
    "FirstName" TEXT NOT NULL,
    "LastName" TEXT NOT NULL,
    "UserRole" TEXT NOT NULL CHECK("UserRole" IN ('Admin', 'TechMember', 'ScientificMember')),
    "BatchNumber" INTEGER NOT NULL CHECK("BatchNumber" > 0),
    "TelegramUsername" TEXT NULL, 
    "Username" TEXT NOT NULL UNIQUE, 
    "PasswordHash" TEXT NOT NULL, -- Stored as Hash (BCrypt/Argon2)
    "CreatedAt" TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, 
    "TeamJoinDate" TEXT NULL,
    CONSTRAINT "UQ_Telegram_Role" UNIQUE ("TelegramUsername", "UserRole")
);

-- Materials Table (University Subjects)
CREATE TABLE "Materials" (
    "MaterialId" INTEGER NOT NULL CONSTRAINT "PK_Materials" PRIMARY KEY AUTOINCREMENT,
    "MaterialName" TEXT NOT NULL,
    "MaterialYear" INTEGER NOT NULL CHECK("MaterialYear" BETWEEN 1 AND 5)
);

-- Workflows Table (Dynamic Feature Flags & Configurations)
CREATE TABLE "Workflows" (
    "WorkflowId" INTEGER NOT NULL CONSTRAINT "PK_Workflows" PRIMARY KEY AUTOINCREMENT,
    "SystemCode" TEXT NOT NULL UNIQUE, -- The core integration key for C# and Frontend
    "AdminNote" TEXT NOT NULL,         -- Internal name for Admin dashboard
    "IsActive" INTEGER NOT NULL DEFAULT 1 -- Toggle to 0 to hide system-wide
);

-- WorkflowPermissions Table (Role-Based Access Control Mapping)
CREATE TABLE "WorkflowPermissions" (
    "PermissionId" INTEGER NOT NULL CONSTRAINT "PK_WorkflowPermissions" PRIMARY KEY AUTOINCREMENT,
    "RoleName" TEXT NOT NULL CHECK("RoleName" IN ('TechMember', 'ScientificMember')),
    "WorkflowId" INTEGER NOT NULL,
    CONSTRAINT "FK_Permissions_Workflows" FOREIGN KEY ("WorkflowId") REFERENCES "Workflows" ("WorkflowId") ON DELETE CASCADE,
    CONSTRAINT "UQ_Role_Workflow" UNIQUE ("RoleName", "WorkflowId")
);

-- Prompts Table (The AI Instructions)
CREATE TABLE "Prompts" (
    "PromptId" INTEGER NOT NULL CONSTRAINT "PK_Prompts" PRIMARY KEY AUTOINCREMENT,
    "WorkflowId" INTEGER NOT NULL,     -- Maps prompt to a specific workflow
    "SystemCode" TEXT NOT NULL UNIQUE, -- For C# Connection
    "PromptName" TEXT NOT NULL, 
    "PromptText" TEXT NOT NULL,
    CONSTRAINT "FK_Prompts_Workflows" FOREIGN KEY ("WorkflowId") REFERENCES "Workflows" ("WorkflowId") ON DELETE CASCADE
);

-- Sessions Table (The User Workspace)
CREATE TABLE "Sessions" (
    "SessionId" INTEGER NOT NULL CONSTRAINT "PK_Sessions" PRIMARY KEY AUTOINCREMENT,
    "UserId" INTEGER NOT NULL, 
    "MaterialId" INTEGER NULL, 
    "WorkflowId" INTEGER NOT NULL,
    "LectureNumber" INTEGER NOT NULL CHECK("LectureNumber" > 0),
    "LectureType" TEXT NOT NULL CHECK("LectureType" IN ('Theoretical', 'Practical')),
    "QuizData" TEXT NULL, -- Stored as serialized JSON
    "CreatedAt" TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FK_Sessions_Users_UserId" FOREIGN KEY ("UserId") REFERENCES "Users" ("UserId") ON DELETE CASCADE,
    CONSTRAINT "FK_Sessions_Materials_MaterialId" FOREIGN KEY ("MaterialId") REFERENCES "Materials" ("MaterialId") ON DELETE SET NULL,
    CONSTRAINT "FK_Sessions_Workflows_WorkflowId" FOREIGN KEY ("WorkflowId") REFERENCES "Workflows" ("WorkflowId") ON DELETE RESTRICT
);

-- Files Table (The Physical I/O)
CREATE TABLE "Files" (
    "FileId" INTEGER NOT NULL CONSTRAINT "PK_Files" PRIMARY KEY AUTOINCREMENT,
    "SessionId" INTEGER NOT NULL,
    "LocalFilePath" TEXT NOT NULL,
    "FileType" TEXT NOT NULL CHECK("FileType" IN ('Image', 'Docx', 'Other')), 
    "OrderIndex" INTEGER NOT NULL,
    CONSTRAINT "FK_Files_Sessions_SessionId" FOREIGN KEY ("SessionId") REFERENCES "Sessions" ("SessionId") ON DELETE CASCADE
);

-- Notes Table (Context for the AI)
CREATE TABLE "Notes" (
    "NoteId" INTEGER NOT NULL CONSTRAINT "PK_Notes" PRIMARY KEY AUTOINCREMENT,
    "SessionId" INTEGER NOT NULL,
    "NoteText" TEXT NOT NULL,
    "NoteType" TEXT NOT NULL CHECK("NoteType" IN ('GeneralNote', 'FileNote')), 
    "FileId" INTEGER NULL, 
    CONSTRAINT "FK_Notes_Files_FileId" FOREIGN KEY ("FileId") REFERENCES "Files" ("FileId") ON DELETE SET NULL,
    CONSTRAINT "FK_Notes_Sessions_SessionId" FOREIGN KEY ("SessionId") REFERENCES "Sessions" ("SessionId") ON DELETE CASCADE
);

---------------------------------------------------------------------
-- 2. INDEXES (Performance Optimizations)
---------------------------------------------------------------------
-- SQLite does not index Foreign Keys automatically. These are required 
-- to prevent full-table scans during ON DELETE CASCADE operations.
CREATE INDEX "IX_Sessions_UserId" ON "Sessions" ("UserId");
CREATE INDEX "IX_Sessions_MaterialId" ON "Sessions" ("MaterialId");
CREATE INDEX "IX_Sessions_WorkflowId" ON "Sessions" ("WorkflowId");
CREATE INDEX "IX_Files_SessionId" ON "Files" ("SessionId");
CREATE INDEX "IX_Notes_SessionId" ON "Notes" ("SessionId");
CREATE INDEX "IX_Notes_FileId" ON "Notes" ("FileId");

---------------------------------------------------------------------
-- 3. TRIGGERS (Database-Level Automation)
---------------------------------------------------------------------
-- Automatically enforces the "Max 3 Sessions per User per Workflow" rule
CREATE TRIGGER "TRG_KeepMax3Sessions"
AFTER INSERT ON "Sessions"
BEGIN
    DELETE FROM "Sessions"
    WHERE "SessionId" NOT IN (
        SELECT "SessionId" 
        FROM "Sessions" 
        WHERE "UserId" = NEW."UserId" 
          AND "WorkflowId" = NEW."WorkflowId"
        ORDER BY "CreatedAt" DESC 
        LIMIT 3
    )
    AND "UserId" = NEW."UserId" 
    AND "WorkflowId" = NEW."WorkflowId";
END;

---------------------------------------------------------------------
-- 4. INITIAL SEED DATA (System Configuration)
---------------------------------------------------------------------
INSERT INTO "Workflows" ("WorkflowId", "SystemCode", "AdminNote", "IsActive") VALUES 
(1, 'LEC_EXT', 'Lecture Extraction Workflow', 1),
(2, 'BANK_EXT', 'Bank Extraction Workflow', 1),
(3, 'LEC_COORD', 'Lecture Coordination Workflow', 1),
(4, 'BANK_COORD', 'Bank Coordination Workflow', 1),
(5, 'PANDOC', 'Pandoc Processing Workflow', 1),
(6, 'BANK_QS', 'Bank Questions Workflow', 1),
(7, 'DRAW', 'Draw AI Workflow (Beta)', 1), 
(8, 'MERGE', 'Merge Workflow (Beta)', 1); 

INSERT INTO "WorkflowPermissions" ("RoleName", "WorkflowId") VALUES 
('TechMember', 1), 
('TechMember', 2), 
('TechMember', 3), 
('TechMember', 4), 
('ScientificMember', 5); 

INSERT INTO "Prompts" ("WorkflowId", "SystemCode", "PromptName", "PromptText") VALUES 
(1, 'PROMPT_LEC_EXT', 'Lecture Extraction', 'You are an AI extracting lectures...'),
(2, 'PROMPT_BANK_EXT', 'Bank Extraction', 'You are an AI extracting banks...'),
(3, 'PROMPT_LEC_COORD', 'Lecture Coordination', 'Coordinate this lecture...'),
(4, 'PROMPT_BANK_COORD', 'Bank Coordination', 'Coordinate this bank...'),
(6, 'PROMPT_DRAW_AI', 'Draw Using AI', 'Generate markdown/mermaid drawings...'),
(5, 'PROMPT_BANK_QS', 'Bank Questions', 'Generate quiz questions for the bank...');
```

---

## Part 2: Database Exploration & Architecture
The system is built as a **Decoupled Workflow Engine**, heavily relying on Role-Based Access Control (RBAC). 

### The Core Flow
1. **Access Matrix**: When a user logs in, the system checks their `UserRole`. It queries `WorkflowPermissions` to see exactly which workflows they are permitted to use. 
2. **Dynamic Logic**: Workflows are not hardcoded into tables. `Workflows` act as feature flags. If the Admin sets `IsActive = 0` for 'Pandoc', the UI hides it and the Backend rejects requests for it, *without deleting any historical data*.
3. **The Session Sandbox**: A `Session` is the unit of work. A session strictly binds a `User`, a `Material` (Subject), and a `Workflow`. 
4. **Context Building (Files & Notes)**: Inside a session, a user uploads `Files` (Images, DOCX). They attach `Notes` either broadly to the session (`GeneralNote`) or specifically to a file (`FileNote`).
5. **Orchestration**: The system determines the active workflow, retrieves the associated `Prompts` (from the `Prompts` table), packages the user's `Notes` and `Files` (Images) into the prompt, and send them to the frontend to present them as he want (we can send the combined prompt (note that combined prompt processed from backend instead of frontend), and also we can send notes with images to allow user to edit them for example).

### Beta Features (Merge & Draw)
Notice that Workflows 6 and 7 ('DRAW' and 'MERGE') exist in the `Workflows` table but have **no entries** in `WorkflowPermissions`. This makes them "Beta/Hidden". Admin can easily enable them later by simply inserting rows mapping them to `TechMember` in the permissions table.

---

## Part 3: Backend Integration & Clean Code (C#)
**The Problem:** Hardcoding database IDs (like `WorkflowId == 3`) in C# causes fragile, broken code if the DB IDs ever shift.
**The Solution:** The `SystemCode` column. 

In your C# backend, define static constants that perfectly match the database `SystemCode` values.

```csharp
// System definitions in C#
public static class AppWorkflows
{
    public const string LectureExtraction = "LEC_EXT";
    public const string Coordination = "COORD";
    public const string Pandoc = "PANDOC";
    public const string BankQuestions = "BANK_QS";
}

public static class AppPrompts 
{
    public const string LectureCoordination = "PROMPT_LEC_COORD";
}
```

Now, your application logic queries the database dynamically using the codes:
```csharp
// Example: Getting Authorized workflows for a user
var authorizedWorkflows = await dbContext.Workflows
    .Where(w => w.IsActive == 1 && w.Permissions.Any(p => p.RoleName == currentUser.Role))
    .Select(w => w.SystemCode)
    .ToListAsync();

// Example: Fetching the prompt text for an AI call
var promptText = await dbContext.Prompts
    .Where(p => p.SystemCode == AppPrompts.LectureCoordination)
    .Select(p => p.PromptText)
    .FirstOrDefaultAsync();
```
*Benefits:* Clean, scalable code. Total immunity to database ID changes.

---

## Part 4: Frontend Integration & i18n (Translations)
**The Problem:** We removed `DisplayName` from the database because saving translations in the DB makes it clunky and slow.
**The Solution:** The Frontend uses the `SystemCode` sent by the Backend as the **Translation Key** and **Routing Key**.

**1. The Frontend Language Files (e.g., React `i18n`)**
```json
// en.json (English)
{
  "LEC_EXT": "Lecture Extraction",
  "BANK_QS": "Question Bank Generation"
}

// ar.json (Arabic)
{
  "LEC_EXT": "استخراج المحاضرات",
  "BANK_QS": "توليد بنك الأسئلة"
}
```

**2. Dynamic Sidebar Logic**
The backend sends an array of allowed codes: `["LEC_EXT", "BANK_QS"]`. The frontend filters its master UI list based on this array and translates it on the fly.

```javascript
const UserSidebar = ({ allowedCodes }) => {
    return allowedCodes.map(code => (
        <Menu.Item key={code}>
            <Link to={`/workflow/${code.toLowerCase()}`}>
                {translate(code)} {/* Translates 'LEC_EXT' to English or Arabic */}
            </Link>
        </Menu.Item>
    ));
}
```

---

## Part 5: Problems and Standard Fixes

### Critical Issue: The Orphan File Problem (Physical Storage)
**The Cause:** The SQLite trigger `TRG_KeepMax3Sessions` automatically deletes older sessions in the background. Because of `ON DELETE CASCADE`, it also deletes the corresponding rows in the `Files` table. **However, SQLite cannot delete physical `.jpg` or `.docx` files from your server's hard drive.** Over time, these orphaned files will consume all server disk space.

**The Fix: The "Garbage Collector" Service (Standard Approach)**
You must create a C# Background Service (e.g., using `IHostedService` or Quartz.NET) that runs nightly.

For example:

```csharp
public class OrphanFileCleanupService : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            // 1. Get all physical files from your server upload directory
            var physicalFiles = Directory.GetFiles("C:/ServerFiles/Uploads");

            // 2. Get all file paths currently documented in the DB
            using var scope = _serviceProvider.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var dbFiles = await dbContext.Files.Select(f => f.LocalFilePath).ToListAsync();

            // 3. Find physical files that DO NOT exist in the DB (Orphans)
            var orphans = physicalFiles.Except(dbFiles).ToList();

            // 4. Delete them safely
            foreach (var orphanPath in orphans)
            {
                try { File.Delete(orphanPath); }
                catch { /* Ignore locked files, try again tomorrow */ }
            }

            // Run once every 24 hours
            await Task.Delay(TimeSpan.FromDays(1), stoppingToken);
        }
    }
}
```
*Why this is the best fix:* It is fault-tolerant. It decouples the DB from the hard drive, meaning no matter how a row is deleted, the physical drive is always cleaned up safely.

---

## Part 6: Roles and Access Matrix Definitions
This defines the systemic constraints dictated by the database and business logic rules.

### 1. The Admin Role
*   **Workflow Operations:** Cannot create/execute any Sessions. Does not appear in `WorkflowPermissions`.
*   **User Management:** Full CRUD on `Users` table (Add, Edit, Delete).
*   **Material Management:** Full CRUD on `Materials` table (Add, Edit, Delete).
*   **System Configuration:** 
    *   Can update `Prompts` table (`PromptText` ONLY). Cannot add/delete prompts (enforced by application logic/UI omission) to prevent AI architecture breakdown.
    *   Can update `Workflows` table to toggle `IsActive` (0 or 1) to enable/hide workflows system-wide.
    *   Can manipulate `WorkflowPermissions` to grant Beta access (like DRAW/MERGE) to member roles.

### 2. The TechMember Role
*   Can execute Sessions.
*   **Authorized Workflows (Default DB Seed):** Lecture Extraction, Bank Extraction, Coordination, Pandoc Processing.
*   **Unauthorized Workflows:** Bank Questions (Hidden), Draw (Hidden), Merge (Hidden).

### 3. The ScientificMember Role
*   Can execute Sessions.
*   **Authorized Workflows (Default DB Seed):** Bank Questions.
*   **Unauthorized Workflows:** All others are hidden and restricted at the DB level.