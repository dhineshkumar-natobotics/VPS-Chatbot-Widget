import React from "react";

interface ChatErrorProps {
  message: string;
  onRetry?: () => void;
}

export const ChatError: React.FC<ChatErrorProps> = ({ message, onRetry }) => {
  return (
    <div
      className="chat-error-banner"
      role="alert"
    >
      <p>{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="chat-error-retry-btn"
        >
          Try again
        </button>
      )}
    </div>
  );
};
