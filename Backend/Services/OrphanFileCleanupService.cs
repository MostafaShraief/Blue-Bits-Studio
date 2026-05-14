using BlueBits.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace BlueBits.Api.Services;

public class OrphanFileCleanupService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly IWebHostEnvironment _env;
    private readonly ILogger<OrphanFileCleanupService> _logger;

    public OrphanFileCleanupService(
        IServiceProvider serviceProvider, 
        IWebHostEnvironment env, 
        ILogger<OrphanFileCleanupService> logger)
    {
        _serviceProvider = serviceProvider;
        _env = env;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("OrphanFileCleanupService is starting.");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await CleanupOrphanFilesAsync(stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred executing OrphanFileCleanupService.");
            }

            // Run once every 24 hours
            await Task.Delay(TimeSpan.FromDays(1), stoppingToken);
        }
    }

    private async Task CleanupOrphanFilesAsync(CancellationToken stoppingToken)
    {
        var uploadPath = Path.Combine(_env.ContentRootPath, "uploads");
        
        if (!Directory.Exists(uploadPath))
        {
            _logger.LogInformation("Uploads directory does not exist yet. Skipping cleanup.");
            return;
        }

        // 1. Get all physical files from the server upload directory
        var physicalFiles = Directory.GetFiles(uploadPath)
            .Select(f => Path.GetFullPath(f))
            .ToList();

        // 2. Get all file paths currently documented in the DB
        using var scope = _serviceProvider.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<BlueBitsDbContext>();
        
        var dbFiles = await dbContext.Files
            .Select(f => f.LocalFilePath)
            .ToListAsync(stoppingToken);

        // Normalize DB paths so they perfectly match physical paths regardless of OS slashes
        var normalizedDbFiles = dbFiles
            .Select(f => Path.GetFullPath(f))
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        // 3. Find physical files that DO NOT exist in the DB (Orphans)
        var orphans = physicalFiles.Where(pf => !normalizedDbFiles.Contains(pf)).ToList();

        if (orphans.Any())
        {
            _logger.LogInformation($"Found {orphans.Count} orphan files. Starting cleanup...");
            
            // 4. Delete them safely
            foreach (var orphanPath in orphans)
            {
                try 
                { 
                    System.IO.File.Delete(orphanPath); 
                    _logger.LogInformation($"Deleted orphan file: {orphanPath}");
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, $"Failed to delete orphan file (it might be locked): {orphanPath}");
                }
            }
        }
        else
        {
            _logger.LogInformation("No orphan files found.");
        }
    }
}