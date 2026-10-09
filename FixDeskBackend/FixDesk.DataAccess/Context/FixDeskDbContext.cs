using FixDesk.Entities;
using FixDesk.Entities.Enums;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text;

namespace FixDesk.DataAccess.Context;

public class FixDeskDbContext : DbContext
{
    public FixDeskDbContext(DbContextOptions<FixDeskDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Branch> Branches => Set<Branch>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Ticket> Tickets => Set<Ticket>();
    public DbSet<TicketAttachment> TicketAttachments => Set<TicketAttachment>();
    public DbSet<TicketComment> TicketComments => Set<TicketComment>();
    public DbSet<KnowledgeBaseArticle> KnowledgeBaseArticles => Set<KnowledgeBaseArticle>();
    public DbSet<InventoryItem> InventoryItems => Set<InventoryItem>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Global Query Filter for Soft Delete
        modelBuilder.Entity<User>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<Branch>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<Category>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<Ticket>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<TicketAttachment>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<TicketComment>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<KnowledgeBaseArticle>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<InventoryItem>().HasQueryFilter(e => !e.IsDeleted);

        // Ticket - CreatedBy / AssignedTo relationships
        modelBuilder.Entity<Ticket>()
            .HasOne(t => t.CreatedByUser)
            .WithMany(u => u.CreatedTickets)
            .HasForeignKey(t => t.CreatedByUserId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Ticket>()
            .HasOne(t => t.AssignedToUser)
            .WithMany(u => u.AssignedTickets)
            .HasForeignKey(t => t.AssignedToUserId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Ticket>()
            .HasOne(t => t.Branch)
            .WithMany(b => b.Tickets)
            .HasForeignKey(t => t.BranchId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Ticket>()
            .HasOne(t => t.Category)
            .WithMany(c => c.Tickets)
            .HasForeignKey(t => t.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);

        // Seed Data
        SeedInitialData(modelBuilder);
    }

    private static void SeedInitialData(ModelBuilder modelBuilder)
    {
        // Seed Branches
        var mainBranch = new Branch
        {
            Id = 1,
            Name = "Baş Ofis",
            Code = "HQ-001",
            Address = "Bakı şəh., Nizami küç. 45",
            Phone = "+994125000000",
            CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
        };

        var branch2 = new Branch
        {
            Id = 2,
            Name = "Gəncə Filialı",
            Code = "GN-002",
            Address = "Gəncə şəh., Atatürk pr. 12",
            Phone = "+994222000000",
            CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
        };

        modelBuilder.Entity<Branch>().HasData(mainBranch, branch2);

        // Seed Categories
        var catHardware = new Category
        {
            Id = 1,
            Name = "Aparat təminatı (Hardware)",
            Description = "Kompüter, printer, monitor və digər fiziki cihaz məsələləri",
            Type = TicketCategoryType.Hardware,
            CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
        };

        var catSoftware = new Category
        {
            Id = 2,
            Name = "Proqram təminatı (Software)",
            Description = "Əməliyyat sistemi, proqram xətaları, lisenziya yeniləmələri",
            Type = TicketCategoryType.Software,
            CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
        };

        var catNetwork = new Category
        {
            Id = 3,
            Name = "Şəbəkə və İnternet",
            Description = "Wi-Fi, kabel, IP ünvan, VPN və lokal şəbəkə problemləri",
            Type = TicketCategoryType.Network,
            CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
        };

        var catSupplies = new Category
        {
            Id = 4,
            Name = "Təchizat və Anbar",
            Description = "Kartric, kabel, adapter və ehtiyat hissəsi tələbləri",
            Type = TicketCategoryType.Supplies,
            CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
        };

        modelBuilder.Entity<Category>().HasData(catHardware, catSoftware, catNetwork, catSupplies);

        // Seed Users (Default admin, IT specialist, branch manager)
        var defaultPasswordHash = HashPassword("Admin123!");

        var adminUser = new User
        {
            Id = 1,
            FullName = "Sistem Administratoru",
            Email = "admin@fixdesk.az",
            PasswordHash = defaultPasswordHash,
            Phone = "+994501111111",
            Role = UserRole.Admin,
            BranchId = 1,
            CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
        };

        var itSpecialist = new User
        {
            Id = 2,
            FullName = "Əli Məmmədov (İT Mütəxəssis)",
            Email = "ali.m@fixdesk.az",
            PasswordHash = defaultPasswordHash,
            Phone = "+994502222222",
            Role = UserRole.ITSpecialist,
            BranchId = 1,
            CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
        };

        var branchManager = new User
        {
            Id = 3,
            FullName = "Həsən Həsənov (Filial Müdiri)",
            Email = "hasan.h@fixdesk.az",
            PasswordHash = defaultPasswordHash,
            Phone = "+994503333333",
            Role = UserRole.BranchManager,
            BranchId = 2,
            CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
        };

        modelBuilder.Entity<User>().HasData(adminUser, itSpecialist, branchManager);
    }

    private static string HashPassword(string password)
    {
        using var sha256 = SHA256.Create();
        var bytes = Encoding.UTF8.GetBytes(password);
        var hash = sha256.ComputeHash(bytes);
        return Convert.ToBase64String(hash);
    }
}
