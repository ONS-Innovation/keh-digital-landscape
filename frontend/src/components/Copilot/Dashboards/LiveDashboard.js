import React from 'react';
import '../../../styles/components/Statistics.css';
import SkeletonStatCard from '../../Statistics/Skeletons/SkeletonStatCard';
import '../../../styles/CopilotPage.css';
import AcceptanceGraph from '../Breakdowns/AcceptanceGraph';
import EngagedUsersGraph from '../Breakdowns/EngagedUsersGraph';
import PieChart from '../Breakdowns/PieChart';
import TableBreakdown from '../Breakdowns/TableBreakdown';
import CompletionsCards from '../Breakdowns/CompletionsCards';
import ChatCards from '../Breakdowns/ChatCards';

function LiveDashboard({ scope, data, isLiveLoading }) {
  let completions, chats;
  if (!isLiveLoading) {
    completions = data.processedUsage.completions;
    chats = data.processedUsage.chat;
  }

  const handleKeyDown = (event, action) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      action();
    }
  };

  return (
    <div className="copilot-dashboard">
      {scope === 'team' && (
        <p className="disclaimer-banner">
          The GitHub API does not return Copilot team usage data if there are
          fewer than 5 members with Copilot licenses.
        </p>
      )}
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
        Object.keys(completions || {}).length > 0 && (
          <div>
            <h1 className="title">IDE Code Completions</h1>
            <CompletionsCards completions={completions} prefix={'Total'} />
          </div>
        )
      )}
      {isLiveLoading ? (
        <h3>Loading acceptance and engagement data...</h3>
      ) : (
        <div>
          {completions?.perGroupedPeriod.length > 0 && (
            <div>
              <h3>Acceptances and Acceptance Rate By Day</h3>
              <AcceptanceGraph data={completions?.perGroupedPeriod} />
            </div>
          )}
          {completions?.perGroupedPeriod.length > 0 && (
            <div>
              <h3>Engaged Users By Day</h3>
              <EngagedUsersGraph data={completions?.perGroupedPeriod} />
            </div>
          )}
          {completions &&
            (Object.keys(completions.engagedUsersByLanguage || {}).length > 0 ||
              Object.keys(completions.engagedUsersByEditor || {}).length >
                0) && (
              <div className="copilot-charts-container">
                {Object.keys(completions.engagedUsersByLanguage || {}).length >
                  0 && (
                  <PieChart
                    engagedUsers={completions?.engagedUsersByLanguage}
                    title={'Engaged Users by Language'}
                  />
                )}
                {Object.keys(completions.engagedUsersByEditor || {}).length >
                  0 && (
                  <PieChart
                    engagedUsers={completions?.engagedUsersByEditor}
                    title={'Engaged Users by Editor'}
                  />
                )}
              </div>
            )}
          {completions &&
            Object.keys(completions.languageBreakdown || {}).length > 0 && (
              <div>
                <h3>Language Breakdown</h3>
                <TableBreakdown
                  data={completions?.languageBreakdown}
                  idField="language"
                  idHeader="Language"
                  tableContext="IDE Code Completions Language Breakdown"
                  columns={[
                    'suggestions',
                    'acceptances',
                    'acceptanceRate',
                    'linesSuggested',
                    'linesAccepted',
                    'lineAcceptanceRate',
                  ]}
                  headerMap={{
                    suggestions: 'Suggestions',
                    acceptances: 'Acceptances',
                    acceptanceRate: 'Acceptance Rate',
                    linesSuggested: 'Lines of Code Suggested',
                    linesAccepted: 'Lines of Code Accepted',
                    lineAcceptanceRate: 'Line Acceptance Rate',
                  }}
                  computedFields={stats => ({
                    acceptanceRate: stats.suggestions
                      ? stats.acceptances / stats.suggestions
                      : 0,
                    lineAcceptanceRate: stats.linesSuggested
                      ? stats.linesAccepted / stats.linesSuggested
                      : 0,
                  })}
                />
              </div>
            )}
        </div>
      )}

      {chats && chats.perGroupedPeriod.length > 0 && (
        <>
          <h1 className="title">Copilot Chat</h1>
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
              <ChatCards chats={chats} prefix={'Total'} />
            </div>
          )}
        </>
      )}

      {isLiveLoading ? (
        <h3>Loading editor breakdown data...</h3>
      ) : (
        <div className="copilot-chat-container">
          {chats?.perGroupedPeriod.length > 0 && (
            <div>
              <h3>Engaged Users By Day</h3>
              <EngagedUsersGraph data={chats?.perGroupedPeriod} />
            </div>
          )}

          {chats &&
            Object.keys(chats.engagedUsersByEditor || {}).length > 0 && (
              <div className="copilot-charts-container">
                <PieChart
                  engagedUsers={chats?.engagedUsersByEditor}
                  title={'Engaged Users by Editor'}
                />
              </div>
            )}

          {chats && Object.keys(chats.editorBreakdown || {}).length > 0 && (
            <div>
              <h3>Editor Breakdown</h3>
              <TableBreakdown
                data={chats?.editorBreakdown}
                idField="editor"
                idHeader="Editor"
                tableContext="Copilot Chat Editor Breakdown"
                columns={[
                  'chats',
                  'insertions',
                  'insertionRate',
                  'copies',
                  'copyRate',
                ]}
                headerMap={{
                  chats: 'Chats',
                  insertions: 'Insertions',
                  insertionRate: 'Insertion Rate',
                  copies: 'Copies',
                  copyRate: 'Copy Rate',
                }}
                computedFields={stats => ({
                  insertionRate: stats.chats
                    ? stats.insertions / stats.chats
                    : 0,
                  copyRate: stats.chats ? stats.copies / stats.chats : 0,
                })}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default LiveDashboard;
