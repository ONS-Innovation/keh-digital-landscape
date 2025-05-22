import React from "react";
import "../../../styles/components/Statistics.css";
import SkeletonStatCard from "../../Statistics/Skeletons/SkeletonStatCard";
import "../../../styles/CoPilotPage.css";
import { getPercentage } from "../../../utilities/getPercentage";
import AcceptanceGraph from "../Breakdowns/AcceptanceGraph";
import EngagedUsersGraph from "../Breakdowns/EngagedUsersGraph";
import PieChart from "../Breakdowns/PieChart";
import TableBreakdown from "../Breakdowns/TableBreakdown";

function HistoricDashboard({scope, data, isLoading}) {

  let completions, chats;
  if(!isLoading) {
    completions = data.processedUsage.completions;
    chats = data.processedUsage.chat;
  }

  return (
    <div>
    <h2 className="title">IDE Code Completions</h2>
      {isLoading ? (
        //TODO: Make component for code completions cards
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
          <h3>Averages per (period)</h3>
          <p>TODO: Stat cards</p>
        </div>
      )}
      <h4>Acceptances and Acceptance Rate By (Period)</h4>
      {isLoading ? (
        <div>Loading graph...</div>
      ) : (
        <AcceptanceGraph data={completions?.perDay ?? 0}/>
      )}
      <h4>Engaged Users By (Period)</h4>
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
        //TODO: Make component for chat cards
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
          <h3>Averages per (period)</h3>
        </div>
      )}
      <h4>Engaged Users By (Period)</h4>
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
</div>
  );
}
export default HistoricDashboard;