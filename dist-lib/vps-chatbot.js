import { jsx as l, jsxs as C, Fragment as le } from "react/jsx-runtime";
import * as c from "react";
import Xe, { createContext as _t, useContext as Qe, useMemo as we, useState as Y, useRef as X, useCallback as Q, forwardRef as et, createElement as Ce, useEffect as ge } from "react";
const xt = {};
function te(e) {
  return e != null && e.trim() !== "" ? e.trim().replace(/\/+$/, "") : String("").trim().replace(/\/+$/, "");
}
function We(e, t) {
  const r = te(e);
  if (!r)
    return t;
  if (r.endsWith("/api") && t.startsWith("/api/"))
    return `${r}${t.slice(4)}`;
  if (r.endsWith("/api") && t === "/health") {
    const o = r.slice(0, -4);
    return o ? `${o}/health` : "/health";
  }
  const n = t.startsWith("/") ? t : `/${t}`;
  return `${r}${n}`;
}
function wt(e) {
  return e && typeof e == "object" && "data" in e && e.success !== !1 ? e.data : e;
}
function Ct(e, t, r) {
  var s, a, i;
  const n = e, o = (s = n == null ? void 0 : n.error) == null ? void 0 : s.message;
  return o && !kt(o) ? {
    code: (a = n == null ? void 0 : n.error) == null ? void 0 : a.code,
    message: o,
    requestId: (i = n == null ? void 0 : n.error) == null ? void 0 : i.request_id
  } : r >= 500 ? { message: "I couldn't process that request right now." } : r === 0 ? { message: "Something went wrong while connecting. Please try again." } : { message: t };
}
function kt(e) {
  return /traceback|sql|exception|stack|api[_ ]?key|password/i.test(e);
}
function St(e) {
  return {
    chunkId: e.chunk_id,
    source: e.source,
    score: e.score
  };
}
function Ft(e) {
  return {
    toolName: e.tool_name,
    arguments: e.arguments ?? {},
    result: e.result ?? {}
  };
}
function Et(e) {
  return {
    model: e.model,
    promptTokens: e.prompt_tokens,
    completionTokens: e.completion_tokens,
    totalTokens: e.total_tokens
  };
}
function Tt(e) {
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
async function Rt(e) {
  const t = await e.text();
  if (!t) return {};
  try {
    return JSON.parse(t);
  } catch {
    return {};
  }
}
function tt(e) {
  const t = te(e);
  async function r(n, o) {
    let s;
    const a = We(t, n);
    try {
      s = await fetch(a, {
        ...o,
        headers: {
          "Content-Type": "application/json",
          ...(o == null ? void 0 : o.headers) ?? {}
        }
      });
    } catch {
      throw { message: "Something went wrong while connecting. Please try again." };
    }
    if (s.status === 204)
      return;
    const i = await Rt(s);
    if (!s.ok)
      throw Ct(
        i,
        "I couldn't process that request right now.",
        s.status
      );
    return wt(i);
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
    async sendMessage(n, o) {
      const s = await r(
        `/api/v1/sessions/${n}/messages`,
        {
          method: "POST",
          body: JSON.stringify({ message: o })
        }
      );
      return {
        requestId: s.request_id,
        sessionId: s.session_id,
        answer: s.answer,
        sources: (s.sources || []).map(St),
        toolCalls: (s.tool_calls || []).map(Ft),
        usage: Et(s.usage)
      };
    },
    async getHistory(n) {
      try {
        return ((await r(
          `/api/v1/sessions/${n}/messages`
        )).messages || []).map(Tt);
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
const pn = tt(), At = [
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
], Fe = _t(null);
function Bt() {
  const e = Qe(Fe);
  if (!e)
    throw new Error("useChatbot must be used inside ChatProvider.");
  return e;
}
function rt() {
  return Qe(Fe);
}
function je(e) {
  return `${e}-${crypto.randomUUID()}`;
}
function Dt(e) {
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
  suggestions: r = At,
  disableSuggestions: n = !1,
  initialMessage: o,
  apiBaseUrl: s,
  apiUrl: a,
  proxyUrl: i,
  api: d
}) => {
  const p = s ?? a ?? i, m = we(
    () => d ?? tt(p),
    [d, p]
  ), [y, f] = Y(null), [u, g] = Y([]), [E, v] = Y("idle"), [B, W] = Y(null), L = X(null), $ = X(!1), N = Q(async () => {
    if (y) return y;
    v("connecting");
    const _ = await m.createSession();
    return f(_.sessionId), _.sessionId;
  }, [y, m]), M = Q(
    async (_) => {
      L.current = _;
      const k = {
        id: je("user"),
        role: "user",
        content: _,
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        status: "complete"
      }, S = je("asst"), A = {
        id: S,
        role: "assistant",
        content: "",
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        status: "pending"
      };
      g((R) => [...R, k, A]), v("awaiting"), W(null);
      try {
        const R = await N(), F = await m.sendMessage(R, _);
        g(
          (j) => j.map(
            (H) => H.id === S ? {
              ...H,
              id: F.requestId || S,
              content: F.answer,
              status: "complete",
              sources: F.sources,
              toolCalls: F.toolCalls,
              usage: F.usage
            } : H
          )
        ), v("idle");
      } catch (R) {
        const F = Dt(R);
        g(
          (j) => j.map(
            (H) => H.id === S ? { ...H, content: F, status: "error" } : H
          )
        ), W(F), v("error");
      }
    },
    [N, m]
  ), T = Q(
    async (_) => {
      const k = _.trim();
      !k || E === "awaiting" || E === "connecting" || await M(k);
    },
    [M, E]
  ), z = Q(async () => {
    const _ = L.current;
    _ && (g((k) => k.filter((S) => S.status !== "error")), await M(_));
  }, [M]), I = Q(async () => {
  }, []), J = Q(() => {
  }, []), U = Q(async () => {
    y && await m.closeSession(y), f(null), g([]), v("idle"), W(null), L.current = null;
  }, [y, m]);
  Xe.useEffect(() => {
    !o || $.current || ($.current = !0, T(o));
  }, [o, T]);
  const b = we(
    () => ({
      messages: u,
      status: E,
      error: B,
      sessionId: y,
      pendingTicket: null,
      ticketBusy: !1,
      lastTicket: null,
      suggestions: r,
      showSuggestions: !n && u.length === 0,
      suggestionBadgesEnabled: !n,
      userContext: t,
      apiBaseUrl: m.apiBaseUrl,
      sendMessage: T,
      retryLast: z,
      confirmTicket: I,
      cancelTicket: J,
      resetConversation: U
    }),
    [
      u,
      E,
      B,
      y,
      r,
      n,
      t,
      m.apiBaseUrl,
      T,
      z,
      I,
      J,
      U
    ]
  );
  return /* @__PURE__ */ l(Fe.Provider, { value: b, children: e });
};
function ye() {
  return Bt();
}
const Mt = ({ message: e, onRetry: t }) => /* @__PURE__ */ C(
  "div",
  {
    className: "mx-4 mb-2 rounded-lg border border-[var(--error-border)] bg-[var(--error-bg)] px-3 py-2 text-[12.5px] text-[var(--error-text)]",
    role: "alert",
    children: [
      /* @__PURE__ */ l("p", { children: e }),
      t && /* @__PURE__ */ l(
        "button",
        {
          type: "button",
          onClick: t,
          className: "mt-1.5 text-[12px] font-semibold underline underline-offset-2",
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
const It = (e) => e.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase(), ot = (...e) => e.filter((t, r, n) => !!t && t.trim() !== "" && n.indexOf(t) === r).join(" ").trim();
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
var Nt = {
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
const Pt = et(
  ({
    color: e = "currentColor",
    size: t = 24,
    strokeWidth: r = 2,
    absoluteStrokeWidth: n,
    className: o = "",
    children: s,
    iconNode: a,
    ...i
  }, d) => Ce(
    "svg",
    {
      ref: d,
      ...Nt,
      width: t,
      height: t,
      stroke: e,
      strokeWidth: n ? Number(r) * 24 / Number(t) : r,
      className: ot("lucide", o),
      ...i
    },
    [
      ...a.map(([p, m]) => Ce(p, m)),
      ...Array.isArray(s) ? s : [s]
    ]
  )
);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const O = (e, t) => {
  const r = et(
    ({ className: n, ...o }, s) => Ce(Pt, {
      ref: s,
      iconNode: t,
      className: ot(`lucide-${It(e)}`, n),
      ...o
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
const Lt = O("ArrowDown", [
  ["path", { d: "M12 5v14", key: "s699le" }],
  ["path", { d: "m19 12-7 7-7-7", key: "1idqje" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const zt = O("ArrowLeft", [
  ["path", { d: "m12 19-7-7 7-7", key: "1l729n" }],
  ["path", { d: "M19 12H5", key: "x3x0zl" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Ot = O("ArrowUp", [
  ["path", { d: "m5 12 7-7 7 7", key: "hav0vg" }],
  ["path", { d: "M12 19V5", key: "x0mq9r" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const st = O("BotMessageSquare", [
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
const Ht = O("Check", [["path", { d: "M20 6 9 17l-5-5", key: "1gmf2c" }]]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const qt = O("ChevronDown", [
  ["path", { d: "m6 9 6 6 6-6", key: "qrunsl" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Gt = O("ChevronUp", [["path", { d: "m18 15-6-6-6 6", key: "153udz" }]]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Vt = O("ClipboardCheck", [
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
const Wt = O("FileText", [
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
const jt = O("FlaskConical", [
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
const lt = O("MessageSquare", [
  ["path", { d: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z", key: "1lielz" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const $t = O("Microscope", [
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
const Ut = O("Minus", [["path", { d: "M5 12h14", key: "1ays0h" }]]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Yt = O("RefreshCw", [
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
const Zt = O("TestTubeDiagonal", [
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
const Jt = O("X", [
  ["path", { d: "M18 6 6 18", key: "1bl5f8" }],
  ["path", { d: "m6 6 12 12", key: "d8bk6v" }]
]), Kt = {
  alpha: {
    label: "Alpha",
    Icon: jt,
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
    Icon: $t,
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
  const { label: n, Icon: o, variant: s, tooltip: a } = Kt[e];
  return /* @__PURE__ */ C(
    "span",
    {
      className: `env-badge ${s} ${r} text-[var(--vps-orange)] font-medium text-[10px] leading-[12px] px-1.5 py-0.5 rounded-full border border-[var(--border)] bg-[var(--orange-50)] hover:bg-[var(--grey-200)] cursor-pointer hover:text-foreground flex items-center gap-1 `,
      title: a,
      "aria-label": `${n} build`,
      role: "status",
      children: [
        /* @__PURE__ */ l(o, { size: 10, className: "env-badge-icon", "aria-hidden": "true" }),
        /* @__PURE__ */ l("span", { className: "text-[var(--text-primary)] font-medium text-[10px] leading-[12px]", children: n })
      ]
    }
  );
}, Qt = (e) => /* @__PURE__ */ l(
  "svg",
  {
    width: e.width || "24px",
    height: e.height || "24px",
    viewBox: "0 0 24 24",
    role: "img",
    xmlns: "http://www.w3.org/2000/svg",
    fill: e.Color || "currentColor",
    ...e,
    children: /* @__PURE__ */ l("path", { d: "M11.999 0c-2.25 0-4.5.06-6.6.21a5.57 5.57 0 0 0-5.19 5.1c-.24 3.21-.27 6.39-.06 9.6a5.644 5.644 0 0 0 5.7 5.19h3.15v-3.9h-3.15c-.93.03-1.74-.63-1.83-1.56-.18-3-.15-6 .06-9 .06-.84.72-1.47 1.56-1.53 2.04-.15 4.2-.21 6.36-.21s4.32.09 6.36.18c.81.06 1.5.69 1.56 1.53.24 3 .24 6 .06 9-.12.93-.9 1.62-1.83 1.59h-3.15l-6 3.9V24l6-3.9h3.15c2.97.03 5.46-2.25 5.7-5.19.21-3.18.18-6.39-.03-9.57a5.57 5.57 0 0 0-5.19-5.1c-2.13-.18-4.38-.24-6.63-.24zm-5.04 8.76c-.36 0-.66.3-.66.66v2.34c0 .33.18.63.48.78 1.62.78 3.42 1.2 5.22 1.26 1.8-.06 3.6-.48 5.22-1.26.3-.15.48-.45.48-.78V9.42c0-.09-.03-.15-.09-.21a.648.648 0 0 0-.87-.36c-1.5.66-3.12 1.02-4.77 1.05-1.65-.03-3.27-.42-4.77-1.08a.566.566 0 0 0-.24-.06z" })
  }
), er = ({
  title: e = "VPS AI Assistant",
  subtitle: t = "Customer portal support",
  onClose: r,
  onReset: n,
  onBack: o,
  showMinimize: s = !1,
  envStage: a,
  envPulse: i = !0
}) => /* @__PURE__ */ C("header", { className: "flex items-center justify-between border-b border-border bg-card px-5 py-4", children: [
  /* @__PURE__ */ C("div", { className: "flex items-center gap-3", children: [
    o && /* @__PURE__ */ l(
      "button",
      {
        type: "button",
        onClick: o,
        className: "flex h-8 w-8 items-center justify-center rounded-full border border-border bg-muted text-muted-foreground hover:bg-[var(--grey-100)]",
        "aria-label": "Back",
        children: /* @__PURE__ */ l(zt, { size: 16 })
      }
    ),
    /* @__PURE__ */ l(
      "div",
      {
        className: "flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground",
        "aria-hidden": "true",
        children: /* @__PURE__ */ l(Qt, { width: "16px", height: "16px", Color: "white" })
      }
    ),
    /* @__PURE__ */ C("div", { children: [
      /* @__PURE__ */ C("div", { className: "flex items-center gap-1.5", children: [
        /* @__PURE__ */ l("h2", { className: "text-[16px] font-bold tracking-tight text-foreground", children: e }),
        /* @__PURE__ */ l(Xt, { stage: a, pulse: i })
      ] }),
      /* @__PURE__ */ l("p", { className: "text-[12px] text-muted-foreground font-medium text-[var(--text-subtle)]", children: t || "Customer portal support" })
    ] })
  ] }),
  /* @__PURE__ */ C("div", { className: "flex items-center gap-1", children: [
    n && /* @__PURE__ */ l(
      "button",
      {
        type: "button",
        onClick: n,
        className: "flex h-7 w-7 items-center justify-center rounded-md text-[var(--text-subtle)] hover:bg-muted hover:text-foreground",
        "aria-label": "Start a new conversation",
        title: "New conversation",
        children: /* @__PURE__ */ l(Yt, { size: 15 })
      }
    ),
    r && /* @__PURE__ */ l(
      "button",
      {
        type: "button",
        onClick: r,
        className: "flex h-7 w-7 items-center justify-center rounded-md text-[var(--text-subtle)] hover:bg-muted hover:text-foreground",
        "aria-label": s ? "Minimize chat" : "Close chat",
        children: /* @__PURE__ */ l(Ut, { size: 16 })
      }
    )
  ] })
] });
function tr(e, t) {
  const r = X(e);
  ge(() => {
    var n;
    r.current && !e && ((n = t.current) == null || n.focus()), r.current = e;
  }, [e, t]);
}
function at(e) {
  var t, r, n = "";
  if (typeof e == "string" || typeof e == "number") n += e;
  else if (typeof e == "object") if (Array.isArray(e)) {
    var o = e.length;
    for (t = 0; t < o; t++) e[t] && (r = at(e[t])) && (n && (n += " "), n += r);
  } else for (r in e) e[r] && (n && (n += " "), n += r);
  return n;
}
function rr() {
  for (var e, t, r = 0, n = "", o = arguments.length; r < o; r++) (e = arguments[r]) && (t = at(e)) && (n && (n += " "), n += t);
  return n;
}
function V(...e) {
  return rr(e);
}
function nr(e, t) {
  const r = t.trim().toLowerCase();
  return r ? e.filter(
    (n) => n.label.toLowerCase().includes(r) || n.query.toLowerCase().includes(r)
  ) : e;
}
const or = ({
  suggestions: e,
  onSelect: t,
  disabled: r,
  variant: n = "list"
}) => e.length ? n === "badge" ? /* @__PURE__ */ l(
  "ul",
  {
    className: "mb-2 flex flex-wrap gap-1.5",
    "aria-label": "Suggested questions",
    children: e.map((o) => /* @__PURE__ */ l("li", { className: "max-w-full", children: /* @__PURE__ */ l(
      "button",
      {
        type: "button",
        disabled: r,
        onClick: () => t(o),
        title: o.query,
        className: V(
          "max-w-full truncate rounded-full border border-border bg-card px-2.5 py-1 text-left text-[11.5px] font-semibold text-foreground",
          "hover:border-primary hover:bg-[var(--tint-solus-10)] hover:text-primary",
          "disabled:cursor-not-allowed disabled:opacity-50"
        ),
        children: o.label
      }
    ) }, o.query))
  }
) : /* @__PURE__ */ l("div", { className: "mt-3 flex flex-col gap-2", children: e.map((o) => /* @__PURE__ */ l(
  "button",
  {
    type: "button",
    disabled: r,
    onClick: () => t(o),
    className: "rounded-lg border border-border bg-card px-3.5 py-2.5 text-left text-[13px] font-semibold text-foreground shadow-[0_1px_3px_rgba(0,0,0,0.02)] transition hover:-translate-y-px hover:border-vps-light-grey hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none motion-reduce:hover:translate-y-0",
    children: o.label
  },
  o.query
)) }) : null, sr = ({
  onSend: e,
  disabled: t = !1,
  placeholder: r = "Ask something…"
}) => {
  const { suggestions: n, showSuggestions: o, suggestionBadgesEnabled: s } = ye(), [a, i] = Y(""), d = X(null), p = (u) => {
    u && (u.style.height = "auto", u.style.height = `${Math.min(u.scrollHeight, 96)}px`);
  };
  tr(t, d), ge(() => {
    p(d.current);
  }, [a]);
  const m = we(() => {
    if (!s || t) return [];
    const u = a.trim();
    return u ? nr(n, u) : o ? n : [];
  }, [t, o, s, n, a]), y = (u) => {
    i(u.query);
    const g = d.current;
    g == null || g.focus();
  }, f = () => {
    const u = a.trim();
    !u || t || (e(u), i(""), d.current && (d.current.style.height = "auto"));
  };
  return /* @__PURE__ */ C("div", { className: "bg-card px-4 pb-3 pt-2", children: [
    /* @__PURE__ */ l(
      or,
      {
        variant: "badge",
        suggestions: m,
        onSelect: y,
        disabled: t
      }
    ),
    /* @__PURE__ */ l("label", { htmlFor: "vps-chat-input", className: "sr-only", children: "Chat message" }),
    /* @__PURE__ */ C("div", { className: "flex items-end gap-2 rounded-xl bg-[var(--input-bg)] px-2.5 py-1.5", children: [
      /* @__PURE__ */ l(
        "textarea",
        {
          id: "vps-chat-input",
          ref: d,
          rows: 1,
          value: a,
          disabled: t,
          placeholder: r,
          onChange: (u) => {
            i(u.target.value), p(u.target);
          },
          onKeyDown: (u) => {
            u.key === "Enter" && !u.shiftKey && (u.preventDefault(), f());
          },
          className: "max-h-24 flex-1 resize-none bg-transparent py-1.5 text-[13.5px] text-foreground outline-none placeholder:text-[var(--text-subtle)] disabled:opacity-60"
        }
      ),
      /* @__PURE__ */ l(
        "button",
        {
          type: "button",
          onClick: f,
          disabled: t || !a.trim(),
          "aria-label": "Send message",
          className: "mb-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-action text-action-foreground hover:bg-[var(--action-hover)] disabled:cursor-not-allowed disabled:opacity-40",
          children: /* @__PURE__ */ l(Ot, { size: 16 })
        }
      )
    ] }),
    /* @__PURE__ */ C("p", { className: "mt-2 text-center text-[11px] font-medium text-[var(--text-subtle)]", children: [
      "Powered by ",
      /* @__PURE__ */ l("span", { className: "text-primary font-bold hover:underline cursor-pointer", children: "VPS Veritas AI" })
    ] })
  ] });
};
function lr({ defaultTagName: e, props: t, render: r, state: n = {}, stateAttributesMapping: o }) {
  let s = ke(ar(n, o), t);
  if (!r) return c.createElement(e, s);
  if (typeof r == "function") return r(s, n);
  if (!c.isValidElement(r)) return null;
  let a = r.props, i = { ...ke(s, a), ref: ae(s.ref, a.ref) };
  return c.cloneElement(r, i);
}
function ke(...e) {
  let t = {};
  for (let r of e) {
    if (!r) continue;
    let n = r;
    for (let o of Object.keys(n)) {
      let s = n[o];
      if (s === void 0) continue;
      let a = t[o];
      o === "className" ? t[o] = [a, s].filter(Boolean).join(" ") : o === "style" ? t[o] = { ...a, ...s } : o === "ref" ? t[o] = ae(a, s) : cr(o) && typeof a == "function" && typeof s == "function" ? t[o] = ir(s, a) : t[o] = s;
    }
  }
  return t;
}
function ar(e, t) {
  var n;
  let r = {};
  for (let o of Object.keys(e)) {
    let s = e[o], a = (n = t == null ? void 0 : t[o]) == null ? void 0 : n.call(t, s);
    if (a) {
      Object.assign(r, a);
      continue;
    }
    if (o === "slot") {
      r["data-slot"] = s;
      continue;
    }
    let i = `data-${String(o).replace(/[A-Z]/g, (d) => `-${d.toLowerCase()}`)}`;
    typeof s == "boolean" ? r[i] = s ? "" : void 0 : s != null && (r[i] = String(s));
  }
  return r;
}
function ir(e, t) {
  return function(r) {
    e(r), r.defaultPrevented || t(r);
  };
}
function cr(e) {
  return /^on[A-Z]/.test(e);
}
function ae(...e) {
  let t = e.filter(Boolean);
  if (t.length !== 0) return (r) => {
    for (let n of t) typeof n == "function" ? n(r) : n && (n.current = r);
  };
}
var ur = 8, dr = 64, fr = 0, be = 0.5, pr = 180, hr = /* @__PURE__ */ new Set(["ArrowDown", "ArrowUp", "End", "Home", "PageDown", "PageUp", " "]), it = { start: !1, end: !1 }, mr = [], ve = { currentAnchorId: null, visibleMessageIds: mr };
function gr({ content: e, scrollEdgeThreshold: t, spacer: r, viewport: n }) {
  if (!n || !e) return it;
  let o = Ee({ content: e, spacer: r, viewport: n });
  return { start: n.scrollTop > t, end: o - n.scrollTop - n.clientHeight > t };
}
function br({ content: e, scrollMargin: t, scrollPreviousItemPeek: r, spacer: n, viewport: o, visibleMessageIds: s }) {
  if (!e || !o) return ve;
  let a = o.getBoundingClientRect(), i = a.top + t + r, d = typeof IntersectionObserver > "u", p = [], m = null;
  for (let y of se(e, n)) {
    let f = y.dataset.messageId;
    if (!f) continue;
    let u = y.dataset.scrollAnchor === "true", g = u || d ? y.getBoundingClientRect() : null;
    (d && g ? g.bottom > i && g.top < a.bottom : s.has(f)) && p.push(f), u && g && g.top <= i + be && (m = f);
  }
  return p.length === 0 && m === null ? ve : { currentAnchorId: m, visibleMessageIds: p };
}
function se(e, t) {
  return Array.from(e.children).filter((r) => r instanceof HTMLElement && r !== t);
}
function vr(e, t) {
  for (let r = t; r < e.length; r++) {
    let n = e[r];
    if ((n == null ? void 0 : n.dataset.scrollAnchor) === "true") return n;
  }
  return null;
}
function yr(e, t) {
  for (let r of e) if (r.dataset.scrollAnchor === "true" && !t.has(r)) return r;
  return null;
}
function _r(e, t) {
  var n;
  let r = 0;
  for (let o = t; o < e.length; o++) if (((n = e[o]) == null ? void 0 : n.dataset.scrollAnchor) === "true" && (r += 1, r > 1)) return !0;
  return !1;
}
function xr(e) {
  for (let t = e.length - 1; t >= 0; t--) {
    let r = e[t];
    if ((r == null ? void 0 : r.dataset.scrollAnchor) === "true") return r;
  }
  return null;
}
function wr({ content: e, spacer: t, viewport: r }) {
  let n = r.getBoundingClientRect();
  for (let o of se(e, t)) {
    if (!o.dataset.messageId) continue;
    let s = o.getBoundingClientRect();
    if (s.bottom > n.top && s.top < n.bottom) return o;
  }
  return null;
}
function Cr({ align: e, element: t, scrollMargin: r, spacer: n, viewport: o }) {
  let s = ct(t, o), a = t.getBoundingClientRect().height, i = Fr(n);
  if (e === "center") {
    let d = Math.max(0, o.clientHeight - i.start - i.end);
    return s - i.start - (d - a) / 2 - r;
  }
  if (e === "end") return s - o.clientHeight + a + i.end + r;
  if (e === "nearest") {
    let d = s + a, p = o.scrollTop + i.start, m = o.scrollTop + o.clientHeight - i.end;
    return s >= p && d <= m ? o.scrollTop : s < p ? s - i.start - r : d - o.clientHeight + i.end + r;
  }
  return s - i.start - r;
}
function ct(e, t) {
  let r = e.getBoundingClientRect(), n = t.getBoundingClientRect();
  return r.top - n.top + t.scrollTop;
}
function he(e, t) {
  return e.getBoundingClientRect().top - t.getBoundingClientRect().top;
}
function kr({ content: e, scrollTop: t, spacer: r, viewport: n }) {
  let o = Ee({ content: e, spacer: r, viewport: n });
  return t + n.clientHeight - o;
}
function Ee({ content: e, spacer: t, viewport: r }) {
  let n = se(e, t), o = ut(e), s = r.getBoundingClientRect(), a = r.scrollTop, i = o.start + o.end;
  for (let d of n) {
    let p = d.getBoundingClientRect();
    i = Math.max(i, p.bottom - s.top + a + o.end);
  }
  return i;
}
function Sr(e) {
  return Math.max(0, e.scrollHeight - e.clientHeight);
}
function ut(e) {
  let t = window.getComputedStyle(e);
  return { end: Se(t.paddingBlockEnd || t.paddingBottom), start: Se(t.paddingBlockStart || t.paddingTop) };
}
function Fr(e) {
  let t = e == null ? void 0 : e.parentElement;
  return t ? ut(t) : { end: 0, start: 0 };
}
function Er(e) {
  if (!e) return 0;
  let t = window.getComputedStyle(e), r = t.rowGap === "normal" ? t.gap : t.rowGap;
  return Se(r);
}
function Se(e) {
  if (!e) return 0;
  let t = Number.parseFloat(e);
  return Number.isFinite(t) ? t : 0;
}
function dt(e, t) {
  let r = e, n = /* @__PURE__ */ new Set();
  return { getSnapshot: () => r, hasListeners: () => n.size > 0, setSnapshot: (o) => {
    t(r, o) || (r = o, n.forEach((s) => s()));
  }, subscribe: (o, s, a) => {
    let i = n.size === 0;
    return n.add(o), i && (s == null || s()), () => {
      n.delete(o), n.size === 0 && (a == null || a());
    };
  } };
}
function $e(e, t) {
  return dt(e, t);
}
function Tr() {
  return dt(ve, Ar);
}
function Rr(e, t) {
  return e.start === t.start && e.end === t.end;
}
function Ar(e, t) {
  return e.currentAnchorId !== t.currentAnchorId || e.visibleMessageIds.length !== t.visibleMessageIds.length ? !1 : e.visibleMessageIds.every((r, n) => r === t.visibleMessageIds[n]);
}
function Br({ autoScroll: e, defaultScrollPosition: t, scrollEdgeThreshold: r, scrollMargin: n, scrollPreviousItemPeek: o }) {
  let s = c.useRef(e), a = c.useRef(!1), i = c.useRef(null), d = c.useRef(!1), p = c.useRef(r), m = c.useRef(0), y = c.useRef(null), f = c.useRef(0), u = c.useRef(e ? "following-bottom" : "free-scrolling"), g = c.useRef(/* @__PURE__ */ new Map()), E = c.useRef(null), v = c.useRef(null), B = c.useRef(null), W = c.useRef(o), L = c.useRef(!0), $ = c.useRef(null), N = c.useRef(n), M = c.useRef(null), T = c.useRef(0), z = c.useRef(0), I = c.useRef(null), J = c.useRef(null), U = c.useRef(null), b = c.useRef(null), _ = c.useRef(null), k = c.useRef(null), S = c.useRef(null), A = c.useRef(null), R = c.useRef(null), F = c.useRef(/* @__PURE__ */ new Set()), j = c.useRef(/* @__PURE__ */ new WeakSet());
  return U.current === null && (U.current = $e(t === "end" || t === "last-anchor", (H, ce) => H === ce)), b.current === null && (b.current = $e(it, Rr)), R.current === null && (R.current = Tr()), s.current = e, p.current = r, N.current = n, W.current = o, { autoScrollRef: s, autoscrollingRef: a, autoscrollingTimeoutRef: _, streamingTurnRef: B, contentRef: i, defaultScrollPositionAppliedRef: d, firstItemRef: y, itemCountRef: m, lastScrollTopRef: f, messageElementsRef: g, modeRef: u, pendingScrollFrameRef: M, pendingScrollToMessageRef: E, prependRestoreRef: v, preserveScrollOnPrependRef: L, pendingDefaultScrollStore: U.current, rootRef: $, scrollEdgeThresholdRef: p, scrollMarginRef: N, scrollPreviousItemPeekRef: W, spacerGapRef: T, spacerHeightRef: z, spacerRef: I, stateFrameRef: J, stateStore: b.current, viewportRef: k, visibilityFrameRef: S, visibilityObserverRef: A, visibilityStore: R.current, visibleMessageIdsRef: F, handledScrollAnchorsRef: j };
}
function ft(e) {
  e.pendingDefaultScrollStore.setSnapshot(!1);
}
function me(e) {
  e.defaultScrollPositionAppliedRef.current = !0, ft(e);
}
function Dr({ refs: e, commitScrollState: t, scheduleStateCommit: r, scheduleVisibilitySync: n }) {
  let { streamingTurnRef: o, autoScrollRef: s, autoscrollingRef: a, autoscrollingTimeoutRef: i, contentRef: d, itemCountRef: p, messageElementsRef: m, modeRef: y, pendingScrollToMessageRef: f, prependRestoreRef: u, scrollMarginRef: g, scrollPreviousItemPeekRef: E, spacerGapRef: v, spacerHeightRef: B, spacerRef: W, viewportRef: L } = e, $ = c.useCallback((b) => {
    i.current !== null && (window.clearTimeout(i.current), i.current = null), a.current !== b && (a.current = b, t()), b && (i.current = window.setTimeout(() => {
      i.current = null, a.current = !1, t();
    }, pr));
  }, [t]), N = c.useCallback((b) => {
    let _ = W.current;
    if (!_) return;
    let k = Math.max(0, Math.ceil(b));
    B.current !== k && (B.current = k, _.hidden = k === 0, _.style.height = `${k}px`, _.style.marginTop = k > 0 ? `${-v.current}px` : "");
  }, []), M = c.useCallback((b, { behavior: _ = "auto", autoscrolling: k = !1 } = {}) => {
    let S = L.current;
    if (!S) return;
    let A = Math.max(0, b);
    if (Math.abs(S.scrollTop - A) <= be) {
      S.scrollTop = A, t();
      return;
    }
    k && $(!0), S.scrollTo({ top: A, behavior: _ }), r();
  }, [t, r, $]), T = c.useCallback(({ behavior: b = "auto" } = {}) => L.current ? (N(0), o.current = null, y.current = "free-scrolling", M(0, { behavior: b }), n(), !0) : !1, [n, M, N]), z = c.useCallback(({ behavior: b = "auto" } = {}) => {
    let _ = L.current;
    return _ ? (N(0), o.current = null, y.current = s.current ? "following-bottom" : "free-scrolling", M(Sr(_), { autoscrolling: !0, behavior: b }), n(), !0) : !1;
  }, [n, M, N]), I = c.useCallback((b, { align: _ = "start", behavior: k = "auto", scrollMargin: S = g.current } = {}, { keepPreviousPeek: A = !1 } = {}) => {
    let R = d.current, F = L.current;
    if (!R || !F || !R.contains(b)) return !1;
    let j = Cr({ align: _, element: b, scrollMargin: A ? S + E.current : S, spacer: W.current, viewport: F }), H = kr({ content: R, scrollTop: j, spacer: W.current, viewport: F });
    return N(H), u.current = { element: b, viewportTop: he(b, F) }, y.current = A ? "anchored-to-message" : "settling-jump", o.current = A ? b : null, M(j, { behavior: k }), n(), !0;
  }, [n, M, N]), J = c.useCallback(() => {
    let b = o.current;
    return !b || !b.isConnected || y.current !== "anchored-to-message" ? !1 : I(b, { align: "start" }, { keepPreviousPeek: !0 });
  }, [I]), U = c.useCallback((b, _) => {
    let k = m.current.get(b);
    return k ? (me(e), I(k, _) ? (f.current = null, !0) : (f.current = { messageId: b, options: _ }, !0)) : p.current === 0 ? (f.current = { messageId: b, options: _ }, me(e), !0) : !1;
  }, [I]);
  return { flushPendingScrollToMessage: c.useCallback(() => {
    let b = f.current;
    if (!b) return !1;
    let _ = m.current.get(b.messageId);
    return !_ || !I(_, b.options) ? !1 : (f.current = null, me(e), !0);
  }, [I]), reanchorToAnchoredMessage: J, scrollToElement: I, scrollToEnd: z, scrollToMessage: U, scrollToStart: T };
}
function Ue(e, t) {
  return c.useCallback((r) => {
    e.current = r, r && t();
  }, [e, t]);
}
function Mr({ autoScroll: e = !1, defaultScrollPosition: t = "end", scrollEdgeThreshold: r = ur, scrollPreviousItemPeek: n = dr, scrollMargin: o = fr }) {
  let s = Br({ autoScroll: e, defaultScrollPosition: t, scrollEdgeThreshold: r, scrollMargin: o, scrollPreviousItemPeek: n }), { streamingTurnRef: a, autoScrollRef: i, autoscrollingRef: d, autoscrollingTimeoutRef: p, contentRef: m, defaultScrollPositionAppliedRef: y, firstItemRef: f, itemCountRef: u, lastScrollTopRef: g, messageElementsRef: E, modeRef: v, pendingScrollFrameRef: B, pendingScrollToMessageRef: W, prependRestoreRef: L, preserveScrollOnPrependRef: $, pendingDefaultScrollStore: N, rootRef: M, scrollEdgeThresholdRef: T, scrollMarginRef: z, scrollPreviousItemPeekRef: I, spacerGapRef: J, spacerHeightRef: U, spacerRef: b, stateFrameRef: _, stateStore: k, viewportRef: S, visibilityFrameRef: A, visibilityObserverRef: R, visibilityStore: F, visibleMessageIdsRef: j, handledScrollAnchorsRef: H } = s, ce = c.useRef(t);
  ce.current !== t && (ce.current = t, y.current = !1);
  let ue = c.useCallback((h) => {
    let x = M.current, w = S.current, D = [h.start && "start", h.end && "end"].filter(Boolean).join(" "), K = d.current;
    for (let G of [x, w]) G && (D ? G.setAttribute("data-scrollable", D) : G.removeAttribute("data-scrollable"), G.toggleAttribute("data-autoscrolling", K));
  }, []), Te = c.useCallback((h) => {
    var D;
    let x = ((D = S.current) == null ? void 0 : D.scrollTop) ?? 0, w = x < g.current - be;
    g.current = x, i.current && !h.end && v.current !== "settling-jump" && v.current !== "anchored-to-message" ? v.current = "following-bottom" : v.current === "following-bottom" && h.end && w && !d.current && (v.current = "free-scrolling");
  }, []), Z = c.useCallback(() => {
    let h = gr({ content: m.current, scrollEdgeThreshold: T.current, spacer: b.current, viewport: S.current });
    Te(h);
    let x = v.current === "following-bottom" ? { ...h, end: !1 } : h;
    ue(x), k.setSnapshot(x);
  }, [Te, k, ue]), ne = c.useCallback(() => {
    _.current === null && (_.current = window.requestAnimationFrame(() => {
      _.current = null, Z();
    }));
  }, [Z]), P = c.useCallback(() => {
    F.hasListeners() && A.current === null && (A.current = window.requestAnimationFrame(() => {
      A.current = null, F.hasListeners() && F.setSnapshot(br({ content: m.current, scrollMargin: z.current, scrollPreviousItemPeek: I.current, spacer: b.current, viewport: S.current, visibleMessageIds: j.current }));
    }));
  }, [F]), { flushPendingScrollToMessage: de, reanchorToAnchoredMessage: Re, scrollToElement: oe, scrollToEnd: q, scrollToMessage: Ae, scrollToStart: fe } = Dr({ refs: s, commitScrollState: Z, scheduleStateCommit: ne, scheduleVisibilitySync: P }), Be = c.useCallback(() => {
    let h = L.current, x = S.current;
    if (!h || !x || !h.element.isConnected) return !1;
    let w = he(h.element, x) - h.viewportTop;
    return Math.abs(w) <= be ? !1 : (x.scrollTop += w, h.viewportTop = he(h.element, x), ne(), P(), !0);
  }, [ne, P]), ee = c.useCallback(() => {
    let h = m.current, x = S.current;
    if (!h || !x) {
      L.current = null;
      return;
    }
    let w = wr({ content: h, spacer: b.current, viewport: x });
    L.current = w ? { element: w, viewportTop: he(w, x) } : null;
  }, []), De = c.useCallback(() => {
    B.current === null && (B.current = window.requestAnimationFrame(() => {
      B.current = null, de() && ee();
    }));
  }, [ee, de]), pe = c.useCallback(() => {
    if (!t || y.current || u.current === 0) return !1;
    let h = !1;
    if (t === "last-anchor") {
      let x = m.current, w = S.current, D = x && w ? xr(se(x, b.current)) : null;
      if (!x || !w || !D) h = q({ behavior: "auto" });
      else {
        let K = ct(D, w);
        h = Ee({ content: x, spacer: b.current, viewport: w }) - K <= w.clientHeight ? q({ behavior: "auto" }) : oe(D, { align: "start" }, { keepPreviousPeek: !0 });
      }
    } else h = t === "end" ? q({ behavior: "auto" }) : fe({ behavior: "auto" });
    return h ? (me(s), !0) : !1;
  }, [t, oe, q, fe]), Me = c.useCallback(() => {
    let h = m.current;
    if (!h) return;
    let x = se(h, b.current), w = u.current, D = f.current;
    u.current = x.length, f.current = x[0] ?? null, (() => {
      if (de()) return;
      if (w === 0) {
        if (pe() || x.length > 0 && i.current && q({ behavior: "auto" })) return;
        Z(), P();
        return;
      }
      let K = D ? x.indexOf(D) : -1;
      if ($.current && K > 0) {
        Be();
        return;
      }
      if (x.length > w) {
        let G = vr(x, w);
        if (G) {
          if (i.current && v.current === "following-bottom" && _r(x, w)) {
            q({ behavior: "auto" });
            return;
          }
          oe(G, { align: "start" }, { keepPreviousPeek: !0 }), H.current.add(G);
          return;
        }
      }
      if (x.length === w) {
        let G = yr(x, H.current);
        if (G) {
          oe(G, { align: "start" }, { keepPreviousPeek: !0 }), H.current.add(G);
          return;
        }
      }
      v.current === "following-bottom" && i.current ? q({ behavior: "auto" }) : (Z(), P());
    })(), ee();
  }, [pe, ee, Z, de, Be, P, oe, q]), Ie = c.useCallback(() => {
    if (v.current === "following-bottom" && i.current) {
      q({ behavior: "auto" });
      return;
    }
    let h = U.current;
    if (Re()) {
      i.current && h > 0 && U.current === 0 && q({ behavior: "auto" });
      return;
    }
    ne(), P();
  }, [Re, ne, P, q]), Ne = c.useCallback(() => {
    let h = S.current;
    if (!(!h || !F.hasListeners())) {
      if (typeof IntersectionObserver > "u") {
        P();
        return;
      }
      R.current || (R.current = new IntersectionObserver((x) => {
        for (let w of x) {
          let D = w.target.dataset.messageId;
          D && (w.isIntersecting ? j.current.add(D) : j.current.delete(D));
        }
        P();
      }, { root: h, rootMargin: `${-(z.current + I.current)}px 0px 0px 0px`, threshold: [0, 0.01, 0.5, 1] })), E.current.forEach((x) => {
        var w;
        (w = R.current) == null || w.observe(x);
      }), P();
    }
  }, [P, F]), Pe = c.useCallback(() => {
    var h;
    A.current !== null && (window.cancelAnimationFrame(A.current), A.current = null), (h = R.current) == null || h.disconnect(), R.current = null, j.current.clear(), F.setSnapshot(ve);
  }, [F]), vt = c.useCallback((h, x, w) => {
    var D, K, G;
    if (x) {
      E.current.set(h, x), (D = R.current) == null || D.observe(x), P(), ((K = W.current) == null ? void 0 : K.messageId) === h && De();
      return;
    }
    w && E.current.get(h) === w && (E.current.delete(h), j.current.delete(h), (G = R.current) == null || G.unobserve(w), P());
  }, [De, P]), Le = c.useCallback(() => {
    (v.current === "following-bottom" || v.current === "anchored-to-message" || v.current === "settling-jump") && (a.current = null, v.current = "free-scrolling");
  }, []), ze = c.useCallback(() => ue(k.getSnapshot()), [k, ue]), Oe = Ue(M, ze), He = Ue(S, ze), qe = c.useCallback((h) => {
    m.current = h;
  }, []), Ge = c.useCallback((h) => {
    b.current = h, J.current = Er((h == null ? void 0 : h.parentElement) ?? null);
  }, []), Ve = c.useCallback(() => {
    Z(), P(), ee();
  }, [ee, Z, P]), yt = c.useMemo(() => ({ handleContentChange: Me, handleResize: Ie, observeVisibility: Ne, pendingDefaultScrollStore: N, preserveScrollOnPrependRef: $, scrollToEnd: q, scrollToMessage: Ae, scrollToStart: fe, setContentElement: qe, setRootElement: Oe, setSpacerElement: Ge, setViewportElement: He, stateStore: k, syncAfterScroll: Ve, unobserveVisibility: Pe, userScrollIntent: Le, viewportRef: S, visibilityStore: F }), [Me, Ie, Ne, N, q, Ae, fe, qe, Oe, Ge, He, k, Ve, Pe, Le, F]);
  return c.useLayoutEffect(() => {
    pe() || u.current === 0 && ft(s);
  }, [pe]), c.useEffect(() => () => {
    var h;
    _.current !== null && (window.cancelAnimationFrame(_.current), _.current = null), A.current !== null && (window.cancelAnimationFrame(A.current), A.current = null), p.current !== null && (window.clearTimeout(p.current), p.current = null), B.current !== null && (window.cancelAnimationFrame(B.current), B.current = null), (h = R.current) == null || h.disconnect(), R.current = null;
  }, []), c.useLayoutEffect(() => {
    if (e && v.current === "following-bottom" && u.current > 0) {
      q({ behavior: "auto" });
      return;
    }
    Z();
  }, [e, Z, q]), { context: yt, registerMessage: vt };
}
function Ir(e) {
  let t = c.useRef(e);
  return t.current = e, t;
}
var pt = c.createContext(null), ht = c.createContext(null);
function ie() {
  let e = c.useContext(pt);
  if (!e) throw new Error("useMessageScroller must be used within a MessageScroller.");
  return e;
}
function Nr() {
  let e = c.useContext(ht);
  if (!e) throw new Error("MessageScrollerItem must be used within a MessageScroller.");
  return e;
}
function Pr({ autoScroll: e = !1, children: t, defaultScrollPosition: r = "end", scrollEdgeThreshold: n, scrollPreviousItemPeek: o, scrollMargin: s }) {
  let { context: a, registerMessage: i } = Mr({ autoScroll: e, defaultScrollPosition: r, scrollEdgeThreshold: n, scrollPreviousItemPeek: o, scrollMargin: s });
  return l(pt.Provider, { value: a, children: l(ht.Provider, { value: i, children: t }) });
}
function mt() {
  let { pendingDefaultScrollStore: e } = ie();
  return c.useSyncExternalStore(e.subscribe, e.getSnapshot, e.getSnapshot);
}
function Lr({ children: e, ...t }) {
  let { setRootElement: r } = ie(), n = mt();
  return l("div", { ref: r, ...t, ...n ? { "data-pending-scroll": "" } : null, children: e });
}
function zr({ "aria-label": e, children: t, onKeyDown: r, onScroll: n, onTouchMove: o, onWheel: s, preserveScrollOnPrepend: a = !0, ref: i, role: d, tabIndex: p, ...m }) {
  let { handleResize: y, preserveScrollOnPrependRef: f, setViewportElement: u, syncAfterScroll: g, userScrollIntent: E, viewportRef: v } = ie(), B = mt();
  f.current = a;
  let W = c.useCallback((T) => {
    var z;
    u(T), (z = ae(i)) == null || z(T);
  }, [i, u]);
  function L(T) {
    g(), n == null || n(T);
  }
  function $(T) {
    E(), s == null || s(T);
  }
  function N(T) {
    E(), o == null || o(T);
  }
  function M(T) {
    hr.has(T.key) && E(), r == null || r(T);
  }
  return c.useEffect(() => {
    let T = v.current;
    if (!T || typeof ResizeObserver > "u") return;
    let z = 0, I = new ResizeObserver(() => {
      window.cancelAnimationFrame(z), z = window.requestAnimationFrame(y);
    });
    return I.observe(T), () => {
      window.cancelAnimationFrame(z), I.disconnect();
    };
  }, [y, v]), l("div", { ref: W, role: d ?? "region", "aria-label": e ?? "Messages", tabIndex: p ?? 0, onKeyDown: M, onScroll: L, onTouchMove: N, onWheel: $, ...m, ...B ? { "data-pending-scroll": "" } : null, children: t });
}
function Or({ "aria-relevant": e, children: t, ref: r, role: n, spacerClassName: o, ...s }) {
  let { handleContentChange: a, handleResize: i, setContentElement: d, setSpacerElement: p } = ie(), m = c.useRef(null), y = c.useCallback((f) => {
    var u;
    m.current = f, d(f), (u = ae(r)) == null || u(f);
  }, [r, d]);
  return c.useLayoutEffect(() => {
    let f = m.current;
    if (!f || (a(), typeof MutationObserver > "u")) return;
    let u = new MutationObserver(() => {
      a();
    });
    return u.observe(f, { childList: !0 }), () => u.disconnect();
  }, [a]), c.useEffect(() => {
    let f = m.current;
    if (!f || typeof ResizeObserver > "u") return;
    let u = 0, g = new ResizeObserver(() => {
      window.cancelAnimationFrame(u), u = window.requestAnimationFrame(i);
    });
    return g.observe(f), () => {
      window.cancelAnimationFrame(u), g.disconnect();
    };
  }, [i]), C("div", { ref: y, role: n ?? "log", "aria-relevant": e ?? "additions", ...s, children: [t, l("div", { ref: p, "aria-hidden": "true", "data-message-scroller-spacer": "", hidden: !0, className: o })] });
}
function Hr({ messageId: e, ref: t, scrollAnchor: r = !1, ...n }) {
  let o = Nr(), s = c.useRef(null), a = c.useCallback((i) => {
    var p;
    let d = s.current;
    s.current = i, e && o(e, i, d), (p = ae(t)) == null || p(i);
  }, [e, t, o]);
  return l("div", { ref: a, "data-message-id": e, "data-scroll-anchor": r ? "true" : "false", ...n });
}
function qr({ behavior: e = "smooth", children: t, direction: r = "end", onClick: n, render: o, tabIndex: s, type: a = "button", ...i }) {
  let { scrollToEnd: d, scrollToStart: p, stateStore: m } = ie(), y = Ir(n), f = c.useCallback((v) => m.subscribe(v), [m]), u = c.useCallback(() => {
    let v = m.getSnapshot();
    return r === "start" ? v.start : v.end;
  }, [r, m]), g = c.useSyncExternalStore(f, u, u), E = c.useCallback((v) => {
    var B;
    g && ((B = y.current) == null || B.call(y, v), v.defaultPrevented || (v.currentTarget.blur(), r === "start" ? p({ behavior: e }) : d({ behavior: e })));
  }, [e, r, g, y, d, p]);
  return lr({ defaultTagName: "button", props: ke({ type: a, inert: !g, tabIndex: g ? s : -1, children: t ?? C("span", { children: ["Scroll to ", r] }), onClick: E }, i), render: o, state: { active: g, direction: r }, stateAttributesMapping: { active: (v) => ({ "data-active": v ? "true" : "false" }) } });
}
var re = { Provider: Pr, Root: Lr, Viewport: zr, Content: Or, Item: Hr, Button: qr };
function Gr(e) {
  return /* @__PURE__ */ l(re.Provider, { ...e });
}
function Vr({
  className: e,
  ...t
}) {
  return /* @__PURE__ */ l(
    re.Root,
    {
      "data-slot": "message-scroller",
      className: V(
        "group/message-scroller relative flex size-full min-h-0 flex-col overflow-hidden",
        e
      ),
      ...t
    }
  );
}
function Wr({
  className: e,
  ...t
}) {
  return /* @__PURE__ */ l(
    re.Viewport,
    {
      "data-slot": "message-scroller-viewport",
      className: V(
        "size-full min-h-0 min-w-0 overflow-y-auto overscroll-contain",
        "data-[pending-scroll]:invisible",
        e
      ),
      ...t
    }
  );
}
function jr({
  className: e,
  ...t
}) {
  return /* @__PURE__ */ l(
    re.Content,
    {
      "data-slot": "message-scroller-content",
      className: V("flex h-max min-h-full flex-col gap-4 px-4 py-4", e),
      ...t
    }
  );
}
function Ye({
  className: e,
  scrollAnchor: t = !1,
  ...r
}) {
  return /* @__PURE__ */ l(
    re.Item,
    {
      "data-slot": "message-scroller-item",
      scrollAnchor: t,
      className: V(
        "min-w-0 shrink-0 [contain-intrinsic-size:auto_10rem] [content-visibility:auto]",
        e
      ),
      ...r
    }
  );
}
function $r({
  direction: e = "end",
  className: t,
  children: r,
  ...n
}) {
  return /* @__PURE__ */ l(
    re.Button,
    {
      "data-slot": "message-scroller-button",
      direction: e,
      className: V(
        "absolute left-1/2 z-10 flex h-9 w-9 -translate-x-1/2 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-md transition-[opacity,transform] duration-200",
        "hover:bg-[var(--input-bg)]",
        "data-[active=false]:pointer-events-none data-[active=false]:scale-95 data-[active=false]:opacity-0",
        "data-[active=true]:scale-100 data-[active=true]:opacity-100",
        "data-[direction=end]:bottom-3 data-[direction=start]:top-3",
        "motion-reduce:transition-none",
        t
      ),
      ...n,
      children: r ?? /* @__PURE__ */ C(le, { children: [
        /* @__PURE__ */ l(
          Lt,
          {
            size: 16,
            "aria-hidden": "true",
            className: e === "start" ? "rotate-180" : void 0
          }
        ),
        /* @__PURE__ */ l("span", { className: "sr-only", children: e === "end" ? "Jump to latest" : "Jump to start" })
      ] })
    }
  );
}
const Ur = () => /* @__PURE__ */ C("div", { className: "flex items-start gap-2.5", children: [
  /* @__PURE__ */ l(
    "div",
    {
      className: "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground",
      "aria-hidden": "true",
      children: /* @__PURE__ */ l(st, { size: 15 })
    }
  ),
  /* @__PURE__ */ l("div", { className: "max-w-[82%] rounded-2xl rounded-tl-sm border border-border bg-[var(--bubble-assistant-bg)] px-3.5 py-2.5 text-[13.5px] leading-[1.55] text-foreground", children: /* @__PURE__ */ l("p", { children: "Hello — I am the VPS Veritas assistant. Ask about reports, sample status, registration, or support, or choose a question below the text box." }) })
] });
function _e(e) {
  return e.split(/(\*\*[^*]+\*\*|`[^`]+`|https?:\/\/[^\s]+)/g).map((r, n) => r.startsWith("**") && r.endsWith("**") ? /* @__PURE__ */ l("strong", { children: r.slice(2, -2) }, n) : r.startsWith("`") && r.endsWith("`") ? /* @__PURE__ */ l(
    "code",
    {
      className: "rounded bg-[var(--input-bg)] px-1 py-0.5 font-mono text-[12px] text-foreground",
      children: r.slice(1, -1)
    },
    n
  ) : /^https?:\/\//.test(r) ? /* @__PURE__ */ l(
    "a",
    {
      href: r,
      target: "_blank",
      rel: "noopener noreferrer",
      className: "underline underline-offset-2",
      children: r
    },
    n
  ) : /* @__PURE__ */ l(Xe.Fragment, { children: r }, n));
}
function Yr({ text: e }) {
  if (!e) return null;
  const t = e.split(/\n\n+/);
  return /* @__PURE__ */ l(le, { children: t.map((r, n) => {
    if (r.trim().startsWith("- ") || r.trim().startsWith("* ")) {
      const o = r.split(/\n/).filter((s) => s.trim().startsWith("- ") || s.trim().startsWith("* "));
      return /* @__PURE__ */ l("ul", { className: "my-1.5 ml-4 list-disc space-y-0.5", children: o.map((s, a) => /* @__PURE__ */ l("li", { children: _e(s.replace(/^[-*]\s+/, "")) }, a)) }, n);
    }
    if (/^\d+\.\s+/.test(r.trim())) {
      const o = r.split(/\n/).filter((s) => /^\d+\.\s+/.test(s.trim()));
      return /* @__PURE__ */ l("ol", { className: "my-1.5 ml-4 list-decimal space-y-0.5", children: o.map((s, a) => /* @__PURE__ */ l("li", { children: _e(s.replace(/^\d+\.\s+/, "")) }, a)) }, n);
    }
    if (r.startsWith("```")) {
      const o = r.replace(/^```[a-zA-Z]*\n?/, "").replace(/```$/, "");
      return /* @__PURE__ */ l(
        "pre",
        {
          className: "my-2 overflow-x-auto rounded-lg bg-[var(--code-bg)] p-3 font-mono text-[12px] text-primary-foreground",
          children: /* @__PURE__ */ l("code", { children: o })
        },
        n
      );
    }
    return /* @__PURE__ */ l("p", { className: "mb-2 last:mb-0 whitespace-pre-wrap", children: _e(r) }, n);
  }) });
}
const Zr = ({ className: e }) => /* @__PURE__ */ C(
  "div",
  {
    className: V("flex items-center gap-1 py-0.5", e),
    role: "status",
    "aria-label": "Assistant is preparing a reply",
    children: [
      /* @__PURE__ */ l("span", { className: "h-1.5 w-1.5 rounded-full bg-[var(--text-subtle)] motion-safe:animate-pulse" }),
      /* @__PURE__ */ l("span", { className: "h-1.5 w-1.5 rounded-full bg-[var(--text-subtle)] motion-safe:animate-pulse [animation-delay:150ms]" }),
      /* @__PURE__ */ l("span", { className: "h-1.5 w-1.5 rounded-full bg-[var(--text-subtle)] motion-safe:animate-pulse [animation-delay:300ms]" })
    ]
  }
);
function Jr(e) {
  return e === "create_ticket" ? "Support ticket processed" : e === "get_customer" ? "Account verified" : e === "get_ticket" ? "Ticket status loaded" : "Information retrieved";
}
function Kr({ sources: e }) {
  const [t, r] = Y(!1);
  return e.length ? /* @__PURE__ */ C("div", { className: "mt-2 border-t border-border pt-1.5", children: [
    /* @__PURE__ */ C(
      "button",
      {
        type: "button",
        className: "inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-muted-foreground hover:text-foreground",
        onClick: () => r((n) => !n),
        "aria-expanded": t,
        children: [
          /* @__PURE__ */ l(Wt, { size: 12, "aria-hidden": "true" }),
          e.length,
          " grounded source",
          e.length > 1 ? "s" : "",
          t ? /* @__PURE__ */ l(Gt, { size: 12 }) : /* @__PURE__ */ l(qt, { size: 12 })
        ]
      }
    ),
    t && /* @__PURE__ */ l("ul", { className: "mt-1.5 space-y-1", children: e.map((n) => /* @__PURE__ */ C(
      "li",
      {
        className: "flex items-center justify-between rounded-md border border-border bg-muted px-2 py-1 text-[11px] text-muted-foreground",
        children: [
          /* @__PURE__ */ l("span", { className: "truncate", title: n.source, children: n.source.split(/[/\\]/).pop() || n.source }),
          /* @__PURE__ */ C("span", { className: "ml-2 font-semibold text-success", children: [
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
  return e.length ? /* @__PURE__ */ l("div", { className: "mt-2 flex flex-wrap gap-1.5", children: e.map((t, r) => /* @__PURE__ */ l(
    "span",
    {
      className: "inline-flex items-center rounded-full border border-border bg-muted px-2 py-0.5 text-[11px] text-muted-foreground",
      children: Jr(t.toolName)
    },
    `${t.toolName}-${r}`
  )) }) : null;
}
const Qr = ({ message: e }) => {
  const t = e.role === "user", r = e.status === "error";
  return /* @__PURE__ */ C(
    "div",
    {
      className: V("flex items-start gap-2.5", t && "flex-row-reverse"),
      children: [
        !t && /* @__PURE__ */ l(
          "div",
          {
            className: "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground",
            "aria-hidden": "true",
            children: /* @__PURE__ */ l(st, { size: 15 })
          }
        ),
        /* @__PURE__ */ C("div", { className: V("flex max-w-[82%] flex-col", t && "items-end"), children: [
          /* @__PURE__ */ C(
            "div",
            {
              className: V(
                "rounded-2xl px-3.5 py-2.5 text-[13.5px] leading-[1.55]",
                t && "rounded-tr-sm bg-[var(--bubble-user-bg)] text-[var(--bubble-user-text)] font-medium",
                !t && !r && "rounded-tl-sm border border-border bg-[var(--bubble-bot-message-bg)] text-foreground",
                r && "rounded-tl-sm border border-[var(--error-border)] bg-[var(--error-bg)] text-[var(--error-text)]"
              ),
              children: [
                e.status === "pending" ? /* @__PURE__ */ l(Zr, {}) : t ? /* @__PURE__ */ l("p", { className: "whitespace-pre-wrap", children: e.content }) : /* @__PURE__ */ l(Yr, { text: e.content }),
                e.toolCalls ? /* @__PURE__ */ l(Xr, { toolCalls: e.toolCalls }) : null,
                e.sources ? /* @__PURE__ */ l(Kr, { sources: e.sources }) : null
              ]
            }
          ),
          t && e.status !== "error" && /* @__PURE__ */ l(Ht, { size: 13, className: "mt-1 text-success", "aria-hidden": "true" })
        ] })
      ]
    }
  );
}, en = () => {
  const { messages: e, status: t, showSuggestions: r } = ye();
  return /* @__PURE__ */ l(
    Gr,
    {
      autoScroll: !0,
      defaultScrollPosition: "last-anchor",
      scrollPreviousItemPeek: 64,
      children: /* @__PURE__ */ C(Vr, { children: [
        /* @__PURE__ */ l(Wr, { "aria-label": "Chat messages", children: /* @__PURE__ */ C(jr, { "aria-busy": t === "awaiting" || t === "connecting", children: [
          r && /* @__PURE__ */ l(Ye, { messageId: "welcome", children: /* @__PURE__ */ l(Ur, {}) }),
          e.map((o) => /* @__PURE__ */ l(
            Ye,
            {
              messageId: o.id,
              scrollAnchor: o.role === "user",
              children: /* @__PURE__ */ l(Qr, { message: o })
            },
            o.id
          ))
        ] }) }),
        /* @__PURE__ */ l($r, {})
      ] })
    }
  );
}, tn = () => {
  const { pendingTicket: e, ticketBusy: t, userContext: r, confirmTicket: n, cancelTicket: o } = ye(), s = !r.customerId && !r.email, [a, i] = Y("");
  return e ? /* @__PURE__ */ C(
    "div",
    {
      className: "mx-4 mb-3 rounded-xl border border-border bg-card p-4 shadow-sm",
      role: "region",
      "aria-label": "Create support ticket",
      children: [
        /* @__PURE__ */ l("h3", { className: "text-[13.5px] font-bold text-foreground", children: "Create support ticket?" }),
        /* @__PURE__ */ l("p", { className: "mt-1.5 text-[12.5px] leading-5 text-muted-foreground", children: "I can open a support request for you. Nothing is created until you confirm." }),
        /* @__PURE__ */ l("p", { className: "mt-2 rounded-md bg-muted px-2.5 py-2 text-[12.5px] text-foreground", children: e.description }),
        s && /* @__PURE__ */ C("label", { className: "mt-3 block text-[12px] font-semibold text-foreground", children: [
          "Customer ID or email",
          /* @__PURE__ */ l(
            "input",
            {
              value: a,
              onChange: (d) => i(d.target.value),
              className: "mt-1 w-full rounded-md border border-border px-2.5 py-2 text-[13px] font-normal outline-none focus-visible:ring-2 focus-visible:ring-primary",
              placeholder: "CUST-1001 or you@company.com",
              autoComplete: "email"
            }
          )
        ] }),
        /* @__PURE__ */ C("div", { className: "mt-3 flex justify-end gap-2", children: [
          /* @__PURE__ */ l(
            "button",
            {
              type: "button",
              onClick: o,
              disabled: t,
              className: "rounded-lg border border-border bg-card px-3.5 py-1.5 text-[12.5px] font-semibold text-muted-foreground hover:bg-muted",
              children: "Cancel"
            }
          ),
          /* @__PURE__ */ l(
            "button",
            {
              type: "button",
              onClick: () => void n(a),
              disabled: t || s && !a.trim(),
              className: "rounded-lg bg-action px-3.5 py-1.5 text-[12.5px] font-semibold text-action-foreground hover:bg-[var(--action-hover)] disabled:opacity-40",
              children: t ? "Creating…" : "Create ticket"
            }
          )
        ] })
      ]
    }
  ) : null;
}, gt = ({
  className: e,
  onClose: t,
  showMinimize: r,
  title: n,
  subtitle: o,
  envStage: s,
  envPulse: a = !0
}) => {
  const { sendMessage: i, status: d, error: p, resetConversation: m, retryLast: y, pendingTicket: f } = ye(), u = d === "awaiting" || d === "connecting" || !!f;
  return /* @__PURE__ */ C(
    "section",
    {
      className: V(
        "flex h-full min-h-0 flex-col overflow-hidden bg-card",
        e
      ),
      "aria-label": "VPS AI Assistant",
      children: [
        /* @__PURE__ */ l(
          er,
          {
            title: n,
            subtitle: o,
            onClose: t,
            onReset: () => void m(),
            showMinimize: r,
            envStage: s,
            envPulse: a
          }
        ),
        /* @__PURE__ */ l("div", { className: "relative min-h-0 flex-1", children: /* @__PURE__ */ l(en, {}) }),
        p && d === "error" && /* @__PURE__ */ l(Mt, { message: p, onRetry: () => void y() }),
        /* @__PURE__ */ l(tn, {}),
        /* @__PURE__ */ l(
          sr,
          {
            onSend: (g) => void i(g),
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
}) => e ? /* @__PURE__ */ l(
  "div",
  {
    id: "vps-chatbot-widget-panel",
    className: V(
      "fixed bottom-[98px] right-7 z-[999] flex h-[min(660px,calc(100vh-120px))] w-[min(420px,calc(100vw-32px))] flex-col overflow-hidden rounded-[20px] border border-border bg-card",
      "shadow-[0_20px_40px_-15px_rgba(0,0,0,0.12)]",
      "origin-bottom-right animate-[chat-pop_180ms_ease-out] motion-reduce:animate-none"
    ),
    children: /* @__PURE__ */ l(
      gt,
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
}) => /* @__PURE__ */ l(
  "button",
  {
    type: "button",
    onClick: t,
    "aria-expanded": e,
    "aria-controls": "vps-chatbot-widget-panel",
    "aria-label": e ? "Close assistant" : "Open assistant",
    className: V(
      "fixed bottom-7 right-7 z-[1000] flex h-[58px] w-[58px] items-center justify-center rounded-xl text-primary-foreground",
      "bg-primary hover:bg-[var(--primary-hover)]",
      "shadow-md",
      "transition duration-200 motion-reduce:transition-none motion-reduce:hover:scale-100",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
    ),
    children: e ? /* @__PURE__ */ l(Jt, { size: 22 }) : /* @__PURE__ */ l(lt, { size: 24 })
  }
), Ze = ({
  defaultOpen: e = !1,
  open: t,
  onOpenChange: r,
  envStage: n,
  envPulse: o = !0
}) => {
  const [s, a] = Y(e), i = t ?? s, d = (p) => {
    r == null || r(p), t === void 0 && a(p);
  };
  return /* @__PURE__ */ C(le, { children: [
    /* @__PURE__ */ l(
      rn,
      {
        open: i,
        onClose: () => d(!1),
        envStage: n,
        envPulse: o
      }
    ),
    /* @__PURE__ */ l(nn, { open: i, onToggle: () => d(!i) })
  ] });
}, hn = ({
  apiBaseUrl: e,
  apiUrl: t,
  proxyUrl: r,
  userContext: n,
  suggestions: o,
  disableSuggestions: s,
  initialMessage: a,
  ...i
}) => {
  const d = rt(), p = e ?? t ?? r;
  return !!d && (!p || te(p) === te(d == null ? void 0 : d.apiBaseUrl)) && !n && !o && s === void 0 && !a ? /* @__PURE__ */ l(Ze, { ...i }) : /* @__PURE__ */ l(
    nt,
    {
      apiBaseUrl: p,
      userContext: n,
      suggestions: o,
      disableSuggestions: s,
      initialMessage: a,
      children: /* @__PURE__ */ l(Ze, { ...i })
    }
  );
}, on = ({
  open: e,
  onClose: t,
  subtitle: r,
  title: n,
  envStage: o,
  envPulse: s = !0
}) => /* @__PURE__ */ C(le, { children: [
  /* @__PURE__ */ l(
    "div",
    {
      className: V(
        "fixed inset-0 z-[90] bg-[var(--overlay)] sm:hidden",
        e ? "opacity-100" : "pointer-events-none opacity-0",
        "transition-opacity duration-200 motion-reduce:transition-none"
      ),
      hidden: !e,
      onClick: t,
      "aria-hidden": "true"
    }
  ),
  /* @__PURE__ */ l(
    "aside",
    {
      id: "vps-embedded-chat-panel",
      className: V(
        "fixed inset-y-0 right-0 z-[100] flex w-full max-w-[440px] flex-col border-l border-border bg-card shadow-xl",
        "transition-transform duration-300 ease-out motion-reduce:transition-none",
        e ? "translate-x-0" : "translate-x-full"
      ),
      "aria-hidden": !e,
      children: e && /* @__PURE__ */ l(
        gt,
        {
          onClose: t,
          title: n || "VPS AI Assistant",
          subtitle: r,
          envStage: o,
          envPulse: s
        }
      )
    }
  )
] }), sn = 5, xe = 8, bt = "vps-embedded-assistant-top";
function ln(e, t, r) {
  return Math.min(r, Math.max(t, e));
}
function Je(e, t) {
  const r = Math.max(
    xe,
    window.innerHeight - t - xe
  );
  return ln(e, xe, r);
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
  const t = X(null), r = X({
    pointerId: null,
    startY: 0,
    startTop: 0,
    moved: !1
  }), [n, o] = Y(
    () => typeof window > "u" ? null : an()
  ), s = X(n), a = X(!1), [i, d] = Y(!1);
  ge(() => {
    s.current = n;
  }, [n]), ge(() => {
    const f = t.current;
    if (!f) return;
    const u = () => {
      o((g) => {
        const E = g ?? Math.round(window.innerHeight / 2 - f.offsetHeight / 2), v = Je(E, f.offsetHeight);
        return s.current = v, v;
      });
    };
    return u(), window.addEventListener("resize", u), () => window.removeEventListener("resize", u);
  }, []);
  const p = (f) => {
    if (f.button !== 0) return;
    const u = f.currentTarget, g = u.getBoundingClientRect();
    r.current = {
      pointerId: f.pointerId,
      startY: f.clientY,
      startTop: g.top,
      moved: !1
    };
    try {
      u.setPointerCapture(f.pointerId);
    } catch {
    }
  }, m = (f) => {
    if (r.current.pointerId !== f.pointerId) return;
    const u = f.clientY - r.current.startY;
    if (!r.current.moved && Math.abs(u) < sn) return;
    r.current.moved = !0, d(!0);
    const g = Je(
      r.current.startTop + u,
      f.currentTarget.offsetHeight
    );
    s.current = g, o(g);
  }, y = (f) => {
    var g, E;
    if (r.current.pointerId !== f.pointerId) return;
    try {
      (E = (g = f.currentTarget).hasPointerCapture) != null && E.call(g, f.pointerId) && f.currentTarget.releasePointerCapture(f.pointerId);
    } catch {
    }
    const u = r.current.moved;
    r.current.pointerId = null, r.current.moved = !1, d(!1), u && (a.current = !0, s.current != null && cn(s.current));
  };
  return /* @__PURE__ */ C(
    "button",
    {
      ref: t,
      type: "button",
      onPointerDown: p,
      onPointerMove: m,
      onPointerUp: y,
      onPointerCancel: y,
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
      className: `fixed right-0 z-[80] flex touch-none items-center gap-2 rounded-l-lg bg-action px-3 py-2.5 text-[12.5px] font-semibold text-action-foreground shadow-lg hover:bg-[var(--action-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${i ? "cursor-grabbing" : "cursor-grab"}`,
      style: {
        top: n ?? "50%",
        transform: n == null ? "translateY(-50%)" : void 0
      },
      children: [
        /* @__PURE__ */ l(lt, { size: 16 }),
        "Assistant"
      ]
    }
  );
}, Ke = ({
  defaultOpen: e = !1,
  open: t,
  onOpenChange: r,
  showTrigger: n = !0,
  envStage: o,
  envPulse: s = !0
}) => {
  const [a, i] = Y(e), d = t ?? a, p = (m) => {
    r == null || r(m), t === void 0 && i(m);
  };
  return /* @__PURE__ */ C(le, { children: [
    n && !d && /* @__PURE__ */ l(un, { onOpen: () => p(!0) }),
    /* @__PURE__ */ l(
      on,
      {
        open: d,
        onClose: () => p(!1),
        envStage: o,
        envPulse: s
      }
    )
  ] });
}, mn = ({
  apiBaseUrl: e,
  apiUrl: t,
  proxyUrl: r,
  userContext: n,
  suggestions: o,
  disableSuggestions: s,
  initialMessage: a,
  ...i
}) => {
  const d = rt(), p = e ?? t ?? r;
  return !!d && (!p || te(p) === te(d == null ? void 0 : d.apiBaseUrl)) && !n && !o && s === void 0 && !a ? /* @__PURE__ */ l(Ke, { ...i }) : /* @__PURE__ */ l(
    nt,
    {
      apiBaseUrl: p,
      userContext: n,
      suggestions: o,
      disableSuggestions: s,
      initialMessage: a,
      children: /* @__PURE__ */ l(Ke, { ...i })
    }
  );
}, gn = {
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
  gt as ChatPanel,
  nt as ChatProvider,
  hn as ChatbotWidget,
  gn as ColorPalette,
  mn as EmbeddedChatbot,
  We as buildApiUrl,
  pn as chatApi,
  tt as createChatApi,
  te as resolveApiBaseUrl,
  Bt as useChatContext,
  ye as useChatbot,
  rt as useOptionalChatContext
};
