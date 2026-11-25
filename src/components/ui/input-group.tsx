import type { ComponentProps } from "react";
import { cn } from "../../lib/cn";

export function InputGroup({ className, ...props }: ComponentProps<"div">) {
  return <div {...props} data-slot="input-group" className={cn("chat-input-group", className)} />;
}

export function InputGroupTextarea({ className, ...props }: ComponentProps<"textarea">) {
  return <textarea {...props} data-slot="input-group-textarea" className={cn("chat-textarea", className)} />;
}

export function InputGroupAddon({ className, ...props }: ComponentProps<"div">) {
  return <div {...props} data-slot="input-group-addon" className={cn("chat-input-actions", className)} />;
}

export function InputGroupButton({ className, ...props }: ComponentProps<"button">) {
  return <button type="button" {...props} data-slot="input-group-button" className={cn("chat-send-btn", className)} />;
}
