import React from "react";
import { EnvStage } from "./EnvBadge";
export type HeaderMode = "bot" | "agent" | "ended";
interface ChatHeaderProps {
    headerMode?: HeaderMode;
    ticketId?: string;
    subtitle?: string;
    duration?: string;
    agentInitials?: string;
    onBack?: () => void;
    onReset?: () => void;
    onClose?: () => void;
    isFloating?: boolean;
    /** Environment stage badge — omit for production */
    envStage?: EnvStage;
    /** Whether the status dot inside the badge pulses. Default: true */
    envPulse?: boolean;
}
export declare const ChatHeader: React.FC<ChatHeaderProps>;
export {};
