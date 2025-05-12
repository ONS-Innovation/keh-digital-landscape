import React, { useEffect, useState, useMemo } from "react";
import { ThemeProvider } from "../contexts/ThemeContext";
import Header from "../components/Header/Header";
import LiveDashboard from "../components/CoPilot/LiveDashboard";
import HistoricDashboard from "../components/CoPilot/HistoricDashboard";
import { fetchSeatData, filterInactiveUsers } from "../utilities/getSeatData";
import { fetchOrgLiveUsageData, filterUsageData, processUsageData } from "../utilities/getUsageData";
import PageBanner from "../components/PageBanner";
import "../styles/CoPilotPage.css";

function CopilotDashboard() {

  const getDashboardData = () => {
    if (viewMode === "live" && scope === "organisation") return liveOrgData;
    if (viewMode === "live" && scope === "team") return liveOrgData; //Will be changed upon team usage PR
    if (viewMode === "historic" && scope === "organisation") return null;
    if (viewMode === "historic" && scope === "team") return null;
  };

  const [liveOrgData, setLiveOrgData] = useState({
    allUsage: [],
    filteredUsage: [],
    processedUsage: [],
    allSeatData: [],
    activeSeatData: []
  });
  
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
  
  /**
   * Set states from API data
   */
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const liveUsage = await fetchOrgLiveUsageData();
      const seats = await fetchSeatData();

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

  //TODO: Add to contexts

  return (
    <ThemeProvider>
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
          onTabChange={setScope}
        />
        <div className="admin-container">
          <div className="dashboard-header">
          {/* Will be introduced in next page PR */}
          {/* <p>View Data Type</p>  */}
          <p>Filter Live Data Range</p>
          <p>TODO</p>
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