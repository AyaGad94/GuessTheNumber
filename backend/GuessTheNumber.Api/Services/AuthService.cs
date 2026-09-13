using GuessTheNumber.Api.Data;
using GuessTheNumber.Api.DTOs;
using GuessTheNumber.Api.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace GuessTheNumber.Api.Services;

public class AuthService
{
    private readonly AppDbContext _dbContext;
    private readonly IPasswordHasher<User> _passwordHasher;

    public AuthService(
        AppDbContext dbContext,
        IPasswordHasher<User> passwordHasher)
    {
        _dbContext = dbContext;
        _passwordHasher = passwordHasher;
    }

    public async Task<AuthResponse?> RegisterAsync(
        RegisterRequest request,
        CancellationToken cancellationToken = default)
    {
        var normalizedEmail = request.Email
            .Trim()
            .ToLowerInvariant();

        var emailAlreadyExists = await _dbContext.Users
            .AnyAsync(
                user => user.Email == normalizedEmail,
                cancellationToken);

        if (emailAlreadyExists)
        {
            return null;
        }

        var user = new User
        {
            Username = request.Username.Trim(),
            Email = normalizedEmail
        };

        user.PasswordHash = _passwordHasher.HashPassword(
            user,
            request.Password);

        _dbContext.Users.Add(user);

        await _dbContext.SaveChangesAsync(cancellationToken);

        return new AuthResponse
        {
            Id = user.Id,
            Username = user.Username,
            Email = user.Email,
            BestScore = user.BestScore
        };
    }
}