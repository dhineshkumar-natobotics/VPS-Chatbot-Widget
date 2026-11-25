import type { ComponentProps } from "react";
export declare function Message({ align, className, ...props }: ComponentProps<"div"> & {
    align?: "start" | "end";
}): import("react").JSX.Element;
export declare function MessageAvatar({ className, ...props }: ComponentProps<"div">): import("react").JSX.Element;
export declare function MessageContent({ className, ...props }: ComponentProps<"div">): import("react").JSX.Element;
export declare function MessageHeader({ className, ...props }: ComponentProps<"div">): import("react").JSX.Element;
export declare function MessageFooter({ className, ...props }: ComponentProps<"div">): import("react").JSX.Element;
