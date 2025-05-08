/**
 * Fetch CoPilot seat data from Github API
 * 
 * @returns {Promise<Object>} - The seat data
 */
export const fetchSeatData = async () => {
  try {
    let response;
    if (process.env.NODE_ENV === "development") {
      response = await fetch(`http://localhost:5001/api/seats`);
    } else {
      response = await fetch("/api/seats");
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

const filteredData = Object.values(seatData.seats).filter(user => {
  const activityDate = new Date(user.last_activity_at);
  const thresholdDate = new Date(inactivityDate);
  return activityDate >= thresholdDate;
});

  return filteredData;
} 
