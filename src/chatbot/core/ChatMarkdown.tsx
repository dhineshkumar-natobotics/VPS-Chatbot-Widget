import React from "react";

export function safeHref(value: string): string | undefined {
  const url = value.trim();
  if (/[\u0000-\u001f\u007f]/.test(url)) return undefined;
  if (/^(https?:\/\/|mailto:|\/(?!\/)|#)/i.test(url)) return url;
  return undefined;
}

/**
 * Robust inline Markdown renderer supporting:
 * - Markdown links [text](url)
 * - Raw URLs https://...
 * - Bold **text**
 * - Italic *text* and _text_
 * - Inline code `text`
 */
function renderInline(text: string): React.ReactNode[] {
  if (!text) return [];

  // Match: [text](url) | **bold** | *italic* | `code` | https?://...
  const tokenRegex =
    /(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|https?:\/\/[^\s]+)/g;

  const parts = text.split(tokenRegex);

  return parts.map((part, index) => {
    if (!part) return null;

    // Markdown link: [text](url)
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      const linkText = linkMatch[1];
      const linkUrl = linkMatch[2];
      const href = safeHref(linkUrl);
      if (!href) return <React.Fragment key={index}>{linkText}</React.Fragment>;
      const isExternal = /^https?:\/\//i.test(linkUrl);
      return (
        <a
          key={index}
          href={href}
          target={isExternal ? "_blank" : undefined}
          rel={isExternal ? "noopener noreferrer" : undefined}
          className="md-link"
        >
          {linkText}
        </a>
      );
    }

    // Bold: **text**
    if (part.startsWith("**") && part.endsWith("**") && part.length >= 4) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }

    // Italic: *text*
    if (part.startsWith("*") && part.endsWith("*") && part.length >= 2) {
      return <em key={index}>{part.slice(1, -1)}</em>;
    }

    // Inline code: `code`
    if (part.startsWith("`") && part.endsWith("`") && part.length >= 2) {
      return (
        <code key={index} className="md-code">
          {part.slice(1, -1)}
        </code>
      );
    }

    // Raw URL: https://...
    if (/^https?:\/\//i.test(part)) {
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="md-link"
        >
          {part}
        </a>
      );
    }

    return <React.Fragment key={index}>{part}</React.Fragment>;
  });
}

type Block =
  | { type: "h"; level: number; content: string }
  | { type: "p"; lines: string[] }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "code"; lang: string; code: string }
  | { type: "quote"; lines: string[] }
  | { type: "hr" }
  | { type: "table"; headers: string[]; rows: string[][] };

/**
 * Line-by-line block parser for Markdown documents.
 * Correctly distinguishes lists, headers, code fences, blockquotes, and paragraphs.
 */
function parseBlocks(markdown: string): Block[] {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];

  let i = 0;
  while (i < lines.length) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    // 1. Skip completely empty lines
    if (!trimmed) {
      i++;
      continue;
    }

    // 2. Code blocks (```lang ... ```)
    if (trimmed.startsWith("```")) {
      const lang = trimmed.slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      if (i < lines.length && lines[i].trim().startsWith("```")) {
        i++; // skip closing fence
      }
      blocks.push({ type: "code", lang, code: codeLines.join("\n") });
      continue;
    }

    // 3. Horizontal rule (--- or ***)
    if (/^(---|___|\*\*\*)$/.test(trimmed)) {
      blocks.push({ type: "hr" });
      i++;
      continue;
    }

    // 4. Headings (# to ####)
    const headingMatch = trimmed.match(/^(#{1,4})\s+(.*)$/);
    if (headingMatch) {
      blocks.push({
        type: "h",
        level: headingMatch[1].length,
        content: headingMatch[2],
      });
      i++;
      continue;
    }

    // 5. Blockquote (> ...)
    if (trimmed.startsWith(">")) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith(">")) {
        quoteLines.push(lines[i].trim().replace(/^>\s?/, ""));
        i++;
      }
      blocks.push({ type: "quote", lines: quoteLines });
      continue;
    }

    // 6. Unordered list (- or *)
    if (/^[-*]\s+/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^[-*]\s+/, ""));
        i++;
      }
      blocks.push({ type: "ul", items });
      continue;
    }

    // 7. Ordered list (1. 2. ...)
    if (/^\d+\.\s+/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+\.\s+/, ""));
        i++;
      }
      blocks.push({ type: "ol", items });
      continue;
    }

    // 8. Markdown table (| col | col |)
    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith("|") && lines[i].trim().endsWith("|")) {
        tableLines.push(lines[i].trim());
        i++;
      }
      if (tableLines.length >= 2) {
        const parseRow = (line: string) =>
          line
            .slice(1, -1)
            .split("|")
            .map((c) => c.trim());
        const headers = parseRow(tableLines[0]);
        // line 1 is usually separator (|---|---|)
        const rowStartIndex = tableLines[1].includes("-") ? 2 : 1;
        const rows = tableLines.slice(rowStartIndex).map(parseRow);
        blocks.push({ type: "table", headers, rows });
        continue;
      }
    }

    // 9. Standard paragraph (accumulate contiguous lines until next empty line or block token)
    const pLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !lines[i].trim().startsWith("```") &&
      !/^(#{1,4})\s+/.test(lines[i].trim()) &&
      !/^[-*]\s+/.test(lines[i].trim()) &&
      !/^\d+\.\s+/.test(lines[i].trim()) &&
      !lines[i].trim().startsWith(">") &&
      !/^(---|___|\*\*\*)$/.test(lines[i].trim())
    ) {
      pLines.push(lines[i].trim());
      i++;
    }
    if (pLines.length > 0) {
      blocks.push({ type: "p", lines: pLines });
    }
  }

  return blocks;
}

export const ChatMarkdown = React.memo(function ChatMarkdown({ text }: { text: string }) {
  if (!text) return null;

  const blocks = parseBlocks(text);

  return (
    <div className="md-content">
      {blocks.map((block, idx) => {
        switch (block.type) {
          case "h": {
            if (block.level === 1) return <h2 key={idx} className="md-h1">{renderInline(block.content)}</h2>;
            if (block.level === 2) return <h3 key={idx} className="md-h2">{renderInline(block.content)}</h3>;
            if (block.level === 3) return <h4 key={idx} className="md-h3">{renderInline(block.content)}</h4>;
            return <h5 key={idx} className="md-h4">{renderInline(block.content)}</h5>;
          }
          case "ul":
            return (
              <ul key={idx} className="md-ul">
                {block.items.map((item, itemIdx) => (
                  <li key={itemIdx} className="md-li">
                    {renderInline(item)}
                  </li>
                ))}
              </ul>
            );
          case "ol":
            return (
              <ol key={idx} className="md-ol">
                {block.items.map((item, itemIdx) => (
                  <li key={itemIdx} className="md-li">
                    {renderInline(item)}
                  </li>
                ))}
              </ol>
            );
          case "code":
            return (
              <pre key={idx} className="md-pre">
                <code>{block.code}</code>
              </pre>
            );
          case "quote":
            return (
              <blockquote key={idx} className="md-quote">
                {block.lines.map((line, qIdx) => (
                  <p key={qIdx}>{renderInline(line)}</p>
                ))}
              </blockquote>
            );
          case "hr":
            return <hr key={idx} className="md-hr" />;
          case "table":
            return (
              <div key={idx} className="md-table-wrap">
                <table className="md-table">
                  <thead>
                    <tr>
                      {block.headers.map((h, hIdx) => (
                        <th key={hIdx}>{renderInline(h)}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {block.rows.map((row, rIdx) => (
                      <tr key={rIdx}>
                        {row.map((cell, cIdx) => (
                          <td key={cIdx}>{renderInline(cell)}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          case "p":
          default:
            return (
              <p key={idx} className="md-p">
                {block.lines.map((line, lineIdx) => (
                  <React.Fragment key={lineIdx}>
                    {renderInline(line)}
                    {lineIdx < block.lines.length - 1 && <br />}
                  </React.Fragment>
                ))}
              </p>
            );
        }
      })}
    </div>
  );
});
