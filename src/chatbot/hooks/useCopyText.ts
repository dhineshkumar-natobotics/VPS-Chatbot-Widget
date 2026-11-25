import { useEffect, useState } from "react";

export function useCopyText() {
  const [status, setStatus] = useState<"idle" | "copying" | "copied" | "failed">("idle");

  useEffect(() => {
    if (status !== "copied") return;
    const timeout = window.setTimeout(() => setStatus("idle"), 2000);
    return () => window.clearTimeout(timeout);
  }, [status]);

  async function copy(text: string) {
    setStatus("copying");
    try {
      await navigator.clipboard.writeText(text);
      setStatus("copied");
    } catch {
      setStatus("failed");
    }
  }

  return { status, copy };
}
