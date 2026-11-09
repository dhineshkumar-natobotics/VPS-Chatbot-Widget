export type ChatRole = "user" | "assistant" | "system";
export type MessageStatus = "pending" | "complete" | "error";
export interface Source {
    chunkId: string;
    source: string;
    score: number;
    title?: string;
    snippet?: string;
}
export interface ToolCall {
    toolName: string;
    arguments: Record<string, unknown>;
    result: Record<string, unknown>;
}
export interface TokenUsage {
    model: string;
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
}
export interface ChatMessage {
    id: string;
    role: ChatRole;
    content: string;
    createdAt: string;
    status?: MessageStatus;
    progressText?: string;
    durationMs?: number;
    sources?: Source[];
    toolCalls?: ToolCall[];
    usage?: TokenUsage;
}
export interface ChatUserContext {
    customerId?: string;
    email?: string;
    name?: string;
    /** Display name of the role, if the host application has one. */
    role?: string;
    /** Authenticated Customer Portal role ID used for server-side RAG routing. */
    roleId?: number;
    /** Client experience that owns this authenticated session. */
    client?: "mobile" | "web" | "admin";
    page?: string;
}
export interface ChatAccessContext {
    roleId?: number;
    client?: "mobile" | "web" | "admin";
    modelId?: string;
}
export interface ModelOption {
    id: string;
    label: string;
    model: string;
    configured: boolean;
}
export interface ModelCatalog {
    defaultModelId: string;
    complexModelId?: string | null;
    models: ModelOption[];
}
export interface Ticket {
    ticketId: string;
    customerId: string;
    customerEmail: string;
    subject: string;
    description: string;
    priority: string;
    status: string;
    createdAt: string;
    updatedAt: string;
}
export interface CreateTicketInput {
    customerIdOrEmail: string;
    subject: string;
    description: string;
    priority?: "low" | "medium" | "high" | "urgent";
}
export interface SessionCreated {
    sessionId: string;
    createdAt: string;
}
export interface ChatApiError {
    code?: string;
    message: string;
    requestId?: string;
}
export interface Suggestion {
    label: string;
    query: string;
}
export interface SourceDto {
    chunk_id: string;
    source: string;
    score: number;
    title?: string;
    snippet?: string;
}
export interface ToolCallDto {
    tool_name: string;
    arguments?: Record<string, unknown>;
    result?: Record<string, unknown>;
}
export interface TokenUsageDto {
    model: string;
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
}
export interface ChatMessageDto {
    id: string;
    role: string;
    content: string;
    model?: string | null;
    prompt_tokens?: number;
    completion_tokens?: number;
    created_at?: string | null;
}
export interface SessionResponseDto {
    session_id: string;
    created_at: string;
}
export interface SessionMessagesResponseDto {
    session_id: string;
    messages: ChatMessageDto[];
}
export interface ChatResponseDto {
    request_id: string;
    session_id: string;
    answer: string;
    sources: SourceDto[];
    tool_calls?: ToolCallDto[];
    usage: TokenUsageDto;
    duration_ms?: number;
    role?: RoleDto | null;
}
export interface RoleDto {
    id: number;
    usertype: string;
    channel: "mobile" | "web" | "admin";
    knowledge_scopes: string[];
}
export interface TicketDto {
    ticket_id: string;
    customer_id: string;
    customer_email: string;
    subject: string;
    description: string;
    priority: string;
    status: string;
    created_at: string;
    updated_at: string;
}
export interface ApiErrorDto {
    success?: boolean;
    error?: {
        code?: string;
        message?: string;
        request_id?: string;
    };
}
