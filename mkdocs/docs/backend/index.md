# Backend Documentation

The Digital Landscape backend is built with Node.js and Express, providing a RESTful API to serve data for the frontend application. The backend follows a modular architecture with separate concerns for routing, services, utilities, and configuration.

## Architecture Overview

The backend is organised into the following key directories:

- **`routes/`** - HTTP endpoint definitions grouped by functionality
- **`services/`** - Business logic and external service integrations
- **`utilities/`** - Helper functions and data transformers
- **`config/`** - Application configuration including logging

## Main Application (`index.js`)

The main application file sets up:

- Express server with CORS configuration
- Route mounting for different API endpoints
- Error handling for uncaught exceptions and rejections
- Application logging

### Route Mounting

The application mounts four main route groups:

```javascript
app.use('/api', apiRoutes);           // Default API routes
app.use('/admin/api', adminRoutes);   // Admin functionality
app.use('/review/api', reviewRoutes); // Review functionality  
app.use('/copilot/api', copilotRoutes); // GitHub Copilot metrics
```

## Route Modules

### Default Routes (`/api`)
Located in `routes/default.js`, these provide core application functionality:

- **GET `/csv-data`** - Retrieve project data in CSV format
- **GET `/json-data`** - Retrieve project data in JSON format
- **GET `/tech-radar-data`** - Fetch technology radar data
- **GET `/repo-stats`** - Get repository statistics
- **GET `/banners`** - Retrieve application banners
- **GET `/health`** - Health check endpoint

### Admin Routes (`/admin/api`)
Located in `routes/admin.js`, these provide administrative functionality:

- **POST `/update-tech-radar`** - Update technology radar entries
- **POST `/banner-management`** - Manage application banners
- **POST `/update-array-data`** - Update technology arrays
- **POST `/normalise-technology`** - Normalise technology names across projects

### Review Routes (`/review/api`)
Located in `routes/review.js`, these provide review functionality:

- **POST `/update-tech-radar`** - Update technology radar (review role)

### Copilot Routes (`/copilot/api`)
Located in `routes/copilot.js`, these provide GitHub Copilot metrics:

- **GET `/metrics`** - Get Copilot organisation metrics
- **GET `/historic-data`** - Get historic Copilot data
- **GET `/seat-info`** - Get Copilot seat information

## Services

The backend uses centralised services to handle external integrations and business logic:

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
- Entry updates with validation
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

- `PORT` - Server port (default: 5001)
- `LOG_LEVEL` - Logging level (default: info)
- `AWS_REGION` - AWS region for services
- `GITHUB_ORG` - GitHub organisation name
- `GITHUB_APP_ID` - GitHub App ID
- `AWS_SECRET_NAME` - AWS Secrets Manager secret name
- `CLOUDWATCH_GROUP_NAME` - CloudWatch log group

## Error Handling

The application implements comprehensive error handling:

- Global uncaught exception handling
- Unhandled promise rejection handling
- Service-level error logging
- Consistent error response formats

## Development Considerations

- All services use singleton patterns to optimise resource usage
- Modular architecture allows for easy testing and maintenance
- Centralised configuration management
- Consistent logging patterns across all modules
- Environment-specific behaviour through configuration
