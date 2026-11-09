import { afterEach, describe, expect, it, vi } from "vitest";
import { createChatApi } from "./chatbot-api";

const result = { type: "complete", request_id: "r", session_id: "s", answer: "Fuel reports [S1]",
  sources: [], tool_calls: [], usage: { model: "m", prompt_tokens: 7, completion_tokens: 3, total_tokens: 10 } };

afterEach(() => vi.unstubAllGlobals());

describe("chat stream transport", () => {
  it("consumes a JSON proxy response without replaying a turn", async () => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify(result), { headers: { "Content-Type": "application/json" } }));
    vi.stubGlobal("fetch", fetchMock);
    expect((await createChatApi().sendMessageStream!("s", "question")).answer).toBe(result.answer);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("handles split UTF-8, CRLF and completion before socket EOF", async () => {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(`: heartbeat\r\n\r\ndata: {"type":"token","text":"船"}\r\n\r\ndata: ${JSON.stringify(result)}\r\n\r\n`);
    const cancel = vi.fn();
    const stream = new ReadableStream({ start(controller) {
      // Split across every byte, including inside a multibyte character.
      for (let i = 0; i < bytes.length; i++) controller.enqueue(bytes.slice(i, i + 1));
      // Deliberately keep the server connection open after the terminal event.
    }, cancel });
    vi.stubGlobal("fetch", vi.fn(async () => new Response(stream)));
    const onToken = vi.fn();
    const response = await createChatApi().sendMessageStream!("s", "question", undefined, undefined, onToken);
    expect(onToken).toHaveBeenCalledWith("船");
    expect(response.usage.totalTokens).toBe(10);
    expect(cancel).toHaveBeenCalledOnce();
  });

  it("rejects a truncated stream without automatically repeating the POST", async () => {
    const fetchMock = vi.fn(async () => new Response('data: {"type":"token","text":"partial"}\n\n'));
    vi.stubGlobal("fetch", fetchMock);
    await expect(createChatApi().sendMessageStream!("s", "question")).rejects.toMatchObject({ message: expect.stringContaining("before the answer was complete") });
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it("forwards an abort signal", async () => {
    const controller = new AbortController();
    const fetchMock = vi.fn(async () => new Response(JSON.stringify(result), { headers: { "Content-Type": "application/json" } }));
    vi.stubGlobal("fetch", fetchMock);
    await createChatApi().sendMessageStream!("s", "question", undefined, undefined, undefined, controller.signal);
    expect(fetchMock).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ signal: controller.signal }));
  });
});
