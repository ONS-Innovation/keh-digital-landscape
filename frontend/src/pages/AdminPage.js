import React, { useState } from "react";
import { ThemeProvider } from "../contexts/ThemeContext";
import Header from "../components/Header/Header";
import BannerManage from "../components/Admin/BannerManage";
import TechManage from "../components/Admin/TechManage";
import "../styles/ReviewPage.css";
import "../styles/AdminPage.css";

/**
 * Admin page for managing system-wide settings like banners
 */
const AdminPage = () => {
  const [activeTab, setActiveTab] = useState("banner");

  const tabs = [
    { id: "banner", label: "Banner Management" },
    { id: "tech", label: "Technology Management" }
  ];

  return (
    <ThemeProvider>
      <Header hideSearch={true} />
      <div className="admin-page">
        <div className="admin-details">
          <div className="admin-header-left">
            <div className="admin-review-title">
              <h1>Admin Dashboard</h1>
              <span>Manage system-wide settings and configurations</span>
            </div>
          </div>
          <div className="admin-tabs">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              className={`admin-tab ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
                    </div>
                  ))}
          </div>
        </div>

        <div className={`admin-content ${activeTab === "banner" ? "active" : ""}`}>
          <BannerManage />
            </div>
        <div className={`admin-content ${activeTab === "tech" ? "active" : ""}`}>
          <TechManage />
        </div>
      </div>
    </ThemeProvider>
  );
};

export default AdminPage;
