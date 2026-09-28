import React, { useState, useRef } from "react";
import { Smile, Paperclip, AlertTriangle } from "lucide-react";
import { detectGibberish } from "../lib/gibberishDetector";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  poweredByText?: string;
}

/** Default message shown when gibberish is detected */
const GIBBERISH_WARNING =
  "It looks like that might not be a readable message. Please type a clear question or request so I can help you properly. 😊";

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  disabled = false,
  placeholder = "Type message",
  poweredByText = "Powered by kirridesk",
}) => {
  const [text, setText] = useState("");
  const [warning, setWarning] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (!text.trim() || disabled) return;

    const { isGibberish, reason } = detectGibberish(text.trim());

    if (isGibberish) {
      // Show inline warning — do NOT call onSendMessage (saves AI tokens)
      setWarning(GIBBERISH_WARNING);
      console.info("[ChatInput] Gibberish blocked:", reason);
      return;
    }

    setWarning(null);
    onSendMessage(text.trim());
    setText("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    // Clear warning as soon as the user starts editing
    if (warning) setWarning(null);
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 100)}px`;
  };

  return (
    <div className="chat-input-wrapper">
      {/* Gibberish / unreadable input warning banner */}
      {warning && (
        <div className="chat-input-warning" role="alert" aria-live="polite">
          <AlertTriangle size={14} className="chat-input-warning-icon" />
          <span>{warning}</span>
        </div>
      )}

      <div className="chat-input-box">
        {/* Emoji trigger */}
        <button
          type="button"
          className="input-icon-btn"
          title="Insert emoji"
          aria-label="Emoji"
        >
          <Smile size={18} />
        </button>

        {/* Attachment trigger */}
        <button
          type="button"
          className="input-icon-btn"
          title="Attach file"
          aria-label="Attach file"
        >
          <Paperclip size={18} />
        </button>

        {/* Text Input */}
        <textarea
          ref={textareaRef}
          className={`chat-textarea${warning ? " chat-textarea--warn" : ""}`}
          value={text}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          aria-label="Chat message input"
        />

        {/* Send Button */}
        <button
          type="button"
          className="chat-send-btn"
          onClick={handleSend}
          disabled={disabled || !text.trim()}
          title="Send message (Enter)"
        >
          Send
        </button>
      </div>

      {/* Footer Branding */}
      <div className="chat-powered-by">
        <span>{poweredByText}</span>
      </div>
    </div>
  );
};
