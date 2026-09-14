using System.ComponentModel.DataAnnotations;
using GuessTheNumber.Api.Game;

namespace GuessTheNumber.Api.DTOs;

public class GuessRequest
{
    [Range(
        GameRules.MinimumNumber,
        GameRules.MaximumNumber)]
    public int GuessedNumber { get; set; }
}