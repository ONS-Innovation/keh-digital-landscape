# Repository Data Utility

The Repository Data utility provides functions for fetching detailed repository information from the AWS S3 Bucket. It serves as a data provider for the DataContext, enabling the application to access and display repository-specific information with filtering capabilities.

## Core Functionality

The utility exports a primary function:

### fetchRepositoryData

```javascript
export const fetchRepositoryData = async (
  repositories,
  date = null,
  archived = null
) => {
  // Implementation details
}
```

This function:

1. Fetches detailed data for specific repositories
2. Supports filtering by date and archived status
3. Handles environment-specific URLs (development vs production)
4. Implements error handling with user feedback

## Parameters

The function accepts the following parameters:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `repositories` | string[] | Required | Array of repository names to fetch data for |
| `date` | string | `null` | ISO date string to filter repositories by last commit date |
| `archived` | string | `null` | 'true'/'false' to filter archived repositories |

## Implementation Details

The function follows a structured request pattern:

1. **Parameter Validation**: Checks if repositories array is valid

    - Returns `null` if repositories array is empty or undefined

2. **URL Parameter Construction**: Builds query parameters

    - Converts repository array to comma-separated string
    - Adds optional date and archived parameters when provided

3. **Environment-Specific URL**: Determines the correct API endpoint

    - Uses `localhost:5001/api/repository/project/json` in development
    - Uses `/api/repository/project/json` in production

4. **Request Execution**: Fetches data with constructed URL and parameters

    - Validates response status
    - Parses JSON response

5. **Error Handling**: Manages request failures

    - Displays error toast notification
    - Returns `null` to indicate failure

## Integration with DataContext

The DataContext uses this utility to:

1. Fetch repository data when needed for specific views
2. Apply filtering based on user selections (date ranges, archived status)
3. Cache the returned data to minimize redundant API calls

Example usage within DataContext:

```javascript
const getRepositoryData = useCallback(
  async (repositories, date = null, archived = null, forceRefresh = false) => {
    // Create cache key based on parameters
    const cacheKey = `${repositories.join(",")}:${date || ""}:${
      archived || ""
    }`;

    // Check cache first unless forceRefresh is true
    if (repositoryData.has(cacheKey) && !forceRefresh) {
      return repositoryData.get(cacheKey);
    }

    // Check for pending request
    if (pendingRequests.repository?.[cacheKey]) {
      return pendingRequests.repository[cacheKey];
    }

    // Initialize repository requests object if needed
    if (!pendingRequests.repository) {
      pendingRequests.repository = {};
    }

    // Create new request
    const request = fetchRepositoryData(repositories, date, archived);
    pendingRequests.repository[cacheKey] = request;

    try {
      const data = await request;
      // Update cache with new data
      setRepositoryData(new Map(repositoryData.set(cacheKey, data)));
      return data;
    } finally {
      // Clean up pending request
      pendingRequests.repository[cacheKey] = null;
    }
  },
  [repositoryData, pendingRequests]
);
```

## Error Handling

The utility implements error handling:

- Catches and logs network errors
- Provides user feedback via toast notifications
- Returns `null` when data is unavailable
