import type {
  ApiErrorDto,
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
  createSession(): Promise<SessionCreated>;
  sendMessage(sessionId: string, message: string): Promise<{
    requestId: string;
    sessionId: string;
    answer: string;
    sources: Source[];
    toolCalls: ToolCall[];
    usage: TokenUsage;
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
    async createSession(): Promise<SessionCreated> {
      const dto = await request<SessionResponseDto>("/api/v1/sessions", {
        method: "POST",
        body: JSON.stringify({}),
      });
      return { sessionId: dto.session_id, createdAt: dto.created_at };
    },

    async sendMessage(sessionId: string, message: string) {
      const dto = await request<ChatResponseDto>(
        `/api/v1/sessions/${sessionId}/messages`,
        {
          method: "POST",
          body: JSON.stringify({ message }),
        }
      );
      return {
        requestId: dto.request_id,
        sessionId: dto.session_id,
        answer: dto.answer,
        sources: (dto.sources || []).map(normalizeSource),
        toolCalls: (dto.tool_calls || []).map(normalizeToolCall),
        usage: normalizeUsage(dto.usage),
      };
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

