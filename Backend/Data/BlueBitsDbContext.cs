using Microsoft.EntityFrameworkCore;
using BlueBits.Api.Models;
using File = BlueBits.Api.Models.File; // Resolve naming conflicts with System.IO

namespace BlueBits.Api.Data;

public class BlueBitsDbContext : DbContext
{
    public BlueBitsDbContext(DbContextOptions<BlueBitsDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Material> Materials => Set<Material>();
    public DbSet<Workflow> Workflows => Set<Workflow>();
    public DbSet<WorkflowPermission> WorkflowPermissions => Set<WorkflowPermission>();
    public DbSet<Prompt> Prompts => Set<Prompt>();
    public DbSet<Session> Sessions => Set<Session>();
    public DbSet<File> Files => Set<File>();
    public DbSet<Note> Notes => Set<Note>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // --- 1. Constraints & Validations ---
        modelBuilder.Entity<User>(e => {
            e.HasIndex(u => u.TelegramUsername).IsUnique();
            e.HasIndex(u => u.Username).IsUnique();
            e.ToTable(t => {
                t.HasCheckConstraint("CHK_UserRole", "\"UserRole\" IN ('Admin', 'TechMember', 'ScientificMember')");
                t.HasCheckConstraint("CHK_BatchNumber", "\"BatchNumber\" > 0");
            });
        });

        modelBuilder.Entity<Material>(e => e.ToTable(t => t.HasCheckConstraint("CHK_MaterialYear", "\"MaterialYear\" BETWEEN 1 AND 5")));
        
        modelBuilder.Entity<Workflow>(e => {
            e.HasIndex(w => w.SystemCode).IsUnique();
        });
        
        modelBuilder.Entity<Prompt>(e => {
            e.HasIndex(p => p.SystemCode).IsUnique();
        });

        modelBuilder.Entity<WorkflowPermission>(e => {
            e.HasIndex(wp => new { wp.RoleName, wp.WorkflowId }).IsUnique();
            e.ToTable(t => t.HasCheckConstraint("CHK_RoleName", "\"RoleName\" IN ('TechMember', 'ScientificMember')"));
        });

        modelBuilder.Entity<Session>(e => {
            e.ToTable(t => {
                t.HasCheckConstraint("CHK_LectureNumber", "\"LectureNumber\" > 0");
                t.HasCheckConstraint("CHK_LectureType", "\"LectureType\" IN ('Theoretical', 'Practical')");
            });
        });

        modelBuilder.Entity<File>(e => e.ToTable(t => t.HasCheckConstraint("CHK_FileType", "\"FileType\" IN ('Image', 'Docx', 'Other')")));
        modelBuilder.Entity<Note>(e => e.ToTable(t => t.HasCheckConstraint("CHK_NoteType", "\"NoteType\" IN ('GeneralNote', 'FileNote')")));

        // --- 2. Relationships & Foreign Keys ---
        modelBuilder.Entity<WorkflowPermission>()
            .HasOne(wp => wp.Workflow)
            .WithMany(w => w.Permissions)
            .HasForeignKey(wp => wp.WorkflowId)
            .OnDelete(DeleteBehavior.Cascade);
            
        modelBuilder.Entity<Prompt>()
            .HasOne(p => p.Workflow)
            .WithMany(w => w.Prompts)
            .HasForeignKey(p => p.WorkflowId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Session>()
            .HasOne(s => s.User)
            .WithMany(u => u.Sessions)
            .HasForeignKey(s => s.UserId)
            .OnDelete(DeleteBehavior.Cascade);
            
        modelBuilder.Entity<Session>()
            .HasOne(s => s.Material)
            .WithMany(m => m.Sessions)
            .HasForeignKey(s => s.MaterialId)
            .OnDelete(DeleteBehavior.SetNull);
            
        modelBuilder.Entity<Session>()
            .HasOne(s => s.Workflow)
            .WithMany(w => w.Sessions)
            .HasForeignKey(s => s.WorkflowId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<File>()
            .HasOne(f => f.Session)
            .WithMany(s => s.Files)
            .HasForeignKey(f => f.SessionId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Note>()
            .HasOne(n => n.Session)
            .WithMany(s => s.Notes)
            .HasForeignKey(n => n.SessionId)
            .OnDelete(DeleteBehavior.Cascade);
            
        modelBuilder.Entity<Note>()
            .HasOne(n => n.File)
            .WithMany(f => f.Notes)
            .HasForeignKey(n => n.FileId)
            .OnDelete(DeleteBehavior.SetNull);

        // --- 3. Initial Seed Data ---
        modelBuilder.Entity<Workflow>().HasData(
            new Workflow { WorkflowId = 1, SystemCode = "LEC_EXT", AdminNote = "Lecture Extraction Workflow", IsActive = 1 },
            new Workflow { WorkflowId = 2, SystemCode = "BANK_EXT", AdminNote = "Bank Extraction Workflow", IsActive = 1 },
            new Workflow { WorkflowId = 3, SystemCode = "LEC_COORD", AdminNote = "Lecture Coordination Workflow", IsActive = 1 },
            new Workflow { WorkflowId = 4, SystemCode = "BANK_COORD", AdminNote = "Bank Coordination Workflow", IsActive = 1 },
            new Workflow { WorkflowId = 5, SystemCode = "PANDOC", AdminNote = "Pandoc Processing Workflow", IsActive = 1 },
            new Workflow { WorkflowId = 6, SystemCode = "BANK_QS", AdminNote = "Bank Questions Workflow", IsActive = 1 },
            new Workflow { WorkflowId = 7, SystemCode = "DRAW", AdminNote = "Draw AI Workflow (Beta)", IsActive = 1 },
            new Workflow { WorkflowId = 8, SystemCode = "MERGE", AdminNote = "Merge Workflow (Beta)", IsActive = 1 }
        );

        modelBuilder.Entity<WorkflowPermission>().HasData(
            new WorkflowPermission { PermissionId = 1, RoleName = "TechMember", WorkflowId = 1 },
            new WorkflowPermission { PermissionId = 2, RoleName = "TechMember", WorkflowId = 2 },
            new WorkflowPermission { PermissionId = 3, RoleName = "TechMember", WorkflowId = 3 },
            new WorkflowPermission { PermissionId = 4, RoleName = "TechMember", WorkflowId = 4 },
            new WorkflowPermission { PermissionId = 5, RoleName = "ScientificMember", WorkflowId = 5 }
        );

        modelBuilder.Entity<Prompt>().HasData(
            new Prompt { PromptId = 1, WorkflowId = 1, SystemCode = "PROMPT_LEC_EXT", PromptName = "Lecture Extraction", PromptText = "You are an AI extracting lectures..." },
            new Prompt { PromptId = 2, WorkflowId = 2, SystemCode = "PROMPT_BANK_EXT", PromptName = "Bank Extraction", PromptText = "You are an AI extracting banks..." },
            new Prompt { PromptId = 3, WorkflowId = 3, SystemCode = "PROMPT_LEC_COORD", PromptName = "Lecture Coordination", PromptText = "Coordinate this lecture..." },
            new Prompt { PromptId = 4, WorkflowId = 4, SystemCode = "PROMPT_BANK_COORD", PromptName = "Bank Coordination", PromptText = "Coordinate this bank..." },
            new Prompt { PromptId = 5, WorkflowId = 6, SystemCode = "PROMPT_DRAW_AI", PromptName = "Draw Using AI", PromptText = "Generate markdown/mermaid drawings..." },
            new Prompt { PromptId = 6, WorkflowId = 5, SystemCode = "PROMPT_BANK_QS", PromptName = "Bank Questions", PromptText = "Generate quiz questions for the bank..." }
        );
    }
}