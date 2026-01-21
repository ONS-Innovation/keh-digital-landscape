const s3Service = require('../services/s3Service');
const githubService = require('../services/githubService');
const logger = require('../config/logger');
const { getTeamsHistoricDataWithCache } = require('./teamsHistoricCache');

/**
 * Get Copilot team slugs extracted from cached historic data
 * @param {string} bucketName - The S3 bucket name
 * @returns {Promise<Array>} Array of team metadata objects
 */
async function getCopilotTeamsWithCache(bucketName) {
  const teamsHistoricData = await getTeamsHistoricDataWithCache(bucketName);
  // Extract just the team metadata (name, slug, url, description)
  return teamsHistoricData.map(entry => entry.team);
}

/**
 * Check if a user is a copilot admin by comparing their teams with admin teams
 * @param {string} userToken - GitHub access token for the user
 * @returns {Promise<Object>} Object containing isAdmin boolean and available teams
 */
async function checkCopilotAdminStatus(userToken) {
  try {
    // Get user's teams
    const userTeams = await githubService.getUserTeams(userToken);
    const userTeamSlugs = userTeams.map(team => team.slug);

    // Get admin teams from S3
    let adminTeams = [];
    try {
      const copilotBucketName =
        process.env.COPILOT_BUCKET_NAME || 'sdp-dev-copilot-usage-dashboard';
      adminTeams = await s3Service.getObject(
        copilotBucketName,
        'admin_teams.json'
      );
    } catch (error) {
      logger.warn('Could not fetch admin_teams.json from S3:', {
        error: error.message,
      });
      return {
        isAdmin: false,
        teams: userTeams,
        userTeamSlugs: userTeamSlugs,
      };
    }

    // Check if user is in any admin team
    const isAdmin = adminTeams.some(adminTeam =>
      userTeamSlugs.includes(adminTeam)
    );

    if (isAdmin) {
      // User is admin, get copilot teams from teams_history.json
      let copilotTeams = [];
      try {
        const copilotBucketName =
          process.env.COPILOT_BUCKET_NAME || 'sdp-dev-copilot-usage-dashboard';
        copilotTeams = await getCopilotTeamsWithCache(copilotBucketName);
      } catch (error) {
        logger.warn('Could not fetch teams_history.json from S3:', {
          error: error.message,
        });
        // Fallback to user teams
        copilotTeams = userTeams;
      }

      return {
        isAdmin: true,
        teams: copilotTeams,
        userTeamSlugs: userTeamSlugs,
      };
    } else {
      // User is not admin, return their regular teams
      return {
        isAdmin: false,
        teams: userTeams,
        userTeamSlugs: userTeamSlugs,
      };
    }
  } catch (error) {
    logger.error('Error checking copilot admin status:', {
      error: error.message,
    });
    throw error;
  }
}

module.exports = {
  checkCopilotAdminStatus,
};
