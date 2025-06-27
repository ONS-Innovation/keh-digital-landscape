# Backend Documentation

The Digital Landscape backend is built with Node.js and Express, providing a RESTful API to serve data for the frontend application. The backend follows a modular architecture with separate concerns for routing, services, utilities, and configuration.

## Architecture Overview

The backend is organised into the following key directories:

- **`routes/`** - HTTP endpoint definitions grouped by functionality
- **`services/`** - Business logic and external service integrations
- **`utilities/`** - Helper functions and data transformers
- **`config/`** - Application configuration including logging

## Authentication & Authorisation

The backend uses AWS Cognito for authentication and role-based access control through the `aws-jwt-verify` library. The system utilises a single Cognito User Pool with group-based permissions.

### Cognito Service (`services/cognitoService.js`)

The authentication system provides:

- **JWT Token Verification** - Validates ALB and Cognito access tokens
- **Role-based Middleware** - Enforces access control based on user groups
- **Development Mode** - Bypasses authentication for local development
- **User Information Extraction** - Retrieves user email and group memberships

#### User Groups & Permissions

Users are assigned to groups in Cognito that determine their access levels:

- **`admin`** - Full administrative access to all backend endpoints
- **`reviewer`** - Access to review functionality and technology radar updates  
- **Combined roles** - Users can belong to multiple groups for expanded permissions

#### Authentication Middleware

The service provides three main middleware functions:

- **`verifyJwt`** - Base authentication middleware for all protected routes
- **`requireAdmin`** - Restricts access to admin-only endpoints
- **`requireReviewer`** - Restricts access to reviewer-only endpoints

#### Development Mode

In development environments (`NODE_ENV=development`), authentication is bypassed and a default developer user is provided with both admin and reviewer permissions.

### Frontend Integration

The authentication system integrates seamlessly with the frontend:

- **User Profile Display** - Shows user email, roles, and appropriate icons in the sidebar and dropdown menu
- **Role-based UI** - Displays restricted sections based on user permissions
- **Author Attribution** - When reviewers add descriptions during technology moves, their email is automatically captured as the author
- **Logout Functionality** - Handles secure logout through Cognito endpoints

## Main Application (`index.js`)

The main application file sets up:

- Express server with CORS configuration
- Route mounting for different API endpoints
- Error handling for uncaught exceptions and rejections
- Application logging

### Route Mounting

The application mounts four main route groups:

```javascript
app.use('/api', default);           // Default API routes that points to /routes/default.js
app.use('/admin/api', admin);       // Admin functionality that points to /routes/admin.js
app.use('/review/api', review);     // Review functionality that points to /routes/review.js
app.use('/copilot/api', copilot);   // GitHub Copilot metrics that points to /routes/copilot.js
app.use('/user/api', userRoutes);   // User authentication endpoints
```

## Route Modules

### User Routes (`/user/api`)
Located in `routes/userRoutes.js`, these provide authentication functionality:

- **GET `/info`** - Retrieve authenticated user information including email and groups
- **POST `/logout`** - Handle user logout and return Cognito logout URL

### Default Routes (`/api`)
Located in `routes/default.js`, these provide core application functionality:

- **GET `/csv`** - Retrieve project data in CSV format
- **GET `/json`** - Retrieve project data in JSON format
- **GET `/tech-radar/json`** - Fetch technology radar data
- **GET `/repository/project/json`** - Get repository statistics
- **GET `/banners`** - Retrieve active banner messages
- **GET `/banners/all`** - Retrieve all banner messages (includes inactive banners)
- **GET `/health`** - Health check endpoint

### Admin Routes (`/admin/api`)
Located in `routes/admin.js`, these provide administrative functionality requiring admin group membership:

- **POST `/banners`** - Update the banner messages in S3 from admin
- **POST `/banners/update`** - Update banner message
- **POST `/banners/toggle`** - Toggle the visibility of a banner message
- **POST `/banners/delete`** - Delete a banner message
- **GET `/array-data`** - Get array data from the Tech Audit Tool bucket
- **POST `/array-data/update`** - Update the array data in the Tech Audit Tool bucket
- **GET `/tech-radar`** - Get the tech radar JSON from S3
- **POST `/tech-radar/update`** - Update the tech radar JSON in S3 from admin
- **POST `/normalise/technology`** - Normalise the technology names across projects in S3 from admin

### Review Routes (`/review/api`)
Located in `routes/review.js`, these provide review functionality requiring reviewer group membership:

- **POST `/tech-radar/update`** - Update the tech radar JSON in S3 with reviewer attribution

### Copilot Routes (`/copilot/api`)
Located in `routes/copilot.js`, these provide GitHub Copilot metrics:

- **GET `/org/live`** - Get Copilot organisation live usage data
- **GET `/org/historic`** - Get Copilot organisation historic usage data
- **GET `/seats`** - Get Copilot seat information
- **GET `/team/live`** - Get Copilot live usage data for a specific team in the organisation
- **GET `/teams`** - Get all teams the user is a member of in the organisation
- **GET `/team/seats`** - Get Copilot seat information filtered by a specific team in the organisation
- **POST `/github/oauth/token`** - Exchange GitHub OAuth code for access token
- **GET `/github/oauth/login`** - Redirect to GitHub OAuth login

## Services

The backend uses centralised services to handle external integrations and business logic:

### Cognito Service (`services/cognitoService.js`)
Manages AWS Cognito authentication and authorisation:

- JWT token verification using `aws-jwt-verify`
- Role-based access control middleware
- User information extraction from tokens
- Development mode authentication bypass
- Secure logout handling

### S3 Service (`services/s3Service.js`)
Manages all Amazon S3 operations:

- Singleton pattern for consistent S3 client instances
- Supports multiple buckets (main, TAT, Copilot)
- Methods: `getObject()`, `putObject()`, `getObjectViaSignedUrl()`
- Centralised error handling and logging

### GitHub Service (`services/githubService.js`)
Handles GitHub API interactions:

- Copilot metrics retrieval with automatic pagination
- Seat information management
- Integration with GitHub App authentication

### Tech Radar Service (`services/techRadarService.js`)
Manages technology radar operations:

- Data retrieval and parsing
- Entry updates with validation and author attribution
- Consistent error handling

## Utilities

Helper functions and data transformation utilities:

### GitHub App Authentication (`utilities/getAppAndInstallation.js`)
- Handles GitHub App authentication using AWS Secrets Manager
- Returns authenticated Octokit instance for API calls

### Project Data Transformer (`utilities/projectDataTransformer.js`)
- Transforms project objects from raw JSON to CSV format
- Handles user role extraction and contact information
- Formats technology arrays and metadata

### Technology Array Updater (`utilities/updateTechnologyInArray.js`)
- Helper function for updating technology names in arrays
- Used in technology normalisation processes

## Configuration

### Logger (`config/logger.js`)
Provides centralised logging using Winston:

- Console logging with colour formatting
- Optional CloudWatch integration for AWS environments
- Structured JSON logging format
- Environment-specific log levels

### Environment Variables

Key environment variables used by the backend:

#### Server Configuration
- `PORT` - Server port (default: 5001)
- `LOG_LEVEL` - Logging level (default: info)
- `NODE_ENV` - Environment mode (development/production)

#### AWS Configuration  
- `AWS_REGION` - AWS region for services
- `ALB_ARN` - Application Load Balancer ARN for JWT verification
- `AWS_SECRET_NAME` - AWS Secrets Manager secret name

#### Cognito Configuration
- `COGNITO_USER_POOL_ID` - Cognito User Pool ID
- `COGNITO_USER_POOL_CLIENT_ID` - Cognito User Pool Client ID

#### Development Configuration
- `DEV_USER_GROUPS` - Comma-separated list of groups for development user

#### GitHub Configuration
- `GITHUB_ORG` - GitHub organisation name
- `GITHUB_APP_ID` - GitHub App ID

#### Logging Configuration
- `CLOUDWATCH_GROUP_NAME` - CloudWatch log group

## Error Handling

The application implements comprehensive error handling:

- Global uncaught exception handling
- Unhandled promise rejection handling
- Service-level error logging with authentication context
- Consistent error response formats
- 401 Unauthorised responses for authentication failures
- 403 Forbidden responses for insufficient permissions

## Development Considerations

- All services use singleton patterns to optimise resource usage
- Modular architecture allows for easy testing and maintenance
- Centralised configuration management
- Consistent logging patterns across all modules
- Environment-specific behaviour through configuration
- Role-based access control ensures security at the API level
- Author attribution tracks reviewer actions for audit purposes
- Frontend-backend integration provides seamless user experience
