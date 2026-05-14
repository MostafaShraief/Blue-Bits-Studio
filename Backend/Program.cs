using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;
using System.Text;
using Microsoft.EntityFrameworkCore;
using BlueBits.Api.Data;
using BlueBits.Api.Endpoints;
using BlueBits.Api.Services;
using Serilog;
using FluentValidation.AspNetCore;
using BlueBits.Api.Extensions;

Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .CreateBootstrapLogger();

try
{
    var builder = WebApplication.CreateBuilder(args);

    builder.Host.UseSerilog((context, services, config) =>
        config.ReadFrom.Configuration(context.Configuration));

    // Register controllers
    builder.Services.AddControllers()
        .AddJsonOptions(options => { options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles; });

    builder.Services.AddFluentValidationAutoValidation();

    builder.Services.AddScoped<IPromptCompilationService, PromptCompilationService>();

// JWT Config
var jwtSettings = builder.Configuration.GetSection("Jwt");
var keyString = jwtSettings["Key"] ?? throw new InvalidOperationException("JWT Key is missing from appsettings");
var key = Encoding.ASCII.GetBytes(keyString);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false; // set to true in prod based on environment
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidateAudience = true,
        ValidAudience = jwtSettings["Audience"],
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero
    };
});

builder.Services.AddAuthorization(options =>
{
    // Policy for workflow endpoints - blocks Admin, allows all other roles dynamically
    options.AddPolicy("WorkflowPolicy", policy =>
        policy.RequireAssertion(context =>
        {
            var role = context.User.FindFirstValue(ClaimTypes.Role);
            // Block Admin, allow any other role (dynamic - new roles will work automatically)
            return role != null && role != "Admin";
        }));
});

// Register the Background Cleanup Service
builder.Services.AddHostedService<OrphanFileCleanupService>();

// DbContext
var dbPath = Path.Join(builder.Environment.ContentRootPath, "bluebits.db");
builder.Services.AddDbContext<BlueBitsDbContext>(options =>
    options.UseSqlite($"Data Source={dbPath}"));

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy =>
        {
            policy.SetIsOriginAllowed(origin => true) // Allow any origin for development
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials(); // Often needed with any origin
        });
});

// Response Compression (Brotli + Gzip)
builder.Services.AddResponseCompression(options =>
{
    options.EnableForHttps = true;
    options.Providers.Add<Microsoft.AspNetCore.ResponseCompression.BrotliCompressionProvider>();
    options.Providers.Add<Microsoft.AspNetCore.ResponseCompression.GzipCompressionProvider>();
});

// Avoid cyclic JSON serialization
builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
});

// Swagger / OpenAPI
builder.Services.AddSwaggerGen();

// Rate Limiting (5 req/s per IP, Swagger/health excluded)
builder.Services.AddRateLimiting();

var app = builder.Build();

// Configure Swagger UI.
app.UseSwagger();
app.UseSwaggerUI();

// Ensure database is created and migrations applied
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<BlueBitsDbContext>();
    db.Database.EnsureCreated();
}

// app.UseHttpsRedirection();
// Commented to allow HTTP connections from frontend dev server

app.UseCors("AllowFrontend");

app.UseResponseCompression();

app.UseRateLimiter();

app.UseAuthentication();
app.UseAuthorization();

// Serve static files for uploaded images
var uploadPath = Path.Join(app.Environment.ContentRootPath, "uploads");
if (!Directory.Exists(uploadPath)) Directory.CreateDirectory(uploadPath);

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new Microsoft.Extensions.FileProviders.PhysicalFileProvider(uploadPath),
    RequestPath = "/uploads"
});

app.MapControllers();

// Map Minimal Endpoints and Secure Them with WorkflowPolicy (excludes Admin)
app.MapGroup("/api/pandoc").MapPandocEndpoints().RequireAuthorization("WorkflowPolicy");

app.MapGroup("/api/merge").MapMergeEndpoints().RequireAuthorization("WorkflowPolicy");

app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Application terminated unexpectedly");
}
finally
{
    Log.CloseAndFlush();
}
