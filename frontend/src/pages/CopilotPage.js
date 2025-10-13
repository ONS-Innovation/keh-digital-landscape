import { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../components/Header/Header';
import LiveDashboard from '../components/Copilot/Dashboards/LiveDashboard';
import HistoricDashboard from '../components/Copilot/Dashboards/HistoricDashboard';
import {
  filterInactiveUsers,
  fetchTeamSeatData,
} from '../utilities/getSeatData';
import {
  filterUsageData,
  processUsageData,
  fetchTeamLiveUsageData,
} from '../utilities/getUsageData';
import PageBanner from '../components/PageBanner/PageBanner';
import '../styles/CopilotPage.css';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
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
import BannerTabs from '../components/PageBanner/BannerTabs';
import { BannerContainer } from '../components/Banner';
import { toast } from 'react-hot-toast';

function CopilotDashboard() {
  const historicTeamData = useRef(null); // TODO: Add team historic data support. Setting this for now to avoid lint errors.
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [sliderValues, setSliderValues] = useState(null);
  const [inactiveDays, setInactiveDays] = useState(28);
  const inactivityDate = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() - inactiveDays);
    return date.toISOString().slice(0, 10);
  }, [inactiveDays]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [viewMode, setViewMode] = useState('live');
  const [scope, setScope] = useState('organisation');
  const [isLiveLoading, setIsLiveLoading] = useState(true);
  const [isSeatsLoading, setIsSeatsLoading] = useState(true);
  const [isHistoricLoading, setIsHistoricLoading] = useState(false);
  const [hasFetchedHistoric, setHasFetchedHistoric] = useState(false);
  const { getLiveUsageData, getHistoricUsageData, getSeatsData } = useData();
  const [sliderFinished, setSliderFinished] = useState(true);
  const [viewDatesBy, setViewDatesBy] = useState('Day');
  const [isSelectingTeam, setIsSelectingTeam] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [availableTeams, setAvailableTeams] = useState([]);
  const [isTeamLoading, setIsTeamLoading] = useState(false);
  const [teamSlug, setTeamSlug] = useState(null);
  const [isCopilotAdmin, setIsCopilotAdmin] = useState(false);
  const [userTeamSlugs, setUserTeamSlugs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const [liveTeamData, setLiveTeamData] = useState({
    allUsage: [],
    filteredUsage: [],
    processedUsage: [],
    allSeatData: [],
    activeSeatData: [],
  });

  const initialiseDateRange = useCallback((data) => {
    let end = data[data.length - 1]?.date
      ? new Date(data[data.length - 1].date)
      : new Date();
    let start = data[0]?.date ? new Date(data[0].date) : new Date();

    return {
      start: start.toISOString().slice(0, 10),
      end: end.toISOString().slice(0, 10),
    };
  }, []);

  const getEndSliderValue = useCallback((data) => {
    const startDateStr = data[0]?.date;
    const endDateStr = data[data.length - 1]?.date;

    const start = new Date(startDateStr);
    const end = new Date(endDateStr);

    // Calculate number of days between the two dates, inclusive
    const diffDays =
      Math.abs(Math.ceil((end - start) / (1000 * 60 * 60 * 24))) + 1;
    return diffDays;
  }, []);

  // Cancellation ref for fetchTeamData
  const fetchTeamDataCancelRef = useRef({ cancelled: false });

  const fetchTeamData = useCallback(
    async slug => {
      fetchTeamDataCancelRef.current.cancelled = false;
      setIsTeamLoading(true);

      const liveUsage = await fetchTeamLiveUsageData(slug);
      if (fetchTeamDataCancelRef.current.cancelled) return;
      if (!liveUsage) {
        toast.error('You do not have permission to view this team');
        setTeamSlug(null);
        navigate('/copilot/team', { replace: true });
        return null;
      }

      const { start, end } = initialiseDateRange(liveUsage);
      setStartDate(start);
      setEndDate(end);
      setSliderValues([1, getEndSliderValue(liveUsage)]);
      const teamSeats = await fetchTeamSeatData(slug);
      if (fetchTeamDataCancelRef.current.cancelled) return;
      const activeTeamSeats = filterInactiveUsers(teamSeats, startDate);

      setLiveTeamData({
        allUsage: liveUsage ?? [],
        filteredUsage: liveUsage ?? [],
        processedUsage: liveUsage ? processUsageData(liveUsage) : [],
        allSeatData: teamSeats,
        activeSeatData: activeTeamSeats,
      });

      // Ensure we're showing the team data view
      setIsSelectingTeam(false);
      setTeamSlug(slug);
      setIsTeamLoading(false);
    },
    [
      fetchTeamDataCancelRef,
      setIsTeamLoading,
      setTeamSlug,
      setStartDate,
      setEndDate,
      setSliderValues,
      setLiveTeamData,
      setIsSelectingTeam,
      navigate,
      initialiseDateRange,
      getEndSliderValue,
      startDate,
    ]
  );

  const getDashboardData = () => {
    if (viewMode === 'live' && scope === 'organisation') return liveOrgData;
    if (viewMode === 'live' && scope === 'team') return liveTeamData;
    if (viewMode === 'historic' && scope === 'organisation')
      return historicOrgData;
    if (viewMode === 'historic' && scope === 'team') return historicTeamData; // TODO: Add team historic data support
  };

  const getGroupedData = () => {
    if (scope === 'team') {
      // TODO: Add team historic data support
      if (viewDatesBy === 'Day') return historicTeamData.allUsage;
      if (viewDatesBy === 'Week') return historicTeamData.weekUsage;
      if (viewDatesBy === 'Month') return historicTeamData.monthUsage;
      if (viewDatesBy === 'Year') return historicTeamData.yearUsage;
    } else {
      if (viewDatesBy === 'Day') return historicOrgData.allUsage;
      if (viewDatesBy === 'Week') return historicOrgData.weekUsage;
      if (viewDatesBy === 'Month') return historicOrgData.monthUsage;
      if (viewDatesBy === 'Year') return historicOrgData.yearUsage;
    }
  };

  const setFilteredData = useCallback((data, setData) => {
    if (!data || !startDate || !endDate || !sliderFinished) return;
    const filteredData = filterUsageData(data, startDate, endDate);
    setData(prev => ({
      ...prev,
      filteredUsage: filteredData,
      processedUsage: processUsageData(filteredData),
    }));
  }, [startDate, endDate, sliderFinished]);

  const setActiveSeats = useCallback((data, setData) => {
    if (!data || !inactivityDate) return;
    const activeSeats = filterInactiveUsers(data, inactivityDate);
    setData(prev => ({
      ...prev,
      activeSeatData: activeSeats,
    }));
  }, [inactivityDate]);

  const [liveOrgData, setLiveOrgData] = useState({
    allUsage: [],
    filteredUsage: [],
    processedUsage: [],
    allSeatData: [],
    activeSeatData: [],
  });

  const [historicOrgData, setHistoricOrgData] = useState({
    allUsage: [], // Equivalent of day usage
    weekUsage: [],
    monthUsage: [],
    yearUsage: [],
  });

  const dateOptions = [
    { value: 'Day', label: 'Day' },
    { value: 'Week', label: 'Week' },
    { value: 'Month', label: 'Month' },
    { value: 'Year', label: 'Year' },
  ];

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
      const viewMode = pathParts[3];
      if (viewMode === 'historic') {
        setViewMode('historic');
      } else {
        setViewMode('live');
      }
    } else if (currentUrlScope === 'team') {
      setScope('team');
      const teamParam = pathParts[3];
      if (teamParam) {
        setTeamSlug(teamParam);
        setIsSelectingTeam(false);
        // Fetch team data if we have a team slug from URL
        fetchTeamData(teamParam);
      } else {
        setIsSelectingTeam(true);
      }
    } else {
      // Default to organisation live view
      setScope('organisation');
      setViewMode('live');
      navigate('/copilot/org/live', { replace: true });
    }
  }, [fetchTeamData, navigate]); // Empty dependency array - only run once on mount

  /**
   * Trigger data filter upon slider completion
   *
   */
  const handleSliderCompletion = () => {
    setSliderFinished(true);
  };

  /**
   * Provide visual feedback on slider positions and dates
   *
   */
  const updateSlider = values => {
    setSliderValues(values);

    const newStart = new Date();
    newStart.setDate(
      newStart.getDate() - getEndSliderValue(data.allUsage) - 1 + values[0]
    );
    const newEnd = new Date();
    newEnd.setDate(
      newEnd.getDate() - getEndSliderValue(data.allUsage) + values[1]
    );

    setStartDate(newStart.toISOString().slice(0, 10));
    setEndDate(newEnd.toISOString().slice(0, 10));
  };

  /**
   * Set states from API data
   */
  useEffect(() => {
    const code = searchParams.get('code');

    const fetchLiveAndSeatsData = async () => {
      setIsLiveLoading(true);
      setIsSeatsLoading(true);

      const [liveUsage, seats] = await Promise.all([
        getLiveUsageData(),
        getSeatsData(),
      ]);

      const { start, end } = initialiseDateRange(liveUsage);
      setStartDate(start);
      setEndDate(end);
      setSliderValues([1, getEndSliderValue(liveUsage)]);

      setLiveOrgData({
        allUsage: liveUsage ?? [],
        filteredUsage: liveUsage ?? [],
        processedUsage: liveUsage ? processUsageData(liveUsage) : [],
        allSeatData: seats ?? [],
        activeSeatData: seats ? filterInactiveUsers(seats, start) : [],
      });

      setIsLiveLoading(false);
      setIsSeatsLoading(false);
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
          const teamsData = await fetchUserTeams();
          if (teamsData && teamsData.teams && teamsData.teams.length >= 0) {
            setAvailableTeams(teamsData.teams);
            setIsCopilotAdmin(teamsData.isAdmin);
            setUserTeamSlugs(teamsData.userTeamSlugs || []);
          }
        } else {
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.error('Failed to check authentication status:', err);
        setIsAuthenticated(false);
      }
    };

    fetchLiveAndSeatsData();
    authenticateGitHubUser();
  }, [getLiveUsageData, getSeatsData, searchParams, initialiseDateRange, getEndSliderValue]);

  /**
   * Fetch historic data if view mode is set to historic and has not been fetched yet
   */
  useEffect(() => {
    const fetchHistoricData = async () => {
      if (!hasFetchedHistoric && viewMode === 'historic') {
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
  }, [viewMode, hasFetchedHistoric, getHistoricUsageData]);

  /**
   * Filter and then process live usage data based on start and end date
   */
  useEffect(() => {
    scope === 'organisation'
      ? setFilteredData(liveOrgData.allUsage, setLiveOrgData)
      : setFilteredData(liveTeamData.allUsage, setLiveTeamData);

    setSliderFinished(false);
  }, [
    scope,
    liveOrgData.allUsage,
    liveTeamData.allUsage,
    startDate,
    endDate,
    sliderFinished,
    setFilteredData,
    setActiveSeats,
  ]);

  /**
   * Update active seats
   */
  useEffect(() => {
    scope === 'organisation'
      ? setActiveSeats(liveOrgData.allSeatData, setLiveOrgData)
      : setActiveSeats(liveTeamData.allSeatData, setLiveTeamData);
  }, [
    scope,
    inactiveDays,
    inactivityDate,
    liveOrgData.allSeatData,
    liveTeamData.allSeatData,
    setActiveSeats,
    inactiveDays,
    inactivityDate,
  ]);

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
    setSliderValues([1, getEndSliderValue(data.allUsage)]);
  }, [scope, teamSlug, initialiseDateRange, getEndSliderValue, data.allUsage]);

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
            setViewMode('live'); // TODO: Add team historic data support
            setScope(prevScope => {
              const newScope =
                prevScope === 'organisation' ? 'team' : 'organisation';
              if (newScope === 'team') {
                setIsSelectingTeam(true);
                setTeamSlug(null);
                navigate('/copilot/team', { replace: true });
              } else {
                navigate('/copilot/org/live', { replace: true });
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
                      setSliderValues([1, getEndSliderValue(data.allUsage)]);
                    }}
                    aria-label={`Return to team selection`}
                  >
                    <FaArrowLeft size={10} />
                    Return to Team Selection
                  </button>
                </div>
              )}
              <div className="dashboard-header">
                {viewMode === 'live' ? (
                  <div id="slider">
                    <p className="header-text">Filter Live Data Range</p>
                    {isLiveLoading || isTeamLoading ? (
                      <p>Loading dates...</p>
                    ) : (
                      <div>
                        <p>Start: {startDate}</p>
                        <Slider
                          range
                          min={1}
                          max={getEndSliderValue(data.allUsage)}
                          value={sliderValues}
                          onChange={updateSlider}
                          onChangeComplete={handleSliderCompletion}
                          allowCross={false}
                          ariaLabelForHandle={[
                            'Start date selector',
                            'End date selector',
                          ]}
                          ariaValueTextFormatterForHandle={(value, index) => {
                            const usage = data?.allUsage;
                            if (!usage?.length)
                              return `${index === 0 ? 'Start' : 'End'} date: Unknown`;

                            const totalRange = getEndSliderValue(usage);
                            const date = new Date();
                            date.setDate(
                              date.getDate() - totalRange - 1 + value
                            );

                            if (isNaN(date.getTime()))
                              return `${index === 0 ? 'Start' : 'End'} date: Invalid`;

                            return `${index === 0 ? 'Start' : 'End'} date: ${date.toISOString().slice(0, 10)}`;
                          }}
                        />
                        <p id="slider-end">End: {endDate}</p>
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
                {scope === 'organisation' && (
                  <div>
                    <BannerTabs
                      tabs={[
                        { id: 'live', label: 'Live' },
                        { id: 'historic', label: 'Historic' },
                      ]}
                      activeTab={viewMode}
                      onTabChange={mode => {
                        setViewMode(mode);
                        navigate(`/copilot/org/${mode}`, { replace: true });
                      }}
                    />
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
                  {availableTeams && availableTeams.length > 0 ? (
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
                        ? 'No teams available. Please ensure the copilot_teams.json file is configured with team names in S3.'
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
          ) : viewMode === 'live' ? (
            <LiveDashboard
              scope={scope}
              data={data}
              isLiveLoading={
                scope === 'organisation' ? isLiveLoading : isTeamLoading
              }
              isSeatsLoading={isSeatsLoading}
              inactiveDays={inactiveDays}
              setInactiveDays={setInactiveDays}
              inactivityDate={inactivityDate}
            />
          ) : (
            <HistoricDashboard
              scope={scope}
              data={getGroupedData()}
              isLoading={isHistoricLoading}
              viewDatesBy={viewDatesBy}
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
