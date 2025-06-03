/**
 * Formats a number with commas as thousands separators
 *
 * @param {number} number - The number to format
 * @returns {string} The formatted number as a string with commas
 */
export const formatNumberWithCommas = (number) => {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}