import React, { useState } from "react";
import { Bot, Check, ChevronDown, ChevronUp, FileText , BotMessageSquare} from "lucide-react";
import type { ChatMessage, Source, ToolCall } from "../api/chatbot-types";
import { cn } from "../../lib/cn";
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
    <div className="mt-2 border-t border-border pt-1.5">
      <button
        type="button"
        className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-muted-foreground hover:text-foreground"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
      >
        <FileText size={12} aria-hidden="true" />
        {sources.length} grounded source{sources.length > 1 ? "s" : ""}
        {open ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
      </button>
      {open && (
        <ul className="mt-1.5 space-y-1">
          {sources.map((source) => (
            <li
              key={source.chunkId}
              className="flex items-center justify-between rounded-md border border-border bg-muted px-2 py-1 text-[11px] text-muted-foreground"
            >
              <span className="truncate" title={source.source}>
                {source.source.split(/[/\\]/).pop() || source.source}
              </span>
              <span className="ml-2 font-semibold text-success">
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
    <div className="mt-2 flex flex-wrap gap-1.5">
      {toolCalls.map((call, index) => (
        <span
          key={`${call.toolName}-${index}`}
          className="inline-flex items-center rounded-full border border-border bg-muted px-2 py-0.5 text-[11px] text-muted-foreground"
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
    <div
      className={cn("flex items-start gap-2.5", isUser && "flex-row-reverse")}
    >
      {!isUser && (
        <div
          className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground"
          aria-hidden="true"
        >
          <BotMessageSquare size={15} />
        </div>
      )}
      <div className={cn("flex max-w-[82%] flex-col", isUser && "items-end")}>
        <div
          className={cn(
            "rounded-2xl px-3.5 py-2.5 text-[13.5px] leading-[1.55]",
            isUser && "rounded-tr-sm bg-[var(--bubble-user-bg)] text-[var(--bubble-user-text)] font-medium",
            !isUser &&
              !isError &&
              "rounded-tl-sm border border-border bg-[var(--bubble-bot-message-bg)] text-foreground",
            isError &&
              "rounded-tl-sm border border-[var(--error-border)] bg-[var(--error-bg)] text-[var(--error-text)]"
          )}
        >
          {message.status === "pending" ? (
            <ChatTypingIndicator />
          ) : isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <ChatMarkdown text={message.content} />
          )}
          {message.toolCalls ? <Tools toolCalls={message.toolCalls} /> : null}
          {message.sources ? <Sources sources={message.sources} /> : null}
        </div>
        {isUser && message.status !== "error" && (
          <Check size={13} className="mt-1 text-success" aria-hidden="true" />
        )}
      </div>
    </div>
  );
};
