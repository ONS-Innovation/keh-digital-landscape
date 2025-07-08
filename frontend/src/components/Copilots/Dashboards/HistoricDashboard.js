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

function HistoricDashboard({ scope, data, isLoading, viewDatesBy }) {
  let completions, chats;
  if (!isLoading) {
    completions = data.completions;
    chats = data.chat;
  }

  return (
    <div className="copilot-dashboard">
      <p className="disclaimer-banner">
        If grouping by day, engagement graphs will show the number of unique
        users per day. If grouping by week, month or year, the graphs will
        display the sum of those unique users for the period.
      </p>
      <h1 className="title">IDE Code Completions</h1>
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
          <CompletionsCards completions={completions} prefix={'Total'} />
          {viewDatesBy !== 'Day' && (
            <div>
              <h3>Averages per {viewDatesBy}</h3>
              <CompletionsCards
                completions={completions}
                prefix={'Average'}
                divider={completions.perGroupedPeriod.length}
              />
            </div>
          )}
        </div>
      )}
      {isLoading ? (
        <h3>Loading historic data...</h3>
      ) : (
        <div>
          <h3>Acceptances and Acceptance Rate By {viewDatesBy}</h3>
          <AcceptanceGraph data={completions?.perGroupedPeriod ?? 0} />
          <h3>Engaged Users By {viewDatesBy}</h3>
          <EngagedUsersGraph data={completions?.perGroupedPeriod ?? 0} />
          <div className="copilot-charts-container">
            <PieChart
              engagedUsers={completions?.engagedUsersByLanguage ?? 0}
              title={'Engaged Users by Language'}
            />
            <PieChart
              engagedUsers={completions?.engagedUsersByEditor ?? 0}
              title={'Engaged Users by Editor'}
            />
          </div>
          <h3>Language Breakdown</h3>
          <TableBreakdown
            data={completions?.languageBreakdown ?? 0}
            idField="language"
            idHeader="Language"
            tableContext="Historic IDE Code Completions Language Breakdown"
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

      <h1 className="title">Copilot Chat</h1>
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
          <ChatCards chats={chats} prefix={'Total'} />
          {viewDatesBy !== 'Day' && (
            <div>
              <h3>Averages per {viewDatesBy}</h3>
              <ChatCards
                chats={chats}
                prefix={'Average'}
                divider={chats.perGroupedPeriod.length}
              />
            </div>
          )}
        </div>
      )}
      {isLoading ? (
        <h3>Loading historic data...</h3>
      ) : (
        <div>
          <h3>Engaged Users By {viewDatesBy}</h3>
          <EngagedUsersGraph data={chats?.perGroupedPeriod ?? 0} />
          <div className="copilot-charts-container">
            <PieChart
              engagedUsers={chats?.engagedUsersByEditor ?? 0}
              title={'Engaged Users by Editor'}
            />
          </div>
          <h3>Editor Breakdown</h3>
          <TableBreakdown
            data={chats?.editorBreakdown ?? 0}
            idField="editor"
            idHeader="Editor"
            tableContext="Historic Copilot Chat Editor Breakdown"
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
              insertionRate: stats.chats ? stats.insertions / stats.chats : 0,
              copyRate: stats.chats ? stats.copies / stats.chats : 0,
            })}
          />
        </div>
      )}
    </div>
  );
}
export default HistoricDashboard;
