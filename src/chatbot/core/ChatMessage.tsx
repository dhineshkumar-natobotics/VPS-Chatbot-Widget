import React from "react";
import { Check, BotMessageSquare } from "lucide-react";
import type { ChatMessage, ToolCall } from "../api/chatbot-types";
import { ChatMarkdown } from "./ChatMarkdown";
import { ChatTypingIndicator } from "./ChatTypingIndicator";
import { AgentReasoning } from "./AgentReasoning";
import { GroundedSources } from "./GroundedSources";

import { useOptionalChatContext } from "./ChatContext";

function toolLabel(name: string): string {
  if (name === "create_ticket") return "Support ticket processed";
  if (name === "get_customer") return "Account verified";
  if (name === "get_ticket") return "Ticket status loaded";
  return "Information retrieved";
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
  const chatCtx = useOptionalChatContext();
  const hideInspectSources = chatCtx?.hideInspectSources ?? false;
  const showGroundedSources = chatCtx?.showGroundedSources ?? true;

  const isUser = message.role === "user";
  const isError = message.status === "error";
  const isPending = message.status === "pending";
  const isWelcome =
    message.id === "welcome-default" ||
    message.id.startsWith("welcome") ||
    message.id === "welcome";

  // Show response timing only for actual assistant replies and live requests.
  const isRealAssistantQuery = Boolean(
    isPending ||
    message.durationMs !== undefined ||
    (message.sources && message.sources.length > 0) ||
    (message.toolCalls && message.toolCalls.length > 0) ||
    message.usage
  );
  const showReasoning = !isUser && !isError && !isWelcome && isRealAssistantQuery;

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
          {/* Show progress and elapsed time without exposing internal model reasoning. */}
          {showReasoning && (
            <AgentReasoning
              status={isPending ? "pending" : "complete"}
              progressText={message.progressText}
              durationMs={message.durationMs}
            />
          )}

          {isPending ? (
            message.content ? (
              <div className="msg-content-wrapper msg-content-wrapper--streaming">
                {/* Avoid reparsing the full Markdown document on every token frame. */}
                <div className="msg-streaming-text">{message.content}</div>
              </div>
            ) : (
              <ChatTypingIndicator />
            )
          ) : isUser ? (
            <p className="msg-user-pre">{message.content}</p>
          ) : (
            <div className="msg-content-wrapper">
              <ChatMarkdown text={message.content} />
            </div>
          )}

          {message.toolCalls ? <Tools toolCalls={message.toolCalls} /> : null}
          {!isUser && !isPending && !isError && showGroundedSources && message.sources?.length ? (
            <GroundedSources sources={message.sources} hideInspectSources={hideInspectSources} />
          ) : null}
        </div>
        {isUser && message.status !== "error" && (
          <Check size={13} className="msg-tick" aria-hidden="true" />
        )}
      </div>
    </div>
  );
};
