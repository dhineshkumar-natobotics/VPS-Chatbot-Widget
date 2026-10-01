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
      <div className="app-shell">
        <header className="app-header">
          <div className="app-header-brand">
            <div>
              <h1 className="app-header-title">
                Veritas AI Assistant
              </h1>
              <p className="app-header-subtitle">
                Your AI-powered assistant for Veritas
              </p>
            </div>
          </div>
          <div className="app-header-controls">
            <button
              type="button"
              className={`mode-btn ${mode === "widget" ? "mode-btn--active" : "mode-btn--inactive"}`}
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
              className={`mode-btn ${mode === "embedded" ? "mode-btn--active" : "mode-btn--inactive"}`}
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
            apiBaseUrl="https://vpschatbot.onrender.com"
          />
        )}
        {mode === "embedded" && (
          <EmbeddedChatbot
            open={embeddedOpen}
            onOpenChange={setEmbeddedOpen}
            envStage="alpha"
            apiBaseUrl="https://vpschatbot.onrender.com"
          />
        )}

      </div>
    </ChatProvider>
  );
};
