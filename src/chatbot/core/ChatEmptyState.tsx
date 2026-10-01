import React from "react";
import { BotMessageSquare } from "lucide-react";

export const ChatEmptyState: React.FC = () => {
  return (
    <div className="chat-empty-row">
      <div
        className="avatar-circle avatar-circle--mt"
        aria-hidden="true"
      >
        <BotMessageSquare size={15} />
      </div>
      <div className="chat-empty-bubble">
        <p>
          Hello — I am the VPS Veritas assistant. Ask about reports, sample status,
          registration, or support, or choose a question below the text box.
        </p>
      </div>
    </div>
  );
};
