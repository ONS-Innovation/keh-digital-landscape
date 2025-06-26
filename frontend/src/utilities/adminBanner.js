/**
 * Gets the base URL for banner API calls based on environment
 */
const getBannerApiUrl = endpoint => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL || '';
  return `${backendUrl}${endpoint}`;
};

/**
 * Fetches existing banners from the backend
 */
export const fetchExistingBanners = async () => {
  try {
    const response = await fetch(getBannerApiUrl('/admin/api/banners'));

    if (!response.ok) {
      throw new Error('Failed to fetch banners');
    }

    const data = await response.json();
    return data.messages || [];
  } catch (error) {
    console.error('Error fetching existing banners:', error);
    throw error;
  }
};

/**
 * Saves a new banner to the backend
 */
export const saveBanner = async banner => {
  const response = await fetch(getBannerApiUrl('/admin/api/banners/update'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ banner }),
  });

  if (!response.ok) {
    let errorData = {};
    try {
      errorData = await response.json();
    } catch (_) {
      // ignore parse errors
    }
    throw new Error(errorData.error || 'Failed to save banner');
  }
};

/**
 * Toggles a banner's visibility
 */
export const toggleBanner = async (index, shouldShow) => {
  const response = await fetch(getBannerApiUrl('/admin/api/banners/toggle'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      index,
      show: shouldShow,
    }),
  });

  if (!response.ok) {
    let errorData = {};
    try {
      errorData = await response.json();
    } catch (_) {
      // ignore parse errors
    }
    throw new Error(errorData.error || 'Failed to toggle banner visibility');
  }
};

/**
 * Deletes a banner
 */
export const deleteBanner = async index => {
  const response = await fetch(getBannerApiUrl('/admin/api/banners/delete'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ index }),
  });

  if (!response.ok) {
    let errorData = {};
    try {
      errorData = await response.json();
    } catch (_) {
      // ignore parse errors
    }
    throw new Error(errorData.error || 'Failed to delete banner');
  }
};
