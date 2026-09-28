import React from "react";
import { Message } from "../types/chat";
import { QuickOption } from "./QuickPrompts";
interface MessageItemProps {
    message: Message;
    agentInitials?: string;
    isBot?: boolean;
    onSelectPrompt?: (prompt: string) => void;
    quickOptions?: QuickOption[];
}
export declare const MessageItem: React.FC<MessageItemProps>;
export {};
