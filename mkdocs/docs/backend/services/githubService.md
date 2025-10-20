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

### `getCopilotOrgMetrics()`

Retrieves comprehensive GitHub Copilot metrics for the organisation.

**Returns:** Promise resolving to Copilot metrics object

**GitHub API Response:**

More information on the response structure can be found [here](https://docs.github.com/en/rest/copilot/copilot-metrics?apiVersion=2022-11-28#get-copilot-metrics-for-an-organization).

**Example:**
```javascript
const githubService = require('./githubService');

try {
  const metrics = await githubService.getCopilotOrgMetrics();
  console.log(`Total Copilot seats: ${metrics.seat_breakdown.total}`);
} catch (error) {
  console.error('Failed to retrieve Copilot metrics:', error);
}
```

### `getCopilotTeamMetrics(teamSlug)`
Retrieves GitHub Copilot metrics for a team in the organisation.

**Returns:** Promise resolving to Copilot metrics object

**GitHub API Response:**

More information on the response structure can be found [here](https://docs.github.com/en/rest/copilot/copilot-metrics?apiVersion=2022-11-28#get-copilot-metrics-for-a-team).

**Example:**
```javascript
const githubService = require('./githubService');
const teamSlug = req.query.teamSlug;

try {
  const metrics = await githubService.getCopilotTeamMetrics(teamSlug);
  console.log(`Total Copilot seats for team: ${metrics.seat_breakdown.total}`);
} catch (error) {
  console.error('Failed to retrieve Copilot metrics for team:', error);
}
```

### `getTeamMembers(teamSlug)`
Retrieves members of a specific team.

**Returns:** Promise resolving to an array of team members with login, name, and url

**GitHub API Response:**

More information on the response structure can be found [here](https://docs.github.com/en/rest/teams/members?apiVersion=2022-11-28#list-team-members).

**Example:**
```javascript
const githubService = require('./githubService');
const teamSlug = req.query.teamSlug;

try {
  const members = await githubService.getTeamMembers(teamSlug);
  console.log(`Team members of ${teamSlug}: ${members}`);
} catch (error) {
  console.error('Failed to retrieve team members:', error);
}
```

### `getUserTeams(userToken)`
Retrieves teams the authenticated user is a member of in the organisation.

**Returns:** Promise resolving to an array of teams

**GitHub API Response:**

More information on the response structure can be found [here](https://docs.github.com/en/rest/teams/teams?apiVersion=2022-11-28#list-teams-for-the-authenticated-user).

**Example:**
```javascript
const githubService = require('./githubService');

try {
  const userTeams = await githubService.getUserTeams(userToken);
  console.log(`User teams: ${userTeams}`);
} catch (error) {
  console.error('Failed to retrieve user teams:', error);
}
```

### `getCopilotSeats()`

Retrieves detailed information about all GitHub Copilot seats in the organisation.

**Returns:** Promise resolving to array of seat objects

**GitHub API Response:**

More information on the response structure can be found [here](https://docs.github.com/en/rest/copilot/copilot-user-management?apiVersion=2022-11-28#list-all-copilot-seat-assignments-for-an-organization).

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
    const metrics = await githubService.getCopilotOrgMetrics();
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