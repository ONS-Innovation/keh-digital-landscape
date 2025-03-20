/**
 * Fetches banner messages from the backend and filters them for a specific page
 * @param {string} page - The page to filter banners for ('radar', 'statistics', or 'projects')
 * @returns {Promise<Array>} Array of banner objects {title, description, type} for the specified page
 */
export const fetchBanners = async (page) => {
  try {
    const baseUrl =
      process.env.NODE_ENV === "development"
        ? "http://localhost:5001/api/banners"
        : "/api/banners";

    const response = await fetch(baseUrl);

    if (!response.ok) {
      throw new Error("Failed to fetch banners");
    }

    const data = await response.json();
    
    if (!data.messages || !Array.isArray(data.messages)) {
      return [];
    }

    // Filter banners that should be shown on the specified page
    const filteredBanners = data.messages
      .filter(message => {
        // Only include messages that have show set to true
        if (!message.show) {
          return false;
        }

        // Check if message is for this page
        // Handle both formats: 'page' property or 'pages' array
        if (message.page) {
          return message.page === page;
        } else if (Array.isArray(message.pages)) {
          return message.pages.includes(page);
        }
        
        return false;
      })
      .map(message => ({
        title: message.title || message.message || "",
        description: message.description || message.message || "",
        type: message.type || "info"
      }))
      .filter(banner => {
        // Check localStorage to see if this banner was dismissed
        const bannerId = `dismissed_banner_${banner.title}_${banner.description}`.replace(/\s+/g, '_');
        const dismissed = localStorage.getItem(bannerId);
        
        // If not dismissed, or if it's been more than 7 days since dismissal, show the banner
        if (!dismissed) {
          return true;
        }
        
        try {
          const dismissedData = JSON.parse(dismissed);
          const dismissedAt = dismissedData.dismissedAt;
          const now = new Date().getTime();
          const sevenDays = 7 * 24 * 60 * 60 * 1000; // milliseconds in 7 days
          
          // If it's been more than 7 days, show the banner again
          return (now - dismissedAt) > sevenDays;
        } catch (e) {
          // If there's an error parsing the JSON, show the banner
          return true;
        }
      });

    // Return only the last banner if there are multiple
    if (filteredBanners.length > 0) {
      return [filteredBanners[filteredBanners.length - 1]];
    }
    
    return [];
  } catch (error) {
    console.error("Error fetching banners:", error);
    return [];
  }
};
