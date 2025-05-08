import React from "react";
import "../../styles/components/Statistics.css";
import SkeletonStatCard from "../Statistics/Skeletons/SkeletonStatCard";
import "../../styles/CoPilotPage.css";
import { getPercentage } from "../../utilities/getPercentage";
import AcceptanceGraph from "./AcceptanceGraph";
import EngagedUsersGraph from "./EngagedUsersGraph";
import PieChart from "./PieChart";
import TableBreakdown from "./TableBreakdown";

function LiveDashboard({scope, data, isLoading, inactiveDays, inactivityDate}) {

  let completions, chats, seats;
  if(!isLoading) {
    completions = data.processedUsage.completions;
    chats = data.processedUsage.chat;
    seats = data.inactiveSeatData;
  }

  return (
    <div>
        <h2 className="title">IDE Code Completions</h2>
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
                  <p>{getPercentage(completions.acceptanceRate)}</p>
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
                  <p>{getPercentage(completions.lineAcceptanceRate)}</p>
                </div>
              </div>
            </div>
          )}
          <h4>Acceptances and Acceptance Rate By Day</h4>
          {isLoading ? (
            <div>Loading graph...</div>
          ) : (
            <AcceptanceGraph data={completions.perDay}/>
          )}
          <h4>Engaged Users By Day</h4>
          {isLoading ? (
            <div>Loading graph...</div>
          ) : (
            <EngagedUsersGraph data={completions.perDay}/>
          )}
          {isLoading ? (
            <div className="pie-chart-loading">Loading pie charts...</div>
          ) : (
            <div className="copilot-charts-container">
              <PieChart engagedUsers={completions.engagedUsersByLanguage} title={"Engaged Users by Language"}/>
              <PieChart engagedUsers={completions.engagedUsersByEditor} title={"Engaged Users by Editor"}/>
            </div>
          )}
          <h4>Language Breakdown</h4>
          {isLoading ? (
            <div>Loading table...</div>
          ) : (
            <TableBreakdown data={completions.languageBreakdown}/>
          )}
        
        <h2 className="title">CoPilot Chat</h2>
        {isLoading ? (
            <div className="copilot-chat-grid">
              <SkeletonStatCard />
              <SkeletonStatCard />
              <SkeletonStatCard />
              <SkeletonStatCard />
              <SkeletonStatCard />
            </div>
          ) : (
            <div>
              <div className="copilot-chat-grid">
                <div className="stat-card">
                  <h3>Total Chats</h3>
                  <p>{chats.totalChats}</p>
                </div>
                <div className="stat-card">
                  <h3>Total Insertions</h3>
                  <p>{chats.totalInsertions}</p>
                </div>
                <div className="stat-card">
                  <h3>Insertion Rate</h3>
                  <p>{getPercentage(chats.insertionRate)}</p>
                </div>
                <div className="stat-card">
                  <h3>Total Copies</h3>
                  <p>{chats.totalCopies}</p>
                </div>
                <div className="stat-card">
                  <h3>Copy Rate</h3>
                  <p>{getPercentage(chats.copyRate)}</p>
                </div>
              </div>
            </div>
          )}
          <h4>Engaged Users By Day</h4>
          {isLoading ? (
            <div>Loading graph...</div>
          ) : (
            <EngagedUsersGraph data={chats.perDay}/>
          )}
          {isLoading ? (
            <div className="pie-chart-loading">Loading pie chart...</div>
          ) : (
            <div className="copilot-charts-container">
              <PieChart engagedUsers={chats.engagedUsersByEditor} title={"Engaged Users by Editor"}/>
            </div>
          )}
         <h4>Editor Breakdown</h4>
         {isLoading ? (
            <div>Loading table...</div>
          ) : (
            <TableBreakdown data={chats.editorBreakdown}/>
          )}
        
        <h2 className="title">Seat Information</h2>
        {isLoading ? (
          <div>Loading seat info...</div>
          ) : (
            <div>
              <p>Users are considered inactive after {inactiveDays} days ({inactivityDate})</p>
              <div className="copilot-grid">
                  <div className="stat-card">
                    <h3>Number of Seats</h3>
                    <p>{}</p>
                  </div>
                  <div className="stat-card">
                    <h3>Number of Engaged Users</h3>
                    <p>{}</p>
                  </div>
                  <div className="stat-card">
                    <h3>Number of Inactive Users</h3>
                    <p>{}</p>
                  </div>
                </div>
            </div>
          )}

    </div>
  );
}

export default LiveDashboard;