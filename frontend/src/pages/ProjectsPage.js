import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header/Header';
import Projects from '../components/Projects/Projects';
import ProjectModal from '../components/Projects/ProjectModal';
import { useData } from '../contexts/dataContext';
import toast from 'react-hot-toast';
import { useTechnologyStatus } from '../utilities/getTechnologyStatus';
import { BannerContainer } from '../components/Banner';
/**
 * ProjectsPage component for displaying the projects page.
 *
 * @returns {JSX.Element} - The ProjectsPage component.
 */
function ProjectsPage() {
  const [projectsData, setProjectsData] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [radarData, setRadarData] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const { getCsvData, getTechRadarData } = useData();
  const getTechnologyStatus = useTechnologyStatus();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [csvData, techData] = await Promise.all([
          getCsvData(),
          getTechRadarData(),
        ]);
        setProjectsData(csvData);
        setRadarData(techData);
      } catch (error) {
        console.error(error);
        toast.error('Unexpected error occurred.');
      }
    };

    fetchData();
  }, [getCsvData, getTechRadarData]);

  /**
   * handleProjectClick function handles the project click event.
   *
   * @param {Object} project - The project object to handle the click for.
   */
  const handleProjectClick = project => {
    setSelectedProject(project);
    setIsProjectModalOpen(true);
  };

  /**
   * handleRefresh function handles the refresh event.
   */
  const handleRefresh = async () => {
    try {
      const newData = await getCsvData(true); // Pass forceRefresh as true
      setProjectsData(newData);
      toast.success('Data refreshed successfully.');
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
  };

  /**
   * handleTechClick function handles the technology click event.
   *
   * @param {string} tech - The technology to handle the click for.
   */
  const handleTechClick = tech => {
    if (!tech) return;

    const entry = radarData?.entries.find(
      entry => entry.title.toLowerCase() === tech.toLowerCase().trim()
    );

    if (entry) {
      navigate('/radar', { state: { selectedTech: tech } });
    }
  };

  /**
   * getFilteredProjects function gets the filtered projects based on search term.
   *
   * @returns {Array} - The filtered projects.
   */
  const getFilteredProjects = () => {
    if (!projectsData) return [];
    if (!searchTerm.trim()) return projectsData;

    return projectsData.filter(project => {
      const searchString =
        `${project.Project} ${project.Project_Short} ${project.Project_Area} ${project.Team} ${project.Programme} ${project.Programme_Short} ${project.Description}`.toLowerCase();
      return searchString.includes(searchTerm.toLowerCase());
    });
  };

  /**
   * renderTechnologyList function renders the technology list.
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

  const filteredProjects = getFilteredProjects();

  return (
    <>
      <Header
        searchTerm={searchTerm}
        onSearchChange={value => setSearchTerm(value)}
        searchResults={[]}
        onSearchResultClick={handleProjectClick}
      />
      <BannerContainer page="projects" />
      <div className="projects-page">
        <Projects
          isOpen={true}
          onClose={() => {}}
          projectsData={filteredProjects}
          handleProjectClick={handleProjectClick}
          onRefresh={handleRefresh}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          getTechnologyStatus={getTechnologyStatus}
        />
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

export default ProjectsPage;
