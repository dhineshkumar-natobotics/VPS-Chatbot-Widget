/**
 * TypingProgressBar.tsx
 *
 * A slim, bottom-anchored animated progress strip that is shown while the
 * AI is generating a response.  It cycles through contextual phase labels
 * with a fade-in → hold → fade-out rhythm so the user always knows the
 * system is actively working.
 *
 * Features
 * ─────────
 *  • Smooth shimmer fill bar (CSS animation)
 *  • Rotating phase labels that fade in/out every 2.2 s
 *  • Dynamic icon from lucide-react that matches the current phase
 *  • Mounts with a slide-up animation, unmounts with slide-down
 */
import React from "react";
interface TypingProgressBarProps {
    isVisible: boolean;
}
export declare const TypingProgressBar: React.FC<TypingProgressBarProps>;
export {};
