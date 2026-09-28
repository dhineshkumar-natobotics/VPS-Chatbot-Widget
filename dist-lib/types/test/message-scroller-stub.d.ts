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
declare function PassThrough({ children, className, ...props }: Props): React.JSX.Element;
export declare const MessageScroller: {
    Provider: typeof PassThrough;
    Root: typeof PassThrough;
    Viewport: typeof PassThrough;
    Content: typeof PassThrough;
    Item: typeof PassThrough;
    Button: ({ children, className, ...props }: Props) => React.JSX.Element;
};
export declare function useMessageScroller(): {
    scrollToEnd: () => boolean;
    scrollToMessage: () => boolean;
    scrollToStart: () => boolean;
};
export declare function useMessageScrollerScrollable(): {
    start: boolean;
    end: boolean;
};
export declare function useMessageScrollerVisibility(): {
    currentAnchorId: null;
    visibleMessageIds: string[];
};
export {};
