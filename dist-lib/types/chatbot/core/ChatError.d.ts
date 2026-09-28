import React from "react";
interface ChatErrorProps {
    message: string;
    onRetry?: () => void;
}
export declare const ChatError: React.FC<ChatErrorProps>;
export {};
