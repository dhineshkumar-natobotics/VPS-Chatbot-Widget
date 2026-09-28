import React from "react";
import { ChatPanel } from "../core/ChatPanel";
import { cn } from "../../lib/cn";
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
        className={cn(
          "fixed inset-0 z-[90] bg-[var(--overlay)] sm:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
          "transition-opacity duration-200 motion-reduce:transition-none"
        )}
        hidden={!open}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        id="vps-embedded-chat-panel"
        className={cn(
          "fixed inset-y-0 right-0 z-[100] flex w-full max-w-[440px] flex-col border-l border-border bg-card shadow-xl",
          "transition-transform duration-300 ease-out motion-reduce:transition-none",
          open ? "translate-x-0" : "translate-x-full"
        )}
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
