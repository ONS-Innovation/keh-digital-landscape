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
                  <p>{completions?.totalSuggestions ?? 0}</p>
                </div>
                <div className="stat-card">
                  <h3>Total Acceptances</h3>
                  <p>{completions?.totalAcceptances ?? 0}</p>
                </div>
                <div className="stat-card">
                  <h3>Acceptance Rate</h3>
                  <p>{getPercentage(completions?.acceptanceRate ?? 0)}</p>
                </div>
                <div className="stat-card">
                  <h3>Total Lines of Code Suggested</h3>
                  <p>{completions?.totalLinesSuggested ?? 0}</p>
                </div>
                <div className="stat-card">
                  <h3>Total Lines of Code Accepted</h3>
                  <p>{completions?.totalLinesAccepted ?? 0}</p>
                </div>
                <div className="stat-card">
                  <h3>Line Acceptance Rate</h3>
                  <p>{getPercentage(completions?.lineAcceptanceRate ?? 0)}</p>
                </div>
              </div>
            </div>
          )}
          <h4>Acceptances and Acceptance Rate By Day</h4>
          {isLoading ? (
            <div>Loading graph...</div>
          ) : (
            <AcceptanceGraph data={completions?.perDay ?? 0}/>
          )}
          <h4>Engaged Users By Day</h4>
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
          <h4>Language Breakdown</h4>
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
                  <p>{chats?.totalChats ?? 0}</p>
                </div>
                <div className="stat-card">
                  <h3>Total Insertions</h3>
                  <p>{chats?.totalInsertions ?? 0}</p>
                </div>
                <div className="stat-card">
                  <h3>Insertion Rate</h3>
                  <p>{getPercentage(chats?.insertionRate ?? 0)}</p>
                </div>
                <div className="stat-card">
                  <h3>Total Copies</h3>
                  <p>{chats?.totalCopies ?? 0}</p>
                </div>
                <div className="stat-card">
                  <h3>Copy Rate</h3>
                  <p>{getPercentage(chats?.copyRate ??  0)}</p>
                </div>
              </div>
            </div>
          )}
          <h4>Engaged Users By Day</h4>
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
         <h4>Editor Breakdown</h4>
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
        
        <h2 className="title">Seat Information</h2>
        {isLoading ? (
          <div>Loading seat info...</div>
          ) : (
            <div>
              <div className="inactivity-info">
                <p>Users are considered inactive after {inactiveDays} days ({inactivityDate})</p>
                <div className="inactivity-button" onClick={() => setInactiveDays((prev) => prev + 1)}>+</div>
                <div className="inactivity-button" onClick={() => setInactiveDays((prev) => (prev > 0 ? prev - 1 : prev))}>-</div>
              </div>
              <div className="copilot-grid">
                  <div className="stat-card">
                    <h3>Number of Seats</h3>
                    <p>{seats.allSeatData.length}</p>
                  </div>
                  <div className="stat-card">
                    <h3>Number of Engaged Users</h3>
                    <p>{seats.activeSeatData.length}</p>
                  </div>
                  <div className="stat-card">
                    <h3>Number of Inactive Users</h3>
                    <p>{seats.allSeatData.length - seats.activeSeatData.length}</p>
                  </div>
                </div>
                <div className="seat-breakdown">
                  <div>
                    <h4>Engaged Users</h4>
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
                  <div>
                    <h4>Inactive Users</h4>
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
    </div>
  );
}

export default LiveDashboard;