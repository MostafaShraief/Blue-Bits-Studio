using Microsoft.EntityFrameworkCore;
using BlueBits.Api.Data;
using BlueBits.Api.Endpoints;

var builder = WebApplication.CreateBuilder(args);

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
            policy.WithOrigins("http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5174", "http://127.0.0.1:5174")
                  .AllowAnyHeader()
                  .AllowAnyMethod();
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

// app.UseHttpsRedirection();

app.UseCors("AllowFrontend");

// Serve static files for uploaded images
var uploadPath = Path.Join(app.Environment.ContentRootPath, "uploads");
if (!Directory.Exists(uploadPath)) Directory.CreateDirectory(uploadPath);

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new Microsoft.Extensions.FileProviders.PhysicalFileProvider(uploadPath),
    RequestPath = "/uploads"
});

// Map Endpoints
app.MapGroup("/api/pandoc").MapPandocEndpoints().WithOpenApi();

app.MapGroup("/api/merge").MapMergeEndpoints().WithOpenApi();

app.MapGroup("/api/sessions")
   .MapSessionEndpoints()
   .WithOpenApi();

app.Run();
