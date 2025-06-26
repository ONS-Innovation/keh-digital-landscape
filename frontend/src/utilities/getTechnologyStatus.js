import { useData } from '../contexts/dataContext';

/**
 * A React hook that returns a function to get the technology status.
 *
 * @returns {Function} A function that takes a technology name and returns its status
 */
export const useTechnologyStatus = () => {
  const { techRadarData, getTechRadarData } = useData();

  /**
   * Get the status of a technology from the radar data
   *
   * @param {string} tech - The technology to get the status for
   * @returns {string|null} - The technology status or null if not found
   */
  const getTechnologyStatus = tech => {
    if (!tech) return null;

    // Use existing radar data if available (synchronous path)
    if (techRadarData && techRadarData.entries) {
      return getStatusFromRadarData(tech, techRadarData);
    }

    // If techRadarData is not available, this returns a Promise
    return getTechRadarData().then(radarData => {
      return getStatusFromRadarData(tech, radarData);
    });
  };

  /**
   * Helper function to extract status from radar data
   *
   * @param {string} tech - The technology to get the status for
   * @param {Object} radarData - The radar data to search in
   * @returns {string|null} - The technology status or null if not found
   */
  const getStatusFromRadarData = (tech, radarData) => {
    if (!tech || !radarData || !radarData.entries) {
      return null;
    }

    for (let i = 0; i < radarData.entries.length; i++) {
      if (
        radarData.entries[i].title.toLowerCase() === tech.trim().toLowerCase()
      ) {
        const entry = radarData.entries[i];
        if (!entry.timeline || entry.timeline.length === 0) {
          return null;
        }

        const lastTimelineEntry =
          entry.timeline[entry.timeline.length - 1].ringId.toLowerCase();
        if (lastTimelineEntry === 'review' || lastTimelineEntry === 'ignore') {
          continue;
        }

        return lastTimelineEntry;
      }
    }

    return null;
  };

  return getTechnologyStatus;
};
