import React, { useEffect, useState } from "react";
import { ThemeProvider } from "../contexts/ThemeContext";
import Header from "../components/Header/Header";
import LiveDashboard from "../components/CoPilot/LiveDashboard";
import HistoricDashboard from "../components/CoPilot/HistoricDashboard";
import { fetchSeatData } from "../utilities/getSeatData";
import { fetchOrgLiveUsageData, filterUsageData, processUsageData } from "../utilities/getUsageData";
import PageBanner from "../components/PageBanner";

function CopilotDashboard() {

  const getDashboardData = () => {
    if (viewMode === "live" && scope === "organisation") return liveOrgData;
    if (viewMode === "live" && scope === "team") return liveOrgData; //Change upon team data
    if (viewMode === "historic" && scope === "organisation") return null;
    if (viewMode === "historic" && scope === "team") return null;
  };

  const [liveOrgData, setLiveOrgData] = useState({
    allUsage: [],
    filteredUsage: [],
    processedUsage: [],
    allSeatData: [],
    filteredSeatData: []
  });
  
  const [inactiveDays, setInactiveDays] = useState(28);
  const [inactivityDate, setInactivityDate] = useState(null);
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

      setLiveOrgData({
        allUsage: liveUsage ?? [],
        filteredUsage: liveUsage ?? [],
        processedUsage: liveUsage ? processUsageData(liveUsage) : [],
        allSeatData: seats ?? [],
        filteredSeatData: seats ?? [],
      });

      if(liveUsage) {
        const current = liveUsage.length - 1
        setStartDate(liveUsage[0].date);
        setEndDate(liveUsage[current].date);
  
        const end = new Date(liveUsage[current].date);
        const inactivity = new Date(end);
        inactivity.setDate(end.getDate() - 28);
        setInactivityDate(inactivity.toISOString().slice(0, 10));
      } else {
        const current = new Date();
        const inactivity = new Date(current);
        inactivity.setDate(current.getDate() - 28);
        setInactivityDate(inactivity.toISOString().slice(0, 10));
      }
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
   * Update inactivity date and engaged users for seats
   */
  useEffect(() => {
    //TODO
  }, [inactiveDays]);

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
        <div className='admin-container'>
          {/* Will be introduced in next page PR */}
          {/* <p>View Data Type</p>  */}
          <div>

          </div>
          {viewMode === "live" ? (
              <LiveDashboard scope={scope} data={data} isLoading={isLoading}/>
            ) : (
              <HistoricDashboard scope={scope} data={data} isLoading={isLoading}/>
            )}
        </div>
      </div>
    </ThemeProvider>
  );
}

export default CopilotDashboard;