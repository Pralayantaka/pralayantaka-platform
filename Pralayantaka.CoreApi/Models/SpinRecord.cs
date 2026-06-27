using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Pralayantaka.CoreApi.Models;

public class SpinRecord
{
    [Key]
    public int Id { get; set; }

    public DateTime Timestamp { get; set; } = DateTime.UtcNow;

    [Required]
    public string UserEmail { get; set; } = string.Empty;

    [Required]
    public string GameType { get; set; } = string.Empty;

    public string? TopSlotSegment { get; set; }
    public decimal? TopSlotMultiplier { get; set; }

    [Required]
    public string Result { get; set; } = string.Empty;

    [Required]
    public decimal FinalMultiplier { get; set; }

    [Required]
    public int NumberOfPlayers { get; set; }

    [Required]
    public decimal TotalWinningAmount { get; set; }

    [Column(TypeName = "jsonb")]
    public string? GameSpecificData { get; set; }
}