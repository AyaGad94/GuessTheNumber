using GuessTheNumber.Api.Data;
using GuessTheNumber.Api.DTOs;
using GuessTheNumber.Api.Game;
using Microsoft.EntityFrameworkCore;

namespace GuessTheNumber.Api.Services;

public class GameService
{
    private readonly AppDbContext _dbContext;
    private readonly GameSessionStore _gameSessionStore;

    public GameService(
        AppDbContext dbContext,
        GameSessionStore gameSessionStore)
    {
        _dbContext = dbContext;
        _gameSessionStore = gameSessionStore;
    }

    public StartGameResponse StartNewGame(int userId)
    {
        _gameSessionStore.StartNewGame(userId);

        return new StartGameResponse
        {
            Message =
                $"A new game has started. Guess a number between " +
                $"{GameRules.MinimumNumber} and {GameRules.MaximumNumber}."
        };
    }

    public async Task<GuessResponse?> SubmitGuessAsync(
        int userId,
        int guessedNumber,
        CancellationToken cancellationToken = default)
    {
        var gameGuessResult = _gameSessionStore.SubmitGuess(
            userId,
            guessedNumber);

        if (gameGuessResult.Outcome == GuessOutcome.NoActiveGame)
        {
            return null;
        }

        if (gameGuessResult.Outcome == GuessOutcome.Higher)
        {
            return new GuessResponse
            {
                Message = "Guess higher.",
                AttemptCount = gameGuessResult.AttemptCount,
                IsCorrect = false,
                BestScore = null,
                IsNewBestScore = false
            };
        }

        if (gameGuessResult.Outcome == GuessOutcome.Lower)
        {
            return new GuessResponse
            {
                Message = "Guess lower.",
                AttemptCount = gameGuessResult.AttemptCount,
                IsCorrect = false,
                BestScore = null,
                IsNewBestScore = false
            };
        }

        var attemptCount = gameGuessResult.AttemptCount;

        var userScoreSnapshot = await _dbContext.Users
            .AsNoTracking()
            .Where(user => user.Id == userId)
            .Select(user => new
            {
                user.BestScore
            })
            .SingleOrDefaultAsync(cancellationToken);

        if (userScoreSnapshot is null)
        {
            return null;
        }

        var qualifiesAsNewBestScore =
            userScoreSnapshot.BestScore is null ||
            attemptCount < userScoreSnapshot.BestScore;

        if (!qualifiesAsNewBestScore)
        {
            return new GuessResponse
            {
                Message = "Correct!",
                AttemptCount = attemptCount,
                IsCorrect = true,
                BestScore = userScoreSnapshot.BestScore,
                IsNewBestScore = false
            };
        }

        var updatedRowCount = await _dbContext.Users
            .Where(user =>
                user.Id == userId &&
                (user.BestScore == null ||
                 user.BestScore > attemptCount))
            .ExecuteUpdateAsync(
                setters => setters.SetProperty(
                    user => user.BestScore,
                    attemptCount),
                cancellationToken);

        if (updatedRowCount == 1)
        {
            return new GuessResponse
            {
                Message = "Correct!",
                AttemptCount = attemptCount,
                IsCorrect = true,
                BestScore = attemptCount,
                IsNewBestScore = true
            };
        }

        var latestUserScoreSnapshot = await _dbContext.Users
            .AsNoTracking()
            .Where(user => user.Id == userId)
            .Select(user => new
            {
                user.BestScore
            })
            .SingleOrDefaultAsync(cancellationToken);

        if (latestUserScoreSnapshot is null)
        {
            return null;
        }

        return new GuessResponse
        {
            Message = "Correct!",
            AttemptCount = attemptCount,
            IsCorrect = true,
            BestScore = latestUserScoreSnapshot.BestScore,
            IsNewBestScore = false
        };
    }
}