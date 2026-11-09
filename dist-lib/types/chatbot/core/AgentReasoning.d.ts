import React from "react";
interface AgentReasoningProps {
    status?: "pending" | "complete" | "error";
    progressText?: string;
    durationMs?: number;
}
export declare const AgentReasoning: React.FC<AgentReasoningProps>;
export {};
