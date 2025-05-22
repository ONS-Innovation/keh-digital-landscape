export const getFormattedTime = (isoString) => {
    if(!isoString) {
      return "No Activity";
    }
    const date = new Date(isoString);
  
    const options = {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    };
  
    return date.toLocaleString('en-GB', options).replace(',', '');
  };