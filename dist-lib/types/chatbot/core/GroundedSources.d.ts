import React from "react";
import type { Source } from "../api/chatbot-types";
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
export declare const GroundedSources: React.FC<GroundedSourcesProps>;
