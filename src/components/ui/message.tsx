import type { ComponentProps } from "react";
import { cn } from "../../lib/cn";

export function Message({
  align = "start",
  className,
  ...props
}: ComponentProps<"div"> & { align?: "start" | "end" }) {
  return <div {...props} data-slot="message" data-align={align} className={cn("chat-message", className)} />;
}

export function MessageAvatar({ className, ...props }: ComponentProps<"div">) {
  return <div {...props} data-slot="message-avatar" className={cn("chat-message-avatar", className)} />;
}

export function MessageContent({ className, ...props }: ComponentProps<"div">) {
  return <div {...props} data-slot="message-content" className={cn("chat-message-content", className)} />;
}

export function MessageHeader({ className, ...props }: ComponentProps<"div">) {
  return <div {...props} data-slot="message-header" className={cn("chat-message-header", className)} />;
}

export function MessageFooter({ className, ...props }: ComponentProps<"div">) {
  return <div {...props} data-slot="message-footer" className={cn("chat-message-footer", className)} />;
}
