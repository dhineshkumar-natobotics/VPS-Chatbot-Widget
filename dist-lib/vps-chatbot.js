import { jsx as l, jsxs as y, Fragment as Le } from "react/jsx-runtime";
import * as d from "react";
import le, { createContext as Et, useContext as ct, useMemo as Fe, useState as J, useRef as te, useCallback as de, forwardRef as ut, createElement as Ge, useEffect as Te } from "react";
const At = {};
function ye(e) {
  return e != null && e.trim() !== "" ? e.trim().replace(/\/+$/, "") : String("").trim().replace(/\/+$/, "");
}
function Oe(e, t) {
  const n = ye(e);
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
function Ze(e) {
  return e && typeof e == "object" && "data" in e && e.success !== !1 ? e.data : e;
}
function et(e, t, n) {
  var o, a, i;
  const r = e, s = (o = r == null ? void 0 : r.error) == null ? void 0 : o.message;
  return s && !It(s) ? {
    code: (a = r == null ? void 0 : r.error) == null ? void 0 : a.code,
    message: s,
    requestId: (i = r == null ? void 0 : r.error) == null ? void 0 : i.request_id
  } : n >= 500 ? { message: "I couldn't process that request right now." } : n === 0 ? { message: "Something went wrong while connecting. Please try again." } : { message: t };
}
function It(e) {
  return /traceback|sql|exception|stack|api[_ ]?key|password/i.test(e);
}
function $e(e) {
  return {
    chunkId: e.chunk_id,
    source: e.source,
    score: e.score,
    title: e.title,
    snippet: e.snippet
  };
}
function He(e) {
  return {
    toolName: e.tool_name,
    arguments: e.arguments ?? {},
    result: e.result ?? {}
  };
}
function ze(e) {
  return {
    model: e.model,
    promptTokens: e.prompt_tokens,
    completionTokens: e.completion_tokens,
    totalTokens: e.total_tokens
  };
}
function Nt(e) {
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
async function We(e) {
  const t = await e.text();
  if (!t) return {};
  try {
    return JSON.parse(t);
  } catch {
    return {};
  }
}
function dt(e) {
  const t = ye(e);
  async function n(r, s) {
    let o;
    const a = Oe(t, r);
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
    const i = await We(o);
    if (!o.ok)
      throw et(
        i,
        "I couldn't process that request right now.",
        o.status
      );
    return Ze(i);
  }
  return {
    apiBaseUrl: t,
    async listModels() {
      try {
        const r = await n("/api/v1/models");
        return { defaultModelId: r.default_model_id, complexModelId: r.complex_model_id, models: r.models || [] };
      } catch {
        return null;
      }
    },
    async createSession(r) {
      const s = await n("/api/v1/sessions", {
        method: "POST",
        signal: r,
        body: JSON.stringify({})
      });
      return { sessionId: s.session_id, createdAt: s.created_at };
    },
    async sendMessage(r, s, o, a) {
      const i = await n(
        `/api/v1/sessions/${r}/messages`,
        {
          method: "POST",
          signal: a,
          body: JSON.stringify({
            message: s,
            ...(o == null ? void 0 : o.roleId) !== void 0 ? { role_id: o.roleId } : {},
            ...o != null && o.client ? { client: o.client } : {},
            ...o != null && o.modelId ? { model_id: o.modelId } : {}
          })
        }
      );
      return {
        requestId: i.request_id,
        sessionId: i.session_id,
        answer: i.answer,
        sources: (i.sources || []).map($e),
        toolCalls: (i.tool_calls || []).map(He),
        usage: ze(i.usage),
        durationMs: i.duration_ms
      };
    },
    async sendMessageStream(r, s, o, a, i, u) {
      var g, f;
      const h = Oe(t, `/api/v1/sessions/${r}/messages/stream`);
      try {
        const c = await fetch(h, {
          method: "POST",
          signal: u,
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            message: s,
            ...(o == null ? void 0 : o.roleId) !== void 0 ? { role_id: o.roleId } : {},
            ...o != null && o.client ? { client: o.client } : {},
            ...o != null && o.modelId ? { model_id: o.modelId } : {}
          })
        });
        if (!c.ok) {
          if (c.status === 404 || c.status === 405)
            return await this.sendMessage(r, s, o, u);
          const R = await We(c);
          throw et(
            R,
            "I couldn't process that request right now.",
            c.status
          );
        }
        if (!c.body || (f = (g = c.headers) == null ? void 0 : g.get("content-type")) != null && f.includes("application/json")) {
          const R = Ze(await We(c));
          if (typeof R.answer != "string" || !R.usage)
            throw { message: "The response stream ended unexpectedly." };
          return {
            requestId: R.request_id,
            sessionId: R.session_id,
            answer: R.answer,
            sources: (R.sources || []).map($e),
            toolCalls: (R.tool_calls || []).map(He),
            usage: ze(R.usage),
            durationMs: R.duration_ms
          };
        }
        const p = c.body.getReader(), b = new TextDecoder();
        let C = "";
        const v = { value: null }, m = (R) => {
          const x = R.split(/\r?\n/).filter((A) => A.startsWith("data:")).map((A) => A.slice(5).trimStart()).join(`
`);
          if (!x) return;
          let S = {};
          try {
            const A = JSON.parse(x);
            if (!A || typeof A != "object") return;
            S = A;
          } catch {
            return;
          }
          if (S.type === "progress" && typeof S.stage == "string")
            a == null || a(S.stage);
          else if (S.type === "token" && typeof S.text == "string")
            i == null || i(S.text);
          else if (S.type === "complete")
            v.value = {
              requestId: S.request_id || "",
              sessionId: S.session_id || r,
              answer: S.answer || "",
              sources: (S.sources || []).map($e),
              toolCalls: (S.tool_calls || []).map(He),
              usage: S.usage ? ze(S.usage) : { model: "", promptTokens: 0, completionTokens: 0, totalTokens: 0 },
              durationMs: S.duration_ms
            };
          else if (S.type === "error")
            throw {
              message: S.message || "I couldn't process that request right now.",
              requestId: S.request_id
            };
        };
        try {
          for (; !v.value; ) {
            const { done: R, value: x } = await p.read();
            if (R) break;
            if (C += b.decode(x, { stream: !0 }), C.length > 1e6)
              throw { message: "The response stream was too large." };
            const S = C.split(/\r?\n\r?\n/);
            C = S.pop() || "";
            for (const A of S)
              if (m(A), v.value) break;
          }
          C += b.decode(), !v.value && C.trim() && m(C);
        } finally {
          await p.cancel().catch(() => {
          }), p.releaseLock();
        }
        const D = v.value;
        if (D)
          return D;
        throw { message: "The response stream ended before the answer was complete." };
      } catch (c) {
        throw !(c instanceof Error) && c && typeof c == "object" && "message" in c ? c : { message: "Something went wrong while connecting. Please try again." };
      }
    },
    async getHistory(r) {
      try {
        return ((await n(
          `/api/v1/sessions/${r}/messages`
        )).messages || []).map(Nt);
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
        const r = Oe(t, "/health");
        return (await fetch(r)).ok;
      } catch {
        return !1;
      }
    }
  };
}
const Fn = dt(), Mt = [
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
], Ye = Et(null);
function Dt() {
  const e = ct(Ye);
  if (!e)
    throw new Error("useChatbot must be used inside ChatProvider.");
  return e;
}
function Je() {
  return ct(Ye);
}
function _e(e, t, n, r) {
  if (typeof performance.measure != "function") return;
  const s = `vps-chatbot:${e}`;
  performance.clearMeasures(s), performance.measure(s, { start: t, end: n, detail: r ? { requestId: r } : null });
}
const Bt = `Hello! I am your **VPS Veritas assistant**.

I can help you with:
- **Fuel Quality Testing (FQT)** & **Oil Condition Monitoring (OCM)**
- **Fuel Defect Reporting (FDR)** — report and track bunker defect incidents
- **Bunker Master** — manage bunkering operations, BDN logs, and surveys
- **FSC & FSQ E-Forms** — paperless fuel system checks and bunker sample pre-registration
- **Samplogic** sample logistics, report downloads, and support tickets

Feel free to ask a question or select one of the suggested topics below!`;
function tt(e) {
  return `${e}-${crypto.randomUUID()}`;
}
function Pt(e) {
  if (e && typeof e == "object" && "message" in e) {
    const t = String(e.message);
    if (t && !/traceback|sql|exception|stack|api[_ ]?key|password/i.test(t))
      return t;
  }
  return "I couldn't process that request right now.";
}
const ht = ({
  children: e,
  userContext: t = {},
  role: n,
  roleId: r,
  client: s,
  welcomeMessage: o,
  suggestions: a = Mt,
  disableSuggestions: i = !1,
  initialMessage: u,
  apiBaseUrl: h,
  apiUrl: g,
  proxyUrl: f,
  api: c,
  hideInspectSources: p = !1,
  showGroundedSources: b = !0,
  modelId: C = "auto"
}) => {
  const v = h ?? g ?? f, m = Fe(
    () => c ?? dt(v),
    [c, v]
  ), D = Fe(() => ({
    ...t,
    ...n !== void 0 ? { role: n } : {},
    ...r !== void 0 ? { roleId: r } : {},
    ...s !== void 0 ? { client: s } : {}
  }), [t, n, r, s]), R = Fe(() => o === "" ? null : {
    id: "welcome-default",
    role: "assistant",
    content: o || Bt,
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    status: "complete"
  }, [o]), [x, S] = J(null), [A, N] = J(() => R ? [R] : []), [W, q] = J("idle"), [ae, Q] = J(null), k = te(null), I = te(!1), M = te(null), B = te(null), P = te(!1), [L, $] = J([]), [U, re] = J(C);
  le.useEffect(() => re(C), [C]), le.useEffect(() => {
    var T;
    let w = !0;
    return $([]), (T = m.listModels) == null || T.call(m).then((O) => {
      w && $((O == null ? void 0 : O.models) || []);
    }).catch(() => {
    }), () => {
      w = !1;
    };
  }, [m]);
  const he = de((w) => {
    !P.current && (w === "auto" || L.some((T) => T.id === w && T.configured)) && re(w);
  }, [L]);
  le.useEffect(() => () => {
    var w;
    return (w = M.current) == null ? void 0 : w.abort();
  }, []), le.useLayoutEffect(() => {
    const w = B.current;
    if (!w) return;
    const T = A.find((be) => be.id === w.messageId), O = performance.now();
    (T == null ? void 0 : T.status) === "complete" && w.completedAt !== void 0 ? (_e("completion-to-commit", w.completedAt, O), _e("submit-to-complete-commit", w.startedAt, O), B.current = null) : (T == null ? void 0 : T.status) === "pending" && T.content && w.firstTokenAt !== void 0 && !w.firstCommitRecorded && (_e("first-token-to-commit", w.firstTokenAt, O), w.firstCommitRecorded = !0);
  }, [A]);
  const pe = de(async (w) => {
    if (x) return x;
    q("connecting");
    const T = await m.createSession(w);
    if (w.aborted) throw new DOMException("Aborted", "AbortError");
    return S(T.sessionId), T.sessionId;
  }, [x, m]), fe = de(
    async (w) => {
      if (P.current) return;
      P.current = !0;
      const T = new AbortController();
      M.current = T;
      let O, be = "";
      const ne = () => {
        O !== void 0 && cancelAnimationFrame(O), O = void 0;
      };
      k.current = w;
      const Ie = {
        id: tt("user"),
        role: "user",
        content: w,
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        status: "complete"
      }, K = tt("asst"), Ne = {
        id: K,
        role: "assistant",
        content: "",
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        status: "pending",
        progressText: "Preparing your answer…"
      }, ve = performance.now(), X = { messageId: K, startedAt: ve };
      B.current = X, N((se) => [...se, Ie, Ne]), q("awaiting"), Q(null);
      const Me = (se) => {
        T.signal.aborted || N(
          (Z) => Z.map(
            (G) => G.id === K ? { ...G, progressText: se } : G
          )
        );
      };
      try {
        const se = await pe(T.signal), Z = performance.now();
        _e("request-preparation", ve, Z);
        const G = m.sendMessageStream ? await m.sendMessageStream(
          se,
          w,
          {
            roleId: D.roleId,
            client: D.client,
            modelId: U
          },
          Me,
          (ee) => {
            T.signal.aborted || (ee && X.firstTokenAt === void 0 && (X.firstTokenAt = performance.now(), _e("first-token-received", Z, X.firstTokenAt)), be += ee, O === void 0 && (O = requestAnimationFrame(() => {
              O = void 0, T.signal.aborted || N((ce) => ce.map((we) => we.id === K ? { ...we, content: be } : we));
            })));
          },
          T.signal
        ) : await m.sendMessage(se, w, {
          roleId: D.roleId,
          client: D.client,
          modelId: U
        }, T.signal);
        if (ne(), T.signal.aborted) return;
        X.messageId = G.requestId || K, X.completedAt = performance.now(), _e("completion-received", Z, X.completedAt, G.requestId), N(
          (ee) => ee.map(
            (ce) => ce.id === K ? {
              ...ce,
              id: G.requestId || K,
              content: G.answer,
              status: "complete",
              progressText: void 0,
              sources: G.sources,
              toolCalls: G.toolCalls,
              usage: G.usage,
              durationMs: Math.max(
                Math.round(performance.now() - ve),
                G.durationMs ?? 0
              )
            } : ce
          )
        ), q("idle");
      } catch (se) {
        if (ne(), B.current === X && (B.current = null), T.signal.aborted) return;
        const Z = Pt(se);
        N(
          (G) => G.map(
            (ee) => ee.id === K ? { ...ee, content: Z, status: "error", progressText: void 0 } : ee
          )
        ), Q(Z), q("error");
      } finally {
        ne(), M.current === T && (M.current = null, P.current = !1);
      }
    },
    [pe, m, D.client, D.roleId, U]
  ), j = de(
    async (w) => {
      const T = w.trim();
      !T || W === "awaiting" || W === "connecting" || await fe(T);
    },
    [fe, W]
  ), ie = de(async () => {
    if (P.current) return;
    const w = k.current;
    w && (N((T) => T.filter((O) => O.status !== "error")), await fe(w));
  }, [fe]), H = de(async () => {
  }, []), me = de(() => {
  }, []), Se = de(async () => {
    var w;
    (w = M.current) == null || w.abort(), M.current = null, P.current = !1, S(null), N(R ? [R] : []), q("idle"), Q(null), k.current = null, x && await m.closeSession(x);
  }, [x, m, R]);
  le.useEffect(() => {
    !u || I.current || (I.current = !0, j(u));
  }, [u, j]);
  const ge = Fe(
    () => ({
      messages: A,
      status: W,
      error: ae,
      sessionId: x,
      pendingTicket: null,
      ticketBusy: !1,
      lastTicket: null,
      suggestions: a,
      showSuggestions: !i && (A.length === 0 || A.length === 1 && A[0].id === "welcome-default"),
      suggestionBadgesEnabled: !i,
      userContext: D,
      apiBaseUrl: m.apiBaseUrl,
      hideInspectSources: p,
      showGroundedSources: b,
      sendMessage: j,
      retryLast: ie,
      confirmTicket: H,
      cancelTicket: me,
      resetConversation: Se,
      models: L,
      selectedModelId: U,
      selectModel: he
    }),
    [
      A,
      W,
      ae,
      x,
      a,
      i,
      D,
      m.apiBaseUrl,
      p,
      b,
      j,
      ie,
      H,
      me,
      Se,
      L,
      U,
      he
    ]
  );
  return /* @__PURE__ */ l(Ye.Provider, { value: ge, children: e });
};
function qe() {
  return Dt();
}
const xt = ({ message: e, onRetry: t }) => /* @__PURE__ */ y(
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
const Lt = (e) => e.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase(), pt = (...e) => e.filter((t, n, r) => !!t && t.trim() !== "" && r.indexOf(t) === n).join(" ").trim();
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
var qt = {
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
const Ot = ut(
  ({
    color: e = "currentColor",
    size: t = 24,
    strokeWidth: n = 2,
    absoluteStrokeWidth: r,
    className: s = "",
    children: o,
    iconNode: a,
    ...i
  }, u) => Ge(
    "svg",
    {
      ref: u,
      ...qt,
      width: t,
      height: t,
      stroke: e,
      strokeWidth: r ? Number(n) * 24 / Number(t) : n,
      className: pt("lucide", s),
      ...i
    },
    [
      ...a.map(([h, g]) => Ge(h, g)),
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
  const n = ut(
    ({ className: r, ...s }, o) => Ge(Ot, {
      ref: o,
      iconNode: t,
      className: pt(`lucide-${Lt(e)}`, r),
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
const $t = z("ArrowDown", [
  ["path", { d: "M12 5v14", key: "s699le" }],
  ["path", { d: "m19 12-7 7-7-7", key: "1idqje" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Ht = z("ArrowLeft", [
  ["path", { d: "m12 19-7-7 7-7", key: "1l729n" }],
  ["path", { d: "M19 12H5", key: "x3x0zl" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const zt = z("ArrowUp", [
  ["path", { d: "m5 12 7-7 7 7", key: "hav0vg" }],
  ["path", { d: "M12 19V5", key: "x0mq9r" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Wt = z("BookOpen", [
  ["path", { d: "M12 7v14", key: "1akyts" }],
  [
    "path",
    {
      d: "M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z",
      key: "ruj8y"
    }
  ]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const ft = z("BotMessageSquare", [
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
const Vt = z("Check", [["path", { d: "M20 6 9 17l-5-5", key: "1gmf2c" }]]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Gt = z("ChevronDown", [
  ["path", { d: "m6 9 6 6 6-6", key: "qrunsl" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Ut = z("ChevronUp", [["path", { d: "m18 15-6-6-6 6", key: "153udz" }]]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const jt = z("CircleCheck", [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["path", { d: "m9 12 2 2 4-4", key: "dzmm74" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Yt = z("ClipboardCheck", [
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
const Jt = z("ExternalLink", [
  ["path", { d: "M15 3h6v6", key: "1q9fwt" }],
  ["path", { d: "M10 14 21 3", key: "gplh6r" }],
  ["path", { d: "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6", key: "a6xqqp" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Kt = z("FlaskConical", [
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
const Qt = z("LoaderCircle", [
  ["path", { d: "M21 12a9 9 0 1 1-6.219-8.56", key: "13zald" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const mt = z("MessageSquare", [
  ["path", { d: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z", key: "1lielz" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Xt = z("Microscope", [
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
const Zt = z("Minus", [["path", { d: "M5 12h14", key: "1ays0h" }]]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const er = z("RefreshCw", [
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
const tr = z("ShieldCheck", [
  [
    "path",
    {
      d: "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",
      key: "oel41y"
    }
  ],
  ["path", { d: "m9 12 2 2 4-4", key: "dzmm74" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const rr = z("TestTubeDiagonal", [
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
const nr = z("X", [
  ["path", { d: "M18 6 6 18", key: "1bl5f8" }],
  ["path", { d: "m6 6 12 12", key: "d8bk6v" }]
]), sr = {
  alpha: {
    label: "Alpha",
    Icon: Kt,
    variant: "env-badge--alpha",
    tooltip: "Alpha build — internal testing only"
  },
  beta: {
    label: "Beta",
    Icon: rr,
    variant: "env-badge--beta",
    tooltip: "Beta build — public pre-release"
  },
  gamma: {
    label: "Gamma",
    Icon: Xt,
    variant: "env-badge--gamma",
    tooltip: "Gamma / Release Candidate"
  },
  qa: {
    label: "QA",
    Icon: Yt,
    variant: "env-badge--qa",
    tooltip: "Quality Assurance build"
  }
}, or = ({
  stage: e,
  pulse: t = !0,
  className: n = ""
}) => {
  if (!e) return null;
  const { label: r, Icon: s, variant: o, tooltip: a } = sr[e];
  return /* @__PURE__ */ y(
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
}, lr = (e) => /* @__PURE__ */ l(
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
), ar = ({
  title: e = "VPS AI Assistant",
  subtitle: t = "Customer portal support",
  onClose: n,
  onReset: r,
  onBack: s,
  showMinimize: o = !1,
  envStage: a,
  envPulse: i = !0
}) => /* @__PURE__ */ y("header", { className: "chat-header", children: [
  /* @__PURE__ */ y("div", { className: "chat-header-left", children: [
    s && /* @__PURE__ */ l(
      "button",
      {
        type: "button",
        onClick: s,
        className: "icon-btn-back",
        "aria-label": "Back",
        children: /* @__PURE__ */ l(Ht, { size: 16 })
      }
    ),
    /* @__PURE__ */ l(
      "div",
      {
        className: "avatar-circle",
        "aria-hidden": "true",
        children: /* @__PURE__ */ l(lr, { width: "16px", height: "16px", color: "white" })
      }
    ),
    /* @__PURE__ */ y("div", { children: [
      /* @__PURE__ */ y("div", { className: "chat-header-title-row", children: [
        /* @__PURE__ */ l("h2", { className: "chat-header-title", children: e }),
        /* @__PURE__ */ l(or, { stage: a, pulse: i })
      ] }),
      /* @__PURE__ */ l("p", { className: "chat-header-subtitle", children: t || "Customer portal support" })
    ] })
  ] }),
  /* @__PURE__ */ y("div", { className: "chat-header-actions", children: [
    r && /* @__PURE__ */ l(
      "button",
      {
        type: "button",
        onClick: r,
        className: "icon-btn-action",
        "aria-label": "Start a new conversation",
        title: "New conversation",
        children: /* @__PURE__ */ l(er, { size: 15 })
      }
    ),
    n && /* @__PURE__ */ l(
      "button",
      {
        type: "button",
        onClick: n,
        className: "icon-btn-action",
        "aria-label": o ? "Minimize chat" : "Close chat",
        children: /* @__PURE__ */ l(Zt, { size: 16 })
      }
    )
  ] })
] });
function ir(e, t) {
  const n = te(e);
  Te(() => {
    var r;
    n.current && !e && ((r = t.current) == null || r.focus()), n.current = e;
  }, [e, t]);
}
function cr(e, t) {
  const n = t.trim().toLowerCase();
  return n ? e.filter(
    (r) => r.label.toLowerCase().includes(n) || r.query.toLowerCase().includes(n)
  ) : e;
}
const ur = ({
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
)) }) : null, dr = ({
  onSend: e,
  disabled: t = !1,
  placeholder: n = "Ask something…"
}) => {
  const { suggestions: r, showSuggestions: s, suggestionBadgesEnabled: o, models: a, selectedModelId: i, selectModel: u } = qe(), [h, g] = J(""), f = te(null), c = le.useId(), p = (m) => {
    m && (m.style.height = "auto", m.style.height = `${Math.min(m.scrollHeight, 96)}px`);
  };
  ir(t, f), Te(() => {
    p(f.current);
  }, [h]);
  const b = Fe(() => {
    if (!o || t) return [];
    const m = h.trim();
    return m ? cr(r, m) : s ? r : [];
  }, [t, s, o, r, h]), C = (m) => {
    g(m.query);
    const D = f.current;
    D == null || D.focus();
  }, v = () => {
    const m = h.trim();
    !m || t || (e(m), g(""), f.current && (f.current.style.height = "auto"));
  };
  return /* @__PURE__ */ y("div", { className: "chat-input-wrapper", children: [
    /* @__PURE__ */ l(
      ur,
      {
        variant: "badge",
        suggestions: b,
        onSelect: C,
        disabled: t
      }
    ),
    /* @__PURE__ */ l("label", { htmlFor: "vps-chat-input", className: "sr-only", children: "Chat message" }),
    /* @__PURE__ */ y("div", { className: "chat-input-row", children: [
      /* @__PURE__ */ l(
        "textarea",
        {
          id: "vps-chat-input",
          ref: f,
          rows: 1,
          value: h,
          disabled: t,
          placeholder: n,
          onChange: (m) => {
            g(m.target.value), p(m.target);
          },
          onKeyDown: (m) => {
            m.key === "Enter" && !m.shiftKey && (m.preventDefault(), v());
          },
          className: "chat-textarea"
        }
      ),
      /* @__PURE__ */ l(
        "button",
        {
          type: "button",
          onClick: v,
          disabled: t || !h.trim(),
          "aria-label": "Send message",
          className: "chat-send-btn",
          children: /* @__PURE__ */ l(zt, { size: 16 })
        }
      )
    ] }),
    a.length > 1 && /* @__PURE__ */ y("div", { className: "chat-model-picker", children: [
      /* @__PURE__ */ l("label", { htmlFor: c, children: "AI model" }),
      /* @__PURE__ */ y(
        "select",
        {
          id: c,
          "aria-label": "AI model",
          value: i,
          disabled: t,
          onChange: (m) => u(m.target.value),
          children: [
            /* @__PURE__ */ l("option", { value: "auto", children: "Automatic" }),
            a.map((m) => /* @__PURE__ */ l("option", { value: m.id, disabled: !m.configured, children: m.label }, m.id))
          ]
        }
      )
    ] }),
    /* @__PURE__ */ y("p", { className: "chat-input-footer", children: [
      "Powered by ",
      /* @__PURE__ */ l("span", { className: "chat-input-footer-brand", children: "VPS Veritas AI" })
    ] })
  ] });
};
function hr({ defaultTagName: e, props: t, render: n, state: r = {}, stateAttributesMapping: s }) {
  let o = Ue(pr(r, s), t);
  if (!n) return d.createElement(e, o);
  if (typeof n == "function") return n(o, r);
  if (!d.isValidElement(n)) return null;
  let a = n.props, i = { ...Ue(o, a), ref: Ee(o.ref, a.ref) };
  return d.cloneElement(n, i);
}
function Ue(...e) {
  let t = {};
  for (let n of e) {
    if (!n) continue;
    let r = n;
    for (let s of Object.keys(r)) {
      let o = r[s];
      if (o === void 0) continue;
      let a = t[s];
      s === "className" ? t[s] = [a, o].filter(Boolean).join(" ") : s === "style" ? t[s] = { ...a, ...o } : s === "ref" ? t[s] = Ee(a, o) : mr(s) && typeof a == "function" && typeof o == "function" ? t[s] = fr(o, a) : t[s] = o;
    }
  }
  return t;
}
function pr(e, t) {
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
    let i = `data-${String(s).replace(/[A-Z]/g, (u) => `-${u.toLowerCase()}`)}`;
    typeof o == "boolean" ? n[i] = o ? "" : void 0 : o != null && (n[i] = String(o));
  }
  return n;
}
function fr(e, t) {
  return function(n) {
    e(n), n.defaultPrevented || t(n);
  };
}
function mr(e) {
  return /^on[A-Z]/.test(e);
}
function Ee(...e) {
  let t = e.filter(Boolean);
  if (t.length !== 0) return (n) => {
    for (let r of t) typeof r == "function" ? r(n) : r && (r.current = n);
  };
}
var gr = 8, br = 64, vr = 0, Pe = 0.5, wr = 180, _r = /* @__PURE__ */ new Set(["ArrowDown", "ArrowUp", "End", "Home", "PageDown", "PageUp", " "]), gt = { start: !1, end: !1 }, yr = [], xe = { currentAnchorId: null, visibleMessageIds: yr };
function kr({ content: e, scrollEdgeThreshold: t, spacer: n, viewport: r }) {
  if (!r || !e) return gt;
  let s = Ke({ content: e, spacer: n, viewport: r });
  return { start: r.scrollTop > t, end: s - r.scrollTop - r.clientHeight > t };
}
function Cr({ content: e, scrollMargin: t, scrollPreviousItemPeek: n, spacer: r, viewport: s, visibleMessageIds: o }) {
  if (!e || !s) return xe;
  let a = s.getBoundingClientRect(), i = a.top + t + n, u = typeof IntersectionObserver > "u", h = [], g = null;
  for (let f of Re(e, r)) {
    let c = f.dataset.messageId;
    if (!c) continue;
    let p = f.dataset.scrollAnchor === "true", b = p || u ? f.getBoundingClientRect() : null;
    (u && b ? b.bottom > i && b.top < a.bottom : o.has(c)) && h.push(c), p && b && b.top <= i + Pe && (g = c);
  }
  return h.length === 0 && g === null ? xe : { currentAnchorId: g, visibleMessageIds: h };
}
function Re(e, t) {
  return Array.from(e.children).filter((n) => n instanceof HTMLElement && n !== t);
}
function Sr(e, t) {
  for (let n = t; n < e.length; n++) {
    let r = e[n];
    if ((r == null ? void 0 : r.dataset.scrollAnchor) === "true") return r;
  }
  return null;
}
function Fr(e, t) {
  for (let n of e) if (n.dataset.scrollAnchor === "true" && !t.has(n)) return n;
  return null;
}
function Tr(e, t) {
  var r;
  let n = 0;
  for (let s = t; s < e.length; s++) if (((r = e[s]) == null ? void 0 : r.dataset.scrollAnchor) === "true" && (n += 1, n > 1)) return !0;
  return !1;
}
function Rr(e) {
  for (let t = e.length - 1; t >= 0; t--) {
    let n = e[t];
    if ((n == null ? void 0 : n.dataset.scrollAnchor) === "true") return n;
  }
  return null;
}
function Er({ content: e, spacer: t, viewport: n }) {
  let r = n.getBoundingClientRect();
  for (let s of Re(e, t)) {
    if (!s.dataset.messageId) continue;
    let o = s.getBoundingClientRect();
    if (o.bottom > r.top && o.top < r.bottom) return s;
  }
  return null;
}
function Ar({ align: e, element: t, scrollMargin: n, spacer: r, viewport: s }) {
  let o = bt(t, s), a = t.getBoundingClientRect().height, i = Mr(r);
  if (e === "center") {
    let u = Math.max(0, s.clientHeight - i.start - i.end);
    return o - i.start - (u - a) / 2 - n;
  }
  if (e === "end") return o - s.clientHeight + a + i.end + n;
  if (e === "nearest") {
    let u = o + a, h = s.scrollTop + i.start, g = s.scrollTop + s.clientHeight - i.end;
    return o >= h && u <= g ? s.scrollTop : o < h ? o - i.start - n : u - s.clientHeight + i.end + n;
  }
  return o - i.start - n;
}
function bt(e, t) {
  let n = e.getBoundingClientRect(), r = t.getBoundingClientRect();
  return n.top - r.top + t.scrollTop;
}
function De(e, t) {
  return e.getBoundingClientRect().top - t.getBoundingClientRect().top;
}
function Ir({ content: e, scrollTop: t, spacer: n, viewport: r }) {
  let s = Ke({ content: e, spacer: n, viewport: r });
  return t + r.clientHeight - s;
}
function Ke({ content: e, spacer: t, viewport: n }) {
  let r = Re(e, t), s = vt(e), o = n.getBoundingClientRect(), a = n.scrollTop, i = s.start + s.end;
  for (let u of r) {
    let h = u.getBoundingClientRect();
    i = Math.max(i, h.bottom - o.top + a + s.end);
  }
  return i;
}
function Nr(e) {
  return Math.max(0, e.scrollHeight - e.clientHeight);
}
function vt(e) {
  let t = window.getComputedStyle(e);
  return { end: je(t.paddingBlockEnd || t.paddingBottom), start: je(t.paddingBlockStart || t.paddingTop) };
}
function Mr(e) {
  let t = e == null ? void 0 : e.parentElement;
  return t ? vt(t) : { end: 0, start: 0 };
}
function Dr(e) {
  if (!e) return 0;
  let t = window.getComputedStyle(e), n = t.rowGap === "normal" ? t.gap : t.rowGap;
  return je(n);
}
function je(e) {
  if (!e) return 0;
  let t = Number.parseFloat(e);
  return Number.isFinite(t) ? t : 0;
}
function wt(e, t) {
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
function rt(e, t) {
  return wt(e, t);
}
function Br() {
  return wt(xe, xr);
}
function Pr(e, t) {
  return e.start === t.start && e.end === t.end;
}
function xr(e, t) {
  return e.currentAnchorId !== t.currentAnchorId || e.visibleMessageIds.length !== t.visibleMessageIds.length ? !1 : e.visibleMessageIds.every((n, r) => n === t.visibleMessageIds[r]);
}
function Lr({ autoScroll: e, defaultScrollPosition: t, scrollEdgeThreshold: n, scrollMargin: r, scrollPreviousItemPeek: s }) {
  let o = d.useRef(e), a = d.useRef(!1), i = d.useRef(null), u = d.useRef(!1), h = d.useRef(n), g = d.useRef(0), f = d.useRef(null), c = d.useRef(0), p = d.useRef(e ? "following-bottom" : "free-scrolling"), b = d.useRef(/* @__PURE__ */ new Map()), C = d.useRef(null), v = d.useRef(null), m = d.useRef(null), D = d.useRef(s), R = d.useRef(!0), x = d.useRef(null), S = d.useRef(r), A = d.useRef(null), N = d.useRef(0), W = d.useRef(0), q = d.useRef(null), ae = d.useRef(null), Q = d.useRef(null), k = d.useRef(null), I = d.useRef(null), M = d.useRef(null), B = d.useRef(null), P = d.useRef(null), L = d.useRef(null), $ = d.useRef(/* @__PURE__ */ new Set()), U = d.useRef(/* @__PURE__ */ new WeakSet());
  return Q.current === null && (Q.current = rt(t === "end" || t === "last-anchor", (re, he) => re === he)), k.current === null && (k.current = rt(gt, Pr)), L.current === null && (L.current = Br()), o.current = e, h.current = n, S.current = r, D.current = s, { autoScrollRef: o, autoscrollingRef: a, autoscrollingTimeoutRef: I, streamingTurnRef: m, contentRef: i, defaultScrollPositionAppliedRef: u, firstItemRef: f, itemCountRef: g, lastScrollTopRef: c, messageElementsRef: b, modeRef: p, pendingScrollFrameRef: A, pendingScrollToMessageRef: C, prependRestoreRef: v, preserveScrollOnPrependRef: R, pendingDefaultScrollStore: Q.current, rootRef: x, scrollEdgeThresholdRef: h, scrollMarginRef: S, scrollPreviousItemPeekRef: D, spacerGapRef: N, spacerHeightRef: W, spacerRef: q, stateFrameRef: ae, stateStore: k.current, viewportRef: M, visibilityFrameRef: B, visibilityObserverRef: P, visibilityStore: L.current, visibleMessageIdsRef: $, handledScrollAnchorsRef: U };
}
function _t(e) {
  e.pendingDefaultScrollStore.setSnapshot(!1);
}
function Be(e) {
  e.defaultScrollPositionAppliedRef.current = !0, _t(e);
}
function qr({ refs: e, commitScrollState: t, scheduleStateCommit: n, scheduleVisibilitySync: r }) {
  let { streamingTurnRef: s, autoScrollRef: o, autoscrollingRef: a, autoscrollingTimeoutRef: i, contentRef: u, itemCountRef: h, messageElementsRef: g, modeRef: f, pendingScrollToMessageRef: c, prependRestoreRef: p, scrollMarginRef: b, scrollPreviousItemPeekRef: C, spacerGapRef: v, spacerHeightRef: m, spacerRef: D, viewportRef: R } = e, x = d.useCallback((k) => {
    i.current !== null && (window.clearTimeout(i.current), i.current = null), a.current !== k && (a.current = k, t()), k && (i.current = window.setTimeout(() => {
      i.current = null, a.current = !1, t();
    }, wr));
  }, [t]), S = d.useCallback((k) => {
    let I = D.current;
    if (!I) return;
    let M = Math.max(0, Math.ceil(k));
    m.current !== M && (m.current = M, I.hidden = M === 0, I.style.height = `${M}px`, I.style.marginTop = M > 0 ? `${-v.current}px` : "");
  }, []), A = d.useCallback((k, { behavior: I = "auto", autoscrolling: M = !1 } = {}) => {
    let B = R.current;
    if (!B) return;
    let P = Math.max(0, k);
    if (Math.abs(B.scrollTop - P) <= Pe) {
      B.scrollTop = P, t();
      return;
    }
    M && x(!0), B.scrollTo({ top: P, behavior: I }), n();
  }, [t, n, x]), N = d.useCallback(({ behavior: k = "auto" } = {}) => R.current ? (S(0), s.current = null, f.current = "free-scrolling", A(0, { behavior: k }), r(), !0) : !1, [r, A, S]), W = d.useCallback(({ behavior: k = "auto" } = {}) => {
    let I = R.current;
    return I ? (S(0), s.current = null, f.current = o.current ? "following-bottom" : "free-scrolling", A(Nr(I), { autoscrolling: !0, behavior: k }), r(), !0) : !1;
  }, [r, A, S]), q = d.useCallback((k, { align: I = "start", behavior: M = "auto", scrollMargin: B = b.current } = {}, { keepPreviousPeek: P = !1 } = {}) => {
    let L = u.current, $ = R.current;
    if (!L || !$ || !L.contains(k)) return !1;
    let U = Ar({ align: I, element: k, scrollMargin: P ? B + C.current : B, spacer: D.current, viewport: $ }), re = Ir({ content: L, scrollTop: U, spacer: D.current, viewport: $ });
    return S(re), p.current = { element: k, viewportTop: De(k, $) }, f.current = P ? "anchored-to-message" : "settling-jump", s.current = P ? k : null, A(U, { behavior: M }), r(), !0;
  }, [r, A, S]), ae = d.useCallback(() => {
    let k = s.current;
    return !k || !k.isConnected || f.current !== "anchored-to-message" ? !1 : q(k, { align: "start" }, { keepPreviousPeek: !0 });
  }, [q]), Q = d.useCallback((k, I) => {
    let M = g.current.get(k);
    return M ? (Be(e), q(M, I) ? (c.current = null, !0) : (c.current = { messageId: k, options: I }, !0)) : h.current === 0 ? (c.current = { messageId: k, options: I }, Be(e), !0) : !1;
  }, [q]);
  return { flushPendingScrollToMessage: d.useCallback(() => {
    let k = c.current;
    if (!k) return !1;
    let I = g.current.get(k.messageId);
    return !I || !q(I, k.options) ? !1 : (c.current = null, Be(e), !0);
  }, [q]), reanchorToAnchoredMessage: ae, scrollToElement: q, scrollToEnd: W, scrollToMessage: Q, scrollToStart: N };
}
function nt(e, t) {
  return d.useCallback((n) => {
    e.current = n, n && t();
  }, [e, t]);
}
function Or({ autoScroll: e = !1, defaultScrollPosition: t = "end", scrollEdgeThreshold: n = gr, scrollPreviousItemPeek: r = br, scrollMargin: s = vr }) {
  let o = Lr({ autoScroll: e, defaultScrollPosition: t, scrollEdgeThreshold: n, scrollMargin: s, scrollPreviousItemPeek: r }), { streamingTurnRef: a, autoScrollRef: i, autoscrollingRef: u, autoscrollingTimeoutRef: h, contentRef: g, defaultScrollPositionAppliedRef: f, firstItemRef: c, itemCountRef: p, lastScrollTopRef: b, messageElementsRef: C, modeRef: v, pendingScrollFrameRef: m, pendingScrollToMessageRef: D, prependRestoreRef: R, preserveScrollOnPrependRef: x, pendingDefaultScrollStore: S, rootRef: A, scrollEdgeThresholdRef: N, scrollMarginRef: W, scrollPreviousItemPeekRef: q, spacerGapRef: ae, spacerHeightRef: Q, spacerRef: k, stateFrameRef: I, stateStore: M, viewportRef: B, visibilityFrameRef: P, visibilityObserverRef: L, visibilityStore: $, visibleMessageIdsRef: U, handledScrollAnchorsRef: re } = o, he = d.useRef(t);
  he.current !== t && (he.current = t, f.current = !1);
  let pe = d.useCallback((_) => {
    let F = A.current, E = B.current, V = [_.start && "start", _.end && "end"].filter(Boolean).join(" "), ue = u.current;
    for (let Y of [F, E]) Y && (V ? Y.setAttribute("data-scrollable", V) : Y.removeAttribute("data-scrollable"), Y.toggleAttribute("data-autoscrolling", ue));
  }, []), fe = d.useCallback((_) => {
    var V;
    let F = ((V = B.current) == null ? void 0 : V.scrollTop) ?? 0, E = F < b.current - Pe;
    b.current = F, i.current && !_.end && v.current !== "settling-jump" && v.current !== "anchored-to-message" ? v.current = "following-bottom" : v.current === "following-bottom" && _.end && E && !u.current && (v.current = "free-scrolling");
  }, []), j = d.useCallback(() => {
    let _ = kr({ content: g.current, scrollEdgeThreshold: N.current, spacer: k.current, viewport: B.current });
    fe(_);
    let F = v.current === "following-bottom" ? { ..._, end: !1 } : _;
    pe(F), M.setSnapshot(F);
  }, [fe, M, pe]), ie = d.useCallback(() => {
    I.current === null && (I.current = window.requestAnimationFrame(() => {
      I.current = null, j();
    }));
  }, [j]), H = d.useCallback(() => {
    $.hasListeners() && P.current === null && (P.current = window.requestAnimationFrame(() => {
      P.current = null, $.hasListeners() && $.setSnapshot(Cr({ content: g.current, scrollMargin: W.current, scrollPreviousItemPeek: q.current, spacer: k.current, viewport: B.current, visibleMessageIds: U.current }));
    }));
  }, [$]), { flushPendingScrollToMessage: me, reanchorToAnchoredMessage: Se, scrollToElement: ge, scrollToEnd: w, scrollToMessage: T, scrollToStart: O } = qr({ refs: o, commitScrollState: j, scheduleStateCommit: ie, scheduleVisibilitySync: H }), be = d.useCallback(() => {
    let _ = R.current, F = B.current;
    if (!_ || !F || !_.element.isConnected) return !1;
    let E = De(_.element, F) - _.viewportTop;
    return Math.abs(E) <= Pe ? !1 : (F.scrollTop += E, _.viewportTop = De(_.element, F), ie(), H(), !0);
  }, [ie, H]), ne = d.useCallback(() => {
    let _ = g.current, F = B.current;
    if (!_ || !F) {
      R.current = null;
      return;
    }
    let E = Er({ content: _, spacer: k.current, viewport: F });
    R.current = E ? { element: E, viewportTop: De(E, F) } : null;
  }, []), Ie = d.useCallback(() => {
    m.current === null && (m.current = window.requestAnimationFrame(() => {
      m.current = null, me() && ne();
    }));
  }, [ne, me]), K = d.useCallback(() => {
    if (!t || f.current || p.current === 0) return !1;
    let _ = !1;
    if (t === "last-anchor") {
      let F = g.current, E = B.current, V = F && E ? Rr(Re(F, k.current)) : null;
      if (!F || !E || !V) _ = w({ behavior: "auto" });
      else {
        let ue = bt(V, E);
        _ = Ke({ content: F, spacer: k.current, viewport: E }) - ue <= E.clientHeight ? w({ behavior: "auto" }) : ge(V, { align: "start" }, { keepPreviousPeek: !0 });
      }
    } else _ = t === "end" ? w({ behavior: "auto" }) : O({ behavior: "auto" });
    return _ ? (Be(o), !0) : !1;
  }, [t, ge, w, O]), Ne = d.useCallback(() => {
    let _ = g.current;
    if (!_) return;
    let F = Re(_, k.current), E = p.current, V = c.current;
    p.current = F.length, c.current = F[0] ?? null, (() => {
      if (me()) return;
      if (E === 0) {
        if (K() || F.length > 0 && i.current && w({ behavior: "auto" })) return;
        j(), H();
        return;
      }
      let ue = V ? F.indexOf(V) : -1;
      if (x.current && ue > 0) {
        be();
        return;
      }
      if (F.length > E) {
        let Y = Sr(F, E);
        if (Y) {
          if (i.current && v.current === "following-bottom" && Tr(F, E)) {
            w({ behavior: "auto" });
            return;
          }
          ge(Y, { align: "start" }, { keepPreviousPeek: !0 }), re.current.add(Y);
          return;
        }
      }
      if (F.length === E) {
        let Y = Fr(F, re.current);
        if (Y) {
          ge(Y, { align: "start" }, { keepPreviousPeek: !0 }), re.current.add(Y);
          return;
        }
      }
      v.current === "following-bottom" && i.current ? w({ behavior: "auto" }) : (j(), H());
    })(), ne();
  }, [K, ne, j, me, be, H, ge, w]), ve = d.useCallback(() => {
    if (v.current === "following-bottom" && i.current) {
      w({ behavior: "auto" });
      return;
    }
    let _ = Q.current;
    if (Se()) {
      i.current && _ > 0 && Q.current === 0 && w({ behavior: "auto" });
      return;
    }
    ie(), H();
  }, [Se, ie, H, w]), X = d.useCallback(() => {
    let _ = B.current;
    if (!(!_ || !$.hasListeners())) {
      if (typeof IntersectionObserver > "u") {
        H();
        return;
      }
      L.current || (L.current = new IntersectionObserver((F) => {
        for (let E of F) {
          let V = E.target.dataset.messageId;
          V && (E.isIntersecting ? U.current.add(V) : U.current.delete(V));
        }
        H();
      }, { root: _, rootMargin: `${-(W.current + q.current)}px 0px 0px 0px`, threshold: [0, 0.01, 0.5, 1] })), C.current.forEach((F) => {
        var E;
        (E = L.current) == null || E.observe(F);
      }), H();
    }
  }, [H, $]), Me = d.useCallback(() => {
    var _;
    P.current !== null && (window.cancelAnimationFrame(P.current), P.current = null), (_ = L.current) == null || _.disconnect(), L.current = null, U.current.clear(), $.setSnapshot(xe);
  }, [$]), se = d.useCallback((_, F, E) => {
    var V, ue, Y;
    if (F) {
      C.current.set(_, F), (V = L.current) == null || V.observe(F), H(), ((ue = D.current) == null ? void 0 : ue.messageId) === _ && Ie();
      return;
    }
    E && C.current.get(_) === E && (C.current.delete(_), U.current.delete(_), (Y = L.current) == null || Y.unobserve(E), H());
  }, [Ie, H]), Z = d.useCallback(() => {
    (v.current === "following-bottom" || v.current === "anchored-to-message" || v.current === "settling-jump") && (a.current = null, v.current = "free-scrolling");
  }, []), G = d.useCallback(() => pe(M.getSnapshot()), [M, pe]), ee = nt(A, G), ce = nt(B, G), we = d.useCallback((_) => {
    g.current = _;
  }, []), Qe = d.useCallback((_) => {
    k.current = _, ae.current = Dr((_ == null ? void 0 : _.parentElement) ?? null);
  }, []), Xe = d.useCallback(() => {
    j(), H(), ne();
  }, [ne, j, H]), Rt = d.useMemo(() => ({ handleContentChange: Ne, handleResize: ve, observeVisibility: X, pendingDefaultScrollStore: S, preserveScrollOnPrependRef: x, scrollToEnd: w, scrollToMessage: T, scrollToStart: O, setContentElement: we, setRootElement: ee, setSpacerElement: Qe, setViewportElement: ce, stateStore: M, syncAfterScroll: Xe, unobserveVisibility: Me, userScrollIntent: Z, viewportRef: B, visibilityStore: $ }), [Ne, ve, X, S, w, T, O, we, ee, Qe, ce, M, Xe, Me, Z, $]);
  return d.useLayoutEffect(() => {
    K() || p.current === 0 && _t(o);
  }, [K]), d.useEffect(() => () => {
    var _;
    I.current !== null && (window.cancelAnimationFrame(I.current), I.current = null), P.current !== null && (window.cancelAnimationFrame(P.current), P.current = null), h.current !== null && (window.clearTimeout(h.current), h.current = null), m.current !== null && (window.cancelAnimationFrame(m.current), m.current = null), (_ = L.current) == null || _.disconnect(), L.current = null;
  }, []), d.useLayoutEffect(() => {
    if (e && v.current === "following-bottom" && p.current > 0) {
      w({ behavior: "auto" });
      return;
    }
    j();
  }, [e, j, w]), { context: Rt, registerMessage: se };
}
function $r(e) {
  let t = d.useRef(e);
  return t.current = e, t;
}
var yt = d.createContext(null), kt = d.createContext(null);
function Ae() {
  let e = d.useContext(yt);
  if (!e) throw new Error("useMessageScroller must be used within a MessageScroller.");
  return e;
}
function Hr() {
  let e = d.useContext(kt);
  if (!e) throw new Error("MessageScrollerItem must be used within a MessageScroller.");
  return e;
}
function zr({ autoScroll: e = !1, children: t, defaultScrollPosition: n = "end", scrollEdgeThreshold: r, scrollPreviousItemPeek: s, scrollMargin: o }) {
  let { context: a, registerMessage: i } = Or({ autoScroll: e, defaultScrollPosition: n, scrollEdgeThreshold: r, scrollPreviousItemPeek: s, scrollMargin: o });
  return l(yt.Provider, { value: a, children: l(kt.Provider, { value: i, children: t }) });
}
function Ct() {
  let { pendingDefaultScrollStore: e } = Ae();
  return d.useSyncExternalStore(e.subscribe, e.getSnapshot, e.getSnapshot);
}
function Wr({ children: e, ...t }) {
  let { setRootElement: n } = Ae(), r = Ct();
  return l("div", { ref: n, ...t, ...r ? { "data-pending-scroll": "" } : null, children: e });
}
function Vr({ "aria-label": e, children: t, onKeyDown: n, onScroll: r, onTouchMove: s, onWheel: o, preserveScrollOnPrepend: a = !0, ref: i, role: u, tabIndex: h, ...g }) {
  let { handleResize: f, preserveScrollOnPrependRef: c, setViewportElement: p, syncAfterScroll: b, userScrollIntent: C, viewportRef: v } = Ae(), m = Ct();
  c.current = a;
  let D = d.useCallback((N) => {
    var W;
    p(N), (W = Ee(i)) == null || W(N);
  }, [i, p]);
  function R(N) {
    b(), r == null || r(N);
  }
  function x(N) {
    C(), o == null || o(N);
  }
  function S(N) {
    C(), s == null || s(N);
  }
  function A(N) {
    _r.has(N.key) && C(), n == null || n(N);
  }
  return d.useEffect(() => {
    let N = v.current;
    if (!N || typeof ResizeObserver > "u") return;
    let W = 0, q = new ResizeObserver(() => {
      window.cancelAnimationFrame(W), W = window.requestAnimationFrame(f);
    });
    return q.observe(N), () => {
      window.cancelAnimationFrame(W), q.disconnect();
    };
  }, [f, v]), l("div", { ref: D, role: u ?? "region", "aria-label": e ?? "Messages", tabIndex: h ?? 0, onKeyDown: A, onScroll: R, onTouchMove: S, onWheel: x, ...g, ...m ? { "data-pending-scroll": "" } : null, children: t });
}
function Gr({ "aria-relevant": e, children: t, ref: n, role: r, spacerClassName: s, ...o }) {
  let { handleContentChange: a, handleResize: i, setContentElement: u, setSpacerElement: h } = Ae(), g = d.useRef(null), f = d.useCallback((c) => {
    var p;
    g.current = c, u(c), (p = Ee(n)) == null || p(c);
  }, [n, u]);
  return d.useLayoutEffect(() => {
    let c = g.current;
    if (!c || (a(), typeof MutationObserver > "u")) return;
    let p = new MutationObserver(() => {
      a();
    });
    return p.observe(c, { childList: !0 }), () => p.disconnect();
  }, [a]), d.useEffect(() => {
    let c = g.current;
    if (!c || typeof ResizeObserver > "u") return;
    let p = 0, b = new ResizeObserver(() => {
      window.cancelAnimationFrame(p), p = window.requestAnimationFrame(i);
    });
    return b.observe(c), () => {
      window.cancelAnimationFrame(p), b.disconnect();
    };
  }, [i]), y("div", { ref: f, role: r ?? "log", "aria-relevant": e ?? "additions", ...o, children: [t, l("div", { ref: h, "aria-hidden": "true", "data-message-scroller-spacer": "", hidden: !0, className: s })] });
}
function Ur({ messageId: e, ref: t, scrollAnchor: n = !1, ...r }) {
  let s = Hr(), o = d.useRef(null), a = d.useCallback((i) => {
    var h;
    let u = o.current;
    o.current = i, e && s(e, i, u), (h = Ee(t)) == null || h(i);
  }, [e, t, s]);
  return l("div", { ref: a, "data-message-id": e, "data-scroll-anchor": n ? "true" : "false", ...r });
}
function jr({ behavior: e = "smooth", children: t, direction: n = "end", onClick: r, render: s, tabIndex: o, type: a = "button", ...i }) {
  let { scrollToEnd: u, scrollToStart: h, stateStore: g } = Ae(), f = $r(r), c = d.useCallback((v) => g.subscribe(v), [g]), p = d.useCallback(() => {
    let v = g.getSnapshot();
    return n === "start" ? v.start : v.end;
  }, [n, g]), b = d.useSyncExternalStore(c, p, p), C = d.useCallback((v) => {
    var m;
    b && ((m = f.current) == null || m.call(f, v), v.defaultPrevented || (v.currentTarget.blur(), n === "start" ? h({ behavior: e }) : u({ behavior: e })));
  }, [e, n, b, f, u, h]);
  return hr({ defaultTagName: "button", props: Ue({ type: a, inert: !b, tabIndex: b ? o : -1, children: t ?? y("span", { children: ["Scroll to ", n] }), onClick: C }, i), render: s, state: { active: b, direction: n }, stateAttributesMapping: { active: (v) => ({ "data-active": v ? "true" : "false" }) } });
}
var ke = { Provider: zr, Root: Wr, Viewport: Vr, Content: Gr, Item: Ur, Button: jr };
function St(e) {
  var t, n, r = "";
  if (typeof e == "string" || typeof e == "number") r += e;
  else if (typeof e == "object") if (Array.isArray(e)) {
    var s = e.length;
    for (t = 0; t < s; t++) e[t] && (n = St(e[t])) && (r && (r += " "), r += n);
  } else for (n in e) e[n] && (r && (r += " "), r += n);
  return r;
}
function Yr() {
  for (var e, t, n = 0, r = "", s = arguments.length; n < s; n++) (e = arguments[n]) && (t = St(e)) && (r && (r += " "), r += t);
  return r;
}
function Ce(...e) {
  return Yr(e);
}
function Jr(e) {
  return /* @__PURE__ */ l(ke.Provider, { ...e });
}
function Kr({
  className: e,
  ...t
}) {
  return /* @__PURE__ */ l(
    ke.Root,
    {
      "data-slot": "message-scroller",
      className: Ce("msg-scroller-root", e),
      ...t
    }
  );
}
function Qr({
  className: e,
  ...t
}) {
  return /* @__PURE__ */ l(
    ke.Viewport,
    {
      "data-slot": "message-scroller-viewport",
      className: Ce("msg-scroller-viewport", e),
      ...t
    }
  );
}
function Xr({
  className: e,
  ...t
}) {
  return /* @__PURE__ */ l(
    ke.Content,
    {
      "data-slot": "message-scroller-content",
      className: Ce("msg-scroller-content", e),
      ...t
    }
  );
}
function st({
  className: e,
  scrollAnchor: t = !1,
  ...n
}) {
  return /* @__PURE__ */ l(
    ke.Item,
    {
      "data-slot": "message-scroller-item",
      scrollAnchor: t,
      className: Ce("msg-scroller-item", e),
      ...n
    }
  );
}
function Zr({
  direction: e = "end",
  className: t,
  children: n,
  ...r
}) {
  return /* @__PURE__ */ l(
    ke.Button,
    {
      "data-slot": "message-scroller-button",
      direction: e,
      className: Ce("msg-scroller-btn", t),
      ...r,
      children: n ?? /* @__PURE__ */ y(Le, { children: [
        /* @__PURE__ */ l(
          $t,
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
const en = () => /* @__PURE__ */ y("div", { className: "chat-empty-row", children: [
  /* @__PURE__ */ l(
    "div",
    {
      className: "avatar-circle avatar-circle--mt",
      "aria-hidden": "true",
      children: /* @__PURE__ */ l(ft, { size: 15 })
    }
  ),
  /* @__PURE__ */ l("div", { className: "chat-empty-bubble", children: /* @__PURE__ */ l("p", { children: "Hello — I am the VPS Veritas assistant. Ask about reports, sample status, registration, or support, or choose a question below the text box." }) })
] });
function tn(e) {
  const t = e.trim();
  if (!/[\u0000-\u001f\u007f]/.test(t) && /^(https?:\/\/|mailto:|\/(?!\/)|#)/i.test(t))
    return t;
}
function oe(e) {
  if (!e) return [];
  const t = /(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|https?:\/\/[^\s]+)/g;
  return e.split(t).map((r, s) => {
    if (!r) return null;
    const o = r.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (o) {
      const a = o[1], i = o[2], u = tn(i);
      if (!u) return /* @__PURE__ */ l(le.Fragment, { children: a }, s);
      const h = /^https?:\/\//i.test(i);
      return /* @__PURE__ */ l(
        "a",
        {
          href: u,
          target: h ? "_blank" : void 0,
          rel: h ? "noopener noreferrer" : void 0,
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
    ) : /* @__PURE__ */ l(le.Fragment, { children: r }, s);
  });
}
function rn(e) {
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
      const u = o.slice(3).trim(), h = [];
      for (r++; r < t.length && !t[r].trim().startsWith("```"); )
        h.push(t[r]), r++;
      r < t.length && t[r].trim().startsWith("```") && r++, n.push({ type: "code", lang: u, code: h.join(`
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
      const u = [];
      for (; r < t.length && t[r].trim().startsWith(">"); )
        u.push(t[r].trim().replace(/^>\s?/, "")), r++;
      n.push({ type: "quote", lines: u });
      continue;
    }
    if (/^[-*]\s+/.test(o)) {
      const u = [];
      for (; r < t.length && /^[-*]\s+/.test(t[r].trim()); )
        u.push(t[r].trim().replace(/^[-*]\s+/, "")), r++;
      n.push({ type: "ul", items: u });
      continue;
    }
    if (/^\d+\.\s+/.test(o)) {
      const u = [];
      for (; r < t.length && /^\d+\.\s+/.test(t[r].trim()); )
        u.push(t[r].trim().replace(/^\d+\.\s+/, "")), r++;
      n.push({ type: "ol", items: u });
      continue;
    }
    if (o.startsWith("|") && o.endsWith("|")) {
      const u = [];
      for (; r < t.length && t[r].trim().startsWith("|") && t[r].trim().endsWith("|"); )
        u.push(t[r].trim()), r++;
      if (u.length >= 2) {
        const h = (p) => p.slice(1, -1).split("|").map((b) => b.trim()), g = h(u[0]), f = u[1].includes("-") ? 2 : 1, c = u.slice(f).map(h);
        n.push({ type: "table", headers: g, rows: c });
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
const nn = le.memo(function({ text: t }) {
  if (!t) return null;
  const n = rn(t);
  return /* @__PURE__ */ l("div", { className: "md-content", children: n.map((r, s) => {
    switch (r.type) {
      case "h":
        return r.level === 1 ? /* @__PURE__ */ l("h2", { className: "md-h1", children: oe(r.content) }, s) : r.level === 2 ? /* @__PURE__ */ l("h3", { className: "md-h2", children: oe(r.content) }, s) : r.level === 3 ? /* @__PURE__ */ l("h4", { className: "md-h3", children: oe(r.content) }, s) : /* @__PURE__ */ l("h5", { className: "md-h4", children: oe(r.content) }, s);
      case "ul":
        return /* @__PURE__ */ l("ul", { className: "md-ul", children: r.items.map((o, a) => /* @__PURE__ */ l("li", { className: "md-li", children: oe(o) }, a)) }, s);
      case "ol":
        return /* @__PURE__ */ l("ol", { className: "md-ol", children: r.items.map((o, a) => /* @__PURE__ */ l("li", { className: "md-li", children: oe(o) }, a)) }, s);
      case "code":
        return /* @__PURE__ */ l("pre", { className: "md-pre", children: /* @__PURE__ */ l("code", { children: r.code }) }, s);
      case "quote":
        return /* @__PURE__ */ l("blockquote", { className: "md-quote", children: r.lines.map((o, a) => /* @__PURE__ */ l("p", { children: oe(o) }, a)) }, s);
      case "hr":
        return /* @__PURE__ */ l("hr", { className: "md-hr" }, s);
      case "table":
        return /* @__PURE__ */ l("div", { className: "md-table-wrap", children: /* @__PURE__ */ y("table", { className: "md-table", children: [
          /* @__PURE__ */ l("thead", { children: /* @__PURE__ */ l("tr", { children: r.headers.map((o, a) => /* @__PURE__ */ l("th", { children: oe(o) }, a)) }) }),
          /* @__PURE__ */ l("tbody", { children: r.rows.map((o, a) => /* @__PURE__ */ l("tr", { children: o.map((i, u) => /* @__PURE__ */ l("td", { children: oe(i) }, u)) }, a)) })
        ] }) }, s);
      case "p":
      default:
        return /* @__PURE__ */ l("p", { className: "md-p", children: r.lines.map((o, a) => /* @__PURE__ */ y(le.Fragment, { children: [
          oe(o),
          a < r.lines.length - 1 && /* @__PURE__ */ l("br", {})
        ] }, a)) }, s);
    }
  }) });
}), sn = ({ className: e, text: t }) => /* @__PURE__ */ y(
  "div",
  {
    className: Ce("typing-indicator-container", e),
    role: "status",
    "aria-label": "Assistant is preparing a reply",
    children: [
      /* @__PURE__ */ y("div", { className: "typing-indicator", "aria-hidden": "true", children: [
        /* @__PURE__ */ l("span", { className: "typing-dot" }),
        /* @__PURE__ */ l("span", { className: "typing-dot" }),
        /* @__PURE__ */ l("span", { className: "typing-dot" })
      ] }),
      t && /* @__PURE__ */ l("div", { className: "typing-progress-pill", children: t })
    ]
  }
), on = ({
  status: e = "complete",
  progressText: t,
  durationMs: n
}) => {
  const r = e === "pending", [s, o] = J(0);
  Te(() => {
    if (!r) return;
    const i = Date.now(), u = setInterval(() => {
      o(Number(((Date.now() - i) / 1e3).toFixed(1)));
    }, 250);
    return () => clearInterval(u);
  }, [r]);
  const a = r ? `${s.toFixed(1)}s` : n === void 0 ? void 0 : `${(n / 1e3).toFixed(1)}s`;
  return /* @__PURE__ */ l("div", { className: `agent-reasoning-container${r ? " agent-reasoning--active" : ""}`, children: /* @__PURE__ */ l(
    "div",
    {
      className: "agent-reasoning-header",
      role: "status",
      "aria-live": "off",
      children: /* @__PURE__ */ y("div", { className: "agent-reasoning-header-left", children: [
        r ? /* @__PURE__ */ l(
          Qt,
          {
            size: 13,
            className: "agent-reasoning-spinner",
            "aria-hidden": "true"
          }
        ) : /* @__PURE__ */ l(
          jt,
          {
            size: 13,
            className: "agent-reasoning-done-icon",
            "aria-hidden": "true"
          }
        ),
        /* @__PURE__ */ l("span", { className: "agent-reasoning-title", children: r ? `${t || "Working…"} · ${a}` : a ? `Response generated in ${a}` : "Response generated" })
      ] })
    }
  ) });
}, ln = {
  "fuel-defect-reporting": {
    label: "Fuel Defect Reporting",
    path: "/dashboard/fuel-Defect-Reporting"
  },
  "bunker-master": {
    label: "Bunker Master",
    path: "/dashboard/bunker-master"
  },
  "fsc-fsq-e-forms": {
    label: "Pre-Registration & E-Forms",
    path: "/dashboard/pre-registration"
  },
  "pre-registration-ship": {
    label: "Pre-Registration",
    path: "/dashboard/pre-registration"
  },
  "reports-fuel": {
    label: "Fuel Reports",
    path: "/dashboard/reports"
  },
  "sample-fuel": {
    label: "Sample Status",
    path: "/dashboard/sample-status"
  }
};
function an(e) {
  const n = (e.split(/[/\\]/).pop() || "").replace(/\.md$/i, "").toLowerCase();
  for (const [r, s] of Object.entries(ln))
    if (n.includes(r))
      return s;
  return null;
}
function ot(e) {
  return e.title ? e.title : (e.source.split(/[/\\]/).pop() || e.source).replace(/\.md$/i, "").replace(/[-_]/g, " ").replace(/\b\w/g, (n) => n.toUpperCase());
}
const cn = ({
  sources: e,
  hideInspectSources: t = !1,
  showInspectSources: n = !0,
  defaultExpanded: r = !1,
  maxSources: s = 5
}) => {
  const o = t || n === !1, [a, i] = J(r && !o), [u, h] = J(null);
  if (!e || !e.length) return null;
  const g = e.slice(0, s);
  return /* @__PURE__ */ y("div", { className: "grounded-sources-card", children: [
    /* @__PURE__ */ y("div", { className: "grounded-sources-header", children: [
      /* @__PURE__ */ y("div", { className: "grounded-sources-badge", children: [
        /* @__PURE__ */ l(tr, { size: 13, className: "grounded-shield-icon" }),
        /* @__PURE__ */ y("span", { children: [
          g.length,
          " retrieved VPS sources"
        ] })
      ] }),
      !o && /* @__PURE__ */ y(
        "button",
        {
          type: "button",
          className: "grounded-toggle-btn",
          onClick: () => i((f) => !f),
          "aria-expanded": a,
          children: [
            /* @__PURE__ */ l("span", { children: a ? "Hide Details" : "Inspect Sources" }),
            a ? /* @__PURE__ */ l(Ut, { size: 12 }) : /* @__PURE__ */ l(Gt, { size: 12 })
          ]
        }
      )
    ] }),
    /* @__PURE__ */ l("div", { className: "grounded-pills-row", children: g.map((f, c) => {
      const p = ot(f), b = u === c;
      return /* @__PURE__ */ y(
        "button",
        {
          type: "button",
          className: `grounded-source-pill${b ? " grounded-source-pill--selected" : ""}`,
          onClick: () => {
            o || (i(!0), h(b ? null : c));
          },
          title: f.source,
          children: [
            /* @__PURE__ */ l(Wt, { size: 11, className: "grounded-book-icon" }),
            /* @__PURE__ */ y("span", { className: "grounded-pill-title", children: [
              "[S",
              c + 1,
              "] ",
              p
            ] }),
            /* @__PURE__ */ y("span", { className: "grounded-pill-score", title: "Ranking score, not a probability of correctness", children: [
              "Score ",
              f.score.toFixed(2)
            ] })
          ]
        },
        `${f.chunkId}-${c}`
      );
    }) }),
    !o && a && /* @__PURE__ */ l("div", { className: "grounded-sources-details-list", children: g.map((f, c) => {
      const p = ot(f), b = an(f.source);
      return /* @__PURE__ */ y(
        "div",
        {
          className: `grounded-detail-item${u === c ? " grounded-detail-item--highlighted" : ""}`,
          children: [
            /* @__PURE__ */ y("div", { className: "grounded-detail-top", children: [
              /* @__PURE__ */ y("div", { className: "grounded-detail-title-group", children: [
                /* @__PURE__ */ y("span", { className: "grounded-detail-index", children: [
                  "[",
                  c + 1,
                  "]"
                ] }),
                /* @__PURE__ */ l("span", { className: "grounded-detail-title", children: p })
              ] }),
              /* @__PURE__ */ y("div", { className: "grounded-detail-meta", children: [
                /* @__PURE__ */ y("span", { className: "grounded-detail-score", children: [
                  "Rank score ",
                  f.score.toFixed(2)
                ] }),
                b && /* @__PURE__ */ y(
                  "a",
                  {
                    href: b.path,
                    onClick: (v) => {
                      v.preventDefault(), window.location.href = b.path;
                    },
                    className: "grounded-route-link",
                    title: `Navigate to ${b.label}`,
                    children: [
                      /* @__PURE__ */ l("span", { children: b.label }),
                      /* @__PURE__ */ l(Jt, { size: 10 })
                    ]
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ l("div", { className: "grounded-detail-path", children: /* @__PURE__ */ l("code", { children: f.source }) }),
            f.snippet && /* @__PURE__ */ y("p", { className: "grounded-detail-snippet", children: [
              '"',
              f.snippet,
              '"'
            ] })
          ]
        },
        `detail-${f.chunkId}-${c}`
      );
    }) })
  ] });
};
function un(e) {
  return e === "create_ticket" ? "Support ticket processed" : e === "get_customer" ? "Account verified" : e === "get_ticket" ? "Ticket status loaded" : "Information retrieved";
}
function dn({ toolCalls: e }) {
  return e.length ? /* @__PURE__ */ l("div", { className: "tool-badges", children: e.map((t, n) => /* @__PURE__ */ l(
    "span",
    {
      className: "tool-badge",
      children: un(t.toolName)
    },
    `${t.toolName}-${n}`
  )) }) : null;
}
const hn = ({ message: e }) => {
  var g;
  const t = Je(), n = (t == null ? void 0 : t.hideInspectSources) ?? !1, r = (t == null ? void 0 : t.showGroundedSources) ?? !0, s = e.role === "user", o = e.status === "error", a = e.status === "pending", i = e.id === "welcome-default" || e.id.startsWith("welcome") || e.id === "welcome", u = !!(a || e.durationMs !== void 0 || e.sources && e.sources.length > 0 || e.toolCalls && e.toolCalls.length > 0 || e.usage);
  return /* @__PURE__ */ y("div", { className: `msg-row${s ? " msg-row--user" : ""}`, children: [
    !s && /* @__PURE__ */ l(
      "div",
      {
        className: "avatar-circle avatar-circle--mt",
        "aria-hidden": "true",
        children: /* @__PURE__ */ l(ft, { size: 15 })
      }
    ),
    /* @__PURE__ */ y("div", { className: `msg-col${s ? " msg-col--user" : ""}`, children: [
      /* @__PURE__ */ y(
        "div",
        {
          className: s ? "msg-bubble msg-bubble--user" : o ? "msg-bubble msg-bubble--error" : "msg-bubble msg-bubble--bot",
          children: [
            !s && !o && !i && u && /* @__PURE__ */ l(
              on,
              {
                status: a ? "pending" : "complete",
                progressText: e.progressText,
                durationMs: e.durationMs
              }
            ),
            a ? e.content ? /* @__PURE__ */ l("div", { className: "msg-content-wrapper msg-content-wrapper--streaming", children: /* @__PURE__ */ l("div", { className: "msg-streaming-text", children: e.content }) }) : /* @__PURE__ */ l(sn, {}) : s ? /* @__PURE__ */ l("p", { className: "msg-user-pre", children: e.content }) : /* @__PURE__ */ l("div", { className: "msg-content-wrapper", children: /* @__PURE__ */ l(nn, { text: e.content }) }),
            e.toolCalls ? /* @__PURE__ */ l(dn, { toolCalls: e.toolCalls }) : null,
            !s && !a && !o && r && ((g = e.sources) != null && g.length) ? /* @__PURE__ */ l(cn, { sources: e.sources, hideInspectSources: n }) : null
          ]
        }
      ),
      s && e.status !== "error" && /* @__PURE__ */ l(Vt, { size: 13, className: "msg-tick", "aria-hidden": "true" })
    ] })
  ] });
}, pn = () => {
  const { messages: e, status: t, showSuggestions: n } = qe();
  return /* @__PURE__ */ l(
    Jr,
    {
      autoScroll: !0,
      defaultScrollPosition: "last-anchor",
      scrollPreviousItemPeek: 64,
      children: /* @__PURE__ */ y(Kr, { children: [
        /* @__PURE__ */ l(Qr, { "aria-label": "Chat messages", children: /* @__PURE__ */ y(Xr, { "aria-busy": t === "awaiting" || t === "connecting", children: [
          e.length === 0 && /* @__PURE__ */ l(st, { messageId: "welcome", children: /* @__PURE__ */ l(en, {}) }),
          e.map((s) => /* @__PURE__ */ l(
            st,
            {
              messageId: s.id,
              scrollAnchor: s.role === "user",
              children: /* @__PURE__ */ l(hn, { message: s })
            },
            s.id
          ))
        ] }) }),
        /* @__PURE__ */ l(Zr, {})
      ] })
    }
  );
}, fn = () => {
  const { pendingTicket: e, ticketBusy: t, userContext: n, confirmTicket: r, cancelTicket: s } = qe(), o = !n.customerId && !n.email, [a, i] = J("");
  return e ? /* @__PURE__ */ y(
    "div",
    {
      className: "ticket-card",
      role: "region",
      "aria-label": "Create support ticket",
      children: [
        /* @__PURE__ */ l("h3", { className: "ticket-card-title", children: "Create support ticket?" }),
        /* @__PURE__ */ l("p", { className: "ticket-card-desc", children: "I can open a support request for you. Nothing is created until you confirm." }),
        /* @__PURE__ */ l("p", { className: "ticket-card-body", children: e.description }),
        o && /* @__PURE__ */ y("label", { className: "ticket-id-label", children: [
          "Customer ID or email",
          /* @__PURE__ */ l(
            "input",
            {
              value: a,
              onChange: (u) => i(u.target.value),
              className: "ticket-id-input",
              placeholder: "CUST-1001 or you@company.com",
              autoComplete: "email"
            }
          )
        ] }),
        /* @__PURE__ */ y("div", { className: "ticket-actions", children: [
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
}, Ft = ({
  className: e,
  onClose: t,
  showMinimize: n,
  title: r,
  subtitle: s,
  envStage: o,
  envPulse: a = !0
}) => {
  const { sendMessage: i, status: u, error: h, resetConversation: g, retryLast: f, pendingTicket: c } = qe(), p = u === "awaiting" || u === "connecting" || !!c;
  return /* @__PURE__ */ y(
    "section",
    {
      className: `chat-panel${e ? ` ${e}` : ""}`,
      "aria-label": "VPS AI Assistant",
      children: [
        /* @__PURE__ */ l(
          ar,
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
        /* @__PURE__ */ l("div", { className: "chat-panel-body", children: /* @__PURE__ */ l(pn, {}) }),
        h && u === "error" && /* @__PURE__ */ l(xt, { message: h, onRetry: () => void f() }),
        /* @__PURE__ */ l(fn, {}),
        /* @__PURE__ */ l(
          dr,
          {
            onSend: (b) => void i(b),
            disabled: p
          }
        )
      ]
    }
  );
}, mn = ({
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
      Ft,
      {
        onClose: t,
        showMinimize: !0,
        title: "VPS AI Assistant",
        envStage: n,
        envPulse: r
      }
    )
  }
) : null, gn = ({
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
    children: e ? /* @__PURE__ */ l(nr, { size: 22 }) : /* @__PURE__ */ l(mt, { size: 24 })
  }
), lt = ({
  defaultOpen: e = !1,
  open: t,
  onOpenChange: n,
  envStage: r,
  envPulse: s = !0
}) => {
  const [o, a] = J(e), i = t ?? o, u = (h) => {
    n == null || n(h), t === void 0 && a(h);
  };
  return /* @__PURE__ */ y(Le, { children: [
    /* @__PURE__ */ l(
      mn,
      {
        open: i,
        onClose: () => u(!1),
        envStage: r,
        envPulse: s
      }
    ),
    /* @__PURE__ */ l(gn, { open: i, onToggle: () => u(!i) })
  ] });
}, Tn = ({
  apiBaseUrl: e,
  apiUrl: t,
  proxyUrl: n,
  userContext: r,
  role: s,
  roleId: o,
  client: a,
  welcomeMessage: i,
  suggestions: u,
  disableSuggestions: h,
  initialMessage: g,
  hideInspectSources: f,
  showGroundedSources: c,
  modelId: p,
  ...b
}) => {
  const C = Je(), v = e ?? t ?? n;
  return !!C && (!v || ye(v) === ye(C == null ? void 0 : C.apiBaseUrl)) && !r && s === void 0 && o === void 0 && a === void 0 && i === void 0 && !u && h === void 0 && !g && f === void 0 && c === void 0 && p === void 0 ? /* @__PURE__ */ l(lt, { ...b }) : /* @__PURE__ */ l(
    ht,
    {
      apiBaseUrl: v,
      userContext: r,
      role: s,
      roleId: o,
      client: a,
      welcomeMessage: i,
      suggestions: u,
      disableSuggestions: h,
      initialMessage: g,
      hideInspectSources: f,
      showGroundedSources: c,
      modelId: p,
      children: /* @__PURE__ */ l(lt, { ...b })
    }
  );
}, bn = ({
  open: e,
  onClose: t,
  subtitle: n,
  title: r,
  envStage: s,
  envPulse: o = !0
}) => /* @__PURE__ */ y(Le, { children: [
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
        Ft,
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
] }), vn = 5, Ve = 8, Tt = "vps-embedded-assistant-top";
function wn(e, t, n) {
  return Math.min(n, Math.max(t, e));
}
function at(e, t) {
  const n = Math.max(
    Ve,
    window.innerHeight - t - Ve
  );
  return wn(e, Ve, n);
}
function _n() {
  try {
    const e = window.localStorage.getItem(Tt);
    if (!e) return null;
    const t = Number(e);
    return Number.isFinite(t) ? t : null;
  } catch {
    return null;
  }
}
function yn(e) {
  try {
    window.localStorage.setItem(Tt, String(e));
  } catch {
  }
}
const kn = ({
  onOpen: e
}) => {
  const t = te(null), n = te({
    pointerId: null,
    startY: 0,
    startTop: 0,
    moved: !1
  }), [r, s] = J(
    () => typeof window > "u" ? null : _n()
  ), o = te(r), a = te(!1), [i, u] = J(!1);
  Te(() => {
    o.current = r;
  }, [r]), Te(() => {
    const c = t.current;
    if (!c) return;
    const p = () => {
      s((b) => {
        const C = b ?? Math.round(window.innerHeight / 2 - c.offsetHeight / 2), v = at(C, c.offsetHeight);
        return o.current = v, v;
      });
    };
    return p(), window.addEventListener("resize", p), () => window.removeEventListener("resize", p);
  }, []);
  const h = (c) => {
    if (c.button !== 0) return;
    const p = c.currentTarget, b = p.getBoundingClientRect();
    n.current = {
      pointerId: c.pointerId,
      startY: c.clientY,
      startTop: b.top,
      moved: !1
    };
    try {
      p.setPointerCapture(c.pointerId);
    } catch {
    }
  }, g = (c) => {
    if (n.current.pointerId !== c.pointerId) return;
    const p = c.clientY - n.current.startY;
    if (!n.current.moved && Math.abs(p) < vn) return;
    n.current.moved = !0, u(!0);
    const b = at(
      n.current.startTop + p,
      c.currentTarget.offsetHeight
    );
    o.current = b, s(b);
  }, f = (c) => {
    var b, C;
    if (n.current.pointerId !== c.pointerId) return;
    try {
      (C = (b = c.currentTarget).hasPointerCapture) != null && C.call(b, c.pointerId) && c.currentTarget.releasePointerCapture(c.pointerId);
    } catch {
    }
    const p = n.current.moved;
    n.current.pointerId = null, n.current.moved = !1, u(!1), p && (a.current = !0, o.current != null && yn(o.current));
  };
  return /* @__PURE__ */ y(
    "button",
    {
      ref: t,
      type: "button",
      onPointerDown: h,
      onPointerMove: g,
      onPointerUp: f,
      onPointerCancel: f,
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
        /* @__PURE__ */ l(mt, { size: 16 }),
        "Assistant"
      ]
    }
  );
}, it = ({
  defaultOpen: e = !1,
  open: t,
  onOpenChange: n,
  showTrigger: r = !0,
  envStage: s,
  envPulse: o = !0
}) => {
  const [a, i] = J(e), u = t ?? a, h = (g) => {
    n == null || n(g), t === void 0 && i(g);
  };
  return /* @__PURE__ */ y(Le, { children: [
    r && !u && /* @__PURE__ */ l(kn, { onOpen: () => h(!0) }),
    /* @__PURE__ */ l(
      bn,
      {
        open: u,
        onClose: () => h(!1),
        envStage: s,
        envPulse: o
      }
    )
  ] });
}, Rn = ({
  apiBaseUrl: e,
  apiUrl: t,
  proxyUrl: n,
  userContext: r,
  role: s,
  roleId: o,
  client: a,
  welcomeMessage: i,
  suggestions: u,
  disableSuggestions: h,
  initialMessage: g,
  hideInspectSources: f,
  showGroundedSources: c,
  modelId: p,
  ...b
}) => {
  const C = Je(), v = e ?? t ?? n;
  return !!C && (!v || ye(v) === ye(C == null ? void 0 : C.apiBaseUrl)) && !r && s === void 0 && o === void 0 && a === void 0 && i === void 0 && !u && h === void 0 && !g && f === void 0 && c === void 0 && p === void 0 ? /* @__PURE__ */ l(it, { ...b }) : /* @__PURE__ */ l(
    ht,
    {
      apiBaseUrl: v,
      userContext: r,
      role: s,
      roleId: o,
      client: a,
      welcomeMessage: i,
      suggestions: u,
      disableSuggestions: h,
      initialMessage: g,
      hideInspectSources: f,
      showGroundedSources: c,
      modelId: p,
      children: /* @__PURE__ */ l(it, { ...b })
    }
  );
}, En = {
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
  Ft as ChatPanel,
  ht as ChatProvider,
  Tn as ChatbotWidget,
  En as ColorPalette,
  Rn as EmbeddedChatbot,
  Oe as buildApiUrl,
  Fn as chatApi,
  dt as createChatApi,
  ye as resolveApiBaseUrl,
  Dt as useChatContext,
  qe as useChatbot,
  Je as useOptionalChatContext
};
