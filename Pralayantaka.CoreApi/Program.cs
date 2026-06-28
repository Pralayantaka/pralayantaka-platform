using Microsoft.EntityFrameworkCore;
using Pralayantaka.CoreApi.Data;

var builder = WebApplication.CreateBuilder(args);

// Force the app to listen on Railway's dynamic port
var port = Environment.GetEnvironmentVariable("PORT");
if (string.IsNullOrWhiteSpace(port)) port = "8080";
builder.WebHost.UseUrls($"http://0.0.0.0:{port}");

var connectionString = Environment.GetEnvironmentVariable("DATABASE_URL");
if (!string.IsNullOrWhiteSpace(connectionString) && connectionString.StartsWith("postgres"))
{
    try
    {
        // Parse Railway's postgres:// or postgresql:// URL
        var uri = new Uri(connectionString);
        var userInfo = uri.UserInfo.Split(':');
        var username = userInfo.Length > 0 ? userInfo[0] : "";
        var password = userInfo.Length > 1 ? userInfo[1] : "";
        var dbPort = uri.Port > 0 ? uri.Port : 5432;
        
        connectionString = $"Host={uri.Host};Port={dbPort};Database={uri.LocalPath.TrimStart('/')};Username={username};Password={password};SslMode=Require;Trust Server Certificate=true;";
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Error parsing DATABASE_URL: {ex.Message}");
    }
}
else
{
    connectionString = builder.Configuration.GetConnectionString("CoreConnection");
}

builder.Services.AddDbContext<CoreDbContext>(options =>
{
    if (!string.IsNullOrEmpty(connectionString))
    {
        options.UseNpgsql(connectionString);
    }
});

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

var app = builder.Build();

//app.UseHttpsRedirection();

// 3. Apply the updated CORS policy
app.UseCors("AllowAll");

app.UseAuthorization();
app.MapControllers();

// 4. Automatically apply database migrations on startup
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<CoreDbContext>();
        context.Database.Migrate();
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred migrating the DB.");
    }
}

app.Run();