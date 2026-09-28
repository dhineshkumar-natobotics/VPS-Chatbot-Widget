import React, { useState } from "react";
import { ChatbotWidgetPanel } from "./ChatbotWidgetPanel";
import { ChatbotWidgetTrigger } from "./ChatbotWidgetTrigger";
import { type EnvStage } from "../../components/EnvBadge";

interface ChatbotWidgetProps {
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Environment badge stage. Omit for production. */
  envStage?: EnvStage;
  envPulse?: boolean;
}

export const ChatbotWidget: React.FC<ChatbotWidgetProps> = ({
  defaultOpen = false,
  open,
  onOpenChange,
  envStage,
  envPulse = true,
}) => {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const isOpen = open ?? uncontrolledOpen;

  const setOpen = (next: boolean) => {
    onOpenChange?.(next);
    if (open === undefined) {
      setUncontrolledOpen(next);
    }
  };

  return (
    <>
      <ChatbotWidgetPanel
        open={isOpen}
        onClose={() => setOpen(false)}
        envStage={envStage}
        envPulse={envPulse}
      />
      <ChatbotWidgetTrigger open={isOpen} onToggle={() => setOpen(!isOpen)} />
    </>
  );
};
