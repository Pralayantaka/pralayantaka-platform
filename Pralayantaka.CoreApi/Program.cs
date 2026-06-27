using Microsoft.EntityFrameworkCore;
using Pralayantaka.CoreApi.Data;

var builder = WebApplication.CreateBuilder(args);

// Force the app to listen on Railway's dynamic port
var port = Environment.GetEnvironmentVariable("PORT") ?? "8080";
builder.WebHost.UseUrls($"http://0.0.0.0:{port}");

// 1. Configure PostgreSQL Connection (env var takes priority over appsettings)
var connectionString = Environment.GetEnvironmentVariable("DATABASE_URL")
    ?? builder.Configuration.GetConnectionString("CoreConnection");
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

//app.UseHttpsRedirection();

// 3. Apply the updated CORS policy
app.UseCors("AllowAll");

app.UseAuthorization();
app.MapControllers();
app.Run();