import React from "react";
import "../../../styles/components/Statistics.css";
import SkeletonStatCard from "../../Statistics/Skeletons/SkeletonStatCard";
import "../../../styles/CoPilotPage.css";
import AcceptanceGraph from "../Breakdowns/AcceptanceGraph";
import EngagedUsersGraph from "../Breakdowns/EngagedUsersGraph";
import PieChart from "../Breakdowns/PieChart";
import TableBreakdown from "../Breakdowns/TableBreakdown";
import { getFormattedTime } from "../../../utilities/getFormattedTime";
import { getCellRenderers } from "../../../utilities/getCellRenderers";
import CompletionsCards from "../Breakdowns/CompletionsCards";
import ChatCards from "../Breakdowns/ChatCards";

function LiveDashboard({scope, data, isLiveLoading, isSeatsLoading, inactiveDays, setInactiveDays, inactivityDate}) {

  let completions, chats, seats, inactiveUsers;
  if(!isLiveLoading) {
    completions = data.processedUsage.completions;
    chats = data.processedUsage.chat;
  }

  if(!isSeatsLoading) {
    seats = { allSeatData: data.allSeatData, activeSeatData: data.activeSeatData };

    const activeUsers = new Set(
      seats.activeSeatData.map(user => user.assignee.id)
    );
    
    inactiveUsers = seats.allSeatData.filter(
      user => !activeUsers.has(user.assignee.id)
    );
  }

  const handleInactivityDecrease = () => {
    setInactiveDays((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const handleInactivityIncrease = () => {
    setInactiveDays((prev) => prev + 1);
  };

  const handleKeyDown = (event, action) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      action();
    }
  };

  return (
    <div className="copilot-dashboard">
        <h1 className="title">IDE Code Completions</h1>
          {isLiveLoading ? (
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
              <CompletionsCards completions={completions} prefix={"Total"}/>
            </div>
          )}
          {isLiveLoading ? (
            <h3>Loading live data...</h3>
          ) : (
            <div>
              <h3>Acceptances and Acceptance Rate By Day</h3>
              <AcceptanceGraph data={completions?.perGroupedPeriod ?? 0}/>
              <h3>Engaged Users By Day</h3>
              <EngagedUsersGraph data={completions?.perGroupedPeriod ?? 0}/>
              <div className="copilot-charts-container">
                <PieChart engagedUsers={completions?.engagedUsersByLanguage ?? 0} title={"Engaged Users by Language"}/>
                <PieChart engagedUsers={completions?.engagedUsersByEditor ?? 0} title={"Engaged Users by Editor"}/>
            </div>
            <h3>Language Breakdown</h3>
            <TableBreakdown
              data={completions?.languageBreakdown ?? 0}
              idField="language"
              idHeader="Language"
              tableContext="IDE Code Completions Language Breakdown"
              columns={[
                "suggestions",
                "acceptances",
                "acceptanceRate",
                "linesSuggested",
                "linesAccepted",
                "lineAcceptanceRate"
              ]}
              headerMap={{
                suggestions: "Suggestions",
                acceptances: "Acceptances",
                acceptanceRate: "Acceptance Rate",
                linesSuggested: "Lines of Code Suggested",
                linesAccepted: "Lines of Code Accepted",
                lineAcceptanceRate: "Line Acceptance Rate"
              }}
              computedFields={(stats) => ({
                acceptanceRate: stats.suggestions ? stats.acceptances / stats.suggestions : 0,
                lineAcceptanceRate: stats.linesSuggested ? stats.linesAccepted / stats.linesSuggested : 0
              })}
            />
            </div>
          )}
        
        <h1 className="title">CoPilot Chat</h1>
        {isLiveLoading ? (
            <div className="copilot-chat-grid">
              <SkeletonStatCard />
              <SkeletonStatCard />
              <SkeletonStatCard />
              <SkeletonStatCard />
              <SkeletonStatCard />
            </div>
          ) : (
            <div>
              <ChatCards chats={chats} prefix={"Total"}/>
            </div>
          )}
          {isLiveLoading ? (
            <h3>Loading live data...</h3>
          ) : (
            <div className="copilot-chat-container">
              <h3>Engaged Users By Day</h3>
              <EngagedUsersGraph data={chats?.perGroupedPeriod ?? 0}/>
              <div className="copilot-charts-container">
                <PieChart engagedUsers={chats?.engagedUsersByEditor ?? 0} title={"Engaged Users by Editor"}/>
              </div>
              <h3>Editor Breakdown</h3>
              <TableBreakdown
              data={chats?.editorBreakdown ?? 0}
              idField="editor"
              idHeader="Editor"
              tableContext="CoPilot Chat Editor Breakdown"
              columns={[
                "chats",
                "insertions",
                "insertionRate",
                "copies",
                "copyRate"
              ]}
              headerMap={{
                chats: "Chats",
                insertions: "Insertions",
                insertionRate: "Insertion Rate",
                copies: "Copies",
                copyRate: "Copy Rate"
              }}
              computedFields={(stats) => ({
                insertionRate: stats.chats ? stats.insertions / stats.chats : 0,
                copyRate: stats.chats ? stats.copies / stats.chats : 0
              })}
            />
            </div>
          )}
        
        <h1 className="title">Seat Information</h1>
        {isSeatsLoading ? (
          <h3>Loading seat data...</h3>
          ) : (
            <div>
              <div>
                <p>Users are considered inactive after {inactiveDays} days ({inactivityDate})</p>
                <div className="inactivity-toggle">
                  <p>Toggle inactivity threshold:</p>
                  <button 
                    className="inactivity-button" 
                    onClick={handleInactivityDecrease}
                    onKeyDown={(e) => handleKeyDown(e, handleInactivityDecrease)}
                    aria-label="Decrease inactivity threshold by one day"
                  >
                    -
                  </button>
                  <button 
                    className="inactivity-button" 
                    onClick={handleInactivityIncrease}
                    onKeyDown={(e) => handleKeyDown(e, handleInactivityIncrease)}
                    aria-label="Increase inactivity threshold by one day"
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="copilot-grid">
                  <div className="stat-card">
                    <h2>Number of Seats</h2>
                    <p>{seats.allSeatData.length}</p>
                  </div>
                  <div className="stat-card">
                    <h2>Number of Engaged Users</h2>
                    <p>{seats.activeSeatData.length}</p>
                  </div>
                  <div className="stat-card">
                    <h2>Number of Inactive Users</h2>
                    <p>{seats.allSeatData.length - seats.activeSeatData.length}</p>
                  </div>
                </div>
                <div className="seat-breakdown">
                  <div className="seat-breakdown-item">
                    <h3>Engaged Users</h3>
                    <TableBreakdown
                      data={seats.activeSeatData.reduce((acc, user, i) => {
                        acc[i] = {
                          avatar: user.assignee.avatar_url,
                          username: user.assignee.login,
                          github: `https://github.com/${user.assignee.login}`,
                          lastActivity: getFormattedTime(user.last_activity_at)
                        };
                        return acc;
                      }, {})}
                      idField="username"
                      idHeader="Username"
                      tableContext="Engaged Users List"
                      columns={["avatar", "github", "lastActivity"]}
                      headerMap={{
                        avatar: "Avatar",
                        github: "GitHub Profile",
                        lastActivity: "Last Activity"
                      }}
                      customCellRenderers={getCellRenderers()}
                    />
                  </div>
                  <div className="seat-breakdown-item">
                    <h3>Inactive Users</h3>
                    <TableBreakdown
                      data={inactiveUsers.reduce((acc, user, i) => {
                        acc[i] = {
                          avatar: user.assignee.avatar_url,
                          username: user.assignee.login,
                          github: `https://github.com/${user.assignee.login}`,
                          lastActivity: getFormattedTime(user.last_activity_at)
                        };
                        return acc;
                      }, {})}
                      idField="username"
                      idHeader="Username"
                      tableContext="Inactive Users List"
                      columns={["avatar", "github", "lastActivity"]}
                      headerMap={{
                        avatar: "Avatar",
                        github: "GitHub Profile",
                        lastActivity: "Last Activity"
                      }}
                      customCellRenderers={getCellRenderers()}
                    />
                  </div>
                </div>
            </div>
          )}
    </div>
  );
}

export default LiveDashboard;