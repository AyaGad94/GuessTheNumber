namespace GuessTheNumber.Api.DTOs;

public class LoginResponse
{
    public string Token { get; set; } = string.Empty;

    public DateTime ExpiresAtUtc { get; set; }

    public AuthResponse User { get; set; } = new();
}