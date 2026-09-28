import React from "react";
import { type EnvStage } from "../../components/EnvBadge";
interface ChatPanelProps {
    className?: string;
    onClose?: () => void;
    showMinimize?: boolean;
    title?: string;
    subtitle?: string;
    /** Environment badge stage. Omit for production. */
    envStage?: EnvStage;
    envPulse?: boolean;
}
export declare const ChatPanel: React.FC<ChatPanelProps>;
export {};
