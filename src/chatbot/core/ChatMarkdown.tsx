import React from "react";

function renderInline(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|https?:\/\/[^\s]+)/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={index}
          className="rounded bg-[var(--input-bg)] px-1 py-0.5 font-mono text-[12px] text-foreground"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    if (/^https?:\/\//.test(part)) {
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2"
        >
          {part}
        </a>
      );
    }
    return <React.Fragment key={index}>{part}</React.Fragment>;
  });
}

export function ChatMarkdown({ text }: { text: string }) {
  if (!text) return null;

  const blocks = text.split(/\n\n+/);
  return (
    <>
      {blocks.map((block, blockIndex) => {
        if (block.trim().startsWith("- ") || block.trim().startsWith("* ")) {
          const items = block
            .split(/\n/)
            .filter((line) => line.trim().startsWith("- ") || line.trim().startsWith("* "));
          return (
            <ul key={blockIndex} className="my-1.5 ml-4 list-disc space-y-0.5">
              {items.map((item, itemIndex) => (
                <li key={itemIndex}>{renderInline(item.replace(/^[-*]\s+/, ""))}</li>
              ))}
            </ul>
          );
        }

        if (/^\d+\.\s+/.test(block.trim())) {
          const items = block.split(/\n/).filter((line) => /^\d+\.\s+/.test(line.trim()));
          return (
            <ol key={blockIndex} className="my-1.5 ml-4 list-decimal space-y-0.5">
              {items.map((item, itemIndex) => (
                <li key={itemIndex}>{renderInline(item.replace(/^\d+\.\s+/, ""))}</li>
              ))}
            </ol>
          );
        }

        if (block.startsWith("```")) {
          const content = block.replace(/^```[a-zA-Z]*\n?/, "").replace(/```$/, "");
          return (
            <pre
              key={blockIndex}
              className="my-2 overflow-x-auto rounded-lg bg-[var(--code-bg)] p-3 font-mono text-[12px] text-primary-foreground"
            >
              <code>{content}</code>
            </pre>
          );
        }

        return (
          <p key={blockIndex} className="mb-2 last:mb-0 whitespace-pre-wrap">
            {renderInline(block)}
          </p>
        );
      })}
    </>
  );
}
