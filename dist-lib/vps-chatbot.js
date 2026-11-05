import { jsx as l, jsxs as T, Fragment as ke } from "react/jsx-runtime";
import * as u from "react";
import Ae, { createContext as Ct, useContext as nt, useMemo as he, useState as K, useRef as se, useCallback as le, forwardRef as st, createElement as Fe, useEffect as ie } from "react";
const St = {};
function ce(e) {
  return e != null && e.trim() !== "" ? e.trim().replace(/\/+$/, "") : String("").trim().replace(/\/+$/, "");
}
function Se(e, t) {
  const n = ce(e);
  if (!n)
    return t;
  if (n.endsWith("/api") && t.startsWith("/api/"))
    return `${n}${t.slice(4)}`;
  if (n.endsWith("/api") && t === "/health") {
    const s = n.slice(0, -4);
    return s ? `${s}/health` : "/health";
  }
  const r = t.startsWith("/") ? t : `/${t}`;
  return `${n}${r}`;
}
function Tt(e) {
  return e && typeof e == "object" && "data" in e && e.success !== !1 ? e.data : e;
}
function Ft(e, t, n) {
  var o, a, i;
  const r = e, s = (o = r == null ? void 0 : r.error) == null ? void 0 : o.message;
  return s && !Et(s) ? {
    code: (a = r == null ? void 0 : r.error) == null ? void 0 : a.code,
    message: s,
    requestId: (i = r == null ? void 0 : r.error) == null ? void 0 : i.request_id
  } : n >= 500 ? { message: "I couldn't process that request right now." } : n === 0 ? { message: "Something went wrong while connecting. Please try again." } : { message: t };
}
function Et(e) {
  return /traceback|sql|exception|stack|api[_ ]?key|password/i.test(e);
}
function je(e) {
  return {
    chunkId: e.chunk_id,
    source: e.source,
    score: e.score,
    title: e.title,
    snippet: e.snippet
  };
}
function Ye(e) {
  return {
    toolName: e.tool_name,
    arguments: e.arguments ?? {},
    result: e.result ?? {}
  };
}
function Je(e) {
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
function ot(e) {
  const t = ce(e);
  async function n(r, s) {
    let o;
    const a = Se(t, r);
    try {
      o = await fetch(a, {
        ...s,
        headers: {
          "Content-Type": "application/json",
          ...(s == null ? void 0 : s.headers) ?? {}
        }
      });
    } catch {
      throw { message: "Something went wrong while connecting. Please try again." };
    }
    if (o.status === 204)
      return;
    const i = await At(o);
    if (!o.ok)
      throw Ft(
        i,
        "I couldn't process that request right now.",
        o.status
      );
    return Tt(i);
  }
  return {
    apiBaseUrl: t,
    async createSession() {
      const r = await n("/api/v1/sessions", {
        method: "POST",
        body: JSON.stringify({})
      });
      return { sessionId: r.session_id, createdAt: r.created_at };
    },
    async sendMessage(r, s, o) {
      const a = await n(
        `/api/v1/sessions/${r}/messages`,
        {
          method: "POST",
          body: JSON.stringify({
            message: s,
            ...(o == null ? void 0 : o.roleId) !== void 0 ? { role_id: o.roleId } : {},
            ...o != null && o.client ? { client: o.client } : {}
          })
        }
      );
      return {
        requestId: a.request_id,
        sessionId: a.session_id,
        answer: a.answer,
        sources: (a.sources || []).map(je),
        toolCalls: (a.tool_calls || []).map(Ye),
        usage: Je(a.usage)
      };
    },
    async sendMessageStream(r, s, o, a) {
      const i = Se(t, `/api/v1/sessions/${r}/messages/stream`);
      try {
        const c = await fetch(i, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            message: s,
            ...(o == null ? void 0 : o.roleId) !== void 0 ? { role_id: o.roleId } : {},
            ...o != null && o.client ? { client: o.client } : {}
          })
        });
        if (!c.ok || !c.body)
          return await this.sendMessage(r, s, o);
        const f = c.body.getReader(), g = new TextDecoder();
        let v = "", h = null;
        for (; ; ) {
          const { done: d, value: p } = await f.read();
          if (d) break;
          v += g.decode(p, { stream: !0 });
          const y = v.split(`

`);
          v = y.pop() || "";
          for (const b of y) {
            const F = b.trim();
            if (F.startsWith("data:"))
              try {
                const k = JSON.parse(F.slice(5).trim());
                if (k.type === "progress" && k.stage)
                  a == null || a(k.stage);
                else if (k.type === "complete")
                  h = {
                    requestId: k.request_id,
                    sessionId: k.session_id,
                    answer: k.answer,
                    sources: (k.sources || []).map(je),
                    toolCalls: (k.tool_calls || []).map(Ye),
                    usage: Je(k.usage)
                  };
                else if (k.type === "error")
                  throw new Error(k.message || "An error occurred");
              } catch (k) {
                if (!(k instanceof Error && k.message !== "An error occurred"))
                  throw k;
              }
          }
        }
        return h || await this.sendMessage(r, s, o);
      } catch {
        return await this.sendMessage(r, s, o);
      }
    },
    async getHistory(r) {
      try {
        return ((await n(
          `/api/v1/sessions/${r}/messages`
        )).messages || []).map(Rt);
      } catch {
        return [];
      }
    },
    async closeSession(r) {
      try {
        await n(`/api/v1/sessions/${r}`, { method: "DELETE" });
      } catch {
      }
    },
    async createTicket() {
      throw new Error("Ticket creation has been removed.");
    },
    async checkHealth() {
      try {
        const r = Se(t, "/health");
        return (await fetch(r)).ok;
      } catch {
        return !1;
      }
    }
  };
}
const fn = ot(), Bt = [
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
], Be = Ct(null);
function Mt() {
  const e = nt(Be);
  if (!e)
    throw new Error("useChatbot must be used inside ChatProvider.");
  return e;
}
function Me() {
  return nt(Be);
}
const Dt = `Hello! I am your **VPS Veritas assistant**.

I can help you with:
- **Fuel Quality Testing (FQT)** & **Oil Condition Monitoring (OCM)**
- **Fuel Defect Reporting (FDR)** — report and track bunker defect incidents
- **Bunker Master** — manage bunkering operations, BDN logs, and surveys
- **FSC & FSQ E-Forms** — paperless fuel system checks and bunker sample pre-registration
- **Samplogic** sample logistics, report downloads, and support tickets

Feel free to ask a question or select one of the suggested topics below!`;
function Ze(e) {
  return `${e}-${crypto.randomUUID()}`;
}
function It(e) {
  if (e && typeof e == "object" && "message" in e) {
    const t = String(e.message);
    if (t && !/traceback|sql|exception|stack|api[_ ]?key|password/i.test(t))
      return t;
  }
  return "I couldn't process that request right now.";
}
const lt = ({
  children: e,
  userContext: t = {},
  role: n,
  roleId: r,
  client: s,
  welcomeMessage: o,
  suggestions: a = Bt,
  disableSuggestions: i = !1,
  initialMessage: c,
  apiBaseUrl: f,
  apiUrl: g,
  proxyUrl: v,
  api: h,
  hideInspectSources: d = !1,
  showGroundedSources: p = !0
}) => {
  const y = f ?? g ?? v, b = he(
    () => h ?? ot(y),
    [h, y]
  ), F = he(() => ({
    ...t,
    ...n !== void 0 ? { role: n } : {},
    ...r !== void 0 ? { roleId: r } : {},
    ...s !== void 0 ? { client: s } : {}
  }), [t, n, r, s]), k = he(() => o === "" ? null : {
    id: "welcome-default",
    role: "assistant",
    content: o || Dt,
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    status: "complete"
  }, [o]), [D, j] = K(null), [I, N] = K(() => k ? [k] : []), [E, L] = K("idle"), [q, te] = K(null), Y = se(null), _ = se(!1), S = le(async () => {
    if (D) return D;
    L("connecting");
    const W = await b.createSession();
    return j(W.sessionId), W.sessionId;
  }, [D, b]), R = le(
    async (W) => {
      Y.current = W;
      const Q = {
        id: Ze("user"),
        role: "user",
        content: W,
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        status: "complete"
      }, X = Ze("asst"), J = {
        id: X,
        role: "assistant",
        content: "",
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        status: "pending",
        progressText: "Analyzing question & expanding domain terms "
      };
      N((A) => [...A, Q, J]), L("awaiting"), te(null);
      const oe = (A) => {
        N(
          ($) => $.map(
            (Z) => Z.id === X ? { ...Z, progressText: A } : Z
          )
        );
      };
      try {
        const A = await S(), $ = b.sendMessageStream ? await b.sendMessageStream(
          A,
          W,
          {
            roleId: F.roleId,
            client: F.client
          },
          (Z) => {
            oe(Z);
          }
        ) : await b.sendMessage(A, W, {
          roleId: F.roleId,
          client: F.client
        });
        N(
          (Z) => Z.map(
            (U) => U.id === X ? {
              ...U,
              id: $.requestId || X,
              content: $.answer,
              status: "complete",
              progressText: void 0,
              sources: $.sources,
              toolCalls: $.toolCalls,
              usage: $.usage
            } : U
          )
        ), L("idle");
      } catch (A) {
        const $ = It(A);
        N(
          (Z) => Z.map(
            (U) => U.id === X ? { ...U, content: $, status: "error", progressText: void 0 } : U
          )
        ), te($), L("error");
      }
    },
    [S, b, F.client, F.roleId]
  ), B = le(
    async (W) => {
      const Q = W.trim();
      !Q || E === "awaiting" || E === "connecting" || await R(Q);
    },
    [R, E]
  ), M = le(async () => {
    const W = Y.current;
    W && (N((Q) => Q.filter((X) => X.status !== "error")), await R(W));
  }, [R]), P = le(async () => {
  }, []), x = le(() => {
  }, []), G = le(async () => {
    D && await b.closeSession(D), j(null), N(k ? [k] : []), L("idle"), te(null), Y.current = null;
  }, [D, b, k]);
  Ae.useEffect(() => {
    !c || _.current || (_.current = !0, B(c));
  }, [c, B]);
  const re = he(
    () => ({
      messages: I,
      status: E,
      error: q,
      sessionId: D,
      pendingTicket: null,
      ticketBusy: !1,
      lastTicket: null,
      suggestions: a,
      showSuggestions: !i && (I.length === 0 || I.length === 1 && I[0].id === "welcome-default"),
      suggestionBadgesEnabled: !i,
      userContext: F,
      apiBaseUrl: b.apiBaseUrl,
      hideInspectSources: d,
      showGroundedSources: p,
      sendMessage: B,
      retryLast: M,
      confirmTicket: P,
      cancelTicket: x,
      resetConversation: G
    }),
    [
      I,
      E,
      q,
      D,
      a,
      i,
      F,
      b.apiBaseUrl,
      d,
      p,
      B,
      M,
      P,
      x,
      G
    ]
  );
  return /* @__PURE__ */ l(Be.Provider, { value: re, children: e });
};
function Ce() {
  return Mt();
}
const Nt = ({ message: e, onRetry: t }) => /* @__PURE__ */ T(
  "div",
  {
    className: "chat-error-banner",
    role: "alert",
    children: [
      /* @__PURE__ */ l("p", { children: e }),
      t && /* @__PURE__ */ l(
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
const Pt = (e) => e.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase(), at = (...e) => e.filter((t, n, r) => !!t && t.trim() !== "" && r.indexOf(t) === n).join(" ").trim();
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
var xt = {
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
const Lt = st(
  ({
    color: e = "currentColor",
    size: t = 24,
    strokeWidth: n = 2,
    absoluteStrokeWidth: r,
    className: s = "",
    children: o,
    iconNode: a,
    ...i
  }, c) => Fe(
    "svg",
    {
      ref: c,
      ...xt,
      width: t,
      height: t,
      stroke: e,
      strokeWidth: r ? Number(n) * 24 / Number(t) : n,
      className: at("lucide", s),
      ...i
    },
    [
      ...a.map(([f, g]) => Fe(f, g)),
      ...Array.isArray(o) ? o : [o]
    ]
  )
);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const z = (e, t) => {
  const n = st(
    ({ className: r, ...s }, o) => Fe(Lt, {
      ref: o,
      iconNode: t,
      className: at(`lucide-${Pt(e)}`, r),
      ...s
    })
  );
  return n.displayName = `${e}`, n;
};
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Ot = z("ArrowDown", [
  ["path", { d: "M12 5v14", key: "s699le" }],
  ["path", { d: "m19 12-7 7-7-7", key: "1idqje" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const qt = z("ArrowLeft", [
  ["path", { d: "m12 19-7-7 7-7", key: "1l729n" }],
  ["path", { d: "M19 12H5", key: "x3x0zl" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Wt = z("ArrowUp", [
  ["path", { d: "m5 12 7-7 7 7", key: "hav0vg" }],
  ["path", { d: "M12 19V5", key: "x0mq9r" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const it = z("BotMessageSquare", [
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
const $t = z("Brain", [
  [
    "path",
    {
      d: "M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z",
      key: "l5xja"
    }
  ],
  [
    "path",
    {
      d: "M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z",
      key: "ep3f8r"
    }
  ],
  ["path", { d: "M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4", key: "1p4c4q" }],
  ["path", { d: "M17.599 6.5a3 3 0 0 0 .399-1.375", key: "tmeiqw" }],
  ["path", { d: "M6.003 5.125A3 3 0 0 0 6.401 6.5", key: "105sqy" }],
  ["path", { d: "M3.477 10.896a4 4 0 0 1 .585-.396", key: "ql3yin" }],
  ["path", { d: "M19.938 10.5a4 4 0 0 1 .585.396", key: "1qfode" }],
  ["path", { d: "M6 18a4 4 0 0 1-1.967-.516", key: "2e4loj" }],
  ["path", { d: "M19.967 17.484A4 4 0 0 1 18 18", key: "159ez6" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Ht = z("Check", [["path", { d: "M20 6 9 17l-5-5", key: "1gmf2c" }]]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Vt = z("ClipboardCheck", [
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
const zt = z("FlaskConical", [
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
const ct = z("MessageSquare", [
  ["path", { d: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z", key: "1lielz" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Gt = z("Microscope", [
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
const Ut = z("Minus", [["path", { d: "M5 12h14", key: "1ays0h" }]]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const jt = z("RefreshCw", [
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
const Yt = z("TestTubeDiagonal", [
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
const Jt = z("X", [
  ["path", { d: "M18 6 6 18", key: "1bl5f8" }],
  ["path", { d: "m6 6 12 12", key: "d8bk6v" }]
]), Zt = {
  alpha: {
    label: "Alpha",
    Icon: zt,
    variant: "env-badge--alpha",
    tooltip: "Alpha build — internal testing only"
  },
  beta: {
    label: "Beta",
    Icon: Yt,
    variant: "env-badge--beta",
    tooltip: "Beta build — public pre-release"
  },
  gamma: {
    label: "Gamma",
    Icon: Gt,
    variant: "env-badge--gamma",
    tooltip: "Gamma / Release Candidate"
  },
  qa: {
    label: "QA",
    Icon: Vt,
    variant: "env-badge--qa",
    tooltip: "Quality Assurance build"
  }
}, Kt = ({
  stage: e,
  pulse: t = !0,
  className: n = ""
}) => {
  if (!e) return null;
  const { label: r, Icon: s, variant: o, tooltip: a } = Zt[e];
  return /* @__PURE__ */ T(
    "span",
    {
      className: `env-badge-inline ${o} ${n}`.trim(),
      title: a,
      "aria-label": `${r} build`,
      role: "status",
      children: [
        /* @__PURE__ */ l(s, { size: 10, className: "env-badge-icon", "aria-hidden": "true" }),
        /* @__PURE__ */ l("span", { className: "env-badge-inline-label", children: r })
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
), Xt = ({
  title: e = "VPS AI Assistant",
  subtitle: t = "Customer portal support",
  onClose: n,
  onReset: r,
  onBack: s,
  showMinimize: o = !1,
  envStage: a,
  envPulse: i = !0
}) => /* @__PURE__ */ T("header", { className: "chat-header", children: [
  /* @__PURE__ */ T("div", { className: "chat-header-left", children: [
    s && /* @__PURE__ */ l(
      "button",
      {
        type: "button",
        onClick: s,
        className: "icon-btn-back",
        "aria-label": "Back",
        children: /* @__PURE__ */ l(qt, { size: 16 })
      }
    ),
    /* @__PURE__ */ l(
      "div",
      {
        className: "avatar-circle",
        "aria-hidden": "true",
        children: /* @__PURE__ */ l(Qt, { width: "16px", height: "16px", color: "white" })
      }
    ),
    /* @__PURE__ */ T("div", { children: [
      /* @__PURE__ */ T("div", { className: "chat-header-title-row", children: [
        /* @__PURE__ */ l("h2", { className: "chat-header-title", children: e }),
        /* @__PURE__ */ l(Kt, { stage: a, pulse: i })
      ] }),
      /* @__PURE__ */ l("p", { className: "chat-header-subtitle", children: t || "Customer portal support" })
    ] })
  ] }),
  /* @__PURE__ */ T("div", { className: "chat-header-actions", children: [
    r && /* @__PURE__ */ l(
      "button",
      {
        type: "button",
        onClick: r,
        className: "icon-btn-action",
        "aria-label": "Start a new conversation",
        title: "New conversation",
        children: /* @__PURE__ */ l(jt, { size: 15 })
      }
    ),
    n && /* @__PURE__ */ l(
      "button",
      {
        type: "button",
        onClick: n,
        className: "icon-btn-action",
        "aria-label": o ? "Minimize chat" : "Close chat",
        children: /* @__PURE__ */ l(Ut, { size: 16 })
      }
    )
  ] })
] });
function er(e, t) {
  const n = se(e);
  ie(() => {
    var r;
    n.current && !e && ((r = t.current) == null || r.focus()), n.current = e;
  }, [e, t]);
}
function tr(e, t) {
  const n = t.trim().toLowerCase();
  return n ? e.filter(
    (r) => r.label.toLowerCase().includes(n) || r.query.toLowerCase().includes(n)
  ) : e;
}
const rr = ({
  suggestions: e,
  onSelect: t,
  disabled: n,
  variant: r = "list"
}) => e.length ? r === "badge" ? /* @__PURE__ */ l(
  "ul",
  {
    className: "suggestions-badge-list",
    "aria-label": "Suggested questions",
    children: e.map((s) => /* @__PURE__ */ l("li", { className: "suggestion-badge-item", children: /* @__PURE__ */ l(
      "button",
      {
        type: "button",
        disabled: n,
        onClick: () => t(s),
        title: s.query,
        className: "suggestion-badge-btn",
        children: s.label
      }
    ) }, s.query))
  }
) : /* @__PURE__ */ l("div", { className: "suggestions-list", children: e.map((s) => /* @__PURE__ */ l(
  "button",
  {
    type: "button",
    disabled: n,
    onClick: () => t(s),
    className: "suggestion-list-btn",
    children: s.label
  },
  s.query
)) }) : null, nr = ({
  onSend: e,
  disabled: t = !1,
  placeholder: n = "Ask something…"
}) => {
  const { suggestions: r, showSuggestions: s, suggestionBadgesEnabled: o } = Ce(), [a, i] = K(""), c = se(null), f = (d) => {
    d && (d.style.height = "auto", d.style.height = `${Math.min(d.scrollHeight, 96)}px`);
  };
  er(t, c), ie(() => {
    f(c.current);
  }, [a]);
  const g = he(() => {
    if (!o || t) return [];
    const d = a.trim();
    return d ? tr(r, d) : s ? r : [];
  }, [t, s, o, r, a]), v = (d) => {
    i(d.query);
    const p = c.current;
    p == null || p.focus();
  }, h = () => {
    const d = a.trim();
    !d || t || (e(d), i(""), c.current && (c.current.style.height = "auto"));
  };
  return /* @__PURE__ */ T("div", { className: "chat-input-wrapper", children: [
    /* @__PURE__ */ l(
      rr,
      {
        variant: "badge",
        suggestions: g,
        onSelect: v,
        disabled: t
      }
    ),
    /* @__PURE__ */ l("label", { htmlFor: "vps-chat-input", className: "sr-only", children: "Chat message" }),
    /* @__PURE__ */ T("div", { className: "chat-input-row", children: [
      /* @__PURE__ */ l(
        "textarea",
        {
          id: "vps-chat-input",
          ref: c,
          rows: 1,
          value: a,
          disabled: t,
          placeholder: n,
          onChange: (d) => {
            i(d.target.value), f(d.target);
          },
          onKeyDown: (d) => {
            d.key === "Enter" && !d.shiftKey && (d.preventDefault(), h());
          },
          className: "chat-textarea"
        }
      ),
      /* @__PURE__ */ l(
        "button",
        {
          type: "button",
          onClick: h,
          disabled: t || !a.trim(),
          "aria-label": "Send message",
          className: "chat-send-btn",
          children: /* @__PURE__ */ l(Wt, { size: 16 })
        }
      )
    ] }),
    /* @__PURE__ */ T("p", { className: "chat-input-footer", children: [
      "Powered by ",
      /* @__PURE__ */ l("span", { className: "chat-input-footer-brand", children: "VPS Veritas AI" })
    ] })
  ] });
};
function sr({ defaultTagName: e, props: t, render: n, state: r = {}, stateAttributesMapping: s }) {
  let o = Ee(or(r, s), t);
  if (!n) return u.createElement(e, o);
  if (typeof n == "function") return n(o, r);
  if (!u.isValidElement(n)) return null;
  let a = n.props, i = { ...Ee(o, a), ref: pe(o.ref, a.ref) };
  return u.cloneElement(n, i);
}
function Ee(...e) {
  let t = {};
  for (let n of e) {
    if (!n) continue;
    let r = n;
    for (let s of Object.keys(r)) {
      let o = r[s];
      if (o === void 0) continue;
      let a = t[s];
      s === "className" ? t[s] = [a, o].filter(Boolean).join(" ") : s === "style" ? t[s] = { ...a, ...o } : s === "ref" ? t[s] = pe(a, o) : ar(s) && typeof a == "function" && typeof o == "function" ? t[s] = lr(o, a) : t[s] = o;
    }
  }
  return t;
}
function or(e, t) {
  var r;
  let n = {};
  for (let s of Object.keys(e)) {
    let o = e[s], a = (r = t == null ? void 0 : t[s]) == null ? void 0 : r.call(t, o);
    if (a) {
      Object.assign(n, a);
      continue;
    }
    if (s === "slot") {
      n["data-slot"] = o;
      continue;
    }
    let i = `data-${String(s).replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}`;
    typeof o == "boolean" ? n[i] = o ? "" : void 0 : o != null && (n[i] = String(o));
  }
  return n;
}
function lr(e, t) {
  return function(n) {
    e(n), n.defaultPrevented || t(n);
  };
}
function ar(e) {
  return /^on[A-Z]/.test(e);
}
function pe(...e) {
  let t = e.filter(Boolean);
  if (t.length !== 0) return (n) => {
    for (let r of t) typeof r == "function" ? r(n) : r && (r.current = n);
  };
}
var ir = 8, cr = 64, ur = 0, we = 0.5, dr = 180, hr = /* @__PURE__ */ new Set(["ArrowDown", "ArrowUp", "End", "Home", "PageDown", "PageUp", " "]), ut = { start: !1, end: !1 }, fr = [], ye = { currentAnchorId: null, visibleMessageIds: fr };
function pr({ content: e, scrollEdgeThreshold: t, spacer: n, viewport: r }) {
  if (!r || !e) return ut;
  let s = De({ content: e, spacer: n, viewport: r });
  return { start: r.scrollTop > t, end: s - r.scrollTop - r.clientHeight > t };
}
function gr({ content: e, scrollMargin: t, scrollPreviousItemPeek: n, spacer: r, viewport: s, visibleMessageIds: o }) {
  if (!e || !s) return ye;
  let a = s.getBoundingClientRect(), i = a.top + t + n, c = typeof IntersectionObserver > "u", f = [], g = null;
  for (let v of fe(e, r)) {
    let h = v.dataset.messageId;
    if (!h) continue;
    let d = v.dataset.scrollAnchor === "true", p = d || c ? v.getBoundingClientRect() : null;
    (c && p ? p.bottom > i && p.top < a.bottom : o.has(h)) && f.push(h), d && p && p.top <= i + we && (g = h);
  }
  return f.length === 0 && g === null ? ye : { currentAnchorId: g, visibleMessageIds: f };
}
function fe(e, t) {
  return Array.from(e.children).filter((n) => n instanceof HTMLElement && n !== t);
}
function mr(e, t) {
  for (let n = t; n < e.length; n++) {
    let r = e[n];
    if ((r == null ? void 0 : r.dataset.scrollAnchor) === "true") return r;
  }
  return null;
}
function br(e, t) {
  for (let n of e) if (n.dataset.scrollAnchor === "true" && !t.has(n)) return n;
  return null;
}
function vr(e, t) {
  var r;
  let n = 0;
  for (let s = t; s < e.length; s++) if (((r = e[s]) == null ? void 0 : r.dataset.scrollAnchor) === "true" && (n += 1, n > 1)) return !0;
  return !1;
}
function _r(e) {
  for (let t = e.length - 1; t >= 0; t--) {
    let n = e[t];
    if ((n == null ? void 0 : n.dataset.scrollAnchor) === "true") return n;
  }
  return null;
}
function wr({ content: e, spacer: t, viewport: n }) {
  let r = n.getBoundingClientRect();
  for (let s of fe(e, t)) {
    if (!s.dataset.messageId) continue;
    let o = s.getBoundingClientRect();
    if (o.bottom > r.top && o.top < r.bottom) return s;
  }
  return null;
}
function yr({ align: e, element: t, scrollMargin: n, spacer: r, viewport: s }) {
  let o = dt(t, s), a = t.getBoundingClientRect().height, i = Sr(r);
  if (e === "center") {
    let c = Math.max(0, s.clientHeight - i.start - i.end);
    return o - i.start - (c - a) / 2 - n;
  }
  if (e === "end") return o - s.clientHeight + a + i.end + n;
  if (e === "nearest") {
    let c = o + a, f = s.scrollTop + i.start, g = s.scrollTop + s.clientHeight - i.end;
    return o >= f && c <= g ? s.scrollTop : o < f ? o - i.start - n : c - s.clientHeight + i.end + n;
  }
  return o - i.start - n;
}
function dt(e, t) {
  let n = e.getBoundingClientRect(), r = t.getBoundingClientRect();
  return n.top - r.top + t.scrollTop;
}
function ve(e, t) {
  return e.getBoundingClientRect().top - t.getBoundingClientRect().top;
}
function kr({ content: e, scrollTop: t, spacer: n, viewport: r }) {
  let s = De({ content: e, spacer: n, viewport: r });
  return t + r.clientHeight - s;
}
function De({ content: e, spacer: t, viewport: n }) {
  let r = fe(e, t), s = ht(e), o = n.getBoundingClientRect(), a = n.scrollTop, i = s.start + s.end;
  for (let c of r) {
    let f = c.getBoundingClientRect();
    i = Math.max(i, f.bottom - o.top + a + s.end);
  }
  return i;
}
function Cr(e) {
  return Math.max(0, e.scrollHeight - e.clientHeight);
}
function ht(e) {
  let t = window.getComputedStyle(e);
  return { end: Re(t.paddingBlockEnd || t.paddingBottom), start: Re(t.paddingBlockStart || t.paddingTop) };
}
function Sr(e) {
  let t = e == null ? void 0 : e.parentElement;
  return t ? ht(t) : { end: 0, start: 0 };
}
function Tr(e) {
  if (!e) return 0;
  let t = window.getComputedStyle(e), n = t.rowGap === "normal" ? t.gap : t.rowGap;
  return Re(n);
}
function Re(e) {
  if (!e) return 0;
  let t = Number.parseFloat(e);
  return Number.isFinite(t) ? t : 0;
}
function ft(e, t) {
  let n = e, r = /* @__PURE__ */ new Set();
  return { getSnapshot: () => n, hasListeners: () => r.size > 0, setSnapshot: (s) => {
    t(n, s) || (n = s, r.forEach((o) => o()));
  }, subscribe: (s, o, a) => {
    let i = r.size === 0;
    return r.add(s), i && (o == null || o()), () => {
      r.delete(s), r.size === 0 && (a == null || a());
    };
  } };
}
function Ke(e, t) {
  return ft(e, t);
}
function Fr() {
  return ft(ye, Rr);
}
function Er(e, t) {
  return e.start === t.start && e.end === t.end;
}
function Rr(e, t) {
  return e.currentAnchorId !== t.currentAnchorId || e.visibleMessageIds.length !== t.visibleMessageIds.length ? !1 : e.visibleMessageIds.every((n, r) => n === t.visibleMessageIds[r]);
}
function Ar({ autoScroll: e, defaultScrollPosition: t, scrollEdgeThreshold: n, scrollMargin: r, scrollPreviousItemPeek: s }) {
  let o = u.useRef(e), a = u.useRef(!1), i = u.useRef(null), c = u.useRef(!1), f = u.useRef(n), g = u.useRef(0), v = u.useRef(null), h = u.useRef(0), d = u.useRef(e ? "following-bottom" : "free-scrolling"), p = u.useRef(/* @__PURE__ */ new Map()), y = u.useRef(null), b = u.useRef(null), F = u.useRef(null), k = u.useRef(s), D = u.useRef(!0), j = u.useRef(null), I = u.useRef(r), N = u.useRef(null), E = u.useRef(0), L = u.useRef(0), q = u.useRef(null), te = u.useRef(null), Y = u.useRef(null), _ = u.useRef(null), S = u.useRef(null), R = u.useRef(null), B = u.useRef(null), M = u.useRef(null), P = u.useRef(null), x = u.useRef(/* @__PURE__ */ new Set()), G = u.useRef(/* @__PURE__ */ new WeakSet());
  return Y.current === null && (Y.current = Ke(t === "end" || t === "last-anchor", (re, W) => re === W)), _.current === null && (_.current = Ke(ut, Er)), P.current === null && (P.current = Fr()), o.current = e, f.current = n, I.current = r, k.current = s, { autoScrollRef: o, autoscrollingRef: a, autoscrollingTimeoutRef: S, streamingTurnRef: F, contentRef: i, defaultScrollPositionAppliedRef: c, firstItemRef: v, itemCountRef: g, lastScrollTopRef: h, messageElementsRef: p, modeRef: d, pendingScrollFrameRef: N, pendingScrollToMessageRef: y, prependRestoreRef: b, preserveScrollOnPrependRef: D, pendingDefaultScrollStore: Y.current, rootRef: j, scrollEdgeThresholdRef: f, scrollMarginRef: I, scrollPreviousItemPeekRef: k, spacerGapRef: E, spacerHeightRef: L, spacerRef: q, stateFrameRef: te, stateStore: _.current, viewportRef: R, visibilityFrameRef: B, visibilityObserverRef: M, visibilityStore: P.current, visibleMessageIdsRef: x, handledScrollAnchorsRef: G };
}
function pt(e) {
  e.pendingDefaultScrollStore.setSnapshot(!1);
}
function _e(e) {
  e.defaultScrollPositionAppliedRef.current = !0, pt(e);
}
function Br({ refs: e, commitScrollState: t, scheduleStateCommit: n, scheduleVisibilitySync: r }) {
  let { streamingTurnRef: s, autoScrollRef: o, autoscrollingRef: a, autoscrollingTimeoutRef: i, contentRef: c, itemCountRef: f, messageElementsRef: g, modeRef: v, pendingScrollToMessageRef: h, prependRestoreRef: d, scrollMarginRef: p, scrollPreviousItemPeekRef: y, spacerGapRef: b, spacerHeightRef: F, spacerRef: k, viewportRef: D } = e, j = u.useCallback((_) => {
    i.current !== null && (window.clearTimeout(i.current), i.current = null), a.current !== _ && (a.current = _, t()), _ && (i.current = window.setTimeout(() => {
      i.current = null, a.current = !1, t();
    }, dr));
  }, [t]), I = u.useCallback((_) => {
    let S = k.current;
    if (!S) return;
    let R = Math.max(0, Math.ceil(_));
    F.current !== R && (F.current = R, S.hidden = R === 0, S.style.height = `${R}px`, S.style.marginTop = R > 0 ? `${-b.current}px` : "");
  }, []), N = u.useCallback((_, { behavior: S = "auto", autoscrolling: R = !1 } = {}) => {
    let B = D.current;
    if (!B) return;
    let M = Math.max(0, _);
    if (Math.abs(B.scrollTop - M) <= we) {
      B.scrollTop = M, t();
      return;
    }
    R && j(!0), B.scrollTo({ top: M, behavior: S }), n();
  }, [t, n, j]), E = u.useCallback(({ behavior: _ = "auto" } = {}) => D.current ? (I(0), s.current = null, v.current = "free-scrolling", N(0, { behavior: _ }), r(), !0) : !1, [r, N, I]), L = u.useCallback(({ behavior: _ = "auto" } = {}) => {
    let S = D.current;
    return S ? (I(0), s.current = null, v.current = o.current ? "following-bottom" : "free-scrolling", N(Cr(S), { autoscrolling: !0, behavior: _ }), r(), !0) : !1;
  }, [r, N, I]), q = u.useCallback((_, { align: S = "start", behavior: R = "auto", scrollMargin: B = p.current } = {}, { keepPreviousPeek: M = !1 } = {}) => {
    let P = c.current, x = D.current;
    if (!P || !x || !P.contains(_)) return !1;
    let G = yr({ align: S, element: _, scrollMargin: M ? B + y.current : B, spacer: k.current, viewport: x }), re = kr({ content: P, scrollTop: G, spacer: k.current, viewport: x });
    return I(re), d.current = { element: _, viewportTop: ve(_, x) }, v.current = M ? "anchored-to-message" : "settling-jump", s.current = M ? _ : null, N(G, { behavior: R }), r(), !0;
  }, [r, N, I]), te = u.useCallback(() => {
    let _ = s.current;
    return !_ || !_.isConnected || v.current !== "anchored-to-message" ? !1 : q(_, { align: "start" }, { keepPreviousPeek: !0 });
  }, [q]), Y = u.useCallback((_, S) => {
    let R = g.current.get(_);
    return R ? (_e(e), q(R, S) ? (h.current = null, !0) : (h.current = { messageId: _, options: S }, !0)) : f.current === 0 ? (h.current = { messageId: _, options: S }, _e(e), !0) : !1;
  }, [q]);
  return { flushPendingScrollToMessage: u.useCallback(() => {
    let _ = h.current;
    if (!_) return !1;
    let S = g.current.get(_.messageId);
    return !S || !q(S, _.options) ? !1 : (h.current = null, _e(e), !0);
  }, [q]), reanchorToAnchoredMessage: te, scrollToElement: q, scrollToEnd: L, scrollToMessage: Y, scrollToStart: E };
}
function Qe(e, t) {
  return u.useCallback((n) => {
    e.current = n, n && t();
  }, [e, t]);
}
function Mr({ autoScroll: e = !1, defaultScrollPosition: t = "end", scrollEdgeThreshold: n = ir, scrollPreviousItemPeek: r = cr, scrollMargin: s = ur }) {
  let o = Ar({ autoScroll: e, defaultScrollPosition: t, scrollEdgeThreshold: n, scrollMargin: s, scrollPreviousItemPeek: r }), { streamingTurnRef: a, autoScrollRef: i, autoscrollingRef: c, autoscrollingTimeoutRef: f, contentRef: g, defaultScrollPositionAppliedRef: v, firstItemRef: h, itemCountRef: d, lastScrollTopRef: p, messageElementsRef: y, modeRef: b, pendingScrollFrameRef: F, pendingScrollToMessageRef: k, prependRestoreRef: D, preserveScrollOnPrependRef: j, pendingDefaultScrollStore: I, rootRef: N, scrollEdgeThresholdRef: E, scrollMarginRef: L, scrollPreviousItemPeekRef: q, spacerGapRef: te, spacerHeightRef: Y, spacerRef: _, stateFrameRef: S, stateStore: R, viewportRef: B, visibilityFrameRef: M, visibilityObserverRef: P, visibilityStore: x, visibleMessageIdsRef: G, handledScrollAnchorsRef: re } = o, W = u.useRef(t);
  W.current !== t && (W.current = t, v.current = !1);
  let Q = u.useCallback((m) => {
    let w = N.current, C = B.current, O = [m.start && "start", m.end && "end"].filter(Boolean).join(" "), ne = c.current;
    for (let V of [w, C]) V && (O ? V.setAttribute("data-scrollable", O) : V.removeAttribute("data-scrollable"), V.toggleAttribute("data-autoscrolling", ne));
  }, []), X = u.useCallback((m) => {
    var O;
    let w = ((O = B.current) == null ? void 0 : O.scrollTop) ?? 0, C = w < p.current - we;
    p.current = w, i.current && !m.end && b.current !== "settling-jump" && b.current !== "anchored-to-message" ? b.current = "following-bottom" : b.current === "following-bottom" && m.end && C && !c.current && (b.current = "free-scrolling");
  }, []), J = u.useCallback(() => {
    let m = pr({ content: g.current, scrollEdgeThreshold: E.current, spacer: _.current, viewport: B.current });
    X(m);
    let w = b.current === "following-bottom" ? { ...m, end: !1 } : m;
    Q(w), R.setSnapshot(w);
  }, [X, R, Q]), oe = u.useCallback(() => {
    S.current === null && (S.current = window.requestAnimationFrame(() => {
      S.current = null, J();
    }));
  }, [J]), A = u.useCallback(() => {
    x.hasListeners() && M.current === null && (M.current = window.requestAnimationFrame(() => {
      M.current = null, x.hasListeners() && x.setSnapshot(gr({ content: g.current, scrollMargin: L.current, scrollPreviousItemPeek: q.current, spacer: _.current, viewport: B.current, visibleMessageIds: G.current }));
    }));
  }, [x]), { flushPendingScrollToMessage: $, reanchorToAnchoredMessage: Z, scrollToElement: U, scrollToEnd: H, scrollToMessage: Ie, scrollToStart: me } = Br({ refs: o, commitScrollState: J, scheduleStateCommit: oe, scheduleVisibilitySync: A }), Ne = u.useCallback(() => {
    let m = D.current, w = B.current;
    if (!m || !w || !m.element.isConnected) return !1;
    let C = ve(m.element, w) - m.viewportTop;
    return Math.abs(C) <= we ? !1 : (w.scrollTop += C, m.viewportTop = ve(m.element, w), oe(), A(), !0);
  }, [oe, A]), ae = u.useCallback(() => {
    let m = g.current, w = B.current;
    if (!m || !w) {
      D.current = null;
      return;
    }
    let C = wr({ content: m, spacer: _.current, viewport: w });
    D.current = C ? { element: C, viewportTop: ve(C, w) } : null;
  }, []), Pe = u.useCallback(() => {
    F.current === null && (F.current = window.requestAnimationFrame(() => {
      F.current = null, $() && ae();
    }));
  }, [ae, $]), be = u.useCallback(() => {
    if (!t || v.current || d.current === 0) return !1;
    let m = !1;
    if (t === "last-anchor") {
      let w = g.current, C = B.current, O = w && C ? _r(fe(w, _.current)) : null;
      if (!w || !C || !O) m = H({ behavior: "auto" });
      else {
        let ne = dt(O, C);
        m = De({ content: w, spacer: _.current, viewport: C }) - ne <= C.clientHeight ? H({ behavior: "auto" }) : U(O, { align: "start" }, { keepPreviousPeek: !0 });
      }
    } else m = t === "end" ? H({ behavior: "auto" }) : me({ behavior: "auto" });
    return m ? (_e(o), !0) : !1;
  }, [t, U, H, me]), xe = u.useCallback(() => {
    let m = g.current;
    if (!m) return;
    let w = fe(m, _.current), C = d.current, O = h.current;
    d.current = w.length, h.current = w[0] ?? null, (() => {
      if ($()) return;
      if (C === 0) {
        if (be() || w.length > 0 && i.current && H({ behavior: "auto" })) return;
        J(), A();
        return;
      }
      let ne = O ? w.indexOf(O) : -1;
      if (j.current && ne > 0) {
        Ne();
        return;
      }
      if (w.length > C) {
        let V = mr(w, C);
        if (V) {
          if (i.current && b.current === "following-bottom" && vr(w, C)) {
            H({ behavior: "auto" });
            return;
          }
          U(V, { align: "start" }, { keepPreviousPeek: !0 }), re.current.add(V);
          return;
        }
      }
      if (w.length === C) {
        let V = br(w, re.current);
        if (V) {
          U(V, { align: "start" }, { keepPreviousPeek: !0 }), re.current.add(V);
          return;
        }
      }
      b.current === "following-bottom" && i.current ? H({ behavior: "auto" }) : (J(), A());
    })(), ae();
  }, [be, ae, J, $, Ne, A, U, H]), Le = u.useCallback(() => {
    if (b.current === "following-bottom" && i.current) {
      H({ behavior: "auto" });
      return;
    }
    let m = Y.current;
    if (Z()) {
      i.current && m > 0 && Y.current === 0 && H({ behavior: "auto" });
      return;
    }
    oe(), A();
  }, [Z, oe, A, H]), Oe = u.useCallback(() => {
    let m = B.current;
    if (!(!m || !x.hasListeners())) {
      if (typeof IntersectionObserver > "u") {
        A();
        return;
      }
      P.current || (P.current = new IntersectionObserver((w) => {
        for (let C of w) {
          let O = C.target.dataset.messageId;
          O && (C.isIntersecting ? G.current.add(O) : G.current.delete(O));
        }
        A();
      }, { root: m, rootMargin: `${-(L.current + q.current)}px 0px 0px 0px`, threshold: [0, 0.01, 0.5, 1] })), y.current.forEach((w) => {
        var C;
        (C = P.current) == null || C.observe(w);
      }), A();
    }
  }, [A, x]), qe = u.useCallback(() => {
    var m;
    M.current !== null && (window.cancelAnimationFrame(M.current), M.current = null), (m = P.current) == null || m.disconnect(), P.current = null, G.current.clear(), x.setSnapshot(ye);
  }, [x]), yt = u.useCallback((m, w, C) => {
    var O, ne, V;
    if (w) {
      y.current.set(m, w), (O = P.current) == null || O.observe(w), A(), ((ne = k.current) == null ? void 0 : ne.messageId) === m && Pe();
      return;
    }
    C && y.current.get(m) === C && (y.current.delete(m), G.current.delete(m), (V = P.current) == null || V.unobserve(C), A());
  }, [Pe, A]), We = u.useCallback(() => {
    (b.current === "following-bottom" || b.current === "anchored-to-message" || b.current === "settling-jump") && (a.current = null, b.current = "free-scrolling");
  }, []), $e = u.useCallback(() => Q(R.getSnapshot()), [R, Q]), He = Qe(N, $e), Ve = Qe(B, $e), ze = u.useCallback((m) => {
    g.current = m;
  }, []), Ge = u.useCallback((m) => {
    _.current = m, te.current = Tr((m == null ? void 0 : m.parentElement) ?? null);
  }, []), Ue = u.useCallback(() => {
    J(), A(), ae();
  }, [ae, J, A]), kt = u.useMemo(() => ({ handleContentChange: xe, handleResize: Le, observeVisibility: Oe, pendingDefaultScrollStore: I, preserveScrollOnPrependRef: j, scrollToEnd: H, scrollToMessage: Ie, scrollToStart: me, setContentElement: ze, setRootElement: He, setSpacerElement: Ge, setViewportElement: Ve, stateStore: R, syncAfterScroll: Ue, unobserveVisibility: qe, userScrollIntent: We, viewportRef: B, visibilityStore: x }), [xe, Le, Oe, I, H, Ie, me, ze, He, Ge, Ve, R, Ue, qe, We, x]);
  return u.useLayoutEffect(() => {
    be() || d.current === 0 && pt(o);
  }, [be]), u.useEffect(() => () => {
    var m;
    S.current !== null && (window.cancelAnimationFrame(S.current), S.current = null), M.current !== null && (window.cancelAnimationFrame(M.current), M.current = null), f.current !== null && (window.clearTimeout(f.current), f.current = null), F.current !== null && (window.cancelAnimationFrame(F.current), F.current = null), (m = P.current) == null || m.disconnect(), P.current = null;
  }, []), u.useLayoutEffect(() => {
    if (e && b.current === "following-bottom" && d.current > 0) {
      H({ behavior: "auto" });
      return;
    }
    J();
  }, [e, J, H]), { context: kt, registerMessage: yt };
}
function Dr(e) {
  let t = u.useRef(e);
  return t.current = e, t;
}
var gt = u.createContext(null), mt = u.createContext(null);
function ge() {
  let e = u.useContext(gt);
  if (!e) throw new Error("useMessageScroller must be used within a MessageScroller.");
  return e;
}
function Ir() {
  let e = u.useContext(mt);
  if (!e) throw new Error("MessageScrollerItem must be used within a MessageScroller.");
  return e;
}
function Nr({ autoScroll: e = !1, children: t, defaultScrollPosition: n = "end", scrollEdgeThreshold: r, scrollPreviousItemPeek: s, scrollMargin: o }) {
  let { context: a, registerMessage: i } = Mr({ autoScroll: e, defaultScrollPosition: n, scrollEdgeThreshold: r, scrollPreviousItemPeek: s, scrollMargin: o });
  return l(gt.Provider, { value: a, children: l(mt.Provider, { value: i, children: t }) });
}
function bt() {
  let { pendingDefaultScrollStore: e } = ge();
  return u.useSyncExternalStore(e.subscribe, e.getSnapshot, e.getSnapshot);
}
function Pr({ children: e, ...t }) {
  let { setRootElement: n } = ge(), r = bt();
  return l("div", { ref: n, ...t, ...r ? { "data-pending-scroll": "" } : null, children: e });
}
function xr({ "aria-label": e, children: t, onKeyDown: n, onScroll: r, onTouchMove: s, onWheel: o, preserveScrollOnPrepend: a = !0, ref: i, role: c, tabIndex: f, ...g }) {
  let { handleResize: v, preserveScrollOnPrependRef: h, setViewportElement: d, syncAfterScroll: p, userScrollIntent: y, viewportRef: b } = ge(), F = bt();
  h.current = a;
  let k = u.useCallback((E) => {
    var L;
    d(E), (L = pe(i)) == null || L(E);
  }, [i, d]);
  function D(E) {
    p(), r == null || r(E);
  }
  function j(E) {
    y(), o == null || o(E);
  }
  function I(E) {
    y(), s == null || s(E);
  }
  function N(E) {
    hr.has(E.key) && y(), n == null || n(E);
  }
  return u.useEffect(() => {
    let E = b.current;
    if (!E || typeof ResizeObserver > "u") return;
    let L = 0, q = new ResizeObserver(() => {
      window.cancelAnimationFrame(L), L = window.requestAnimationFrame(v);
    });
    return q.observe(E), () => {
      window.cancelAnimationFrame(L), q.disconnect();
    };
  }, [v, b]), l("div", { ref: k, role: c ?? "region", "aria-label": e ?? "Messages", tabIndex: f ?? 0, onKeyDown: N, onScroll: D, onTouchMove: I, onWheel: j, ...g, ...F ? { "data-pending-scroll": "" } : null, children: t });
}
function Lr({ "aria-relevant": e, children: t, ref: n, role: r, spacerClassName: s, ...o }) {
  let { handleContentChange: a, handleResize: i, setContentElement: c, setSpacerElement: f } = ge(), g = u.useRef(null), v = u.useCallback((h) => {
    var d;
    g.current = h, c(h), (d = pe(n)) == null || d(h);
  }, [n, c]);
  return u.useLayoutEffect(() => {
    let h = g.current;
    if (!h || (a(), typeof MutationObserver > "u")) return;
    let d = new MutationObserver(() => {
      a();
    });
    return d.observe(h, { childList: !0 }), () => d.disconnect();
  }, [a]), u.useEffect(() => {
    let h = g.current;
    if (!h || typeof ResizeObserver > "u") return;
    let d = 0, p = new ResizeObserver(() => {
      window.cancelAnimationFrame(d), d = window.requestAnimationFrame(i);
    });
    return p.observe(h), () => {
      window.cancelAnimationFrame(d), p.disconnect();
    };
  }, [i]), T("div", { ref: v, role: r ?? "log", "aria-relevant": e ?? "additions", ...o, children: [t, l("div", { ref: f, "aria-hidden": "true", "data-message-scroller-spacer": "", hidden: !0, className: s })] });
}
function Or({ messageId: e, ref: t, scrollAnchor: n = !1, ...r }) {
  let s = Ir(), o = u.useRef(null), a = u.useCallback((i) => {
    var f;
    let c = o.current;
    o.current = i, e && s(e, i, c), (f = pe(t)) == null || f(i);
  }, [e, t, s]);
  return l("div", { ref: a, "data-message-id": e, "data-scroll-anchor": n ? "true" : "false", ...r });
}
function qr({ behavior: e = "smooth", children: t, direction: n = "end", onClick: r, render: s, tabIndex: o, type: a = "button", ...i }) {
  let { scrollToEnd: c, scrollToStart: f, stateStore: g } = ge(), v = Dr(r), h = u.useCallback((b) => g.subscribe(b), [g]), d = u.useCallback(() => {
    let b = g.getSnapshot();
    return n === "start" ? b.start : b.end;
  }, [n, g]), p = u.useSyncExternalStore(h, d, d), y = u.useCallback((b) => {
    var F;
    p && ((F = v.current) == null || F.call(v, b), b.defaultPrevented || (b.currentTarget.blur(), n === "start" ? f({ behavior: e }) : c({ behavior: e })));
  }, [e, n, p, v, c, f]);
  return sr({ defaultTagName: "button", props: Ee({ type: a, inert: !p, tabIndex: p ? o : -1, children: t ?? T("span", { children: ["Scroll to ", n] }), onClick: y }, i), render: s, state: { active: p, direction: n }, stateAttributesMapping: { active: (b) => ({ "data-active": b ? "true" : "false" }) } });
}
var ue = { Provider: Nr, Root: Pr, Viewport: xr, Content: Lr, Item: Or, Button: qr };
function vt(e) {
  var t, n, r = "";
  if (typeof e == "string" || typeof e == "number") r += e;
  else if (typeof e == "object") if (Array.isArray(e)) {
    var s = e.length;
    for (t = 0; t < s; t++) e[t] && (n = vt(e[t])) && (r && (r += " "), r += n);
  } else for (n in e) e[n] && (r && (r += " "), r += n);
  return r;
}
function Wr() {
  for (var e, t, n = 0, r = "", s = arguments.length; n < s; n++) (e = arguments[n]) && (t = vt(e)) && (r && (r += " "), r += t);
  return r;
}
function de(...e) {
  return Wr(e);
}
function $r(e) {
  return /* @__PURE__ */ l(ue.Provider, { ...e });
}
function Hr({
  className: e,
  ...t
}) {
  return /* @__PURE__ */ l(
    ue.Root,
    {
      "data-slot": "message-scroller",
      className: de("msg-scroller-root", e),
      ...t
    }
  );
}
function Vr({
  className: e,
  ...t
}) {
  return /* @__PURE__ */ l(
    ue.Viewport,
    {
      "data-slot": "message-scroller-viewport",
      className: de("msg-scroller-viewport", e),
      ...t
    }
  );
}
function zr({
  className: e,
  ...t
}) {
  return /* @__PURE__ */ l(
    ue.Content,
    {
      "data-slot": "message-scroller-content",
      className: de("msg-scroller-content", e),
      ...t
    }
  );
}
function Xe({
  className: e,
  scrollAnchor: t = !1,
  ...n
}) {
  return /* @__PURE__ */ l(
    ue.Item,
    {
      "data-slot": "message-scroller-item",
      scrollAnchor: t,
      className: de("msg-scroller-item", e),
      ...n
    }
  );
}
function Gr({
  direction: e = "end",
  className: t,
  children: n,
  ...r
}) {
  return /* @__PURE__ */ l(
    ue.Button,
    {
      "data-slot": "message-scroller-button",
      direction: e,
      className: de("msg-scroller-btn", t),
      ...r,
      children: n ?? /* @__PURE__ */ T(ke, { children: [
        /* @__PURE__ */ l(
          Ot,
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
const Ur = () => /* @__PURE__ */ T("div", { className: "chat-empty-row", children: [
  /* @__PURE__ */ l(
    "div",
    {
      className: "avatar-circle avatar-circle--mt",
      "aria-hidden": "true",
      children: /* @__PURE__ */ l(it, { size: 15 })
    }
  ),
  /* @__PURE__ */ l("div", { className: "chat-empty-bubble", children: /* @__PURE__ */ l("p", { children: "Hello — I am the VPS Veritas assistant. Ask about reports, sample status, registration, or support, or choose a question below the text box." }) })
] });
function ee(e) {
  if (!e) return [];
  const t = /(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|https?:\/\/[^\s]+)/g;
  return e.split(t).map((r, s) => {
    if (!r) return null;
    const o = r.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (o) {
      const a = o[1], i = o[2], c = /^https?:\/\//i.test(i);
      return /* @__PURE__ */ l(
        "a",
        {
          href: i,
          target: c ? "_blank" : void 0,
          rel: c ? "noopener noreferrer" : void 0,
          className: "md-link",
          children: a
        },
        s
      );
    }
    return r.startsWith("**") && r.endsWith("**") && r.length >= 4 ? /* @__PURE__ */ l("strong", { children: r.slice(2, -2) }, s) : r.startsWith("*") && r.endsWith("*") && r.length >= 2 ? /* @__PURE__ */ l("em", { children: r.slice(1, -1) }, s) : r.startsWith("`") && r.endsWith("`") && r.length >= 2 ? /* @__PURE__ */ l("code", { className: "md-code", children: r.slice(1, -1) }, s) : /^https?:\/\//i.test(r) ? /* @__PURE__ */ l(
      "a",
      {
        href: r,
        target: "_blank",
        rel: "noopener noreferrer",
        className: "md-link",
        children: r
      },
      s
    ) : /* @__PURE__ */ l(Ae.Fragment, { children: r }, s);
  });
}
function jr(e) {
  const t = e.replace(/\r\n/g, `
`).split(`
`), n = [];
  let r = 0;
  for (; r < t.length; ) {
    const o = t[r].trim();
    if (!o) {
      r++;
      continue;
    }
    if (o.startsWith("```")) {
      const c = o.slice(3).trim(), f = [];
      for (r++; r < t.length && !t[r].trim().startsWith("```"); )
        f.push(t[r]), r++;
      r < t.length && t[r].trim().startsWith("```") && r++, n.push({ type: "code", lang: c, code: f.join(`
`) });
      continue;
    }
    if (/^(---|___|\*\*\*)$/.test(o)) {
      n.push({ type: "hr" }), r++;
      continue;
    }
    const a = o.match(/^(#{1,4})\s+(.*)$/);
    if (a) {
      n.push({
        type: "h",
        level: a[1].length,
        content: a[2]
      }), r++;
      continue;
    }
    if (o.startsWith(">")) {
      const c = [];
      for (; r < t.length && t[r].trim().startsWith(">"); )
        c.push(t[r].trim().replace(/^>\s?/, "")), r++;
      n.push({ type: "quote", lines: c });
      continue;
    }
    if (/^[-*]\s+/.test(o)) {
      const c = [];
      for (; r < t.length && /^[-*]\s+/.test(t[r].trim()); )
        c.push(t[r].trim().replace(/^[-*]\s+/, "")), r++;
      n.push({ type: "ul", items: c });
      continue;
    }
    if (/^\d+\.\s+/.test(o)) {
      const c = [];
      for (; r < t.length && /^\d+\.\s+/.test(t[r].trim()); )
        c.push(t[r].trim().replace(/^\d+\.\s+/, "")), r++;
      n.push({ type: "ol", items: c });
      continue;
    }
    if (o.startsWith("|") && o.endsWith("|")) {
      const c = [];
      for (; r < t.length && t[r].trim().startsWith("|") && t[r].trim().endsWith("|"); )
        c.push(t[r].trim()), r++;
      if (c.length >= 2) {
        const f = (d) => d.slice(1, -1).split("|").map((p) => p.trim()), g = f(c[0]), v = c[1].includes("-") ? 2 : 1, h = c.slice(v).map(f);
        n.push({ type: "table", headers: g, rows: h });
        continue;
      }
    }
    const i = [];
    for (; r < t.length && t[r].trim() && !t[r].trim().startsWith("```") && !/^(#{1,4})\s+/.test(t[r].trim()) && !/^[-*]\s+/.test(t[r].trim()) && !/^\d+\.\s+/.test(t[r].trim()) && !t[r].trim().startsWith(">") && !/^(---|___|\*\*\*)$/.test(t[r].trim()); )
      i.push(t[r].trim()), r++;
    i.length > 0 && n.push({ type: "p", lines: i });
  }
  return n;
}
const Yr = ({ text: e }) => {
  if (!e) return null;
  const t = jr(e);
  return /* @__PURE__ */ l("div", { className: "md-content", children: t.map((n, r) => {
    switch (n.type) {
      case "h":
        return n.level === 1 ? /* @__PURE__ */ l("h2", { className: "md-h1", children: ee(n.content) }, r) : n.level === 2 ? /* @__PURE__ */ l("h3", { className: "md-h2", children: ee(n.content) }, r) : n.level === 3 ? /* @__PURE__ */ l("h4", { className: "md-h3", children: ee(n.content) }, r) : /* @__PURE__ */ l("h5", { className: "md-h4", children: ee(n.content) }, r);
      case "ul":
        return /* @__PURE__ */ l("ul", { className: "md-ul", children: n.items.map((s, o) => /* @__PURE__ */ l("li", { className: "md-li", children: ee(s) }, o)) }, r);
      case "ol":
        return /* @__PURE__ */ l("ol", { className: "md-ol", children: n.items.map((s, o) => /* @__PURE__ */ l("li", { className: "md-li", children: ee(s) }, o)) }, r);
      case "code":
        return /* @__PURE__ */ l("pre", { className: "md-pre", children: /* @__PURE__ */ l("code", { children: n.code }) }, r);
      case "quote":
        return /* @__PURE__ */ l("blockquote", { className: "md-quote", children: n.lines.map((s, o) => /* @__PURE__ */ l("p", { children: ee(s) }, o)) }, r);
      case "hr":
        return /* @__PURE__ */ l("hr", { className: "md-hr" }, r);
      case "table":
        return /* @__PURE__ */ l("div", { className: "md-table-wrap", children: /* @__PURE__ */ T("table", { className: "md-table", children: [
          /* @__PURE__ */ l("thead", { children: /* @__PURE__ */ l("tr", { children: n.headers.map((s, o) => /* @__PURE__ */ l("th", { children: ee(s) }, o)) }) }),
          /* @__PURE__ */ l("tbody", { children: n.rows.map((s, o) => /* @__PURE__ */ l("tr", { children: s.map((a, i) => /* @__PURE__ */ l("td", { children: ee(a) }, i)) }, o)) })
        ] }) }, r);
      case "p":
      default:
        return /* @__PURE__ */ l("p", { className: "md-p", children: n.lines.map((s, o) => /* @__PURE__ */ T(Ae.Fragment, { children: [
          ee(s),
          o < n.lines.length - 1 && /* @__PURE__ */ l("br", {})
        ] }, o)) }, r);
    }
  }) });
}, Jr = ({ className: e, text: t }) => /* @__PURE__ */ l(
  "div",
  {
    className: de("typing-indicator-container", e),
    role: "status",
    "aria-label": "Assistant is preparing a reply",
    children: /* @__PURE__ */ l("div", { className: "typing-progress-pill", children: /* @__PURE__ */ l("span", { className: "typing-progress-text", children: t || "Retrieving knowledge & generating answer ..." }) })
  }
), Zr = ({
  status: e = "complete",
  progressText: t,
  sourcesCount: n = 5,
  durationMs: r = 1800
}) => {
  const s = e === "pending", [o, a] = K(s), [i, c] = K(0);
  ie(() => {
    if (!s) return;
    a(!0);
    const g = Date.now(), v = setInterval(() => {
      c(Number(((Date.now() - g) / 1e3).toFixed(1)));
    }, 100);
    return () => clearInterval(v);
  }, [s]), ie(() => {
    s || a(!1);
  }, [s]);
  const f = s ? `${i}s` : `${(r / 1e3).toFixed(1)}s`;
  return /* @__PURE__ */ l("div", { className: `agent-reasoning-container${s ? " agent-reasoning--active" : ""}`, children: /* @__PURE__ */ l(
    "div",
    {
      className: "agent-reasoning-header",
      "aria-expanded": o,
      children: /* @__PURE__ */ T("div", { className: "agent-reasoning-header-left", children: [
        /* @__PURE__ */ l(
          $t,
          {
            size: 13,
            className: `agent-reasoning-brain-icon${s ? " agent-reasoning-brain--pulse" : ""}`
          }
        ),
        /* @__PURE__ */ l("span", { className: "agent-reasoning-title", children: s ? `Thinking (${f})...` : `Thought for ${f} ` })
      ] })
    }
  ) });
};
function Kr(e) {
  return e === "create_ticket" ? "Support ticket processed" : e === "get_customer" ? "Account verified" : e === "get_ticket" ? "Ticket status loaded" : "Information retrieved";
}
function Qr({ toolCalls: e }) {
  return e.length ? /* @__PURE__ */ l("div", { className: "tool-badges", children: e.map((t, n) => /* @__PURE__ */ l(
    "span",
    {
      className: "tool-badge",
      children: Kr(t.toolName)
    },
    `${t.toolName}-${n}`
  )) }) : null;
}
const Xr = ({ message: e }) => {
  var c;
  const t = Me();
  t == null || t.hideInspectSources, t == null || t.showGroundedSources;
  const n = e.role === "user", r = e.status === "error", s = e.status === "pending", o = e.id === "welcome-default" || e.id.startsWith("welcome") || e.id === "welcome", a = !!(s || e.sources && e.sources.length > 0 || e.toolCalls && e.toolCalls.length > 0 || e.usage);
  return /* @__PURE__ */ T("div", { className: `msg-row${n ? " msg-row--user" : ""}`, children: [
    !n && /* @__PURE__ */ l(
      "div",
      {
        className: "avatar-circle avatar-circle--mt",
        "aria-hidden": "true",
        children: /* @__PURE__ */ l(it, { size: 15 })
      }
    ),
    /* @__PURE__ */ T("div", { className: `msg-col${n ? " msg-col--user" : ""}`, children: [
      /* @__PURE__ */ T(
        "div",
        {
          className: n ? "msg-bubble msg-bubble--user" : r ? "msg-bubble msg-bubble--error" : "msg-bubble msg-bubble--bot",
          children: [
            !n && !r && !o && a && /* @__PURE__ */ l(
              Zr,
              {
                status: s ? "pending" : "complete",
                progressText: e.progressText,
                sourcesCount: ((c = e.sources) == null ? void 0 : c.length) || 5
              }
            ),
            s ? /* @__PURE__ */ l(Jr, { text: e.progressText }) : n ? /* @__PURE__ */ l("p", { className: "msg-user-pre", children: e.content }) : /* @__PURE__ */ l("div", { className: "msg-content-wrapper", children: /* @__PURE__ */ l(Yr, { text: e.content }) }),
            e.toolCalls ? /* @__PURE__ */ l(Qr, { toolCalls: e.toolCalls }) : null
          ]
        }
      ),
      n && e.status !== "error" && /* @__PURE__ */ l(Ht, { size: 13, className: "msg-tick", "aria-hidden": "true" })
    ] })
  ] });
}, en = () => {
  const { messages: e, status: t, showSuggestions: n } = Ce();
  return /* @__PURE__ */ l(
    $r,
    {
      autoScroll: !0,
      defaultScrollPosition: "last-anchor",
      scrollPreviousItemPeek: 64,
      children: /* @__PURE__ */ T(Hr, { children: [
        /* @__PURE__ */ l(Vr, { "aria-label": "Chat messages", children: /* @__PURE__ */ T(zr, { "aria-busy": t === "awaiting" || t === "connecting", children: [
          e.length === 0 && /* @__PURE__ */ l(Xe, { messageId: "welcome", children: /* @__PURE__ */ l(Ur, {}) }),
          e.map((s) => /* @__PURE__ */ l(
            Xe,
            {
              messageId: s.id,
              scrollAnchor: s.role === "user",
              children: /* @__PURE__ */ l(Xr, { message: s })
            },
            s.id
          ))
        ] }) }),
        /* @__PURE__ */ l(Gr, {})
      ] })
    }
  );
}, tn = () => {
  const { pendingTicket: e, ticketBusy: t, userContext: n, confirmTicket: r, cancelTicket: s } = Ce(), o = !n.customerId && !n.email, [a, i] = K("");
  return e ? /* @__PURE__ */ T(
    "div",
    {
      className: "ticket-card",
      role: "region",
      "aria-label": "Create support ticket",
      children: [
        /* @__PURE__ */ l("h3", { className: "ticket-card-title", children: "Create support ticket?" }),
        /* @__PURE__ */ l("p", { className: "ticket-card-desc", children: "I can open a support request for you. Nothing is created until you confirm." }),
        /* @__PURE__ */ l("p", { className: "ticket-card-body", children: e.description }),
        o && /* @__PURE__ */ T("label", { className: "ticket-id-label", children: [
          "Customer ID or email",
          /* @__PURE__ */ l(
            "input",
            {
              value: a,
              onChange: (c) => i(c.target.value),
              className: "ticket-id-input",
              placeholder: "CUST-1001 or you@company.com",
              autoComplete: "email"
            }
          )
        ] }),
        /* @__PURE__ */ T("div", { className: "ticket-actions", children: [
          /* @__PURE__ */ l(
            "button",
            {
              type: "button",
              onClick: s,
              disabled: t,
              className: "ticket-cancel-btn",
              children: "Cancel"
            }
          ),
          /* @__PURE__ */ l(
            "button",
            {
              type: "button",
              onClick: () => void r(a),
              disabled: t || o && !a.trim(),
              className: "ticket-confirm-btn",
              children: t ? "Creating…" : "Create ticket"
            }
          )
        ] })
      ]
    }
  ) : null;
}, _t = ({
  className: e,
  onClose: t,
  showMinimize: n,
  title: r,
  subtitle: s,
  envStage: o,
  envPulse: a = !0
}) => {
  const { sendMessage: i, status: c, error: f, resetConversation: g, retryLast: v, pendingTicket: h } = Ce(), d = c === "awaiting" || c === "connecting" || !!h;
  return /* @__PURE__ */ T(
    "section",
    {
      className: `chat-panel${e ? ` ${e}` : ""}`,
      "aria-label": "VPS AI Assistant",
      children: [
        /* @__PURE__ */ l(
          Xt,
          {
            title: r,
            subtitle: s,
            onClose: t,
            onReset: () => void g(),
            showMinimize: n,
            envStage: o,
            envPulse: a
          }
        ),
        /* @__PURE__ */ l("div", { className: "chat-panel-body", children: /* @__PURE__ */ l(en, {}) }),
        f && c === "error" && /* @__PURE__ */ l(Nt, { message: f, onRetry: () => void v() }),
        /* @__PURE__ */ l(tn, {}),
        /* @__PURE__ */ l(
          nr,
          {
            onSend: (p) => void i(p),
            disabled: d
          }
        )
      ]
    }
  );
}, rn = ({
  open: e,
  onClose: t,
  envStage: n,
  envPulse: r = !0
}) => e ? /* @__PURE__ */ l(
  "div",
  {
    id: "vps-chatbot-widget-panel",
    className: "widget-panel",
    children: /* @__PURE__ */ l(
      _t,
      {
        onClose: t,
        showMinimize: !0,
        title: "VPS AI Assistant",
        envStage: n,
        envPulse: r
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
    className: "widget-trigger-btn",
    children: e ? /* @__PURE__ */ l(Jt, { size: 22 }) : /* @__PURE__ */ l(ct, { size: 24 })
  }
), et = ({
  defaultOpen: e = !1,
  open: t,
  onOpenChange: n,
  envStage: r,
  envPulse: s = !0
}) => {
  const [o, a] = K(e), i = t ?? o, c = (f) => {
    n == null || n(f), t === void 0 && a(f);
  };
  return /* @__PURE__ */ T(ke, { children: [
    /* @__PURE__ */ l(
      rn,
      {
        open: i,
        onClose: () => c(!1),
        envStage: r,
        envPulse: s
      }
    ),
    /* @__PURE__ */ l(nn, { open: i, onToggle: () => c(!i) })
  ] });
}, pn = ({
  apiBaseUrl: e,
  apiUrl: t,
  proxyUrl: n,
  userContext: r,
  role: s,
  roleId: o,
  client: a,
  welcomeMessage: i,
  suggestions: c,
  disableSuggestions: f,
  initialMessage: g,
  hideInspectSources: v,
  showGroundedSources: h,
  ...d
}) => {
  const p = Me(), y = e ?? t ?? n;
  return !!p && (!y || ce(y) === ce(p == null ? void 0 : p.apiBaseUrl)) && !r && s === void 0 && o === void 0 && a === void 0 && i === void 0 && !c && f === void 0 && !g && v === void 0 && h === void 0 ? /* @__PURE__ */ l(et, { ...d }) : /* @__PURE__ */ l(
    lt,
    {
      apiBaseUrl: y,
      userContext: r,
      role: s,
      roleId: o,
      client: a,
      welcomeMessage: i,
      suggestions: c,
      disableSuggestions: f,
      initialMessage: g,
      hideInspectSources: v,
      showGroundedSources: h,
      children: /* @__PURE__ */ l(et, { ...d })
    }
  );
}, sn = ({
  open: e,
  onClose: t,
  subtitle: n,
  title: r,
  envStage: s,
  envPulse: o = !0
}) => /* @__PURE__ */ T(ke, { children: [
  /* @__PURE__ */ l(
    "div",
    {
      className: `embedded-overlay ${e ? "embedded-overlay--open" : "embedded-overlay--closed"}`,
      hidden: !e,
      onClick: t,
      "aria-hidden": "true"
    }
  ),
  /* @__PURE__ */ l(
    "aside",
    {
      id: "vps-embedded-chat-panel",
      className: `embedded-panel ${e ? "embedded-panel--open" : "embedded-panel--closed"}`,
      "aria-hidden": !e,
      children: e && /* @__PURE__ */ l(
        _t,
        {
          onClose: t,
          title: r || "VPS AI Assistant",
          subtitle: n,
          envStage: s,
          envPulse: o
        }
      )
    }
  )
] }), on = 5, Te = 8, wt = "vps-embedded-assistant-top";
function ln(e, t, n) {
  return Math.min(n, Math.max(t, e));
}
function tt(e, t) {
  const n = Math.max(
    Te,
    window.innerHeight - t - Te
  );
  return ln(e, Te, n);
}
function an() {
  try {
    const e = window.localStorage.getItem(wt);
    if (!e) return null;
    const t = Number(e);
    return Number.isFinite(t) ? t : null;
  } catch {
    return null;
  }
}
function cn(e) {
  try {
    window.localStorage.setItem(wt, String(e));
  } catch {
  }
}
const un = ({
  onOpen: e
}) => {
  const t = se(null), n = se({
    pointerId: null,
    startY: 0,
    startTop: 0,
    moved: !1
  }), [r, s] = K(
    () => typeof window > "u" ? null : an()
  ), o = se(r), a = se(!1), [i, c] = K(!1);
  ie(() => {
    o.current = r;
  }, [r]), ie(() => {
    const h = t.current;
    if (!h) return;
    const d = () => {
      s((p) => {
        const y = p ?? Math.round(window.innerHeight / 2 - h.offsetHeight / 2), b = tt(y, h.offsetHeight);
        return o.current = b, b;
      });
    };
    return d(), window.addEventListener("resize", d), () => window.removeEventListener("resize", d);
  }, []);
  const f = (h) => {
    if (h.button !== 0) return;
    const d = h.currentTarget, p = d.getBoundingClientRect();
    n.current = {
      pointerId: h.pointerId,
      startY: h.clientY,
      startTop: p.top,
      moved: !1
    };
    try {
      d.setPointerCapture(h.pointerId);
    } catch {
    }
  }, g = (h) => {
    if (n.current.pointerId !== h.pointerId) return;
    const d = h.clientY - n.current.startY;
    if (!n.current.moved && Math.abs(d) < on) return;
    n.current.moved = !0, c(!0);
    const p = tt(
      n.current.startTop + d,
      h.currentTarget.offsetHeight
    );
    o.current = p, s(p);
  }, v = (h) => {
    var p, y;
    if (n.current.pointerId !== h.pointerId) return;
    try {
      (y = (p = h.currentTarget).hasPointerCapture) != null && y.call(p, h.pointerId) && h.currentTarget.releasePointerCapture(h.pointerId);
    } catch {
    }
    const d = n.current.moved;
    n.current.pointerId = null, n.current.moved = !1, c(!1), d && (a.current = !0, o.current != null && cn(o.current));
  };
  return /* @__PURE__ */ T(
    "button",
    {
      ref: t,
      type: "button",
      onPointerDown: f,
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
        top: r ?? "50%",
        transform: r == null ? "translateY(-50%)" : void 0
      },
      children: [
        /* @__PURE__ */ l(ct, { size: 16 }),
        "Assistant"
      ]
    }
  );
}, rt = ({
  defaultOpen: e = !1,
  open: t,
  onOpenChange: n,
  showTrigger: r = !0,
  envStage: s,
  envPulse: o = !0
}) => {
  const [a, i] = K(e), c = t ?? a, f = (g) => {
    n == null || n(g), t === void 0 && i(g);
  };
  return /* @__PURE__ */ T(ke, { children: [
    r && !c && /* @__PURE__ */ l(un, { onOpen: () => f(!0) }),
    /* @__PURE__ */ l(
      sn,
      {
        open: c,
        onClose: () => f(!1),
        envStage: s,
        envPulse: o
      }
    )
  ] });
}, gn = ({
  apiBaseUrl: e,
  apiUrl: t,
  proxyUrl: n,
  userContext: r,
  role: s,
  roleId: o,
  client: a,
  welcomeMessage: i,
  suggestions: c,
  disableSuggestions: f,
  initialMessage: g,
  hideInspectSources: v,
  showGroundedSources: h,
  ...d
}) => {
  const p = Me(), y = e ?? t ?? n;
  return !!p && (!y || ce(y) === ce(p == null ? void 0 : p.apiBaseUrl)) && !r && s === void 0 && o === void 0 && a === void 0 && i === void 0 && !c && f === void 0 && !g && v === void 0 && h === void 0 ? /* @__PURE__ */ l(rt, { ...d }) : /* @__PURE__ */ l(
    lt,
    {
      apiBaseUrl: y,
      userContext: r,
      role: s,
      roleId: o,
      client: a,
      welcomeMessage: i,
      suggestions: c,
      disableSuggestions: f,
      initialMessage: g,
      hideInspectSources: v,
      showGroundedSources: h,
      children: /* @__PURE__ */ l(rt, { ...d })
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
  _t as ChatPanel,
  lt as ChatProvider,
  pn as ChatbotWidget,
  mn as ColorPalette,
  gn as EmbeddedChatbot,
  Se as buildApiUrl,
  fn as chatApi,
  ot as createChatApi,
  ce as resolveApiBaseUrl,
  Mt as useChatContext,
  Ce as useChatbot,
  Me as useOptionalChatContext
};
