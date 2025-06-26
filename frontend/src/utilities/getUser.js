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
const makeUserApiCall = async url => {
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
    console.warn(
      'Failed to fetch user info, falling back to guest:',
      error.message
    );
    return getGuestUser();
  }
};

/**
 * Fetches user information from the backend API
 * @returns {Promise<Object>} User data including email, username, groups, and development mode info
 */
export const fetchUserInfo = async () => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL || '';
  const url = `${backendUrl}/user/api/info`;
  return makeUserApiCall(url);
};

/**
 * Handles user logout by calling the backend logout endpoint
 * The backend handles ALB cookie deletion and returns the Cognito logout URL
 * @param {Function} clearCache - Optional function to clear application cache before logout
 */
export const logoutUser = async clearCache => {
  // Clear application cache if provided
  if (clearCache && typeof clearCache === 'function') {
    try {
      clearCache();
    } catch (error) {
      console.warn('Failed to clear cache during logout:', error);
    }
  }

  const backendUrl = import.meta.env.VITE_BACKEND_URL || "";
  const logoutUrl = `${backendUrl}/user/api/logout`;
  const currentUrl = window.location.origin;

  try {
    const response = await fetch(logoutUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ logout_uri: currentUrl }),
    });

    if (import.meta.env.NODE_ENV === "development") {
      window.location.reload();
      return;
    }

    if (response.ok) {
      const data = await response.json();
      window.location.href = data.logoutUrl || '/';
    } else {
      throw new Error(`Logout failed: ${response.status}`);
    }
  } catch (error) {
    console.error('Failed to logout:', error);
    window.location.href = '/';
  }
};
