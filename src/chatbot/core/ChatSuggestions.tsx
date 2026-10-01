import React from "react";
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

  if (variant === "badge") {
    return (
      <ul
        className="suggestions-badge-list"
        aria-label="Suggested questions"
      >
        {suggestions.map((item) => (
          <li key={item.query} className="suggestion-badge-item">
            <button
              type="button"
              disabled={disabled}
              onClick={() => onSelect(item)}
              title={item.query}
              className="suggestion-badge-btn"
            >
              {item.label}
            </button>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className="suggestions-list">
      {suggestions.map((item) => (
        <button
          key={item.query}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(item)}
          className="suggestion-list-btn"
        >
          {item.label}
        </button>
      ))}
    </div>
  );
};
