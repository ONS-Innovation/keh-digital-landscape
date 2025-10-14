const express = require('express');
const s3Service = require('../services/s3Service');
const techRadarService = require('../services/techRadarService');
const logger = require('../config/logger');
const {
  updateTechnologyInArray,
} = require('../utilities/updateTechnologyInArray');
const { verifyJwt, requireAdmin } = require('../services/cognitoService');

const router = express.Router();

// Apply authentication middleware to all admin routes
router.use(verifyJwt);
router.use(requireAdmin);

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
router.post('/tech-radar/update', async (req, res) => {
  try {
    const { entries } = req.body;
    await techRadarService.updateTechRadarEntries(entries, 'admin');
    res.json({ message: 'Tech radar updated successfully' });
  } catch (error) {
    if (error.message.includes('Invalid')) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

/**
 * Endpoint for updating banner messages.
 * @route POST /admin/api/banners/update
 * @param {Object} req.body - The banner data
 * @param {Object} req.body.banner - Banner object with message, pages, and show properties
 * @returns {Object} Success message or error response
 * @throws {Error} 400 - If banner data is invalid
 * @throws {Error} 500 - If update operation fails
 */
router.post('/banners/update', async (req, res) => {
  try {
    const { banner } = req.body;

    // Validate banner data
    if (
      !banner ||
      !banner.message ||
      !Array.isArray(banner.pages) ||
      banner.pages.length === 0
    ) {
      return res.status(400).json({ error: 'Invalid banner data' });
    }

    let messagesData;

    try {
      // Try to get existing messages.json file
      messagesData = await s3Service.getObject('main', 'messages.json');
    } catch (error) {
      // If file doesn't exist, create a new structure
      messagesData = { messages: [] };
      logger.error('Creating new messages.json file: ', error);
    }

    // Add the new banner to messages
    messagesData.messages.push({
      title: banner.title || '',
      message: banner.message,
      description: banner.message, // For backwards compatibility
      type: banner.type || 'info',
      pages: banner.pages,
      show: banner.show !== false, // Default to true if not explicitly set to false
    });

    // Save the updated data
    await s3Service.putObject('main', 'messages.json', messagesData);
    res.json({ message: 'Banner added successfully' });
  } catch (error) {
    logger.error('Error updating banner messages:', { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

/**
 * Endpoint for fetching all banner messages.
 * @route GET /admin/api/banners
 * @returns {Object} Object containing array of banner messages
 * @throws {Error} 500 - If fetching operation fails
 */
router.get('/banners', async (req, res) => {
  try {
    try {
      // Try to get existing messages.json file
      const messagesData = await s3Service.getObject('main', 'messages.json');
      res.json(messagesData);
    } catch (error) {
      // If file doesn't exist, return empty array
      logger.error('No messages file exist:', error);
      res.json({ messages: [] });
    }
  } catch (error) {
    logger.error('Error fetching banner messages:', { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

/**
 * Endpoint for toggling banner visibility.
 * @route POST /admin/api/banners/toggle
 * @param {Object} req.body - The toggle data
 * @param {number} req.body.index - Index of the banner to toggle
 * @param {boolean} req.body.show - Whether to show or hide the banner
 * @returns {Object} Success message or error response
 * @throws {Error} 400 - If index is invalid
 * @throws {Error} 500 - If toggle operation fails
 */
router.post('/banners/toggle', async (req, res) => {
  try {
    const { index, show } = req.body;

    if (index === undefined || typeof index !== 'number') {
      return res.status(400).json({ error: 'Invalid banner index' });
    }

    let messagesData;
    try {
      messagesData = await s3Service.getObject('main', 'messages.json');
    } catch (error) {
      logger.error('Error fetching messages:', error);
      return res.status(400).json({ error: 'Messages file not found' });
    }

    // Check if index is valid
    if (
      !messagesData.messages ||
      index >= messagesData.messages.length ||
      index < 0
    ) {
      return res.status(400).json({ error: 'Banner index out of range' });
    }

    // Update the banner visibility
    messagesData.messages[index].show = show;

    // Save the updated data
    await s3Service.putObject('main', 'messages.json', messagesData);
    res.json({ message: 'Banner visibility updated successfully' });
  } catch (error) {
    logger.error('Error toggling banner visibility:', { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

/**
 * Endpoint for deleting a banner.
 * @route POST /admin/api/banners/delete
 * @param {Object} req.body - The delete data
 * @param {number} req.body.index - Index of the banner to delete
 * @returns {Object} Success message or error response
 * @throws {Error} 400 - If index is invalid
 * @throws {Error} 500 - If delete operation fails
 */
router.post('/banners/delete', async (req, res) => {
  try {
    const { index } = req.body;

    if (index === undefined || typeof index !== 'number') {
      return res.status(400).json({ error: 'Invalid banner index' });
    }

    let messagesData;
    try {
      messagesData = await s3Service.getObject('main', 'messages.json');
    } catch (error) {
      logger.error('Error fetching messages:', error);
      return res.status(400).json({ error: 'Messages file not found' });
    }

    // Check if index is valid
    if (
      !messagesData.messages ||
      index >= messagesData.messages.length ||
      index < 0
    ) {
      return res.status(400).json({ error: 'Banner index out of range' });
    }

    // Remove the banner
    messagesData.messages.splice(index, 1);

    // Save the updated data
    await s3Service.putObject('main', 'messages.json', messagesData);
    res.json({ message: 'Banner deleted successfully' });
  } catch (error) {
    logger.error('Error deleting banner:', { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

/**
 * Endpoint for fetching array data from the Tech Audit Tool bucket.
 * @route GET /admin/api/array-data
 * @returns {Object} Object containing categorised technology arrays
 * @throws {Error} 500 - If fetching operation fails
 */
router.get('/array-data', async (req, res) => {
  try {
    try {
      const arrayData = await s3Service.getObject('tat', 'array_data.json');
      res.json(arrayData);
    } catch (error) {
      logger.error('Error fetching array data:', { error: error.message });
      res.status(500).json({ error: 'Failed to fetch technology data' });
    }
  } catch (error) {
    logger.error('Error in array data endpoint:', { error: error.message });
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
router.post('/array-data/update', async (req, res) => {
  try {
    const { allCategories, category, items } = req.body;

    // Validate input
    if (allCategories) {
      if (!items || typeof items !== 'object') {
        return res.status(400).json({
          error:
            'Invalid data format. Complete items object is required for all categories update.',
        });
      }
    } else {
      if (!category || !items || !Array.isArray(items)) {
        return res.status(400).json({
          error:
            'Invalid data format. Category and items array are required for single category update.',
        });
      }
    }

    // Get existing array data
    let arrayData;
    try {
      arrayData = await s3Service.getObject('tat', 'array_data.json');
    } catch (error) {
      logger.error('Error fetching existing array data:', {
        error: error.message,
      });
      return res
        .status(500)
        .json({ error: 'Failed to fetch existing data for update' });
    }

    // Update the data
    if (allCategories) {
      // For all categories update, replace the entire object
      arrayData = items;
    } else {
      // Validate that the category exists in the current data to prevent category injection
      if (!Object.keys(arrayData).includes(category)) {
        logger.error('Invalid category attempted:', { category });
        return res.status(400).json({
          error: 'Invalid category. The specified category does not exist.',
        });
      }

      // For single category update, update just that category
      arrayData[category] = items;
    }

    // Save the updated data
    await s3Service.putObject('tat', 'array_data.json', arrayData);
    res.json({
      message: allCategories
        ? 'All technology lists updated successfully'
        : `Technology list for ${category} updated successfully`,
    });
  } catch (error) {
    logger.error('Error updating array data:', { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

/**
 * Endpoint for fetching tech radar data for the admin page.
 * @route GET /admin/api/tech-radar
 * @returns {Object} The tech radar configuration data
 * @throws {Error} 500 - If JSON fetching fails
 */
router.get('/tech-radar', async (req, res) => {
  try {
    const radarData = await techRadarService.getTechRadarData();
    res.json(radarData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Endpoint for normalising technology names in project data.
 * @route POST /admin/api/normalise-technology
 * @param {Object} req.body - The normalisation data
 * @param {string} req.body.from - Original technology name
 * @param {string} req.body.to - New technology name
 * @returns {Object} Success message or error response
 * @throws {Error} 400 - If data is invalid
 * @throws {Error} 500 - If normalisation operation fails
 */
router.post('/normalise-technology', async (req, res) => {
  try {
    const { from, to } = req.body;

    // Validate input
    if (!from || !to) {
      return res
        .status(400)
        .json({ error: "Both 'from' and 'to' values are required" });
    }

    // Get existing project data
    let projectData;
    try {
      projectData = await s3Service.getObject('tat', 'new_project_data.json');
    } catch (error) {
      logger.error('Error fetching project data:', { error: error.message });
      return res.status(500).json({ error: 'Failed to fetch project data' });
    }

    // Update technology names in project data
    let updateCount = 0;
    projectData.projects = projectData.projects.map(project => {
      let updated = false;
      const architecture = project.architecture;

      // Update languages
      if (architecture.languages) {
        const mainResult = updateTechnologyInArray(
          architecture.languages.main,
          from,
          to
        );
        const othersResult = updateTechnologyInArray(
          architecture.languages.others,
          from,
          to
        );

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
      const frameworksResult = updateTechnologyInArray(
        architecture.frameworks?.others,
        from,
        to
      );
      if (frameworksResult.updated) {
        architecture.frameworks.others = frameworksResult.array;
        updated = true;
      }

      // Update infrastructure
      const infrastructureResult = updateTechnologyInArray(
        architecture.infrastructure?.others,
        from,
        to
      );
      if (infrastructureResult.updated) {
        architecture.infrastructure.others = infrastructureResult.array;
        updated = true;
      }

      // Update CICD
      const cicdResult = updateTechnologyInArray(
        architecture.cicd?.others,
        from,
        to
      );
      if (cicdResult.updated) {
        architecture.cicd.others = cicdResult.array;
        updated = true;
      }

      // Update database
      if (architecture.database) {
        const dbMainResult = updateTechnologyInArray(
          architecture.database.main,
          from,
          to
        );
        const dbOthersResult = updateTechnologyInArray(
          architecture.database.others,
          from,
          to
        );

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
          const codeEditorsMainResult = updateTechnologyInArray(
            supportingTools.code_editors.main,
            from,
            to
          );
          const codeEditorsOthersResult = updateTechnologyInArray(
            supportingTools.code_editors.others,
            from,
            to
          );

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
          const uiMainResult = updateTechnologyInArray(
            supportingTools.user_interface.main,
            from,
            to
          );
          const uiOthersResult = updateTechnologyInArray(
            supportingTools.user_interface.others,
            from,
            to
          );

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
          const diagramsMainResult = updateTechnologyInArray(
            supportingTools.diagrams.main,
            from,
            to
          );
          const diagramsOthersResult = updateTechnologyInArray(
            supportingTools.diagrams.others,
            from,
            to
          );

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
          const docMainResult = updateTechnologyInArray(
            supportingTools.documentation.main,
            from,
            to
          );
          const docOthersResult = updateTechnologyInArray(
            supportingTools.documentation.others,
            from,
            to
          );

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
          const commMainResult = updateTechnologyInArray(
            supportingTools.communication.main,
            from,
            to
          );
          const commOthersResult = updateTechnologyInArray(
            supportingTools.communication.others,
            from,
            to
          );

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
          const collabMainResult = updateTechnologyInArray(
            supportingTools.collaboration.main,
            from,
            to
          );
          const collabOthersResult = updateTechnologyInArray(
            supportingTools.collaboration.others,
            from,
            to
          );

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
        if (
          typeof supportingTools.project_tracking === 'string' &&
          supportingTools.project_tracking === from
        ) {
          supportingTools.project_tracking = to;
          updated = true;
        }

        if (
          typeof supportingTools.incident_management === 'string' &&
          supportingTools.incident_management === from
        ) {
          supportingTools.incident_management = to;
          updated = true;
        }
      }

      if (updated) {
        updateCount++;
      }

      return project;
    });

    // Save the updated data
    await s3Service.putObject('tat', 'new_project_data.json', projectData);
    res.json({
      message: 'Technology names normalised successfully',
      updatedProjects: updateCount,
    });
  } catch (error) {
    logger.error('Error normalising technology names:', {
      error: error.message,
    });
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
