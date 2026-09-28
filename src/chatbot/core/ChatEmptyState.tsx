import React from "react";
import { Bot, BotMessageSquare } from "lucide-react";

export const ChatEmptyState: React.FC = () => {
  return (
    <div className="flex items-start gap-2.5">
      <div
        className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground"
        aria-hidden="true"
      >
        <BotMessageSquare size={15} />
      </div>
      <div className="max-w-[82%] rounded-2xl rounded-tl-sm border border-border bg-[var(--bubble-assistant-bg)] px-3.5 py-2.5 text-[13.5px] leading-[1.55] text-foreground">
        <p>
          Hello — I am the VPS Veritas assistant. Ask about reports, sample status,
          registration, or support, or choose a question below the text box.
        </p>
      </div>
    </div>
  );
};
