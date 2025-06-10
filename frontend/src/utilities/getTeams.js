/**
 * Fetch Github teams visible to the authenticated user in the organisation
 * @returns {Promise<Array>} Array of teams
 */
export const fetchUserTeams = async (token) => {
  if (!token) {
    console.error("Failed to obtain access token");
    return [];
  }
  try {
    let response;
    if (process.env.NODE_ENV === "development") {
      response = await fetch(`http://localhost:5001/copilot/api/teams`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        }
      );
    } else {
      response = await fetch("/copilot/api/teams",
        {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        }
      );
    }
    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching teams:", error);
    return [];
  }
}

/**
 * Exchange GitHub OAuth code for access token
 * @param {string} code - The OAuth code received from GitHub
 * @returns {Promise<string|null>} Access token or null if failed
 */
export const exchangeCodeForToken = async (code) => {
  try {
    let response;
    if (process.env.NODE_ENV === "development") {
      response = await fetch(`http://localhost:5001/copilot/api/github/oauth/token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
    } else {
      response = await fetch("/copilot/api/github/oauth/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
    }
    if(!response.ok) {
      console.error("Failed to exchange code for token:", response.statusText);
      return null;
    }

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error("Error exchanging code:", error);
    return null;
  }
};