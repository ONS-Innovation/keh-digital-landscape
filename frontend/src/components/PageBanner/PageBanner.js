import React from "react";
import "../../styles/components/PageBanner.css";

function PageBanner({ title, description, tabs, activeTab, onTabChange }) {
    return (
        <div className="banner-details">
          <div className="banner-header-left">
            <div className="banner-review-title">
              <h1>{title}</h1>
              <span>{description}</span>
            </div>
          </div>
          <div className="banner-tabs">
            {tabs.map((tab) => (
              <div
                key={tab.id}
                className={`banner-tab ${activeTab === tab.id ? "active" : ""}`}
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