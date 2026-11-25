import type { ComponentProps } from "react";
import { Collapsible } from "@base-ui/react/collapsible";
export declare function Trace({ className, ...props }: ComponentProps<"div">): import("react").JSX.Element;
export declare function TraceLine({ className, status, ...props }: ComponentProps<"span"> & {
    status?: "running" | "error" | "pending";
}): import("react").JSX.Element;
export declare function TraceIcon({ className, ...props }: ComponentProps<"span">): import("react").JSX.Element;
export declare function TraceTitle({ className, ...props }: ComponentProps<"span">): import("react").JSX.Element;
export declare function TraceDescription({ className, ...props }: ComponentProps<"span">): import("react").JSX.Element;
export declare function TraceCollapsible(props: Omit<Collapsible.Root.Props, "className" | "onOpenChange"> & {
    className?: string;
    onOpenChange?: (open: boolean) => void;
}): import("react").JSX.Element;
export declare function TraceCollapsibleTrigger({ children, className, ...props }: Omit<Collapsible.Trigger.Props, "className"> & {
    className?: string;
}): import("react").JSX.Element;
export declare function TraceCollapsibleContent({ className, ...props }: Omit<Collapsible.Panel.Props, "className"> & {
    className?: string;
}): import("react").JSX.Element;
