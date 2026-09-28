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
    <div className="bg-card px-4 pb-3 pt-2">
      <ChatSuggestions
        variant="badge"
        suggestions={visibleSuggestions}
        onSelect={applySuggestion}
        disabled={disabled}
      />
      <label htmlFor="vps-chat-input" className="sr-only">
        Chat message
      </label>
      <div className="flex items-end gap-2 rounded-xl bg-[var(--input-bg)] px-2.5 py-1.5">
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
          className="max-h-24 flex-1 resize-none bg-transparent py-1.5 text-[13.5px] text-foreground outline-none placeholder:text-[var(--text-subtle)] disabled:opacity-60"
        />
        <button
          type="button"
          onClick={send}
          disabled={disabled || !text.trim()}
          aria-label="Send message"
          className="mb-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-action text-action-foreground hover:bg-[var(--action-hover)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ArrowUp size={16} />
        </button>
      </div>
      <p className="mt-2 text-center text-[11px] font-medium text-[var(--text-subtle)]">
        Powered by <span className="text-primary font-bold hover:underline cursor-pointer">VPS Veritas AI</span>
      </p>
    </div>
  );
};
