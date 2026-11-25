import { type ComponentProps } from "react";
export declare function Trace({ className, ...props }: ComponentProps<"div">): import("react").JSX.Element;
export declare function TraceLine({ className, status, ...props }: ComponentProps<"span"> & {
    status?: "running" | "error" | "pending";
}): import("react").JSX.Element;
export declare function TraceIcon({ className, ...props }: ComponentProps<"span">): import("react").JSX.Element;
export declare function TraceTitle({ className, ...props }: ComponentProps<"span">): import("react").JSX.Element;
export declare function TraceDescription({ className, ...props }: ComponentProps<"span">): import("react").JSX.Element;
export declare function TraceCollapsible({ open, defaultOpen, onOpenChange, children, ...props }: ComponentProps<"div"> & {
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
}): import("react").JSX.Element;
export declare function TraceCollapsibleTrigger({ children, className, onClick, ...props }: ComponentProps<"button">): import("react").JSX.Element;
export declare function TraceCollapsibleContent({ children, className, keepMounted, ...props }: ComponentProps<"div"> & {
    keepMounted?: boolean;
}): import("react").JSX.Element;
