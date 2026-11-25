import {
  createContext,
  lazy,
  Suspense,
  useContext,
  useEffect,
  useRef,
  useState,
  type ComponentProps,
  type ReactNode,
} from "react";
import { CheckCircle2, LoaderCircle } from "lucide-react";
import { cn } from "../../lib/cn";
import {
  Trace,
  TraceCollapsible,
  TraceCollapsibleContent,
  TraceCollapsibleTrigger,
  TraceDescription,
  TraceIcon,
  TraceLine,
  TraceTitle,
} from "../ui/trace";

const Streamdown = lazy(async () => ({ default: (await import("streamdown")).Streamdown }));

const ReasoningContext = createContext<{
  isStreaming: boolean;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  duration?: number;
} | null>(null);

export function useReasoning() {
  const reasoning = useContext(ReasoningContext);
  if (!reasoning) throw new Error("Reasoning parts must be rendered inside Reasoning.");
  return reasoning;
}

export type ReasoningProps = ComponentProps<typeof TraceCollapsible> & {
  isStreaming?: boolean;
  duration?: number;
};

export function Reasoning({
  isStreaming = false,
  open,
  defaultOpen,
  onOpenChange,
  duration,
  className,
  ...props
}: ReasoningProps) {
  const [userOpen, setUserOpen] = useState(defaultOpen);
  const [measuredDuration, setMeasuredDuration] = useState<number>();
  const startedAt = useRef<number | null>(null);
  const isOpen = open ?? userOpen ?? isStreaming;

  useEffect(() => {
    if (isStreaming) {
      startedAt.current = performance.now();
    } else if (startedAt.current !== null) {
      setMeasuredDuration(Math.round((performance.now() - startedAt.current) / 1000));
      startedAt.current = null;
    }
  }, [isStreaming]);

  function setIsOpen(nextOpen: boolean) {
    if (open === undefined) setUserOpen(nextOpen);
    onOpenChange?.(nextOpen);
  }

  return (
    <ReasoningContext.Provider value={{ isStreaming, isOpen, setIsOpen, duration: duration ?? measuredDuration }}>
      <Trace className={className}>
        <TraceCollapsible {...props} open={isOpen} onOpenChange={setIsOpen} />
      </Trace>
    </ReasoningContext.Provider>
  );
}

export type ReasoningTriggerProps = ComponentProps<typeof TraceCollapsibleTrigger> & {
  getThinkingMessage?: (isStreaming: boolean, duration?: number) => ReactNode;
  icon?: ReactNode;
  description?: ReactNode;
};

export function ReasoningTrigger({
  getThinkingMessage,
  children,
  icon,
  description,
  ...props
}: ReasoningTriggerProps) {
  const { isStreaming, duration } = useReasoning();
  const title = isStreaming ? "Thinking" : duration === undefined ? "Thought" : `Thought for ${duration}s`;

  return (
    <TraceCollapsibleTrigger {...props}>
      <TraceLine status={isStreaming ? "running" : undefined}>
        <TraceIcon>
          {icon ?? (isStreaming ? <LoaderCircle size={14} className="trace-spinner" /> : <CheckCircle2 size={14} />)}
        </TraceIcon>
        <TraceTitle>{children ?? getThinkingMessage?.(isStreaming, duration) ?? title}</TraceTitle>
        {description && <TraceDescription aria-hidden={isStreaming || undefined}>{description}</TraceDescription>}
      </TraceLine>
    </TraceCollapsibleTrigger>
  );
}

export type ReasoningContentProps = ComponentProps<typeof TraceCollapsibleContent>;

export function ReasoningContent({ children, className, ...props }: ReasoningContentProps) {
  const { isStreaming } = useReasoning();
  return (
    <TraceCollapsibleContent className={cn("reasoning-content", className)} {...props}>
      {typeof children === "string" ? (
        <Suspense fallback={<div className="md-content reasoning-text">{children}</div>}>
          <Streamdown className="md-content" isAnimating={isStreaming} mode={isStreaming ? "streaming" : "static"}>
            {children}
          </Streamdown>
        </Suspense>
      ) : children}
    </TraceCollapsibleContent>
  );
}
