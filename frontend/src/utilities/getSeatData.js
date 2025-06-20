/**
 * Fetch CoPilot seat data from Github API
 * 
 * @returns {Promise<Object>} - The seat data
 */
export const fetchSeatData = async () => {
  try {
    const backendUrl = process.env.REACT_APP_BACKEND_URL || '';
    const response = await fetch(`${backendUrl}/copilot/api/seats`);
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

