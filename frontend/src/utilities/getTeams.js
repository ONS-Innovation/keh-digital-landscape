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
 * Fetch teams the authenticated user can view (user teams or Copilot admin teams)
 * @returns {Promise<Object>} Object containing:
 *   - teams: Array of team objects the user can view
 *   - isAdmin: Boolean indicating if the user is a Copilot admin
 *   - userTeamSlugs: Array of team slugs the user is a member of
 */
export const fetchUserTeams = async () => {
  try {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || '';
    const response = await fetch(`${backendUrl}/copilot/api/teams`, {
      credentials: 'include',
    });

    if (!response.ok) {
      console.error(
        'Failed to fetch teams:',
        response.status,
        response.statusText
      );
      return { teams: [], isAdmin: false, userTeamSlugs: [] };
    }

    const data = await response.json();
    return {
      teams: data.teams || [],
      isAdmin: data.isAdmin || false,
      userTeamSlugs: data.userTeamSlugs || [],
    };
  } catch (error) {
    console.error('Error fetching teams:', error);
    return { teams: [], isAdmin: false, userTeamSlugs: [] };
  }
};

/**
 * Check copilot admin status for the authenticated user
 * @returns {Promise<Object>} Object containing teams array and isAdmin boolean
 */
export const checkCopilotAdminStatus = async () => {
  try {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || '';
    const response = await fetch(`${backendUrl}/copilot/api/admin/status`, {
      credentials: 'include',
    });

    if (!response.ok) {
      console.error(
        'Failed to check admin status:',
        response.status,
        response.statusText
      );
      return { teams: [], isAdmin: false };
    }

    const data = await response.json();
    return {
      teams: data.teams || [],
      isAdmin: data.isAdmin || false,
    };
  } catch (error) {
    console.error('Error checking admin status:', error);
    return { teams: [], isAdmin: false };
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
