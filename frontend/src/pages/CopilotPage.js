import React, { useEffect, useState, useMemo } from 'react';
import Header from '../components/Header/Header';
import LiveDashboard from '../components/Copilot/Dashboards/LiveDashboard';
import HistoricDashboard from '../components/CoPilot/Dashboards/HistoricDashboard';
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
} from '../utilities/getTeams';
import TableBreakdown from '../components/Copilot/Breakdowns/TableBreakdown';
import { FaArrowLeft } from 'react-icons/fa';
import '../styles/components/MultiSelect.css';

function CopilotDashboard() {
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

  const getEndSliderValue = data => {
    const startDateStr = data[0]?.date;
    const endDateStr = data[data.length - 1]?.date;

    const start = new Date(startDateStr);
    const end = new Date(endDateStr);

    // Calculate number of days between the two dates, inclusive
    const diffDays =
      Math.abs(Math.ceil((end - start) / (1000 * 60 * 60 * 24))) + 1;
    return diffDays;
  };

  const fetchTeamData = async slug => {
    setIsTeamLoading(true);

    const liveUsage = await fetchTeamLiveUsageData(slug);

    const { start, end } = initialiseDateRange(liveUsage);
    setStartDate(start);
    setEndDate(end);
    setSliderValues([1, getEndSliderValue(liveUsage)]);
    const teamSeats = await fetchTeamSeatData(
      localStorage.getItem('userToken'),
      slug
    );
    const activeTeamSeats = filterInactiveUsers(teamSeats, startDate);

    setLiveTeamData({
      allUsage: liveUsage ?? [],
      filteredUsage: liveUsage ?? [],
      processedUsage: liveUsage ? processUsageData(liveUsage) : [],
      allSeatData: teamSeats,
      activeSeatData: activeTeamSeats,
    });

    setIsTeamLoading(false);
  };

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

  const setFilteredData = (data, setData) => {
    if (!data || !startDate || !endDate || !sliderFinished) return;
    const filteredData = filterUsageData(data, startDate, endDate);
    setData(prev => ({
      ...prev,
      filteredUsage: filteredData,
      processedUsage: processUsageData(filteredData),
    }));
  };

  const setActiveSeats = (data, setData) => {
    if (!data || !inactivityDate) return;
    const activeSeats = filterInactiveUsers(data, inactivityDate);
    setData(prev => ({
      ...prev,
      activeSeatData: activeSeats,
    }));
  };

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

  const [liveTeamData, setLiveTeamData] = useState({
    allUsage: [],
    filteredUsage: [],
    processedUsage: [],
    allSeatData: [],
    activeSeatData: [],
  });

  const dateOptions = [
    { value: 'Day', label: 'Day' },
    { value: 'Week', label: 'Week' },
    { value: 'Month', label: 'Month' },
    { value: 'Year', label: 'Year' },
  ];

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

  const data = getDashboardData();

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
    //Handle GitHub login redirect
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('fromTab');
    if (tab === 'team') {
      setScope('team');
    }
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
    fetchLiveAndSeatsData();
  }, []);

  /**
   * Authenticate user with GitHub and fetch teams if authenticated
   */
  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get('code');

    const authenticateGitHubUser = async () => {
      const existingToken = localStorage.getItem('userToken');

      // Exchange code for token
      if (code && !existingToken) {
        try {
          const token = await exchangeCodeForToken(code);
          if (!token) {
            console.error('Failed to exchange code for token');
            return;
          }

          localStorage.setItem('userToken', token);

          // Remove code from URL after use
          const url = new URL(window.location);
          url.searchParams.delete('code');
          window.history.replaceState({}, '', url);
        } catch (err) {
          console.error('OAuth token exchange failed', err);
          return;
        }
      }

      // Validate token with GitHub
      const token = localStorage.getItem('userToken');
      if (token) {
        try {
          const res = await fetch('https://api.github.com/user', {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (res.status === 200) {
            setIsAuthenticated(true);
            const teams = await fetchUserTeams(token);
            if (teams && teams.length > 0) {
              setAvailableTeams(teams);
            }
          } else if (res.status === 401) {
            console.warn('GitHub token invalid. Clearing.');
            localStorage.removeItem('userToken');
            setIsAuthenticated(false);
          } else {
            console.error('Unexpected token validation response', res.status);
          }
        } catch (err) {
          console.error('Failed to validate GitHub token', err);
        }
      }
    };

    authenticateGitHubUser();
  }, []);

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
  }, [viewMode, hasFetchedHistoric]);

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
  ]);

  /**
   * Display team selection UI to choose a team to fetch data for
   */
  useEffect(() => {
    if (scope === 'organisation') {
      setIsSelectingTeam(false);
    } else if (scope === 'team') {
      setIsSelectingTeam(true);
    }
    //Reset start and end dates when switching scopes
    const { start, end } = initialiseDateRange(data.allUsage);
    setStartDate(start);
    setEndDate(end);
    setSliderValues([1, getEndSliderValue(data.allUsage)]);
  }, [scope]);

  return (
    <>
      <Header hideSearch={true} />
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
            setScope(scope =>
              scope === 'organisation' ? 'team' : 'organisation'
            );
          }}
        />
        <div className="admin-container" tabIndex="0">
          {!isSelectingTeam && (
            <div className="dashboard-header">
              {scope === 'organisation' ? ( // TODO: Add team historic data support
                <div>
                  <p className="header-text">View Data Type</p>
                  <div className="banner-type-selector">
                    <div
                      className={`banner-type-option ${viewMode === 'live' ? 'selected' : ''}`}
                      onClick={() => setViewMode('live')}
                    >
                      Live
                    </div>
                    <div
                      className={`banner-type-option ${viewMode === 'historic' ? 'selected' : ''}`}
                      onClick={() => setViewMode('historic')}
                    >
                      Historic
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  {teamSlug && (
                    <p className="header-text">
                      Viewing Data for Team: {teamSlug}
                    </p>
                  )}
                  <button
                    id="return-to-selection"
                    className="view-data-button"
                    onClick={() => {
                      setIsSelectingTeam(true);
                      const { start, end } = initialiseDateRange(data.allUsage);
                      setStartDate(start);
                      setEndDate(end);
                      setSliderValues([1, getEndSliderValue(data.allUsage)]);
                    }}
                    aria-label={`Return to team selection`}
                  >
                    <FaArrowLeft />
                    <p>Return to Team Selection</p>
                  </button>
                </div>
              )}
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
                          date.setDate(date.getDate() - totalRange - 1 + value);

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
            </div>
          )}
          <div></div>
          {scope === 'team' && isSelectingTeam ? (
            <>
              <div className="header-text">
                <p>Select Team to View</p>
              </div>
              {isAuthenticated ? (
                <div>
                  {availableTeams && availableTeams.length > 0 ? (
                    <div>
                      <TableBreakdown
                        data={availableTeams}
                        columns={['name', 'description', 'url', 'viewData']}
                        idField="slug"
                        idHeader="Team Slug"
                        headerMap={{
                          name: 'Name',
                          description: 'Description',
                          url: 'URL',
                          viewData: 'View Data',
                        }}
                        tableContext="Copilot Team Selection"
                        onViewDataClick={slug => {
                          fetchTeamData(slug);
                          setTeamSlug(slug);
                          setIsSelectingTeam(false);
                        }}
                      />
                    </div>
                  ) : (
                    <p>
                      No teams available. Please ensure you are a member of at
                      least one team in the organisation.
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
    </>
  );
}

export default CopilotDashboard;
