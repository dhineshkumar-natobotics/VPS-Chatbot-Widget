import React from "react";
import { MessageSquare, X } from "lucide-react";

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
      className="widget-trigger-btn"
    >
      {open ? <X size={22} /> : <MessageSquare size={24} />}
    </button>
  );
};
