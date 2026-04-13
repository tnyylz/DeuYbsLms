using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DeuYbsLms.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class MoveStudentNumberToProfile : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Users_StudentNumber",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "StudentNumber",
                table: "Users");

            migrationBuilder.AddColumn<string>(
                name: "StudentNumber",
                table: "StudentProfiles",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_StudentProfiles_StudentNumber",
                table: "StudentProfiles",
                column: "StudentNumber",
                unique: true,
                filter: "[StudentNumber] IS NOT NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_StudentProfiles_StudentNumber",
                table: "StudentProfiles");

            migrationBuilder.DropColumn(
                name: "StudentNumber",
                table: "StudentProfiles");

            migrationBuilder.AddColumn<string>(
                name: "StudentNumber",
                table: "Users",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Users_StudentNumber",
                table: "Users",
                column: "StudentNumber",
                unique: true,
                filter: "[StudentNumber] IS NOT NULL");
        }
    }
}
