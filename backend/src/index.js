/**
 * @file This is the main file for the backend server.
 * It sets up an Express server, handles CORS, and provides endpoints for the frontend.
 */
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
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

const app = express();
const port = process.env.PORT || 5001;

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

app.use(express.json());
app.use(cookieParser());

// Apply rate limiting middleware before mounting routes
// Note: Health endpoint has its own rate limiter applied directly in the route
app.use('/api', generalApiLimiter, apiRoutes);
app.use('/admin/api', adminApiLimiter, adminRoutes);
app.use('/review/api', adminApiLimiter, reviewRoutes);
app.use('/copilot/api', externalApiLimiter, copilotRoutes);
app.use('/user/api', userApiLimiter, userRoutes);

// Error handling
process.on('uncaughtException', error => {
  logger.error('Uncaught Exception:', { error });
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection:', { promise, reason });
});

/**
 * Starts the server on the specified port.
 * It logs a message to the console when the server is running.
 */
app.listen(port, () => {
  logger.info(`Backend server running on port ${port}`);
});
