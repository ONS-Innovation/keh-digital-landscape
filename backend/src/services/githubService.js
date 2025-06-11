const {
  getAppAndInstallation,
} = require("../utilities/getAppAndInstallation.js");
const logger = require("../config/logger");

/**
 * GitHubService class for managing GitHub operations
 */
class GitHubService {
  constructor() {
    this.org = process.env.GITHUB_ORG || "ONSdigital";
  }

  /**
   * Get GitHub Copilot organisation metrics
   * @returns {Promise<Object>} Organisation metrics data
   */
  async getCopilotOrgMetrics() {
    try {
      const octokit = await getAppAndInstallation();

      const response = await octokit.request(
        `GET /orgs/${this.org}/copilot/metrics`,
        {
          headers: {
            "X-GitHub-Api-Version": "2022-11-28",
          },
        }
      );

      return response.data;
    } catch (error) {
      logger.error("GitHub API error while fetching Copilot org metrics:", {
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Get GitHub Copilot seat data with pagination
   * @returns {Promise<Array>} Array of all seats
   */
  async getCopilotSeats() {
    try {
      const octokit = await getAppAndInstallation();
      let allSeats = [];
      let page = 1;
      let hasMore = true;

      while (hasMore) {
        const response = await octokit.request(
          `GET /orgs/${this.org}/copilot/billing/seats`,
          {
            per_page: 100,
            page,
            headers: {
              "X-GitHub-Api-Version": "2022-11-28",
            },
          }
        );

        const currentSeats = response.data.seats ?? [];
        allSeats.push(...currentSeats);
        currentSeats.length < 100 ? (hasMore = false) : (page += 1);
      }

      return allSeats;
    } catch (error) {
      logger.error("GitHub API error while fetching Copilot seats:", {
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
    const { Octokit } = await import("@octokit/rest");

    try {
      const octokit = new Octokit({ auth: userToken });

      const response = await octokit.request(`GET /user/teams`, {
        headers: {
          "X-GitHub-Api-Version": "2022-11-28",
        },
        per_page: 100,
      });

      // Only return slug, name, description, and url for each team
      return (response.data || []).map(team => ({
        slug: team.slug,
        name: team.name,
        description: team.description,
        url: team.html_url,
      }));
    } catch (error) {
      logger.error("GitHub API error while fetching user's teams:", { error: error.message });
      throw error;
    }
  }

}

// Export a singleton instance
module.exports = new GitHubService();
