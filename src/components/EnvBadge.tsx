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
import {
  FlaskConical,
  TestTubeDiagonal,
  Microscope,
  ClipboardCheck,
} from "lucide-react";

// ── Public type (exported so parent props can reference it) ────────────────────
export type EnvStage = "alpha" | "beta" | "gamma" | "qa";

// ── Per-stage config ───────────────────────────────────────────────────────────
interface StageConfig {
  label: string;
  Icon: React.ElementType;
  /** CSS modifier class on .env-badge */
  variant: string;
  tooltip: string;
}

const STAGE_CONFIG: Record<EnvStage, StageConfig> = {
  alpha: {
    label: "Alpha",
    Icon: FlaskConical,
    variant: "env-badge--alpha",
    tooltip: "Alpha build — internal testing only",
  },
  beta: {
    label: "Beta",
    Icon: TestTubeDiagonal,
    variant: "env-badge--beta",
    tooltip: "Beta build — public pre-release",
  },
  gamma: {
    label: "Gamma",
    Icon: Microscope,
    variant: "env-badge--gamma",
    tooltip: "Gamma / Release Candidate",
  },
  qa: {
    label: "QA",
    Icon: ClipboardCheck,
    variant: "env-badge--qa",
    tooltip: "Quality Assurance build",
  },
};

// ── Props ──────────────────────────────────────────────────────────────────────
interface EnvBadgeProps {
  /** Build stage to display. Omit entirely for production (renders nothing). */
  stage?: EnvStage;
  /** Whether the status dot pulses. Default: true */
  pulse?: boolean;
  /** Extra CSS class forwarded to the root element */
  className?: string;
}

// ── Component ──────────────────────────────────────────────────────────────────
export const EnvBadge: React.FC<EnvBadgeProps> = ({
  stage,
  pulse = true,
  className = "",
}) => {
  if (!stage) return null;

  const { label, Icon, variant, tooltip } = STAGE_CONFIG[stage];

  return (
    <span
      className={`env-badge-inline ${variant} ${className}`.trim()}
      title={tooltip}
      aria-label={`${label} build`}
      role="status"
    >

      {/* Icon */}
      <Icon size={10} className="env-badge-icon" aria-hidden="true" />

      {/* Label */}
      <span className="env-badge-inline-label">{label}</span>
    </span>
  );
};
