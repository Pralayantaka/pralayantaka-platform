using Microsoft.EntityFrameworkCore;
using Pralayantaka.CoreApi.Data;

var builder = WebApplication.CreateBuilder(args);

// 1. Configure the Isolated PostgreSQL Connection
var connectionString = builder.Configuration.GetConnectionString("CoreConnection");
builder.Services.AddDbContext<CoreDbContext>(options =>
    options.UseNpgsql(connectionString));

// 2. Configure CORS for Production Demo (Allows cloud frontend to connect)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
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

// 3. Apply the updated CORS policy
app.UseCors("AllowAll");

app.UseAuthorization();
app.MapControllers();
app.Run();