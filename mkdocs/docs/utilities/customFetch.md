# Custom Fetch Utility

The `customFetch` utility provides a wrapper around the native `fetch` API, adding enhanced error handling and toast notifications for a consistent user experience across the application.

## Core Functionality

The utility exports a primary function:

### customFetch

```javascript
const customFetch = async (url, options) => {
  // Implementation details
};
```

This function:

1.  Constructs the full API endpoint URL, prepending a backend URL if available.
2.  Executes the `fetch` request with the given URL and options.
3.  Checks for `response.ok` to determine if the request was successful.
4.  If the response is not OK, it attempts to parse error data from the response.
5.  Displays a custom `ErrorToast` notification with a descriptive error message.
6.  Re-throws the error to allow calling functions to handle it further if necessary.

## Implementation Details

The `customFetch` function ensures that all API calls made through it benefit from centralised error management and user feedback:

```javascript
import toast from 'react-hot-toast';
import ErrorToast from '../components/Toast/ErrorToast';

const customFetch = async (url, options) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL || '';
  const response = await fetch(backendUrl + url, options);

  if (!response.ok) {
    let errorData = { error: `HTTP error! status: ${response.status}` };
    try {
      errorData = await response;
    } catch (_) {
      // ignore parse errors, default error message will be used
    }

    const errorMessage = errorData.error || `Request failed with status ${response.status}`;

    toast.custom((t) => <ErrorToast t={t} error={errorMessage} />, {
      duration: 10000,
    });

    // Re-throw the error to be caught by the calling function if needed
    throw new Error(errorMessage);
  }

  return response;
};

export default customFetch;
```

## Example Usage in `getUser.js`

The `customFetch` utility is used throughout the application for making API requests. Below is an example from `frontend/src/utilities/getUser.js`, demonstrating its use for handling user logout:

```javascript
// ... existing code ...
    try {
      const response = await customFetch('/user/api/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ logout_uri: window.location.origin }),
      });
// ... existing code ...
```

In this example, `customFetch` is used to send a POST request to the `/user/api/logout` endpoint. Any network errors or non-OK HTTP responses will be automatically handled by `customFetch`, displaying a toast notification to the user and re-throwing the error for local handling if needed.
