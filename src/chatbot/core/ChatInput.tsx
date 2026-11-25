import React, { useEffect, useId, useImperativeHandle, useMemo, useRef, useState } from "react";
import { ArrowUp, Square } from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "../../components/ui/input-group";
import { useRestoreInputFocus } from "./ChatHeader";
import { ChatSuggestions, filterSuggestions } from "./ChatSuggestions";
import { useChatbot } from "../hooks/useChatbot";
import type { Suggestion } from "../api/chatbot-types";

interface ChatInputProps {
  onSend: (message: string) => void;
  onStop?: () => void;
  disabled?: boolean;
  placeholder?: string;
  ref?: React.Ref<ChatInputHandle>;
}

export interface ChatInputHandle {
  edit: (text: string) => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSend,
  onStop,
  disabled = false,
  placeholder = "Ask something…",
  ref,
}) => {
  const { suggestions, showSuggestions, suggestionBadgesEnabled, models, selectedModelId, selectModel } = useChatbot();
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const inputId = useId();
  const modelPickerId = useId();
  const resize = (element?: HTMLTextAreaElement | null) => {
    if (!element) return;
    element.style.height = "auto";
    element.style.height = `${Math.min(element.scrollHeight, 96)}px`;
  };

  useRestoreInputFocus(disabled, textareaRef);

  useImperativeHandle(ref, () => ({
    edit(nextText) {
      if (disabled) return;
      setText(nextText);
      textareaRef.current?.focus();
    },
  }), [disabled]);

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
  };

  return (
    <div className="chat-input-wrapper">
      <ChatSuggestions
        variant="badge"
        suggestions={visibleSuggestions}
        onSelect={applySuggestion}
        disabled={disabled}
      />
      <form onSubmit={(event) => {
        event.preventDefault();
        send();
      }}>
        <label htmlFor={inputId} className="sr-only">Chat message</label>
        <InputGroup>
          <InputGroupTextarea
            id={inputId}
            ref={textareaRef}
            rows={1}
            value={text}
            disabled={disabled}
            placeholder={placeholder}
            onChange={(event) => setText(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
                event.preventDefault();
                event.currentTarget.form?.requestSubmit();
              }
            }}
          />
          <InputGroupAddon>
            {models.length > 1 && (
              <div className="chat-model-picker">
                <label htmlFor={modelPickerId} className="sr-only">AI model</label>
                <select id={modelPickerId} value={selectedModelId} disabled={disabled}
                  onChange={(event) => selectModel(event.target.value)}>
                  <option value="auto">Automatic</option>
                  {models.map((model) => (
                    <option key={model.id} value={model.id} disabled={!model.configured}>{model.label}</option>
                  ))}
                </select>
              </div>
            )}
            {onStop ? (
              <InputGroupButton onClick={onStop} aria-label="Stop response" title="Stop response">
                <Square size={13} fill="currentColor" aria-hidden="true" />
              </InputGroupButton>
            ) : (
              <InputGroupButton type="submit" disabled={disabled || !text.trim()} aria-label="Send message" title="Send message">
                <ArrowUp size={16} aria-hidden="true" />
              </InputGroupButton>
            )}
          </InputGroupAddon>
        </InputGroup>
      </form>
      <p className="chat-input-footer">
        <span className="chat-input-note">AI can make mistakes.</span>
        Powered by <span className="chat-input-footer-brand">VPS Veritas AI</span>
      </p>
    </div>
  );
};
