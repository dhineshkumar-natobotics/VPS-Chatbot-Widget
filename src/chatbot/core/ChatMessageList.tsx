import React from "react";
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "../../components/ui/message-scroller";
import { useChatbot } from "../hooks/useChatbot";
import { ChatEmptyState } from "./ChatEmptyState";
import { ChatMessageBubble } from "./ChatMessage";

export const ChatMessageList: React.FC = () => {
  const { messages, status, showSuggestions } = useChatbot();
  const isBusy = status === "awaiting" || status === "connecting";

  return (
    <MessageScrollerProvider
      autoScroll
      defaultScrollPosition="last-anchor"
      scrollPreviousItemPeek={64}
    >
      <MessageScroller>
        <MessageScrollerViewport aria-label="Chat messages">
          <MessageScrollerContent aria-busy={isBusy}>
            {showSuggestions && (
              <MessageScrollerItem messageId="welcome">
                <ChatEmptyState />
              </MessageScrollerItem>
            )}
            {messages.map((message) => (
              <MessageScrollerItem
                key={message.id}
                messageId={message.id}
                scrollAnchor={message.role === "user"}
              >
                <ChatMessageBubble message={message} />
              </MessageScrollerItem>
            ))}
          </MessageScrollerContent>
        </MessageScrollerViewport>
        <MessageScrollerButton />
      </MessageScroller>
    </MessageScrollerProvider>
  );
};
