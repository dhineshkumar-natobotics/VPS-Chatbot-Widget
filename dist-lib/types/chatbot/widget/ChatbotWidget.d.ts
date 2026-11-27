import React from "react";
import { type EnvStage } from "../../components/EnvBadge";
import type { ChatServiceArea, ChatUserContext, Suggestion } from "../api/chatbot-types";
export interface ChatbotWidgetProps {
    defaultOpen?: boolean;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    /** Environment badge stage. Omit for production. */
    envStage?: EnvStage;
    envPulse?: boolean;
    /** Direct role name (e.g. "VPS Admin", "Client User", "Captain") */
    role?: string;
    /** Customer Portal role ID used to tailor questions and route knowledge */
    roleId?: number;
    /** Direct client experience ("web" | "mobile" | "admin") */
    client?: "mobile" | "web" | "admin";
    service?: ChatServiceArea;
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
    /** Hide inline previews and the source list's inspection controls. */
    hideInspectSources?: boolean;
    /** Whether to show grounded sources (default: false) */
    showGroundedSources?: boolean;
    modelId?: string;
}
export declare const ChatbotWidget: React.FC<ChatbotWidgetProps>;
