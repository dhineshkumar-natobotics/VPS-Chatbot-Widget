import React, { useEffect, useRef } from "react";
import { Bot, BotMessageSquare } from "lucide-react";
import { Message } from "../types/chat";
import { MessageItem } from "./MessageItem";
import { ConnectingStatus } from "./ConnectingStatus";
import { AgentSummaryCard } from "./AgentSummaryCard";
import { FeedbackRatingCard } from "./FeedbackRatingCard";
import { QuickOption } from "./QuickPrompts";
import { TypingProgressBar } from "./TypingProgressBar";

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  isConnectingAgent?: boolean;
  connectingLabel?: string;
  isChatClosed?: boolean;
  showFeedbackCard?: boolean;
  agentName?: string;
  agentInitials?: string;
  chatDuration?: string;
  isBot?: boolean;
  onSelectPrompt?: (prompt: string) => void;
  welcomeQuickOptions?: QuickOption[];
  onSubmitFeedback?: (rating: string, reasons: string) => void;
  onCancelFeedback?: () => void;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  isLoading,
  isConnectingAgent = false,
  connectingLabel = "Connecting with agent",
  isChatClosed = false,
  showFeedbackCard = false,
  agentName = "Fikri Studio",
  agentInitials = "FIK",
  chatDuration = "12 Mins 23 Sec",
  isBot = false,
  onSelectPrompt,
  welcomeQuickOptions,
  onSubmitFeedback,
  onCancelFeedback,
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading, isConnectingAgent, isChatClosed, showFeedbackCard]);

  return (
    // Wrapper makes the scroll area + progress bar stack correctly
    <div className="messages-scroll-outer">
      <div className="messages-scroll-area">
        {/* If no messages yet, display default bot greeting card */}
        {messages.length === 0 && (
          <div className="message-item-row row-assistant">
            <div className="msg-avatar-assistant">
              <BotMessageSquare size={15} />
            </div>
            <div className="msg-content-wrapper">
              <div className="msg-bubble bubble-assistant">
                <p className="msg-para">
                  Hey ! I'm a VPS Veritas AI Assistant. Ask me anything or share your feedback or select an option below.
                </p>
                {welcomeQuickOptions && welcomeQuickOptions.length > 0 && onSelectPrompt && (
                  <div style={{ marginTop: "12px" }}>
                    {welcomeQuickOptions.map((opt, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className="quick-option-pill-btn"
                        onClick={() => onSelectPrompt(opt.query)}
                      >
                        <span>{opt.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Render Conversation Messages */}
        {messages.map((msg, idx) => (
          <MessageItem
            key={msg.id || idx}
            message={msg}
            agentInitials={agentInitials}
            isBot={isBot}
            onSelectPrompt={onSelectPrompt}
            quickOptions={idx === 0 && isBot ? welcomeQuickOptions : undefined}
          />
        ))}

        {/* Animated Connecting Status Ring Spinner */}
        {isConnectingAgent && <ConnectingStatus label={connectingLabel} />}

        {/* Three-dot typing bubble (kept for backward compat but hidden when progress bar shows) */}
        {isLoading && (
          <div className="message-item-row row-assistant">
            <div className="msg-avatar-assistant">
              {isBot ? <BotMessageSquare size={15} /> : <span>{agentInitials}</span>}
            </div>
            <div className="msg-content-wrapper">
              <div className="msg-bubble bubble-assistant typing-bubble-wrapper">
                <span className="dot-pulse" />
                <span className="dot-pulse" />
                <span className="dot-pulse" />
              </div>
            </div>
          </div>
        )}

        {/* Concluded Session Elements (Screen 3) */}
        {isChatClosed && (
          <div className="chat-closed-pill-wrapper">
            <span className="chat-closed-pill">Chat Closed</span>
          </div>
        )}

        {showFeedbackCard && (
          <>
            <AgentSummaryCard
              agentName={agentName}
              agentInitials={agentInitials}
              duration={chatDuration}
            />
            <FeedbackRatingCard
              onSubmitFeedback={onSubmitFeedback}
              onCancel={onCancelFeedback}
            />
          </>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ── Bottom-docked animated progress bar ── */}
      <TypingProgressBar isVisible={isLoading} />
    </div>
  );
};
