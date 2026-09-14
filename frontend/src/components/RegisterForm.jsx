import { useState } from "react";
import { registerUser } from "../services/api";

function RegisterForm() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [statusMessage, setStatusMessage] =
    useState("");

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setStatusMessage("");
    setIsSubmitting(true);

    try {
      const registeredUser = await registerUser(
        username,
        email,
        password
      );

      setStatusMessage(
        `Welcome ${registeredUser.username}! Registration successful.`
      );

      setUsername("");
      setEmail("");
      setPassword("");
    } catch (error) {
      setStatusMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section>
      <h2>Create Account</h2>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="username">
            Username
          </label>

          <input
            id="username"
            type="text"
            value={username}
            onChange={(event) =>
              setUsername(event.target.value)
            }
            required
            minLength={3}
            maxLength={50}
          />
        </div>

        <div>
          <label htmlFor="email">
            Email
          </label>

          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
            required
            maxLength={255}
          />
        </div>

        <div>
          <label htmlFor="password">
            Password
          </label>

          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
            required
            minLength={6}
            maxLength={128}
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? "Creating account..."
            : "Register"}
        </button>
      </form>

      {statusMessage && (
        <p>{statusMessage}</p>
      )}
    </section>
  );
}

export default RegisterForm;