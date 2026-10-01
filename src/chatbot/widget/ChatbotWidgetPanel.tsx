import React from "react";
import { ChatPanel } from "../core/ChatPanel";
import { type EnvStage } from "../../components/EnvBadge";

interface ChatbotWidgetPanelProps {
  open: boolean;
  onClose: () => void;
  envStage?: EnvStage;
  envPulse?: boolean;
}

export const ChatbotWidgetPanel: React.FC<ChatbotWidgetPanelProps> = ({
  open,
  onClose,
  envStage,
  envPulse = true,
}) => {
  if (!open) return null;

  return (
    <div
      id="vps-chatbot-widget-panel"
      className="widget-panel"
    >
      <ChatPanel
        onClose={onClose}
        showMinimize
        title="VPS AI Assistant"
        envStage={envStage}
        envPulse={envPulse}
      />
    </div>
  );
};
