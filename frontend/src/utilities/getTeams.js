/**
 * Check if user is authenticated by testing cookie presence
 * @returns {Promise<boolean>} Authentication status
 */
export const checkAuthStatus = async () => {
  try {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || '';
    const response = await fetch(`${backendUrl}/copilot/api/auth/status`, {
      credentials: 'include',
    });

    if (response.ok) {
      const data = await response.json();
      return data.authenticated;
    }
    return false;
  } catch (error) {
    console.error('Error checking auth status:', error);
    return false;
  }
};

/**
 * Fetch Github teams the authenticated user is a member of in the organisation
 * @returns {Promise<Array>} Array of teams
 */
export const fetchUserTeams = async () => {
  try {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || '';
    const response = await fetch(`${backendUrl}/copilot/api/teams`, {
      credentials: 'include',
    });

    if (!response.ok) {
      console.error('Failed to fetch teams:', response.status, response.statusText);
      return [];
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching teams:', error);
    return [];
  }
};

/**
 * Exchange GitHub OAuth code for access token
 * @param {string} code - The OAuth code received from GitHub
 * @returns {Promise<boolean>} Success status
 */
export const exchangeCodeForToken = async code => {
  try {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || '';
    const response = await fetch(
      `${backendUrl}/copilot/api/github/oauth/token`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ code }),
      }
    );

    if (!response.ok) {
      console.error('Failed to exchange code for token:', response.statusText);
      return false;
    }

    const data = await response.json();
    
    return data.success;
  } catch (error) {
    console.error('Error exchanging code:', error);
    return false;
  }
};

/**
 * Logout user and clear the authentication cookie
 * @returns {Promise<boolean>} Success status
 */
export const logoutUser = async () => {
  try {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || '';
    const response = await fetch(
      `${backendUrl}/copilot/api/github/oauth/logout`,
      {
        method: 'POST',
        credentials: 'include',
      }
    );

    return response.ok;
  } catch (error) {
    console.error('Error logging out:', error);
    return false;
  }
};

/**
 * Redirect user to GitHub OAuth login
 * @returns {void}
 */
export const loginWithGitHub = () => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL || '';
  const url = `${backendUrl}/copilot/api/github/oauth/login`;

  window.location.href = url;
};
