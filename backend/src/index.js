/**
 * @file This is the main file for the backend server.
 * It sets up an Express server, handles CORS, and provides endpoints for the frontend.
 */
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const logger = require('./config/logger');
const {
  generalApiLimiter,
  adminApiLimiter,
  userApiLimiter,
  externalApiLimiter,
} = require('./config/rateLimiter');

// Import route modules
const apiRoutes = require('./routes/default');
const adminRoutes = require('./routes/admin');
const reviewRoutes = require('./routes/review');
const copilotRoutes = require('./routes/copilot');
const userRoutes = require('./routes/user');
const addressbookRoutes = require('./routes/addressBook');
const alertsRoutes = require('./routes/alerts');

const app = express();
const port = process.env.PORT || 5001;

app.use(
  compression({
    filter: (req, res) => {
      if (
        req.headers['cache-control'] &&
        req.headers['cache-control'].includes('no-transform')
      ) {
        return false;
      }
      return compression.filter(req, res);
    },
  })
);

app.use(
  cors({
    origin:
      process.env.NODE_ENV === 'production'
        ? [`${process.env.FRONTEND_URL}`]
        : ['http://localhost:3000', 'http://127.0.0.1:3000'],
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'x-amzn-oidc-data',
      'x-amzn-oidc-accesstoken',
    ],
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

// Increase JSON payload size limit to handle large tech radar entries with extensive timeline descriptions
// Set to 10MB to accommodate large reasoning text in timeline entries (base radar is ~126KB)
app.use(
  express.json({
    limit: '10mb',
    parameterLimit: 50000,
    extended: true,
  })
);

app.use(
  express.urlencoded({
    limit: '10mb',
    extended: true,
    parameterLimit: 50000,
  })
);

app.use(cookieParser());

// Apply rate limiting middleware before mounting routes
// Note: Health endpoint has its own rate limiter applied directly in the route
app.use('/api', generalApiLimiter, apiRoutes);
app.use('/admin/api', adminApiLimiter, adminRoutes);
app.use('/review/api', adminApiLimiter, reviewRoutes);
app.use('/copilot/api', externalApiLimiter, copilotRoutes);
app.use('/user/api', userApiLimiter, userRoutes);
app.use('/addressbook/api', userApiLimiter, addressbookRoutes);
app.use('/alerts/api', externalApiLimiter, alertsRoutes);

// Error handling
process.on('uncaughtException', error => {
  logger.error('Uncaught Exception:', { error });
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', { promise, reason });
});

/**
 * Starts the server on the specified port.
 * It logs a message to the console when the server is running.
 */
app.listen(port, () => {
  logger.info(`Backend server running on port ${port}`, {
    nodeEnv: process.env.NODE_ENV,
    bodyLimit: '10MB',
    compressionEnabled: true,
  });
});

module.exports = app;
