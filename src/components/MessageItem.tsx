import React, { useState } from "react";
import { BotMessageSquare, Check, CornerUpLeft, Smile } from "lucide-react";
import { Message } from "../types/chat";
import { SourceCitations } from "./SourceCitations";
import { ToolCallBadge } from "./ToolCallBadge";
import { QuickPrompts, QuickOption } from "./QuickPrompts";
import { renderHighlightedText } from "../lib/textHighlighter";
import { ResponseIconMapper } from "./ResponseIconMapper";

interface MessageItemProps {
  message: Message;
  agentInitials?: string;
  isBot?: boolean;
  onSelectPrompt?: (prompt: string) => void;
  quickOptions?: QuickOption[];
}

// ── Markdown block renderer ────────────────────────────────────────────────────
const formatMarkdown = (text: string) => {
  if (!text) return null;

  const blocks = text.split(/\n\n+/);

  return blocks.map((block, bIdx) => {
    // Bullet lists
    if (block.trim().startsWith("- ") || block.trim().startsWith("* ")) {
      const items = block
        .split(/\n/)
        .filter((line) => line.trim().startsWith("- ") || line.trim().startsWith("* "));
      return (
        <ul key={bIdx} className="msg-list">
          {items.map((item, iIdx) => (
            <li key={iIdx}>{renderHighlightedText(item.replace(/^[-*]\s+/, ""))}</li>
          ))}
        </ul>
      );
    }

    // Numbered lists
    if (/^\d+\.\s+/.test(block.trim())) {
      const items = block
        .split(/\n/)
        .filter((line) => /^\d+\.\s+/.test(line.trim()));
      return (
        <ol key={bIdx} className="msg-ordered-list">
          {items.map((item, iIdx) => (
            <li key={iIdx}>{renderHighlightedText(item.replace(/^\d+\.\s+/, ""))}</li>
          ))}
        </ol>
      );
    }

    return (
      <p key={bIdx} className="msg-para">
        {renderHighlightedText(block)}
      </p>
    );
  });
};

// ── Component ──────────────────────────────────────────────────────────────────
export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  agentInitials = "FIK",
  isBot = false,
  onSelectPrompt,
  quickOptions,
}) => {
  const isUser = message.role === "user";
  const [reaction, setReaction] = useState<string | null>(null);

  return (
    <div className={`message-item-row ${isUser ? "row-user" : "row-assistant"}`}>
      {/* Left Avatar for Bot/Agent */}
      {!isUser && (
        <div className="msg-avatar-assistant">
          {isBot ? <BotMessageSquare size={15} /> : <span>{agentInitials}</span>}
        </div>
      )}

      {/* Message Bubble + Actions */}
      <div className="msg-content-wrapper">
        <div
          className={`msg-bubble ${
            isUser ? "bubble-user" : message.error ? "bubble-error" : "bubble-assistant"
          }`}
        >
          {isUser ? (
            /* User messages: plain text, no extra highlighting */
            <div className="user-text-row">
              <span>{message.content}</span>
            </div>
          ) : (
            /* Assistant messages: icon badge + rich highlighted markdown */
            <div className="assistant-text-content">
              <ResponseIconMapper content={message.content} />
              {formatMarkdown(message.content)}
            </div>
          )}

          {/* Quick option buttons */}
          {quickOptions && quickOptions.length > 0 && onSelectPrompt && (
            <QuickPrompts options={quickOptions} onSelectPrompt={onSelectPrompt} />
          )}

          {/* Tool call badges */}
          {message.tool_calls && message.tool_calls.length > 0 && (
            <ToolCallBadge toolCalls={message.tool_calls} />
          )}

          {/* Source citations */}
          {message.sources && message.sources.length > 0 && (
            <SourceCitations sources={message.sources} />
          )}
        </div>

        {/* Action icons on hover for assistant messages */}
        {!isUser && (
          <div className="msg-action-bar">
            <button
              className="msg-action-btn"
              title="React"
              onClick={() => setReaction(reaction ? null : "😊")}
            >
              <Smile size={14} />
              {reaction && <span className="active-reaction">{reaction}</span>}
            </button>
            <button className="msg-action-btn" title="Reply">
              <CornerUpLeft size={14} />
            </button>
          </div>
        )}

        {/* Read checkmark for user messages */}
        {isUser && (
          <div className="user-status-row">
            <Check size={13} className="user-check-icon" />
          </div>
        )}
      </div>

      {/* Right Avatar for User */}
      {isUser && (
        <div className="msg-avatar-user">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
            alt="User"
            className="user-avatar-img"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        </div>
      )}
    </div>
  );
};
