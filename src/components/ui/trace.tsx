import {
  createContext,
  useContext,
  useId,
  useState,
  type ComponentProps,
} from "react";
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

const TraceDisclosure = createContext<{
  contentId: string;
  open: boolean;
  toggle: () => void;
} | null>(null);

function useTraceDisclosure() {
  const disclosure = useContext(TraceDisclosure);
  if (!disclosure) throw new Error("Trace disclosure parts require TraceCollapsible.");
  return disclosure;
}

export function TraceCollapsible({
  open,
  defaultOpen = false,
  onOpenChange,
  children,
  ...props
}: ComponentProps<"div"> & {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const contentId = useId();
  const expanded = open ?? uncontrolledOpen;

  function toggle() {
    if (open === undefined) setUncontrolledOpen(!expanded);
    onOpenChange?.(!expanded);
  }

  return (
    <TraceDisclosure.Provider value={{ contentId, open: expanded, toggle }}>
      <div data-slot="trace-collapsible" {...props}>{children}</div>
    </TraceDisclosure.Provider>
  );
}

export function TraceCollapsibleTrigger({
  children,
  className,
  onClick,
  ...props
}: ComponentProps<"button">) {
  const { contentId, open, toggle } = useTraceDisclosure();

  return (
    <button
      {...props}
      type="button"
      data-slot="trace-collapsible-trigger"
      className={cn("trace-trigger", className)}
      aria-expanded={open}
      aria-controls={contentId}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) toggle();
      }}
    >
      {children}
      <TraceIcon className="trace-chevron"><ChevronRight size={13} /></TraceIcon>
    </button>
  );
}

export function TraceCollapsibleContent({
  children,
  className,
  keepMounted = false,
  ...props
}: ComponentProps<"div"> & { keepMounted?: boolean }) {
  const { contentId, open } = useTraceDisclosure();

  return (
    <div
      {...props}
      id={contentId}
      data-slot="trace-collapsible-content"
      className={cn("trace-content", className)}
      hidden={!open}
    >
      {(open || keepMounted) && children}
    </div>
  );
}
