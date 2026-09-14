const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

if (!apiBaseUrl) {
  throw new Error(
    "VITE_API_BASE_URL is not configured."
  );
}

async function getErrorMessage(
  response,
  fallbackMessage
) {
  const errorData = await response
    .json()
    .catch(() => null);

  if (typeof errorData === "string") {
    return errorData;
  }

  if (errorData?.message) {
    return errorData.message;
  }

  if (errorData?.title) {
    return errorData.title;
  }

  return fallbackMessage;
}

export async function registerUser(
  username,
  email,
  password
) {
  const response = await fetch(
    `${apiBaseUrl}/api/auth/register`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        email,
        password,
      }),
    }
  );

  if (!response.ok) {
    const errorMessage = await getErrorMessage(
      response,
      "Registration failed."
    );

    throw new Error(errorMessage);
  }

  return await response.json();
}

export async function loginUser(
  email,
  password
) {
  const response = await fetch(
    `${apiBaseUrl}/api/auth/login`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    }
  );

  if (!response.ok) {
    const errorMessage = await getErrorMessage(
      response,
      "Login failed."
    );

    throw new Error(errorMessage);
  }

  return await response.json();
}

export async function getCurrentUser(
  authToken
) {
  const response = await fetch(
    `${apiBaseUrl}/api/auth/me`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(
      "Unable to restore authenticated user."
    );
  }

  return await response.json();
}

export async function startGame(
  authToken
) {
  const response = await fetch(
    `${apiBaseUrl}/api/game/start`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    }
  );

  if (!response.ok) {
    const errorMessage = await getErrorMessage(
      response,
      "Unable to start the game."
    );

    throw new Error(errorMessage);
  }

  return await response.json();
}

export async function submitGuess(
  authToken,
  guessedNumber
) {
  const response = await fetch(
    `${apiBaseUrl}/api/game/guess`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        guessedNumber,
      }),
    }
  );

  if (!response.ok) {
    const errorMessage = await getErrorMessage(
      response,
      "Unable to submit the guess."
    );

    throw new Error(errorMessage);
  }

  return await response.json();
}