import React, { useState } from "react";
import { BookOpen, ChevronDown, ChevronUp, ExternalLink, ShieldCheck } from "lucide-react";
import type { Source } from "../api/chatbot-types";

// Map document basenames to corresponding portal routes
const ROUTE_HINTS: Record<string, { label: string; path: string }> = {
  "fuel-defect-reporting": {
    label: "Fuel Defect Reporting",
    path: "/dashboard/fuel-Defect-Reporting",
  },
  "bunker-master": {
    label: "Bunker Master",
    path: "/dashboard/bunker-master",
  },
  "fsc-fsq-e-forms": {
    label: "Pre-Registration & E-Forms",
    path: "/dashboard/pre-registration",
  },
  "pre-registration-ship": {
    label: "Pre-Registration",
    path: "/dashboard/pre-registration",
  },
  "reports-fuel": {
    label: "Fuel Reports",
    path: "/dashboard/reports",
  },
  "sample-fuel": {
    label: "Sample Status",
    path: "/dashboard/sample-status",
  },
};

function getRouteHint(sourcePath: string): { label: string; path: string } | null {
  const filename = sourcePath.split(/[/\\]/).pop() || "";
  const stem = filename.replace(/\.md$/i, "").toLowerCase();
  for (const [key, value] of Object.entries(ROUTE_HINTS)) {
    if (stem.includes(key)) {
      return value;
    }
  }
  return null;
}

function formatDocTitle(source: Source): string {
  if (source.title) return source.title;
  const filename = source.source.split(/[/\\]/).pop() || source.source;
  return filename
    .replace(/\.md$/i, "")
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export interface GroundedSourcesProps {
  sources: Source[];
  /** If true, hides the "Inspect Sources" toggle button and details list */
  hideInspectSources?: boolean;
  /** Direct alias or inverted flag (default: true) */
  showInspectSources?: boolean;
  /** Whether the details view is open by default (default: false) */
  defaultExpanded?: boolean;
  /** Maximum number of grounded sources to display (default: 5) */
  maxSources?: number;
}

export const GroundedSources: React.FC<GroundedSourcesProps> = ({
  sources,
  hideInspectSources = false,
  showInspectSources = true,
  defaultExpanded = false,
  maxSources = 5,
}) => {
  const shouldHideInspect = hideInspectSources || showInspectSources === false;
  const [expanded, setExpanded] = useState(defaultExpanded && !shouldHideInspect);
  const [activeSnippetIdx, setActiveSnippetIdx] = useState<number | null>(null);

  if (!sources || !sources.length) return null;

  // Display top 5 grounded sources as requested
  const topSources = sources.slice(0, maxSources);

  return (
    <div className="grounded-sources-card">
      <div className="grounded-sources-header">
        <div className="grounded-sources-badge">
          <ShieldCheck size={13} className="grounded-shield-icon" />
          <span>Grounded in {topSources.length} Verified VPS Sources</span>
        </div>
        {!shouldHideInspect && (
          <button
            type="button"
            className="grounded-toggle-btn"
            onClick={() => setExpanded((prev) => !prev)}
            aria-expanded={expanded}
          >
            <span>{expanded ? "Hide Details" : "Inspect Sources"}</span>
            {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
        )}
      </div>

      <div className="grounded-pills-row">
        {topSources.map((source, idx) => {
          const title = formatDocTitle(source);
          const scorePct = Math.round(source.score * 100);
          const isSelected = activeSnippetIdx === idx;

          return (
            <button
              key={`${source.chunkId}-${idx}`}
              type="button"
              className={`grounded-source-pill${isSelected ? " grounded-source-pill--selected" : ""}`}
              onClick={() => {
                if (!shouldHideInspect) {
                  setExpanded(true);
                  setActiveSnippetIdx(isSelected ? null : idx);
                }
              }}
              title={source.source}
            >
              <BookOpen size={11} className="grounded-book-icon" />
              <span className="grounded-pill-title">{title}</span>
              <span className="grounded-pill-score">{scorePct}% match</span>
            </button>
          );
        })}
      </div>

      {!shouldHideInspect && expanded && (
        <div className="grounded-sources-details-list">
          {topSources.map((source, idx) => {
            const title = formatDocTitle(source);
            const scorePct = Math.round(source.score * 100);
            const routeHint = getRouteHint(source.source);
            const isHighlighted = activeSnippetIdx === idx;

            return (
              <div
                key={`detail-${source.chunkId}-${idx}`}
                className={`grounded-detail-item${isHighlighted ? " grounded-detail-item--highlighted" : ""}`}
              >
                <div className="grounded-detail-top">
                  <div className="grounded-detail-title-group">
                    <span className="grounded-detail-index">[{idx + 1}]</span>
                    <span className="grounded-detail-title">{title}</span>
                  </div>
                  <div className="grounded-detail-meta">
                    <span className="grounded-detail-score">{scorePct}% Match</span>
                    {routeHint && (
                      <a
                        href={routeHint.path}
                        onClick={(e) => {
                          e.preventDefault();
                          window.location.href = routeHint.path;
                        }}
                        className="grounded-route-link"
                        title={`Navigate to ${routeHint.label}`}
                      >
                        <span>{routeHint.label}</span>
                        <ExternalLink size={10} />
                      </a>
                    )}
                  </div>
                </div>

                <div className="grounded-detail-path">
                  <code>{source.source}</code>
                </div>

                {source.snippet && (
                  <p className="grounded-detail-snippet">
                    "{source.snippet}"
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
