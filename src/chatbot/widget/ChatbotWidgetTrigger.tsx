import React from "react";
import { MessageSquare, X } from "lucide-react";
import { cn } from "../../lib/cn";

interface ChatbotWidgetTriggerProps {
  open: boolean;
  onToggle: () => void;
}

export const ChatbotWidgetTrigger: React.FC<ChatbotWidgetTriggerProps> = ({
  open,
  onToggle,
}) => {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      aria-controls="vps-chatbot-widget-panel"
      aria-label={open ? "Close assistant" : "Open assistant"}
      className={cn(
        "fixed bottom-7 right-7 z-[1000] flex h-[58px] w-[58px] items-center justify-center rounded-xl text-primary-foreground",
        "bg-primary hover:bg-[var(--primary-hover)]",
        "shadow-md",
        "transition duration-200 motion-reduce:transition-none motion-reduce:hover:scale-100",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
      )}
    >
      {open ? <X size={22} /> : <MessageSquare size={24} />}
    </button>
  );
};
