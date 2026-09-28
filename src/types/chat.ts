export interface Source {
  chunk_id: string;
  source: string;
  score: number;
}

export interface ToolCall {
  tool_name: string;
  arguments: Record<string, any>;
  result: Record<string, any>;
}

export interface TokenUsage {
  model: string;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  sources?: Source[];
  tool_calls?: ToolCall[];
  usage?: TokenUsage;
  error?: boolean;
}

export interface Customer {
  customer_id: string;
  name: string;
  company: string;
  email: string;
  phone?: string | null;
  plan: string;
  vessels_count: number;
  transformers_count: number;
}

export interface Ticket {
  ticket_id: string;
  customer_id: string;
  customer_email: string;
  subject: string;
  description: string;
  priority: "low" | "medium" | "high" | "urgent" | string;
  status: "open" | "in_progress" | "resolved" | "closed" | string;
  created_at: string;
  updated_at: string;
}

export interface SessionResponse {
  session_id: string;
  created_at: string;
}

export interface ChatApiResponse {
  request_id: string;
  session_id: string;
  answer: string;
  sources: Source[];
  tool_calls: ToolCall[];
  usage: TokenUsage;
}
