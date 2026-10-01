import React from "react";
import { ChatPanel } from "../core/ChatPanel";
import { type EnvStage } from "../../components/EnvBadge";

interface EmbeddedChatbotPanelProps {
  open: boolean;
  onClose: () => void;
  subtitle?: string;
  title?: string;
  envStage?: EnvStage;
  envPulse?: boolean;
}

export const EmbeddedChatbotPanel: React.FC<EmbeddedChatbotPanelProps> = ({
  open,
  onClose,
  subtitle,
  title,
  envStage,
  envPulse = true,
}) => {
  return (
    <>
      <div
        className={`embedded-overlay ${open ? "embedded-overlay--open" : "embedded-overlay--closed"}`}
        hidden={!open}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        id="vps-embedded-chat-panel"
        className={`embedded-panel ${open ? "embedded-panel--open" : "embedded-panel--closed"}`}
        aria-hidden={!open}
      >
        {open && (
          <ChatPanel
            onClose={onClose}
            title={title || "VPS AI Assistant"}
            subtitle={subtitle}
            envStage={envStage}
            envPulse={envPulse}
          />
        )}
      </aside>
    </>
  );
};
