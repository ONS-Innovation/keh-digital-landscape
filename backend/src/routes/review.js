const express = require('express');
const techRadarService = require('../services/techRadarService');
const { verifyJwt, requireReviewer } = require('../services/cognitoService');
const logger = require('../config/logger');

const router = express.Router();

// Apply authentication middleware to all review routes
router.use(verifyJwt);
router.use(requireReviewer);

/**
 * Endpoint for updating the tech radar JSON in S3 from review.
 * @route POST /review/api/tech-radar/update
 * @param {Object} req.body - The update data
 * @param {Object[]} [req.body.entries] - Array of entry objects to update
 * @param {string} [req.body.title] - The title of the tech radar (for full updates)
 * @param {Object[]} [req.body.quadrants] - Array of quadrant definitions (for full updates)
 * @param {Object[]} [req.body.rings] - Array of ring definitions (for full updates)
 * @returns {Object} Success message or error response
 * @returns {string} response.message - Success confirmation message
 * @throws {Error} 400 - If entries data is invalid
 * @throws {Error} 413 - If payload is too large
 * @throws {Error} 500 - If update operation fails
 */
router.post('/tech-radar/update', async (req, res) => {
  try {
    const { entries } = req.body;
    
    // Log payload information for monitoring
    const payloadSize = JSON.stringify(req.body).length;
    const entriesCount = entries ? entries.length : 0;
    
    logger.info('Tech radar update request received', {
      user: req.user?.email,
      entriesCount,
      payloadSizeBytes: payloadSize,
      payloadSizeMB: (payloadSize / (1024 * 1024)).toFixed(2),
      userAgent: req.get('User-Agent'),
      contentLength: req.get('content-length')
    });
    
    // Additional validation for very large payloads
    if (payloadSize > 8 * 1024 * 1024) { // 8MB warning threshold (80% of 10MB limit)
      logger.warn('Large payload detected in tech radar update', {
        user: req.user?.email,
        payloadSizeMB: (payloadSize / (1024 * 1024)).toFixed(2),
        entriesCount
      });
    }
    
    await techRadarService.updateTechRadarEntries(entries, 'review');
    
    logger.info('Tech radar update completed successfully', {
      user: req.user?.email,
      entriesCount,
      payloadSizeMB: (payloadSize / (1024 * 1024)).toFixed(2)
    });
    
    res.json({ 
      message: 'Tech radar updated successfully',
      entriesProcessed: entriesCount,
      payloadSize: `${(payloadSize / (1024 * 1024)).toFixed(2)} MB`
    });
  } catch (error) {
    logger.error('Error updating tech radar from review', {
      user: req.user?.email,
      error: error.message,
      stack: error.stack,
      url: req.url,
      method: req.method,
      contentLength: req.get('content-length')
    });
    
    if (error.message.includes('Invalid')) {
      return res.status(400).json({ 
        error: error.message,
        type: 'validation_error'
      });
    }
    
    if (error.message.includes('too large') || error.message.includes('PayloadTooLargeError')) {
      return res.status(413).json({ 
        error: 'Request payload is too large. Please try reducing the amount of text in timeline descriptions or save changes in smaller batches.',
        type: 'payload_too_large',
        suggestion: 'Consider breaking large descriptions into smaller sections or saving fewer entries at once.'
      });
    }
    
    res.status(500).json({ 
      error: 'An unexpected error occurred while saving changes. Please try again.',
      type: 'server_error'
    });
  }
});

module.exports = router;
