const rateLimit = require('express-rate-limit');
const logger = require('./logger');

/**
 * Rate limiting configurations for different route groups
 *
 * This module provides different rate limiting configurations for various
 * API endpoints based on their security requirements and expected usage patterns:
 *
 * 1. generalApiLimiter: For public API endpoints (60 requests / 1 minute)
 *    - Applied to /api/* routes
 *
 * 2. adminApiLimiter: For admin-only endpoints (60 requests / 1 minute)
 *    - Applied to /admin/api/* and /review/api/* routes
 *
 * 3. userApiLimiter: For authenticated user endpoints (60 requests / 1 minute)
 *    - Applied to /user/api/* routes
 *
 * 4. healthCheckLimiter: For the health check endpoint (60 requests / 1 minute)
 *    - Applied specifically to the health check endpoint
 *
 * 5. externalApiLimiter: For endpoints that call external APIs (60 requests / 1 minute)
 *    - Applied to /copilot/api/* routes
 *
 * All rate limiters include:
 * - Detailed logging of rate limit violations
 * - Standard HTTP headers for rate limit information
 * - Custom error responses with retry-after information
 */

// General API rate limiter - for public endpoints
const generalApiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // Limit each IP to 60 requests per minute (1 per second)
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '1 minute',
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res) => {
    logger.warn('Rate limit exceeded', {
      ip: req.ip,
      path: req.path,
      userAgent: req.get('User-Agent'),
    });
    res.status(429).json({
      error: 'Too many requests from this IP, please try again later.',
      retryAfter: '1 minute',
    });
  },
});

// Stricter rate limiter for admin endpoints
const adminApiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // Limit each IP to 60 requests per minute (1 per second)
  message: {
    error: 'Too many admin requests from this IP, please try again later.',
    retryAfter: '1 minute',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('Admin rate limit exceeded', {
      ip: req.ip,
      path: req.path,
      userAgent: req.get('User-Agent'),
    });
    res.status(429).json({
      error: 'Too many admin requests from this IP, please try again later.',
      retryAfter: '1 minute',
    });
  },
});

// More lenient rate limiter for authenticated user endpoints
const userApiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // Limit each IP to 60 requests per minute (1 per second)
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '1 minute',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('User API rate limit exceeded', {
      ip: req.ip,
      path: req.path,
      userAgent: req.get('User-Agent'),
    });
    res.status(429).json({
      error: 'Too many requests from this IP, please try again later.',
      retryAfter: '1 minute',
    });
  },
});

// Very lenient rate limiter for health checks
const healthCheckLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // Allow 60 health checks per minute
  message: {
    error: 'Too many health check requests.',
    retryAfter: '1 minute',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('Health check rate limit exceeded', {
      ip: req.ip,
      path: req.path,
      userAgent: req.get('User-Agent'),
    });
    res.status(429).json({
      error: 'Too many health check requests.',
      retryAfter: '1 minute',
    });
  },
});

// Strict rate limiter for potentially expensive operations like GitHub API calls
const externalApiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // Limit each IP to 60 requests per minute (1 per second)
  message: {
    error: 'Too many requests to external APIs, please try again later.',
    retryAfter: '1 minute',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('External API rate limit exceeded', {
      ip: req.ip,
      path: req.path,
      userAgent: req.get('User-Agent'),
    });
    res.status(429).json({
      error: 'Too many requests to external APIs, please try again later.',
      retryAfter: '1 minute',
    });
  },
});

module.exports = {
  generalApiLimiter,
  adminApiLimiter,
  userApiLimiter,
  healthCheckLimiter,
  externalApiLimiter,
};
