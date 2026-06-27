using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Pralayantaka.CoreApi.Data;
using Pralayantaka.CoreApi.Models;

namespace Pralayantaka.CoreApi.Controllers;

[Route("api/[controller]")]
[ApiController]
public class SpinsController(CoreDbContext context) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<SpinRecord>>> GetSpins()
    {
        return await context.Spins
            .OrderByDescending(s => s.Timestamp)
            .Take(100)
            .ToListAsync();
    }

    [HttpPost]
    public async Task<ActionResult<SpinRecord>> LogSpin(SpinRecord spin)
    {
        context.Spins.Add(spin);
        await context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetSpins), new { id = spin.Id }, spin);
    }
}