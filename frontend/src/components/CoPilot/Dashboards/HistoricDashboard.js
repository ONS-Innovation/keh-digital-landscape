import React from "react";
import "../../../styles/components/Statistics.css";
import SkeletonStatCard from "../../Statistics/Skeletons/SkeletonStatCard";
import "../../../styles/CoPilotPage.css";
import AcceptanceGraph from "../Breakdowns/AcceptanceGraph";
import EngagedUsersGraph from "../Breakdowns/EngagedUsersGraph";
import PieChart from "../Breakdowns/PieChart";
import TableBreakdown from "../Breakdowns/TableBreakdown";
import CompletionsCards from "../Breakdowns/CompletionsCards";
import ChatCards from "../Breakdowns/ChatCards";

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
          <h3>Averages per (period)</h3>
          <CompletionsCards completions={completions} prefix={"Average"}/>
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
        <div>
          <ChatCards chats={chats} prefix={"Total"}/>
          <h3>Averages per (period)</h3>
          <ChatCards chats={chats} prefix={"Average"}/>
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