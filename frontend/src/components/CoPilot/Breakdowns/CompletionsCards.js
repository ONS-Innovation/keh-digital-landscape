import React from "react";
import { getPercentage } from "../../../utilities/getPercentage";

function CompletionsCards({completions, prefix}) {

    return (
        <div>
            <div className="copilot-grid">
            <div className="stat-card">
                <h3>{prefix} Suggestions</h3>
                <p>{completions?.totalSuggestions ?? 0}</p>
            </div>
            <div className="stat-card">
                <h3>{prefix} Acceptances</h3>
                <p>{completions?.totalAcceptances ?? 0}</p>
            </div>
            <div className="stat-card">
                <h3>{prefix} Acceptance Rate</h3>
                <p>{getPercentage(completions?.acceptanceRate ?? 0)}</p>
            </div>
            <div className="stat-card">
                <h3>{prefix} Lines of Code Suggested</h3>
                <p>{completions?.totalLinesSuggested ?? 0}</p>
            </div>
            <div className="stat-card">
                <h3>{prefix} Lines of Code Accepted</h3>
                <p>{completions?.totalLinesAccepted ?? 0}</p>
            </div>
            <div className="stat-card">
                <h3>{prefix} Line Acceptance Rate</h3>
                <p>{getPercentage(completions?.lineAcceptanceRate ?? 0)}</p>
            </div>
            </div>
        </div>
    )
}

export default CompletionsCards;