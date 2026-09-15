import { useState } from "react";
import {
  startGame,
  submitGuess,
} from "../services/api";

function GamePanel({
  authToken,
  onBestScoreChange,
}) {
  const [isGameActive, setIsGameActive] =
    useState(false);

  const [guessedNumber, setGuessedNumber] =
    useState("");

  const [gameMessage, setGameMessage] =
    useState("");

  const [attemptCount, setAttemptCount] =
    useState(0);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [guessHistory, setGuessHistory] =
    useState([]);

  const [
    minimumPossibleNumber,
    setMinimumPossibleNumber,
  ] = useState(1);

  const [
    maximumPossibleNumber,
    setMaximumPossibleNumber,
  ] = useState(43);

  const handleStartGame = async () => {
    setIsSubmitting(true);
    setGameMessage("");

    try {
      const startResponse =
        await startGame(authToken);

      setIsGameActive(true);
      setAttemptCount(0);
      setGuessedNumber("");
      setGuessHistory([]);
      setMinimumPossibleNumber(1);
      setMaximumPossibleNumber(43);
      setGameMessage(startResponse.message);
    } catch (error) {
      setGameMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGuessSubmit = async (event) => {
    event.preventDefault();

    const numericGuess = Number(guessedNumber);

    if (
      !Number.isInteger(numericGuess) ||
      numericGuess < 1 ||
      numericGuess > 43
    ) {
      setGameMessage(
        "Please enter a whole number between 1 and 43."
      );

      return;
    }

    const isRepeatedGuess =
      guessHistory.some(
        (historyItem) =>
          historyItem.guessedNumber ===
          numericGuess
      );

    setIsSubmitting(true);

    try {
      const guessResponse =
        await submitGuess(
          authToken,
          numericGuess
        );

      const historyItem = {
        guessedNumber: numericGuess,
        message: guessResponse.message,
        attemptCount:
          guessResponse.attemptCount,
        isCorrect:
          guessResponse.isCorrect,
        isRepeated: isRepeatedGuess,
      };

      setGuessHistory(
        (currentHistory) => [
          ...currentHistory,
          historyItem,
        ]
      );

      setAttemptCount(
        guessResponse.attemptCount
      );

      setGameMessage(
        guessResponse.message
      );

      if (
        guessResponse.message ===
        "Guess higher."
      ) {
        setMinimumPossibleNumber(
          (currentMinimum) =>
            Math.max(
              currentMinimum,
              numericGuess + 1
            )
        );
      }

      if (
        guessResponse.message ===
        "Guess lower."
      ) {
        setMaximumPossibleNumber(
          (currentMaximum) =>
            Math.min(
              currentMaximum,
              numericGuess - 1
            )
        );
      }

      setGuessedNumber("");

      if (guessResponse.isCorrect) {
        setIsGameActive(false);

        if (
          guessResponse.bestScore !== null
        ) {
          onBestScoreChange(
            guessResponse.bestScore
          );
        }
      }
    } catch (error) {
      setGameMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="game-panel">
      <h2 className="game-title">
        Guess The Number Game
      </h2>

      <p className="game-description">
        Find the secret number between 1 and
        43 using as few attempts as possible.
      </p>

      {!isGameActive && (
        <div className="game-actions">
          <button
            type="button"
            className="game-action-button"
            onClick={handleStartGame}
            disabled={isSubmitting}
          >
            <span>
              {isSubmitting ? "⏳" : "🎮"}
            </span>

            {isSubmitting
              ? "Starting..."
              : "Start Game"}
          </button>
        </div>
      )}

      {isGameActive && (
        <>
          <p className="possible-range">
            Possible range:{" "}
            <strong>
              {minimumPossibleNumber} –{" "}
              {maximumPossibleNumber}
            </strong>
          </p>

          <form
            className="game-form"
            onSubmit={handleGuessSubmit}
          >
            <div className="guess-field">
              <label
                className="guess-label"
                htmlFor="guessed-number"
              >
                Enter your guess
              </label>

              <input
                id="guessed-number"
                className="guess-input"
                type="number"
                min="1"
                max="43"
                placeholder="1–43"
                value={guessedNumber}
                onChange={(event) =>
                  setGuessedNumber(
                    event.target.value
                  )
                }
                disabled={isSubmitting}
                required
              />
            </div>

            <button
              type="submit"
              className="game-action-button"
              disabled={isSubmitting}
            >
              <span>
                {isSubmitting ? "⏳" : "🎯"}
              </span>

              {isSubmitting
                ? "Checking..."
                : "Submit Guess"}
            </button>
          </form>
        </>
      )}

      {attemptCount > 0 && (
        <p className="attempt-badge">
          Attempts: {attemptCount}
        </p>
      )}

      {gameMessage && (
        <p className="game-message">
          {gameMessage}
        </p>
      )}

      {guessHistory.length > 0 && (
        <section className="guess-history">
          <h3>Guess History</h3>

          <div className="guess-history-list">
            {guessHistory.map(
              (historyItem, index) => (
                <div
                  className="guess-history-item"
                  key={`${historyItem.attemptCount}-${index}`}
                >
                  <span className="history-number">
                    {
                      historyItem.guessedNumber
                    }
                  </span>

                  <span
                    className={`history-feedback ${
                      historyItem.isCorrect
                        ? "history-correct"
                        : historyItem.message ===
                            "Guess higher."
                          ? "history-higher"
                          : "history-lower"
                    }`}
                  >
                    {historyItem.isCorrect
                      ? "✓ Correct"
                      : historyItem.message ===
                          "Guess higher."
                        ? "↑ Higher"
                        : "↓ Lower"}
                  </span>

                  {historyItem.isRepeated && (
                    <span className="history-repeat">
                      ⚠ Already guessed
                    </span>
                  )}
                </div>
              )
            )}
          </div>
        </section>
      )}
    </section>
  );
}

export default GamePanel;