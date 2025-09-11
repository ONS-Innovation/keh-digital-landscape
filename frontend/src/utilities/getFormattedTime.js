export const getFormattedTime = isoString => {
  const options = {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  };

  if (!isoString) {
    const no_activity = new Date('1900-01-01 00:00');
    return no_activity.toLocaleString('en-GB', options).replace(',', '');
  }
  const date = new Date(isoString);

  return date.toLocaleString('en-GB', options).replace(',', '');
};
