const {
  getAppAndInstallation,
} = require('../utilities/getAppAndInstallation.js');
const logger = require('../config/logger');

/**
 * GitHubService class for managing GitHub operations
 */
class GitHubService {
  constructor() {
    this.org = process.env.GITHUB_ORG || 'ONSdigital';
  }

  /**
   * Get team members for a specific team in the organisation
   * @param {string} teamSlug - The slug of the team to fetch members for
   * @param {string} userToken - GitHub access token for verification
   * @returns {Promise<Array>} Array of team members with login, name, and url
   */
  async getTeamMembers(teamSlug, userToken) {
    if (!userToken) {
      throw new Error('Authentication required to access team members');
    }

    try {
      // First verify the user is a member of the team using their user token
      const userTeams = await this.getUserTeams(userToken);

      // Check if the user is a member of the requested team
      const isTeamMember = userTeams.some(team => team.slug === teamSlug);

      if (!isTeamMember) {
        throw new Error(`User is not a member of the team: ${teamSlug}`);
      }

      // Now use the app installation token to access the team members
      const octokit = await getAppAndInstallation();

      const response = await octokit.request(
        `GET /orgs/${this.org}/teams/${teamSlug}/members`,
        {
          headers: {
            'X-GitHub-Api-Version': '2022-11-28',
          },
          per_page: 100,
        }
      );
      logger.info('Successfully fetched GitHub team members', {'service': 'GitHub API'});

      // Only return login, name, and url for each member
      return response.data || [];
    } catch (error) {
      logger.error('GitHub API error while fetching team members:', {
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Get teams the authenticated user is a member of in the organisation
   * @param {string} userToken - GitHub access token
   * @returns {Promise<Array>} Array of teams the user is a member of in the organisation
   */
  async getUserTeams(userToken) {
    try {
      const { Octokit } = await import('@octokit/rest');

      const octokit = new Octokit({ auth: userToken });

      const response = await octokit.request(`GET /user/teams`, {
        headers: {
          'X-GitHub-Api-Version': '2022-11-28',
        },
        per_page: 100,
      });
      logger.info('Successfully fetched GitHub teams', {'service': 'GitHub API'});

      // Only return slug, name, description, and url for each team
      return (response.data || []).map(team => ({
        slug: team.slug,
        name: team.name,
        description: team.description,
        url: team.html_url,
      }));
    } catch (error) {
      logger.error("GitHub API error while fetching user's teams:", {
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Get team members as admin (using app installation)
   * @param {string} teamSlug - The slug of the team to fetch members for
   * @returns {Promise<Array>} Array of team members
   */
  async getTeamMembersAsAdmin(teamSlug) {
    try {
      const octokit = await getAppAndInstallation();

      const response = await octokit.request(
        `GET /orgs/${this.org}/teams/${teamSlug}/members`,
        {
          headers: {
            'X-GitHub-Api-Version': '2022-11-28',
          },
          per_page: 100,
        }
      );
      logger.info('Successfully fetched GitHub team members as admin',  {'service': 'GitHub API'});

      return response.data || [];
    } catch (error) {
      logger.error('GitHub API error while fetching team members as admin:', {
        error: error.message,
      });
      throw error;
    }
  }
}

// Export a singleton instance
module.exports = new GitHubService();
