import React from "react";
import { type EnvStage } from "./EnvBadge";
export type WidgetViewPreset = "bot" | "agent" | "ended" | "live";
interface ChatWidgetProps {
    mode?: "floating" | "embedded";
    onClose?: () => void;
    preset?: WidgetViewPreset;
    /** Environment badge stage shown in the header. Omit for production. */
    envStage?: EnvStage;
    /** Whether the dot inside the badge pulses. Default: true */
    envPulse?: boolean;
}
export declare const ChatWidget: React.FC<ChatWidgetProps>;
export {};
