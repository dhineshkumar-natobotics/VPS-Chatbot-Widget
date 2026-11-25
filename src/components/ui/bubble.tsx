import type { ComponentProps } from "react";
import { cn } from "../../lib/cn";

export function Bubble({
  align = "start",
  variant = "muted",
  className,
  ...props
}: ComponentProps<"div"> & {
  align?: "start" | "end";
  variant?: "muted" | "destructive";
}) {
  return <div {...props} data-slot="bubble" data-align={align} data-variant={variant} className={cn("chat-bubble", className)} />;
}

export function BubbleContent({ className, ...props }: ComponentProps<"div">) {
  return <div {...props} data-slot="bubble-content" className={cn("chat-bubble-content", className)} />;
}
