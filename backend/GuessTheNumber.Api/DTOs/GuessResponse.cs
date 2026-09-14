namespace GuessTheNumber.Api.DTOs;

public class GuessResponse
{
    public string Message { get; set; } = string.Empty;

    public int AttemptCount { get; set; }

    public bool IsCorrect { get; set; }

    public int? BestScore { get; set; }

    public bool IsNewBestScore { get; set; }
}