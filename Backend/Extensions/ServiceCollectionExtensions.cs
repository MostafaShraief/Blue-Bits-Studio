using System.Security.Claims;
using System.Text;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.ResponseCompression;
using Microsoft.IdentityModel.Tokens;
using Microsoft.EntityFrameworkCore;
using BlueBits.Api.Data;
using BlueBits.Api.Repositories;
using BlueBits.Api.Services;
using BlueBits.Api.Services.Interfaces;
using FluentValidation;
using FluentValidation.AspNetCore;

namespace BlueBits.Api.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddCors(options =>
        {
            options.AddPolicy("AllowFrontend", policy =>
            {
                policy.SetIsOriginAllowed(origin => true)
                      .AllowAnyHeader()
                      .AllowAnyMethod()
                      .AllowCredentials();
            });
        });

        services.AddResponseCompression(options =>
        {
            options.EnableForHttps = true;
            options.Providers.Add<BrotliCompressionProvider>();
            options.Providers.Add<GzipCompressionProvider>();
        });

        services.AddRateLimiting(configuration);

        services.AddHostedService<OrphanFileCleanupService>();

        return services;
    }

    public static IServiceCollection AddPersistence(this IServiceCollection services, IConfiguration configuration, IWebHostEnvironment environment)
    {
        var dbPath = Path.Join(environment.ContentRootPath, "bluebits.db");
        services.AddDbContext<BlueBitsDbContext>(options =>
            options.UseSqlite($"Data Source={dbPath}"));

        services.AddScoped(typeof(IRepository<>), typeof(GenericRepository<>));

        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IMaterialRepository, MaterialRepository>();
        services.AddScoped<IWorkflowRepository, WorkflowRepository>();
        services.AddScoped<IWorkflowPermissionRepository, WorkflowPermissionRepository>();
        services.AddScoped<IPromptRepository, PromptRepository>();
        services.AddScoped<ISessionRepository, SessionRepository>();
        services.AddScoped<ISessionContentRepository, SessionContentRepository>();
        services.AddScoped<IFileRepository, FileRepository>();
        services.AddScoped<INoteRepository, NoteRepository>();

        return services;
    }

    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IPromptService, PromptService>();
        services.AddScoped<ISessionService, SessionService>();
        services.AddScoped<IPandocService, PandocService>();
        services.AddScoped<IMergeService, MergeService>();
        services.AddScoped<IMaterialService, MaterialService>();

        services.AddScoped<IAdminUserService, AdminUserService>();
        services.AddScoped<IAdminMaterialService, AdminMaterialService>();
        services.AddScoped<IAdminPermissionService, AdminPermissionService>();
        services.AddScoped<IAdminPromptService, AdminPromptService>();
        services.AddScoped<IAdminWorkflowService, AdminWorkflowService>();

        return services;
    }

    public static IServiceCollection AddAuthLayer(this IServiceCollection services, IConfiguration configuration)
    {
        var jwtSettings = configuration.GetSection("Jwt");
        var keyString = jwtSettings["Key"] ?? throw new InvalidOperationException("JWT Key is missing from appsettings");
        var key = Encoding.ASCII.GetBytes(keyString);

        services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        })
        .AddJwtBearer(options =>
        {
            options.RequireHttpsMetadata = false;
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

        services.AddAuthorization(options =>
        {
            options.AddPolicy("WorkflowPolicy", policy =>
                policy.RequireAssertion(context =>
                {
                    var role = context.User.FindFirstValue(ClaimTypes.Role);
                    return role != null && role != "Admin";
                }));
        });

        return services;
    }

    public static IServiceCollection AddApiLayer(this IServiceCollection services)
    {
        services.AddControllers()
            .AddJsonOptions(options =>
            {
                options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
            });

        services.ConfigureHttpJsonOptions(options =>
        {
            options.SerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
        });

        services.AddFluentValidationAutoValidation();
        services.AddValidatorsFromAssemblyContaining<Program>();

        services.AddSwaggerWithConfig();

        return services;
    }
}
