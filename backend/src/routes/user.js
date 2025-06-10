const express = require("express");
const { verifyJwt, getUserInfo } = require("../services/cognitoService");

const router = express.Router();

// Apply authentication middleware to all user routes
router.use(verifyJwt);

/**
 * Endpoint for fetching user info.
 * @route GET /user/api/info
 * @returns {Object} User info including email, groups, and development mode status
 * @throws {Error} 401 - If user is not authenticated
 */
router.get("/info", getUserInfo);

module.exports = router;
