# Cognito Service

The Cognito Service (`services/cognitoService.js`) handles AWS Cognito authentication and authorisation for the Digital Landscape application using the `aws-jwt-verify` library.

## Overview

The service provides a centralised authentication system that:

- Validates JWT tokens from AWS Application Load Balancer (ALB) and Cognito
- Implements role-based access control through Cognito user groups
- Provides middleware for protecting API endpoints
- Handles development mode authentication bypass
- Extracts user information including email and group memberships

## Architecture

### Token Verification

The service uses two types of JWT verifiers:

```javascript
// ALB JWT Verifier - validates tokens from Application Load Balancer
const verifier = AlbJwtVerifier.create({
  albArn: process.env.ALB_ARN,
  issuer: `https://cognito-idp.${process.env.AWS_REGION}.amazonaws.com/${process.env.COGNITO_USER_POOL_ID}`,
  clientId: process.env.COGNITO_USER_POOL_CLIENT_ID,
});

// Cognito JWT Verifier - validates access tokens containing group information
const cognitoVerifier = CognitoJwtVerifier.create({
  tokenUse: "access",
  userPoolId: process.env.COGNITO_USER_POOL_ID,
  clientId: process.env.COGNITO_USER_POOL_CLIENT_ID,
});
```

### User Groups & Permissions

The system recognises the following Cognito groups:

- **`admin`** - Full administrative access to all endpoints
- **`reviewer`** - Access to review functionality and technology radar updates
- **Multiple groups** - Users can belong to both groups for expanded permissions

## Core Functions

### `verifyJwt(req, res, next)`

Base authentication middleware that:

- Checks if authentication is disabled (development mode)
- Validates ALB and Cognito JWT tokens
- Extracts user information and attaches to `req.user`
- Returns 401 Unauthorised for invalid tokens

```javascript
// Example usage
app.use('/protected-route', verifyJwt, routeHandler);
```

### `requireAdmin(req, res, next)`

Administrative access middleware that:

- Ensures user is authenticated
- Verifies user belongs to `admin` group
- Returns 403 Forbidden for insufficient permissions

```javascript
// Example usage
app.use('/admin/api', verifyJwt, requireAdmin, adminRoutes);
```

### `requireReviewer(req, res, next)`

Reviewer access middleware that:

- Ensures user is authenticated
- Verifies user belongs to `reviewer` group
- Returns 403 Forbidden for insufficient permissions

```javascript
// Example usage
app.use('/review/api', verifyJwt, requireReviewer, reviewRoutes);
```

### `getUserInfo(req, res)`

Endpoint handler for `/user/api/info` that:

- Returns user information including email and groups
- Handles development mode with mock user data
- Provides authentication status to frontend

## Development Mode

When `NODE_ENV=development`, the service:

- Bypasses all authentication checks
- Provides a default developer user with admin and reviewer permissions
- Logs authentication bypass messages
- Uses configurable groups from `DEV_USER_GROUPS` environment variable

```javascript
const getDevUser = () => ({
  email: "dev@ons.gov.uk",
  groups: process.env.DEV_USER_GROUPS?.split(",") || ["admin", "reviewer"]
});
```

## User Object Structure

The service extracts and provides user objects with the following structure:

```javascript
{
  email: "user@example.com",      // User's email from Cognito
  groups: ["admin", "reviewer"]   // Array of Cognito groups
}
```

## Frontend Integration

### User Profile Display

The authentication information is used by frontend components:

- **Sidebar** - Shows user email and role-appropriate icons
- **MenuDropdown** - Displays user information and logout option
- **UserProfile** - Renders different icons based on user groups:
  - `TbUser` - Default user (no groups)
  - `TbUserShield` - Admin user
  - `TbEditCircle` - Reviewer user
  - `TbUsers` - User with both admin and reviewer roles

### Author Attribution

When reviewers make changes to technologies:

- Their email is automatically captured from the authenticated session
- Changes are attributed to the user for audit purposes
- No additional input required from the user

## Error Handling

The service provides comprehensive error handling:

### Authentication Errors

- **Missing Tokens** - Returns 401 when ALB or access tokens are missing
- **Invalid Tokens** - Returns 401 when JWT verification fails
- **Token Verification Errors** - Logs detailed error information

### Authorisation Errors

- **Missing Authentication** - Returns 401 when user object is not present
- **Insufficient Permissions** - Returns 403 when user lacks required group membership
- **Role Validation** - Checks group membership before granting access

## Environment Variables

The service requires the following environment variables:

### Required (Production)

```bash
ALB_ARN=arn:aws:elasticloadbalancing:region:account:loadbalancer/app/name
AWS_REGION=eu-west-2
COGNITO_USER_POOL_ID=eu-west-2_xxxxxxxxx
COGNITO_USER_POOL_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Optional (Development)

```bash
NODE_ENV=development
DEV_USER_GROUPS=admin,reviewer
```

## Security Considerations

### Token Validation

- Uses AWS-provided `aws-jwt-verify` library for secure token validation
- Validates both ALB and Cognito tokens for complete authentication
- Ensures tokens are from the correct Cognito User Pool and client

### Group-based Access

- Implements principle of least privilege through group-based access
- Separates administrative and review functions
- Allows granular permission control through Cognito groups

### Development Security

- Authentication bypass only available in development environment
- Clear logging of authentication bypass events
- Configurable development user permissions

## Usage Examples

### Protecting Admin Routes

```javascript
const express = require('express');
const { verifyJwt, requireAdmin } = require('../services/cognitoService');

const router = express.Router();

// All admin routes require authentication and admin group membership
router.use(verifyJwt);
router.use(requireAdmin);

router.post('/banners', handleBannerUpdate);
router.post('/tech-radar/update', handleTechRadarUpdate);

module.exports = router;
```

### Protecting Review Routes

```javascript
const express = require('express');
const { verifyJwt, requireReviewer } = require('../services/cognitoService');

const router = express.Router();

// All review routes require authentication and reviewer group membership
router.use(verifyJwt);
router.use(requireReviewer);

router.post('/tech-radar/update', handleReviewerUpdate);

module.exports = router;
```

### User Information Endpoint

```javascript
const express = require('express');
const { getUserInfo } = require('../services/cognitoService');

const router = express.Router();

// Public endpoint that handles its own authentication
router.get('/info', getUserInfo);

module.exports = router;
```

## Troubleshooting

### Common Issues

1. **401 Unauthorised Errors**

   - Check ALB configuration and token headers
   - Verify Cognito User Pool and Client ID configuration
   - Ensure tokens are properly forwarded by ALB

1. **403 Forbidden Errors**

   - Verify user is assigned to correct Cognito groups
   - Check group names match service expectations
   - Confirm user has authenticated successfully

1. **Development Mode Issues**

   - Ensure `NODE_ENV=development` is set
   - Check `DEV_USER_GROUPS` environment variable
   - Verify development user creation

### Debugging

Enable detailed logging by setting log level to debug:

```bash
LOG_LEVEL=debug
```

This will provide detailed information about:

- Token verification attempts
- Group membership checks
- Authentication bypass events
- Error details and stack traces
