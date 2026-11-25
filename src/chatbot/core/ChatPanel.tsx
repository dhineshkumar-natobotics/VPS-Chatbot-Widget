import React, { useRef } from "react";
import { Marker, MarkerContent } from "../../components/ui/marker";
import { useChatbot } from "../hooks/useChatbot";
import { ChatError } from "./ChatError";
import { ChatHeader } from "./ChatHeader";
import { ChatInput, type ChatInputHandle } from "./ChatInput";
import { ChatMessageList } from "./ChatMessageList";
import { ChatTicketConfirmation } from "./ChatTicketConfirmation";
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
  const { messages, sendMessage, stopResponse, status, error, resetConversation, retryLast, pendingTicket, soundEnabled, toggleSound } =
    useChatbot();
  const composerRef = useRef<ChatInputHandle>(null);
  const responding = status === "awaiting" || status === "connecting";
  const latestMessage = messages[messages.length - 1];
  const progressText = responding
    ? latestMessage?.progressText
    : latestMessage?.status === "stopped" ? "Response stopped" : undefined;

  return (
    <section
      className={`chat-panel${className ? ` ${className}` : ""}`}
      aria-label="VPS AI Assistant"
    >
      <ChatHeader
        title={title}
        subtitle={subtitle}
        onClose={onClose}
        onReset={() => void resetConversation()}
        showMinimize={showMinimize}
        soundEnabled={soundEnabled}
        onToggleSound={toggleSound}
        envStage={envStage}
        envPulse={envPulse}
      />
      <div className="chat-panel-body">
        <ChatMessageList onEdit={(text) => composerRef.current?.edit(text)} />
      </div>
      <Marker className="sr-only" role="status">
        <MarkerContent>{progressText}</MarkerContent>
      </Marker>
      {error && status === "error" && (
        <ChatError message={error} onRetry={() => void retryLast()} />
      )}
      <ChatTicketConfirmation />
      <ChatInput
        ref={composerRef}
        onSend={(text) => void sendMessage(text)}
        onStop={responding ? stopResponse : undefined}
        disabled={responding || Boolean(pendingTicket)}
      />
    </section>
  );
};
