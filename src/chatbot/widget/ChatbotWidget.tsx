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
  /** Direct role name (e.g. "VPS Admin", "Client User", "Captain") */
  role?: string;
  /** Direct role ID for server-side RAG access control */
  roleId?: number;
  /** Direct client experience ("web" | "mobile" | "admin") */
  client?: "mobile" | "web" | "admin";
  /** Optional custom initial welcome message */
  welcomeMessage?: string;
  /** Backend or proxy API base URL */
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
  /** If true, hides the "Inspect Sources" toggle button and drawer in grounded sources */
  hideInspectSources?: boolean;
  /** Whether to show grounded sources (default: true) */
  showGroundedSources?: boolean;
}

const ChatbotWidgetView: React.FC<Omit<
  ChatbotWidgetProps,
  "apiBaseUrl" | "apiUrl" | "proxyUrl" | "userContext" | "suggestions" | "disableSuggestions" | "initialMessage" | "hideInspectSources" | "showGroundedSources"
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
  role,
  roleId,
  client,
  welcomeMessage,
  suggestions,
  disableSuggestions,
  initialMessage,
  hideInspectSources,
  showGroundedSources,
  ...viewProps
}) => {
  const existingContext = useOptionalChatContext();
  const explicitUrl = apiBaseUrl ?? apiUrl ?? proxyUrl;

  const canReuseContext =
    Boolean(existingContext) &&
    (!explicitUrl || resolveApiBaseUrl(explicitUrl) === resolveApiBaseUrl(existingContext?.apiBaseUrl)) &&
    !userContext &&
    role === undefined &&
    roleId === undefined &&
    client === undefined &&
    welcomeMessage === undefined &&
    !suggestions &&
    disableSuggestions === undefined &&
    !initialMessage &&
    hideInspectSources === undefined &&
    showGroundedSources === undefined;

  if (canReuseContext) {
    return <ChatbotWidgetView {...viewProps} />;
  }

  return (
    <ChatProvider
      apiBaseUrl={explicitUrl}
      userContext={userContext}
      role={role}
      roleId={roleId}
      client={client}
      welcomeMessage={welcomeMessage}
      suggestions={suggestions}
      disableSuggestions={disableSuggestions}
      initialMessage={initialMessage}
      hideInspectSources={hideInspectSources}
      showGroundedSources={showGroundedSources}
    >
      <ChatbotWidgetView {...viewProps} />
    </ChatProvider>
  );
};

