/**
 * EnvBadge.tsx
 *
 * Renders a compact, animated environment stage badge.
 *
 * Supported stages
 * ─────────────────
 *   "alpha"  – earliest internal build  (purple / FlaskConical)
 *   "beta"   – public pre-release        (blue   / TestTubeDiagonal)
 *   "gamma"  – release candidate         (teal   / Microscope)
 *   "qa"     – quality assurance         (amber  / ClipboardCheck)
 *
 * Usage
 * ──────
 *   <EnvBadge stage="beta" />
 *   <EnvBadge stage="alpha" pulse={false} />
 *
 * Returns null when `stage` is undefined → zero footprint in production.
 */
import React from "react";
export type EnvStage = "alpha" | "beta" | "gamma" | "qa";
interface EnvBadgeProps {
    /** Build stage to display. Omit entirely for production (renders nothing). */
    stage?: EnvStage;
    /** Whether the status dot pulses. Default: true */
    pulse?: boolean;
    /** Extra CSS class forwarded to the root element */
    className?: string;
}
export declare const EnvBadge: React.FC<EnvBadgeProps>;
export {};
