/**
 * Fetch Copilot seat data from Github API
 *
 * @returns {Promise<Object>} - The seat data
 */
export const fetchOrgSeatData = async () => {
  try {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || '';
    const response = await fetch(`${backendUrl}/copilot/api/seats`);
    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching seat data:', error);
    return null;
  }
};

/**
 * Fetch Copilot seat data filtered by provided team slug
 *
 * @param {string} teamSlug - The team slug to filter seats by
 * @returns {Promise<Array>} - Array of team seats
 */
export const fetchTeamSeatData = async (teamSlug) => {
  if (!teamSlug) {
    console.error('Team slug is required to fetch team seats');
    return [];
  }
  try {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || '';
    const response = await fetch(
      `${backendUrl}/copilot/api/team/seats?teamSlug=${teamSlug}`,
      {
        credentials: 'include',
      }
    );
    if (!response.ok) {
      console.error('Failed to fetch team seats:', response.statusText);
      return [];
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching team seats:', error);
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
};
