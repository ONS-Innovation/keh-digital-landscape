import { getPercentage } from '../../../utilities/getPercentage';
import { formatNumberWithCommas } from '../../../utilities/getCommaSeparated';

/**
 * ChatCards component displays statistics related to copilot chats data
 * @param {Object} chats - The chats data
 * @param {string} prefix - A prefix for the card titles (e.g., "Total", "Average")
 * @param {number} [divider=1] - A value to divide the statistics by for calculating averages
 * @returns {JSX.Element} The rendered ChatCards component
 */
function ChatCards({ chats, prefix, divider = 1 }) {
  return (
    <div className="copilot-chat-grid">
      <div className="stat-card">
        <h2>{prefix} Chats</h2>
        <p>
          {formatNumberWithCommas(
            Math.round((chats?.totalChats ?? 0) / divider)
          )}
        </p>
      </div>
      <div className="stat-card">
        <h2>{prefix} Insertions</h2>
        <p>
          {formatNumberWithCommas(
            Math.round((chats?.totalInsertions ?? 0) / divider)
          )}
        </p>
      </div>
      {prefix !== 'Average' && (
        <div className="stat-card">
          <h2>{prefix} Insertion Rate</h2>
          <p>{getPercentage(chats?.insertionRate ?? 0)}</p>
        </div>
      )}
      <div className="stat-card">
        <h2>{prefix} Copies</h2>
        <p>
          {formatNumberWithCommas(
            Math.round((chats?.totalCopies ?? 0) / divider)
          )}
        </p>
      </div>
      {prefix !== 'Average' && (
        <div className="stat-card">
          <h2>{prefix} Copy Rate</h2>
          <p>{getPercentage(chats?.copyRate ?? 0)}</p>
        </div>
      )}
    </div>
  );
}

export default ChatCards;
