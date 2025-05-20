import React, { useEffect, useState, useMemo } from "react";
import { ThemeProvider } from "../contexts/ThemeContext";
import Header from "../components/Header/Header";
import LiveDashboard from "../components/CoPilot/LiveDashboard";
import HistoricDashboard from "../components/CoPilot/HistoricDashboard";
import { filterInactiveUsers } from "../utilities/getSeatData";
import { filterUsageData, processUsageData } from "../utilities/getUsageData";
import PageBanner from "../components/PageBanner/PageBanner";
import "../styles/CoPilotPage.css";
import Slider from 'rc-slider';
import "rc-slider/assets/index.css";
import { useData } from "../contexts/dataContext";

function CopilotDashboard() {

  const getDashboardData = () => {
    if (viewMode === "live" && scope === "organisation") return liveOrgData;
    if (viewMode === "live" && scope === "team") return null;
    if (viewMode === "historic" && scope === "organisation") return historicOrgData;
    if (viewMode === "historic" && scope === "team") return null;
  };

  const [liveOrgData, setLiveOrgData] = useState({
    allUsage: [],
    filteredUsage: [],
    processedUsage: [],
    allSeatData: [],
    activeSeatData: []
  });

  const [historicOrgData, setHistoricOrgData] = useState({
    allUsage: [],
    groupedUsage: [],
    processedUsage: [],
  });
  
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
  const [isLoading, setIsLoading] = useState(true);
  const { getLiveUsageData, getHistoricUsageData, getSeatsData } = useData();

  const handleSliderChange = (values) => {
    setSliderValues(values);

    const newStart = new Date();
    newStart.setDate(newStart.getDate() - values[1]);
    const newEnd = new Date();
    newEnd.setDate(newEnd.getDate() - values[0]);

    setStartDate(newStart.toISOString().slice(0, 10));
    setEndDate(newEnd.toISOString().slice(0, 10));
  };
  
  /**
   * Set states from API data
   */
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);

      const [liveUsage, historicUsage, seats] = await Promise.all([
        getLiveUsageData(),
        getHistoricUsageData(),
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
      setHistoricOrgData({
        allUsage: historicUsage ?? [],
        groupedUsage: historicUsage ?? [],
        processedUsage: historicUsage ? processUsageData(historicUsage) : [],
      });
      setIsLoading(false);
    };
    fetchData();
  }, []);

  /**
   * Filter and then process live usage data based on start and end date
   */
  useEffect(() => {
    if (!liveOrgData.allUsage?.length || !startDate || !endDate) return;
    const filtered = filterUsageData(liveOrgData.allUsage, startDate, endDate);
    setLiveOrgData(prev => ({
      ...prev,
      filteredUsage: filtered,
      processedUsage: processUsageData(filtered),
    }));
  }, [liveOrgData.allUsage, startDate, endDate]);

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

  return (
    <ThemeProvider>
      <Header hideSearch={true}/>
      <div className="admin-page">
        <PageBanner
          title="CoPilot Usage Dashboard"
          description="Analyse CoPilot usage statistics organisation-wide and by team"
          tabs={[
            { id: "organisation", label: "Organisation Usage" },
            // { id: "team", label: "Team Usage" } // Temporarily removed until team usage is implemented
          ]}
          activeTab={scope}
          onTabChange={setScope}
        />
        <div className="admin-container">
          <div className="dashboard-header">
          <div>
            <p className="header-text">View Data Type</p>
            <div className="banner-type-selector">
                <div
                  className={`banner-type-option ${viewMode === "live" ? "selected" : ""}`}
                  onClick={() => setViewMode("live")}
                >
                  <span className="banner-type-indicator info"></span>
                  Live
                </div>
                <div
                  className={`banner-type-option ${viewMode === "historic" ? "selected" : ""}`}
                  onClick={() => setViewMode("historic")}
                >
                  <span className="banner-type-indicator warning"></span>
                  Historic
                </div>
              </div>
            </div>
            <div id="slider">
              <p className="header-text">Filter Live Data Range</p>
              {isLoading ? (
                <p>Loading dates...</p>
              ) :  (
              <div>
                <p>Start: {startDate}</p>
                <Slider
                range
                min={1}
                max={28}
                value={sliderValues}
                onChange={handleSliderChange}
                allowCross={false}
                />
                <p>End: {endDate}</p>
              </div>
              )}
            </div>
          </div>
          <div>

          </div>
          {viewMode === "live" ? (
              <LiveDashboard 
              scope={scope} 
              data={data} 
              isLoading={isLoading} 
              inactiveDays={inactiveDays}
              setInactiveDays={setInactiveDays} 
              inactivityDate={inactivityDate}/>
            ) : (
              <HistoricDashboard 
              scope={scope} 
              data={data} 
              isLoading={isLoading}/>
            )}
        </div>
      </div>
    </ThemeProvider>
  );
}

export default CopilotDashboard;