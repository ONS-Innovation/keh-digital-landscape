/**
 * Fetch organisation live usage data from Github API
 * 
 * @returns {Promise<Object>} - The live usage data
 */
export const fetchLiveUsageData = async () => {
  try {
    let response;
    if (process.env.NODE_ENV === "development") {
      response = await fetch(`http://localhost:5001/api/org/live`);
    } else {
      response = await fetch("/api/org/live");
    }
    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching usage data:", error);
    return null;
  }
}

//TODO
export const fetchHistoricUsageData = async () => {

}

//TODO
export const filterUsageData = (data, startDate, endDate) => {

}