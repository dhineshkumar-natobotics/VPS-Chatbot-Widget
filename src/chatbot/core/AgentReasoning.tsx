import React, { useEffect, useState } from "react";
import { CheckCircle2, LoaderCircle } from "lucide-react";

interface AgentReasoningProps {
  status?: "pending" | "complete" | "error";
  progressText?: string;
  durationMs?: number;
}

export const AgentReasoning: React.FC<AgentReasoningProps> = ({
  status = "complete",
  progressText,
  durationMs,
}) => {
  const isPending = status === "pending";
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (!isPending) return;
    const start = Date.now();
    const interval = setInterval(() => {
      setSeconds(Number(((Date.now() - start) / 1000).toFixed(1)));
    }, 250);
    return () => clearInterval(interval);
  }, [isPending]);

  const durationDisplay = isPending
    ? `${seconds.toFixed(1)}s`
    : durationMs === undefined
      ? undefined
      : `${(durationMs / 1000).toFixed(1)}s`;

  return (
    <div className={`agent-reasoning-container${isPending ? " agent-reasoning--active" : ""}`}>
      <div
        className="agent-reasoning-header"
        role="status"
        aria-live="off"
      >
        <div className="agent-reasoning-header-left">
          {isPending ? (
            <LoaderCircle
              size={13}
              className="agent-reasoning-spinner"
              aria-hidden="true"
            />
          ) : (
            <CheckCircle2
              size={13}
              className="agent-reasoning-done-icon"
              aria-hidden="true"
            />
          )}
          <span className="agent-reasoning-title">
            {isPending
              ? `${progressText || "Working…"} · ${durationDisplay}`
              : durationDisplay
                ? `Response generated in ${durationDisplay}`
                : "Response generated"}
          </span>
        </div>
      </div>
    </div>
  );
};
