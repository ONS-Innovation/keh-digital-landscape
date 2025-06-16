import React, { useEffect, useState, useMemo } from "react";
import Header from "../components/Header/Header";
import LiveDashboard from "../components/Copilot/Dashboards/LiveDashboard";
import HistoricDashboard from "../components/Copilot/Dashboards/HistoricDashboard";
import { filterInactiveUsers, fetchTeamSeatData } from "../utilities/getSeatData";
import { filterUsageData, processUsageData, fetchTeamLiveUsageData } from "../utilities/getUsageData";
import PageBanner from "../components/PageBanner/PageBanner";
import "../styles/CopilotPage.css";
import Slider from 'rc-slider';
import "rc-slider/assets/index.css";
import { useData } from "../contexts/dataContext";
import { exchangeCodeForToken, fetchUserTeams } from "../utilities/getTeams";
import TableBreakdown from "../components/Copilot/Breakdowns/TableBreakdown";

const loginUrl = `https://github.com/login/oauth/authorize?` + 
  new URLSearchParams({
    client_id: process.env.REACT_APP_GITHUB_CLIENT_ID,
    redirect_uri: `${process.env.REACT_APP_URL}/copilot?fromTab=team`,
    scope: "user:email read:org",
  }).toString();

function CopilotDashboard() {

  const getDashboardData = () => {
    if (viewMode === "live" && scope === "organisation") return liveOrgData;
    if (viewMode === "live" && scope === "team") return liveTeamData;
    if (viewMode === "historic" && scope === "organisation") return historicOrgData;
    if (viewMode === "historic" && scope === "team") return historicTeamData; // Team historic data not currently supported
  };

  const getGroupedData = () => {
    if (scope === "team") {
      // Team historic data not currently supported
      if(viewDatesBy === "Day") return historicTeamData.allUsage;
      if(viewDatesBy === "Week") return historicTeamData.weekUsage;
      if(viewDatesBy === "Month") return historicTeamData.monthUsage;
      if(viewDatesBy === "Year") return historicTeamData.yearUsage;
    } else {
      if(viewDatesBy === "Day") return historicOrgData.allUsage;
      if(viewDatesBy === "Week") return historicOrgData.weekUsage;
      if(viewDatesBy === "Month") return historicOrgData.monthUsage;
      if(viewDatesBy === "Year") return historicOrgData.yearUsage;
    }
  }

  const [liveOrgData, setLiveOrgData] = useState({
    allUsage: [],
    filteredUsage: [],
    processedUsage: [],
    allSeatData: [],
    activeSeatData: []
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
    activeSeatData: []
  });

  const dateOptions = [
    { value: "Day", label: "Day" },
    { value: "Week", label: "Week" },
    { value: "Month", label: "Month" },
    { value: "Year", label: "Year" },
  ];
  
  const [sliderValues, setSliderValues] = useState([1, 28]);
  const [inactiveDays, setInactiveDays] = useState(28);
  const inactivityDate = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() - inactiveDays);
    return date.toISOString().slice(0, 10);
  }, [inactiveDays]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [viewMode, setViewMode] = useState("live");
  const [scope, setScope] = useState("organisation");
  const data = getDashboardData();
  const [isLiveLoading, setIsLiveLoading] = useState(true);
  const [isSeatsLoading, setIsSeatsLoading] = useState(true);
  const [isHistoricLoading, setIsHistoricLoading] = useState(false);
  const [hasFetchedHistoric, setHasFetchedHistoric] = useState(false);
  const { getLiveUsageData, getHistoricUsageData, getSeatsData } = useData();
  const [sliderFinished, setSliderFinished] = useState(true);
  const [viewDatesBy, setViewDatesBy] = useState("Day");
  const [isSelectingTeam, setIsSelectingTeam] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [availableTeams, setAvailableTeams] = useState([]);

  /**
   * Trigger data filter upon slider completion
   *
   */
  const handleSliderCompletion = () => {
    setSliderFinished(true)
  };

  /**
   * Provide visual feedback on slider positions and dates
   *
   */
  const updateSlider = (values) => {
    setSliderValues(values);

    const newStart = new Date();
    newStart.setDate(newStart.getDate() - 29 + values[0]);
    const newEnd = new Date();
    newEnd.setDate(newEnd.getDate() - 28 + values[1]);

    setStartDate(newStart.toISOString().slice(0, 10));
    setEndDate(newEnd.toISOString().slice(0, 10));
  };
  
  /**
   * Set states from API data
   */
  useEffect(() => {
    //Handle GitHub login redirect
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("fromTab");
    if (tab === "team") {
      setScope("team");
    }
    const fetchLiveAndSeatsData = async () => {
      setIsLiveLoading(true);
      setIsSeatsLoading(true);

      const [liveUsage, seats] = await Promise.all([
        getLiveUsageData(),
        getSeatsData(),
      ]);

      let end = new Date();
      let start = new Date(end);
      start.setDate(end.getDate() - 28);
      end = end.toISOString().slice(0, 10);
      start = start.toISOString().slice(0, 10);

      setStartDate(start);
      setEndDate(end);

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
    const code = new URLSearchParams(window.location.search).get("code");
  
    const authenticate = async () => {
      const existingToken = localStorage.getItem("userToken");
  
      // Exchange code for token
      if (code && !existingToken) {
        try {
          const token = await exchangeCodeForToken(code);
          if (!token) {
            console.error("Failed to exchange code for token");
            return;
          }
  
          localStorage.setItem("userToken", token);
  
          // Remove code from URL after use
          const url = new URL(window.location);
          url.searchParams.delete("code");
          window.history.replaceState({}, "", url);
        } catch (err) {
          console.error("OAuth token exchange failed", err);
          return;
        }
      }
  
      // Validate token with GitHub
      const token = localStorage.getItem("userToken");
      if (token) {
        try {
          const res = await fetch("https://api.github.com/user", {
            headers: { Authorization: `Bearer ${token}` },
          });
  
          if (res.status === 200) {
            setIsAuthenticated(true);
            const teams = await fetchUserTeams(token);
            if (teams && teams.length > 0) {
              setAvailableTeams(teams);
            }
          } else if (res.status === 401) {
            console.warn("GitHub token invalid. Clearing.");
            localStorage.removeItem("userToken");
            setIsAuthenticated(false);
          } else {
            console.error("Unexpected token validation response", res.status);
          }
        } catch (err) {
          console.error("Failed to validate GitHub token", err);
        }
      }
    };
  
    authenticate();
  }, []);

  /**
   * Fetch historic data if view mode is set to historic and has not been fetched yet
   */
  useEffect(() => {
    const fetchHistoricData = async () => {
      if (!hasFetchedHistoric && viewMode === "historic") {
        setIsHistoricLoading(true);
        const historicUsage = await getHistoricUsageData();
        setHistoricOrgData({
          allUsage: historicUsage ? processUsageData(historicUsage) : [],
          weekUsage: historicUsage ? processUsageData(historicUsage, 'week') : [],
          monthUsage: historicUsage ? processUsageData(historicUsage, 'month') : [],
          yearUsage: historicUsage ? processUsageData(historicUsage, 'year') : [],
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
    if (scope === "organisation") {
      if (!liveOrgData.allUsage?.length || !startDate || !endDate || !sliderFinished) return;
      const filtered = filterUsageData(liveOrgData.allUsage, startDate, endDate);
      setLiveOrgData(prev => ({
        ...prev,
        filteredUsage: filtered,
        processedUsage: processUsageData(filtered),
      }));
    } else if (scope === "team") {
      if (!liveTeamData.allUsage?.length || !startDate || !endDate || !sliderFinished) return;
      const filtered = filterUsageData(liveTeamData.allUsage, startDate, endDate);
      setLiveTeamData(prev => ({
        ...prev,
        filteredUsage: filtered,
        processedUsage: processUsageData(filtered),
      }));
    }
    setSliderFinished(false);
  }, [scope, liveOrgData.allUsage, liveTeamData.allUsage, startDate, endDate, sliderFinished]);

  /**
   * Update active seats
   */
  useEffect(() => {
    if (scope === "organisation") {
      if (!liveOrgData.allSeatData?.length || !inactivityDate) return;
      const active = filterInactiveUsers(liveOrgData.allSeatData, inactivityDate);
      setLiveOrgData(prev => ({
        ...prev,
        activeSeatData: active,
      }));
    } else if (scope === "team") {
      if (!liveTeamData.allSeatData?.length || !inactivityDate) return;
      const active = filterInactiveUsers(liveTeamData.allSeatData, inactivityDate);
      setLiveTeamData(prev => ({
        ...prev,
        activeSeatData: active,
      }));
    }
  }, [scope, inactiveDays, inactivityDate, liveOrgData.allSeatData, liveTeamData.allSeatData]);

  /**
   * Display team selection UI to choose a team to fetch data for
   */
  useEffect(() => {
    if (scope === "organisation") {
      setIsSelectingTeam(false);
    } else if (scope === "team") {
      setIsSelectingTeam(true);
    }
  }, [scope]);

  return (
    <>
      <Header hideSearch={true}/>
      <div className="admin-page">
        <PageBanner
          title="Copilot Usage Dashboard"
          description="Analyse Copilot usage statistics organisation-wide and by team"
          tabs={[
            { id: "organisation", label: "Organisation Usage" },
            { id: "team", label: "Team Usage" }
          ]}
          activeTab={scope}
          onTabChange={() => {
            setViewMode("live"); // Team historic data not currently supported
            setScope(scope => scope === "organisation" ? "team" : "organisation")
          }}
        />
        <div className="admin-container" tabIndex="0">
          { !isSelectingTeam && (
          <div className="dashboard-header">
            { scope === "organisation" ? ( // Team historic data not currently supported
            <div>
              <p className="header-text">View Data Type</p>
              <div className="banner-type-selector">
                <div
                  className={`banner-type-option ${viewMode === "live" ? "selected" : ""}`}
                  onClick={() => setViewMode("live")}
                >
                  Live
                </div>
                <div
                  className={`banner-type-option ${viewMode === "historic" ? "selected" : ""}`}
                  onClick={() => setViewMode("historic")}
                >
                  Historic
                </div>
              </div>
            </div>
            ) : (
            <div>
              <p className="header-text">Return to Team Selection</p>
            </div>
            )}
            {viewMode === "live" ? (
              <div id="slider">
                <p className="header-text">Filter Live Data Range</p>
                {isLiveLoading ? (
                  <p>Loading dates...</p>
                ) : (
                  <div>
                    <p>Start: {startDate}</p>
                    <Slider
                      range
                      min={1}
                      max={28}
                      value={sliderValues}
                      onChange={updateSlider}
                      onChangeComplete={handleSliderCompletion}
                      allowCross={false}
                      ariaLabelForHandle={['Start date selector', 'End date selector']}
                      ariaValueTextFormatterForHandle={(value, index) => {
                        const date = new Date();
                        date.setDate(date.getDate() - 29 + value);
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
                    onChange={(e) => setViewDatesBy(e.target.value)}
                    disabled={isHistoricLoading}
                    aria-label="View Dates By"
                  >
                    {dateOptions.map((option) => (
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
          <div>
          </div>
          {scope === "team" && isSelectingTeam ? (
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
                      columns={["name", "description", "url", "viewData"]}
                      idField="slug"
                      idHeader="Team Slug"
                      headerMap={{
                        name: "Name",
                        description: "Description",
                        url: "URL",
                        viewData: "View Data",
                      }}
                      tableContext="Copilot Team Selection"
                      onViewDataClick={(slug) => {
                        async function fetchTeamData() {
                          const liveUsage = await fetchTeamLiveUsageData(slug);
                          const teamSeats = await fetchTeamSeatData(localStorage.getItem("userToken"), slug);
                          const activeTeamSeats = filterInactiveUsers(teamSeats, startDate);

                          setLiveTeamData({
                            allUsage: liveUsage ?? [],
                            filteredUsage: liveUsage ?? [],
                            processedUsage: liveUsage ? processUsageData(liveUsage) : [],
                            allSeatData: teamSeats,
                            activeSeatData: activeTeamSeats,
                          });
                        }

                        fetchTeamData();
                        setIsSelectingTeam(false);
                      }
                      }
                      />
                    </div>
                  ) : (
                    <p>No teams available. Please ensure you are a member of at least one team in the organisation.</p>
                  )}
                </div>
              ) : (
                <div>
                  <a href={loginUrl} target="_self"><button>Login with GitHub</button></a>
                </div>
              )}
            </>
          ) : (
            viewMode === "live" ? (
              <LiveDashboard 
                scope={scope} 
                data={data} 
                isLiveLoading={isLiveLoading}
                isSeatsLoading={isSeatsLoading} 
                inactiveDays={inactiveDays}
                setInactiveDays={setInactiveDays} 
                inactivityDate={inactivityDate}/>
            ) : (
              <HistoricDashboard 
                scope={scope} 
                data={getGroupedData()} 
                isLoading={isHistoricLoading}
                viewDatesBy={viewDatesBy}
              />
            )
          )}
        </div>
      </div>
    </>
  );
}

export default CopilotDashboard;