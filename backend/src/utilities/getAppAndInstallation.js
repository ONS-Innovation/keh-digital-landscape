const {
  SecretsManagerClient,
  GetSecretValueCommand,
} = require('@aws-sdk/client-secrets-manager');
const GITHUB_ORG = process.env.GITHUB_ORG || 'ONSdigital';

/**
 * Get the app and installation from the GitHub API
 * @returns {Promise<Octokit>} The Octokit instance
 */
async function getAppAndInstallation() {
  const secretsManager = new SecretsManagerClient({ region: 'eu-west-2' });
  const { App } = await import('@octokit/app');

  const getGithubAppSecrets = async () => {
    const command = new GetSecretValueCommand({
      SecretId: process.env.AWS_SECRET_NAME,
    });
    const response = await secretsManager.send(command);

    return {
      privateKey: response.SecretString,
    };
  };

  const secrets = await getGithubAppSecrets();

  const app = new App({
    appId: process.env.GITHUB_APP_ID,
    privateKey: secrets.privateKey,
  });

  const installation = await app.octokit.request(
    `/orgs/${GITHUB_ORG}/installation`
  );
  const installation_id = installation.data.id;
  const octokit = await app.getInstallationOctokit(installation_id);

  return octokit;
}

module.exports = {
  getAppAndInstallation,
};
