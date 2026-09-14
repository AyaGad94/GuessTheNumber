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
    private readonly JwtTokenService _jwtTokenService;

    public AuthService(
        AppDbContext dbContext,
        IPasswordHasher<User> passwordHasher,
        JwtTokenService jwtTokenService)
    {
        _dbContext = dbContext;
        _passwordHasher = passwordHasher;
        _jwtTokenService = jwtTokenService;
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

    public async Task<LoginResponse?> LoginAsync(
        LoginRequest request,
        CancellationToken cancellationToken = default)
    {
        var normalizedEmail = request.Email
            .Trim()
            .ToLowerInvariant();

        var user = await _dbContext.Users
            .SingleOrDefaultAsync(
                user => user.Email == normalizedEmail,
                cancellationToken);

        if (user is null)
        {
            return null;
        }

        var passwordVerificationResult =
            _passwordHasher.VerifyHashedPassword(
                user,
                user.PasswordHash,
                request.Password);

        if (passwordVerificationResult ==
            PasswordVerificationResult.Failed)
        {
            return null;
        }

        if (passwordVerificationResult ==
            PasswordVerificationResult.SuccessRehashNeeded)
        {
            user.PasswordHash = _passwordHasher.HashPassword(
                user,
                request.Password);

            await _dbContext.SaveChangesAsync(cancellationToken);
        }

        var tokenResult = _jwtTokenService.CreateToken(user);

        return new LoginResponse
        {
            Token = tokenResult.Token,
            ExpiresAtUtc = tokenResult.ExpiresAtUtc,

            User = new AuthResponse
            {
                Id = user.Id,
                Username = user.Username,
                Email = user.Email,
                BestScore = user.BestScore
            }
        };
    }

    public async Task<AuthResponse?> GetCurrentUserAsync(
        int userId,
        CancellationToken cancellationToken = default)
    {
        return await _dbContext.Users
            .AsNoTracking()
            .Where(user => user.Id == userId)
            .Select(user => new AuthResponse
            {
                Id = user.Id,
                Username = user.Username,
                Email = user.Email,
                BestScore = user.BestScore
            })
            .SingleOrDefaultAsync(cancellationToken);
    }
}