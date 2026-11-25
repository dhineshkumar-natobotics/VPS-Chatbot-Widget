import React from "react";
import { CircleAlert } from "lucide-react";
import { Message, MessageContent, MessageFooter } from "../../components/ui/message";
import { Trace, TraceIcon, TraceLine, TraceTitle } from "../../components/ui/trace";

interface ChatErrorProps {
  message: string;
  onRetry?: () => void;
}

export const ChatError: React.FC<ChatErrorProps> = ({ message, onRetry }) => {
  return (
    <Message
      className="chat-error-banner"
      role="alert"
    >
      <MessageContent>
        <Trace className="chat-message-body">
          <TraceLine status="error">
            <TraceIcon><CircleAlert size={14} /></TraceIcon>
            <TraceTitle className="chat-error-title">{message}</TraceTitle>
          </TraceLine>
        </Trace>
        {onRetry && (
          <MessageFooter>
            <button type="button" onClick={onRetry} className="chat-error-retry-btn">
              Try again
            </button>
          </MessageFooter>
        )}
      </MessageContent>
    </Message>
  );
};
