# Project Data Utility

The Project Data utility provides functions for fetching project data from the AWS S3 Bucket. It serves as a data provider for the DataContext, enabling the application to access and display project information throughout the app.

## Core Functionality

The utility exports a primary function:

### fetchCSVFromS3

```javascript
export const fetchCSVFromS3 = async () => {
  // Implementation details
}
```

This function:

1. Attempts to fetch project data from the API endpoint
2. Handles environment-specific URLs (development vs production)
3. Implements error handling with fallback to local CSV data
4. Returns structured project data for consumption by the DataContext

## Implementation Details

The function follows a robust error-handling pattern:

1. **Primary Request**: Attempts to fetch data from the API endpoint

      - Uses `localhost:5001/api/csv` in development
      - Uses `/api/csv` in production

2. **Fallback Mechanism**: If the primary request fails, attempts to load local CSV data

      - Parses the CSV text into a structured object
      - Displays an error toast notification to inform the user

3. **Final Error Handling**: If both primary and fallback requests fail

      - Returns `null` to indicate failure
      - Displays an error toast notification

## Integration with DataContext

The DataContext uses this utility to:

1. Fetch project data on initial application load
2. Refresh project data when requested by the user
3. Cache the returned data to minimize redundant API calls

Example usage within DataContext:

```javascript
const getCsvData = useCallback(async (forceRefresh = false) => {
  // Check cache first unless forceRefresh is true
  if (csvData && !forceRefresh) {
    return csvData;
  }

  // Check for pending request
  if (pendingRequests.csv) {
    return pendingRequests.csv;
  }

  // Create new request
  const request = fetchCSVFromS3();
  pendingRequests.csv = request;

  try {
    const data = await request;
    setCsvData(data);
    return data;
  } finally {
    pendingRequests.csv = null;
  }
}, [csvData, pendingRequests]);
```

## Error Handling

The utility implements comprehensive error handling:

- Catches and logs network errors
- Provides user feedback via toast notifications
- Attempts to load fallback data when primary sources fail
- Returns `null` when all data sources are unavailable
