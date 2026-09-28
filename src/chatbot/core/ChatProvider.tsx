import React, { useCallback, useMemo, useRef, useState } from "react";
import { chatApi } from "../api/chatbot-api";
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
  suggestions?: Suggestion[];
  disableSuggestions?: boolean;
  initialMessage?: string;
}

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
  suggestions = DEFAULT_SUGGESTIONS,
  disableSuggestions = false,
  initialMessage,
}) => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [status, setStatus] = useState<ChatUiStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const lastUserTextRef = useRef<string | null>(null);
  const initialSentRef = useRef(false);

  const ensureSession = useCallback(async (): Promise<string> => {
    if (sessionId) return sessionId;
    setStatus("connecting");
    const created = await chatApi.createSession();
    setSessionId(created.sessionId);
    return created.sessionId;
  }, [sessionId]);

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
      };

      setMessages((prev) => [...prev, userMessage, pendingAssistant]);
      setStatus("awaiting");
      setError(null);

      try {
        const currentSession = await ensureSession();
        const response = await chatApi.sendMessage(currentSession, text);
        setMessages((prev) =>
          prev.map((message) =>
            message.id === pendingId
              ? {
                  ...message,
                  id: response.requestId || pendingId,
                  content: response.answer,
                  status: "complete",
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
              ? { ...item, content: message, status: "error" }
              : item
          )
        );
        setError(message);
        setStatus("error");
      }
    },
    [ensureSession]
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

  const confirmTicket = useCallback(async () => {}, []);
  const cancelTicket = useCallback(() => {}, []);

  const resetConversation = useCallback(async () => {
    if (sessionId) {
      await chatApi.closeSession(sessionId);
    }
    setSessionId(null);
    setMessages([]);
    setStatus("idle");
    setError(null);
    lastUserTextRef.current = null;
  }, [sessionId]);

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
      showSuggestions: !disableSuggestions && messages.length === 0,
      suggestionBadgesEnabled: !disableSuggestions,
      userContext,
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
      userContext,
      sendMessage,
      retryLast,
      confirmTicket,
      cancelTicket,
      resetConversation,
    ]
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
