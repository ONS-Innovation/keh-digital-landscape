import React from "react";
import "../styles/components/PageBanner.css";

function PageBanner({ title, description, tabs, activeTab, onTabChange }) {
    return (
        <div className="admin-details">
          <div className="admin-header-left">
            <div className="admin-review-title">
              <h1>{title}</h1>
              <span>{description}</span>
            </div>
          </div>
          <div className="admin-tabs">
            {tabs.map((tab) => (
              <div
                key={tab.id}
                className={`admin-tab ${activeTab === tab.id ? "active" : ""}`}
                onClick={() => onTabChange(tab.id)}
              >
                {tab.label}
              </div>
            ))}
          </div>
        </div>
    );
  }

export default PageBanner;