import React, { useState, useEffect } from "react";
import { fetchTechRadarJSONFromS3 } from "../utilities/getTechRadarJson";
import { fetchCSVFromS3 } from "../utilities/getCSVData";
import Header from "../components/Header/Header";
import "../styles/ReviewPage.css";
import { toast } from "react-hot-toast";
import SkeletonStatCard from "../components/Statistics/Skeletons/SkeletonStatCard";
import MultiSelect from "../components/MultiSelect/MultiSelect";
import InfoBox from "../components/InfoBox/InfoBox";
import ProjectModal from "../components/Projects/ProjectModal";
import { useTechnologyStatus } from "../utilities/getTechnologyStatus";
import { useData } from "../contexts/dataContext";

const ReviewPage = () => {
  const { getUserData } = useData();
  const [currentUser, setCurrentUser] = useState(null);
  const [entries, setEntries] = useState({
    adopt: [],
    trial: [],
    assess: [],
    hold: [],
    review: [],
    ignore: [],
  });
  const [selectedItem, setSelectedItem] = useState(null);
  const [timelineAscending, setTimelineAscending] = useState(false);
  const [expandedTimelineEntry, setExpandedTimelineEntry] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newTechnology, setNewTechnology] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedCategory, setEditedCategory] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSaveConfirmModal, setShowSaveConfirmModal] = useState(false);
  const [showAddConfirmModal, setShowAddConfirmModal] = useState(false);
  const [pendingNewTechnology, setPendingNewTechnology] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [showAddTechnologyModal, setShowAddTechnologyModal] = useState(false);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [pendingMove, setPendingMove] = useState(null);
  const [moveDescription, setMoveDescription] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [projectsData, setProjectsData] = useState(null);
  const [projectsForTech, setProjectsForTech] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [showProjectCount, setShowProjectCount] = useState(false);
  const [projectCountMap, setProjectCountMap] = useState({});
  const getTechnologyStatus = useTechnologyStatus();

  // Fields to scan from CSV and their corresponding categories
  const fieldsToScan = {
    Language_Main: "Languages",
    Language_Others: "Languages",
    Language_Frameworks: "Frameworks",
    Testing_Frameworks: "Supporting Tools",
    CICD: "Supporting Tools",
    CICD_Orchestration: "Infrastructure",
    Monitoring: "Infrastructure",
    Infrastructure: "Infrastructure",
    Cloud_Services: "Infrastructure",
    IAM_Services: "Infrastructure",
    Containers: "Infrastructure",
    Datastores: "Infrastructure",
  };

  const categoryOptions = [
    { label: "Languages", value: "Languages" },
    { label: "Frameworks", value: "Frameworks" },
    { label: "Supporting Tools", value: "Supporting Tools" },
    { label: "Infrastructure", value: "Infrastructure" },
  ];

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setIsLoading(true);
        const [radarData, csvData, userData] = await Promise.all([
          fetchTechRadarJSONFromS3(),
          fetchCSVFromS3(),
          getUserData(),
        ]);

        const categorizedEntries = categorizeEntries(radarData.entries);
        setEntries(categorizedEntries);
        setProjectsData(csvData);
        setCurrentUser(userData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllData();
  }, [getUserData]);

  // Update project counts when project data is loaded and counts are shown
  useEffect(() => {
    if (projectsData && showProjectCount && Object.keys(projectCountMap).length === 0) {
      calculateAllProjectCounts();
    }
  }, [projectsData, showProjectCount]);

  const categorizeEntries = (radarEntries) => {
    const categorized = {
      adopt: [],
      trial: [],
      assess: [],
      hold: [],
      review: [],
      ignore: [],
    };

    radarEntries.forEach((entry) => {
      const currentRing =
        entry.timeline[entry.timeline.length - 1].ringId.toLowerCase();
      categorized[currentRing].push(entry);
    });

    return categorized;
  };

  // Add this function to calculate ring movement
  const calculateRingMovement = (sourceRing, destRing) => {
    const ringOrder = ["hold", "assess", "trial", "adopt", "review", "ignore"];
    const sourceIndex = ringOrder.indexOf(sourceRing.toLowerCase());
    const destIndex = ringOrder.indexOf(destRing.toLowerCase());

    // If either ring is 'review', 'ignore' or rings are the same, no movement
    if (sourceRing === destRing) {
      return 0;
    }

    // Calculate movement based on index difference
    console.log(destIndex, sourceIndex, destIndex - sourceIndex);
    return destIndex - sourceIndex;
  };

  const handleDragStart = (e, item, sourceList) => {
    e.dataTransfer.setData(
      "text/plain",
      JSON.stringify({
        item,
        sourceList,
      })
    );
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    const dropZone = e.target.closest(".droppable-area");
    if (dropZone) {
      dropZone.classList.add("drag-over");
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    const dropZone = e.target.closest(".droppable-area");
    if (dropZone) {
      dropZone.classList.remove("drag-over");
    }
  };

  const handleDrop = (e, destList) => {
    e.preventDefault();
    const dropZone = e.target.closest(".droppable-area");
    if (dropZone) {
      dropZone.classList.remove("drag-over");
    }

    try {
      const data = JSON.parse(e.dataTransfer.getData("text/plain"));
      const { item, sourceList } = data;

      if (sourceList === destList) return;

      // Set up the pending move
      const lastRing =
        item.timeline[item.timeline.length - 1].ringId.toLowerCase();
      const defaultDescription = `Moved from ${lastRing} to ${destList}`;

      setPendingMove({
        item,
        sourceList,
        destList,
        lastRing,
      });
      setMoveDescription(defaultDescription);
      setShowMoveModal(true);
    } catch (error) {
      console.error("Error handling drop:", error);
    }
  };

  const handleMoveConfirm = () => {
    const { item, sourceList, destList, lastRing } = pendingMove;

    const updatedEntries = { ...entries };
    updatedEntries[sourceList] = updatedEntries[sourceList].filter(
      (entry) => entry.id !== item.id
    );

    const movement = calculateRingMovement(lastRing, destList);
    const now = new Date().toISOString().split("T")[0];

    const updatedItem = {
      ...item,
      timeline: [
        ...item.timeline,
        {
          moved: movement,
          ringId: destList.toLowerCase(),
          date: now,
          description: moveDescription,
          author: currentUser?.user?.email || null,
        },
      ],
    };

    updatedEntries[destList] = [...updatedEntries[destList], updatedItem];
    setEntries(updatedEntries);

    if (selectedItem && selectedItem.id === item.id) {
      setSelectedItem(updatedItem);
    }

    // No need to update project counts as the technology itself hasn't changed,
    // just its location in the radar

    setShowMoveModal(false);
    setPendingMove(null);
    setMoveDescription("");
  };

  const handleMoveCancel = () => {
    setShowMoveModal(false);
    setPendingMove(null);
    setMoveDescription("");
  };

  const handleSaveClick = () => {
    setShowSaveConfirmModal(true);
  };

  const handleSaveConfirmModalYes = async () => {
    try {
      const baseUrl =
        process.env.NODE_ENV === "development"
          ? "http://localhost:5001/review/api/tech-radar/update"
          : "/review/api/tech-radar/update";

      // Combine all entries back into a single array
      const allEntries = [
        ...entries.adopt,
        ...entries.trial,
        ...entries.assess,
        ...entries.hold,
        ...entries.review,
        ...entries.ignore,
      ];

      const response = await fetch(baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ entries: allEntries }),
      });

      if (!response.ok) {
        throw new Error("Failed to save changes");
      }

      toast.success("Changes saved successfully!");
    } catch (error) {
      console.error("Error saving changes:", error);
      toast.error("Failed to save changes. Please try again.");
    } finally {
      setShowSaveConfirmModal(false);
    }
  };

  const handleSaveConfirmModalNo = () => {
    setShowSaveConfirmModal(false);
  };

  const handleItemClick = (item) => {
    // If we're editing and clicking a different item, cancel the edit
    if (isEditing && selectedItem && selectedItem.id !== item.id) {
      setIsEditing(false);
      setEditedTitle("");
      setEditedCategory("");
    }

    // Find projects using this technology
    const projects = findProjectsUsingTechnology(item.title);
    setProjectsForTech(projects);

    setSelectedItem(selectedItem?.id === item.id ? null : item);
  };

  const checkForDuplicateTechnology = (techName) => {
    const allTechnologies = [
      ...entries.adopt,
      ...entries.trial,
      ...entries.assess,
      ...entries.hold,
      ...entries.review,
      ...entries.ignore,
    ];

    return allTechnologies.some(
      (tech) => tech.title.toLowerCase() === techName.toLowerCase()
    );
  };

  const handleTechnologyInputChange = (e) => {
    const value = e.target.value;
    setNewTechnology(value);
    setIsDuplicate(checkForDuplicateTechnology(value));
  };

  const getDuplicateRing = () => {
    const duplicateRing = Object.keys(entries).find((ring) =>
      entries[ring].some(
        (entry) => entry.title.toLowerCase() === newTechnology.toLowerCase()
      )
    );
    return duplicateRing;
  };

  const handleAddClick = () => {
    // Map category to quadrant number
    const categoryToQuadrant = {
      Languages: "1",
      Frameworks: "2",
      "Supporting Tools": "3",
      Infrastructure: "4",
    };

    const newEntry = {
      id: `tech-${Date.now()}`,
      title: newTechnology.trim(),
      description: selectedCategory,
      key: newTechnology.trim().toLowerCase().replace(/\s+/g, ""),
      url: "#",
      quadrant: categoryToQuadrant[selectedCategory],
      timeline: [
        {
          moved: 0,
          ringId: "review",
          date: new Date().toISOString().split("T")[0],
          description: "Added for review",
          author: currentUser?.user?.email || null,
        },
      ],
      links: [],
    };

    setPendingNewTechnology(newEntry);
    setShowAddConfirmModal(true);
    setShowAddTechnologyModal(false);
  };

  const handleEditClick = () => {
    setEditedTitle(selectedItem.title);
    setEditedCategory(selectedItem.description);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedTitle("");
    setEditedCategory("");
  };

  const handleConfirmEdit = () => {
    setShowConfirmModal(true);
    setEditedItem({
      ...selectedItem,
      title: editedTitle,
      description: editedCategory,
      quadrant: categoryToQuadrant[editedCategory],
    });
  };

  const categoryToQuadrant = {
    Languages: "1",
    Frameworks: "2",
    "Supporting Tools": "3",
    Infrastructure: "4",
  };

  const handleConfirmModalYes = () => {
    const currentRing =
      selectedItem.timeline[
        selectedItem.timeline.length - 1
      ].ringId.toLowerCase();

    // Create timeline entry for the change
    const now = new Date().toISOString().split("T")[0];
    const timelineEntry = {
      moved: 0,
      ringId: currentRing,
      date: now,
      description: `Changed from ${selectedItem.title} (${selectedItem.description}) to ${editedTitle} (${editedCategory})`,
      author: currentUser?.user?.email || null,
    };

    // Update the item with new values and timeline
    const updatedItem = {
      ...selectedItem,
      title: editedTitle,
      description: editedCategory,
      quadrant: categoryToQuadrant[editedCategory],
      timeline: [...selectedItem.timeline, timelineEntry],
    };

    // Update entries state
    const updatedEntries = { ...entries };
    updatedEntries[currentRing] = updatedEntries[currentRing].map((item) =>
      item.id === selectedItem.id ? updatedItem : item
    );

    setEntries(updatedEntries);
    setSelectedItem(updatedItem);
    setIsEditing(false);
    setShowConfirmModal(false);
    setEditedTitle("");
    setEditedCategory("");
    toast.success("Technology updated successfully");
  };

  const handleConfirmModalNo = () => {
    setShowConfirmModal(false);
  };

  const handleAddConfirmModalYes = () => {
    setEntries((prev) => ({
      ...prev,
      review: [...prev.review, pendingNewTechnology],
    }));
    setNewTechnology("");
    setSelectedCategory("");
    setPendingNewTechnology(null);
    setShowAddConfirmModal(false);
    
    // Update project count for the new technology if project counts are shown
    if (showProjectCount) {
      const techName = pendingNewTechnology.title;
      setProjectCountMap(prev => ({
        ...prev,
        [techName]: findProjectsUsingTechnology(techName).length
      }));
    }
    
    toast.success("Technology added to Review");
  };

  const handleAddConfirmModalNo = () => {
    setPendingNewTechnology(null);
    setShowAddConfirmModal(false);
  };

  // Add mouse handlers
  const handleMouseDown = (e) => {
    setIsDragging(true);
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging) {
        setDragPosition({
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y,
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  /**
   * Find projects using the selected technology
   * @param {string} tech - The technology name
   * @returns {Array} - Array of projects using the technology
   */
  const findProjectsUsingTechnology = (tech) => {
    if (!projectsData) return [];

    return projectsData.filter((project) => {
      const allTechColumns = [
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
        "Source_Control",
        "Code_Formatter",
        "Monitoring",
        "Datastores",
        "Database_Technologies",
        "Data_Output_Formats",
        "Integrations_ONS",
        "Integrations_External",
        "Project_Tools",
        "Code_Editors",
        "Communication",
        "Collaboration",
        "Incident_Management",
        "Documentation_Tools",
        "UI_Tools",
        "Diagram_Tools",
        "Miscellaneous",
      ];

      return allTechColumns.some((column) => {
        const value = project[column];
        if (!value) return false;

        return value
          .split(";")
          .some((item) => item.trim().toLowerCase() === tech.toLowerCase());
      });
    });
  };

  const handleProjectClick = (project) => {
    setSelectedProject(project);
    setIsProjectModalOpen(true);
  };

  const renderTimeline = () => {
    if (!selectedItem) {
      return null;
    }

    return (
      <InfoBox
        isAdmin={true}
        selectedItem={selectedItem}
        initialPosition={{ x: 24, y: 80 }}
        onClose={() => setSelectedItem(null)}
        timelineAscending={timelineAscending}
        setTimelineAscending={setTimelineAscending}
        selectedTimelineItem={expandedTimelineEntry}
        setSelectedTimelineItem={setExpandedTimelineEntry}
        projectsForTech={projectsForTech}
        handleProjectClick={handleProjectClick}
        onEditConfirm={(title, category) => {
          setEditedTitle(title);
          setEditedCategory(category);
          handleConfirmEdit();
        }}
        onEditCancel={handleCancelEdit}
      />
    );
  };

  /**
   * Calculates project counts for all technologies
   * @returns {void}
   */
  const calculateAllProjectCounts = () => {
    if (!projectsData) return;
    
    const countMap = {};
    
    // Get all technologies from all entries
    const allTechnologies = Object.values(entries)
      .flat()
      .map(entry => entry.title);
    
    // Calculate counts for each technology
    allTechnologies.forEach(tech => {
      if (!countMap[tech]) {
        countMap[tech] = findProjectsUsingTechnology(tech).length;
      }
    });
    
    setProjectCountMap(countMap);
  };

  /**
   * Toggle showing project counts
   * @returns {void}
   */
  const toggleProjectCount = () => {
    const newState = !showProjectCount;
    setShowProjectCount(newState);
    
    // Calculate project counts when enabling the feature
    if (newState && Object.keys(projectCountMap).length === 0) {
      calculateAllProjectCounts();
    }
  };

  /**
   * Renders a box with a list of technologies
   * @param {string} title - The title of the box
   * @param {Array} items - Array of technology items to display
   * @param {string} id - The ID of the box
   * @returns {React.ReactNode} - The rendered box
   */
  const renderBox = (title, items, id) => {
    if (isLoading) {
      return (
        <div className="admin-box">
          <h2>{title.charAt(0).toUpperCase() + title.slice(1)}</h2>
          <div className="droppable-area">
            {[1, 2, 3].map((i) => (
              <SkeletonStatCard key={i} />
            ))}
          </div>
        </div>
      );
    }

    /**
     * Filters items based on search term and selected categories
     * @param {Array} items - Array of technology items to filter
     * @returns {Array} Filtered array of items matching search and category criteria
     */
    const filteredItems = items.filter((item) => {
      const matchesSearch =
        searchTerm === "" ||
        item.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategories =
        selectedCategories.length === 0 ||
        selectedCategories.some((cat) => cat.value === item.description);
      return matchesSearch && matchesCategories;
    });

    /**
     * Groups filtered items by their description category
     * @param {Array} filteredItems - Array of filtered technology items
     * @returns {Object} Object with description keys mapping to arrays of items
     */
    const groupedItems = filteredItems.reduce((acc, item) => {
      const description = item.description || "Other";
      if (!acc[description]) {
        acc[description] = [];
      }
      acc[description].push(item);
      return acc;
    }, {});

    return (
      <div className={`admin-box ${title.toLowerCase()}-box`}>
        <h2>{title.charAt(0).toUpperCase() + title.slice(1)}</h2>
        <div
          className="droppable-area"
          tabIndex={0}
          role="region"
          aria-label={`Drop area for ${title}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, id)}
        >
          {Object.entries(groupedItems).map(([description, groupItems]) => (
            <div key={description} className="droppable-group">
              <div className="droppable-group-header">{description}</div>
              <div className="droppable-group-items">
                {groupItems.map((item) => {
                  const projectCount = showProjectCount ? (projectCountMap[item.title] || 0) : 0;
                  return (
                    <div
                      key={item.id}
                      className="draggable-item"
                      draggable
                      onDragStart={(e) => handleDragStart(e, item, id)}
                      onClick={() => handleItemClick(item)}
                      style={{
                        backgroundColor:
                          selectedItem?.id === item.id
                            ? "hsl(var(--accent))"
                            : undefined,
                      }}
                    >
                      <div className="draggable-item-content">
                        <span className="item-title">{item.title}</span>
                        {showProjectCount && projectCount > 0 && (
                          <span className="project-count-badge">{projectCount}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  /**
   * Renders a list of technologies with statuses
   * @param {string} technologies - The technologies to render
   * @returns {React.ReactNode} - The rendered list of technologies
   */
  const renderTechnologyList = (technologies) => {
    if (!technologies) return null;

    return technologies.split(";").map((tech, index) => {
      const trimmedTech = tech.trim();
      const status = getTechnologyStatus(trimmedTech);

      return (
        <span key={index}>
          {index > 0 && "; "}
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

  const handleTechClick = (tech) => {
    const foundTech = Object.values(entries)
      .flat()
      .find(entry => entry.title.toLowerCase() === tech.toLowerCase());
    
    if (foundTech) {
      setIsProjectModalOpen(false);
      handleItemClick(foundTech);
    }
  };

  return (
    <>
      <Header
        searchTerm={searchTerm}
        onSearchChange={(value) => setSearchTerm(value)}
        searchResults={[]}
        onSearchResultClick={() => {}}
        hideSearch={false}
      />
      <div className="admin-page">
        <div className="admin-details">
          <div className="admin-header-left">
            <div className="admin-review-title">
              <h1>Reviewer Dashboard</h1>
            </div>
            <div className="admin-filter-search-flex">
              <div className="admin-filter-section-container">
                <div className="admin-filter-section">
                  <h2>Filter by Category</h2>
                  <MultiSelect
                    options={categoryOptions}
                    value={selectedCategories}
                    onChange={setSelectedCategories}
                    placeholder="Select categories..."
                  />
                </div>
              </div>
              <div className="admin-actions">
                <div>
                  <h2> Reviewer Actions</h2>
                </div>
                <div className="buttons">
                  <button
                    className="admin-button"
                    onClick={() => setShowAddTechnologyModal(true)}
                    disabled={isLoading}
                    title="Add Technology"
                    aria-label="Add Technology"
                  >
                    Add Technology
                  </button>
                  <button
                    className="admin-button"
                    onClick={toggleProjectCount}
                    title="Toggle Project Count"
                    aria-label="Toggle Project Count"
                  >
                    {showProjectCount ? 'Hide Project Count' : 'Show Project Count'}
                  </button>
                  <button
                    className="admin-button"
                    onClick={handleSaveClick}
                    disabled={isLoading}
                    title="Save Changes"
                    aria-label="Save Changes"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="admin-search-filter">
            {isLoading ? (
              <SkeletonStatCard minWidth="400px" />
            ) : (
              renderTimeline()
            )}
          </div>
        </div>

        <div className="admin-grid-container">
          <div className="admin-grid">
            {renderBox("Adopt", entries.adopt, "adopt")}
            {renderBox("Trial", entries.trial, "trial")}
            {renderBox("Assess", entries.assess, "assess")}
            {renderBox("Hold", entries.hold, "hold")}
          </div>
          <div className="admin-divider"> </div>
          <div className="admin-grid">
            {renderBox("Review", entries.review, "review")}
            {renderBox("Ignore", entries.ignore, "ignore")}
          </div>
        </div>
      </div>
      {showAddTechnologyModal && (
        <div className="modal-overlay">
          <div className="admin-modal">
            <h3>Add New Technology</h3>
            <div className="admin-modal-inputs">
              <div className="admin-modal-field">
                <label>Technology Name</label>
                <input
                  type="text"
                  value={newTechnology}
                  onChange={handleTechnologyInputChange}
                  placeholder="Enter new technology"
                  className={`technology-input`}
                  aria-label="Enter Technology Name"
                />
                {isDuplicate && (
                  <span className="error-message">
                    Error: technology already exists in the{" "}
                    <strong className={`${getDuplicateRing()}-box`}>
                      {getDuplicateRing()}
                    </strong>{" "}
                    ring.
                  </span>
                )}
              </div>
              <div className="admin-modal-field">
                <label>Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="category-select"
                  aria-label="Select Category"
                >
                  <option value="">Select Category</option>
                  <option value="Languages">Languages</option>
                  <option value="Frameworks">Frameworks</option>
                  <option value="Supporting Tools">Supporting Tools</option>
                  <option value="Infrastructure">Infrastructure</option>
                </select>
              </div>
            </div>
            <div className="modal-buttons">
              <button
                onClick={handleAddClick}
                disabled={
                  !newTechnology.trim() || !selectedCategory || isDuplicate
                }
                title="Add Technology"
                aria-label="Add Technology"
              >
                Add
              </button>
              <button
                onClick={() => setShowAddTechnologyModal(false)}
                title="Cancel"
                aria-label="Cancel"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {showConfirmModal && (
        <div className="modal-overlay">
          <div className="admin-modal">
            <h3>Confirm Changes</h3>
            <p>Are you sure you want to update this technology?</p>
            <p className="destructive">
              From: {selectedItem.title} ({selectedItem.description})
            </p>
            <p className="constructive">
              To: {editedTitle} ({editedCategory})
            </p>
            <div className="modal-buttons">
              <button
                onClick={handleConfirmModalYes}
                title="Confirm"
                aria-label="Confirm"
              >
                Yes
              </button>
              <button
                onClick={handleConfirmModalNo}
                title="No"
                aria-label="No"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
      {showSaveConfirmModal && (
        <div className="modal-overlay">
          <div className="admin-modal">
            <h3>WARNING</h3>
            <p>Are you sure you want to save all changes to the Tech Radar?</p>
            <p>This action cannot be undone.</p>
            <div className="modal-buttons">
              <button
                onClick={handleSaveConfirmModalYes}
                title="Yes"
                aria-label="Yes"
              >
                Yes
              </button>
              <button onClick={handleSaveConfirmModalNo}>No</button>
            </div>
          </div>
        </div>
      )}
      {showAddConfirmModal && pendingNewTechnology && (
        <div className="modal-overlay">
          <div className="admin-modal tech-confirm-modal">
            <h3>Add New Technology</h3>
            <p>Are you sure you want to add this technology?</p>
            <div>
              <p>Name:</p>
              <p>{pendingNewTechnology.title}</p>
            </div>
            <div className="modal-automatic">
              <p>Ring:</p>
              <p>
                <i>automatic</i> Review{" "}
              </p>
            </div>
            <div>
              <p>Quadrant:</p>
              <p>{pendingNewTechnology.description}</p>
            </div>
            <div className="modal-buttons">
              <button
                onClick={handleAddConfirmModalYes}
                title="Yes"
                aria-label="Yes"
              >
                Yes
              </button>
              <button
                onClick={handleAddConfirmModalNo}
                title="No"
                aria-label="No"
                >
                No
              </button>
            </div>
          </div>
        </div>
      )}
      {showMoveModal && pendingMove && (
        <div className="modal-overlay">
          <div className="admin-modal">
            <h3>Move Technology</h3>
            <p>Moving {pendingMove.item.title}</p>
            <p>
              From:{" "}
              <span className={pendingMove.lastRing}>
                {pendingMove.lastRing}
              </span>
            </p>
            <p>
              To:{" "}
              <span className={pendingMove.destList}>
                {pendingMove.destList}
              </span>
            </p>
            <div className="admin-modal-field">
              <label>Description</label>
              <textarea
                value={moveDescription}
                onChange={(e) => setMoveDescription(e.target.value)}
                className="technology-input"
                rows={3}
                placeholder="Enter move description. You can use *italic*, **bold**, and [links](url)"
              />
              <small className="markdown-hint">
                Supports: *italic*, **bold**, [link text](url)
              </small>
            </div>
            <div className="modal-buttons">
              <button
                onClick={handleMoveConfirm}
                disabled={moveDescription.length < 1}
                title="Confirm"
                aria-label="Confirm"
              >
                Confirm
              </button>
              <button
                onClick={handleMoveCancel}
                title="Cancel"
                aria-label="Cancel"
              >Cancel</button>
            </div>
          </div>
        </div>
      )}
      {isProjectModalOpen && selectedProject && (
        <ProjectModal
          isOpen={isProjectModalOpen}
          onClose={() => setIsProjectModalOpen(false)}
          project={selectedProject}
          renderTechnologyList={renderTechnologyList}
          onTechClick={handleTechClick}
          getTechnologyStatus={getTechnologyStatus}
        />
      )}
    </>
  );
};

export default ReviewPage;
