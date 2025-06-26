import React, { useState, useEffect } from 'react';
import '../../styles/components/ProjectModal.css';
import '../../styles/LangColours.css';
import { IoClose, IoSearch, IoChevronDown } from 'react-icons/io5';
import SkeletonLanguageCard from '../Statistics/Skeletons/SkeletonLanguageCard';
import { fetchRepositoryData } from '../../utilities/getRepositoryData';
import { useTechnologyStatus } from '../../utilities/getTechnologyStatus';
/**
 * ProjectModal component for displaying project details in a modal.
 *
 * @param {Object} props - The props passed to the ProjectModal component.
 * @param {boolean} props.isOpen - Whether the modal is open.
 * @param {Function} props.onClose - Function to call when the modal is closed.
 * @param {Object} props.project - The project object containing project details.
 * @param {Function} props.renderTechnologyList - Function to render technology list.
 * @param {Function} props.onTechClick - Function to handle technology click.
 */
const ProjectModal = ({
  isOpen,
  onClose,
  project,
  renderTechnologyList,
  onTechClick,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [repoData, setRepoData] = useState(null);
  const [otherRepoData, setOtherRepoData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedItems, setExpandedItems] = useState({
    projectDetails: true,
    repositories: true,
  });
  const [expandedGroups, setExpandedGroups] = useState({});
  const getTechnologyStatus = useTechnologyStatus();

  useEffect(() => {
    const fetchRepoInfo = async () => {
      // if the project modal is open and have Repo in the project object
      if (isOpen && project?.Repo) {
        setIsLoading(true);

        // split the Repo string by ; and remove any whitespace
        const allRepoUrls = project.Repo.split(';')
          .map(url => url.trim())
          .filter(url => url);

        // map the allRepoUrls to the github.com/ONSDigital repos
        const onsDigitalRepos = allRepoUrls
          .map(repo => {
            const repoUrl = repo.split('#')[0].trim();
            const match = repoUrl.match(/github\.com\/ONSDigital\/([^/\s]+)/i);
            return match ? match[1] : null;
          })
          .filter(Boolean);

        // if there are any onsDigitalRepos, fetch the repository data
        let repoDataResults = [];
        if (onsDigitalRepos.length > 0) {
          const data = await fetchRepositoryData(onsDigitalRepos);
          if (data?.repositories) {
            repoDataResults = data.repositories;
            setRepoData(data.repositories);
          }
        } else {
          setRepoData([]);
        }

        const fetchedRepoUrls = new Set(
          repoDataResults.map(repo => repo.url.toLowerCase())
        );

        // other repos are the repos that are not in the onsDigitalRepos
        const otherRepos = allRepoUrls.filter(url => {
          const normalizedUrl = url.toLowerCase();

          return !Array.from(fetchedRepoUrls).some(
            fetchedUrl =>
              normalizedUrl.includes(fetchedUrl) ||
              fetchedUrl.includes(normalizedUrl)
          );
        });

        setOtherRepoData(otherRepos);
        setIsLoading(false);
      } else {
        setRepoData(null);
        setOtherRepoData([]);
      }
    };

    fetchRepoInfo();
  }, [isOpen, project]);

  if (!isOpen || !project) return null;

  const renderRepoInfo = () => {
    if (!project.Repo) return null;
    return (
      <div>
        <div
          className="accordion-header"
          onClick={() => toggleAccordionItem('repositories')}
        >
          <h3 className="">Repositories</h3>
          <span
            className={`accordion-icon ${expandedItems.repositories ? 'expanded' : ''}`}
          >
            <IoChevronDown />
          </span>
        </div>
        {isLoading ? (
          <SkeletonLanguageCard />
        ) : project.Repo && expandedItems.repositories ? (
          <div className="repo-grid">
            {repoData?.map((repo, index) => (
              <div key={index} className="repo-card">
                <div className="repo-stats">
                  <div className="repo-stats-left">
                    <a
                      href={repo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="repo-name"
                    >
                      {repo.name}
                    </a>
                  </div>
                  <div className="repo-badges">
                    <span className="repo-badge">
                      {repo.visibility.toLowerCase()}
                    </span>
                    <span className="repo-badge">
                      {repo.is_archived ? 'Archived' : 'Active'}
                    </span>
                    <p
                      className={`repo-last-commit ${!repo.is_archived && new Date(repo.last_commit) < new Date(Date.now() - 180 * 24 * 60 * 60 * 1000) ? 'last-commit-threshold' : ''}`}
                    >
                      Last commit:{' '}
                      {new Date(repo.last_commit).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="language-labels">
                  {repo.technologies.languages.map((lang, i) => {
                    const status = getTechnologyStatus
                      ? getTechnologyStatus(lang.name)
                      : null;
                    const isClickable =
                      status && status !== 'review' && status !== 'ignore';
                    return (
                      <span
                        key={i}
                        className={`language-label ${isClickable ? `clickable-tech ${status}` : ''}`}
                        onClick={() =>
                          isClickable && onTechClick && onTechClick(lang.name)
                        }
                        title={`${lang.name} (${lang.percentage.toFixed(1)}%)`}
                      >
                        {`${lang.name} (${lang.percentage.toFixed(1)}%)`}
                      </span>
                    );
                  })}
                </div>
                {repo.technologies?.languages && (
                  <div className="repo-languages">
                    <div className="language-bars">
                      {repo.technologies.languages.map((lang, i) => (
                        <div
                          key={i}
                          className={`language-bar ${lang.name}`}
                          style={{
                            width: `${lang.percentage}%`,
                          }}
                          title={`${lang.name}: ${lang.percentage.toFixed(1)}%`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
            {otherRepoData && otherRepoData.length > 0 && (
              <>
                {otherRepoData.map((repoUrl, index) => {
                  let displayName = repoUrl;

                  return (
                    <div key={index} className="repo-card">
                      <div className="repo-stats">
                        <div className="repo-stats-left">
                          <a
                            href={repoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="repo-name"
                          >
                            {displayName}
                          </a>
                        </div>
                        <div className="repo-badges">
                          <span className="repo-badge">
                            {repoUrl.includes('gitlab')
                              ? 'GitLab'
                              : repoUrl.includes('github')
                                ? 'GitHub'
                                : 'Repository'}
                          </span>
                        </div>
                      </div>
                      <div className="repo-languages">
                        <div className="language-bars">
                          <div
                            className={`language-bar`}
                            style={{
                              width: `100%`,
                              backgroundColor: '#cccccc',
                            }}
                            title={`Unknown`}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        ) : !project.Repo ? (
          <div className="repo-info-loading">
            No repository information available. The repositories may not have
            been found yet or from another organisation.
          </div>
        ) : null}
      </div>
    );
  };

  // Group definitions
  const groups = {
    languages: [
      'Language_Main',
      'Language_Others',
      'Language_Frameworks',
      'Testing_Frameworks',
    ],
    infrastructure: [
      'Infrastructure',
      'CICD',
      'Cloud_Services',
      'Containers',
      'Hosted',
      'Architectures',
    ],
    security: ['IAM_Services', 'Source_Control', 'Branching_Strategy'],
    quality: ['Static_Analysis', 'Code_Formatter', 'Monitoring'],
    data: ['Datastores', 'Database_Technologies', 'Data_Output_Formats'],
    integrations: ['Integrations_ONS', 'Integrations_External'],
    general: [
      'Project_Area',
      'DST_Area',
      'Project_Tools',
      'Other_Tools',
      'Datasets_Used',
      'Code_Editors',
      'Communication',
      'Collaboration',
      'Incident_Management',
      'Documentation_Tools',
      'UI_Tools',
      'Diagram_Tools',
      'Miscellaneous',
    ],
    repos: ['Repo'],
  };

  const fieldLabels = {
    Project_Area: 'Project Area',
    DST_Area: 'DST Area',
    Language_Main: 'Main Language',
    Language_Others: 'Other Languages',
    Language_Frameworks: 'Frameworks',
    Testing_Frameworks: 'Testing Frameworks',
    Hosted: 'Hosted On',
    Architectures: 'Architecture',
    Source_Control: 'Source Control',
    Branching_Strategy: 'Branching Strategy',
    Static_Analysis: 'Static Analysis',
    Code_Formatter: 'Code Formatter',
    Data_Output_Formats: 'Data Output Formats',
    Integrations_ONS: 'ONS Integrations',
    Integrations_External: 'External Integrations',
    Miscellaneous: 'Miscellaneous Tools',
  };

  const technologyListFields = [
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

  const filterItems = items => {
    return items.filter(key => {
      if (!project[key]) return false;
      const label = fieldLabels[key] || key.replace(/_/g, ' ');
      const value = project[key].toString().toLowerCase();
      return (
        label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        value.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  };

  const toggleAccordionGroup = item => {
    setExpandedGroups(prev => ({
      ...prev,
      [item]: !prev[item],
    }));
  };

  const renderGroup = (title, keys) => {
    const filteredKeys = filterItems(keys);
    const validKeys = filteredKeys.filter(key => {
      const value = project[key];
      return value !== 'None' && value !== 'N/A' && value !== 'none';
    });

    if (validKeys.length === 0) return null;

    return (
      <div className="project-group">
        <div
          className="accordion-header"
          onClick={() => toggleAccordionGroup(title)}
        >
          <h3>{title}</h3>
          <span
            className={`accordion-icon ${!expandedGroups[title] ? 'expanded' : ''}`}
          >
            <IoChevronDown />
          </span>
        </div>
        {!expandedGroups[title] && (
          <div className="group-content">
            {validKeys.map(key => {
              const value = project[key];
              if (key.toLowerCase() === 'miscellaneous') {
                return (
                  <div
                    key={key}
                    className={`detail-item ${title === 'Repositories' ? 'large-span' : ''}`}
                  >
                    <h3>{fieldLabels[key] || key.replace(/_/g, ' ')}:</h3>
                    <div className="miscellaneous-block">
                      {value.split(';').map((item, idx) => {
                        const colonIndex = item.indexOf(':');
                        let label = item;
                        let description = '';
                        if (colonIndex !== -1) {
                          label = item.slice(0, colonIndex);
                          description = item.slice(colonIndex + 1).trim();
                        }
                        return (
                          <div key={idx} className="misc-item">
                            <div>{label.trim()}:</div>
                            {description && (
                              <div className="misc-desc">{description}</div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              }
              return (
                <div
                  key={key}
                  className={`detail-item ${title === 'Repositories' ? 'large-span' : ''}`}
                  tabIndex={0}
                >
                  <h3>{fieldLabels[key] || key.replace(/_/g, ' ')}:</h3>
                  <p style={{ whiteSpace: 'pre-wrap' }}>
                    {technologyListFields.includes(key)
                      ? renderTechnologyList(value)
                      : value.replace(/;/g, '; ')}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const toggleAccordionItem = item => {
    setExpandedItems(prev => ({
      ...prev,
      [item]: !prev[item],
    }));
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content project-modal"
        onClick={e => e.stopPropagation()}
      >
        <div className="project-header">
          <div className="project-header-left">
            <h2>{project.Project}</h2>
            {project.Project_Short && (
              <div className="project-short-name-container">
                {project.Project_Short && (
                  <div className="project-short-name">
                    ({project.Project_Short})
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="project-header-right">
            <div className="search-container-projects">
              <IoSearch className="search-icon-projects" />
              <input
                type="text"
                placeholder="Search project details..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="search-input-projects"
                aria-label="Search project details"
              />
            </div>
            <button
              className="modal-close"
              onClick={onClose}
              title="Close modal"
              aria-label="Close modal"
            >
              <IoClose />
            </button>
          </div>
        </div>

        <div className="project-accordion">
          <div className="project-accordion-item">
            <div
              className="accordion-header"
              onClick={() => toggleAccordionItem('projectDetails')}
            >
              <h3>Project Details</h3>
              <span
                className={`accordion-icon ${expandedItems.projectDetails ? 'expanded' : ''}`}
              >
                <IoChevronDown />
              </span>
            </div>
            {expandedItems.projectDetails && (
              <div className="accordion-content">
                {project.Programme && (
                  <div className="detail-section">
                    <h4>Programme</h4>
                    <p>
                      {project.Programme} ({project.Programme_Short})
                    </p>
                  </div>
                )}

                {project.Technical_Contact && (
                  <div className="detail-section">
                    <h4>Technical Contact</h4>
                    <p>{project.Technical_Contact}</p>
                  </div>
                )}

                {project.Delivery_Manager && (
                  <div className="detail-section">
                    <h4>Delivery Manager</h4>
                    <p>{project.Delivery_Manager}</p>
                  </div>
                )}

                {project.Developed && (
                  <div className="detail-section">
                    <h4>Developed</h4>
                    <p>{project.Developed}</p>
                  </div>
                )}

                {project.Stage && (
                  <div className="detail-section">
                    <h4>Stage</h4>
                    <p>{project.Stage}</p>
                  </div>
                )}

                {project.Documentation && (
                  <div className="detail-section">
                    <h4>Documentation</h4>
                    <a
                      href={project.Documentation}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="project-link"
                    >
                      {project.Documentation.length > 64
                        ? `${project.Documentation.slice(0, 64)}...`
                        : project.Documentation}
                    </a>
                  </div>
                )}

                {project.Description && (
                  <div className="detail-section">
                    <h4>Description</h4>
                    <p>{project.Description}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {renderRepoInfo()}

        <div className="project-details">
          {renderGroup('Languages & Frameworks', groups.languages)}
          {renderGroup('Infrastructure & Deployment', groups.infrastructure)}
          {renderGroup('Security & Source Control', groups.security)}
          {renderGroup('Quality & Monitoring', groups.quality)}
          {renderGroup('Data Management', groups.data)}
          {renderGroup('Integrations', groups.integrations)}
          {renderGroup('General Information', groups.general)}
        </div>
      </div>
    </div>
  );
};

export default ProjectModal;
