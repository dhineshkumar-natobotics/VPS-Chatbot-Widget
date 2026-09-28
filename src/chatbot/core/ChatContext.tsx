import { createContext, useContext } from "react";
import type {
  ChatMessage,
  ChatUserContext,
  Suggestion,
  Ticket,
} from "../api/chatbot-types";

export type ChatUiStatus = "idle" | "connecting" | "awaiting" | "error";

export interface PendingTicket {
  subject: string;
  description: string;
}

export interface ChatContextValue {
  messages: ChatMessage[];
  status: ChatUiStatus;
  error: string | null;
  sessionId: string | null;
  pendingTicket: PendingTicket | null;
  ticketBusy: boolean;
  lastTicket: Ticket | null;
  suggestions: Suggestion[];
  showSuggestions: boolean;
  suggestionBadgesEnabled: boolean;
  userContext: ChatUserContext;
  sendMessage: (text: string) => Promise<void>;
  retryLast: () => Promise<void>;
  confirmTicket: (customerIdOrEmail?: string) => Promise<void>;
  cancelTicket: () => void;
  resetConversation: () => Promise<void>;
}

export const ChatContext = createContext<ChatContextValue | null>(null);

export function useChatContext(): ChatContextValue {
  const value = useContext(ChatContext);
  if (!value) {
    throw new Error("useChatbot must be used inside ChatProvider.");
  }
  return value;
}
