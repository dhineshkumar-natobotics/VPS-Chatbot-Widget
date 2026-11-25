import type { ChatMessage, MessageFeedback } from "../api/chatbot-types";
interface ChatMessageActionsProps {
    message: ChatMessage;
    onFeedback: (messageId: string, feedback: MessageFeedback) => void;
}
export declare function ChatMessageActions({ message, onFeedback }: ChatMessageActionsProps): import("react").JSX.Element;
export {};
