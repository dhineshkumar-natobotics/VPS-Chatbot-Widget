# VPS Customer Chatbot UI (`vpschatbotwidget`)

[![VpsChatbot-widget](https://github.com/dhineshkumar-natobotics/VPS-Chatbot-Widget/actions/workflows/npm-publish.yml/badge.svg)](https://github.com/dhineshkumar-natobotics/VPS-Chatbot-Widget/actions/workflows/npm-publish.yml)

A modular, highly customizable React + TypeScript assistant widget and slide-out panel for customer portals. Built with Tailwind CSS, Lucide icons, and full TypeScript typings.

Supports both **standalone mode** (drop-in with zero setup) and **shared conversation mode** (floating widget + slide-out panel syncing the same session).

---

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
  - [1. Standalone Widget](#1-standalone-widget-no-provider-required)
  - [2. Standalone Slide-out Panel](#2-standalone-slide-out-panel)
  - [3. Shared Conversation Mode](#3-shared-conversation-mode-multiple-views)
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

### From GitHub Repository

```bash
# Using npm
npm install git+https://github.com/dhineshkumar-natobotics/VPS-Chatbot-Widget.git

# Or if importing from a monorepo branch subdirectory
npm install github:dhineshkumar-natobotics/VPS-AI-Chatbot#main:frontend
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

Wrap both components in `<ChatProvider>` so messages, session state, and ticket flows stay synchronized between views:

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

## API & Proxy URL Configuration

You can configure the backend target using any of the following 4 methods:

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

When no prop is provided, the components automatically read `VITE_API_BASE`.

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
  status?: "pending" | "complete" | "error";
  sources?: Source[];
  toolCalls?: ToolCall[];
  usage?: TokenUsage;
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

When imported as a library, `package.json` maps:

- `.` &rarr; TypeScript source / `dist-lib/vps-chatbot.js` / CommonJS
- `./css` &rarr; `dist-lib/style.css` (or `src/index.css`)
- Types &rarr; `dist-lib/types/chatbot/index.d.ts`
