import type { ComponentProps } from "react";
import { cn } from "../../lib/cn";

export function Marker({
  className,
  variant = "default",
  ...props
}: ComponentProps<"div"> & { variant?: "default" | "border" | "separator" }) {
  return <div {...props} data-slot="marker" data-variant={variant} className={cn("chat-marker", className)} />;
}

export function MarkerIcon({ className, ...props }: ComponentProps<"span">) {
  return <span {...props} data-slot="marker-icon" className={cn("chat-marker-icon", className)} aria-hidden="true" />;
}

export function MarkerContent({ className, ...props }: ComponentProps<"span">) {
  return <span {...props} data-slot="marker-content" className={cn("chat-marker-content", className)} />;
}
