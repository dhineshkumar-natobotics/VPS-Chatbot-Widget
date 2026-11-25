import React from "react";
import type { ChatMessage } from "../api/chatbot-types";
interface ChatMessageProps {
    message: ChatMessage;
    onEdit?: (text: string) => void;
}
export declare const ChatMessageBubble: React.FC<ChatMessageProps>;
export {};
