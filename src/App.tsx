import React, { useState } from "react";
import { Layers, LayoutGrid } from "lucide-react";
import {
  ChatProvider,
  ChatbotWidget,
  CUSTOMER_PORTAL_ROLES,
  EmbeddedChatbot,
  type CustomerPortalRoleId,
  type ChatServiceArea,
} from "./chatbot";

type DemoMode = "widget" | "embedded";

export const App: React.FC = () => {
  const [mode, setMode] = useState<DemoMode>("widget");
  const [roleId, setRoleId] = useState<CustomerPortalRoleId>(6);
  const [service, setService] = useState<ChatServiceArea | "">("");
  const [widgetOpen, setWidgetOpen] = useState(false);
  const [embeddedOpen, setEmbeddedOpen] = useState(false);

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header-brand">
          <div>
            <h1 className="app-header-title">Veritas AI Assistant</h1>
            <p className="app-header-subtitle">VPS Customer Portal support</p>
          </div>
        </div>

        <div className="app-header-controls">
          <label className="app-role-select">
            Demo role
            <select
              className="mode-btn mode-btn--inactive"
              value={roleId}
              onChange={(event) => {
                setRoleId(Number(event.target.value) as CustomerPortalRoleId);
                setService("");
              }}
            >
              {Object.entries(CUSTOMER_PORTAL_ROLES).map(([id, role]) => (
                <option key={id} value={id}>{role.name}</option>
              ))}
            </select>
          </label>
          {CUSTOMER_PORTAL_ROLES[roleId].services.length > 1 && (
            <label className="app-role-select">
              Service
              <select className="mode-btn mode-btn--inactive" value={service}
                onChange={(event) => setService(event.target.value as ChatServiceArea | "")}>
                <option value="">Automatic</option>
                <option value="vessel">Vessel</option>
                <option value="tot">Transformer Oil Testing</option>
              </select>
            </label>
          )}
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

      <ChatProvider roleId={roleId} service={service || undefined}>
        {mode === "widget" ? (
          <ChatbotWidget open={widgetOpen} onOpenChange={setWidgetOpen} envStage="alpha" envPulse />
        ) : (
          <EmbeddedChatbot open={embeddedOpen} onOpenChange={setEmbeddedOpen} envStage="alpha" />
        )}
      </ChatProvider>
    </div>
  );
};

export default App;
