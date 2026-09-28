import React, { useEffect, useRef } from "react";
import { ArrowLeft, Bot, Minus, RefreshCw } from "lucide-react";
import ChatbotIcon from "../../../Chatbot.svg";
import { EnvBadge, type EnvStage } from "../../components/EnvBadge";

interface ChatHeaderProps {
  title?: string;
  subtitle?: string;
  onClose?: () => void;
  onReset?: () => void;
  onBack?: () => void;
  showMinimize?: boolean;
  /** Environment badge stage shown in the header. Omit for production. */
  envStage?: EnvStage;
  /** Whether the status dot pulses. Default: true */
  envPulse?: boolean;
}
const SVGComponent = (props: React.SVGProps<SVGSVGElement> & { width?: string; height?: string , Color?: string}) => (
  <svg
    width={props.width || "24px"}
    height={props.height || "24px"}
    viewBox="0 0 24 24"
    role="img"
    xmlns="http://www.w3.org/2000/svg"
    fill={props.Color || "currentColor"}
    {...props}
  >
    <path d="M11.999 0c-2.25 0-4.5.06-6.6.21a5.57 5.57 0 0 0-5.19 5.1c-.24 3.21-.27 6.39-.06 9.6a5.644 5.644 0 0 0 5.7 5.19h3.15v-3.9h-3.15c-.93.03-1.74-.63-1.83-1.56-.18-3-.15-6 .06-9 .06-.84.72-1.47 1.56-1.53 2.04-.15 4.2-.21 6.36-.21s4.32.09 6.36.18c.81.06 1.5.69 1.56 1.53.24 3 .24 6 .06 9-.12.93-.9 1.62-1.83 1.59h-3.15l-6 3.9V24l6-3.9h3.15c2.97.03 5.46-2.25 5.7-5.19.21-3.18.18-6.39-.03-9.57a5.57 5.57 0 0 0-5.19-5.1c-2.13-.18-4.38-.24-6.63-.24zm-5.04 8.76c-.36 0-.66.3-.66.66v2.34c0 .33.18.63.48.78 1.62.78 3.42 1.2 5.22 1.26 1.8-.06 3.6-.48 5.22-1.26.3-.15.48-.45.48-.78V9.42c0-.09-.03-.15-.09-.21a.648.648 0 0 0-.87-.36c-1.5.66-3.12 1.02-4.77 1.05-1.65-.03-3.27-.42-4.77-1.08a.566.566 0 0 0-.24-.06z" />
  </svg>
);
export default SVGComponent;

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  title = "VPS AI Assistant",
  subtitle = "Customer portal support",
  onClose,
  onReset,
  onBack,
  showMinimize = false,
  envStage,
  envPulse = true,
}) => {
  return (
    <header className="flex items-center justify-between border-b border-border bg-card px-5 py-4">
      <div className="flex items-center gap-3">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-muted text-muted-foreground hover:bg-[var(--grey-100)]"
            aria-label="Back"
          >
            <ArrowLeft size={16} />
          </button>
        )}
        <div
          className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground"
          aria-hidden="true"
        >
          <SVGComponent width="16px" height="16px" Color="white" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <h2 className="text-[16px] font-bold tracking-tight text-foreground">
              {title}
            </h2>
            {/* ── Env badge inline with title ── */}
            <EnvBadge stage={envStage} pulse={envPulse} />
          </div>
          <p className="text-[12px] text-muted-foreground font-medium text-[var(--text-subtle)]">{subtitle || "Customer portal support"}</p>
        </div>
      </div>
      <div className="flex items-center gap-1">
        {onReset && (
          <button
            type="button"
            onClick={onReset}
            className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--text-subtle)] hover:bg-muted hover:text-foreground"
            aria-label="Start a new conversation"
            title="New conversation"
          >
            <RefreshCw size={15} />
          </button>
        )}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--text-subtle)] hover:bg-muted hover:text-foreground"
            aria-label={showMinimize ? "Minimize chat" : "Close chat"}
          >
            <Minus size={16} />
          </button>
        )}
      </div>
    </header>
  );
};

export function useRestoreInputFocus(disabled: boolean, inputRef: React.RefObject<HTMLTextAreaElement | null>) {
  const wasDisabled = useRef(disabled);
  useEffect(() => {
    if (wasDisabled.current && !disabled) {
      inputRef.current?.focus();
    }
    wasDisabled.current = disabled;
  }, [disabled, inputRef]);
}
