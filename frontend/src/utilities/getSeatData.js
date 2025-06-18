/**
 * Fetch Copilot seat data from Github API
 * 
 * @returns {Promise<Object>} - The seat data
 */
export const fetchOrgSeatData = async () => {
  try {
    let response;
    if (process.env.NODE_ENV === "development") {
      response = await fetch(`http://localhost:5001/copilot/api/seats`);
    } else {
      response = await fetch("/copilot/api/seats");
    }
    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching seat data:", error);
    return null;
  }
}

/**
 * Fetch Copilot seat data filtered by provided team slug
 * 
 * @param {string} token - The GitHub user token
 * @returns {Promise<Array>} - Array of teams
 */
export const fetchTeamSeatData = async (token, teamSlug) => {
  if (!teamSlug) {
    console.error("Team slug is required to fetch team seats");
    return [];
  }
  try {
    let response;
    if (process.env.NODE_ENV === "development") {
      response = await fetch(`http://localhost:5001/copilot/api/team/seats?teamSlug=${teamSlug}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } else {
      response = await fetch(`/copilot/api/team/seats?teamSlug=${teamSlug}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
    }
    if (!response.ok) {
      console.error("Failed to fetch team seats:", response.statusText);
      return [];
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching team seats:", error);
    return [];
  }
};

/**
 * Filter seat data based on inactivity date threshold to get active users
 * 
 * @param {Array} seatData - The seat data to filter
 * @param {string} inactivityDate - The threshold for filtering
 * @returns {Array} - Active users
 */
export const filterInactiveUsers = (seatData, inactivityDate) => {
  if (!seatData || seatData.length === 0 || !inactivityDate) {
    return [];
  }

const filteredData = seatData.filter(user => {
  const activityDate = new Date(user.last_activity_at);
  const thresholdDate = new Date(inactivityDate);
  return activityDate >= thresholdDate;
});

  return filteredData;
}
