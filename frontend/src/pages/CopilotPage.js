import React, { useEffect, useState, useMemo } from "react";
import Header from "../components/Header/Header";
import LiveDashboard from "../components/CoPilot/Dashboards/LiveDashboard";
import HistoricDashboard from "../components/CoPilot/Dashboards/HistoricDashboard";
import { filterInactiveUsers } from "../utilities/getSeatData";
import { filterUsageData, processUsageData } from "../utilities/getUsageData";
import PageBanner from "../components/PageBanner/PageBanner";
import "../styles/CoPilotPage.css";
import Slider from 'rc-slider';
import "rc-slider/assets/index.css";
import { useData } from "../contexts/dataContext";
import { fetchUserTeams } from "../utilities/getTeams"; //TODO: cache

const loginUrl = `https://github.com/login/oauth/authorize?` + 
  new URLSearchParams({
    client_id: process.env.REACT_APP_GITHUB_CLIENT_ID,
    redirect_uri: `${process.env.REACT_APP_URL}/copilot?fromTab=team`,
    scope: "user:email read:org",
  }).toString();

function CopilotDashboard() {

  const getDashboardData = () => {
    if (viewMode === "live" && scope === "organisation") return liveOrgData;
    if (viewMode === "live" && scope === "team") return liveOrgData; //TODO: Temporary
    if (viewMode === "historic" && scope === "organisation") return historicOrgData;
    if (viewMode === "historic" && scope === "team") return historicOrgData; //TODO: Temporary
  };

  const getGroupedData = () => {
    if (scope === "team") {
      if(viewDatesBy === "Day") return historicOrgData.allUsage; //TODO: Temporary
      if(viewDatesBy === "Week") return historicOrgData.weekUsage; //TODO: Temporary
      if(viewDatesBy === "Month") return historicOrgData.monthUsage; //TODO: Temporary
      if(viewDatesBy === "Year") return historicOrgData.yearUsage; //TODO: Temporary
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
  const [isAuthenticated, setIsAuthenticated] = useState(false); //TODO: useData context

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
    if (!liveOrgData.allUsage?.length || !startDate || !endDate || !sliderFinished) return;
    const filtered = filterUsageData(liveOrgData.allUsage, startDate, endDate);
    setLiveOrgData(prev => ({
      ...prev,
      filteredUsage: filtered,
      processedUsage: processUsageData(filtered),
    }));
    setSliderFinished(false);
  }, [liveOrgData.allUsage, startDate, endDate, sliderFinished]);

  /**
   * Update active seats
   */
  useEffect(() => {
    if (!liveOrgData.allSeatData?.length || !inactivityDate) return;
    const active = filterInactiveUsers(liveOrgData.allSeatData, inactivityDate);
    setLiveOrgData(prev => ({
      ...prev,
      activeSeatData: active,
    }));
  }, [inactiveDays, inactivityDate, liveOrgData.allSeatData]);

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
          title="CoPilot Usage Dashboard"
          description="Analyse CoPilot usage statistics organisation-wide and by team"
          tabs={[
            { id: "organisation", label: "Organisation Usage" },
            { id: "team", label: "Team Usage" }
          ]}
          activeTab={scope}
          onTabChange={() => setScope(scope => scope === "organisation" ? "team" : "organisation")}
        />
        <div className="admin-container" tabIndex="0">
          { !isSelectingTeam && (
          <div className="dashboard-header">
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
                  <p>TODO: Display team selection UI</p>
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