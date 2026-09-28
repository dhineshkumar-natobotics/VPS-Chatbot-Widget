import React from "react";
import { cn } from "../../lib/cn";

export const ChatTypingIndicator: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div
      className={cn("flex items-center gap-1 py-0.5", className)}
      role="status"
      aria-label="Assistant is preparing a reply"
    >
      <span className="h-1.5 w-1.5 rounded-full bg-[var(--text-subtle)] motion-safe:animate-pulse" />
      <span className="h-1.5 w-1.5 rounded-full bg-[var(--text-subtle)] motion-safe:animate-pulse [animation-delay:150ms]" />
      <span className="h-1.5 w-1.5 rounded-full bg-[var(--text-subtle)] motion-safe:animate-pulse [animation-delay:300ms]" />
    </div>
  );
};
