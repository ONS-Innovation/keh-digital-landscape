/**
 * @file This is the main file for the backend server.
 * It sets up an Express server, handles CORS, and provides endpoints for fetching CSV/JSON data and checking server health.
 */
require('dotenv').config();
const express = require("express");
const cors = require("cors");
const logger = require('./config/logger');
const { verifyJwt } = require('./services/cognitoService');

// Import route modules
const apiRoutes = require('./routes/default');
const adminRoutes = require('./routes/admin');
const reviewRoutes = require('./routes/review');
const copilotRoutes = require('./routes/copilot');

const app = express();
const port = process.env.PORT || 5001;

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

// Mount route modules
app.use('/api', apiRoutes);
app.use('/admin/api', adminRoutes);
app.use('/review/api', reviewRoutes);
app.use('/copilot/api', copilotRoutes);

app.get('/review/api/protected-endpoint', async (req, res) => {
  await verifyJwt(req, res);
});

// Add error handling
process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception:", { error });
});

process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection:", { promise, reason });
});

/**
 * Starts the server on the specified port.
 * It logs a message to the console when the server is running.
 */
app.listen(port, () => {
  logger.info(`Backend server running on port ${port}`);
});
