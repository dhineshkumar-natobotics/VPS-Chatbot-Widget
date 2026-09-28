import React, { useState } from "react";
import { ChevronDown, ChevronUp, FileText } from "lucide-react";
import { Source } from "../types/chat";

interface SourceCitationsProps {
  sources?: Source[];
}

export const SourceCitations: React.FC<SourceCitationsProps> = ({ sources }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!sources || sources.length === 0) return null;

  return (
    <div className="sources-container">
      <button
        className="sources-btn"
        onClick={() => setIsOpen(!isOpen)}
        type="button"
      >
        <FileText size={12} />
        <span>
          {sources.length} Grounded Source{sources.length > 1 ? "s" : ""}
        </span>
        {isOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
      </button>

      {isOpen && (
        <div className="sources-list">
          {sources.map((src, idx) => {
            const fileName = src.source.split(/[/\\]/).pop() || src.source;
            const percentage = Math.round(src.score * 100);
            return (
              <div key={idx} className="source-item">
                <span className="source-name" title={src.source}>
                  📄 {fileName}
                </span>
                <span className="source-badge">{percentage}% match</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
