import React from "react";
import { BotMessageSquare, Check, Pencil } from "lucide-react";
import { Bubble, BubbleContent } from "../../components/ui/bubble";
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageFooter,
  MessageHeader,
} from "../../components/ui/message";
import type { ChatMessage } from "../api/chatbot-types";
import { ChatMessageActions } from "./ChatMessageActions";
import { ChatMarkdown } from "./ChatMarkdown";
import { AgentReasoning } from "./AgentReasoning";
import { GroundedSources } from "./GroundedSources";

import { useOptionalChatContext } from "./ChatContext";

interface ChatMessageProps {
  message: ChatMessage;
  onEdit?: (text: string) => void;
}

export const ChatMessageBubble: React.FC<ChatMessageProps> = ({ message, onEdit }) => {
  const chatCtx = useOptionalChatContext();
  const hideInspectSources = chatCtx?.hideInspectSources ?? false;
  const showGroundedSources = chatCtx?.showGroundedSources ?? false;

  const isUser = message.role === "user";
  const isError = message.status === "error";
  const isPending = message.status === "pending";
  const isStopped = message.status === "stopped";
  const isWelcome = message.id.startsWith("welcome");
  const isAssistantReply = message.role === "assistant" && !isWelcome && !isError;
  const showActivity = isAssistantReply && (
    isPending || isStopped || message.durationMs !== undefined ||
    Boolean(message.progressSteps?.length || message.sources?.length || message.toolCalls?.length || message.usage)
  );
  const showActions = isAssistantReply && !isPending && !isStopped && message.content.trim().length > 0;

  return (
    <Message align={isUser ? "end" : "start"}>
      {message.role === "assistant" && (
        <MessageAvatar className="avatar-circle" aria-hidden="true">
          <BotMessageSquare size={15} />
        </MessageAvatar>
      )}
      <MessageContent>
        {showActivity && (
          <MessageHeader>
            <AgentReasoning
              status={isPending ? "pending" : isStopped ? "stopped" : "complete"}
              progressText={message.progressText}
              progressSteps={message.progressSteps}
              durationMs={message.durationMs}
              toolCalls={message.toolCalls}
            />
          </MessageHeader>
        )}
        {isUser ? (
          <Bubble align="end">
            <BubbleContent className="msg-user-pre">{message.content}</BubbleContent>
          </Bubble>
        ) : isWelcome || isError ? (
          <Bubble variant={isError ? "destructive" : "muted"}>
            <BubbleContent>
              <ChatMarkdown text={message.content} />
            </BubbleContent>
          </Bubble>
        ) : message.content && (
          <div className="chat-message-body">
            <ChatMarkdown
              text={message.content}
              streaming={isPending}
              sources={isAssistantReply && !isPending && !isStopped && !hideInspectSources ? message.sources : undefined}
            />
            {isAssistantReply && !isPending && !isStopped && showGroundedSources && message.sources?.length ? (
              <GroundedSources sources={message.sources} hideInspectSources={hideInspectSources} />
            ) : null}
          </div>
        )}
        {showActions && chatCtx && (
          <MessageFooter>
            <ChatMessageActions message={message} onFeedback={chatCtx.toggleMessageFeedback} />
          </MessageFooter>
        )}
        {isUser && !isError && (
          <MessageFooter>
            {onEdit && (
              <button
                type="button"
                className="chat-message-action"
                aria-label="Edit message"
                title="Edit message"
                disabled={chatCtx?.status === "awaiting" || chatCtx?.status === "connecting" || Boolean(chatCtx?.pendingTicket)}
                onClick={() => onEdit(message.content)}
              >
                <Pencil size={14} aria-hidden="true" />
              </button>
            )}
            <Check size={13} className="msg-tick" aria-hidden="true" />
          </MessageFooter>
        )}
      </MessageContent>
    </Message>
  );
};
