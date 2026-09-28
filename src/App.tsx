import React, { useState } from "react";
import { LayoutGrid, Layers, MessageSquare } from "lucide-react";
import {
  ChatProvider,
  ChatbotWidget,
  EmbeddedChatbot,
  type ChatUserContext,
} from "./chatbot";

type DemoMode = "widget" | "embedded";

export const App: React.FC = () => {
  const [mode, setMode] = useState<DemoMode>("widget");
  const [customerId, setCustomerId] = useState("");
  const [email, setEmail] = useState("");
  const [widgetOpen, setWidgetOpen] = useState(false);
  const [embeddedOpen, setEmbeddedOpen] = useState(false);

  const userContext: ChatUserContext = {
    customerId: customerId.trim() || undefined,
    email: email.trim() || undefined,
    page: "portal-demo",
  };

  return (
    <ChatProvider userContext={userContext}>
      <div className="flex min-h-screen flex-col bg-background">
        <header className="sticky top-0 z-50 flex flex-wrap items-center justify-between gap-3 border-b border-border bg-card px-7 py-3.5 shadow-sm">
          <div className="flex items-center gap-3">

            <div>
              <h1 className="text-base font-bold text-foreground">
                Veritas AI Assistant
              </h1>
              <p className="text-xs text-muted-foreground">
                Your AI-powered assistant for Veritas
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[12.5px] font-semibold ${mode === "widget"
                ? "border-action bg-action text-action-foreground"
                : "border-border bg-muted text-muted-foreground"
                }`}
              onClick={() => {
                setMode("widget");
                setEmbeddedOpen(false);
              }}
            >
              <Layers size={14} />
              Widget
            </button>
            <button
              type="button"
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[12.5px] font-semibold ${mode === "embedded"
                ? "border-action bg-action text-action-foreground"
                : "border-border bg-muted text-muted-foreground"
                }`}
              onClick={() => {
                setMode("embedded");
                setWidgetOpen(false);
                setEmbeddedOpen(true);
              }}
            >
              <LayoutGrid size={14} />
              Slide-out
            </button>
          </div>
        </header>


        {mode === "widget" && (
          <ChatbotWidget
            open={widgetOpen}
            onOpenChange={setWidgetOpen}
            envStage="alpha"
            envPulse
            apiBaseUrl="https://vpsai.onrender.com"
          />
        )}
        {mode === "embedded" && (
          <EmbeddedChatbot
            open={embeddedOpen}
            onOpenChange={setEmbeddedOpen}
            envStage="alpha"
            apiBaseUrl="https://vpsai.onrender.com"
          />
        )}

      </div>
    </ChatProvider>
  );
};
