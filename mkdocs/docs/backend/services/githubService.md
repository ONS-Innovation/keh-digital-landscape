# GitHub Service

The GitHub Service provides centralised functionality for interacting with the GitHub API, specifically for retrieving GitHub Copilot metrics and seat information. It handles authentication through the GitHub App integration and provides automatic pagination for large data sets.

## Overview

The service specialises in GitHub Copilot data retrieval:
- Organisation-level Copilot metrics
- Seat information and assignment data
- Automatic pagination handling
- Integration with GitHub App authentication

## Dependencies

The service relies on:
- GitHub App authentication (via `getAppAndInstallation` utility)
- Application logging system
- Environment variables for organisation configuration

## Methods

### `getCopilotMetrics()`

Retrieves comprehensive GitHub Copilot metrics for the organisation.

**Returns:** Promise resolving to Copilot metrics object

**Response Structure:**
```javascript
{
  seat_breakdown: {
    total: number,
    added_this_cycle: number,
    pending_cancellation: number,
    pending_invitation: number,
    active_this_cycle: number,
    inactive_this_cycle: number
  },
  seat_management_setting: string,
  public_code_suggestions: string,
  ide_chat: string,
  platform_chat: string,
  cli: string,
  platform_ide: string
}
```

**Example:**
```javascript
const githubService = require('./githubService');

try {
  const metrics = await githubService.getCopilotMetrics();
  console.log(`Total Copilot seats: ${metrics.seat_breakdown.total}`);
} catch (error) {
  console.error('Failed to retrieve Copilot metrics:', error);
}
```

### `getCopilotSeats()`

Retrieves detailed information about all GitHub Copilot seats in the organisation.

**Returns:** Promise resolving to array of seat objects

**Response Structure:**
```javascript
[
  {
    created_at: string,
    updated_at: string,
    pending_cancellation_date: string | null,
    last_activity_at: string,
    last_activity_editor: string,
    assignee: {
      login: string,
      id: number,
      avatar_url: string,
      // ... other user properties
    }
  }
  // ... more seats
]
```

**Features:**
- Automatic pagination handling for large organisations
- Complete seat information including activity data
- User assignee details

**Example:**
```javascript
const seats = await githubService.getCopilotSeats();
console.log(`Retrieved ${seats.length} Copilot seats`);

// Find recently active seats
const recentlyActive = seats.filter(seat => 
  new Date(seat.last_activity_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
);
console.log(`${recentlyActive.length} seats active in the last 7 days`);
```

## Authentication

The service uses GitHub App authentication:

1. Retrieves GitHub App credentials from AWS Secrets Manager
2. Authenticates using the App ID and private key
3. Gets installation access for the configured organisation
4. Uses installation-scoped Octokit instance for API calls

## Pagination Handling

The `getCopilotSeats()` method automatically handles pagination:

- Starts with the first page of results
- Continues fetching until all pages are retrieved
- Combines results into a single array
- Logs progress for monitoring

```javascript
// Automatic pagination example
let allSeats = [];
let page = 1;

while (true) {
  const response = await octokit.request(
    `GET /orgs/${GITHUB_ORG}/copilot/billing/seats`,
    { per_page: 100, page }
  );
  
  if (response.data.seats.length === 0) break;
  
  allSeats = allSeats.concat(response.data.seats);
  page++;
}
```

## Error Handling

The service implements robust error handling:

- Logs authentication failures
- Handles GitHub API rate limiting
- Provides descriptive error messages
- Graceful degradation for failed requests

## Environment Configuration

Required environment variables:

- `GITHUB_ORG` - Target GitHub organisation name
- `GITHUB_APP_ID` - GitHub App ID for authentication
- `AWS_SECRET_NAME` - AWS Secrets Manager secret containing private key
- `AWS_REGION` - AWS region for Secrets Manager

## Usage Examples

### Retrieve Current Metrics
```javascript
const githubService = require('../services/githubService');

async function getCopilotSummary() {
  try {
    const metrics = await githubService.getCopilotMetrics();
    const seats = await githubService.getCopilotSeats();
    
    return {
      totalSeats: metrics.seat_breakdown.total,
      activeSeats: metrics.seat_breakdown.active_this_cycle,
      seatDetails: seats.length,
      lastUpdate: new Date().toISOString()
    };
  } catch (error) {
    console.error('Failed to get Copilot summary:', error);
    throw error;
  }
}
```

### Monitor Seat Activity
```javascript
async function getInactiveSeats(daysThreshold = 30) {
  const seats = await githubService.getCopilotSeats();
  const cutoffDate = new Date(Date.now() - daysThreshold * 24 * 60 * 60 * 1000);
  
  return seats.filter(seat => 
    new Date(seat.last_activity_at) < cutoffDate
  ).map(seat => ({
    user: seat.assignee.login,
    lastActivity: seat.last_activity_at,
    daysSinceActivity: Math.floor(
      (Date.now() - new Date(seat.last_activity_at)) / (1000 * 60 * 60 * 24)
    )
  }));
}
```

## Implementation Notes

- Uses authenticated GitHub App for enhanced rate limits
- Implements automatic pagination for scalability
- Provides comprehensive error logging
- Designed for organisation-level Copilot management
- Supports monitoring and analytics use cases 