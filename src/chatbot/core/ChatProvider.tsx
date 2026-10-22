import React, { useCallback, useMemo, useRef, useState } from "react";
import { createChatApi, type ChatApiClient } from "../api/chatbot-api";
import type {
  ChatMessage,
  ChatUserContext,
  Suggestion,
} from "../api/chatbot-types";
import { DEFAULT_SUGGESTIONS } from "../config/suggestions";
import { ChatContext, type ChatUiStatus } from "./ChatContext";

export interface ChatProviderProps {
  children: React.ReactNode;
  userContext?: ChatUserContext;
  /** Direct role name prop (e.g. "VPS Admin", "Client User", "Captain") */
  role?: string;
  /** Direct role ID prop for server-side RAG access control */
  roleId?: number;
  /** Direct client experience prop ("web" | "mobile" | "admin") */
  client?: "mobile" | "web" | "admin";
  /** Optional custom welcome message to display as initial assistant response */
  welcomeMessage?: string;
  suggestions?: Suggestion[];
  disableSuggestions?: boolean;
  initialMessage?: string;
  /** Backend or proxy API base URL. Defaults to VITE_API_BASE or origin */
  apiBaseUrl?: string;
  /** Alias for apiBaseUrl */
  apiUrl?: string;
  /** Alias for apiBaseUrl */
  proxyUrl?: string;
  /** Optional custom chat API client */
  api?: ChatApiClient;
  /** If true, hides the "Inspect Sources" toggle and details drawer */
  hideInspectSources?: boolean;
  /** Whether to render grounded sources (default: true) */
  showGroundedSources?: boolean;
}

const DEFAULT_WELCOME_TEXT = `Hello! I am your **VPS Veritas assistant**.

I can help you with:
- **Fuel Quality Testing (FQT)** & **Oil Condition Monitoring (OCM)**
- **Fuel Defect Reporting (FDR)** — report and track bunker defect incidents
- **Bunker Master** — manage bunkering operations, BDN logs, and surveys
- **FSC & FSQ E-Forms** — paperless fuel system checks and bunker sample pre-registration
- **Samplogic** sample logistics, report downloads, and support tickets

Feel free to ask a question or select one of the suggested topics below!`;

function newId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`;
}

function friendlyError(err: unknown): string {
  if (err && typeof err === "object" && "message" in err) {
    const message = String((err as { message: unknown }).message);
    if (message && !/traceback|sql|exception|stack|api[_ ]?key|password/i.test(message)) {
      return message;
    }
  }
  return "I couldn't process that request right now.";
}

export const ChatProvider: React.FC<ChatProviderProps> = ({
  children,
  userContext = {},
  role,
  roleId,
  client: clientChannel,
  welcomeMessage,
  suggestions = DEFAULT_SUGGESTIONS,
  disableSuggestions = false,
  initialMessage,
  apiBaseUrl,
  apiUrl,
  proxyUrl,
  api,
  hideInspectSources = false,
  showGroundedSources = true,
}) => {
  const resolvedBaseUrl = apiBaseUrl ?? apiUrl ?? proxyUrl;
  const client = useMemo(
    () => api ?? createChatApi(resolvedBaseUrl),
    [api, resolvedBaseUrl]
  );

  const effectiveUserContext = useMemo<ChatUserContext>(() => {
    return {
      ...userContext,
      ...(role !== undefined ? { role } : {}),
      ...(roleId !== undefined ? { roleId } : {}),
      ...(clientChannel !== undefined ? { client: clientChannel } : {}),
    };
  }, [userContext, role, roleId, clientChannel]);

  const defaultWelcomeMsg = useMemo<ChatMessage | null>(() => {
    if (welcomeMessage === "") return null;
    return {
      id: "welcome-default",
      role: "assistant",
      content: welcomeMessage || DEFAULT_WELCOME_TEXT,
      createdAt: new Date().toISOString(),
      status: "complete",
    };
  }, [welcomeMessage]);

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    return defaultWelcomeMsg ? [defaultWelcomeMsg] : [];
  });
  const [status, setStatus] = useState<ChatUiStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const lastUserTextRef = useRef<string | null>(null);
  const initialSentRef = useRef(false);

  const ensureSession = useCallback(async (): Promise<string> => {
    if (sessionId) return sessionId;
    setStatus("connecting");
    const created = await client.createSession();
    setSessionId(created.sessionId);
    return created.sessionId;
  }, [sessionId, client]);

  const sendToBackend = useCallback(
    async (text: string) => {
      lastUserTextRef.current = text;
      const userMessage: ChatMessage = {
        id: newId("user"),
        role: "user",
        content: text,
        createdAt: new Date().toISOString(),
        status: "complete",
      };
      const pendingId = newId("asst");
      const pendingAssistant: ChatMessage = {
        id: pendingId,
        role: "assistant",
        content: "",
        createdAt: new Date().toISOString(),
        status: "pending",
        progressText: "Analyzing question & expanding domain terms ",
      };

      setMessages((prev) => [...prev, userMessage, pendingAssistant]);
      setStatus("awaiting");
      setError(null);

      const updateProgress = (stageText: string) => {
        setMessages((prev) =>
          prev.map((message) =>
            message.id === pendingId
              ? { ...message, progressText: stageText }
              : message
          )
        );
      };



      try {
        const currentSession = await ensureSession();
        const response = client.sendMessageStream
          ? await client.sendMessageStream(
            currentSession,
            text,
            {
              roleId: effectiveUserContext.roleId,
              client: effectiveUserContext.client,
            },
            (liveStage) => {

              updateProgress(liveStage);
            }
          )
          : await client.sendMessage(currentSession, text, {
            roleId: effectiveUserContext.roleId,
            client: effectiveUserContext.client,
          });

        setMessages((prev) =>
          prev.map((message) =>
            message.id === pendingId
              ? {
                ...message,
                id: response.requestId || pendingId,
                content: response.answer,
                status: "complete",
                progressText: undefined,
                sources: response.sources,
                toolCalls: response.toolCalls,
                usage: response.usage,
              }
              : message
          )
        );
        setStatus("idle");
      } catch (err) {
        const message = friendlyError(err);
        setMessages((prev) =>
          prev.map((item) =>
            item.id === pendingId
              ? { ...item, content: message, status: "error", progressText: undefined }
              : item
          )
        );
        setError(message);
        setStatus("error");
      }
    },
    [ensureSession, client, effectiveUserContext.client, effectiveUserContext.roleId]
  );

  const sendMessage = useCallback(
    async (raw: string) => {
      const text = raw.trim();
      if (!text || status === "awaiting" || status === "connecting") return;
      await sendToBackend(text);
    },
    [sendToBackend, status]
  );

  const retryLast = useCallback(async () => {
    const last = lastUserTextRef.current;
    if (!last) return;
    setMessages((prev) => prev.filter((message) => message.status !== "error"));
    await sendToBackend(last);
  }, [sendToBackend]);

  const confirmTicket = useCallback(async () => { }, []);
  const cancelTicket = useCallback(() => { }, []);

  const resetConversation = useCallback(async () => {
    if (sessionId) {
      await client.closeSession(sessionId);
    }
    setSessionId(null);
    setMessages(defaultWelcomeMsg ? [defaultWelcomeMsg] : []);
    setStatus("idle");
    setError(null);
    lastUserTextRef.current = null;
  }, [sessionId, client, defaultWelcomeMsg]);

  React.useEffect(() => {
    if (!initialMessage || initialSentRef.current) return;
    initialSentRef.current = true;
    void sendMessage(initialMessage);
  }, [initialMessage, sendMessage]);

  const value = useMemo(
    () => ({
      messages,
      status,
      error,
      sessionId,
      pendingTicket: null,
      ticketBusy: false,
      lastTicket: null,
      suggestions,
      showSuggestions:
        !disableSuggestions &&
        (messages.length === 0 ||
          (messages.length === 1 && messages[0].id === "welcome-default")),
      suggestionBadgesEnabled: !disableSuggestions,
      userContext: effectiveUserContext,
      apiBaseUrl: client.apiBaseUrl,
      hideInspectSources,
      showGroundedSources,
      sendMessage,
      retryLast,
      confirmTicket,
      cancelTicket,
      resetConversation,
    }),
    [
      messages,
      status,
      error,
      sessionId,
      suggestions,
      disableSuggestions,
      effectiveUserContext,
      client.apiBaseUrl,
      hideInspectSources,
      showGroundedSources,
      sendMessage,
      retryLast,
      confirmTicket,
      cancelTicket,
      resetConversation,
    ]
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
