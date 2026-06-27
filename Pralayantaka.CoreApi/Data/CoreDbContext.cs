using Microsoft.EntityFrameworkCore;
using Pralayantaka.CoreApi.Models;

namespace Pralayantaka.CoreApi.Data;

public class CoreDbContext(DbContextOptions<CoreDbContext> options) : DbContext(options)
{
    public DbSet<SpinRecord> Spins { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<SpinRecord>()
            .Property(s => s.Timestamp)
            .HasDefaultValueSql("CURRENT_TIMESTAMP");
    }
}