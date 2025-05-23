// backend/src/index.js
/**
 * @file This is the main file for the backend server.
 * It sets up an Express server, handles CORS, and provides endpoints for fetching CSV/JSON data and checking server health.
 */
require('dotenv').config();
const express = require("express");
const cors = require("cors");
const {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const fetch = require("node-fetch");
const logger = require('./config/logger');
const { transformProjectToCSVFormat } = require('./utilities/projectDataTransformer');
const { getAppAndInstallation } = require ("./utilities/getAppAndInstallation.js");
const { updateTechnologyInArray } = require('./utilities/updateTechnologyInArray');

const app = express();
const port = process.env.PORT || 5001;
const bucketName = process.env.BUCKET_NAME || "sdp-dev-digital-landscape";
const tatBucketName = process.env.TAT_BUCKET_NAME || "sdp-dev-tech-audit-tool-api";
const org = process.env.GITHUB_ORG || "ONSdigital";

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

const s3Client = new S3Client({
  region: "eu-west-2",
});

/**
 * Endpoint for fetching Copilot organisation usage data from the Github API.
 * @route GET /api/org/live
 * @returns {Object} Organisation usage JSON data
 * @throws {Error} 500 - If fetching fails
 */
app.get("/api/org/live", async (req, res) => {
  try {
    const octokit = await getAppAndInstallation()

    const response = await octokit.request(`GET /orgs/${org}/copilot/metrics`, {
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });

    res.json(response.data);
  } catch (error) {
    console.error("GitHub API error:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Endpoint for fetching Copilot seat data from the Github API.
 * @route GET /api/seats
 * @returns {Object} Copilot seat JSON data
 * @throws {Error} 500 - If JSON fetching fails
 */
app.get("/api/seats", async (req, res) => {
  try {
    const octokit = await getAppAndInstallation()
    let allSeats = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const response = await octokit.request(`GET /orgs/${org}/copilot/billing/seats`, {
        per_page: 100,
        page,
        headers: {
          "X-GitHub-Api-Version": "2022-11-28",
        },
      });

      const currentSeats = response.data.seats ?? [];
      allSeats.push(...currentSeats);
      currentSeats.length < 100 ? hasMore = false : page += 1;
    }

    res.json(allSeats);
  } catch (error) {
    console.error("GitHub API error:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Endpoint for fetching project data and converting it to CSV format.
 * @route GET /api/csv
 * @returns {Object[]} Array of objects containing parsed project data in CSV format
 * @throws {Error} 500 - If data fetching or processing fails
 */
app.get("/api/csv", async (req, res) => {
  try {
    const command = new GetObjectCommand({
      Bucket: tatBucketName,
      Key: "new_project_data.json",
    });

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });

    // Fetch the JSON data using the signed URL
    const response = await fetch(signedUrl);
    const jsonData = await response.json();

    // Transform JSON data to CSV format using the utility function
    const transformedData = jsonData.projects.map(transformProjectToCSVFormat);

    res.json(transformedData);
  } catch (error) {
    logger.error("Error fetching and transforming project data:", { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

/**
 * Endpoint for fetching tech radar JSON data from S3. The tech data that goes on the radar and states where it belongs on the radar.
 * @route GET /api/tech-radar/json
 * @returns {Object} The tech radar configuration data
 * @throws {Error} 500 - If JSON fetching fails
 */
app.get("/api/tech-radar/json", async (req, res) => {
  try {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: "onsRadarSkeleton.json",
    });

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });

    // Fetch the CSV data using the signed URL
    // Just return the json, no need for formatting
    const response = await fetch(signedUrl);
    const jsonData = await response.json();

    res.json(jsonData);
  } catch (error) {
    console.error("Error fetching JSON:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Endpoint for fetching repository statistics.
 * @route GET /api/json
 * @param {string} [datetime] - Optional ISO date string to filter repositories by last commit date
 * @param {string} [archived] - Optional 'true'/'false' to filter archived repositories
 * @returns {Object} Repository statistics
 * @returns {Object} response.stats - General repository statistics (total, private, public, internal counts)
 * @returns {Object} response.language_statistics - Language usage statistics across repositories
 * @returns {Object} response.metadata - Last updated timestamp and filter information
 * @throws {Error} 500 - If JSON fetching fails
 */
app.get("/api/json", async (req, res) => {
  try {
    const { datetime, archived } = req.query;
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: "repositories.json",
    });

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });

    // Fetch the JSON data using the signed URL
    const response = await fetch(signedUrl);
    const jsonData = await response.json();

    // First filter by date if provided
    let filteredRepos = jsonData.repositories;

    if (datetime && !isNaN(Date.parse(datetime))) {
      const targetDate = new Date(datetime);
      const now = new Date();
      filteredRepos = jsonData.repositories.filter((repo) => {
        const lastCommitDate = new Date(repo.last_commit);
        return lastCommitDate >= targetDate && lastCommitDate <= now;
      });
    }

    // Then filter by archived status if specified
    if (archived === "true") {
      filteredRepos = filteredRepos.filter((repo) => repo.is_archived);
    } else if (archived === "false") {
      filteredRepos = filteredRepos.filter((repo) => !repo.is_archived);
    }
    // If archived is not specified, use all repos (for total view)

    // Calculate statistics
    const stats = {
      total_repos: filteredRepos.length,
      total_private_repos: filteredRepos.filter(
        (repo) => repo.visibility === "PRIVATE"
      ).length,
      total_public_repos: filteredRepos.filter(
        (repo) => repo.visibility === "PUBLIC"
      ).length,
      total_internal_repos: filteredRepos.filter(
        (repo) => repo.visibility === "INTERNAL"
      ).length,
    };

    // Calculate language statistics
    const languageStats = {};
    filteredRepos.forEach((repo) => {
      if (!repo.technologies?.languages) return;

      repo.technologies.languages.forEach((lang) => {
        if (!languageStats[lang.name]) {
          languageStats[lang.name] = {
            repo_count: 0,
            total_percentage: 0,
            total_size: 0,
          };
        }
        languageStats[lang.name].repo_count++;
        languageStats[lang.name].total_percentage += lang.percentage;
        languageStats[lang.name].total_size += lang.size;
      });
    });

    // Calculate averages
    Object.keys(languageStats).forEach((lang) => {
      languageStats[lang] = {
        repo_count: languageStats[lang].repo_count,
        average_percentage: +(
          languageStats[lang].total_percentage / languageStats[lang].repo_count
        ).toFixed(3),
        total_size: languageStats[lang].total_size,
      };
    });

    res.json({
      stats,
      language_statistics: languageStats,
      metadata: {
        last_updated:
          jsonData.metadata?.last_updated || new Date().toISOString(),
        filter_date: datetime && !isNaN(Date.parse(datetime)) ? datetime : null,
      },
    });
  } catch (error) {
    console.error("Error fetching JSON:", error);
    res.status(500).json({ error: error.message });
  }
});
/**
 * Function to handle tech radar updates for both admin and review endpoints
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {string} role - The role making the request ('admin' or 'review')
 */
const handleTechRadarUpdate = async (req, res, role) => {
  try {
    const { entries } = req.body;

    // Validate entries is present, is an array, and is not empty
    if (!entries || !Array.isArray(entries) || entries.length === 0) {
      return res.status(400).json({ error: "Invalid or empty entries data" });
    }

    const bucketName = process.env.BUCKET_NAME
      ? process.env.BUCKET_NAME
      : "sdp-dev-digital-landscape";

    // First, get the existing JSON to preserve the structure
    const getCommand = new GetObjectCommand({
      Bucket: bucketName,
      Key: "onsRadarSkeleton.json",
    });

    const { Body } = await s3Client.send(getCommand);
    const existingData = JSON.parse(await Body.transformToString());

    // Get valid quadrant and ring IDs from either the update or existing data
    const validQuadrantIds = new Set(existingData.quadrants.map((q) => q.id));
    const validRingIds = new Set([
      ...existingData.rings.map((r) => r.id),
      "ignore",
      "review",
    ]);

    // Validate each entry
    const validEntries = entries.every((entry) => {
      // Required fields validation
      if (
        !entry.id ||
        typeof entry.id !== "string" ||
        !entry.title ||
        typeof entry.title !== "string" ||
        !entry.quadrant ||
        !validQuadrantIds.has(entry.quadrant)
      ) {
        return false;
      }

      // Timeline validation
      if (!Array.isArray(entry.timeline)) return false;

      const validTimeline = entry.timeline.every(
        (t) =>
          typeof t.moved === "number" &&
          validRingIds.has(t.ringId) &&
          typeof t.date === "string" &&
          typeof t.description === "string"
      );
      if (!validTimeline) return false;

      // Optional fields validation
      if (entry.description && typeof entry.description !== "string")
        return false;
      if (entry.key && typeof entry.key !== "string") return false;
      if (entry.url && typeof entry.url !== "string") return false;
      if (entry.links && !Array.isArray(entry.links)) return false;

      return true;
    });

    if (!validEntries) {
      return res.status(400).json({ error: "Invalid entry structure" });
    }

    // Merge with existing entries
    const existingEntriesMap = new Map(
      existingData.entries.map((entry) => [entry.id, entry])
    );

    // Update or add new entries
    entries.forEach((newEntry) => {
      existingEntriesMap.set(newEntry.id, {
        ...(existingEntriesMap.get(newEntry.id) || {}),
        ...newEntry,
      });
    });

    existingData.entries = Array.from(existingEntriesMap.values());

    // Sort entries to maintain consistent order
    existingData.entries.sort((a, b) => {
      // First by quadrant
      if (a.quadrant !== b.quadrant) {
        return parseInt(a.quadrant) - parseInt(b.quadrant);
      }
      // Then by title
      return a.title.localeCompare(b.title);
    });

    // Save the updated JSON back to S3
    const putCommand = new PutObjectCommand({
      Bucket: bucketName,
      Key: "onsRadarSkeleton.json",
      Body: JSON.stringify(existingData, null, 2),
      ContentType: "application/json",
    });

    await s3Client.send(putCommand);
    res.json({ message: "Tech radar updated successfully" });
  } catch (error) {
    logger.error(`Error updating tech radar (${role}):`, { error: error.message });
    res.status(500).json({ error: error.message });
  }
};

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
 * @throws {Error} 500 - If update operation fails
 */
app.post("/review/api/tech-radar/update", (req, res) => {
  handleTechRadarUpdate(req, res, 'review');
});

/**
 * Endpoint for updating the tech radar JSON in S3 from admin.
 * @route POST /admin/api/tech-radar/update
 * @param {Object} req.body - The update data
 * @param {Object[]} [req.body.entries] - Array of entry objects to update
 * @param {string} [req.body.title] - The title of the tech radar (for full updates)
 * @param {Object[]} [req.body.quadrants] - Array of quadrant definitions (for full updates)
 * @param {Object[]} [req.body.rings] - Array of ring definitions (for full updates)
 * @returns {Object} Success message or error response
 * @returns {string} response.message - Success confirmation message
 * @throws {Error} 400 - If entries data is invalid
 * @throws {Error} 500 - If update operation fails
 */
app.post("/admin/api/tech-radar/update", (req, res) => {
  handleTechRadarUpdate(req, res, 'admin');
});

/**
 * Endpoint for updating banner messages.
 * @route POST /review/api/banners/update
 * @param {Object} req.body - The banner data
 * @param {Object} req.body.banner - Banner object with message, pages, and show properties
 * @returns {Object} Success message or error response
 * @throws {Error} 400 - If banner data is invalid
 * @throws {Error} 500 - If update operation fails
 */
app.post("/admin/api/banners/update", async (req, res) => {
  try {
    const { banner } = req.body;

    // Validate banner data
    if (!banner || !banner.message || !Array.isArray(banner.pages) || banner.pages.length === 0) {
      return res.status(400).json({ error: "Invalid banner data" });
    }

    const bucketName = process.env.BUCKET_NAME
      ? process.env.BUCKET_NAME
      : "sdp-dev-digital-landscape";

    let messagesData;
    
    try {
      // Try to get existing messages.json file
      const getCommand = new GetObjectCommand({
        Bucket: bucketName,
        Key: "messages.json",
      });

      const { Body } = await s3Client.send(getCommand);
      messagesData = JSON.parse(await Body.transformToString());
    } catch (error) {
      // If file doesn't exist, create a new structure
      messagesData = { messages: [] };
      logger.info("Creating new messages.json file");
    }

    // Add the new banner to messages
    messagesData.messages.push({
      title: banner.title || "",
      message: banner.message,
      description: banner.message, // For backwards compatibility
      type: banner.type || "info",
      pages: banner.pages,
      show: banner.show !== false // Default to true if not explicitly set to false
    });

    // Save the updated JSON back to S3
    const putCommand = new PutObjectCommand({
      Bucket: bucketName,
      Key: "messages.json",
      Body: JSON.stringify(messagesData, null, 2),
      ContentType: "application/json",
    });

    await s3Client.send(putCommand);
    res.json({ message: "Banner added successfully" });
  } catch (error) {
    logger.error("Error updating banner messages:", { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

/**
 * Endpoint for fetching all banner messages.
 * @route GET /review/api/banners
 * @returns {Object} Object containing array of banner messages
 * @throws {Error} 500 - If fetching operation fails
 */
app.get("/admin/api/banners", async (req, res) => {
  try {
    const bucketName = process.env.BUCKET_NAME
      ? process.env.BUCKET_NAME
      : "sdp-dev-digital-landscape";

    try {
      // Try to get existing messages.json file
      const getCommand = new GetObjectCommand({
        Bucket: bucketName,
        Key: "messages.json",
      });

      const { Body } = await s3Client.send(getCommand);
      const messagesData = JSON.parse(await Body.transformToString());
      
      res.json(messagesData);
    } catch (error) {
      // If file doesn't exist, return empty array
      res.json({ messages: [] });
    }
  } catch (error) {
    logger.error("Error fetching banner messages:", { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

/**
 * Endpoint for toggling banner visibility.
 * @route POST /review/api/banners/toggle
 * @param {Object} req.body - The toggle data
 * @param {number} req.body.index - Index of the banner to toggle
 * @param {boolean} req.body.show - Whether to show or hide the banner
 * @returns {Object} Success message or error response
 * @throws {Error} 400 - If index is invalid
 * @throws {Error} 500 - If toggle operation fails
 */
app.post("/admin/api/banners/toggle", async (req, res) => {
  try {
    const { index, show } = req.body;

    if (index === undefined || typeof index !== 'number') {
      return res.status(400).json({ error: "Invalid banner index" });
    }

    const bucketName = process.env.BUCKET_NAME
      ? process.env.BUCKET_NAME
      : "sdp-dev-digital-landscape";

    // Get existing messages.json file
    const getCommand = new GetObjectCommand({
      Bucket: bucketName,
      Key: "messages.json",
    });

    let messagesData;
    try {
      const { Body } = await s3Client.send(getCommand);
      messagesData = JSON.parse(await Body.transformToString());
    } catch (error) {
      return res.status(400).json({ error: "Messages file not found" });
    }

    // Check if index is valid
    if (!messagesData.messages || index >= messagesData.messages.length || index < 0) {
      return res.status(400).json({ error: "Banner index out of range" });
    }

    // Update the banner visibility
    messagesData.messages[index].show = show;

    // Save the updated JSON back to S3
    const putCommand = new PutObjectCommand({
      Bucket: bucketName,
      Key: "messages.json",
      Body: JSON.stringify(messagesData, null, 2),
      ContentType: "application/json",
    });

    await s3Client.send(putCommand);
    res.json({ message: "Banner visibility updated successfully" });
  } catch (error) {
    logger.error("Error toggling banner visibility:", { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

/**
 * Endpoint for deleting a banner.
 * @route POST /review/api/banners/delete
 * @param {Object} req.body - The delete data
 * @param {number} req.body.index - Index of the banner to delete
 * @returns {Object} Success message or error response
 * @throws {Error} 400 - If index is invalid
 * @throws {Error} 500 - If delete operation fails
 */
app.post("/admin/api/banners/delete", async (req, res) => {
  try {
    const { index } = req.body;

    if (index === undefined || typeof index !== 'number') {
      return res.status(400).json({ error: "Invalid banner index" });
    }

    const bucketName = process.env.BUCKET_NAME
      ? process.env.BUCKET_NAME
      : "sdp-dev-digital-landscape";

    // Get existing messages.json file
    const getCommand = new GetObjectCommand({
      Bucket: bucketName,
      Key: "messages.json",
    });

    let messagesData;
    try {
      const { Body } = await s3Client.send(getCommand);
      messagesData = JSON.parse(await Body.transformToString());
    } catch (error) {
      return res.status(400).json({ error: "Messages file not found" });
    }

    // Check if index is valid
    if (!messagesData.messages || index >= messagesData.messages.length || index < 0) {
      return res.status(400).json({ error: "Banner index out of range" });
    }

    // Remove the banner
    messagesData.messages.splice(index, 1);

    // Save the updated JSON back to S3
    const putCommand = new PutObjectCommand({
      Bucket: bucketName,
      Key: "messages.json",
      Body: JSON.stringify(messagesData, null, 2),
      ContentType: "application/json",
    });

    await s3Client.send(putCommand);
    res.json({ message: "Banner deleted successfully" });
  } catch (error) {
    logger.error("Error deleting banner:", { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

/**
 * Endpoint for fetching specific repository information.
 * @route GET /api/repository/project/json
 * @param {string} repositories - Comma-separated list of repository names to fetch
 * @param {string} [datetime] - Optional ISO date string to filter repositories by last commit date
 * @param {string} [archived] - Optional 'true'/'false' to filter archived repositories
 * @returns {Object} Repository data
 * @returns {Object[]} response.repositories - Array of repository objects with their details
 * @returns {Object} response.stats - Repository statistics
 * @returns {Object} response.language_statistics - Language statistics for the requested repositories
 * @returns {Object} response.metadata - Last updated timestamp and repository request details
 * @throws {Error} 400 - If no repositories are specified
 * @throws {Error} 500 - If repository data fetching fails
 */
app.get("/api/repository/project/json", async (req, res) => {
  try {
    const { repositories, datetime, archived } = req.query;
    if (!repositories) {
      return res.status(400).json({ error: "No repositories specified" });
    }

    const repoNames = repositories
      .split(",")
      .map((repo) => repo.toLowerCase().trim());
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: "repositories.json",
    });

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });
    const response = await fetch(signedUrl);
    const jsonData = await response.json();

    // Filter repositories based on provided names
    let filteredRepos = jsonData.repositories.filter((repo) =>
      repoNames.includes(repo.name.toLowerCase())
    );

    // Apply date filter if provided
    if (datetime && !isNaN(Date.parse(datetime))) {
      const targetDate = new Date(datetime);
      const now = new Date();
      filteredRepos = filteredRepos.filter((repo) => {
        const lastCommitDate = new Date(repo.last_commit);
        return lastCommitDate >= targetDate && lastCommitDate <= now;
      });
    }

    // Apply archived filter if specified
    if (archived === "true") {
      filteredRepos = filteredRepos.filter((repo) => repo.is_archived);
    } else if (archived === "false") {
      filteredRepos = filteredRepos.filter((repo) => !repo.is_archived);
    }

    // Calculate statistics from filtered repository data
    const stats = {
      total_repos: filteredRepos.length,
      total_private_repos: filteredRepos.filter(
        (r) => r.visibility === "PRIVATE"
      ).length,
      total_public_repos: filteredRepos.filter((r) => r.visibility === "PUBLIC")
        .length,
      total_internal_repos: filteredRepos.filter(
        (r) => r.visibility === "INTERNAL"
      ).length,
    };

    // Calculate language statistics
    const languageStats = {};
    filteredRepos.forEach((repo) => {
      if (!repo.technologies?.languages) return;

      repo.technologies.languages.forEach((lang) => {
        if (!languageStats[lang.name]) {
          languageStats[lang.name] = {
            repo_count: 0,
            total_percentage: 0,
            total_size: 0,
          };
        }
        languageStats[lang.name].repo_count++;
        languageStats[lang.name].total_percentage += lang.percentage;
        languageStats[lang.name].total_size += lang.size;
      });
    });

    // Calculate averages
    Object.keys(languageStats).forEach((lang) => {
      languageStats[lang] = {
        repo_count: languageStats[lang].repo_count,
        average_percentage: +(
          languageStats[lang].total_percentage / languageStats[lang].repo_count
        ).toFixed(3),
        total_size: languageStats[lang].total_size,
      };
    });

    res.json({
      repositories: filteredRepos,
      stats,
      language_statistics: languageStats,
      metadata: {
        last_updated:
          jsonData.metadata?.last_updated || new Date().toISOString(),
        requested_repos: repoNames,
        found_repos: filteredRepos.map((repo) => repo.name),
        filter_date: datetime && !isNaN(Date.parse(datetime)) ? datetime : null,
        filter_archived: archived,
      },
    });
  } catch (error) {
    console.error("Error fetching repository data:", error);
    res.status(500).json({ error: error.message });
  }
});
/**
 * Endpoint to fetch active banner messages.
 * @route GET /api/banners
 * @returns {Object} Active banner messages data
 * @throws {Error} 500 - If fetching fails
 */
app.get("/api/banners", async (req, res) => {
  try {
    const bucketName = process.env.BUCKET_NAME
      ? process.env.BUCKET_NAME
      : "sdp-dev-digital-landscape";

    let messagesData = { messages: [] };
    
    try {
      // Try to get existing messages.json file
      const getCommand = new GetObjectCommand({
        Bucket: bucketName,
        Key: "messages.json",
      });

      const { Body } = await s3Client.send(getCommand);
      const data = JSON.parse(await Body.transformToString());
      
      // Filter only active banners
      messagesData.messages = data.messages.filter(banner => banner.show === true);
    } catch (error) {
      // If file doesn't exist, return empty array
      logger.info("No messages.json file found, returning empty array");
      messagesData = { messages: [] };
    }

    res.json(messagesData);
  } catch (error) {
    logger.error("Error fetching banner messages:", { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

/**
 * Endpoint to fetch all banner messages (including inactive ones).
 * @route GET /api/banners/all
 * @returns {Object} All banner messages data
 * @throws {Error} 500 - If fetching fails
 */
app.get("/api/banners/all", async (req, res) => {
  try {
    const bucketName = process.env.BUCKET_NAME
      ? process.env.BUCKET_NAME
      : "sdp-dev-digital-landscape";

    let messagesData = { messages: [] };
    
    try {
      // Try to get existing messages.json file
      const getCommand = new GetObjectCommand({
        Bucket: bucketName,
        Key: "messages.json",
      });

      const { Body } = await s3Client.send(getCommand);
      const data = JSON.parse(await Body.transformToString());
      
      // Filter only active banners
      messagesData.messages = data.messages.filter(banner => banner.show === true);
    } catch (error) {
      // If file doesn't exist, return empty array
      logger.info("No messages.json file found, returning empty array");
      messagesData = { messages: [] };
    }

    res.json(messagesData);
  } catch (error) {
    logger.error("Error fetching all banner messages:", { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

/**
 * Endpoint for fetching array data from the Tech Audit Tool bucket.
 * @route GET /admin/api/array-data
 * @returns {Object} Object containing categorized technology arrays
 * @throws {Error} 500 - If fetching operation fails
 */
app.get("/admin/api/array-data", async (req, res) => {
  try {
    const command = new GetObjectCommand({
      Bucket: tatBucketName,
      Key: "array_data.json",
    });

    try {
      const { Body } = await s3Client.send(command);
      const arrayData = JSON.parse(await Body.transformToString());
      
      res.json(arrayData);
    } catch (error) {
      logger.error("Error fetching array data:", { error: error.message });
      res.status(500).json({ error: "Failed to fetch technology data" });
    }
  } catch (error) {
    logger.error("Error in array data endpoint:", { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

/**
 * Endpoint for updating array data in the Tech Audit Tool bucket.
 * @route POST /admin/api/array-data/update
 * @param {Object} req.body - The updated array data
 * @param {boolean} [req.body.allCategories] - Whether this is updating all categories at once
 * @param {string} [req.body.category] - Category to update (for single category updates)
 * @param {string[]} [req.body.items] - Updated list of items for the category (for single category updates)
 * @param {Object} [req.body.items] - Complete array data object (for all categories update)
 * @returns {Object} Success message or error response
 * @throws {Error} 400 - If data is invalid
 * @throws {Error} 500 - If update operation fails
 */
app.post("/admin/api/array-data/update", async (req, res) => {
  try {
    const { allCategories, category, items } = req.body;

    // Validate input
    if (allCategories) {
      if (!items || typeof items !== 'object') {
        return res.status(400).json({ error: "Invalid data format. Complete items object is required for all categories update." });
      }
    } else {
      if (!category || !items || !Array.isArray(items)) {
        return res.status(400).json({ error: "Invalid data format. Category and items array are required for single category update." });
      }
    }

    // Get existing array data
    const getCommand = new GetObjectCommand({
      Bucket: tatBucketName,
      Key: "array_data.json",
    });

    let arrayData;
    try {
      const { Body } = await s3Client.send(getCommand);
      arrayData = JSON.parse(await Body.transformToString());
    } catch (error) {
      logger.error("Error fetching existing array data:", { error: error.message });
      return res.status(500).json({ error: "Failed to fetch existing data for update" });
    }

    // Update the data
    if (allCategories) {
      // For all categories update, replace the entire object
      arrayData = items;
    } else {
      // Validate that the category exists in the current data to prevent category injection
      if (!Object.keys(arrayData).includes(category)) {
        logger.error("Invalid category attempted:", { category });
        return res.status(400).json({ error: "Invalid category. The specified category does not exist." });
      }
      
      // For single category update, update just that category
      arrayData[category] = items;
    }

    // Save the updated data back to S3
    const putCommand = new PutObjectCommand({
      Bucket: tatBucketName,
      Key: "array_data.json",
      Body: JSON.stringify(arrayData, null, 2),
      ContentType: "application/json",
    });

    await s3Client.send(putCommand);
    res.json({ 
      message: allCategories 
        ? "All technology lists updated successfully" 
        : `Technology list for ${category} updated successfully` 
    });
  } catch (error) {
    logger.error("Error updating array data:", { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

/**
 * Endpoint for fetching tech radar data for the admin page.
 * @route GET /admin/api/tech-radar
 * @returns {Object} The tech radar configuration data
 * @throws {Error} 500 - If JSON fetching fails
 */
app.get("/admin/api/tech-radar", async (req, res) => {
  try {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: "onsRadarSkeleton.json",
    });

    const { Body } = await s3Client.send(command);
    const radarData = JSON.parse(await Body.transformToString());
    
    res.json(radarData);
  } catch (error) {
    logger.error("Error fetching tech radar data:", { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

/**
 * Health check endpoint to verify server status.
 * @route GET /api/health
 * @returns {Object} Health status information
 * @returns {string} response.status - Server status ('healthy')
 * @returns {string} response.timestamp - Current server timestamp
 * @returns {number} response.uptime - Server uptime in seconds
 * @returns {Object} response.memory - Memory usage statistics
 * @returns {number} response.pid - Process ID
 */
app.get("/api/health", (req, res) => {
  logger.info("Health check endpoint called", {
    timestamp: new Date().toISOString(),
  });

  // Add more specific headers
  res.set({
    "Content-Type": "application/json",
    Connection: "keep-alive",
    "Cache-Control": "no-cache",
    "X-Health-Check": "true",
  });

  const healthResponse = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    pid: process.pid,
  };

  logger.debug("Health check details", healthResponse);

  res.status(200).json(healthResponse);
});

/**
 * Endpoint for normalizing technology names in project data.
 * @route POST /admin/api/normalise-technology
 * @param {Object} req.body - The normalization data
 * @param {string} req.body.from - Original technology name
 * @param {string} req.body.to - New technology name
 * @returns {Object} Success message or error response
 * @throws {Error} 400 - If data is invalid
 * @throws {Error} 500 - If normalization operation fails
 */
app.post("/admin/api/normalise-technology", async (req, res) => {
  try {
    const { from, to } = req.body;

    // Validate input
    if (!from || !to) {
      return res.status(400).json({ error: "Both 'from' and 'to' values are required" });
    }

    // Get existing project data
    const command = new GetObjectCommand({
      Bucket: tatBucketName,
      Key: "new_project_data.json",
    });

    let projectData;
    try {
      const { Body } = await s3Client.send(command);
      projectData = JSON.parse(await Body.transformToString());
    } catch (error) {
      logger.error("Error fetching project data:", { error: error.message });
      return res.status(500).json({ error: "Failed to fetch project data" });
    }

    // Update technology names in project data
    let updateCount = 0;
    projectData.projects = projectData.projects.map(project => {
      let updated = false;
      const architecture = project.architecture;
      
      // Update languages
      if (architecture.languages) {
        const mainResult = updateTechnologyInArray(architecture.languages.main, from, to);
        const othersResult = updateTechnologyInArray(architecture.languages.others, from, to);
        
        if (mainResult.updated) {
          architecture.languages.main = mainResult.array;
          updated = true;
        }
        
        if (othersResult.updated) {
          architecture.languages.others = othersResult.array;
          updated = true;
        }
      }

      // Update frameworks
      const frameworksResult = updateTechnologyInArray(architecture.frameworks?.others, from, to);
      if (frameworksResult.updated) {
        architecture.frameworks.others = frameworksResult.array;
        updated = true;
      }

      // Update infrastructure
      const infrastructureResult = updateTechnologyInArray(architecture.infrastructure?.others, from, to);
      if (infrastructureResult.updated) {
        architecture.infrastructure.others = infrastructureResult.array;
        updated = true;
      }

      // Update CICD
      const cicdResult = updateTechnologyInArray(architecture.cicd?.others, from, to);
      if (cicdResult.updated) {
        architecture.cicd.others = cicdResult.array;
        updated = true;
      }

      // Update database
      if (architecture.database) {
        const dbMainResult = updateTechnologyInArray(architecture.database.main, from, to);
        const dbOthersResult = updateTechnologyInArray(architecture.database.others, from, to);
        
        if (dbMainResult.updated) {
          architecture.database.main = dbMainResult.array;
          updated = true;
        }
        
        if (dbOthersResult.updated) {
          architecture.database.others = dbOthersResult.array;
          updated = true;
        }
      }

      // Update supporting tools
      if (project.supporting_tools) {
        const supportingTools = project.supporting_tools;
        
        // Update code_editors
        if (supportingTools.code_editors) {
          const codeEditorsMainResult = updateTechnologyInArray(supportingTools.code_editors.main, from, to);
          const codeEditorsOthersResult = updateTechnologyInArray(supportingTools.code_editors.others, from, to);
          
          if (codeEditorsMainResult.updated) {
            supportingTools.code_editors.main = codeEditorsMainResult.array;
            updated = true;
          }
          
          if (codeEditorsOthersResult.updated) {
            supportingTools.code_editors.others = codeEditorsOthersResult.array;
            updated = true;
          }
        }
        
        // Update user_interface
        if (supportingTools.user_interface) {
          const uiMainResult = updateTechnologyInArray(supportingTools.user_interface.main, from, to);
          const uiOthersResult = updateTechnologyInArray(supportingTools.user_interface.others, from, to);
          
          if (uiMainResult.updated) {
            supportingTools.user_interface.main = uiMainResult.array;
            updated = true;
          }
          
          if (uiOthersResult.updated) {
            supportingTools.user_interface.others = uiOthersResult.array;
            updated = true;
          }
        }
        
        // Update diagrams
        if (supportingTools.diagrams) {
          const diagramsMainResult = updateTechnologyInArray(supportingTools.diagrams.main, from, to);
          const diagramsOthersResult = updateTechnologyInArray(supportingTools.diagrams.others, from, to);
          
          if (diagramsMainResult.updated) {
            supportingTools.diagrams.main = diagramsMainResult.array;
            updated = true;
          }
          
          if (diagramsOthersResult.updated) {
            supportingTools.diagrams.others = diagramsOthersResult.array;
            updated = true;
          }
        }
        
        // Update documentation
        if (supportingTools.documentation) {
          const docMainResult = updateTechnologyInArray(supportingTools.documentation.main, from, to);
          const docOthersResult = updateTechnologyInArray(supportingTools.documentation.others, from, to);
          
          if (docMainResult.updated) {
            supportingTools.documentation.main = docMainResult.array;
            updated = true;
          }
          
          if (docOthersResult.updated) {
            supportingTools.documentation.others = docOthersResult.array;
            updated = true;
          }
        }
        
        // Update communication
        if (supportingTools.communication) {
          const commMainResult = updateTechnologyInArray(supportingTools.communication.main, from, to);
          const commOthersResult = updateTechnologyInArray(supportingTools.communication.others, from, to);
          
          if (commMainResult.updated) {
            supportingTools.communication.main = commMainResult.array;
            updated = true;
          }
          
          if (commOthersResult.updated) {
            supportingTools.communication.others = commOthersResult.array;
            updated = true;
          }
        }
        
        // Update collaboration
        if (supportingTools.collaboration) {
          const collabMainResult = updateTechnologyInArray(supportingTools.collaboration.main, from, to);
          const collabOthersResult = updateTechnologyInArray(supportingTools.collaboration.others, from, to);
          
          if (collabMainResult.updated) {
            supportingTools.collaboration.main = collabMainResult.array;
            updated = true;
          }
          
          if (collabOthersResult.updated) {
            supportingTools.collaboration.others = collabOthersResult.array;
            updated = true;
          }
        }
        
        // Update project_tracking and incident_management if they're string values
        if (typeof supportingTools.project_tracking === 'string' && 
            supportingTools.project_tracking === from) {
          supportingTools.project_tracking = to;
          updated = true;
        }
        
        if (typeof supportingTools.incident_management === 'string' && 
            supportingTools.incident_management === from) {
          supportingTools.incident_management = to;
          updated = true;
        }
      }

      if (updated) {
        updateCount++;
      }

      return project;
    });

    // Save the updated data back to S3
    const putCommand = new PutObjectCommand({
      Bucket: tatBucketName,
      Key: "new_project_data.json",
      Body: JSON.stringify(projectData, null, 2),
      ContentType: "application/json",
    });

    await s3Client.send(putCommand);
    res.json({ 
      message: "Technology names normalised successfully",
      updatedProjects: updateCount
    });
  } catch (error) {
    logger.error("Error normalizing technology names:", { error: error.message });
    res.status(500).json({ error: error.message });
  }
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
