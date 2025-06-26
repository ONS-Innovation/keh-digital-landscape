const express = require('express');
const s3Service = require('../services/s3Service');
const logger = require('../config/logger');
const {
  transformProjectToCSVFormat,
} = require('../utilities/projectDataTransformer');
const { healthCheckLimiter } = require('../config/rateLimiter');

const router = express.Router();

/**
 * Endpoint for fetching project data and converting it to CSV format.
 * @route GET /api/csv
 * @returns {Object[]} Array of objects containing parsed project data in CSV format
 * @throws {Error} 500 - If data fetching or processing fails
 */
router.get('/csv', async (req, res) => {
  try {
    const jsonData = await s3Service.getObjectViaSignedUrl(
      'tat',
      'new_project_data.json'
    );

    // Transform JSON data to CSV format using the utility function
    const transformedData = jsonData.projects.map(transformProjectToCSVFormat);

    res.json(transformedData);
  } catch (error) {
    logger.error('Error fetching and transforming project data:', {
      error: error.message,
    });
    res.status(500).json({ error: error.message });
  }
});

/**
 * Endpoint for fetching tech radar JSON data from S3. The tech data that goes on the radar and states where it belongs on the radar.
 * @route GET /api/tech-radar/json
 * @returns {Object} The tech radar configuration data
 * @throws {Error} 500 - If JSON fetching fails
 */
router.get('/tech-radar/json', async (req, res) => {
  try {
    const jsonData = await s3Service.getObjectViaSignedUrl(
      'main',
      'onsRadarSkeleton.json'
    );
    res.json(jsonData);
  } catch (error) {
    logger.error('Error fetching JSON:', { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

/**
 * Endpoint for fetching repository statistics.
 * @route GET /api/json
 * @param {string} [datetime] - Optional ISO date string to filter repositories by last commit date
 * @param {string} [archived] - Optional 'true'/'false' to filter archived repositories
 * @returns {Object} Repository statistics
 * @returns {Object} response.stats - General repository statistics (total, private, public, internal counts)
 * @returns {Object} response.language_statistics - Language usage statistics across repositories
 * @returns {Object} response.metadata - Last updated timestamp and filter information
 * @throws {Error} 500 - If JSON fetching fails
 */
router.get('/json', async (req, res) => {
  try {
    const { datetime, archived } = req.query;
    const jsonData = await s3Service.getObjectViaSignedUrl(
      'main',
      'repositories.json'
    );

    // First filter by date if provided
    let filteredRepos = jsonData.repositories;

    if (datetime && !isNaN(Date.parse(datetime))) {
      const targetDate = new Date(datetime);
      const now = new Date();
      filteredRepos = jsonData.repositories.filter(repo => {
        const lastCommitDate = new Date(repo.last_commit);
        return lastCommitDate >= targetDate && lastCommitDate <= now;
      });
    }

    // Then filter by archived status if specified
    if (archived === 'true') {
      filteredRepos = filteredRepos.filter(repo => repo.is_archived);
    } else if (archived === 'false') {
      filteredRepos = filteredRepos.filter(repo => !repo.is_archived);
    }
    // If archived is not specified, use all repos (for total view)

    // Calculate statistics
    const stats = {
      total_repos: filteredRepos.length,
      total_private_repos: filteredRepos.filter(
        repo => repo.visibility === 'PRIVATE'
      ).length,
      total_public_repos: filteredRepos.filter(
        repo => repo.visibility === 'PUBLIC'
      ).length,
      total_internal_repos: filteredRepos.filter(
        repo => repo.visibility === 'INTERNAL'
      ).length,
    };

    // Calculate language statistics
    const languageStats = {};
    filteredRepos.forEach(repo => {
      if (!repo.technologies?.languages) return;

      repo.technologies.languages.forEach(lang => {
        if (!languageStats[lang.name]) {
          languageStats[lang.name] = {
            repo_count: 0,
            total_percentage: 0,
            total_size: 0,
          };
        }
        languageStats[lang.name].repo_count++;
        languageStats[lang.name].total_percentage += lang.percentage;
        languageStats[lang.name].total_size += lang.size;
      });
    });

    // Calculate averages
    Object.keys(languageStats).forEach(lang => {
      languageStats[lang] = {
        repo_count: languageStats[lang].repo_count,
        average_percentage: +(
          languageStats[lang].total_percentage / languageStats[lang].repo_count
        ).toFixed(3),
        total_size: languageStats[lang].total_size,
      };
    });

    res.json({
      stats,
      language_statistics: languageStats,
      metadata: {
        last_updated:
          jsonData.metadata?.last_updated || new Date().toISOString(),
        filter_date: datetime && !isNaN(Date.parse(datetime)) ? datetime : null,
      },
    });
  } catch (error) {
    logger.error('Error fetching JSON:', { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

/**
 * Endpoint for fetching specific repository information.
 * @route GET /api/repository/project/json
 * @param {string} repositories - Comma-separated list of repository names to fetch
 * @param {string} [datetime] - Optional ISO date string to filter repositories by last commit date
 * @param {string} [archived] - Optional 'true'/'false' to filter archived repositories
 * @returns {Object} Repository data
 * @returns {Object[]} response.repositories - Array of repository objects with their details
 * @returns {Object} response.stats - Repository statistics
 * @returns {Object} response.language_statistics - Language statistics for the requested repositories
 * @returns {Object} response.metadata - Last updated timestamp and repository request details
 * @throws {Error} 400 - If no repositories are specified
 * @throws {Error} 500 - If repository data fetching fails
 */
router.get('/repository/project/json', async (req, res) => {
  try {
    const { repositories, datetime, archived } = req.query;
    if (!repositories) {
      return res.status(400).json({ error: 'No repositories specified' });
    }

    const repoNames = repositories
      .split(',')
      .map(repo => repo.toLowerCase().trim());

    const jsonData = await s3Service.getObjectViaSignedUrl(
      'main',
      'repositories.json'
    );

    // Filter repositories based on provided names
    let filteredRepos = jsonData.repositories.filter(repo =>
      repoNames.includes(repo.name.toLowerCase())
    );

    // Apply date filter if provided
    if (datetime && !isNaN(Date.parse(datetime))) {
      const targetDate = new Date(datetime);
      const now = new Date();
      filteredRepos = filteredRepos.filter(repo => {
        const lastCommitDate = new Date(repo.last_commit);
        return lastCommitDate >= targetDate && lastCommitDate <= now;
      });
    }

    // Apply archived filter if specified
    if (archived === 'true') {
      filteredRepos = filteredRepos.filter(repo => repo.is_archived);
    } else if (archived === 'false') {
      filteredRepos = filteredRepos.filter(repo => !repo.is_archived);
    }

    // Calculate statistics from filtered repository data
    const stats = {
      total_repos: filteredRepos.length,
      total_private_repos: filteredRepos.filter(r => r.visibility === 'PRIVATE')
        .length,
      total_public_repos: filteredRepos.filter(r => r.visibility === 'PUBLIC')
        .length,
      total_internal_repos: filteredRepos.filter(
        r => r.visibility === 'INTERNAL'
      ).length,
    };

    // Calculate language statistics
    const languageStats = {};
    filteredRepos.forEach(repo => {
      if (!repo.technologies?.languages) return;

      repo.technologies.languages.forEach(lang => {
        if (!languageStats[lang.name]) {
          languageStats[lang.name] = {
            repo_count: 0,
            total_percentage: 0,
            total_size: 0,
          };
        }
        languageStats[lang.name].repo_count++;
        languageStats[lang.name].total_percentage += lang.percentage;
        languageStats[lang.name].total_size += lang.size;
      });
    });

    // Calculate averages
    Object.keys(languageStats).forEach(lang => {
      languageStats[lang] = {
        repo_count: languageStats[lang].repo_count,
        average_percentage: +(
          languageStats[lang].total_percentage / languageStats[lang].repo_count
        ).toFixed(3),
        total_size: languageStats[lang].total_size,
      };
    });

    res.json({
      repositories: filteredRepos,
      stats,
      language_statistics: languageStats,
      metadata: {
        last_updated:
          jsonData.metadata?.last_updated || new Date().toISOString(),
        requested_repos: repoNames,
        found_repos: filteredRepos.map(repo => repo.name),
        filter_date: datetime && !isNaN(Date.parse(datetime)) ? datetime : null,
        filter_archived: archived,
      },
    });
  } catch (error) {
    logger.error('Error fetching repository data:', { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

/**
 * Endpoint to fetch active banner messages.
 * @route GET /api/banners
 * @returns {Object} Active banner messages data
 * @throws {Error} 500 - If fetching fails
 */
router.get('/banners', async (req, res) => {
  try {
    let messagesData = { messages: [] };

    try {
      // Try to get existing messages.json file
      const data = await s3Service.getObject('main', 'messages.json');

      // Filter only active banners
      messagesData.messages = data.messages.filter(
        banner => banner.show === true
      );
    } catch (error) {
      // If file doesn't exist, return empty array
      logger.info('No messages.json file found, returning empty array');
      messagesData = { messages: [] };
    }

    res.json(messagesData);
  } catch (error) {
    logger.error('Error fetching banner messages:', { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

/**
 * Endpoint to fetch all banner messages (including inactive ones).
 * @route GET /api/banners/all
 * @returns {Object} All banner messages data
 * @throws {Error} 500 - If fetching fails
 */
router.get('/banners/all', async (req, res) => {
  try {
    let messagesData = { messages: [] };

    try {
      // Try to get existing messages.json file
      const data = await s3Service.getObject('main', 'messages.json');

      // Filter only active banners
      messagesData.messages = data.messages.filter(
        banner => banner.show === true
      );
    } catch (error) {
      // If file doesn't exist, return empty array
      logger.info('No messages.json file found, returning empty array');
      messagesData = { messages: [] };
    }

    res.json(messagesData);
  } catch (error) {
    logger.error('Error fetching all banner messages:', {
      error: error.message,
    });
    res.status(500).json({ error: error.message });
  }
});

/**
 * Health check endpoint to verify server status.
 * @route GET /api/health
 * @returns {Object} Health status information
 * @returns {string} response.status - Server status ('healthy')
 * @returns {string} response.timestamp - Current server timestamp
 * @returns {number} response.uptime - Server uptime in seconds
 * @returns {Object} response.memory - Memory usage statistics
 * @returns {number} response.pid - Process ID
 */
router.get('/health', healthCheckLimiter, (req, res) => {
  logger.info('Health check endpoint called', {
    timestamp: new Date().toISOString(),
  });

  // Add more specific headers
  res.set({
    'Content-Type': 'application/json',
    Connection: 'keep-alive',
    'Cache-Control': 'no-cache',
    'X-Health-Check': 'true',
  });

  const healthResponse = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    pid: process.pid,
  };

  logger.debug('Health check details', healthResponse);

  res.status(200).json(healthResponse);
});

module.exports = router;
