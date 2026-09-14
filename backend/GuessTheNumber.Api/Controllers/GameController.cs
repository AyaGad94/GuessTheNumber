using System.Security.Claims;
using GuessTheNumber.Api.DTOs;
using GuessTheNumber.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GuessTheNumber.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class GameController : ControllerBase
{
    private readonly GameService _gameService;

    public GameController(GameService gameService)
    {
        _gameService = gameService;
    }

    [HttpPost("start")]
    public ActionResult<StartGameResponse> StartNewGame()
    {
        if (!TryGetAuthenticatedUserId(out var userId))
        {
            return Unauthorized();
        }

        var startGameResponse =
            _gameService.StartNewGame(userId);

        return Ok(startGameResponse);
    }

    [HttpPost("guess")]
    public async Task<ActionResult<GuessResponse>> SubmitGuess(
        GuessRequest request,
        CancellationToken cancellationToken)
    {
        if (!TryGetAuthenticatedUserId(out var userId))
        {
            return Unauthorized();
        }

        var guessResponse =
            await _gameService.SubmitGuessAsync(
                userId,
                request.GuessedNumber,
                cancellationToken);

        if (guessResponse is null)
        {
            return Conflict(new
            {
                message =
                    "No active game. Start a new game first."
            });
        }

        return Ok(guessResponse);
    }

    private bool TryGetAuthenticatedUserId(out int userId)
    {
        var userIdClaim = User.FindFirstValue(
            ClaimTypes.NameIdentifier);

        return int.TryParse(userIdClaim, out userId);
    }
}