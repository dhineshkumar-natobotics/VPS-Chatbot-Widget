import React from "react";
import { Suggestion as SuggestionButton, Suggestions } from "../../components/ai-elements/suggestion";
import type { Suggestion } from "../api/chatbot-types";

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

  return (
    <Suggestions className={variant === "badge" ? "chat-suggestion-strip" : "suggestions-list"}
      role="list" aria-label="Suggested questions">
      {suggestions.map((item) => (
        <div key={item.query} role="listitem">
          <SuggestionButton
            suggestion={item.query}
            disabled={disabled}
            onClick={() => onSelect(item)}
            title={item.query}
          >
            {item.label}
          </SuggestionButton>
        </div>
      ))}
    </Suggestions>
  );
};
