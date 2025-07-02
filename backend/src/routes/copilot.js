const logger = require('../config/logger');
const express = require('express');
const s3Service = require('../services/s3Service');
const githubService = require('../services/githubService');

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
      return res.status(401).json({ error: 'Authentication required' });
    }
    res.json({
      authenticated: !!userToken,
      hasToken: !!userToken,
      cookieCount: Object.keys(req.cookies || {}).length,
    });
  } catch (error) {
    logger.error('Error fetching auth status:', { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

/**
 * Endpoint for fetching Copilot organisation usage data from the Github API.
 * @route GET /copilot/api/org/live
 * @returns {Object} Organisation usage JSON data
 * @throws {Error} 500 - If fetching fails
 */
router.get('/org/live', async (req, res) => {
  try {
    const data = await githubService.getCopilotOrgMetrics();
    res.json(data);
  } catch (error) {
    logger.error('GitHub API error:', { error: error.message });
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
 * Endpoint for fetching Copilot team live metrics from the Github API.
 * @route GET /copilot/api/team/live
 * @param {string} teamSlug - The slug of the team to fetch metrics for
 * @returns {Object} Team live metrics JSON data
 * @throws {Error} 400 - If team slug is missing
 * @throws {Error} 401 - If authentication is missing
 * @throws {Error} 500 - If fetching fails
 */
router.get('/team/live', async (req, res) => {
  const teamSlug = req.query.teamSlug;
  if (!teamSlug) {
    return res.status(400).json({ error: 'Missing team slug' });
  }

  const userToken = req.cookies?.githubUserToken;
  if (!userToken) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const data = await githubService.getCopilotTeamMetrics(teamSlug, userToken);
    res.json(data);
  } catch (error) {
    logger.error('GitHub API error:', { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

/**
 * Endpoint for fetching Copilot seat data from the Github API.
 * @route GET /copilot/api/seats
 * @returns {Object} Copilot seat JSON data
 * @throws {Error} 500 - If JSON fetching fails
 */
router.get('/seats', async (req, res) => {
  try {
    const allSeats = await githubService.getCopilotSeats();
    res.json(allSeats);
  } catch (error) {
    logger.error('GitHub API error:', { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

/**
 * Endpoint for fetching teams the authenticated user is a member of in the organisation from the GitHub API.
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
    const teams = await githubService.getUserTeams(userToken);
    res.json(teams);
  } catch (error) {
    logger.error('GitHub API error:', { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

/**
 * Endpoint for fetching Copilot seats for a specific team.
 * @route GET /copilot/api/team/seats
 * @param {string} teamSlug - The slug of the team to fetch seats for
 * @returns {Object} Copilot team seats JSON data
 * @throws {Error} 400 - If team slug is missing
 * @throws {Error} 401 - If authentication is missing
 * @throws {Error} 500 - If fetching fails
 */
router.get('/team/seats', async (req, res) => {
  const { teamSlug } = req.query;
  if (!teamSlug) return res.status(400).json({ error: 'Missing team slug' });

  const userToken = req.cookies?.githubUserToken;
  if (!userToken) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const [allSeats, members] = await Promise.all([
      githubService.getCopilotSeats(),
      githubService.getTeamMembers(teamSlug, userToken),
    ]);

    const memberIds = new Set(members.map(m => m.id));
    const teamSeats = allSeats.filter(s => memberIds.has(s.assignee.id));

    res.json(teamSeats);
  } catch (err) {
    logger.error('GitHub API error:', { err: err.message });
    res.status(500).json({ error: err.message });
  }
});

/**
 * Endpoint for exchanging GitHub OAuth code for access token.
 * @route POST /copilot/api/github/oauth/token
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
          ? `https://${process.env.FRONTEND_URL}/copilot/team`
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
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
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
          ? `https://${process.env.FRONTEND_URL}/copilot/team`
          : `http://localhost:3000/copilot/team`,
      scope: 'user:email read:org',
    });

  res.redirect(loginUrl);
});

module.exports = router;
