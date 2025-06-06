const logger = require('../config/logger');
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
    const data = await s3Service.getObjectViaSignedUrl('copilot', 'historic_usage_data.json');
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

module.exports = router; 