const s3Service = require('../services/s3Service');
const githubService = require('../services/githubService');
const logger = require('../config/logger');

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
      // User is admin, get copilot teams
      let copilotTeams = [];
      try {
        const copilotBucketName =
          process.env.COPILOT_BUCKET_NAME || 'sdp-dev-copilot-usage-dashboard';
        copilotTeams = await s3Service.getObject(
          copilotBucketName,
          'copilot_teams.json'
        );
      } catch (error) {
        logger.warn('Could not fetch copilot_teams.json from S3:', {
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
