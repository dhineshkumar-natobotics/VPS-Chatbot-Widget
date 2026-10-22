import React from "react";
import { Sparkles } from "lucide-react";
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
      {/* <div className="typing-indicator">
        <span className="typing-dot" />
        <span className="typing-dot" />
        <span className="typing-dot" />
      </div> */}
      <div className="typing-progress-pill">
        <span className="typing-progress-text">
          {text || "Retrieving knowledge & generating answer ..."}
        </span>
      </div>
    </div>
  );
};
