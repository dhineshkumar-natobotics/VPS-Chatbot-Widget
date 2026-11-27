# VPS Customer Chatbot UI (`vpschatbotwidget`)

[![VpsChatbot-widget](https://github.com/dhineshkumar-natobotics/VPS-Chatbot-Widget/actions/workflows/npm-publish.yml/badge.svg)](https://github.com/dhineshkumar-natobotics/VPS-Chatbot-Widget/actions/workflows/npm-publish.yml)

A React 19 and TypeScript chat widget for the VPS Customer Portal. Use the floating widget or slide-out panel on its own, or wrap both in a shared `ChatProvider` to keep one conversation.

---

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
  - [1. Standalone Widget](#1-standalone-widget-no-provider-required)
  - [2. Standalone Slide-out Panel](#2-standalone-slide-out-panel)
  - [3. Shared Conversation Mode](#3-shared-conversation-mode-multiple-views)
- [Conversation UI](#conversation-ui)
- [Role-aware chat](#role-aware-chat)
- [API & Proxy URL Configuration](#api--proxy-url-configuration)
  - [URL Normalization Behavior](#url-normalization-behavior)
- [Component Props Reference](#component-props-reference)
  - [`ChatbotWidget`](#chatbotwidget)
  - [`EmbeddedChatbot`](#embeddedchatbot)
  - [`ChatProvider`](#chatprovider)
  - [`ChatPanel`](#chatpanel)
- [Data Types & Interfaces](#data-types--interfaces)
  - [`ChatUserContext`](#chatusercontext)
  - [`Suggestion`](#suggestion)
  - [`EnvStage`](#envstage)
  - [`ChatMessage`](#chatmessage)
- [Hooks & API Utilities](#hooks--api-utilities)
  - [`useChatbot()`](#usechatbot)
  - [`createChatApi()`](#createchatapi)
- [Building & Distributing](#building--distributing)

---

## Installation

### From a Local Checkout

Run these commands from the root of the chatbot repository.

```bash
npm --prefix frontend ci
npm --prefix frontend run build:lib
```

From the host application, install the built package.

```bash
npm install /path/to/VPS-AI-Chatbot/frontend
```

### From npm Registry

```bash
npm install vpschatbotwidget
```

### Import Styles

Import the CSS in your main application entry point (e.g. `main.tsx`, `index.tsx`, or `_app.tsx`):

```tsx
import "vpschatbotwidget/css";
```

---

## Quick Start

### 1. Standalone Widget (No Provider Required)

Drop the widget directly into any React tree. It automatically creates and manages its own internal chat session:

```tsx
import { ChatbotWidget } from "vpschatbotwidget";

export function App() {
  return (
    <ChatbotWidget
      apiBaseUrl="https://yourapiurl.com"
      envStage="alpha"
      envPulse
      userContext={{
        customerId: "CUST-1001",
        email: "alex@company.com",
        name: "Alex",
        page: "dashboard",
      }}
    />
  );
}
```

### 2. Standalone Slide-out Panel

A draggable tab on the right edge that slides out into a responsive side panel:

```tsx
import { EmbeddedChatbot } from "vpschatbotwidget";

export function App() {
  return (
    <EmbeddedChatbot
      apiBaseUrl="https://yourapiurl.com"
      envStage="alpha"
      showTrigger={true}
    />
  );
}
```

### 3. Shared Conversation Mode (Multiple Views)

Pass shared settings to `<ChatProvider>` so both views use the same session, messages, and feedback. Pass view settings such as `open` or `envStage` to each widget.

```tsx
import { useState } from "react";
import { ChatProvider, ChatbotWidget, EmbeddedChatbot } from "vpschatbotwidget";

export function App() {
  const [widgetOpen, setWidgetOpen] = useState(false);
  const [embeddedOpen, setEmbeddedOpen] = useState(false);

  return (
    <ChatProvider
      apiBaseUrl="https://yourapiurl.com"
      userContext={{ customerId: "CUST-1001", email: "user@company.com" }}
    >
      <ChatbotWidget
        open={widgetOpen}
        onOpenChange={setWidgetOpen}
        envStage="alpha"
      />
      <EmbeddedChatbot
        open={embeddedOpen}
        onOpenChange={setEmbeddedOpen}
        envStage="alpha"
      />
    </ChatProvider>
  );
}
```

---

## Conversation UI

- The suggestion strip scrolls horizontally. Clicking a suggestion fills the composer. Enter sends the message, and Shift+Enter adds a line.
- During a reply, **Thinking** expands to show API progress. After completion, **Thought** shows elapsed time. Activity collapses automatically unless the reader changed its open state.
- **Stop response** preserves the text already displayed. Completed replies offer Copy, Like, and Dislike. Ratings belong to the current conversation. **Edit message** loads a previous prompt into the composer.
- Inline references such as `[S1]` open a source preview when the reply includes matching metadata. A source link opens in a new tab when a URL is available. Set `showGroundedSources` to show the separate source list or `hideInspectSources` to suppress previews.
- A short chime plays when a reply completes. The **Response sound** button mutes it, and the browser remembers the preference when local storage is available. Playback depends on the browser allowing audio after interaction.

---

## Role-aware chat

Pass the active Customer Portal role ID to `ChatbotWidget`, `EmbeddedChatbot`, or a shared `ChatProvider`. You can also set `userContext.roleId`.

```tsx
<ChatbotWidget roleId={currentUser.roleId} service="tot" apiBaseUrl="/api" />
```

Use `service="vessel"` or `service="tot"` when the current portal screen already identifies the service. Leave it unset for automatic routing and service clarification. `userContext.service` works as well. The widget uses the role and service for starter questions and displays the chatbot's clarification choices in the composer. The conversation continues when the service changes. Switching accounts, roles, or clients starts a fresh conversation. Use `client="web"` to select browser guidance for a role that also has a mobile or admin experience.

Private VPS Admin guidance requires a trusted portal proxy. The proxy verifies the active user and session ownership, derives the role from the authenticated portal session, and attaches the API credential server-side.

## API & Proxy URL Configuration

Pass the API URL as a prop, use a same-origin proxy, or configure it when building the frontend with Vite.

### 1. Component Prop

Pass `apiBaseUrl` (or aliases `apiUrl` / `proxyUrl`) directly:

```tsx
<ChatbotWidget apiBaseUrl="https://yourapi.com" />
```

### 2. ChatProvider Prop

Pass to `<ChatProvider>` to supply all child components:

```tsx
<ChatProvider apiBaseUrl="https://yourapiurl.com">
  <ChatbotWidget />
</ChatProvider>
```

### 3. Vite / Next.js Reverse Proxy

If your development server has a proxy rule:

```ts
// vite.config.ts
export default defineConfig({
  server: {
    proxy: {
      "/api": {
        target: "https://yourapiurl.com",
        changeOrigin: true,
      },
      "/health": {
        target: "https://yourapiurl.com",
        changeOrigin: true,
      },
    },
  },
});
```

You can pass `apiBaseUrl="/api"` or leave `apiBaseUrl` empty (`""`) to use relative same-origin paths.

### 4. Environment Variables

Create a `.env` file in your project root:

```env
VITE_API_BASE=https://yourapiurl.com
# or
VITE_API_BASE_URL=https://yourapiurl.com
# or
VITE_API_URL=https://yourapiurl.com
```

Vite reads these variables at build time. If you consume the prebuilt npm package, pass `apiBaseUrl` for a custom URL or use a same-origin proxy.

### URL Normalization Behavior

The library includes automatic path normalization so you don't have to worry about trailing slashes or double `/api/api` paths:

| Value passed to `apiBaseUrl` | Call for `/api/v1/sessions` | Call for `/health` | Notes |
| :--- | :--- | :--- | :--- |
| `"https://yourapiurl.com"` | `https://yourapiurl.com/api/v1/sessions` | `https://yourapiurl.com/health` | Standard backend URL |
| `"https://yourapiurl.com/"` | `https://yourapiurl.com/api/v1/sessions` | `https://yourapiurl.com/health` | Trailing slash stripped cleanly |
| `"https://yourapiurl.com/api"` | `https://yourapiurl.com/api/v1/sessions` | `https://yourapiurl.com/health` | Does not duplicate `/api/api` |
| `"/api"` | `/api/v1/sessions` | `/health` | Works with local dev server proxies |
| `""` *(default)* | `/api/v1/sessions` | `/health` | Same-origin relative paths |

---

## Component Props Reference

### `ChatbotWidget`

Floating round launcher button in the bottom-right corner with an animated pop-up chat panel.

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `open` | `boolean` | `undefined` | Controlled visibility state. When provided, component behaves as controlled. |
| `onOpenChange` | `(open: boolean) => void` | `undefined` | Callback fired when the user opens or closes the widget. |
| `defaultOpen` | `boolean` | `false` | Initial open state when used in uncontrolled mode. |
| `apiBaseUrl` | `string` | `""` (or `VITE_API_BASE`) | Backend base URL or proxy URL (e.g. `"https://yourapiurl.com"` or `"/api"`). |
| `apiUrl` | `string` | `undefined` | Alias for `apiBaseUrl`. |
| `proxyUrl` | `string` | `undefined` | Alias for `apiBaseUrl`. |
| `envStage` | `EnvStage` | `undefined` | Environment badge shown in header (`"dev"`, `"stage"`, `"alpha"`, `"beta"`, `"prod"`). Omit for production. |
| `envPulse` | `boolean` | `true` | Whether the environment badge shows an animated pulsing green/amber dot. |
| `userContext` | [`ChatUserContext`](#chatusercontext) | `{}` | Authenticated customer identity (`customerId`, `email`, `name`, `role`, `page`). |
| `suggestions` | [`Suggestion[]`](#suggestion) | `DEFAULT_SUGGESTIONS` | Custom quick prompt suggestions rendered above the input. |
| `disableSuggestions` | `boolean` | `false` | When `true`, hides the suggestion badges entirely. |
| `initialMessage` | `string` | `undefined` | Starter message sent automatically to the assistant upon session creation. |
| `showGroundedSources` | `boolean` | `false` | Show the source list below replies. |
| `hideInspectSources` | `boolean` | `false` | Hide inline previews and the source list’s inspection control. |

---

### `EmbeddedChatbot`

A draggable side tab on the right edge of the screen that slides out into a full chat panel.

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `open` | `boolean` | `undefined` | Controlled open/close state of the slide-out panel. |
| `onOpenChange` | `(open: boolean) => void` | `undefined` | Callback fired when the slide-out panel opens or closes. |
| `defaultOpen` | `boolean` | `false` | Initial open state for uncontrolled mode. |
| `showTrigger` | `boolean` | `true` | Whether to display the vertical draggable "Assistant" tab on the right edge. |
| `apiBaseUrl` | `string` | `""` (or `VITE_API_BASE`) | Backend base URL or proxy path. |
| `apiUrl` | `string` | `undefined` | Alias for `apiBaseUrl`. |
| `proxyUrl` | `string` | `undefined` | Alias for `apiBaseUrl`. |
| `envStage` | `EnvStage` | `undefined` | Environment badge stage shown in header. |
| `envPulse` | `boolean` | `true` | Animated pulse dot on the environment badge. |
| `userContext` | [`ChatUserContext`](#chatusercontext) | `{}` | Authenticated customer identity information. |
| `suggestions` | [`Suggestion[]`](#suggestion) | `DEFAULT_SUGGESTIONS` | Quick prompt suggestions. |
| `disableSuggestions` | `boolean` | `false` | Hide suggestion pills. |
| `initialMessage` | `string` | `undefined` | Starter message automatically sent on mount. |
| `showGroundedSources` | `boolean` | `false` | Show the source list below replies. |
| `hideInspectSources` | `boolean` | `false` | Hide inline previews and the source list’s inspection control. |

---

### `ChatProvider`

React context provider that coordinates conversation state, API communication, message history, and customer context.

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `children` | `React.ReactNode` | **Required** | Nested components that consume chat state. |
| `apiBaseUrl` | `string` | `""` (or `VITE_API_BASE`) | Backend base URL used by all child components. |
| `apiUrl` | `string` | `undefined` | Alias for `apiBaseUrl`. |
| `proxyUrl` | `string` | `undefined` | Alias for `apiBaseUrl`. |
| `userContext` | [`ChatUserContext`](#chatusercontext) | `{}` | Shared customer identity for ticket creation and contextual flows. |
| `suggestions` | [`Suggestion[]`](#suggestion) | `DEFAULT_SUGGESTIONS` | Shared suggestion prompts. |
| `disableSuggestions` | `boolean` | `false` | Disable suggestion badges across all views. |
| `initialMessage` | `string` | `undefined` | Message triggered upon provider initialization. |
| `api` | `ChatApiClient` | `undefined` | Optional pre-configured API client instance from `createChatApi(baseUrl)`. |
| `showGroundedSources` | `boolean` | `false` | Show the source list across shared views. |
| `hideInspectSources` | `boolean` | `false` | Hide inline previews and the source list’s inspection control across shared views. |
| `modelId` | `string` | `"auto"` | Select a configured model alias. |

---

### `ChatPanel`

The inner chat interface including header, message stream, suggestions, and input row. Can be embedded directly into custom containers or modal drawers.

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `className` | `string` | `undefined` | Custom CSS classes applied to the outer `<section>` container. |
| `onClose` | `() => void` | `undefined` | Callback invoked when close/minimize is clicked. |
| `showMinimize` | `boolean` | `false` | Whether to display the minimize icon in the header. |
| `title` | `string` | `"VPS AI Assistant"` | Primary header title text. |
| `subtitle` | `string` | `undefined` | Secondary header subtitle text. |
| `envStage` | `EnvStage` | `undefined` | Environment badge stage. |
| `envPulse` | `boolean` | `true` | Pulse animation on environment badge. |

---

## Data Types & Interfaces

### `ChatUserContext`

Passed via `userContext` prop to supply portal identity:

```ts
export interface ChatUserContext {
  /** Customer unique identifier in portal (e.g. "CUST-1001") */
  customerId?: string;
  /** Customer verified email address */
  email?: string;
  /** Display name of the user */
  name?: string;
  /** User role (e.g. "admin", "customer", "operator") */
  role?: string;
  roleId?: number;
  client?: "mobile" | "web" | "admin";
  /** Current page/route context (e.g. "reports", "sample-status") */
  page?: string;
}
```

### `Suggestion`

Quick prompt suggestions:

```ts
export interface Suggestion {
  /** Text displayed inside the chip badge */
  label: string;
  /** Prompt text inserted into input box when clicked */
  query: string;
}
```

### `EnvStage`

Environment stage indicator:

```ts
export type EnvStage = "dev" | "stage" | "alpha" | "beta" | "prod";
```

### `ChatMessage`

Message structure in history:

```ts
export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: string;
  status?: "pending" | "complete" | "error" | "stopped";
  streamId?: string;
  durationMs?: number;
  progressText?: string;
  progressSteps?: string[];
  sources?: Source[];
  toolCalls?: ToolCall[];
  usage?: TokenUsage;
  feedback?: "like" | "dislike";
}
```

---

## Hooks & API Utilities

### `useChatbot()`

Access conversation state and methods from any child component within `<ChatProvider>`:

```tsx
import { useChatbot } from "vpschatbotwidget";

function CustomStatus() {
  const {
    messages,           // ChatMessage[]
    status,             // "idle" | "connecting" | "awaiting" | "error"
    error,              // string | null
    sessionId,          // string | null
    apiBaseUrl,         // string
    sendMessage,        // (text: string) => Promise<void>
    stopResponse,       // () => void
    soundEnabled,       // boolean
    toggleSound,        // () => void
    retryLast,          // () => Promise<void>
    resetConversation,  // () => Promise<void>
  } = useChatbot();

  return <div>Active Session: {sessionId} (Status: {status})</div>;
}
```

### `createChatApi()`

Factory function to instantiate an isolated API client:

```tsx
import { createChatApi } from "vpschatbotwidget";

const client = createChatApi("https://yourapiurl.com");
const session = await client.createSession();
const reply = await client.sendMessage(session.sessionId, "Hello");
```

---

## Building & Distributing

Run the frontend checks from this directory.

```bash
npm ci
npm run typecheck
npm test
npm run build
```

### Build Standalone Library

Compiles the package into `dist-lib/` with ES Modules, CommonJS, and TypeScript types:

```bash
npm run build:lib
```

### Run Tests

```bash
npm test
```

### Run TypeScript Verification

```bash
npm run typecheck
```

### Package Exports Overview

`package.json` exposes the widget through the following paths.

- `vpschatbotwidget` and `vpschatbotwidget/chatbot` resolve to ESM or CommonJS builds in `dist-lib/`.
- `vpschatbotwidget/css` loads `src/index.css`.
- TypeScript resolves both entry points to `dist-lib/types/chatbot/index.d.ts`.
