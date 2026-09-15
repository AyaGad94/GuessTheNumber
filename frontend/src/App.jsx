import {
  useEffect,
  useState,
} from "react";

import "./App.css";

import GamePanel from "./components/GamePanel";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";

import {
  getCurrentUser,
} from "./services/api";

function App() {
  const [
    authenticatedUser,
    setAuthenticatedUser,
  ] = useState(null);

  const [authToken, setAuthToken] =
    useState(() =>
      sessionStorage.getItem("authToken")
    );

  const [
    isCheckingAuthentication,
    setIsCheckingAuthentication,
  ] = useState(true);

  const [authView, setAuthView] =
    useState("welcome");

  useEffect(() => {
    const restoreAuthentication = async () => {
      if (!authToken) {
        setIsCheckingAuthentication(false);
        return;
      }

      try {
        const currentUser =
          await getCurrentUser(authToken);

        setAuthenticatedUser(currentUser);
      } catch {
        sessionStorage.removeItem(
          "authToken"
        );

        setAuthToken(null);
      } finally {
        setIsCheckingAuthentication(
          false
        );
      }
    };

    restoreAuthentication();
  }, [authToken]);

  const handleLoginSuccess = (
    loginResponse
  ) => {
    sessionStorage.setItem(
      "authToken",
      loginResponse.token
    );

    setAuthToken(loginResponse.token);

    setAuthenticatedUser(
      loginResponse.user
    );
  };

  const handleLogout = () => {
    sessionStorage.removeItem(
      "authToken"
    );

    setAuthToken(null);
    setAuthenticatedUser(null);
    setAuthView("welcome");
  };

  const handleBestScoreChange = (
    bestScore
  ) => {
    setAuthenticatedUser(
      (currentUser) => ({
        ...currentUser,
        bestScore,
      })
    );
  };

  if (isCheckingAuthentication) {
    return (
      <main className="app-shell">
        <div className="app-container">
          <header className="app-header">
            <div className="app-logo">
              🎯
            </div>

            <h1 className="app-title">
              Guess The Number
            </h1>

            <p className="app-subtitle">
              Find the secret number between
              1 and 43.
            </p>
          </header>

          <section className="card auth-card">
            <p className="status-message">
              Checking authentication...
            </p>
          </section>
        </div>
      </main>
    );
  }

  if (
    authenticatedUser &&
    authToken
  ) {
    return (
      <main className="app-shell">
        <div className="app-container">
          <header className="app-header">
            <div className="app-logo">
              🎯
            </div>

            <h1 className="app-title">
              Guess The Number
            </h1>

            <p className="app-subtitle">
              Can you beat your personal
              best?
            </p>
          </header>

          <section className="card dashboard-card">
            <div className="dashboard-top">
              <div>
                <h2 className="welcome-title">
                  Welcome,{" "}
                  {
                    authenticatedUser.username
                  }{" "}
                  👋
                </h2>

                <p className="welcome-text">
                  Ready for another challenge?
                </p>
              </div>

              <button
                type="button"
                className="secondary-button"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>

            <div className="best-score-card">
              <p className="best-score-label">
                Personal Best
              </p>

              {authenticatedUser.bestScore !==
              null ? (
                <>
                  <p className="best-score-value">
                    {
                      authenticatedUser.bestScore
                    }
                  </p>

                  <p className="best-score-unit">
                    guesses
                  </p>
                </>
              ) : (
                <>
                  <p className="best-score-value">
                    —
                  </p>

                  <p className="best-score-unit">
                    Complete your first game
                    to set a score.
                  </p>
                </>
              )}
            </div>

            <div className="game-card">
              <GamePanel
                authToken={authToken}
                onBestScoreChange={
                  handleBestScoreChange
                }
              />
            </div>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <div className="app-container">
        <header className="app-header">
          <div className="app-logo">
            🎯
          </div>

          <h1 className="app-title">
            Guess The Number
          </h1>

          <p className="app-subtitle">
            Guess the secret number between
            1 and 43 using as few attempts as
            possible.
          </p>
        </header>

        {authView === "welcome" && (
          <section className="card entry-card">
            <div className="entry-icon">
              ✨
            </div>

            <h2 className="entry-title">
              Ready to Play?
            </h2>

            <p className="entry-description">
              Test your guessing skills,
              follow the higher and lower
              hints, and try to beat your
              personal best.
            </p>

            <div className="entry-features">
              <div className="entry-feature">
                <span>🎯</span>
                <p>
                  Guess a secret number from
                  1 to 43
                </p>
              </div>

              <div className="entry-feature">
                <span>🏆</span>
                <p>
                  Save and beat your personal
                  best score
                </p>
              </div>

              <div className="entry-feature">
                <span>📈</span>
                <p>
                  Track your guesses and
                  possible range
                </p>
              </div>
            </div>

            <div className="entry-actions">
              <button
                type="button"
                className="entry-primary-button"
                onClick={() =>
                  setAuthView("login")
                }
              >
                Login
              </button>

              <button
                type="button"
                className="entry-secondary-button"
                onClick={() =>
                  setAuthView("register")
                }
              >
                Create Account
              </button>
            </div>

            <p className="entry-footer">
              Your best score is saved to
              your account.
            </p>
          </section>
        )}

        {authView === "login" && (
          <section className="card auth-card auth-view-card">
            <button
              type="button"
              className="auth-back-button"
              onClick={() =>
                setAuthView("welcome")
              }
            >
              ← Back
            </button>

            <LoginForm
              onLoginSuccess={
                handleLoginSuccess
              }
            />

            <div className="auth-switch">
              <span>
                New to the game?
              </span>

              <button
                type="button"
                className="auth-switch-button"
                onClick={() =>
                  setAuthView("register")
                }
              >
                Create an account
              </button>
            </div>
          </section>
        )}

        {authView === "register" && (
          <section className="card auth-card auth-view-card">
            <button
              type="button"
              className="auth-back-button"
              onClick={() =>
                setAuthView("welcome")
              }
            >
              ← Back
            </button>

            <RegisterForm />

            <div className="auth-switch">
              <span>
                Already have an account?
              </span>

              <button
                type="button"
                className="auth-switch-button"
                onClick={() =>
                  setAuthView("login")
                }
              >
                Login
              </button>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

export default App;