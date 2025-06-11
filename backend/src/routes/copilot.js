const logger = require("../config/logger");
const express = require("express");
const s3Service = require("../services/s3Service");
const githubService = require("../services/githubService");

const router = express.Router();

/**
 * Endpoint for fetching Copilot organisation usage data from the Github API.
 * @route GET /copilot/api/org/live
 * @returns {Object} Organisation usage JSON data
 * @throws {Error} 500 - If fetching fails
 */
router.get("/org/live", async (req, res) => {
  try {
    const data = await githubService.getCopilotOrgMetrics();
    res.json(data);
  } catch (error) {
    logger.error("GitHub API error:", { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

/**
 * Endpoint for fetching Copilot organisation historic usage data from S3.
 * @route GET /copilot/api/org/historic
 * @returns {Object} Organisation usage JSON data
 * @throws {Error} 500 - If fetching fails
 */
router.get("/org/historic", async (req, res) => {
  try {
    const data = await s3Service.getObjectViaSignedUrl(
      "copilot",
      "historic_usage_data.json"
    );
    res.json(data);
  } catch (error) {
    logger.error("Error fetching JSON:", { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

/**
 * Endpoint for fetching Copilot seat data from the Github API.
 * @route GET /copilot/api/seats
 * @returns {Object} Copilot seat JSON data
 * @throws {Error} 500 - If JSON fetching fails
 */
router.get("/seats", async (req, res) => {
  try {
    const allSeats = await githubService.getCopilotSeats();
    res.json(allSeats);
  } catch (error) {
    logger.error("GitHub API error:", { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

/**
 * Endpoint for fetching teams the authenticated user is a member of in the organisation from the GitHub API.
 * @route GET /copilot/api/teams
 * @returns {Object} Copilot teams JSON data
 * @throws {Error} 500 - If fetching fails
 */
router.get("/teams", async (req, res) => {
  const authHeader = req.headers.authorization;
  const userToken = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

  if (!userToken) {
    return res.status(401).json({ error: "Missing GitHub user token" });
  }
  
  try {
    const teams = await githubService.getUserTeams(userToken);
    res.json(teams);
  } catch (error) {
    logger.error("GitHub API error:", { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

/**
 * Endpoint for exchanging GitHub OAuth code for access token.
 * @route POST /copilot/api/github/oauth/token
 * @returns {Object} Access token JSON data
 * @throws {Error} 400 - If code is missing or exchange fails
 */
router.post("/github/oauth/token", async (req, res) => {
  const { code } = req.body;
  if (!code) return res.status(400).json({ error: "Missing code" });

  try {
    const params = new URLSearchParams({
      client_id: process.env.GITHUB_APP_CLIENT_ID,
      client_secret: process.env.GITHUB_APP_CLIENT_SECRET,
      code,
      redirect_uri: "http://localhost:3000/copilot?fromTab=team", //todo: pass dev/prod NODE.ENV
      scope: "user:email read:org",
    });

    const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: { 
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json"
       },
      body: params,
    });

    const tokenData = await tokenResponse.json();
    if (tokenData.error) {
      return res.status(400).json({ error: tokenData.error_description || tokenData.error });
    }

    // Return the access token to frontend
    res.json({ access_token: tokenData.access_token });
  } catch (error) {
    logger.error("Error exchanging code for token:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
