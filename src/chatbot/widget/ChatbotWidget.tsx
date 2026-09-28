import React, { useState } from "react";
import { ChatbotWidgetPanel } from "./ChatbotWidgetPanel";
import { ChatbotWidgetTrigger } from "./ChatbotWidgetTrigger";
import { type EnvStage } from "../../components/EnvBadge";
import { useOptionalChatContext } from "../core/ChatContext";
import { ChatProvider } from "../core/ChatProvider";
import type { ChatUserContext, Suggestion } from "../api/chatbot-types";
import { resolveApiBaseUrl } from "../api/chatbot-api";


export interface ChatbotWidgetProps {
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Environment badge stage. Omit for production. */
  envStage?: EnvStage;
  envPulse?: boolean;
  /** Backend or proxy API base URL (e.g. "https://vpsai.onrender.com" or "/api") */
  apiBaseUrl?: string;
  /** Alias for apiBaseUrl */
  apiUrl?: string;
  /** Alias for apiBaseUrl */
  proxyUrl?: string;
  /** Optional user context passed to ChatProvider */
  userContext?: ChatUserContext;
  /** Optional custom suggestions */
  suggestions?: Suggestion[];
  /** Disable prompt suggestions */
  disableSuggestions?: boolean;
  /** Initial welcome message to trigger on mount */
  initialMessage?: string;
}

const ChatbotWidgetView: React.FC<Omit<
  ChatbotWidgetProps,
  "apiBaseUrl" | "apiUrl" | "proxyUrl" | "userContext" | "suggestions" | "disableSuggestions" | "initialMessage"
>> = ({
  defaultOpen = false,
  open,
  onOpenChange,
  envStage,
  envPulse = true,
}) => {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const isOpen = open ?? uncontrolledOpen;

  const setOpen = (next: boolean) => {
    onOpenChange?.(next);
    if (open === undefined) {
      setUncontrolledOpen(next);
    }
  };

  return (
    <>
      <ChatbotWidgetPanel
        open={isOpen}
        onClose={() => setOpen(false)}
        envStage={envStage}
        envPulse={envPulse}
      />
      <ChatbotWidgetTrigger open={isOpen} onToggle={() => setOpen(!isOpen)} />
    </>
  );
};

export const ChatbotWidget: React.FC<ChatbotWidgetProps> = ({
  apiBaseUrl,
  apiUrl,
  proxyUrl,
  userContext,
  suggestions,
  disableSuggestions,
  initialMessage,
  ...viewProps
}) => {
  const existingContext = useOptionalChatContext();
  const explicitUrl = apiBaseUrl ?? apiUrl ?? proxyUrl;

  // If already inside ChatProvider and no conflicting apiBaseUrl or userContext override is passed, reuse context
  const canReuseContext =
    Boolean(existingContext) &&
    (!explicitUrl || resolveApiBaseUrl(explicitUrl) === resolveApiBaseUrl(existingContext?.apiBaseUrl)) &&
    !userContext &&
    !suggestions &&
    disableSuggestions === undefined &&
    !initialMessage;

  if (canReuseContext) {
    return <ChatbotWidgetView {...viewProps} />;
  }

  return (
    <ChatProvider
      apiBaseUrl={explicitUrl}
      userContext={userContext}
      suggestions={suggestions}
      disableSuggestions={disableSuggestions}
      initialMessage={initialMessage}
    >
      <ChatbotWidgetView {...viewProps} />
    </ChatProvider>
  );
};

