# VPS React Chatbot UI

Reusable React + TypeScript assistant for the VPS Customer Portal. Widget and slide-out modes share one conversation engine and call the existing Python API.

## Standalone Usage (No Provider Required)

You can drop `<ChatbotWidget />` or `<EmbeddedChatbot />` into any React application directly and pass the API / Proxy URL as a prop:

```tsx
import { ChatbotWidget } from "vpschatbotwidget";

export function App() {
  return (
    <ChatbotWidget
      apiBaseUrl="https://****.****.com"
      envStage="alpha"
      envPulse
    />
  );
}
```

```tsx
import { EmbeddedChatbot } from "vpschatbotwidget";

export function App() {
  return (
    <EmbeddedChatbot
      apiBaseUrl="https://****.****.com"
      envStage="alpha"
    />
  );
}
```

## Shared Conversation (Using Provider)

Wrap multiple chatbot views (e.g. Widget and Slide-out) in a single `<ChatProvider>` to share conversation history and state:

```tsx
import { ChatProvider, ChatbotWidget, EmbeddedChatbot } from "vpschatbotwidget";

export function App() {
  return (
    <ChatProvider
      apiBaseUrl="https://vpsai.onrender.com"
      userContext={{ customerId: "CUST-1001", email: "user@example.com" }}
    >
      <ChatbotWidget open={widgetOpen} onOpenChange={setWidgetOpen} envStage="alpha" envPulse />
      <EmbeddedChatbot open={embeddedOpen} onOpenChange={setEmbeddedOpen} envStage="alpha" />
    </ChatProvider>
  );
}
```

## Configuring the API / Proxy URL

You can supply the backend URL in 4 convenient ways:

1. **Component Prop**:
   ```tsx
   <ChatbotWidget apiBaseUrl="https://youraiserviceapiurl.com" />
   // or aliases:
   <ChatbotWidget apiUrl="https://youraiserviceapiurl.com" />
   <ChatbotWidget proxyUrl="https://youraiserviceapiurl.com" />
   ```

2. **ChatProvider Prop**:
   ```tsx
   <ChatProvider apiBaseUrl="https://youraiserviceapiurl.com">
     <ChatbotWidget />
   </ChatProvider>
   ```

3. **Vite / Next.js Proxy**:
   If using a local dev proxy (e.g. in `vite.config.ts`):
   ```ts
   // vite.config.ts
   server: {
     proxy: {
       "/api": {
         target: "https://*******.com",
         changeOrigin: true,
       },
       "/health": {
        target: "https://********.com", 
        changeOrigin: true,
       },
     },
   }
   ```
   Pass `apiBaseUrl="/api"` or leave empty to default to relative same-origin paths. Path normalization automatically handles both `/api/v1/sessions` and `/health` without double `/api/api` nesting.

4. **Environment Variables**:
   Set in `.env`:
   ```env
   VITE_API_BASE=https://vpsai.onrender.com
   ```
   The component will automatically read `VITE_API_BASE`, `VITE_API_BASE_URL`, or `VITE_API_URL` when no prop is provided.

## Sharing and Installing as a GitHub Component

To install and use this component library directly from GitHub in another project:

```bash
# Install via GitHub repository
npm install git+https://github.com/dhineshkumar-natobotics/VPS-Chatbot-Widget.git
# Or if installing frontend subfolder from the main repo:
npm install github:dhineshkumar-natobotics/VPS-AI-Chatbot#main:frontend
```

Import styles in your app entry (e.g. `main.tsx` or `_app.tsx`):
```tsx
import "vpschatbotwidget/css";
```

### Building the Library Bundle

To build a standalone distributable bundle with ES Modules, CommonJS, and TypeScript types:
```bash
npm run build:lib
```
Artifacts are generated into `dist-lib/`:
- `dist-lib/vps-chatbot.js` (ES Module)
- `dist-lib/vps-chatbot.cjs` (CommonJS)
- `dist-lib/types/` (TypeScript declarations)


## Authentication

Chat sessions are created with `POST /api/v1/sessions`. The current Python API does not require a browser JWT. Do not put NVIDIA, OpenAI, database, or signing secrets in React env vars.

## User / customer context

Pass portal identity through `ChatProvider`:

```tsx
<ChatProvider
  userContext={{
    customerId: "CUST-1001",
    email: "user@company.com",
    name: "Alex",
    role: "customer",
    page: "sample-status",
  }}
>
```

Context is used for ticket creation. It is not stored in `localStorage` and is not sent as extra chat fields (the chat endpoint only accepts `{ "message": "..." }`).

## Ticket confirmation

Messages that ask to create or open a support ticket are intercepted. The UI asks for explicit confirmation, then calls `POST /api/v1/tickets`. If customer ID/email is missing, the confirmation card asks for it.

The LLM can still create a ticket via the backend `create_ticket` tool on a normal chat turn. That server-side path is unchanged.

## Transport

`POST /api/v1/sessions/{id}/messages` returns a full JSON `ChatResponse`. There is no SSE or WebSocket stream. The UI shows a typing row while the request is in flight, then replaces it with the complete answer. `MessageScroller` `autoScroll` follows the live edge unless the reader has scrolled away.

## Styling

The VPS `ColorPalette` lives in `src/chatbot/config/colors.ts`. Semantic CSS tokens (`--primary`, `--bg-app`, `--text-main`, fonts) are in `src/index.css` and map onto that palette. Tailwind utilities such as `bg-primary` and `text-foreground` compose those tokens. Override with `className` on `ChatPanel` if the host portal needs a tighter match.

## Suggestions

Default prompt badges sit above the text box (`src/chatbot/config/suggestions.ts`). Typing filters them by suggestion text; choosing a badge fills the box so you can edit before sending. Disable them:

```tsx
<ChatProvider disableSuggestions>
```

Or replace them with `suggestions={[{ label, query }]}`.

## Portal integration

1. Wrap the host tree (or a layout region) with a single `ChatProvider`.
2. Mount `ChatbotWidget` for a floating launcher, `EmbeddedChatbot` for a side panel, or both — they share messages.
3. Pass authenticated customer id/email from the portal session, never from a public config file.
4. Keep FastAPI as the only AI backend the browser talks to.
