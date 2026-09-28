import React from "react";
import { type EnvStage } from "../../components/EnvBadge";
interface ChatHeaderProps {
    title?: string;
    subtitle?: string;
    onClose?: () => void;
    onReset?: () => void;
    onBack?: () => void;
    showMinimize?: boolean;
    /** Environment badge stage shown in the header. Omit for production. */
    envStage?: EnvStage;
    /** Whether the status dot pulses. Default: true */
    envPulse?: boolean;
}
declare const SVGComponent: (props: React.SVGProps<SVGSVGElement> & {
    width?: string;
    height?: string;
    Color?: string;
}) => React.JSX.Element;
export default SVGComponent;
export declare const ChatHeader: React.FC<ChatHeaderProps>;
export declare function useRestoreInputFocus(disabled: boolean, inputRef: React.RefObject<HTMLTextAreaElement | null>): void;
