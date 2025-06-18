const express = require("express");
const { verifyJwt, getUserInfo } = require("../services/cognitoService");
const logger = require("../config/logger");

const router = express.Router();

// Apply authentication middleware to all user routes except logout
router.use((req, res, next) => {
  // Skip auth for logout endpoint
  if (req.path === '/logout') {
    return next();
  }
  return verifyJwt(req, res, next);
});

/**
 * Endpoint for fetching user info.
 * @route GET /user/api/info
 * @returns {Object} User info including email, groups, and development mode status
 * @throws {Error} 401 - If user is not authenticated
 */
router.get("/info", getUserInfo);

// Logout endpoint - handles ALB cookie deletion and Cognito logout
router.post("/logout", (req, res) => {
  try {
    // In development mode, just return success
    if (process.env.NODE_ENV === "development") {
      logger.info("Logout requested in development mode");
      return res.json({ message: "Logout successful (development mode)" });
    }

    // List of ALB authentication cookies to expire
    const cookiesToExpire = [
      "AWSELBAuthSessionCookie-0",
      "AWSELBAuthSessionCookie-1", 
      "AuthenticatedSession-0",
      "AuthenticatedSession-1",
      "AWSALB",
      "AWSALBCORS"
    ];

    // Delete each cookie by setting it as expired
    cookiesToExpire.forEach(cookieName => {
      res.cookie(cookieName, '', {
        expires: new Date(0), // Thu, 01 Jan 1970 00:00:00 GMT
        path: '/',
        httpOnly: true,
        secure: true,
        sameSite: 'lax'
      });
    });

    // Get the logout URI from query params or default to origin
    const logoutUri = req.query.logout_uri || req.get('origin') || `https://${req.get('host')}`;
    
    // Construct the proper Cognito logout URL
    // The domain output is just the domain name, we need to construct the full URL
    const cognitoDomain = process.env.COGNITO_USER_POOL_DOMAIN || "sdp-dev-digital-landscape";
    const region = process.env.AWS_REGION || "eu-west-2";
    const clientId = process.env.COGNITO_USER_POOL_CLIENT_ID;
    
    const cognitoLogoutUrl = `https://${cognitoDomain}.auth.${region}.amazoncognito.com/logout?client_id=${clientId}&redirect_uri=${encodeURIComponent(logoutUri)}&logout_uri=${encodeURIComponent(process.env.SIGN_OUT_URL)}&response_type=code&scope=openid+email`;
    
    logger.info("User logout successful, redirecting to Cognito logout", { 
      logoutUri,
      cognitoLogoutUrl: cognitoLogoutUrl.replace(clientId, '***') // Hide client ID in logs
    });
    
    // Return the logout URL for the frontend to redirect to
    res.json({ 
      message: "Logout successful",
      logoutUrl: cognitoLogoutUrl
    });

  } catch (error) {
    logger.error("Logout error:", { error: error.message });
    res.status(500).json({ message: "Logout failed", error: error.message });
  }
});

module.exports = router;
