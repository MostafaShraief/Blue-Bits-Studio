using Microsoft.EntityFrameworkCore;
using BlueBits.Api.Models;

namespace BlueBits.Api.Data;

public class BlueBitsDbContext : DbContext
{
    public BlueBitsDbContext(DbContextOptions<BlueBitsDbContext> options) : base(options) { }

    public DbSet<Session> Sessions => Set<Session>();
    public DbSet<Prompt> Prompts => Set<Prompt>();
    public DbSet<Note> Notes => Set<Note>();
    public DbSet<Image> Images => Set<Image>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure 1-to-1: Session -> Prompt
        modelBuilder.Entity<Session>()
            .HasOne(s => s.Prompt)
            .WithOne(p => p.Session)
            .HasForeignKey<Prompt>(p => p.SessionId)
            .OnDelete(DeleteBehavior.Cascade);

        // Configure 1-to-many: Session -> Notes
        modelBuilder.Entity<Session>()
            .HasMany(s => s.Notes)
            .WithOne(n => n.Session)
            .HasForeignKey(n => n.SessionId)
            .OnDelete(DeleteBehavior.Cascade);

        // Configure 1-to-many: Session -> Images
        modelBuilder.Entity<Session>()
            .HasMany(s => s.Images)
            .WithOne(i => i.Session)
            .HasForeignKey(i => i.SessionId)
            .OnDelete(DeleteBehavior.Cascade);

        // Optional relationship: Note -> Image
        modelBuilder.Entity<Note>()
            .HasOne<Image>()
            .WithMany()
            .HasForeignKey(n => n.ImageId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
