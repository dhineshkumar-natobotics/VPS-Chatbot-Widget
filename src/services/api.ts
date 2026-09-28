import { ChatApiResponse, Message, SessionResponse } from "../types/chat";

const API_BASE = "";

export class ChatService {
  static async createSession(): Promise<string> {
    const response = await fetch(`${API_BASE}/api/v1/sessions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) {
      throw new Error(`Failed to create session: ${response.statusText}`);
    }
    const data: SessionResponse = await response.json();
    return data.session_id;
  }

  static async sendMessage(sessionId: string, message: string): Promise<ChatApiResponse> {
    const response = await fetch(`${API_BASE}/api/v1/sessions/${sessionId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      const message = err?.error?.message || `Server error (${response.status})`;
      throw new Error(message);
    }
    return response.json();
  }

  static async getHistory(sessionId: string): Promise<Message[]> {
    const response = await fetch(`${API_BASE}/api/v1/sessions/${sessionId}/messages`);
    if (!response.ok) {
      return [];
    }
    const data = await response.json();
    return (data.messages || []).map((m: any) => ({
      id: m.id,
      role: m.role,
      content: m.content,
      timestamp: m.created_at || new Date().toISOString(),
      usage: m.model ? {
        model: m.model,
        prompt_tokens: m.prompt_tokens || 0,
        completion_tokens: m.completion_tokens || 0,
        total_tokens: (m.prompt_tokens || 0) + (m.completion_tokens || 0),
      } : undefined,
    }));
  }

  static async closeSession(sessionId: string): Promise<void> {
    await fetch(`${API_BASE}/api/v1/sessions/${sessionId}`, {
      method: "DELETE",
    }).catch(() => {});
  }

  static async checkHealth(): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/health`);
      return res.ok;
    } catch {
      return false;
    }
  }

  static async getCustomers(): Promise<any[]> {
    return [];
  }

  static async getTickets(): Promise<any[]> {
    return [];
  }
}
