/**
 * Returns default guest user object
 * @returns {Object} Default guest user data
 */
const getGuestUser = () => ({
  user: {
    email: null,
    username: null,
    groups: [],
  },
  development_mode: false,
});

/**
 * Makes API call to fetch user info
 * @param {string} url - The API endpoint URL
 * @returns {Promise<Object>} User data or guest user on error
 */
const makeUserApiCall = async (url) => {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        return getGuestUser();
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.warn('Failed to fetch user info, falling back to guest:', error.message);
    return getGuestUser();
  }
};

/**
 * Fetches user information from the backend API
 * @returns {Promise<Object>} User data including email, username, groups, and development mode info
 */
export const fetchUserInfo = async () => {
  const url = process.env.NODE_ENV === "development" 
    ? 'http://localhost:5001/user/api/info'
    : '/user/api/info';
    
  return makeUserApiCall(url);
};
