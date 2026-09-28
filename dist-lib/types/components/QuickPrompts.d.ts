import React from "react";
export interface QuickOption {
    label: string;
    query: string;
}
interface QuickPromptsProps {
    onSelectPrompt: (prompt: string) => void;
    options?: QuickOption[];
}
export declare const QuickPrompts: React.FC<QuickPromptsProps>;
export {};
