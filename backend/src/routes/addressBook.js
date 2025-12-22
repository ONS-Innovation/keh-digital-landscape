const logger = require('../config/logger');
const express = require('express');
const addressBookService = require('../services/addressBookService');

const router = express.Router();

// GET /addressbook/api/request
router.get('/request', async (req, res) => {
  try {
    const query = req.query.q;

    let input = [];
    if (Array.isArray(query)) {
      input = query;
    } else if (typeof query === 'string') {
      input = query.includes(',') ? query.split(',') : [query];
    }

    input = input.map(v => String(v).trim()).filter(Boolean);

    if (input.length === 0) {
      return res.status(400).json({ error: 'Missing input' });
    }

    const formatted = await addressBookService.formatAddressBookData(input);
    return res.json(formatted);
  } catch (error) {
    logger.error('Error resolving addressbook user', { error: error.message });
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
