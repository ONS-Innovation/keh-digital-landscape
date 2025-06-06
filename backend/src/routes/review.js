const express = require("express");
const techRadarService = require('../services/techRadarService');
const { verifyJwt, requireReviewer } = require('../services/cognitoService');

const router = express.Router();

// Apply authentication middleware to all review routes
router.use(verifyJwt);
router.use(requireReviewer);

/**
 * Endpoint for updating the tech radar JSON in S3 from review.
 * @route POST /review/api/tech-radar/update
 * @param {Object} req.body - The update data
 * @param {Object[]} [req.body.entries] - Array of entry objects to update
 * @param {string} [req.body.title] - The title of the tech radar (for full updates)
 * @param {Object[]} [req.body.quadrants] - Array of quadrant definitions (for full updates)
 * @param {Object[]} [req.body.rings] - Array of ring definitions (for full updates)
 * @returns {Object} Success message or error response
 * @returns {string} response.message - Success confirmation message
 * @throws {Error} 400 - If entries data is invalid
 * @throws {Error} 500 - If update operation fails
 */
router.post("/tech-radar/update", async (req, res) => {
  try {
    const { entries } = req.body;
    await techRadarService.updateTechRadarEntries(entries, 'review');
    res.json({ message: "Tech radar updated successfully" });
  } catch (error) {
    if (error.message.includes("Invalid")) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 