import React, { useCallback, useMemo, useRef, useState } from "react";
import { createChatApi, type ChatApiClient } from "../api/chatbot-api";
import type {
  ChatMessage,
  ChatUserContext,
  Suggestion,
  ModelOption,
} from "../api/chatbot-types";
import { DEFAULT_SUGGESTIONS } from "../config/suggestions";
import { useResponseSound } from "../hooks/useResponseSound";
import { ChatContext, type ChatContextValue, type ChatUiStatus } from "./ChatContext";

type RenderTiming = {
  messageId: string;
  startedAt: number;
  firstTokenAt?: number;
  firstCommitRecorded?: boolean;
  completedAt?: number;
};

function measureChat(name: string, start: number, end: number, requestId?: string) {
  if (typeof performance.measure !== "function") return;
  const entry = `vps-chatbot:${name}`;
  performance.clearMeasures(entry);
  performance.measure(entry, { start, end, detail: requestId ? { requestId } : null });
}

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
  /** Hide inline previews and the source list's inspection controls. */
  hideInspectSources?: boolean;
  /** Whether to render grounded sources (default: false) */
  showGroundedSources?: boolean;
  /** Configured model alias, or auto for server-side routing. */
  modelId?: string;
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
  showGroundedSources = false,
  modelId = "auto",
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
  const activeRequest = useRef<AbortController | null>(null);
  const renderTiming = useRef<RenderTiming | null>(null);
  const busyRef = useRef(false);
  const [models, setModels] = useState<ModelOption[]>([]);
  const [selectedModelId, setSelectedModelId] = useState(modelId);
  const { soundEnabled, toggleSound, prepareSound, playSound } = useResponseSound();

  React.useEffect(() => setSelectedModelId(modelId), [modelId]);
  React.useEffect(() => {
    let active = true;
    setModels([]);
    void client.listModels?.().then((catalog) => {
      if (active) setModels(catalog?.models || []);
    }).catch(() => {});
    return () => { active = false; };
  }, [client]);

  const selectModel = useCallback((next: string) => {
    if (!busyRef.current && (next === "auto" || models.some((m) => m.id === next && m.configured))) {
      setSelectedModelId(next);
    }
  }, [models]);

  React.useEffect(() => () => activeRequest.current?.abort(), []);

  React.useLayoutEffect(() => {
    const timing = renderTiming.current;
    if (!timing) return;
    const assistant = messages.find((message) => message.id === timing.messageId);
    const committedAt = performance.now();
    if (assistant?.status === "complete" && timing.completedAt !== undefined) {
      measureChat("completion-to-commit", timing.completedAt, committedAt);
      measureChat("submit-to-complete-commit", timing.startedAt, committedAt);
      renderTiming.current = null;
    } else if (assistant?.status === "pending" && assistant.content
               && timing.firstTokenAt !== undefined && !timing.firstCommitRecorded) {
      measureChat("first-token-to-commit", timing.firstTokenAt, committedAt);
      timing.firstCommitRecorded = true;
    }
  }, [messages]);

  const ensureSession = useCallback(async (signal: AbortSignal): Promise<string> => {
    if (sessionId) return sessionId;
    setStatus("connecting");
    const created = await client.createSession(signal);
    if (signal.aborted) throw new DOMException("Aborted", "AbortError");
    setSessionId(created.sessionId);
    return created.sessionId;
  }, [sessionId, client]);

  const sendToBackend = useCallback(
    async (text: string) => {
      if (busyRef.current) return;
      prepareSound();
      busyRef.current = true;
      const controller = new AbortController();
      activeRequest.current = controller;
      let frame: number | undefined;
      let pendingText = "";
      const cancelFrame = () => {
        if (frame !== undefined) cancelAnimationFrame(frame);
        frame = undefined;
      };
      lastUserTextRef.current = text;
      const userMessage: ChatMessage = {
        id: newId("user"),
        role: "user",
        content: text,
        createdAt: new Date().toISOString(),
        status: "complete",
      };
      const pendingId = newId("asst");
      const initialProgress = "Preparing your answer…";
      const pendingAssistant: ChatMessage = {
        id: pendingId,
        streamId: pendingId,
        role: "assistant",
        content: "",
        createdAt: new Date().toISOString(),
        status: "pending",
        progressText: initialProgress,
        progressSteps: [initialProgress],
      };
      const requestStartedAt = performance.now();
      const timing: RenderTiming = { messageId: pendingId, startedAt: requestStartedAt };
      renderTiming.current = timing;

      setMessages((prev) => [...prev, userMessage, pendingAssistant]);
      setStatus("awaiting");
      setError(null);

      const updateProgress = (stageText: string) => {
        const stage = stageText.trim();
        if (!stage || controller.signal.aborted) return;
        setMessages((prev) =>
          prev.map((message) =>
            message.id === pendingId && message.progressText !== stage
              ? {
                  ...message,
                  progressText: stage,
                  progressSteps: [...(message.progressSteps ?? []), stage],
                }
              : message
          )
        );
      };

      try {
        const currentSession = await ensureSession(controller.signal);
        const apiStartedAt = performance.now();
        measureChat("request-preparation", requestStartedAt, apiStartedAt);
        const response = client.sendMessageStream
          ? await client.sendMessageStream(
            currentSession,
            text,
            {
              roleId: effectiveUserContext.roleId,
              client: effectiveUserContext.client,
              modelId: selectedModelId,
            },
            updateProgress,
            (token) => {
              if (controller.signal.aborted) return;
              if (token && timing.firstTokenAt === undefined) {
                timing.firstTokenAt = performance.now();
                measureChat("first-token-received", apiStartedAt, timing.firstTokenAt);
              }
              pendingText += token;
              if (frame === undefined) frame = requestAnimationFrame(() => {
                frame = undefined;
                if (!controller.signal.aborted) setMessages((prev) => prev.map((message) =>
                  message.id === pendingId ? { ...message, content: pendingText } : message));
              });
            },
            controller.signal
          )
          : await client.sendMessage(currentSession, text, {
            roleId: effectiveUserContext.roleId,
            client: effectiveUserContext.client,
            modelId: selectedModelId,
          }, controller.signal);

        cancelFrame();
        if (controller.signal.aborted) return;

        timing.messageId = response.requestId || pendingId;
        timing.completedAt = performance.now();
        measureChat("completion-received", apiStartedAt, timing.completedAt, response.requestId);
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
                durationMs: Math.max(
                  Math.round(performance.now() - requestStartedAt),
                  response.durationMs ?? 0
                ),
              }
              : message
          )
        );
        setStatus("idle");
        playSound();
      } catch (err) {
        cancelFrame();
        if (renderTiming.current === timing) renderTiming.current = null;
        if (controller.signal.aborted) return;
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
      } finally {
        cancelFrame();
        if (activeRequest.current === controller) {
          activeRequest.current = null;
          busyRef.current = false;
        }
      }
    },
    [ensureSession, client, effectiveUserContext.client, effectiveUserContext.roleId, selectedModelId, prepareSound, playSound]
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
    if (busyRef.current) return;
    const last = lastUserTextRef.current;
    if (!last) return;
    setMessages((prev) => prev.filter((message) => message.status !== "error"));
    await sendToBackend(last);
  }, [sendToBackend]);

  const stopResponse = useCallback(() => {
    const controller = activeRequest.current;
    if (!controller) return;
    controller.abort();
    activeRequest.current = null;
    busyRef.current = false;
    renderTiming.current = null;
    setMessages((current) => current.map((message) =>
      message.status === "pending"
        ? { ...message, status: "stopped", progressText: undefined }
        : message
    ));
    setStatus("idle");
  }, []);

  const toggleMessageFeedback = useCallback<ChatContextValue["toggleMessageFeedback"]>(
    (messageId, feedback) => {
      setMessages((previous) => previous.map((message) =>
        message.id === messageId
          ? { ...message, feedback: message.feedback === feedback ? undefined : feedback }
          : message
      ));
    },
    []
  );

  const confirmTicket = useCallback(async () => { }, []);
  const cancelTicket = useCallback(() => { }, []);

  const resetConversation = useCallback(async () => {
    activeRequest.current?.abort();
    activeRequest.current = null;
    busyRef.current = false;
    setSessionId(null);
    setMessages(defaultWelcomeMsg ? [defaultWelcomeMsg] : []);
    setStatus("idle");
    setError(null);
    lastUserTextRef.current = null;
    if (sessionId) await client.closeSession(sessionId);
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
      soundEnabled,
      toggleSound,
      sendMessage,
      stopResponse,
      toggleMessageFeedback,
      retryLast,
      confirmTicket,
      cancelTicket,
      resetConversation,
      models,
      selectedModelId,
      selectModel,
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
      soundEnabled,
      toggleSound,
      sendMessage,
      stopResponse,
      toggleMessageFeedback,
      retryLast,
      confirmTicket,
      cancelTicket,
      resetConversation,
      models,
      selectedModelId,
      selectModel,
    ]
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
