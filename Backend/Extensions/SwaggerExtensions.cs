using Microsoft.OpenApi.Models;
using System.Reflection;

namespace BlueBits.Api.Extensions;

public static class SwaggerExtensions
{
    public static IServiceCollection AddSwaggerWithConfig(this IServiceCollection services)
    {
        services.AddSwaggerGen(c =>
        {
            c.SwaggerDoc("v1", new OpenApiInfo
            {
                Title = "BlueBits API",
                Version = "v1",
                Description = "Unified Academic Workflow Platform API"
            });

            var xmlFile = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
            var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
            if (File.Exists(xmlPath))
            {
                c.IncludeXmlComments(xmlPath);
            }

            c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
            {
                Name = "Authorization",
                Type = SecuritySchemeType.Http,
                Scheme = "bearer",
                BearerFormat = "JWT",
                In = ParameterLocation.Header,
                Description = "Enter your JWT token"
            });

            c.AddSecurityRequirement(new OpenApiSecurityRequirement
            {
                {
                    new OpenApiSecurityScheme
                    {
                        Reference = new OpenApiReference
                        {
                            Type = ReferenceType.SecurityScheme,
                            Id = "Bearer"
                        }
                    },
                    Array.Empty<string>()
                }
            });

            c.TagActionsBy(api => new[] { api.ActionDescriptor.RouteValues.TryGetValue("controller", out var controller) ? controller : "Integrations" });
            c.OrderActionsBy(api => api.ActionDescriptor.RouteValues.TryGetValue("controller", out var controller) ? controller : "Integrations");
        });

        return services;
    }

    public static IApplicationBuilder UseSwaggerWithUI(this IApplicationBuilder app)
    {
        app.UseSwagger(c =>
        {
            c.RouteTemplate = "swagger/{documentName}/swagger.json";
        });

        app.UseSwaggerUI(c =>
        {
            c.SwaggerEndpoint("/swagger/v1/swagger.json", "BlueBits API v1");
            c.RoutePrefix = "swagger";
        });

        return app;
    }
}
