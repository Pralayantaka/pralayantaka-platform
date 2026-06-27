using Microsoft.EntityFrameworkCore;
using Pralayantaka.CoreApi.Data;

var builder = WebApplication.CreateBuilder(args);

// 1. Configure the Isolated PostgreSQL Connection
var connectionString = builder.Configuration.GetConnectionString("CoreConnection");
builder.Services.AddDbContext<CoreDbContext>(options =>
    options.UseNpgsql(connectionString));

// 2. Configure CORS for the Next.js Frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowNextJs", policy =>
    {
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

builder.Services.AddControllers();
builder.Services.AddOpenApi();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();
app.UseCors("AllowNextJs");
app.UseAuthorization();
app.MapControllers();

app.Run();