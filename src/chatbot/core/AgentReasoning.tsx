import React, { useEffect, useState } from "react";
import { CheckCircle2, LoaderCircle, Square, Wrench } from "lucide-react";
import { Marker, MarkerContent, MarkerIcon } from "../../components/ui/marker";
import {
  Trace,
  TraceCollapsible,
  TraceCollapsibleContent,
  TraceCollapsibleTrigger,
  TraceDescription,
  TraceIcon,
  TraceLine,
  TraceTitle,
} from "../../components/ui/trace";
import type { ToolCall } from "../api/chatbot-types";

interface AgentReasoningProps {
  status?: "pending" | "complete" | "stopped";
  progressText?: string;
  progressSteps?: string[];
  durationMs?: number;
  toolCalls?: ToolCall[];
}

function toolLabel(name: string): string {
  if (name === "create_ticket") return "Support ticket processed";
  if (name === "get_customer") return "Account verified";
  if (name === "get_ticket") return "Ticket status loaded";
  return "Information retrieved";
}

export const AgentReasoning: React.FC<AgentReasoningProps> = ({
  status = "complete",
  progressText,
  progressSteps = [],
  durationMs,
  toolCalls = [],
}) => {
  const isPending = status === "pending";
  const isStopped = status === "stopped";
  const [seconds, setSeconds] = useState(0);
  const [open, setOpen] = useState<boolean>();

  useEffect(() => {
    if (!isPending) return;
    const start = Date.now();
    const interval = setInterval(() => {
      setSeconds(Number(((Date.now() - start) / 1000).toFixed(1)));
    }, 250);
    return () => clearInterval(interval);
  }, [isPending]);

  const durationDisplay = isStopped
    ? undefined
    : isPending
    ? `${seconds.toFixed(1)}s`
    : durationMs === undefined
      ? undefined
      : `${(durationMs / 1000).toFixed(1)}s`;

  const hasActivity = progressSteps.length > 0 || toolCalls.length > 0;
  const title = isPending
    ? hasActivity ? "Working…" : progressText || "Preparing your answer…"
    : isStopped ? "Response stopped" : "Response generated";
  const summary = (
    <TraceLine status={isPending ? "running" : undefined}>
      <TraceIcon>
        {isPending ? (
          <LoaderCircle size={14} className="trace-spinner" />
        ) : isStopped ? (
          <Square size={12} />
        ) : (
          <CheckCircle2 size={14} />
        )}
      </TraceIcon>
      <TraceTitle>{title}</TraceTitle>
      {durationDisplay && <TraceDescription aria-hidden={isPending || undefined}>{durationDisplay}</TraceDescription>}
    </TraceLine>
  );

  return (
    <Trace className="chat-response-trace">
      {hasActivity ? (
        <TraceCollapsible open={open ?? isPending} onOpenChange={setOpen}>
          <TraceCollapsibleTrigger>{summary}</TraceCollapsibleTrigger>
          <TraceCollapsibleContent>
            <Trace>
              {progressSteps.map((step, index) => (
                <Marker key={`${step}-${index}`}>
                  <MarkerIcon>
                    <span className="chat-progress-dot" />
                  </MarkerIcon>
                  <MarkerContent>{step}</MarkerContent>
                </Marker>
              ))}
              {toolCalls.map((call, index) => (
                <TraceLine key={`${call.toolName}-${index}`}>
                  <TraceIcon><Wrench size={13} /></TraceIcon>
                  <TraceTitle>{toolLabel(call.toolName)}</TraceTitle>
                </TraceLine>
              ))}
            </Trace>
          </TraceCollapsibleContent>
        </TraceCollapsible>
      ) : summary}
    </Trace>
  );
};
