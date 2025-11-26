const s3Service = require('./s3Service');
const logger = require('../config/logger');
const { formatIntoCSV } = require('../utilities/seatDataToCSV');

/**
 * Format and Upload Copilot Seat data to S3
 * @param {Array} data - The unformatted seat data
 * @param {Boolean} isEngaged - Whether the seat data are engaged or unengaged
 */
async function seatDataUpload(data, isEngaged) {
  if (!Array.isArray(data) || data.length === 0) {
    logger.error('Seat Data is empty.');
    throw new Error('Seat data is empty.');
  }

  // Convert the data to a CSV string (including header row)
  const csvString = formatIntoCSV(data);

  if (!csvString) {
    logger.error('CSV formatting resulted in empty string.');
    throw new Error('CSV formatting failed.');
  }

  // Choose filename dependant on if it is the engaged users or not
  const fileName = isEngaged ? 'EngagedSeatData.csv' : 'UnengagedSeatData.csv';

  // Put the object on S3
  await s3Service.putCSVObject('main', fileName, csvString);

  return { fileName };
}

module.exports = { seatDataUpload };
