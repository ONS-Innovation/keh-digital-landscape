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
        {completions?.totalSuggestions > 0 && (
          <div className="stat-card">
            <h2>{prefix} Suggestions</h2>
            <p>
              {formatNumberWithCommas(
                Math.round(completions.totalSuggestions / divider)
              )}
            </p>
          </div>
        )}
        {completions?.totalAcceptances > 0 && (
          <div className="stat-card">
            <h2>{prefix} Acceptances</h2>
            <p>
              {formatNumberWithCommas(
                Math.round(completions.totalAcceptances / divider)
              )}
            </p>
          </div>
        )}
        {prefix !== 'Average' && completions?.acceptanceRate > 0 && (
          <div className="stat-card">
            <h2>{prefix} Acceptance Rate</h2>
            <p>{getPercentage(completions.acceptanceRate / divider)}</p>
          </div>
        )}
        {completions?.totalLinesSuggested > 0 && (
          <div className="stat-card">
            <h2>{prefix} Lines of Code Suggested</h2>
            <p>
              {formatNumberWithCommas(
                Math.round(completions.totalLinesSuggested / divider)
              )}
            </p>
          </div>
        )}
        {completions?.totalLinesAccepted > 0 && (
          <div className="stat-card">
            <h2>{prefix} Lines of Code Accepted</h2>
            <p>
              {formatNumberWithCommas(
                Math.round(completions.totalLinesAccepted / divider)
              )}
            </p>
          </div>
        )}
        {prefix !== 'Average' && completions?.lineAcceptanceRate > 0 && (
          <div className="stat-card">
            <h2>{prefix} Line Acceptance Rate</h2>
            <p>{getPercentage(completions.lineAcceptanceRate / divider)}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default CompletionsCards;
