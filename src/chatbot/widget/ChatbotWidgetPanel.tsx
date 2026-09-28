import React from "react";
import { ChatPanel } from "../core/ChatPanel";
import { cn } from "../../lib/cn";
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
      className={cn(
        "fixed bottom-[98px] right-7 z-[999] flex h-[min(660px,calc(100vh-120px))] w-[min(420px,calc(100vw-32px))] flex-col overflow-hidden rounded-[20px] border border-border bg-card",
        "shadow-[0_20px_40px_-15px_rgba(0,0,0,0.12)]",
        "origin-bottom-right animate-[chat-pop_180ms_ease-out] motion-reduce:animate-none"
      )}
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
