using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Pralayantaka.CoreApi.Migrations
{
    /// <inheritdoc />
    public partial class InitialCoreMigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Spins",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Timestamp = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    UserEmail = table.Column<string>(type: "text", nullable: false),
                    GameType = table.Column<string>(type: "text", nullable: false),
                    TopSlotSegment = table.Column<string>(type: "text", nullable: true),
                    TopSlotMultiplier = table.Column<decimal>(type: "numeric", nullable: true),
                    Result = table.Column<string>(type: "text", nullable: false),
                    FinalMultiplier = table.Column<decimal>(type: "numeric", nullable: false),
                    NumberOfPlayers = table.Column<int>(type: "integer", nullable: false),
                    TotalWinningAmount = table.Column<decimal>(type: "numeric", nullable: false),
                    GameSpecificData = table.Column<string>(type: "jsonb", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Spins", x => x.Id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Spins");
        }
    }
}
