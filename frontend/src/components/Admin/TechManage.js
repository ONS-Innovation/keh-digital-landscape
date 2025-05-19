import React, { useState, useRef, useEffect } from "react";
import { toast } from "react-hot-toast";
import MultiSelect from "../MultiSelect/MultiSelect";
import { fetchTechRadarJSONFromS3 } from "../../utilities/getTechRadarJson";
import { fetchCSVFromS3 } from "../../utilities/getCSVData";
import Header from "../Header/Header";
import { FaCheck, FaRegTimesCircle, FaPencilAlt, FaPencilRuler, FaTrash, FaPlus } from "react-icons/fa";
import stringSimilarity from "string-similarity";
import SimilarityModal from "./TechManagement/SimilarityModal";

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
Static_Analysis: "Supporting Tools",
Source_Control: "Supporting Tools",
Code_Formatter: "Supporting Tools",
Database_Technologies: "Infrastructure",
Data_Output_Formats: "Supporting Tools",
Integrations_ONS: "Supporting Tools",
Integrations_External: "Supporting Tools",
Project_Tools: "Supporting Tools",
Code_Editors: "Supporting Tools",
Communication: "Supporting Tools",
Collaboration: "Supporting Tools",
Incident_Management: "Supporting Tools",
Documentation_Tools: "Supporting Tools",
UI_Tools: "Supporting Tools",
Diagram_Tools: "Supporting Tools",
    
  };

  // Similarity threshold for matching technologies
  const SIMILARITY_THRESHOLD = 0.8;

  // Add new state for the similarity threshold slider
  const [similarityThreshold, setSimilarityThreshold] = useState(SIMILARITY_THRESHOLD);

  // Add a new state for showing/hiding the slider
  const [showThresholdSlider, setShowThresholdSlider] = useState(false);

  // Toggle function for the slider visibility
  const toggleThresholdSlider = () => {
    setShowThresholdSlider(!showThresholdSlider);
  };

  // Technology data management state
  const [arrayData, setArrayData] = useState({});
  const [radarData, setRadarData] = useState({ entries: [], quadrants: [] });
  const [csvData, setCsvData] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [editorContent, setEditorContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedQuadrants, setSelectedQuadrants] = useState([]);
  const [untrackedTechnologies, setUntrackedTechnologies] = useState(new Map());
  const [selectedTechIds, setSelectedTechIds] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "ascending",
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [confirmAddChecked, setConfirmAddChecked] = useState(false);
  const [showNormaliseModal, setShowNormaliseModal] = useState(false);
  const [normaliseFrom, setNormaliseFrom] = useState("");
  const [normaliseTo, setNormaliseTo] = useState("");
  const [affectedProjects, setAffectedProjects] = useState([]);
  const textareaRef = useRef(null);
  const [newTechnology, setNewTechnology] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAddOption, setSelectedAddOption] = useState("");
  const [selectedTargetCategory, setSelectedTargetCategory] = useState("");
  const [editingTech, setEditingTech] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [showAddFormCategory, setShowAddFormCategory] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTechForModal, setSelectedTechForModal] = useState(null);
  const [selectedSimilarTechs, setSelectedSimilarTechs] = useState([]);

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
      setSelectedTechIds(selectedTechIds.filter((id) => id !== tech));
    }
  };

  const fetchAllData = async () => {
    try {
      setIsLoading(true);
      const [radarData, csvData] = await Promise.all([
        fetchTechRadarJSONFromS3(),
        fetchCSVFromS3(),
      ]);

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

  // Check if all visible technologies are selected
  useEffect(() => {
    const filteredTechs = getFilteredTechnologies().map(([tech]) => tech);
    const allSelected =
      filteredTechs.length > 0 &&
      filteredTechs.every((tech) => selectedTechIds.includes(tech));
    setSelectAll(allSelected);
  }, [selectedTechIds, selectedQuadrants, untrackedTechnologies]);

  // Fetch both data sources on mount
  useEffect(() => {
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

  // Rescan when similarity threshold changes
  useEffect(() => {
    if (
      Object.keys(arrayData).length > 0 &&
      radarData.entries &&
      radarData.entries.length > 0 &&
      csvData.length > 0
    ) {
      scanForNewTechnologies(csvData);
    }
  }, [similarityThreshold]);

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
   * Checks if two technology names are similar using string similarity
   */
  const areSimilarTechnologies = (tech1, tech2) => {
    if (!tech1 || !tech2) return false;
    
    // Normalize tech names - remove common separators and lowercase
    const normalize = (str) => {
      return str.toLowerCase()
        .replace(/[-_/.]/g, ' ')  // Replace common separators with spaces
        .replace(/\s+/g, ' ')     // Normalize spaces
        .trim();
    };
    
    const normalizedTech1 = normalize(tech1);
    const normalizedTech2 = normalize(tech2);
    
    // Direct case-insensitive match after normalization
    if (normalizedTech1 === normalizedTech2) return true;
    
    // Handle acronyms and abbreviations (e.g., "AWS" vs "Amazon Web Services")
    const isAcronym = (shorter, longer) => {
      const acronym = longer
        .split(/\s+/)
        .map(word => word[0])
        .join('')
        .toLowerCase();
      
      return acronym === shorter.toLowerCase();
    };
    
    if (normalizedTech1.length < normalizedTech2.length) {
      if (isAcronym(normalizedTech1, normalizedTech2)) return true;
    } else if (normalizedTech2.length < normalizedTech1.length) {
      if (isAcronym(normalizedTech2, normalizedTech1)) return true;
    }
    
    // Check if one is a subset of the other (e.g., "AWS S3" vs "AWS S3 Bucket")
    if (normalizedTech1.includes(normalizedTech2) || normalizedTech2.includes(normalizedTech1)) {
      // If one is a subset of the other, and it's a significant portion
      const longerString = normalizedTech1.length > normalizedTech2.length ? normalizedTech1 : normalizedTech2;
      const shorterString = normalizedTech1.length > normalizedTech2.length ? normalizedTech2 : normalizedTech1;
      
      // Check if the shorter string is at least 60% of the longer one
      // or if it's at least 3 characters and the longer string starts with it
      if (shorterString.length / longerString.length > 0.6 || 
          (shorterString.length >= 3 && longerString.startsWith(shorterString))) {
        return true;
      }
    }
    
    // Common technology prefixes to ignore in comparisons
    const commonPrefixes = ['aws', 'azure', 'google cloud', 'gcp', 'microsoft', 'ibm', 'oracle'];
    
    // Remove common prefixes for a secondary check
    let cleanTech1 = normalizedTech1;
    let cleanTech2 = normalizedTech2;
    
    commonPrefixes.forEach(prefix => {
      if (normalizedTech1.startsWith(prefix + ' ')) {
        cleanTech1 = normalizedTech1.substring(prefix.length + 1);
      }
      if (normalizedTech2.startsWith(prefix + ' ')) {
        cleanTech2 = normalizedTech2.substring(prefix.length + 1);
      }
    });
    
    // Check if services are the same after removing provider prefix
    if (cleanTech1 === cleanTech2 && cleanTech1 !== normalizedTech1) {
      return true;
    }
    
    // Check string similarity for both original and cleaned versions
    const similarity1 = stringSimilarity.compareTwoStrings(normalizedTech1, normalizedTech2);
    const similarity2 = stringSimilarity.compareTwoStrings(cleanTech1, cleanTech2);
    
    return similarity1 >= similarityThreshold || similarity2 >= similarityThreshold;
  };

  /**
   * Find technologies similar to the given technology
   */
  const findSimilarTechnologies = (tech, existingTechs) => {
    const similarTechs = [];
    
    existingTechs.forEach(existingTech => {
      if (existingTech.name === tech) return; // Skip exact match (case-sensitive)
      
      // Check for case-insensitive exact match first (highest priority)
      const isCaseMatch = tech.toLowerCase() === existingTech.name.toLowerCase();
      
      // Then check for other similarity
      const isSimilar = isCaseMatch || areSimilarTechnologies(tech, existingTech.name);
      
      if (isSimilar) {
        // Calculate similarity score for sorting
        let similarity = isCaseMatch ? 0.99 : stringSimilarity.compareTwoStrings(
          tech.toLowerCase(),
          existingTech.name.toLowerCase()
        );
        
        // Boost score for case differences to make them appear first
        if (isCaseMatch) {
          similarity = 0.99; // Just below 1.0 (exact match)
        }
        
        // Only add if similarity is above the threshold (but always include case matches)
        if (similarity >= similarityThreshold || isCaseMatch) {
          similarTechs.push({
            name: existingTech.name,
            source: existingTech.source,
            category: existingTech.category || existingTech.quadrant,
            similarity: similarity,
            isCaseMatch: isCaseMatch
          });
        }
      }
    });
    
    // Sort by similarity score in descending order and limit to top matches
    return similarTechs
      .sort((a, b) => {
        // First sort by case match (true comes first)
        if (a.isCaseMatch && !b.isCaseMatch) return -1;
        if (!a.isCaseMatch && b.isCaseMatch) return 1;
        
        // Then by similarity
        return b.similarity - a.similarity;
      })
      .slice(0, 3); // Limit to top 3 matches
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
    
    // Collect all technologies from both sources with their origin
    const existingTechnologies = [];
    
    // Also create a quick lookup Set for case-insensitive checking
    const exactMatchSet = new Set();
    const caseInsensitiveSet = new Set();
    
    // Add technologies from reference list (array data)
    Object.entries(arrayData).forEach(([category, technologies]) => {
      technologies.forEach(tech => {
        const trimmedTech = tech.trim();
        existingTechnologies.push({
          name: trimmedTech,
          source: "Reference List",
          category
        });
        exactMatchSet.add(trimmedTech);
        caseInsensitiveSet.add(trimmedTech.toLowerCase());
      });
    });
    
    // Add technologies from radar data
    radarData.entries.forEach(entry => {
      const trimmedTitle = entry.title.trim();
      existingTechnologies.push({
        name: trimmedTitle,
        source: "Tech Radar",
        quadrant: entry.quadrant
      });
      exactMatchSet.add(trimmedTitle);
      caseInsensitiveSet.add(trimmedTitle.toLowerCase());
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
            if (!trimmedTech) return;

            // Count occurrences of each technology
            if (!techOccurrences.has(trimmedTech)) {
              techOccurrences.set(trimmedTech, 1);
            } else {
              techOccurrences.set(
                trimmedTech,
                techOccurrences.get(trimmedTech) + 1
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
            if (!trimmedTech) return;

            // Skip if tech exactly matches in both sources
            const exactMatchInArrayData = exactMatchSet.has(trimmedTech) && existingTechnologies.some(
              existingTech => existingTech.name === trimmedTech && existingTech.source === "Reference List"
            );
            
            const exactMatchInRadarData = exactMatchSet.has(trimmedTech) && existingTechnologies.some(
              existingTech => existingTech.name === trimmedTech && existingTech.source === "Tech Radar"
            );

            // If it's already tracked in both sources, skip it entirely
            if (exactMatchInArrayData && exactMatchInRadarData) {
              return;
            }

            // Find similar technologies (only if not an exact match)
            let similarTechnologies = [];
            
            // We only do similarity checks if the tech isn't an exact match in either source
            // But we still want to identify case differences, so we check if the lowercase version exists
            const isTrackedDifferentCase = 
              !exactMatchSet.has(trimmedTech) && 
              caseInsensitiveSet.has(trimmedTech.toLowerCase());
            
            if (!exactMatchInArrayData || !exactMatchInRadarData || isTrackedDifferentCase) {
              similarTechnologies = findSimilarTechnologies(
                trimmedTech,
                existingTechnologies
              );
            }

            // Determine the tech's status
            const status = {
              inArrayData: exactMatchInArrayData,
              inRadarData: exactMatchInRadarData,
            };

            const occurrenceCount = techOccurrences.get(trimmedTech);

            if (!newTechnologies.has(trimmedTech)) {
              const techInfo = {
                category,
                sources: new Set([field]),
                status,
                occurrenceCount,
                similarTechnologies
              };
              newTechnologies.set(trimmedTech, techInfo);
            } else {
              const techInfo = newTechnologies.get(trimmedTech);
              techInfo.sources.add(field);
              
              // Update with similar technologies if not already set
              if (!techInfo.similarTechnologies || techInfo.similarTechnologies.length === 0) {
                techInfo.similarTechnologies = similarTechnologies;
              }
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
   * Gets category options for MultiSelect
   */
  const getCategoryOptions = () => {
    return Object.keys(arrayData).map((category) => ({
      label: category,
      value: category,
      id: category,
    }));
  };

  /**
   * Handles category change for MultiSelect
   */
  const handleCategoryChange = (selected) => {
    setSelectedCategories(selected);
    if (selected.length === 1) {
      const category = selected[0].value;
      setSelectedCategory(category);
      updateEditorContent(category, arrayData);
    } else if (selected.length === 0) {
      setSelectedCategory("");
      setEditorContent("");
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
   * Handles saving the editor content
   */
  const handleSaveEditorContent = async () => {
    try {
      const baseUrl =
        process.env.NODE_ENV === "development"
          ? "http://localhost:5001/admin/api/array-data/update"
          : "/admin/api/array-data/update";

      // Save all categories at once
      const response = await fetch(baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          allCategories: true,
          items: arrayData,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update technology lists");
      }

      toast.success("All technology lists updated successfully!");
    } catch (error) {
      console.error("Error updating technology lists:", error);
      toast.error("Failed to update technology lists. Please try again.");
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
  const handleRemoveTechnology = async (
    techToRemove,
    category = selectedCategory
  ) => {
    const targetCategory = category || selectedCategory;
    if (!targetCategory) return;

    const updatedTechs = arrayData[targetCategory].filter(
      (tech) => tech !== techToRemove
    );

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
          category: targetCategory,
          items: updatedTechs,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update technology list");
      }

      // Update local state
      setArrayData({
        ...arrayData,
        [targetCategory]: updatedTechs,
      });

      if (targetCategory === selectedCategory) {
        setEditorContent(updatedTechs.join("\n"));
      }

      toast.success(`Removed ${techToRemove} from ${targetCategory}`);
    } catch (error) {
      console.error("Error updating technology list:", error);
      toast.error("Failed to update technology list");
    }
  };

  // Handle edit technology
  const handleEditTechnology = async (
    oldTech,
    newTech,
    category = selectedCategory
  ) => {
    if (!newTech.trim() || oldTech === newTech) {
      setEditingTech(null);
      setEditValue("");
      return;
    }

    const targetCategory = category || selectedCategory;
    if (!targetCategory) return;

    const updatedTechs = arrayData[targetCategory].map((tech) =>
      tech === oldTech ? newTech : tech
    );

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
          category: targetCategory,
          items: updatedTechs,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update technology");
      }

      // Update local state
      setArrayData({
        ...arrayData,
        [targetCategory]: updatedTechs,
      });

      if (targetCategory === selectedCategory) {
        setEditorContent(updatedTechs.join("\n"));
      }

      setEditingTech(null);
      setEditValue("");
      toast.success(`Updated ${oldTech} to ${newTech}`);
    } catch (error) {
      console.error("Error updating technology:", error);
      toast.error("Failed to update technology");
    }
  };

  /**
   * Render the editor content with a table instead of a textarea
   */
  const renderEditorContent = () => {
    const technologies = getFilteredEditorContent();

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
                <td className="name-cell">
                  {editingTech === tech ? (
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="add-tech-input"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleEditTechnology(tech, editValue);
                        } else if (e.key === "Escape") {
                          setEditingTech(null);
                          setEditValue("");
                        }
                      }}
                    />
                  ) : (
                    tech
                  )}
                </td>
                <td className="actions-cell">
                  {editingTech === tech ? (
                    <>
                      <button
                        className="table-action-btn confirm-btn"
                        onClick={() => handleEditTechnology(tech, editValue)}
                        disabled={!editValue.trim() || editValue === tech}
                      >
                        <FaCheck />
                      </button>
                      <button
                        className="table-action-btn cancel-btn"
                        onClick={() => {
                          setEditingTech(null);
                          setEditValue("");
                        }}
                      >
                        <FaRegTimesCircle />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        className="table-action-btn edit-btn"
                        onClick={() => {
                          setEditingTech(tech);
                          setEditValue(tech);
                        }}
                        title="Edit technology"
                      >
                        <FaPencilAlt />
                      </button>
                      <button
                        className="table-action-btn remove-btn"
                        onClick={() => handleRemoveTechnology(tech)}
                        title="Remove technology"
                      >
                        <FaTrash />
                      </button>
                    </>
                  )}
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
                      <FaCheck />
                    </button>
                    <button
                      className="table-action-btn cancel-btn"
                      onClick={() => {
                        setShowAddForm(false);
                        setNewTechnology("");
                      }}
                    >
                      <FaRegTimesCircle />
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              <tr className="add-tech-row">
                <td colSpan={2}>
                  <button
                    className="add-tech-btn"
                    onClick={() => setShowAddForm(true)}
                  >
                        <FaPlus /> Add Technology
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

  // Filter technologies based on selected quadrants and search term
  const getFilteredTechnologies = () => {
    let technologies = Array.from(untrackedTechnologies.entries());

    // Filter by search term
    if (searchTerm.trim()) {
      technologies = technologies.filter(([tech]) =>
        tech.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by quadrants
    if (selectedQuadrants.length > 0) {
      technologies = technologies.filter(([_, info]) =>
        selectedQuadrants.some((quadrant) => quadrant.value === info.category)
      );
    }

    return technologies;
  };

  // Filter reference list based on search term
  const getFilteredEditorContent = () => {
    const technologies = editorContent
      .split("\n")
      .filter((tech) => tech.trim());

    if (!searchTerm.trim()) {
      return technologies;
    }

    return technologies.filter((tech) =>
      tech.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // Handle search term changes
  const handleSearchChange = (value) => {
    setSearchTerm(value);
  };

  // Sorting function for the main table
  const requestSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  // Get the sorted list of technologies
  const getSortedTechnologies = () => {
    const technologies = getFilteredTechnologies();

    if (!sortConfig.key) return technologies;

    return [...technologies].sort((a, b) => {
      if (sortConfig.key === "name") {
        if (sortConfig.direction === "ascending") {
          return a[0].localeCompare(b[0]);
        } else {
          return b[0].localeCompare(a[0]);
        }
      } else if (sortConfig.key === "projects") {
        const countA = a[1].occurrenceCount || 0;
        const countB = b[1].occurrenceCount || 0;

        if (sortConfig.direction === "ascending") {
          return countA - countB;
        } else {
          return countB - countA;
        }
      } else if (sortConfig.key === "quadrant") {
        if (sortConfig.direction === "ascending") {
          return a[1].category.localeCompare(b[1].category);
        } else {
          return b[1].category.localeCompare(a[1].category);
        }
      } else if (sortConfig.key === "location") {
        const getLocationValue = (info) => {
          if (!info.status.inArrayData && !info.status.inRadarData) return "Not tracked";
          return info.status.inRadarData ? "Radar" : "Ref. List";
        };
        const locA = getLocationValue(a[1]);
        const locB = getLocationValue(b[1]);
        
        if (sortConfig.direction === "ascending") {
          return locA.localeCompare(locB);
        } else {
          return locB.localeCompare(locA);
        }
      }
      return 0;
    });
  };

  // Sort all reference list technologies
  const handleSortAllCategories = (sortType) => {
    const updatedArrayData = { ...arrayData };
    
    Object.keys(updatedArrayData).forEach(category => {
      const technologies = [...updatedArrayData[category]];
      
      switch (sortType) {
        case "alpha-asc":
          technologies.sort((a, b) => a.localeCompare(b));
          break;
        case "alpha-desc":
          technologies.sort((a, b) => b.localeCompare(a));
          break;
        case "length-desc":
          technologies.sort((a, b) => b.length - a.length);
          break;
        case "length-asc":
          technologies.sort((a, b) => a.length - b.length);
          break;
        default:
          return;
      }
      
      updatedArrayData[category] = technologies;
    });
    
    setArrayData(updatedArrayData);
  };

  // Add selected technologies to Tech Radar in Review ring
  const handleAddToReview = async () => {
    if (selectedTechIds.length === 0) return;

    try {
      const selectedTechs = getFilteredTechnologies().filter(([tech]) =>
        selectedTechIds.includes(tech)
      );

      const newEntries = selectedTechs.map(([tech, info]) => ({
        id: `tech-${Date.now()}-${tech.toLowerCase().replace(/\s+/g, "-")}`,
        title: tech,
        quadrant:
          info.category === "Languages"
            ? "1"
            : info.category === "Frameworks"
              ? "2"
              : info.category === "Supporting Tools"
                ? "3"
                : "4",
        description: info.category,
        timeline: [
          {
            moved: 0,
            ringId: "review",
            date: new Date().toISOString().split("T")[0],
            description: `Added for review from tech audit (${Array.from(info.sources).join(", ")})`,
          },
        ],
      }));

      const baseUrl =
        process.env.NODE_ENV === "development"
          ? "http://localhost:5001/admin/api/tech-radar/update"
          : "/admin/api/tech-radar/update";

      const response = await fetch(baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          entries: newEntries,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add technologies to review");
      }

      // Update local state
      const updatedRadarData = {
        ...radarData,
        entries: [...radarData.entries, ...newEntries],
      };
      setRadarData(updatedRadarData);

      // Clear selection
      setSelectedTechIds([]);
      setShowAddModal(false);
      toast.success(`Added ${selectedTechIds.length} technologies to Review`);
    } catch (error) {
      console.error("Error adding technologies to review:", error);
      toast.error("Failed to add technologies to review");
    }
  };

  // Add selected technologies to Reference List
  const handleAddToRefList = async (category) => {
    if (selectedTechIds.length === 0 || !category) {
      toast.error("Please select a category and technologies to add");
      return;
    }

    try {
      const selectedTechs = getFilteredTechnologies()
        .filter(([tech]) => selectedTechIds.includes(tech))
        .map(([tech]) => tech);

      // Get current technologies in the target category
      const currentTechs = arrayData[category] || [];

      // Combine and remove duplicates
      const updatedTechs = [...new Set([...currentTechs, ...selectedTechs])];

      // Save changes to backend
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
          category: category,
          items: updatedTechs,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update technology list");
      }

      // Update local state
      setArrayData({
        ...arrayData,
        [category]: updatedTechs,
      });

      // Clear selection
      setSelectedTechIds([]);
      setShowAddModal(false);
      setConfirmAddChecked(false);
      setSelectedAddOption("");
      setSelectedTargetCategory("");
      
      toast.success(
        `Added ${selectedTechs.length} technologies to ${category}`
      );
    } catch (error) {
      console.error("Error updating technology list:", error);
      toast.error("Failed to update technology list");
    }
  };

  // Handle adding to both lists
  const handleAddToBoth = async (category) => {
    await handleAddToReview();
    await handleAddToRefList(category);
    setShowAddModal(false);
    setConfirmAddChecked(false);
  };

  // Handle opening normalise modal
  const handleOpenNormaliseModal = (tech) => {
    setNormaliseFrom(tech);
    // Find all existing technologies from both radar and reference list
    const existingTechs = new Set();

    // Add technologies from radar
    radarData.entries.forEach((entry) => {
      existingTechs.add(entry.title);
    });

    // Add technologies from reference lists
    Object.values(arrayData).forEach((techs) => {
      techs.forEach((tech) => existingTechs.add(tech));
    });

    // Find affected projects
    const affected = csvData.filter((project) => {
      return Object.entries(fieldsToScan).some(([field]) => {
        const technologies = project[field]?.split(";") || [];
        return technologies.some((t) => t.trim() === tech);
      });
    });

    setAffectedProjects(affected);
    setShowNormaliseModal(true);
  };

  // Handle normalizing technology names
  const handleNormalise = async () => {
    if (!normaliseFrom || !normaliseTo) return;

    try {
      const baseUrl =
        process.env.NODE_ENV === "development"
          ? "http://localhost:5001/admin/api/normalise-technology"
          : "/admin/api/normalise-technology";

      const response = await fetch(baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: normaliseFrom,
          to: normaliseTo,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to normalise technology");
      }

      // Refresh data after normalization
      await fetchAllData();

      toast.success(
        `Successfully normalised ${normaliseFrom} to ${normaliseTo}`
      );
      setShowNormaliseModal(false);
      setNormaliseFrom("");
      setNormaliseTo("");
      setAffectedProjects([]);
    } catch (error) {
      console.error("Error normalizing technology:", error);
      toast.error("Failed to normalise technology");
    }
  };

  // Add a new technology to a specific category
  const handleAddNewTechnologyToCategory = async (category) => {
    if (!newTechnology.trim() || !category) return;

    try {
      const updatedTechs = [...arrayData[category], newTechnology];

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
          category,
          items: updatedTechs,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update technology list");
      }

      // Update local state
      setArrayData({
        ...arrayData,
        [category]: updatedTechs,
      });

      setNewTechnology("");
      setShowAddFormCategory(null);
      toast.success(`Added ${newTechnology} to ${category}`);
    } catch (error) {
      console.error("Error updating technology list:", error);
      toast.error("Failed to update technology list");
    }
  };

  // Sort technologies in a specific category
  const handleSortCategory = (category, sortType) => {
    const technologies = [...arrayData[category]];
    let sortedTechs;

    switch (sortType) {
      case "alpha-asc":
        sortedTechs = technologies.sort((a, b) => a.localeCompare(b));
        break;
      case "alpha-desc":
        sortedTechs = technologies.sort((a, b) => b.localeCompare(a));
        break;
      case "length-desc":
        sortedTechs = technologies.sort((a, b) => b.length - a.length);
        break;
      case "length-asc":
        sortedTechs = technologies.sort((a, b) => a.length - b.length);
        break;
      default:
        return;
    }

    setArrayData({
      ...arrayData,
      [category]: sortedTechs,
    });
  };

  // Render all categories content
  const renderAllCategories = () => {
    return Object.entries(arrayData)
      .filter(([category]) => 
        selectedCategories.length === 0 || 
        selectedCategories.some(selected => selected.value === category)
      )
      .map(([category, technologies]) => {
        const filteredTechs = technologies.filter(
          (tech) =>
            !searchTerm.trim() ||
            tech.toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (filteredTechs.length === 0) return null;

        return (
          <div key={category} className="category-section">
            <div className="category-header">
              <div className="category-header-left">
                <h4>{category}</h4>
                <span className="tech-count">({filteredTechs.length})</span>
              </div>
            </div>
            <table className="tech-table editor-table">
              <tbody>
                {filteredTechs.map((tech, index) => (
                  <tr key={`${tech}-${index}`}>
                    <td className="name-cell">
                      {editingTech === tech ? (
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="add-tech-input"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleEditTechnology(tech, editValue, category);
                            } else if (e.key === "Escape") {
                              setEditingTech(null);
                              setEditValue("");
                            }
                          }}
                        />
                      ) : (
                        tech
                      )}
                    </td>
                    <td className="actions-cell">
                      {editingTech === tech ? (
                        <>
                          <button
                            className="table-action-btn confirm-btn"
                            onClick={() =>
                              handleEditTechnology(tech, editValue, category)
                            }
                            disabled={!editValue.trim() || editValue === tech}
                          >
                            <FaCheck />
                          </button>
                          <button
                            className="table-action-btn cancel-btn"
                            onClick={() => {
                              setEditingTech(null);
                              setEditValue("");
                            }}
                          >
                            <FaRegTimesCircle />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            className="table-action-btn edit-btn"
                            onClick={() => {
                              setEditingTech(tech);
                              setEditValue(tech);
                            }}
                            title="Edit technology"
                          >
                            <FaPencilAlt />
                          </button>
                          <button
                            className="table-action-btn remove-btn"
                            onClick={() => handleRemoveTechnology(tech, category)}
                            title="Remove technology"
                          >
                            <FaTrash />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
                {showAddFormCategory === category ? (
                  <tr className="add-tech-form-row">
                    <td>
                      <input
                        type="text"
                        value={newTechnology}
                        onChange={(e) => setNewTechnology(e.target.value)}
                        className="add-tech-input"
                        placeholder="Enter technology name"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleAddNewTechnologyToCategory(category);
                          } else if (e.key === "Escape") {
                            setShowAddFormCategory(null);
                            setNewTechnology("");
                          }
                        }}
                      />
                    </td>
                    <td>
                      <div className="add-tech-actions">
                        <button
                          className="table-action-btn confirm-btn"
                          onClick={() => handleAddNewTechnologyToCategory(category)}
                          disabled={!newTechnology.trim()}
                        >
                          <FaCheck />
                        </button>
                        <button
                          className="table-action-btn cancel-btn"
                          onClick={() => {
                            setShowAddFormCategory(null);
                            setNewTechnology("");
                          }}
                        >
                          <FaRegTimesCircle />
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <tr className="add-tech-row">
                    <td colSpan={2}>
                      <button
                        className="add-tech-btn"
                        onClick={() => setShowAddFormCategory(category)}
                      >
                        <FaPlus /> Add Technology
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        );
      });
  };

  /**
   * Quick normalize function when clicking on a similar technology
   */
  const quickNormalize = (fromTech, toTech) => {
    setNormaliseFrom(fromTech);
    setNormaliseTo(toTech);
    
    // Find affected projects
    const affected = csvData.filter((project) => {
      return Object.entries(fieldsToScan).some(([field]) => {
        const technologies = project[field]?.split(";") || [];
        return technologies.some((t) => t.trim() === fromTech);
      });
    });
    
    setAffectedProjects(affected);
    setShowNormaliseModal(true);
  };

  // Handle opening the similarity modal
  const handleOpenSimilarityModal = (tech, similarTechs) => {
    setSelectedTechForModal(tech);
    setSelectedSimilarTechs(similarTechs);
    setModalOpen(true);
  };

  // Handle closing the similarity modal
  const handleCloseSimilarityModal = () => {
    setModalOpen(false);
  };

  // Count technologies with similar matches
  const countTechnologiesWithSimilarMatches = () => {
    return Array.from(untrackedTechnologies.values()).filter(
      (info) => info.similarTechnologies && info.similarTechnologies.length > 0
    ).length;
  };

  return (
    <div className="admin-container" style={{ paddingTop: "0px" }}>
      <Header
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        hideSearch={false}
      />
      {isLoading ? (
        <p>Loading technology data...</p>
      ) : (
        <div className="tech-management-grid">
          <div className="tech-radar-status-column">
            <div className="technology-editor-header">
              <h3 className="existing-banners-title">
                Untracked Technologies
                {selectedTechIds.length > 0 && (
                  <span className="selection-info">
                    {" "}
                    - {selectedTechIds.length} selected
                  </span>
                )}
              </h3>
              <div className="similarity-tech-radar-filter">
                <div className="similarity-threshold-container">
                  <div className="similarity-threshold-header">
                    <div className="similarity-threshold-label">
                      Similarity threshold: {Math.round(similarityThreshold * 100)}%
                    </div>
                    <button 
                      className={`similarity-threshold-edit ${showThresholdSlider ? 'active' : ''}`}
                      onClick={toggleThresholdSlider}
                      title={showThresholdSlider ? "Hide controls" : "Edit threshold"}
                    >
                      {showThresholdSlider ? "Done" : "Edit"}
                    </button>
                  </div>
                  
                  {showThresholdSlider && (
                    <div className="similarity-threshold-controls">
                      <input
                        id="similarity-threshold"
                        type="range"
                        min="0.5"
                        max="0.95"
                        step="0.05"
                        value={similarityThreshold}
                        onChange={(e) => setSimilarityThreshold(parseFloat(e.target.value))}
                        className="similarity-threshold-slider"
                      />
                      <div className="similarity-stats">
                        {countTechnologiesWithSimilarMatches()} of {untrackedTechnologies.size} technologies have potential matches
                      </div>
                      <button 
                        className="similarity-threshold-reset" 
                        onClick={() => setSimilarityThreshold(SIMILARITY_THRESHOLD)}
                        title="Reset to default (80%)"
                      >
                        Reset to default
                      </button>
                    </div>
                  )}
                </div>
                {selectedTechIds.length > 0 && (
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
                )}
                <MultiSelect
                  options={getQuadrantOptions()}
                  value={selectedQuadrants}
                  onChange={setSelectedQuadrants}
                  placeholder="Filter by quadrants"
                />
              </div>
            </div>
            <div className="admin-modal-field untracked-modal">
              <div className="tech-table-container">
                <table className="tech-table">
                  <thead>
                    <tr>
                      <th>
                        <input
                          type="checkbox"
                          checked={selectAll}
                          onChange={handleSelectAll}
                        />
                      </th>
                      <th
                        className={`sortable-header ${sortConfig.key === "name" ? `sorted-${sortConfig.direction}` : ""}`}
                        onClick={() => requestSort("name")}
                      >
                        Technology ({getFilteredTechnologies().length})
                        {sortConfig.key === "name" && (
                          <span className="sort-indicator">
                            {sortConfig.direction === "ascending" ? "↑" : "↓"}
                          </span>
                        )}
                      </th>
                      <th
                        className={`sortable-header ${sortConfig.key === "projects" ? `sorted-${sortConfig.direction}` : ""}`}
                        onClick={() => requestSort("projects")}
                      >
                        Projects
                        {sortConfig.key === "projects" && (
                          <span className="sort-indicator">
                            {sortConfig.direction === "ascending" ? "↑" : "↓"}
                          </span>
                        )}
                      </th>
                      <th
                        className={`sortable-header ${sortConfig.key === "quadrant" ? `sorted-${sortConfig.direction}` : ""}`}
                        onClick={() => requestSort("quadrant")}
                      >
                        Quadrant
                        {sortConfig.key === "quadrant" && (
                          <span className="sort-indicator">
                            {sortConfig.direction === "ascending" ? "↑" : "↓"}
                          </span>
                        )}
                      </th>
                      <th
                        className={`sortable-header ${sortConfig.key === "location" ? `sorted-${sortConfig.direction}` : ""}`}
                        onClick={() => requestSort("location")}
                      >
                        Location
                        {sortConfig.key === "location" && (
                          <span className="sort-indicator">
                            {sortConfig.direction === "ascending" ? "↑" : "↓"}
                          </span>
                        )}
                      </th>
                      <th>Source Question</th>
                      <th>Potential Matches</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {getSortedTechnologies().map(([tech, info]) => (
                      <tr key={tech}>
                        <td className="checkbox-cell">
                          <input
                            type="checkbox"
                            checked={selectedTechIds.includes(tech)}
                            onChange={(e) =>
                              handleSelectTech(tech, e.target.checked)
                            }
                          />
                        </td>
                        <td className="name-cell">{tech}</td>
                        <td className="count-cell">
                          {info.occurrenceCount || 0}
                        </td>
                        <td className="quadrant-cell">{info.category}</td>
                        <td
                          className={`location-cell ${info.status.inArrayData ? "tech-in-array" : info.status.inRadarData ? "tech-in-radar" : "tech-not-tracked"}`}
                        >
                          {!info.status.inArrayData && !info.status.inRadarData
                            ? "Not tracked"
                            : info.status.inRadarData
                              ? "Radar and Review"
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
                        <td className="similar-tech-cell">
                          {info.similarTechnologies && info.similarTechnologies.length > 0 ? (
                            <button
                              className="similar-count-btn"
                              onClick={() => handleOpenSimilarityModal(tech, info.similarTechnologies)}
                              title="Click to view similar technologies"
                            >
                              {info.similarTechnologies.length} potential {info.similarTechnologies.length === 1 ? 'match' : 'matches'}
                            </button>
                          ) : (
                            <span className="no-similar">None found</span>
                          )}
                        </td>
                        <td className="actions-cell">
                          <button
                            className="table-action-btn normalise-btn"
                            onClick={() => handleOpenNormaliseModal(tech)}
                            title="Normalise technology name"
                          >
                            <FaPencilRuler />
                          </button>
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
                <h3 className="existing-banners-title">Reference List</h3>
                <div className="editor-actions">
                    <>
                      <MultiSelect
                        options={getCategoryOptions()}
                        value={selectedCategories}
                        onChange={setSelectedCategories}
                        placeholder="Filter categories"
                      />
                      <select
                        className="sort-select"
                        onChange={(e) => handleSortAllCategories(e.target.value)}
                        defaultValue=""
                      >
                        <option value="" disabled>Sort all by...</option>
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
                    </>
                </div>
              </div>

              <div className="editor-content">
                {renderAllCategories()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Updated Add Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Add Selected Technologies</h3>
            <div className="modal-options">
              <div className="radio-options">
                <label>
                  <input
                    type="radio"
                    name="addOption"
                    value="review"
                    checked={selectedAddOption === "review"}
                    onChange={(e) => setSelectedAddOption(e.target.value)}
                  />
                  Add to Review
                </label>
                <label>
                  <input
                    type="radio"
                    name="addOption"
                    value="refList"
                    checked={selectedAddOption === "refList"}
                    onChange={(e) => setSelectedAddOption(e.target.value)}
                  />
                  Add to Ref. List
                </label>
                <label>
                  <input
                    type="radio"
                    name="addOption"
                    value="both"
                    checked={selectedAddOption === "both"}
                    onChange={(e) => setSelectedAddOption(e.target.value)}
                  />
                  Add to Both
                </label>
              </div>

              {(selectedAddOption === "refList" ||
                selectedAddOption === "both") && (
                <select
                  className="sort-select"
                  value={selectedTargetCategory}
                  onChange={(e) => setSelectedTargetCategory(e.target.value)}
                >
                  <option value="">Select category...</option>
                  {Object.keys(arrayData).map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              )}
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
            <div className="modal-buttons">
              <button
                className="admin-button"
                onClick={() => {
                  if (selectedAddOption === "review") {
                    handleAddToReview();
                  } else if (selectedAddOption === "refList") {
                    handleAddToRefList(selectedTargetCategory);
                  } else if (selectedAddOption === "both") {
                    handleAddToBoth(selectedTargetCategory);
                  }
                }}
                disabled={
                  !confirmAddChecked ||
                  !selectedAddOption ||
                  ((selectedAddOption === "refList" ||
                    selectedAddOption === "both") &&
                    !selectedTargetCategory)
                }
              >
                Confirm
              </button>
              <button
                className="admin-button secondary"
                onClick={() => {
                  setShowAddModal(false);
                  setConfirmAddChecked(false);
                  setSelectedAddOption("");
                  setSelectedTargetCategory("");
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Normalise Modal */}
      {showNormaliseModal && (
        <div className="modal-overlay">
          <div className="modal-content admin-dash-modal">
            <h3>Normalise Technology Name</h3>
            <div className="normalise-form">
              <div className="form-group">
                <label>From:</label>
                <input
                  type="text"
                  value={normaliseFrom}
                  readOnly
                  className="normalise-input"
                />
              </div>
              <div className="form-group">
                <label>To:</label>
                <input
                  type="text"
                  value={normaliseTo}
                  onChange={(e) => setNormaliseTo(e.target.value)}
                  className="normalise-input"
                  placeholder="Enter normalised name..."
                />
              </div>
            </div>

            <div className="affected-projects">
              <h4>This will update {affectedProjects.length} projects:</h4>
              <div className="affected-list">
                {affectedProjects.map((project, index) => (
                  <div key={index} className="affected-item">
                    <span className="affected-name">{project.Project}</span>
                    <span className="affected-programme">
                      ({project.Programme})
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="modal-buttons">
              <button
                className="admin-button"
                onClick={handleNormalise}
                disabled={!normaliseTo.trim()}
              >
                Confirm Changes
              </button>
              <button
                className="admin-button secondary"
                onClick={() => {
                  setShowNormaliseModal(false);
                  setNormaliseFrom("");
                  setNormaliseTo("");
                  setAffectedProjects([]);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Similarity Modal */}
      {modalOpen && (
        <SimilarityModal
          isOpen={modalOpen}
          onClose={handleCloseSimilarityModal}
          tech={selectedTechForModal}
          similarTechnologies={selectedSimilarTechs}
          onSelectTechnology={quickNormalize}
          thresholdPercentage={Math.round(similarityThreshold * 100)}
        />
      )}
    </div>
  );
};

export default TechManage;
