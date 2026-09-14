using System.Security.Claims;
using GuessTheNumber.Api.DTOs;
using GuessTheNumber.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GuessTheNumber.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AuthService _authService;

    public AuthController(AuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register(
        RegisterRequest request,
        CancellationToken cancellationToken)
    {
        var registrationResult = await _authService.RegisterAsync(
            request,
            cancellationToken);

        if (registrationResult is null)
        {
            return Conflict(new
            {
                message = "An account with this email already exists."
            });
        }

        return StatusCode(
            StatusCodes.Status201Created,
            registrationResult);
    }

    [HttpPost("login")]
    public async Task<ActionResult<LoginResponse>> Login(
        LoginRequest request,
        CancellationToken cancellationToken)
    {
        var loginResult = await _authService.LoginAsync(
            request,
            cancellationToken);

        if (loginResult is null)
        {
            return Unauthorized(new
            {
                message = "Invalid email or password."
            });
        }

        return Ok(loginResult);
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<ActionResult<AuthResponse>> GetCurrentUser(
        CancellationToken cancellationToken)
    {
        var userIdValue = User.FindFirstValue(
            ClaimTypes.NameIdentifier);

        if (!int.TryParse(userIdValue, out var userId))
        {
            return Unauthorized();
        }

        var currentUser = await _authService.GetCurrentUserAsync(
            userId,
            cancellationToken);

        if (currentUser is null)
        {
            return Unauthorized();
        }

        return Ok(currentUser);
    }
}