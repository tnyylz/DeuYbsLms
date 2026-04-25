using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DeuYbsLms.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdateLearningPathWithTeacher : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsPublished",
                table: "LearningPaths",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<Guid>(
                name: "TeacherId",
                table: "LearningPaths",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_LearningPaths_TeacherId",
                table: "LearningPaths",
                column: "TeacherId");

            migrationBuilder.AddForeignKey(
                name: "FK_LearningPaths_Users_TeacherId",
                table: "LearningPaths",
                column: "TeacherId",
                principalTable: "Users",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_LearningPaths_Users_TeacherId",
                table: "LearningPaths");

            migrationBuilder.DropIndex(
                name: "IX_LearningPaths_TeacherId",
                table: "LearningPaths");

            migrationBuilder.DropColumn(
                name: "IsPublished",
                table: "LearningPaths");

            migrationBuilder.DropColumn(
                name: "TeacherId",
                table: "LearningPaths");
        }
    }
}
