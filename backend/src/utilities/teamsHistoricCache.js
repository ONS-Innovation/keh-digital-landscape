const s3Service = require('../services/s3Service');
const logger = require('../config/logger');

// Cache the FULL teams_history.json data
let teamsHistoricDataCache = null;
let teamsHistoricDataCacheTimestamp = null;
const TEAMS_CACHE_TTL = 60 * 60 * 1000; // 1 hour

/**
 * Get the full teams_history.json data from S3 with caching
 * @param {string} bucketName - The S3 bucket name
 * @returns {Promise<Array>} Full teams historic data array
 */
async function getTeamsHistoricDataWithCache(bucketName) {
  const now = Date.now();

  if (teamsHistoricDataCache && teamsHistoricDataCacheTimestamp) {
    if (now - teamsHistoricDataCacheTimestamp < TEAMS_CACHE_TTL) {
      logger.info('Returning teams historic data from cache');
      return teamsHistoricDataCache;
    } else {
      logger.info('Cache expired, fetching teams historic data from S3');
    }
  } else {
    logger.info('No cache found, fetching teams historic data from S3');
  }

  // Fetch and cache the full data
  teamsHistoricDataCache = await s3Service.getObject(
    bucketName,
    'teams_history.json'
  );
  teamsHistoricDataCacheTimestamp = now;
  logger.info('Cached ${teamsHistoricDataCache.length} teams');

  return teamsHistoricDataCache;
}

module.exports = {
  getTeamsHistoricDataWithCache,
};
