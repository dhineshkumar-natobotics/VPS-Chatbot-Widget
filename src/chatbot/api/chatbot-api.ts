import type {
  ApiErrorDto,
  ChatAccessContext,
  ChatApiError,
  ChatMessage,
  ChatMessageDto,
  ChatResponseDto,
  SessionCreated,
  SessionMessagesResponseDto,
  SessionResponseDto,
  Source,
  SourceDto,
  Ticket,
  ToolCall,
  ToolCallDto,
  TokenUsage,
  TokenUsageDto,
  ModelCatalog,
} from "./chatbot-types";

export function resolveApiBaseUrl(customUrl?: string): string {
  if (customUrl !== undefined && customUrl !== null && customUrl.trim() !== "") {
    return customUrl.trim().replace(/\/+$/, "");
  }
  const envUrl =
    typeof import.meta !== "undefined" && import.meta?.env
      ? (import.meta.env.VITE_API_BASE ??
         import.meta.env.VITE_API_BASE_URL ??
         import.meta.env.VITE_API_URL ??
         "")
      : "";
  return String(envUrl).trim().replace(/\/+$/, "");
}

export function buildApiUrl(baseUrl: string | undefined, path: string): string {
  const base = resolveApiBaseUrl(baseUrl);
  if (!base) {
    return path;
  }

  // Handle case where base ends with /api and path starts with /api/
  if (base.endsWith("/api") && path.startsWith("/api/")) {
    return `${base}${path.slice(4)}`;
  }

  // Handle /health endpoint when base ends with /api
  // FastApi serves /health at root level (not /api/health)
  if (base.endsWith("/api") && path === "/health") {
    const root = base.slice(0, -4);
    return root ? `${root}/health` : "/health";
  }

  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${cleanPath}`;
}

function unwrapData<T>(payload: unknown): T {
  if (
    payload &&
    typeof payload === "object" &&
    "data" in payload &&
    (payload as { success?: boolean }).success !== false
  ) {
    return (payload as { data: T }).data;
  }
  return payload as T;
}

function parseApiError(payload: unknown, fallback: string, status: number): ChatApiError {
  const dto = payload as ApiErrorDto | undefined;
  const message = dto?.error?.message;
  if (message && !looksInternal(message)) {
    return {
      code: dto?.error?.code,
      message,
      requestId: dto?.error?.request_id,
    };
  }
  if (status >= 500) {
    return { message: "I couldn't process that request right now." };
  }
  if (status === 0) {
    return { message: "Something went wrong while connecting. Please try again." };
  }
  return { message: fallback };
}

function looksInternal(message: string): boolean {
  return /traceback|sql|exception|stack|api[_ ]?key|password/i.test(message);
}

export function normalizeSource(dto: SourceDto): Source {
  return {
    chunkId: dto.chunk_id,
    source: dto.source,
    score: dto.score,
    title: dto.title,
    snippet: dto.snippet,
  };
}

export function normalizeToolCall(dto: ToolCallDto): ToolCall {
  return {
    toolName: dto.tool_name,
    arguments: dto.arguments ?? {},
    result: dto.result ?? {},
  };
}

export function normalizeUsage(dto: TokenUsageDto): TokenUsage {
  return {
    model: dto.model,
    promptTokens: dto.prompt_tokens,
    completionTokens: dto.completion_tokens,
    totalTokens: dto.total_tokens,
  };
}

export function normalizeChatMessage(dto: ChatMessageDto): ChatMessage {
  const role = dto.role === "user" || dto.role === "system" ? dto.role : "assistant";
  return {
    id: String(dto.id),
    role,
    content: dto.content,
    createdAt: dto.created_at || new Date().toISOString(),
    status: "complete",
    usage: dto.model
      ? {
          model: dto.model,
          promptTokens: dto.prompt_tokens || 0,
          completionTokens: dto.completion_tokens || 0,
          totalTokens: (dto.prompt_tokens || 0) + (dto.completion_tokens || 0),
        }
      : undefined,
  };
}

async function readJson(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return {};
  }
}

export interface ChatApiClient {
  apiBaseUrl: string;
  listModels?(): Promise<ModelCatalog | null>;
  createSession(signal?: AbortSignal): Promise<SessionCreated>;
  sendMessage(sessionId: string, message: string, access?: ChatAccessContext, signal?: AbortSignal): Promise<{
    requestId: string;
    sessionId: string;
    answer: string;
    sources: Source[];
    toolCalls: ToolCall[];
    usage: TokenUsage;
    durationMs?: number;
  }>;
  sendMessageStream?(
    sessionId: string,
    message: string,
    access?: ChatAccessContext,
    onProgress?: (stage: string) => void,
    onToken?: (token: string) => void,
    signal?: AbortSignal
  ): Promise<{
    requestId: string;
    sessionId: string;
    answer: string;
    sources: Source[];
    toolCalls: ToolCall[];
    usage: TokenUsage;
    durationMs?: number;
  }>;
  getHistory(sessionId: string): Promise<ChatMessage[]>;
  closeSession(sessionId: string): Promise<void>;
  createTicket(): Promise<Ticket>;
  checkHealth(): Promise<boolean>;
}

export function createChatApi(initialBaseUrl?: string): ChatApiClient {
  const baseUrl = resolveApiBaseUrl(initialBaseUrl);

  async function request<T>(path: string, init?: RequestInit): Promise<T> {
    let response: Response;
    const url = buildApiUrl(baseUrl, path);
    try {
      response = await fetch(url, {
        ...init,
        headers: {
          "Content-Type": "application/json",
          ...(init?.headers ?? {}),
        },
      });
    } catch {
      throw { message: "Something went wrong while connecting. Please try again." } satisfies ChatApiError;
    }

    if (response.status === 204) {
      return undefined as T;
    }

    const payload = await readJson(response);
    if (!response.ok) {
      throw parseApiError(
        payload,
        "I couldn't process that request right now.",
        response.status
      );
    }
    return unwrapData<T>(payload);
  }

  return {
    apiBaseUrl: baseUrl,
    async listModels() {
      try {
        const dto = await request<{ default_model_id: string; complex_model_id?: string | null; models: ModelCatalog["models"] }>("/api/v1/models");
        return { defaultModelId: dto.default_model_id, complexModelId: dto.complex_model_id, models: dto.models || [] };
      } catch {
        return null; // Existing proxies can keep their original chat API contract.
      }
    },
    async createSession(signal?: AbortSignal): Promise<SessionCreated> {
      const dto = await request<SessionResponseDto>("/api/v1/sessions", {
        method: "POST",
        signal,
        body: JSON.stringify({}),
      });
      return { sessionId: dto.session_id, createdAt: dto.created_at };
    },

    async sendMessage(sessionId: string, message: string, access?: ChatAccessContext, signal?: AbortSignal) {
      const dto = await request<ChatResponseDto>(
        `/api/v1/sessions/${sessionId}/messages`,
        {
          method: "POST",
          signal,
          body: JSON.stringify({
            message,
            ...(access?.roleId !== undefined ? { role_id: access.roleId } : {}),
            ...(access?.client ? { client: access.client } : {}),
            ...(access?.modelId ? { model_id: access.modelId } : {}),
          }),
        }
      );
      return {
        requestId: dto.request_id,
        sessionId: dto.session_id,
        answer: dto.answer,
        sources: (dto.sources || []).map(normalizeSource),
        toolCalls: (dto.tool_calls || []).map(normalizeToolCall),
        usage: normalizeUsage(dto.usage),
        durationMs: dto.duration_ms,
      };
    },

    async sendMessageStream(
      sessionId: string,
      message: string,
      access?: ChatAccessContext,
      onProgress?: (stage: string) => void,
      onToken?: (token: string) => void,
      signal?: AbortSignal
    ) {
      const url = buildApiUrl(baseUrl, `/api/v1/sessions/${sessionId}/messages/stream`);
      try {
        const response = await fetch(url, {
          method: "POST",
          signal,
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message,
            ...(access?.roleId !== undefined ? { role_id: access.roleId } : {}),
            ...(access?.client ? { client: access.client } : {}),
            ...(access?.modelId ? { model_id: access.modelId } : {}),
          }),
        });

        if (!response.ok) {
          if (response.status === 404 || response.status === 405) {
            return await this.sendMessage(sessionId, message, access, signal);
          }
          const payload = await readJson(response);
          throw parseApiError(
            payload,
            "I couldn't process that request right now.",
            response.status
          );
        }
        if (!response.body || response.headers?.get("content-type")?.includes("application/json")) {
          // Some existing proxies return the completed JSON contract. Consume
          // that response directly; replaying this POST could duplicate a turn.
          const dto = unwrapData<ChatResponseDto>(await readJson(response));
          if (typeof dto.answer !== "string" || !dto.usage) {
            throw { message: "The response stream ended unexpectedly." } satisfies ChatApiError;
          }
          return {
            requestId: dto.request_id, sessionId: dto.session_id, answer: dto.answer,
            sources: (dto.sources || []).map(normalizeSource),
            toolCalls: (dto.tool_calls || []).map(normalizeToolCall),
            usage: normalizeUsage(dto.usage), durationMs: dto.duration_ms,
          };
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        type StreamResult = {
          requestId: string;
          sessionId: string;
          answer: string;
          sources: Source[];
          toolCalls: ToolCall[];
          usage: TokenUsage;
          durationMs?: number;
        };
        const finalResult: { value: StreamResult | null } = { value: null };

        const processFrame = (frame: string) => {
          const dataLine = frame
            .split(/\r?\n/)
            .filter((line) => line.startsWith("data:"))
            .map((line) => line.slice(5).trimStart()).join("\n");
          if (!dataLine) return;

          let data: {
            type?: string;
            stage?: string;
            text?: string;
            request_id?: string;
            session_id?: string;
            answer?: string;
            sources?: SourceDto[];
            tool_calls?: ToolCallDto[];
            usage?: TokenUsageDto;
            duration_ms?: number;
            message?: string;
          } = {};
          try {
            const parsed: unknown = JSON.parse(dataLine);
            if (!parsed || typeof parsed !== "object") return;
            data = parsed as typeof data;
          } catch {
            return;
          }

          if (data.type === "progress" && typeof data.stage === "string") {
            onProgress?.(data.stage);
          } else if (data.type === "token" && typeof data.text === "string") {
            onToken?.(data.text);
          } else if (data.type === "complete") {
            finalResult.value = {
              requestId: data.request_id || "",
              sessionId: data.session_id || sessionId,
              answer: data.answer || "",
              sources: (data.sources || []).map(normalizeSource),
              toolCalls: (data.tool_calls || []).map(normalizeToolCall),
              usage: data.usage
                ? normalizeUsage(data.usage)
                : { model: "", promptTokens: 0, completionTokens: 0, totalTokens: 0 },
              durationMs: data.duration_ms,
            };
          } else if (data.type === "error") {
            throw {
              message: data.message || "I couldn't process that request right now.",
              requestId: data.request_id,
            } satisfies ChatApiError;
          }
        };

        try {
          while (!finalResult.value) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            if (buffer.length > 1_000_000) {
              throw { message: "The response stream was too large." } satisfies ChatApiError;
            }
            const frames = buffer.split(/\r?\n\r?\n/);
            buffer = frames.pop() || "";
            for (const frame of frames) {
              processFrame(frame);
              if (finalResult.value) break;
            }
          }
          buffer += decoder.decode();
          if (!finalResult.value && buffer.trim()) processFrame(buffer);
        } finally {
          await reader.cancel().catch(() => {});
          reader.releaseLock();
        }

        const completedResult = finalResult.value;
        if (completedResult) {
          return completedResult;
        }
        throw { message: "The response stream ended before the answer was complete." } satisfies ChatApiError;
      } catch (error) {
        if (
          !(error instanceof Error) &&
          error &&
          typeof error === "object" &&
          "message" in error
        ) {
          throw error;
        }
        throw { message: "Something went wrong while connecting. Please try again." } satisfies ChatApiError;
      }
    },

    async getHistory(sessionId: string): Promise<ChatMessage[]> {
      try {
        const dto = await request<SessionMessagesResponseDto>(
          `/api/v1/sessions/${sessionId}/messages`
        );
        return (dto.messages || []).map(normalizeChatMessage);
      } catch {
        return [];
      }
    },

    async closeSession(sessionId: string): Promise<void> {
      try {
        await request(`/api/v1/sessions/${sessionId}`, { method: "DELETE" });
      } catch {
        // Closing is best-effort; a missing session should not block a new chat.
      }
    },

    async createTicket(): Promise<Ticket> {
      throw new Error("Ticket creation has been removed.");
    },

    async checkHealth(): Promise<boolean> {
      try {
        const url = buildApiUrl(baseUrl, "/health");
        const response = await fetch(url);
        return response.ok;
      } catch {
        return false;
      }
    },
  };
}

export const chatApi: ChatApiClient = createChatApi();

