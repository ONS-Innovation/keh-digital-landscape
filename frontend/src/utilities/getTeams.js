/**
 * Fetch Github teams visible to the authenticated user in the organisation
 * @returns {Promise<Array>} Array of teams
 */
export const fetchUserTeams = async (token) => {
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