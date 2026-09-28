import React from "react";
import { type ChatApiClient } from "../api/chatbot-api";
import type { ChatUserContext, Suggestion } from "../api/chatbot-types";
export interface ChatProviderProps {
    children: React.ReactNode;
    userContext?: ChatUserContext;
    suggestions?: Suggestion[];
    disableSuggestions?: boolean;
    initialMessage?: string;
    /** Backend or proxy API base URL (e.g. "https://vpsai.onrender.com" or "/api"). Defaults to VITE_API_BASE or "" */
    apiBaseUrl?: string;
    /** Alias for apiBaseUrl */
    apiUrl?: string;
    /** Alias for apiBaseUrl */
    proxyUrl?: string;
    /** Optional custom chat API client */
    api?: ChatApiClient;
}
export declare const ChatProvider: React.FC<ChatProviderProps>;
