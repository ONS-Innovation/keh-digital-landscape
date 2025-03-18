import React, {
  useState,
  useMemo,
  useEffect,
  useCallback,
  useRef,
} from "react";
import {
  IoSearch,
  IoClose,
  IoOptions,
  IoChevronDown,
  IoChevronUp,
  IoRefresh,
  IoFilter,
  IoTrash,
  IoCheckmarkSharp,
  IoChevronForward,
} from "react-icons/io5";
import SkeletonStatCard from "../Statistics/Skeletons/SkeletonStatCard";
import PieChart from "./PieChart";
import "../../styles/components/Projects.css";
import MultiSelect from "../MultiSelect/MultiSelect";
import {
  CLOUD_PROVIDERS,
  PROJECT_STAGES,
  DEVELOPMENT_TYPES,
  DEVELOPMENT_TYPE_CODES,
  HOSTING_TYPES,
  ARCHITECTURE_CATEGORIES,
  CATEGORY_COLOURS
} from "../../constants/projectConstants";

/**
 * Projects component for displaying a list of projects.
 *
 * @param {Object} props - The props passed to the Projects component.
 * @param {boolean} props.isOpen - Whether the projects list is open.
 * @param {Array} props.projectsData - The array of projects data.
 * @param {Function} props.handleProjectClick - Function to handle project click.
 * @param {Function} props.getTechnologyStatus - Function to get technology status.
 * @param {Function} props.onRefresh - Function to refresh the projects data.
 * @param {string} props.searchTerm - The search term to filter projects.
 * @param {Function} props.setSearchTerm - Function to update the search term.
 */
const Projects = ({
  isOpen,
  projectsData,
  handleProjectClick,
  getTechnologyStatus,
  onRefresh,
  searchTerm,
  setSearchTerm,
}) => {
  const [internalSearchTerm, setInternalSearchTerm] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [selectedType, setSelectedType] = useState("adopt");
  const [selectedRatio, setSelectedRatio] = useState("high");
  const [selectedProgrammes, setSelectedProgrammes] = useState([]);
  const [filters, setFilters] = useState({
    stage: [],
    developmentType: [],
    hosting: [],
    architecture: [],
  });
  const [expandedSections, setExpandedSections] = useState({
    stage: true,
    developmentType: false,
    hosting: false,
    architecture: false,
  });
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const filterRef = useRef(null);
  const sortRef = useRef(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isSortOpen &&
        sortRef.current &&
        !sortRef.current.contains(event.target)
      ) {
        setIsSortOpen(false);
      }
      if (
        isFilterDropdownOpen &&
        filterRef.current &&
        !filterRef.current.contains(event.target)
      ) {
        setIsFilterDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isSortOpen, isFilterDropdownOpen]);

  const clearAllFilters = () => {
    setFilters({
      stage: [],
      developmentType: [],
      hosting: [],
      architecture: [],
    });
    setSelectedProgrammes([]);
  };

  const getActiveFilterCount = () => {
    return Object.values(filters).reduce(
      (count, filterGroup) => count + filterGroup.length,
      0
    );
  };

  const handleFilterChange = (category, value) => {
    setFilters((prevFilters) => {
      const updatedFilters = { ...prevFilters };

      if (updatedFilters[category].includes(value)) {
        updatedFilters[category] = updatedFilters[category].filter(
          (item) => item !== value
        );
      } else {
        updatedFilters[category] = [...updatedFilters[category], value];
      }

      return updatedFilters;
    });
  };

  /**
   * calculateTechnologyDistribution function calculates the technology distribution for a given project.
   *
   * @param {Object} project - The project object containing project details.
   * @returns {Object} - An object containing the technology distribution.
   */
  const calculateTechnologyDistribution = useCallback(
    (project) => {
      const techColumns = [
        "Language_Main",
        "Language_Others",
        "Language_Frameworks",
        "Infrastructure",
        "CICD",
        "Cloud_Services",
        "IAM_Services",
        "Testing_Frameworks",
        "Containers",
        "Static_Analysis",
        "Code_Formatter",
        "Monitoring",
        "Datastores",
        "Data_Output_Formats",
        "Integrations_ONS",
        "Integrations_External",
        "Database_Technologies",
      ];

      const technologies = techColumns.reduce((acc, column) => {
        if (project[column]) {
          const techs = project[column].split(";").map((tech) => tech.trim());
          acc.push(...techs);
        }
        return acc;
      }, []);

      const distribution = {
        adopt: 0,
        trial: 0,
        assess: 0,
        hold: 0,
        unknown: 0,
        total: technologies.length,
      };

      technologies.forEach((tech) => {
        const status = getTechnologyStatus(tech);
        if (status && status !== "review" && status !== "ignore") {
          distribution[status]++;
        } else {
          distribution.unknown++;
        }
      });

      return distribution;
    },
    [getTechnologyStatus]
  );

  /**
   * Handles the click event for sorting.
   *
   * @param {string} field - The field to sort by.
   */
  const handleSortClick = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  /**
   * Handles the click event for ring ratio sorting.
   *
   * @param {string} ringType - The ring type to sort by.
   */
  const handleRingSortClick = (ringType) => {
    if (selectedType === ringType) {
      setSelectedRatio(selectedRatio === "high" ? "low" : "high");
    } else {
      setSelectedType(ringType);
      setSelectedRatio("high");
    }
    setSortField("ring-ratio");
  };

  /**
   * Filters and sorts the projects data.
   *
   * @returns {Array} - The filtered and sorted projects data.
   */
  const filteredAndSortedProjects = useMemo(() => {
    let filtered = projectsData || [];

    if (searchTerm.trim()) {
      filtered = filtered.filter((project) => {
        const techColumns = [
          "Language_Main",
          "Language_Others",
          "Language_Frameworks",
          "Infrastructure",
          "CICD",
          "Cloud_Services",
          "IAM_Services",
          "Testing_Frameworks",
          "Containers",
          "Static_Analysis",
          "Code_Formatter",
          "Monitoring",
          "Datastores",
          "Data_Output_Formats",
          "Integrations_ONS",
          "Integrations_External",
          "Database_Technologies",
        ];

        let mainFieldsString =
          `${project.Project || ""} ${project.Project_Short || ""} ${project.Project_Area || ""} ${project.Team || ""}`.toLowerCase();
        let techFieldsString = "";

        techColumns.forEach((column) => {
          if (project[column]) {
            techFieldsString += ` ${project[column]}`;
          }
        });

        techFieldsString = techFieldsString.toLowerCase();
        const searchTermLower = searchTerm.toLowerCase();

        const isMainMatch = mainFieldsString.includes(searchTermLower);
        const isTechMatch = techFieldsString.includes(searchTermLower);
        const isMatch = isMainMatch || isTechMatch;

        if (isMatch) {
          const matchedFields = [];

          const basicFields = [
            { key: "Project", label: "Project" },
            { key: "Project_Short", label: "Project Short" },
            { key: "Team", label: "Team" },
          ];

          basicFields.forEach((field) => {
            if (
              project[field.key] &&
              project[field.key].toLowerCase().includes(searchTermLower)
            ) {
              matchedFields.push(field.label);
            }
          });

          techColumns.forEach((column) => {
            if (
              project[column] &&
              project[column].toLowerCase().includes(searchTermLower)
            ) {
              const readableColumn = column.replace(/_/g, " ");

              const values = project[column].split(";").map((v) => v.trim());
              const matchingValues = values.filter((v) =>
                v.toLowerCase().includes(searchTermLower)
              );

              if (matchingValues.length > 0) {
                matchedFields.push(
                  `${readableColumn} (${matchingValues.join(", ")})`
                );
              } else {
                matchedFields.push(readableColumn);
              }
            }
          });

          project.matchedFields = matchedFields;
        }

        return isMatch;
      });
    }

    if (selectedProgrammes.length > 0) {
      filtered = filtered.filter((project) =>
        selectedProgrammes.some(
          (programme) => programme.value === project.Programme
        )
      );
    }

    // Apply new filters
    if (filters.stage.length > 0) {
      filtered = filtered.filter((project) =>
        filters.stage.includes(project.Stage)
      );
    }

    // Filter by development type
    if (filters.developmentType.length > 0) {
      filtered = filtered.filter((project) => {
        const developmentTypeMap = {
          I: "In House",
          P: "Partner",
          O: "Outsourced",
        };

        // Get the first character of the Developed field as the code
        const typeCode = project.Developed ? project.Developed[0] : "";
        const fullType = developmentTypeMap[typeCode] || "";

        return filters.developmentType.includes(fullType);
      });
    }

    // Filter by hosting
    if (filters.hosting.length > 0) {
      filtered = filtered.filter((project) =>
        filters.hosting.includes(project.Hosted)
      );
    }

    // Filter by architecture
    if (filters.architecture.length > 0) {
      filtered = filtered.filter((project) => {
        if (!project.Architectures) return false;

        const architectures = project.Architectures.split(";").map((arch) =>
          arch.trim()
        );

        // Check for cloud providers
        const hasAWS = architectures.some((arch) =>
          /aws|amazon|ec2|lambda|fargate|ecs|eks/i.test(arch)
        );
        const hasGCP = architectures.some((arch) =>
          /gcp|google cloud/i.test(arch)
        );
        const hasAzure = architectures.some((arch) =>
          /azure|microsoft/i.test(arch)
        );

        // Check if any of the selected architectures match
        return (
          (filters.architecture.includes("AWS") && hasAWS) ||
          (filters.architecture.includes("GCP") && hasGCP) ||
          (filters.architecture.includes("Azure") && hasAzure) ||
          (filters.architecture.includes("Other") &&
            !hasAWS &&
            !hasGCP &&
            !hasAzure &&
            architectures.length > 0)
        );
      });
    }

    return [...filtered].sort((a, b) => {
      const getDistribution = (project) => {
        const distribution = calculateTechnologyDistribution(project);
        return {
          total: distribution.total,
          adoptRatio: distribution.adopt / distribution.total || 0,
          trialRatio: distribution.trial / distribution.total || 0,
          assessRatio: distribution.assess / distribution.total || 0,
          holdRatio: distribution.hold / distribution.total || 0,
        };
      };

      // Get the sortBy value from field and direction
      const sortBy = `${sortField}-${sortDirection}`;

      // Sort by specific ring ratio
      if (sortField === "ring-ratio") {
        const aDistribution = getDistribution(a);
        const bDistribution = getDistribution(b);

        let aValue = 0;
        let bValue = 0;

        switch (selectedType) {
          case "adopt":
            aValue = aDistribution.adoptRatio;
            bValue = bDistribution.adoptRatio;
            break;
          case "trial":
            aValue = aDistribution.trialRatio;
            bValue = bDistribution.trialRatio;
            break;
          case "assess":
            aValue = aDistribution.assessRatio;
            bValue = bDistribution.assessRatio;
            break;
          case "hold":
            aValue = aDistribution.holdRatio;
            bValue = bDistribution.holdRatio;
            break;
          default:
            aValue = aDistribution.adoptRatio;
            bValue = bDistribution.adoptRatio;
        }

        return selectedRatio === "high" ? bValue - aValue : aValue - bValue;
      }

      switch (sortField) {
        case "name":
          return sortDirection === "asc"
            ? (a.Project || "").localeCompare(b.Project || "")
            : (b.Project || "").localeCompare(a.Project || "");
        case "programme":
          return sortDirection === "asc"
            ? (a.Programme || "").localeCompare(b.Programme || "")
            : (b.Programme || "").localeCompare(a.Programme || "");
        case "tech": {
          const aTotal = getDistribution(a).total;
          const bTotal = getDistribution(b).total;
          return sortDirection === "asc"
            ? aTotal - bTotal // least technologies first
            : bTotal - aTotal; // most technologies first
        }
        default:
          return 0;
      }
    });
  }, [
    projectsData,
    searchTerm,
    sortField,
    sortDirection,
    calculateTechnologyDistribution,
    selectedProgrammes,
    selectedType,
    selectedRatio,
    filters,
  ]);

  /**
   * Counts the unique programmes in the filtered and sorted projects.
   *
   * @returns {number} - The number of unique programmes.
   */
  const uniqueProgrammesCount = useMemo(() => {
    if (!filteredAndSortedProjects || filteredAndSortedProjects.length === 0)
      return 0;

    const uniqueProgrammes = new Set();

    filteredAndSortedProjects.forEach((project) => {
      if (project.Programme) {
        uniqueProgrammes.add(project.Programme);
      }
    });

    return uniqueProgrammes.size;
  }, [filteredAndSortedProjects]);

  /**
   * Highlights the search term within the text.
   *
   * @param {string} text - The text to highlight.
   * @param {string} term - The search term to highlight.
   * @returns {string} - The highlighted text.
   */
  const highlightText = (text, term) => {
    if (!term || !text) return text;

    const regex = new RegExp(`(${term})`, "gi");
    const parts = text.split(regex);

    if (parts.length <= 1) return text;

    return parts.map((part, i) =>
      regex.test(part) ? (
        <span key={i} className="highlighted-text">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  /**
   * Generates a deterministic colour from a programme name.
   *
   * @param {string} programmeName - The name of the programme.
   * @returns {string} - The colour of the programme.
   */
  const getProgrammeColour = (programmeName) => {
    if (!programmeName) return "hsl(200, 70%, 50%, 0.2)"; // Default colour

    // Simple hash function for programme name
    let hash = 0;
    for (let i = 0; i < programmeName.length; i++) {
      hash = programmeName.charCodeAt(i) + ((hash << 5) - hash);
    }

    // Convert hash to a hue value (0-360)
    const hue = hash % 360;

    // Return HSL colour with fixed saturation and lightness for consistency
    return `hsl(${hue}, 70%, 50%, 0.2)`;
  };

  /**
   * Gets the first architecture for badge display.
   *
   * @param {string} architectures - The architectures of the project.
   * @returns {string} - The first architecture.
   */
  const getMainArchitecture = (architectures) => {
    if (!architectures) return null;

    const values = architectures.split(";").map((v) => v.trim());
    if (values.length === 0) return null;

    // Look for major cloud providers first
    const providers = CLOUD_PROVIDERS;

    for (const [provider, keywords] of Object.entries(providers)) {
      for (const value of values) {
        if (
          keywords.some((keyword) =>
            value.toLowerCase().includes(keyword.toLowerCase())
          )
        ) {
          return provider;
        }
      }
    }

    // If no major provider found, return the first architecture
    return values[0];
  };

  /**
   * Extracts unique programme options.
   *
   * @returns {Array} - The unique programme options.
   */
  const programmeOptions = useMemo(() => {
    if (!projectsData || projectsData.length === 0) return [];

    const uniqueProgrammes = new Set();

    projectsData.forEach((project) => {
      if (project.Programme) {
        uniqueProgrammes.add(project.Programme);
      }
    });

    return Array.from(uniqueProgrammes)
      .sort()
      .map((programme) => ({
        value: programme,
        label: programme,
      }));
  }, [projectsData]);

  /**
   * Toggles the accordion section.
   *
   * @param {string} section - The section to toggle.
   */
  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="projects-charts-wrapper">
        <div className="projects-content-header">
          <h2>Projects</h2>
          <div className="projects-content-header-flex space-between">
            <span className="projects-modal-content-subtitle">
              Click on a project to view its details. Hover over the coloured
              bar to see the technology distribution.
            </span>
            <div className="projects-search-results">
              <span className="projects-search-count">
                Found <b>{filteredAndSortedProjects.length}</b> project
                {filteredAndSortedProjects.length !== 1 ? "s" : ""} across{" "}
                <b>{uniqueProgrammesCount}</b> programme
                {uniqueProgrammesCount !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </div>
        <div className="projects-charts-container">
          <PieChart
            projectsData={filteredAndSortedProjects}
            title="Project Stages"
            categoryField="Stage"
            categories={PROJECT_STAGES}
            categoryColours={CATEGORY_COLOURS}
          />
          <PieChart
            projectsData={filteredAndSortedProjects}
            title="Development Type"
            categoryField="Developed"
            categories={Object.keys(DEVELOPMENT_TYPE_CODES)}
            categoryLabels={DEVELOPMENT_TYPE_CODES}
            categoryColours={CATEGORY_COLOURS}
            getCategoryValue={(project, field) => {
              const developed = project[field] || "";
              return developed.length > 0 ? developed[0] : "Unknown";
            }}
          />
          <PieChart
            projectsData={filteredAndSortedProjects}
            title="Hosting Platform"
            categoryField="Hosted"
            categories={HOSTING_TYPES}
            categoryColours={CATEGORY_COLOURS}
          />
          <PieChart
            projectsData={filteredAndSortedProjects}
            title="Architectures"
            categoryField="Architectures"
            splitSemicolon={true}
            cloudProvidersOnly={true}
            categoryColours={CATEGORY_COLOURS}
          />
        </div>
      </div>
      <div
        className="projects-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="projects-content-header">
          <div className="projects-content-header-flex flex-end">
            <div className="projects-search-container">
              <div className="projects-filter-wrapper" ref={filterRef}>
                <button
                  className={`projects-filter-button ${isFilterDropdownOpen ? "active" : ""}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsFilterDropdownOpen(!isFilterDropdownOpen);
                    setIsSortOpen(false);
                  }}
                >
                  <IoFilter />
                  Filter by
                  {getActiveFilterCount() > 0 && (
                    <span className="filter-badge">
                      {getActiveFilterCount()}
                    </span>
                  )}
                </button>
                {isFilterDropdownOpen && (
                  <div className="projects-filter-dropdown">
                    <div className="filter-group">
                      <div
                        className="filter-group-title filter-accordion-header"
                        onClick={() => toggleSection("stage")}
                      >
                        <span>Project Stage</span>
                        <IoChevronForward
                          className={`accordion-icon ${expandedSections.stage ? "expanded" : ""}`}
                        />
                      </div>
                      {expandedSections.stage && (
                        <div className="filter-checkbox-group">
                          {PROJECT_STAGES.map(
                            (stage) => (
                              <label
                                key={stage}
                                className="filter-checkbox-label"
                              >
                                <div className="custom-checkbox">
                                  {filters.stage.includes(stage) && (
                                    <IoCheckmarkSharp className="checkbox-icon" />
                                  )}
                                </div>
                                <input
                                  type="checkbox"
                                  className="sr-only"
                                  checked={filters.stage.includes(stage)}
                                  onChange={() =>
                                    handleFilterChange("stage", stage)
                                  }
                                />
                                <span>{stage}</span>
                              </label>
                            )
                          )}
                        </div>
                      )}
                    </div>

                    <div className="filter-group">
                      <div
                        className="filter-group-title filter-accordion-header"
                        onClick={() => toggleSection("developmentType")}
                      >
                        <span>Development Type</span>
                        <IoChevronForward
                          className={`accordion-icon ${expandedSections.developmentType ? "expanded" : ""}`}
                        />
                      </div>
                      {expandedSections.developmentType && (
                        <div className="filter-checkbox-group">
                          {DEVELOPMENT_TYPES.map((type) => (
                            <label key={type} className="filter-checkbox-label">
                              <div className="custom-checkbox">
                                {filters.developmentType.includes(type) && (
                                  <IoCheckmarkSharp className="checkbox-icon" />
                                )}
                              </div>
                              <input
                                type="checkbox"
                                className="sr-only"
                                checked={filters.developmentType.includes(type)}
                                onChange={() =>
                                  handleFilterChange("developmentType", type)
                                }
                              />
                              <span>{type}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="filter-group">
                      <div
                        className="filter-group-title filter-accordion-header"
                        onClick={() => toggleSection("hosting")}
                      >
                        <span>Hosting</span>
                        <IoChevronForward
                          className={`accordion-icon ${expandedSections.hosting ? "expanded" : ""}`}
                        />
                      </div>
                      {expandedSections.hosting && (
                        <div className="filter-checkbox-group">
                          {HOSTING_TYPES.map((hosting) => (
                            <label
                              key={hosting}
                              className="filter-checkbox-label"
                            >
                              <div className="custom-checkbox">
                                {filters.hosting.includes(hosting) && (
                                  <IoCheckmarkSharp className="checkbox-icon" />
                                )}
                              </div>
                              <input
                                type="checkbox"
                                className="sr-only"
                                checked={filters.hosting.includes(hosting)}
                                onChange={() =>
                                  handleFilterChange("hosting", hosting)
                                }
                              />
                              <span>{hosting}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="filter-group">
                      <div
                        className="filter-group-title filter-accordion-header"
                        onClick={() => toggleSection("architecture")}
                      >
                        <span>Architectures</span>
                        <IoChevronForward
                          className={`accordion-icon ${expandedSections.architecture ? "expanded" : ""}`}
                        />
                      </div>
                      {expandedSections.architecture && (
                        <div className="filter-checkbox-group">
                          {ARCHITECTURE_CATEGORIES.map((arch) => (
                            <label key={arch} className="filter-checkbox-label">
                              <div className="custom-checkbox">
                                {filters.architecture.includes(arch) && (
                                  <IoCheckmarkSharp className="checkbox-icon" />
                                )}
                              </div>
                              <input
                                type="checkbox"
                                className="sr-only"
                                checked={filters.architecture.includes(arch)}
                                onChange={() =>
                                  handleFilterChange("architecture", arch)
                                }
                              />
                              <span>{arch}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="programme-filter-wrapper filter-group">
                      <MultiSelect
                        options={programmeOptions}
                        value={selectedProgrammes}
                        onChange={setSelectedProgrammes}
                        placeholder="Filter by Programme"
                      />
                    </div>
                    {getActiveFilterCount() > 0 || selectedProgrammes.length > 0 && (
                      <div className="filter-actions">
                        <button
                          className="clear-filters-button"
                          onClick={clearAllFilters}
                        >
                          <IoTrash /> Clear all filters
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="projects-filter-wrapper" ref={sortRef}>
                <button
                  className={`projects-filter-button ${isSortOpen ? "active" : ""}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsSortOpen(!isSortOpen);
                    setIsFilterDropdownOpen(false);
                  }}
                >
                  <IoOptions />
                  Sort by
                </button>
                {isSortOpen && (
                  <div className="projects-filter-dropdown">
                    <div className="filter-group">
                      <div className="filter-group-title">Sort Options <span className="sort-direction-label">({sortDirection === "asc" ? "ascending" : "descending"})</span></div>
                      <button
                        className={`sort-by-button ${sortField === "name" ? "active" : ""}`}
                        onClick={() => handleSortClick("name")}
                      >
                        Name
                        {sortField === "name" &&
                          (sortDirection === "asc" ? (
                            <IoChevronUp className="sort-arrow" />
                          ) : (
                            <IoChevronDown className="sort-arrow" />
                          ))}
                      </button>
                      <button
                        className={`sort-by-button ${sortField === "programme" ? "active" : ""}`}
                        onClick={() => handleSortClick("programme")}
                      >
                        Programme
                        {sortField === "programme" &&
                          (sortDirection === "asc" ? (
                            <IoChevronUp className="sort-arrow" />
                          ) : (
                            <IoChevronDown className="sort-arrow" />
                          ))}
                      </button>
                      <button
                        className={`sort-by-button ${sortField === "tech" ? "active" : ""}`}
                        onClick={() => handleSortClick("tech")}
                      >
                        Technologies
                        {sortField === "tech" &&
                          (sortDirection === "asc" ? (
                            <IoChevronUp className="sort-arrow" />
                          ) : (
                            <IoChevronDown className="sort-arrow" />
                          ))}
                      </button>
                    </div>

                    <div className="filter-group">
                      <div className="filter-group-title">Technology Ring <span className="sort-direction-label">({selectedRatio === "high" ? "descending" : "ascending"})</span></div>
                      <button
                        className={`sort-by-button ${sortField === "ring-ratio" && selectedType === "adopt" ? "active" : ""}`}
                        onClick={() => handleRingSortClick("adopt")}
                      >
                        Adopt
                        {sortField === "ring-ratio" &&
                          selectedType === "adopt" &&
                          (selectedRatio === "high" ? (
                            <IoChevronDown className="sort-arrow" />
                          ) : (
                            <IoChevronUp className="sort-arrow" />
                          ))}
                      </button>
                      <button
                        className={`sort-by-button ${sortField === "ring-ratio" && selectedType === "trial" ? "active" : ""}`}
                        onClick={() => handleRingSortClick("trial")}
                      >
                        Trial
                        {sortField === "ring-ratio" &&
                          selectedType === "trial" &&
                          (selectedRatio === "high" ? (
                            <IoChevronDown className="sort-arrow" />
                          ) : (
                            <IoChevronUp className="sort-arrow" />
                          ))}
                      </button>
                      <button
                        className={`sort-by-button ${sortField === "ring-ratio" && selectedType === "assess" ? "active" : ""}`}
                        onClick={() => handleRingSortClick("assess")}
                      >
                        Assess
                        {sortField === "ring-ratio" &&
                          selectedType === "assess" &&
                          (selectedRatio === "high" ? (
                            <IoChevronDown className="sort-arrow" />
                          ) : (
                            <IoChevronUp className="sort-arrow" />
                          ))}
                      </button>
                      <button
                        className={`sort-by-button ${sortField === "ring-ratio" && selectedType === "hold" ? "active" : ""}`}
                        onClick={() => handleRingSortClick("hold")}
                      >
                        Hold
                        {sortField === "ring-ratio" &&
                          selectedType === "hold" &&
                          (selectedRatio === "high" ? (
                            <IoChevronDown className="sort-arrow" />
                          ) : (
                            <IoChevronUp className="sort-arrow" />
                          ))}
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <button
                className="projects-filter-button projects-refresh-button"
                onClick={onRefresh}
                title="Refresh the data"
              >
                <IoRefresh />
                Refresh
              </button>
            </div>
          </div>
        </div>

        <div className="projects-list">
          {!projectsData ? (
            <div className="projects-loading-skeleton">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="project-item-skeleton">
                  <SkeletonStatCard />
                  <div className="technology-distribution-skeleton">
                    <div className="distribution-segment-skeleton" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredAndSortedProjects.length > 0 ? (
            filteredAndSortedProjects.map((project, index) => {
              const distribution = calculateTechnologyDistribution(project);
              const total = distribution.total || 1;
              const programmeColour = getProgrammeColour(project.Programme);
              const mainArchitecture = getMainArchitecture(
                project.Architectures
              );

              return (
                <div
                  key={index}
                  className="project-item"
                  onClick={() => handleProjectClick(project)}
                >
                  <div className="project-item-top">
                    <div className="project-item-header">
                      <span className="project-name-full">
                        {searchTerm
                          ? highlightText(project.Project, searchTerm)
                          : project.Project}{" "}
                        {project.Project_Short && (
                          <>
                            (
                            {searchTerm
                              ? highlightText(project.Project_Short, searchTerm)
                              : project.Project_Short}
                            )
                          </>
                        )}
                      </span>
                      {(project.Programme || project.Programme_Short) && (
                        <span className="programme-name-full">
                          <span
                            className="programme-badge"
                            style={{ backgroundColor: programmeColour }}
                          >
                            {project.Programme
                              ? searchTerm
                                ? highlightText(project.Programme, searchTerm)
                                : project.Programme
                              : "No Programme"}{" "}
                            {project.Programme_Short && (
                              <>
                                (
                                {searchTerm
                                  ? highlightText(
                                      project.Programme_Short,
                                      searchTerm
                                    )
                                  : project.Programme_Short}
                                )
                              </>
                            )}
                          </span>
                          <a className="project-documentation-link" href={project.Documentation} target="_blank" rel="noopener noreferrer">
                            Documentation
                          </a>
                        </span>
                      )}
                      <div className="project-item-description">
                        {project.Description &&
                        project.Description.length > 64 ? (
                          searchTerm ? (
                            <>
                              {highlightText(
                                project.Description.substring(0, 128),
                                searchTerm
                              )}
                              ...
                            </>
                          ) : (
                            `${project.Description.substring(0, 128)}...`
                          )
                        ) : searchTerm ? (
                          highlightText(project.Description, searchTerm)
                        ) : (
                          project.Description
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="project-item-bottom">
                    <div className="project-badges">
                      {project.Stage && (
                        <div
                          className={`project-badge ${project.Stage.toLowerCase().replace(/ /g, "-")}`}
                        >
                          {project.Stage}
                        </div>
                      )}
                      {project.Developed && (
                        <div
                          className={`project-badge ${project.Developed[0].toLowerCase().replace(/ /g, "-")}`}
                        >
                          {project.Developed}
                        </div>
                      )}
                      {project.Hosted && (
                        <div
                          className={`project-badge hosted-${project.Hosted.toLowerCase().replace(/ /g, "-")}`}
                        >
                          {project.Hosted}
                        </div>
                      )}
                      {mainArchitecture && (
                        <div
                          className={`project-badge arch-${mainArchitecture.toLowerCase().replace(/ /g, "-")}`}
                        >
                          {mainArchitecture}
                        </div>
                      )}
                    </div>

                    <div className="technology-distribution">
                      {distribution.total > 0 ? (
                        <>
                          {distribution.adopt > 0 && (
                            <div
                              className="distribution-segment adopt"
                              style={{
                                width: `${(distribution.adopt / total) * 100}%`,
                              }}
                              title={`Adopt (${distribution.adopt}/${total})`}
                            >
                              <span className="segment-tooltip">
                                Adopt ({distribution.adopt}/{total})
                              </span>
                            </div>
                          )}
                          {distribution.trial > 0 && (
                            <div
                              className="distribution-segment trial"
                              style={{
                                width: `${(distribution.trial / total) * 100}%`,
                              }}
                              title={`Trial (${distribution.trial}/${total})`}
                            >
                              <span className="segment-tooltip">
                                Trial ({distribution.trial}/{total})
                              </span>
                            </div>
                          )}
                          {distribution.assess > 0 && (
                            <div
                              className="distribution-segment assess"
                              style={{
                                width: `${(distribution.assess / total) * 100}%`,
                              }}
                              title={`Assess (${distribution.assess}/${total})`}
                            >
                              <span className="segment-tooltip">
                                Assess ({distribution.assess}/{total})
                              </span>
                            </div>
                          )}
                          {distribution.hold > 0 && (
                            <div
                              className="distribution-segment hold"
                              style={{
                                width: `${(distribution.hold / total) * 100}%`,
                              }}
                              title={`Hold (${distribution.hold}/${total})`}
                            >
                              <span className="segment-tooltip">
                                Hold ({distribution.hold}/{total})
                              </span>
                            </div>
                          )}
                          {distribution.unknown > 0 && (
                            <div
                              className="distribution-segment unknown"
                              style={{
                                width: `${(distribution.unknown / total) * 100}%`,
                              }}
                              title={`Unknown (${distribution.unknown}/${total})`}
                            >
                              <span className="segment-tooltip">
                                Unknown ({distribution.unknown}/{total})
                              </span>
                            </div>
                          )}
                        </>
                      ) : (
                        <div
                          className="distribution-segment unknown"
                          style={{ width: "100%" }}
                          title="No technologies found"
                        >
                          <span className="segment-tooltip">
                            No technologies found
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="projects-empty-state">No projects found</div>
          )}
        </div>
      </div>
    </>
  );
};

export default Projects;
