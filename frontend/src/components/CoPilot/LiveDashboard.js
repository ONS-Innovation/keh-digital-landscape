import React from "react";
import "../../styles/components/Statistics.css";
import SkeletonStatCard from "../Statistics/Skeletons/SkeletonStatCard";
import "../../styles/CoPilotPage.css";
import { getPercentage } from "../../utilities/getPercentage";
import AcceptanceGraph from "./AcceptanceGraph";
import EngagedUsersGraph from "./EngagedUsersGraph";
import PieChart from "./PieChart";
import TableBreakdown from "./TableBreakdown";
import { getFormattedTime } from "../../utilities/getFormattedTime";
import { getCellRenderers } from "../../utilities/getCellRenderers";

function LiveDashboard({scope, data, isLoading, inactiveDays, setInactiveDays, inactivityDate}) {

  let completions, chats, seats, inactiveUsers;
  if(!isLoading) {
    completions = data.processedUsage.completions;
    chats = data.processedUsage.chat;
    seats = { allSeatData: data.allSeatData, activeSeatData: data.activeSeatData };

    const activeUsers = new Set(
      seats.activeSeatData.map(user => user.assignee.id)
    );
    
    inactiveUsers = seats.allSeatData.filter(
      user => !activeUsers.has(user.assignee.id)
    );
  }

  return (
    <>
        <h2 className="copilot-title pt-50">IDE Code Completions</h2>
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
                  <h2>Total Suggestions</h2>
                  <p>{completions?.totalSuggestions ?? 0}</p>
                </div>
                <div className="stat-card">
                  <h2>Total Acceptances</h2>
                  <p>{completions?.totalAcceptances ?? 0}</p>
                </div>
                <div className="stat-card">
                  <h2>Acceptance Rate</h2>
                  <p>{getPercentage(completions?.acceptanceRate ?? 0)}</p>
                </div>
                <div className="stat-card">
                  <h2>Total Lines of Code Suggested</h2>
                  <p>{completions?.totalLinesSuggested ?? 0}</p>
                </div>
                <div className="stat-card">
                  <h2>Total Lines of Code Accepted</h2>
                  <p>{completions?.totalLinesAccepted ?? 0}</p>
                </div>
                <div className="stat-card">
                  <h2>Line Acceptance Rate</h2>
                  <p>{getPercentage(completions?.lineAcceptanceRate ?? 0)}</p>
                </div>
              </div>
            </div>
          )}
          <h2 className="copilot-title">Acceptances and Acceptance Rate By Day</h2>
          {isLoading ? (
            <div>Loading graph...</div>
          ) : (
            <AcceptanceGraph data={completions?.perDay ?? 0}/>
          )}
          <h3>Engaged Users By Day</h3>
          {isLoading ? (
            <div>Loading graph...</div>
          ) : (
            <EngagedUsersGraph data={completions?.perDay ?? 0}/>
          )}
          {isLoading ? (
            <div className="pie-chart-loading">Loading pie charts...</div>
          ) : (
            <div className="copilot-charts-container">
              <PieChart engagedUsers={completions?.engagedUsersByLanguage ?? 0} title={"Engaged Users by Language"}/>
              <PieChart engagedUsers={completions?.engagedUsersByEditor ?? 0} title={"Engaged Users by Editor"}/>
            </div>
          )}
          <h2 className="copilot-title">Language Breakdown</h2>
          {isLoading ? (
            <div>Loading table...</div>
          ) : (
            <TableBreakdown
              data={completions?.languageBreakdown ?? 0}
              idField="language"
              idHeader="Language"
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
          )}
        
        <h2 className="copilot-title pt-50">CoPilot Chat</h2>
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
                  <h2>Total Chats</h2>
                  <p>{chats?.totalChats ?? 0}</p>
                </div>
                <div className="stat-card">
                  <h2>Total Insertions</h2>
                  <p>{chats?.totalInsertions ?? 0}</p>
                </div>
                <div className="stat-card">
                  <h2>Insertion Rate</h2>
                  <p>{getPercentage(chats?.insertionRate ?? 0)}</p>
                </div>
                <div className="stat-card">
                  <h2>Total Copies</h2>
                  <p>{chats?.totalCopies ?? 0}</p>
                </div>
                <div className="stat-card">
                  <h2>Copy Rate</h2>
                  <p>{getPercentage(chats?.copyRate ??  0)}</p>
                </div>
              </div>
            </div>
          )}
          <h3>Engaged Users By Day</h3>
          {isLoading ? (
            <div>Loading graph...</div>
          ) : (
            <EngagedUsersGraph data={chats?.perDay ?? 0}/>
          )}
          {isLoading ? (
            <div className="pie-chart-loading">Loading pie chart...</div>
          ) : (
            <div className="copilot-charts-container">
              <PieChart engagedUsers={chats?.engagedUsersByEditor ?? 0} title={"Engaged Users by Editor"}/>
            </div>
          )}
         <h3>Editor Breakdown</h3>
         {isLoading ? (
            <div>Loading table...</div>
          ) : (
            <TableBreakdown
              data={chats?.editorBreakdown ?? 0}
              idField="editor"
              idHeader="Editor"
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
          )}
        
        <h2 className="copilot-title pt-50">Seat Information</h2>
        {isLoading ? (
          <div>Loading seat info...</div>
          ) : (
            <div>
              <div>
                <p>Users are considered inactive after {inactiveDays} days ({inactivityDate})</p>
                <div className="inactivity-toggle">
                  <p>Toggle inactivity threshold:</p>
                  <div className="inactivity-button" title="Decrease inactivity threshold" aria-label="Decrease inactivity threshold" onClick={() => setInactiveDays((prev) => (prev > 0 ? prev - 1 : prev))}>-</div>
                  <div className="inactivity-button" title="Increase inactivity threshold" aria-label="Increase inactivity threshold" onClick={() => setInactiveDays((prev) => prev + 1)}>+</div>
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
    </>
  );
}

export default LiveDashboard;