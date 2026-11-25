import { Check, Copy, ThumbsDown, ThumbsUp } from "lucide-react";
import type { ChatMessage, MessageFeedback } from "../api/chatbot-types";
import { useCopyText } from "../hooks/useCopyText";

interface ChatMessageActionsProps {
  message: ChatMessage;
  onFeedback: (messageId: string, feedback: MessageFeedback) => void;
}

export function ChatMessageActions({ message, onFeedback }: ChatMessageActionsProps) {
  const { status: copyStatus, copy } = useCopyText();

  return (
    <div className="chat-message-actions" role="group" aria-label="Response actions">
      <button
        type="button"
        className="chat-message-action"
        aria-label="Copy response"
        title="Copy response"
        disabled={copyStatus === "copying"}
        onClick={() => void copy(message.content)}
      >
        {copyStatus === "copied" ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
      </button>
      <button
        type="button"
        className="chat-message-action"
        aria-label="Like response"
        title="Like response"
        aria-pressed={message.feedback === "like"}
        onClick={() => onFeedback(message.id, "like")}
      >
        <ThumbsUp size={16} aria-hidden="true" />
      </button>
      <button
        type="button"
        className="chat-message-action"
        aria-label="Dislike response"
        title="Dislike response"
        aria-pressed={message.feedback === "dislike"}
        onClick={() => onFeedback(message.id, "dislike")}
      >
        <ThumbsDown size={16} aria-hidden="true" />
      </button>
      <span className="chat-message-copy-status" role="status">
        {copyStatus === "copied" && "Copied"}
        {copyStatus === "failed" && "Couldn’t copy"}
      </span>
    </div>
  );
}
