import React from "react";
import { Clock } from "lucide-react";

interface AgentSummaryCardProps {
  agentName?: string;
  agentInitials?: string;
  duration?: string;
}

export const AgentSummaryCard: React.FC<AgentSummaryCardProps> = ({
  agentName = "Fikri Studio",
  agentInitials = "FIK",
  duration = "12 Mins 23 Sec",
}) => {
  return (
    <div className="summary-talk-card">
      <h3 className="summary-talk-title">Summary talk with agent</h3>
      <div className="summary-talk-grid">
        <div className="summary-talk-col">
          <span className="summary-talk-label">Chat with</span>
          <div className="summary-agent-info">
            <span className="summary-agent-avatar">{agentInitials}</span>
            <span className="summary-agent-name">{agentName}</span>
          </div>
        </div>

        <div className="summary-talk-col">
          <span className="summary-talk-label">Chat Duration</span>
          <div className="summary-duration-info">
            <Clock size={15} className="summary-clock-icon" />
            <span className="summary-duration-text">{duration}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
