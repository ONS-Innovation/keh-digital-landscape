import React, { useState, useRef, useEffect } from "react";
import { toast } from "react-hot-toast";
import MultiSelect from "../MultiSelect/MultiSelect";
import { fetchTechRadarJSONFromS3 } from "../../utilities/getTechRadarJson";
import { fetchCSVFromS3 } from "../../utilities/getCSVData";

const TechManage = () => {
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

  // Technology data management state
  const [arrayData, setArrayData] = useState({});
  const [radarData, setRadarData] = useState({ entries: [], quadrants: [] });
  const [csvData, setCsvData] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [editorContent, setEditorContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedQuadrants, setSelectedQuadrants] = useState([]);
  const [untrackedTechnologies, setUntrackedTechnologies] = useState(new Map());
  const [selectedTechIds, setSelectedTechIds] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [showAddModal, setShowAddModal] = useState(false);
  const [confirmAddChecked, setConfirmAddChecked] = useState(false);
  const textareaRef = useRef(null);
  const [newTechnology, setNewTechnology] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  // Handle select all checkbox
  const handleSelectAll = (e) => {
    setSelectAll(e.target.checked);
    if (e.target.checked) {
      const allTechIds = getFilteredTechnologies().map(([tech]) => tech);
      setSelectedTechIds(allTechIds);
    } else {
      setSelectedTechIds([]);
    }
  };

  // Handle individual checkbox selection
  const handleSelectTech = (tech, isChecked) => {
    if (isChecked) {
      setSelectedTechIds([...selectedTechIds, tech]);
    } else {
      setSelectedTechIds(selectedTechIds.filter(id => id !== tech));
    }
  };

  // Check if all visible technologies are selected
  useEffect(() => {
    const filteredTechs = getFilteredTechnologies().map(([tech]) => tech);
    const allSelected = filteredTechs.length > 0 && 
      filteredTechs.every(tech => selectedTechIds.includes(tech));
    setSelectAll(allSelected);
  }, [selectedTechIds, selectedQuadrants, untrackedTechnologies]);

  // Fetch both data sources on mount
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setIsLoading(true);
        const [radarData, csvData] = await Promise.all([
          fetchTechRadarJSONFromS3(),
          fetchCSVFromS3(),
        ]);

        console.log(csvData);

        setRadarData(radarData);
        setCsvData(csvData);

        // Also fetch the array data
        await fetchArrayData();
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load data");
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllData();
  }, []);

  // Update scanning when data changes
  useEffect(() => {
    if (
      Object.keys(arrayData).length > 0 &&
      radarData.entries &&
      radarData.entries.length > 0 &&
      csvData.length > 0
    ) {
      scanForNewTechnologies(csvData);
    }
  }, [arrayData, radarData, csvData]);

  /**
   * Fetches array data from the backend
   */
  const fetchArrayData = async () => {
    try {
      const baseUrl =
        process.env.NODE_ENV === "development"
          ? "http://localhost:5001/admin/api/array-data"
          : "/admin/api/array-data";

      const response = await fetch(baseUrl);
      if (!response.ok) {
        throw new Error("Failed to fetch technology data");
      }

      const data = await response.json();
      console.log(data);
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
    }
  };

  /**
   * Scans CSV data for technologies and compares against both data sources
   */
  const scanForNewTechnologies = (csvData) => {
    // Create sets for both data sources (case insensitive)
    if (Object.keys(arrayData).length === 0) {
      console.log("Waiting for array data before scanning CSV...");
      return;
    }
    const arrayDataTech = new Set();
    const radarDataTech = new Set(
      radarData.entries.map((entry) => entry.title.toLowerCase().trim())
    );

    // Collect all technologies from array-data
    Object.values(arrayData).forEach((technologies) => {
      technologies.forEach((tech) => {
        arrayDataTech.add(tech.toLowerCase().trim());
      });
    });

    const newTechnologies = new Map();
    const techOccurrences = new Map(); // Track tech occurrences across all projects

    // Process CSV data - first pass to count occurrences
    csvData.forEach((project) => {
      Object.entries(fieldsToScan).forEach(([field, category]) => {
        if (project[field]) {
          const technologies = project[field].split(";");

          technologies.forEach((tech) => {
            const trimmedTech = tech.trim();
            const normalizedTech = trimmedTech.toLowerCase();

            // Count occurrences of each technology
            if (!techOccurrences.has(normalizedTech)) {
              techOccurrences.set(normalizedTech, 1);
            } else {
              techOccurrences.set(
                normalizedTech,
                techOccurrences.get(normalizedTech) + 1
              );
            }
          });
        }
      });
    });

    // Process CSV data - second pass to collect untracked tech
    csvData.forEach((project) => {
      Object.entries(fieldsToScan).forEach(([field, category]) => {
        if (project[field]) {
          const technologies = project[field].split(";");

          technologies.forEach((tech) => {
            const trimmedTech = tech.trim();
            const normalizedTech = trimmedTech.toLowerCase();

            // Skip if tech is in both data sources
            if (
              arrayDataTech.has(normalizedTech) &&
              radarDataTech.has(normalizedTech)
            ) {
              return;
            }

            // Determine the tech's status
            const status = {
              inArrayData: arrayDataTech.has(normalizedTech),
              inRadarData: radarDataTech.has(normalizedTech),
            };

            const occurrenceCount = techOccurrences.get(normalizedTech);

            if (!newTechnologies.has(trimmedTech)) {
              const techInfo = {
                category,
                sources: new Set([field]),
                status,
                occurrenceCount,
              };
              newTechnologies.set(trimmedTech, techInfo);
            } else {
              const techInfo = newTechnologies.get(trimmedTech);
              techInfo.sources.add(field);
            }
          });
        }
      });
    });

    setUntrackedTechnologies(newTechnologies);
  };

  /**
   * Gets quadrant options from radar data
   */
  const getQuadrantOptions = () => {
    const uniqueQuadrants = new Set(Object.values(fieldsToScan));
    return Array.from(uniqueQuadrants).map((quadrant) => ({
      label: quadrant,
      value: quadrant,
      id: quadrant,
    }));
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

  // Add a new technology to the editor
  const handleAddNewTechnology = () => {
    if (!newTechnology.trim()) return;
    
    const updatedContent = editorContent.trim() 
      ? `${editorContent}\n${newTechnology}` 
      : newTechnology;
    
    setEditorContent(updatedContent);
    setNewTechnology("");
    setShowAddForm(false);
  };

  // Handle removing a technology from the reference list
  const handleRemoveTechnology = (techToRemove) => {
    const updatedTechs = editorContent
      .split("\n")
      .filter(tech => tech.trim() && tech !== techToRemove);
    
    setEditorContent(updatedTechs.join("\n"));
  };

  /**
   * Render the editor content with a table instead of a textarea
   */
  const renderEditorContent = () => {
    const technologies = editorContent.split("\n").filter(tech => tech.trim());
    
    return (
      <div className="editor-table-container">
        <table className="tech-table editor-table">
          <thead>
            <tr>
              <th>Technology ({technologies.length})</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {technologies.map((tech, index) => (
              <tr key={`${tech}-${index}`}>
                <td className="name-cell">{tech}</td>
                <td className="actions-cell">
                  <button 
                    className="table-action-btn remove-btn"
                    onClick={() => handleRemoveTechnology(tech)}
                    title="Remove technology"
                  >
                    −
                  </button>
                </td>
              </tr>
            ))}
            {showAddForm ? (
              <tr className="add-tech-form-row">
                <td>
                  <input 
                    type="text" 
                    value={newTechnology}
                    onChange={(e) => setNewTechnology(e.target.value)}
                    className="add-tech-input"
                    placeholder="Enter technology name"
                    autoFocus
                  />
                </td>
                <td>
                  <div className="add-tech-actions">
                    <button 
                      className="table-action-btn confirm-btn" 
                      onClick={handleAddNewTechnology}
                      disabled={!newTechnology.trim()}
                    >
                      ✓
                    </button>
                    <button 
                      className="table-action-btn cancel-btn"
                      onClick={() => {
                        setShowAddForm(false);
                        setNewTechnology("");
                      }}
                    >
                      ✕
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              <tr className="add-tech-row">
                <td colSpan={2}>
                  <button className="add-tech-btn" onClick={() => setShowAddForm(true)}>
                    <span>+</span> Add Technology
                  </button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  };

  /**
   * Sorts the editor content based on the selected sort type
   */
  const handleSort = (sortType) => {
    const lines = editorContent.split("\n").filter((line) => line.trim());
    let sortedLines;

    switch (sortType) {
      case "alpha-asc":
        sortedLines = lines.sort((a, b) => a.localeCompare(b));
        break;
      case "alpha-desc":
        sortedLines = lines.sort((a, b) => b.localeCompare(a));
        break;
      case "length-desc":
        sortedLines = lines.sort((a, b) => b.length - a.length);
        break;
      case "length-asc":
        sortedLines = lines.sort((a, b) => a.length - b.length);
        break;
      default:
        return;
    }

    setEditorContent(sortedLines.join("\n"));
  };

  // Filter technologies based on selected quadrants
  const getFilteredTechnologies = () => {
    if (selectedQuadrants.length === 0) {
      return Array.from(untrackedTechnologies.entries());
    }

    return Array.from(untrackedTechnologies.entries()).filter(([_, info]) =>
      selectedQuadrants.some((quadrant) => quadrant.value === info.category)
    );
  };

  // Sorting function for the main table
  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Get the sorted list of technologies
  const getSortedTechnologies = () => {
    const technologies = getFilteredTechnologies();
    
    if (!sortConfig.key) return technologies;

    return [...technologies].sort((a, b) => {
      if (sortConfig.key === 'name') {
        if (sortConfig.direction === 'ascending') {
          return a[0].localeCompare(b[0]);
        } else {
          return b[0].localeCompare(a[0]);
        }
      } else if (sortConfig.key === 'projects') {
        const countA = a[1].occurrenceCount || 0;
        const countB = b[1].occurrenceCount || 0;
        
        if (sortConfig.direction === 'ascending') {
          return countA - countB;
        } else {
          return countB - countA;
        }
      }
      return 0;
    });
  };

  // Add selected technologies to Tech Radar in Review ring
  const handleAddToReview = async () => {
    if (selectedTechIds.length === 0) return;

    try {
      const selectedTechs = getFilteredTechnologies()
        .filter(([tech]) => selectedTechIds.includes(tech));

      const newEntries = selectedTechs.map(([tech, info]) => ({
        id: `tech-${Date.now()}-${tech.toLowerCase().replace(/\s+/g, '-')}`,
        title: tech,
        quadrant: info.category === "Languages" ? "1" :
                 info.category === "Frameworks" ? "2" :
                 info.category === "Supporting Tools" ? "3" : "4",
        description: info.category,
        timeline: [{
          moved: 0,
          ringId: "review",
          date: new Date().toISOString().split('T')[0],
          description: `Added for review from tech audit (${Array.from(info.sources).join(', ')})`
        }]
      }));

      const baseUrl = process.env.NODE_ENV === "development"
        ? "http://localhost:5001/review/api/tech-radar/update"
        : "/review/api/tech-radar/update";

      const response = await fetch(baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          entries: newEntries
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add technologies to review");
      }

      // Update local state
      const updatedRadarData = {
        ...radarData,
        entries: [...radarData.entries, ...newEntries]
      };
      setRadarData(updatedRadarData);
      
      // Clear selection
      setSelectedTechIds([]);
      toast.success(`Added ${selectedTechIds.length} technologies to Review`);
    } catch (error) {
      console.error("Error adding technologies to review:", error);
      toast.error("Failed to add technologies to review");
    }
  };

  // Add selected technologies to Reference List
  const handleAddToRefList = async () => {
    if (selectedTechIds.length === 0 || !selectedCategory) {
      toast.error("Please select a category and technologies to add");
      return;
    }

    try {
      const selectedTechs = getFilteredTechnologies()
        .filter(([tech]) => selectedTechIds.includes(tech))
        .map(([tech]) => tech);

      // Get current technologies in the category
      const currentTechs = editorContent
        .split("\n")
        .filter(tech => tech.trim());

      // Combine and remove duplicates
      const updatedTechs = [...new Set([...currentTechs, ...selectedTechs])];

      // Update the editor content
      setEditorContent(updatedTechs.join("\n"));

      // Save changes to backend
      const baseUrl = process.env.NODE_ENV === "development"
        ? "http://localhost:5001/admin/api/array-data/update"
        : "/admin/api/array-data/update";

      const response = await fetch(baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          category: selectedCategory,
          items: updatedTechs,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update technology list");
      }

      // Update local state
      setArrayData({
        ...arrayData,
        [selectedCategory]: updatedTechs,
      });

      // Clear selection
      setSelectedTechIds([]);
      toast.success(`Added ${selectedTechs.length} technologies to ${selectedCategory}`);
    } catch (error) {
      console.error("Error updating technology list:", error);
      toast.error("Failed to update technology list");
    }
  };

  // Handle adding to both lists
  const handleAddToBoth = async () => {
    await handleAddToReview();
    await handleAddToRefList();
    setShowAddModal(false);
    setConfirmAddChecked(false);
  };

  return (
    <div className="admin-container" style={{ paddingTop: "0px" }}>
      {isLoading ? (
        <p>Loading technology data...</p>
      ) : (
        <div className="tech-management-grid">
          <div className="tech-radar-status-column">
            <div className="technology-editor-header">
              <h3 className="existing-banners-title">
                Untracked Technologies
                {selectedTechIds.length > 0 && 
                  <span className="selection-info"> - {selectedTechIds.length} selected</span>
                }
              </h3>
              <div className="tech-radar-filter">
                {selectedTechIds.length > 0 ? (
                  <div className="batch-actions">
                    <button 
                      className="admin-button batch-action-btn"
                      onClick={() => setShowAddModal(true)}
                    >
                      Add to Lists
                    </button>
                    <button 
                      className="admin-button batch-action-btn" 
                      onClick={() => setSelectedTechIds([])}
                    >
                      Clear Selection
                    </button>
                  </div>
                ) : (
                  <MultiSelect
                    options={getQuadrantOptions()}
                    value={selectedQuadrants}
                    onChange={setSelectedQuadrants}
                    placeholder="Filter by quadrants"
                  />
                )}
              </div>
            </div>
            <div className="admin-modal-field untracked-modal">
              <div className="tech-table-container">
                <table className="tech-table">
                  <thead>
                    <tr>
                      <th><input type="checkbox" checked={selectAll} onChange={handleSelectAll} /></th>
                      <th 
                        className={`sortable-header ${sortConfig.key === 'name' ? `sorted-${sortConfig.direction}` : ''}`}
                        onClick={() => requestSort('name')}
                      >
                        Technology ({getFilteredTechnologies().length})
                        {sortConfig.key === 'name' && (
                          <span className="sort-indicator">
                            {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                          </span>
                        )}
                      </th>
                      <th 
                        className={`sortable-header ${sortConfig.key === 'projects' ? `sorted-${sortConfig.direction}` : ''}`}
                        onClick={() => requestSort('projects')}
                      >
                        Projects
                        {sortConfig.key === 'projects' && (
                          <span className="sort-indicator">
                            {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                          </span>
                        )}
                      </th>
                      <th>Quadrant</th>
                      <th>Location</th>
                      <th>Sources</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getSortedTechnologies().map(([tech, info]) => (
                      <tr 
                        key={tech}
                      >
                        <td className="checkbox-cell">
                          <input 
                            type="checkbox" 
                            checked={selectedTechIds.includes(tech)}
                            onChange={(e) => handleSelectTech(tech, e.target.checked)}
                          />
                        </td>
                        <td className="name-cell">
                          {tech}
                        </td>
                        <td className="count-cell">
                          {info.occurrenceCount || 0}
                        </td>
                        <td className="quadrant-cell">
                          {info.category}
                        </td>
                        <td className={`location-cell ${info.status.inArrayData ? "tech-in-array" : info.status.inRadarData ? "tech-in-radar" : "tech-not-tracked"}`}>
                            {!info.status.inArrayData && !info.status.inRadarData
                              ? "Not tracked"
                              : info.status.inRadarData
                                ? "Radar"
                                : "Ref. List"}
                        </td>
                        <td className="sources-cell">
                          <div className="tech-item-sources">
                            {Array.from(info.sources).map((source) => (
                              <span
                                key={source}
                                className="source-tag"
                                title="Source from Tech Audit"
                              >
                                {source}
                              </span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="technology-editor-column">
            <div className="technology-editor-container">
              <div className="technology-editor-header">
                <h3 className="existing-banners-title">
                  Reference List
                </h3>
                <div className="editor-actions">
                  <select
                    className="sort-select"
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
                  <select
                    className="sort-select"
                    onChange={(e) => handleSort(e.target.value)}
                    defaultValue=""
                  >
                    <option value="" disabled>
                      Sort by...
                    </option>
                    <option value="alpha-asc">A to Z</option>
                    <option value="alpha-desc">Z to A</option>
                    <option value="length-desc">Longest first</option>
                    <option value="length-asc">Shortest first</option>
                  </select>
                  <button
                    className="admin-button"
                    onClick={handleSaveEditorContent}
                    disabled={!editorContent.trim() || !selectedCategory}
                  >
                    Save Changes
                  </button>
                </div>
              </div>

              {renderEditorContent()}
            </div>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Add Selected Technologies</h3>
            <div className="modal-options">
              <button 
                className="admin-button batch-action-btn"
                onClick={handleAddToReview}
                disabled={!confirmAddChecked}
              >
                Add to Review
              </button>
              <button 
                className="admin-button batch-action-btn"
                onClick={handleAddToRefList}
                disabled={!confirmAddChecked || !selectedCategory}
              >
                Add to Ref. List
              </button>
              <button 
                className="admin-button batch-action-btn"
                onClick={handleAddToBoth}
                disabled={!confirmAddChecked || !selectedCategory}
              >
                Add to Both
              </button>
            </div>
            <div className="modal-confirm">
              <label>
                <input 
                  type="checkbox"
                  checked={confirmAddChecked}
                  onChange={(e) => setConfirmAddChecked(e.target.checked)}
                />
                I confirm I want to add these technologies
              </label>
            </div>
            <div className="modal-actions">
              <button 
                className="admin-button batch-action-btn secondary"
                onClick={() => {
                  setShowAddModal(false);
                  setConfirmAddChecked(false);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TechManage;
