const express = require('express');
const router = express.Router();
const postToWebhookJson = require('../services/alertService');

/**
 * Endpoint for fetching token and posting alert.
 * @route POST /api/alert
 * @returns {String} Status code after sending alert to webhook
 * @throws {Error} 500 - If token fails or webhook posting fails
 */
router.post('/alert', async (req, res) => {
  try {
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).send('Invalid payload: expected JSON object');
    }

    const result = await postToWebhookJson(req.body);
    res.send(result);
  } catch (err) {
    res.status(500).send(err?.message ?? 'Token/Webhook error');
  }
});

module.exports = router;
