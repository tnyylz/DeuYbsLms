using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DeuYbsLms.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RemoveAmountFromXpTransaction : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Amount",
                table: "XpTransactions");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Amount",
                table: "XpTransactions",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }
    }
}
