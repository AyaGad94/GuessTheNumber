using System.Security.Cryptography;
using GuessTheNumber.Api.Game;

namespace GuessTheNumber.Api.Services;

public enum GuessOutcome
{
    NoActiveGame,
    Higher,
    Lower,
    Correct
}

public record GameGuessResult(
    GuessOutcome Outcome,
    int AttemptCount);

public class GameSessionStore
{
    private readonly Dictionary<int, GameSession> _activeGames = new();
    private readonly object _gameStateLock = new();

    public void StartNewGame(int userId)
    {
        var targetNumber = RandomNumberGenerator.GetInt32(
            GameRules.MinimumNumber,
            GameRules.MaximumNumber + 1);

        lock (_gameStateLock)
        {
            _activeGames[userId] =
                new GameSession(targetNumber);
        }
    }

    public GameGuessResult SubmitGuess(
        int userId,
        int guessedNumber)
    {
        lock (_gameStateLock)
        {
            if (!_activeGames.TryGetValue(
                userId,
                out var activeGame))
            {
                return new GameGuessResult(
                    GuessOutcome.NoActiveGame,
                    0);
            }

            activeGame.AttemptCount++;

            if (guessedNumber < activeGame.TargetNumber)
            {
                return new GameGuessResult(
                    GuessOutcome.Higher,
                    activeGame.AttemptCount);
            }

            if (guessedNumber > activeGame.TargetNumber)
            {
                return new GameGuessResult(
                    GuessOutcome.Lower,
                    activeGame.AttemptCount);
            }

            _activeGames.Remove(userId);

            return new GameGuessResult(
                GuessOutcome.Correct,
                activeGame.AttemptCount);
        }
    }

    private class GameSession
    {
        public GameSession(int targetNumber)
        {
            TargetNumber = targetNumber;
        }

        public int TargetNumber { get; }

        public int AttemptCount { get; set; }
    }
}