import React from "react";

interface ConnectingStatusProps {
  label?: string;
}

export const ConnectingStatus: React.FC<ConnectingStatusProps> = ({
  label = "Connecting with agent",
}) => {
  return (
    <div className="connecting-status-container">
      <div className="spinner-ring" />
      <span className="connecting-status-text">{label}</span>
    </div>
  );
};
