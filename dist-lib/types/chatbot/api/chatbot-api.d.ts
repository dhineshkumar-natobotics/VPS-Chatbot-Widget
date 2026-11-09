import type { ChatAccessContext, ChatMessage, ChatMessageDto, SessionCreated, Source, SourceDto, Ticket, ToolCall, ToolCallDto, TokenUsage, TokenUsageDto, ModelCatalog } from "./chatbot-types";
export declare function resolveApiBaseUrl(customUrl?: string): string;
export declare function buildApiUrl(baseUrl: string | undefined, path: string): string;
export declare function normalizeSource(dto: SourceDto): Source;
export declare function normalizeToolCall(dto: ToolCallDto): ToolCall;
export declare function normalizeUsage(dto: TokenUsageDto): TokenUsage;
export declare function normalizeChatMessage(dto: ChatMessageDto): ChatMessage;
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
    sendMessageStream?(sessionId: string, message: string, access?: ChatAccessContext, onProgress?: (stage: string) => void, onToken?: (token: string) => void, signal?: AbortSignal): Promise<{
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
export declare function createChatApi(initialBaseUrl?: string): ChatApiClient;
export declare const chatApi: ChatApiClient;
