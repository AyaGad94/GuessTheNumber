namespace GuessTheNumber.Api.DTOs;

public class AuthResponse
{
    public int Id { get; set; }

    public string Username { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public int? BestScore { get; set; }
}