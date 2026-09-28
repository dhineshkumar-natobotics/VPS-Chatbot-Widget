import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ChatProvider } from "../chatbot/core/ChatProvider";
import { ChatbotWidget } from "../chatbot/widget/ChatbotWidget";
import { EmbeddedChatbot } from "../chatbot/embedded/EmbeddedChatbot";
import { ChatPanel } from "../chatbot/core/ChatPanel";
import { buildApiUrl, resolveApiBaseUrl } from "./api/chatbot-api";


vi.mock("@shadcn/react/message-scroller", async () => {
  return await import("../test/message-scroller-stub");
});

function jsonResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    text: async () => JSON.stringify(body),
    json: async () => body,
  } as Response;
}

const usage = {
  model: "test-model",
  prompt_tokens: 1,
  completion_tokens: 2,
  total_tokens: 3,
};

describe("chatbot UI", () => {
  beforeEach(() => {
    window.localStorage.removeItem("vps-embedded-assistant-top");
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input);
        const method = (init?.method || "GET").toUpperCase();

        if (url.endsWith("/api/v1/sessions") && method === "POST") {
          return jsonResponse({
            session_id: "session-1",
            created_at: "2026-01-01T00:00:00Z",
          });
        }
        if (url.includes("/api/v1/sessions/session-1/messages") && method === "POST") {
          return jsonResponse({
            request_id: "req-1",
            session_id: "session-1",
            answer: "Transformer oil reports are available in the Reports page.",
            sources: [],
            tool_calls: [],
            usage,
          });
        }
        return jsonResponse({ error: { message: "Not found" } }, 404);
      })
    );
  });

  it("opens and closes the widget", async () => {
    const user = userEvent.setup();
    render(
      <ChatProvider>
        <ChatbotWidget />
      </ChatProvider>
    );

    expect(screen.queryByLabelText("VPS AI Assistant")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Open assistant" }));
    expect(screen.getByLabelText("VPS AI Assistant")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Close assistant" }));
    expect(screen.queryByLabelText("VPS AI Assistant")).not.toBeInTheDocument();
  });

  it("opens and closes the embedded panel", async () => {
    const user = userEvent.setup();
    render(
      <ChatProvider>
        <EmbeddedChatbot />
      </ChatProvider>
    );

    await user.click(screen.getByRole("button", { name: /assistant/i }));
    expect(document.getElementById("vps-embedded-chat-panel")).toHaveAttribute(
      "aria-hidden",
      "false"
    );
    await user.click(screen.getByRole("button", { name: "Close chat" }));
    expect(document.getElementById("vps-embedded-chat-panel")).toHaveAttribute(
      "aria-hidden",
      "true"
    );
  });

  it("drags the slide-out assistant tab without opening the panel", () => {
    render(
      <ChatProvider>
        <EmbeddedChatbot />
      </ChatProvider>
    );

    const button = screen.getByRole("button", { name: "Assistant" });
    Object.defineProperty(button, "offsetHeight", { value: 40, configurable: true });
    button.getBoundingClientRect = () =>
      ({
        x: 0,
        y: 200,
        top: 200,
        left: 0,
        bottom: 240,
        right: 100,
        width: 100,
        height: 40,
        toJSON: () => ({}),
      }) as DOMRect;

    fireEvent.pointerDown(button, { pointerId: 1, clientY: 220, button: 0 });
    fireEvent.pointerMove(button, { pointerId: 1, clientY: 340 });
    fireEvent.pointerUp(button, { pointerId: 1, clientY: 340 });

    expect(document.getElementById("vps-embedded-chat-panel")).toHaveAttribute(
      "aria-hidden",
      "true"
    );
    expect(button.style.top).toBe("320px");
  });

  it("renders suggestions and sends a message", async () => {
    const user = userEvent.setup();
    render(
      <ChatProvider>
        <ChatPanel />
      </ChatProvider>
    );

    expect(screen.getByText(/VPS Veritas assistant/i)).toBeInTheDocument();
    expect(screen.getByRole("list", { name: "Suggested questions" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "How do I access my reports?" }));

    const input = screen.getByLabelText("Chat message") as HTMLTextAreaElement;
    expect(input.value).toBe("How do I access my reports in the VPS Customer Portal?");
    await user.keyboard("{Enter}");

    await waitFor(() => {
      expect(
        screen.getByText("Transformer oil reports are available in the Reports page.")
      ).toBeInTheDocument();
    });
    expect(fetch).toHaveBeenCalledWith(
      "/api/v1/sessions/session-1/messages",
      expect.objectContaining({ method: "POST" })
    );
  });

  it("filters suggestion badges as the user types", async () => {
    const user = userEvent.setup();
    render(
      <ChatProvider>
        <ChatPanel />
      </ChatProvider>
    );

    const input = screen.getByLabelText("Chat message");
    expect(screen.getByRole("button", { name: "Where can I find sample status?" })).toBeInTheDocument();

    await user.type(input, "report");
    expect(screen.getByRole("button", { name: "How do I access my reports?" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Where can I find sample status?" })).not.toBeInTheDocument();
  });

  it("sends from the keyboard with Enter and keeps Shift+Enter as a newline", async () => {
    const user = userEvent.setup();
    render(
      <ChatProvider>
        <ChatPanel />
      </ChatProvider>
    );

    const input = screen.getByLabelText("Chat message");
    await user.type(input, "Where is sample status?");
    await user.keyboard("{Enter}");

    await waitFor(() => {
      expect(screen.getByText("Where is sample status?")).toBeInTheDocument();
    });

    await user.type(input, "line one");
    await user.keyboard("{Shift>}{Enter}{/Shift}");
    expect((input as HTMLTextAreaElement).value).toContain("\n");
  });

  it("shows a friendly error and retries", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockImplementation(async (input, init) => {
      const url = String(input);
      const method = (init?.method || "GET").toUpperCase();
      if (url.endsWith("/api/v1/sessions") && method === "POST") {
        return jsonResponse({
          session_id: "session-1",
          created_at: "2026-01-01T00:00:00Z",
        });
      }
      if (url.includes("/messages") && method === "POST") {
        return jsonResponse(
          { error: { message: "Unable to process the chat request right now." } },
          502
        );
      }
      return jsonResponse({}, 500);
    });

    render(
      <ChatProvider>
        <ChatPanel />
      </ChatProvider>
    );

    await user.type(screen.getByLabelText("Chat message"), "hello");
    await user.keyboard("{Enter}");

    await waitFor(() => {
      expect(
        screen.getAllByText(/unable to process the chat request right now/i).length
      ).toBeGreaterThan(0);
    });

    fetchMock.mockImplementation(async (input, init) => {
      const url = String(input);
      const method = (init?.method || "GET").toUpperCase();
      if (url.endsWith("/api/v1/sessions") && method === "POST") {
        return jsonResponse({
          session_id: "session-1",
          created_at: "2026-01-01T00:00:00Z",
        });
      }
      return jsonResponse({
        request_id: "req-2",
        session_id: "session-1",
        answer: "Recovered reply",
        sources: [],
        tool_calls: [],
        usage,
      });
    });

    await user.click(screen.getByRole("button", { name: "Try again" }));
    await waitFor(() => {
      expect(screen.getByText("Recovered reply")).toBeInTheDocument();
    });
  });

  it("keeps widget and embedded views on the same conversation", async () => {
    const user = userEvent.setup();
    render(
      <ChatProvider>
        <ChatbotWidget defaultOpen />
        <div data-testid="second-surface">
          <ChatPanel />
        </div>
      </ChatProvider>
    );

    const surfaces = screen.getAllByLabelText("Chat message");
    await user.type(surfaces[0]!, "shared question");
    await user.keyboard("{Enter}");

    await waitFor(() => {
      expect(
        screen.getAllByText("Transformer oil reports are available in the Reports page.").length
      ).toBeGreaterThan(1);
    });
    expect(within(screen.getByTestId("second-surface")).getByText("shared question")).toBeTruthy();
  });

  it("resolves apiBaseUrl correctly with various proxy and endpoint patterns", () => {
    expect(resolveApiBaseUrl("https://vpsai.onrender.com/")).toBe("https://vpsai.onrender.com");

    expect(resolveApiBaseUrl("  https://vpsai.onrender.com  ")).toBe("https://vpsai.onrender.com");
    expect(resolveApiBaseUrl("")).toBe("");

    expect(buildApiUrl("https://vpsai.onrender.com", "/api/v1/sessions")).toBe(
      "https://vpsai.onrender.com/api/v1/sessions"
    );
    expect(buildApiUrl("https://vpsai.onrender.com/", "/api/v1/sessions")).toBe(
      "https://vpsai.onrender.com/api/v1/sessions"
    );
    expect(buildApiUrl("https://vpsai.onrender.com/api", "/api/v1/sessions")).toBe(
      "https://vpsai.onrender.com/api/v1/sessions"
    );
    expect(buildApiUrl("/api", "/api/v1/sessions")).toBe("/api/v1/sessions");
    expect(buildApiUrl("https://vpsai.onrender.com/api", "/health")).toBe(
      "https://vpsai.onrender.com/health"
    );
    expect(buildApiUrl("", "/api/v1/sessions")).toBe("/api/v1/sessions");
  });

  it("renders ChatbotWidget standalone with apiBaseUrl without manual ChatProvider wrapping", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.mocked(fetch);

    render(
      <ChatbotWidget
        defaultOpen
        apiBaseUrl="https://vpsai.onrender.com"
        envStage="alpha"
        envPulse
      />
    );

    expect(screen.getByLabelText("VPS AI Assistant")).toBeInTheDocument();
    const input = screen.getByLabelText("Chat message");
    await user.type(input, "test message");
    await user.keyboard("{Enter}");

    await waitFor(() => {
      expect(
        screen.getByText("Transformer oil reports are available in the Reports page.")
      ).toBeInTheDocument();
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "https://vpsai.onrender.com/api/v1/sessions",
      expect.objectContaining({ method: "POST" })
    );
  });

  it("renders EmbeddedChatbot standalone with apiBaseUrl", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.mocked(fetch);

    render(
      <EmbeddedChatbot
        defaultOpen
        apiBaseUrl="https://vpsai.onrender.com"
        envStage="alpha"
      />
    );

    expect(document.getElementById("vps-embedded-chat-panel")).toHaveAttribute(
      "aria-hidden",
      "false"
    );
    const input = screen.getByLabelText("Chat message");
    await user.type(input, "embedded message");
    await user.keyboard("{Enter}");

    await waitFor(() => {
      expect(
        screen.getByText("Transformer oil reports are available in the Reports page.")
      ).toBeInTheDocument();
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "https://vpsai.onrender.com/api/v1/sessions",
      expect.objectContaining({ method: "POST" })
    );
  });
});

