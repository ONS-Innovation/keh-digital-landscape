import React, { useState, useEffect } from "react";
import { fetchTechRadarJSONFromS3 } from "../utilities/getTechRadarJson";
import { fetchCSVFromS3 } from "../utilities/getCSVData";
import Header from "../components/Header/Header";
import { ThemeProvider } from "../contexts/ThemeContext";
import "../styles/ReviewPage.css";
import { toast } from "react-hot-toast";
import SkeletonStatCard from "../components/Statistics/Skeletons/SkeletonStatCard";
import MultiSelect from "../components/MultiSelect/MultiSelect";
import InfoBox from "../components/InfoBox/InfoBox";

const ReviewPage = () => {
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
  const [bannerMessage, setBannerMessage] = useState("");
  const [bannerTitle, setBannerTitle] = useState("");
  const [bannerType, setBannerType] = useState("info");
  const [selectedPages, setSelectedPages] = useState([]);
  const [showBannerConfirmModal, setShowBannerConfirmModal] = useState(false);
  const [bannerSaveStatus, setBannerSaveStatus] = useState(null);
  const [existingBanners, setExistingBanners] = useState([]);
  const [isLoadingBanners, setIsLoadingBanners] = useState(false);
  const [showBannerManagementModal, setShowBannerManagementModal] =
    useState(false);

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
        const [radarData, csvData] = await Promise.all([
          fetchTechRadarJSONFromS3(),
          fetchCSVFromS3(),
        ]);

        const categorizedEntries = categorizeEntries(radarData.entries);
        setEntries(categorizedEntries);

        // After loading both data sources, scan for new technologies
        scanForNewTechnologies(radarData.entries, csvData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllData();
  }, []);

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

  const scanForNewTechnologies = (radarEntries, csvData) => {
    // Create a set of existing technology titles (case insensitive)
    const existingTech = new Set(
      radarEntries.map((entry) => entry.title.toLowerCase())
    );

    const newTechnologies = new Map();

    // Process CSV data
    csvData.forEach((project) => {
      Object.entries(fieldsToScan).forEach(([field, category]) => {
        if (project[field]) {
          // Split by semicolon if multiple values exist
          const technologies = project[field].split(";");

          technologies.forEach((tech) => {
            const trimmedTech = tech.trim();
            if (trimmedTech && !existingTech.has(trimmedTech.toLowerCase())) {
              // Use Map to prevent duplicates and maintain category
              newTechnologies.set(trimmedTech, category);
            }
          });
        }
      });
    });

    // Add new technologies to review
    if (newTechnologies.size > 0) {
      const categoryToQuadrant = {
        Languages: "1",
        Frameworks: "2",
        "Supporting Tools": "3",
        Infrastructure: "4",
      };

      const newEntries = Array.from(newTechnologies).map(
        ([tech, category]) => ({
          id: `tech-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          title: tech,
          description: category,
          key: tech.toLowerCase().replace(/\s+/g, "-"),
          url: "#",
          quadrant: categoryToQuadrant[category],
          timeline: [
            {
              moved: 0,
              ringId: "review",
              date: new Date().toISOString().split("T")[0],
              description: "Added from project data scan",
            },
          ],
          links: [],
        })
      );

      setEntries((prev) => ({
        ...prev,
        review: [...prev.review, ...newEntries],
      }));

      toast.success(
        `Added ${newTechnologies.size} new technologies from project data`
      );
    }
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
        },
      ],
    };

    updatedEntries[destList] = [...updatedEntries[destList], updatedItem];
    setEntries(updatedEntries);

    if (selectedItem && selectedItem.id === item.id) {
      setSelectedItem(updatedItem);
    }

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
        projectsForTech={[]}
        handleProjectClick={() => {}}
        onEditConfirm={(title, category) => {
          setEditedTitle(title);
          setEditedCategory(category);
          handleConfirmEdit();
        }}
        onEditCancel={handleCancelEdit}
      />
    );
  };

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

    // Filter items based on search term and selected categories
    const filteredItems = items.filter((item) => {
      const matchesSearch =
        searchTerm === "" ||
        item.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategories =
        selectedCategories.length === 0 ||
        selectedCategories.some((cat) => cat.value === item.description);
      return matchesSearch && matchesCategories;
    });

    // Group filtered items by description
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
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, id)}
        >
          {Object.entries(groupedItems).map(([description, groupItems]) => (
            <div key={description} className="droppable-group">
              <div className="droppable-group-header">{description}</div>
              <div className="droppable-group-items">
                {groupItems.map((item) => (
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
                    {item.title}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const handleSaveBanner = () => {
    setShowBannerConfirmModal(true);
  };

  const handleSaveBannerConfirm = async () => {
    try {
      const baseUrl =
        process.env.NODE_ENV === "development"
          ? "http://localhost:5001/review/api/banners/update"
          : "/review/api/banners/update";

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
      }, 2000);
    } catch (error) {
      console.error("Error saving banner:", error);
      setBannerSaveStatus("error");
      toast.error("Failed to save banner. Please try again.");
      setShowBannerConfirmModal(false);
    }
  };

  const handleSaveBannerCancel = () => {
    setShowBannerConfirmModal(false);
  };

  const handleToggleBanner = async (index, shouldShow) => {
    try {
      const baseUrl =
        process.env.NODE_ENV === "development"
          ? "http://localhost:5001/review/api/banners/toggle"
          : "/review/api/banners/toggle";

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

      // Update local state to reflect the change immediately
      setExistingBanners((prevBanners) => {
        const updatedBanners = [...prevBanners];
        updatedBanners[index] = { ...updatedBanners[index], show: shouldShow };
        return updatedBanners;
      });

      toast.success(
        shouldShow ? "Banner is now visible" : "Banner is now hidden"
      );
    } catch (error) {
      console.error("Error toggling banner:", error);
      toast.error("Failed to update banner visibility");
    }
  };

  const handleDeleteBanner = async (index) => {
    if (window.confirm("Are you sure you want to delete this banner?")) {
      try {
        const baseUrl =
          process.env.NODE_ENV === "development"
            ? "http://localhost:5001/review/api/banners/delete"
            : "/review/api/banners/delete";

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

        // Update local state to reflect the change immediately
        setExistingBanners((prevBanners) =>
          prevBanners.filter((_, i) => i !== index)
        );

        toast.success("Banner deleted successfully");
      } catch (error) {
        console.error("Error deleting banner:", error);
        toast.error("Failed to delete banner");
      }
    }
  };

  // Add new useEffect to fetch existing banners
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        setIsLoadingBanners(true);
        const baseUrl =
          process.env.NODE_ENV === "development"
            ? "http://localhost:5001/review/api/banners"
            : "/review/api/banners";

        const response = await fetch(baseUrl);

        if (!response.ok) {
          throw new Error("Failed to fetch banners");
        }

        const data = await response.json();
        setExistingBanners(data.messages || []);
      } catch (error) {
        console.error("Error fetching banners:", error);
        toast.error("Failed to load existing banners");
      } finally {
        setIsLoadingBanners(false);
      }
    };

    fetchBanners();
  }, [bannerSaveStatus]); // Refetch when a banner is saved

  return (
    <ThemeProvider>
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
              <span>
                {/* Update and add to the Tech Radar. Please{" "}
                <strong>take caution</strong> when changing details about
                technologies. <strong>You cannot undo changes.</strong> */}
              </span>
            </div>
            <div className="admin-filter-search-flex">
              <div className="admin-filter-section-container">
                <div className="admin-filter-section">
                  <h4>Filter by Category</h4>
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
                  <h4> Reviewer Actions</h4>
                </div>
                <div className="buttons">
                  <button
                    className="admin-button"
                    onClick={() => setShowAddTechnologyModal(true)}
                    disabled={isLoading}
                  >
                    Add Technology
                  </button>
                  <button
                    className="admin-button"
                    onClick={() => setShowBannerManagementModal(true)}
                    disabled={isLoading}
                  >
                    Manage Banners
                  </button>
                  <button
                    className="admin-button"
                    onClick={handleSaveClick}
                    disabled={isLoading}
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
              >
                Add
              </button>
              <button onClick={() => setShowAddTechnologyModal(false)}>
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
              <button onClick={handleConfirmModalYes}>Yes</button>
              <button onClick={handleConfirmModalNo}>No</button>
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
              <button onClick={handleSaveConfirmModalYes}>Yes</button>
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
              <button onClick={handleAddConfirmModalYes}>Yes</button>
              <button onClick={handleAddConfirmModalNo}>No</button>
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
                placeholder="Enter move description"
              />
            </div>
            <div className="modal-buttons">
              <button
                onClick={handleMoveConfirm}
                disabled={moveDescription.length < 1}
              >
                Confirm
              </button>
              <button onClick={handleMoveCancel}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      {showBannerConfirmModal && (
        <div className="modal-overlay" style={{ zIndex: 1001 }}>
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
      {showBannerManagementModal && (
        <div className="modal-overlay">
          <div className="admin-modal banner-management-modal">
            <h3>Banner Management</h3>

            <div className="modal-tabs">
              <div className="modal-tab-content">
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
                      placeholder="Enter message to display in the banner..."
                      className="technology-input"
                      rows={3}
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
                    <MultiSelect
                      options={[
                        { label: "Radar", value: "radar" },
                        { label: "Statistics", value: "statistics" },
                        { label: "Projects", value: "projects" },
                      ]}
                      value={selectedPages}
                      onChange={setSelectedPages}
                      placeholder="Select pages..."
                    />
                  </div>
                </div>

                <h4 className="existing-banners-title">Existing Banners</h4>
                {isLoadingBanners ? (
                  <div className="banner-loading">Loading banners...</div>
                ) : existingBanners.length === 0 ? (
                  <div className="no-banners">
                    No banners have been created yet.
                  </div>
                ) : (
                  <div className="banner-list">
                    {existingBanners.map((banner, index) => (
                      <div className="banner-item" key={index}>
                        <div className="banner-content">
                          {banner.title && (
                            <h4 className="banner-title">{banner.title}</h4>
                          )}
                          <p className="banner-message">{banner.message}</p>
                        </div>
                        <div className="banner-actions">
                          <div className="banner-meta">
                          {banner.pages?.map((page, i) => (
                            <span key={i} className="banner-page">
                              {page}
                            </span>
                          ))}
                          {banner.show ? (
                            <span className="status-active">Active</span>
                          ) : (
                            <span className="status-inactive">Hidden</span>
                            )}
                          </div>
                          <div className="banner-actions-buttons">
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
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="modal-buttons">
              <button
                onClick={handleSaveBanner}
                disabled={
                  !bannerMessage.trim() ||
                  !bannerTitle.trim() ||
                  selectedPages.length === 0
                }
              >
                Save Banner
              </button>
              <button onClick={() => setShowBannerManagementModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </ThemeProvider>
  );
};

export default ReviewPage;
