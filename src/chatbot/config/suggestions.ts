import type { Suggestion } from "../api/chatbot-types";

/** Domain prompts derived from the VPS Customer Portal FAQ knowledge base. */
export const DEFAULT_SUGGESTIONS: Suggestion[] = [
  {
    label: "How do I access my reports?",
    query: "How do I access my reports in the VPS Customer Portal?",
  },
  {
    label: "Where can I find sample status?",
    query: "Where can I find my sample status?",
  },
  {
    label: "How do I pre-register a sample?",
    query: "How do I pre-register a sample in the portal?",
  },
  {
    label: "How do I contact VPS Support?",
    query: "How can I contact VPS Customer Support?",
  },
];
