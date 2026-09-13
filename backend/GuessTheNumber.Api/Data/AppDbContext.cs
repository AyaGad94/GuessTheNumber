using GuessTheNumber.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace GuessTheNumber.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        var userEntity = modelBuilder.Entity<User>();

        userEntity.Property(user => user.Username)
            .HasMaxLength(50)
            .IsRequired();

        userEntity.Property(user => user.Email)
            .HasMaxLength(255)
            .IsRequired();

        userEntity.Property(user => user.PasswordHash)
            .IsRequired();

        userEntity.HasIndex(user => user.Email)
            .IsUnique();
    }
}