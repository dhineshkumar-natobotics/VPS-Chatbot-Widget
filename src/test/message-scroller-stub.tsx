import React, { type ReactNode } from "react";

type Props = {
  children?: ReactNode;
  className?: string;
  "aria-label"?: string;
  "aria-busy"?: boolean;
  messageId?: string;
  scrollAnchor?: boolean;
  autoScroll?: boolean;
  defaultScrollPosition?: string;
  scrollPreviousItemPeek?: number;
  direction?: string;
};

function PassThrough({ children, className, ...props }: Props) {
  const {
    messageId: _messageId,
    scrollAnchor: _scrollAnchor,
    autoScroll: _autoScroll,
    defaultScrollPosition: _defaultScrollPosition,
    scrollPreviousItemPeek: _scrollPreviousItemPeek,
    direction: _direction,
    ...dom
  } = props;
  return (
    <div className={className} {...dom}>
      {children}
    </div>
  );
}

export const MessageScroller = {
  Provider: PassThrough,
  Root: PassThrough,
  Viewport: PassThrough,
  Content: PassThrough,
  Item: PassThrough,
  Button: ({ children, className, ...props }: Props) => (
    <button type="button" className={className} {...props}>
      {children}
    </button>
  ),
};

export function useMessageScroller() {
  return {
    scrollToEnd: () => true,
    scrollToMessage: () => true,
    scrollToStart: () => true,
  };
}

export function useMessageScrollerScrollable() {
  return { start: false, end: false };
}

export function useMessageScrollerVisibility() {
  return { currentAnchorId: null, visibleMessageIds: [] as string[] };
}
