import React from "react";
import { Message } from "../types/chat";
import { QuickOption } from "./QuickPrompts";
interface MessageListProps {
    messages: Message[];
    isLoading: boolean;
    isConnectingAgent?: boolean;
    connectingLabel?: string;
    isChatClosed?: boolean;
    showFeedbackCard?: boolean;
    agentName?: string;
    agentInitials?: string;
    chatDuration?: string;
    isBot?: boolean;
    onSelectPrompt?: (prompt: string) => void;
    welcomeQuickOptions?: QuickOption[];
    onSubmitFeedback?: (rating: string, reasons: string) => void;
    onCancelFeedback?: () => void;
}
export declare const MessageList: React.FC<MessageListProps>;
export {};
