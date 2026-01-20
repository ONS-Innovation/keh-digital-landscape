import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import '../styles/App.css';
import Header from '../components/Header/Header';
import { useData } from '../contexts/dataContext';
import {
  IoInformationCircle,
  IoGridOutline,
  IoChevronUpOutline,
  IoChevronDownOutline,
} from 'react-icons/io5';
import ProjectModal from '../components/Projects/ProjectModal';
import InfoBox from '../components/InfoBox/InfoBox';
import { useTechnologyStatus } from '../utilities/getTechnologyStatus';
import { BannerContainer } from '../components/Banner';
import { getDirectorates } from '../utilities/getDirectorates';
import { specialTechMatchers } from '../utilities/getSpecialTechMatchers';
import {
  getDirectorateColour,
  getDirectorateName,
} from '../utilities/directorateUtils';
import sendAlert from '../components/Alerts/Alerts';

/**
 * RadarPage component for displaying the radar page.
 *
 * @returns {JSX.Element} - The RadarPage component.
 */
function RadarPage() {
  const fetchedOnce = useRef(false);
  const projectsFetchedOnce = useRef(false);
  const [data, setData] = useState(null);
  const [selectedBlip, setSelectedBlip] = useState(null);
  const [lockedBlip, setLockedBlip] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isInfoBoxVisible, setIsInfoBoxVisible] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [dragPosition, setDragPosition] = useState({ x: 148, y: 80 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [expandedQuadrants, setExpandedQuadrants] = useState({
    1: true,
    2: true,
    3: true,
    4: true,
  });
  const [filteredQuadrant, setFilteredQuadrant] = useState(null);
  const [projectsData, setProjectsData] = useState(null);
  const [projectsForTech, setProjectsForTech] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [draggingQuadrant, setDraggingQuadrant] = useState(null);
  const [quadrantPositions, setQuadrantPositions] = useState({
    4: null, // top-left
    1: null, // top-right
    3: null, // bottom-left
    2: null, // bottom-right
  });
  const [quadrantDragOffset, setQuadrantDragOffset] = useState({ x: 0, y: 0 });
  const [allBlips, setAllBlips] = useState([]);
  const [selectedTimelineItem, setSelectedTimelineItem] = useState(null);
  const [timelineAscending, setTimelineAscending] = useState(false);
  const [isProjectsModalOpen, setIsProjectsModalOpen] = useState(false);
  const location = useLocation();

  const { getTechRadarData, getCsvData } = useData();
  const getTechnologyStatus = useTechnologyStatus();

  const [selectedDirectorate, setSelectedDirectorate] = useState(null);
  const [defaultDirectorate, setDefaultDirectorate] = useState(null);
  const [directorateColour, setDirectorateColour] = useState('var(--accent)');
  const [directorateName, setDirectorateName] = useState('Unknown Directorate');
  const [directorates, setDirectorates] = useState([]);

  useEffect(() => {
    getDirectorates().then(setDirectorates);
  }, []);

  /**
   * Maps a language to its tech radar equivalent using specialTechMatchers
   *
   * @param {string} language - The language to map
   * @returns {string} - The mapped tech radar language or the original language
   */
  const mapLanguageToTechRadar = language => {
    for (const [techName, matcher] of Object.entries(specialTechMatchers)) {
      if (matcher(language)) {
        return techName;
      }
    }
    return language;
  };

  // Default to directorate with default flag if none selected
  useEffect(() => {
    if (directorates.length > 0 && !selectedDirectorate) {
      const defaultDirectorate = directorates.find(dir => dir.default);
      const directorateId = defaultDirectorate
        ? defaultDirectorate.id
        : directorates[0].id;

      setDefaultDirectorate(directorateId);
      setSelectedDirectorate(directorateId);
      setDirectorateColour(getDirectorateColour(directorateId, directorates));
      setDirectorateName(getDirectorateName(directorateId, directorates));
    }
  }, [directorates]);

  /**
   * useEffect hook to fetch the tech radar data from S3.
   */
  useEffect(() => {
    if (fetchedOnce.current) return;
    fetchedOnce.current = true;
    getTechRadarData()
      .then(data => setData(data))
      .catch(err =>
        sendAlert(
          'Error 🚨',
          err.message,
          'Failed to fetch data for the radar data'
        )
      );
  }, [getTechRadarData]);

  /**
   * useEffect hook to fetch the projects data from S3.
   */
  useEffect(() => {
    if (projectsFetchedOnce.current) return;
    projectsFetchedOnce.current = true;
    const fetchData = async () => {
      try {
        const data = await getCsvData();
        setProjectsData(data);
      } catch (err) {
        sendAlert(
          'Error 🚨',
          err.message,
          'Failed to fetch data for the projects data in the Radar page.'
        );
      }
    };

    fetchData();
  }, [getCsvData]);

  /**
   * Function to filter the timeline based on the selected directorate.
   *
   * This works by filtering the timeline entries to only those that match the selected directorate.
   * If no entries match the selected directorate, it falls back to entries from "Digital Services".
   *
   * @param {Array} timeline - The timeline array of the technology entry.
   * @return {Array} - The filtered timeline.
   */
  const getFilteredTimeline = timeline => {
    let filteredTimeline = [];
    let digitalServicesTimeline = [];

    timeline.forEach(entry => {
      const directorate = entry.directorate || 'Digital Services (DS)';

      if (
        directorate === selectedDirectorate &&
        directorate !== 'Digital Services (DS)'
      ) {
        filteredTimeline.push(entry);
      }
      if (directorate === 'Digital Services (DS)') {
        digitalServicesTimeline.push(entry);
      }
    });

    if (filteredTimeline.length === 0) {
      filteredTimeline = digitalServicesTimeline;
    }

    return filteredTimeline;
  };

  /**
   * Function to get the most recent ring from the timeline, considering the selected directorate.
   *
   * This function filters the timeline using the getFilteredTimeline function and then retrieves the most recent ring ID.
   *
   * @param {Array} timeline - The timeline array of the technology entry.
   * @return {string} - The most recent ring ID.
   */
  const getMostRecentRing = timeline => {
    const filteredTimeline = getFilteredTimeline(timeline);

    // Get the most recent ring from the filtered timeline
    const mostRecentRing = filteredTimeline[filteredTimeline.length - 1].ringId;
    return mostRecentRing;
  };

  /**
   * Function to determine if a technology entry should be highlighted based on the selected directorate.
   *
   * If any timeline entry matches the selected directorate (and it's not "Digital Services"), the entry is highlighted.
   * This is because it is a directorate specific technology.
   *
   * @param {Array} timeline - The timeline array of the technology entry.
   * @return {boolean} - Whether the entry should be highlighted.
   */
  const getShouldBeHighlighted = timeline => {
    const filteredTimeline = getFilteredTimeline(timeline);

    let shouldBeHighlighted = false;

    // TODO: Address highlight logic if needed
    // At the moment, technologies get highlighted if they have directorate specific history (i.e. moved out of Digital Services at any point in time)
    // It is important to highlight these technologies since they will have unique history compared to Digital Services
    // Even if they move back to Digital Services, they will have a different history and should be highlighted
    // This logic may need to be revisited in future if it causes confusion (i.e. Why is this tech highlighted here but not on the review page? Why is this technology highlighted with it matches Digital Services?)

    for (const entry of filteredTimeline) {
      const directorate = entry.directorate || 'Digital Services (DS)';

      if (
        directorate === selectedDirectorate &&
        selectedDirectorate !== 'Digital Services (DS)'
      ) {
        shouldBeHighlighted = true;
        break;
      }
    }

    return shouldBeHighlighted;
  };

  /**
   * handleDirectorateChange function to handle the directorate change event.
   *
   * @param {string} dir - The selected directorate.
   */
  const handleDirectorateChange = dir => {
    dir = Number(dir);

    setSelectedDirectorate(dir);
    setDirectorateColour(getDirectorateColour(dir, directorates));
    setDirectorateName(getDirectorateName(dir, directorates));

    // Clear blip selection when directorate changes
    // This is so stale information doesn't persist within the info box component
    setSelectedBlip(null);
    setLockedBlip(null);
  };

  /**
   * useEffect hook to set the allBlips state with the blips array.
   */
  useEffect(() => {
    if (!data) return;

    const blipsArray = Object.values(data.quadrants)
      .flatMap(quadrant => {
        const quadrantId = quadrant.id;
        return numberedEntries[quadrantId] || [];
      })
      .sort((a, b) => a.number - b.number);

    setAllBlips(blipsArray);
  }, [data]);

  /**
   * useEffect hook to handle the keyboard navigation for the blips.
   */
  useEffect(() => {
    const handleKeyDown = e => {
      if (!lockedBlip || !allBlips.length) return;

      const currentIndex = allBlips.findIndex(
        blip => blip.id === lockedBlip.id
      );
      if (currentIndex === -1) return;

      let nextBlip;

      if (e.key === '1') {
        if (currentIndex > 0) {
          nextBlip = allBlips[currentIndex - 1];
        }
      } else if (e.key === '2') {
        if (currentIndex < allBlips.length - 1) {
          nextBlip = allBlips[currentIndex + 1];
        }
      }

      if (nextBlip) {
        const projects = findProjectsUsingTechnology(nextBlip.title);
        setProjectsForTech(projects);
        setLockedBlip(nextBlip);
        setSelectedBlip(nextBlip);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lockedBlip, allBlips]);

  /**
   * quadrantAngles constant to store the angles for the quadrants.
   */
  const quadrantAngles = {
    1: 45,
    2: 135,
    3: 225,
    4: 315,
  };

  /**
   * ringRadii constant to store the radii for the rings.
   */
  const ringRadii = {
    adopt: [0, 150],
    trial: [150, 250],
    assess: [250, 325],
    hold: [325, 400],
  };

  /**
   * calculateBlipPosition function to calculate the position of the blip.
   *
   * @param {number} quadrant - The quadrant of the blip.
   * @param {string} ring - The ring of the blip.
   * @param {number} index - The index of the blip.
   * @param {number} total - The total number of blips.
   * @returns {Object} - The position of the blip.
   */
  const calculateBlipPosition = (quadrant, ring, index, total) => {
    const baseAngle = quadrantAngles[quadrant];
    const [innerRadius, outerRadius] = ringRadii[ring.toLowerCase()];
    const ringWidth = outerRadius - innerRadius;

    if (filteredQuadrant) {
      // When filtered, distribute evenly around the full circle
      const angleStep = (2 * Math.PI) / total;
      const angle = -Math.PI / 2 + index * angleStep; // Start from top (-90 degrees)

      // Randomize the radius slightly within the ring
      const radiusVariation = ringWidth * 0.4; // Use 40% of ring width for variation
      const radiusOffset = 1 * radiusVariation - radiusVariation / 2;
      const radius = innerRadius + ringWidth / 2 + radiusOffset;

      return {
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
      };
    } else {
      // Normal quadrant view
      const radiusSteps = Math.ceil(Math.sqrt(total));
      const angleSteps = Math.ceil(total / radiusSteps);

      const radiusIndex = Math.floor(index / angleSteps + 0.75);
      const angleIndex = index % angleSteps;

      const radiusStep = ringWidth / (radiusSteps + 2);
      const radius = innerRadius + (radiusIndex + 1) * radiusStep;

      const angleStep = Math.PI / 2.4 / angleSteps;
      const adjustedBaseAngle = (baseAngle - 117.5) * (Math.PI / 180);
      const angle = adjustedBaseAngle + angleIndex * angleStep;

      return {
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
      };
    }
  };

  const getColorForRing = ring => {
    const colors = {
      adopt: '#008a00',
      trial: '#cb00b4',
      assess: '#0069e5',
      hold: '#de001a',
    };
    return colors[ring];
  };
  const handleSearch = term => {
    setSearchTerm(term);
    if (!term.trim()) {
      setSearchResults([]);
      return;
    }
    const results = data.entries
      .filter(entry => {
        // Get the most recent timeline entry
        const mostRecentRing = getMostRecentRing(entry.timeline);

        // Exclude entries where most recent ring is review or ignore
        if (mostRecentRing === 'review' || mostRecentRing === 'ignore') {
          return false;
        }

        // Check if title or description matches search term
        return (
          entry.title.toLowerCase().includes(term.toLowerCase()) ||
          entry.description.toLowerCase().includes(term.toLowerCase())
        );
      })
      .map(entry => ({
        ...entry,
        timeline: getFilteredTimeline(entry.timeline),
      }));

    setSearchResults(results);
  };

  /**
   * handleSearchResultClick function to handle the search result click event.
   *
   * @param {Object} entry - The entry object to handle the click for.
   */
  const handleSearchResultClick = entry => {
    const quadrant = entry.quadrant;
    const entryWithNumber = numberedEntries[quadrant].find(
      e => e.id === entry.id
    );

    const projects = findProjectsUsingTechnology(entry.title);

    setProjectsForTech(projects);
    setLockedBlip(entryWithNumber);
    setSelectedBlip(entryWithNumber);
    setIsInfoBoxVisible(true);

    setSearchTerm('');
    setSearchResults([]);
  };

  /**
   * handleMouseDown function to handle the mouse down event.
   *
   * @param {Event} e - The event object.
   */
  const handleMouseDown = e => {
    setIsDragging(true);
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  /**
   * useEffect hook to handle the mouse move event.
   */
  useEffect(() => {
    const handleMouseMove = e => {
      if (isDragging) {
        setDragPosition({
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y,
        });
      }

      if (draggingQuadrant) {
        setQuadrantPositions(prev => ({
          ...prev,
          [draggingQuadrant]: {
            x: e.clientX - quadrantDragOffset.x,
            y: e.clientY - quadrantDragOffset.y,
          },
        }));
      }
    };

    /**
     * handleMouseUp function to handle the mouse up event.
     */
    const handleMouseUp = () => {
      setIsDragging(false);
      setDraggingQuadrant(null);
    };

    if (isDragging || draggingQuadrant) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset, draggingQuadrant, quadrantDragOffset]);

  /**
   * toggleQuadrant function to toggle the quadrant.
   *
   * @param {number} quadrantId - The quadrant ID to toggle.
   */
  const toggleQuadrant = quadrantId => {
    setExpandedQuadrants(prev => ({
      ...prev,
      [quadrantId]: !prev[quadrantId],
    }));
  };

  /**
   * findProjectsUsingTechnology function to find the projects using the technology.
   *
   * @param {string} tech - The technology to find the projects for.
   * @returns {Array} - The projects using the technology.
   */
  const findProjectsUsingTechnology = tech => {
    if (!projectsData) return [];

    return projectsData.filter(project => {
      const allTechColumns = [
        'Architectures',
        'Language_Main',
        'Language_Others',
        'Language_Frameworks',
        'Infrastructure',
        'CICD',
        'Cloud_Services',
        'IAM_Services',
        'Testing_Frameworks',
        'Containers',
        'Static_Analysis',
        'Source_Control',
        'Code_Formatter',
        'Monitoring',
        'Datastores',
        'Database_Technologies',
        'Data_Output_Formats',
        'Integrations_ONS',
        'Integrations_External',
        'Project_Tools',
        'Code_Editors',
        'Communication',
        'Collaboration',
        'Incident_Management',
        'Documentation_Tools',
        'UI_Tools',
        'Diagram_Tools',
        'Miscellaneous',
      ];

      return allTechColumns.some(column => {
        const value = project[column];
        if (!value) return false;
        const matcher = specialTechMatchers[tech];
        if (matcher) {
          return value.split(';').some(matcher);
        }
        // If there is a colon, extract all techs before colons
        if (value.includes(':')) {
          // Match all non-space sequences before a colon, or all words before a colon
          const techMatches = [...value.matchAll(/([^\s:;]+):/g)].map(match =>
            match[1].trim()
          );
          return techMatches.some(
            techName => techName.toLowerCase() === tech.toLowerCase().trim()
          );
        } else {
          // Otherwise, split by ; and match as usual
          return value
            .split(';')
            .some(
              item => item.trim().toLowerCase() === tech.toLowerCase().trim()
            );
        }
      });
    });
  };

  /**
   * handleBlipClick function to handle the blip click event.
   *
   * @param {Object} entry - The entry object to handle the click for.
   * @param {boolean} fromModal - Whether the click is from the modal.
   */
  const handleBlipClick = (entry, fromModal = false) => {
    const projects = findProjectsUsingTechnology(entry.title);
    setProjectsForTech(projects);
    setIsInfoBoxVisible(true);

    const quadrant = entry.quadrant;
    const entryWithNumber = numberedEntries[quadrant].find(
      e => e.id === entry.id
    );

    if (fromModal) {
      setLockedBlip(entryWithNumber);
      setSelectedBlip(entryWithNumber);
    } else if (lockedBlip?.id === entry.id) {
      setLockedBlip(null);
      setSelectedBlip(null);
    } else {
      setLockedBlip(entryWithNumber);
      setSelectedBlip(entryWithNumber);
    }
  };

  /**
   * handleBlipHover function to handle the blip hover event.
   *
   * @param {Object} entry - The entry object to handle the hover for.
   */
  const handleBlipHover = entry => {
    setSelectedBlip(entry);
    if (entry !== null) {
      const projects = findProjectsUsingTechnology(entry.title);
      setProjectsForTech(projects);
      setIsInfoBoxVisible(true);
    }
  };

  /**
   * handleProjectClick function to handle the project click event.
   *
   * @param {Object} project - The project object to handle the click for.
   */
  const handleProjectClick = project => {
    setSelectedProject(project);
    setIsProjectModalOpen(true);
  };

  /**
   * handleStatsTechClick function to handle the stats tech click event.
   *
   * @param {string} techName - The technology name to handle the click for.
   */
  const handleStatsTechClick = techName => {
    if (!techName) {
      setIsInfoBoxVisible(false);
      return;
    }

    const mappedTechName = mapLanguageToTechRadar(techName);
    const entry = data.entries.find(
      entry => entry.title.toLowerCase() === mappedTechName.toLowerCase()
    );

    if (entry) {
      const quadrant = entry.quadrant;
      const entryWithNumber = numberedEntries[quadrant].find(
        e => e.id === entry.id
      );

      setIsProjectModalOpen(false);
      console.log(isProjectsModalOpen);
      setIsProjectsModalOpen(false);

      handleBlipClick(entryWithNumber, true);
    }
  };

  /**
   * useEffect hook to handle the selected tech from the projects page.
   */
  useEffect(() => {
    if (location.state?.selectedTech) {
      const tech = location.state.selectedTech;
      const mappedTech = mapLanguageToTechRadar(tech);
      const entry = data?.entries.find(
        entry => entry.title.toLowerCase() === mappedTech.toLowerCase()
      );
      if (entry) {
        handleBlipClick(entry, true);
      }
    }
  }, [location.state, data]);

  /**
   * handleTechClick function to handle the tech click event.
   *
   * @param {string} tech - The technology to handle the click for.
   */
  const handleTechClick = tech => {
    const mappedTech = mapLanguageToTechRadar(tech);
    const radarEntry = data.entries.find(
      entry => entry.title.toLowerCase() === mappedTech.toLowerCase().trim()
    );

    if (radarEntry) {
      const quadrant = radarEntry.quadrant;
      const entryWithNumber = numberedEntries[quadrant].find(
        entry => entry.id === radarEntry.id
      );

      setIsProjectModalOpen(false);
      console.log(isProjectsModalOpen);
      setIsProjectsModalOpen(false);

      handleBlipClick(entryWithNumber, true);
    }
  };

  /**
   * renderTechnologyList function to render the technology list.
   *
   * @param {string} technologies - The technologies to render.
   * @returns {JSX.Element|null} - The rendered technology list or null if not found.
   */
  const renderTechnologyList = technologies => {
    if (!technologies) return null;

    return technologies.split(';').map((tech, index) => {
      const trimmedTech = tech.trim();
      const status = getTechnologyStatus(trimmedTech);

      return (
        <span key={index}>
          {index > 0 && '; '}
          {status ? (
            <span
              className={`clickable-tech ${status}`}
              onClick={() => handleTechClick(trimmedTech)}
            >
              {trimmedTech}
            </span>
          ) : (
            trimmedTech
          )}
        </span>
      );
    });
  };

  /**
   * handleQuadrantMouseDown function to handle the quadrant mouse down event.
   *
   * @param {Event} e - The event object.
   * @param {string} quadrantId - The quadrant ID.
   */
  const handleQuadrantMouseDown = (e, quadrantId) => {
    e.stopPropagation();
    if (e.target.closest('.drag-handle')) {
      const rect = e.currentTarget.getBoundingClientRect();
      setQuadrantDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
      setDraggingQuadrant(quadrantId);
    }
  };

  /**
   * handleQuadrantFilter function to handle quadrant filtering.
   *
   * @param {string} quadrantId - The quadrant ID to filter by.
   */
  const handleQuadrantFilter = quadrantId => {
    if (filteredQuadrant === quadrantId) {
      setFilteredQuadrant(null); // Unfilter if clicking the same quadrant
    } else {
      setFilteredQuadrant(quadrantId); // Filter by new quadrant
    }
  };

  if (!data)
    return (
      <div>
        <Header />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading Radar...</p>
        </div>
      </div>
    );

  const groupedEntries = data.entries.reduce((acc, entry) => {
    const quadrant = entry.quadrant;

    const mostRecentRing = getMostRecentRing(entry.timeline);

    // Skip if the most recent timeline entry has ringId of "review" or "ignore"
    if (mostRecentRing === 'review' || mostRecentRing === 'ignore') return acc;

    if (!acc[quadrant]) acc[quadrant] = {};
    if (!acc[quadrant][mostRecentRing]) acc[quadrant][mostRecentRing] = [];

    acc[quadrant][mostRecentRing].push({
      ...entry,
      timeline: getFilteredTimeline(entry.timeline),
    });
    return acc;
  }, {});

  const numberedEntries = {};
  let counter = 1;
  Object.keys(groupedEntries).forEach(quadrant => {
    numberedEntries[quadrant] = [];
    ['adopt', 'trial', 'assess', 'hold'].forEach(ring => {
      if (groupedEntries[quadrant][ring]) {
        groupedEntries[quadrant][ring].forEach(entry => {
          numberedEntries[quadrant].push({
            ...entry,
            number: counter++,
          });
        });
      }
    });
  });

  return (
    <>
      <Header
        searchTerm={searchTerm}
        onSearchChange={handleSearch}
        searchResults={searchResults}
        onSearchResultClick={handleSearchResultClick}
        onOpenProjects={() => setIsProjectsModalOpen(true)}
        onStatsTechClick={handleStatsTechClick}
      />
      <BannerContainer page="radar" />
      <div className="radar-page">
        {isInfoBoxVisible && (
          <InfoBox
            isAdmin={false}
            selectedItem={selectedBlip || lockedBlip}
            initialPosition={{ x: 272, y: 191 }}
            onClose={() => setIsInfoBoxVisible(false)}
            timelineAscending={timelineAscending}
            setTimelineAscending={setTimelineAscending}
            selectedTimelineItem={selectedTimelineItem}
            setSelectedTimelineItem={setSelectedTimelineItem}
            projectsForTech={projectsForTech}
            handleProjectClick={handleProjectClick}
            isHighlighted={getShouldBeHighlighted(
              (selectedBlip || lockedBlip)?.timeline || []
            )}
            selectedDirectorate={directorateName}
          />
        )}

        <div
          className="radar-filter-container"
          style={{
            background: `linear-gradient(to right, hsl(var(--background)), hsl(var(--background)) 20%, ${directorateColour})`,
          }}
        >
          <h2 style={{ margin: 0 }}>Filters</h2>
          <div className="radar-filter-group">
            <label
              htmlFor="directorate-select"
              style={{ paddingRight: '16px' }}
            >
              Directorate:{' '}
            </label>
            <select
              id="directorate-select"
              onChange={e => handleDirectorateChange(e.target.value)}
              className="multi-select-control"
              aria-label="Select Directorate"
            >
              {directorates.map(dir => (
                <option key={dir.name} value={dir.id}>
                  {dir.name}
                </option>
              ))}
            </select>
          </div>

          <div
            id="directorate-title"
            style={{
              fontWeight: 'bold',
              fontSize: '1.6em',
              color: 'white',
              float: 'right',
              textShadow: '1px 1px 2px black',
            }}
          >
            {directorateName}
          </div>
        </div>

        <div className="quadrant-lists">
          <div
            id="top-left-quadrant"
            className={`quadrant-list top-left ${
              expandedQuadrants['4'] ? 'expanded' : 'collapsed'
            }`}
            style={{
              ...(quadrantPositions['4']
                ? {
                    position: 'fixed',
                    left: quadrantPositions['4'].x,
                    top: quadrantPositions['4'].y,
                    margin: 0,
                    zIndex: draggingQuadrant === '4' ? 1000 : 100,
                  }
                : {}),
              cursor: draggingQuadrant === '4' ? 'grabbing' : 'auto',
              boxShadow:
                draggingQuadrant === '4'
                  ? '0 4px 10px 0 hsl(var(--foreground) / 0.1)'
                  : 'none',
            }}
            onMouseDown={e => handleQuadrantMouseDown(e, '4')}
          >
            <div className="quadrant-header">
              <span className="drag-handle">
                <IoGridOutline size={12} />
              </span>
              <div
                className="quadrant-header-content"
                onClick={() => toggleQuadrant('4')}
              >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <h2>{data.quadrants.find(q => q.id === '4').name}</h2>
                  <span className="info-icon">
                    <IoInformationCircle size={18} />
                    <span className="tooltip">Click to view more details</span>
                  </span>
                </div>
                <span
                  className={`accordion-arrow ${
                    expandedQuadrants['4'] ? 'expanded' : ''
                  }`}
                >
                  {expandedQuadrants['4'] ? (
                    <IoChevronUpOutline size={16} />
                  ) : (
                    <IoChevronDownOutline size={16} />
                  )}
                </span>
              </div>
            </div>
            {expandedQuadrants['4'] && (
              <ul
                tabIndex="0"
                role="list"
                aria-label="Infrastructure technologies"
              >
                {numberedEntries['4']?.map((entry, index) => (
                  <li
                    key={entry.id}
                    onClick={() => handleBlipClick(entry)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        handleBlipClick(entry);
                        e.preventDefault();
                      } else if (e.key === 'ArrowDown') {
                        const nextItem = e.target.nextElementSibling;
                        if (nextItem) {
                          nextItem.focus();
                        }
                        e.preventDefault();
                      } else if (e.key === 'ArrowUp') {
                        const prevItem = e.target.previousElementSibling;
                        if (prevItem) {
                          prevItem.focus();
                        }
                        e.preventDefault();
                      }
                    }}
                    tabIndex="0"
                    role="listitem"
                    aria-label={`${entry.title}, ${getMostRecentRing(entry.timeline)} ring`}
                    style={{
                      cursor: 'pointer',
                      borderLeft: getShouldBeHighlighted(entry.timeline)
                        ? `4px solid ${directorateColour}`
                        : 'none',
                      paddingLeft: getShouldBeHighlighted(entry.timeline)
                        ? '8px'
                        : '12px',
                    }}
                  >
                    <span className="entry-number">{entry.number}.</span>
                    <span className="entry-title">{entry.title}</span>
                    <span
                      className={`entry-ring ${getMostRecentRing(entry.timeline).toLowerCase()}`}
                    >
                      {getMostRecentRing(entry.timeline)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div
            className={`quadrant-list top-right ${
              expandedQuadrants['1'] ? 'expanded' : 'collapsed'
            }`}
            style={{
              ...(quadrantPositions['1']
                ? {
                    position: 'fixed',
                    left: quadrantPositions['1'].x,
                    top: quadrantPositions['1'].y,
                    margin: 0,
                    zIndex: draggingQuadrant === '1' ? 1000 : 100,
                  }
                : {}),
              cursor: draggingQuadrant === '1' ? 'grabbing' : 'auto',
              boxShadow:
                draggingQuadrant === '1'
                  ? '0 4px 10px 0 hsl(var(--foreground) / 0.1)'
                  : 'none',
            }}
            onMouseDown={e => handleQuadrantMouseDown(e, '1')}
          >
            <div className="quadrant-header">
              <span className="drag-handle">
                <IoGridOutline size={12} />
              </span>
              <div
                className="quadrant-header-content"
                onClick={() => toggleQuadrant('1')}
              >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <h2>{data.quadrants.find(q => q.id === '1').name}</h2>
                  <span className="info-icon">
                    <IoInformationCircle size={18} />
                    <span className="tooltip">Click to view more details</span>
                  </span>
                </div>
                <span
                  className={`accordion-arrow ${
                    expandedQuadrants['1'] ? 'expanded' : ''
                  }`}
                >
                  {expandedQuadrants['1'] ? (
                    <IoChevronUpOutline size={16} />
                  ) : (
                    <IoChevronDownOutline size={16} />
                  )}
                </span>
              </div>
            </div>
            <ul tabIndex="0" role="list" aria-label="Languages technologies">
              {numberedEntries['1']?.map((entry, index) => (
                <li
                  key={entry.id}
                  onClick={() => handleBlipClick(entry)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      handleBlipClick(entry);
                      e.preventDefault();
                    } else if (e.key === 'ArrowDown') {
                      const nextItem = e.target.nextElementSibling;
                      if (nextItem) {
                        nextItem.focus();
                      }
                      e.preventDefault();
                    } else if (e.key === 'ArrowUp') {
                      const prevItem = e.target.previousElementSibling;
                      if (prevItem) {
                        prevItem.focus();
                      }
                      e.preventDefault();
                    }
                  }}
                  tabIndex="0"
                  role="listitem"
                  aria-label={`${entry.title}, ${getMostRecentRing(entry.timeline)} ring`}
                  style={{
                    cursor: 'pointer',
                    borderLeft: getShouldBeHighlighted(entry.timeline)
                      ? `4px solid ${directorateColour}`
                      : 'none',
                    paddingLeft: getShouldBeHighlighted(entry.timeline)
                      ? '8px'
                      : '12px',
                  }}
                >
                  <span className="entry-number">{entry.number}.</span>
                  <span className="entry-title">{entry.title}</span>
                  <span
                    className={`entry-ring ${getMostRecentRing(entry.timeline).toLowerCase()}`}
                  >
                    {getMostRecentRing(entry.timeline)}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="radar-container" tabIndex={0}>
            <svg width="1000" height="1000" viewBox="-500 -500 1000 1000">
              {/* Rings */}
              {Object.entries(ringRadii).map(([ring, [_, radius]]) => (
                <circle
                  key={ring}
                  cx="0"
                  cy="0"
                  r={radius}
                  className={`ring ${ring}`}
                />
              ))}

              <line
                x1="-500"
                y1="0"
                x2="500"
                y2="0"
                className="quadrant-line"
              />
              <line
                x1="0"
                y1="-500"
                x2="0"
                y2="500"
                className="quadrant-line"
              />

              <text x="0" y="-350" className="ring-label">
                HOLD
              </text>
              <text x="0" y="-275" className="ring-label">
                ASSESS
              </text>
              <text x="0" y="-185" className="ring-label">
                TRIAL
              </text>
              <text x="0" y="0" className="ring-label">
                ADOPT
              </text>

              <g className="quadrant-labels">
                <g
                  transform="translate(250, -400)"
                  className={`quadrant-label ${filteredQuadrant && filteredQuadrant !== '1' ? 'dimmed' : ''}`}
                  onClick={e => {
                    e.stopPropagation();
                    handleQuadrantFilter('1');
                  }}
                >
                  <rect
                    x="-60"
                    y="-20"
                    width="120"
                    height="40"
                    fill="transparent"
                  />
                  <text className="quadrant-label-text">Languages</text>
                </g>
                <g
                  transform="translate(250, 400)"
                  className={`quadrant-label ${filteredQuadrant && filteredQuadrant !== '2' ? 'dimmed' : ''}`}
                  onClick={e => {
                    e.stopPropagation();
                    handleQuadrantFilter('2');
                  }}
                >
                  <rect
                    x="-60"
                    y="-20"
                    width="120"
                    height="40"
                    fill="transparent"
                  />
                  <text className="quadrant-label-text">Frameworks</text>
                </g>
                <g
                  transform="translate(-250, 400)"
                  className={`quadrant-label ${filteredQuadrant && filteredQuadrant !== '3' ? 'dimmed' : ''}`}
                  onClick={e => {
                    e.stopPropagation();
                    handleQuadrantFilter('3');
                  }}
                >
                  <rect
                    x="-60"
                    y="-20"
                    width="120"
                    height="40"
                    fill="transparent"
                  />
                  <text className="quadrant-label-text">Supporting Tools</text>
                </g>
                <g
                  transform="translate(-250, -400)"
                  className={`quadrant-label ${filteredQuadrant && filteredQuadrant !== '4' ? 'dimmed' : ''}`}
                  onClick={e => {
                    e.stopPropagation();
                    handleQuadrantFilter('4');
                  }}
                >
                  <rect
                    x="-60"
                    y="-20"
                    width="120"
                    height="40"
                    fill="transparent"
                  />
                  <text className="quadrant-label-text">Infrastructure</text>
                </g>
              </g>

              {/* Modify the blips rendering section */}
              {Object.entries(groupedEntries).map(
                ([quadrant, rings]) =>
                  (!filteredQuadrant || quadrant === filteredQuadrant) &&
                  Object.entries(rings).map(
                    ([ring, entries]) =>
                      ring !== 'review' &&
                      ring !== 'ignore' &&
                      entries.map((entry, index) => {
                        const position = calculateBlipPosition(
                          quadrant, // Use actual quadrant, the function now handles filtering
                          ring,
                          index,
                          entries.length
                        );
                        const number = numberedEntries[quadrant].find(
                          e => e.id === entry.id
                        ).number;
                        const isSelected = lockedBlip?.id === entry.id;

                        return (
                          <g
                            id={`blip-${entry.id}`}
                            key={entry.id}
                            transform={`translate(${position.x}, ${position.y})`}
                            className="blip-container"
                            onMouseEnter={() =>
                              !lockedBlip &&
                              handleBlipHover(
                                numberedEntries[quadrant].find(
                                  e => e.id === entry.id
                                )
                              )
                            }
                            onMouseLeave={() =>
                              !lockedBlip && handleBlipHover(null)
                            }
                            onClick={() => {
                              handleBlipClick(entry);
                            }}
                          >
                            <circle
                              r="15"
                              className={`blip ${ring.toLowerCase()}`}
                            />
                            {getShouldBeHighlighted(entry.timeline) && (
                              <circle
                                r="15"
                                className="blip-highlight"
                                stroke={directorateColour}
                                strokeWidth="2"
                                fill="none"
                              />
                            )}
                            {isSelected && (
                              <circle
                                r="18"
                                className="blip-highlight"
                                stroke={getColorForRing(ring.toLowerCase())}
                                strokeWidth="2"
                                fill="none"
                              />
                            )}
                            <text
                              className="blip-number"
                              textAnchor="middle"
                              dy=".3em"
                            >
                              {number}
                            </text>
                          </g>
                        );
                      })
                  )
              )}
            </svg>
          </div>

          <div
            className={`quadrant-list bottom-left ${
              expandedQuadrants['3'] ? 'expanded' : 'collapsed'
            }`}
            style={{
              ...(quadrantPositions['3']
                ? {
                    position: 'fixed',
                    left: quadrantPositions['3'].x,
                    top: quadrantPositions['3'].y,
                    margin: 0,
                    zIndex: draggingQuadrant === '3' ? 1000 : 100,
                  }
                : {}),
              cursor: draggingQuadrant === '3' ? 'grabbing' : 'auto',
              boxShadow:
                draggingQuadrant === '3'
                  ? '0 4px 10px 0 hsl(var(--foreground) / 0.1)'
                  : 'none',
            }}
            onMouseDown={e => handleQuadrantMouseDown(e, '3')}
          >
            <div className="quadrant-header">
              <span className="drag-handle">
                <IoGridOutline size={12} />
              </span>
              <div
                className="quadrant-header-content"
                onClick={() => toggleQuadrant('3')}
              >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <h2>{data.quadrants.find(q => q.id === '3').name}</h2>
                  <span className="info-icon">
                    <IoInformationCircle size={18} />
                    <span className="tooltip">Click to view more details</span>
                  </span>
                </div>
                <span
                  className={`accordion-arrow ${
                    expandedQuadrants['3'] ? 'expanded' : ''
                  }`}
                >
                  {expandedQuadrants['3'] ? (
                    <IoChevronUpOutline size={16} />
                  ) : (
                    <IoChevronDownOutline size={16} />
                  )}
                </span>
              </div>
            </div>
            <ul
              tabIndex="0"
              role="list"
              aria-label="Supporting Tools technologies"
            >
              {numberedEntries['3']?.map((entry, index) => (
                <li
                  key={entry.id}
                  onClick={() => handleBlipClick(entry)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      handleBlipClick(entry);
                      e.preventDefault();
                    } else if (e.key === 'ArrowDown') {
                      const nextItem = e.target.nextElementSibling;
                      if (nextItem) {
                        nextItem.focus();
                      }
                      e.preventDefault();
                    } else if (e.key === 'ArrowUp') {
                      const prevItem = e.target.previousElementSibling;
                      if (prevItem) {
                        prevItem.focus();
                      }
                      e.preventDefault();
                    }
                  }}
                  tabIndex="0"
                  role="listitem"
                  aria-label={`${entry.title}, ${getMostRecentRing(entry.timeline)} ring`}
                  style={{
                    cursor: 'pointer',
                    borderLeft: getShouldBeHighlighted(entry.timeline)
                      ? `4px solid ${directorateColour}`
                      : 'none',
                    paddingLeft: getShouldBeHighlighted(entry.timeline)
                      ? '8px'
                      : '12px',
                  }}
                >
                  <span className="entry-number">{entry.number}.</span>
                  <span className="entry-title">{entry.title}</span>
                  <span
                    className={`entry-ring ${getMostRecentRing(entry.timeline).toLowerCase()}`}
                  >
                    {getMostRecentRing(entry.timeline)}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div
            className={`quadrant-list bottom-right ${
              expandedQuadrants['2'] ? 'expanded' : 'collapsed'
            }`}
            style={{
              ...(quadrantPositions['2']
                ? {
                    position: 'fixed',
                    left: quadrantPositions['2'].x,
                    top: quadrantPositions['2'].y,
                    margin: 0,
                    zIndex: draggingQuadrant === '2' ? 1000 : 100,
                  }
                : {}),
              cursor: draggingQuadrant === '2' ? 'grabbing' : 'auto',
              boxShadow:
                draggingQuadrant === '2'
                  ? '0 4px 10px 0 hsl(var(--foreground) / 0.1)'
                  : 'none',
            }}
            onMouseDown={e => handleQuadrantMouseDown(e, '2')}
          >
            <div className="quadrant-header">
              <span className="drag-handle">
                <IoGridOutline size={12} />
              </span>
              <div
                className="quadrant-header-content"
                onClick={() => toggleQuadrant('2')}
              >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <h2>{data.quadrants.find(q => q.id === '2').name}</h2>
                  <span className="info-icon">
                    <IoInformationCircle size={18} />
                    <span className="tooltip">Click to view more details</span>
                  </span>
                </div>
                <span
                  className={`accordion-arrow ${
                    expandedQuadrants['2'] ? 'expanded' : ''
                  }`}
                >
                  {expandedQuadrants['2'] ? (
                    <IoChevronUpOutline size={16} />
                  ) : (
                    <IoChevronDownOutline size={16} />
                  )}
                </span>
              </div>
            </div>
            <ul tabIndex="0" role="list" aria-label="Frameworks technologies">
              {numberedEntries['2']?.map(entry => (
                <li
                  key={entry.id}
                  onClick={() => handleBlipClick(entry)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      handleBlipClick(entry);
                      e.preventDefault();
                    } else if (e.key === 'ArrowDown') {
                      const nextItem = e.target.nextElementSibling;
                      if (nextItem) {
                        nextItem.focus();
                      }
                      e.preventDefault();
                    } else if (e.key === 'ArrowUp') {
                      const prevItem = e.target.previousElementSibling;
                      if (prevItem) {
                        prevItem.focus();
                      }
                      e.preventDefault();
                    }
                  }}
                  tabIndex="0"
                  role="listitem"
                  aria-label={`${entry.title}, ${getMostRecentRing(entry.timeline)} ring`}
                  style={{
                    cursor: 'pointer',
                    borderLeft: getShouldBeHighlighted(entry.timeline)
                      ? `4px solid ${directorateColour}`
                      : 'none',
                    paddingLeft: getShouldBeHighlighted(entry.timeline)
                      ? '8px'
                      : '12px',
                  }}
                >
                  <span className="entry-number">{entry.number}.</span>
                  <span className="entry-title">{entry.title}</span>
                  <span
                    className={`entry-ring ${getMostRecentRing(entry.timeline).toLowerCase()}`}
                  >
                    {getMostRecentRing(entry.timeline)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {isProjectModalOpen && (
          <ProjectModal
            isOpen={isProjectModalOpen}
            onClose={() => setIsProjectModalOpen(false)}
            project={selectedProject}
            renderTechnologyList={renderTechnologyList}
            onTechClick={handleTechClick}
            getTechnologyStatus={getTechnologyStatus}
          />
        )}
      </div>
    </>
  );
}

export default RadarPage;
