import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ChatMarkdown } from "./ChatMarkdown";
import { ChatMessageBubble } from "./ChatMessage";

describe("grounded answer rendering", () => {
  it("does not render executable markdown links", () => {
    render(<ChatMarkdown text="[Bad](javascript:alert) [Unsafe](data:text/html,evil) [Portal](/dashboard/reports)" />);
    expect(screen.queryByRole("link", { name: "Bad" })).toBeNull();
    expect(screen.queryByRole("link", { name: "Unsafe" })).toBeNull();
    expect(screen.getByRole("link", { name: "Portal" })).toHaveAttribute("href", "/dashboard/reports");
  });

  it("shows sources without claiming a probability or verification", () => {
    render(<ChatMessageBubble message={{ id: "reply", role: "assistant", content: "Fuel reports [S1]", createdAt: "2026-01-01", status: "complete",
      sources: [{ chunkId: "c", source: "knowledge/Web/Reports-Fuel.md", score: 0.65 }] }} />);
    expect(screen.getByText("1 retrieved VPS sources")).toBeInTheDocument();
    expect(screen.queryByText(/Verified|65%/i)).toBeNull();
    expect(screen.getByText(/\[S1\] Reports Fuel/)).toBeInTheDocument();
  });
});
