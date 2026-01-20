const sendAlert = async(statusInfo, errorInfo, moreInfo)=> {
  const backendUrl = import.meta.env.VITE_BACKEND_URL || '';
  const baseUrl = `${backendUrl}/postalerts/api/postalert`;
  const payload = {
    "channel" : import.meta.env.VITE_ALERTS_CHANNEL_ID,
    "message" : (`
        status: ${statusInfo}, <br>
        service: Digital Landscape,<br>
        event: ${errorInfo}, <br>
        description: ${moreInfo} <br>
        `)
  };
  const resp = await fetch(baseUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Error sending alert: ${text}`);
  }
}

export default sendAlert;