import React from "react";
import type { ToolCall } from "../api/chatbot-types";
interface AgentReasoningProps {
    status?: "pending" | "complete" | "stopped";
    progressText?: string;
    progressSteps?: string[];
    durationMs?: number;
    toolCalls?: ToolCall[];
}
export declare const AgentReasoning: React.FC<AgentReasoningProps>;
export {};
