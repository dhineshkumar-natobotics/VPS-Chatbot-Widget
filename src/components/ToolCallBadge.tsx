import React from "react";
import { CheckCircle2 } from "lucide-react";
import { ToolCall } from "../types/chat";

interface ToolCallBadgeProps {
  toolCalls?: ToolCall[];
}

export const ToolCallBadge: React.FC<ToolCallBadgeProps> = ({ toolCalls }) => {
  if (!toolCalls || toolCalls.length === 0) return null;

  return (
    <div className="tool-call-chips-group">
      {toolCalls.map((tc, idx) => {
        let label = "Information retrieved";
        if (tc.tool_name === "create_ticket") label = "Support ticket processed";
        if (tc.tool_name === "get_customer") label = "Account verified";
        if (tc.tool_name === "get_ticket") label = "Ticket status loaded";

        return (
          <div key={idx} className="tool-call-chip">
            <CheckCircle2 size={12} className="tool-call-icon" />
            <span>{label}</span>
          </div>
        );
      })}
    </div>
  );
};
