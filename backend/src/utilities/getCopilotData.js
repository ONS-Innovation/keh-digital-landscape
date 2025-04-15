import { Octokit } from "@octokit/core";

const org = process.env.GITHUB_ORG;

const octokit = new Octokit({
    auth: 'YOUR-TOKEN'
  })
  
  // Live data
  async function getLiveData() {
    const res = await octokit.request(`GET /orgs/${org}/copilot/metrics`, {
      org: org,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    })
    return res;
  }

  // Seat data
  async function getSeatData() {
    const res = await octokit.request(`GET /orgs/${org}/copilot/billing/seats`, {
      org: org,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    })
    return res;
  }