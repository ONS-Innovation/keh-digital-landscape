async function getAppAndInstallation() {
    const { App } = await import("@octokit/app");

    const AWS = require('aws-sdk');
    const secretsManager = new AWS.SecretsManager({ region: "eu-west-2" });

    const getGithubAppSecrets = async () => {
      const secret = await secretsManager
        .getSecretValue({ SecretId: process.env.AWS_SECRET_NAME })
        .promise();
    
      return {
        privateKey: secret.SecretString
      };
    };

    const secrets = await getGithubAppSecrets();

    const app = new App({
      appId: process.env.DIGITAL_APP_ID,
      privateKey: secrets.privateKey,
    });

    const installation = await app.octokit.request(`/orgs/${process.env.ORG}/installation`);
    const installation_id = installation.data.id;
    const octokit = await app.getInstallationOctokit(installation_id);

    return octokit;
}

module.exports = {
    getAppAndInstallation,
};