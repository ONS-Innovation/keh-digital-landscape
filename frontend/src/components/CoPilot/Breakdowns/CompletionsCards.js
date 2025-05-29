import React from "react";
import { getPercentage } from "../../../utilities/getPercentage";

function CompletionsCards({completions, prefix, divider = 1}) {

    return (
        <div>
            <div className="copilot-grid">
            <div className="stat-card">
                <h3>{prefix} Suggestions</h3>
                <p>{Math.round((completions?.totalSuggestions ?? 0) / divider)}</p>
            </div>
            <div className="stat-card">
                <h3>{prefix} Acceptances</h3>
                <p>{Math.round((completions?.totalAcceptances ?? 0) / divider)}</p>
            </div>
            {prefix !== "Average" && (
            <div className="stat-card">
                <h3>{prefix} Acceptance Rate</h3>
                <p>{getPercentage((completions?.acceptanceRate ?? 0 / divider))}</p>
            </div>
            )}
            <div className="stat-card">
                <h3>{prefix} Lines of Code Suggested</h3>
                <p>{Math.round((completions?.totalLinesSuggested ?? 0) / divider)}</p>
            </div>
            <div className="stat-card">
                <h3>{prefix} Lines of Code Accepted</h3>
                <p>{Math.round((completions?.totalLinesAccepted ?? 0) / divider)}</p>
            </div>
            {prefix !== "Average" && (
            <div className="stat-card">
                <h3>{prefix} Line Acceptance Rate</h3>
                <p>{getPercentage((completions?.lineAcceptanceRate ?? 0 / divider))}</p>
            </div>
            )}
            </div>
        </div>
    )
}

export default CompletionsCards;