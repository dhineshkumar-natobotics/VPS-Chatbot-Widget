import React, { useState } from "react";
import {
  LayoutGrid,
  Layers,
  Sparkles,
  FileText,
  ArrowRight,
  UserCheck,
  Compass,
  Eye,
  EyeOff,
  ShieldCheck,
  Brain,
  Zap,
} from "lucide-react";
import {
  ChatProvider,
  ChatbotWidget,
  EmbeddedChatbot,
  useChatContext,
  type ChatUserContext,
} from "./chatbot";

type DemoMode = "widget" | "embedded";

interface RoleOption {
  id: string;
  name: string;
  role: string;
  roleId: number;
  client: "web" | "mobile" | "admin";
  badge: string;
  desc: string;
}

const ROLE_OPTIONS: RoleOption[] = [
  {
    id: "fleet-manager",
    name: "Customer / Fleet Manager",
    role: "Fleet Manager",
    roleId: 6,
    client: "web",
    badge: "Web Portal",
    desc: "Vessel reports, Fuel Quality Testing (FQT), Pre-Registration, and Fuel Defect Reporting (FDR)",
  },
  {
    id: "bunker-master",
    name: "Chief Engineer / Bunker Master",
    role: "Bunker Master Only",
    roleId: 12,
    client: "mobile",
    badge: "Mobile App",
    desc: "Bunker surveys, BDN entry, FSC/FSQ e-forms, and defect escalation",
  },
  {
    id: "vps-admin",
    name: "VPS Technical Admin",
    role: "VPS Admin",
    roleId: 10,
    client: "admin",
    badge: "Admin Ops",
    desc: "Full lab diagnostics, cross-fleet analytics, and technical administration",
  },
];

interface DemoQuery {
  title: string;
  tag: string;
  query: string;
  desc: string;
}

const DEMO_QUERIES: DemoQuery[] = [
  {
    title: "Fuel Defect Reporting (FDR)",
    tag: "Knowledge / FDR",
    query: "what is the fdr and how do i use it?",
    desc: "Domain acronym expansion, module tabs, mandatory fields, and /dashboard/fuel-Defect-Reporting",
  },
  {
    title: "Bunker Master & BDN Logs",
    tag: "Knowledge / Bunker Master",
    query: "what is the bunker master and how does it work?",
    desc: "BDN logs, bunker surveys, quality defect escalation, and /dashboard/bunker-master",
  },
  {
    title: "FSC & FSQ E-Forms",
    tag: "Knowledge / E-Forms",
    query: "What are FSC & FSQ E-forms?",
    desc: "Electronic purifier check forms (Al+Si cat-fines), digital QR pre-registration, and routes",
  },
  {
    title: "Fuel Quality Testing (FQT)",
    tag: "Knowledge / Reports",
    query: "Where can I view Fuel Quality Testing (FQT) reports?",
    desc: "FQT test alerts, parameters, OCM condition reports, and /dashboard/reports",
  },
  {
    title: "Cat-fines (Al+Si) Defect Escalation",
    tag: "Knowledge / Defects",
    query: "How do I report high cat-fines Al+Si exceeding ISO 8217 limits?",
    desc: "Purifier efficiency checks, bunker dispute workflow, and technical support",
  },
  {
    title: "Bunker Survey & Lab Logistics",
    tag: "Knowledge / Logistics",
    query: "How do I register a bunker sample with Samplogic?",
    desc: "Bottle barcode registration, courier tracking, and testing turnaround",
  },
];

const AppShowcase: React.FC<{
  mode: DemoMode;
  setMode: (m: DemoMode) => void;
  widgetOpen: boolean;
  setWidgetOpen: (o: boolean) => void;
  embeddedOpen: boolean;
  setEmbeddedOpen: (o: boolean) => void;
  selectedRole: RoleOption;
  onSelectRole: (role: RoleOption) => void;
  hideInspectSources: boolean;
  onToggleInspectSources: () => void;
}> = ({
  mode,
  setMode,
  widgetOpen,
  setWidgetOpen,
  embeddedOpen,
  setEmbeddedOpen,
  selectedRole,
  onSelectRole,
  hideInspectSources,
  onToggleInspectSources,
}) => {
    const { sendMessage } = useChatContext();

    const handleAskQuery = (query: string) => {
      if (mode === "widget") {
        setWidgetOpen(true);
      } else {
        setEmbeddedOpen(true);
      }
      void sendMessage(query);
    };

    return (
      <div className="app-shell">
        <header className="app-header">
          <div className="app-header-brand">
            <div>
              <h1 className="app-header-title">Veritas AI Assistant</h1>
              <p className="app-header-subtitle">
                Generative & Agent-Driven Support for VPS Veritas Portal
              </p>
            </div>
          </div>

          <div className="app-header-controls">
            {/* Toggle Inspect Sources Prop */}
            <button
              type="button"
              className="mode-btn mode-btn--inactive"
              onClick={onToggleInspectSources}
              title={hideInspectSources ? "Inspect Sources is Hidden" : "Inspect Sources is Visible"}
            >
              {hideInspectSources ? <EyeOff size={14} /> : <Eye size={14} />}
              <span>Inspect Sources: {hideInspectSources ? "Hidden" : "Visible"}</span>
            </button>

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
            apiBaseUrl="http://127.0.0.1:8000"
            hideInspectSources={hideInspectSources}
            showGroundedSources={false}
          />
        )}
        {mode === "embedded" && (
          <EmbeddedChatbot
            open={embeddedOpen}
            onOpenChange={setEmbeddedOpen}
            envStage="alpha"
            apiBaseUrl="http://127.0.0.1:8000"
              hideInspectSources={hideInspectSources}
              showGroundedSources={false}
          />
        )}
      </div>
    );
  };

export const App: React.FC = () => {
  const [mode, setMode] = useState<DemoMode>("widget");
  const [selectedRole, setSelectedRole] = useState<RoleOption>(ROLE_OPTIONS[0]);
  const [widgetOpen, setWidgetOpen] = useState(false);
  const [embeddedOpen, setEmbeddedOpen] = useState(false);
  const [hideInspectSources, setHideInspectSources] = useState(false);

  const userContext: ChatUserContext = {
    page: "portal-demo",
    role: selectedRole.role,
    roleId: selectedRole.roleId,
    client: selectedRole.client,
  };

  return (
    <ChatProvider
      key={`${selectedRole.id}-${hideInspectSources}`}
      userContext={userContext}
      role={selectedRole.role}
      roleId={selectedRole.roleId}
      client={selectedRole.client}
      hideInspectSources={hideInspectSources}
      apiBaseUrl="http://127.0.0.1:8000"
    >
      <AppShowcase
        mode={mode}
        setMode={setMode}
        widgetOpen={widgetOpen}
        setWidgetOpen={setWidgetOpen}
        embeddedOpen={embeddedOpen}
        setEmbeddedOpen={setEmbeddedOpen}
        selectedRole={selectedRole}
        onSelectRole={setSelectedRole}
        hideInspectSources={hideInspectSources}
        onToggleInspectSources={() => setHideInspectSources((prev) => !prev)}
      />
    </ChatProvider>
  );
};

export default App;
