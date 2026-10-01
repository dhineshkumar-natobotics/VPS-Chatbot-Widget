import React, { useState } from "react";
import { Bot, Check, ChevronDown, ChevronUp, FileText , BotMessageSquare} from "lucide-react";
import type { ChatMessage, Source, ToolCall } from "../api/chatbot-types";
import { ChatMarkdown } from "./ChatMarkdown";
import { ChatTypingIndicator } from "./ChatTypingIndicator";

function toolLabel(name: string): string {
  if (name === "create_ticket") return "Support ticket processed";
  if (name === "get_customer") return "Account verified";
  if (name === "get_ticket") return "Ticket status loaded";
  return "Information retrieved";
}

function Sources({ sources }: { sources: Source[] }) {
  const [open, setOpen] = useState(false);
  if (!sources.length) return null;
  return (
    <div className="sources-panel">
      <button
        type="button"
        className="sources-toggle-btn"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
      >
        <FileText size={12} aria-hidden="true" />
        {sources.length} grounded source{sources.length > 1 ? "s" : ""}
        {open ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
      </button>
      {open && (
        <ul className="sources-list">
          {sources.map((source) => (
            <li
              key={source.chunkId}
              className="source-item"
            >
              <span className="source-name" title={source.source}>
                {source.source.split(/[/\\]/).pop() || source.source}
              </span>
              <span className="source-score">
                {Math.round(source.score * 100)}%
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Tools({ toolCalls }: { toolCalls: ToolCall[] }) {
  if (!toolCalls.length) return null;
  return (
    <div className="tool-badges">
      {toolCalls.map((call, index) => (
        <span
          key={`${call.toolName}-${index}`}
          className="tool-badge"
        >
          {toolLabel(call.toolName)}
        </span>
      ))}
    </div>
  );
}

interface ChatMessageProps {
  message: ChatMessage;
}

export const ChatMessageBubble: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === "user";
  const isError = message.status === "error";

  return (
    <div className={`msg-row${isUser ? " msg-row--user" : ""}`}>
      {!isUser && (
        <div
          className="avatar-circle avatar-circle--mt"
          aria-hidden="true"
        >
          <BotMessageSquare size={15} />
        </div>
      )}
      <div className={`msg-col${isUser ? " msg-col--user" : ""}`}>
        <div
          className={
            isUser
              ? "msg-bubble msg-bubble--user"
              : isError
              ? "msg-bubble msg-bubble--error"
              : "msg-bubble msg-bubble--bot"
          }
        >
          {message.status === "pending" ? (
            <ChatTypingIndicator />
          ) : isUser ? (
            <p className="msg-user-pre">{message.content}</p>
          ) : (
            <ChatMarkdown text={message.content} />
          )}
          {message.toolCalls ? <Tools toolCalls={message.toolCalls} /> : null}
          {message.sources ? <Sources sources={message.sources} /> : null}
        </div>
        {isUser && message.status !== "error" && (
          <Check size={13} className="msg-tick" aria-hidden="true" />
        )}
      </div>
    </div>
  );
};
