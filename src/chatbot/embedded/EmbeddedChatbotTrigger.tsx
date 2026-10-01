import React, { useEffect, useRef, useState } from "react";
import { MessageSquare } from "lucide-react";

const DRAG_THRESHOLD_PX = 5;
const EDGE_PADDING_PX = 8;
const POSITION_STORAGE_KEY = "vps-embedded-assistant-top";

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function clampToViewport(nextTop: number, height: number) {
  const maxTop = Math.max(
    EDGE_PADDING_PX,
    window.innerHeight - height - EDGE_PADDING_PX
  );
  return clamp(nextTop, EDGE_PADDING_PX, maxTop);
}

function readStoredTop(): number | null {
  try {
    const stored = window.localStorage.getItem(POSITION_STORAGE_KEY);
    if (!stored) return null;
    const parsed = Number(stored);
    return Number.isFinite(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function persistTop(top: number) {
  try {
    window.localStorage.setItem(POSITION_STORAGE_KEY, String(top));
  } catch {
    // Ignore quota / private-mode failures.
  }
}

interface EmbeddedChatbotTriggerProps {
  onOpen: () => void;
}

export const EmbeddedChatbotTrigger: React.FC<EmbeddedChatbotTriggerProps> = ({
  onOpen,
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dragRef = useRef({
    pointerId: null as number | null,
    startY: 0,
    startTop: 0,
    moved: false,
  });
  const [top, setTop] = useState<number | null>(() =>
    typeof window === "undefined" ? null : readStoredTop()
  );
  const topRef = useRef(top);
  const suppressClickRef = useRef(false);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    topRef.current = top;
  }, [top]);

  useEffect(() => {
    const button = buttonRef.current;
    if (!button) return;

    const applyBounds = () => {
      setTop((current) => {
        const fallback =
          current ??
          Math.round(window.innerHeight / 2 - button.offsetHeight / 2);
        const next = clampToViewport(fallback, button.offsetHeight);
        topRef.current = next;
        return next;
      });
    };

    applyBounds();
    window.addEventListener("resize", applyBounds);
    return () => window.removeEventListener("resize", applyBounds);
  }, []);

  const handlePointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0) return;
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    dragRef.current = {
      pointerId: event.pointerId,
      startY: event.clientY,
      startTop: rect.top,
      moved: false,
    };
    try {
      button.setPointerCapture(event.pointerId);
    } catch {
      // jsdom and some browsers may not implement pointer capture.
    }
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (dragRef.current.pointerId !== event.pointerId) return;
    const deltaY = event.clientY - dragRef.current.startY;
    if (!dragRef.current.moved && Math.abs(deltaY) < DRAG_THRESHOLD_PX) return;

    dragRef.current.moved = true;
    setDragging(true);
    const nextTop = clampToViewport(
      dragRef.current.startTop + deltaY,
      event.currentTarget.offsetHeight
    );
    topRef.current = nextTop;
    setTop(nextTop);
  };

  const finishPointer = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (dragRef.current.pointerId !== event.pointerId) return;
    try {
      if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
    } catch {
      // Ignore missing pointer-capture support.
    }

    const wasDrag = dragRef.current.moved;
    dragRef.current.pointerId = null;
    dragRef.current.moved = false;
    setDragging(false);

    if (wasDrag) {
      suppressClickRef.current = true;
      if (topRef.current != null) persistTop(topRef.current);
    }
  };

  return (
    <button
      ref={buttonRef}
      type="button"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={finishPointer}
      onPointerCancel={finishPointer}
      onClick={() => {
        if (suppressClickRef.current) {
          suppressClickRef.current = false;
          return;
        }
        onOpen();
      }}
      aria-expanded={false}
      aria-controls="vps-embedded-chat-panel"
      aria-label="Assistant"
      className={`embedded-trigger-btn ${
        dragging ? "embedded-trigger-btn--grabbing" : "embedded-trigger-btn--grab"
      }`}
      style={{
        top: top ?? "50%",
        transform: top == null ? "translateY(-50%)" : undefined,
      }}
    >
      <MessageSquare size={16} />
      Assistant
    </button>
  );
};
