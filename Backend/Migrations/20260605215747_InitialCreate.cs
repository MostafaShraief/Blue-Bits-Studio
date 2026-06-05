using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace BlueBits.Api.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Materials",
                columns: table => new
                {
                    MaterialId = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    MaterialName = table.Column<string>(type: "TEXT", nullable: false),
                    MaterialYear = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Materials", x => x.MaterialId);
                    table.CheckConstraint("CHK_MaterialYear", "\"MaterialYear\" BETWEEN 1 AND 5");
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    UserId = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    FirstName = table.Column<string>(type: "TEXT", nullable: false),
                    LastName = table.Column<string>(type: "TEXT", nullable: false),
                    UserRole = table.Column<string>(type: "TEXT", nullable: false),
                    BatchNumber = table.Column<int>(type: "INTEGER", nullable: false),
                    TelegramUsername = table.Column<string>(type: "TEXT", nullable: true),
                    Username = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false),
                    Password = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    CreatedAt = table.Column<string>(type: "TEXT", nullable: false),
                    TeamJoinDate = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.UserId);
                    table.CheckConstraint("CHK_BatchNumber", "\"BatchNumber\" > 0");
                    table.CheckConstraint("CHK_UserRole", "\"UserRole\" IN ('Admin', 'TechMember', 'ScientificMember')");
                });

            migrationBuilder.CreateTable(
                name: "Workflows",
                columns: table => new
                {
                    WorkflowId = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    SystemCode = table.Column<string>(type: "TEXT", nullable: false),
                    AdminNote = table.Column<string>(type: "TEXT", nullable: false),
                    IsActive = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Workflows", x => x.WorkflowId);
                });

            migrationBuilder.CreateTable(
                name: "Prompts",
                columns: table => new
                {
                    PromptId = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    WorkflowId = table.Column<int>(type: "INTEGER", nullable: false),
                    SystemCode = table.Column<string>(type: "TEXT", nullable: false),
                    PromptName = table.Column<string>(type: "TEXT", nullable: false),
                    PromptText = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Prompts", x => x.PromptId);
                    table.ForeignKey(
                        name: "FK_Prompts_Workflows_WorkflowId",
                        column: x => x.WorkflowId,
                        principalTable: "Workflows",
                        principalColumn: "WorkflowId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Sessions",
                columns: table => new
                {
                    SessionId = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    UserId = table.Column<int>(type: "INTEGER", nullable: false),
                    MaterialId = table.Column<int>(type: "INTEGER", nullable: false),
                    WorkflowId = table.Column<int>(type: "INTEGER", nullable: false),
                    LectureNumber = table.Column<int>(type: "INTEGER", nullable: false),
                    LectureType = table.Column<string>(type: "TEXT", nullable: false),
                    CreatedAt = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Sessions", x => x.SessionId);
                    table.CheckConstraint("CHK_LectureNumber", "\"LectureNumber\" > 0");
                    table.CheckConstraint("CHK_LectureType", "\"LectureType\" IN ('Theoretical', 'Practical')");
                    table.ForeignKey(
                        name: "FK_Sessions_Materials_MaterialId",
                        column: x => x.MaterialId,
                        principalTable: "Materials",
                        principalColumn: "MaterialId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Sessions_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Sessions_Workflows_WorkflowId",
                        column: x => x.WorkflowId,
                        principalTable: "Workflows",
                        principalColumn: "WorkflowId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "WorkflowPermissions",
                columns: table => new
                {
                    PermissionId = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    RoleName = table.Column<string>(type: "TEXT", nullable: false),
                    WorkflowId = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WorkflowPermissions", x => x.PermissionId);
                    table.CheckConstraint("CHK_RoleName", "\"RoleName\" IN ('TechMember', 'ScientificMember')");
                    table.ForeignKey(
                        name: "FK_WorkflowPermissions_Workflows_WorkflowId",
                        column: x => x.WorkflowId,
                        principalTable: "Workflows",
                        principalColumn: "WorkflowId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Files",
                columns: table => new
                {
                    FileId = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    SessionId = table.Column<int>(type: "INTEGER", nullable: false),
                    LocalFilePath = table.Column<string>(type: "TEXT", nullable: false),
                    FileType = table.Column<string>(type: "TEXT", nullable: false),
                    OrderIndex = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Files", x => x.FileId);
                    table.CheckConstraint("CHK_FileType", "\"FileType\" IN ('Image', 'Docx', 'Other')");
                    table.ForeignKey(
                        name: "FK_Files_Sessions_SessionId",
                        column: x => x.SessionId,
                        principalTable: "Sessions",
                        principalColumn: "SessionId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SessionContents",
                columns: table => new
                {
                    ContentId = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    SessionId = table.Column<int>(type: "INTEGER", nullable: false),
                    ContentBody = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SessionContents", x => x.ContentId);
                    table.ForeignKey(
                        name: "FK_SessionContents_Sessions_SessionId",
                        column: x => x.SessionId,
                        principalTable: "Sessions",
                        principalColumn: "SessionId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Notes",
                columns: table => new
                {
                    NoteId = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    SessionId = table.Column<int>(type: "INTEGER", nullable: false),
                    NoteText = table.Column<string>(type: "TEXT", nullable: false),
                    NoteType = table.Column<string>(type: "TEXT", nullable: false),
                    FileId = table.Column<int>(type: "INTEGER", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Notes", x => x.NoteId);
                    table.CheckConstraint("CHK_NoteType", "\"NoteType\" IN ('GeneralNote', 'FileNote')");
                    table.ForeignKey(
                        name: "FK_Notes_Files_FileId",
                        column: x => x.FileId,
                        principalTable: "Files",
                        principalColumn: "FileId",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Notes_Sessions_SessionId",
                        column: x => x.SessionId,
                        principalTable: "Sessions",
                        principalColumn: "SessionId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "UserId", "BatchNumber", "CreatedAt", "FirstName", "LastName", "Password", "TeamJoinDate", "TelegramUsername", "UserRole", "Username" },
                values: new object[,]
                {
                    { 1, 1, "2026-06-05T21:57:46.5822817Z", "Mostafa", "Shraief", "Admin@123", null, null, "Admin", "MostafaShraief" },
                    { 2, 1, "2026-06-05T21:57:46.5823583Z", "John", "Tech", "Tech@2026", null, null, "TechMember", "john_tech" },
                    { 3, 1, "2026-06-05T21:57:46.5823587Z", "Sara", "Siri", "something", null, null, "ScientificMember", "SaraSiri" }
                });

            migrationBuilder.InsertData(
                table: "Workflows",
                columns: new[] { "WorkflowId", "AdminNote", "IsActive", "SystemCode" },
                values: new object[,]
                {
                    { 1, "Lecture Extraction Workflow", 1, "LEC_EXT" },
                    { 2, "Bank Extraction Workflow", 1, "BANK_EXT" },
                    { 3, "Lecture Coordination Workflow", 1, "LEC_COORD" },
                    { 4, "Bank Coordination Workflow", 1, "BANK_COORD" },
                    { 5, "Pandoc Processing Workflow", 1, "PANDOC" },
                    { 6, "Bank Questions Workflow", 1, "BANK_QS" },
                    { 7, "Draw AI Workflow (Beta)", 1, "DRAW" },
                    { 8, "Merge Workflow (Beta)", 1, "MERGE" }
                });

            migrationBuilder.InsertData(
                table: "Prompts",
                columns: new[] { "PromptId", "PromptName", "PromptText", "SystemCode", "WorkflowId" },
                values: new object[,]
                {
                    { 1, "Lecture Extraction", "You are an AI extracting lectures...", "PROMPT_LEC_EXT", 1 },
                    { 2, "Bank Extraction", "You are an AI extracting banks...", "PROMPT_BANK_EXT", 2 },
                    { 3, "Lecture Coordination", "Coordinate this lecture...", "PROMPT_LEC_COORD", 3 },
                    { 4, "Bank Coordination", "Coordinate this bank...", "PROMPT_BANK_COORD", 4 },
                    { 5, "Draw Using AI", "Generate markdown/mermaid drawings...", "PROMPT_DRAW_AI", 6 },
                    { 6, "Bank Questions", "Generate quiz questions for the bank...", "PROMPT_BANK_QS", 5 }
                });

            migrationBuilder.InsertData(
                table: "WorkflowPermissions",
                columns: new[] { "PermissionId", "RoleName", "WorkflowId" },
                values: new object[,]
                {
                    { 1, "TechMember", 1 },
                    { 2, "TechMember", 2 },
                    { 3, "TechMember", 3 },
                    { 4, "TechMember", 4 },
                    { 5, "TechMember", 5 },
                    { 7, "TechMember", 7 },
                    { 8, "TechMember", 8 },
                    { 10, "ScientificMember", 6 }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Files_SessionId",
                table: "Files",
                column: "SessionId");

            migrationBuilder.CreateIndex(
                name: "IX_Notes_FileId",
                table: "Notes",
                column: "FileId");

            migrationBuilder.CreateIndex(
                name: "IX_Notes_SessionId",
                table: "Notes",
                column: "SessionId");

            migrationBuilder.CreateIndex(
                name: "IX_Prompts_SystemCode",
                table: "Prompts",
                column: "SystemCode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Prompts_WorkflowId",
                table: "Prompts",
                column: "WorkflowId");

            migrationBuilder.CreateIndex(
                name: "IX_SessionContents_SessionId",
                table: "SessionContents",
                column: "SessionId");

            migrationBuilder.CreateIndex(
                name: "IX_Sessions_MaterialId",
                table: "Sessions",
                column: "MaterialId");

            migrationBuilder.CreateIndex(
                name: "IX_Sessions_UserId",
                table: "Sessions",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Sessions_WorkflowId",
                table: "Sessions",
                column: "WorkflowId");

            migrationBuilder.CreateIndex(
                name: "IX_Users_TelegramUsername_UserRole",
                table: "Users",
                columns: new[] { "TelegramUsername", "UserRole" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Users_Username",
                table: "Users",
                column: "Username",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_WorkflowPermissions_RoleName_WorkflowId",
                table: "WorkflowPermissions",
                columns: new[] { "RoleName", "WorkflowId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_WorkflowPermissions_WorkflowId",
                table: "WorkflowPermissions",
                column: "WorkflowId");

            migrationBuilder.CreateIndex(
                name: "IX_Workflows_SystemCode",
                table: "Workflows",
                column: "SystemCode",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Notes");

            migrationBuilder.DropTable(
                name: "Prompts");

            migrationBuilder.DropTable(
                name: "SessionContents");

            migrationBuilder.DropTable(
                name: "WorkflowPermissions");

            migrationBuilder.DropTable(
                name: "Files");

            migrationBuilder.DropTable(
                name: "Sessions");

            migrationBuilder.DropTable(
                name: "Materials");

            migrationBuilder.DropTable(
                name: "Users");

            migrationBuilder.DropTable(
                name: "Workflows");
        }
    }
}
