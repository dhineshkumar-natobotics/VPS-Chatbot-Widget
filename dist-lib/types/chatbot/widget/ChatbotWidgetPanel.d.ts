import React from "react";
import { type EnvStage } from "../../components/EnvBadge";
interface ChatbotWidgetPanelProps {
    open: boolean;
    onClose: () => void;
    envStage?: EnvStage;
    envPulse?: boolean;
}
export declare const ChatbotWidgetPanel: React.FC<ChatbotWidgetPanelProps>;
export {};
