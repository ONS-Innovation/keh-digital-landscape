import React, { useEffect, useState } from "react";
import { ThemeProvider } from "../contexts/ThemeContext";
import Header from "../components/Header/Header";
import { fetchSeatData } from "../utilities/getSeatData";
import { fetchLiveUsageData, filterUsageData, processUsageData } from "../utilities/getUsageData";

function CopilotDashboard() {

  const [allLiveUsageData, setAllLiveUsageData] = useState([]);
  const [filteredLiveUsageData, setFilteredLiveUsageData] = useState([]);
  const [processedLiveUsageData,  setProcessedLiveUsageData] = useState([]);
  const [allSeatData, setAllSeatData] = useState([]);
  const [filteredSeatData, setFilteredSeatData] = useState([]);
  const [inactiveDays, setInactiveDays] = useState(28);
  const [inactivityDate, setInactivityDate] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  
  /**
   * Set states from API data
   */
  useEffect(() => {
    const fetchData = async () => {
      const liveUsage = await fetchLiveUsageData();
      const seats = await fetchSeatData();
  
      setAllLiveUsageData(liveUsage);
      setAllSeatData(seats);
  
      setFilteredLiveUsageData(liveUsage);
      setFilteredSeatData(seats);

      setProcessedLiveUsageData(processUsageData(liveUsage));

      const current = liveUsage.length - 1
      setStartDate(liveUsage[0].date);
      setEndDate(liveUsage[current].date);

      const end = new Date(liveUsage[current].date);
      const inactivity = new Date(end);
      inactivity.setDate(end.getDate() - 28);
      setInactivityDate(inactivity.toISOString().slice(0, 10));
    };

    fetchData();
  }, []);

  /**
   * Filter and then process live usage data based on start and end date
   */
  useEffect(() => {
    if (!allLiveUsageData.length || !startDate || !endDate) return;
    const filtered = filterUsageData(allLiveUsageData, startDate, endDate);
    setFilteredLiveUsageData(filtered);
    setProcessedLiveUsageData(processUsageData(filtered));
  }, [allLiveUsageData, startDate, endDate]);

  /**
   * Update inactivity date and engaged users for seats
   */
  useEffect(() => {
    //TODO
  }, [inactiveDays]);

  //TODO: Grouped data

  return (
    <ThemeProvider>
      <Header hideSearch={true}/>
    </ThemeProvider>
  );
}

export default CopilotDashboard;