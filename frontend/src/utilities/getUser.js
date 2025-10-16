import customFetch from './customFetch';

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
 * @returns {Promise<Object>} User data or guest user on error
 */
export const fetchUserInfo = async () => {
  try {
    const response = await customFetch('/user/api/info');

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

  if (import.meta.env.NODE_ENV === 'development') {
    // In development mode, call the backend logout endpoint then reload the page
    try {
      const currentUrl = window.location.origin;

      await customFetch('/user/api/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ logout_uri: currentUrl }),
      });
    } catch (error) {
      console.warn('Failed to call backend logout endpoint:', error);
    }

    // Reload the page to clear local state
    window.location.reload();
  } else {
    // In production, call the backend logout endpoint
    try {
      const response = await customFetch('/user/api/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ logout_uri: window.location.origin }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.logoutUrl) {
          // Redirect to the Cognito logout URL
          window.location.href = data.logoutUrl;
        } else {
          // Fallback: redirect to home page
          window.location.href = '/';
        }
      } else {
        throw new Error(`Logout failed: ${response.status}`);
      }
    } catch (error) {
      console.error('Failed to logout:', error);
      // Fallback: redirect to home page
      window.location.href = '/';
    }
  }
};
