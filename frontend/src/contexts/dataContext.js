import React, { createContext, useContext, useState, useRef } from "react";
import { fetchCSVFromS3 } from "../utilities/getCSVData";
import { fetchTechRadarJSONFromS3 } from "../utilities/getTechRadarJson";
import { fetchRepositoryData, fetchRepositoryStats } from "../utilities/getRepositoryData";
import { fetchBanners } from "../utilities/getBanner";
import { fetchOrgLiveUsageData, fetchOrgHistoricUsageData } from "../utilities/getUsageData";
import { fetchSeatData } from "../utilities/getSeatData";
import { fetchUserInfo } from "../utilities/getUser";
/**
 * DataContext provides centralized data management and caching for the application.
 * It handles fetching and caching of CSV data, Tech Radar data, repository data,
 * and repository statistics.
 */
const DataContext = createContext();

/**
 * DataProvider component that wraps the application and provides data management functionality.
 * 
 * @param {Object} props - The component props
 * @param {React.ReactNode} props.children - The child components to be wrapped
 * @returns {JSX.Element} The provider component
 */
export function DataProvider({ children }) {
  const [csvData, setCsvData] = useState(null);
  const [techRadarData, setTechRadarData] = useState(null);
  const [repositoryData, setRepositoryData] = useState(new Map());
  const [repositoryStats, setRepositoryStats] = useState(new Map());
  const [pageBanners, setPageBanners] = useState(new Map());
  const [liveUsageData, setLiveUsageData] = useState(null);
  const [historicUsageData, setHistoricUsageData] = useState(null);
  const [seatsData, setSeatsData] = useState(null);
  const [userData, setUserData] = useState(null);
  
  const pendingRequests = useRef({
    csv: null,
    techRadar: null,
    repository: new Map(),
    repositoryStats: new Map(),
    banners: new Map(),
    liveUsageData: null,
    historicUsageData: null,
    seatsData: null,
    userData: null
  });

  /**
   * Fetches and caches CSV data from S3.
   * 
   * @param {boolean} [forceRefresh=false] - Whether to force a refresh of the cached data
   * @returns {Promise<Object>} The CSV data
   */
  const getCsvData = async (forceRefresh = false) => {
    
    if (!forceRefresh && csvData) {
      return csvData;
    }

    if (pendingRequests.current.csv) {
      return pendingRequests.current.csv;
    }
    
    const promise = fetchCSVFromS3().then(data => {
      setCsvData(data);
      pendingRequests.current.csv = null;
      return data;
    });

    pendingRequests.current.csv = promise;
    return promise;
  };

  /**
   * Fetches and caches Tech Radar data from S3.
   * 
   * @param {boolean} [forceRefresh=false] - Whether to force a refresh of the cached data
   * @returns {Promise<Object>} The Tech Radar data
   */
  const getTechRadarData = async (forceRefresh = false) => {
    if (!forceRefresh && techRadarData) {
      return techRadarData;
    }

    // If there's already a pending request, return it
    if (pendingRequests.current.techRadar) {
      return pendingRequests.current.techRadar;
    }
    
    // Create new request
    const promise = fetchTechRadarJSONFromS3().then(data => {
      setTechRadarData(data);
      pendingRequests.current.techRadar = null;
      return data;
    });

    pendingRequests.current.techRadar = promise;
    return promise;
  };

  /**
   * Fetches and caches repository data for specific repositories.
   * 
   * @param {string[]} repositories - Array of repository names
   * @param {string} [date=null] - Optional date filter
   * @param {string} [archived=null] - Optional archived status filter
   * @param {boolean} [forceRefresh=false] - Whether to force a refresh of the cached data
   * @returns {Promise<Object>} The repository data
   */
  const getRepositoryData = async (repositories, date = null, archived = null, forceRefresh = false) => {
    const cacheKey = JSON.stringify({ repositories, date, archived });
    
    if (!forceRefresh && repositoryData.has(cacheKey)) {
      return repositoryData.get(cacheKey);
    }

    // If there's already a pending request for this exact query, return it
    if (pendingRequests.current.repository.has(cacheKey)) {
      return pendingRequests.current.repository.get(cacheKey);
    }
    
    // Create new request
    const promise = fetchRepositoryData(repositories, date, archived).then(data => {
      setRepositoryData(prev => new Map(prev).set(cacheKey, data));
      pendingRequests.current.repository.delete(cacheKey);
      return data;
    });

    pendingRequests.current.repository.set(cacheKey, promise);
    return promise;
  };

  /**
   * Fetches and caches repository statistics.
   * 
   * @param {string} [date=null] - Optional date filter
   * @param {string} [archived=null] - Optional archived status filter
   * @param {boolean} [forceRefresh=false] - Whether to force a refresh of the cached data
   * @returns {Promise<Object>} The repository statistics
   */
  const getRepositoryStats = async (date = null, archived = null, forceRefresh = false) => {
    const cacheKey = JSON.stringify({ date, archived });

    if (!forceRefresh && repositoryStats.has(cacheKey)) {
      return repositoryStats.get(cacheKey);
    }

    if (pendingRequests.current.repositoryStats.has(cacheKey)) {
      return pendingRequests.current.repositoryStats.get(cacheKey);
    }

    const promise = fetchRepositoryStats(date, archived).then(data => {
      setRepositoryStats(prev => new Map(prev).set(cacheKey, data));
      pendingRequests.current.repositoryStats.delete(cacheKey);
      return data;
    });

    pendingRequests.current.repositoryStats.set(cacheKey, promise);
    return promise;
  };

  /**
   * Fetches and caches banners for a specific page.
   * 
   * @param {string} page - The page to get banners for ('radar', 'statistics', or 'projects')
   * @param {boolean} [forceRefresh=false] - Whether to force a refresh of the cached data
   * @returns {Promise<Array>} Array of banner objects for the specified page
   */
  const getPageBanners = async (page, forceRefresh = false) => {
    if (!page) {
      console.error("Page parameter is required for getPageBanners");
      return [];
    }

    // Check cache first
    if (!forceRefresh && pageBanners.has(page)) {
      return pageBanners.get(page);
    }

    // If there's already a pending request for this page, return it
    if (pendingRequests.current.banners.has(page)) {
      return pendingRequests.current.banners.get(page);
    }
    
    // Create new request
    const promise = fetchBanners(page).then(data => {
      setPageBanners(prev => new Map(prev).set(page, data));
      pendingRequests.current.banners.delete(page);
      return data;
    });

    pendingRequests.current.banners.set(page, promise);
    return promise;
  };

  /**
   * Fetches and caches live usage data for the organisation.
   *
   *
   * @param {boolean} [forceRefresh=false] - Whether to force a refresh of the cached data
   * @returns {Promise<Object>} The live usage data
   */
  const getLiveUsageData = async (forceRefresh = false) => {
    if (!forceRefresh && liveUsageData) {
      return liveUsageData;
    }

    if (pendingRequests.current.usageData) {
      return pendingRequests.current.usageData;
    }

    const promise = fetchOrgLiveUsageData().then(data => {
      setLiveUsageData(data);
      pendingRequests.current.usageData = null;
      return data;
    });

    pendingRequests.current.usageData = promise;
    return promise;
  }

  /**
   * Fetches and caches historic usage data for the organisation.
   *
   * @param {boolean} [forceRefresh=false] - Whether to force a refresh of the cached data
   * @returns {Promise<Object>} The historic usage data
   */
  const getHistoricUsageData = async (forceRefresh = false) => {
    if (!forceRefresh && historicUsageData) {
      return historicUsageData;
    }

    if (pendingRequests.current.historicUsageData) {
      return pendingRequests.current.historicUsageData;
    }

    const promise = fetchOrgHistoricUsageData().then(data => {
      setHistoricUsageData(data);
      pendingRequests.current.historicUsageData = null;
      return data;
    });

    pendingRequests.current.historicUsageData = promise;
    return promise;
  }

  /**
   * Fetches and caches seat data for the organisation.
   *
   * @param {boolean} [forceRefresh=false] - Whether to force a refresh of the cached data
   * @returns {Promise<Object>} The seat data
   */
  const getSeatsData = async (forceRefresh = false) => {
    if (!forceRefresh && seatsData) {
      return seatsData;
    }

    if (pendingRequests.current.seatsData) {
      return pendingRequests.current.seatsData;
    }

    const promise = fetchSeatData().then(data => {
      setSeatsData(data);
      pendingRequests.current.seatsData = null;
      return data;
    });

    pendingRequests.current.seatsData = promise;
    return promise;
  }

  /**
   * Fetches and caches user information.
   *
   * @param {boolean} [forceRefresh=false] - Whether to force a refresh of the cached data
   * @returns {Promise<Object>} The user data
   */
  const getUserData = async (forceRefresh = false) => {
    if (!forceRefresh && userData) {
      return userData;
    }

    if (pendingRequests.current.userData) {
      return pendingRequests.current.userData;
    }

    const promise = fetchUserInfo().then(data => {
      setUserData(data);
      pendingRequests.current.userData = null;
      return data;
    });

    pendingRequests.current.userData = promise;
    return promise;
  }

  const clearCache = () => {
    setCsvData(null);
    setTechRadarData(null);
    setRepositoryData(new Map());
    setRepositoryStats(new Map());
    setPageBanners(new Map());
    setLiveUsageData(null);
    setHistoricUsageData(null);
    setSeatsData(null);
    setUserData(null);
    pendingRequests.current = {
      csv: null,
      techRadar: null,
      repository: new Map(),
      repositoryStats: new Map(),
      banners: new Map(),
      liveUsageData: null,
      historicUsageData: null,
      seatsData: null,
      userData: null
    };
  };

  return (
    <DataContext.Provider 
      value={{
        csvData,
        techRadarData,
        userData,
        getCsvData,
        getTechRadarData,
        getRepositoryData,
        getRepositoryStats,
        getPageBanners,
        clearCache,
        getLiveUsageData,
        getHistoricUsageData,
        getSeatsData,
        getUserData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

/**
 * Hook to access the DataContext.
 * Must be used within a DataProvider component.
 * 
 * @returns {Object} The context value containing all data management methods
 * @throws {Error} If used outside of a DataProvider
 */
export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
}
