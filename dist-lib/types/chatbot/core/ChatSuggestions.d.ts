import React from "react";
import type { Suggestion } from "../api/chatbot-types";
export declare function filterSuggestions(suggestions: Suggestion[], text: string): Suggestion[];
interface ChatSuggestionsProps {
    suggestions: Suggestion[];
    onSelect: (suggestion: Suggestion) => void;
    disabled?: boolean;
    variant?: "list" | "badge";
}
export declare const ChatSuggestions: React.FC<ChatSuggestionsProps>;
export {};
