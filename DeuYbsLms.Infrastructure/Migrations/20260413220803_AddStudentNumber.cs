using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DeuYbsLms.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddStudentNumber : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "StudentNumber",
                table: "Users",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "CurrentStreak",
                table: "StudentProfiles",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateTime>(
                name: "LastActivityDate",
                table: "StudentProfiles",
                type: "datetime2",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Users_StudentNumber",
                table: "Users",
                column: "StudentNumber",
                unique: true,
                filter: "[StudentNumber] IS NOT NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Users_StudentNumber",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "StudentNumber",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "CurrentStreak",
                table: "StudentProfiles");

            migrationBuilder.DropColumn(
                name: "LastActivityDate",
                table: "StudentProfiles");
        }
    }
}
