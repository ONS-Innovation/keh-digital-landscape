# Tech Radar Data Utility

The Tech Radar Data utility provides functions for fetching Tech Radar information from the AWS S3 Bucket. It serves as a data provider for the DataContext, enabling the application to access and display technology categorisation and status information throughout the app.

## Core Functionality

The utility exports a primary function:

### fetchTechRadarJSONFromS3

```javascript
export const fetchTechRadarJSONFromS3 = async () => {
  // Implementation details
}
```

This function:

1. Fetches Tech Radar data from the API endpoint
2. Handles environment-specific URLs (development vs production)
3. Implements error handling with user feedback
4. Returns structured Tech Radar data for consumption by the DataContext

## Implementation Details

The function follows a straightforward request pattern:

1. **Environment-Specific URL**: Determines the correct API endpoint

      - Uses `localhost:5001/api/tech-radar/json` in development
      - Uses `/api/tech-radar/json` in production

2. **Request Execution**: Fetches data from the determined endpoint

      - Validates response status
      - Returns `null` for unsuccessful responses

3. **Response Parsing**: Converts the JSON response to a JavaScript object

4. **Error Handling**: Manages request failures

      - Catches and logs network errors
      - Displays error toast notification
      - Returns `null` to indicate failure

## Integration with DataContext

The DataContext uses this utility to:

1. Fetch Tech Radar data on initial application load
2. Refresh Tech Radar data when requested by the user
3. Cache the returned data to minimize redundant API calls

Example usage within DataContext:

```javascript
const getTechRadarData = useCallback(async (forceRefresh = false) => {
  // Check cache first unless forceRefresh is true
  if (techRadarData && !forceRefresh) {
    return techRadarData;
  }

  // Check for pending request
  if (pendingRequests.techRadar) {
    return pendingRequests.techRadar;
  }

  // Create new request
  const request = fetchTechRadarJSONFromS3();
  pendingRequests.techRadar = request;

  try {
    const data = await request;
    setTechRadarData(data);
    return data;
  } finally {
    pendingRequests.techRadar = null;
  }
}, [techRadarData, pendingRequests]);
```

## Error Handling

The utility implements error handling:

- Catches and logs network errors
- Provides user feedback via toast notifications
- Returns `null` when data is unavailable


## Usage in Components

The Tech Radar data is used throughout the application to:

1. Build the radar visualisation
2. Display technology status in the Statistics view
3. Highlight technologies in project listings
4. Provide filtering options based on technology status
5. Show historical movement of technologies between rings
