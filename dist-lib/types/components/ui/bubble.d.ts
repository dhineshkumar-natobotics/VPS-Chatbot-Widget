import type { ComponentProps } from "react";
export declare function Bubble({ align, variant, className, ...props }: ComponentProps<"div"> & {
    align?: "start" | "end";
    variant?: "muted" | "destructive";
}): import("react").JSX.Element;
export declare function BubbleContent({ className, ...props }: ComponentProps<"div">): import("react").JSX.Element;
