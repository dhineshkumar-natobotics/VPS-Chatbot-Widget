import React from "react";
import { type EnvStage } from "../../components/EnvBadge";
import type { ChatUserContext, Suggestion } from "../api/chatbot-types";
export interface EmbeddedChatbotProps {
    defaultOpen?: boolean;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    showTrigger?: boolean;
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
    modelId?: string;
}
export declare const EmbeddedChatbot: React.FC<EmbeddedChatbotProps>;
