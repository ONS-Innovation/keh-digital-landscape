import React from "react";
import { getPercentage } from "../../../utilities/getPercentage";

function ChatCards({chats, prefix, divider = 1}) {
    return (
        <div className="copilot-chat-grid">
            <div className="stat-card">
                <h3>{prefix} Chats</h3>
                <p>{Math.round((chats?.totalChats ?? 0) / divider)}</p>
            </div>
            <div className="stat-card">
                <h3>{prefix} Insertions</h3>
                <p>{Math.round((chats?.totalInsertions ?? 0) / divider)}</p>
            </div>
            {prefix !== "Average" && (
            <div className="stat-card">
                <h3>{prefix} Insertion Rate</h3>
                <p>{getPercentage(chats?.insertionRate ?? 0)}</p>
            </div>
            )}
            <div className="stat-card">
                <h3>{prefix} Copies</h3>
                <p>{Math.round((chats?.totalCopies ?? 0) / divider)}</p>
            </div>
            {prefix !== "Average" && (
            <div className="stat-card">
                <h3>{prefix} Copy Rate</h3>
                <p>{getPercentage(chats?.copyRate ?? 0)}</p>
            </div>
            )}
        </div>
    )
}

export default ChatCards;