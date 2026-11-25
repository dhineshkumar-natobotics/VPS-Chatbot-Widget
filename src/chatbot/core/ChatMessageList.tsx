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

export const ChatMessageList: React.FC<{ onEdit?: (text: string) => void }> = ({ onEdit }) => {
  const { messages, status } = useChatbot();
  const isBusy = status === "awaiting" || status === "connecting";
  const visibleMessages = messages.filter((message) => message.status !== "error");

  return (
    <MessageScrollerProvider
      autoScroll
      defaultScrollPosition="last-anchor"
      scrollPreviousItemPeek={64}
    >
      <MessageScroller>
        <MessageScrollerViewport aria-label="Chat messages">
          <MessageScrollerContent aria-busy={isBusy}>
            {visibleMessages.length === 0 && (
              <MessageScrollerItem messageId="welcome">
                <ChatEmptyState />
              </MessageScrollerItem>
            )}
            {visibleMessages.map((message) => (
              <MessageScrollerItem
                key={message.streamId ?? message.id}
                messageId={message.streamId ?? message.id}
                data-role={message.role}
                scrollAnchor={message.role === "user"}
              >
                <ChatMessageBubble message={message} onEdit={onEdit} />
              </MessageScrollerItem>
            ))}
          </MessageScrollerContent>
        </MessageScrollerViewport>
        <MessageScrollerButton />
      </MessageScroller>
    </MessageScrollerProvider>
  );
};
