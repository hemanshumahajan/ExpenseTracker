using Expense_Tracker.Models;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Railway MySQL env vars, fallback to appsettings.json for local dev
string connectionString;
var mysqlHost = Environment.GetEnvironmentVariable("MYSQLHOST");
var mysqlPort = Environment.GetEnvironmentVariable("MYSQLPORT") ?? "3306";
var mysqlDatabase = Environment.GetEnvironmentVariable("MYSQLDATABASE");
var mysqlUser = Environment.GetEnvironmentVariable("MYSQLUSER");
var mysqlPassword = Environment.GetEnvironmentVariable("MYSQLPASSWORD");

if (!string.IsNullOrEmpty(mysqlHost) && !string.IsNullOrEmpty(mysqlDatabase))
{
    connectionString = 
        $"Server={mysqlHost};Port={mysqlPort};Database={mysqlDatabase};" +
        $"User={mysqlUser};Password={mysqlPassword};SslMode=None;";
}
else
{
    connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
        ?? "server=127.0.0.1;port=3306;database=ExpenseTrackerDB;user=root;password=Hemanshu@123";
}

//DI
builder.Services.AddDbContext<ApplicationDbContext>(options =>
options.UseMySql(connectionString, new MySqlServerVersion(new Version(8, 0, 0))));

// CORS � allow any origin (React dev + hosted frontend)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

// // Auto-migrate on startup
// using (var scope = app.Services.CreateScope())
// {
//     var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
//     db.Database.Migrate();
// }

app.UseSwagger();
app.UseSwaggerUI();

app.UseCors("AllowFrontend");
app.UseRouting();
app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

// Railway injects PORT
var port = Environment.GetEnvironmentVariable("PORT") ?? "8080";
app.Run($"http://0.0.0.0:{port}");