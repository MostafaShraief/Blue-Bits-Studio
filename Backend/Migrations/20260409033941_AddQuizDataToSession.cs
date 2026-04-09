using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BlueBits.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddQuizDataToSession : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "QuizData",
                table: "Sessions",
                type: "TEXT",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "QuizData",
                table: "Sessions");
        }
    }
}
