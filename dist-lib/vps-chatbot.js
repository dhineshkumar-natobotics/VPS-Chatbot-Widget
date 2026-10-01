import { jsx as o, jsxs as k, Fragment as oe } from "react/jsx-runtime";
import * as c from "react";
import Xe, { createContext as yt, useContext as Qe, useMemo as Ce, useState as j, useRef as K, useCallback as X, forwardRef as et, createElement as ke, useEffect as me } from "react";
const wt = {};
function ee(e) {
  return e != null && e.trim() !== "" ? e.trim().replace(/\/+$/, "") : String("").trim().replace(/\/+$/, "");
}
function We(e, t) {
  const r = ee(e);
  if (!r)
    return t;
  if (r.endsWith("/api") && t.startsWith("/api/"))
    return `${r}${t.slice(4)}`;
  if (r.endsWith("/api") && t === "/health") {
    const s = r.slice(0, -4);
    return s ? `${s}/health` : "/health";
  }
  const n = t.startsWith("/") ? t : `/${t}`;
  return `${r}${n}`;
}
function Ct(e) {
  return e && typeof e == "object" && "data" in e && e.success !== !1 ? e.data : e;
}
function kt(e, t, r) {
  var l, a, i;
  const n = e, s = (l = n == null ? void 0 : n.error) == null ? void 0 : l.message;
  return s && !St(s) ? {
    code: (a = n == null ? void 0 : n.error) == null ? void 0 : a.code,
    message: s,
    requestId: (i = n == null ? void 0 : n.error) == null ? void 0 : i.request_id
  } : r >= 500 ? { message: "I couldn't process that request right now." } : r === 0 ? { message: "Something went wrong while connecting. Please try again." } : { message: t };
}
function St(e) {
  return /traceback|sql|exception|stack|api[_ ]?key|password/i.test(e);
}
function Ft(e) {
  return {
    chunkId: e.chunk_id,
    source: e.source,
    score: e.score
  };
}
function Et(e) {
  return {
    toolName: e.tool_name,
    arguments: e.arguments ?? {},
    result: e.result ?? {}
  };
}
function Tt(e) {
  return {
    model: e.model,
    promptTokens: e.prompt_tokens,
    completionTokens: e.completion_tokens,
    totalTokens: e.total_tokens
  };
}
function Rt(e) {
  const t = e.role === "user" || e.role === "system" ? e.role : "assistant";
  return {
    id: String(e.id),
    role: t,
    content: e.content,
    createdAt: e.created_at || (/* @__PURE__ */ new Date()).toISOString(),
    status: "complete",
    usage: e.model ? {
      model: e.model,
      promptTokens: e.prompt_tokens || 0,
      completionTokens: e.completion_tokens || 0,
      totalTokens: (e.prompt_tokens || 0) + (e.completion_tokens || 0)
    } : void 0
  };
}
async function At(e) {
  const t = await e.text();
  if (!t) return {};
  try {
    return JSON.parse(t);
  } catch {
    return {};
  }
}
function tt(e) {
  const t = ee(e);
  async function r(n, s) {
    let l;
    const a = We(t, n);
    try {
      l = await fetch(a, {
        ...s,
        headers: {
          "Content-Type": "application/json",
          ...(s == null ? void 0 : s.headers) ?? {}
        }
      });
    } catch {
      throw { message: "Something went wrong while connecting. Please try again." };
    }
    if (l.status === 204)
      return;
    const i = await At(l);
    if (!l.ok)
      throw kt(
        i,
        "I couldn't process that request right now.",
        l.status
      );
    return Ct(i);
  }
  return {
    apiBaseUrl: t,
    async createSession() {
      const n = await r("/api/v1/sessions", {
        method: "POST",
        body: JSON.stringify({})
      });
      return { sessionId: n.session_id, createdAt: n.created_at };
    },
    async sendMessage(n, s) {
      const l = await r(
        `/api/v1/sessions/${n}/messages`,
        {
          method: "POST",
          body: JSON.stringify({ message: s })
        }
      );
      return {
        requestId: l.request_id,
        sessionId: l.session_id,
        answer: l.answer,
        sources: (l.sources || []).map(Ft),
        toolCalls: (l.tool_calls || []).map(Et),
        usage: Tt(l.usage)
      };
    },
    async getHistory(n) {
      try {
        return ((await r(
          `/api/v1/sessions/${n}/messages`
        )).messages || []).map(Rt);
      } catch {
        return [];
      }
    },
    async closeSession(n) {
      try {
        await r(`/api/v1/sessions/${n}`, { method: "DELETE" });
      } catch {
      }
    },
    async createTicket() {
      throw new Error("Ticket creation has been removed.");
    },
    async checkHealth() {
      try {
        const n = We(t, "/health");
        return (await fetch(n)).ok;
      } catch {
        return !1;
      }
    }
  };
}
const hn = tt(), Bt = [
  {
    label: "How do I access my reports?",
    query: "How do I access my reports in the VPS Customer Portal?"
  },
  {
    label: "Where can I find sample status?",
    query: "Where can I find my sample status?"
  },
  {
    label: "How do I pre-register a sample?",
    query: "How do I pre-register a sample in the portal?"
  },
  {
    label: "How do I contact VPS Support?",
    query: "How can I contact VPS Customer Support?"
  }
], Ee = yt(null);
function Dt() {
  const e = Qe(Ee);
  if (!e)
    throw new Error("useChatbot must be used inside ChatProvider.");
  return e;
}
function rt() {
  return Qe(Ee);
}
function $e(e) {
  return `${e}-${crypto.randomUUID()}`;
}
function Mt(e) {
  if (e && typeof e == "object" && "message" in e) {
    const t = String(e.message);
    if (t && !/traceback|sql|exception|stack|api[_ ]?key|password/i.test(t))
      return t;
  }
  return "I couldn't process that request right now.";
}
const nt = ({
  children: e,
  userContext: t = {},
  suggestions: r = Bt,
  disableSuggestions: n = !1,
  initialMessage: s,
  apiBaseUrl: l,
  apiUrl: a,
  proxyUrl: i,
  api: d
}) => {
  const h = l ?? a ?? i, g = Ce(
    () => d ?? tt(h),
    [d, h]
  ), [v, f] = j(null), [u, m] = j([]), [T, _] = j("idle"), [D, V] = j(null), L = K(null), $ = K(!1), P = X(async () => {
    if (v) return v;
    _("connecting");
    const y = await g.createSession();
    return f(y.sessionId), y.sessionId;
  }, [v, g]), I = X(
    async (y) => {
      L.current = y;
      const S = {
        id: $e("user"),
        role: "user",
        content: y,
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        status: "complete"
      }, F = $e("asst"), B = {
        id: F,
        role: "assistant",
        content: "",
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        status: "pending"
      };
      m((A) => [...A, S, B]), _("awaiting"), V(null);
      try {
        const A = await P(), E = await g.sendMessage(A, y);
        m(
          (W) => W.map(
            (z) => z.id === F ? {
              ...z,
              id: E.requestId || F,
              content: E.answer,
              status: "complete",
              sources: E.sources,
              toolCalls: E.toolCalls,
              usage: E.usage
            } : z
          )
        ), _("idle");
      } catch (A) {
        const E = Mt(A);
        m(
          (W) => W.map(
            (z) => z.id === F ? { ...z, content: E, status: "error" } : z
          )
        ), V(E), _("error");
      }
    },
    [P, g]
  ), R = X(
    async (y) => {
      const S = y.trim();
      !S || T === "awaiting" || T === "connecting" || await I(S);
    },
    [I, T]
  ), O = X(async () => {
    const y = L.current;
    y && (m((S) => S.filter((F) => F.status !== "error")), await I(y));
  }, [I]), N = X(async () => {
  }, []), Z = X(() => {
  }, []), U = X(async () => {
    v && await g.closeSession(v), f(null), m([]), _("idle"), V(null), L.current = null;
  }, [v, g]);
  Xe.useEffect(() => {
    !s || $.current || ($.current = !0, R(s));
  }, [s, R]);
  const b = Ce(
    () => ({
      messages: u,
      status: T,
      error: D,
      sessionId: v,
      pendingTicket: null,
      ticketBusy: !1,
      lastTicket: null,
      suggestions: r,
      showSuggestions: !n && u.length === 0,
      suggestionBadgesEnabled: !n,
      userContext: t,
      apiBaseUrl: g.apiBaseUrl,
      sendMessage: R,
      retryLast: O,
      confirmTicket: N,
      cancelTicket: Z,
      resetConversation: U
    }),
    [
      u,
      T,
      D,
      v,
      r,
      n,
      t,
      g.apiBaseUrl,
      R,
      O,
      N,
      Z,
      U
    ]
  );
  return /* @__PURE__ */ o(Ee.Provider, { value: b, children: e });
};
function ve() {
  return Dt();
}
const It = ({ message: e, onRetry: t }) => /* @__PURE__ */ k(
  "div",
  {
    className: "chat-error-banner",
    role: "alert",
    children: [
      /* @__PURE__ */ o("p", { children: e }),
      t && /* @__PURE__ */ o(
        "button",
        {
          type: "button",
          onClick: t,
          className: "chat-error-retry-btn",
          children: "Try again"
        }
      )
    ]
  }
);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Nt = (e) => e.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase(), st = (...e) => e.filter((t, r, n) => !!t && t.trim() !== "" && n.indexOf(t) === r).join(" ").trim();
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
var Pt = {
  xmlns: "http://www.w3.org/2000/svg",
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round"
};
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const xt = et(
  ({
    color: e = "currentColor",
    size: t = 24,
    strokeWidth: r = 2,
    absoluteStrokeWidth: n,
    className: s = "",
    children: l,
    iconNode: a,
    ...i
  }, d) => ke(
    "svg",
    {
      ref: d,
      ...Pt,
      width: t,
      height: t,
      stroke: e,
      strokeWidth: n ? Number(r) * 24 / Number(t) : r,
      className: st("lucide", s),
      ...i
    },
    [
      ...a.map(([h, g]) => ke(h, g)),
      ...Array.isArray(l) ? l : [l]
    ]
  )
);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const H = (e, t) => {
  const r = et(
    ({ className: n, ...s }, l) => ke(xt, {
      ref: l,
      iconNode: t,
      className: st(`lucide-${Nt(e)}`, n),
      ...s
    })
  );
  return r.displayName = `${e}`, r;
};
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Lt = H("ArrowDown", [
  ["path", { d: "M12 5v14", key: "s699le" }],
  ["path", { d: "m19 12-7 7-7-7", key: "1idqje" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Ot = H("ArrowLeft", [
  ["path", { d: "m12 19-7-7 7-7", key: "1l729n" }],
  ["path", { d: "M19 12H5", key: "x3x0zl" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Ht = H("ArrowUp", [
  ["path", { d: "m5 12 7-7 7 7", key: "hav0vg" }],
  ["path", { d: "M12 19V5", key: "x0mq9r" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const lt = H("BotMessageSquare", [
  ["path", { d: "M12 6V2H8", key: "1155em" }],
  ["path", { d: "m8 18-4 4V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2Z", key: "w2lp3e" }],
  ["path", { d: "M2 12h2", key: "1t8f8n" }],
  ["path", { d: "M9 11v2", key: "1ueba0" }],
  ["path", { d: "M15 11v2", key: "i11awn" }],
  ["path", { d: "M20 12h2", key: "1q8mjw" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const zt = H("Check", [["path", { d: "M20 6 9 17l-5-5", key: "1gmf2c" }]]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const qt = H("ChevronDown", [
  ["path", { d: "m6 9 6 6 6-6", key: "qrunsl" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Gt = H("ChevronUp", [["path", { d: "m18 15-6-6-6 6", key: "153udz" }]]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Vt = H("ClipboardCheck", [
  ["rect", { width: "8", height: "4", x: "8", y: "2", rx: "1", ry: "1", key: "tgr4d6" }],
  [
    "path",
    {
      d: "M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2",
      key: "116196"
    }
  ],
  ["path", { d: "m9 14 2 2 4-4", key: "df797q" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Wt = H("FileText", [
  ["path", { d: "M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z", key: "1rqfz7" }],
  ["path", { d: "M14 2v4a2 2 0 0 0 2 2h4", key: "tnqrlb" }],
  ["path", { d: "M10 9H8", key: "b1mrlr" }],
  ["path", { d: "M16 13H8", key: "t4e002" }],
  ["path", { d: "M16 17H8", key: "z1uh3a" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const $t = H("FlaskConical", [
  [
    "path",
    {
      d: "M14 2v6a2 2 0 0 0 .245.96l5.51 10.08A2 2 0 0 1 18 22H6a2 2 0 0 1-1.755-2.96l5.51-10.08A2 2 0 0 0 10 8V2",
      key: "18mbvz"
    }
  ],
  ["path", { d: "M6.453 15h11.094", key: "3shlmq" }],
  ["path", { d: "M8.5 2h7", key: "csnxdl" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const ot = H("MessageSquare", [
  ["path", { d: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z", key: "1lielz" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Ut = H("Microscope", [
  ["path", { d: "M6 18h8", key: "1borvv" }],
  ["path", { d: "M3 22h18", key: "8prr45" }],
  ["path", { d: "M14 22a7 7 0 1 0 0-14h-1", key: "1jwaiy" }],
  ["path", { d: "M9 14h2", key: "197e7h" }],
  ["path", { d: "M9 12a2 2 0 0 1-2-2V6h6v4a2 2 0 0 1-2 2Z", key: "1bmzmy" }],
  ["path", { d: "M12 6V3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3", key: "1drr47" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const jt = H("Minus", [["path", { d: "M5 12h14", key: "1ays0h" }]]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Yt = H("RefreshCw", [
  ["path", { d: "M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8", key: "v9h5vc" }],
  ["path", { d: "M21 3v5h-5", key: "1q7to0" }],
  ["path", { d: "M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16", key: "3uifl3" }],
  ["path", { d: "M8 16H3v5", key: "1cv678" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Zt = H("TestTubeDiagonal", [
  [
    "path",
    { d: "M21 7 6.82 21.18a2.83 2.83 0 0 1-3.99-.01a2.83 2.83 0 0 1 0-4L17 3", key: "1ub6xw" }
  ],
  ["path", { d: "m16 2 6 6", key: "1gw87d" }],
  ["path", { d: "M12 16H4", key: "1cjfip" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Jt = H("X", [
  ["path", { d: "M18 6 6 18", key: "1bl5f8" }],
  ["path", { d: "m6 6 12 12", key: "d8bk6v" }]
]), Kt = {
  alpha: {
    label: "Alpha",
    Icon: $t,
    variant: "env-badge--alpha",
    tooltip: "Alpha build — internal testing only"
  },
  beta: {
    label: "Beta",
    Icon: Zt,
    variant: "env-badge--beta",
    tooltip: "Beta build — public pre-release"
  },
  gamma: {
    label: "Gamma",
    Icon: Ut,
    variant: "env-badge--gamma",
    tooltip: "Gamma / Release Candidate"
  },
  qa: {
    label: "QA",
    Icon: Vt,
    variant: "env-badge--qa",
    tooltip: "Quality Assurance build"
  }
}, Xt = ({
  stage: e,
  pulse: t = !0,
  className: r = ""
}) => {
  if (!e) return null;
  const { label: n, Icon: s, variant: l, tooltip: a } = Kt[e];
  return /* @__PURE__ */ k(
    "span",
    {
      className: `env-badge-inline ${l} ${r}`.trim(),
      title: a,
      "aria-label": `${n} build`,
      role: "status",
      children: [
        /* @__PURE__ */ o(s, { size: 10, className: "env-badge-icon", "aria-hidden": "true" }),
        /* @__PURE__ */ o("span", { className: "env-badge-inline-label", children: n })
      ]
    }
  );
}, Qt = (e) => /* @__PURE__ */ o(
  "svg",
  {
    width: e.width || "24px",
    height: e.height || "24px",
    viewBox: "0 0 24 24",
    role: "img",
    xmlns: "http://www.w3.org/2000/svg",
    fill: e.Color || "currentColor",
    ...e,
    children: /* @__PURE__ */ o("path", { d: "M11.999 0c-2.25 0-4.5.06-6.6.21a5.57 5.57 0 0 0-5.19 5.1c-.24 3.21-.27 6.39-.06 9.6a5.644 5.644 0 0 0 5.7 5.19h3.15v-3.9h-3.15c-.93.03-1.74-.63-1.83-1.56-.18-3-.15-6 .06-9 .06-.84.72-1.47 1.56-1.53 2.04-.15 4.2-.21 6.36-.21s4.32.09 6.36.18c.81.06 1.5.69 1.56 1.53.24 3 .24 6 .06 9-.12.93-.9 1.62-1.83 1.59h-3.15l-6 3.9V24l6-3.9h3.15c2.97.03 5.46-2.25 5.7-5.19.21-3.18.18-6.39-.03-9.57a5.57 5.57 0 0 0-5.19-5.1c-2.13-.18-4.38-.24-6.63-.24zm-5.04 8.76c-.36 0-.66.3-.66.66v2.34c0 .33.18.63.48.78 1.62.78 3.42 1.2 5.22 1.26 1.8-.06 3.6-.48 5.22-1.26.3-.15.48-.45.48-.78V9.42c0-.09-.03-.15-.09-.21a.648.648 0 0 0-.87-.36c-1.5.66-3.12 1.02-4.77 1.05-1.65-.03-3.27-.42-4.77-1.08a.566.566 0 0 0-.24-.06z" })
  }
), er = ({
  title: e = "VPS AI Assistant",
  subtitle: t = "Customer portal support",
  onClose: r,
  onReset: n,
  onBack: s,
  showMinimize: l = !1,
  envStage: a,
  envPulse: i = !0
}) => /* @__PURE__ */ k("header", { className: "chat-header", children: [
  /* @__PURE__ */ k("div", { className: "chat-header-left", children: [
    s && /* @__PURE__ */ o(
      "button",
      {
        type: "button",
        onClick: s,
        className: "icon-btn-back",
        "aria-label": "Back",
        children: /* @__PURE__ */ o(Ot, { size: 16 })
      }
    ),
    /* @__PURE__ */ o(
      "div",
      {
        className: "avatar-circle",
        "aria-hidden": "true",
        children: /* @__PURE__ */ o(Qt, { width: "16px", height: "16px", color: "white" })
      }
    ),
    /* @__PURE__ */ k("div", { children: [
      /* @__PURE__ */ k("div", { className: "chat-header-title-row", children: [
        /* @__PURE__ */ o("h2", { className: "chat-header-title", children: e }),
        /* @__PURE__ */ o(Xt, { stage: a, pulse: i })
      ] }),
      /* @__PURE__ */ o("p", { className: "chat-header-subtitle", children: t || "Customer portal support" })
    ] })
  ] }),
  /* @__PURE__ */ k("div", { className: "chat-header-actions", children: [
    n && /* @__PURE__ */ o(
      "button",
      {
        type: "button",
        onClick: n,
        className: "icon-btn-action",
        "aria-label": "Start a new conversation",
        title: "New conversation",
        children: /* @__PURE__ */ o(Yt, { size: 15 })
      }
    ),
    r && /* @__PURE__ */ o(
      "button",
      {
        type: "button",
        onClick: r,
        className: "icon-btn-action",
        "aria-label": l ? "Minimize chat" : "Close chat",
        children: /* @__PURE__ */ o(jt, { size: 16 })
      }
    )
  ] })
] });
function tr(e, t) {
  const r = K(e);
  me(() => {
    var n;
    r.current && !e && ((n = t.current) == null || n.focus()), r.current = e;
  }, [e, t]);
}
function rr(e, t) {
  const r = t.trim().toLowerCase();
  return r ? e.filter(
    (n) => n.label.toLowerCase().includes(r) || n.query.toLowerCase().includes(r)
  ) : e;
}
const nr = ({
  suggestions: e,
  onSelect: t,
  disabled: r,
  variant: n = "list"
}) => e.length ? n === "badge" ? /* @__PURE__ */ o(
  "ul",
  {
    className: "suggestions-badge-list",
    "aria-label": "Suggested questions",
    children: e.map((s) => /* @__PURE__ */ o("li", { className: "suggestion-badge-item", children: /* @__PURE__ */ o(
      "button",
      {
        type: "button",
        disabled: r,
        onClick: () => t(s),
        title: s.query,
        className: "suggestion-badge-btn",
        children: s.label
      }
    ) }, s.query))
  }
) : /* @__PURE__ */ o("div", { className: "suggestions-list", children: e.map((s) => /* @__PURE__ */ o(
  "button",
  {
    type: "button",
    disabled: r,
    onClick: () => t(s),
    className: "suggestion-list-btn",
    children: s.label
  },
  s.query
)) }) : null, sr = ({
  onSend: e,
  disabled: t = !1,
  placeholder: r = "Ask something…"
}) => {
  const { suggestions: n, showSuggestions: s, suggestionBadgesEnabled: l } = ve(), [a, i] = j(""), d = K(null), h = (u) => {
    u && (u.style.height = "auto", u.style.height = `${Math.min(u.scrollHeight, 96)}px`);
  };
  tr(t, d), me(() => {
    h(d.current);
  }, [a]);
  const g = Ce(() => {
    if (!l || t) return [];
    const u = a.trim();
    return u ? rr(n, u) : s ? n : [];
  }, [t, s, l, n, a]), v = (u) => {
    i(u.query);
    const m = d.current;
    m == null || m.focus();
  }, f = () => {
    const u = a.trim();
    !u || t || (e(u), i(""), d.current && (d.current.style.height = "auto"));
  };
  return /* @__PURE__ */ k("div", { className: "chat-input-wrapper", children: [
    /* @__PURE__ */ o(
      nr,
      {
        variant: "badge",
        suggestions: g,
        onSelect: v,
        disabled: t
      }
    ),
    /* @__PURE__ */ o("label", { htmlFor: "vps-chat-input", className: "sr-only", children: "Chat message" }),
    /* @__PURE__ */ k("div", { className: "chat-input-row", children: [
      /* @__PURE__ */ o(
        "textarea",
        {
          id: "vps-chat-input",
          ref: d,
          rows: 1,
          value: a,
          disabled: t,
          placeholder: r,
          onChange: (u) => {
            i(u.target.value), h(u.target);
          },
          onKeyDown: (u) => {
            u.key === "Enter" && !u.shiftKey && (u.preventDefault(), f());
          },
          className: "chat-textarea"
        }
      ),
      /* @__PURE__ */ o(
        "button",
        {
          type: "button",
          onClick: f,
          disabled: t || !a.trim(),
          "aria-label": "Send message",
          className: "chat-send-btn",
          children: /* @__PURE__ */ o(Ht, { size: 16 })
        }
      )
    ] }),
    /* @__PURE__ */ k("p", { className: "chat-input-footer", children: [
      "Powered by ",
      /* @__PURE__ */ o("span", { className: "chat-input-footer-brand", children: "VPS Veritas AI" })
    ] })
  ] });
};
function lr({ defaultTagName: e, props: t, render: r, state: n = {}, stateAttributesMapping: s }) {
  let l = Se(or(n, s), t);
  if (!r) return c.createElement(e, l);
  if (typeof r == "function") return r(l, n);
  if (!c.isValidElement(r)) return null;
  let a = r.props, i = { ...Se(l, a), ref: ae(l.ref, a.ref) };
  return c.cloneElement(r, i);
}
function Se(...e) {
  let t = {};
  for (let r of e) {
    if (!r) continue;
    let n = r;
    for (let s of Object.keys(n)) {
      let l = n[s];
      if (l === void 0) continue;
      let a = t[s];
      s === "className" ? t[s] = [a, l].filter(Boolean).join(" ") : s === "style" ? t[s] = { ...a, ...l } : s === "ref" ? t[s] = ae(a, l) : ir(s) && typeof a == "function" && typeof l == "function" ? t[s] = ar(l, a) : t[s] = l;
    }
  }
  return t;
}
function or(e, t) {
  var n;
  let r = {};
  for (let s of Object.keys(e)) {
    let l = e[s], a = (n = t == null ? void 0 : t[s]) == null ? void 0 : n.call(t, l);
    if (a) {
      Object.assign(r, a);
      continue;
    }
    if (s === "slot") {
      r["data-slot"] = l;
      continue;
    }
    let i = `data-${String(s).replace(/[A-Z]/g, (d) => `-${d.toLowerCase()}`)}`;
    typeof l == "boolean" ? r[i] = l ? "" : void 0 : l != null && (r[i] = String(l));
  }
  return r;
}
function ar(e, t) {
  return function(r) {
    e(r), r.defaultPrevented || t(r);
  };
}
function ir(e) {
  return /^on[A-Z]/.test(e);
}
function ae(...e) {
  let t = e.filter(Boolean);
  if (t.length !== 0) return (r) => {
    for (let n of t) typeof n == "function" ? n(r) : n && (n.current = r);
  };
}
var cr = 8, ur = 64, dr = 0, be = 0.5, fr = 180, hr = /* @__PURE__ */ new Set(["ArrowDown", "ArrowUp", "End", "Home", "PageDown", "PageUp", " "]), at = { start: !1, end: !1 }, pr = [], _e = { currentAnchorId: null, visibleMessageIds: pr };
function gr({ content: e, scrollEdgeThreshold: t, spacer: r, viewport: n }) {
  if (!n || !e) return at;
  let s = Te({ content: e, spacer: r, viewport: n });
  return { start: n.scrollTop > t, end: s - n.scrollTop - n.clientHeight > t };
}
function mr({ content: e, scrollMargin: t, scrollPreviousItemPeek: r, spacer: n, viewport: s, visibleMessageIds: l }) {
  if (!e || !s) return _e;
  let a = s.getBoundingClientRect(), i = a.top + t + r, d = typeof IntersectionObserver > "u", h = [], g = null;
  for (let v of le(e, n)) {
    let f = v.dataset.messageId;
    if (!f) continue;
    let u = v.dataset.scrollAnchor === "true", m = u || d ? v.getBoundingClientRect() : null;
    (d && m ? m.bottom > i && m.top < a.bottom : l.has(f)) && h.push(f), u && m && m.top <= i + be && (g = f);
  }
  return h.length === 0 && g === null ? _e : { currentAnchorId: g, visibleMessageIds: h };
}
function le(e, t) {
  return Array.from(e.children).filter((r) => r instanceof HTMLElement && r !== t);
}
function br(e, t) {
  for (let r = t; r < e.length; r++) {
    let n = e[r];
    if ((n == null ? void 0 : n.dataset.scrollAnchor) === "true") return n;
  }
  return null;
}
function _r(e, t) {
  for (let r of e) if (r.dataset.scrollAnchor === "true" && !t.has(r)) return r;
  return null;
}
function vr(e, t) {
  var n;
  let r = 0;
  for (let s = t; s < e.length; s++) if (((n = e[s]) == null ? void 0 : n.dataset.scrollAnchor) === "true" && (r += 1, r > 1)) return !0;
  return !1;
}
function yr(e) {
  for (let t = e.length - 1; t >= 0; t--) {
    let r = e[t];
    if ((r == null ? void 0 : r.dataset.scrollAnchor) === "true") return r;
  }
  return null;
}
function wr({ content: e, spacer: t, viewport: r }) {
  let n = r.getBoundingClientRect();
  for (let s of le(e, t)) {
    if (!s.dataset.messageId) continue;
    let l = s.getBoundingClientRect();
    if (l.bottom > n.top && l.top < n.bottom) return s;
  }
  return null;
}
function Cr({ align: e, element: t, scrollMargin: r, spacer: n, viewport: s }) {
  let l = it(t, s), a = t.getBoundingClientRect().height, i = Fr(n);
  if (e === "center") {
    let d = Math.max(0, s.clientHeight - i.start - i.end);
    return l - i.start - (d - a) / 2 - r;
  }
  if (e === "end") return l - s.clientHeight + a + i.end + r;
  if (e === "nearest") {
    let d = l + a, h = s.scrollTop + i.start, g = s.scrollTop + s.clientHeight - i.end;
    return l >= h && d <= g ? s.scrollTop : l < h ? l - i.start - r : d - s.clientHeight + i.end + r;
  }
  return l - i.start - r;
}
function it(e, t) {
  let r = e.getBoundingClientRect(), n = t.getBoundingClientRect();
  return r.top - n.top + t.scrollTop;
}
function pe(e, t) {
  return e.getBoundingClientRect().top - t.getBoundingClientRect().top;
}
function kr({ content: e, scrollTop: t, spacer: r, viewport: n }) {
  let s = Te({ content: e, spacer: r, viewport: n });
  return t + n.clientHeight - s;
}
function Te({ content: e, spacer: t, viewport: r }) {
  let n = le(e, t), s = ct(e), l = r.getBoundingClientRect(), a = r.scrollTop, i = s.start + s.end;
  for (let d of n) {
    let h = d.getBoundingClientRect();
    i = Math.max(i, h.bottom - l.top + a + s.end);
  }
  return i;
}
function Sr(e) {
  return Math.max(0, e.scrollHeight - e.clientHeight);
}
function ct(e) {
  let t = window.getComputedStyle(e);
  return { end: Fe(t.paddingBlockEnd || t.paddingBottom), start: Fe(t.paddingBlockStart || t.paddingTop) };
}
function Fr(e) {
  let t = e == null ? void 0 : e.parentElement;
  return t ? ct(t) : { end: 0, start: 0 };
}
function Er(e) {
  if (!e) return 0;
  let t = window.getComputedStyle(e), r = t.rowGap === "normal" ? t.gap : t.rowGap;
  return Fe(r);
}
function Fe(e) {
  if (!e) return 0;
  let t = Number.parseFloat(e);
  return Number.isFinite(t) ? t : 0;
}
function ut(e, t) {
  let r = e, n = /* @__PURE__ */ new Set();
  return { getSnapshot: () => r, hasListeners: () => n.size > 0, setSnapshot: (s) => {
    t(r, s) || (r = s, n.forEach((l) => l()));
  }, subscribe: (s, l, a) => {
    let i = n.size === 0;
    return n.add(s), i && (l == null || l()), () => {
      n.delete(s), n.size === 0 && (a == null || a());
    };
  } };
}
function Ue(e, t) {
  return ut(e, t);
}
function Tr() {
  return ut(_e, Ar);
}
function Rr(e, t) {
  return e.start === t.start && e.end === t.end;
}
function Ar(e, t) {
  return e.currentAnchorId !== t.currentAnchorId || e.visibleMessageIds.length !== t.visibleMessageIds.length ? !1 : e.visibleMessageIds.every((r, n) => r === t.visibleMessageIds[n]);
}
function Br({ autoScroll: e, defaultScrollPosition: t, scrollEdgeThreshold: r, scrollMargin: n, scrollPreviousItemPeek: s }) {
  let l = c.useRef(e), a = c.useRef(!1), i = c.useRef(null), d = c.useRef(!1), h = c.useRef(r), g = c.useRef(0), v = c.useRef(null), f = c.useRef(0), u = c.useRef(e ? "following-bottom" : "free-scrolling"), m = c.useRef(/* @__PURE__ */ new Map()), T = c.useRef(null), _ = c.useRef(null), D = c.useRef(null), V = c.useRef(s), L = c.useRef(!0), $ = c.useRef(null), P = c.useRef(n), I = c.useRef(null), R = c.useRef(0), O = c.useRef(0), N = c.useRef(null), Z = c.useRef(null), U = c.useRef(null), b = c.useRef(null), y = c.useRef(null), S = c.useRef(null), F = c.useRef(null), B = c.useRef(null), A = c.useRef(null), E = c.useRef(/* @__PURE__ */ new Set()), W = c.useRef(/* @__PURE__ */ new WeakSet());
  return U.current === null && (U.current = Ue(t === "end" || t === "last-anchor", (z, ce) => z === ce)), b.current === null && (b.current = Ue(at, Rr)), A.current === null && (A.current = Tr()), l.current = e, h.current = r, P.current = n, V.current = s, { autoScrollRef: l, autoscrollingRef: a, autoscrollingTimeoutRef: y, streamingTurnRef: D, contentRef: i, defaultScrollPositionAppliedRef: d, firstItemRef: v, itemCountRef: g, lastScrollTopRef: f, messageElementsRef: m, modeRef: u, pendingScrollFrameRef: I, pendingScrollToMessageRef: T, prependRestoreRef: _, preserveScrollOnPrependRef: L, pendingDefaultScrollStore: U.current, rootRef: $, scrollEdgeThresholdRef: h, scrollMarginRef: P, scrollPreviousItemPeekRef: V, spacerGapRef: R, spacerHeightRef: O, spacerRef: N, stateFrameRef: Z, stateStore: b.current, viewportRef: S, visibilityFrameRef: F, visibilityObserverRef: B, visibilityStore: A.current, visibleMessageIdsRef: E, handledScrollAnchorsRef: W };
}
function dt(e) {
  e.pendingDefaultScrollStore.setSnapshot(!1);
}
function ge(e) {
  e.defaultScrollPositionAppliedRef.current = !0, dt(e);
}
function Dr({ refs: e, commitScrollState: t, scheduleStateCommit: r, scheduleVisibilitySync: n }) {
  let { streamingTurnRef: s, autoScrollRef: l, autoscrollingRef: a, autoscrollingTimeoutRef: i, contentRef: d, itemCountRef: h, messageElementsRef: g, modeRef: v, pendingScrollToMessageRef: f, prependRestoreRef: u, scrollMarginRef: m, scrollPreviousItemPeekRef: T, spacerGapRef: _, spacerHeightRef: D, spacerRef: V, viewportRef: L } = e, $ = c.useCallback((b) => {
    i.current !== null && (window.clearTimeout(i.current), i.current = null), a.current !== b && (a.current = b, t()), b && (i.current = window.setTimeout(() => {
      i.current = null, a.current = !1, t();
    }, fr));
  }, [t]), P = c.useCallback((b) => {
    let y = V.current;
    if (!y) return;
    let S = Math.max(0, Math.ceil(b));
    D.current !== S && (D.current = S, y.hidden = S === 0, y.style.height = `${S}px`, y.style.marginTop = S > 0 ? `${-_.current}px` : "");
  }, []), I = c.useCallback((b, { behavior: y = "auto", autoscrolling: S = !1 } = {}) => {
    let F = L.current;
    if (!F) return;
    let B = Math.max(0, b);
    if (Math.abs(F.scrollTop - B) <= be) {
      F.scrollTop = B, t();
      return;
    }
    S && $(!0), F.scrollTo({ top: B, behavior: y }), r();
  }, [t, r, $]), R = c.useCallback(({ behavior: b = "auto" } = {}) => L.current ? (P(0), s.current = null, v.current = "free-scrolling", I(0, { behavior: b }), n(), !0) : !1, [n, I, P]), O = c.useCallback(({ behavior: b = "auto" } = {}) => {
    let y = L.current;
    return y ? (P(0), s.current = null, v.current = l.current ? "following-bottom" : "free-scrolling", I(Sr(y), { autoscrolling: !0, behavior: b }), n(), !0) : !1;
  }, [n, I, P]), N = c.useCallback((b, { align: y = "start", behavior: S = "auto", scrollMargin: F = m.current } = {}, { keepPreviousPeek: B = !1 } = {}) => {
    let A = d.current, E = L.current;
    if (!A || !E || !A.contains(b)) return !1;
    let W = Cr({ align: y, element: b, scrollMargin: B ? F + T.current : F, spacer: V.current, viewport: E }), z = kr({ content: A, scrollTop: W, spacer: V.current, viewport: E });
    return P(z), u.current = { element: b, viewportTop: pe(b, E) }, v.current = B ? "anchored-to-message" : "settling-jump", s.current = B ? b : null, I(W, { behavior: S }), n(), !0;
  }, [n, I, P]), Z = c.useCallback(() => {
    let b = s.current;
    return !b || !b.isConnected || v.current !== "anchored-to-message" ? !1 : N(b, { align: "start" }, { keepPreviousPeek: !0 });
  }, [N]), U = c.useCallback((b, y) => {
    let S = g.current.get(b);
    return S ? (ge(e), N(S, y) ? (f.current = null, !0) : (f.current = { messageId: b, options: y }, !0)) : h.current === 0 ? (f.current = { messageId: b, options: y }, ge(e), !0) : !1;
  }, [N]);
  return { flushPendingScrollToMessage: c.useCallback(() => {
    let b = f.current;
    if (!b) return !1;
    let y = g.current.get(b.messageId);
    return !y || !N(y, b.options) ? !1 : (f.current = null, ge(e), !0);
  }, [N]), reanchorToAnchoredMessage: Z, scrollToElement: N, scrollToEnd: O, scrollToMessage: U, scrollToStart: R };
}
function je(e, t) {
  return c.useCallback((r) => {
    e.current = r, r && t();
  }, [e, t]);
}
function Mr({ autoScroll: e = !1, defaultScrollPosition: t = "end", scrollEdgeThreshold: r = cr, scrollPreviousItemPeek: n = ur, scrollMargin: s = dr }) {
  let l = Br({ autoScroll: e, defaultScrollPosition: t, scrollEdgeThreshold: r, scrollMargin: s, scrollPreviousItemPeek: n }), { streamingTurnRef: a, autoScrollRef: i, autoscrollingRef: d, autoscrollingTimeoutRef: h, contentRef: g, defaultScrollPositionAppliedRef: v, firstItemRef: f, itemCountRef: u, lastScrollTopRef: m, messageElementsRef: T, modeRef: _, pendingScrollFrameRef: D, pendingScrollToMessageRef: V, prependRestoreRef: L, preserveScrollOnPrependRef: $, pendingDefaultScrollStore: P, rootRef: I, scrollEdgeThresholdRef: R, scrollMarginRef: O, scrollPreviousItemPeekRef: N, spacerGapRef: Z, spacerHeightRef: U, spacerRef: b, stateFrameRef: y, stateStore: S, viewportRef: F, visibilityFrameRef: B, visibilityObserverRef: A, visibilityStore: E, visibleMessageIdsRef: W, handledScrollAnchorsRef: z } = l, ce = c.useRef(t);
  ce.current !== t && (ce.current = t, v.current = !1);
  let ue = c.useCallback((p) => {
    let w = I.current, C = F.current, M = [p.start && "start", p.end && "end"].filter(Boolean).join(" "), J = d.current;
    for (let G of [w, C]) G && (M ? G.setAttribute("data-scrollable", M) : G.removeAttribute("data-scrollable"), G.toggleAttribute("data-autoscrolling", J));
  }, []), Re = c.useCallback((p) => {
    var M;
    let w = ((M = F.current) == null ? void 0 : M.scrollTop) ?? 0, C = w < m.current - be;
    m.current = w, i.current && !p.end && _.current !== "settling-jump" && _.current !== "anchored-to-message" ? _.current = "following-bottom" : _.current === "following-bottom" && p.end && C && !d.current && (_.current = "free-scrolling");
  }, []), Y = c.useCallback(() => {
    let p = gr({ content: g.current, scrollEdgeThreshold: R.current, spacer: b.current, viewport: F.current });
    Re(p);
    let w = _.current === "following-bottom" ? { ...p, end: !1 } : p;
    ue(w), S.setSnapshot(w);
  }, [Re, S, ue]), ne = c.useCallback(() => {
    y.current === null && (y.current = window.requestAnimationFrame(() => {
      y.current = null, Y();
    }));
  }, [Y]), x = c.useCallback(() => {
    E.hasListeners() && B.current === null && (B.current = window.requestAnimationFrame(() => {
      B.current = null, E.hasListeners() && E.setSnapshot(mr({ content: g.current, scrollMargin: O.current, scrollPreviousItemPeek: N.current, spacer: b.current, viewport: F.current, visibleMessageIds: W.current }));
    }));
  }, [E]), { flushPendingScrollToMessage: de, reanchorToAnchoredMessage: Ae, scrollToElement: se, scrollToEnd: q, scrollToMessage: Be, scrollToStart: fe } = Dr({ refs: l, commitScrollState: Y, scheduleStateCommit: ne, scheduleVisibilitySync: x }), De = c.useCallback(() => {
    let p = L.current, w = F.current;
    if (!p || !w || !p.element.isConnected) return !1;
    let C = pe(p.element, w) - p.viewportTop;
    return Math.abs(C) <= be ? !1 : (w.scrollTop += C, p.viewportTop = pe(p.element, w), ne(), x(), !0);
  }, [ne, x]), Q = c.useCallback(() => {
    let p = g.current, w = F.current;
    if (!p || !w) {
      L.current = null;
      return;
    }
    let C = wr({ content: p, spacer: b.current, viewport: w });
    L.current = C ? { element: C, viewportTop: pe(C, w) } : null;
  }, []), Me = c.useCallback(() => {
    D.current === null && (D.current = window.requestAnimationFrame(() => {
      D.current = null, de() && Q();
    }));
  }, [Q, de]), he = c.useCallback(() => {
    if (!t || v.current || u.current === 0) return !1;
    let p = !1;
    if (t === "last-anchor") {
      let w = g.current, C = F.current, M = w && C ? yr(le(w, b.current)) : null;
      if (!w || !C || !M) p = q({ behavior: "auto" });
      else {
        let J = it(M, C);
        p = Te({ content: w, spacer: b.current, viewport: C }) - J <= C.clientHeight ? q({ behavior: "auto" }) : se(M, { align: "start" }, { keepPreviousPeek: !0 });
      }
    } else p = t === "end" ? q({ behavior: "auto" }) : fe({ behavior: "auto" });
    return p ? (ge(l), !0) : !1;
  }, [t, se, q, fe]), Ie = c.useCallback(() => {
    let p = g.current;
    if (!p) return;
    let w = le(p, b.current), C = u.current, M = f.current;
    u.current = w.length, f.current = w[0] ?? null, (() => {
      if (de()) return;
      if (C === 0) {
        if (he() || w.length > 0 && i.current && q({ behavior: "auto" })) return;
        Y(), x();
        return;
      }
      let J = M ? w.indexOf(M) : -1;
      if ($.current && J > 0) {
        De();
        return;
      }
      if (w.length > C) {
        let G = br(w, C);
        if (G) {
          if (i.current && _.current === "following-bottom" && vr(w, C)) {
            q({ behavior: "auto" });
            return;
          }
          se(G, { align: "start" }, { keepPreviousPeek: !0 }), z.current.add(G);
          return;
        }
      }
      if (w.length === C) {
        let G = _r(w, z.current);
        if (G) {
          se(G, { align: "start" }, { keepPreviousPeek: !0 }), z.current.add(G);
          return;
        }
      }
      _.current === "following-bottom" && i.current ? q({ behavior: "auto" }) : (Y(), x());
    })(), Q();
  }, [he, Q, Y, de, De, x, se, q]), Ne = c.useCallback(() => {
    if (_.current === "following-bottom" && i.current) {
      q({ behavior: "auto" });
      return;
    }
    let p = U.current;
    if (Ae()) {
      i.current && p > 0 && U.current === 0 && q({ behavior: "auto" });
      return;
    }
    ne(), x();
  }, [Ae, ne, x, q]), Pe = c.useCallback(() => {
    let p = F.current;
    if (!(!p || !E.hasListeners())) {
      if (typeof IntersectionObserver > "u") {
        x();
        return;
      }
      A.current || (A.current = new IntersectionObserver((w) => {
        for (let C of w) {
          let M = C.target.dataset.messageId;
          M && (C.isIntersecting ? W.current.add(M) : W.current.delete(M));
        }
        x();
      }, { root: p, rootMargin: `${-(O.current + N.current)}px 0px 0px 0px`, threshold: [0, 0.01, 0.5, 1] })), T.current.forEach((w) => {
        var C;
        (C = A.current) == null || C.observe(w);
      }), x();
    }
  }, [x, E]), xe = c.useCallback(() => {
    var p;
    B.current !== null && (window.cancelAnimationFrame(B.current), B.current = null), (p = A.current) == null || p.disconnect(), A.current = null, W.current.clear(), E.setSnapshot(_e);
  }, [E]), _t = c.useCallback((p, w, C) => {
    var M, J, G;
    if (w) {
      T.current.set(p, w), (M = A.current) == null || M.observe(w), x(), ((J = V.current) == null ? void 0 : J.messageId) === p && Me();
      return;
    }
    C && T.current.get(p) === C && (T.current.delete(p), W.current.delete(p), (G = A.current) == null || G.unobserve(C), x());
  }, [Me, x]), Le = c.useCallback(() => {
    (_.current === "following-bottom" || _.current === "anchored-to-message" || _.current === "settling-jump") && (a.current = null, _.current = "free-scrolling");
  }, []), Oe = c.useCallback(() => ue(S.getSnapshot()), [S, ue]), He = je(I, Oe), ze = je(F, Oe), qe = c.useCallback((p) => {
    g.current = p;
  }, []), Ge = c.useCallback((p) => {
    b.current = p, Z.current = Er((p == null ? void 0 : p.parentElement) ?? null);
  }, []), Ve = c.useCallback(() => {
    Y(), x(), Q();
  }, [Q, Y, x]), vt = c.useMemo(() => ({ handleContentChange: Ie, handleResize: Ne, observeVisibility: Pe, pendingDefaultScrollStore: P, preserveScrollOnPrependRef: $, scrollToEnd: q, scrollToMessage: Be, scrollToStart: fe, setContentElement: qe, setRootElement: He, setSpacerElement: Ge, setViewportElement: ze, stateStore: S, syncAfterScroll: Ve, unobserveVisibility: xe, userScrollIntent: Le, viewportRef: F, visibilityStore: E }), [Ie, Ne, Pe, P, q, Be, fe, qe, He, Ge, ze, S, Ve, xe, Le, E]);
  return c.useLayoutEffect(() => {
    he() || u.current === 0 && dt(l);
  }, [he]), c.useEffect(() => () => {
    var p;
    y.current !== null && (window.cancelAnimationFrame(y.current), y.current = null), B.current !== null && (window.cancelAnimationFrame(B.current), B.current = null), h.current !== null && (window.clearTimeout(h.current), h.current = null), D.current !== null && (window.cancelAnimationFrame(D.current), D.current = null), (p = A.current) == null || p.disconnect(), A.current = null;
  }, []), c.useLayoutEffect(() => {
    if (e && _.current === "following-bottom" && u.current > 0) {
      q({ behavior: "auto" });
      return;
    }
    Y();
  }, [e, Y, q]), { context: vt, registerMessage: _t };
}
function Ir(e) {
  let t = c.useRef(e);
  return t.current = e, t;
}
var ft = c.createContext(null), ht = c.createContext(null);
function ie() {
  let e = c.useContext(ft);
  if (!e) throw new Error("useMessageScroller must be used within a MessageScroller.");
  return e;
}
function Nr() {
  let e = c.useContext(ht);
  if (!e) throw new Error("MessageScrollerItem must be used within a MessageScroller.");
  return e;
}
function Pr({ autoScroll: e = !1, children: t, defaultScrollPosition: r = "end", scrollEdgeThreshold: n, scrollPreviousItemPeek: s, scrollMargin: l }) {
  let { context: a, registerMessage: i } = Mr({ autoScroll: e, defaultScrollPosition: r, scrollEdgeThreshold: n, scrollPreviousItemPeek: s, scrollMargin: l });
  return o(ft.Provider, { value: a, children: o(ht.Provider, { value: i, children: t }) });
}
function pt() {
  let { pendingDefaultScrollStore: e } = ie();
  return c.useSyncExternalStore(e.subscribe, e.getSnapshot, e.getSnapshot);
}
function xr({ children: e, ...t }) {
  let { setRootElement: r } = ie(), n = pt();
  return o("div", { ref: r, ...t, ...n ? { "data-pending-scroll": "" } : null, children: e });
}
function Lr({ "aria-label": e, children: t, onKeyDown: r, onScroll: n, onTouchMove: s, onWheel: l, preserveScrollOnPrepend: a = !0, ref: i, role: d, tabIndex: h, ...g }) {
  let { handleResize: v, preserveScrollOnPrependRef: f, setViewportElement: u, syncAfterScroll: m, userScrollIntent: T, viewportRef: _ } = ie(), D = pt();
  f.current = a;
  let V = c.useCallback((R) => {
    var O;
    u(R), (O = ae(i)) == null || O(R);
  }, [i, u]);
  function L(R) {
    m(), n == null || n(R);
  }
  function $(R) {
    T(), l == null || l(R);
  }
  function P(R) {
    T(), s == null || s(R);
  }
  function I(R) {
    hr.has(R.key) && T(), r == null || r(R);
  }
  return c.useEffect(() => {
    let R = _.current;
    if (!R || typeof ResizeObserver > "u") return;
    let O = 0, N = new ResizeObserver(() => {
      window.cancelAnimationFrame(O), O = window.requestAnimationFrame(v);
    });
    return N.observe(R), () => {
      window.cancelAnimationFrame(O), N.disconnect();
    };
  }, [v, _]), o("div", { ref: V, role: d ?? "region", "aria-label": e ?? "Messages", tabIndex: h ?? 0, onKeyDown: I, onScroll: L, onTouchMove: P, onWheel: $, ...g, ...D ? { "data-pending-scroll": "" } : null, children: t });
}
function Or({ "aria-relevant": e, children: t, ref: r, role: n, spacerClassName: s, ...l }) {
  let { handleContentChange: a, handleResize: i, setContentElement: d, setSpacerElement: h } = ie(), g = c.useRef(null), v = c.useCallback((f) => {
    var u;
    g.current = f, d(f), (u = ae(r)) == null || u(f);
  }, [r, d]);
  return c.useLayoutEffect(() => {
    let f = g.current;
    if (!f || (a(), typeof MutationObserver > "u")) return;
    let u = new MutationObserver(() => {
      a();
    });
    return u.observe(f, { childList: !0 }), () => u.disconnect();
  }, [a]), c.useEffect(() => {
    let f = g.current;
    if (!f || typeof ResizeObserver > "u") return;
    let u = 0, m = new ResizeObserver(() => {
      window.cancelAnimationFrame(u), u = window.requestAnimationFrame(i);
    });
    return m.observe(f), () => {
      window.cancelAnimationFrame(u), m.disconnect();
    };
  }, [i]), k("div", { ref: v, role: n ?? "log", "aria-relevant": e ?? "additions", ...l, children: [t, o("div", { ref: h, "aria-hidden": "true", "data-message-scroller-spacer": "", hidden: !0, className: s })] });
}
function Hr({ messageId: e, ref: t, scrollAnchor: r = !1, ...n }) {
  let s = Nr(), l = c.useRef(null), a = c.useCallback((i) => {
    var h;
    let d = l.current;
    l.current = i, e && s(e, i, d), (h = ae(t)) == null || h(i);
  }, [e, t, s]);
  return o("div", { ref: a, "data-message-id": e, "data-scroll-anchor": r ? "true" : "false", ...n });
}
function zr({ behavior: e = "smooth", children: t, direction: r = "end", onClick: n, render: s, tabIndex: l, type: a = "button", ...i }) {
  let { scrollToEnd: d, scrollToStart: h, stateStore: g } = ie(), v = Ir(n), f = c.useCallback((_) => g.subscribe(_), [g]), u = c.useCallback(() => {
    let _ = g.getSnapshot();
    return r === "start" ? _.start : _.end;
  }, [r, g]), m = c.useSyncExternalStore(f, u, u), T = c.useCallback((_) => {
    var D;
    m && ((D = v.current) == null || D.call(v, _), _.defaultPrevented || (_.currentTarget.blur(), r === "start" ? h({ behavior: e }) : d({ behavior: e })));
  }, [e, r, m, v, d, h]);
  return lr({ defaultTagName: "button", props: Se({ type: a, inert: !m, tabIndex: m ? l : -1, children: t ?? k("span", { children: ["Scroll to ", r] }), onClick: T }, i), render: s, state: { active: m, direction: r }, stateAttributesMapping: { active: (_) => ({ "data-active": _ ? "true" : "false" }) } });
}
var te = { Provider: Pr, Root: xr, Viewport: Lr, Content: Or, Item: Hr, Button: zr };
function gt(e) {
  var t, r, n = "";
  if (typeof e == "string" || typeof e == "number") n += e;
  else if (typeof e == "object") if (Array.isArray(e)) {
    var s = e.length;
    for (t = 0; t < s; t++) e[t] && (r = gt(e[t])) && (n && (n += " "), n += r);
  } else for (r in e) e[r] && (n && (n += " "), n += r);
  return n;
}
function qr() {
  for (var e, t, r = 0, n = "", s = arguments.length; r < s; r++) (e = arguments[r]) && (t = gt(e)) && (n && (n += " "), n += t);
  return n;
}
function re(...e) {
  return qr(e);
}
function Gr(e) {
  return /* @__PURE__ */ o(te.Provider, { ...e });
}
function Vr({
  className: e,
  ...t
}) {
  return /* @__PURE__ */ o(
    te.Root,
    {
      "data-slot": "message-scroller",
      className: re("msg-scroller-root", e),
      ...t
    }
  );
}
function Wr({
  className: e,
  ...t
}) {
  return /* @__PURE__ */ o(
    te.Viewport,
    {
      "data-slot": "message-scroller-viewport",
      className: re("msg-scroller-viewport", e),
      ...t
    }
  );
}
function $r({
  className: e,
  ...t
}) {
  return /* @__PURE__ */ o(
    te.Content,
    {
      "data-slot": "message-scroller-content",
      className: re("msg-scroller-content", e),
      ...t
    }
  );
}
function Ye({
  className: e,
  scrollAnchor: t = !1,
  ...r
}) {
  return /* @__PURE__ */ o(
    te.Item,
    {
      "data-slot": "message-scroller-item",
      scrollAnchor: t,
      className: re("msg-scroller-item", e),
      ...r
    }
  );
}
function Ur({
  direction: e = "end",
  className: t,
  children: r,
  ...n
}) {
  return /* @__PURE__ */ o(
    te.Button,
    {
      "data-slot": "message-scroller-button",
      direction: e,
      className: re("msg-scroller-btn", t),
      ...n,
      children: r ?? /* @__PURE__ */ k(oe, { children: [
        /* @__PURE__ */ o(
          Lt,
          {
            size: 16,
            "aria-hidden": "true",
            className: e === "start" ? "rotate-180" : void 0
          }
        ),
        /* @__PURE__ */ o("span", { className: "sr-only", children: e === "end" ? "Jump to latest" : "Jump to start" })
      ] })
    }
  );
}
const jr = () => /* @__PURE__ */ k("div", { className: "chat-empty-row", children: [
  /* @__PURE__ */ o(
    "div",
    {
      className: "avatar-circle avatar-circle--mt",
      "aria-hidden": "true",
      children: /* @__PURE__ */ o(lt, { size: 15 })
    }
  ),
  /* @__PURE__ */ o("div", { className: "chat-empty-bubble", children: /* @__PURE__ */ o("p", { children: "Hello — I am the VPS Veritas assistant. Ask about reports, sample status, registration, or support, or choose a question below the text box." }) })
] });
function ye(e) {
  return e.split(/(\*\*[^*]+\*\*|`[^`]+`|https?:\/\/[^\s]+)/g).map((r, n) => r.startsWith("**") && r.endsWith("**") ? /* @__PURE__ */ o("strong", { children: r.slice(2, -2) }, n) : r.startsWith("`") && r.endsWith("`") ? /* @__PURE__ */ o(
    "code",
    {
      className: "md-code",
      children: r.slice(1, -1)
    },
    n
  ) : /^https?:\/\//.test(r) ? /* @__PURE__ */ o(
    "a",
    {
      href: r,
      target: "_blank",
      rel: "noopener noreferrer",
      className: "md-link",
      children: r
    },
    n
  ) : /* @__PURE__ */ o(Xe.Fragment, { children: r }, n));
}
function Yr({ text: e }) {
  if (!e) return null;
  const t = e.split(/\n\n+/);
  return /* @__PURE__ */ o(oe, { children: t.map((r, n) => {
    if (r.trim().startsWith("- ") || r.trim().startsWith("* ")) {
      const s = r.split(/\n/).filter((l) => l.trim().startsWith("- ") || l.trim().startsWith("* "));
      return /* @__PURE__ */ o("ul", { className: "md-ul", children: s.map((l, a) => /* @__PURE__ */ o("li", { children: ye(l.replace(/^[-*]\s+/, "")) }, a)) }, n);
    }
    if (/^\d+\.\s+/.test(r.trim())) {
      const s = r.split(/\n/).filter((l) => /^\d+\.\s+/.test(l.trim()));
      return /* @__PURE__ */ o("ol", { className: "md-ol", children: s.map((l, a) => /* @__PURE__ */ o("li", { children: ye(l.replace(/^\d+\.\s+/, "")) }, a)) }, n);
    }
    if (r.startsWith("```")) {
      const s = r.replace(/^```[a-zA-Z]*\n?/, "").replace(/```$/, "");
      return /* @__PURE__ */ o(
        "pre",
        {
          className: "md-pre",
          children: /* @__PURE__ */ o("code", { children: s })
        },
        n
      );
    }
    return /* @__PURE__ */ o("p", { className: "md-p", children: ye(r) }, n);
  }) });
}
const Zr = ({ className: e }) => /* @__PURE__ */ k(
  "div",
  {
    className: re("typing-indicator", e),
    role: "status",
    "aria-label": "Assistant is preparing a reply",
    children: [
      /* @__PURE__ */ o("span", { className: "typing-dot" }),
      /* @__PURE__ */ o("span", { className: "typing-dot" }),
      /* @__PURE__ */ o("span", { className: "typing-dot" })
    ]
  }
);
function Jr(e) {
  return e === "create_ticket" ? "Support ticket processed" : e === "get_customer" ? "Account verified" : e === "get_ticket" ? "Ticket status loaded" : "Information retrieved";
}
function Kr({ sources: e }) {
  const [t, r] = j(!1);
  return e.length ? /* @__PURE__ */ k("div", { className: "sources-panel", children: [
    /* @__PURE__ */ k(
      "button",
      {
        type: "button",
        className: "sources-toggle-btn",
        onClick: () => r((n) => !n),
        "aria-expanded": t,
        children: [
          /* @__PURE__ */ o(Wt, { size: 12, "aria-hidden": "true" }),
          e.length,
          " grounded source",
          e.length > 1 ? "s" : "",
          t ? /* @__PURE__ */ o(Gt, { size: 12 }) : /* @__PURE__ */ o(qt, { size: 12 })
        ]
      }
    ),
    t && /* @__PURE__ */ o("ul", { className: "sources-list", children: e.map((n) => /* @__PURE__ */ k(
      "li",
      {
        className: "source-item",
        children: [
          /* @__PURE__ */ o("span", { className: "source-name", title: n.source, children: n.source.split(/[/\\]/).pop() || n.source }),
          /* @__PURE__ */ k("span", { className: "source-score", children: [
            Math.round(n.score * 100),
            "%"
          ] })
        ]
      },
      n.chunkId
    )) })
  ] }) : null;
}
function Xr({ toolCalls: e }) {
  return e.length ? /* @__PURE__ */ o("div", { className: "tool-badges", children: e.map((t, r) => /* @__PURE__ */ o(
    "span",
    {
      className: "tool-badge",
      children: Jr(t.toolName)
    },
    `${t.toolName}-${r}`
  )) }) : null;
}
const Qr = ({ message: e }) => {
  const t = e.role === "user", r = e.status === "error";
  return /* @__PURE__ */ k("div", { className: `msg-row${t ? " msg-row--user" : ""}`, children: [
    !t && /* @__PURE__ */ o(
      "div",
      {
        className: "avatar-circle avatar-circle--mt",
        "aria-hidden": "true",
        children: /* @__PURE__ */ o(lt, { size: 15 })
      }
    ),
    /* @__PURE__ */ k("div", { className: `msg-col${t ? " msg-col--user" : ""}`, children: [
      /* @__PURE__ */ k(
        "div",
        {
          className: t ? "msg-bubble msg-bubble--user" : r ? "msg-bubble msg-bubble--error" : "msg-bubble msg-bubble--bot",
          children: [
            e.status === "pending" ? /* @__PURE__ */ o(Zr, {}) : t ? /* @__PURE__ */ o("p", { className: "msg-user-pre", children: e.content }) : /* @__PURE__ */ o(Yr, { text: e.content }),
            e.toolCalls ? /* @__PURE__ */ o(Xr, { toolCalls: e.toolCalls }) : null,
            e.sources ? /* @__PURE__ */ o(Kr, { sources: e.sources }) : null
          ]
        }
      ),
      t && e.status !== "error" && /* @__PURE__ */ o(zt, { size: 13, className: "msg-tick", "aria-hidden": "true" })
    ] })
  ] });
}, en = () => {
  const { messages: e, status: t, showSuggestions: r } = ve();
  return /* @__PURE__ */ o(
    Gr,
    {
      autoScroll: !0,
      defaultScrollPosition: "last-anchor",
      scrollPreviousItemPeek: 64,
      children: /* @__PURE__ */ k(Vr, { children: [
        /* @__PURE__ */ o(Wr, { "aria-label": "Chat messages", children: /* @__PURE__ */ k($r, { "aria-busy": t === "awaiting" || t === "connecting", children: [
          r && /* @__PURE__ */ o(Ye, { messageId: "welcome", children: /* @__PURE__ */ o(jr, {}) }),
          e.map((s) => /* @__PURE__ */ o(
            Ye,
            {
              messageId: s.id,
              scrollAnchor: s.role === "user",
              children: /* @__PURE__ */ o(Qr, { message: s })
            },
            s.id
          ))
        ] }) }),
        /* @__PURE__ */ o(Ur, {})
      ] })
    }
  );
}, tn = () => {
  const { pendingTicket: e, ticketBusy: t, userContext: r, confirmTicket: n, cancelTicket: s } = ve(), l = !r.customerId && !r.email, [a, i] = j("");
  return e ? /* @__PURE__ */ k(
    "div",
    {
      className: "ticket-card",
      role: "region",
      "aria-label": "Create support ticket",
      children: [
        /* @__PURE__ */ o("h3", { className: "ticket-card-title", children: "Create support ticket?" }),
        /* @__PURE__ */ o("p", { className: "ticket-card-desc", children: "I can open a support request for you. Nothing is created until you confirm." }),
        /* @__PURE__ */ o("p", { className: "ticket-card-body", children: e.description }),
        l && /* @__PURE__ */ k("label", { className: "ticket-id-label", children: [
          "Customer ID or email",
          /* @__PURE__ */ o(
            "input",
            {
              value: a,
              onChange: (d) => i(d.target.value),
              className: "ticket-id-input",
              placeholder: "CUST-1001 or you@company.com",
              autoComplete: "email"
            }
          )
        ] }),
        /* @__PURE__ */ k("div", { className: "ticket-actions", children: [
          /* @__PURE__ */ o(
            "button",
            {
              type: "button",
              onClick: s,
              disabled: t,
              className: "ticket-cancel-btn",
              children: "Cancel"
            }
          ),
          /* @__PURE__ */ o(
            "button",
            {
              type: "button",
              onClick: () => void n(a),
              disabled: t || l && !a.trim(),
              className: "ticket-confirm-btn",
              children: t ? "Creating…" : "Create ticket"
            }
          )
        ] })
      ]
    }
  ) : null;
}, mt = ({
  className: e,
  onClose: t,
  showMinimize: r,
  title: n,
  subtitle: s,
  envStage: l,
  envPulse: a = !0
}) => {
  const { sendMessage: i, status: d, error: h, resetConversation: g, retryLast: v, pendingTicket: f } = ve(), u = d === "awaiting" || d === "connecting" || !!f;
  return /* @__PURE__ */ k(
    "section",
    {
      className: `chat-panel${e ? ` ${e}` : ""}`,
      "aria-label": "VPS AI Assistant",
      children: [
        /* @__PURE__ */ o(
          er,
          {
            title: n,
            subtitle: s,
            onClose: t,
            onReset: () => void g(),
            showMinimize: r,
            envStage: l,
            envPulse: a
          }
        ),
        /* @__PURE__ */ o("div", { className: "chat-panel-body", children: /* @__PURE__ */ o(en, {}) }),
        h && d === "error" && /* @__PURE__ */ o(It, { message: h, onRetry: () => void v() }),
        /* @__PURE__ */ o(tn, {}),
        /* @__PURE__ */ o(
          sr,
          {
            onSend: (m) => void i(m),
            disabled: u
          }
        )
      ]
    }
  );
}, rn = ({
  open: e,
  onClose: t,
  envStage: r,
  envPulse: n = !0
}) => e ? /* @__PURE__ */ o(
  "div",
  {
    id: "vps-chatbot-widget-panel",
    className: "widget-panel",
    children: /* @__PURE__ */ o(
      mt,
      {
        onClose: t,
        showMinimize: !0,
        title: "VPS AI Assistant",
        envStage: r,
        envPulse: n
      }
    )
  }
) : null, nn = ({
  open: e,
  onToggle: t
}) => /* @__PURE__ */ o(
  "button",
  {
    type: "button",
    onClick: t,
    "aria-expanded": e,
    "aria-controls": "vps-chatbot-widget-panel",
    "aria-label": e ? "Close assistant" : "Open assistant",
    className: "widget-trigger-btn",
    children: e ? /* @__PURE__ */ o(Jt, { size: 22 }) : /* @__PURE__ */ o(ot, { size: 24 })
  }
), Ze = ({
  defaultOpen: e = !1,
  open: t,
  onOpenChange: r,
  envStage: n,
  envPulse: s = !0
}) => {
  const [l, a] = j(e), i = t ?? l, d = (h) => {
    r == null || r(h), t === void 0 && a(h);
  };
  return /* @__PURE__ */ k(oe, { children: [
    /* @__PURE__ */ o(
      rn,
      {
        open: i,
        onClose: () => d(!1),
        envStage: n,
        envPulse: s
      }
    ),
    /* @__PURE__ */ o(nn, { open: i, onToggle: () => d(!i) })
  ] });
}, pn = ({
  apiBaseUrl: e,
  apiUrl: t,
  proxyUrl: r,
  userContext: n,
  suggestions: s,
  disableSuggestions: l,
  initialMessage: a,
  ...i
}) => {
  const d = rt(), h = e ?? t ?? r;
  return !!d && (!h || ee(h) === ee(d == null ? void 0 : d.apiBaseUrl)) && !n && !s && l === void 0 && !a ? /* @__PURE__ */ o(Ze, { ...i }) : /* @__PURE__ */ o(
    nt,
    {
      apiBaseUrl: h,
      userContext: n,
      suggestions: s,
      disableSuggestions: l,
      initialMessage: a,
      children: /* @__PURE__ */ o(Ze, { ...i })
    }
  );
}, sn = ({
  open: e,
  onClose: t,
  subtitle: r,
  title: n,
  envStage: s,
  envPulse: l = !0
}) => /* @__PURE__ */ k(oe, { children: [
  /* @__PURE__ */ o(
    "div",
    {
      className: `embedded-overlay ${e ? "embedded-overlay--open" : "embedded-overlay--closed"}`,
      hidden: !e,
      onClick: t,
      "aria-hidden": "true"
    }
  ),
  /* @__PURE__ */ o(
    "aside",
    {
      id: "vps-embedded-chat-panel",
      className: `embedded-panel ${e ? "embedded-panel--open" : "embedded-panel--closed"}`,
      "aria-hidden": !e,
      children: e && /* @__PURE__ */ o(
        mt,
        {
          onClose: t,
          title: n || "VPS AI Assistant",
          subtitle: r,
          envStage: s,
          envPulse: l
        }
      )
    }
  )
] }), ln = 5, we = 8, bt = "vps-embedded-assistant-top";
function on(e, t, r) {
  return Math.min(r, Math.max(t, e));
}
function Je(e, t) {
  const r = Math.max(
    we,
    window.innerHeight - t - we
  );
  return on(e, we, r);
}
function an() {
  try {
    const e = window.localStorage.getItem(bt);
    if (!e) return null;
    const t = Number(e);
    return Number.isFinite(t) ? t : null;
  } catch {
    return null;
  }
}
function cn(e) {
  try {
    window.localStorage.setItem(bt, String(e));
  } catch {
  }
}
const un = ({
  onOpen: e
}) => {
  const t = K(null), r = K({
    pointerId: null,
    startY: 0,
    startTop: 0,
    moved: !1
  }), [n, s] = j(
    () => typeof window > "u" ? null : an()
  ), l = K(n), a = K(!1), [i, d] = j(!1);
  me(() => {
    l.current = n;
  }, [n]), me(() => {
    const f = t.current;
    if (!f) return;
    const u = () => {
      s((m) => {
        const T = m ?? Math.round(window.innerHeight / 2 - f.offsetHeight / 2), _ = Je(T, f.offsetHeight);
        return l.current = _, _;
      });
    };
    return u(), window.addEventListener("resize", u), () => window.removeEventListener("resize", u);
  }, []);
  const h = (f) => {
    if (f.button !== 0) return;
    const u = f.currentTarget, m = u.getBoundingClientRect();
    r.current = {
      pointerId: f.pointerId,
      startY: f.clientY,
      startTop: m.top,
      moved: !1
    };
    try {
      u.setPointerCapture(f.pointerId);
    } catch {
    }
  }, g = (f) => {
    if (r.current.pointerId !== f.pointerId) return;
    const u = f.clientY - r.current.startY;
    if (!r.current.moved && Math.abs(u) < ln) return;
    r.current.moved = !0, d(!0);
    const m = Je(
      r.current.startTop + u,
      f.currentTarget.offsetHeight
    );
    l.current = m, s(m);
  }, v = (f) => {
    var m, T;
    if (r.current.pointerId !== f.pointerId) return;
    try {
      (T = (m = f.currentTarget).hasPointerCapture) != null && T.call(m, f.pointerId) && f.currentTarget.releasePointerCapture(f.pointerId);
    } catch {
    }
    const u = r.current.moved;
    r.current.pointerId = null, r.current.moved = !1, d(!1), u && (a.current = !0, l.current != null && cn(l.current));
  };
  return /* @__PURE__ */ k(
    "button",
    {
      ref: t,
      type: "button",
      onPointerDown: h,
      onPointerMove: g,
      onPointerUp: v,
      onPointerCancel: v,
      onClick: () => {
        if (a.current) {
          a.current = !1;
          return;
        }
        e();
      },
      "aria-expanded": !1,
      "aria-controls": "vps-embedded-chat-panel",
      "aria-label": "Assistant",
      className: `embedded-trigger-btn ${i ? "embedded-trigger-btn--grabbing" : "embedded-trigger-btn--grab"}`,
      style: {
        top: n ?? "50%",
        transform: n == null ? "translateY(-50%)" : void 0
      },
      children: [
        /* @__PURE__ */ o(ot, { size: 16 }),
        "Assistant"
      ]
    }
  );
}, Ke = ({
  defaultOpen: e = !1,
  open: t,
  onOpenChange: r,
  showTrigger: n = !0,
  envStage: s,
  envPulse: l = !0
}) => {
  const [a, i] = j(e), d = t ?? a, h = (g) => {
    r == null || r(g), t === void 0 && i(g);
  };
  return /* @__PURE__ */ k(oe, { children: [
    n && !d && /* @__PURE__ */ o(un, { onOpen: () => h(!0) }),
    /* @__PURE__ */ o(
      sn,
      {
        open: d,
        onClose: () => h(!1),
        envStage: s,
        envPulse: l
      }
    )
  ] });
}, gn = ({
  apiBaseUrl: e,
  apiUrl: t,
  proxyUrl: r,
  userContext: n,
  suggestions: s,
  disableSuggestions: l,
  initialMessage: a,
  ...i
}) => {
  const d = rt(), h = e ?? t ?? r;
  return !!d && (!h || ee(h) === ee(d == null ? void 0 : d.apiBaseUrl)) && !n && !s && l === void 0 && !a ? /* @__PURE__ */ o(Ke, { ...i }) : /* @__PURE__ */ o(
    nt,
    {
      apiBaseUrl: h,
      userContext: n,
      suggestions: s,
      disableSuggestions: l,
      initialMessage: a,
      children: /* @__PURE__ */ o(Ke, { ...i })
    }
  );
}, mn = {
  Colors: {
    VPS_White: "#fff",
    VPS_Dark_Blue: "#1A1A31",
    VPS_Light_Blue: "#353552",
    VPS_Light_Grey: "#D1D1D6",
    VPS_Orange: "#FF4717",
    Dark_Blue_50: "#F1F5FC",
    Dark_Blue_100: "#E5EBFA",
    Dark_Blue_200: "#D1DAF4",
    Dark_Blue_300: "#B4C2ED",
    Dark_Blue_400: "#96A2E3",
    Dark_Blue_500: "#7C84D8",
    Dark_Blue_600: "#6262C9",
    Dark_Blue_700: "#5351B1",
    Dark_Blue_800: "#44448F",
    Dark_Blue_900: "#3C3D73",
    Dark_Blue_950: "#1A1A31",
    Light_Blue_50: "#F4F6FA",
    Light_Blue_100: "#E6E9F3",
    Light_Blue_200: "#D3D8EA",
    Light_Blue_300: "#B4BEDC",
    Light_Blue_400: "#909DCA",
    Light_Blue_500: "#7580BC",
    Light_Blue_600: "#6369AD",
    Light_Blue_700: "#575A9E",
    Light_Blue_800: "#4B4B82",
    Light_Blue_900: "#404168",
    Light_Blue_950: "#353552",
    Grey_50: "#F6F6F7",
    Grey_100: "#EFEFF0",
    Grey_200: "#E2E1E4",
    Grey_300: "#D1D1D6",
    Grey_400: "#B9B9C0",
    Grey_500: "#A7A6AE",
    Grey_600: "#93919A",
    Grey_700: "#7E7D85",
    Grey_800: "#67666D",
    Grey_900: "#56555A",
    Grey_950: "#323234",
    Orange_50: "#FFF3ED",
    Orange_100: "#FFE4D4",
    Orange_200: "#FFC5A8",
    Orange_300: "#FF9D70",
    Orange_400: "#FF6837",
    Orange_500: "#FF4717",
    Orange_600: "#F02706",
    Orange_700: "#C71807",
    Orange_800: "#9E150E",
    Orange_900: "#7F150F",
    Orange_950: "#450605",
    Success_50: "#F1FCF5",
    Success_100: "#DEFAEA",
    Success_200: "#BEF4D4",
    Success_300: "#8BEAB3",
    Success_400: "#52D689",
    Success_500: "#2ECC71",
    Success_600: "#1D9C53",
    Success_700: "#1B7A43",
    Success_800: "#1A6139",
    Success_900: "#175031",
    Success_950: "#072C18",
    Warning_50: "#FFFEEA",
    Warning_100: "#FFF9C5",
    Warning_200: "#FFF485",
    Warning_300: "#FFE846",
    Warning_400: "#FFD81B",
    Warning_500: "#FFB800",
    Warning_600: "#E28D00",
    Warning_700: "#BB6302",
    Warning_800: "#984C08",
    Warning_900: "#7C3F0B",
    Warning_950: "#482000",
    Error_50: "#FFF1F1",
    Error_100: "#FFDFDF",
    Error_200: "#FFC5C5",
    Error_300: "#FF9D9D",
    Error_400: "#FF6464",
    Error_500: "#FF2E2E",
    Error_600: "#ED1515",
    Error_700: "#C80D0D",
    Error_800: "#A50F0F",
    Error_900: "#881414",
    Error_950: "#4B0404",
    Netural_25: "#FDFDFD",
    Netural_50: "#FAFAFA",
    Netural_100: "#F5F5F5",
    Netural_200: "#E9EAEC",
    Netural_300: "#D6D7DB",
    Netural_400: "#A4A7AE",
    Netural_500: "#727681",
    Netural_600: "#545863",
    Netural_700: "#424651",
    Netural_800: "#252B37",
    Netural_900: "#191D28",
    Netural_950: "#0A0D12",
    Tint_Dark_Blue_100: "#1A1A31",
    Tint_Dark_Blue_90: "#313146",
    Tint_Dark_Blue_80: "#48485A",
    Tint_Dark_Blue_70: "#5F5F6F",
    Tint_Dark_Blue_60: "#767683",
    Tint_Dark_Blue_50: "#8C8C98",
    Tint_Dark_Blue_40: "#A3A3AD",
    Tint_Dark_Blue_30: "#BABAC1",
    Tint_Dark_Blue_20: "#D1D1D6",
    Tint_Dark_Blue_10: "#E8E8EA",
    Tint_Dark_Blue_5: "#F4F4F5",
    Tint_Light_Blue_100: "#353552",
    Tint_Light_Blue_90: "#494963",
    Tint_Light_Blue_80: "#5D5D75",
    Tint_Light_Blue_70: "#727286",
    Tint_Light_Blue_60: "#868697",
    Tint_Light_Blue_50: "#9A9AA8",
    Tint_Light_Blue_40: "#AEAEBA",
    Tint_Light_Blue_30: "#C2C2CB",
    Tint_Light_Blue_20: "#D7D7DC",
    Tint_Light_Blue_10: "#EBEBEE",
    Tint_Light_Blue_5: "#F5F5F6",
    Tint_Grey_100: "#D1D1D6",
    Tint_Grey_90: "#D6D6DA",
    Tint_Grey_80: "#DADADE",
    Tint_Grey_70: "#DFDFE2",
    Tint_Grey_60: "#E3E3E6",
    Tint_Grey_50: "#E8E8EB",
    Tint_Grey_40: "#EDEDEF",
    Tint_Grey_30: "#F1F1F3",
    Tint_Grey_20: "#F6F6F7",
    Tint_Grey_10: "#FAFAFB",
    Tint_Grey_5: "#FDFDFD",
    Tint_Solus_100: "#FF4717",
    Tint_Solus_90: "#FF592E",
    Tint_Solus_80: "#FF6C45",
    Tint_Solus_70: "#FF7E5D",
    Tint_Solus_60: "#FF9174",
    Tint_Solus_50: "#FFA38B",
    Tint_Solus_40: "#FFB5A2",
    Tint_Solus_30: "#FFC8B9",
    Tint_Solus_20: "#FFDAD1",
    Tint_Solus_10: "#FFEDE8",
    Tint_Solus_5: "#FFF6F3",
    Other_Color: "#00ABC9"
  },
  StatusColor: {
    tested: "#3E4784",
    received: "#EE46BC",
    InTransit: "#6938EF",
    registered: "#1570EF",
    reported: "#2ECC71",
    noStatus: "#727681",
    Action: "#FF2E2E",
    Caution: "#FFB800",
    Pass: "#2ECC71",
    No_Rating: "#FF6837",
    Received: "#EE46BC",
    Tested: "#3E4784",
    Reported: "#2ECC71",
    No_Status: "#6938EF",
    Overdue: "#FF2E2E",
    Duesoon: "#FFB800",
    Scheduled: "#1570EF",
    Good: "#2ECC71",
    NotApplicable: "#353552"
  }
};
export {
  mt as ChatPanel,
  nt as ChatProvider,
  pn as ChatbotWidget,
  mn as ColorPalette,
  gn as EmbeddedChatbot,
  We as buildApiUrl,
  hn as chatApi,
  tt as createChatApi,
  ee as resolveApiBaseUrl,
  Dt as useChatContext,
  ve as useChatbot,
  rt as useOptionalChatContext
};
