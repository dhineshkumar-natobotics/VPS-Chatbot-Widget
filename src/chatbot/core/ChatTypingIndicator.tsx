import React from "react";
import { cn } from "../../lib/cn";

export const ChatTypingIndicator: React.FC<{
  className?: string;
  text?: string;
}> = ({ className, text }) => {
  return (
    <div
      className={cn("typing-indicator-container", className)}
      role="status"
      aria-label="Assistant is preparing a reply"
    >
      <div className="typing-indicator" aria-hidden="true">
        <span className="typing-dot" />
        <span className="typing-dot" />
        <span className="typing-dot" />
      </div>
      {text && <div className="typing-progress-pill">{text}</div>}
    </div>
  );
};
