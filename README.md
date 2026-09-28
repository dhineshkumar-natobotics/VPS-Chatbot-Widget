# VPS React Chatbot UI

Reusable React + TypeScript assistant for the VPS Customer Portal. Widget and slide-out modes share one conversation engine and call the existing Python API.

## Widget

```tsx
import { ChatProvider, ChatbotWidget } from "./chatbot";

<ChatProvider userContext={{ customerId: "CUST-1001" }}>
  <ChatbotWidget />
</ChatProvider>
```

`ChatbotWidget` accepts `open` / `onOpenChange` for host-controlled visibility, or `defaultOpen` for an uncontrolled trigger.

## Embedded slide-out

```tsx
import { ChatProvider, EmbeddedChatbot } from "./chatbot";

<ChatProvider userContext={{ email: "ops@company.com", page: "reports" }}>
  <EmbeddedChatbot />
</ChatProvider>
```

On desktop the panel is about 440px and slides in from the right. On small screens it uses the full width with a light overlay.

## API base URL

The Vite dev server proxies `/api` and `/health` to `http://127.0.0.1:8000`. Production builds are served by FastAPI from `frontend/dist`, so the browser calls same-origin `/api/v1/...`.

There is no public model key in the frontend. Change the proxy target in `vite.config.ts` if the API is elsewhere during development.

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
