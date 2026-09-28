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

import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Database,
  Brain,
  FileText,
  CheckCircle2,
  Loader2,
  Zap,
} from "lucide-react";

// ── Phase definitions ──────────────────────────────────────────────────────────
interface Phase {
  label: string;
  Icon: React.ElementType;
}

const PHASES: Phase[] = [
  { label: "Searching knowledge base…",  Icon: Search       },
  { label: "Querying database…",         Icon: Database     },
  { label: "Analysing your request…",    Icon: Brain        },
  { label: "Composing response…",        Icon: FileText     },
  { label: "Verifying information…",     Icon: CheckCircle2 },
  { label: "Almost there…",             Icon: Zap          },
];

const PHASE_DURATION_MS = 2200;

interface TypingProgressBarProps {
  isVisible: boolean;
}

export const TypingProgressBar: React.FC<TypingProgressBarProps> = ({
  isVisible,
}) => {
  const [phaseIdx, setPhaseIdx]     = useState(0);
  const [textVisible, setTextVisible] = useState(true); // drives fade in/out
  const [mounted, setMounted]       = useState(false);  // drives slide-up/down
  const intervalRef                 = useRef<ReturnType<typeof setInterval> | null>(null);
  const fadeRef                     = useRef<ReturnType<typeof setTimeout>  | null>(null);

  // Slide-up on show, slide-down on hide
  useEffect(() => {
    if (isVisible) {
      setMounted(true);
      setPhaseIdx(0);
      setTextVisible(true);
    } else {
      // let the slide-down animation play before unmounting
      const t = setTimeout(() => setMounted(false), 400);
      return () => clearTimeout(t);
    }
  }, [isVisible]);

  // Cycle phases with fade-in/out
  useEffect(() => {
    if (!isVisible) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (fadeRef.current)     clearTimeout(fadeRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      // fade out → wait → swap text → fade in
      setTextVisible(false);
      fadeRef.current = setTimeout(() => {
        setPhaseIdx((prev) => (prev + 1) % PHASES.length);
        setTextVisible(true);
      }, 350); // half of fade transition
    }, PHASE_DURATION_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (fadeRef.current)     clearTimeout(fadeRef.current);
    };
  }, [isVisible]);

  if (!mounted) return null;

  const { label, Icon } = PHASES[phaseIdx];

  return (
    <div className={`typing-progress-bar-root ${isVisible ? "tpb-enter" : "tpb-exit"}`}>
      {/* Shimmer fill track */}
      <div className="tpb-shimmer-track">
        <div className="tpb-shimmer-fill" />
      </div>

      {/* Phase label row */}
      <div className={`tpb-label-row ${textVisible ? "tpb-label-in" : "tpb-label-out"}`}>
        <Loader2 size={12} className="tpb-spinner-icon" />
        <Icon size={13} className="tpb-phase-icon" />
        <span className="tpb-phase-text">{label}</span>
      </div>
    </div>
  );
};
