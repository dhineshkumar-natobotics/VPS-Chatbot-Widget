/**
 * textHighlighter.tsx
 *
 * Dynamically highlights:
 *  - Double-quoted strings  "..."  → amber/yellow
 *  - Single-quoted strings  '...'  → sky/blue
 *  - ISO dates & human-readable dates  2026-09-11 / Sep 11, 2026  → green
 *  - Times  14:41:29 / 2:30 PM  → purple
 *  - URLs / links  https://...  → platform-aware badge (LinkedIn, YouTube, etc.)
 *
 * Usage:
 *   renderHighlightedText("Check ticket 'TCK-1001' created on 2026-09-11")
 */
import React from "react";
export declare function renderHighlightedText(text: string): React.ReactNode;
