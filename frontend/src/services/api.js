const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

if (!apiBaseUrl) {
  throw new Error(
    "VITE_API_BASE_URL is not configured."
  );
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
    let errorMessage = "Registration failed.";

    const errorData = await response
      .json()
      .catch(() => null);

    if (typeof errorData === "string") {
      errorMessage = errorData;
    } else if (errorData?.message) {
      errorMessage = errorData.message;
    } else if (errorData?.title) {
      errorMessage = errorData.title;
    }

    throw new Error(errorMessage);
  }

  return await response.json();
}