using GuessTheNumber.Api.DTOs;
using GuessTheNumber.Api.Services;
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
}