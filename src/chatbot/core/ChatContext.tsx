import { createContext, useContext } from "react";
import type {
  ChatMessage,
  ChatUserContext,
  Suggestion,
  Ticket,
  ModelOption,
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
  apiBaseUrl?: string;
  hideInspectSources?: boolean;
  showGroundedSources?: boolean;
  sendMessage: (text: string) => Promise<void>;
  retryLast: () => Promise<void>;
  confirmTicket: (customerIdOrEmail?: string) => Promise<void>;
  cancelTicket: () => void;
  resetConversation: () => Promise<void>;
  models: ModelOption[];
  selectedModelId: string;
  selectModel: (modelId: string) => void;
}

export const ChatContext = createContext<ChatContextValue | null>(null);

export function useChatContext(): ChatContextValue {
  const value = useContext(ChatContext);
  if (!value) {
    throw new Error("useChatbot must be used inside ChatProvider.");
  }
  return value;
}

export function useOptionalChatContext(): ChatContextValue | null {
  return useContext(ChatContext);
}

