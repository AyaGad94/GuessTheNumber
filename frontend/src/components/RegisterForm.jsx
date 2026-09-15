import { useState } from "react";
import { registerUser } from "../services/api";

function RegisterForm() {
  const [username, setUsername] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [
    statusMessage,
    setStatusMessage,
  ] = useState("");

  const [
    isErrorMessage,
    setIsErrorMessage,
  ] = useState(false);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setStatusMessage("");
    setIsErrorMessage(false);
    setIsSubmitting(true);

    try {
      const registeredUser =
        await registerUser(
          username,
          email,
          password
        );

      setStatusMessage(
        `Welcome ${registeredUser.username}! Registration successful. You can now log in.`
      );

      setIsErrorMessage(false);

      setUsername("");
      setEmail("");
      setPassword("");
    } catch (error) {
      setStatusMessage(error.message);
      setIsErrorMessage(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="auth-section">
      <h2 className="section-title">
        Create Account
      </h2>

      <p className="card-description">
        Create an account to play and save
        your best score.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label
            className="form-label"
            htmlFor="register-username"
          >
            Username
          </label>

          <input
            id="register-username"
            className="form-input"
            type="text"
            placeholder="Choose a username"
            value={username}
            onChange={(event) =>
              setUsername(
                event.target.value
              )
            }
            autoComplete="username"
            required
            minLength={3}
            maxLength={50}
          />
        </div>

        <div className="form-group">
          <label
            className="form-label"
            htmlFor="register-email"
          >
            Email
          </label>

          <input
            id="register-email"
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
            htmlFor="register-password"
          >
            Password
          </label>

          <input
            id="register-password"
            className="form-input"
            type="password"
            placeholder="Minimum 6 characters"
            value={password}
            onChange={(event) =>
              setPassword(
                event.target.value
              )
            }
            autoComplete="new-password"
            required
            minLength={6}
            maxLength={128}
          />
        </div>

        <button
          type="submit"
          className="primary-button"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? "Creating account..."
            : "Create Account"}
        </button>
      </form>

      {statusMessage && (
        <p
          className={
            isErrorMessage
              ? "error-message"
              : "status-message"
          }
        >
          {statusMessage}
        </p>
      )}
    </section>
  );
}

export default RegisterForm;