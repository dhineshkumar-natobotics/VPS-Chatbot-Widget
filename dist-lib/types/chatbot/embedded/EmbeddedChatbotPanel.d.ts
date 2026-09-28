import React from "react";
import { type EnvStage } from "../../components/EnvBadge";
interface EmbeddedChatbotPanelProps {
    open: boolean;
    onClose: () => void;
    subtitle?: string;
    title?: string;
    envStage?: EnvStage;
    envPulse?: boolean;
}
export declare const EmbeddedChatbotPanel: React.FC<EmbeddedChatbotPanelProps>;
export {};
