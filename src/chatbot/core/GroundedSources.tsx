import React, { useState } from "react";
import { BookOpen, ExternalLink, Library } from "lucide-react";
import {
  Trace,
  TraceCollapsible,
  TraceCollapsibleContent,
  TraceCollapsibleTrigger,
  TraceDescription,
  TraceIcon,
  TraceLine,
  TraceTitle,
} from "../../components/ui/trace";
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

  const topSources = sources.slice(0, maxSources);
  const sourceLabel = topSources.length === 1 ? "source" : "sources";
  const summary = (
    <TraceLine>
      <TraceIcon><Library size={14} /></TraceIcon>
      <TraceTitle>{`${topSources.length} retrieved VPS ${sourceLabel}`}</TraceTitle>
      {!shouldHideInspect && (
        <TraceDescription>{expanded ? "Hide Details" : "Inspect Sources"}</TraceDescription>
      )}
    </TraceLine>
  );

  const sourceRows = (
    <Trace className="grounded-source-rows">
      {topSources.map((source, idx) => {
        const isSelected = activeSnippetIdx === idx;
        const line = (
          <TraceLine>
            <TraceIcon><BookOpen size={13} /></TraceIcon>
            <TraceTitle>[S{idx + 1}] {formatDocTitle(source)}</TraceTitle>
            <TraceDescription title="Ranking score, not a probability of correctness">
              Score {source.score.toFixed(2)}
            </TraceDescription>
          </TraceLine>
        );

        return shouldHideInspect ? (
          <div key={`${source.chunkId}-${idx}`}>{line}</div>
        ) : (
          <button
            key={`${source.chunkId}-${idx}`}
            type="button"
            className={`trace-trigger${expanded && isSelected ? " grounded-source-selected" : ""}`}
            aria-pressed={expanded && isSelected}
            onClick={() => {
              setExpanded(true);
              setActiveSnippetIdx(isSelected ? null : idx);
            }}
            title={source.source}
          >
            {line}
          </button>
        );
      })}
    </Trace>
  );

  if (shouldHideInspect) {
    return (
      <Trace className="grounded-sources-card">
        {summary}
        {sourceRows}
      </Trace>
    );
  }

  return (
    <Trace className="grounded-sources-card">
      <TraceCollapsible open={expanded} onOpenChange={setExpanded}>
        <TraceCollapsibleTrigger>{summary}</TraceCollapsibleTrigger>
        {sourceRows}
        <TraceCollapsibleContent>
          <div className="grounded-sources-details-list">
            {topSources.map((source, idx) => {
              const title = formatDocTitle(source);
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
                      <span className="grounded-detail-score">Rank score {source.score.toFixed(2)}</span>
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
                          <ExternalLink size={10} aria-hidden="true" />
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
        </TraceCollapsibleContent>
      </TraceCollapsible>
    </Trace>
  );
};
