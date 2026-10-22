import React, { useState, useEffect } from "react";
import { Brain, ChevronDown, ChevronRight, CheckCircle2 } from "lucide-react";

interface AgentReasoningProps {
  status?: "pending" | "complete" | "error";
  progressText?: string;
  sourcesCount?: number;
  durationMs?: number;
}

export const AgentReasoning: React.FC<AgentReasoningProps> = ({
  status = "complete",
  progressText,
  sourcesCount = 5,
  durationMs = 1800,
}) => {
  const isPending = status === "pending";
  const [isOpen, setIsOpen] = useState(isPending);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (!isPending) return;
    setIsOpen(true);
    const start = Date.now();
    const interval = setInterval(() => {
      setSeconds(Number(((Date.now() - start) / 1000).toFixed(1)));
    }, 100);
    return () => clearInterval(interval);
  }, [isPending]);

  // When transition from pending to complete, collapse like ChatGPT / Open WebUI
  useEffect(() => {
    if (!isPending) {
      setIsOpen(false);
    }
  }, [isPending]);

  const durationDisplay = isPending
    ? `${seconds}s`
    : `${(durationMs / 1000).toFixed(1)}s`;

  return (
    <div className={`agent-reasoning-container${isPending ? " agent-reasoning--active" : ""}`}>
      <div
        className="agent-reasoning-header"
        aria-expanded={isOpen}
      >
        <div className="agent-reasoning-header-left">
          <Brain
            size={13}
            className={`agent-reasoning-brain-icon${isPending ? " agent-reasoning-brain--pulse" : ""}`}
          />
          <span className="agent-reasoning-title">
            {isPending ? `Thinking (${durationDisplay})...` : `Thought for ${durationDisplay} `}
          </span>
        </div>
      </div>
    </div>
  );
};
