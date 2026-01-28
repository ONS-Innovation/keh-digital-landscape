const TENANT_ID = process.env.AZURE_TENANT_ID;
const CLIENT_ID = process.env.AZURE_CLIENT_ID;
const CLIENT_SECRET = process.env.AZURE_CLIENT_SECRET;
const TOKEN_URL = `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token`;

const WEBHOOK_SCOPE = process.env.WEBHOOK_SCOPE;
const WEBHOOK_URL = process.env.WEBHOOK_URL;

async function getAccessToken() {
  const form = new URLSearchParams({
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    scope: WEBHOOK_SCOPE,
    grant_type: 'client_credentials',
  });

  const resp = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: form.toString(),
  });
  const json = await resp.json();
  if (!resp.ok || !json.access_token) {
    throw new Error(json.error_description || 'Failed to get access token');
  }
  return json.access_token;
}

async function postToWebhook(obj) {
  const token = await getAccessToken();
  const resp = await fetch(WEBHOOK_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(obj),
  });
  const text = await resp.text();
  if (!resp.ok) throw new Error(text || 'Error has occurred during sending an alert message! Please investigate the alert service.');
  return text;
}

module.exports = postToWebhook;
