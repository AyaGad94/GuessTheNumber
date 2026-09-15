import { useState } from "react";
import { loginUser } from "../services/api";

function LoginForm({ onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [errorMessage, setErrorMessage] =
    useState("");

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const loginResponse =
        await loginUser(
          email,
          password
        );

      onLoginSuccess(loginResponse);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="auth-section">
      <h2 className="section-title">
        Welcome Back
      </h2>

      <p className="card-description">
        Sign in to continue your game and
        view your personal best.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label
            className="form-label"
            htmlFor="login-email"
          >
            Email
          </label>

          <input
            id="login-email"
            className="form-input"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
            autoComplete="email"
            required
            maxLength={255}
          />
        </div>

        <div className="form-group">
          <label
            className="form-label"
            htmlFor="login-password"
          >
            Password
          </label>

          <input
            id="login-password"
            className="form-input"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(event) =>
              setPassword(
                event.target.value
              )
            }
            autoComplete="current-password"
            required
            maxLength={128}
          />
        </div>

        <button
          type="submit"
          className="primary-button"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? "Logging in..."
            : "Login"}
        </button>
      </form>

      {errorMessage && (
        <p className="error-message">
          {errorMessage}
        </p>
      )}
    </section>
  );
}

export default LoginForm;