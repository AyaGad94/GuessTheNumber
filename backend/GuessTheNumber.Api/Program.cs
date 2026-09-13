using GuessTheNumber.Api.Data;
using GuessTheNumber.Api.Models;
using GuessTheNumber.Api.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddScoped<AuthService>();

builder.Services.AddScoped<
    IPasswordHasher<User>,
    PasswordHasher<User>>();

var app = builder.Build();

app.MapControllers();

app.MapGet("/", () => Results.Ok(new
{
    message = "GuessTheNumber API is running"
}));

app.Run();