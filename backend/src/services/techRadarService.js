const s3Service = require("./s3Service");
const logger = require("../config/logger");

/**
 * TechRadarService class for managing tech radar data
 */
class TechRadarService {
  constructor() {
    this.radarKey = "onsRadarSkeleton.json";
  }

  /**
   * Get tech radar data
   * @returns {Promise<Object>} Tech radar data
   */
  async getTechRadarData() {
    try {
      return await s3Service.getObject("main", this.radarKey);
    } catch (error) {
      logger.error("Error fetching tech radar data:", { error: error.message });
      throw error;
    }
  }

  /**
   * Update tech radar entries
   * @param {Array} entries - Array of entry objects to update
   * @param {string} role - Role making the request (for logging)
   * @returns {Promise<void>}
   */
  async updateTechRadarEntries(entries, role = "unknown") {
    try {
      // Validate entries is present, is an array, and is not empty
      if (!entries || !Array.isArray(entries) || entries.length === 0) {
        throw new Error("Invalid or empty entries data");
      }

      // Get existing data
      const existingData = await this.getTechRadarData();

      // Get valid quadrant and ring IDs from existing data
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
        throw new Error("Invalid entry structure");
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

      // Save the updated data
      await s3Service.putObject("main", this.radarKey, existingData);

      logger.info(`Tech radar updated successfully by ${role}`, {
        entriesCount: entries.length,
        totalEntries: existingData.entries.length,
      });
    } catch (error) {
      logger.error(`Error updating tech radar (${role}):`, {
        error: error.message,
      });
      throw error;
    }
  }
}

// Export a singleton instance
module.exports = new TechRadarService();
