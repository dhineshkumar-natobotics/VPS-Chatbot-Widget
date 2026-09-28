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
export declare const EmbeddedChatbot: React.FC<EmbeddedChatbotProps>;
