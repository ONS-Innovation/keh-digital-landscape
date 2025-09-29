import toast from 'react-hot-toast';
import ErrorToast from '../components/Toast/ErrorToast';

const customFetch = async (url, options) => {
  const response = await fetch(url, options);

  if (!response.ok) {
    let errorData = { error: `HTTP error! status: ${response.status}` };
    try {
      errorData = await response.json();
    } catch (_) {
      // ignore parse errors, default error message will be used
    }

    const errorMessage =
      errorData.error || `Request failed with status ${response.status}`;

    toast.custom(t => <ErrorToast t={t} error={errorMessage} />, {
      duration: 6000,
    });

    // Re-throw the error to be caught by the calling function if needed
    throw new Error(errorMessage);
  }

  return response;
};

export default customFetch;
