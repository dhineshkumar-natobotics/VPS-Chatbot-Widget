import React from "react";
interface ChatInputProps {
    onSend: (message: string) => void;
    disabled?: boolean;
    placeholder?: string;
}
export declare const ChatInput: React.FC<ChatInputProps>;
export {};
