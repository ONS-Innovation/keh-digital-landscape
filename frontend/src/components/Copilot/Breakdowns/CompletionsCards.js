import React from 'react';
import { getPercentage } from '../../../utilities/getPercentage';
import { formatNumberWithCommas } from '../../../utilities/getCommaSeparated';

/**
 * CompletionsCards component displays statistics related to copilot completions data
 * @param {Object} completions - The completions data
 * @param {string} prefix - A prefix for the card titles (e.g., "Total", "Average")
 * @param {number} [divider=1] - A value to divide the statistics by for calculating averages
 * @returns {JSX.Element} The rendered CompletionsCards component
 */
function CompletionsCards({ completions, prefix, divider = 1 }) {
  return (
    <div>
      <div className={`copilot-grid${prefix === 'Average' ? '-average' : ''}`}>
        <div className="stat-card">
          <h2>{prefix} Suggestions</h2>
          <p>
            {formatNumberWithCommas(
              Math.round((completions?.totalSuggestions ?? 0) / divider)
            )}
          </p>
        </div>
        <div className="stat-card">
          <h2>{prefix} Acceptances</h2>
          <p>
            {formatNumberWithCommas(
              Math.round((completions?.totalAcceptances ?? 0) / divider)
            )}
          </p>
        </div>
        {prefix !== 'Average' && (
          <div className="stat-card">
            <h2>{prefix} Acceptance Rate</h2>
            <p>{getPercentage(completions?.acceptanceRate ?? 0 / divider)}</p>
          </div>
        )}
        <div className="stat-card">
          <h2>{prefix} Lines of Code Suggested</h2>
          <p>
            {formatNumberWithCommas(
              Math.round((completions?.totalLinesSuggested ?? 0) / divider)
            )}
          </p>
        </div>
        <div className="stat-card">
          <h2>{prefix} Lines of Code Accepted</h2>
          <p>
            {formatNumberWithCommas(
              Math.round((completions?.totalLinesAccepted ?? 0) / divider)
            )}
          </p>
        </div>
        {prefix !== 'Average' && (
          <div className="stat-card">
            <h2>{prefix} Line Acceptance Rate</h2>
            <p>
              {getPercentage(completions?.lineAcceptanceRate ?? 0 / divider)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default CompletionsCards;
