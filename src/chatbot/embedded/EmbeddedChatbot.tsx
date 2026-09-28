import React, { useState } from "react";
import { EmbeddedChatbotPanel } from "./EmbeddedChatbotPanel";
import { EmbeddedChatbotTrigger } from "./EmbeddedChatbotTrigger";
import { type EnvStage } from "../../components/EnvBadge";

interface EmbeddedChatbotProps {
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  showTrigger?: boolean;
  /** Environment badge stage. Omit for production. */
  envStage?: EnvStage;
  envPulse?: boolean;
}

export const EmbeddedChatbot: React.FC<EmbeddedChatbotProps> = ({
  defaultOpen = false,
  open,
  onOpenChange,
  showTrigger = true,
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
      {showTrigger && !isOpen && (
        <EmbeddedChatbotTrigger onOpen={() => setOpen(true)} />
      )}
      <EmbeddedChatbotPanel
        open={isOpen}
        onClose={() => setOpen(false)}
        envStage={envStage}
        envPulse={envPulse}
      />
    </>
  );
};
