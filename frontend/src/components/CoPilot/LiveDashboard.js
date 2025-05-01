import React from "react";
import "../../styles/components/Statistics.css";
import SkeletonStatCard from "../Statistics/Skeletons/SkeletonStatCard";
import "../../styles/CoPilotPage.css";

function LiveDashboard({scope, data, isLoading}) {

  let completions;
  if(!isLoading) {
    completions = data.processedUsage.completions;
  }

  return (
    <div>
        <h2>IDE Code Completions</h2>
          {isLoading ? (
            <div className="copilot-grid">
              <SkeletonStatCard />
              <SkeletonStatCard />
              <SkeletonStatCard />
              <SkeletonStatCard />
              <SkeletonStatCard />
              <SkeletonStatCard />
            </div>
          ) : (
            <div>
              <div className="copilot-grid">
                <div className="stat-card">
                  <h3>Total Suggestions</h3>
                  <p>{completions.totalSuggestions}</p>
                </div>
                <div className="stat-card">
                  <h3>Total Acceptances</h3>
                  <p>{completions.totalAcceptances}</p>
                </div>
                <div className="stat-card">
                  <h3>Acceptance Rate</h3>
                  <p>{completions.acceptanceRate}</p>
                </div>
                <div className="stat-card">
                  <h3>Total Lines of Code Suggested</h3>
                  <p>{completions.totalLinesSuggested}</p>
                </div>
                <div className="stat-card">
                  <h3>Total Lines of Code Accepted</h3>
                  <p>{completions.totalLinesAccepted}</p>
                </div>
                <div className="stat-card">
                  <h3>Line Acceptance Rate</h3>
                  <p>{completions.lineAcceptanceRate}</p>
                </div>
              </div>
            </div>
          )}
          <h4>Acceptances and Acceptance Rate</h4>
    </div>
  );
}

export default LiveDashboard;