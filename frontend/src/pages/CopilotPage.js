import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import Header from '../components/Header/Header';
import HistoricDashboard from '../components/Copilot/Dashboards/HistoricDashboard';
import {
  filterUsageData,
  processUsageData,
  fetchTeamsHistoricData,
  extractTeamData,
} from '../utilities/getUsageData';
import PageBanner from '../components/PageBanner/PageBanner';
import '../styles/CopilotPage.css';
import { useData } from '../contexts/dataContext';
import {
  exchangeCodeForToken,
  fetchUserTeams,
  loginWithGitHub,
  logoutUser,
  checkAuthStatus,
} from '../utilities/getTeams';
import { FaArrowLeft } from 'react-icons/fa';
import { TbLogout } from 'react-icons/tb';
import '../styles/components/MultiSelect.css';
import { BannerContainer } from '../components/Banner';
import { toast } from 'react-hot-toast';

function CopilotDashboard() {
  const navigate = useNavigate();
  const { scope: urlScope } = useParams();
  const [searchParams] = useSearchParams();

  const initialiseDateRange = data => {
    let end = data[data.length - 1]?.date
      ? new Date(data[data.length - 1].date)
      : new Date();
    let start = data[0]?.date ? new Date(data[0].date) : new Date();

    return {
      start: start.toISOString().slice(0, 10),
      end: end.toISOString().slice(0, 10),
    };
  };

  // Cancellation ref for fetchTeamData
  const fetchTeamDataCancelRef = React.useRef({ cancelled: false });

  const fetchTeamData = async slug => {
    fetchTeamDataCancelRef.current.cancelled = false;
    setIsTeamLoading(true);

    // Extract team data from the S3 historic data
    const teamUsageData = extractTeamData(teamsHistoricData, slug);
    if (fetchTeamDataCancelRef.current.cancelled) return;

    if (!teamUsageData) {
      toast.error('No data available for this team');
      setTeamSlug(null);
      navigate('/copilot/team', { replace: true });
      setIsTeamLoading(false);
      return null;
    }

    const { start, end } = initialiseDateRange(teamUsageData);
    setStartDate(start);
    setEndDate(end);

    setTeamData({
      allUsage: teamUsageData ?? [],
      filteredUsage: teamUsageData ?? [],
      processedUsage: teamUsageData ? processUsageData(teamUsageData) : [],
    });

    // Ensure we're showing the team data view
    setIsSelectingTeam(false);
    setTeamSlug(slug);
    setIsTeamLoading(false);
  };

  const getDashboardData = () => {
    if (scope === 'organisation') return historicOrgData;
    if (scope === 'team') return teamData;
  };

  const getGroupedData = () => {
    if (viewDatesBy === 'Day') return historicOrgData.allUsage;
    if (viewDatesBy === 'Week') return historicOrgData.weekUsage;
    if (viewDatesBy === 'Month') return historicOrgData.monthUsage;
    if (viewDatesBy === 'Year') return historicOrgData.yearUsage;
  };

  const setFilteredData = (data, setData) => {
    if (!data || !startDate || !endDate) return;
    const filteredData = filterUsageData(data, startDate, endDate);
    setData(prev => ({
      ...prev,
      filteredUsage: filteredData,
      processedUsage: processUsageData(filteredData),
    }));
  };

  const [historicOrgData, setHistoricOrgData] = useState({
    allUsage: [], // Equivalent of day usage
    weekUsage: [],
    monthUsage: [],
    yearUsage: [],
  });

  const [teamData, setTeamData] = useState({
    allUsage: [],
    filteredUsage: [],
    processedUsage: [],
  });

  const dateOptions = [
    { value: 'Day', label: 'Day' },
    { value: 'Week', label: 'Week' },
    { value: 'Month', label: 'Month' },
    { value: 'Year', label: 'Year' },
  ];

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [scope, setScope] = useState('organisation');
  const [isHistoricLoading, setIsHistoricLoading] = useState(false);
  const [hasFetchedHistoric, setHasFetchedHistoric] = useState(false);
  const { getHistoricUsageData } = useData();
  const [viewDatesBy, setViewDatesBy] = useState('Day');
  const [isSelectingTeam, setIsSelectingTeam] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [availableTeams, setAvailableTeams] = useState([]);
  const [isTeamLoading, setIsTeamLoading] = useState(false);
  const [isTeamsListLoading, setIsTeamsListLoading] = useState(false);
  const [teamSlug, setTeamSlug] = useState(null);
  const [isInitialised, setIsInitialised] = useState(false);
  const [isCopilotAdmin, setIsCopilotAdmin] = useState(false);
  const [userTeamSlugs, setUserTeamSlugs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [teamsHistoricData, setTeamsHistoricData] = useState(null);

  // Filter listed available teams based on search term
  const filteredAvailableTeams = useMemo(() => {
    if (!searchTerm) return availableTeams;
    return availableTeams.filter(
      team =>
        team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        team.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [availableTeams, searchTerm]);

  const data = getDashboardData();

  /**
   * Initialise state from URL parameters (only runs once on component mount)
   */
  useEffect(() => {
    const pathParts = window.location.pathname.split('/');
    const currentUrlScope = pathParts[2]; // Get scope from pathname

    if (currentUrlScope === 'org') {
      setScope('organisation');
    } else if (currentUrlScope === 'team') {
      setScope('team');
      const teamParam = pathParts[3];
      if (teamParam) {
        setTeamSlug(teamParam);
        setIsSelectingTeam(false);
        // Set loading state if we don't have teams historic data yet
        if (!teamsHistoricData) {
          setIsTeamLoading(true);
        }
      } else {
        setIsSelectingTeam(true);
      }
    } else {
      // Default to organisation historic view
      setScope('organisation');
      navigate('/copilot/org/historic', { replace: true });
    }

    // Mark as initialised after processing URL parameters
    setIsInitialised(true);
  }, [teamsHistoricData]); // Run when teams historic data is loaded

  /**
   * Handle manual date input changes
   */
  const handleDateChange = (type, value) => {
    if (type === 'start') {
      setStartDate(value);
    } else {
      setEndDate(value);
    }
  };

  /**
   * Set states from API data
   */
  useEffect(() => {
    const code = searchParams.get('code');

    const fetchTeamsHistoric = async () => {
      try {
        const teamsData = await fetchTeamsHistoricData();
        if (teamsData) {
          setTeamsHistoricData(teamsData);
        }
      } catch (err) {
        console.error('Failed to fetch teams historic data:', err);
      }
    };

    const authenticateGitHubUser = async () => {
      // Exchange code for token (this will set httpOnly cookie)
      if (code) {
        try {
          const success = await exchangeCodeForToken(code);

          if (!success) {
            console.error('Failed to exchange code for token');
            return;
          }

          // Remove code from URL after use
          const url = new URL(window.location);
          url.searchParams.delete('code');
          window.history.replaceState({}, '', url);
        } catch (err) {
          console.error('OAuth token exchange failed', err);
          return;
        }
      } else {
        console.log('No OAuth code found, checking existing authentication');
      }
      try {
        const isAuthenticated = await checkAuthStatus();
        if (isAuthenticated) {
          setIsAuthenticated(true);
          setIsTeamsListLoading(true);

          const [teamsData] = await Promise.all([
            fetchUserTeams(),
            fetchTeamsHistoric(),
          ]);

          if (teamsData && teamsData.teams && teamsData.teams.length >= 0) {
            setAvailableTeams(teamsData.teams);
            setIsCopilotAdmin(teamsData.isAdmin);
            setUserTeamSlugs(teamsData.userTeamSlugs || []);
          }
          setIsTeamsListLoading(false);
        } else {
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.error('Failed to check authentication status:', err);
        setIsAuthenticated(false);
        setIsTeamsListLoading(false);
      }
    };

    authenticateGitHubUser();
  }, []);

  /**
   * Fetch historic data on mount
   */
  useEffect(() => {
    const fetchHistoricData = async () => {
      if (!hasFetchedHistoric) {
        setIsHistoricLoading(true);
        const historicUsage = await getHistoricUsageData();
        setHistoricOrgData({
          allUsage: historicUsage ? processUsageData(historicUsage) : [],
          weekUsage: historicUsage
            ? processUsageData(historicUsage, 'week')
            : [],
          monthUsage: historicUsage
            ? processUsageData(historicUsage, 'month')
            : [],
          yearUsage: historicUsage
            ? processUsageData(historicUsage, 'year')
            : [],
        });
        setIsHistoricLoading(false);
        setHasFetchedHistoric(true);
      }
    };
    fetchHistoricData();
  }, [hasFetchedHistoric]);

  /**
   * Extract team data when we have both a team slug and historic data available
   */
  useEffect(() => {
    if (teamSlug && teamsHistoricData && scope === 'team' && !isSelectingTeam) {
      fetchTeamData(teamSlug);
    }
  }, [teamSlug, teamsHistoricData, scope, isSelectingTeam]);

  /**
   * Filter and then process team usage data based on start and end date
   */
  useEffect(() => {
    if (scope === 'team') {
      setFilteredData(teamData.allUsage, setTeamData);
    }
  }, [scope, teamData.allUsage, startDate, endDate]);

  /**
   * Display team selection UI to choose a team to fetch data for
   */
  useEffect(() => {
    if (scope === 'organisation') {
      setIsSelectingTeam(false);
    } else if (scope === 'team' && !teamSlug) {
      // Only set to true if we don't have a team slug
      setIsSelectingTeam(true);
    }
    //Reset start and end dates when switching scopes
    const { start, end } = initialiseDateRange(data.allUsage);
    setStartDate(start);
    setEndDate(end);
  }, [scope, teamSlug]);

  const handleLogout = async () => {
    try {
      await logoutUser();
      setIsAuthenticated(false);
      setAvailableTeams([]);
      setIsCopilotAdmin(false);
      setUserTeamSlugs([]);
      setTeamSlug(null);
      setIsSelectingTeam(true);
      navigate('/copilot/team', { replace: true });
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  // Function to convert team name to hexadecimal color
  const stringToHexColor = str => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }

    // Convert to hex and ensure it's always 6 characters
    const color = Math.abs(hash).toString(16).substring(0, 6);
    return `#${'0'.repeat(6 - color.length)}${color}`;
  };

  return (
    <>
      <Header
        hideSearch={!(scope === 'team' && isSelectingTeam && isAuthenticated)}
        searchTerm={searchTerm}
        onSearchChange={value => setSearchTerm(value)}
      />
      <div className="admin-page">
        <PageBanner
          title="Copilot Usage Dashboard"
          description="Analyse Copilot usage statistics organisation-wide and by team"
          tabs={[
            { id: 'organisation', label: 'Organisation Usage' },
            { id: 'team', label: 'Team Usage' },
          ]}
          activeTab={scope}
          onTabChange={() => {
            setScope(prevScope => {
              const newScope =
                prevScope === 'organisation' ? 'team' : 'organisation';
              if (newScope === 'team') {
                setIsSelectingTeam(true);
                setTeamSlug(null);
                navigate('/copilot/team', { replace: true });
              } else {
                navigate('/copilot/org/historic', { replace: true });
              }
              return newScope;
            });
          }}
        />
        <div className="admin-container" tabIndex="0">
          {!isSelectingTeam && (
            <>
              {teamSlug && scope === 'team' && (
                <div className="dashboard-header">
                  <h2 style={{ margin: '0 0 16px 0' }}>Team: {teamSlug}</h2>

                  <button
                    className="view-data-button"
                    onClick={() => {
                      // Cancel any in-flight fetchTeamData
                      fetchTeamDataCancelRef.current.cancelled = true;
                      setIsSelectingTeam(true);
                      setTeamSlug(null);
                      navigate('/copilot/team', { replace: true });
                      const { start, end } = initialiseDateRange(data.allUsage);
                      setStartDate(start);
                      setEndDate(end);
                    }}
                    aria-label={`Return to team selection`}
                  >
                    <FaArrowLeft size={10} />
                    Return to Team Selection
                  </button>
                </div>
              )}
              <div className="dashboard-header">
                {scope === 'team' ? (
                  <div id="date-inputs">
                    <p className="header-text">Filter Data Range</p>
                    {isTeamLoading ? (
                      <p>Loading dates...</p>
                    ) : (
                      <div
                        style={{
                          display: 'flex',
                          gap: '16px',
                          alignItems: 'center',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px',
                          }}
                        >
                          <label
                            htmlFor="start-date"
                            style={{ fontSize: '14px', fontWeight: '500' }}
                          >
                            Start Date
                          </label>
                          <input
                            id="start-date"
                            type="date"
                            value={startDate}
                            onChange={e =>
                              handleDateChange('start', e.target.value)
                            }
                            min={data?.allUsage?.[0]?.date}
                            max={endDate}
                            aria-label="Start date for data range"
                          />
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px',
                          }}
                        >
                          <label
                            htmlFor="end-date"
                            style={{ fontSize: '14px', fontWeight: '500' }}
                          >
                            End Date
                          </label>
                          <input
                            id="end-date"
                            type="date"
                            value={endDate}
                            onChange={e =>
                              handleDateChange('end', e.target.value)
                            }
                            min={startDate}
                            max={
                              data?.allUsage?.[data.allUsage.length - 1]?.date
                            }
                            aria-label="End date for data range"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <p className="header-text">View Dates By</p>
                    <div className="date-selector">
                      <select
                        value={viewDatesBy}
                        onChange={e => setViewDatesBy(e.target.value)}
                        disabled={isHistoricLoading}
                        aria-label="View Dates By"
                      >
                        {dateOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
          <div></div>
          {scope === 'team' && isSelectingTeam ? (
            <>
              <div className="team-selection-header">
                <div>
                  <p className="header-text" style={{ margin: '0' }}>
                    Select a Team to View
                  </p>
                  {isCopilotAdmin && (
                    <p className="copilot-admin-badge">
                      You are a Copilot Admin - you can view all configured
                      teams. Teams with the{' '}
                      <span
                        className="member-team"
                        style={{
                          padding: '0 8px',
                          borderRadius: '8px',
                        }}
                      >
                        special border
                      </span>{' '}
                      are teams you are a member of.
                    </p>
                  )}
                </div>
                {isAuthenticated && (
                  <button
                    type="button"
                    className="github-logout-button"
                    onClick={handleLogout}
                    aria-label="Logout from GitHub"
                  >
                    <TbLogout size={14} />
                    Logout
                  </button>
                )}
              </div>
              {isAuthenticated ? (
                <div>
                  {isTeamsListLoading ? (
                    <p>Loading teams...</p>
                  ) : availableTeams && availableTeams.length > 0 ? (
                    <div className="teams-grid">
                      {filteredAvailableTeams.map(team => (
                        <div
                          key={team.slug}
                          className={`team-card ${userTeamSlugs.includes(team.slug) ? 'member-team' : ''}`}
                          aria-label={`Your team ${team.name}`}
                          tabIndex="0"
                        >
                          <div className="team-card-content">
                            <div className="team-name-container">
                              <div
                                className="team-color-circle"
                                style={{
                                  backgroundColor: stringToHexColor(team.name),
                                }}
                              ></div>
                              <h3 className="team-card-name">{team.name}</h3>
                            </div>
                            <p className="team-card-description">
                              {team.description || 'No description available'}
                            </p>
                            <a
                              href={team.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="team-card-link"
                              aria-label={`View ${team.name} on GitHub`}
                            >
                              View on GitHub
                            </a>
                          </div>
                          <button
                            className="team-card-button"
                            onClick={() => {
                              fetchTeamData(team.slug);
                              setTeamSlug(team.slug);
                              setIsSelectingTeam(false);
                              navigate(`/copilot/team/${team.slug}`, {
                                replace: true,
                              });
                            }}
                            aria-label={`View data for ${team.name} team data`}
                          >
                            View Data
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p>
                      {isCopilotAdmin
                        ? 'No teams available. Please ensure the teams_history.json file contains team data in S3.'
                        : 'No teams available. Please ensure you are a member of at least one team in the organisation with more than 5 active Copilot licenses.'}
                    </p>
                  )}
                </div>
              ) : (
                <div>
                  <button
                    type="button"
                    className="multi-select-control"
                    onClick={loginWithGitHub}
                  >
                    Login with GitHub
                  </button>
                </div>
              )}
              <p className="disclaimer-banner">
                {isCopilotAdmin
                  ? 'As a Copilot Admin, you can view any valid team. The GitHub API does not return Copilot team usage data if there are fewer than 5 members with Copilot licenses.'
                  : 'The GitHub API does not return Copilot team usage data if there are fewer than 5 members with Copilot licenses. This may result in only seat statistics being viewable on the dashboard.'}
              </p>
            </>
          ) : scope === 'organisation' ? (
            <HistoricDashboard
              scope={scope}
              data={getGroupedData()}
              isLoading={isHistoricLoading}
              viewDatesBy={viewDatesBy}
            />
          ) : (
            <HistoricDashboard
              scope={scope}
              data={data.processedUsage}
              isLoading={isTeamLoading}
              viewDatesBy={'Day'}
            />
          )}
        </div>
      </div>
      <BannerContainer
        page={scope === 'organisation' ? 'copilot/org' : 'copilot/team'}
      />
    </>
  );
}

export default CopilotDashboard;
