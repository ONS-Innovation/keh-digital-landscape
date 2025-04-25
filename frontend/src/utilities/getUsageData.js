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

/**
 * Fetch organisation historic usage data from AWS S3
 * 
 * @returns {Promise<Object>} - The historic usage data
 */
export const fetchHistoricUsageData = async () => {
  //TODO
}

/**
 * Filter usage data based on start and end date
 * 
 * @returns {Object} - The filtered usage data
 */
export const filterUsageData = (data, startDate, endDate) => {
  if (!data || !data.length) return [];
  const start = new Date(startDate);
  const end = new Date(endDate);

  return data.filter((item) => {
    const itemDate = new Date(item.date);
    return itemDate >= start && itemDate <= end;
  });
}