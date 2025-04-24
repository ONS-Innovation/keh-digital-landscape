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