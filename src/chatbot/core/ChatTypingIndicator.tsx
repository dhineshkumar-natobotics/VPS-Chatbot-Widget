import React from "react";
import { cn } from "../../lib/cn";

export const ChatTypingIndicator: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div
      className={cn("typing-indicator", className)}
      role="status"
      aria-label="Assistant is preparing a reply"
    >
      <span className="typing-dot" />
      <span className="typing-dot" />
      <span className="typing-dot" />
    </div>
  );
};
