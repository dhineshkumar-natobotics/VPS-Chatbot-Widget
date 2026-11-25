import React from "react";
interface ChatInputProps {
    onSend: (message: string) => void;
    onStop?: () => void;
    disabled?: boolean;
    placeholder?: string;
    ref?: React.Ref<ChatInputHandle>;
}
export interface ChatInputHandle {
    edit: (text: string) => void;
}
export declare const ChatInput: React.FC<ChatInputProps>;
export {};
