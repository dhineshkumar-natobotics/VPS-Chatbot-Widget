import React, { useEffect, useMemo, useRef, useState } from "react";
import { ArrowUp } from "lucide-react";
import { useRestoreInputFocus } from "./ChatHeader";
import { ChatSuggestions, filterSuggestions } from "./ChatSuggestions";
import { useChatbot } from "../hooks/useChatbot";
import type { Suggestion } from "../api/chatbot-types";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSend,
  disabled = false,
  placeholder = "Ask something…",
}) => {
  const { suggestions, showSuggestions, suggestionBadgesEnabled } = useChatbot();
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const resize = (element?: HTMLTextAreaElement | null) => {
    if (!element) return;
    element.style.height = "auto";
    element.style.height = `${Math.min(element.scrollHeight, 96)}px`;
  };

  useRestoreInputFocus(disabled, textareaRef);

  useEffect(() => {
    resize(textareaRef.current);
  }, [text]);

  const visibleSuggestions = useMemo(() => {
    if (!suggestionBadgesEnabled || disabled) return [];
    const typed = text.trim();
    if (!typed) return showSuggestions ? suggestions : [];
    return filterSuggestions(suggestions, typed);
  }, [disabled, showSuggestions, suggestionBadgesEnabled, suggestions, text]);

  const applySuggestion = (suggestion: Suggestion) => {
    setText(suggestion.query);
    const input = textareaRef.current;
    input?.focus();
  };

  const send = () => {
    const value = text.trim();
    if (!value || disabled) return;
    onSend(value);
    setText("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  return (
    <div className="chat-input-wrapper">
      <ChatSuggestions
        variant="badge"
        suggestions={visibleSuggestions}
        onSelect={applySuggestion}
        disabled={disabled}
      />
      <label htmlFor="vps-chat-input" className="sr-only">
        Chat message
      </label>
      <div className="chat-input-row">
        <textarea
          id="vps-chat-input"
          ref={textareaRef}
          rows={1}
          value={text}
          disabled={disabled}
          placeholder={placeholder}
          onChange={(event) => {
            setText(event.target.value);
            resize(event.target);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              send();
            }
          }}
          className="chat-textarea"
        />
        <button
          type="button"
          onClick={send}
          disabled={disabled || !text.trim()}
          aria-label="Send message"
          className="chat-send-btn"
        >
          <ArrowUp size={16} />
        </button>
      </div>
      <p className="chat-input-footer">
        Powered by <span className="chat-input-footer-brand">VPS Veritas AI</span>
      </p>
    </div>
  );
};
