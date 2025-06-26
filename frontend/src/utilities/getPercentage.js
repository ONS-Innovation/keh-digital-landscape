/**
 * Take decimal and return it in percentage format
 *
 * @param {double} value - Decimal number
 * @returns {string} - The number as a percentage
 */
export const getPercentage = value => {
  if (value === 0) return '0%';
  return `${(value * 100).toFixed(2)}%`;
};
