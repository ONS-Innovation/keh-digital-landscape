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
    const no_activity = new Date('1770-07-01 13:30');
    return no_activity.toLocaleString('en-GB', options).replace(',', '');
  }
  const date = new Date(isoString);

  return date.toLocaleString('en-GB', options).replace(',', '');
};
