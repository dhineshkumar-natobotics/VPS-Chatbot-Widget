/**
 * ResponseIconMapper.tsx
 *
 * Analyses assistant message content and renders a context-aware status
 * icon badge above/beside the bubble to give instant visual cues about
 * the nature of the response.
 *
 * Mappings (first match wins):
 *  ─ Error / not-found keywords → AlertCircle  (red)
 *  ─ Database / ticket keywords  → Database    (indigo)
 *  ─ LinkedIn URL present        → Linkedin    (blue)
 *  ─ YouTube URL present         → Youtube     (red)
 *  ─ Link / URL present          → Link2       (orange)
 *  ─ Success / resolved          → CheckCircle2 (green)
 *  ─ Warning / urgent            → AlertTriangle (amber)
 *  ─ Info / help / guide         → Info         (sky)
 *  ─ Chemical / sample / bunker  → FlaskConical (teal)
 *  ─ Vessel / ship               → Anchor       (slate)
 *  ─ Default                     → MessageSquare (muted)
 */
import React from "react";
interface ResponseIconMapperProps {
    content: string;
}
export declare const ResponseIconMapper: React.FC<ResponseIconMapperProps>;
export {};
