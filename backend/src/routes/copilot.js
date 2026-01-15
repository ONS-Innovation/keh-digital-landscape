const logger = require('../config/logger');
const express = require('express');
const s3Service = require('../services/s3Service');
const { checkCopilotAdminStatus } = require('../utilities/copilotAdminChecker');
const {
  getTeamsHistoricDataWithCache,
} = require('../utilities/teamsHistoricCache');

const router = express.Router();

/**
 * Endpoint for testing cookie authentication
 * @route GET /copilot/api/auth/status
 * @returns {Object} Authentication status
 */
router.get('/auth/status', (req, res) => {
  try {
    const userToken = req.cookies.githubUserToken;
    if (!userToken) {
      return res.status(200).json({ response: 'No user token found' });
    }
    res.json({
      authenticated: !!userToken,
    });
  } catch (error) {
    logger.error('Error fetching auth status:', { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

/**
 * Endpoint for fetching Copilot organisation historic usage data from S3.
 * @route GET /copilot/api/org/historic
 * @returns {Object} Organisation usage JSON data
 * @throws {Error} 500 - If fetching fails
 */
router.get('/org/historic', async (req, res) => {
  try {
    const data = await s3Service.getObjectViaSignedUrl(
      'copilot',
      'historic_usage_data.json'
    );
    res.json(data);
  } catch (error) {
    logger.error('Error fetching JSON:', { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

/**
 * Endpoint for fetching all teams' historic usage data from S3.
 * @route GET /copilot/api/teams/historic
 * @returns {Object} All teams historic usage JSON data
 * @throws {Error} 401 - If user token is missing
 * @throws {Error} 500 - If token validation or fetching fails
 */
router.get('/teams/historic', async (req, res) => {
  const userToken = req.cookies?.githubUserToken;

  if (!userToken) {
    return res.status(401).json({ response: 'No user token found' });
  }

  try {
    // Validate token by checking copilot admin status
    // This will throw an error if the token is invalid
    const adminStatus = await checkCopilotAdminStatus(userToken);

    // Fetch the cached data (contains all teams)
    const copilotBucketName =
      process.env.COPILOT_BUCKET_NAME || 'sdp-dev-copilot-usage-dashboard';
    const fullData = await getTeamsHistoricDataWithCache(copilotBucketName);

    // Filter data based on permissions
    let filteredData;
    if (adminStatus.isAdmin) { 
      // Admin can see data for all teams
      filteredData = fullData;
    } else {
      // Non-admin can only see data for their own teams
      const userTeamSlugs = adminStatus.userTeamSlugs;
      filteredData = fullData.filter(teamEntry =>
        userTeamSlugs.includes(teamEntry.team?.slug)
      );
    }

    res.json(filteredData);
  } catch (error) {
    logger.error('Error fetching teams historic JSON:', {
      error: error.message,
    });
    res.status(500).json({ error: error.message });
  }
});

/**
 * Endpoint for checking if the authenticated user is a copilot admin
 * @route GET /copilot/api/admin/status
 * @returns {Object} Copilot admin status and available teams
 * @throws {Error} 401 - If user token is missing
 * @throws {Error} 500 - If checking fails
 */
router.get('/admin/status', async (req, res) => {
  const userToken = req.cookies?.githubUserToken;

  if (!userToken) {
    return res.status(401).json({ error: 'Missing GitHub user token' });
  }

  try {
    const adminStatus = await checkCopilotAdminStatus(userToken);
    res.json(adminStatus);
  } catch (error) {
    logger.error('Error checking copilot admin status:', {
      error: error.message,
    });
    res.status(500).json({ error: error.message });
  }
});

/**
 * Endpoint for fetching teams the authenticated user can view.
 * Returns user's teams if they're not a copilot admin, or copilot teams if they are.
 * @route GET /copilot/api/teams
 * @returns {Object} Copilot teams JSON data
 * @throws {Error} 401 - If user token is missing
 * @throws {Error} 500 - If fetching fails
 */
router.get('/teams', async (req, res) => {
  const userToken = req.cookies?.githubUserToken;

  if (!userToken) {
    return res.status(401).json({ error: 'Missing GitHub user token' });
  }

  try {
    const adminStatus = await checkCopilotAdminStatus(userToken);
    res.json({
      teams: adminStatus.teams,
      isAdmin: adminStatus.isAdmin,
      userTeamSlugs: adminStatus.userTeamSlugs,
    });
  } catch (error) {
    logger.error('GitHub API error:', { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

/**
 * Endpoint for exchanging GitHub OAuth code for access token.
 * @route POST /copilot/api/github/oauth/token
 * @param {string} req.body.code - GitHub OAuth code received from the client
 * @returns {Object} Success response
 * @throws {Error} 400 - If code is missing or exchange fails
 */
router.post('/github/oauth/token', async (req, res) => {
  const { code } = req.body;
  if (!code) return res.status(400).json({ error: 'Missing code' });

  try {
    const params = new URLSearchParams({
      client_id: process.env.GITHUB_APP_CLIENT_ID,
      client_secret: process.env.GITHUB_APP_CLIENT_SECRET,
      code,
      redirect_uri:
        process.env.NODE_ENV === 'production'
          ? `${process.env.FRONTEND_URL}/copilot/team`
          : `http://localhost:3000/copilot/team`,
      scope: 'user:email read:org',
    });

    const tokenResponse = await fetch(
      'https://github.com/login/oauth/access_token',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json',
        },
        body: params,
      }
    );

    const tokenData = await tokenResponse.json();
    if (tokenData.error) {
      return res
        .status(400)
        .json({ error: tokenData.error_description || tokenData.error });
    }

    // Set the access token as an httpOnly cookie with detailed logging
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 3 * 60 * 60 * 1000, // 3 hours
      path: '/',
    };

    res.cookie('githubUserToken', tokenData.access_token, cookieOptions);

    res.json({ success: true });
  } catch (error) {
    logger.error('Error exchanging code for token:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * Endpoint for logging out and clearing the user token cookie.
 * @route POST /copilot/api/github/oauth/logout
 * @returns {Object} Success response
 */
router.post('/github/oauth/logout', (req, res) => {
  res.clearCookie('githubUserToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });
  res.json({ success: true });
});

/**
 * Endpoint for redirecting to GitHub OAuth login.
 * @route GET /copilot/github/oauth/login
 * @returns {void} Redirects to GitHub OAuth login page
 */
router.get('/github/oauth/login', (req, res) => {
  const loginUrl =
    `https://github.com/login/oauth/authorize?` +
    new URLSearchParams({
      client_id: process.env.GITHUB_APP_CLIENT_ID,
      redirect_uri:
        process.env.NODE_ENV === 'production'
          ? `${process.env.FRONTEND_URL}/copilot/team`
          : `http://localhost:3000/copilot/team`,
      scope: 'user:email read:org',
    });

  res.redirect(loginUrl);
});

module.exports = router;
