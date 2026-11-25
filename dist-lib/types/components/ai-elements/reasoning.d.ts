import { type ComponentProps, type ReactNode } from "react";
import { TraceCollapsible, TraceCollapsibleContent, TraceCollapsibleTrigger } from "../ui/trace";
export declare function useReasoning(): {
    isStreaming: boolean;
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    duration?: number;
};
export type ReasoningProps = ComponentProps<typeof TraceCollapsible> & {
    isStreaming?: boolean;
    duration?: number;
};
export declare function Reasoning({ isStreaming, open, defaultOpen, onOpenChange, duration, className, ...props }: ReasoningProps): import("react").JSX.Element;
export type ReasoningTriggerProps = ComponentProps<typeof TraceCollapsibleTrigger> & {
    getThinkingMessage?: (isStreaming: boolean, duration?: number) => ReactNode;
    icon?: ReactNode;
    description?: ReactNode;
};
export declare function ReasoningTrigger({ getThinkingMessage, children, icon, description, ...props }: ReasoningTriggerProps): import("react").JSX.Element;
export type ReasoningContentProps = ComponentProps<typeof TraceCollapsibleContent>;
export declare function ReasoningContent({ children, className, ...props }: ReasoningContentProps): import("react").JSX.Element;
