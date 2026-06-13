using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BlueBits.Api.Migrations
{
    /// <inheritdoc />
    public partial class FixPendingModelChanges : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "WorkflowPermissions",
                keyColumn: "PermissionId",
                keyValue: 5);

            migrationBuilder.DeleteData(
                table: "Workflows",
                keyColumn: "WorkflowId",
                keyValue: 5);

            migrationBuilder.UpdateData(
                table: "Prompts",
                keyColumn: "PromptId",
                keyValue: 5,
                column: "WorkflowId",
                value: 7);

            migrationBuilder.UpdateData(
                table: "Prompts",
                keyColumn: "PromptId",
                keyValue: 6,
                column: "WorkflowId",
                value: 6);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Prompts",
                keyColumn: "PromptId",
                keyValue: 5,
                column: "WorkflowId",
                value: 6);

            migrationBuilder.UpdateData(
                table: "Prompts",
                keyColumn: "PromptId",
                keyValue: 6,
                column: "WorkflowId",
                value: 5);

            migrationBuilder.InsertData(
                table: "Workflows",
                columns: new[] { "WorkflowId", "AdminNote", "IsActive", "MaxSessionsPerUser", "SystemCode" },
                values: new object[] { 5, "Pandoc Processing Workflow", 1, 5, "PANDOC" });

            migrationBuilder.InsertData(
                table: "WorkflowPermissions",
                columns: new[] { "PermissionId", "RoleName", "WorkflowId" },
                values: new object[] { 5, "TechMember", 5 });
        }
    }
}
