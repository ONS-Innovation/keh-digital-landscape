const logger = require("../config/logger");
const { AlbJwtVerifier, CognitoJwtVerifier } = require("aws-jwt-verify");
// Initialize verifiers based on environment
let verifier;
let cognitoVerifier;

if (process.env.NODE_ENV === "development") {
  logger.info("Authentication disabled for local development");
} else {
  verifier = AlbJwtVerifier.create({
    albArn: process.env.ALB_ARN,
    issuer: `https://cognito-idp.${process.env.AWS_REGION}.amazonaws.com/${process.env.COGNITO_USER_POOL_ID || ""}`,
    clientId: process.env.COGNITO_USER_POOL_CLIENT_ID || "",
  });

  cognitoVerifier = CognitoJwtVerifier.create({
    tokenUse: "access", // access tokens contain groups
    userPoolId: process.env.COGNITO_USER_POOL_ID || "",
    clientId: process.env.COGNITO_USER_POOL_CLIENT_ID || "",
  });
}
// Check if authentication should be disabled (for local development)
const isAuthDisabled = () => process.env.NODE_ENV === "development";

// Helper function to extract groups from Cognito access token
const extractGroups = (cognitoGroups) => {
  if (!cognitoGroups) return [];

  if (Array.isArray(cognitoGroups)) {
    return cognitoGroups;
  } else if (typeof cognitoGroups === "string") {
    return cognitoGroups.split(",").map((group) => group.trim());
  }

  return [];
};

// Helper function to create user object (only email and groups)
const createUserObject = (email, groups) => ({
  email,
  groups,
});

// Helper function to get dev user
const getDevUser = () =>
  createUserObject("dev@ons.gov.uk", ["admin", "reviewer"]);

// Helper function to verify tokens and extract user data
const verifyTokensAndExtractUser = async (req) => {
  const encoded_jwt = req.headers["x-amzn-oidc-data"];
  const access_token = req.headers["x-amzn-oidc-accesstoken"];

  if (!encoded_jwt || !access_token) {
    throw new Error("Missing authentication tokens");
  }

  // Verify tokens
  const data_payload = await verifier.verify(encoded_jwt);
  const access_payload = await cognitoVerifier.verify(access_token);

  // Extract groups and return user data
  const groups = extractGroups(access_payload["cognito:groups"]);
  return createUserObject(data_payload.email, groups);
};

async function verifyJwt(req, res, next) {
  if (isAuthDisabled()) {
    logger.info("Authentication disabled for local development");
    req.user = getDevUser();
    return next();
  }

  try {
    req.user = await verifyTokensAndExtractUser(req);
    next();
  } catch (error) {
    logger.error("JWT verification error:", { error: error.message });
    return res
      .status(401)
      .json({ message: "Unauthorized", error: error.message });
  }
}

// Helper function for role-based middleware
const createRoleMiddleware = (roleName, checkFunction) => (req, res, next) => {
  if (isAuthDisabled()) {
    logger.info(`${roleName} check bypassed for local development`);
    return next();
  }

  if (!req.user) {
    return res.status(401).json({ message: "Authentication required" });
  }

  if (!checkFunction(req.user.groups)) {
    return res.status(403).json({ message: `${roleName} access required` });
  }

  next();
};

// Middleware to check if user has admin access
const requireAdmin = createRoleMiddleware("Admin", (groups) =>
  groups.includes("admin")
);

// Middleware to check if user has reviewer access
const requireReviewer = createRoleMiddleware("Reviewer", (groups) =>
  groups.includes("reviewer")
);

// Function for the /user/api/info endpoint
async function getUserInfo(req, res) {
  if (isAuthDisabled()) {
    logger.info("User info returned for local development");
    return res.json({
      message: "User information retrieved successfully (local dev mode)",
      user: getDevUser(),
      development_mode: true,
    });
  }

  try {
    const user = await verifyTokensAndExtractUser(req);
    res.json({
      message: "User information retrieved successfully",
      user,
    });
  } catch (error) {
    logger.error("JWT verification error:", { error: error.message });
    res.status(401).json({ message: "Unauthorized", error: error.message });
  }
}

module.exports = {
  verifyJwt,
  requireAdmin,
  requireReviewer,
  getUserInfo,
};
