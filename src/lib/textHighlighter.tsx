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
import { Linkedin, Youtube, Github, Twitter, ExternalLink, Globe } from "lucide-react";

// ── Token types ────────────────────────────────────────────────────────────────
type TokenKind =
  | "double-quote"
  | "single-quote"
  | "date"
  | "time"
  | "url"
  | "text";

interface Token {
  kind: TokenKind;
  value: string;
}

// ── Master regex (order matters — longer / more specific first) ────────────────
const MASTER_REGEX = new RegExp(
  [
    // URL  (must come before quotes so http://... isn't split mid-string)
    String.raw`(https?:\/\/[^\s"'<>]+)`,
    // ISO datetime  2026-09-11T14:41:29 or 2026-09-11 14:41:29
    String.raw`(\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}(?::\d{2})?)`,
    // ISO date  2026-09-11
    String.raw`(\d{4}-\d{2}-\d{2})`,
    // Human date  Sep 11, 2026  /  11 September 2026  /  September 11, 2026
    String.raw`(\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{1,2},?\s+\d{4}|\b\d{1,2}\s+(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{4})`,
    // Time  14:41:29 / 14:41 / 2:30 PM / 2:30 am
    String.raw`(\b\d{1,2}:\d{2}(?::\d{2})?(?:\s?[APap][Mm])?\b)`,
    // Double-quoted string  "..."
    String.raw`("(?:[^"\\]|\\.)*")`,
    // Single-quoted string  '...'  (apostrophes inside words excluded by \b guard)
    String.raw`('(?:[^'\\]|\\.)*')`,
  ].join("|"),
  "g"
);

function classifyMatch(match: RegExpExecArray): Token {
  const [full, url, isoDatetime, isoDate, humanDate, time, dq, sq] = match;

  if (url) return { kind: "url", value: url };
  if (isoDatetime) return { kind: "date", value: isoDatetime }; // datetime → treat as date (contains time)
  if (isoDate) return { kind: "date", value: isoDate };
  if (humanDate) return { kind: "date", value: humanDate };
  if (time) return { kind: "time", value: time };
  if (dq) return { kind: "double-quote", value: dq };
  if (sq) return { kind: "single-quote", value: sq };
  return { kind: "text", value: full };
}

// ── Tokeniser ──────────────────────────────────────────────────────────────────
function tokenise(text: string): Token[] {
  const tokens: Token[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  MASTER_REGEX.lastIndex = 0;

  while ((match = MASTER_REGEX.exec(text)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({ kind: "text", value: text.slice(lastIndex, match.index) });
    }
    tokens.push(classifyMatch(match));
    lastIndex = MASTER_REGEX.lastIndex;
  }

  if (lastIndex < text.length) {
    tokens.push({ kind: "text", value: text.slice(lastIndex) });
  }

  return tokens;
}

// ── Inline bold / code inside plain text segments ─────────────────────────────
const INLINE_REGEX = /(\*\*.*?\*\*|`.*?`)/g;

function renderPlainSegment(text: string): React.ReactNode[] {
  const parts = text.split(INLINE_REGEX);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code key={i} className="inline-code">
          {part.slice(1, -1)}
        </code>
      );
    }
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
}

// ── Token → React element ──────────────────────────────────────────────────────
function renderToken(token: Token, idx: number): React.ReactNode {
  switch (token.kind) {
    case "double-quote":
      return (
        <span key={idx} className="hl-double-quote" title="Quoted value">
          {token.value}
        </span>
      );

    case "single-quote":
      return (
        <span key={idx} className="hl-single-quote" title="Quoted value">
          {token.value}
        </span>
      );

    case "date":
      return (
        <span key={idx} className="hl-date" title="Date / DateTime">
          📅 {token.value}
        </span>
      );

    case "time":
      return (
        <span key={idx} className="hl-time" title="Time">
          🕐 {token.value}
        </span>
      );

    case "url": {
      const href = token.value.startsWith("http")
        ? token.value
        : `https://${token.value}`;

      // Resolve platform from hostname
      let hostname = "";
      try { hostname = new URL(href).hostname.replace(/^www\./, ""); } catch {}

      const isLinkedIn = hostname.includes("linkedin.com");
      const isYouTube  = hostname.includes("youtube.com") || hostname.includes("youtu.be");
      const isGitHub   = hostname.includes("github.com");
      const isTwitter  = hostname.includes("twitter.com") || hostname.includes("x.com");

      const Icon = isLinkedIn ? Linkedin
                 : isYouTube  ? Youtube
                 : isGitHub   ? Github
                 : isTwitter  ? Twitter
                 : ExternalLink;

      const badgeClass = isLinkedIn ? "hl-link hl-link--linkedin"
                       : isYouTube  ? "hl-link hl-link--youtube"
                       : isGitHub   ? "hl-link hl-link--github"
                       : isTwitter  ? "hl-link hl-link--twitter"
                       : "hl-link";

      // Short label — use platform name instead of full URL when recognisable
      const shortLabel = isLinkedIn ? "LinkedIn"
                       : isYouTube  ? "YouTube"
                       : isGitHub   ? "GitHub"
                       : isTwitter  ? "Twitter / X"
                       : token.value.length > 45
                         ? token.value.slice(0, 45) + "…"
                         : token.value;

      return (
        <a
          key={idx}
          href={href}
          className={badgeClass}
          target="_blank"
          rel="noopener noreferrer"
          title={href}
        >
          <Icon size={13} />
          <span>{shortLabel}</span>
          <Globe size={10} className="hl-link-external-hint" />
        </a>
      );
    }

    case "text":
    default:
      return (
        <React.Fragment key={idx}>
          {renderPlainSegment(token.value)}
        </React.Fragment>
      );
  }
}

// ── Public API ─────────────────────────────────────────────────────────────────
export function renderHighlightedText(text: string): React.ReactNode {
  if (!text) return null;
  const tokens = tokenise(text);
  return <>{tokens.map((t, i) => renderToken(t, i))}</>;
}
