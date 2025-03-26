import React, { useState, useEffect, useRef } from "react";
import { ThemeProvider } from "../contexts/ThemeContext";
import Header from "../components/Header/Header";
import "../styles/ReviewPage.css";
import { toast } from "react-hot-toast";
import MultiSelect from "../components/MultiSelect/MultiSelect";

/**
 * Admin page for managing system-wide settings like banners
 */
const AdminPage = () => {
  // Banner management state
  const [bannerTitle, setBannerTitle] = useState("");
  const [bannerMessage, setBannerMessage] = useState("");
  const [bannerType, setBannerType] = useState("info");
  const [selectedPages, setSelectedPages] = useState([]);
  const [existingBanners, setExistingBanners] = useState([]);
  const [showBannerConfirmModal, setShowBannerConfirmModal] = useState(false);
  const [bannerSaveStatus, setBannerSaveStatus] = useState(null);

  // Technology data management state
  const [arrayData, setArrayData] = useState({});
  const [radarData, setRadarData] = useState({ entries: [], quadrants: [] });
  const [selectedCategory, setSelectedCategory] = useState("");
  const [editorContent, setEditorContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedQuadrants, setSelectedQuadrants] = useState([]);
  const [showOnlyCurrentCategory, setShowOnlyCurrentCategory] = useState(false);
  const [hoveredTechnology, setHoveredTechnology] = useState(null);
  const editorRef = useRef(null);
  const textareaRef = useRef(null); // Separate ref for the textarea

  // Page options for banners
  const pageOptions = [
    { label: "Radar", value: "radar" },
    { label: "Statistics", value: "statistics" },
    { label: "Projects", value: "projects" },
  ];

  // Fetch existing banners and technology data on component mount
  useEffect(() => {
    fetchExistingBanners();
    fetchArrayData();
    fetchRadarData();
  }, []);

  /**
   * Fetches existing banners from the backend
   */
  const fetchExistingBanners = async () => {
    try {
      const baseUrl =
        process.env.NODE_ENV === "development"
          ? "http://localhost:5001/admin/api/banners"
          : "/admin/api/banners";

      const response = await fetch(baseUrl);
      if (!response.ok) {
        throw new Error("Failed to fetch banners");
      }

      const data = await response.json();
      if (data.messages && Array.isArray(data.messages)) {
        setExistingBanners(data.messages);
      }
    } catch (error) {
      console.error("Error fetching existing banners:", error);
      toast.error("Failed to load existing banners");
    }
  };

  /**
   * Fetches array data from the backend
   */
  const fetchArrayData = async () => {
    try {
      setIsLoading(true);
      const baseUrl =
        process.env.NODE_ENV === "development"
          ? "http://localhost:5001/admin/api/array-data"
          : "/admin/api/array-data";

      const response = await fetch(baseUrl);
      if (!response.ok) {
        throw new Error("Failed to fetch technology data");
      }

      const data = await response.json();
      setArrayData(data);

      // Set the first category as selected by default
      if (Object.keys(data).length > 0 && !selectedCategory) {
        const firstCategory = Object.keys(data)[0];
        setSelectedCategory(firstCategory);
        updateEditorContent(firstCategory, data);
      }
    } catch (error) {
      console.error("Error fetching array data:", error);
      toast.error("Failed to load technology data");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Updates the editor content for the selected category
   */
  const updateEditorContent = (category, data) => {
    if (!category || !data || !data[category]) return;

    const technologies = data[category] || [];
    // Convert array to line-by-line format
    const formattedContent = technologies.join("\n");
    setEditorContent(formattedContent);
  };

  /**
   * Handles category change
   */
  const handleCategoryChange = (e) => {
    const category = e.target.value;
    setSelectedCategory(category);
    updateEditorContent(category, arrayData);
  };

  /**
   * Handles saving the editor content
   */
  const handleSaveEditorContent = async () => {
    if (!selectedCategory) {
      toast.error("No category selected");
      return;
    }

    // Process the content - split by lines and filter empty lines
    const items = editorContent
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    try {
      const baseUrl =
        process.env.NODE_ENV === "development"
          ? "http://localhost:5001/admin/api/array-data/update"
          : "/admin/api/array-data/update";

      const response = await fetch(baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          category: selectedCategory,
          items,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update technology list");
      }

      // Update local state
      setArrayData({
        ...arrayData,
        [selectedCategory]: items,
      });

      toast.success(
        `Technology list for ${selectedCategory} updated successfully!`
      );
    } catch (error) {
      console.error("Error updating technology list:", error);
      toast.error("Failed to update technology list. Please try again.");
    }
  };

  /**
   * Fetches tech radar data from the backend
   */
  const fetchRadarData = async () => {
    try {
      const baseUrl =
        process.env.NODE_ENV === "development"
          ? "http://localhost:5001/admin/api/tech-radar"
          : "/admin/api/tech-radar";

      const response = await fetch(baseUrl);
      if (!response.ok) {
        throw new Error("Failed to fetch tech radar data");
      }

      const data = await response.json();
      setRadarData(data);
    } catch (error) {
      console.error("Error fetching tech radar data:", error);
      toast.error("Failed to load tech radar data");
    }
  };

  /**
   * Handles saving a banner
   */
  const handleSaveBanner = () => {
    setShowBannerConfirmModal(true);
  };

  /**
   * Confirms saving a banner to the backend
   */
  const handleSaveBannerConfirm = async () => {
    try {
      const baseUrl =
        process.env.NODE_ENV === "development"
          ? "http://localhost:5001/admin/api/banners/update"
          : "/admin/api/banners/update";

      const bannerData = {
        message: bannerMessage,
        title: bannerTitle,
        type: bannerType,
        pages: selectedPages.map((page) => page.value),
        show: true,
      };

      const response = await fetch(baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ banner: bannerData }),
      });

      if (!response.ok) {
        throw new Error("Failed to save banner");
      }

      setBannerSaveStatus("success");
      toast.success("Banner saved successfully!");

      // Clear form after successful save
      setTimeout(() => {
        setBannerMessage("");
        setBannerTitle("");
        setBannerType("info");
        setSelectedPages([]);
        setShowBannerConfirmModal(false);
        setBannerSaveStatus(null);
        fetchExistingBanners(); // Refresh the list of banners
      }, 2000);
    } catch (error) {
      console.error("Error saving banner:", error);
      setBannerSaveStatus("error");
      toast.error("Failed to save banner. Please try again.");
      setShowBannerConfirmModal(false);
    }
  };

  /**
   * Cancels the banner save confirmation
   */
  const handleSaveBannerCancel = () => {
    setShowBannerConfirmModal(false);
  };

  /**
   * Toggles a banner's visibility
   */
  const handleToggleBanner = async (index, shouldShow) => {
    try {
      const baseUrl =
        process.env.NODE_ENV === "development"
          ? "http://localhost:5001/admin/api/banners/toggle"
          : "/admin/api/banners/toggle";

      const banner = existingBanners[index];

      const response = await fetch(baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          index,
          show: shouldShow,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to toggle banner visibility");
      }

      // Update local state
      const updatedBanners = [...existingBanners];
      updatedBanners[index] = {
        ...updatedBanners[index],
        show: shouldShow,
      };
      setExistingBanners(updatedBanners);

      toast.success(`Banner ${shouldShow ? "shown" : "hidden"} successfully`);
    } catch (error) {
      console.error("Error toggling banner:", error);
      toast.error("Failed to update banner visibility");
    }
  };

  /**
   * Deletes a banner
   */
  const handleDeleteBanner = async (index) => {
    try {
      const baseUrl =
        process.env.NODE_ENV === "development"
          ? "http://localhost:5001/admin/api/banners/delete"
          : "/admin/api/banners/delete";

      const response = await fetch(baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ index }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete banner");
      }

      // Update local state
      const updatedBanners = existingBanners.filter((_, i) => i !== index);
      setExistingBanners(updatedBanners);

      toast.success("Banner deleted successfully");
    } catch (error) {
      console.error("Error deleting banner:", error);
      toast.error("Failed to delete banner");
    }
  };

  /**
   * Gets radar entries grouped by ring, filtered by selected quadrants if any
   */
  const getRadarEntriesByRing = () => {
    const ringGroups = {};

    if (radarData && radarData.entries) {
      radarData.entries.forEach((entry) => {
        // Get the most recent ring from timeline
        if (entry.timeline && entry.timeline.length > 0) {
          // Apply quadrant filter if any quadrants are selected
          if (
            selectedQuadrants.length > 0 &&
            !selectedQuadrants.some((q) => q.id === entry.quadrant)
          ) {
            return;
          }

          // Apply category filter if enabled
          if (showOnlyCurrentCategory && !isInCurrentCategory(entry.title)) {
            return;
          }

          // Sort timeline by moved property (descending)
          const sortedTimeline = [...entry.timeline].sort(
            (a, b) => b.moved - a.moved
          );
          const currentRing = sortedTimeline[0].ringId;

          if (!ringGroups[currentRing]) {
            ringGroups[currentRing] = [];
          }

          ringGroups[currentRing].push(entry);
        }
      });
    }
    // Order rings in specific sequence
    const orderedRingGroups = {
      adopt: ringGroups.adopt || [],
      assess: ringGroups.assess || [],
      trial: ringGroups.trial || [],
      hold: ringGroups.hold || [],
      review: ringGroups.review || [],
      ignore: ringGroups.ignore || [],
    };

    return orderedRingGroups;
  };

  /**
   * Gets quadrant options from radar data
   */
  const getQuadrantOptions = () => {
    if (!radarData || !radarData.quadrants) return [];

    return radarData.quadrants.map((quadrant) => ({
      label: quadrant.name,
      value: quadrant.name,
      id: quadrant.id,
    }));
  };

  /**
   * Checks if a technology is in the current selected category
   */
  const isInCurrentCategory = (technology) => {
    if (!selectedCategory || !arrayData || !arrayData[selectedCategory])
      return false;

    // Case-insensitive check for the technology in the selected category
    return arrayData[selectedCategory].some(
      (tech) => tech.toLowerCase() === technology.toLowerCase()
    );
  };

  /**
   * Finds all categories that contain a technology
   */
  const findTechnologyCategories = (technology) => {
    if (!technology || !arrayData) return [];

    return Object.keys(arrayData).filter(
      (category) =>
        category !== selectedCategory && // Don't include the current category
        arrayData[category] &&
        arrayData[category].some(
          (tech) => tech.toLowerCase() === technology.toLowerCase()
        )
    );
  };

  /**
   * Highlights the line in the editor that matches the hovered technology
   */
  const handleTechRadarItemHover = (technology) => {
    if (!isInCurrentCategory(technology)) return;
    
    setHoveredTechnology(technology);
    
    if (editorRef.current) {
      const editorLines = editorContent.split('\n');
      const lineIndex = editorLines.findIndex(line => 
        line.trim().toLowerCase() === technology.toLowerCase()
      );
      
      if (lineIndex >= 0) {
        // Calculate the position to scroll to
        const lineHeight = 24; // Approximate line height in pixels
        const scrollPosition = lineHeight * lineIndex;
        
        // Scroll to the position
        editorRef.current.scrollTop = scrollPosition;
      }
    }
  };

  /**
   * Clear the highlight when mouse leaves
   */
  const handleTechRadarItemLeave = () => {
    setHoveredTechnology(null);
  };

  /**
   * Render the editor content with a custom div-based editor to allow for line highlighting
   */
  const renderEditorContent = () => {
    // For the basic textarea version
    const handleTextAreaChange = (e) => {
      setEditorContent(e.target.value);
    };

    // Keep track of scroll position between textarea and display view
    const handleEditorScroll = (e) => {
      if (textareaRef.current && e.target !== textareaRef.current) {
        textareaRef.current.scrollTop = e.target.scrollTop;
      }
    };

    // For line highlighting, we'll render each line separately
    const renderCodeWithHighlight = () => {
      const lines = editorContent.split('\n');
      
      return (
        <div 
          ref={editorRef}
          className="simple-editor" 
          style={{ 
            whiteSpace: 'pre', 
            overflowY: 'auto', 
            height: '100%',
            width: '100%',
            padding: '16px',
          }}
          onScroll={handleEditorScroll}
        >
          {lines.map((line, index) => {
            const isHighlighted = hoveredTechnology && 
              line.trim().toLowerCase() === hoveredTechnology.toLowerCase();
            
            return (
              <div 
                key={index} 
                className={isHighlighted ? 'highlight-line' : ''}
                style={{ lineHeight: '1.5' }}
              >
                {line.length > 0 ? line : ' '}
              </div>
            );
          })}
        </div>
      );
    };

    // Handle clicking on the highlighting view to re-focus textarea
    const handleEditorClick = () => {
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    };

    return (
      <div 
        style={{ position: 'relative', height: '100%', width: '100%' }}
        onClick={handleEditorClick}
      >
        <textarea
          ref={textareaRef}
          value={editorContent}
          onChange={handleTextAreaChange}
          style={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%', 
            height: '100%',
            opacity: hoveredTechnology ? 0 : 1,
            zIndex: hoveredTechnology ? 0 : 1
          }}
          className="simple-editor"
          placeholder="Enter each technology on a new line"
          spellCheck="false"
          onScroll={handleEditorScroll}
        />
        
        {hoveredTechnology && (
          <div 
            style={{ 
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%', 
              height: '100%',
              zIndex: 2,
              pointerEvents: 'none' // Allow clicks to pass through to the textarea
            }}
          >
            {renderCodeWithHighlight()}
          </div>
        )}
      </div>
    );
  };

  return (
    <ThemeProvider>
      <Header hideSearch={true} />
      <div className="admin-page">
        <div className="admin-details">
          <div className="admin-header-left">
            <div className="admin-review-title">
              <h1>Admin Dashboard</h1>
              <span>Manage system-wide settings and configurations</span>
            </div>
          </div>
        </div>

        <div className="admin-container">
          <h2>Banner Management</h2>
          <div className="banner-management-modal">
            <div className="admin-modal-inputs">
              <div className="admin-modal-field">
                <label>Title</label>
                <input
                  type="text"
                  value={bannerTitle}
                  onChange={(e) => setBannerTitle(e.target.value)}
                  placeholder="Enter banner title"
                  className="technology-input"
                />
              </div>

              <div className="admin-modal-field">
                <label>Message</label>
                <textarea
                  value={bannerMessage}
                  onChange={(e) => setBannerMessage(e.target.value)}
                  placeholder="Enter banner message"
                  className="technology-input"
                  rows={4}
                />
              </div>

              <div className="admin-modal-field">
                <label>Type</label>
                <div className="banner-type-selector">
                  <div
                    className={`banner-type-option ${bannerType === "info" ? "selected" : ""}`}
                    onClick={() => setBannerType("info")}
                  >
                    <span className="banner-type-indicator info"></span>
                    Info
                  </div>
                  <div
                    className={`banner-type-option ${bannerType === "warning" ? "selected" : ""}`}
                    onClick={() => setBannerType("warning")}
                  >
                    <span className="banner-type-indicator warning"></span>
                    Warning
                  </div>
                  <div
                    className={`banner-type-option ${bannerType === "error" ? "selected" : ""}`}
                    onClick={() => setBannerType("error")}
                  >
                    <span className="banner-type-indicator error"></span>
                    Error
                  </div>
                </div>
              </div>

              <div className="admin-modal-field">
                <label>Display on Pages</label>
                <div className="admin-buttons">
                  <MultiSelect
                    options={pageOptions}
                    value={selectedPages}
                    onChange={setSelectedPages}
                    placeholder="Select pages..."
                  />
                  <button
                    className="admin-button"
                    onClick={handleSaveBanner}
                    disabled={
                      !bannerMessage.trim() ||
                      !bannerTitle.trim() ||
                      selectedPages.length === 0
                    }
                  >
                    Save Banner
                  </button>
                </div>
              </div>

              <div className="admin-modal-field"></div>
            </div>

            {/* Existing Banners */}
            <div className="admin-modal-field">
              <h3 className="existing-banners-title">Existing Banners</h3>
              {existingBanners.length === 0 ? (
                <p>No banners have been created yet.</p>
              ) : (
                <div className="existing-banners">
                  {existingBanners.map((banner, index) => (
                    <div className="banner-item" key={index}>
                      <div className="banner-content">
                        <h4>{banner.title || banner.message}</h4>
                        <p>{banner.message}</p>
                        <div className="banner-actions">
                          <div className="banner-meta">
                            <span
                              className={`banner-type ${banner.type || "info"}`}
                            >
                              {banner.type || "info"}
                            </span>
                            <span className="banner-pages">
                              Pages:{" "}
                              {Array.isArray(banner.pages)
                                ? banner.pages.join(", ")
                                : banner.page || "none"}
                            </span>
                            <span
                              className={`banner-status ${banner.show ? "active" : "hidden"}`}
                            >
                              {banner.show ? "Active" : "Hidden"}
                            </span>
                          </div>
                          <div className="banner-actions">
                            <button
                              className="banner-toggle-btn"
                              onClick={() =>
                                handleToggleBanner(index, !banner.show)
                              }
                            >
                              {banner.show ? "Hide" : "Show"}
                            </button>
                            <button
                              className="banner-delete-btn"
                              onClick={() => handleDeleteBanner(index)}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Technology Data Management Section */}
        <div className="admin-container" style={{ marginTop: "24px" }}>
          <h2>Technology Management</h2>
          <div className="technology-editor-header">
            <div className="admin-modal-field">
              <label>Select Category</label>
              <select
                className="category-select"
                value={selectedCategory}
                onChange={handleCategoryChange}
                disabled={isLoading}
              >
                {Object.keys(arrayData).map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {isLoading ? (
            <p>Loading technology data...</p>
          ) : (
            <div className="tech-management-grid">
              {/* Tech Radar Status - Left column */}
              <div className="tech-radar-status-column">
                <div className="technology-editor-header">
                  <h3 className="existing-banners-title">Tech Radar Status</h3>
                  <div className="tech-radar-filter">
                    <MultiSelect
                      options={getQuadrantOptions()}
                      value={selectedQuadrants}
                      onChange={setSelectedQuadrants}
                      placeholder="Filter by quadrants"
                    />
                    <button
                      className={`admin-button ${showOnlyCurrentCategory ? "active" : ""}`}
                      onClick={() =>
                        setShowOnlyCurrentCategory(!showOnlyCurrentCategory)
                      }
                      title="Show only items in current category"
                    >
                      {showOnlyCurrentCategory
                        ? "Show All"
                        : "Show Current"}
                    </button>
                  </div>
                </div>

                {radarData && radarData.entries ? (
                  <div className="tech-radar-rings">
                    {Object.entries(getRadarEntriesByRing()).map(
                      ([ringId, entries]) => (
                        <div
                          key={ringId}
                          className={`admin-modal-field ${ringId.toLowerCase()}-modal`}
                        >
                          <label className={`ring-label`}>
                            {ringId.charAt(0).toUpperCase() + ringId.slice(1)} (
                            {entries.length})
                          </label>
                          <div className="tech-ring-list">
                            {entries.map((entry) => (
                              <div
                                key={entry.id}
                                className={`tech-radar-item ${isInCurrentCategory(entry.title) ? "in-current-category" : ""}`}
                                onMouseEnter={() => handleTechRadarItemHover(entry.title)}
                                onMouseLeave={handleTechRadarItemLeave}
                              >
                                <span>{entry.title}</span>
                                <span className="tech-radar-quadrant">
                                  {radarData.quadrants.find(
                                    (q) => q.id === entry.quadrant
                                  )?.name || entry.quadrant}
                                  {findTechnologyCategories(entry.title).map(
                                    (category) => (
                                      <span
                                        key={category}
                                        className="category-tag"
                                      >
                                        {category}
                                      </span>
                                    )
                                  )}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    )}

                    {Object.keys(getRadarEntriesByRing()).length === 0 && (
                      <p className="no-results-message">
                        {selectedQuadrants.length > 0
                          ? "No entries match the selected filters."
                          : "No entries found in the tech radar."}
                      </p>
                    )}
                  </div>
                ) : (
                  <p>Loading tech radar data...</p>
                )}
              </div>

              {/* Technology Editor - Right column */}
              <div className="technology-editor-column">
                <div className="technology-editor-container">
                  <div className="technology-editor-header">
                    <h3 className="existing-banners-title">
                      {selectedCategory
                        ? selectedCategory.charAt(0).toUpperCase() +
                          selectedCategory.slice(1)
                        : ""}
                    </h3>
                    <button
                      className="admin-button"
                      onClick={handleSaveEditorContent}
                      disabled={!editorContent.trim() || !selectedCategory}
                    >
                      Save Changes
                    </button>
                  </div>

                  <div className="simple-editor-container">
                    {renderEditorContent()}
                  </div>

                  <div className="editor-help-text">
                    <p>
                      Enter each technology on a new line. Empty lines will be
                      ignored.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {showBannerConfirmModal && (
        <div className="modal-overlay">
          <div className="admin-modal">
            <h3>Confirm Banner Changes</h3>
            <p>Are you sure you want to save these changes?</p>
            <div className="modal-buttons">
              <button onClick={handleSaveBannerConfirm}>Yes</button>
              <button onClick={handleSaveBannerCancel}>No</button>
            </div>
          </div>
        </div>
      )}
    </ThemeProvider>
  );
};

export default AdminPage;
