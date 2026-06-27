using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Pralayantaka.CoreApi.Data;
using Pralayantaka.CoreApi.Models;

namespace Pralayantaka.CoreApi.Controllers;

[Route("api/[controller]")]
[ApiController]
public class SpinsController(CoreDbContext context) : ControllerBase
{
    /// <summary>
    /// GET /api/spins — Returns paginated spin records, newest first.
    /// Query params: page (default 1), size (default 100), segment (optional filter)
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<SpinRecord>>> GetSpins(
        [FromQuery] int page = 1,
        [FromQuery] int size = 100,
        [FromQuery] string? segment = null)
    {
        var query = context.Spins.AsQueryable();

        if (!string.IsNullOrWhiteSpace(segment))
            query = query.Where(s => s.Result == segment);

        var results = await query
            .OrderByDescending(s => s.Timestamp)
            .Skip((page - 1) * size)
            .Take(size)
            .ToListAsync();

        return Ok(results);
    }

    /// <summary>
    /// GET /api/spins/{id} — Returns a single spin record by ID.
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<SpinRecord>> GetSpin(int id)
    {
        var spin = await context.Spins.FindAsync(id);
        if (spin == null)
            return NotFound();

        return Ok(spin);
    }

    /// <summary>
    /// GET /api/spins/stats — Returns aggregate statistics.
    /// </summary>
    [HttpGet("stats")]
    public async Task<ActionResult> GetStats()
    {
        var spins = await context.Spins.ToListAsync();

        if (spins.Count == 0)
            return Ok(new { totalSpins = 0, segments = Array.Empty<object>() });

        var segmentStats = spins
            .GroupBy(s => s.Result)
            .Select(g => new
            {
                segment = g.Key,
                count = g.Count(),
                percentage = Math.Round((double)g.Count() / (double)spins.Count * 100, 2),
                avgMultiplier = Math.Round((double)g.Average(s => s.FinalMultiplier), 2),
                maxMultiplier = g.Max(s => s.FinalMultiplier),
                lastSeen = g.Max(s => s.Timestamp),
            })
            .OrderByDescending(s => s.count)
            .ToList();

        var topSlotStats = spins
            .Where(s => s.TopSlotSegment != null)
            .GroupBy(s => s.TopSlotSegment)
            .Select(g => new
            {
                segment = g.Key,
                count = g.Count(),
                avgMultiplier = Math.Round((double)g.Average(s => s.TopSlotMultiplier ?? 0), 2),
            })
            .OrderByDescending(s => s.count)
            .ToList();

        // Streak/drought calculation for bonus games
        var orderedSpins = spins.OrderByDescending(s => s.Timestamp).ToList();
        var bonusGames = new[] { "Coin Flip", "Pachinko", "Cash Hunt", "Crazy Time" };
        var droughts = bonusGames.Select(bonus =>
        {
            var roundsSinceLast = 0;
            for (int i = 0; i < orderedSpins.Count; i++)
            {
                if (orderedSpins[i].Result == bonus) break;
                roundsSinceLast++;
            }
            return new { bonus, roundsSinceLast };
        }).ToList();

        return Ok(new
        {
            totalSpins = spins.Count,
            avgMultiplier = Math.Round((double)spins.Average(s => s.FinalMultiplier), 2),
            topSlotActivations = spins.Count(s => s.TopSlotSegment != null),
            segments = segmentStats,
            topSlot = topSlotStats,
            droughts,
        });
    }

    /// <summary>
    /// POST /api/spins — Logs a new spin record.
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<SpinRecord>> LogSpin(SpinRecord spin)
    {
        context.Spins.Add(spin);
        await context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetSpin), new { id = spin.Id }, spin);
    }
}