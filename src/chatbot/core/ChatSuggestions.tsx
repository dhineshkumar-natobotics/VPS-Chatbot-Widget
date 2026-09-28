import React from "react";
import type { Suggestion } from "../api/chatbot-types";
import { cn } from "../../lib/cn";

export function filterSuggestions(suggestions: Suggestion[], text: string): Suggestion[] {
  const query = text.trim().toLowerCase();
  if (!query) return suggestions;
  return suggestions.filter(
    (item) =>
      item.label.toLowerCase().includes(query) || item.query.toLowerCase().includes(query)
  );
}

interface ChatSuggestionsProps {
  suggestions: Suggestion[];
  onSelect: (suggestion: Suggestion) => void;
  disabled?: boolean;
  variant?: "list" | "badge";
}

export const ChatSuggestions: React.FC<ChatSuggestionsProps> = ({
  suggestions,
  onSelect,
  disabled,
  variant = "list",
}) => {
  if (!suggestions.length) return null;

  if (variant === "badge") {
    return (
      <ul
        className="mb-2 flex flex-wrap gap-1.5"
        aria-label="Suggested questions"
      >
        {suggestions.map((item) => (
          <li key={item.query} className="max-w-full">
            <button
              type="button"
              disabled={disabled}
              onClick={() => onSelect(item)}
              title={item.query}
              className={cn(
                "max-w-full truncate rounded-full border border-border bg-card px-2.5 py-1 text-left text-[11.5px] font-semibold text-foreground",
                "hover:border-primary hover:bg-[var(--tint-solus-10)] hover:text-primary",
                "disabled:cursor-not-allowed disabled:opacity-50"
              )}
            >
              {item.label}
            </button>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className="mt-3 flex flex-col gap-2">
      {suggestions.map((item) => (
        <button
          key={item.query}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(item)}
          className="rounded-lg border border-border bg-card px-3.5 py-2.5 text-left text-[13px] font-semibold text-foreground shadow-[0_1px_3px_rgba(0,0,0,0.02)] transition hover:-translate-y-px hover:border-vps-light-grey hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
        >
          {item.label}
        </button>
      ))}
    </div>
  );
};
