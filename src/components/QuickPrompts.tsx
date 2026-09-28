import React from "react";

export interface QuickOption {
  label: string;
  query: string;
}

interface QuickPromptsProps {
  onSelectPrompt: (prompt: string) => void;
  options?: QuickOption[];
}

const DEFAULT_OPTIONS: QuickOption[] = [
  {
    label: "Get free training",
    query: "What training and fuel quality testing guides are available?",
  },
  {
    label: "Get Started free",
    query: "How do I pre-register fuel samples and get started in the portal?",
  },
  {
    label: "Chat with the sales team",
    query: "I would like to chat with the support and sales team.",
  },
];

export const QuickPrompts: React.FC<QuickPromptsProps> = ({
  onSelectPrompt,
  options = DEFAULT_OPTIONS,
}) => {
  return (
    <div className="quick-options-list">
      {options.map((opt, idx) => (
        <button
          key={idx}
          type="button"
          className="quick-option-pill-btn"
          onClick={() => onSelectPrompt(opt.query)}
        >
          <span>{opt.label}</span>
        </button>
      ))}
    </div>
  );
};
