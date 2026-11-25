import React from "react";
import { type ChatApiClient } from "../api/chatbot-api";
import type { ChatUserContext, Suggestion } from "../api/chatbot-types";
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
export declare const ChatProvider: React.FC<ChatProviderProps>;
