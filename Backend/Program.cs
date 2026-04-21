using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.EntityFrameworkCore;
using BlueBits.Api.Data;
using BlueBits.Api.Endpoints;
using BlueBits.Api.Services;

var builder = WebApplication.CreateBuilder(args);

// Register controllers
builder.Services.AddControllers();
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

builder.Services.AddAuthorization();

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

// Avoid cyclic JSON serialization
builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
});

// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

// Ensure database is created and migrations applied
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<BlueBitsDbContext>();
    db.Database.EnsureCreated();
}

// app.UseHttpsRedirection();
// Commented to allow HTTP connections from frontend dev server

app.UseCors("AllowFrontend");

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

// Map Minimal Endpoints and Secure Them
app.MapGroup("/api/pandoc").MapPandocEndpoints().WithOpenApi().RequireAuthorization();

app.MapGroup("/api/merge").MapMergeEndpoints().WithOpenApi().RequireAuthorization();

app.Run();
