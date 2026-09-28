import React from "react";

interface ChatErrorProps {
  message: string;
  onRetry?: () => void;
}

export const ChatError: React.FC<ChatErrorProps> = ({ message, onRetry }) => {
  return (
    <div
      className="mx-4 mb-2 rounded-lg border border-[var(--error-border)] bg-[var(--error-bg)] px-3 py-2 text-[12.5px] text-[var(--error-text)]"
      role="alert"
    >
      <p>{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-1.5 text-[12px] font-semibold underline underline-offset-2"
        >
          Try again
        </button>
      )}
    </div>
  );
};
