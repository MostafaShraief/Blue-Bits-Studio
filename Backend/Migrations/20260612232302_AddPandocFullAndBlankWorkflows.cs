using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace BlueBits.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddPandocFullAndBlankWorkflows : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "Workflows",
                columns: new[] { "WorkflowId", "AdminNote", "IsActive", "MaxSessionsPerUser", "SystemCode" },
                values: new object[,]
                {
                    { 9, "Pandoc Full Document with Template", 1, 5, "PANDOC_FULL" },
                    { 10, "Pandoc Single Blank Page", 1, 5, "PANDOC_BLANK" }
                });

            migrationBuilder.InsertData(
                table: "WorkflowPermissions",
                columns: new[] { "PermissionId", "RoleName", "WorkflowId" },
                values: new object[,]
                {
                    { 11, "TechMember", 9 },
                    { 12, "TechMember", 10 }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "WorkflowPermissions",
                keyColumn: "PermissionId",
                keyValue: 11);

            migrationBuilder.DeleteData(
                table: "WorkflowPermissions",
                keyColumn: "PermissionId",
                keyValue: 12);

            migrationBuilder.DeleteData(
                table: "Workflows",
                keyColumn: "WorkflowId",
                keyValue: 9);

            migrationBuilder.DeleteData(
                table: "Workflows",
                keyColumn: "WorkflowId",
                keyValue: 10);
        }
    }
}
