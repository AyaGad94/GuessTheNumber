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

  const handleStartGame = async () => {
    setIsSubmitting(true);
    setGameMessage("");

    try {
      const startResponse =
        await startGame(authToken);

      setIsGameActive(true);
      setAttemptCount(0);
      setGuessedNumber("");
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

    setIsSubmitting(true);

    try {
      const guessResponse =
        await submitGuess(
          authToken,
          numericGuess
        );

      setAttemptCount(
        guessResponse.attemptCount
      );

      setGameMessage(
        guessResponse.message
      );

      if (guessResponse.isCorrect) {
        setIsGameActive(false);
        setGuessedNumber("");

        if (guessResponse.bestScore !== null) {
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
    <section>
      <h2>Guess The Number Game</h2>

      {!isGameActive && (
        <button
          type="button"
          onClick={handleStartGame}
          disabled={isSubmitting}
        >
          {isSubmitting
            ? "Starting..."
            : "Start Game"}
        </button>
      )}

      {isGameActive && (
        <form onSubmit={handleGuessSubmit}>
          <div>
            <label htmlFor="guessed-number">
              Enter a number from 1 to 43
            </label>

            <input
              id="guessed-number"
              type="number"
              min="1"
              max="43"
              value={guessedNumber}
              onChange={(event) =>
                setGuessedNumber(
                  event.target.value
                )
              }
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "Checking..."
              : "Submit Guess"}
          </button>
        </form>
      )}

      {attemptCount > 0 && (
        <p>
          Attempts: {attemptCount}
        </p>
      )}

      {gameMessage && (
        <p>{gameMessage}</p>
      )}
    </section>
  );
}

export default GamePanel;