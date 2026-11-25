import type { ComponentProps } from "react";
import { Collapsible } from "@base-ui/react/collapsible";
import { ChevronRight } from "lucide-react";
import { cn } from "../../lib/cn";

export function Trace({ className, ...props }: ComponentProps<"div">) {
  return <div data-slot="trace" className={cn("trace", className)} {...props} />;
}

export function TraceLine({
  className,
  status,
  ...props
}: ComponentProps<"span"> & { status?: "running" | "error" | "pending" }) {
  return (
    <span data-slot="trace-line" data-status={status} className={cn("trace-line", className)} {...props} />
  );
}

export function TraceIcon({ className, ...props }: ComponentProps<"span">) {
  return <span data-slot="trace-icon" className={cn("trace-icon", className)} {...props} aria-hidden="true" />;
}

export function TraceTitle({ className, ...props }: ComponentProps<"span">) {
  return <span data-slot="trace-title" className={cn("trace-title", className)} {...props} />;
}

export function TraceDescription({ className, ...props }: ComponentProps<"span">) {
  return <span data-slot="trace-description" className={cn("trace-description", className)} {...props} />;
}

export function TraceCollapsible(props: Omit<Collapsible.Root.Props, "className" | "onOpenChange"> & {
  className?: string;
  onOpenChange?: (open: boolean) => void;
}) {
  return <Collapsible.Root data-slot="trace-collapsible" {...props} />;
}

export function TraceCollapsibleTrigger({
  children,
  className,
  ...props
}: Omit<Collapsible.Trigger.Props, "className"> & { className?: string }) {
  return (
    <Collapsible.Trigger
      type="button"
      data-slot="trace-collapsible-trigger"
      className={cn("trace-trigger", className)}
      {...props}
    >
      {children}
      <TraceIcon className="trace-chevron"><ChevronRight size={13} /></TraceIcon>
    </Collapsible.Trigger>
  );
}

export function TraceCollapsibleContent({
  className,
  ...props
}: Omit<Collapsible.Panel.Props, "className"> & { className?: string }) {
  return (
    <Collapsible.Panel
      {...props}
      data-slot="trace-collapsible-content"
      className={cn("trace-content", className)}
    />
  );
}
