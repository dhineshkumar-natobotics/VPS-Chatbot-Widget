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
          className="md-code"
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
          className="md-link"
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
            <ul key={blockIndex} className="md-ul">
              {items.map((item, itemIndex) => (
                <li key={itemIndex}>{renderInline(item.replace(/^[-*]\s+/, ""))}</li>
              ))}
            </ul>
          );
        }

        if (/^\d+\.\s+/.test(block.trim())) {
          const items = block.split(/\n/).filter((line) => /^\d+\.\s+/.test(line.trim()));
          return (
            <ol key={blockIndex} className="md-ol">
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
              className="md-pre"
            >
              <code>{content}</code>
            </pre>
          );
        }

        return (
          <p key={blockIndex} className="md-p">
            {renderInline(block)}
          </p>
        );
      })}
    </>
  );
}
