import React from "react";
import { useChatbot } from "../hooks/useChatbot";
import { ChatError } from "./ChatError";
import { ChatHeader } from "./ChatHeader";
import { ChatInput } from "./ChatInput";
import { ChatMessageList } from "./ChatMessageList";
import { ChatTicketConfirmation } from "./ChatTicketConfirmation";
import { cn } from "../../lib/cn";
import { type EnvStage } from "../../components/EnvBadge";

interface ChatPanelProps {
  className?: string;
  onClose?: () => void;
  showMinimize?: boolean;
  title?: string;
  subtitle?: string;
  /** Environment badge stage. Omit for production. */
  envStage?: EnvStage;
  envPulse?: boolean;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({
  className,
  onClose,
  showMinimize,
  title,
  subtitle,
  envStage,
  envPulse = true,
}) => {
  const { sendMessage, status, error, resetConversation, retryLast, pendingTicket } =
    useChatbot();
  const inputDisabled =
    status === "awaiting" || status === "connecting" || Boolean(pendingTicket);

  return (
    <section
      className={cn(
        "flex h-full min-h-0 flex-col overflow-hidden bg-card",
        className
      )}
      aria-label="VPS AI Assistant"
    >
      <ChatHeader
        title={title}
        subtitle={subtitle}
        onClose={onClose}
        onReset={() => void resetConversation()}
        showMinimize={showMinimize}
        envStage={envStage}
        envPulse={envPulse}
      />
      <div className="relative min-h-0 flex-1">
        <ChatMessageList />
      </div>
      {error && status === "error" && (
        <ChatError message={error} onRetry={() => void retryLast()} />
      )}
      <ChatTicketConfirmation />
      <ChatInput
        onSend={(text) => void sendMessage(text)}
        disabled={inputDisabled}
      />
    </section>
  );
};
