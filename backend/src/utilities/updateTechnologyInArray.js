/**
 * Helper function to update technology names in arrays
 * @param {string[]} array - Array of technology names
 * @param {string} from - Original technology name
 * @param {string} to - New technology name
 * @returns {Object} Object with updated array and boolean indicating if an update occurred
 */
function updateTechnologyInArray(array, from, to) {
  if (!array) return { array, updated: false };

  const index = array.indexOf(from);
  if (index !== -1) {
    const updatedArray = [...array];
    updatedArray[index] = to;
    return { array: updatedArray, updated: true };
  }
  return { array, updated: false };
}

module.exports = {
  updateTechnologyInArray,
};
