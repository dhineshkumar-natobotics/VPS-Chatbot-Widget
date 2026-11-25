import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import type { ChatMessage } from "../api/chatbot-types";
import { Reasoning, ReasoningContent, ReasoningTrigger } from "../../components/ai-elements/reasoning";
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

  it("opens an inline citation from the keyboard and gives the source link a new-tab label", async () => {
    const user = userEvent.setup();
    render(<ChatMarkdown text="Fuel reports [S1] [S9]" sources={[{
      chunkId: "public",
      source: "knowledge/Web/Reports-Fuel.md",
      title: "Fuel Reports",
      url: "https://example.com/fuel",
      score: 0.65,
      snippet: "Open Reports from the portal.",
    }]} />);

    const citation = screen.getByRole("button", { name: "View sources [S1]" });
    await user.tab();
    expect(citation).toHaveFocus();
    await user.keyboard("{Enter}");
    const link = await screen.findByRole("link", { name: "example.com (opens in a new tab)" });
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
    await user.tab();
    expect(link).toHaveFocus();
    expect(screen.getByText("Fuel Reports")).toBeVisible();
    expect(screen.getByText("Open Reports from the portal.")).toBeVisible();
    expect(screen.getByText("[S9]", { exact: false })).toBeVisible();
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
    const running = screen.getByRole("button", { name: "Thinking" });
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
    const activity = screen.getByRole("button", { name: "Thought for 1.2s" });
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

  it("renders reasoning text as Markdown and respects the controlling open prop", async () => {
    const { rerender } = render(
      <Reasoning open isStreaming>
        <ReasoningTrigger />
        <ReasoningContent>Checking **reports**.</ReasoningContent>
      </Reasoning>
    );
    expect(screen.getByRole("button", { name: "Thinking" })).toHaveAttribute("aria-expanded", "true");
    expect(await screen.findByText("reports", { selector: '[data-streamdown="strong"]' })).toBeVisible();
    rerender(
      <Reasoning open={false} duration={5}>
        <ReasoningTrigger />
        <ReasoningContent>Checking **reports**.</ReasoningContent>
      </Reasoning>
    );
    expect(screen.getByRole("button", { name: "Thought for 5s" })).toHaveAttribute("aria-expanded", "false");
  });
});
