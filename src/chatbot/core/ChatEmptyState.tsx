import React from "react";
import { BotMessageSquare } from "lucide-react";
import { Bubble, BubbleContent } from "../../components/ui/bubble";
import { Message, MessageAvatar, MessageContent } from "../../components/ui/message";

export const ChatEmptyState: React.FC = () => {
  return (
    <Message>
      <MessageAvatar className="avatar-circle" aria-hidden="true">
        <BotMessageSquare size={15} />
      </MessageAvatar>
      <MessageContent>
        <Bubble>
          <BubbleContent>
            Hello — I am the VPS Veritas assistant. Ask about reports, sample status,
            registration, or support, or choose a suggested question.
          </BubbleContent>
        </Bubble>
      </MessageContent>
    </Message>
  );
};
