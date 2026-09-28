import React from "react";
import { ArrowLeft, Clock, RefreshCw, Minus, Bot } from "lucide-react";
import { EnvBadge, EnvStage } from "./EnvBadge";

export type HeaderMode = "bot" | "agent" | "ended";

interface ChatHeaderProps {
  headerMode?: HeaderMode;
  ticketId?: string;
  subtitle?: string;
  duration?: string;
  agentInitials?: string;
  onBack?: () => void;
  onReset?: () => void;
  onClose?: () => void;
  isFloating?: boolean;
  /** Environment stage badge — omit for production */
  envStage?: EnvStage;
  /** Whether the status dot inside the badge pulses. Default: true */
  envPulse?: boolean;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  headerMode = "bot",
  ticketId = "#TC-192",
  subtitle = "Help, I order wrong product",
  duration = "2:02",
  agentInitials = "FIK",
  onBack,
  onReset,
  onClose,
  isFloating,
  envStage,
  envPulse = true,
}) => {
  return (
    <div className="chat-header">
      <div className="chat-header-left">
        <button
          className="header-back-btn"
          onClick={onBack}
          title="Go back"
          aria-label="Back"
        >
          <ArrowLeft size={18} />
        </button>

        {headerMode === "bot" ? (
          <div className="header-title-container">
            <div className="header-title-row">
              <h1 className="header-title-main">Chat Bot</h1>
              {/* ── Env badge lives right next to the title ── */}
              <EnvBadge stage={envStage} pulse={envPulse} />
            </div>
          </div>
        ) : (
          <div className="header-title-container">
            <div className="header-title-row">
              <div className="header-ticket-title">{ticketId}</div>
              {/* ── Env badge next to ticket id ── */}
              <EnvBadge stage={envStage} pulse={envPulse} />
            </div>
            <div className="header-ticket-subtitle">{subtitle}</div>
          </div>
        )}
      </div>

      <div className="chat-header-right">
        {headerMode === "agent" && (
          <div className="header-timer-badge">
            <Clock size={13} />
            <span>{duration}</span>
          </div>
        )}

        {headerMode === "ended" && (
          <div className="header-ended-badge">
            <Clock size={13} />
            <span>Ended</span>
          </div>
        )}

        {/* Dual Avatars Badge */}
        <div className="header-avatar-badge-group">
          {headerMode === "bot" ? (
            <>
              <div className="header-avatar-bot">
                <Bot size={14} />
              </div>
              <div className="header-avatar-user-overlap">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                  alt="User"
                  className="header-avatar-img"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>
            </>
          ) : (
            <>
              <div className="header-avatar-agent-tag">{agentInitials}</div>
              <div className="header-avatar-user-overlap">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                  alt="Agent"
                  className="header-avatar-img"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>
            </>
          )}
        </div>

        {onReset && (
          <button
            className="header-icon-action-btn"
            onClick={onReset}
            title="Start New Conversation"
            aria-label="New Session"
          >
            <RefreshCw size={15} />
          </button>
        )}

        {isFloating && onClose && (
          <button
            className="header-icon-action-btn"
            onClick={onClose}
            title="Minimize"
            aria-label="Minimize"
          >
            <Minus size={15} />
          </button>
        )}
      </div>
    </div>
  );
};
