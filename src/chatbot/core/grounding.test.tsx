import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import type { ChatMessage } from "../api/chatbot-types";
import { ChatMarkdown } from "./ChatMarkdown";
import { ChatMessageBubble } from "./ChatMessage";
import { ChatProvider } from "./ChatProvider";

describe("grounded answer rendering", () => {
  it("does not render executable markdown links", () => {
    render(<ChatMarkdown text="[Bad](javascript:alert) [Unsafe](data:text/html,evil) [Portal](/dashboard/reports)" />);
    expect(screen.queryByRole("link", { name: "Bad" })).toBeNull();
    expect(screen.queryByRole("link", { name: "Unsafe" })).toBeNull();
    expect(screen.getByRole("link", { name: "Portal" })).toHaveAttribute("href", "/dashboard/reports");
  });

  it("expands source details while showing the ranking score as a score", async () => {
    const user = userEvent.setup();
    render(
      <ChatProvider showGroundedSources>
        <ChatMessageBubble message={{ id: "reply", role: "assistant", content: "Fuel reports [S1]", createdAt: "2026-01-01", status: "complete",
          sources: [{ chunkId: "c", source: "knowledge/Web/Reports-Fuel.md", score: 0.65 }] }} />
      </ChatProvider>
    );
    expect(screen.getByText("1 retrieved VPS source")).toBeInTheDocument();
    expect(screen.queryByText(/Verified|65%/i)).toBeNull();
    expect(screen.getByText(/\[S1\] Reports Fuel/)).toBeInTheDocument();

    const inspect = screen.getByRole("button", { name: /inspect sources/i });
    expect(inspect).toHaveAttribute("aria-expanded", "false");
    inspect.focus();
    await user.keyboard("{Enter}");
    expect(inspect).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("link", { name: "Fuel Reports" })).toHaveAttribute("href", "/dashboard/reports");
    await user.keyboard(" ");
    expect(inspect).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("link", { name: "Fuel Reports" })).not.toBeInTheDocument();
  });

  it("updates the live trace and lets readers expand completed tool activity", async () => {
    const user = userEvent.setup();
    const message: ChatMessage = {
      id: "reply",
      role: "assistant",
      content: "",
      createdAt: "2026-01-01",
      status: "pending",
      progressText: "Writing your answer…",
      progressSteps: ["Searching relevant knowledge…", "Writing your answer…"],
    };
    const { rerender } = render(<ChatMessageBubble message={message} />);
    const running = screen.getByRole("button", { name: "Working…" });
    expect(running.querySelector('[data-slot="trace-line"]'))
      .toHaveAttribute("data-status", "running");
    expect(screen.getByText("Writing your answer…")).toBeVisible();
    await user.click(running);
    await user.click(running);

    rerender(<ChatMessageBubble message={{
      ...message,
      content: "Your ticket is open.",
      status: "complete",
      durationMs: 1200,
      toolCalls: [{ toolName: "get_ticket", arguments: { id: "123" }, result: {} }],
    }} />);
    const activity = screen.getByRole("button", { name: /response generated/i });
    expect(activity).toHaveTextContent("1.2s");
    expect(screen.getByText("Ticket status loaded")).toBeVisible();
    await user.click(activity);
    expect(screen.queryByText("Ticket status loaded")).not.toBeInTheDocument();
    await user.click(activity);
    expect(screen.getByText("Ticket status loaded")).toBeVisible();
    expect(screen.getByText("Your ticket is open.")).toBeVisible();
  });

  it("copies fenced code without its displayed line numbers", async () => {
    const user = userEvent.setup();
    const code = "first line\nsecond line";
    render(<ChatMarkdown text={`\`\`\`text\n${code}\n\`\`\``} />);
    expect(screen.getByText("2", { selector: ".md-code-number" })).toHaveAttribute("aria-hidden", "true");
    await user.click(screen.getByRole("button", { name: "Copy code" }));
    expect(await navigator.clipboard.readText()).toBe(code);
  });
});
