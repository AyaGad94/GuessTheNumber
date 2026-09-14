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
        sessionStorage.removeItem("authToken");
        setAuthToken(null);
      } finally {
        setIsCheckingAuthentication(false);
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
    sessionStorage.removeItem("authToken");

    setAuthToken(null);
    setAuthenticatedUser(null);
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
            <p>
              Checking authentication...
            </p>
          </section>
        </div>
      </main>
    );
  }

  if (authenticatedUser && authToken) {
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
                  {authenticatedUser.username} 👋
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

            <GamePanel
              authToken={authToken}
              onBestScoreChange={
                handleBestScoreChange
              }
            />
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

        <section className="card auth-card">
          <LoginForm
            onLoginSuccess={
              handleLoginSuccess
            }
          />

          <div className="auth-divider">
            <span>or</span>
          </div>

          <RegisterForm />
        </section>
      </div>
    </main>
  );
}

export default App;