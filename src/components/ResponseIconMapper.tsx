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
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Database,
  Linkedin,
  Youtube,
  Link2,
  Info,
  FlaskConical,
  Anchor,
  MessageSquare,
} from "lucide-react";

// ── Rule definition ────────────────────────────────────────────────────────────
interface IconRule {
  /** Test the lower-cased message content */
  test: (content: string) => boolean;
  Icon: React.ElementType;
  label: string;
  /** CSS class applied to the badge wrapper */
  variant: "error" | "warning" | "success" | "info" | "linkedin" | "youtube" | "link" | "database" | "chem" | "vessel" | "muted";
}

const RULES: IconRule[] = [
  // ── Error / not found ────────────────────────────────────────────────────────
  {
    test: (c) =>
      /does not exist|not found|no record|unable to|failed|error|invalid|not in (the )?(vps )?database/i.test(c),
    Icon: AlertCircle,
    label: "Not found / Error",
    variant: "error",
  },
  // ── Warning / urgent ─────────────────────────────────────────────────────────
  {
    test: (c) => /urgent|warning|caution|high priority|overdue|critical/i.test(c),
    Icon: AlertTriangle,
    label: "Warning",
    variant: "warning",
  },
  // ── LinkedIn ─────────────────────────────────────────────────────────────────
  {
    test: (c) => /linkedin\.com/i.test(c),
    Icon: Linkedin,
    label: "LinkedIn",
    variant: "linkedin",
  },
  // ── YouTube ──────────────────────────────────────────────────────────────────
  {
    test: (c) => /youtube\.com|youtu\.be/i.test(c),
    Icon: Youtube,
    label: "YouTube",
    variant: "youtube",
  },
  // ── Generic link ─────────────────────────────────────────────────────────────
  {
    test: (c) => /https?:\/\//i.test(c),
    Icon: Link2,
    label: "Contains links",
    variant: "link",
  },
  // ── Success / resolved ───────────────────────────────────────────────────────
  {
    test: (c) =>
      /resolved|completed|done|success|confirmed|fixed|closed/i.test(c),
    Icon: CheckCircle2,
    label: "Resolved",
    variant: "success",
  },
  // ── Database / ticket ────────────────────────────────────────────────────────
  {
    test: (c) =>
      /ticket|database|record|customer id|session|query|tck-/i.test(c),
    Icon: Database,
    label: "Database / Ticket",
    variant: "database",
  },
  // ── Chemical / sample / bunker ───────────────────────────────────────────────
  {
    test: (c) =>
      /chemical|viscosity|bunker|sample|screening|kinematic/i.test(c),
    Icon: FlaskConical,
    label: "Chemical / Lab",
    variant: "chem",
  },
  // ── Vessel / ship ────────────────────────────────────────────────────────────
  {
    test: (c) => /vessel|ship|northern star|mv |maritime/i.test(c),
    Icon: Anchor,
    label: "Vessel",
    variant: "vessel",
  },
  // ── Info / help ──────────────────────────────────────────────────────────────
  {
    test: (c) => /help|guide|tip|information|learn more|here is/i.test(c),
    Icon: Info,
    label: "Information",
    variant: "info",
  },
];

function resolveRule(content: string): IconRule {
  for (const rule of RULES) {
    if (rule.test(content)) return rule;
  }
  return {
    test: () => true,
    Icon: MessageSquare,
    label: "Response",
    variant: "muted",
  };
}

// ── Component ──────────────────────────────────────────────────────────────────
interface ResponseIconMapperProps {
  content: string;
}

export const ResponseIconMapper: React.FC<ResponseIconMapperProps> = ({
  content,
}) => {
  const { Icon, label, variant } = resolveRule(content);

  return (
    <span
      className={`resp-icon-badge resp-icon-badge--${variant}`}
      title={label}
      aria-label={label}
    >
      <Icon size={12} />
    </span>
  );
};
