import React, { useState, useEffect } from "react";
import { Message } from "../types/chat";
import { ChatService } from "../services/api";
import { ChatHeader, HeaderMode } from "./ChatHeader";
import { MessageList } from "./MessageList";
import { ChatInput } from "./ChatInput";
import { OrderTrackingCard } from "./OrderTrackingCard";
import { QuickOption } from "./QuickPrompts";
import { type EnvStage } from "./EnvBadge";

export type WidgetViewPreset = "bot" | "agent" | "ended" | "live";

interface ChatWidgetProps {
  mode?: "floating" | "embedded";
  onClose?: () => void;
  preset?: WidgetViewPreset;
  /** Environment badge stage shown in the header. Omit for production. */
  envStage?: EnvStage;
  /** Whether the dot inside the badge pulses. Default: true */
  envPulse?: boolean;
}

const MOCK_BOT_MESSAGES: Message[] = [
  {
    id: "bot-1",
    role: "assistant",
    content:
      "Hey ! i'm a Hazell Chat Bot ! Ask me anything or share your feedback or selectan option below.",
    timestamp: new Date().toISOString(),
  },
  {
    id: "user-1",
    role: "user",
    content: "Chat With the sales team",
    timestamp: new Date().toISOString(),
  },
  {
    id: "bot-2",
    role: "assistant",
    content: "Got you, please wait to connecting with agent in kirridesk.",
    timestamp: new Date().toISOString(),
  },
];

const MOCK_AGENT_MESSAGES: Message[] = [
  {
    id: "agent-1",
    role: "assistant",
    content:
      "I'm sorry to hear that. Have you checked the tracking information for your package?",
    timestamp: new Date().toISOString(),
  },
  {
    id: "user-1",
    role: "user",
    content: "Yes, I did, but it says it's still in transit for several days.",
    timestamp: new Date().toISOString(),
  },
  {
    id: "agent-2",
    role: "assistant",
    content: "In that case, can you give me your order ID?",
    timestamp: new Date().toISOString(),
  },
  {
    id: "user-2",
    role: "user",
    content: "Alright, SO-567",
    timestamp: new Date().toISOString(),
  },
];

const MOCK_ENDED_MESSAGES: Message[] = [
  {
    id: "agent-1",
    role: "assistant",
    content:
      "You're welcome! I hope your package arrives soon. Let me know if there's anything else I can assist you with.",
    timestamp: new Date().toISOString(),
  },
];

const DEFAULT_QUICK_OPTIONS: QuickOption[] = [
  { label: "Get free training", query: "Get free training" },
  { label: "Get Started free", query: "Get Started free" },
  { label: "Chat with the sales team", query: "Chat with the sales team" },
];

export const ChatWidget: React.FC<ChatWidgetProps> = ({
  mode = "embedded",
  onClose,
  preset = "live",
  envStage,
  envPulse = true,
}) => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnectingAgent, setIsConnectingAgent] = useState(false);

  // Determine current display states based on preset or dynamic conversation
  const isPresetBot = preset === "bot";
  const isPresetAgent = preset === "agent";
  const isPresetEnded = preset === "ended";

  const headerMode: HeaderMode = isPresetBot
    ? "bot"
    : isPresetEnded
    ? "ended"
    : isPresetAgent
    ? "agent"
    : "bot";

  const showTrackingCard = isPresetAgent;
  const isChatClosed = isPresetEnded;
  const showFeedbackCard = isPresetEnded;

  // Initialize or resume chat session for live mode
  const initSession = async (reset = false) => {
    if (preset !== "live") {
      if (isPresetBot) {
        setMessages(MOCK_BOT_MESSAGES);
        setIsConnectingAgent(true);
      } else if (isPresetAgent) {
        setMessages(MOCK_AGENT_MESSAGES);
        setIsConnectingAgent(false);
      } else if (isPresetEnded) {
        setMessages(MOCK_ENDED_MESSAGES);
        setIsConnectingAgent(false);
      }
      return;
    }

    try {
      setIsLoading(true);
      if (sessionId && reset) {
        await ChatService.closeSession(sessionId);
      }
      const newId = await ChatService.createSession();
      setSessionId(newId);
      setMessages([]);
      setIsConnectingAgent(false);
    } catch (err) {
      console.error("Failed to initialize session:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    initSession();
  }, [preset]);

  const handleSendMessage = async (userMessage: string) => {
    // If testing mock presets, append message locally
    if (preset !== "live") {
      const userMsgObj: Message = {
        id: `user-${Date.now()}`,
        role: "user",
        content: userMessage,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMsgObj]);
      setIsLoading(true);

      setTimeout(() => {
        setIsLoading(false);
        const replyMsgObj: Message = {
          id: `asst-${Date.now()}`,
          role: "assistant",
          content: "Thank you for providing the details! I am checking on this for you right away.",
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, replyMsgObj]);
      }, 1000);
      return;
    }

    let currentSession = sessionId;
    if (!currentSession) {
      try {
        currentSession = await ChatService.createSession();
        setSessionId(currentSession);
      } catch {
        return;
      }
    }

    const userMsgObj: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: userMessage,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsgObj]);
    setIsLoading(true);

    try {
      const response = await ChatService.sendMessage(currentSession, userMessage);
      const assistantMsgObj: Message = {
        id: response.request_id || `asst-${Date.now()}`,
        role: "assistant",
        content: response.answer,
        timestamp: new Date().toISOString(),
        sources: response.sources,
        tool_calls: response.tool_calls,
        usage: response.usage,
      };
      setMessages((prev) => [...prev, assistantMsgObj]);
    } catch (err: any) {
      const errorMsgObj: Message = {
        id: `err-${Date.now()}`,
        role: "assistant",
        content: `⚠️ ${err.message || "An error occurred while connecting to the assistant."}`,
        timestamp: new Date().toISOString(),
        error: true,
      };
      setMessages((prev) => [...prev, errorMsgObj]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`chat-card-container ${mode === "floating" ? "chat-card-floating" : "chat-card-embedded"}`}>
      {/* Header */}
      <ChatHeader
        headerMode={headerMode}
        ticketId="#TC-192"
        subtitle="Help, I order wrong product"
        duration="2:02"
        agentInitials="FIK"
        onReset={() => initSession(true)}
        onClose={onClose}
        isFloating={mode === "floating"}
        envStage={envStage}
        envPulse={envPulse}
      />

      {/* Collapsible Order Tracking Stepper (Screen 2) */}
      {showTrackingCard && (
        <div style={{ padding: "12px 16px 0 16px" }}>
          <OrderTrackingCard
            orderId="#SO-567"
            statusBadge="Paid"
            totalAmount="$256.00"
            steps={[
              { label: "Quoted", status: "completed" },
              { label: "Packed", status: "active" },
              { label: "Shipped", status: "pending" },
              { label: "Delivered", status: "pending" },
            ]}
          />
        </div>
      )}

      {/* Message Stream */}
      <MessageList
        messages={messages}
        isLoading={isLoading}
        isConnectingAgent={isConnectingAgent}
        connectingLabel="Connecting with agent"
        isChatClosed={isChatClosed}
        showFeedbackCard={showFeedbackCard}
        agentName="Fikri Studio"
        agentInitials="FIK"
        chatDuration="12 Mins 23 Sec"
        isBot={isPresetBot || preset === "live"}
        welcomeQuickOptions={DEFAULT_QUICK_OPTIONS}
        onSelectPrompt={handleSendMessage}
        onSubmitFeedback={(rating, reasons) => {
          console.log("Feedback submitted:", { rating, reasons });
        }}
      />

      {/* Input Box (Active when chat is not closed) */}
      {!isChatClosed && (
        <ChatInput
          onSendMessage={handleSendMessage}
          disabled={isLoading}
          placeholder="Type message"
          poweredByText="Powered by kirridesk"
        />
      )}

      {/* Concluded footer when chat is ended */}
      {isChatClosed && (
        <div className="chat-powered-by" style={{ padding: "12px 0 16px 0" }}>
          <span>Powered by kirridesk</span>
        </div>
      )}
    </div>
  );
};
