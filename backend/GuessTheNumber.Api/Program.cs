using GuessTheNumber.Api.Data;
using GuessTheNumber.Api.Models;
using GuessTheNumber.Api.Options;
using GuessTheNumber.Api.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

const string frontendCorsPolicy = "FrontendCors";

var allowedOrigins =
    builder.Configuration
        .GetSection("Cors:AllowedOrigins")
        .Get<string[]>()
    ?? throw new InvalidOperationException(
        "CORS allowed origins configuration is missing.");

if (allowedOrigins.Length == 0)
{
    throw new InvalidOperationException(
        "At least one CORS allowed origin must be configured.");
}

// Controllers
builder.Services.AddControllers();

// Swagger / OpenAPI
builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc(
        "v1",
        new OpenApiInfo
        {
            Title = "GuessTheNumber API",
            Version = "v1",
            Description =
                "ASP.NET Core Web API for the Guess The Number interview assessment."
        });

    options.AddSecurityDefinition(
        "Bearer",
        new OpenApiSecurityScheme
        {
            Name = "Authorization",
            Type = SecuritySchemeType.Http,
            Scheme = "bearer",
            BearerFormat = "JWT",
            In = ParameterLocation.Header,
            Description =
                "Enter your JWT token to access protected endpoints."
        });

    options.AddSecurityRequirement(
        new OpenApiSecurityRequirement
        {
            {
                new OpenApiSecurityScheme
                {
                    Reference =
                        new OpenApiReference
                        {
                            Type =
                                ReferenceType.SecurityScheme,
                            Id = "Bearer"
                        }
                },
                Array.Empty<string>()
            }
        });
});

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy(
        frontendCorsPolicy,
        policy =>
        {
            policy
                .WithOrigins(allowedOrigins)
                .AllowAnyHeader()
                .AllowAnyMethod();
        });
});

// Database
builder.Services.AddDbContext<AppDbContext>(
    options =>
        options.UseNpgsql(
            builder.Configuration
                .GetConnectionString(
                    "DefaultConnection")));

// Application services
builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<JwtTokenService>();
builder.Services.AddSingleton<GameSessionStore>();
builder.Services.AddScoped<GameService>();

builder.Services.AddScoped<
    IPasswordHasher<User>,
    PasswordHasher<User>>();

// JWT configuration
var jwtSection =
    builder.Configuration.GetSection(
        JwtOptions.SectionName);

var jwtOptions =
    jwtSection.Get<JwtOptions>()
    ?? throw new InvalidOperationException(
        "JWT configuration is missing.");

if (string.IsNullOrWhiteSpace(jwtOptions.Key))
{
    throw new InvalidOperationException(
        "JWT signing key is missing.");
}

if (
    string.IsNullOrWhiteSpace(jwtOptions.Issuer) ||
    string.IsNullOrWhiteSpace(jwtOptions.Audience))
{
    throw new InvalidOperationException(
        "JWT issuer or audience is missing.");
}

if (jwtOptions.ExpiresMinutes <= 0)
{
    throw new InvalidOperationException(
        "JWT expiration must be greater than zero.");
}

byte[] jwtKeyBytes;

try
{
    jwtKeyBytes =
        Convert.FromBase64String(
            jwtOptions.Key);
}
catch (FormatException)
{
    throw new InvalidOperationException(
        "JWT signing key must be valid Base64.");
}

if (jwtKeyBytes.Length < 32)
{
    throw new InvalidOperationException(
        "JWT signing key must be at least 256 bits.");
}

builder.Services.Configure<JwtOptions>(
    jwtSection);

// Authentication
builder.Services
    .AddAuthentication(
        JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters =
            new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,

                ValidIssuer =
                    jwtOptions.Issuer,

                ValidAudience =
                    jwtOptions.Audience,

                IssuerSigningKey =
                    new SymmetricSecurityKey(
                        jwtKeyBytes),

                ClockSkew =
                    TimeSpan.Zero
            };
    });

builder.Services.AddAuthorization();

var app = builder.Build();

// Swagger is enabled so the interviewer
// can inspect and test the deployed API.
app.UseSwagger();

app.UseSwaggerUI(options =>
{
    options.SwaggerEndpoint(
        "/swagger/v1/swagger.json",
        "GuessTheNumber API v1");

    options.RoutePrefix = "swagger";
});

// Middleware
app.UseCors(frontendCorsPolicy);

app.UseAuthentication();
app.UseAuthorization();

// Controller endpoints
app.MapControllers();

// API root endpoint
app.MapGet(
    "/",
    () =>
        Results.Ok(
            new
            {
                message =
                    "GuessTheNumber API is running"
            }));

app.Run();