import React from "react";
interface ChatInputProps {
    onSendMessage: (message: string) => void;
    disabled?: boolean;
    placeholder?: string;
    poweredByText?: string;
}
export declare const ChatInput: React.FC<ChatInputProps>;
export {};
