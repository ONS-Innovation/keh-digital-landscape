import React from 'react';
import '../../../styles/components/Statistics.css';
import SkeletonStatCard from '../../Statistics/Skeletons/SkeletonStatCard';
import '../../../styles/CopilotPage.css';
import AcceptanceGraph from '../Breakdowns/AcceptanceGraph';
import EngagedUsersGraph from '../Breakdowns/EngagedUsersGraph';
import PieChart from '../Breakdowns/PieChart';
import TableBreakdown from '../Breakdowns/TableBreakdown';
import { getFormattedTime } from '../../../utilities/getFormattedTime';
import CompletionsCards from '../Breakdowns/CompletionsCards';
import ChatCards from '../Breakdowns/ChatCards';

function LiveDashboard({
  scope,
  data,
  isLiveLoading,
  isSeatsLoading,
  inactiveDays,
  setInactiveDays,
  inactivityDate,
}) {
  let completions, chats, seats, inactiveUsers;
  if (!isLiveLoading) {
    completions = data.processedUsage.completions;
    chats = data.processedUsage.chat;
  }

  if (!isSeatsLoading) {
    seats = {
      allSeatData: data.allSeatData,
      activeSeatData: data.activeSeatData,
    };

    const activeUsers = new Set(
      seats.activeSeatData.map(user => user.assignee.id)
    );

    inactiveUsers = seats.allSeatData.filter(
      user => !activeUsers.has(user.assignee.id)
    );
  }

  const handleInactivityDecrease = () => {
    setInactiveDays(prev => (prev > 0 ? prev - 1 : prev));
  };

  const handleInactivityIncrease = () => {
    setInactiveDays(prev => prev + 1);
  };

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
          fewer than 5 members with Copilot licenses. This may result in only
          seat statistics being viewable on the dashboard.
        </p>
      )}
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
          <CompletionsCards completions={completions} prefix={'Total'} />
        </div>
      )}
      {isLiveLoading ? (
        <h3>Loading live data...</h3>
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
          <div className="copilot-charts-container">
            {completions &&
              Object.keys(completions.engagedUsersByLanguage || {}).length >
                0 && (
                <PieChart
                  engagedUsers={completions?.engagedUsersByLanguage}
                  title={'Engaged Users by Language'}
                />
              )}
            {completions &&
              Object.keys(completions.engagedUsersByEditor || {}).length >
                0 && (
                <PieChart
                  engagedUsers={completions?.engagedUsersByEditor}
                  title={'Engaged Users by Editor'}
                />
              )}
          </div>
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
      {isLiveLoading ? (
        <h3>Loading live data...</h3>
      ) : (
        <div className="copilot-chat-container">
          {chats?.perGroupedPeriod.length > 0 && (
            <div>
              <h3>Engaged Users By Day</h3>
              <EngagedUsersGraph data={chats?.perGroupedPeriod} />
            </div>
          )}
          <div className="copilot-charts-container">
            {chats &&
              Object.keys(chats.engagedUsersByEditor || {}).length > 0 && (
                <PieChart
                  engagedUsers={chats?.engagedUsersByEditor}
                  title={'Engaged Users by Editor'}
                />
              )}
          </div>
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

      <h1 className="title">Seat Information</h1>
      {isSeatsLoading ? (
        <h3>Loading seat data...</h3>
      ) : (
        <div>
          <div>
            <p>
              Users are considered inactive after {inactiveDays} days (
              {inactivityDate})
            </p>
            <div className="inactivity-toggle">
              <p>Toggle inactivity threshold:</p>
              <button
                className="inactivity-button"
                onClick={handleInactivityDecrease}
                onKeyDown={e => handleKeyDown(e, handleInactivityDecrease)}
                aria-label="Decrease inactivity threshold by one day"
              >
                -
              </button>
              <button
                className="inactivity-button"
                onClick={handleInactivityIncrease}
                onKeyDown={e => handleKeyDown(e, handleInactivityIncrease)}
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
                    lastActivity: getFormattedTime(user.last_activity_at),
                  };
                  return acc;
                }, {})}
                idField="username"
                idHeader="Username"
                tableContext="Engaged Users List"
                columns={['avatar', 'github', 'lastActivity']}
                headerMap={{
                  avatar: 'Avatar',
                  github: 'GitHub Profile',
                  lastActivity: 'Last Activity',
                }}
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
                    lastActivity: getFormattedTime(user.last_activity_at),
                  };
                  return acc;
                }, {})}
                idField="username"
                idHeader="Username"
                tableContext="Inactive Users List"
                columns={['avatar', 'github', 'lastActivity']}
                headerMap={{
                  avatar: 'Avatar',
                  github: 'GitHub Profile',
                  lastActivity: 'Last Activity',
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LiveDashboard;
