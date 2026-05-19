using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DeuYbsLms.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RemoveLeagueSystem : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "LeagueParticipations");

            migrationBuilder.DropTable(
                name: "LeagueGroups");

            migrationBuilder.DropColumn(
                name: "CurrentLeagueTier",
                table: "StudentProfiles");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "CurrentLeagueTier",
                table: "StudentProfiles",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "LeagueGroups",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EndDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IsClosed = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    SeasonNumber = table.Column<int>(type: "int", nullable: false),
                    Tier = table.Column<int>(type: "int", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LeagueGroups", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "LeagueParticipations",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    LeagueGroupId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    StudentProfileId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    FinalRank = table.Column<int>(type: "int", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    SeasonPoints = table.Column<int>(type: "int", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LeagueParticipations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LeagueParticipations_LeagueGroups_LeagueGroupId",
                        column: x => x.LeagueGroupId,
                        principalTable: "LeagueGroups",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_LeagueParticipations_StudentProfiles_StudentProfileId",
                        column: x => x.StudentProfileId,
                        principalTable: "StudentProfiles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_LeagueParticipations_LeagueGroupId",
                table: "LeagueParticipations",
                column: "LeagueGroupId");

            migrationBuilder.CreateIndex(
                name: "IX_LeagueParticipations_StudentProfileId",
                table: "LeagueParticipations",
                column: "StudentProfileId");
        }
    }
}
