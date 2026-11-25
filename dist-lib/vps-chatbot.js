var Jc = Object.defineProperty;
var Zc = (e, t, n) => t in e ? Jc(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n;
var ae = (e, t, n) => Zc(e, typeof t != "symbol" ? t + "" : t, n);
import { jsx as b, jsxs as U, Fragment as zt } from "react/jsx-runtime";
import * as y from "react";
import ze, { useState as Se, useRef as Ae, useEffect as qe, useCallback as Ve, createContext as Qn, useContext as Wt, useMemo as Mt, forwardRef as Js, createElement as tn, useId as Ar, useImperativeHandle as Qc, useLayoutEffect as ea, lazy as ta, Suspense as na } from "react";
import * as bt from "react-dom";
const ra = {};
function Lt(e) {
  return e != null && e.trim() !== "" ? e.trim().replace(/\/+$/, "") : String("").trim().replace(/\/+$/, "");
}
function dr(e, t) {
  const n = Lt(e);
  if (!n)
    return t;
  if (n.endsWith("/api") && t.startsWith("/api/"))
    return `${n}${t.slice(4)}`;
  if (n.endsWith("/api") && t === "/health") {
    const o = n.slice(0, -4);
    return o ? `${o}/health` : "/health";
  }
  const r = t.startsWith("/") ? t : `/${t}`;
  return `${n}${r}`;
}
function Jo(e) {
  return e && typeof e == "object" && "data" in e && e.success !== !1 ? e.data : e;
}
function Zo(e, t, n) {
  var s, i, c;
  const r = e, o = (s = r == null ? void 0 : r.error) == null ? void 0 : s.message;
  return o && !oa(o) ? {
    code: (i = r == null ? void 0 : r.error) == null ? void 0 : i.code,
    message: o,
    requestId: (c = r == null ? void 0 : r.error) == null ? void 0 : c.request_id
  } : n >= 500 ? { message: "I couldn't process that request right now." } : n === 0 ? { message: "Something went wrong while connecting. Please try again." } : { message: t };
}
function oa(e) {
  return /traceback|sql|exception|stack|api[_ ]?key|password/i.test(e);
}
function pr(e) {
  return {
    chunkId: e.chunk_id,
    source: e.source,
    score: e.score,
    title: e.title,
    ...e.url ? { url: e.url } : {},
    snippet: e.snippet
  };
}
function hr(e) {
  return {
    toolName: e.tool_name,
    arguments: e.arguments ?? {},
    result: e.result ?? {}
  };
}
function gr(e) {
  return {
    model: e.model,
    promptTokens: e.prompt_tokens,
    completionTokens: e.completion_tokens,
    totalTokens: e.total_tokens
  };
}
function sa(e) {
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
async function mr(e) {
  const t = await e.text();
  if (!t) return {};
  try {
    return JSON.parse(t);
  } catch {
    return {};
  }
}
function Zs(e) {
  const t = Lt(e);
  async function n(r, o) {
    let s;
    const i = dr(t, r);
    try {
      s = await fetch(i, {
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
    const c = await mr(s);
    if (!s.ok)
      throw Zo(
        c,
        "I couldn't process that request right now.",
        s.status
      );
    return Jo(c);
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
      const o = await n("/api/v1/sessions", {
        method: "POST",
        signal: r,
        body: JSON.stringify({})
      });
      return { sessionId: o.session_id, createdAt: o.created_at };
    },
    async sendMessage(r, o, s, i) {
      const c = await n(
        `/api/v1/sessions/${r}/messages`,
        {
          method: "POST",
          signal: i,
          body: JSON.stringify({
            message: o,
            ...(s == null ? void 0 : s.roleId) !== void 0 ? { role_id: s.roleId } : {},
            ...s != null && s.client ? { client: s.client } : {},
            ...s != null && s.modelId ? { model_id: s.modelId } : {}
          })
        }
      );
      return {
        requestId: c.request_id,
        sessionId: c.session_id,
        answer: c.answer,
        sources: (c.sources || []).map(pr),
        toolCalls: (c.tool_calls || []).map(hr),
        usage: gr(c.usage),
        durationMs: c.duration_ms
      };
    },
    async sendMessageStream(r, o, s, i, c, a) {
      var u, f;
      const l = dr(t, `/api/v1/sessions/${r}/messages/stream`);
      try {
        const p = await fetch(l, {
          method: "POST",
          signal: a,
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            message: o,
            ...(s == null ? void 0 : s.roleId) !== void 0 ? { role_id: s.roleId } : {},
            ...s != null && s.client ? { client: s.client } : {},
            ...s != null && s.modelId ? { model_id: s.modelId } : {}
          })
        });
        if (!p.ok) {
          if (p.status === 404 || p.status === 405)
            return await this.sendMessage(r, o, s, a);
          const w = await mr(p);
          throw Zo(
            w,
            "I couldn't process that request right now.",
            p.status
          );
        }
        if (!p.body || (f = (u = p.headers) == null ? void 0 : u.get("content-type")) != null && f.includes("application/json")) {
          const w = Jo(await mr(p));
          if (typeof w.answer != "string" || !w.usage)
            throw { message: "The response stream ended unexpectedly." };
          return {
            requestId: w.request_id,
            sessionId: w.session_id,
            answer: w.answer,
            sources: (w.sources || []).map(pr),
            toolCalls: (w.tool_calls || []).map(hr),
            usage: gr(w.usage),
            durationMs: w.duration_ms
          };
        }
        const h = p.body.getReader(), d = new TextDecoder();
        let g = "";
        const m = { value: null }, v = (w) => {
          const E = w.split(/\r?\n/).filter((S) => S.startsWith("data:")).map((S) => S.slice(5).trimStart()).join(`
`);
          if (!E) return;
          let T = {};
          try {
            const S = JSON.parse(E);
            if (!S || typeof S != "object") return;
            T = S;
          } catch {
            return;
          }
          if (T.type === "progress" && typeof T.stage == "string")
            i == null || i(T.stage);
          else if (T.type === "token" && typeof T.text == "string")
            c == null || c(T.text);
          else if (T.type === "complete")
            m.value = {
              requestId: T.request_id || "",
              sessionId: T.session_id || r,
              answer: T.answer || "",
              sources: (T.sources || []).map(pr),
              toolCalls: (T.tool_calls || []).map(hr),
              usage: T.usage ? gr(T.usage) : { model: "", promptTokens: 0, completionTokens: 0, totalTokens: 0 },
              durationMs: T.duration_ms
            };
          else if (T.type === "error")
            throw {
              message: T.message || "I couldn't process that request right now.",
              requestId: T.request_id
            };
        };
        try {
          for (; !m.value; ) {
            const { done: w, value: E } = await h.read();
            if (w) break;
            if (g += d.decode(E, { stream: !0 }), g.length > 1e6)
              throw { message: "The response stream was too large." };
            const T = g.split(/\r?\n\r?\n/);
            g = T.pop() || "";
            for (const S of T)
              if (v(S), m.value) break;
          }
          g += d.decode(), !m.value && g.trim() && v(g);
        } finally {
          await h.cancel().catch(() => {
          }), h.releaseLock();
        }
        const C = m.value;
        if (C)
          return C;
        throw { message: "The response stream ended before the answer was complete." };
      } catch (p) {
        throw !(p instanceof Error) && p && typeof p == "object" && "message" in p ? p : { message: "Something went wrong while connecting. Please try again." };
      }
    },
    async getHistory(r) {
      try {
        return ((await n(
          `/api/v1/sessions/${r}/messages`
        )).messages || []).map(sa);
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
        const r = dr(t, "/health");
        return (await fetch(r)).ok;
      } catch {
        return !1;
      }
    }
  };
}
const Ag = Zs(), ia = [
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
], Qo = "vps-chatbot-response-sound";
function ca() {
  const [e, t] = Se(!0), n = Ae(!0), r = Ae(null);
  qe(() => {
    try {
      n.current = window.localStorage.getItem(Qo) !== "off", t(n.current);
    } catch {
    }
    return () => {
      var c;
      (c = r.current) == null || c.close().catch(() => {
      }), r.current = null;
    };
  }, []);
  const o = Ve(() => {
    if (!(!n.current || typeof AudioContext > "u"))
      try {
        const c = r.current ?? (r.current = new AudioContext());
        c.state !== "running" && c.resume().catch(() => {
        });
      } catch {
      }
  }, []), s = Ve(() => {
    const c = !n.current;
    n.current = c, t(c);
    try {
      window.localStorage.setItem(Qo, c ? "on" : "off");
    } catch {
    }
    c && o();
  }, [o]), i = Ve(() => {
    const c = r.current;
    if (!(!n.current || (c == null ? void 0 : c.state) !== "running"))
      try {
        const a = c.currentTime;
        for (const [l, u] of [660, 880].entries()) {
          const f = a + l * 0.09, p = c.createOscillator(), h = c.createGain();
          p.frequency.value = u, h.gain.setValueAtTime(1e-3, f), h.gain.exponentialRampToValueAtTime(0.06, f + 0.015), h.gain.exponentialRampToValueAtTime(1e-3, f + 0.14), p.connect(h), h.connect(c.destination), p.onended = () => {
            p.disconnect(), h.disconnect();
          }, p.start(f), p.stop(f + 0.15);
        }
      } catch {
      }
  }, []);
  return { soundEnabled: e, toggleSound: s, prepareSound: o, playSound: i };
}
const to = Qn(null);
function aa() {
  const e = Wt(to);
  if (!e)
    throw new Error("useChatbot must be used inside ChatProvider.");
  return e;
}
function no() {
  return Wt(to);
}
function At(e, t, n, r) {
  if (typeof performance.measure != "function") return;
  const o = `vps-chatbot:${e}`;
  performance.clearMeasures(o), performance.measure(o, { start: t, end: n, detail: r ? { requestId: r } : null });
}
const la = `Hello! I am your **VPS Veritas assistant**.

I can help you with:
- **Fuel Quality Testing (FQT)** & **Oil Condition Monitoring (OCM)**
- **Fuel Defect Reporting (FDR)** — report and track bunker defect incidents
- **Bunker Master** — manage bunkering operations, BDN logs, and surveys
- **FSC & FSQ E-Forms** — paperless fuel system checks and bunker sample pre-registration
- **Samplogic** sample logistics, report downloads, and support tickets

Feel free to ask a question or select one of the suggested topics below!`;
function es(e) {
  return `${e}-${crypto.randomUUID()}`;
}
function ua(e) {
  if (e && typeof e == "object" && "message" in e) {
    const t = String(e.message);
    if (t && !/traceback|sql|exception|stack|api[_ ]?key|password/i.test(t))
      return t;
  }
  return "I couldn't process that request right now.";
}
const Qs = ({
  children: e,
  userContext: t = {},
  role: n,
  roleId: r,
  client: o,
  welcomeMessage: s,
  suggestions: i = ia,
  disableSuggestions: c = !1,
  initialMessage: a,
  apiBaseUrl: l,
  apiUrl: u,
  proxyUrl: f,
  api: p,
  hideInspectSources: h = !1,
  showGroundedSources: d = !1,
  modelId: g = "auto"
}) => {
  const m = l ?? u ?? f, v = Mt(
    () => p ?? Zs(m),
    [p, m]
  ), C = Mt(() => ({
    ...t,
    ...n !== void 0 ? { role: n } : {},
    ...r !== void 0 ? { roleId: r } : {},
    ...o !== void 0 ? { client: o } : {}
  }), [t, n, r, o]), w = Mt(() => s === "" ? null : {
    id: "welcome-default",
    role: "assistant",
    content: s || la,
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    status: "complete"
  }, [s]), [E, T] = Se(null), [S, R] = Se(() => w ? [w] : []), [P, O] = Se("idle"), [M, F] = Se(null), A = Ae(null), D = Ae(!1), I = Ae(null), x = Ae(null), _ = Ae(!1), [z, N] = Se([]), [k, Y] = Se(g), { soundEnabled: K, toggleSound: le, prepareSound: ie, playSound: L } = ca();
  ze.useEffect(() => Y(g), [g]), ze.useEffect(() => {
    var J;
    let W = !0;
    return N([]), (J = v.listModels) == null || J.call(v).then((ce) => {
      W && N((ce == null ? void 0 : ce.models) || []);
    }).catch(() => {
    }), () => {
      W = !1;
    };
  }, [v]);
  const X = Ve((W) => {
    !_.current && (W === "auto" || z.some((J) => J.id === W && J.configured)) && Y(W);
  }, [z]);
  ze.useEffect(() => () => {
    var W;
    return (W = I.current) == null ? void 0 : W.abort();
  }, []), ze.useLayoutEffect(() => {
    const W = x.current;
    if (!W) return;
    const J = S.find((he) => he.id === W.messageId), ce = performance.now();
    (J == null ? void 0 : J.status) === "complete" && W.completedAt !== void 0 ? (At("completion-to-commit", W.completedAt, ce), At("submit-to-complete-commit", W.startedAt, ce), x.current = null) : (J == null ? void 0 : J.status) === "pending" && J.content && W.firstTokenAt !== void 0 && !W.firstCommitRecorded && (At("first-token-to-commit", W.firstTokenAt, ce), W.firstCommitRecorded = !0);
  }, [S]);
  const B = Ve(async (W) => {
    if (E) return E;
    O("connecting");
    const J = await v.createSession(W);
    if (W.aborted) throw new DOMException("Aborted", "AbortError");
    return T(J.sessionId), J.sessionId;
  }, [E, v]), $ = Ve(
    async (W) => {
      if (_.current) return;
      ie(), _.current = !0;
      const J = new AbortController();
      I.current = J;
      let ce, he = "";
      const Ie = () => {
        ce !== void 0 && cancelAnimationFrame(ce), ce = void 0;
      };
      A.current = W;
      const Fe = {
        id: es("user"),
        role: "user",
        content: W,
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        status: "complete"
      }, xe = es("asst"), Le = "Preparing your answer…", Ue = {
        id: xe,
        streamId: xe,
        role: "assistant",
        content: "",
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        status: "pending",
        progressText: Le,
        progressSteps: [Le]
      }, H = performance.now(), G = { messageId: xe, startedAt: H };
      x.current = G, R((be) => [...be, Fe, Ue]), O("awaiting"), F(null);
      const we = (be) => {
        const ge = be.trim();
        !ge || J.signal.aborted || R(
          (V) => V.map(
            (j) => j.id === xe && j.progressText !== ge ? {
              ...j,
              progressText: ge,
              progressSteps: [...j.progressSteps ?? [], ge]
            } : j
          )
        );
      };
      try {
        const be = await B(J.signal), ge = performance.now();
        At("request-preparation", H, ge);
        const V = v.sendMessageStream ? await v.sendMessageStream(
          be,
          W,
          {
            roleId: C.roleId,
            client: C.client,
            modelId: k
          },
          we,
          (j) => {
            J.signal.aborted || (j && G.firstTokenAt === void 0 && (G.firstTokenAt = performance.now(), At("first-token-received", ge, G.firstTokenAt)), he += j, ce === void 0 && (ce = requestAnimationFrame(() => {
              ce = void 0, J.signal.aborted || R((Z) => Z.map((se) => se.id === xe ? { ...se, content: he } : se));
            })));
          },
          J.signal
        ) : await v.sendMessage(be, W, {
          roleId: C.roleId,
          client: C.client,
          modelId: k
        }, J.signal);
        if (Ie(), J.signal.aborted) return;
        G.messageId = V.requestId || xe, G.completedAt = performance.now(), At("completion-received", ge, G.completedAt, V.requestId), R(
          (j) => j.map(
            (Z) => Z.id === xe ? {
              ...Z,
              id: V.requestId || xe,
              content: V.answer,
              status: "complete",
              progressText: void 0,
              sources: V.sources,
              toolCalls: V.toolCalls,
              usage: V.usage,
              durationMs: Math.max(
                Math.round(performance.now() - H),
                V.durationMs ?? 0
              )
            } : Z
          )
        ), O("idle"), L();
      } catch (be) {
        if (Ie(), x.current === G && (x.current = null), J.signal.aborted) return;
        const ge = ua(be);
        R(
          (V) => V.map(
            (j) => j.id === xe ? { ...j, content: ge, status: "error", progressText: void 0 } : j
          )
        ), F(ge), O("error");
      } finally {
        Ie(), I.current === J && (I.current = null, _.current = !1);
      }
    },
    [B, v, C.client, C.roleId, k, ie, L]
  ), Q = Ve(
    async (W) => {
      const J = W.trim();
      !J || P === "awaiting" || P === "connecting" || await $(J);
    },
    [$, P]
  ), re = Ve(async () => {
    if (_.current) return;
    const W = A.current;
    W && (R((J) => J.filter((ce) => ce.status !== "error")), await $(W));
  }, [$]), ee = Ve(() => {
    const W = I.current;
    W && (W.abort(), I.current = null, _.current = !1, x.current = null, R((J) => J.map(
      (ce) => ce.status === "pending" ? { ...ce, status: "stopped", progressText: void 0 } : ce
    )), O("idle"));
  }, []), te = Ve(
    (W, J) => {
      R((ce) => ce.map(
        (he) => he.id === W ? { ...he, feedback: he.feedback === J ? void 0 : J } : he
      ));
    },
    []
  ), q = Ve(async () => {
  }, []), ne = Ve(() => {
  }, []), oe = Ve(async () => {
    var W;
    (W = I.current) == null || W.abort(), I.current = null, _.current = !1, T(null), R(w ? [w] : []), O("idle"), F(null), A.current = null, E && await v.closeSession(E);
  }, [E, v, w]);
  ze.useEffect(() => {
    !a || D.current || (D.current = !0, Q(a));
  }, [a, Q]);
  const ve = Mt(
    () => ({
      messages: S,
      status: P,
      error: M,
      sessionId: E,
      pendingTicket: null,
      ticketBusy: !1,
      lastTicket: null,
      suggestions: i,
      showSuggestions: !c && P === "idle" && (S.length === 0 || S.length === 1 && S[0].id === "welcome-default" || S.some((W) => W.role === "assistant" && W.status === "complete" && !W.id.startsWith("welcome"))),
      suggestionBadgesEnabled: !c,
      userContext: C,
      apiBaseUrl: v.apiBaseUrl,
      hideInspectSources: h,
      showGroundedSources: d,
      soundEnabled: K,
      toggleSound: le,
      sendMessage: Q,
      stopResponse: ee,
      toggleMessageFeedback: te,
      retryLast: re,
      confirmTicket: q,
      cancelTicket: ne,
      resetConversation: oe,
      models: z,
      selectedModelId: k,
      selectModel: X
    }),
    [
      S,
      P,
      M,
      E,
      i,
      c,
      C,
      v.apiBaseUrl,
      h,
      d,
      K,
      le,
      Q,
      ee,
      te,
      re,
      q,
      ne,
      oe,
      z,
      k,
      X
    ]
  );
  return /* @__PURE__ */ b(to.Provider, { value: ve, children: e });
};
function ei(e) {
  var t, n, r = "";
  if (typeof e == "string" || typeof e == "number") r += e;
  else if (typeof e == "object") if (Array.isArray(e)) {
    var o = e.length;
    for (t = 0; t < o; t++) e[t] && (n = ei(e[t])) && (r && (r += " "), r += n);
  } else for (n in e) e[n] && (r && (r += " "), r += n);
  return r;
}
function ti() {
  for (var e, t, n = 0, r = "", o = arguments.length; n < o; n++) (e = arguments[n]) && (t = ei(e)) && (r && (r += " "), r += t);
  return r;
}
function ue(...e) {
  return ti(e);
}
function ni({
  className: e,
  variant: t = "default",
  ...n
}) {
  return /* @__PURE__ */ b("div", { ...n, "data-slot": "marker", "data-variant": t, className: ue("chat-marker", e) });
}
function fa({ className: e, ...t }) {
  return /* @__PURE__ */ b("span", { ...t, "data-slot": "marker-icon", className: ue("chat-marker-icon", e), "aria-hidden": "true" });
}
function ri({ className: e, ...t }) {
  return /* @__PURE__ */ b("span", { ...t, "data-slot": "marker-content", className: ue("chat-marker-content", e) });
}
function er() {
  return aa();
}
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const da = (e) => e.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase(), oi = (...e) => e.filter((t, n, r) => !!t && t.trim() !== "" && r.indexOf(t) === n).join(" ").trim();
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
var pa = {
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
const ha = Js(
  ({
    color: e = "currentColor",
    size: t = 24,
    strokeWidth: n = 2,
    absoluteStrokeWidth: r,
    className: o = "",
    children: s,
    iconNode: i,
    ...c
  }, a) => tn(
    "svg",
    {
      ref: a,
      ...pa,
      width: t,
      height: t,
      stroke: e,
      strokeWidth: r ? Number(n) * 24 / Number(t) : n,
      className: oi("lucide", o),
      ...c
    },
    [
      ...i.map(([l, u]) => tn(l, u)),
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
const ye = (e, t) => {
  const n = Js(
    ({ className: r, ...o }, s) => tn(ha, {
      ref: s,
      iconNode: t,
      className: oi(`lucide-${da(e)}`, r),
      ...o
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
const ga = ye("ArrowDown", [
  ["path", { d: "M12 5v14", key: "s699le" }],
  ["path", { d: "m19 12-7 7-7-7", key: "1idqje" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const ma = ye("ArrowLeft", [
  ["path", { d: "m12 19-7-7 7-7", key: "1l729n" }],
  ["path", { d: "M19 12H5", key: "x3x0zl" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const ba = ye("ArrowUp", [
  ["path", { d: "m5 12 7-7 7 7", key: "hav0vg" }],
  ["path", { d: "M12 19V5", key: "x0mq9r" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const va = ye("BookOpen", [
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
const ya = ye("BotMessageSquare", [
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
const ro = ye("Check", [["path", { d: "M20 6 9 17l-5-5", key: "1gmf2c" }]]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Ca = ye("ChevronLeft", [
  ["path", { d: "m15 18-6-6 6-6", key: "1wnfg3" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const si = ye("ChevronRight", [
  ["path", { d: "m9 18 6-6-6-6", key: "mthhwq" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Ea = ye("CircleAlert", [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["line", { x1: "12", x2: "12", y1: "8", y2: "12", key: "1pkeuh" }],
  ["line", { x1: "12", x2: "12.01", y1: "16", y2: "16", key: "4dfq90" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const ii = ye("CircleCheck", [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["path", { d: "m9 12 2 2 4-4", key: "dzmm74" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const wa = ye("ClipboardCheck", [
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
const ci = ye("Copy", [
  ["rect", { width: "14", height: "14", x: "8", y: "8", rx: "2", ry: "2", key: "17jyea" }],
  ["path", { d: "M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2", key: "zix9uf" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Sa = ye("ExternalLink", [
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
const Ta = ye("FlaskConical", [
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
const Ra = ye("Library", [
  ["path", { d: "m16 6 4 14", key: "ji33uf" }],
  ["path", { d: "M12 6v14", key: "1n7gus" }],
  ["path", { d: "M8 8v12", key: "1gg7y9" }],
  ["path", { d: "M4 4v16", key: "6qkkli" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const ai = ye("LoaderCircle", [
  ["path", { d: "M21 12a9 9 0 1 1-6.219-8.56", key: "13zald" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const xa = ye("MessageSquare", [
  ["path", { d: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z", key: "1lielz" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Pa = ye("Microscope", [
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
const Oa = ye("Minus", [["path", { d: "M5 12h14", key: "1ays0h" }]]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Ia = ye("Pencil", [
  [
    "path",
    {
      d: "M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z",
      key: "1a8usu"
    }
  ],
  ["path", { d: "m15 5 4 4", key: "1mk7zo" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const _a = ye("RefreshCw", [
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
const li = ye("Square", [
  ["rect", { width: "18", height: "18", x: "3", y: "3", rx: "2", key: "afitv7" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Aa = ye("TestTubeDiagonal", [
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
const ka = ye("ThumbsDown", [
  ["path", { d: "M17 14V2", key: "8ymqnk" }],
  [
    "path",
    {
      d: "M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22a3.13 3.13 0 0 1-3-3.88Z",
      key: "m61m77"
    }
  ]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Na = ye("ThumbsUp", [
  ["path", { d: "M7 10v12", key: "1qc93n" }],
  [
    "path",
    {
      d: "M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z",
      key: "emmmcr"
    }
  ]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Ma = ye("Volume2", [
  [
    "path",
    {
      d: "M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z",
      key: "uqj9uw"
    }
  ],
  ["path", { d: "M16 9a5 5 0 0 1 0 6", key: "1q6k2b" }],
  ["path", { d: "M19.364 18.364a9 9 0 0 0 0-12.728", key: "ijwkga" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Da = ye("VolumeX", [
  [
    "path",
    {
      d: "M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z",
      key: "uqj9uw"
    }
  ],
  ["line", { x1: "22", x2: "16", y1: "9", y2: "15", key: "1ewh16" }],
  ["line", { x1: "16", x2: "22", y1: "9", y2: "15", key: "5ykzw1" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Fa = ye("Wrench", [
  [
    "path",
    {
      d: "M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z",
      key: "cbrjhi"
    }
  ]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const La = ye("X", [
  ["path", { d: "M18 6 6 18", key: "1bl5f8" }],
  ["path", { d: "m6 6 12 12", key: "d8bk6v" }]
]);
function oo({
  align: e = "start",
  className: t,
  ...n
}) {
  return /* @__PURE__ */ b("div", { ...n, "data-slot": "message", "data-align": e, className: ue("chat-message", t) });
}
function ui({ className: e, ...t }) {
  return /* @__PURE__ */ b("div", { ...t, "data-slot": "message-avatar", className: ue("chat-message-avatar", e) });
}
function so({ className: e, ...t }) {
  return /* @__PURE__ */ b("div", { ...t, "data-slot": "message-content", className: ue("chat-message-content", e) });
}
function Ba({ className: e, ...t }) {
  return /* @__PURE__ */ b("div", { ...t, "data-slot": "message-header", className: ue("chat-message-header", e) });
}
function kr({ className: e, ...t }) {
  return /* @__PURE__ */ b("div", { ...t, "data-slot": "message-footer", className: ue("chat-message-footer", e) });
}
const it = {
  ...y
}, ts = {};
function et(e, t) {
  const n = y.useRef(ts);
  return n.current === ts && (n.current = e(t)), n;
}
const br = it.useInsertionEffect, Va = (
  // React 17 doesn't have useInsertionEffect.
  br && // Preact replaces useInsertionEffect with useLayoutEffect and fires too late.
  br !== it.useLayoutEffect ? br : (e) => e()
);
function fe(e) {
  const t = et($a).current;
  return t.next = e, Va(t.effect), t.trampoline;
}
function $a() {
  const e = {
    next: void 0,
    callback: Ha,
    trampoline: (...t) => {
      var n;
      return (n = e.callback) == null ? void 0 : n.call(e, ...t);
    },
    effect: () => {
      e.callback = e.next;
    }
  };
  return e;
}
function Ha() {
  if (process.env.NODE_ENV !== "production")
    throw (
      /* minify-error-disabled */
      new Error("Base UI: Cannot call an event handler while rendering.")
    );
}
function Nr(e, t, n, r) {
  const o = et(fi).current;
  return za(o, e, t, n, r) && di(o, [e, t, n, r]), o.callback;
}
function Ua(e) {
  const t = et(fi).current;
  return Wa(t, e) && di(t, e), t.callback;
}
function fi() {
  return {
    callback: null,
    cleanup: null,
    refs: []
  };
}
function za(e, t, n, r, o) {
  return e.refs[0] !== t || e.refs[1] !== n || e.refs[2] !== r || e.refs[3] !== o;
}
function Wa(e, t) {
  return e.refs.length !== t.length || e.refs.some((n, r) => n !== t[r]);
}
function di(e, t) {
  if (e.refs = t, t.every((n) => n == null)) {
    e.callback = null;
    return;
  }
  e.callback = (n) => {
    if (e.cleanup && (e.cleanup(), e.cleanup = null), n != null) {
      const r = Array(t.length).fill(null);
      for (let o = 0; o < t.length; o += 1) {
        const s = t[o];
        if (s != null)
          switch (typeof s) {
            case "function": {
              const i = s(n);
              typeof i == "function" && (r[o] = i);
              break;
            }
            case "object": {
              s.current = n;
              break;
            }
          }
      }
      e.cleanup = () => {
        for (let o = 0; o < t.length; o += 1) {
          const s = t[o];
          if (s != null)
            switch (typeof s) {
              case "function": {
                const i = r[o];
                typeof i == "function" ? i() : s(null);
                break;
              }
              case "object": {
                s.current = null;
                break;
              }
            }
        }
      };
    }
  };
}
const qa = parseInt(y.version, 10);
function pi(e) {
  return qa >= e;
}
function ns(e) {
  if (!/* @__PURE__ */ y.isValidElement(e))
    return null;
  const t = e, n = t.props;
  return (pi(19) ? n == null ? void 0 : n.ref : t.ref) ?? null;
}
function Mr(e, t) {
  if (e && !t)
    return e;
  if (!e && t)
    return t;
  if (e || t)
    return {
      ...e,
      ...t
    };
}
let Dr;
process.env.NODE_ENV !== "production" && (Dr = /* @__PURE__ */ new Set());
function hi(e, t) {
  return function(...r) {
    if (process.env.NODE_ENV !== "production") {
      const o = r.join(" "), s = `${t}: ${o}`, i = `${e}:${s}`;
      Dr.has(i) || (Dr.add(i), e === "warn" ? console.warn(s) : console.error(s));
    }
  };
}
const io = hi("warn", "Base UI");
function co() {
}
const ja = Object.freeze([]), $e = Object.freeze({});
function Ga(e, t) {
  const n = {};
  for (const r in e) {
    const o = e[r];
    if (t != null && t.hasOwnProperty(r)) {
      const s = t[r](o);
      s != null && Object.assign(n, s);
      continue;
    }
    o === !0 ? n[`data-${r.toLowerCase()}`] = "" : o && (n[`data-${r.toLowerCase()}`] = o.toString());
  }
  return n;
}
function Ka(e, t) {
  return typeof e == "function" ? e(t) : e;
}
function gi(e, t) {
  return typeof e == "function" ? e(t) : e;
}
const mi = {};
function ao(e, t, n, r, o) {
  if (!n && !r && !e)
    return Bn(t);
  let s = Bn(e);
  return t && (s = Nn(s, t)), n && (s = Nn(s, n)), r && (s = Nn(s, r)), s;
}
function Ya(e) {
  if (e.length === 0)
    return mi;
  if (e.length === 1)
    return Bn(e[0]);
  let t = Bn(e[0]);
  for (let n = 1; n < e.length; n += 1)
    t = Nn(t, e[n]);
  return t;
}
function Bn(e) {
  return vi(e) ? {
    ...e(mi)
  } : Xa(e);
}
function Nn(e, t) {
  return vi(t) ? t(e) : Ja(e, t);
}
function Xa(e) {
  const t = {
    ...e
  };
  for (const n in t) {
    const r = t[n];
    bi(n, r) && (t[n] = yi(r));
  }
  return t;
}
function Ja(e, t) {
  if (!t)
    return e;
  for (const n in t) {
    const r = t[n];
    switch (n) {
      case "style": {
        e[n] = Mr(e.style, r);
        break;
      }
      case "className": {
        e[n] = Ci(e.className, r);
        break;
      }
      default:
        bi(n, r) ? e[n] = Za(e[n], r) : e[n] = r;
    }
  }
  return e;
}
function bi(e, t) {
  const n = e.charCodeAt(0), r = e.charCodeAt(1), o = e.charCodeAt(2);
  return n === 111 && r === 110 && o >= 65 && o <= 90 && (typeof t == "function" || typeof t > "u");
}
function vi(e) {
  return typeof e == "function";
}
function Za(e, t) {
  return t ? e ? (...n) => {
    const r = n[0];
    if (Ei(r)) {
      const s = r;
      Vn(s);
      const i = t(...n);
      return s.baseUIHandlerPrevented || e == null || e(...n), i;
    }
    const o = t(...n);
    return e == null || e(...n), o;
  } : yi(t) : e;
}
function yi(e) {
  return e && ((...t) => {
    const n = t[0];
    return Ei(n) && Vn(n), e(...t);
  });
}
function Vn(e) {
  return e.preventBaseUIHandler = () => {
    e.baseUIHandlerPrevented = !0;
  }, e;
}
function Ci(e, t) {
  return t ? e ? t + " " + e : t : e;
}
function Ei(e) {
  return e != null && typeof e == "object" && "nativeEvent" in e;
}
function vt(e, t, n = {}) {
  let r = t.render;
  n.enabled !== !1 && (r = ol(r));
  const o = Qa(t, n, r);
  if (n.enabled === !1)
    return null;
  const s = n.state ?? $e;
  return sl(e, r, o, s);
}
function Qa(e, t, n) {
  const {
    className: r,
    style: o
  } = e, {
    state: s = $e,
    ref: i,
    props: c,
    stateAttributesMapping: a,
    enabled: l = !0
  } = t, u = l ? Ka(r, s) : void 0, f = l ? gi(o, s) : void 0, p = l ? Ga(s, a) : $e, h = l && c ? el(c) : void 0, d = l ? Mr(p, h) ?? {} : $e;
  return typeof document < "u" && (l ? Array.isArray(i) ? d.ref = Ua([d.ref, ns(n), ...i]) : d.ref = Nr(d.ref, ns(n), i) : Nr(null, null)), l ? (u !== void 0 && (d.className = Ci(d.className, u)), f !== void 0 && (d.style = Mr(d.style, f)), d) : $e;
}
function el(e) {
  return Array.isArray(e) ? Ya(e) : ao(void 0, e);
}
const tl = Symbol.for("react.lazy"), nl = /^[A-Z][A-Za-z0-9$]*$/, rl = /[a-z]/;
function ol(e) {
  if ((e == null ? void 0 : e.$$typeof) !== tl)
    return e;
  const t = y.Children.toArray(e)[0];
  return /* @__PURE__ */ y.isValidElement(t) ? t : e;
}
function sl(e, t, n, r) {
  if (t) {
    if (typeof t == "function")
      return process.env.NODE_ENV !== "production" && il(t), t(n, r);
    const o = ao(n, t.props);
    if (o.ref = n.ref, process.env.NODE_ENV !== "production" && !/* @__PURE__ */ y.isValidElement(t))
      throw new Error(["Base UI: The `render` prop was provided an invalid React element as `React.isValidElement(render)` is `false`.", "A valid React element must be provided to the `render` prop because it is cloned with props to replace the default element.", "https://base-ui.com/r/invalid-render-prop"].join(`
`));
    return /* @__PURE__ */ y.cloneElement(t, o);
  }
  return cl(e, n);
}
function il(e) {
  const t = e.name;
  t.length !== 0 && nl.test(t) && rl.test(t) && io(`The \`render\` prop received a function named \`${t}\` that starts with an uppercase letter.`, "This usually means a React component was passed directly as `render={Component}`.", "Base UI calls `render` as a plain function, which can break the Rules of Hooks during reconciliation.", "If this is an intentional render callback, rename it to start with a lowercase letter.", "Use `render={<Component />}` or `render={(props) => <Component {...props} />}` instead.", "https://base-ui.com/r/invalid-render-prop");
}
function cl(e, t) {
  return e === "button" ? /* @__PURE__ */ tn("button", {
    type: "button",
    ...t,
    key: t.key
  }) : e === "img" ? /* @__PURE__ */ tn("img", {
    alt: "",
    ...t,
    key: t.key
  }) : /* @__PURE__ */ y.createElement(e, t);
}
const $n = hi("error", "Base UI");
function al({
  controlled: e,
  default: t,
  name: n,
  state: r = "value"
}) {
  const {
    current: o
  } = y.useRef(e !== void 0), [s, i] = y.useState(() => t), c = o && e !== void 0 ? e : s;
  if (process.env.NODE_ENV !== "production") {
    y.useEffect(() => {
      o !== (e !== void 0) && $n([`A component is changing the ${o ? "" : "un"}controlled ${r} state of ${n} to be ${o ? "un" : ""}controlled.`, "Elements should not switch from uncontrolled to controlled (or vice versa).", `Decide between using a controlled or uncontrolled ${n} element for the lifetime of the component.`, "The nature of the state is determined during the first render. It's considered controlled if the value is not `undefined`.", "More info: https://fb.me/react-controlled-components"].join(`
`));
    }, [r, n, e]);
    const {
      current: l
    } = y.useRef(t);
    y.useEffect(() => {
      !o && rs(l) !== rs(t) && $n([`A component is changing the default ${r} state of an uncontrolled ${n} after being initialized. To suppress this warning opt to use a controlled ${n}.`].join(`
`));
    }, [t]);
  }
  const a = y.useCallback((l) => {
    o || i(l);
  }, []);
  return [c, a];
}
function rs(e) {
  let t = 0;
  const n = /* @__PURE__ */ new WeakMap();
  try {
    return JSON.stringify(e, function(s, i) {
      if (!(s === "_owner" && this != null && typeof this == "object" && "$$typeof" in this)) {
        if (typeof i == "bigint")
          return `__bigint__:${i}`;
        if (i !== null && typeof i == "object") {
          const c = n.get(i);
          if (c !== void 0)
            return `__object__:${c}`;
          n.set(i, t), t += 1;
        }
        return i;
      }
    }) ?? `__top__:${typeof e}`;
  } catch {
    return "__unserializable__";
  }
}
function wi() {
  const [, e] = y.useState({});
  return y.useCallback(() => {
    e({});
  }, []);
}
let os = 0;
function ll(e, t = "mui") {
  const n = y.useRef(void 0), r = wi(), o = e ?? n.current;
  return y.useEffect(() => {
    n.current == null && (os += 1, n.current = `${t}-${os}`, e == null && r());
  }, [e, t, r]), o;
}
const ss = it.useId;
function tr(e, t) {
  if (ss !== void 0) {
    const n = ss();
    return e ?? (t ? `${t}-${n}` : n);
  }
  return ll(e, t);
}
function Si(e) {
  return tr(e, "base-ui");
}
function Oe(e, t, n, r) {
  let o = !1, s = !1;
  const i = $e;
  return {
    reason: e,
    event: t ?? new Event("base-ui"),
    cancel() {
      o = !0;
    },
    allowPropagation() {
      s = !0;
    },
    get isCanceled() {
      return o;
    },
    get isPropagationAllowed() {
      return s;
    },
    trigger: n,
    ...i
  };
}
const Ti = "none", nr = "trigger-press", Xe = "trigger-hover", Mn = "trigger-focus", ul = "outside-press", fl = "focus-out", lo = "escape-key", Fr = "imperative-action", dl = () => {
}, pe = typeof document < "u" ? y.useLayoutEffect : dl;
function uo(e) {
  y.useEffect(e, ja);
}
const En = null;
let is = globalThis.requestAnimationFrame;
class pl {
  constructor() {
    /* This implementation uses an array as a backing data-structure for frame callbacks.
     * It allows `O(1)` callback cancelling by inserting a `null` in the array, though it
     * never calls the native `cancelAnimationFrame` if there are no frames left. This can
     * be much more efficient if there is a call pattern that alterns as
     * "request-cancel-request-cancel-…".
     * But in the case of "request-request-…-cancel-cancel-…", it leaves the final animation
     * frame to run anyway. We turn that frame into a `O(1)` no-op via `callbacksCount`. */
    ae(this, "callbacks", []);
    ae(this, "callbacksCount", 0);
    ae(this, "nextId", 1);
    ae(this, "startId", 1);
    ae(this, "isScheduled", !1);
    ae(this, "tick", (t) => {
      var o;
      this.isScheduled = !1;
      const n = this.callbacks, r = this.callbacksCount;
      if (this.callbacks = [], this.callbacksCount = 0, this.startId = this.nextId, r > 0)
        for (let s = 0; s < n.length; s += 1)
          (o = n[s]) == null || o.call(n, t);
    });
  }
  request(t) {
    const n = this.nextId;
    this.nextId += 1, this.callbacks.push(t), this.callbacksCount += 1;
    const r = process.env.NODE_ENV !== "production" && is !== requestAnimationFrame && (is = requestAnimationFrame, !0);
    return (!this.isScheduled || r) && (requestAnimationFrame(this.tick), this.isScheduled = !0), n;
  }
  cancel(t) {
    const n = t - this.startId;
    n < 0 || n >= this.callbacks.length || this.callbacks[n] !== null && (this.callbacks[n] = null, this.callbacksCount -= 1);
  }
}
let wn = new pl();
class De {
  constructor() {
    ae(this, "currentId", En);
    ae(this, "cancel", () => {
      this.currentId !== En && (wn.cancel(this.currentId), this.currentId = En);
    });
    ae(this, "disposeEffect", () => this.cancel);
  }
  static create() {
    return new De();
  }
  static request(t) {
    return wn.request(t);
  }
  static cancel(t) {
    return wn.cancel(t);
  }
  /**
   * Executes `fn` after `delay`, clearing any previously scheduled call.
   */
  request(t) {
    this.cancel(), this.currentId = wn.request(() => {
      this.currentId = En, t();
    });
  }
}
function hl() {
  const e = et(De.create).current;
  return uo(e.disposeEffect), e;
}
function Ri(e, t = !1, n = !1, r = !1) {
  const [o, s] = y.useState(e && t ? "idle" : void 0), [i, c] = y.useState(e && !r);
  return e && !i && (c(!0), s("starting")), !e && i && o !== "ending" && !n && s("ending"), !e && !i && o === "ending" && s(void 0), pe(() => {
    if (!e && i && o !== "ending" && n) {
      const a = De.request(() => {
        s("ending");
      });
      return () => {
        De.cancel(a);
      };
    }
  }, [e, i, o, n]), pe(() => {
    if (!e || t || o === void 0)
      return;
    const a = De.request(() => {
      s(void 0);
    });
    return () => {
      De.cancel(a);
    };
  }, [t, e, o]), pe(() => {
    if (!e || !t)
      return;
    e && i && o !== "idle" && s("starting");
    const a = De.request(() => {
      s("idle");
    });
    return () => {
      De.cancel(a);
    };
  }, [t, e, i, o]), {
    mounted: i,
    setMounted: c,
    transitionStatus: o
  };
}
function gl(e) {
  const {
    open: t,
    defaultOpen: n = !1,
    onOpenChange: r,
    disabled: o
  } = e, [s, i] = al({
    controlled: t,
    default: n,
    name: "Collapsible",
    state: "open"
  }), {
    mounted: c,
    setMounted: a,
    transitionStatus: l
  } = Ri(s, !0, !0), u = Si(), [f, p] = y.useState(), h = f === null ? void 0 : f ?? u, d = fe((g) => {
    const m = !s, v = Oe(nr, g.nativeEvent);
    r(m, v), !v.isCanceled && i(m);
  });
  return y.useMemo(() => ({
    defaultPanelId: u,
    disabled: o,
    handleTrigger: d,
    mounted: c,
    open: s,
    panelId: h,
    setMounted: a,
    setOpen: i,
    setPanelIdState: p,
    transitionStatus: l
  }), [u, o, d, c, s, h, a, i, p, l]);
}
function ml(e, t) {
  return function(r, ...o) {
    const s = new URL(e);
    return s.searchParams.set("code", r.toString()), o.forEach((i) => s.searchParams.append("args[]", i)), `${t} error #${r}; visit ${s} for the full message.`;
  };
}
const Pt = ml("https://base-ui.com/production-error", "Base UI"), fo = /* @__PURE__ */ y.createContext(void 0);
process.env.NODE_ENV !== "production" && (fo.displayName = "CollapsibleRootContext");
function xi() {
  const e = y.useContext(fo);
  if (e === void 0)
    throw new Error(process.env.NODE_ENV !== "production" ? "Base UI: CollapsibleRootContext is missing. Collapsible parts must be placed within <Collapsible.Root>." : Pt(15));
  return e;
}
const po = "data-starting-style", bl = "data-ending-style", vl = {
  [po]: ""
}, yl = {
  [bl]: ""
}, ho = {
  transitionStatus(e) {
    return e === "starting" ? vl : e === "ending" ? yl : null;
  }
}, Cl = "data-open", El = "data-closed", Sn = po, wl = "data-panel-open", Sl = {
  [Cl]: ""
}, Tl = {
  [El]: ""
}, Rl = {
  open(e) {
    return e ? {
      [wl]: ""
    } : null;
  }
}, xl = {
  open(e) {
    return e ? Sl : Tl;
  }
}, Pi = {
  ...xl,
  ...ho
}, Oi = /* @__PURE__ */ y.forwardRef(function(t, n) {
  const {
    render: r,
    className: o,
    defaultOpen: s = !1,
    disabled: i = !1,
    onOpenChange: c,
    open: a,
    style: l,
    ...u
  } = t, f = fe(c), p = gl({
    open: a,
    defaultOpen: s,
    onOpenChange: f,
    disabled: i
  }), h = y.useMemo(() => ({
    open: p.open,
    disabled: p.disabled,
    transitionStatus: p.transitionStatus
  }), [p.open, p.disabled, p.transitionStatus]), d = y.useMemo(() => ({
    ...p,
    onOpenChange: f,
    state: h
  }), [p, f, h]), g = vt("div", t, {
    state: h,
    ref: n,
    props: u,
    stateAttributesMapping: Pi
  });
  return /* @__PURE__ */ b(fo.Provider, {
    value: d,
    children: g
  });
});
process.env.NODE_ENV !== "production" && (Oi.displayName = "CollapsibleRoot");
function rr() {
  return typeof window < "u";
}
function He(e) {
  return go(e) ? (e.nodeName || "").toLowerCase() : "#document";
}
function _e(e) {
  var t;
  return (e == null || (t = e.ownerDocument) == null ? void 0 : t.defaultView) || window;
}
function lt(e) {
  var t;
  return (t = (go(e) ? e.ownerDocument : e.document) || window.document) == null ? void 0 : t.documentElement;
}
function go(e) {
  return rr() ? e instanceof Node || e instanceof _e(e).Node : !1;
}
function me(e) {
  return rr() ? e instanceof Element || e instanceof _e(e).Element : !1;
}
function ke(e) {
  return rr() ? e instanceof HTMLElement || e instanceof _e(e).HTMLElement : !1;
}
function Bt(e) {
  return !rr() || typeof ShadowRoot > "u" ? !1 : e instanceof ShadowRoot || e instanceof _e(e).ShadowRoot;
}
function or(e) {
  const {
    overflow: t,
    overflowX: n,
    overflowY: r,
    display: o
  } = je(e);
  return /auto|scroll|overlay|hidden|clip/.test(t + r + n) && o !== "inline" && o !== "contents";
}
function Pl(e) {
  return /^(table|td|th)$/.test(He(e));
}
function sr(e) {
  try {
    if (e.matches(":popover-open"))
      return !0;
  } catch {
  }
  try {
    return e.matches(":modal");
  } catch {
    return !1;
  }
}
const Ol = /transform|translate|scale|rotate|perspective|filter/, Il = /paint|layout|strict|content/, Et = (e) => !!e && e !== "none";
let vr;
function mo(e) {
  const t = me(e) ? je(e) : e;
  return Et(t.transform) || Et(t.translate) || Et(t.scale) || Et(t.rotate) || Et(t.perspective) || !bo() && (Et(t.backdropFilter) || Et(t.filter)) || Ol.test(t.willChange || "") || Il.test(t.contain || "");
}
function _l(e) {
  let t = ht(e);
  for (; ke(t) && !dt(t); ) {
    if (mo(t))
      return t;
    if (sr(t))
      return null;
    t = ht(t);
  }
  return null;
}
function bo() {
  return vr == null && (vr = typeof CSS < "u" && CSS.supports && CSS.supports("-webkit-backdrop-filter", "none")), vr;
}
function dt(e) {
  return /^(html|body|#document)$/.test(He(e));
}
function je(e) {
  return _e(e).getComputedStyle(e);
}
function ir(e) {
  return me(e) ? {
    scrollLeft: e.scrollLeft,
    scrollTop: e.scrollTop
  } : {
    scrollLeft: e.scrollX,
    scrollTop: e.scrollY
  };
}
function ht(e) {
  if (He(e) === "html")
    return e;
  const t = (
    // Step into the shadow DOM of the parent of a slotted node.
    e.assignedSlot || // DOM Element detected.
    e.parentNode || // ShadowRoot detected.
    Bt(e) && e.host || // Fallback.
    lt(e)
  );
  return Bt(t) ? t.host : t;
}
function Ii(e) {
  const t = ht(e);
  return dt(t) ? (e.ownerDocument || e).body : ke(t) && or(t) ? t : Ii(t);
}
function nn(e, t, n) {
  var r;
  t === void 0 && (t = []), n === void 0 && (n = !0);
  const o = Ii(e), s = o === ((r = e.ownerDocument) == null ? void 0 : r.body), i = _e(o);
  if (s) {
    const c = Lr(i);
    return t.concat(i, i.visualViewport || [], or(o) ? o : [], c && n ? nn(c) : []);
  } else
    return t.concat(o, nn(o, [], n));
}
function Lr(e) {
  return e.parent && Object.getPrototypeOf(e.parent) ? e.frameElement : null;
}
const _i = /* @__PURE__ */ y.createContext(void 0);
process.env.NODE_ENV !== "production" && (_i.displayName = "CompositeRootContext");
function Al(e = !1) {
  const t = y.useContext(_i);
  if (t === void 0 && !e)
    throw new Error(process.env.NODE_ENV !== "production" ? "Base UI: CompositeRootContext is missing. Composite parts must be placed within <Composite.Root>." : Pt(16));
  return t;
}
function kl(e) {
  const {
    focusableWhenDisabled: t,
    disabled: n,
    composite: r = !1,
    tabIndex: o = 0,
    isNativeButton: s
  } = e, i = r && t !== !1, c = r && t === !1;
  return {
    props: y.useMemo(() => {
      const l = {
        // allow Tabbing away from focusableWhenDisabled elements
        onKeyDown(u) {
          n && t && u.key !== "Tab" && u.preventDefault();
        }
      };
      return r || (l.tabIndex = o, !s && n && (l.tabIndex = t ? o : -1)), (s && (t || i) || !s && n) && (l["aria-disabled"] = n), s && (!t || c) && (l.disabled = n), l;
    }, [r, n, t, i, c, s, o])
  };
}
function Qe(e) {
  return (e == null ? void 0 : e.ownerDocument) || document;
}
function yr(e, t, {
  detail: n = 0,
  pointerType: r = ""
} = {}) {
  e.dispatchEvent(new (_e(e)).PointerEvent("click", {
    bubbles: !0,
    cancelable: !0,
    composed: !0,
    detail: n,
    pointerType: r,
    shiftKey: t.shiftKey,
    ctrlKey: t.ctrlKey,
    altKey: t.altKey,
    metaKey: t.metaKey
  }));
}
function Ai(e = {}) {
  const {
    disabled: t = !1,
    focusableWhenDisabled: n,
    tabIndex: r = 0,
    native: o = !0,
    composite: s
  } = e, i = y.useRef(null), c = Al(!0), a = s ?? c !== void 0, {
    props: l
  } = kl({
    focusableWhenDisabled: n,
    disabled: t,
    composite: a,
    tabIndex: r,
    isNativeButton: o
  });
  process.env.NODE_ENV !== "production" && y.useEffect(() => {
    var d, g;
    if (!i.current)
      return;
    const h = Tn(i.current);
    if (o) {
      if (!h) {
        const m = ((d = it.captureOwnerStack) == null ? void 0 : d.call(it)) || "";
        $n(`A component that acts as a button expected a native <button> because the \`nativeButton\` prop is true. Rendering a non-<button> removes native button semantics, which can impact forms and accessibility. Use a real <button> in the \`render\` prop, or set \`nativeButton\` to \`false\`.${m}`);
      }
    } else if (h) {
      const m = ((g = it.captureOwnerStack) == null ? void 0 : g.call(it)) || "";
      $n(`A component that acts as a button expected a non-<button> because the \`nativeButton\` prop is false. Rendering a <button> keeps native behavior while Base UI applies non-native attributes and handlers, which can add unintended extra attributes (such as \`role\` or \`aria-disabled\`). Use a non-<button> in the \`render\` prop, or set \`nativeButton\` to \`true\`.${m}`);
    }
  }, [o]);
  const u = y.useCallback(() => {
    const h = i.current;
    Tn(h) && a && t && l.disabled === void 0 && h.disabled && (h.disabled = !1);
  }, [t, l.disabled, a]);
  pe(u, [u]);
  const f = y.useCallback((h = {}) => {
    const {
      onClick: d,
      onMouseDown: g,
      onKeyUp: m,
      onKeyDown: v,
      onPointerDown: C,
      ...w
    } = h;
    return ao({
      onClick(E) {
        if (t) {
          E.preventDefault();
          return;
        }
        d == null || d(E);
      },
      onMouseDown(E) {
        t || g == null || g(E);
      },
      onKeyDown(E) {
        if (t || (Vn(E), v == null || v(E), E.baseUIHandlerPrevented))
          return;
        const T = E.target === E.currentTarget, S = E.currentTarget, R = Tn(S), P = !o && Nl(S), O = T && (o ? R : !P), M = E.key === "Enter", F = E.key === " ", A = S.getAttribute("role"), D = (A == null ? void 0 : A.startsWith("menuitem")) || A === "option" || A === "gridcell";
        if (T && a && F) {
          if (E.defaultPrevented && D)
            return;
          E.preventDefault(), (!o || R) && (E.preventBaseUIHandler(), yr(S, E));
          return;
        }
        if (!O || o || !F && !M) {
          T && P && F && E.preventDefault();
          return;
        }
        E.defaultPrevented || (E.preventDefault(), M && (E.preventBaseUIHandler(), yr(S, E)));
      },
      onKeyUp(E) {
        if (!t) {
          if (Vn(E), m == null || m(E), E.target === E.currentTarget && o && a && Tn(E.currentTarget) && E.key === " ") {
            E.preventDefault();
            return;
          }
          E.baseUIHandlerPrevented || E.target === E.currentTarget && !o && !a && !E.defaultPrevented && E.key === " " && (E.preventBaseUIHandler(), yr(E.currentTarget, E));
        }
      },
      onPointerDown(E) {
        if (t) {
          E.preventDefault();
          return;
        }
        C == null || C(E);
      }
    }, o ? {
      type: "button"
    } : {
      role: "button"
    }, l, w);
  }, [t, l, a, o]), p = fe((h) => {
    i.current = h, u();
  });
  return {
    getButtonProps: f,
    buttonRef: p
  };
}
function Tn(e) {
  return ke(e) && e.tagName === "BUTTON";
}
function Nl(e) {
  return ke(e) && e.tagName === "A" && !!e.href;
}
const Ml = {
  ...Rl,
  ...ho
}, ki = /* @__PURE__ */ y.forwardRef(function(t, n) {
  const {
    panelId: r,
    open: o,
    handleTrigger: s,
    state: i,
    disabled: c
  } = xi(), {
    className: a,
    disabled: l = c,
    render: u,
    nativeButton: f = !0,
    style: p,
    ...h
  } = t, {
    getButtonProps: d,
    buttonRef: g
  } = Ai({
    disabled: l,
    native: f
  });
  return vt("button", t, {
    state: i,
    ref: [n, g],
    props: [{
      "aria-controls": o ? r : void 0,
      "aria-expanded": o,
      onClick: s
    }, h, d],
    stateAttributesMapping: Ml
  });
});
process.env.NODE_ENV !== "production" && (ki.displayName = "CollapsibleTrigger");
function Ee(e, t, n, r) {
  return e.addEventListener(t, n, r), () => {
    e.removeEventListener(t, n, r);
  };
}
const Xt = 0;
class gt {
  constructor() {
    ae(this, "currentId", Xt);
    ae(this, "clear", () => {
      this.currentId !== Xt && (clearTimeout(this.currentId), this.currentId = Xt);
    });
    ae(this, "disposeEffect", () => this.clear);
  }
  static create() {
    return new gt();
  }
  /**
   * Executes `fn` after `delay`, clearing any previously scheduled call.
   */
  start(t, n) {
    this.clear(), this.currentId = setTimeout(() => {
      this.currentId = Xt, n();
    }, t);
  }
  isStarted() {
    return this.currentId !== Xt;
  }
}
function Zt() {
  const e = et(gt.create).current;
  return uo(e.disposeEffect), e;
}
function Je(e) {
  const t = et(Dl, e).current;
  return t.next = e, pe(t.effect), t;
}
function Dl(e) {
  const t = {
    current: e,
    next: e,
    effect: () => {
      t.current = t.next;
    }
  };
  return t;
}
function Fl(e) {
  return e == null ? e : "current" in e ? e.current : e;
}
function cs(e, t) {
  return e.getAnimations(t).filter((n) => {
    var o;
    const r = (o = n.effect) == null ? void 0 : o.getTiming();
    return (r == null ? void 0 : r.duration) !== 1 / 0 && (r == null ? void 0 : r.iterations) !== 1 / 0;
  });
}
let Rn = null;
function Ll(e) {
  if (!Rn) {
    const t = [];
    Rn = t, queueMicrotask(() => {
      Rn = null, bt.flushSync(() => {
        for (const n of t)
          n();
      });
    });
  }
  Rn.push(e);
}
function Ni(e, t = !1, n = !1) {
  const r = hl();
  return fe((o, s = null) => {
    r.cancel();
    const i = Fl(e);
    if (i == null)
      return;
    const c = i, a = () => {
      if (!n) {
        bt.flushSync(o);
        return;
      }
      Ll(() => {
        s != null && s.aborted || o();
      });
    };
    if (typeof c.getAnimations != "function" || globalThis.BASE_UI_ANIMATIONS_DISABLED) {
      o();
      return;
    }
    function l() {
      Promise.all(cs(c).map((u) => u.finished.then(co))).then(() => {
        s != null && s.aborted || a();
      }, () => {
        if (s != null && s.aborted)
          return;
        if (cs(c).some((f) => f.pending || f.playState !== "finished")) {
          l();
          return;
        }
        a();
      });
    }
    if (t) {
      const u = po;
      if (!c.hasAttribute(u)) {
        r.request(l);
        return;
      }
      const f = new MutationObserver(() => {
        c.hasAttribute(u) || (f.disconnect(), l());
      });
      f.observe(c, {
        attributes: !0,
        attributeFilter: [u]
      }), s == null || s.addEventListener("abort", () => f.disconnect(), {
        once: !0
      });
      return;
    }
    r.request(l);
  });
}
function vo(e) {
  const {
    enabled: t = !0,
    open: n,
    ref: r,
    batch: o = !1,
    onComplete: s
  } = e, i = fe(s), c = Ni(r, n, o);
  y.useEffect(() => {
    if (!t)
      return;
    const a = new AbortController();
    return c(i, a.signal), () => {
      a.abort();
    };
  }, [t, n, i, c]);
}
const kt = {
  height: void 0,
  width: void 0
};
function Bl(e) {
  const {
    externalRef: t,
    hiddenUntilFound: n,
    id: r,
    keepMounted: o,
    mounted: s,
    onOpenChange: i,
    open: c,
    setMounted: a,
    setOpen: l,
    transitionStatus: u
  } = e, f = y.useRef(null), p = y.useRef(null), [h, d] = y.useState(kt), g = y.useRef(kt), m = y.useRef(!1), v = y.useRef(c), C = y.useRef(!1), [w, E] = y.useState(!1), T = y.useRef(null), S = Nr(t, f), R = Je(c), P = Ni(f), O = !c && !s, M = w ? "idle" : u, F = c && // These 2 refs are safe to read in render, they are only written from committed
  // layout/effect paths and gate one-shot motion suppression for the next open
  // lifecycle. They intentionally expose the last committed motion snapshot.
  (v.current || C.current), A = !c && s && // These 2 refs are also safe to read in render, both hold the last committed
  // animation mode and measurement. This fallback only restores a previously
  // measured pixel size after the live dimensions state has been reset back to `auto`.
  p.current === "css-animation" && h.height === void 0 && h.width === void 0 ? g.current : h, D = n && O && p.current !== "css-animation", I = fe((k, Y = !0) => {
    Y && (g.current = k), d(k);
  }), x = fe(() => {
    var k;
    (k = T.current) == null || k.call(T), T.current = null;
  }), _ = fe((k) => {
    x(), T.current = () => {
      T.current = null, k();
    };
  }), z = fe(() => {
    c && s && p.current === "css-animation" && (C.current = !0);
  });
  pe(() => {
    !w || u === "starting" || E(!1);
  }, [w, u]), y.useEffect(() => () => {
    z(), x();
  }, [z, x]), pe(() => {
    c || (v.current = !1, C.current = !1);
    const k = f.current;
    if (!k)
      return;
    !c && T.current && x();
    const Y = Vl(k, F);
    if (p.current = Y, c && u === "idle" && v.current && Y === "css-animation") {
      g.current = Nt(k);
      return;
    }
    if (c && u === "starting") {
      const ie = m.current;
      if (m.current = !1, Y === "none") {
        I(Nt(k)), E(!0);
        return;
      }
      if (Y === "css-transition") {
        const B = $l(k);
        if (I(Nt(k)), !ie)
          return B;
        const $ = xn(k, "transition-duration", "0s");
        return _($), E(!0), B;
      }
      I(Nt(k));
      const L = xn(k, "animation-name", "none");
      if (!ie) {
        L();
        return;
      }
      const X = xn(k, "animation-duration", "0s");
      L(), _(X), E(!0);
      return;
    }
    if (!c && s && (u === "idle" || u === "starting")) {
      if (Y === "none") {
        I(kt, !1), a(!1);
        return;
      }
      I(Nt(k));
      return;
    }
    if (u !== "ending")
      return;
    if (Y === "none") {
      a(!1);
      return;
    }
    const K = Nt(k);
    if (!(K.height > 0 || K.width > 0)) {
      a(!1);
      return;
    }
    I(K), Y === "css-animation" && xn(k, "animation-name", "none")();
  }, [s, c, x, I, a, _, F, u]), vo({
    enabled: c && s && M === "idle",
    open: !0,
    ref: f,
    onComplete() {
      c && I(kt, !1);
    }
  }), y.useEffect(() => {
    if (c || !s || M !== "ending")
      return;
    if (!f.current) {
      a(!1), I(kt, !1);
      return;
    }
    const Y = new AbortController();
    let K = -1;
    function le() {
      R.current || (a(!1), I(kt, !1));
    }
    return K = De.request(() => {
      P(le, Y.signal);
    }), () => {
      De.cancel(K), Y.abort();
    };
  }, [R, s, c, M, P, I, a]), pe(() => {
    const k = f.current;
    !k || !n || !O || k.setAttribute("hidden", "until-found");
  }, [O, n]), y.useEffect(function() {
    const Y = f.current;
    if (!Y)
      return;
    const K = gt.create();
    let le = -1;
    const ie = (B, $) => {
      K.start(0, () => {
        R.current || (le = De.request(() => {
          R.current || (B && (m.current = !1), $ && Y.setAttribute(Sn, ""), Y.setAttribute("hidden", "until-found"));
        }));
      });
    }, X = Ee(Y, "beforematch", (B) => {
      const $ = Oe(Ti, B);
      if (i(!0, $), $.isCanceled) {
        ie(!1, !1);
        return;
      }
      m.current = !0;
      const Q = Y.hasAttribute(Sn);
      Y.removeAttribute(Sn), l(!0), ie(!0, Q);
    });
    return () => {
      K.clear(), De.cancel(le), X();
    };
  }, [R, i, l]);
  const N = o || n || s || c;
  return {
    height: A.height,
    props: {
      ...D ? {
        [Sn]: ""
      } : void 0,
      hidden: O,
      id: r
    },
    ref: S,
    shouldPreventOpenAnimation: F,
    shouldRender: N,
    transitionStatus: M,
    width: A.width
  };
}
function Nt(e) {
  return {
    height: e.scrollHeight,
    width: e.scrollWidth
  };
}
function Vl(e, t) {
  const n = _e(e).getComputedStyle(e), r = (n.animationName.split(",").map((s) => s.trim()).some((s) => s !== "" && s !== "none") || t) && as(n.animationDuration), o = as(n.transitionDuration);
  return r && o ? (process.env.NODE_ENV !== "production" && io("CSS transitions and CSS animations both detected on Collapsible or Accordion panel.", "Only one of either animation type should be used."), "css-transition") : o ? "css-transition" : r ? "css-animation" : "none";
}
function as(e) {
  return e.split(",").map((t) => t.trim()).some((t) => t !== "" && Number.parseFloat(t) > 0);
}
function xn(e, t, n) {
  const r = e.style.getPropertyValue(t), o = e.style.getPropertyPriority(t);
  return e.style.setProperty(t, n), () => {
    if (r === "") {
      e.style.removeProperty(t);
      return;
    }
    e.style.setProperty(t, r, o);
  };
}
function $l(e) {
  const t = {
    "justify-content": e.style.justifyContent,
    "align-items": e.style.alignItems,
    "align-content": e.style.alignContent,
    "justify-items": e.style.justifyItems
  };
  Object.keys(t).forEach((o) => {
    e.style.setProperty(o, "initial", "important");
  });
  function n() {
    Object.entries(t).forEach(([o, s]) => {
      if (s === "") {
        e.style.removeProperty(o);
        return;
      }
      e.style.setProperty(o, s);
    });
  }
  const r = De.request(n);
  return () => {
    De.cancel(r), n();
  };
}
const Hl = "--collapsible-panel-height", Ul = "--collapsible-panel-width", Mi = /* @__PURE__ */ y.forwardRef(function(t, n) {
  const {
    className: r,
    hiddenUntilFound: o,
    keepMounted: s,
    render: i,
    id: c,
    style: a,
    ...l
  } = t;
  process.env.NODE_ENV !== "production" && y.useEffect(() => {
    o && s === !1 && io("The `keepMounted={false}` prop on `Collapsible.Panel` is ignored when `hiddenUntilFound` is enabled, since the panel must remain mounted while closed.");
  }, [o, s]);
  const {
    defaultPanelId: u,
    mounted: f,
    onOpenChange: p,
    open: h,
    setMounted: d,
    setPanelIdState: g,
    setOpen: m,
    state: v,
    transitionStatus: C
  } = xi(), w = o ?? !1, E = s ?? !1, T = c || void 0, S = T ?? u;
  pe(() => (g((z) => T ?? (z === null ? void 0 : z)), () => {
    g((z) => z === T ? null : z);
  }), [T, g]);
  const {
    height: R,
    props: P,
    ref: O,
    shouldPreventOpenAnimation: M,
    shouldRender: F,
    transitionStatus: A,
    width: D
  } = Bl({
    externalRef: n,
    hiddenUntilFound: w,
    id: S,
    keepMounted: E,
    mounted: f,
    onOpenChange: p,
    open: h,
    setMounted: d,
    setOpen: m,
    transitionStatus: C
  }), I = {
    ...v,
    transitionStatus: A
  }, x = gi(a, I), _ = vt("div", {
    ...t,
    style: void 0
  }, {
    state: I,
    ref: O,
    props: [
      P,
      {
        style: {
          [Hl]: R === void 0 ? "auto" : `${R}px`,
          [Ul]: D === void 0 ? "auto" : `${D}px`
        }
      },
      l,
      x ? {
        style: x
      } : void 0,
      // Resolve the public `style` prop so temporary `animationName: 'none'`
      // can still win after user's inline styles have been merged.
      M ? {
        style: {
          animationName: "none"
        }
      } : void 0
    ],
    stateAttributesMapping: Pi
  });
  return F ? _ : null;
});
process.env.NODE_ENV !== "production" && (Mi.displayName = "CollapsiblePanel");
function wt({ className: e, ...t }) {
  return /* @__PURE__ */ b("div", { "data-slot": "trace", className: ue("trace", e), ...t });
}
function Vt({
  className: e,
  status: t,
  ...n
}) {
  return /* @__PURE__ */ b("span", { "data-slot": "trace-line", "data-status": t, className: ue("trace-line", e), ...n });
}
function Tt({ className: e, ...t }) {
  return /* @__PURE__ */ b("span", { "data-slot": "trace-icon", className: ue("trace-icon", e), ...t, "aria-hidden": "true" });
}
function $t({ className: e, ...t }) {
  return /* @__PURE__ */ b("span", { "data-slot": "trace-title", className: ue("trace-title", e), ...t });
}
function rn({ className: e, ...t }) {
  return /* @__PURE__ */ b("span", { "data-slot": "trace-description", className: ue("trace-description", e), ...t });
}
function Di(e) {
  return /* @__PURE__ */ b(Oi, { "data-slot": "trace-collapsible", ...e });
}
function Fi({
  children: e,
  className: t,
  ...n
}) {
  return /* @__PURE__ */ U(
    ki,
    {
      type: "button",
      "data-slot": "trace-collapsible-trigger",
      className: ue("trace-trigger", t),
      ...n,
      children: [
        e,
        /* @__PURE__ */ b(Tt, { className: "trace-chevron", children: /* @__PURE__ */ b(si, { size: 13 }) })
      ]
    }
  );
}
function Li({
  className: e,
  ...t
}) {
  return /* @__PURE__ */ b(
    Mi,
    {
      ...t,
      "data-slot": "trace-collapsible-content",
      className: ue("trace-content", e)
    }
  );
}
const zl = ({ message: e, onRetry: t }) => /* @__PURE__ */ b(
  oo,
  {
    className: "chat-error-banner",
    role: "alert",
    children: /* @__PURE__ */ U(so, { children: [
      /* @__PURE__ */ b(wt, { className: "chat-message-body", children: /* @__PURE__ */ U(Vt, { status: "error", children: [
        /* @__PURE__ */ b(Tt, { children: /* @__PURE__ */ b(Ea, { size: 14 }) }),
        /* @__PURE__ */ b($t, { className: "chat-error-title", children: e })
      ] }) }),
      t && /* @__PURE__ */ b(kr, { children: /* @__PURE__ */ b("button", { type: "button", onClick: t, className: "chat-error-retry-btn", children: "Try again" }) })
    ] })
  }
), Wl = {
  alpha: {
    label: "Alpha",
    Icon: Ta,
    variant: "env-badge--alpha",
    tooltip: "Alpha build — internal testing only"
  },
  beta: {
    label: "Beta",
    Icon: Aa,
    variant: "env-badge--beta",
    tooltip: "Beta build — public pre-release"
  },
  gamma: {
    label: "Gamma",
    Icon: Pa,
    variant: "env-badge--gamma",
    tooltip: "Gamma / Release Candidate"
  },
  qa: {
    label: "QA",
    Icon: wa,
    variant: "env-badge--qa",
    tooltip: "Quality Assurance build"
  }
}, ql = ({
  stage: e,
  pulse: t = !0,
  className: n = ""
}) => {
  if (!e) return null;
  const { label: r, Icon: o, variant: s, tooltip: i } = Wl[e];
  return /* @__PURE__ */ U(
    "span",
    {
      className: `env-badge-inline ${s} ${n}`.trim(),
      title: i,
      "aria-label": `${r} build`,
      role: "status",
      children: [
        /* @__PURE__ */ b(o, { size: 10, className: "env-badge-icon", "aria-hidden": "true" }),
        /* @__PURE__ */ b("span", { className: "env-badge-inline-label", children: r })
      ]
    }
  );
}, yo = "data:image/svg+xml,%3csvg%20width='300'%20height='322'%20viewBox='0%200%20300%20322'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3cpath%20d='M213.058%2052.9833C228.726%2054.9056%20244.193%2057.9635%20259.583%2061.4059C269.998%2063.5987%20280.269%2066.4233%20290.34%2069.864C292.753%2070.7216%20295.072%2071.8691%20297.438%2072.8214C298.27%2073.1024%20298.978%2073.6651%20299.439%2074.4125C299.9%2075.1598%20300.085%2076.0447%20299.963%2076.9144C299.963%2077.4408%20299.963%2077.9672%20299.963%2078.4936C299.963%20112.823%20299.963%20147.15%20299.963%20181.475C299.985%20185.264%20298.951%20188.983%20296.976%20192.217C289.695%20204.395%20281.876%20216.225%20273.844%20227.918C264.972%20240.848%20255.632%20253.458%20245.66%20265.577C240.775%20271.492%20235.924%20277.472%20230.944%20283.322C227.815%20286.989%20224.438%20290.419%20221.232%20294.039C214.578%20301.551%20207.54%20308.696%20200.394%20315.728C199.125%20317.122%20197.691%20318.355%20196.124%20319.402C194.628%20320.262%20192.963%20320.789%20191.244%20320.945C187.118%20321.36%20182.97%20321.524%20178.823%20321.436C155.756%20320.549%20132.653%20321.288%20109.568%20321.04C108.093%20321.056%20106.63%20320.771%20105.27%20320.203C103.909%20319.634%20102.679%20318.794%20101.654%20317.734C95.4904%20311.523%2089.2326%20305.419%2083.1227%20299.132C79.4615%20295.346%2076.0664%20291.295%2072.5767%20287.349C69.087%20283.404%2065.4258%20279.382%2061.9893%20275.289C57.9732%20270.492%2053.9925%20265.66%2050.2071%20260.686C43.1094%20251.323%2035.9466%20241.966%2029.1269%20232.39C23.2654%20224.156%2017.7884%20215.651%2012.2403%20207.205C9.05229%20202.354%206.0712%20197.362%202.97778%20192.447C0.696594%20189.116%20-0.326373%20185.083%200.091433%20181.067C0.156556%20180.164%200.168387%20179.257%200.126902%20178.352V78.3221C0.126902%2073.8446%200.387122%2073.2532%204.69898%2071.7212C10.661%2069.5978%2016.6645%2067.5336%2022.739%2065.8065C34.7232%2062.4186%2046.872%2059.643%2059.1384%2057.4904C68.2649%2055.8283%2077.4741%2054.4916%2086.6006%2053.0129C87.0442%2052.936%2087.4937%2052.8591%2087.9314%2052.7526L90.2973%2052.2913C90.2973%2052.8236%2090.2973%2056.68%2090.2973%2057.2064C90.2973%2098.2351%2090.2815%20139.27%2090.25%20180.31C90.1517%20184.707%2091.5027%20189.013%2094.0946%20192.566C99.4178%20199.953%20104.611%20207.488%20110.106%20214.764C117.925%20225.103%20125.88%20235.341%20133.972%20245.479C138.059%20250.583%20142.536%20255.386%20146.984%20260.207C149.823%20263.294%20150.569%20263.164%20153.378%20260.023L153.68%20259.686C155.555%20257.527%20157.448%20255.38%20159.317%20253.215C162.363%20249.667%20165.539%20246.236%20168.413%20242.569C175.381%20233.697%20182.307%20224.724%20189.062%20215.657C194.977%20207.743%20200.631%20199.646%20206.374%20191.607C208.444%20188.701%20209.517%20185.202%20209.432%20181.635C209.373%20160.815%20209.403%20139.995%20209.403%20119.175V56.9107C209.403%2056.2305%20209.403%2053.2495%20209.403%2052.5693'%20fill='white'/%3e%3cpath%20d='M90.3197%2052.5822C90.3612%2049.0806%2090.3197%2043.1185%2090.3197%2039.6347V8.54682C90.3197%207.87845%2090.3197%207.20414%2090.3197%206.53578C90.2821%206.17841%2090.3153%205.81714%2090.4174%205.47261C90.5195%205.12808%2090.6886%204.80708%2090.915%204.52799C91.1413%204.24889%2091.4205%204.01719%2091.7365%203.84613C92.0525%203.67507%2092.3992%203.56802%2092.7566%203.53111C94.2873%203.22177%2095.8362%203.01037%2097.3938%202.89822C101.534%202.4901%20105.674%202.11747%20109.815%201.75075C112.849%201.47867%20115.895%201.24801%20118.935%200.993674C119.231%200.993674%20119.527%200.904963%20119.823%200.893134C124.134%200.72752%20128.452%200.526411%20132.77%200.414031C139.696%200.236588%20146.622%200.0118295%20153.548%200C159.357%200%20165.165%200.171503%20170.967%200.455411C177.805%200.792552%20184.636%201.2835%20191.462%201.804C195.987%202.15297%20200.5%202.67346%20205.019%203.14072C208.284%203.47786%20209.283%204.55433%20209.301%207.94348C209.336%2014.9466%20209.301%2021.9555%20209.301%2028.9645C209.301%2035.8197%20209.301%2045.727%20209.301%2052.5822L206.344%2052.316C203.315%2051.9729%20200.281%2051.6299%20197.241%2051.3637C190.569%2050.7722%20183.909%2050.0861%20177.225%2049.6958C171.311%2049.3468%20165.313%2049.1753%20159.363%2049.2167C148.633%2049.3054%20137.898%2048.7375%20127.175%2049.6011C122.135%2050.0092%20117.066%2050.1216%20112.027%2050.5238C105.799%2051.0147%2099.606%2051.6358%2093.36%2052.2628'%20fill='%23FF4717'/%3e%3c/svg%3e", jl = ({
  title: e = "VPS AI Assistant",
  subtitle: t = "Customer portal support",
  onClose: n,
  onReset: r,
  onBack: o,
  soundEnabled: s,
  onToggleSound: i,
  showMinimize: c = !1,
  envStage: a,
  envPulse: l = !0
}) => /* @__PURE__ */ U("header", { className: "chat-header", children: [
  /* @__PURE__ */ U("div", { className: "chat-header-left", children: [
    o && /* @__PURE__ */ b(
      "button",
      {
        type: "button",
        onClick: o,
        className: "icon-btn-back",
        "aria-label": "Back",
        children: /* @__PURE__ */ b(ma, { size: 16 })
      }
    ),
    /* @__PURE__ */ b(
      "div",
      {
        className: "avatar-circle",
        "aria-hidden": "true",
        children: /* @__PURE__ */ b("img", { src: yo, alt: "VPS Logo", style: { width: "16px", height: "16px" } })
      }
    ),
    /* @__PURE__ */ U("div", { children: [
      /* @__PURE__ */ U("div", { className: "chat-header-title-row", children: [
        /* @__PURE__ */ b("h2", { className: "chat-header-title", children: e }),
        /* @__PURE__ */ b(ql, { stage: a, pulse: l })
      ] }),
      /* @__PURE__ */ b("p", { className: "chat-header-subtitle", children: t || "Customer portal support" })
    ] })
  ] }),
  /* @__PURE__ */ U("div", { className: "chat-header-actions", children: [
    i && /* @__PURE__ */ b(
      "button",
      {
        type: "button",
        className: "icon-btn-action chat-sound-btn",
        "aria-label": "Response sound",
        "aria-pressed": !!s,
        title: s ? "Mute response sound" : "Enable response sound",
        onClick: i,
        children: s ? /* @__PURE__ */ b(Ma, { size: 16, "aria-hidden": "true" }) : /* @__PURE__ */ b(Da, { size: 16, "aria-hidden": "true" })
      }
    ),
    r && /* @__PURE__ */ b(
      "button",
      {
        type: "button",
        onClick: r,
        className: "icon-btn-action",
        "aria-label": "Start a new conversation",
        title: "New conversation",
        children: /* @__PURE__ */ b(_a, { size: 15 })
      }
    ),
    n && /* @__PURE__ */ b(
      "button",
      {
        type: "button",
        onClick: n,
        className: "icon-btn-action",
        "aria-label": c ? "Minimize chat" : "Close chat",
        children: /* @__PURE__ */ b(Oa, { size: 16 })
      }
    )
  ] })
] });
function Gl(e, t) {
  const n = Ae(e);
  qe(() => {
    var r;
    n.current && !e && ((r = t.current) == null || r.focus()), n.current = e;
  }, [e, t]);
}
function Kl({ className: e, ...t }) {
  return /* @__PURE__ */ b("div", { ...t, "data-slot": "input-group", className: ue("chat-input-group", e) });
}
function Yl({ className: e, ...t }) {
  return /* @__PURE__ */ b("textarea", { ...t, "data-slot": "input-group-textarea", className: ue("chat-textarea", e) });
}
function Xl({ className: e, ...t }) {
  return /* @__PURE__ */ b("div", { ...t, "data-slot": "input-group-addon", className: ue("chat-input-actions", e) });
}
function ls({ className: e, ...t }) {
  return /* @__PURE__ */ b("button", { type: "button", ...t, "data-slot": "input-group-button", className: ue("chat-send-btn", e) });
}
const Bi = /* @__PURE__ */ y.forwardRef(function(t, n) {
  const {
    render: r,
    className: o,
    disabled: s = !1,
    focusableWhenDisabled: i = !1,
    nativeButton: c = !0,
    style: a,
    ...l
  } = t, {
    getButtonProps: u,
    buttonRef: f
  } = Ai({
    disabled: s,
    focusableWhenDisabled: i,
    native: c
  });
  return vt("button", t, {
    state: {
      disabled: s
    },
    ref: [n, f],
    props: [l, u]
  });
});
process.env.NODE_ENV !== "production" && (Bi.displayName = "Button");
const us = (e) => typeof e == "boolean" ? `${e}` : e === 0 ? "0" : e, fs = ti, Jl = (e, t) => (n) => {
  var r;
  if ((t == null ? void 0 : t.variants) == null) return fs(e, n == null ? void 0 : n.class, n == null ? void 0 : n.className);
  const { variants: o, defaultVariants: s } = t, i = Object.keys(o).map((l) => {
    const u = n == null ? void 0 : n[l], f = s == null ? void 0 : s[l];
    if (u === null) return null;
    const p = us(u) || us(f);
    return o[l][p];
  }), c = n && Object.entries(n).reduce((l, u) => {
    let [f, p] = u;
    return p === void 0 || (l[f] = p), l;
  }, {}), a = t == null || (r = t.compoundVariants) === null || r === void 0 ? void 0 : r.reduce((l, u) => {
    let { class: f, className: p, ...h } = u;
    return Object.entries(h).every((d) => {
      let [g, m] = d;
      return Array.isArray(m) ? m.includes({
        ...s,
        ...c
      }[g]) : {
        ...s,
        ...c
      }[g] === m;
    }) ? [
      ...l,
      f,
      p
    ] : l;
  }, []);
  return fs(e, i, a, n == null ? void 0 : n.class, n == null ? void 0 : n.className);
}, Zl = Jl("vps-ui-button", {
  variants: {
    variant: {
      default: "vps-ui-button--default",
      outline: "vps-ui-button--outline",
      secondary: "vps-ui-button--secondary",
      ghost: "vps-ui-button--ghost",
      destructive: "vps-ui-button--destructive",
      link: "vps-ui-button--link"
    },
    size: {
      default: "vps-ui-button--size-default",
      xs: "vps-ui-button--size-xs",
      sm: "vps-ui-button--size-sm",
      lg: "vps-ui-button--size-lg",
      icon: "vps-ui-button--size-icon",
      "icon-xs": "vps-ui-button--size-icon-xs",
      "icon-sm": "vps-ui-button--size-icon-sm",
      "icon-lg": "vps-ui-button--size-icon-lg"
    }
  },
  defaultVariants: { variant: "default", size: "default" }
});
function Co({ className: e, variant: t, size: n, ...r }) {
  return /* @__PURE__ */ b(
    Bi,
    {
      type: "button",
      "data-slot": "button",
      ...r,
      className: (o) => ue(
        Zl({ variant: t, size: n }),
        typeof e == "function" ? e(o) : e
      )
    }
  );
}
function Ql({ className: e, ...t }) {
  return /* @__PURE__ */ b(
    "div",
    {
      ...t,
      className: ue("flex scroll-fade-x scrollbar-none gap-2 overflow-x-auto overscroll-x-contain", e),
      "data-slot": "suggestions"
    }
  );
}
function eu({
  suggestion: e,
  onClick: t,
  children: n,
  className: r,
  variant: o = "outline",
  size: s = "sm",
  ...i
}) {
  return /* @__PURE__ */ b(
    Co,
    {
      ...i,
      variant: o,
      size: s,
      className: (c) => ue("shrink-0", typeof r == "function" ? r(c) : r),
      onClick: () => t == null ? void 0 : t(e),
      children: n ?? e
    }
  );
}
function tu(e, t) {
  const n = t.trim().toLowerCase();
  return n ? e.filter(
    (r) => r.label.toLowerCase().includes(n) || r.query.toLowerCase().includes(n)
  ) : e;
}
const nu = ({
  suggestions: e,
  onSelect: t,
  disabled: n,
  variant: r = "list"
}) => e.length ? /* @__PURE__ */ b(
  Ql,
  {
    className: r === "badge" ? "chat-suggestion-strip" : "suggestions-list",
    role: "list",
    "aria-label": "Suggested questions",
    children: e.map((o) => /* @__PURE__ */ b("div", { role: "listitem", children: /* @__PURE__ */ b(
      eu,
      {
        suggestion: o.query,
        disabled: n,
        onClick: () => t(o),
        title: o.query,
        children: o.label
      }
    ) }, o.query))
  }
) : null, ru = ({
  onSend: e,
  onStop: t,
  disabled: n = !1,
  placeholder: r = "Ask something…",
  ref: o
}) => {
  const { suggestions: s, showSuggestions: i, suggestionBadgesEnabled: c, models: a, selectedModelId: l, selectModel: u } = er(), [f, p] = Se(""), h = Ae(null), d = Ar(), g = Ar(), m = (E) => {
    E && (E.style.height = "auto", E.style.height = `${Math.min(E.scrollHeight, 96)}px`);
  };
  Gl(n, h), Qc(o, () => ({
    edit(E) {
      var T;
      n || (p(E), (T = h.current) == null || T.focus());
    }
  }), [n]), qe(() => {
    m(h.current);
  }, [f]);
  const v = Mt(() => {
    if (!c || n) return [];
    const E = f.trim();
    return E ? tu(s, E) : i ? s : [];
  }, [n, i, c, s, f]), C = (E) => {
    p(E.query);
    const T = h.current;
    T == null || T.focus();
  }, w = () => {
    const E = f.trim();
    !E || n || (e(E), p(""));
  };
  return /* @__PURE__ */ U("div", { className: "chat-input-wrapper", children: [
    /* @__PURE__ */ b(
      nu,
      {
        variant: "badge",
        suggestions: v,
        onSelect: C,
        disabled: n
      }
    ),
    /* @__PURE__ */ U("form", { onSubmit: (E) => {
      E.preventDefault(), w();
    }, children: [
      /* @__PURE__ */ b("label", { htmlFor: d, className: "sr-only", children: "Chat message" }),
      /* @__PURE__ */ U(Kl, { children: [
        /* @__PURE__ */ b(
          Yl,
          {
            id: d,
            ref: h,
            rows: 1,
            value: f,
            disabled: n,
            placeholder: r,
            onChange: (E) => p(E.target.value),
            onKeyDown: (E) => {
              var T;
              E.key === "Enter" && !E.shiftKey && !E.nativeEvent.isComposing && (E.preventDefault(), (T = E.currentTarget.form) == null || T.requestSubmit());
            }
          }
        ),
        /* @__PURE__ */ U(Xl, { children: [
          a.length > 1 && /* @__PURE__ */ U("div", { className: "chat-model-picker", children: [
            /* @__PURE__ */ b("label", { htmlFor: g, className: "sr-only", children: "AI model" }),
            /* @__PURE__ */ U(
              "select",
              {
                id: g,
                value: l,
                disabled: n,
                onChange: (E) => u(E.target.value),
                children: [
                  /* @__PURE__ */ b("option", { value: "auto", children: "Automatic" }),
                  a.map((E) => /* @__PURE__ */ b("option", { value: E.id, disabled: !E.configured, children: E.label }, E.id))
                ]
              }
            )
          ] }),
          t ? /* @__PURE__ */ b(ls, { onClick: t, "aria-label": "Stop response", title: "Stop response", children: /* @__PURE__ */ b(li, { size: 13, fill: "currentColor", "aria-hidden": "true" }) }) : /* @__PURE__ */ b(ls, { type: "submit", disabled: n || !f.trim(), "aria-label": "Send message", title: "Send message", children: /* @__PURE__ */ b(ba, { size: 16, "aria-hidden": "true" }) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ U("p", { className: "chat-input-footer", children: [
      /* @__PURE__ */ b("span", { className: "chat-input-note", children: "AI can make mistakes." }),
      "Powered by ",
      /* @__PURE__ */ b("span", { className: "chat-input-footer-brand", children: "VPS Veritas AI" })
    ] })
  ] });
};
function ou({ defaultTagName: e, props: t, render: n, state: r = {}, stateAttributesMapping: o }) {
  let s = Br(su(r, o), t);
  if (!n) return y.createElement(e, s);
  if (typeof n == "function") return n(s, r);
  if (!y.isValidElement(n)) return null;
  let i = n.props, c = { ...Br(s, i), ref: un(s.ref, i.ref) };
  return y.cloneElement(n, c);
}
function Br(...e) {
  let t = {};
  for (let n of e) {
    if (!n) continue;
    let r = n;
    for (let o of Object.keys(r)) {
      let s = r[o];
      if (s === void 0) continue;
      let i = t[o];
      o === "className" ? t[o] = [i, s].filter(Boolean).join(" ") : o === "style" ? t[o] = { ...i, ...s } : o === "ref" ? t[o] = un(i, s) : cu(o) && typeof i == "function" && typeof s == "function" ? t[o] = iu(s, i) : t[o] = s;
    }
  }
  return t;
}
function su(e, t) {
  var r;
  let n = {};
  for (let o of Object.keys(e)) {
    let s = e[o], i = (r = t == null ? void 0 : t[o]) == null ? void 0 : r.call(t, s);
    if (i) {
      Object.assign(n, i);
      continue;
    }
    if (o === "slot") {
      n["data-slot"] = s;
      continue;
    }
    let c = `data-${String(o).replace(/[A-Z]/g, (a) => `-${a.toLowerCase()}`)}`;
    typeof s == "boolean" ? n[c] = s ? "" : void 0 : s != null && (n[c] = String(s));
  }
  return n;
}
function iu(e, t) {
  return function(n) {
    e(n), n.defaultPrevented || t(n);
  };
}
function cu(e) {
  return /^on[A-Z]/.test(e);
}
function un(...e) {
  let t = e.filter(Boolean);
  if (t.length !== 0) return (n) => {
    for (let r of t) typeof r == "function" ? r(n) : r && (r.current = n);
  };
}
var au = 8, lu = 64, uu = 0, Hn = 0.5, fu = 180, du = /* @__PURE__ */ new Set(["ArrowDown", "ArrowUp", "End", "Home", "PageDown", "PageUp", " "]), Vi = { start: !1, end: !1 }, pu = [], Un = { currentAnchorId: null, visibleMessageIds: pu };
function hu({ content: e, scrollEdgeThreshold: t, spacer: n, viewport: r }) {
  if (!r || !e) return Vi;
  let o = Eo({ content: e, spacer: n, viewport: r });
  return { start: r.scrollTop > t, end: o - r.scrollTop - r.clientHeight > t };
}
function gu({ content: e, scrollMargin: t, scrollPreviousItemPeek: n, spacer: r, viewport: o, visibleMessageIds: s }) {
  if (!e || !o) return Un;
  let i = o.getBoundingClientRect(), c = i.top + t + n, a = typeof IntersectionObserver > "u", l = [], u = null;
  for (let f of on(e, r)) {
    let p = f.dataset.messageId;
    if (!p) continue;
    let h = f.dataset.scrollAnchor === "true", d = h || a ? f.getBoundingClientRect() : null;
    (a && d ? d.bottom > c && d.top < i.bottom : s.has(p)) && l.push(p), h && d && d.top <= c + Hn && (u = p);
  }
  return l.length === 0 && u === null ? Un : { currentAnchorId: u, visibleMessageIds: l };
}
function on(e, t) {
  return Array.from(e.children).filter((n) => n instanceof HTMLElement && n !== t);
}
function mu(e, t) {
  for (let n = t; n < e.length; n++) {
    let r = e[n];
    if ((r == null ? void 0 : r.dataset.scrollAnchor) === "true") return r;
  }
  return null;
}
function bu(e, t) {
  for (let n of e) if (n.dataset.scrollAnchor === "true" && !t.has(n)) return n;
  return null;
}
function vu(e, t) {
  var r;
  let n = 0;
  for (let o = t; o < e.length; o++) if (((r = e[o]) == null ? void 0 : r.dataset.scrollAnchor) === "true" && (n += 1, n > 1)) return !0;
  return !1;
}
function yu(e) {
  for (let t = e.length - 1; t >= 0; t--) {
    let n = e[t];
    if ((n == null ? void 0 : n.dataset.scrollAnchor) === "true") return n;
  }
  return null;
}
function Cu({ content: e, spacer: t, viewport: n }) {
  let r = n.getBoundingClientRect();
  for (let o of on(e, t)) {
    if (!o.dataset.messageId) continue;
    let s = o.getBoundingClientRect();
    if (s.bottom > r.top && s.top < r.bottom) return o;
  }
  return null;
}
function Eu({ align: e, element: t, scrollMargin: n, spacer: r, viewport: o }) {
  let s = $i(t, o), i = t.getBoundingClientRect().height, c = Tu(r);
  if (e === "center") {
    let a = Math.max(0, o.clientHeight - c.start - c.end);
    return s - c.start - (a - i) / 2 - n;
  }
  if (e === "end") return s - o.clientHeight + i + c.end + n;
  if (e === "nearest") {
    let a = s + i, l = o.scrollTop + c.start, u = o.scrollTop + o.clientHeight - c.end;
    return s >= l && a <= u ? o.scrollTop : s < l ? s - c.start - n : a - o.clientHeight + c.end + n;
  }
  return s - c.start - n;
}
function $i(e, t) {
  let n = e.getBoundingClientRect(), r = t.getBoundingClientRect();
  return n.top - r.top + t.scrollTop;
}
function Dn(e, t) {
  return e.getBoundingClientRect().top - t.getBoundingClientRect().top;
}
function wu({ content: e, scrollTop: t, spacer: n, viewport: r }) {
  let o = Eo({ content: e, spacer: n, viewport: r });
  return t + r.clientHeight - o;
}
function Eo({ content: e, spacer: t, viewport: n }) {
  let r = on(e, t), o = Hi(e), s = n.getBoundingClientRect(), i = n.scrollTop, c = o.start + o.end;
  for (let a of r) {
    let l = a.getBoundingClientRect();
    c = Math.max(c, l.bottom - s.top + i + o.end);
  }
  return c;
}
function Su(e) {
  return Math.max(0, e.scrollHeight - e.clientHeight);
}
function Hi(e) {
  let t = window.getComputedStyle(e);
  return { end: Vr(t.paddingBlockEnd || t.paddingBottom), start: Vr(t.paddingBlockStart || t.paddingTop) };
}
function Tu(e) {
  let t = e == null ? void 0 : e.parentElement;
  return t ? Hi(t) : { end: 0, start: 0 };
}
function Ru(e) {
  if (!e) return 0;
  let t = window.getComputedStyle(e), n = t.rowGap === "normal" ? t.gap : t.rowGap;
  return Vr(n);
}
function Vr(e) {
  if (!e) return 0;
  let t = Number.parseFloat(e);
  return Number.isFinite(t) ? t : 0;
}
function Ui(e, t) {
  let n = e, r = /* @__PURE__ */ new Set();
  return { getSnapshot: () => n, hasListeners: () => r.size > 0, setSnapshot: (o) => {
    t(n, o) || (n = o, r.forEach((s) => s()));
  }, subscribe: (o, s, i) => {
    let c = r.size === 0;
    return r.add(o), c && (s == null || s()), () => {
      r.delete(o), r.size === 0 && (i == null || i());
    };
  } };
}
function ds(e, t) {
  return Ui(e, t);
}
function xu() {
  return Ui(Un, Ou);
}
function Pu(e, t) {
  return e.start === t.start && e.end === t.end;
}
function Ou(e, t) {
  return e.currentAnchorId !== t.currentAnchorId || e.visibleMessageIds.length !== t.visibleMessageIds.length ? !1 : e.visibleMessageIds.every((n, r) => n === t.visibleMessageIds[r]);
}
function Iu({ autoScroll: e, defaultScrollPosition: t, scrollEdgeThreshold: n, scrollMargin: r, scrollPreviousItemPeek: o }) {
  let s = y.useRef(e), i = y.useRef(!1), c = y.useRef(null), a = y.useRef(!1), l = y.useRef(n), u = y.useRef(0), f = y.useRef(null), p = y.useRef(0), h = y.useRef(e ? "following-bottom" : "free-scrolling"), d = y.useRef(/* @__PURE__ */ new Map()), g = y.useRef(null), m = y.useRef(null), v = y.useRef(null), C = y.useRef(o), w = y.useRef(!0), E = y.useRef(null), T = y.useRef(r), S = y.useRef(null), R = y.useRef(0), P = y.useRef(0), O = y.useRef(null), M = y.useRef(null), F = y.useRef(null), A = y.useRef(null), D = y.useRef(null), I = y.useRef(null), x = y.useRef(null), _ = y.useRef(null), z = y.useRef(null), N = y.useRef(/* @__PURE__ */ new Set()), k = y.useRef(/* @__PURE__ */ new WeakSet());
  return F.current === null && (F.current = ds(t === "end" || t === "last-anchor", (Y, K) => Y === K)), A.current === null && (A.current = ds(Vi, Pu)), z.current === null && (z.current = xu()), s.current = e, l.current = n, T.current = r, C.current = o, { autoScrollRef: s, autoscrollingRef: i, autoscrollingTimeoutRef: D, streamingTurnRef: v, contentRef: c, defaultScrollPositionAppliedRef: a, firstItemRef: f, itemCountRef: u, lastScrollTopRef: p, messageElementsRef: d, modeRef: h, pendingScrollFrameRef: S, pendingScrollToMessageRef: g, prependRestoreRef: m, preserveScrollOnPrependRef: w, pendingDefaultScrollStore: F.current, rootRef: E, scrollEdgeThresholdRef: l, scrollMarginRef: T, scrollPreviousItemPeekRef: C, spacerGapRef: R, spacerHeightRef: P, spacerRef: O, stateFrameRef: M, stateStore: A.current, viewportRef: I, visibilityFrameRef: x, visibilityObserverRef: _, visibilityStore: z.current, visibleMessageIdsRef: N, handledScrollAnchorsRef: k };
}
function zi(e) {
  e.pendingDefaultScrollStore.setSnapshot(!1);
}
function Fn(e) {
  e.defaultScrollPositionAppliedRef.current = !0, zi(e);
}
function _u({ refs: e, commitScrollState: t, scheduleStateCommit: n, scheduleVisibilitySync: r }) {
  let { streamingTurnRef: o, autoScrollRef: s, autoscrollingRef: i, autoscrollingTimeoutRef: c, contentRef: a, itemCountRef: l, messageElementsRef: u, modeRef: f, pendingScrollToMessageRef: p, prependRestoreRef: h, scrollMarginRef: d, scrollPreviousItemPeekRef: g, spacerGapRef: m, spacerHeightRef: v, spacerRef: C, viewportRef: w } = e, E = y.useCallback((A) => {
    c.current !== null && (window.clearTimeout(c.current), c.current = null), i.current !== A && (i.current = A, t()), A && (c.current = window.setTimeout(() => {
      c.current = null, i.current = !1, t();
    }, fu));
  }, [t]), T = y.useCallback((A) => {
    let D = C.current;
    if (!D) return;
    let I = Math.max(0, Math.ceil(A));
    v.current !== I && (v.current = I, D.hidden = I === 0, D.style.height = `${I}px`, D.style.marginTop = I > 0 ? `${-m.current}px` : "");
  }, []), S = y.useCallback((A, { behavior: D = "auto", autoscrolling: I = !1 } = {}) => {
    let x = w.current;
    if (!x) return;
    let _ = Math.max(0, A);
    if (Math.abs(x.scrollTop - _) <= Hn) {
      x.scrollTop = _, t();
      return;
    }
    I && E(!0), x.scrollTo({ top: _, behavior: D }), n();
  }, [t, n, E]), R = y.useCallback(({ behavior: A = "auto" } = {}) => w.current ? (T(0), o.current = null, f.current = "free-scrolling", S(0, { behavior: A }), r(), !0) : !1, [r, S, T]), P = y.useCallback(({ behavior: A = "auto" } = {}) => {
    let D = w.current;
    return D ? (T(0), o.current = null, f.current = s.current ? "following-bottom" : "free-scrolling", S(Su(D), { autoscrolling: !0, behavior: A }), r(), !0) : !1;
  }, [r, S, T]), O = y.useCallback((A, { align: D = "start", behavior: I = "auto", scrollMargin: x = d.current } = {}, { keepPreviousPeek: _ = !1 } = {}) => {
    let z = a.current, N = w.current;
    if (!z || !N || !z.contains(A)) return !1;
    let k = Eu({ align: D, element: A, scrollMargin: _ ? x + g.current : x, spacer: C.current, viewport: N }), Y = wu({ content: z, scrollTop: k, spacer: C.current, viewport: N });
    return T(Y), h.current = { element: A, viewportTop: Dn(A, N) }, f.current = _ ? "anchored-to-message" : "settling-jump", o.current = _ ? A : null, S(k, { behavior: I }), r(), !0;
  }, [r, S, T]), M = y.useCallback(() => {
    let A = o.current;
    return !A || !A.isConnected || f.current !== "anchored-to-message" ? !1 : O(A, { align: "start" }, { keepPreviousPeek: !0 });
  }, [O]), F = y.useCallback((A, D) => {
    let I = u.current.get(A);
    return I ? (Fn(e), O(I, D) ? (p.current = null, !0) : (p.current = { messageId: A, options: D }, !0)) : l.current === 0 ? (p.current = { messageId: A, options: D }, Fn(e), !0) : !1;
  }, [O]);
  return { flushPendingScrollToMessage: y.useCallback(() => {
    let A = p.current;
    if (!A) return !1;
    let D = u.current.get(A.messageId);
    return !D || !O(D, A.options) ? !1 : (p.current = null, Fn(e), !0);
  }, [O]), reanchorToAnchoredMessage: M, scrollToElement: O, scrollToEnd: P, scrollToMessage: F, scrollToStart: R };
}
function ps(e, t) {
  return y.useCallback((n) => {
    e.current = n, n && t();
  }, [e, t]);
}
function Au({ autoScroll: e = !1, defaultScrollPosition: t = "end", scrollEdgeThreshold: n = au, scrollPreviousItemPeek: r = lu, scrollMargin: o = uu }) {
  let s = Iu({ autoScroll: e, defaultScrollPosition: t, scrollEdgeThreshold: n, scrollMargin: o, scrollPreviousItemPeek: r }), { streamingTurnRef: i, autoScrollRef: c, autoscrollingRef: a, autoscrollingTimeoutRef: l, contentRef: u, defaultScrollPositionAppliedRef: f, firstItemRef: p, itemCountRef: h, lastScrollTopRef: d, messageElementsRef: g, modeRef: m, pendingScrollFrameRef: v, pendingScrollToMessageRef: C, prependRestoreRef: w, preserveScrollOnPrependRef: E, pendingDefaultScrollStore: T, rootRef: S, scrollEdgeThresholdRef: R, scrollMarginRef: P, scrollPreviousItemPeekRef: O, spacerGapRef: M, spacerHeightRef: F, spacerRef: A, stateFrameRef: D, stateStore: I, viewportRef: x, visibilityFrameRef: _, visibilityObserverRef: z, visibilityStore: N, visibleMessageIdsRef: k, handledScrollAnchorsRef: Y } = s, K = y.useRef(t);
  K.current !== t && (K.current = t, f.current = !1);
  let le = y.useCallback((V) => {
    let j = S.current, Z = x.current, se = [V.start && "start", V.end && "end"].filter(Boolean).join(" "), Ne = a.current;
    for (let Re of [j, Z]) Re && (se ? Re.setAttribute("data-scrollable", se) : Re.removeAttribute("data-scrollable"), Re.toggleAttribute("data-autoscrolling", Ne));
  }, []), ie = y.useCallback((V) => {
    var se;
    let j = ((se = x.current) == null ? void 0 : se.scrollTop) ?? 0, Z = j < d.current - Hn;
    d.current = j, c.current && !V.end && m.current !== "settling-jump" && m.current !== "anchored-to-message" ? m.current = "following-bottom" : m.current === "following-bottom" && V.end && Z && !a.current && (m.current = "free-scrolling");
  }, []), L = y.useCallback(() => {
    let V = hu({ content: u.current, scrollEdgeThreshold: R.current, spacer: A.current, viewport: x.current });
    ie(V);
    let j = m.current === "following-bottom" ? { ...V, end: !1 } : V;
    le(j), I.setSnapshot(j);
  }, [ie, I, le]), X = y.useCallback(() => {
    D.current === null && (D.current = window.requestAnimationFrame(() => {
      D.current = null, L();
    }));
  }, [L]), B = y.useCallback(() => {
    N.hasListeners() && _.current === null && (_.current = window.requestAnimationFrame(() => {
      _.current = null, N.hasListeners() && N.setSnapshot(gu({ content: u.current, scrollMargin: P.current, scrollPreviousItemPeek: O.current, spacer: A.current, viewport: x.current, visibleMessageIds: k.current }));
    }));
  }, [N]), { flushPendingScrollToMessage: $, reanchorToAnchoredMessage: Q, scrollToElement: re, scrollToEnd: ee, scrollToMessage: te, scrollToStart: q } = _u({ refs: s, commitScrollState: L, scheduleStateCommit: X, scheduleVisibilitySync: B }), ne = y.useCallback(() => {
    let V = w.current, j = x.current;
    if (!V || !j || !V.element.isConnected) return !1;
    let Z = Dn(V.element, j) - V.viewportTop;
    return Math.abs(Z) <= Hn ? !1 : (j.scrollTop += Z, V.viewportTop = Dn(V.element, j), X(), B(), !0);
  }, [X, B]), oe = y.useCallback(() => {
    let V = u.current, j = x.current;
    if (!V || !j) {
      w.current = null;
      return;
    }
    let Z = Cu({ content: V, spacer: A.current, viewport: j });
    w.current = Z ? { element: Z, viewportTop: Dn(Z, j) } : null;
  }, []), ve = y.useCallback(() => {
    v.current === null && (v.current = window.requestAnimationFrame(() => {
      v.current = null, $() && oe();
    }));
  }, [oe, $]), W = y.useCallback(() => {
    if (!t || f.current || h.current === 0) return !1;
    let V = !1;
    if (t === "last-anchor") {
      let j = u.current, Z = x.current, se = j && Z ? yu(on(j, A.current)) : null;
      if (!j || !Z || !se) V = ee({ behavior: "auto" });
      else {
        let Ne = $i(se, Z);
        V = Eo({ content: j, spacer: A.current, viewport: Z }) - Ne <= Z.clientHeight ? ee({ behavior: "auto" }) : re(se, { align: "start" }, { keepPreviousPeek: !0 });
      }
    } else V = t === "end" ? ee({ behavior: "auto" }) : q({ behavior: "auto" });
    return V ? (Fn(s), !0) : !1;
  }, [t, re, ee, q]), J = y.useCallback(() => {
    let V = u.current;
    if (!V) return;
    let j = on(V, A.current), Z = h.current, se = p.current;
    h.current = j.length, p.current = j[0] ?? null, (() => {
      if ($()) return;
      if (Z === 0) {
        if (W() || j.length > 0 && c.current && ee({ behavior: "auto" })) return;
        L(), B();
        return;
      }
      let Ne = se ? j.indexOf(se) : -1;
      if (E.current && Ne > 0) {
        ne();
        return;
      }
      if (j.length > Z) {
        let Re = mu(j, Z);
        if (Re) {
          if (c.current && m.current === "following-bottom" && vu(j, Z)) {
            ee({ behavior: "auto" });
            return;
          }
          re(Re, { align: "start" }, { keepPreviousPeek: !0 }), Y.current.add(Re);
          return;
        }
      }
      if (j.length === Z) {
        let Re = bu(j, Y.current);
        if (Re) {
          re(Re, { align: "start" }, { keepPreviousPeek: !0 }), Y.current.add(Re);
          return;
        }
      }
      m.current === "following-bottom" && c.current ? ee({ behavior: "auto" }) : (L(), B());
    })(), oe();
  }, [W, oe, L, $, ne, B, re, ee]), ce = y.useCallback(() => {
    if (m.current === "following-bottom" && c.current) {
      ee({ behavior: "auto" });
      return;
    }
    let V = F.current;
    if (Q()) {
      c.current && V > 0 && F.current === 0 && ee({ behavior: "auto" });
      return;
    }
    X(), B();
  }, [Q, X, B, ee]), he = y.useCallback(() => {
    let V = x.current;
    if (!(!V || !N.hasListeners())) {
      if (typeof IntersectionObserver > "u") {
        B();
        return;
      }
      z.current || (z.current = new IntersectionObserver((j) => {
        for (let Z of j) {
          let se = Z.target.dataset.messageId;
          se && (Z.isIntersecting ? k.current.add(se) : k.current.delete(se));
        }
        B();
      }, { root: V, rootMargin: `${-(P.current + O.current)}px 0px 0px 0px`, threshold: [0, 0.01, 0.5, 1] })), g.current.forEach((j) => {
        var Z;
        (Z = z.current) == null || Z.observe(j);
      }), B();
    }
  }, [B, N]), Ie = y.useCallback(() => {
    var V;
    _.current !== null && (window.cancelAnimationFrame(_.current), _.current = null), (V = z.current) == null || V.disconnect(), z.current = null, k.current.clear(), N.setSnapshot(Un);
  }, [N]), Fe = y.useCallback((V, j, Z) => {
    var se, Ne, Re;
    if (j) {
      g.current.set(V, j), (se = z.current) == null || se.observe(j), B(), ((Ne = C.current) == null ? void 0 : Ne.messageId) === V && ve();
      return;
    }
    Z && g.current.get(V) === Z && (g.current.delete(V), k.current.delete(V), (Re = z.current) == null || Re.unobserve(Z), B());
  }, [ve, B]), xe = y.useCallback(() => {
    (m.current === "following-bottom" || m.current === "anchored-to-message" || m.current === "settling-jump") && (i.current = null, m.current = "free-scrolling");
  }, []), Le = y.useCallback(() => le(I.getSnapshot()), [I, le]), Ue = ps(S, Le), H = ps(x, Le), G = y.useCallback((V) => {
    u.current = V;
  }, []), we = y.useCallback((V) => {
    A.current = V, M.current = Ru((V == null ? void 0 : V.parentElement) ?? null);
  }, []), be = y.useCallback(() => {
    L(), B(), oe();
  }, [oe, L, B]), ge = y.useMemo(() => ({ handleContentChange: J, handleResize: ce, observeVisibility: he, pendingDefaultScrollStore: T, preserveScrollOnPrependRef: E, scrollToEnd: ee, scrollToMessage: te, scrollToStart: q, setContentElement: G, setRootElement: Ue, setSpacerElement: we, setViewportElement: H, stateStore: I, syncAfterScroll: be, unobserveVisibility: Ie, userScrollIntent: xe, viewportRef: x, visibilityStore: N }), [J, ce, he, T, ee, te, q, G, Ue, we, H, I, be, Ie, xe, N]);
  return y.useLayoutEffect(() => {
    W() || h.current === 0 && zi(s);
  }, [W]), y.useEffect(() => () => {
    var V;
    D.current !== null && (window.cancelAnimationFrame(D.current), D.current = null), _.current !== null && (window.cancelAnimationFrame(_.current), _.current = null), l.current !== null && (window.clearTimeout(l.current), l.current = null), v.current !== null && (window.cancelAnimationFrame(v.current), v.current = null), (V = z.current) == null || V.disconnect(), z.current = null;
  }, []), y.useLayoutEffect(() => {
    if (e && m.current === "following-bottom" && h.current > 0) {
      ee({ behavior: "auto" });
      return;
    }
    L();
  }, [e, L, ee]), { context: ge, registerMessage: Fe };
}
function ku(e) {
  let t = y.useRef(e);
  return t.current = e, t;
}
var Wi = y.createContext(null), qi = y.createContext(null);
function fn() {
  let e = y.useContext(Wi);
  if (!e) throw new Error("useMessageScroller must be used within a MessageScroller.");
  return e;
}
function Nu() {
  let e = y.useContext(qi);
  if (!e) throw new Error("MessageScrollerItem must be used within a MessageScroller.");
  return e;
}
function Mu({ autoScroll: e = !1, children: t, defaultScrollPosition: n = "end", scrollEdgeThreshold: r, scrollPreviousItemPeek: o, scrollMargin: s }) {
  let { context: i, registerMessage: c } = Au({ autoScroll: e, defaultScrollPosition: n, scrollEdgeThreshold: r, scrollPreviousItemPeek: o, scrollMargin: s });
  return b(Wi.Provider, { value: i, children: b(qi.Provider, { value: c, children: t }) });
}
function ji() {
  let { pendingDefaultScrollStore: e } = fn();
  return y.useSyncExternalStore(e.subscribe, e.getSnapshot, e.getSnapshot);
}
function Du({ children: e, ...t }) {
  let { setRootElement: n } = fn(), r = ji();
  return b("div", { ref: n, ...t, ...r ? { "data-pending-scroll": "" } : null, children: e });
}
function Fu({ "aria-label": e, children: t, onKeyDown: n, onScroll: r, onTouchMove: o, onWheel: s, preserveScrollOnPrepend: i = !0, ref: c, role: a, tabIndex: l, ...u }) {
  let { handleResize: f, preserveScrollOnPrependRef: p, setViewportElement: h, syncAfterScroll: d, userScrollIntent: g, viewportRef: m } = fn(), v = ji();
  p.current = i;
  let C = y.useCallback((R) => {
    var P;
    h(R), (P = un(c)) == null || P(R);
  }, [c, h]);
  function w(R) {
    d(), r == null || r(R);
  }
  function E(R) {
    g(), s == null || s(R);
  }
  function T(R) {
    g(), o == null || o(R);
  }
  function S(R) {
    du.has(R.key) && g(), n == null || n(R);
  }
  return y.useEffect(() => {
    let R = m.current;
    if (!R || typeof ResizeObserver > "u") return;
    let P = 0, O = new ResizeObserver(() => {
      window.cancelAnimationFrame(P), P = window.requestAnimationFrame(f);
    });
    return O.observe(R), () => {
      window.cancelAnimationFrame(P), O.disconnect();
    };
  }, [f, m]), b("div", { ref: C, role: a ?? "region", "aria-label": e ?? "Messages", tabIndex: l ?? 0, onKeyDown: S, onScroll: w, onTouchMove: T, onWheel: E, ...u, ...v ? { "data-pending-scroll": "" } : null, children: t });
}
function Lu({ "aria-relevant": e, children: t, ref: n, role: r, spacerClassName: o, ...s }) {
  let { handleContentChange: i, handleResize: c, setContentElement: a, setSpacerElement: l } = fn(), u = y.useRef(null), f = y.useCallback((p) => {
    var h;
    u.current = p, a(p), (h = un(n)) == null || h(p);
  }, [n, a]);
  return y.useLayoutEffect(() => {
    let p = u.current;
    if (!p || (i(), typeof MutationObserver > "u")) return;
    let h = new MutationObserver(() => {
      i();
    });
    return h.observe(p, { childList: !0 }), () => h.disconnect();
  }, [i]), y.useEffect(() => {
    let p = u.current;
    if (!p || typeof ResizeObserver > "u") return;
    let h = 0, d = new ResizeObserver(() => {
      window.cancelAnimationFrame(h), h = window.requestAnimationFrame(c);
    });
    return d.observe(p), () => {
      window.cancelAnimationFrame(h), d.disconnect();
    };
  }, [c]), U("div", { ref: f, role: r ?? "log", "aria-relevant": e ?? "additions", ...s, children: [t, b("div", { ref: l, "aria-hidden": "true", "data-message-scroller-spacer": "", hidden: !0, className: o })] });
}
function Bu({ messageId: e, ref: t, scrollAnchor: n = !1, ...r }) {
  let o = Nu(), s = y.useRef(null), i = y.useCallback((c) => {
    var l;
    let a = s.current;
    s.current = c, e && o(e, c, a), (l = un(t)) == null || l(c);
  }, [e, t, o]);
  return b("div", { ref: i, "data-message-id": e, "data-scroll-anchor": n ? "true" : "false", ...r });
}
function Vu({ behavior: e = "smooth", children: t, direction: n = "end", onClick: r, render: o, tabIndex: s, type: i = "button", ...c }) {
  let { scrollToEnd: a, scrollToStart: l, stateStore: u } = fn(), f = ku(r), p = y.useCallback((m) => u.subscribe(m), [u]), h = y.useCallback(() => {
    let m = u.getSnapshot();
    return n === "start" ? m.start : m.end;
  }, [n, u]), d = y.useSyncExternalStore(p, h, h), g = y.useCallback((m) => {
    var v;
    d && ((v = f.current) == null || v.call(f, m), m.defaultPrevented || (m.currentTarget.blur(), n === "start" ? l({ behavior: e }) : a({ behavior: e })));
  }, [e, n, d, f, a, l]);
  return ou({ defaultTagName: "button", props: Br({ type: i, inert: !d, tabIndex: d ? s : -1, children: t ?? U("span", { children: ["Scroll to ", n] }), onClick: g }, c), render: o, state: { active: d, direction: n }, stateAttributesMapping: { active: (m) => ({ "data-active": m ? "true" : "false" }) } });
}
var qt = { Provider: Mu, Root: Du, Viewport: Fu, Content: Lu, Item: Bu, Button: Vu };
function $u(e) {
  return /* @__PURE__ */ b(qt.Provider, { ...e });
}
function Hu({
  className: e,
  ...t
}) {
  return /* @__PURE__ */ b(
    qt.Root,
    {
      "data-slot": "message-scroller",
      className: ue("msg-scroller-root", e),
      ...t
    }
  );
}
function Uu({
  className: e,
  ...t
}) {
  return /* @__PURE__ */ b(
    qt.Viewport,
    {
      "data-slot": "message-scroller-viewport",
      className: ue("msg-scroller-viewport", e),
      ...t
    }
  );
}
function zu({
  className: e,
  ...t
}) {
  return /* @__PURE__ */ b(
    qt.Content,
    {
      "data-slot": "message-scroller-content",
      className: ue("msg-scroller-content", e),
      ...t
    }
  );
}
function hs({
  className: e,
  scrollAnchor: t = !1,
  ...n
}) {
  return /* @__PURE__ */ b(
    qt.Item,
    {
      "data-slot": "message-scroller-item",
      scrollAnchor: t,
      className: ue("msg-scroller-item", e),
      ...n
    }
  );
}
function Wu({
  direction: e = "end",
  className: t,
  children: n,
  ...r
}) {
  return /* @__PURE__ */ b(
    qt.Button,
    {
      "data-slot": "message-scroller-button",
      direction: e,
      className: ue("msg-scroller-btn", t),
      ...r,
      children: n ?? /* @__PURE__ */ U(zt, { children: [
        /* @__PURE__ */ b(
          ga,
          {
            size: 16,
            "aria-hidden": "true",
            className: e === "start" ? "rotate-180" : void 0
          }
        ),
        /* @__PURE__ */ b("span", { className: "sr-only", children: e === "end" ? "Jump to latest" : "Jump to start" })
      ] })
    }
  );
}
function $r({
  align: e = "start",
  variant: t = "muted",
  className: n,
  ...r
}) {
  return /* @__PURE__ */ b("div", { ...r, "data-slot": "bubble", "data-align": e, "data-variant": t, className: ue("chat-bubble", n) });
}
function Hr({ className: e, ...t }) {
  return /* @__PURE__ */ b("div", { ...t, "data-slot": "bubble-content", className: ue("chat-bubble-content", e) });
}
const qu = () => /* @__PURE__ */ U(oo, { children: [
  /* @__PURE__ */ b(ui, { className: "avatar-circle", "aria-hidden": "true", children: /* @__PURE__ */ b(ya, { size: 15 }) }),
  /* @__PURE__ */ b(so, { children: /* @__PURE__ */ b($r, { children: /* @__PURE__ */ b(Hr, { children: "Hello — I am the VPS Veritas assistant. Ask about reports, sample status, registration, or support, or choose a suggested question." }) }) })
] });
function Gi() {
  const [e, t] = Se("idle");
  qe(() => {
    if (e !== "copied") return;
    const r = window.setTimeout(() => t("idle"), 2e3);
    return () => window.clearTimeout(r);
  }, [e]);
  async function n(r) {
    t("copying");
    try {
      await navigator.clipboard.writeText(r), t("copied");
    } catch {
      t("failed");
    }
  }
  return { status: e, copy: n };
}
function ju({ message: e, onFeedback: t }) {
  const { status: n, copy: r } = Gi();
  return /* @__PURE__ */ U("div", { className: "chat-message-actions", role: "group", "aria-label": "Response actions", children: [
    /* @__PURE__ */ b(
      "button",
      {
        type: "button",
        className: "chat-message-action",
        "aria-label": "Copy response",
        title: "Copy response",
        disabled: n === "copying",
        onClick: () => void r(e.content),
        children: n === "copied" ? /* @__PURE__ */ b(ro, { size: 16, "aria-hidden": "true" }) : /* @__PURE__ */ b(ci, { size: 16, "aria-hidden": "true" })
      }
    ),
    /* @__PURE__ */ b(
      "button",
      {
        type: "button",
        className: "chat-message-action",
        "aria-label": "Like response",
        title: "Like response",
        "aria-pressed": e.feedback === "like",
        onClick: () => t(e.id, "like"),
        children: /* @__PURE__ */ b(Na, { size: 16, "aria-hidden": "true" })
      }
    ),
    /* @__PURE__ */ b(
      "button",
      {
        type: "button",
        className: "chat-message-action",
        "aria-label": "Dislike response",
        title: "Dislike response",
        "aria-pressed": e.feedback === "dislike",
        onClick: () => t(e.id, "dislike"),
        children: /* @__PURE__ */ b(ka, { size: 16, "aria-hidden": "true" })
      }
    ),
    /* @__PURE__ */ U("span", { className: "chat-message-copy-status", role: "status", children: [
      n === "copied" && "Copied",
      n === "failed" && "Couldn’t copy"
    ] })
  ] });
}
function wo(e) {
  const t = e.trim();
  if (!/[\u0000-\u001f\u007f]/.test(t) && /^(https?:\/\/|mailto:|\/(?!\/)|#)/i.test(t))
    return t;
}
function Gu(e) {
  return Object.prototype.toString.call(e) === "[object Object]";
}
function gs(e) {
  return Gu(e) || Array.isArray(e);
}
function Ku() {
  return !!(typeof window < "u" && window.document && window.document.createElement);
}
function So(e, t) {
  const n = Object.keys(e), r = Object.keys(t);
  if (n.length !== r.length) return !1;
  const o = JSON.stringify(Object.keys(e.breakpoints || {})), s = JSON.stringify(Object.keys(t.breakpoints || {}));
  return o !== s ? !1 : n.every((i) => {
    const c = e[i], a = t[i];
    return typeof c == "function" ? `${c}` == `${a}` : !gs(c) || !gs(a) ? c === a : So(c, a);
  });
}
function ms(e) {
  return e.concat().sort((t, n) => t.name > n.name ? 1 : -1).map((t) => t.options);
}
function Yu(e, t) {
  if (e.length !== t.length) return !1;
  const n = ms(e), r = ms(t);
  return n.every((o, s) => {
    const i = r[s];
    return So(o, i);
  });
}
function To(e) {
  return typeof e == "number";
}
function Ur(e) {
  return typeof e == "string";
}
function cr(e) {
  return typeof e == "boolean";
}
function bs(e) {
  return Object.prototype.toString.call(e) === "[object Object]";
}
function Te(e) {
  return Math.abs(e);
}
function Ro(e) {
  return Math.sign(e);
}
function Qt(e, t) {
  return Te(e - t);
}
function Xu(e, t) {
  if (e === 0 || t === 0 || Te(e) <= Te(t)) return 0;
  const n = Qt(Te(e), Te(t));
  return Te(n / e);
}
function Ju(e) {
  return Math.round(e * 100) / 100;
}
function sn(e) {
  return cn(e).map(Number);
}
function Ze(e) {
  return e[dn(e)];
}
function dn(e) {
  return Math.max(0, e.length - 1);
}
function xo(e, t) {
  return t === dn(e);
}
function vs(e, t = 0) {
  return Array.from(Array(e), (n, r) => t + r);
}
function cn(e) {
  return Object.keys(e);
}
function Ki(e, t) {
  return [e, t].reduce((n, r) => (cn(r).forEach((o) => {
    const s = n[o], i = r[o], c = bs(s) && bs(i);
    n[o] = c ? Ki(s, i) : i;
  }), n), {});
}
function zr(e, t) {
  return typeof t.MouseEvent < "u" && e instanceof t.MouseEvent;
}
function Zu(e, t) {
  const n = {
    start: r,
    center: o,
    end: s
  };
  function r() {
    return 0;
  }
  function o(a) {
    return s(a) / 2;
  }
  function s(a) {
    return t - a;
  }
  function i(a, l) {
    return Ur(e) ? n[e](a) : e(t, a, l);
  }
  return {
    measure: i
  };
}
function an() {
  let e = [];
  function t(o, s, i, c = {
    passive: !0
  }) {
    let a;
    if ("addEventListener" in o)
      o.addEventListener(s, i, c), a = () => o.removeEventListener(s, i, c);
    else {
      const l = o;
      l.addListener(i), a = () => l.removeListener(i);
    }
    return e.push(a), r;
  }
  function n() {
    e = e.filter((o) => o());
  }
  const r = {
    add: t,
    clear: n
  };
  return r;
}
function Qu(e, t, n, r) {
  const o = an(), s = 1e3 / 60;
  let i = null, c = 0, a = 0;
  function l() {
    o.add(e, "visibilitychange", () => {
      e.hidden && d();
    });
  }
  function u() {
    h(), o.clear();
  }
  function f(m) {
    if (!a) return;
    i || (i = m, n(), n());
    const v = m - i;
    for (i = m, c += v; c >= s; )
      n(), c -= s;
    const C = c / s;
    r(C), a && (a = t.requestAnimationFrame(f));
  }
  function p() {
    a || (a = t.requestAnimationFrame(f));
  }
  function h() {
    t.cancelAnimationFrame(a), i = null, c = 0, a = 0;
  }
  function d() {
    i = null, c = 0;
  }
  return {
    init: l,
    destroy: u,
    start: p,
    stop: h,
    update: n,
    render: r
  };
}
function ef(e, t) {
  const n = t === "rtl", r = e === "y", o = r ? "y" : "x", s = r ? "x" : "y", i = !r && n ? -1 : 1, c = u(), a = f();
  function l(d) {
    const {
      height: g,
      width: m
    } = d;
    return r ? g : m;
  }
  function u() {
    return r ? "top" : n ? "right" : "left";
  }
  function f() {
    return r ? "bottom" : n ? "left" : "right";
  }
  function p(d) {
    return d * i;
  }
  return {
    scroll: o,
    cross: s,
    startEdge: c,
    endEdge: a,
    measureSize: l,
    direction: p
  };
}
function Rt(e = 0, t = 0) {
  const n = Te(e - t);
  function r(l) {
    return l < e;
  }
  function o(l) {
    return l > t;
  }
  function s(l) {
    return r(l) || o(l);
  }
  function i(l) {
    return s(l) ? r(l) ? e : t : l;
  }
  function c(l) {
    return n ? l - n * Math.ceil((l - t) / n) : l;
  }
  return {
    length: n,
    max: t,
    min: e,
    constrain: i,
    reachedAny: s,
    reachedMax: o,
    reachedMin: r,
    removeOffset: c
  };
}
function Yi(e, t, n) {
  const {
    constrain: r
  } = Rt(0, e), o = e + 1;
  let s = i(t);
  function i(p) {
    return n ? Te((o + p) % o) : r(p);
  }
  function c() {
    return s;
  }
  function a(p) {
    return s = i(p), f;
  }
  function l(p) {
    return u().set(c() + p);
  }
  function u() {
    return Yi(e, c(), n);
  }
  const f = {
    get: c,
    set: a,
    add: l,
    clone: u
  };
  return f;
}
function tf(e, t, n, r, o, s, i, c, a, l, u, f, p, h, d, g, m, v, C) {
  const {
    cross: w,
    direction: E
  } = e, T = ["INPUT", "SELECT", "TEXTAREA"], S = {
    passive: !1
  }, R = an(), P = an(), O = Rt(50, 225).constrain(h.measure(20)), M = {
    mouse: 300,
    touch: 400
  }, F = {
    mouse: 500,
    touch: 600
  }, A = d ? 43 : 25;
  let D = !1, I = 0, x = 0, _ = !1, z = !1, N = !1, k = !1;
  function Y(q) {
    if (!C) return;
    function ne(ve) {
      (cr(C) || C(q, ve)) && B(ve);
    }
    const oe = t;
    R.add(oe, "dragstart", (ve) => ve.preventDefault(), S).add(oe, "touchmove", () => {
    }, S).add(oe, "touchend", () => {
    }).add(oe, "touchstart", ne).add(oe, "mousedown", ne).add(oe, "touchcancel", Q).add(oe, "contextmenu", Q).add(oe, "click", re, !0);
  }
  function K() {
    R.clear(), P.clear();
  }
  function le() {
    const q = k ? n : t;
    P.add(q, "touchmove", $, S).add(q, "touchend", Q).add(q, "mousemove", $, S).add(q, "mouseup", Q);
  }
  function ie(q) {
    const ne = q.nodeName || "";
    return T.includes(ne);
  }
  function L() {
    return (d ? F : M)[k ? "mouse" : "touch"];
  }
  function X(q, ne) {
    const oe = f.add(Ro(q) * -1), ve = u.byDistance(q, !d).distance;
    return d || Te(q) < O ? ve : m && ne ? ve * 0.5 : u.byIndex(oe.get(), 0).distance;
  }
  function B(q) {
    const ne = zr(q, r);
    k = ne, N = d && ne && !q.buttons && D, D = Qt(o.get(), i.get()) >= 2, !(ne && q.button !== 0) && (ie(q.target) || (_ = !0, s.pointerDown(q), l.useFriction(0).useDuration(0), o.set(i), le(), I = s.readPoint(q), x = s.readPoint(q, w), p.emit("pointerDown")));
  }
  function $(q) {
    if (!zr(q, r) && q.touches.length >= 2) return Q(q);
    const oe = s.readPoint(q), ve = s.readPoint(q, w), W = Qt(oe, I), J = Qt(ve, x);
    if (!z && !k && (!q.cancelable || (z = W > J, !z)))
      return Q(q);
    const ce = s.pointerMove(q);
    W > g && (N = !0), l.useFriction(0.3).useDuration(0.75), c.start(), o.add(E(ce)), q.preventDefault();
  }
  function Q(q) {
    const oe = u.byDistance(0, !1).index !== f.get(), ve = s.pointerUp(q) * L(), W = X(E(ve), oe), J = Xu(ve, W), ce = A - 10 * J, he = v + J / 50;
    z = !1, _ = !1, P.clear(), l.useDuration(ce).useFriction(he), a.distance(W, !d), k = !1, p.emit("pointerUp");
  }
  function re(q) {
    N && (q.stopPropagation(), q.preventDefault(), N = !1);
  }
  function ee() {
    return _;
  }
  return {
    init: Y,
    destroy: K,
    pointerDown: ee
  };
}
function nf(e, t) {
  let r, o;
  function s(f) {
    return f.timeStamp;
  }
  function i(f, p) {
    const d = `client${(p || e.scroll) === "x" ? "X" : "Y"}`;
    return (zr(f, t) ? f : f.touches[0])[d];
  }
  function c(f) {
    return r = f, o = f, i(f);
  }
  function a(f) {
    const p = i(f) - i(o), h = s(f) - s(r) > 170;
    return o = f, h && (r = f), p;
  }
  function l(f) {
    if (!r || !o) return 0;
    const p = i(o) - i(r), h = s(f) - s(r), d = s(f) - s(o) > 170, g = p / h;
    return h && !d && Te(g) > 0.1 ? g : 0;
  }
  return {
    pointerDown: c,
    pointerMove: a,
    pointerUp: l,
    readPoint: i
  };
}
function rf() {
  function e(n) {
    const {
      offsetTop: r,
      offsetLeft: o,
      offsetWidth: s,
      offsetHeight: i
    } = n;
    return {
      top: r,
      right: o + s,
      bottom: r + i,
      left: o,
      width: s,
      height: i
    };
  }
  return {
    measure: e
  };
}
function of(e) {
  function t(r) {
    return e * (r / 100);
  }
  return {
    measure: t
  };
}
function sf(e, t, n, r, o, s, i) {
  const c = [e].concat(r);
  let a, l, u = [], f = !1;
  function p(m) {
    return o.measureSize(i.measure(m));
  }
  function h(m) {
    if (!s) return;
    l = p(e), u = r.map(p);
    function v(C) {
      for (const w of C) {
        if (f) return;
        const E = w.target === e, T = r.indexOf(w.target), S = E ? l : u[T], R = p(E ? e : r[T]);
        if (Te(R - S) >= 0.5) {
          m.reInit(), t.emit("resize");
          break;
        }
      }
    }
    a = new ResizeObserver((C) => {
      (cr(s) || s(m, C)) && v(C);
    }), n.requestAnimationFrame(() => {
      c.forEach((C) => a.observe(C));
    });
  }
  function d() {
    f = !0, a && a.disconnect();
  }
  return {
    init: h,
    destroy: d
  };
}
function cf(e, t, n, r, o, s) {
  let i = 0, c = 0, a = o, l = s, u = e.get(), f = 0;
  function p() {
    const S = r.get() - e.get(), R = !a;
    let P = 0;
    return R ? (i = 0, n.set(r), e.set(r), P = S) : (n.set(e), i += S / a, i *= l, u += i, e.add(i), P = u - f), c = Ro(P), f = u, T;
  }
  function h() {
    const S = r.get() - t.get();
    return Te(S) < 1e-3;
  }
  function d() {
    return a;
  }
  function g() {
    return c;
  }
  function m() {
    return i;
  }
  function v() {
    return w(o);
  }
  function C() {
    return E(s);
  }
  function w(S) {
    return a = S, T;
  }
  function E(S) {
    return l = S, T;
  }
  const T = {
    direction: g,
    duration: d,
    velocity: m,
    seek: p,
    settled: h,
    useBaseFriction: C,
    useBaseDuration: v,
    useFriction: E,
    useDuration: w
  };
  return T;
}
function af(e, t, n, r, o) {
  const s = o.measure(10), i = o.measure(50), c = Rt(0.1, 0.99);
  let a = !1;
  function l() {
    return !(a || !e.reachedAny(n.get()) || !e.reachedAny(t.get()));
  }
  function u(h) {
    if (!l()) return;
    const d = e.reachedMin(t.get()) ? "min" : "max", g = Te(e[d] - t.get()), m = n.get() - t.get(), v = c.constrain(g / i);
    n.subtract(m * v), !h && Te(m) < s && (n.set(e.constrain(n.get())), r.useDuration(25).useBaseFriction());
  }
  function f(h) {
    a = !h;
  }
  return {
    shouldConstrain: l,
    constrain: u,
    toggleActive: f
  };
}
function lf(e, t, n, r, o) {
  const s = Rt(-t + e, 0), i = f(), c = u(), a = p();
  function l(d, g) {
    return Qt(d, g) <= 1;
  }
  function u() {
    const d = i[0], g = Ze(i), m = i.lastIndexOf(d), v = i.indexOf(g) + 1;
    return Rt(m, v);
  }
  function f() {
    return n.map((d, g) => {
      const {
        min: m,
        max: v
      } = s, C = s.constrain(d), w = !g, E = xo(n, g);
      return w ? v : E || l(m, C) ? m : l(v, C) ? v : C;
    }).map((d) => parseFloat(d.toFixed(3)));
  }
  function p() {
    if (t <= e + o) return [s.max];
    if (r === "keepSnaps") return i;
    const {
      min: d,
      max: g
    } = c;
    return i.slice(d, g);
  }
  return {
    snapsContained: a,
    scrollContainLimit: c
  };
}
function uf(e, t, n) {
  const r = t[0], o = n ? r - e : Ze(t);
  return {
    limit: Rt(o, r)
  };
}
function ff(e, t, n, r) {
  const s = t.min + 0.1, i = t.max + 0.1, {
    reachedMin: c,
    reachedMax: a
  } = Rt(s, i);
  function l(p) {
    return p === 1 ? a(n.get()) : p === -1 ? c(n.get()) : !1;
  }
  function u(p) {
    if (!l(p)) return;
    const h = e * (p * -1);
    r.forEach((d) => d.add(h));
  }
  return {
    loop: u
  };
}
function df(e) {
  const {
    max: t,
    length: n
  } = e;
  function r(s) {
    const i = s - t;
    return n ? i / -n : 0;
  }
  return {
    get: r
  };
}
function pf(e, t, n, r, o) {
  const {
    startEdge: s,
    endEdge: i
  } = e, {
    groupSlides: c
  } = o, a = f().map(t.measure), l = p(), u = h();
  function f() {
    return c(r).map((g) => Ze(g)[i] - g[0][s]).map(Te);
  }
  function p() {
    return r.map((g) => n[s] - g[s]).map((g) => -Te(g));
  }
  function h() {
    return c(l).map((g) => g[0]).map((g, m) => g + a[m]);
  }
  return {
    snaps: l,
    snapsAligned: u
  };
}
function hf(e, t, n, r, o, s) {
  const {
    groupSlides: i
  } = o, {
    min: c,
    max: a
  } = r, l = u();
  function u() {
    const p = i(s), h = !e || t === "keepSnaps";
    return n.length === 1 ? [s] : h ? p : p.slice(c, a).map((d, g, m) => {
      const v = !g, C = xo(m, g);
      if (v) {
        const w = Ze(m[0]) + 1;
        return vs(w);
      }
      if (C) {
        const w = dn(s) - Ze(m)[0] + 1;
        return vs(w, Ze(m)[0]);
      }
      return d;
    });
  }
  return {
    slideRegistry: l
  };
}
function gf(e, t, n, r, o) {
  const {
    reachedAny: s,
    removeOffset: i,
    constrain: c
  } = r;
  function a(d) {
    return d.concat().sort((g, m) => Te(g) - Te(m))[0];
  }
  function l(d) {
    const g = e ? i(d) : c(d), m = t.map((C, w) => ({
      diff: u(C - g, 0),
      index: w
    })).sort((C, w) => Te(C.diff) - Te(w.diff)), {
      index: v
    } = m[0];
    return {
      index: v,
      distance: g
    };
  }
  function u(d, g) {
    const m = [d, d + n, d - n];
    if (!e) return d;
    if (!g) return a(m);
    const v = m.filter((C) => Ro(C) === g);
    return v.length ? a(v) : Ze(m) - n;
  }
  function f(d, g) {
    const m = t[d] - o.get(), v = u(m, g);
    return {
      index: d,
      distance: v
    };
  }
  function p(d, g) {
    const m = o.get() + d, {
      index: v,
      distance: C
    } = l(m), w = !e && s(m);
    if (!g || w) return {
      index: v,
      distance: d
    };
    const E = t[v] - C, T = d + u(E, 0);
    return {
      index: v,
      distance: T
    };
  }
  return {
    byDistance: p,
    byIndex: f,
    shortcut: u
  };
}
function mf(e, t, n, r, o, s, i) {
  function c(f) {
    const p = f.distance, h = f.index !== t.get();
    s.add(p), p && (r.duration() ? e.start() : (e.update(), e.render(1), e.update())), h && (n.set(t.get()), t.set(f.index), i.emit("select"));
  }
  function a(f, p) {
    const h = o.byDistance(f, p);
    c(h);
  }
  function l(f, p) {
    const h = t.clone().set(f), d = o.byIndex(h.get(), p);
    c(d);
  }
  return {
    distance: a,
    index: l
  };
}
function bf(e, t, n, r, o, s, i, c) {
  const a = {
    passive: !0,
    capture: !0
  };
  let l = 0;
  function u(h) {
    if (!c) return;
    function d(g) {
      if ((/* @__PURE__ */ new Date()).getTime() - l > 10) return;
      i.emit("slideFocusStart"), e.scrollLeft = 0;
      const C = n.findIndex((w) => w.includes(g));
      To(C) && (o.useDuration(0), r.index(C, 0), i.emit("slideFocus"));
    }
    s.add(document, "keydown", f, !1), t.forEach((g, m) => {
      s.add(g, "focus", (v) => {
        (cr(c) || c(h, v)) && d(m);
      }, a);
    });
  }
  function f(h) {
    h.code === "Tab" && (l = (/* @__PURE__ */ new Date()).getTime());
  }
  return {
    init: u
  };
}
function Jt(e) {
  let t = e;
  function n() {
    return t;
  }
  function r(a) {
    t = i(a);
  }
  function o(a) {
    t += i(a);
  }
  function s(a) {
    t -= i(a);
  }
  function i(a) {
    return To(a) ? a : a.get();
  }
  return {
    get: n,
    set: r,
    add: o,
    subtract: s
  };
}
function Xi(e, t) {
  const n = e.scroll === "x" ? i : c, r = t.style;
  let o = null, s = !1;
  function i(p) {
    return `translate3d(${p}px,0px,0px)`;
  }
  function c(p) {
    return `translate3d(0px,${p}px,0px)`;
  }
  function a(p) {
    if (s) return;
    const h = Ju(e.direction(p));
    h !== o && (r.transform = n(h), o = h);
  }
  function l(p) {
    s = !p;
  }
  function u() {
    s || (r.transform = "", t.getAttribute("style") || t.removeAttribute("style"));
  }
  return {
    clear: u,
    to: a,
    toggleActive: l
  };
}
function vf(e, t, n, r, o, s, i, c, a) {
  const u = sn(o), f = sn(o).reverse(), p = v().concat(C());
  function h(R, P) {
    return R.reduce((O, M) => O - o[M], P);
  }
  function d(R, P) {
    return R.reduce((O, M) => h(O, P) > 0 ? O.concat([M]) : O, []);
  }
  function g(R) {
    return s.map((P, O) => ({
      start: P - r[O] + 0.5 + R,
      end: P + t - 0.5 + R
    }));
  }
  function m(R, P, O) {
    const M = g(P);
    return R.map((F) => {
      const A = O ? 0 : -n, D = O ? n : 0, I = O ? "end" : "start", x = M[F][I];
      return {
        index: F,
        loopPoint: x,
        slideLocation: Jt(-1),
        translate: Xi(e, a[F]),
        target: () => c.get() > x ? A : D
      };
    });
  }
  function v() {
    const R = i[0], P = d(f, R);
    return m(P, n, !1);
  }
  function C() {
    const R = t - i[0] - 1, P = d(u, R);
    return m(P, -n, !0);
  }
  function w() {
    return p.every(({
      index: R
    }) => {
      const P = u.filter((O) => O !== R);
      return h(P, t) <= 0.1;
    });
  }
  function E() {
    p.forEach((R) => {
      const {
        target: P,
        translate: O,
        slideLocation: M
      } = R, F = P();
      F !== M.get() && (O.to(F), M.set(F));
    });
  }
  function T() {
    p.forEach((R) => R.translate.clear());
  }
  return {
    canLoop: w,
    clear: T,
    loop: E,
    loopPoints: p
  };
}
function yf(e, t, n) {
  let r, o = !1;
  function s(a) {
    if (!n) return;
    function l(u) {
      for (const f of u)
        if (f.type === "childList") {
          a.reInit(), t.emit("slidesChanged");
          break;
        }
    }
    r = new MutationObserver((u) => {
      o || (cr(n) || n(a, u)) && l(u);
    }), r.observe(e, {
      childList: !0
    });
  }
  function i() {
    r && r.disconnect(), o = !0;
  }
  return {
    init: s,
    destroy: i
  };
}
function Cf(e, t, n, r) {
  const o = {};
  let s = null, i = null, c, a = !1;
  function l() {
    c = new IntersectionObserver((d) => {
      a || (d.forEach((g) => {
        const m = t.indexOf(g.target);
        o[m] = g;
      }), s = null, i = null, n.emit("slidesInView"));
    }, {
      root: e.parentElement,
      threshold: r
    }), t.forEach((d) => c.observe(d));
  }
  function u() {
    c && c.disconnect(), a = !0;
  }
  function f(d) {
    return cn(o).reduce((g, m) => {
      const v = parseInt(m), {
        isIntersecting: C
      } = o[v];
      return (d && C || !d && !C) && g.push(v), g;
    }, []);
  }
  function p(d = !0) {
    if (d && s) return s;
    if (!d && i) return i;
    const g = f(d);
    return d && (s = g), d || (i = g), g;
  }
  return {
    init: l,
    destroy: u,
    get: p
  };
}
function Ef(e, t, n, r, o, s) {
  const {
    measureSize: i,
    startEdge: c,
    endEdge: a
  } = e, l = n[0] && o, u = d(), f = g(), p = n.map(i), h = m();
  function d() {
    if (!l) return 0;
    const C = n[0];
    return Te(t[c] - C[c]);
  }
  function g() {
    if (!l) return 0;
    const C = s.getComputedStyle(Ze(r));
    return parseFloat(C.getPropertyValue(`margin-${a}`));
  }
  function m() {
    return n.map((C, w, E) => {
      const T = !w, S = xo(E, w);
      return T ? p[w] + u : S ? p[w] + f : E[w + 1][c] - C[c];
    }).map(Te);
  }
  return {
    slideSizes: p,
    slideSizesWithGaps: h,
    startGap: u,
    endGap: f
  };
}
function wf(e, t, n, r, o, s, i, c, a) {
  const {
    startEdge: l,
    endEdge: u,
    direction: f
  } = e, p = To(n);
  function h(v, C) {
    return sn(v).filter((w) => w % C === 0).map((w) => v.slice(w, w + C));
  }
  function d(v) {
    return v.length ? sn(v).reduce((C, w, E) => {
      const T = Ze(C) || 0, S = T === 0, R = w === dn(v), P = o[l] - s[T][l], O = o[l] - s[w][u], M = !r && S ? f(i) : 0, F = !r && R ? f(c) : 0, A = Te(O - F - (P + M));
      return E && A > t + a && C.push(w), R && C.push(v.length), C;
    }, []).map((C, w, E) => {
      const T = Math.max(E[w - 1] || 0);
      return v.slice(T, C);
    }) : [];
  }
  function g(v) {
    return p ? h(v, n) : d(v);
  }
  return {
    groupSlides: g
  };
}
function Sf(e, t, n, r, o, s, i) {
  const {
    align: c,
    axis: a,
    direction: l,
    startIndex: u,
    loop: f,
    duration: p,
    dragFree: h,
    dragThreshold: d,
    inViewThreshold: g,
    slidesToScroll: m,
    skipSnaps: v,
    containScroll: C,
    watchResize: w,
    watchSlides: E,
    watchDrag: T,
    watchFocus: S
  } = s, R = 2, P = rf(), O = P.measure(t), M = n.map(P.measure), F = ef(a, l), A = F.measureSize(O), D = of(A), I = Zu(c, A), x = !f && !!C, _ = f || !!C, {
    slideSizes: z,
    slideSizesWithGaps: N,
    startGap: k,
    endGap: Y
  } = Ef(F, O, M, n, _, o), K = wf(F, A, m, f, O, M, k, Y, R), {
    snaps: le,
    snapsAligned: ie
  } = pf(F, I, O, M, K), L = -Ze(le) + Ze(N), {
    snapsContained: X,
    scrollContainLimit: B
  } = lf(A, L, ie, C, R), $ = x ? X : ie, {
    limit: Q
  } = uf(L, $, f), re = Yi(dn($), u, f), ee = re.clone(), te = sn(n), q = ({
    dragHandler: V,
    scrollBody: j,
    scrollBounds: Z,
    options: {
      loop: se
    }
  }) => {
    se || Z.constrain(V.pointerDown()), j.seek();
  }, ne = ({
    scrollBody: V,
    translate: j,
    location: Z,
    offsetLocation: se,
    previousLocation: Ne,
    scrollLooper: Re,
    slideLooper: Ot,
    dragHandler: ut,
    animation: It,
    eventHandler: rt,
    scrollBounds: ot,
    options: {
      loop: yt
    }
  }, Ct) => {
    const jt = V.settled(), mn = !ot.shouldConstrain(), Gt = yt ? jt : jt && mn, Kt = Gt && !ut.pointerDown();
    Kt && It.stop();
    const bn = Z.get() * Ct + Ne.get() * (1 - Ct);
    se.set(bn), yt && (Re.loop(V.direction()), Ot.loop()), j.to(se.get()), Kt && rt.emit("settle"), Gt || rt.emit("scroll");
  }, oe = Qu(r, o, () => q(ge), (V) => ne(ge, V)), ve = 0.68, W = $[re.get()], J = Jt(W), ce = Jt(W), he = Jt(W), Ie = Jt(W), Fe = cf(J, he, ce, Ie, p, ve), xe = gf(f, $, L, Q, Ie), Le = mf(oe, re, ee, Fe, xe, Ie, i), Ue = df(Q), H = an(), G = Cf(t, n, i, g), {
    slideRegistry: we
  } = hf(x, C, $, B, K, te), be = bf(e, n, we, Le, Fe, H, i, S), ge = {
    ownerDocument: r,
    ownerWindow: o,
    eventHandler: i,
    containerRect: O,
    slideRects: M,
    animation: oe,
    axis: F,
    dragHandler: tf(F, e, r, o, Ie, nf(F, o), J, oe, Le, Fe, xe, re, i, D, h, d, v, ve, T),
    eventStore: H,
    percentOfView: D,
    index: re,
    indexPrevious: ee,
    limit: Q,
    location: J,
    offsetLocation: he,
    previousLocation: ce,
    options: s,
    resizeHandler: sf(t, i, o, n, F, w, P),
    scrollBody: Fe,
    scrollBounds: af(Q, he, Ie, Fe, D),
    scrollLooper: ff(L, Q, he, [J, he, ce, Ie]),
    scrollProgress: Ue,
    scrollSnapList: $.map(Ue.get),
    scrollSnaps: $,
    scrollTarget: xe,
    scrollTo: Le,
    slideLooper: vf(F, A, L, z, N, le, $, he, n),
    slideFocus: be,
    slidesHandler: yf(t, i, E),
    slidesInView: G,
    slideIndexes: te,
    slideRegistry: we,
    slidesToScroll: K,
    target: Ie,
    translate: Xi(F, t)
  };
  return ge;
}
function Tf() {
  let e = {}, t;
  function n(l) {
    t = l;
  }
  function r(l) {
    return e[l] || [];
  }
  function o(l) {
    return r(l).forEach((u) => u(t, l)), a;
  }
  function s(l, u) {
    return e[l] = r(l).concat([u]), a;
  }
  function i(l, u) {
    return e[l] = r(l).filter((f) => f !== u), a;
  }
  function c() {
    e = {};
  }
  const a = {
    init: n,
    emit: o,
    off: i,
    on: s,
    clear: c
  };
  return a;
}
const Rf = {
  align: "center",
  axis: "x",
  container: null,
  slides: null,
  containScroll: "trimSnaps",
  direction: "ltr",
  slidesToScroll: 1,
  inViewThreshold: 0,
  breakpoints: {},
  dragFree: !1,
  dragThreshold: 10,
  loop: !1,
  skipSnaps: !1,
  duration: 25,
  startIndex: 0,
  active: !0,
  watchDrag: !0,
  watchResize: !0,
  watchSlides: !0,
  watchFocus: !0
};
function xf(e) {
  function t(s, i) {
    return Ki(s, i || {});
  }
  function n(s) {
    const i = s.breakpoints || {}, c = cn(i).filter((a) => e.matchMedia(a).matches).map((a) => i[a]).reduce((a, l) => t(a, l), {});
    return t(s, c);
  }
  function r(s) {
    return s.map((i) => cn(i.breakpoints || {})).reduce((i, c) => i.concat(c), []).map(e.matchMedia);
  }
  return {
    mergeOptions: t,
    optionsAtMedia: n,
    optionsMediaQueries: r
  };
}
function Pf(e) {
  let t = [];
  function n(s, i) {
    return t = i.filter(({
      options: c
    }) => e.optionsAtMedia(c).active !== !1), t.forEach((c) => c.init(s, e)), i.reduce((c, a) => Object.assign(c, {
      [a.name]: a
    }), {});
  }
  function r() {
    t = t.filter((s) => s.destroy());
  }
  return {
    init: n,
    destroy: r
  };
}
function zn(e, t, n) {
  const r = e.ownerDocument, o = r.defaultView, s = xf(o), i = Pf(s), c = an(), a = Tf(), {
    mergeOptions: l,
    optionsAtMedia: u,
    optionsMediaQueries: f
  } = s, {
    on: p,
    off: h,
    emit: d
  } = a, g = F;
  let m = !1, v, C = l(Rf, zn.globalOptions), w = l(C), E = [], T, S, R;
  function P() {
    const {
      container: te,
      slides: q
    } = w;
    S = (Ur(te) ? e.querySelector(te) : te) || e.children[0];
    const oe = Ur(q) ? S.querySelectorAll(q) : q;
    R = [].slice.call(oe || S.children);
  }
  function O(te) {
    const q = Sf(e, S, R, r, o, te, a);
    if (te.loop && !q.slideLooper.canLoop()) {
      const ne = Object.assign({}, te, {
        loop: !1
      });
      return O(ne);
    }
    return q;
  }
  function M(te, q) {
    m || (C = l(C, te), w = u(C), E = q || E, P(), v = O(w), f([C, ...E.map(({
      options: ne
    }) => ne)]).forEach((ne) => c.add(ne, "change", F)), w.active && (v.translate.to(v.location.get()), v.animation.init(), v.slidesInView.init(), v.slideFocus.init(ee), v.eventHandler.init(ee), v.resizeHandler.init(ee), v.slidesHandler.init(ee), v.options.loop && v.slideLooper.loop(), S.offsetParent && R.length && v.dragHandler.init(ee), T = i.init(ee, E)));
  }
  function F(te, q) {
    const ne = K();
    A(), M(l({
      startIndex: ne
    }, te), q), a.emit("reInit");
  }
  function A() {
    v.dragHandler.destroy(), v.eventStore.clear(), v.translate.clear(), v.slideLooper.clear(), v.resizeHandler.destroy(), v.slidesHandler.destroy(), v.slidesInView.destroy(), v.animation.destroy(), i.destroy(), c.clear();
  }
  function D() {
    m || (m = !0, c.clear(), A(), a.emit("destroy"), a.clear());
  }
  function I(te, q, ne) {
    !w.active || m || (v.scrollBody.useBaseFriction().useDuration(q === !0 ? 0 : w.duration), v.scrollTo.index(te, ne || 0));
  }
  function x(te) {
    const q = v.index.add(1).get();
    I(q, te, -1);
  }
  function _(te) {
    const q = v.index.add(-1).get();
    I(q, te, 1);
  }
  function z() {
    return v.index.add(1).get() !== K();
  }
  function N() {
    return v.index.add(-1).get() !== K();
  }
  function k() {
    return v.scrollSnapList;
  }
  function Y() {
    return v.scrollProgress.get(v.offsetLocation.get());
  }
  function K() {
    return v.index.get();
  }
  function le() {
    return v.indexPrevious.get();
  }
  function ie() {
    return v.slidesInView.get();
  }
  function L() {
    return v.slidesInView.get(!1);
  }
  function X() {
    return T;
  }
  function B() {
    return v;
  }
  function $() {
    return e;
  }
  function Q() {
    return S;
  }
  function re() {
    return R;
  }
  const ee = {
    canScrollNext: z,
    canScrollPrev: N,
    containerNode: Q,
    internalEngine: B,
    destroy: D,
    off: h,
    on: p,
    emit: d,
    plugins: X,
    previousScrollSnap: le,
    reInit: g,
    rootNode: $,
    scrollNext: x,
    scrollPrev: _,
    scrollProgress: Y,
    scrollSnapList: k,
    scrollTo: I,
    selectedScrollSnap: K,
    slideNodes: re,
    slidesInView: ie,
    slidesNotInView: L
  };
  return M(t, n), setTimeout(() => a.emit("init"), 0), ee;
}
zn.globalOptions = void 0;
function Po(e = {}, t = []) {
  const n = Ae(e), r = Ae(t), [o, s] = Se(), [i, c] = Se(), a = Ve(() => {
    o && o.reInit(n.current, r.current);
  }, [o]);
  return qe(() => {
    So(n.current, e) || (n.current = e, a());
  }, [e, a]), qe(() => {
    Yu(r.current, t) || (r.current = t, a());
  }, [t, a]), qe(() => {
    if (Ku() && i) {
      zn.globalOptions = Po.globalOptions;
      const l = zn(i, n.current, r.current);
      return s(l), () => l.destroy();
    } else
      s(void 0);
  }, [i, s]), [c, o];
}
Po.globalOptions = void 0;
const Wr = [];
let qr;
function Of() {
  return qr;
}
function If(e) {
  Wr.push(e);
}
function Ji(e) {
  const t = (n, r) => {
    const o = et(Af).current;
    let s;
    try {
      qr = o;
      for (const i of Wr)
        i.before(o);
      s = e(n, r);
      for (const i of Wr)
        i.after(o);
      o.didInitialize = !0;
    } finally {
      qr = void 0;
    }
    return s;
  };
  return t.displayName = e.displayName || e.name, t;
}
function _f(e) {
  return /* @__PURE__ */ y.forwardRef(Ji(e));
}
function Af() {
  return {
    didInitialize: !1
  };
}
function kf() {
  if (typeof navigator > "u")
    return {
      userAgent: "",
      platform: "",
      maxTouchPoints: 0
    };
  if (process.env.NODE_ENV !== "production") {
    const e = navigator.userAgentData;
    if (e && Array.isArray(e.brands))
      return {
        userAgent: e.brands.map(({
          brand: t,
          version: n
        }) => `${t}/${n}`).join(" "),
        platform: e.platform ?? navigator.platform ?? "",
        maxTouchPoints: navigator.maxTouchPoints ?? 0
      };
  }
  return {
    userAgent: navigator.userAgent,
    platform: navigator.platform ?? "",
    maxTouchPoints: navigator.maxTouchPoints ?? 0
  };
}
const {
  userAgent: Nf,
  platform: Mf,
  maxTouchPoints: Df
} = kf(), ar = Nf.toLowerCase(), ln = Mf.toLowerCase(), Zi = /^i(os$|p)/.test(ln) || ln === "macintel" && Df > 1, ys = "android", Ff = ln === ys || ar.includes(ys), Qi = !Zi && ln.startsWith("mac");
ln.startsWith("win");
const Lf = Qi || Zi;
var Xs;
const pn = typeof CSS < "u" && !!((Xs = CSS.supports) != null && Xs.call(CSS, "-webkit-backdrop-filter:none"));
!pn && ar.includes("firefox");
!pn && ar.includes("chrom");
const Bf = Lf, Vf = /jsdom|happydom/.test(ar);
function $f(e) {
  return "nativeEvent" in e;
}
function Hf(e) {
  return e.pointerType === "" && e.isTrusted ? !0 : Ff && e.pointerType ? e.type === "click" && e.buttons === 1 : e.detail === 0 && !e.pointerType;
}
function jr(e, t) {
  const n = ["mouse", "pen"];
  return n.push("", void 0), n.includes(e);
}
function Uf(e) {
  const t = e.type;
  return t === "click" || t === "mousedown" || t === "keydown" || t === "keyup";
}
function Gr(e) {
  var n;
  let t = e.activeElement;
  for (; ((n = t == null ? void 0 : t.shadowRoot) == null ? void 0 : n.activeElement) != null; )
    t = t.shadowRoot.activeElement;
  return t;
}
function Pe(e, t) {
  var r;
  if (!e || !t)
    return !1;
  const n = (r = t.getRootNode) == null ? void 0 : r.call(t);
  if (e.contains(t))
    return !0;
  if (n && Bt(n)) {
    let o = t;
    for (; o; ) {
      if (e === o)
        return !0;
      o = o.parentNode || o.host;
    }
  }
  return !1;
}
function Kr(e, t) {
  let n = e;
  for (; n; ) {
    if (me(n) && n.matches(t))
      return n;
    n = n.assignedSlot ?? n.parentNode ?? (Bt(n) ? n.host : null);
  }
  return null;
}
function St(e) {
  return "composedPath" in e ? e.composedPath()[0] ?? e.target : e.target;
}
const zf = "data-base-ui-focusable", ec = "input:not([type='hidden']):not([disabled]),[contenteditable]:not([contenteditable='false']),textarea:not([disabled])", Wf = "data-open", qf = "data-closed", jf = "data-anchor-hidden", Gf = "data-popup-open", Kf = {
  [Gf]: ""
}, Yf = {
  [Wf]: ""
}, Xf = {
  [qf]: ""
}, Jf = {
  [jf]: ""
}, Zf = {
  open(e) {
    return e ? Kf : null;
  }
}, tc = {
  open(e) {
    return e ? Yf : Xf;
  },
  anchorHidden(e) {
    return e ? Jf : null;
  }
}, Qf = {
  ...tc,
  ...ho
}, Cs = "data-trigger-disabled";
function Wn(e, t) {
  if (!me(e))
    return !1;
  const n = e;
  if (t.hasElement(n))
    return !n.hasAttribute(Cs);
  for (const [, r] of t.entries())
    if (Pe(r, n))
      return !r.hasAttribute(Cs);
  return !1;
}
function Cr(e, t) {
  if (t == null)
    return !1;
  if ("composedPath" in e)
    return e.composedPath().includes(t);
  const n = e;
  return n.target != null && t.contains(n.target);
}
function ed(e) {
  return e.matches("html,body");
}
function td(e) {
  return ke(e) && e.matches(ec);
}
function nd(e) {
  return Kr(e, `button,a[href],[role="button"],select,[tabindex]:not([tabindex="-1"]),${ec}`) != null;
}
function rd(e) {
  if (!e || Vf)
    return !0;
  try {
    return e.matches(":focus-visible");
  } catch {
    return !0;
  }
}
function od(e, t) {
  return t != null && !jr(t) ? 0 : typeof e == "function" ? e() : e;
}
function Yr(e, t, n) {
  const r = od(e, n);
  return typeof r == "number" ? r : r == null ? void 0 : r[t];
}
function Es(e) {
  return typeof e == "function" ? e() : e;
}
function nc(e, t) {
  return t || e === "click" || e === "mousedown";
}
function sd(e) {
  return (e == null ? void 0 : e.includes("mouse")) && e !== "mousedown";
}
function pt(...e) {
  return () => {
    for (let t = 0; t < e.length; t += 1) {
      const n = e[t];
      n && n();
    }
  };
}
const id = {
  clipPath: "inset(50%)",
  overflow: "hidden",
  whiteSpace: "nowrap",
  border: 0,
  padding: 0,
  width: 1,
  height: 1,
  margin: -1
}, cd = {
  ...id,
  position: "fixed",
  margin: 0,
  top: 0,
  left: 0
}, Xr = /* @__PURE__ */ y.forwardRef(function(t, n) {
  const [r, o] = y.useState();
  return pe(() => {
    Bf && pn && o("button");
  }, []), /* @__PURE__ */ b("span", {
    ...t,
    ref: n,
    style: cd,
    "aria-hidden": r ? void 0 : !0,
    ...{
      tabIndex: 0,
      // Role is only for VoiceOver
      role: r
    },
    "data-base-ui-focus-guard": ""
  });
});
process.env.NODE_ENV !== "production" && (Xr.displayName = "FocusGuard");
const Ht = Math.min, ct = Math.max, qn = Math.round, Pn = Math.floor, at = (e) => ({
  x: e,
  y: e
}), ad = {
  left: "right",
  right: "left",
  bottom: "top",
  top: "bottom"
};
function rc(e, t, n) {
  return ct(e, Ht(t, n));
}
function mt(e, t) {
  return typeof e == "function" ? e(t) : e;
}
function We(e) {
  return e.split("-")[0];
}
function nt(e) {
  return e.split("-")[1];
}
function Oo(e) {
  return e === "x" ? "y" : "x";
}
function Io(e) {
  return e === "y" ? "height" : "width";
}
function Ke(e) {
  const t = e[0];
  return t === "t" || t === "b" ? "y" : "x";
}
function _o(e) {
  return Oo(Ke(e));
}
function ld(e, t, n) {
  n === void 0 && (n = !1);
  const r = nt(e), o = _o(e), s = Io(o);
  let i = o === "x" ? r === (n ? "end" : "start") ? "right" : "left" : r === "start" ? "bottom" : "top";
  return t.reference[s] > t.floating[s] && (i = jn(i)), [i, jn(i)];
}
function ud(e) {
  const t = jn(e);
  return [Jr(e), t, Jr(t)];
}
function Jr(e) {
  return e.includes("start") ? e.replace("start", "end") : e.replace("end", "start");
}
const ws = ["left", "right"], Ss = ["right", "left"], fd = ["top", "bottom"], dd = ["bottom", "top"];
function pd(e, t, n) {
  switch (e) {
    case "top":
    case "bottom":
      return n ? t ? Ss : ws : t ? ws : Ss;
    case "left":
    case "right":
      return t ? fd : dd;
    default:
      return [];
  }
}
function hd(e, t, n, r) {
  const o = nt(e);
  let s = pd(We(e), n === "start", r);
  return o && (s = s.map((i) => i + "-" + o), t && (s = s.concat(s.map(Jr)))), s;
}
function jn(e) {
  const t = We(e);
  return ad[t] + e.slice(t.length);
}
function gd(e) {
  var t, n, r, o;
  return {
    top: (t = e.top) != null ? t : 0,
    right: (n = e.right) != null ? n : 0,
    bottom: (r = e.bottom) != null ? r : 0,
    left: (o = e.left) != null ? o : 0
  };
}
function oc(e) {
  return typeof e != "number" ? gd(e) : {
    top: e,
    right: e,
    bottom: e,
    left: e
  };
}
function Gn(e) {
  const {
    x: t,
    y: n,
    width: r,
    height: o
  } = e;
  return {
    width: r,
    height: o,
    top: n,
    left: t,
    right: t + r,
    bottom: n + o,
    x: t,
    y: n
  };
}
function md(e) {
  return e.visibility === "hidden" || e.visibility === "collapse";
}
function bd(e, t = e ? je(e) : null) {
  return !e || !e.isConnected || !t || md(t) ? !1 : typeof e.checkVisibility == "function" ? e.checkVisibility() : t.display !== "none" && t.display !== "contents";
}
const vd = 'a[href],button,input,select,textarea,summary,details,iframe,object,embed,[tabindex],[contenteditable]:not([contenteditable="false"]),audio[controls],video[controls]';
function yd(e) {
  const t = e.assignedSlot;
  if (t)
    return t;
  if (e.parentElement)
    return e.parentElement;
  const n = e.getRootNode();
  return Bt(n) ? n.host : null;
}
function Zr(e) {
  for (const t of Array.from(e.children))
    if (He(t) === "summary")
      return t;
  return null;
}
function Cd(e, t) {
  const n = Zr(t);
  return !!n && (e === n || Pe(n, e));
}
function sc(e) {
  const t = e ? He(e) : "";
  return e != null && e.matches(vd) && (t !== "summary" || e.parentElement != null && He(e.parentElement) === "details" && Zr(e.parentElement) === e) && (t !== "details" || Zr(e) == null) && (t !== "input" || e.type !== "hidden");
}
function Ed(e) {
  if (!sc(e) || !e.isConnected || e.matches(":disabled"))
    return !1;
  for (let t = e; t; t = yd(t)) {
    const n = t !== e, r = He(t) === "slot";
    if (t.hasAttribute("inert") || n && He(t) === "details" && !t.open && !Cd(e, t) || t.hasAttribute("hidden") || !r && !wd(t, n))
      return !1;
  }
  return !0;
}
function wd(e, t) {
  const n = je(e);
  return t ? n.display !== "none" : bd(e, n);
}
function Sd(e) {
  const t = e.tabIndex;
  if (t < 0) {
    const n = He(e);
    if (n === "details" || n === "audio" || n === "video" || ke(e) && e.isContentEditable)
      return 0;
  }
  return t;
}
function Er(e) {
  if (He(e) !== "input")
    return null;
  const t = e;
  return t.type === "radio" && t.name !== "" ? t : null;
}
function Td(e, t) {
  const n = Er(e);
  if (!n)
    return !0;
  const r = t.find((o) => {
    const s = Er(o);
    return (s == null ? void 0 : s.name) === n.name && s.form === n.form && s.checked;
  });
  return r ? r === n : t.find((o) => {
    const s = Er(o);
    return (s == null ? void 0 : s.name) === n.name && s.form === n.form;
  }) === n;
}
function ic(e) {
  if (ke(e) && He(e) === "slot") {
    const t = e.assignedElements({
      flatten: !0
    });
    if (t.length > 0)
      return t;
  }
  return ke(e) && e.shadowRoot ? Array.from(e.shadowRoot.children) : Array.from(e.children);
}
function cc(e, t) {
  ic(e).forEach((n) => {
    sc(n) && t.push(n), cc(n, t);
  });
}
function ac(e, t, n) {
  ic(e).forEach((r) => {
    ke(r) && r.matches(t) && n.push(r), ac(r, t, n);
  });
}
function Rd(e) {
  const t = [];
  return cc(e, t), t.filter(Ed);
}
function lc(e) {
  const t = Rd(e);
  return t.filter((n) => Sd(n) >= 0 && Td(n, t));
}
function uc(e, t) {
  const n = lc(e), r = n.length;
  if (r === 0)
    return;
  const o = Gr(Qe(e)), s = n.indexOf(o), i = s === -1 ? t === 1 ? 0 : r - 1 : s + t;
  return n[i];
}
function xd(e) {
  return uc(Qe(e).body, 1) || e;
}
function Pd(e) {
  return uc(Qe(e).body, -1) || e;
}
function wr(e, t) {
  const n = t || e.currentTarget, r = e.relatedTarget;
  return !r || !Pe(n, r);
}
function Od(e) {
  lc(e).forEach((n) => {
    n.dataset.tabindex = n.getAttribute("tabindex") || "", n.setAttribute("tabindex", "-1");
  });
}
function Ts(e) {
  const t = [];
  ac(e, "[data-tabindex]", t), t.forEach((n) => {
    const r = n.dataset.tabindex;
    delete n.dataset.tabindex, r ? n.setAttribute("tabindex", r) : n.removeAttribute("tabindex");
  });
}
function Ut(e, t, n = !0) {
  return e.filter((o) => o.parentId === t).flatMap((o) => {
    var s;
    return [...!n || (s = o.context) != null && s.open ? [o] : [], ...Ut(e, o.id, n)];
  });
}
function Ao(e) {
  return `data-base-ui-${e}`;
}
const Id = {
  style: {
    transition: "none"
  }
}, _d = {
  fallbackAxisSide: "end"
}, Ad = {
  clipPath: "inset(50%)",
  position: "fixed",
  top: 0,
  left: 0
}, ko = /* @__PURE__ */ y.createContext(null);
process.env.NODE_ENV !== "production" && (ko.displayName = "PortalContext");
const kd = () => y.useContext(ko), Nd = Ao("portal");
function fc(e = {}) {
  const {
    ref: t,
    container: n,
    componentProps: r = $e,
    elementProps: o
  } = e, s = tr(), i = kd(), c = i == null ? void 0 : i.portalNode, [a, l] = y.useState(null), [u, f] = y.useState(null), p = fe((m) => {
    m !== null && f(m);
  }), h = y.useRef(null);
  pe(() => {
    if (n === null) {
      h.current && (h.current = null, f(null), l(null));
      return;
    }
    const m = (n && (go(n) ? n : n.current)) ?? c ?? document.body;
    if (m == null) {
      h.current && (h.current = null, f(null), l(null));
      return;
    }
    h.current !== m && (h.current = m, f(null), l(m));
  }, [n, c]);
  const d = vt("div", r, {
    ref: [t, p],
    props: [{
      id: s,
      [Nd]: ""
    }, o]
  }), g = a && d ? /* @__PURE__ */ bt.createPortal(d, a) : null;
  return {
    node: u,
    // `id` and `render` props can override or remove the generated ID. Use the exact
    // rendered value so `aria-owns` never points at an ID absent from the DOM.
    nodeId: /* @__PURE__ */ y.isValidElement(d) ? d.props.id : void 0,
    subtree: g
  };
}
const Md = /* @__PURE__ */ y.forwardRef(function(t, n) {
  const {
    render: r,
    className: o,
    style: s,
    children: i,
    container: c,
    portalOwnerRole: a,
    ...l
  } = t, {
    node: u,
    nodeId: f,
    subtree: p
  } = fc({
    container: c,
    ref: n,
    componentProps: t,
    elementProps: l
  }), h = y.useRef(null), d = y.useRef(null), g = y.useRef(null), m = y.useRef(null), [v, C] = y.useState(null), w = y.useRef(!1), E = v == null ? void 0 : v.modal, T = v == null ? void 0 : v.open, S = !!v && !v.modal && v.open && !!u;
  y.useEffect(() => {
    if (!u || E)
      return;
    function P(O) {
      u && O.relatedTarget && wr(O) && (O.type === "focusin" ? w.current && (Ts(u), w.current = !1) : (Od(u), w.current = !0));
    }
    return pt(Ee(u, "focusin", P, !0), Ee(u, "focusout", P, !0));
  }, [u, E]), pe(() => {
    !u || T !== !0 || !w.current || (Ts(u), w.current = !1);
  }, [T, u]);
  const R = y.useMemo(() => ({
    beforeOutsideRef: h,
    afterOutsideRef: d,
    beforeInsideRef: g,
    afterInsideRef: m,
    portalNode: u,
    setFocusManagerState: C
  }), [u]);
  return /* @__PURE__ */ U(y.Fragment, {
    children: [p, /* @__PURE__ */ U(ko.Provider, {
      value: R,
      children: [S && u && /* @__PURE__ */ b(Xr, {
        "data-type": "outside",
        ref: h,
        onFocus: (P) => {
          var O;
          if (wr(P, u))
            (O = g.current) == null || O.focus();
          else {
            const M = v ? v.domReference : null, F = Pd(M);
            F == null || F.focus();
          }
        }
      }), S && u && /* @__PURE__ */ b("span", {
        role: a,
        "aria-owns": f,
        style: Ad
      }), u && /* @__PURE__ */ bt.createPortal(i, u), S && u && /* @__PURE__ */ b(Xr, {
        "data-type": "outside",
        ref: d,
        onFocus: (P) => {
          var O;
          if (wr(P, u))
            (O = m.current) == null || O.focus();
          else {
            const M = v ? v.domReference : null, F = xd(M);
            F == null || F.focus(), v != null && v.closeOnFocusOut && (v == null || v.onOpenChange(!1, Oe(fl, P.nativeEvent)));
          }
        }
      })]
    })]
  });
});
process.env.NODE_ENV !== "production" && (Md.displayName = "FloatingPortal");
function dc() {
  const e = /* @__PURE__ */ new Map();
  return {
    emit(t, n) {
      var r;
      (r = e.get(t)) == null || r.forEach((o) => o(n));
    },
    on(t, n) {
      e.has(t) || e.set(t, /* @__PURE__ */ new Set()), e.get(t).add(n);
    },
    off(t, n) {
      var r;
      (r = e.get(t)) == null || r.delete(n);
    }
  };
}
class Dd {
  constructor() {
    ae(this, "nodesRef", {
      current: []
    });
    ae(this, "events", dc());
  }
  addNode(t) {
    this.nodesRef.current.push(t);
  }
  removeNode(t) {
    const n = this.nodesRef.current.findIndex((r) => r === t);
    n !== -1 && this.nodesRef.current.splice(n, 1);
  }
}
const No = /* @__PURE__ */ y.createContext(null);
process.env.NODE_ENV !== "production" && (No.displayName = "FloatingNodeContext");
const Mo = /* @__PURE__ */ y.createContext(null);
process.env.NODE_ENV !== "production" && (Mo.displayName = "FloatingTreeContext");
const lr = () => {
  var e;
  return ((e = y.useContext(No)) == null ? void 0 : e.id) || null;
}, hn = (e) => {
  const t = y.useContext(Mo);
  return e ?? t;
};
function Fd(e) {
  const t = tr(), n = hn(e), r = lr();
  return pe(() => {
    if (!t)
      return;
    const o = {
      id: t,
      parentId: r
    };
    return n == null || n.addNode(o), () => {
      n == null || n.removeNode(o);
    };
  }, [n, t, r]), t;
}
function Ld(e) {
  const {
    children: t,
    id: n
  } = e, r = lr();
  return /* @__PURE__ */ b(No.Provider, {
    value: y.useMemo(() => ({
      id: n,
      parentId: r
    }), [n, r]),
    children: t
  });
}
function Bd(e) {
  const {
    children: t,
    externalTree: n
  } = e, r = et(() => n ?? new Dd()).current;
  return /* @__PURE__ */ b(Mo.Provider, {
    value: r,
    children: t
  });
}
function Vd() {
  return !1;
}
function $d(e) {
  return {
    escapeKey: typeof e == "boolean" ? e : (e == null ? void 0 : e.escapeKey) ?? !1,
    outsidePress: typeof e == "boolean" ? e : (e == null ? void 0 : e.outsidePress) ?? !0
  };
}
function Hd(e, t = {}) {
  const {
    enabled: n = !0,
    escapeKey: r = !0,
    outsidePress: o = !0,
    outsidePressEvent: s = "sloppy",
    referencePress: i = Vd,
    bubbles: c,
    externalTree: a
  } = t, l = e.useState("open"), u = e.useState("floatingElement"), {
    dataRef: f,
    events: p
  } = e.context, h = hn(a), d = fe(typeof o == "function" ? o : () => !1), g = typeof o == "function" ? d : o, m = g !== !1, v = fe(() => s), {
    escapeKey: C,
    outsidePress: w
  } = $d(c), E = y.useRef(!1), T = y.useRef(!1), S = y.useRef(!1), R = y.useRef(!1), P = y.useRef(!1), O = y.useRef(""), M = y.useRef(null), F = Zt(), A = Zt(), D = Zt(), I = fe(() => {
    A.clear(), f.current.insideReactTree = !1;
  }), x = fe((L) => {
    var $;
    const X = ($ = f.current.floatingContext) == null ? void 0 : $.nodeId;
    return (h ? Ut(h.nodesRef.current, X) : []).some((Q) => {
      var re;
      return ((re = Q.context) == null ? void 0 : re.open) && !Q.context.dataRef.current[L];
    });
  }), _ = fe((L) => Cr(L, e.select("floatingElement")) || Cr(L, e.select("domReferenceElement"))), z = fe((L) => {
    i() && e.setOpen(!1, Oe(nr, L.nativeEvent));
  }), N = fe((L) => {
    if (!l || !n || !r || L.key !== "Escape")
      return;
    const X = $f(L) ? L.nativeEvent : L;
    if (P.current || X.isComposing || !C && x("__escapeKeyBubbles"))
      return;
    const B = Oe(lo, X);
    e.setOpen(!1, B), B.isCanceled || L.preventDefault(), !C && !B.isPropagationAllowed && L.stopPropagation();
  }), k = fe(() => {
    f.current.insideReactTree = !0, A.start(0, I);
  }), Y = fe((L) => {
    if (!l || !n || L.button !== 0)
      return;
    const X = St(L.nativeEvent);
    Pe(e.select("floatingElement"), X) && (E.current || (E.current = !0, T.current = !1));
  }), K = fe((L) => {
    !l || !n || (L.defaultPrevented || L.nativeEvent.defaultPrevented) && E.current && (T.current = !0);
  });
  y.useEffect(() => {
    function L(X) {
      X.open || (R.current = !1);
    }
    return p.on("openchange", L), () => {
      p.off("openchange", L);
    };
  }, [p]), y.useEffect(() => I, [I]), y.useEffect(() => {
    if (!l || !n)
      return l || (R.current = !1, P.current = !1, O.current = "", M.current = null), I;
    f.current.__escapeKeyBubbles = C, f.current.__outsidePressBubbles = w;
    const L = new gt(), X = Qe(u);
    function B() {
      D.clear(), P.current = !0;
    }
    function $() {
      P.current = !0, D.start(
        // 0ms or 1ms don't work in Safari. 5ms appears to consistently work.
        // Only apply to WebKit for the test to remain 0ms.
        pn ? 5 : 0,
        () => {
          P.current = !1;
        }
      );
    }
    function Q() {
      S.current = !0, L.start(0, () => {
        S.current = !1;
      });
    }
    function re() {
      E.current = !1, T.current = !1;
    }
    function ee() {
      const H = O.current, G = H === "pen" || !H ? "mouse" : H, we = v(), be = typeof we == "function" ? we() : we;
      return typeof be == "string" ? be : be[G];
    }
    function te(H) {
      const G = ee();
      return G === "intentional" && H.type !== "click" || G === "sloppy" && H.type === "click";
    }
    function q(H) {
      var be;
      const G = (be = f.current.floatingContext) == null ? void 0 : be.nodeId, we = h && Ut(h.nodesRef.current, G).some((ge) => {
        var V;
        return Cr(H, (V = ge.context) == null ? void 0 : V.elements.floating);
      });
      return _(H) || we;
    }
    function ne(H) {
      if (te(H)) {
        H.type !== "click" && !_(H) && (L.clear(), S.current = !1), I();
        return;
      }
      if (f.current.insideReactTree) {
        I();
        return;
      }
      const G = St(H), we = `[${Ao("inert")}]`, be = me(G) ? G.getRootNode() : null, ge = Array.from((Bt(be) ? be : Qe(e.select("floatingElement"))).querySelectorAll(we)), V = e.context.triggerElements;
      if (G && (V.hasElement(G) || V.hasMatchingElement((Z) => Pe(Z, G))))
        return;
      let j = me(G) ? G : null;
      for (; j && !dt(j); ) {
        const Z = ht(j);
        if (dt(Z) || !me(Z))
          break;
        j = Z;
      }
      if (!(ge.length && me(G) && !ed(G) && // Clicked on a direct ancestor (e.g. FloatingOverlay).
      !Pe(G, e.select("floatingElement")) && // If the target root element contains none of the markers, then the
      // element was injected after the floating element rendered.
      ge.every((Z) => !Pe(j, Z)))) {
        if (ke(G) && !("touches" in H)) {
          const Z = dt(G), se = je(G), Ne = /auto|scroll/, Re = Z || Ne.test(se.overflowX), Ot = Z || Ne.test(se.overflowY), ut = Re && G.clientWidth > 0 && G.scrollWidth > G.clientWidth, It = Ot && G.clientHeight > 0 && G.scrollHeight > G.clientHeight, rt = se.direction === "rtl", ot = It && (rt ? H.offsetX <= G.offsetWidth - G.clientWidth : H.offsetX > G.clientWidth), yt = ut && H.offsetY > G.clientHeight;
          if (ot || yt)
            return;
        }
        if (!q(H)) {
          if (ee() === "intentional") {
            if (H.detail !== 0 && !Hf(H) && !R.current)
              return;
            if (S.current) {
              L.clear(), S.current = !1;
              return;
            }
          }
          typeof g == "function" && !g(H) || x("__outsidePressBubbles") || (e.setOpen(!1, Oe(ul, H)), I());
        }
      }
    }
    function oe(H) {
      ee() !== "sloppy" || H.pointerType === "touch" || !e.select("open") || !n || _(H) || ne(H);
    }
    function ve(H) {
      if (ee() !== "sloppy" || !e.select("open") || !n || _(H))
        return;
      const G = H.touches[0];
      G && (M.current = {
        startTime: Date.now(),
        startX: G.clientX,
        startY: G.clientY,
        dismissOnTouchEnd: !1,
        dismissOnMouseDown: !0
      }, F.start(1e3, () => {
        M.current && (M.current.dismissOnTouchEnd = !1, M.current.dismissOnMouseDown = !1);
      }));
    }
    function W(H, G) {
      const we = St(H);
      if (!we)
        return;
      const be = Ee(we, H.type, () => {
        G(H), be();
      });
    }
    function J(H) {
      O.current = "touch", W(H, ve);
    }
    function ce(H) {
      F.clear(), H.type === "pointerdown" && (H.button === 0 && (R.current = !0), O.current = H.pointerType), !(H.type === "mousedown" && M.current && !M.current.dismissOnMouseDown) && W(H, (G) => {
        G.type === "pointerdown" ? oe(G) : ne(G);
      });
    }
    function he(H) {
      if (H.type === "pointercancel" && (R.current = !1), !E.current)
        return;
      const G = T.current;
      if (re(), ee() === "intentional") {
        if (H.type === "pointercancel") {
          G && Q();
          return;
        }
        if (!q(H)) {
          if (G) {
            Q();
            return;
          }
          typeof g == "function" && !g(H) || (L.clear(), S.current = !0, I());
        }
      }
    }
    function Ie(H) {
      if (ee() !== "sloppy" || !M.current || _(H))
        return;
      const G = H.touches[0];
      if (!G)
        return;
      const we = Math.abs(G.clientX - M.current.startX), be = Math.abs(G.clientY - M.current.startY), ge = Math.sqrt(we * we + be * be);
      ge > 5 && (M.current.dismissOnTouchEnd = !0), ge > 10 && (ne(H), F.clear(), M.current = null);
    }
    function Fe(H) {
      W(H, Ie);
    }
    function xe(H) {
      ee() !== "sloppy" || !M.current || _(H) || (M.current.dismissOnTouchEnd && ne(H), F.clear(), M.current = null);
    }
    function Le(H) {
      W(H, xe);
    }
    const Ue = pt(r && pt(Ee(X, "keydown", N), Ee(X, "compositionstart", B), Ee(X, "compositionend", $)), m && pt(Ee(X, "click", ce, !0), Ee(X, "pointerdown", ce, !0), Ee(X, "pointerup", he, !0), Ee(X, "pointercancel", he, !0), Ee(X, "mousedown", ce, !0), Ee(X, "mouseup", he, !0), Ee(X, "touchstart", J, {
      capture: !0,
      passive: !0
    }), Ee(X, "touchmove", Fe, {
      capture: !0,
      passive: !0
    }), Ee(X, "touchend", Le, {
      capture: !0,
      passive: !0
    })));
    return () => {
      Ue(), L.clear(), re(), S.current = !1;
    };
  }, [f, u, r, m, g, l, n, C, w, N, I, v, x, _, h, e, F, D]);
  const le = y.useMemo(() => ({
    onKeyDown: N,
    onPointerDown: z,
    onClick: z
  }), [N, z]), ie = y.useMemo(() => ({
    onKeyDown: N,
    // `onMouseDown` may be blocked if `event.preventDefault()` is called in
    // `onPointerDown`, such as with <NumberField.ScrubArea>.
    // See https://github.com/mui/base-ui/pull/3379
    onPointerDown: K,
    onMouseDown: K,
    onClickCapture: k,
    onMouseDownCapture(L) {
      k(), Y(L);
    },
    onPointerDownCapture(L) {
      k(), Y(L);
    },
    onMouseUpCapture: k,
    onTouchEndCapture: k,
    onTouchMoveCapture: k
  }), [N, k, Y, K]);
  return y.useMemo(() => n ? {
    reference: le,
    floating: ie,
    trigger: le
  } : {}, [n, le, ie]);
}
function Kn(e, t, n, r) {
  return {
    left: e,
    top: t,
    right: n,
    bottom: r,
    x: e,
    y: t,
    width: n - e,
    height: r - t
  };
}
function Ud(e) {
  return {
    left: e.left,
    top: e.top,
    right: e.right,
    bottom: e.bottom,
    width: e.width,
    height: e.height
  };
}
function pc(e) {
  const t = [];
  let n, r = Number.POSITIVE_INFINITY, o = Number.POSITIVE_INFINITY, s = Number.NEGATIVE_INFINITY, i = Number.NEGATIVE_INFINITY;
  for (const c of Array.from(e).sort((a, l) => a.top - l.top)) {
    if (r = Math.min(r, c.left), o = Math.min(o, c.top), s = Math.max(s, c.right), i = Math.max(i, c.bottom), !n || c.top - n.top > n.height / 2)
      t.push(Ud(c));
    else {
      const a = t[t.length - 1];
      a.left = Math.min(a.left, c.left), a.right = Math.max(a.right, c.right), a.bottom = Math.max(a.bottom, c.bottom), a.width = a.right - a.left, a.height = a.bottom - a.top;
    }
    n = c;
  }
  return {
    lines: t,
    fallback: Kn(r, o, s, i)
  };
}
function hc(e, t, n) {
  return e.findIndex((r) => t > r.left - 2 && t < r.right + 2 && n > r.top - 2 && n < r.bottom + 2);
}
function Rs(e) {
  return Kn(e.left, e.top, e.right, e.bottom);
}
function zd(e, t, n) {
  const {
    lines: r
  } = pc(e.getClientRects());
  if (r.length < 2)
    return;
  const o = hc(r, t, n);
  return {
    x: t,
    y: n,
    lineIndex: o === -1 ? void 0 : o,
    element: e
  };
}
function Wd(e, t, n) {
  const {
    lines: r,
    fallback: o
  } = pc(e.getClientRects());
  if (r.length < 2)
    return null;
  const s = n == null ? void 0 : n.x, i = n == null ? void 0 : n.y, c = t[0];
  if ((n == null ? void 0 : n.lineIndex) != null && r[n.lineIndex])
    return Rs(r[n.lineIndex]);
  if (s != null && i != null) {
    const d = hc(r, s, i);
    if (d !== -1)
      return Rs(r[d]);
  }
  if (r.length === 2 && r[0].left > r[1].right && s != null && i != null)
    return o;
  if (c === "t" || c === "b") {
    const d = r[0], g = r[r.length - 1], m = c === "t" ? d : g;
    return Kn(m.left, d.top, m.right, g.bottom);
  }
  const a = c === "l";
  let l = r[0].left, u = r[0].right, f = a ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY, p = r[0], h = r[0];
  for (const d of r) {
    l = Math.min(l, d.left), u = Math.max(u, d.right);
    const g = a ? d.left : d.right;
    a && g < f || !a && g > f ? (f = g, p = d, h = d) : g === f && (h = d);
  }
  return Kn(l, p.top, u, h.bottom);
}
function qd(e) {
  return "contextElement" in e && e.contextElement ? e.contextElement : me(e) ? e : void 0;
}
function jd(e, t) {
  function n(o) {
    gc(e, o.currentTarget, o.clientX, o.clientY);
  }
  function r(o) {
    t || n(o);
  }
  return {
    onFocus() {
      e.current = void 0;
    },
    onMouseEnter: r,
    onMouseMove: r
  };
}
function gc(e, t, n, r) {
  const o = zd(t, n, r);
  return e.current = o, o;
}
function Gd(e) {
  return {
    name: "inline",
    async fn(t) {
      const n = t.elements.reference;
      if (typeof (n == null ? void 0 : n.getClientRects) != "function")
        return {};
      const r = qd(n), o = e.current, s = (o == null ? void 0 : o.element) === n || (o == null ? void 0 : o.element) === r ? o : void 0, i = Wd(n, t.placement, s);
      if (!i || typeof t.platform.getElementRects != "function")
        return {};
      const c = await t.platform.getElementRects({
        reference: {
          contextElement: r,
          getBoundingClientRect() {
            return i;
          }
        },
        floating: t.elements.floating,
        strategy: t.strategy
      });
      return t.rects.reference.x === c.reference.x && t.rects.reference.y === c.reference.y && t.rects.reference.width === c.reference.width && t.rects.reference.height === c.reference.height ? {} : {
        reset: {
          rects: c
        }
      };
    }
  };
}
class Kd {
  /**
   * Creates a handle backed by the store used while no root is attached.
   *
   * @param fallbackStore Inert, closed store handed to detached triggers while no root is attached,
   * so they can render and register without a mounted root. Triggers register into whichever store
   * `store` currently resolves to, so while detached they live in this store's trigger map and
   * migrate themselves to the root's store (and back) as it attaches/detaches.
   * @param componentName Component name used to prefix dev warnings, e.g. `'Menu'` produces
   * `MenuHandle.open()` in warning text.
   * @param throwOnMissingTrigger Whether `open(triggerId)` throws when no trigger with that id is
   * registered. Anchored popups (Menu, Popover, Tooltip, PreviewCard) need a trigger to anchor to,
   * so they throw; Dialog is not anchored and instead opens unassociated with a dev warning.
   */
  constructor(t, n, r = !0) {
    /**
     * Stores of every root currently using this handle, in attach order. A handle is meant to be used
     * by a single mounted root, but roots can transiently overlap (e.g. during an animated route
     * transition), so this stack lets `attachStore`'s cleanup restore the previous root instead of
     * leaving a still-mounted root uncontrollable when a newer overlapping root detaches first.
     */
    ae(this, "attachedStores", []);
    /**
     * Store of the root that currently controls the handle: the most recently attached one still
     * mounted, or `null` when no root is attached. Imperative methods are no-ops while this is `null`.
     */
    ae(this, "attachedStoreValue", null);
    /**
     * Listeners notified when `attachedStore` changes, so detached triggers can follow the store pointer.
     */
    ae(this, "storeListeners", /* @__PURE__ */ new Set());
    this.fallbackStore = t, this.componentName = n, this.throwOnMissingTrigger = r;
  }
  get attachedStore() {
    return this.attachedStoreValue;
  }
  /**
   * Store that detached triggers read from: the attached root's store, or an inert fallback store
   * used while no root is attached.
   * @internal
   */
  get store() {
    return this.attachedStoreValue ?? this.fallbackStore;
  }
  /**
   * Stable fallback store used for server rendering and hydration. Root stores cannot be recorded on
   * the handle during render because a handle can be shared by concurrent server-rendered requests.
   * @internal
   */
  get serverStore() {
    return this.fallbackStore;
  }
  /**
   * Subscribes to changes of the attached store pointer so detached triggers re-render and re-bind
   * when a root attaches or detaches. Returns a function that removes the listener.
   * @internal
   */
  subscribeStore(t) {
    return this.storeListeners.add(t), () => {
      this.storeListeners.delete(t);
    };
  }
  /**
   * Points the handle at a root's store and notifies subscribers so detached triggers re-render and
   * re-register into it (their registration effect migrates them when the store pointer changes).
   * Returns a cleanup function that detaches the store again.
   * @internal
   */
  attachStore(t) {
    if (this.attachedStores.push(t), this.setActiveStore(t), process.env.NODE_ENV !== "production" && this.attachedStores.length > 1) {
      const n = this;
      (n.overlapWarningFrame ?? (n.overlapWarningFrame = De.create())).request(() => {
        this.attachedStores.length > 1 && console.warn("Base UI: A handle is attached to more than one mounted root at the same time. The most recently mounted root takes over and the previous one stops being controlled by the handle. A handle should be used by a single root that stays mounted for the lifetime of the handle.");
      });
    }
    return () => {
      const n = this.attachedStores.lastIndexOf(t);
      n !== -1 && this.attachedStores.splice(n, 1), this.setActiveStore(this.attachedStores[this.attachedStores.length - 1] ?? null);
    };
  }
  /**
   * Sets the store that currently controls the handle and notifies subscribers when it changes, so
   * detached triggers re-render and migrate their registration to the new store.
   */
  setActiveStore(t) {
    this.attachedStoreValue !== t && (this.attachedStoreValue = t, this.storeListeners.forEach((n) => {
      n();
    }));
  }
  /**
   * Opens the attached root's store and associates it with the trigger with the given id, or a
   * no-op (with a dev warning) while no root is attached. Shared by every concrete handle's public
   * `open()` method, which only narrows the parameter type.
   *
   * When a trigger id is given but no matching trigger is registered, anchored popups throw (see
   * `throwOnMissingTrigger`); Dialog opens unassociated with a dev warning instead.
   *
   * This method should only be called in an event handler or an effect (not during rendering).
   *
   * @param triggerId ID of the trigger to associate with the popup, or `null`/`undefined` to open
   * without associating any trigger.
   */
  openByTrigger(t) {
    const n = this.attachedStore;
    if (n === null) {
      process.env.NODE_ENV !== "production" && console.warn(`Base UI: ${this.componentName}Handle.open() was called while no root using this handle is mounted. The call was ignored; mount a root with this handle before opening it imperatively.`);
      return;
    }
    let r;
    if (t) {
      for (let o = this.attachedStores.length - 1; o >= 0 && !r; o -= 1)
        r = this.attachedStores[o].context.triggerElements.getById(t);
      r ?? (r = this.fallbackStore.context.triggerElements.getById(t));
    }
    if (t && !r) {
      if (this.throwOnMissingTrigger)
        throw new Error(process.env.NODE_ENV !== "production" ? `Base UI: ${this.componentName}Handle.open() was called with the trigger id "${t}", but no matching trigger is registered with this handle. An anchored popup cannot open without a trigger to anchor to. Pass the id of a mounted ${this.componentName}.Trigger that has this handle set on its "handle" prop.` : Pt(99, this.componentName, t, this.componentName));
      process.env.NODE_ENV !== "production" && console.warn(`Base UI: ${this.componentName}Handle.open: No trigger found with id "${t}". The popup will open, but the trigger will not be associated with it.`);
    }
    n.setOpen(!0, Oe(Fr, void 0, r));
  }
  /**
   * Closes the popup by setting the attached root's store to closed, or a no-op (with a dev warning)
   * while no root is attached. Shared by every concrete handle's public `close()` method.
   *
   * This method should only be called in an event handler or an effect (not during rendering).
   */
  closePopup() {
    const t = this.attachedStore;
    if (t === null) {
      process.env.NODE_ENV !== "production" && console.warn(`Base UI: ${this.componentName}Handle.close() was called while no root using this handle is mounted. The call was ignored.`);
      return;
    }
    t.setOpen(!1, Oe(Fr));
  }
}
function Yd(e) {
  const {
    popupStore: t,
    treatPopupAsFloatingElement: n = !1,
    floatingRootContext: r,
    floatingId: o,
    nested: s,
    onOpenChange: i
  } = e, c = t.useState("open"), a = t.useState("activeTriggerElement"), l = t.useState(n ? "popupElement" : "positionerElement"), u = i;
  return t.useSyncedValue("floatingId", o), pe(() => {
    const f = {
      open: c,
      floatingId: o,
      referenceElement: a,
      floatingElement: l
    };
    me(a) && (f.domReferenceElement = a), r.state.positionReference === r.state.referenceElement && (f.positionReference = a), r.update(f);
  }, [c, o, a, l, r]), r.context.onOpenChange = u, r.context.nested = s, r;
}
function Xd(e) {
  const {
    open: t,
    ref: n,
    preventUnmountOnClose: r,
    setPreventUnmountOnClose: o,
    onUnmount: s,
    animateInitialOpen: i
  } = e, c = fe(o), {
    mounted: a,
    setMounted: l,
    transitionStatus: u
  } = Ri(t, !1, !1, i), f = t ? !1 : r;
  pe(() => {
    t && c(!1);
  }, [t, c]);
  const p = y.useRef(a), h = y.useRef(!1), d = wi(), g = () => {
    p.current = !1, l(!1), s();
  };
  pe(() => {
    p.current = a, h.current && (h.current = !1, !t && a && g());
  });
  const m = fe(() => {
    if (p.current) {
      if (t) {
        h.current = !0, d();
        return;
      }
      g();
    }
  });
  return vo({
    enabled: a && !t && !f,
    open: t,
    ref: n,
    onComplete() {
      t || m();
    }
  }), {
    mounted: a,
    transitionStatus: u,
    preventUnmountingOnClose: f,
    forceUnmount: m
  };
}
const Jd = {
  tabIndex: -1,
  [zf]: ""
};
function Zd(e, t = !1) {
  const n = tr(), r = lr() != null, o = et(() => e(n, r)).current;
  return Yd({
    popupStore: o,
    treatPopupAsFloatingElement: t,
    floatingRootContext: o.state.floatingRootContext,
    floatingId: n,
    nested: r,
    onOpenChange: o.setOpen
  }), o;
}
function Qd({
  handle: e,
  store: t
}) {
  return pe(() => e.attachStore(t), [e, t]), null;
}
function xs(e) {
  const t = e.context.triggerElements.size;
  e.select("open") && e.state.triggerCount !== t && e.set("triggerCount", t);
}
function ep(e, t) {
  const n = y.useRef(null);
  return fe((r) => {
    const o = n.current;
    if (o !== null) {
      if (o.element === r && o.store === t && o.id === e)
        return;
      n.current = null;
      const s = o.store;
      s.context.triggerElements.getById(o.id) === o.element && (s.context.triggerElements.delete(o.id), xs(s));
    }
    r !== null && e !== void 0 && (n.current = {
      store: t,
      id: e,
      element: r
    }, t.context.triggerElements.add(e, r), xs(t));
  });
}
function tp(e, t, n, r = !1) {
  let o = e.preventUnmountingOnClose;
  t ? o = !1 : r && (o = !0);
  const s = (n == null ? void 0 : n.id) ?? null;
  let i = e.activeTriggerId, c = e.activeTriggerElement;
  return (s || t) && (i = s, c = n ?? null), {
    open: t,
    preventUnmountingOnClose: o,
    activeTriggerId: i,
    activeTriggerElement: c,
    // An open request without a trigger (a handle's `open(null)` or `openWithPayload()`) must not
    // be reassociated with a lone registered trigger later on. Controlled and default opens never
    // pass through here, so they keep claiming a lone trigger. A close request keeps the flag: a
    // controlled root may decline it and stay open, so the Root clears the flag only once the
    // popup is effectively closed.
    openedWithoutTrigger: t ? n == null : e.openedWithoutTrigger
  };
}
function np(e) {
  let t = !1;
  return e.preventUnmountOnClose = () => {
    t = !0;
  }, () => t;
}
function rp(e, t, n, r = {}) {
  var u, f, p;
  const o = n.reason, s = o === Xe, i = t && o === Mn, c = !t && (o === nr || o === lo), a = np(n);
  if ((f = (u = e.context).onOpenChange) == null || f.call(u, t, n), n.isCanceled)
    return;
  (p = r.onBeforeDispatch) == null || p.call(r), e.state.floatingRootContext.dispatchOpenChange(t, n);
  const l = () => {
    const h = tp(e.state, t, n.trigger, a()), d = {
      ...r.extraState,
      ...h
    };
    i ? d.instantType = "focus" : c ? d.instantType = "dismiss" : s && (d.instantType = void 0), e.update(d);
  };
  s ? bt.flushSync(l) : l();
}
function op(e, t, n, r) {
  const o = n.useState("isMountedByTrigger", e), s = ep(e, n), i = fe((a) => {
    const l = n.select("open"), u = n.select("activeTriggerId");
    if (u === e) {
      const f = {
        activeTriggerElement: a,
        ...l ? r : null
      };
      n.update(f);
      return;
    }
    if (u == null && l && !n.state.openedWithoutTrigger) {
      const f = {
        activeTriggerId: e ?? null,
        activeTriggerElement: a,
        ...r
      };
      n.update(f);
    }
  }), c = fe((a) => {
    s(a), a && i(a);
  });
  return pe(() => (c(t.current), () => c(null)), [c, t, n, e]), pe(() => {
    if (o) {
      const a = {
        activeTriggerElement: t.current,
        ...r
      };
      n.update(a);
    }
  }, [o, n, t, ...Object.values(r)]), {
    registerTrigger: c,
    isMountedByThisTrigger: o
  };
}
function sp(e, t = {}) {
  const {
    closeOnActiveTriggerUnmount: n = !1
  } = t, r = y.useRef(null), o = e.useState("open"), s = e.useState("triggerCount"), i = e.useState("activeTriggerId"), c = e.useState("activeTriggerElement");
  pe(() => {
    if (!o) {
      r.current = null, e.state.triggerCount !== 0 && e.set("triggerCount", 0), e.state.openedWithoutTrigger && e.set("openedWithoutTrigger", !1);
      return;
    }
    const a = e.context.triggerElements.size, l = {};
    e.state.triggerCount !== a && (l.triggerCount = a);
    const u = e.select("activeTriggerId");
    let f = null;
    if (u) {
      const p = e.context.triggerElements.getById(u);
      if (p)
        r.current = u, p !== e.state.activeTriggerElement && (l.activeTriggerElement = p);
      else {
        for (const [h, d] of e.context.triggerElements.entries())
          if (d === e.state.activeTriggerElement) {
            l.activeTriggerId = h, l.activeTriggerElement = d, r.current = h;
            break;
          }
        l.activeTriggerId === void 0 && (r.current === u ? f = u : r.current = null);
      }
    } else
      r.current = null;
    if (!f && !u && !e.state.openedWithoutTrigger && a === 1) {
      const p = e.context.triggerElements.entries().next();
      if (!p.done) {
        const [h, d] = p.value;
        l.activeTriggerId = h, l.activeTriggerElement = d, r.current = h;
      }
    }
    (l.triggerCount !== void 0 || l.activeTriggerId !== void 0 || l.activeTriggerElement !== void 0) && e.update(l), f && n && queueMicrotask(() => {
      if (e.select("open") && e.select("activeTriggerId") === f && !e.context.triggerElements.getById(f)) {
        const p = Oe(Ti);
        e.setOpen(!1, p), p.isCanceled || e.update({
          activeTriggerId: null,
          activeTriggerElement: null
        });
      }
    });
  }, [o, e, s, i, c, n]);
}
function ip(e, t, n, r) {
  const {
    mounted: o,
    transitionStatus: s,
    forceUnmount: i
  } = Xd({
    open: e,
    ref: t.context.popupRef,
    preventUnmountOnClose: t.useState("preventUnmountingOnClose"),
    setPreventUnmountOnClose: (c) => t.set("preventUnmountingOnClose", c),
    animateInitialOpen: r,
    onUnmount() {
      var c, a;
      t.update({
        activeTriggerId: null,
        activeTriggerElement: null,
        mounted: !1,
        preventUnmountingOnClose: !1
      }), n == null || n(), (a = (c = t.context).onOpenChangeComplete) == null || a.call(c, !1);
    }
  });
  return et(() => (t.set("mounted", o), null)), t.useSyncedValues({
    mounted: o,
    transitionStatus: s
  }), {
    forceUnmount: i,
    transitionStatus: s
  };
}
function cp(e, t) {
  e.useSyncedValues(t), pe(() => () => {
    e.update({
      activeTriggerProps: $e,
      inactiveTriggerProps: $e,
      popupProps: $e
    });
  }, [e]);
}
let Dt;
function ap(e) {
  Dt ?? (Dt = /* @__PURE__ */ new WeakMap());
  let t = Dt.get(e);
  return t || (t = /* @__PURE__ */ new WeakMap(), Dt.set(e, t)), t;
}
class mc {
  constructor() {
    ae(this, "idMap", /* @__PURE__ */ new Map());
  }
  /**
   * Adds a trigger element with the given ID.
   *
   * Note: The provided element is assumed to not be registered under multiple IDs.
   */
  add(t, n) {
    if (process.env.NODE_ENV !== "production") {
      const r = ap(this), o = r.get(n);
      if (o !== void 0 && o !== t)
        throw new Error("Base UI: A trigger element cannot be registered under multiple IDs in PopupTriggerMap.");
      const s = this.idMap.get(t);
      s !== void 0 && s !== n && r.delete(s), r.set(n, t);
    }
    this.idMap.set(t, n);
  }
  /**
   * Removes the trigger element with the given ID.
   */
  delete(t) {
    var n;
    if (process.env.NODE_ENV !== "production") {
      const r = this.idMap.get(t);
      r !== void 0 && ((n = Dt == null ? void 0 : Dt.get(this)) == null || n.delete(r));
    }
    this.idMap.delete(t);
  }
  /**
   * Whether the given element is registered as a trigger.
   */
  hasElement(t) {
    for (const n of this.idMap.values())
      if (n === t)
        return !0;
    return !1;
  }
  /**
   * Whether there is a registered trigger element matching the given predicate.
   */
  hasMatchingElement(t) {
    for (const n of this.idMap.values())
      if (t(n))
        return !0;
    return !1;
  }
  /**
   * Returns the trigger element associated with the given ID, or undefined if no such element exists.
   */
  getById(t) {
    return this.idMap.get(t);
  }
  /**
   * Returns an iterable of all registered trigger entries, where each entry is a tuple of [id, element].
   */
  entries() {
    return this.idMap.entries();
  }
  /**
   * Returns an iterable of all registered trigger elements.
   */
  elements() {
    return this.idMap.values();
  }
  /**
   * Returns the number of registered trigger elements.
   */
  get size() {
    return this.idMap.size;
  }
}
var On = { exports: {} }, Sr = {};
/**
 * @license React
 * use-sync-external-store-shim.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var Ps;
function lp() {
  if (Ps) return Sr;
  Ps = 1;
  var e = ze;
  function t(f, p) {
    return f === p && (f !== 0 || 1 / f === 1 / p) || f !== f && p !== p;
  }
  var n = typeof Object.is == "function" ? Object.is : t, r = e.useState, o = e.useEffect, s = e.useLayoutEffect, i = e.useDebugValue;
  function c(f, p) {
    var h = p(), d = r({ inst: { value: h, getSnapshot: p } }), g = d[0].inst, m = d[1];
    return s(
      function() {
        g.value = h, g.getSnapshot = p, a(g) && m({ inst: g });
      },
      [f, h, p]
    ), o(
      function() {
        return a(g) && m({ inst: g }), f(function() {
          a(g) && m({ inst: g });
        });
      },
      [f]
    ), i(h), h;
  }
  function a(f) {
    var p = f.getSnapshot;
    f = f.value;
    try {
      var h = p();
      return !n(f, h);
    } catch {
      return !0;
    }
  }
  function l(f, p) {
    return p();
  }
  var u = typeof window > "u" || typeof window.document > "u" || typeof window.document.createElement > "u" ? l : c;
  return Sr.useSyncExternalStore = e.useSyncExternalStore !== void 0 ? e.useSyncExternalStore : u, Sr;
}
var Tr = {};
/**
 * @license React
 * use-sync-external-store-shim.development.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var Os;
function up() {
  return Os || (Os = 1, process.env.NODE_ENV !== "production" && (function() {
    function e(h, d) {
      return h === d && (h !== 0 || 1 / h === 1 / d) || h !== h && d !== d;
    }
    function t(h, d) {
      u || o.startTransition === void 0 || (u = !0, console.error(
        "You are using an outdated, pre-release alpha of React 18 that does not support useSyncExternalStore. The use-sync-external-store shim will not work correctly. Upgrade to a newer pre-release."
      ));
      var g = d();
      if (!f) {
        var m = d();
        s(g, m) || (console.error(
          "The result of getSnapshot should be cached to avoid an infinite loop"
        ), f = !0);
      }
      m = i({
        inst: { value: g, getSnapshot: d }
      });
      var v = m[0].inst, C = m[1];
      return a(
        function() {
          v.value = g, v.getSnapshot = d, n(v) && C({ inst: v });
        },
        [h, g, d]
      ), c(
        function() {
          return n(v) && C({ inst: v }), h(function() {
            n(v) && C({ inst: v });
          });
        },
        [h]
      ), l(g), g;
    }
    function n(h) {
      var d = h.getSnapshot;
      h = h.value;
      try {
        var g = d();
        return !s(h, g);
      } catch {
        return !0;
      }
    }
    function r(h, d) {
      return d();
    }
    typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u" && typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart == "function" && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart(Error());
    var o = ze, s = typeof Object.is == "function" ? Object.is : e, i = o.useState, c = o.useEffect, a = o.useLayoutEffect, l = o.useDebugValue, u = !1, f = !1, p = typeof window > "u" || typeof window.document > "u" || typeof window.document.createElement > "u" ? r : t;
    Tr.useSyncExternalStore = o.useSyncExternalStore !== void 0 ? o.useSyncExternalStore : p, typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u" && typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop == "function" && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop(Error());
  })()), Tr;
}
var Is;
function Do() {
  return Is || (Is = 1, process.env.NODE_ENV === "production" ? On.exports = lp() : On.exports = up()), On.exports;
}
var Fo = Do(), In = { exports: {} }, Rr = {};
/**
 * @license React
 * use-sync-external-store-shim/with-selector.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var _s;
function fp() {
  if (_s) return Rr;
  _s = 1;
  var e = ze, t = Do();
  function n(l, u) {
    return l === u && (l !== 0 || 1 / l === 1 / u) || l !== l && u !== u;
  }
  var r = typeof Object.is == "function" ? Object.is : n, o = t.useSyncExternalStore, s = e.useRef, i = e.useEffect, c = e.useMemo, a = e.useDebugValue;
  return Rr.useSyncExternalStoreWithSelector = function(l, u, f, p, h) {
    var d = s(null);
    if (d.current === null) {
      var g = { hasValue: !1, value: null };
      d.current = g;
    } else g = d.current;
    d = c(
      function() {
        function v(S) {
          if (!C) {
            if (C = !0, w = S, S = p(S), h !== void 0 && g.hasValue) {
              var R = g.value;
              if (h(R, S))
                return E = R;
            }
            return E = S;
          }
          if (R = E, r(w, S)) return R;
          var P = p(S);
          return h !== void 0 && h(R, P) ? (w = S, R) : (w = S, E = P);
        }
        var C = !1, w, E, T = f === void 0 ? null : f;
        return [
          function() {
            return v(u());
          },
          T === null ? void 0 : function() {
            return v(T());
          }
        ];
      },
      [u, f, p, h]
    );
    var m = o(l, d[0], d[1]);
    return i(
      function() {
        g.hasValue = !0, g.value = m;
      },
      [m]
    ), a(m), m;
  }, Rr;
}
var xr = {};
/**
 * @license React
 * use-sync-external-store-shim/with-selector.development.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var As;
function dp() {
  return As || (As = 1, process.env.NODE_ENV !== "production" && (function() {
    function e(l, u) {
      return l === u && (l !== 0 || 1 / l === 1 / u) || l !== l && u !== u;
    }
    typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u" && typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart == "function" && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart(Error());
    var t = ze, n = Do(), r = typeof Object.is == "function" ? Object.is : e, o = n.useSyncExternalStore, s = t.useRef, i = t.useEffect, c = t.useMemo, a = t.useDebugValue;
    xr.useSyncExternalStoreWithSelector = function(l, u, f, p, h) {
      var d = s(null);
      if (d.current === null) {
        var g = { hasValue: !1, value: null };
        d.current = g;
      } else g = d.current;
      d = c(
        function() {
          function v(S) {
            if (!C) {
              if (C = !0, w = S, S = p(S), h !== void 0 && g.hasValue) {
                var R = g.value;
                if (h(R, S))
                  return E = R;
              }
              return E = S;
            }
            if (R = E, r(w, S))
              return R;
            var P = p(S);
            return h !== void 0 && h(R, P) ? (w = S, R) : (w = S, E = P);
          }
          var C = !1, w, E, T = f === void 0 ? null : f;
          return [
            function() {
              return v(u());
            },
            T === null ? void 0 : function() {
              return v(T());
            }
          ];
        },
        [u, f, p, h]
      );
      var m = o(l, d[0], d[1]);
      return i(
        function() {
          g.hasValue = !0, g.value = m;
        },
        [m]
      ), a(m), m;
    }, typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u" && typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop == "function" && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop(Error());
  })()), xr;
}
var ks;
function pp() {
  return ks || (ks = 1, process.env.NODE_ENV === "production" ? In.exports = fp() : In.exports = dp()), In.exports;
}
var hp = pp();
const gp = pi(19), mp = gp ? vp : yp;
function bc(e, t, n, r, o) {
  return mp(e, t, n, r, o);
}
function bp(e, t, n, r, o) {
  const s = y.useCallback(() => t(e.getSnapshot(), n, r, o), [e, t, n, r, o]);
  return Fo.useSyncExternalStore(e.subscribe, s, s);
}
If({
  before(e) {
    e.syncIndex = 0, e.didInitialize || (e.syncTick = 1, e.syncHooks = [], e.didChangeStore = !0, e.getSnapshot = () => {
      let t = !1;
      for (let n = 0; n < e.syncHooks.length; n += 1) {
        const r = e.syncHooks[n], o = r.selector(r.store.state, r.a1, r.a2, r.a3);
        Object.is(r.value, o) || (t = !0, r.value = o);
      }
      return t && (e.syncTick += 1), e.syncTick;
    });
  },
  after(e) {
    e.syncHooks.length > 0 && (e.didChangeStore && (e.didChangeStore = !1, e.subscribe = (t) => {
      const n = /* @__PURE__ */ new Set();
      for (const o of e.syncHooks)
        n.add(o.store);
      const r = [];
      for (const o of n)
        r.push(o.subscribe(t));
      return () => {
        for (const o of r)
          o();
      };
    }), Fo.useSyncExternalStore(e.subscribe, e.getSnapshot, e.getSnapshot));
  }
});
function vp(e, t, n, r, o) {
  const s = Of();
  if (!s)
    return bp(e, t, n, r, o);
  const i = s.syncIndex;
  s.syncIndex += 1;
  let c;
  return s.didInitialize ? (c = s.syncHooks[i], (c.store !== e || c.selector !== t || !Object.is(c.a1, n) || !Object.is(c.a2, r) || !Object.is(c.a3, o)) && (c.store !== e && (s.didChangeStore = !0), c.store = e, c.selector = t, c.a1 = n, c.a2 = r, c.a3 = o, c.value = t(e.getSnapshot(), n, r, o))) : (c = {
    store: e,
    selector: t,
    a1: n,
    a2: r,
    a3: o,
    value: t(e.getSnapshot(), n, r, o)
  }, s.syncHooks.push(c)), c.value;
}
function yp(e, t, n, r, o) {
  return hp.useSyncExternalStoreWithSelector(e.subscribe, e.getSnapshot, e.getSnapshot, (s) => t(s, n, r, o));
}
class Cp {
  /**
   * The current state of the store.
   * This property is updated immediately when the state changes as a result of calling {@link setState}, {@link update}, or {@link set}.
   * To subscribe to state changes, use the {@link useState} method. The value returned by {@link useState} is updated after the component renders (similarly to React's useState).
   * The values can be used directly (to avoid subscribing to the store) in effects or event handlers.
   *
   * Do not modify properties in state directly. Instead, use the provided methods to ensure proper state management and listener notification.
   */
  // Internal state to handle recursive `setState()` calls
  constructor(t) {
    /**
     * Registers a listener that will be called whenever the store's state changes.
     *
     * @param fn The listener function to be called on state changes.
     * @returns A function to unsubscribe the listener.
     */
    ae(this, "subscribe", (t) => (this.listeners.add(t), () => {
      this.listeners.delete(t);
    }));
    /**
     * Returns the current state of the store.
     */
    ae(this, "getSnapshot", () => this.state);
    this.state = t, this.listeners = /* @__PURE__ */ new Set(), this.updateTick = 0;
  }
  /**
   * Creates a store with the given initial state, constructing the class it is called on.
   * Calling it on a generic base class (e.g. `ReactStore.create(...)`) constructs that
   * class but degrades the inferred instance type to `Store`; use `new` there instead.
   */
  static create(t) {
    return new this(t);
  }
  /**
   * Updates the entire store's state and notifies all registered listeners.
   *
   * @param newState The new state to set for the store.
   */
  setState(t) {
    if (this.state === t)
      return;
    this.state = t, this.updateTick += 1;
    const n = this.updateTick;
    for (const r of this.listeners) {
      if (n !== this.updateTick)
        return;
      r(t);
    }
  }
  /**
   * Merges the provided changes into the current state and notifies listeners if there are changes.
   * Each value must match its state key. Pass an exact known subset rather than a broad
   * `Partial<State>`, which may contain `undefined` for required state fields.
   *
   * @param changes An object containing the changes to apply to the current state.
   */
  update(t) {
    for (const n in t)
      if (!Object.is(this.state[n], t[n])) {
        this.setState({
          ...this.state,
          ...t
        });
        return;
      }
  }
  /**
   * Sets a specific key in the store's state to a new value and notifies listeners if the value has changed.
   *
   * @param key The key in the store's state to update.
   * @param value The new value to set for the specified key.
   */
  set(t, n) {
    Object.is(this.state[t], n) || this.setState({
      ...this.state,
      [t]: n
    });
  }
  /**
   * Gives the state a new reference and updates all registered listeners.
   */
  notifyAll() {
    const t = {
      ...this.state
    };
    this.setState(t);
  }
  use(t, n, r, o) {
    return bc(this, t, n, r, o);
  }
}
class Lo extends Cp {
  /**
   * Creates a new ReactStore instance.
   *
   * @param state Initial state of the store.
   * @param context Non-reactive context values.
   * @param selectors Optional selectors for use with `useState`.
   */
  constructor(t, n = {}, r) {
    super(t), this.context = n, this.selectors = r;
  }
  /**
   * Non-reactive values such as refs, callbacks, etc.
   */
  /**
   * Synchronizes a single external value into the store.
   *
   * Note that the while the value in `state` is updated immediately, the value returned
   * by `useState` is updated before the next render (similarly to React's `useState`).
   */
  useSyncedValue(t, n) {
    y.useDebugValue(t);
    const r = this;
    pe(() => {
      r.state[t] !== n && r.set(t, n);
    }, [r, t, n]);
  }
  /**
   * Synchronizes a single external value into the store and
   * cleans it up (sets to `undefined`) on unmount.
   *
   * Note that the while the value in `state` is updated immediately, the value returned
   * by `useState` is updated before the next render (similarly to React's `useState`).
   */
  useSyncedValueWithCleanup(t, n) {
    const r = this;
    pe(() => (r.state[t] !== n && r.set(t, n), () => {
      r.set(t, void 0);
    }), [r, t, n]);
  }
  /**
   * Synchronizes multiple external values into the store.
   * Each value must match its state key. Pass an exact known subset rather than a broad
   * `Partial<State>`, which may contain `undefined` for required state fields.
   *
   * Note that the while the values in `state` are updated immediately, the values returned
   * by `useState` are updated before the next render (similarly to React's `useState`).
   *
   * @param statePart An exact subset of state fields to synchronize. Unknown keys are not accepted.
   */
  useSyncedValues(t) {
    const n = this;
    if (process.env.NODE_ENV !== "production") {
      y.useDebugValue(t, (i) => Object.keys(i));
      const o = y.useRef(Object.keys(t)).current, s = Object.keys(t);
      (o.length !== s.length || o.some((i, c) => i !== s[c])) && console.error("ReactStore.useSyncedValues expects the same prop keys on every render. Keys should be stable.");
    }
    const r = Object.values(t);
    pe(() => {
      n.update(t);
    }, [n, ...r]);
  }
  /**
   * Registers a controllable prop pair (`controlled`, `defaultValue`) for a specific key. If `controlled`
   * is non-undefined, the store's state at `key` is updated to match `controlled`.
   */
  useControlledProp(t, n) {
    y.useDebugValue(t);
    const r = this, o = n !== void 0;
    if (pe(() => {
      o && !Object.is(r.state[t], n) && r.setState({
        ...r.state,
        [t]: n
      });
    }, [r, t, n, o]), process.env.NODE_ENV !== "production") {
      const s = this.controlledValues ?? (this.controlledValues = /* @__PURE__ */ new Map());
      s.has(t) || s.set(t, o);
      const i = s.get(t);
      i !== void 0 && i !== o && console.error(`A component is changing the ${i ? "" : "un"}controlled state of ${t.toString()} to be ${i ? "un" : ""}controlled. Elements should not switch from uncontrolled to controlled (or vice versa).`);
    }
  }
  /** Gets the current value from the store using a selector with the provided key.
   *
   * @param key Key of the selector to use.
   */
  select(t, n, r, o) {
    const s = this.selectors[t];
    return s(this.state, n, r, o);
  }
  /**
   * Returns a value from the store's state using a selector function.
   * Used to subscribe to specific parts of the state.
   * This methods causes a rerender whenever the selected state changes.
   *
   * @param key Key of the selector to use.
   */
  useState(t, n, r, o) {
    return y.useDebugValue(t), bc(this, this.selectors[t], n, r, o);
  }
  /**
   * Wraps a function with `useStableCallback` to ensure it has a stable reference
   * and assigns it to the context.
   *
   * @param key Key of the event callback. Must be a function in the context.
   * @param fn Function to assign.
   */
  useContextCallback(t, n) {
    y.useDebugValue(t);
    const r = fe(n ?? co);
    this.context[t] = r;
  }
  /**
   * Returns a stable setter function for a specific key in the store's state.
   * It's commonly used to pass as a ref callback to React elements.
   *
   * @param key Key of the state to set.
   */
  useStateSetter(t) {
    const n = y.useRef(void 0);
    return n.current === void 0 && (n.current = (r) => {
      this.set(t, r);
    }), n.current;
  }
  /**
   * Observes changes derived from the store's selectors and calls the listener when the selected value changes.
   *
   * @param key Key of the selector to observe.
   * @param listener Listener function called when the selector result changes.
   */
  observe(t, n) {
    let r;
    typeof t == "function" ? r = t : r = this.selectors[t];
    let o = r(this.state);
    return n(o, o, this), this.subscribe((s) => {
      const i = r(s);
      if (!Object.is(o, i)) {
        const c = o;
        o = i, n(i, c, this);
      }
    });
  }
}
const Ep = {
  open: (e) => e.open,
  transitionStatus: (e) => e.transitionStatus,
  domReferenceElement: (e) => e.domReferenceElement,
  referenceElement: (e) => e.positionReference ?? e.referenceElement,
  floatingElement: (e) => e.floatingElement,
  floatingId: (e) => e.floatingId
};
class wp extends Lo {
  constructor(n) {
    const {
      syncOnly: r,
      nested: o,
      onOpenChange: s,
      triggerElements: i,
      ...c
    } = n;
    super({
      ...c,
      positionReference: c.referenceElement,
      domReferenceElement: c.referenceElement
    }, {
      onOpenChange: s,
      dataRef: {
        current: {}
      },
      events: dc(),
      nested: o,
      triggerElements: i
    }, Ep);
    /**
     * Syncs the event used by hover logic to distinguish hover-open from click-like interaction.
     */
    ae(this, "syncOpenEvent", (n, r) => {
      (!n || !this.state.open || // Prevent a pending hover-open from overwriting a click-open event, while allowing
      // click events to upgrade a hover-open.
      r != null && Uf(r)) && (this.context.dataRef.current.openEvent = n ? r : void 0);
    });
    /**
     * Runs the root-owned side effects for an open state change.
     */
    ae(this, "dispatchOpenChange", (n, r) => {
      this.syncOpenEvent(n, r.event);
      const o = {
        open: n,
        reason: r.reason,
        nativeEvent: r.event,
        nested: this.context.nested,
        triggerElement: r.trigger
      };
      this.context.events.emit("openchange", o);
    });
    /**
     * Emits the `openchange` event through the internal event emitter and calls the `onOpenChange` handler with the provided arguments.
     *
     * @param newOpen The new open state.
     * @param eventDetails Details about the event that triggered the open state change.
     */
    ae(this, "setOpen", (n, r) => {
      var o, s, i, c;
      if (this.syncOnly) {
        (s = (o = this.context).onOpenChange) == null || s.call(o, n, r);
        return;
      }
      this.dispatchOpenChange(n, r), (c = (i = this.context).onOpenChange) == null || c.call(i, n, r);
    });
    this.syncOnly = r;
  }
}
function Sp(e, t, n = !1) {
  return {
    open: !1,
    openProp: void 0,
    mounted: !1,
    transitionStatus: void 0,
    floatingRootContext: new wp({
      open: !1,
      transitionStatus: void 0,
      floatingElement: null,
      referenceElement: null,
      triggerElements: e,
      floatingId: t,
      syncOnly: !0,
      nested: n,
      onOpenChange: void 0
    }),
    floatingId: t,
    triggerCount: 0,
    preventUnmountingOnClose: !1,
    payload: void 0,
    activeTriggerId: null,
    activeTriggerElement: null,
    openedWithoutTrigger: !1,
    triggerIdProp: void 0,
    popupElement: null,
    positionerElement: null,
    activeTriggerProps: $e,
    inactiveTriggerProps: $e,
    popupProps: $e
  };
}
const en = (e) => e.triggerIdProp ?? e.activeTriggerId, Yn = (e) => e.openProp ?? e.open, Ns = (e) => {
  var n;
  return (((n = e.popupElement) == null ? void 0 : n.id) ?? e.floatingId) || void 0;
};
function vc(e, t) {
  return t !== void 0 && Yn(e) && en(e) === t;
}
function Tp(e, t) {
  return vc(e, t) ? !0 : t !== void 0 && Yn(e) && en(e) == null && !e.openedWithoutTrigger && e.triggerCount === 1;
}
const Rp = {
  open: Yn,
  mounted: (e) => e.mounted,
  // `open` is written synchronously on an open change; `mounted`/`transitionStatus` sync in a
  // layout effect. Match useTransitionStatus so a retained popup does not miss its starting phase.
  transitionStatus: (e) => Yn(e) && !e.mounted ? "starting" : e.transitionStatus,
  floatingRootContext: (e) => e.floatingRootContext,
  triggerCount: (e) => e.triggerCount,
  preventUnmountingOnClose: (e) => e.preventUnmountingOnClose,
  payload: (e) => e.payload,
  activeTriggerId: en,
  activeTriggerElement: (e) => e.mounted ? e.activeTriggerElement : null,
  popupId: Ns,
  /**
   * Whether the trigger with the given ID was used to open the popup.
   */
  isTriggerActive: (e, t) => t !== void 0 && en(e) === t,
  /**
   * Whether the popup is open and was activated by a trigger with the given ID.
   */
  isOpenedByTrigger: (e, t) => vc(e, t),
  /**
   * Whether the popup is mounted and was activated by a trigger with the given ID.
   */
  isMountedByTrigger: (e, t) => t !== void 0 && en(e) === t && e.mounted,
  triggerProps: (e, t) => t ? e.activeTriggerProps : e.inactiveTriggerProps,
  /**
   * Popup id for the trigger that currently owns the open popup.
   */
  triggerPopupId: (e, t) => Tp(e, t) ? Ns(e) : void 0,
  popupProps: (e) => e.popupProps,
  popupElement: (e) => e.popupElement,
  positionerElement: (e) => e.positionerElement
};
function xp(e) {
  const t = y.useCallback((r) => e === void 0 ? co : e.subscribeStore(r), [e]), n = y.useCallback(() => e === void 0 ? void 0 : e.store, [e]);
  return Fo.useSyncExternalStore(t, n, () => e == null ? void 0 : e.serverStore);
}
const Pr = Qi && pn;
function Pp(e, t = {}) {
  const {
    enabled: n = !0,
    delay: r
  } = t, {
    events: o,
    dataRef: s
  } = e.context, i = y.useRef(!1), c = y.useRef(null), a = y.useRef(!0), l = Zt();
  y.useEffect(() => {
    const f = e.select("domReferenceElement");
    if (!n)
      return;
    const p = _e(f);
    function h() {
      const m = e.select("domReferenceElement");
      !e.select("open") && ke(m) && m === Gr(Qe(m)) && (i.current = !0, c.current = m);
    }
    function d() {
      a.current = !0;
    }
    function g() {
      a.current = !1;
    }
    return pt(Ee(p, "blur", h), Pr && Ee(p, "keydown", d, !0), Pr && Ee(p, "pointerdown", g, !0));
  }, [e, n]), y.useEffect(() => {
    if (!n)
      return;
    function f(p) {
      if (p.reason === nr || p.reason === lo) {
        const h = e.select("domReferenceElement");
        me(h) && (c.current = h, i.current = !0);
      }
    }
    return o.on("openchange", f), () => {
      o.off("openchange", f);
    };
  }, [o, n, e]);
  const u = y.useMemo(() => {
    function f() {
      i.current = !1, c.current = null;
    }
    return {
      onMouseLeave() {
        f();
      },
      onFocus(p) {
        const h = p.currentTarget;
        if (i.current) {
          if (c.current === h)
            return;
          f();
        }
        const d = St(p.nativeEvent);
        if (me(d)) {
          if (Pr && !p.relatedTarget) {
            if (!a.current && !td(d))
              return;
          } else if (!rd(d))
            return;
        }
        const g = Wn(p.relatedTarget, e.context.triggerElements), {
          nativeEvent: m,
          currentTarget: v
        } = p;
        if (e.select("open") && g || !r) {
          e.setOpen(!0, Oe(Mn, m, v));
          return;
        }
        l.start(r, () => {
          i.current || e.setOpen(!0, Oe(Mn, m, v));
        });
      },
      onBlur(p) {
        f();
        const h = p.relatedTarget, d = p.nativeEvent, g = me(h) && h.hasAttribute(Ao("focus-guard")) && h.getAttribute("data-type") === "outside";
        l.start(0, () => {
          var w;
          const m = e.select("domReferenceElement"), v = Gr(Qe(m));
          !h && v === m || Pe((w = s.current.floatingContext) == null ? void 0 : w.refs.floating.current, v) || Pe(m, v) || g || Wn(h ?? v, e.context.triggerElements) || e.setOpen(!1, Oe(Mn, d));
        });
      }
    };
  }, [s, r, e, l]);
  return y.useMemo(() => n ? {
    reference: u,
    trigger: u
  } : {}, [n, u]);
}
class Bo {
  constructor() {
    ae(this, "pointerType");
    ae(this, "interactedInside", !1);
    ae(this, "handler");
    ae(this, "blockMouseMove", !0);
    ae(this, "performedPointerEventsMutation", !1);
    ae(this, "pointerEventsScopeElement", null);
    ae(this, "pointerEventsReferenceElement", null);
    ae(this, "pointerEventsFloatingElement", null);
    ae(this, "restTimeoutPending", !1);
    ae(this, "openChangeTimeout", new gt());
    ae(this, "restTimeout", new gt());
    ae(this, "handleCloseOptions");
    ae(this, "dispose", () => {
      this.openChangeTimeout.clear(), this.restTimeout.clear();
    });
    ae(this, "disposeEffect", () => this.dispose);
  }
  static create() {
    return new Bo();
  }
}
const Xn = /* @__PURE__ */ new WeakMap();
function Jn(e) {
  var n, r, o;
  if (!e.performedPointerEventsMutation)
    return;
  const t = e.pointerEventsScopeElement;
  t && Xn.get(t) === e && ((n = e.pointerEventsScopeElement) == null || n.style.removeProperty("pointer-events"), (r = e.pointerEventsReferenceElement) == null || r.style.removeProperty("pointer-events"), (o = e.pointerEventsFloatingElement) == null || o.style.removeProperty("pointer-events"), Xn.delete(t)), e.performedPointerEventsMutation = !1, e.pointerEventsScopeElement = null, e.pointerEventsReferenceElement = null, e.pointerEventsFloatingElement = null;
}
function yc(e, t) {
  const {
    scopeElement: n,
    referenceElement: r,
    floatingElement: o
  } = t, s = Xn.get(n);
  s && s !== e && Jn(s), Jn(e), e.performedPointerEventsMutation = !0, e.pointerEventsScopeElement = n, e.pointerEventsReferenceElement = r, e.pointerEventsFloatingElement = o, Xn.set(n, e), n.style.pointerEvents = "none", r.style.pointerEvents = "auto", o.style.pointerEvents = "auto";
}
function Cc(e) {
  const t = e.context.dataRef.current, n = et(() => t.hoverInteractionState ?? Bo.create()).current;
  return t.hoverInteractionState || (t.hoverInteractionState = n), uo(t.hoverInteractionState.disposeEffect), t.hoverInteractionState;
}
function Op(e, t = {}) {
  const {
    enabled: n = !0,
    closeDelay: r = 0,
    nodeId: o
  } = t, s = e.useState("open"), i = e.useState("floatingElement"), c = e.useState("domReferenceElement"), {
    dataRef: a
  } = e.context, l = hn(), u = lr(), f = Cc(e), p = Zt(), h = fe(() => {
    var m;
    return nc((m = a.current.openEvent) == null ? void 0 : m.type, f.interactedInside);
  }), d = fe(() => {
    var m;
    return sd((m = a.current.openEvent) == null ? void 0 : m.type);
  }), g = fe(() => {
    Jn(f);
  });
  pe(() => {
    s || (f.pointerType = void 0, f.restTimeoutPending = !1, f.interactedInside = !1, g());
  }, [s, f, g]), y.useEffect(() => g, [g]), pe(() => {
    var m, v, C, w, E;
    if (n && s && (m = f.handleCloseOptions) != null && m.blockPointerEvents && d() && me(c) && i) {
      const T = c, S = i, R = Qe(i), P = (C = (v = l == null ? void 0 : l.nodesRef.current.find((A) => A.id === u)) == null ? void 0 : v.context) == null ? void 0 : C.elements.floating;
      P && (P.style.pointerEvents = "");
      const O = f.pointerEventsScopeElement !== S ? f.pointerEventsScopeElement : null, M = P !== S ? P : null, F = ((E = (w = f.handleCloseOptions) == null ? void 0 : w.getScope) == null ? void 0 : E.call(w)) ?? O ?? M ?? Kr(T, "[data-rootownerid]") ?? R.body;
      return yc(f, {
        scopeElement: F,
        referenceElement: T,
        floatingElement: S
      }), () => {
        g();
      };
    }
  }, [n, s, c, i, f, d, l, u, g]), y.useEffect(() => {
    if (!n)
      return;
    function m() {
      return !!(l && u && Ut(l.nodesRef.current, u).length > 0);
    }
    function v(R) {
      const P = Yr(r, "close", f.pointerType), O = () => {
        e.setOpen(!1, Oe(Xe, R)), l == null || l.events.emit("floating.closed", R);
      };
      P ? f.openChangeTimeout.start(P, O) : (f.openChangeTimeout.clear(), O());
    }
    function C(R) {
      const P = St(R);
      if (!nd(P)) {
        f.interactedInside = !1;
        return;
      }
      f.interactedInside = Kr(P, "[aria-haspopup]") != null;
    }
    function w() {
      f.openChangeTimeout.clear(), p.clear(), l == null || l.events.off("floating.closed", T), g();
    }
    function E(R) {
      var F;
      if (m() && l) {
        l.events.on("floating.closed", T);
        return;
      }
      if (Wn(R.relatedTarget, e.context.triggerElements))
        return;
      const P = ((F = a.current.floatingContext) == null ? void 0 : F.nodeId) ?? o, O = R.relatedTarget;
      if (!(l && P && me(O) && Ut(l.nodesRef.current, P, !1).some((A) => {
        var D;
        return Pe((D = A.context) == null ? void 0 : D.elements.floating, O);
      }))) {
        if (f.handler) {
          f.handler(R);
          return;
        }
        g(), d() && !h() && v(R);
      }
    }
    function T(R) {
      !l || !u || m() || p.start(0, () => {
        l.events.off("floating.closed", T), e.setOpen(!1, Oe(Xe, R)), l.events.emit("floating.closed", R);
      });
    }
    const S = i;
    return pt(S && Ee(S, "mouseenter", w), S && Ee(S, "mouseleave", E), S && Ee(S, "pointerdown", C, !0), () => {
      l == null || l.events.off("floating.closed", T);
    });
  }, [n, i, e, a, r, o, d, h, g, f, l, u, p]);
}
const Ip = {
  current: null
};
function _p(e, t = {}) {
  const {
    enabled: n = !0,
    delay: r = 0,
    handleClose: o = null,
    mouseOnly: s = !1,
    restMs: i = 0,
    move: c = !0,
    triggerElementRef: a = Ip,
    externalTree: l,
    isActiveTrigger: u = !0,
    getHandleCloseContext: f,
    isClosing: p,
    shouldOpen: h,
    guardStaleOpen: d = !1
  } = t, {
    dataRef: g,
    events: m
  } = e.context, v = hn(l), C = Cc(e), w = y.useRef(!1), E = Je(o), T = Je(r), S = Je(i), R = Je(n), P = Je(h), O = Je(p), M = fe(() => {
    var x;
    return nc((x = g.current.openEvent) == null ? void 0 : x.type, C.interactedInside);
  }), F = fe(() => {
    var x;
    return ((x = P.current) == null ? void 0 : x.call(P)) !== !1;
  }), A = fe((x, _, z) => {
    const N = e.context.triggerElements;
    if (N.hasElement(_))
      return !x || !Pe(x, _);
    if (!me(z))
      return !1;
    const k = z;
    return N.hasMatchingElement((Y) => Pe(Y, k)) && (!x || !Pe(x, k));
  }), D = fe(() => {
    if (!C.handler)
      return;
    Qe(e.select("domReferenceElement")).removeEventListener("mousemove", C.handler), C.handler = void 0;
  }), I = fe(() => {
    Jn(C);
  });
  return u && (C.handleCloseOptions = o == null ? void 0 : o.__options), y.useEffect(() => D, [D]), y.useEffect(() => {
    if (!n)
      return;
    function x(_) {
      _.open ? w.current = !1 : (w.current = _.reason === Xe, D(), C.openChangeTimeout.clear(), C.restTimeout.clear(), C.blockMouseMove = !0, C.restTimeoutPending = !1);
    }
    return m.on("openchange", x), () => {
      m.off("openchange", x);
    };
  }, [n, m, C, D]), y.useEffect(() => {
    if (!n)
      return;
    function x(K, le = !0) {
      const ie = Yr(T.current, "close", C.pointerType);
      ie ? C.openChangeTimeout.start(ie, () => {
        e.setOpen(!1, Oe(Xe, K)), v == null || v.events.emit("floating.closed", K);
      }) : le && (C.openChangeTimeout.clear(), e.setOpen(!1, Oe(Xe, K)), v == null || v.events.emit("floating.closed", K));
    }
    const _ = a.current ?? (u ? e.select("domReferenceElement") : null);
    if (!me(_))
      return;
    function z(K) {
      var W;
      if (C.openChangeTimeout.clear(), C.blockMouseMove = !1, s && !jr(C.pointerType))
        return;
      const le = Es(S.current), ie = Yr(T.current, "open", C.pointerType), L = St(K), X = K.currentTarget ?? null, B = e.select("domReferenceElement");
      let $ = X;
      if (me(L) && !e.context.triggerElements.hasElement(L)) {
        for (const J of e.context.triggerElements.elements())
          if (Pe(J, L)) {
            $ = J;
            break;
          }
      }
      me(X) && me(B) && !e.context.triggerElements.hasElement(X) && Pe(X, B) && ($ = B);
      const Q = $ == null ? !1 : A(B, $, L), re = e.select("open"), ee = ((W = O.current) == null ? void 0 : W.call(O)) ?? e.select("transitionStatus") === "ending", te = !re && ee && w.current, q = !Q && me($) && me(B) && Pe(B, $) && te, ne = le > 0 && !ie, oe = Q && (re || te) || q, ve = !re || Q;
      if (oe) {
        F() && e.setOpen(!0, Oe(Xe, K, $));
        return;
      }
      ne || (ie ? C.openChangeTimeout.start(ie, () => {
        ve && F() && e.setOpen(!0, Oe(Xe, K, $));
      }) : ve && F() && e.setOpen(!0, Oe(Xe, K, $)));
    }
    function N(K) {
      if (M()) {
        I();
        return;
      }
      D();
      const le = e.select("domReferenceElement"), ie = Qe(le);
      C.restTimeout.clear(), C.restTimeoutPending = !1;
      const L = g.current.floatingContext ?? (f == null ? void 0 : f());
      if (Wn(K.relatedTarget, e.context.triggerElements))
        return;
      if (E.current && L) {
        e.select("open") || C.openChangeTimeout.clear();
        const B = a.current;
        C.handler = E.current({
          ...L,
          tree: v,
          x: K.clientX,
          y: K.clientY,
          onClose() {
            I(), D(), R.current && !M() && B === e.select("domReferenceElement") && x(K, !0);
          }
        }), ie.addEventListener("mousemove", C.handler), C.handler(K);
        return;
      }
      (C.pointerType === "touch" ? !Pe(e.select("floatingElement"), K.relatedTarget) : !0) && x(K);
    }
    function k(K) {
      Pe(_, K.relatedTarget) || (C.openChangeTimeout.clear(), C.restTimeout.clear(), C.restTimeoutPending = !1);
    }
    const Y = d ? Ee(_, "mouseout", k) : void 0;
    return c ? pt(Ee(_, "mousemove", z, {
      once: !0
    }), Ee(_, "mouseenter", z), Ee(_, "mouseleave", N), Y) : pt(Ee(_, "mouseenter", z), Ee(_, "mouseleave", N), Y);
  }, [D, I, g, T, e, n, E, C, u, A, M, s, c, S, a, v, R, f, O, F, d]), y.useMemo(() => {
    if (!n)
      return;
    function x(_) {
      C.pointerType = _.pointerType;
    }
    return {
      onPointerDown: x,
      onPointerEnter: x,
      onMouseMove(_) {
        var L, X, B;
        const {
          nativeEvent: z
        } = _, N = _.currentTarget, k = e.select("domReferenceElement"), Y = e.select("open"), K = A(k, N, _.target);
        if (s && !jr(C.pointerType))
          return;
        if (Y && K && ((L = C.handleCloseOptions) != null && L.blockPointerEvents)) {
          const $ = e.select("floatingElement");
          if ($) {
            const Q = ((B = (X = C.handleCloseOptions) == null ? void 0 : X.getScope) == null ? void 0 : B.call(X)) ?? N.ownerDocument.body;
            yc(C, {
              scopeElement: Q,
              referenceElement: N,
              floatingElement: $
            });
          }
        }
        const le = Es(S.current);
        if (Y && !K || le === 0 || !K && C.restTimeoutPending && _.movementX ** 2 + _.movementY ** 2 < 2)
          return;
        C.restTimeout.clear();
        function ie() {
          if (C.restTimeoutPending = !1, M())
            return;
          const $ = e.select("open");
          !C.blockMouseMove && (!$ || K) && F() && e.setOpen(!0, Oe(Xe, z, N));
        }
        C.pointerType === "touch" ? bt.flushSync(() => {
          ie();
        }) : K && Y ? ie() : (C.restTimeoutPending = !0, C.restTimeout.start(le, ie));
      }
    };
  }, [n, C, M, A, s, e, S, F]);
}
const Ms = 0.1, Ap = Ms * Ms, Ce = 0.5;
function _n(e, t, n, r, o, s) {
  return r >= t != s >= t && e <= (o - n) * (t - r) / (s - r) + n;
}
function An(e, t, n, r, o, s, i, c, a, l) {
  let u = !1;
  return _n(e, t, n, r, o, s) && (u = !u), _n(e, t, o, s, i, c) && (u = !u), _n(e, t, i, c, a, l) && (u = !u), _n(e, t, a, l, n, r) && (u = !u), u;
}
function kp(e, t, n) {
  return e >= n.x && e <= n.x + n.width && t >= n.y && t <= n.y + n.height;
}
function kn(e, t, n, r, o, s) {
  const i = Math.min(n, o), c = Math.max(n, o), a = Math.min(r, s), l = Math.max(r, s);
  return e >= i && e <= c && t >= a && t <= l;
}
function Np(e = {}) {
  const {
    blockPointerEvents: t = !1
  } = e, n = new gt(), r = ({
    x: o,
    y: s,
    placement: i,
    elements: c,
    onClose: a,
    nodeId: l,
    tree: u
  }) => {
    const f = i == null ? void 0 : i.split("-")[0];
    let p = !1, h = null, d = null, g = typeof performance < "u" ? performance.now() : 0;
    function m(C, w) {
      const E = performance.now(), T = E - g;
      if (h === null || d === null || T === 0)
        return h = C, d = w, g = E, !1;
      const S = C - h, R = w - d, P = S * S + R * R, O = T * T * Ap;
      return h = C, d = w, g = E, P < O;
    }
    function v() {
      n.clear(), a();
    }
    return function(w) {
      n.clear();
      const E = c.domReference, T = c.floating;
      if (!E || !T || f == null || o == null || s == null)
        return;
      const {
        clientX: S,
        clientY: R
      } = w, P = St(w), O = w.type === "mouseleave", M = Pe(T, P), F = Pe(E, P);
      if (M && (p = !0, !O))
        return;
      if (F && (p = !1, !O)) {
        p = !0;
        return;
      }
      if (O && me(w.relatedTarget) && Pe(T, w.relatedTarget))
        return;
      function A() {
        return !!(u && Ut(u.nodesRef.current, l).length > 0);
      }
      function D() {
        A() || v();
      }
      if (A())
        return;
      const I = E.getBoundingClientRect(), x = T.getBoundingClientRect(), _ = o > x.right - x.width / 2, z = s > x.bottom - x.height / 2, N = x.width > I.width, k = x.height > I.height, Y = (N ? I : x).left, K = (N ? I : x).right, le = (k ? I : x).top, ie = (k ? I : x).bottom;
      if (f === "top" && s >= I.bottom - 1 || f === "bottom" && s <= I.top + 1 || f === "left" && o >= I.right - 1 || f === "right" && o <= I.left + 1) {
        D();
        return;
      }
      let L = !1;
      switch (f) {
        case "top":
          L = kn(S, R, Y, I.top + 1, K, x.bottom - 1);
          break;
        case "bottom":
          L = kn(S, R, Y, x.top + 1, K, I.bottom - 1);
          break;
        case "left":
          L = kn(S, R, x.right - 1, ie, I.left + 1, le);
          break;
        case "right":
          L = kn(S, R, I.right - 1, ie, x.left + 1, le);
          break;
      }
      if (L)
        return;
      if (p && !kp(S, R, I)) {
        D();
        return;
      }
      if (!O && m(S, R)) {
        D();
        return;
      }
      let X = !1;
      switch (f) {
        case "top": {
          const B = N ? Ce / 2 : Ce * 4, $ = N || _ ? o + B : o - B, Q = N ? o - B : _ ? o + B : o - B, re = s + Ce + 1, ee = _ || N ? x.bottom - Ce : x.top, te = _ ? N ? x.bottom - Ce : x.top : x.bottom - Ce;
          X = An(S, R, $, re, Q, re, x.left, ee, x.right, te);
          break;
        }
        case "bottom": {
          const B = N ? Ce / 2 : Ce * 4, $ = N || _ ? o + B : o - B, Q = N ? o - B : _ ? o + B : o - B, re = s - Ce, ee = _ || N ? x.top + Ce : x.bottom, te = _ ? N ? x.top + Ce : x.bottom : x.top + Ce;
          X = An(S, R, $, re, Q, re, x.left, ee, x.right, te);
          break;
        }
        case "left": {
          const B = k ? Ce / 2 : Ce * 4, $ = k || z ? s + B : s - B, Q = k ? s - B : z ? s + B : s - B, re = o + Ce + 1, ee = z || k ? x.right - Ce : x.left, te = z ? k ? x.right - Ce : x.left : x.right - Ce;
          X = An(S, R, ee, x.top, te, x.bottom, re, $, re, Q);
          break;
        }
        case "right": {
          const B = k ? Ce / 2 : Ce * 4, $ = k || z ? s + B : s - B, Q = k ? s - B : z ? s + B : s - B, re = o - Ce, ee = z || k ? x.left + Ce : x.right, te = z ? k ? x.left + Ce : x.right : x.left + Ce;
          X = An(S, R, re, $, re, Q, ee, x.top, te, x.bottom);
          break;
        }
      }
      X ? p || n.start(40, D) : D();
    };
  };
  return r.__options = {
    ...e,
    blockPointerEvents: t
  }, r;
}
function Ds(e, t, n) {
  let {
    reference: r,
    floating: o
  } = e;
  const s = Ke(t), i = _o(t), c = Io(i), a = We(t), l = s === "y", u = r.x + r.width / 2 - o.width / 2, f = r.y + r.height / 2 - o.height / 2, p = r[c] / 2 - o[c] / 2;
  let h;
  switch (a) {
    case "top":
      h = {
        x: u,
        y: r.y - o.height
      };
      break;
    case "bottom":
      h = {
        x: u,
        y: r.y + r.height
      };
      break;
    case "right":
      h = {
        x: r.x + r.width,
        y: f
      };
      break;
    case "left":
      h = {
        x: r.x - o.width,
        y: f
      };
      break;
    default:
      h = {
        x: r.x,
        y: r.y
      };
  }
  const d = nt(t);
  return d && (h[i] += p * (d === "end" ? 1 : -1) * (n && l ? -1 : 1)), h;
}
async function Mp(e, t) {
  var n;
  t === void 0 && (t = {});
  const {
    x: r,
    y: o,
    platform: s,
    rects: i,
    elements: c,
    strategy: a
  } = e, {
    boundary: l = "clippingAncestors",
    rootBoundary: u = "viewport",
    elementContext: f = "floating",
    altBoundary: p = !1,
    padding: h = 0
  } = mt(t, e), d = oc(h), m = c[p ? f === "floating" ? "reference" : "floating" : f], v = Gn(await s.getClippingRect({
    element: (n = await (s.isElement == null ? void 0 : s.isElement(m))) == null || n ? m : m.contextElement || await (s.getDocumentElement == null ? void 0 : s.getDocumentElement(c.floating)),
    boundary: l,
    rootBoundary: u,
    strategy: a
  })), C = f === "floating" ? {
    x: r,
    y: o,
    width: i.floating.width,
    height: i.floating.height
  } : i.reference, w = await (s.getOffsetParent == null ? void 0 : s.getOffsetParent(c.floating)), E = await (s.isElement == null ? void 0 : s.isElement(w)) && await (s.getScale == null ? void 0 : s.getScale(w)) || {
    x: 1,
    y: 1
  }, T = Gn(s.convertOffsetParentRelativeRectToViewportRelativeRect ? await s.convertOffsetParentRelativeRectToViewportRelativeRect({
    elements: c,
    rect: C,
    offsetParent: w,
    strategy: a
  }) : C);
  return {
    top: (v.top - T.top + d.top) / E.y,
    bottom: (T.bottom - v.bottom + d.bottom) / E.y,
    left: (v.left - T.left + d.left) / E.x,
    right: (T.right - v.right + d.right) / E.x
  };
}
const Dp = 50, Fp = async (e, t, n) => {
  const {
    placement: r = "bottom",
    strategy: o = "absolute",
    middleware: s = [],
    platform: i
  } = n, c = i.detectOverflow ? i : {
    ...i,
    detectOverflow: Mp
  }, a = await (i.isRTL == null ? void 0 : i.isRTL(t));
  let l = await i.getElementRects({
    reference: e,
    floating: t,
    strategy: o
  }), {
    x: u,
    y: f
  } = Ds(l, r, a), p = r, h = 0;
  const d = {};
  for (let g = 0; g < s.length; g++) {
    const m = s[g];
    if (!m)
      continue;
    const {
      name: v,
      fn: C
    } = m, {
      x: w,
      y: E,
      data: T,
      reset: S
    } = await C({
      x: u,
      y: f,
      initialPlacement: r,
      placement: p,
      strategy: o,
      middlewareData: d,
      rects: l,
      platform: c,
      elements: {
        reference: e,
        floating: t
      }
    });
    u = w ?? u, f = E ?? f, d[v] = {
      ...d[v],
      ...T
    }, S && h < Dp && (h++, typeof S == "object" && (S.placement && (p = S.placement), S.rects && (l = S.rects === !0 ? await i.getElementRects({
      reference: e,
      floating: t,
      strategy: o
    }) : S.rects), {
      x: u,
      y: f
    } = Ds(l, p, a)), g = -1);
  }
  return {
    x: u,
    y: f,
    placement: p,
    strategy: o,
    middlewareData: d
  };
}, Lp = function(e) {
  return e === void 0 && (e = {}), {
    name: "flip",
    options: e,
    async fn(t) {
      var n, r;
      const {
        placement: o,
        middlewareData: s,
        rects: i,
        initialPlacement: c,
        platform: a,
        elements: l
      } = t, {
        mainAxis: u = !0,
        crossAxis: f = !0,
        fallbackPlacements: p,
        fallbackStrategy: h = "bestFit",
        fallbackAxisSideDirection: d = "none",
        flipAlignment: g = !0,
        ...m
      } = mt(e, t);
      if ((n = s.arrow) != null && n.alignmentOffset)
        return {};
      const v = We(o), C = Ke(c), w = We(c) === c, E = await (a.isRTL == null ? void 0 : a.isRTL(l.floating)), T = p || (w || !g ? [jn(c)] : ud(c)), S = d !== "none";
      !p && S && T.push(...hd(c, g, d, E));
      const R = [c, ...T], P = await a.detectOverflow(t, m), O = [];
      let M = ((r = s.flip) == null ? void 0 : r.overflows) || [];
      if (u && O.push(P[v]), f) {
        const I = ld(o, i, E);
        O.push(P[I[0]], P[I[1]]);
      }
      if (M = [...M, {
        placement: o,
        overflows: O
      }], !O.every((I) => I <= 0)) {
        var F, A;
        const I = (((F = s.flip) == null ? void 0 : F.index) || 0) + 1, x = R[I];
        if (x && (!(f === "alignment" ? C !== Ke(x) : !1) || // We leave the current main axis only if every placement on that axis
        // overflows the main axis.
        M.every((N) => Ke(N.placement) === C ? N.overflows[0] > 0 : !0)))
          return {
            data: {
              index: I,
              overflows: M
            },
            reset: {
              placement: x
            }
          };
        let _ = (A = M.filter((z) => z.overflows[0] <= 0).sort((z, N) => z.overflows[1] - N.overflows[1])[0]) == null ? void 0 : A.placement;
        if (!_)
          switch (h) {
            case "bestFit": {
              var D;
              const z = (D = M.filter((N) => {
                if (S) {
                  const k = Ke(N.placement);
                  return k === C || // Create a bias to the `y` side axis due to horizontal
                  // reading directions favoring greater width.
                  k === "y";
                }
                return !0;
              }).map((N) => [N.placement, N.overflows.filter((k) => k > 0).reduce((k, Y) => k + Y, 0)]).sort((N, k) => N[1] - k[1])[0]) == null ? void 0 : D[0];
              z && (_ = z);
              break;
            }
            case "initialPlacement":
              _ = c;
              break;
          }
        if (o !== _)
          return {
            reset: {
              placement: _
            }
          };
      }
      return {};
    }
  };
}, Ec = /* @__PURE__ */ new Set(["left", "top"]);
async function Bp(e, t) {
  const {
    placement: n,
    platform: r,
    elements: o
  } = e, s = await (r.isRTL == null ? void 0 : r.isRTL(o.floating)), i = We(n), c = nt(n), a = Ke(n) === "y", l = Ec.has(i) ? -1 : 1, u = s && a ? -1 : 1, f = mt(t, e);
  let {
    mainAxis: p,
    crossAxis: h,
    alignmentAxis: d
  } = typeof f == "number" ? {
    mainAxis: f,
    crossAxis: 0,
    alignmentAxis: null
  } : {
    mainAxis: f.mainAxis || 0,
    crossAxis: f.crossAxis || 0,
    alignmentAxis: f.alignmentAxis
  };
  return c && typeof d == "number" && (h = c === "end" ? d * -1 : d), a ? {
    x: h * u,
    y: p * l
  } : {
    x: p * l,
    y: h * u
  };
}
const Vp = function(e) {
  return e === void 0 && (e = 0), {
    name: "offset",
    options: e,
    async fn(t) {
      var n, r;
      const {
        x: o,
        y: s,
        placement: i,
        middlewareData: c
      } = t, a = await Bp(t, e);
      return i === ((n = c.offset) == null ? void 0 : n.placement) && (r = c.arrow) != null && r.alignmentOffset ? {} : {
        x: o + a.x,
        y: s + a.y,
        data: {
          ...a,
          placement: i
        }
      };
    }
  };
}, $p = function(e) {
  return e === void 0 && (e = {}), {
    name: "shift",
    options: e,
    async fn(t) {
      const {
        x: n,
        y: r,
        placement: o,
        platform: s
      } = t, {
        mainAxis: i = !0,
        crossAxis: c = !1,
        limiter: a = {
          fn: (C) => {
            let {
              x: w,
              y: E
            } = C;
            return {
              x: w,
              y: E
            };
          }
        },
        ...l
      } = mt(e, t), u = {
        x: n,
        y: r
      }, f = await s.detectOverflow(t, l), p = Ke(o), h = Oo(p);
      let d = u[h], g = u[p];
      const m = (C, w) => rc(w + f[C === "y" ? "top" : "left"], w, w - f[C === "y" ? "bottom" : "right"]);
      i && (d = m(h, d)), c && (g = m(p, g));
      const v = a.fn({
        ...t,
        [h]: d,
        [p]: g
      });
      return {
        ...v,
        data: {
          x: v.x - n,
          y: v.y - r,
          enabled: {
            [h]: i,
            [p]: c
          }
        }
      };
    }
  };
}, Hp = function(e) {
  return e === void 0 && (e = {}), {
    options: e,
    fn(t) {
      var n, r;
      const {
        x: o,
        y: s,
        placement: i,
        rects: c,
        middlewareData: a
      } = t, {
        offset: l = 0,
        mainAxis: u = !0,
        crossAxis: f = !0
      } = mt(e, t), p = {
        x: o,
        y: s
      }, h = Ke(i), d = Oo(h);
      let g = p[d], m = p[h];
      const v = mt(l, t), C = typeof v == "number" ? {
        mainAxis: v,
        crossAxis: 0
      } : {
        mainAxis: (n = v.mainAxis) != null ? n : 0,
        crossAxis: (r = v.crossAxis) != null ? r : 0
      };
      if (u) {
        const T = d === "y" ? "height" : "width", S = c.reference[d] - c.floating[T] + C.mainAxis, R = c.reference[d] + c.reference[T] - C.mainAxis;
        g < S ? g = S : g > R && (g = R);
      }
      if (f) {
        var w, E;
        const T = d === "y" ? "width" : "height", S = Ec.has(We(i)), R = c.reference[h] - c.floating[T] + (S && ((w = a.offset) == null ? void 0 : w[h]) || 0) + (S ? 0 : C.crossAxis), P = c.reference[h] + c.reference[T] + (S ? 0 : ((E = a.offset) == null ? void 0 : E[h]) || 0) - (S ? C.crossAxis : 0);
        m < R ? m = R : m > P && (m = P);
      }
      return {
        [d]: g,
        [h]: m
      };
    }
  };
}, Up = function(e) {
  return e === void 0 && (e = {}), {
    name: "size",
    options: e,
    async fn(t) {
      const {
        placement: n,
        rects: r,
        platform: o,
        elements: s
      } = t, {
        apply: i = () => {
        },
        ...c
      } = mt(e, t), a = await o.detectOverflow(t, c), l = We(n), u = nt(n), f = Ke(n) === "y", {
        width: p,
        height: h
      } = r.floating;
      let d, g;
      l === "top" || l === "bottom" ? (d = l, g = u === (await (o.isRTL == null ? void 0 : o.isRTL(s.floating)) ? "start" : "end") ? "left" : "right") : (g = l, d = u === "end" ? "top" : "bottom");
      const m = h - a.top - a.bottom, v = p - a.left - a.right, C = Ht(h - a[d], m), w = Ht(p - a[g], v), E = t.middlewareData.shift, T = !E;
      let S = C, R = w;
      E != null && E.enabled.x && (R = v), E != null && E.enabled.y && (S = m), T && !u && (f ? R = p - 2 * ct(a.left, a.right) : S = h - 2 * ct(a.top, a.bottom)), await i({
        ...t,
        availableWidth: R,
        availableHeight: S
      });
      const P = await o.getDimensions(s.floating);
      return p !== P.width || h !== P.height ? {
        reset: {
          rects: !0
        }
      } : {};
    }
  };
};
function wc(e) {
  const t = je(e);
  let n = parseFloat(t.width) || 0, r = parseFloat(t.height) || 0;
  const o = ke(e), s = o ? e.offsetWidth : n, i = o ? e.offsetHeight : r, c = qn(n) !== s || qn(r) !== i;
  return c && (n = s, r = i), {
    width: n,
    height: r,
    $: c
  };
}
function Vo(e) {
  return me(e) ? e : e.contextElement;
}
function Ft(e) {
  const t = Vo(e);
  if (!ke(t))
    return at(1);
  const n = t.getBoundingClientRect(), {
    width: r,
    height: o,
    $: s
  } = wc(t);
  let i = (s ? qn(n.width) : n.width) / r, c = (s ? qn(n.height) : n.height) / o;
  return (!i || !Number.isFinite(i)) && (i = 1), (!c || !Number.isFinite(c)) && (c = 1), {
    x: i,
    y: c
  };
}
const zp = /* @__PURE__ */ at(0);
function Sc(e) {
  const t = _e(e);
  return !bo() || !t.visualViewport ? zp : {
    x: t.visualViewport.offsetLeft,
    y: t.visualViewport.offsetTop
  };
}
function Wp(e, t, n) {
  return t === void 0 && (t = !1), !!n && t && n === _e(e);
}
function xt(e, t, n, r) {
  t === void 0 && (t = !1), n === void 0 && (n = !1);
  const o = e.getBoundingClientRect(), s = Vo(e);
  let i = at(1);
  t && (r ? me(r) && (i = Ft(r)) : i = Ft(e));
  const c = Wp(s, n, r) ? Sc(s) : at(0);
  let a = (o.left + c.x) / i.x, l = (o.top + c.y) / i.y, u = o.width / i.x, f = o.height / i.y;
  if (s && r) {
    const p = _e(s), h = me(r) ? _e(r) : r;
    let d = p, g = Lr(d);
    for (; g && h !== d; ) {
      const m = Ft(g), v = g.getBoundingClientRect(), C = je(g), w = v.left + (g.clientLeft + parseFloat(C.paddingLeft)) * m.x, E = v.top + (g.clientTop + parseFloat(C.paddingTop)) * m.y;
      a *= m.x, l *= m.y, u *= m.x, f *= m.y, a += w, l += E, d = _e(g), g = Lr(d);
    }
  }
  return Gn({
    width: u,
    height: f,
    x: a,
    y: l
  });
}
function ur(e, t) {
  const n = ir(e).scrollLeft;
  return t ? t.left + n : xt(lt(e)).left + n;
}
function Tc(e, t) {
  const n = e.getBoundingClientRect(), r = n.left + t.scrollLeft - ur(e, n), o = n.top + t.scrollTop;
  return {
    x: r,
    y: o
  };
}
function qp(e) {
  let {
    elements: t,
    rect: n,
    offsetParent: r,
    strategy: o
  } = e;
  const s = o === "fixed", i = lt(r), c = t ? sr(t.floating) : !1;
  if (r === i || c && s)
    return n;
  let a = {
    scrollLeft: 0,
    scrollTop: 0
  }, l = at(1);
  const u = at(0), f = ke(r);
  if ((f || !s) && ((He(r) !== "body" || or(i)) && (a = ir(r)), f)) {
    const h = xt(r);
    l = Ft(r), u.x = h.x + r.clientLeft, u.y = h.y + r.clientTop;
  }
  const p = i && !f && !s ? Tc(i, a) : at(0);
  return {
    width: n.width * l.x,
    height: n.height * l.y,
    x: n.x * l.x - a.scrollLeft * l.x + u.x + p.x,
    y: n.y * l.y - a.scrollTop * l.y + u.y + p.y
  };
}
function jp(e) {
  return e.getClientRects ? Array.from(e.getClientRects()) : [];
}
function Gp(e) {
  const t = ir(e), n = e.ownerDocument.body, r = ct(e.scrollWidth, e.clientWidth, n.scrollWidth, n.clientWidth), o = ct(e.scrollHeight, e.clientHeight, n.scrollHeight, n.clientHeight);
  let s = -t.scrollLeft + ur(e);
  const i = -t.scrollTop;
  return je(n).direction === "rtl" && (s += ct(e.clientWidth, n.clientWidth) - r), {
    width: r,
    height: o,
    x: s,
    y: i
  };
}
const Kp = 25;
function Yp(e, t, n) {
  n === void 0 && (n = "viewport");
  const r = n === "layoutViewport", o = _e(e), s = lt(e), i = o.visualViewport;
  let c = s.clientWidth, a = s.clientHeight, l = 0, u = 0;
  if (i) {
    const p = !bo() || t === "fixed";
    r ? p || (l = -i.offsetLeft, u = -i.offsetTop) : (c = i.width, a = i.height, p && (l = i.offsetLeft, u = i.offsetTop));
  }
  if (ur(s) <= 0) {
    const p = s.ownerDocument, h = p.body, d = getComputedStyle(h), g = p.compatMode === "CSS1Compat" && parseFloat(d.marginLeft) + parseFloat(d.marginRight) || 0, m = Math.abs(s.clientWidth - h.clientWidth - g), v = getComputedStyle(s).scrollbarGutter === "stable both-edges" ? m / 2 : m;
    v <= Kp && (c -= v);
  }
  return {
    width: c,
    height: a,
    x: l,
    y: u
  };
}
function Xp(e, t) {
  const n = xt(e, !0, t === "fixed"), r = n.top + e.clientTop, o = n.left + e.clientLeft, s = Ft(e), i = e.clientWidth * s.x, c = e.clientHeight * s.y, a = o * s.x, l = r * s.y;
  return {
    width: i,
    height: c,
    x: a,
    y: l
  };
}
function Fs(e, t, n) {
  let r;
  if (t === "viewport" || t === "layoutViewport")
    r = Yp(e, n, t);
  else if (t === "document")
    r = Gp(lt(e));
  else if (me(t))
    r = Xp(t, n);
  else {
    const o = Sc(e);
    r = {
      x: t.x - o.x,
      y: t.y - o.y,
      width: t.width,
      height: t.height
    };
  }
  return Gn(r);
}
function Jp(e, t) {
  const n = t.get(e);
  if (n)
    return n;
  let r = nn(e, [], !1).filter((c) => me(c) && He(c) !== "body"), o = null;
  const s = je(e).position === "fixed";
  let i = s ? ht(e) : e;
  for (; me(i) && !dt(i); ) {
    const c = je(i), a = mo(i), l = o ? o.position : s ? "fixed" : "";
    !a && (l === "fixed" || l === "absolute" && c.position === "static") ? r = r.filter((f) => f !== i) : o = c, i = ht(i);
  }
  return t.set(e, r), r;
}
function Zp(e) {
  let {
    element: t,
    boundary: n,
    rootBoundary: r,
    strategy: o
  } = e;
  const i = [...n === "clippingAncestors" ? sr(t) ? [] : Jp(t, this._c) : [].concat(n), r], c = Fs(t, i[0], o);
  let a = c.top, l = c.right, u = c.bottom, f = c.left;
  for (let p = 1; p < i.length; p++) {
    const h = Fs(t, i[p], o);
    a = ct(h.top, a), l = Ht(h.right, l), u = Ht(h.bottom, u), f = ct(h.left, f);
  }
  return {
    width: l - f,
    height: u - a,
    x: f,
    y: a
  };
}
function Qp(e) {
  const {
    width: t,
    height: n
  } = wc(e);
  return {
    width: t,
    height: n
  };
}
function eh(e, t, n) {
  const r = ke(t), o = lt(t), s = n === "fixed", i = xt(e, !0, s, t);
  let c = {
    scrollLeft: 0,
    scrollTop: 0
  };
  const a = at(0);
  if ((r || !s) && ((He(t) !== "body" || or(o)) && (c = ir(t)), r)) {
    const p = xt(t, !0, s, t);
    a.x = p.x + t.clientLeft, a.y = p.y + t.clientTop;
  }
  !r && o && (a.x = ur(o));
  const l = o && !r && !s ? Tc(o, c) : at(0), u = i.left + c.scrollLeft - a.x - l.x, f = i.top + c.scrollTop - a.y - l.y;
  return {
    x: u,
    y: f,
    width: i.width,
    height: i.height
  };
}
function Or(e) {
  return je(e).position === "static";
}
function Ls(e, t) {
  if (!ke(e) || je(e).position === "fixed")
    return null;
  if (t)
    return t(e);
  let n = e.offsetParent;
  return lt(e) === n && (n = n.ownerDocument.body), n;
}
function Rc(e, t) {
  const n = _e(e);
  if (sr(e))
    return n;
  if (!ke(e)) {
    let o = ht(e);
    for (; o && !dt(o); ) {
      if (me(o) && !Or(o))
        return o;
      o = ht(o);
    }
    return n;
  }
  let r = Ls(e, t);
  for (; r && Pl(r) && Or(r); )
    r = Ls(r, t);
  return r && dt(r) && Or(r) && !mo(r) ? n : r || _l(e) || n;
}
const th = async function(e) {
  const t = this.getOffsetParent || Rc, n = this.getDimensions, r = await n(e.floating);
  return {
    reference: eh(e.reference, await t(e.floating), e.strategy),
    floating: {
      x: 0,
      y: 0,
      width: r.width,
      height: r.height
    }
  };
};
function nh(e) {
  return je(e).direction === "rtl";
}
const rh = {
  convertOffsetParentRelativeRectToViewportRelativeRect: qp,
  getDocumentElement: lt,
  getClippingRect: Zp,
  getOffsetParent: Rc,
  getElementRects: th,
  getClientRects: jp,
  getDimensions: Qp,
  getScale: Ft,
  isElement: me,
  isRTL: nh
};
function xc(e, t) {
  return e.x === t.x && e.y === t.y && e.width === t.width && e.height === t.height;
}
function oh(e, t, n) {
  let r = null, o;
  const s = lt(e);
  function i() {
    var u;
    clearTimeout(o), (u = r) == null || u.disconnect(), r = null;
  }
  function c(u, f) {
    u === void 0 && (u = !1), f === void 0 && (f = 1), i();
    const p = e.getBoundingClientRect(), {
      left: h,
      top: d,
      width: g,
      height: m
    } = p;
    if (u || t(), !g || !m)
      return;
    const v = Pn(d), C = Pn(s.clientWidth - (h + g)), w = Pn(s.clientHeight - (d + m)), E = Pn(h), S = {
      rootMargin: -v + "px " + -C + "px " + -w + "px " + -E + "px",
      threshold: ct(0, Ht(1, f)) || 1
    };
    let R = !0;
    function P(O) {
      const M = O[0].intersectionRatio;
      if (!xc(p, e.getBoundingClientRect()))
        return c();
      if (M !== f) {
        if (!R)
          return c();
        M ? c(!1, M) : o = setTimeout(() => {
          c(!1, 1e-7);
        }, 1e3);
      }
      R = !1;
    }
    try {
      r = new IntersectionObserver(P, {
        ...S,
        // Handle <iframe>s
        root: s.ownerDocument
      });
    } catch {
      r = new IntersectionObserver(P, S);
    }
    r.observe(e);
  }
  const a = _e(e), l = () => c(n);
  return a.addEventListener("resize", l), c(!0), () => {
    a.removeEventListener("resize", l), i();
  };
}
function Bs(e, t, n, r) {
  r === void 0 && (r = {});
  const {
    ancestorScroll: o = !0,
    ancestorResize: s = !0,
    elementResize: i = typeof ResizeObserver == "function",
    layoutShift: c = typeof IntersectionObserver == "function",
    animationFrame: a = !1
  } = r, l = Vo(e), u = o || s ? [...l ? nn(l) : [], ...t ? nn(t) : []] : [];
  u.forEach((v) => {
    o && v.addEventListener("scroll", n), s && v.addEventListener("resize", n);
  });
  const f = l && c ? oh(l, n, s) : null;
  let p = -1, h = null;
  i && (h = new ResizeObserver((v) => {
    let [C] = v;
    C && C.target === l && h && t && (h.unobserve(t), cancelAnimationFrame(p), p = requestAnimationFrame(() => {
      var w;
      (w = h) == null || w.observe(t);
    })), n();
  }), l && !a && h.observe(l), t && h.observe(t));
  let d, g = a ? xt(e) : null;
  a && m();
  function m() {
    const v = xt(e);
    g && !xc(g, v) && n(), g = v, d = requestAnimationFrame(m);
  }
  return n(), () => {
    var v;
    u.forEach((C) => {
      o && C.removeEventListener("scroll", n), s && C.removeEventListener("resize", n);
    }), f == null || f(), (v = h) == null || v.disconnect(), h = null, a && cancelAnimationFrame(d);
  };
}
const sh = Vp, ih = $p, ch = Lp, ah = Up, lh = Hp, uh = (e, t, n) => {
  const r = /* @__PURE__ */ new Map(), o = n ?? {}, s = {
    ...rh,
    ...o.platform,
    _c: r
  };
  return Fp(e, t, {
    ...o,
    platform: s
  });
};
var fh = typeof document < "u", dh = function() {
}, Ln = fh ? ea : dh;
function Zn(e, t) {
  if (e === t)
    return !0;
  if (typeof e != typeof t)
    return !1;
  if (typeof e == "function" && e.toString() === t.toString())
    return !0;
  let n, r, o;
  if (e && t && typeof e == "object") {
    if (Array.isArray(e)) {
      if (n = e.length, n !== t.length) return !1;
      for (r = n; r-- !== 0; )
        if (!Zn(e[r], t[r]))
          return !1;
      return !0;
    }
    if (o = Object.keys(e), n = o.length, n !== Object.keys(t).length)
      return !1;
    for (r = n; r-- !== 0; )
      if (!{}.hasOwnProperty.call(t, o[r]))
        return !1;
    for (r = n; r-- !== 0; ) {
      const s = o[r];
      if (!(s === "_owner" && e.$$typeof) && !Zn(e[s], t[s]))
        return !1;
    }
    return !0;
  }
  return e !== e && t !== t;
}
function Pc(e) {
  return typeof window > "u" ? 1 : (e.ownerDocument.defaultView || window).devicePixelRatio || 1;
}
function Vs(e, t) {
  const n = Pc(e);
  return Math.round(t * n) / n;
}
function Ir(e) {
  const t = y.useRef(e);
  return Ln(() => {
    t.current = e;
  }), t;
}
function ph(e) {
  e === void 0 && (e = {});
  const {
    placement: t = "bottom",
    strategy: n = "absolute",
    middleware: r = [],
    platform: o,
    elements: {
      reference: s,
      floating: i
    } = {},
    transform: c = !0,
    whileElementsMounted: a,
    open: l
  } = e, [u, f] = y.useState({
    x: 0,
    y: 0,
    strategy: n,
    placement: t,
    middlewareData: {},
    isPositioned: !1
  }), [p, h] = y.useState(r);
  Zn(p, r) || h(r);
  const [d, g] = y.useState(null), [m, v] = y.useState(null), C = y.useCallback((N) => {
    N !== S.current && (S.current = N, g(N));
  }, []), w = y.useCallback((N) => {
    N !== R.current && (R.current = N, v(N));
  }, []), E = s || d, T = i || m, S = y.useRef(null), R = y.useRef(null), P = y.useRef(u), O = a != null, M = Ir(a), F = Ir(o), A = Ir(l), D = y.useCallback(() => {
    if (!S.current || !R.current)
      return;
    const N = {
      placement: t,
      strategy: n,
      middleware: p
    };
    F.current && (N.platform = F.current), uh(S.current, R.current, N).then((k) => {
      const Y = {
        ...k,
        // The floating element's position may be recomputed while it's closed
        // but still mounted (such as when transitioning out). To ensure
        // `isPositioned` will be `false` initially on the next open, avoid
        // setting it to `true` when `open === false` (must be specified).
        isPositioned: A.current !== !1
      };
      I.current && !Zn(P.current, Y) && (P.current = Y, bt.flushSync(() => {
        f(Y);
      }));
    });
  }, [p, t, n, F, A]);
  Ln(() => {
    l === !1 && P.current.isPositioned && (P.current.isPositioned = !1, f((N) => ({
      ...N,
      isPositioned: !1
    })));
  }, [l]);
  const I = y.useRef(!1);
  Ln(() => (I.current = !0, () => {
    I.current = !1;
  }), []), Ln(() => {
    if (E && (S.current = E), T && (R.current = T), E && T) {
      if (M.current)
        return M.current(E, T, D);
      D();
    }
  }, [E, T, D, M, O]);
  const x = y.useMemo(() => ({
    reference: S,
    floating: R,
    setReference: C,
    setFloating: w
  }), [C, w]), _ = y.useMemo(() => ({
    reference: E,
    floating: T
  }), [E, T]), z = y.useMemo(() => {
    const N = {
      position: n,
      left: 0,
      top: 0
    };
    if (!_.floating)
      return N;
    const k = Vs(_.floating, u.x), Y = Vs(_.floating, u.y);
    return c ? {
      ...N,
      transform: "translate(" + k + "px, " + Y + "px)",
      ...Pc(_.floating) >= 1.5 && {
        willChange: "transform"
      }
    } : {
      position: n,
      left: k,
      top: Y
    };
  }, [n, c, _.floating, u.x, u.y]);
  return y.useMemo(() => ({
    ...u,
    update: D,
    refs: x,
    elements: _,
    floatingStyles: z
  }), [u, D, x, _, z]);
}
const hh = (e, t) => {
  const n = sh(e);
  return {
    name: n.name,
    fn: n.fn,
    options: [e, t]
  };
}, gh = (e, t) => {
  const n = ih(e);
  return {
    name: n.name,
    fn: n.fn,
    options: [e, t]
  };
}, mh = (e, t) => ({
  fn: lh(e).fn,
  options: [e, t]
}), bh = (e, t) => {
  const n = ch(e);
  return {
    name: n.name,
    fn: n.fn,
    options: [e, t]
  };
}, vh = (e, t) => {
  const n = ah(e);
  return {
    name: n.name,
    fn: n.fn,
    options: [e, t]
  };
}, $o = /* @__PURE__ */ y.createContext(void 0);
process.env.NODE_ENV !== "production" && ($o.displayName = "PreviewCardRootContext");
function gn(e) {
  const t = y.useContext($o);
  if (t === void 0 && !e)
    throw new Error(process.env.NODE_ENV !== "production" ? "Base UI: PreviewCardRootContext is missing. PreviewCard parts must be placed within <PreviewCard.Root>." : Pt(50));
  return t;
}
class yh extends Lo {
  // `update`/`set`/`notifyAll` funnel through `setState` in the base `Store`, so overriding
  // `setState` alone would neutralize them today. They are overridden explicitly so the store stays
  // inert even if a future base-class change stops routing a mutator through `setState`.
  setState(t) {
  }
  update(t) {
  }
  set(t, n) {
  }
  notifyAll() {
  }
}
const Ch = 600, Oc = 300, Ic = {
  ...Rp,
  instantType: (e) => e.instantType,
  adaptiveOrigin: (e) => e.adaptiveOrigin,
  closeDelay: (e) => e.closeDelay
};
class Eh extends Lo {
  constructor(n, r, o) {
    const s = new mc();
    super(_c(n, s, r, o), Ac(s), Ic);
    ae(this, "setOpen", (n, r) => {
      const {
        inlineRectCoordsRef: o
      } = this.context;
      rp(this, n, r, {
        onBeforeDispatch() {
          var i;
          const s = r.event;
          n && r.reason === Xe && r.trigger && "clientX" in s && "clientY" in s && ((i = o.current) == null ? void 0 : i.element) !== r.trigger && gc(o, r.trigger, s.clientX, s.clientY);
        }
      });
    });
  }
}
function wh() {
  const e = new mc();
  return new yh(Object.freeze(_c(void 0, e)), Object.freeze(Ac(e)), Ic);
}
function _c(e, t, n, r = !1) {
  return {
    ...Sp(t, n, r),
    instantType: void 0,
    adaptiveOrigin: void 0,
    closeDelay: Oc,
    ...e
  };
}
function Ac(e) {
  return {
    popupRef: /* @__PURE__ */ y.createRef(),
    onOpenChange: void 0,
    onOpenChangeComplete: void 0,
    triggerElements: e,
    inlineRectCoordsRef: {
      current: void 0
    }
  };
}
function $s(e) {
  const {
    open: t,
    defaultOpen: n = !1,
    onOpenChange: r,
    onOpenChangeComplete: o,
    actionsRef: s,
    handle: i,
    triggerId: c,
    defaultTriggerId: a = null,
    children: l
  } = e, u = Zd((v, C) => new Eh({
    open: n,
    openProp: t,
    activeTriggerId: a,
    triggerIdProp: c
  }, v, C));
  u.useControlledProp("openProp", t), u.useControlledProp("triggerIdProp", c), u.useContextCallback("onOpenChange", r), u.useContextCallback("onOpenChangeComplete", o);
  const f = u.useState("open"), p = u.useState("activeTriggerId"), h = u.useState("mounted"), d = u.useState("payload");
  sp(u, {
    closeOnActiveTriggerUnmount: !0
  });
  const {
    forceUnmount: g
  } = ip(f, u, () => {
    u.context.inlineRectCoordsRef.current = void 0;
  });
  pe(() => {
    f && p == null && u.set("payload", void 0);
  }, [u, p, f]), y.useImperativeHandle(s, () => ({
    unmount: g,
    close: () => u.setOpen(!1, Oe(Fr))
  }), [g, u]);
  const m = f || h || i != null;
  return /* @__PURE__ */ U($o.Provider, {
    value: u,
    children: [i && /* @__PURE__ */ b(Qd, {
      handle: i,
      store: u
    }), m && /* @__PURE__ */ b(Sh, {
      store: u
    }), typeof l == "function" ? l({
      payload: d
    }) : l]
  });
}
function Sh({
  store: e
}) {
  const t = e.useState("floatingRootContext"), n = Hd(t);
  return cp(e, {
    activeTriggerProps: n.reference,
    inactiveTriggerProps: n.trigger,
    popupProps: n.floating
  }), null;
}
const kc = Ji(function(t) {
  return gn(!0) ? /* @__PURE__ */ b($s, {
    ...t
  }) : /* @__PURE__ */ b(Bd, {
    children: /* @__PURE__ */ b($s, {
      ...t
    })
  });
});
process.env.NODE_ENV !== "production" && (kc.displayName = "PreviewCardRoot");
const Ho = /* @__PURE__ */ y.createContext(void 0);
process.env.NODE_ENV !== "production" && (Ho.displayName = "PreviewCardPortalContext");
function Th() {
  const e = y.useContext(Ho);
  if (e === void 0)
    throw new Error(process.env.NODE_ENV !== "production" ? "Base UI: <PreviewCard.Portal> is missing." : Pt(48));
  return e;
}
const Nc = /* @__PURE__ */ y.forwardRef(function(t, n) {
  const {
    children: r,
    container: o,
    className: s,
    render: i,
    style: c,
    ...a
  } = t, {
    node: l,
    subtree: u
  } = fc({
    container: o,
    ref: n,
    componentProps: t,
    elementProps: a
  });
  return !u && !l ? null : /* @__PURE__ */ U(y.Fragment, {
    children: [u, l && /* @__PURE__ */ bt.createPortal(r, l)]
  });
});
process.env.NODE_ENV !== "production" && (Nc.displayName = "FloatingPortalLite");
const Mc = /* @__PURE__ */ y.forwardRef(function(t, n) {
  const {
    keepMounted: r = !1,
    ...o
  } = t;
  return gn().useState("mounted") || r ? /* @__PURE__ */ b(Ho.Provider, {
    value: r,
    children: /* @__PURE__ */ b(Nc, {
      ref: n,
      ...o
    })
  }) : null;
});
process.env.NODE_ENV !== "production" && (Mc.displayName = "PreviewCardPortal");
const Dc = _f(function(t, n) {
  const {
    render: r,
    className: o,
    delay: s,
    closeDelay: i,
    id: c,
    payload: a,
    handle: l,
    style: u,
    ...f
  } = t, p = gn(!0), d = xp(l) ?? p;
  if (!d)
    throw new Error(process.env.NODE_ENV !== "production" ? "Base UI: <PreviewCard.Trigger> must be either used within a <PreviewCard.Root> component or provided with a handle." : Pt(89));
  const g = Si(c), m = d.useState("isTriggerActive", g), v = d.useState("isOpenedByTrigger", g), C = d.useState("floatingRootContext"), w = d.context.inlineRectCoordsRef, E = y.useRef(null), T = s ?? Ch, S = i ?? Oc, {
    registerTrigger: R,
    isMountedByThisTrigger: P
  } = op(g, E, d, {
    payload: a,
    closeDelay: S
  }), O = _p(C, {
    mouseOnly: !0,
    move: !1,
    handleClose: Np(),
    delay: () => ({
      open: T,
      close: S
    }),
    triggerElementRef: E,
    isActiveTrigger: m,
    isClosing: () => d.select("transitionStatus") === "ending"
  }), M = Pp(C, {
    delay: T
  }), F = {
    open: v
  }, A = d.useState("triggerProps", P), D = jd(w, v);
  return vt("a", t, {
    state: F,
    ref: [n, R, E],
    props: [O, M.reference, A, D, {
      id: g
    }, f],
    stateAttributesMapping: Zf
  });
});
process.env.NODE_ENV !== "production" && (Dc.displayName = "PreviewCardTrigger");
const Uo = /* @__PURE__ */ y.createContext(void 0);
process.env.NODE_ENV !== "production" && (Uo.displayName = "PreviewCardPositionerContext");
function Rh() {
  const e = y.useContext(Uo);
  if (e === void 0)
    throw new Error(process.env.NODE_ENV !== "production" ? "Base UI: PreviewCardPositionerContext is missing. PreviewCardPositioner parts must be placed within <PreviewCard.Positioner>." : Pt(49));
  return e;
}
function xh(e) {
  const {
    nodeId: t,
    externalTree: n,
    rootContext: r
  } = e, o = r.useState("referenceElement"), s = r.useState("floatingElement"), i = r.useState("domReferenceElement"), c = r.useState("open"), a = r.useState("floatingId"), [l, u] = y.useState(null), f = y.useRef(null), p = hn(n), h = y.useMemo(() => ({
    reference: o,
    floating: s,
    domReference: i
  }), [o, s, i]), d = ph({
    ...e,
    elements: {
      ...h,
      ...l && {
        reference: l
      }
    }
  }), g = y.useCallback((w) => {
    const E = me(w) ? {
      getBoundingClientRect: () => w.getBoundingClientRect(),
      getClientRects: () => w.getClientRects(),
      contextElement: w
    } : w;
    u(E), d.refs.setReference(E);
  }, [d.refs]), m = y.useMemo(() => ({
    ...d.refs,
    setPositionReference: g,
    domReference: f
  }), [d.refs, g]), v = y.useMemo(() => ({
    ...d.elements,
    domReference: i
  }), [d.elements, i]), C = y.useMemo(() => ({
    ...d,
    dataRef: r.context.dataRef,
    open: c,
    onOpenChange: r.setOpen,
    events: r.context.events,
    floatingId: a,
    refs: m,
    elements: v,
    nodeId: t,
    rootStore: r
  }), [d, m, v, t, r, c, a]);
  return pe(() => {
    i && (f.current = i);
  }, [i]), pe(() => {
    r.context.dataRef.current.floatingContext = C;
    const w = p == null ? void 0 : p.nodesRef.current.find((E) => E.id === t);
    w && (w.context = C);
  }), y.useMemo(() => ({
    ...d,
    context: C,
    refs: m,
    elements: v,
    rootStore: r
  }), [d, m, v, C, r]);
}
const Fc = /* @__PURE__ */ y.createContext(void 0);
process.env.NODE_ENV !== "production" && (Fc.displayName = "DirectionContext");
function Ph() {
  const e = y.useContext(Fc);
  return (e == null ? void 0 : e.direction) ?? "ltr";
}
const Oh = (e) => ({
  name: "arrow",
  options: e,
  async fn(t) {
    const {
      x: n,
      y: r,
      placement: o,
      rects: s,
      platform: i,
      elements: c,
      middlewareData: a
    } = t, {
      element: l,
      padding: u = 0
    } = mt(e, t) || {};
    if (l == null)
      return {};
    const f = oc(u), p = {
      x: n,
      y: r
    }, h = _o(o), d = Io(h), g = await i.getDimensions(l), m = h === "y", v = m ? "top" : "left", C = m ? "bottom" : "right", w = m ? "clientHeight" : "clientWidth", E = s.reference[d] + s.reference[h] - p[h] - s.floating[d], T = p[h] - s.reference[h], S = c.floating[w] || s.floating[d], R = E / 2 - T / 2, P = S / 2 - g[d] / 2 - 1, O = Math.min(f[v], P), M = Math.min(f[C], P), F = O, A = S - g[d] - M, D = S / 2 - g[d] / 2 + R, I = rc(F, D, A), x = !a.arrow && nt(o) != null && D !== I && s.reference[d] / 2 - (D < F ? O : M) - g[d] / 2 < 0, _ = x ? D < F ? D - F : D - A : 0;
    return {
      [h]: p[h] + _,
      data: {
        [h]: I,
        centerOffset: D - I - _,
        ...x && {
          alignmentOffset: _
        }
      },
      reset: x
    };
  }
}), Ih = (e, t) => {
  const {
    name: n,
    fn: r
  } = Oh(e);
  return {
    name: n,
    fn: r,
    options: [e, t]
  };
}, _h = {
  name: "hide",
  async fn(e) {
    const {
      width: t,
      height: n,
      x: r,
      y: o
    } = e.rects.reference, s = t === 0 && n === 0 && r === 0 && o === 0, i = await e.platform.detectOverflow(e, {
      elementContext: "reference"
    });
    return {
      data: {
        referenceHidden: i.top - n >= 0 || i.right - t >= 0 || i.bottom - n >= 0 || i.left - t >= 0 || s
      }
    };
  }
}, Ah = {
  sideX: "left",
  sideY: "top"
}, kh = "--available-width", Nh = "--available-height", Mh = "--anchor-width", Dh = "--anchor-height", Fh = "--transform-origin", Hs = kh, Us = Nh;
function Lc(e, t, n) {
  const r = e === "inline-start" || e === "inline-end";
  return {
    top: "top",
    right: r ? n ? "inline-start" : "inline-end" : "right",
    bottom: "bottom",
    left: r ? n ? "inline-end" : "inline-start" : "left"
  }[t];
}
function zs(e, t, n) {
  const {
    rects: r,
    placement: o
  } = e;
  return {
    side: Lc(t, We(o), n),
    align: nt(o) || "center",
    anchor: {
      width: r.reference.width,
      height: r.reference.height
    },
    positioner: {
      width: r.floating.width,
      height: r.floating.height
    }
  };
}
function Lh(e) {
  return Bh(e, xh);
}
function Bh(e, t) {
  var Kt, bn;
  const {
    // Public parameters
    anchor: n,
    positionMethod: r = "absolute",
    side: o = "bottom",
    sideOffset: s = 0,
    align: i = "center",
    alignOffset: c = 0,
    collisionBoundary: a,
    collisionPadding: l = 5,
    sticky: u = !1,
    arrowPadding: f = 5,
    disableAnchorTracking: p = !1,
    inline: h,
    // Private parameters
    keepMounted: d = !1,
    floatingRootContext: g,
    mounted: m,
    collisionAvoidance: v,
    shift: C,
    nodeId: w,
    adaptiveOrigin: E,
    lazyFlip: T = !1,
    externalTree: S
  } = e, R = v.side || "flip", P = v.align || "flip", O = v.fallbackAxisSide || "end", M = (C == null ? void 0 : C.crossAxis) ?? !1, F = C == null ? void 0 : C.rootBoundary, A = typeof n == "function" ? n : void 0, D = fe(A), I = A ? D : n, x = Je(n), _ = Je(m), N = Ph() === "rtl", [k, Y] = y.useState(null);
  !m && k !== null && Y(null);
  const K = T === "placement", le = k ? We(k) : null, ie = k && K ? nt(k) || "center" : null, L = le || {
    top: "top",
    right: "right",
    bottom: "bottom",
    left: "left",
    "inline-end": N ? "left" : "right",
    "inline-start": N ? "right" : "left"
  }[o], X = ie || i, B = X === "center" ? L : `${L}-${X}`;
  let $ = l;
  typeof $ == "number" ? $ = {
    top: $,
    right: $,
    bottom: $,
    left: $
  } : $ && ($ = {
    top: $.top || 0,
    right: $.right || 0,
    bottom: $.bottom || 0,
    left: $.left || 0
  });
  const Q = 1, re = o === "bottom" ? Q : 0, ee = o === "top" ? Q : 0, te = o === "right" ? Q : 0, q = o === "left" ? Q : 0, ne = {
    boundary: a === "clipping-ancestors" ? "clippingAncestors" : a,
    padding: $
  }, oe = y.useRef(null), ve = Je(s), W = Je(c), J = typeof s != "function" ? s : 0, ce = typeof c != "function" ? c : 0, he = [];
  h && he.push(h), he.push(hh((de) => {
    const Me = zs(de, o, N), Ge = typeof ve.current == "function" ? ve.current(Me) : ve.current, Be = typeof W.current == "function" ? W.current(Me) : W.current;
    return {
      mainAxis: Ge,
      crossAxis: Be,
      alignmentAxis: Be
    };
  }, [J, ce, N, o]));
  const Ie = P === "none" && R !== "shift", Fe = !Ie && (u || M || R === "shift"), xe = R === "none" ? null : bh({
    ...ne,
    // Ensure the popup flips if it's been limited by its --available-height and it resizes.
    // Since the size() padding is smaller than the flip() padding, flip() will take precedence.
    padding: {
      top: $.top + Q + re,
      right: $.right + Q + q,
      bottom: $.bottom + Q + ee,
      left: $.left + Q + te
    },
    mainAxis: !M && R === "flip",
    crossAxis: P === "flip" ? "alignment" : !1,
    fallbackAxisSideDirection: O
  }), Le = Ie ? null : gh({
    ...ne,
    // Use the Layout Viewport to avoid shifting around when pinch-zooming.
    rootBoundary: F,
    mainAxis: P !== "none",
    crossAxis: Fe,
    limiter: u || M ? void 0 : mh((de) => {
      if (!oe.current)
        return {};
      const {
        width: Me,
        height: Ge
      } = oe.current.getBoundingClientRect(), Be = Ke(We(de.placement)), tt = Be === "y" ? Me : Ge, Ye = Be === "y" ? $.left + $.right : $.top + $.bottom;
      return {
        offset: tt / 2 + Ye / 2
      };
    })
  }, [ne, u, M, F, $, P]);
  R === "shift" || P === "shift" || X === "center" ? he.push(Le, xe) : he.push(xe, Le), he.push(vh({
    ...ne,
    apply({
      elements: {
        floating: de
      },
      availableWidth: Me,
      availableHeight: Ge,
      rects: Be
    }) {
      if (!_.current)
        return;
      const tt = de.style;
      tt.setProperty(Hs, `${Me}px`), tt.setProperty(Us, `${Ge}px`);
      const Ye = _e(de).devicePixelRatio || 1, {
        x: vn,
        y: _t,
        width: yn,
        height: ft
      } = Be.reference, st = (Math.round((vn + yn) * Ye) - Math.round(vn * Ye)) / Ye, Yt = (Math.round((_t + ft) * Ye) - Math.round(_t * Ye)) / Ye;
      tt.setProperty(Mh, `${st}px`), tt.setProperty(Dh, `${Yt}px`);
    }
  }), Ih((de) => ({
    // `transform-origin` calculations rely on an element existing. If the arrow hasn't been set,
    // we'll create a fake element.
    element: oe.current || Qe(de.elements.floating).createElement("div"),
    // No padding for the fake arrow: it would displace aligned popups on narrow anchors.
    padding: oe.current ? f : 0
  }), [f]), {
    name: "transformOrigin",
    fn(de) {
      var qo, jo, Go, Ko, Yo, Xo;
      const {
        elements: {
          floating: Me
        },
        middlewareData: Ge,
        placement: Be,
        platform: tt,
        rects: Ye,
        y: vn
      } = de, _t = We(Be), yn = nt(Be), ft = Ke(_t) === "y", st = oe.current, Yt = typeof s == "function" ? s(zs(de, o, N)) : s;
      let Cn;
      if (!st && yn && Math.abs(ft ? ((qo = Ge.shift) == null ? void 0 : qo.x) || 0 : ((jo = Ge.shift) == null ? void 0 : jo.y) || 0) <= 1)
        Cn = yn === "start" === (ft && ((Go = tt.isRTL) == null ? void 0 : Go.call(tt, Me)) === !0) ? "100%" : "0%";
      else {
        const Yc = ft ? ((Ko = Ge.arrow) == null ? void 0 : Ko.x) || 0 : ((Yo = Ge.arrow) == null ? void 0 : Yo.y) || 0, Xc = ft ? (st == null ? void 0 : st.clientWidth) || 0 : (st == null ? void 0 : st.clientHeight) || 0;
        Cn = `${Yc + Xc / 2}px`;
      }
      let fr = _t === "top" || _t === "left" ? `calc(100% + ${Yt}px)` : `${-Yt}px`;
      return Fe && ft && Math.abs(((Xo = Ge.shift) == null ? void 0 : Xo.y) || 0) > Yt && (fr = `${Ye.reference.y + Ye.reference.height / 2 - vn}px`), Me.style.setProperty(Fh, ft ? `${Cn} ${fr}` : `${fr} ${Cn}`), {};
    }
  }, _h, E), pe(() => {
    !m && g && g.update({
      referenceElement: null,
      floatingElement: null,
      domReferenceElement: null,
      positionReference: null
    });
  }, [m, g]);
  const Ue = y.useMemo(() => ({
    ancestorScroll: !p,
    elementResize: !p && typeof ResizeObserver < "u",
    layoutShift: !p && typeof IntersectionObserver < "u"
  }), [p]), {
    refs: H,
    elements: G,
    x: we,
    y: be,
    middlewareData: ge,
    update: V,
    placement: j,
    context: Z,
    isPositioned: se,
    floatingStyles: Ne
  } = t({
    rootContext: g,
    open: d ? m : void 0,
    placement: B,
    middleware: he,
    strategy: r,
    whileElementsMounted: d ? void 0 : (...de) => Bs(...de, Ue),
    nodeId: w,
    externalTree: S
  }), {
    sideX: Re,
    sideY: Ot
  } = ge.adaptiveOrigin || Ah, ut = se ? r : "fixed", It = y.useMemo(() => {
    let de;
    return se ? E ? de = {
      position: ut,
      [Re]: we,
      [Ot]: be
    } : de = {
      ...Ne,
      position: ut
    } : de = {
      position: ut,
      top: 0,
      left: 0
    }, de[Hs] = "100vw", de[Us] = "100vh", se || (de.opacity = 0), de;
  }, [E, ut, Re, we, Ot, be, Ne, se]), rt = y.useRef(null);
  pe(() => {
    if (!m)
      return;
    const de = x.current, Me = typeof de == "function" ? de() : de, Be = (Ws(Me) ? Me.current : Me) || null || null;
    Be !== rt.current && (H.setPositionReference(Be), rt.current = Be);
  }, [m, H, I, x]), y.useEffect(() => {
    if (!m)
      return;
    const de = x.current;
    typeof de != "function" && Ws(de) && de.current !== rt.current && (H.setPositionReference(de.current), rt.current = de.current);
  }, [m, H, I, x]), y.useEffect(() => {
    if (d && m && G.reference && G.floating)
      return Bs(G.reference, G.floating, V, Ue);
  }, [d, m, G, V, Ue]);
  const ot = We(j), yt = Lc(o, ot, N), Ct = nt(j) || "center", jt = !!((Kt = ge.hide) != null && Kt.referenceHidden);
  pe(() => {
    T && m && se && (ot !== L || K && Ct !== X) && Y(j);
  }, [T, K, m, se, j, ot, Ct, L, X]);
  const mn = y.useMemo(() => {
    var de, Me;
    return {
      position: "absolute",
      top: (de = ge.arrow) == null ? void 0 : de.y,
      left: (Me = ge.arrow) == null ? void 0 : Me.x
    };
  }, [ge.arrow]), Gt = ((bn = ge.arrow) == null ? void 0 : bn.centerOffset) !== 0;
  return y.useMemo(() => ({
    positionerStyles: It,
    arrowStyles: mn,
    arrowRef: oe,
    arrowUncentered: Gt,
    side: yt,
    align: Ct,
    physicalSide: ot,
    anchorHidden: jt,
    refs: H,
    context: Z,
    isPositioned: se,
    update: V
  }), [It, mn, oe, Gt, yt, Ct, ot, jt, H, Z, se, V]);
}
function Ws(e) {
  return e != null && "current" in e;
}
function Bc(e) {
  return e === "starting" ? Id : $e;
}
function Vh(e, t, {
  styles: n,
  transitionStatus: r,
  props: o,
  refs: s,
  hidden: i,
  inert: c = !1
}) {
  const a = {
    ...n
  };
  return c && (a.pointerEvents = "none"), vt("div", e, {
    state: t,
    ref: s,
    props: [{
      role: "presentation",
      hidden: i,
      style: a
    }, Bc(r), o],
    stateAttributesMapping: tc
  });
}
const Vc = /* @__PURE__ */ y.forwardRef(function(t, n) {
  const {
    render: r,
    className: o,
    anchor: s,
    positionMethod: i = "absolute",
    side: c = "bottom",
    align: a = "center",
    sideOffset: l = 0,
    alignOffset: u = 0,
    collisionBoundary: f = "clipping-ancestors",
    collisionPadding: p = 5,
    arrowPadding: h = 5,
    sticky: d = !1,
    disableAnchorTracking: g = !1,
    collisionAvoidance: m = _d,
    style: v,
    ...C
  } = t, w = gn(), E = Th(), T = Fd(), S = w.useState("open"), R = w.useState("mounted"), P = w.useState("floatingRootContext"), O = w.useState("instantType"), M = w.useState("transitionStatus"), F = w.useState("adaptiveOrigin"), A = w.context.inlineRectCoordsRef, D = Lh({
    anchor: s,
    floatingRootContext: P,
    positionMethod: i,
    mounted: R,
    side: c,
    sideOffset: l,
    align: a,
    alignOffset: u,
    arrowPadding: h,
    collisionBoundary: f,
    collisionPadding: p,
    sticky: d,
    disableAnchorTracking: g,
    keepMounted: E,
    nodeId: T,
    collisionAvoidance: m,
    adaptiveOrigin: F,
    inline: Gd(A)
  }), I = D.update;
  pe(() => {
    S && R && I();
  }, [S, R, I]);
  const x = {
    open: S,
    side: D.side,
    align: D.align,
    anchorHidden: D.anchorHidden,
    instant: O
  }, _ = Vh(t, x, {
    styles: D.positionerStyles,
    transitionStatus: M,
    props: C,
    refs: [n, w.useStateSetter("positionerElement")],
    hidden: !R,
    inert: !S
  });
  return /* @__PURE__ */ b(Uo.Provider, {
    value: D,
    children: /* @__PURE__ */ b(Ld, {
      id: T,
      children: _
    })
  });
});
process.env.NODE_ENV !== "production" && (Vc.displayName = "PreviewCardPositioner");
const $c = /* @__PURE__ */ y.forwardRef(function(t, n) {
  const {
    className: r,
    render: o,
    style: s,
    ...i
  } = t, c = gn(), {
    side: a,
    align: l
  } = Rh(), u = c.useState("open"), f = c.useState("instantType"), p = c.useState("transitionStatus"), h = c.useState("popupProps"), d = c.useState("floatingRootContext"), g = c.useState("closeDelay");
  return vo({
    open: u,
    ref: c.context.popupRef,
    onComplete() {
      var C, w;
      u && ((w = (C = c.context).onOpenChangeComplete) == null || w.call(C, !0));
    }
  }), Op(d, {
    closeDelay: g
  }), vt("div", t, {
    state: {
      open: u,
      side: a,
      align: l,
      instant: f,
      transitionStatus: p
    },
    ref: [n, c.context.popupRef, c.useStateSetter("popupElement")],
    props: [Jd, h, Bc(p), i],
    stateAttributesMapping: Qf
  });
});
process.env.NODE_ENV !== "production" && ($c.displayName = "PreviewCardPopup");
class $h extends Kd {
  constructor() {
    super(wh(), "PreviewCard");
  }
  /**
   * Opens the preview card and associates it with the trigger with the given id.
   *
   * This method should only be called in an event handler or an effect (not during rendering).
   *
   * @param triggerId ID of the trigger to associate with the preview card. The trigger must be a
   * matching `PreviewCard.Trigger` with this handle passed as a prop.
   */
  open(t) {
    this.openByTrigger(t);
  }
  /**
   * Closes the preview card.
   *
   * This method should only be called in an event handler or an effect (not during rendering).
   */
  close() {
    this.closePopup();
  }
  /**
   * Whether the preview card is currently open. Returns `false` while no root is attached to the handle.
   */
  get isOpen() {
    var t;
    return ((t = this.attachedStore) == null ? void 0 : t.select("open")) ?? !1;
  }
}
function Hh() {
  return new $h();
}
const Uh = Hh;
function zh(e) {
  return /* @__PURE__ */ b(kc, { ...e });
}
function Wh(e) {
  return /* @__PURE__ */ b(Dc, { "data-slot": "hover-card-trigger", ...e });
}
function qh({
  className: e,
  side: t = "bottom",
  sideOffset: n = 6,
  align: r = "center",
  alignOffset: o = 0,
  ...s
}) {
  return /* @__PURE__ */ b(Mc, { children: /* @__PURE__ */ b(
    Vc,
    {
      align: r,
      alignOffset: o,
      side: t,
      sideOffset: n,
      className: "vps-hover-card-positioner",
      children: /* @__PURE__ */ b(
        $c,
        {
          "data-slot": "hover-card-content",
          ...s,
          className: (i) => ue(
            "vps-hover-card",
            typeof e == "function" ? e(i) : e
          )
        }
      )
    }
  ) });
}
function jh({ className: e, ...t }) {
  return /* @__PURE__ */ b("span", { className: ue("inline-citation", e), ...t });
}
const zo = Qn(null);
function Hc(e) {
  !e.popup || !e.focusRequested || !e.handle.isOpen || (e.focusRequested = !1, e.popup.focus());
}
function Gh({
  handle: e,
  onOpenChange: t,
  openDelay: n = 80,
  closeDelay: r = 180,
  ...o
}) {
  const [s] = Se(() => Uh()), i = e ?? s, c = Mt(() => ({
    handle: i,
    openDelay: n,
    closeDelay: r,
    trigger: null,
    popup: null,
    focusRequested: !1
  }), [i, n, r]);
  return /* @__PURE__ */ b(zo.Provider, { value: c, children: /* @__PURE__ */ b(
    zh,
    {
      ...o,
      handle: i,
      onOpenChange: (a, l) => {
        var u, f;
        t == null || t(a, l), !a && l.reason === "escape-key" && ((u = c.popup) != null && u.contains(document.activeElement)) && ((f = c.trigger) == null || f.focus());
      }
    }
  ) });
}
function Qr(e) {
  try {
    return new URL(e).hostname || e;
  } catch {
    return e;
  }
}
function Kh({
  sources: e,
  delay: t,
  closeDelay: n,
  id: r,
  children: o,
  onClick: s,
  ...i
}) {
  const c = Wt(zo), a = Ar(), l = r ?? a, u = e[0], f = u ? Qr(u) : "Source";
  return /* @__PURE__ */ b(
    Wh,
    {
      id: l,
      handle: c == null ? void 0 : c.handle,
      delay: t ?? (c == null ? void 0 : c.openDelay) ?? 80,
      closeDelay: n ?? (c == null ? void 0 : c.closeDelay) ?? 180,
      render: /* @__PURE__ */ b(
        Co,
        {
          variant: "secondary",
          size: "xs",
          "aria-haspopup": "dialog",
          ...i,
          onClick: (p) => {
            s == null || s(p), !(!c || p.defaultPrevented) && (c.trigger = p.currentTarget, c.focusRequested = !0, c.handle.open(l), Hc(c));
          }
        }
      ),
      children: o ?? (e.length > 1 ? `${f} +${e.length - 1}` : f)
    }
  );
}
function Yh({ ref: e, onBlur: t, ...n }) {
  const r = Wt(zo);
  return /* @__PURE__ */ b(
    qh,
    {
      tabIndex: -1,
      role: "dialog",
      "aria-label": "Source preview",
      ...n,
      ref: (o) => {
        typeof e == "function" ? e(o) : e && (e.current = o), r && (r.popup = o, o && Hc(r));
      },
      onBlur: (o) => {
        t == null || t(o), !(!r || o.defaultPrevented) && o.relatedTarget !== r.trigger && !o.currentTarget.contains(o.relatedTarget) && r.handle.close();
      }
    }
  );
}
const Uc = Qn(null);
function Wo() {
  const e = Wt(Uc);
  if (!e) throw new Error("Citation carousel parts must be rendered inside InlineCitationCarousel.");
  return e;
}
function Xh({
  opts: e,
  plugins: t,
  orientation: n = "horizontal",
  setApi: r,
  className: o,
  ...s
}) {
  const [i, c] = Po({ ...e, axis: n === "vertical" ? "y" : "x" }, t), [{ selected: a, count: l }, u] = Se({ selected: 0, count: 0 });
  return qe(() => {
    if (!c) return;
    r == null || r(c);
    const f = () => u({ selected: c.selectedScrollSnap(), count: c.scrollSnapList().length });
    return f(), c.on("select", f).on("reInit", f), () => {
      c.off("select", f).off("reInit", f);
    };
  }, [c, r]), /* @__PURE__ */ b(Uc.Provider, { value: { viewportRef: i, api: c, selected: a, count: l }, children: /* @__PURE__ */ b(
    "div",
    {
      role: "region",
      "aria-roledescription": "carousel",
      ...s,
      className: ue("inline-citation-carousel", o),
      "data-orientation": n
    }
  ) });
}
function Jh({ className: e, ...t }) {
  const { viewportRef: n } = Wo();
  return /* @__PURE__ */ b("div", { ref: n, className: "inline-citation-viewport", children: /* @__PURE__ */ b("div", { className: ue("inline-citation-track", e), ...t }) });
}
function Zh({ className: e, ...t }) {
  return /* @__PURE__ */ b("div", { role: "group", "aria-roledescription": "slide", className: ue("inline-citation-slide", e), ...t });
}
function Qh({ className: e, ...t }) {
  return /* @__PURE__ */ b("div", { className: ue("inline-citation-carousel-header", e), ...t });
}
function eg({ children: e, ...t }) {
  const { selected: n, count: r } = Wo();
  return /* @__PURE__ */ b("div", { "aria-live": "polite", ...t, children: e ?? (r ? `${n + 1}/${r}` : "") });
}
function zc({ next: e, children: t, disabled: n, onClick: r, ...o }) {
  const { api: s } = Wo(), i = e ? s == null ? void 0 : s.canScrollNext() : s == null ? void 0 : s.canScrollPrev();
  return /* @__PURE__ */ b(
    Co,
    {
      variant: "ghost",
      size: "icon-xs",
      "aria-label": e ? "Next source" : "Previous source",
      ...o,
      disabled: n || !i,
      onClick: (c) => {
        r == null || r(c), !c.defaultPrevented && (e ? s == null || s.scrollNext() : s == null || s.scrollPrev());
      },
      children: t ?? (e ? /* @__PURE__ */ b(si, { size: 14, "aria-hidden": "true" }) : /* @__PURE__ */ b(Ca, { size: 14, "aria-hidden": "true" }))
    }
  );
}
function tg(e) {
  return /* @__PURE__ */ b(zc, { ...e, next: !1 });
}
function ng(e) {
  return /* @__PURE__ */ b(zc, { ...e, next: !0 });
}
function rg({ title: e, url: t, description: n, className: r, children: o, ...s }) {
  const i = t ? wo(t) : void 0;
  return /* @__PURE__ */ U("div", { className: ue("inline-citation-source", r), ...s, children: [
    /* @__PURE__ */ b("div", { className: "inline-citation-title", children: e || (i ? Qr(i) : "Source") }),
    i && /* @__PURE__ */ U("a", { href: i, target: "_blank", rel: "noopener noreferrer", children: [
      Qr(i),
      /* @__PURE__ */ b("span", { className: "sr-only", children: " (opens in a new tab)" })
    ] }),
    n && /* @__PURE__ */ b("p", { children: n }),
    o
  ] });
}
function og({ className: e, ...t }) {
  return /* @__PURE__ */ b("blockquote", { className: ue("inline-citation-quote", e), ...t });
}
const sg = {
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
function Wc(e) {
  const n = (e.split(/[/\\]/).pop() || "").replace(/\.md$/i, "").toLowerCase();
  for (const [r, o] of Object.entries(sg))
    if (n.includes(r))
      return o;
  return null;
}
function eo(e) {
  return e.title ? e.title : (e.source.split(/[/\\]/).pop() || e.source).replace(/\.md$/i, "").replace(/[-_]/g, " ").replace(/\b\w/g, (n) => n.toUpperCase());
}
const ig = ({
  sources: e,
  hideInspectSources: t = !1,
  showInspectSources: n = !0,
  defaultExpanded: r = !1,
  maxSources: o = 5
}) => {
  const s = t || n === !1, [i, c] = Se(r && !s), [a, l] = Se(null);
  if (!e || !e.length) return null;
  const u = e.slice(0, o), f = u.length === 1 ? "source" : "sources", p = /* @__PURE__ */ U(Vt, { children: [
    /* @__PURE__ */ b(Tt, { children: /* @__PURE__ */ b(Ra, { size: 14 }) }),
    /* @__PURE__ */ b($t, { children: `${u.length} retrieved VPS ${f}` }),
    !s && /* @__PURE__ */ b(rn, { children: i ? "Hide Details" : "Inspect Sources" })
  ] }), h = /* @__PURE__ */ b(wt, { className: "grounded-source-rows", children: u.map((d, g) => {
    const m = a === g, v = /* @__PURE__ */ U(Vt, { children: [
      /* @__PURE__ */ b(Tt, { children: /* @__PURE__ */ b(va, { size: 13 }) }),
      /* @__PURE__ */ U($t, { children: [
        "[S",
        g + 1,
        "] ",
        eo(d)
      ] }),
      /* @__PURE__ */ U(rn, { title: "Ranking score, not a probability of correctness", children: [
        "Score ",
        d.score.toFixed(2)
      ] })
    ] });
    return s ? /* @__PURE__ */ b("div", { children: v }, `${d.chunkId}-${g}`) : /* @__PURE__ */ b(
      "button",
      {
        type: "button",
        className: `trace-trigger${i && m ? " grounded-source-selected" : ""}`,
        "aria-pressed": i && m,
        onClick: () => {
          c(!0), l(m ? null : g);
        },
        title: d.source,
        children: v
      },
      `${d.chunkId}-${g}`
    );
  }) });
  return s ? /* @__PURE__ */ U(wt, { className: "grounded-sources-card", children: [
    p,
    h
  ] }) : /* @__PURE__ */ b(wt, { className: "grounded-sources-card", children: /* @__PURE__ */ U(Di, { open: i, onOpenChange: c, children: [
    /* @__PURE__ */ b(Fi, { children: p }),
    h,
    /* @__PURE__ */ b(Li, { children: /* @__PURE__ */ b("div", { className: "grounded-sources-details-list", children: u.map((d, g) => {
      const m = eo(d), v = Wc(d.source);
      return /* @__PURE__ */ U(
        "div",
        {
          className: `grounded-detail-item${a === g ? " grounded-detail-item--highlighted" : ""}`,
          children: [
            /* @__PURE__ */ U("div", { className: "grounded-detail-top", children: [
              /* @__PURE__ */ U("div", { className: "grounded-detail-title-group", children: [
                /* @__PURE__ */ U("span", { className: "grounded-detail-index", children: [
                  "[",
                  g + 1,
                  "]"
                ] }),
                /* @__PURE__ */ b("span", { className: "grounded-detail-title", children: m })
              ] }),
              /* @__PURE__ */ U("div", { className: "grounded-detail-meta", children: [
                /* @__PURE__ */ U("span", { className: "grounded-detail-score", children: [
                  "Rank score ",
                  d.score.toFixed(2)
                ] }),
                v && /* @__PURE__ */ U(
                  "a",
                  {
                    href: v.path,
                    onClick: (w) => {
                      w.preventDefault(), window.location.href = v.path;
                    },
                    className: "grounded-route-link",
                    title: `Navigate to ${v.label}`,
                    children: [
                      /* @__PURE__ */ b("span", { children: v.label }),
                      /* @__PURE__ */ b(Sa, { size: 10, "aria-hidden": "true" })
                    ]
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ b("div", { className: "grounded-detail-path", children: /* @__PURE__ */ b("code", { children: d.source }) }),
            d.snippet && /* @__PURE__ */ U("p", { className: "grounded-detail-snippet", children: [
              '"',
              d.snippet,
              '"'
            ] })
          ]
        },
        `detail-${d.chunkId}-${g}`
      );
    }) }) })
  ] }) });
};
function cg({ label: e, sources: t }) {
  const n = t.map((r) => {
    var i;
    const o = eo(r), s = wo(r.url || r.source) ?? ((i = Wc(r.source)) == null ? void 0 : i.path);
    return {
      key: r.chunkId,
      label: s || o,
      content: /* @__PURE__ */ U(zt, { children: [
        /* @__PURE__ */ b(rg, { title: o, url: s }),
        r.snippet && /* @__PURE__ */ b(og, { children: r.snippet })
      ] })
    };
  });
  return /* @__PURE__ */ b(jh, { children: /* @__PURE__ */ U(Gh, { children: [
    /* @__PURE__ */ b(Kh, { sources: n.map((r) => r.label), "aria-label": "View sources " + e, children: e }),
    /* @__PURE__ */ b(Yh, { children: n.length === 1 ? n[0].content : /* @__PURE__ */ U(Xh, { "aria-label": "Sources", children: [
      /* @__PURE__ */ U(Qh, { children: [
        /* @__PURE__ */ b(eg, {}),
        /* @__PURE__ */ b(tg, {}),
        /* @__PURE__ */ b(ng, {})
      ] }),
      /* @__PURE__ */ b(Jh, { children: n.map((r, o) => /* @__PURE__ */ b(Zh, { "aria-label": "Source " + (o + 1), children: r.content }, r.key + "-" + o)) })
    ] }) })
  ] }) });
}
function ag(e, t) {
  if (!e) return [];
  const n = /(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|https?:\/\/[^\s]+|\[S\d+(?:\s*,\s*S\d+)*\])/g;
  return e.split(n).map((o, s) => {
    if (!o) return null;
    if (t != null && t.length && /^\[S\d+(?:\s*,\s*S\d+)*\]$/.test(o)) {
      const c = [...new Set(o.match(/\d+/g))].map((a) => t[Number(a) - 1]);
      if (c.every((a) => a !== void 0))
        return /* @__PURE__ */ b(cg, { label: o, sources: c }, s);
    }
    const i = o.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (i) {
      const c = i[1], a = i[2], l = wo(a);
      if (!l) return /* @__PURE__ */ b(ze.Fragment, { children: c }, s);
      const u = /^https?:\/\//i.test(a);
      return /* @__PURE__ */ b(
        "a",
        {
          href: l,
          target: u ? "_blank" : void 0,
          rel: u ? "noopener noreferrer" : void 0,
          className: "md-link",
          children: c
        },
        s
      );
    }
    return o.startsWith("**") && o.endsWith("**") && o.length >= 4 ? /* @__PURE__ */ b("strong", { children: o.slice(2, -2) }, s) : o.startsWith("*") && o.endsWith("*") && o.length >= 2 ? /* @__PURE__ */ b("em", { children: o.slice(1, -1) }, s) : o.startsWith("`") && o.endsWith("`") && o.length >= 2 ? /* @__PURE__ */ b("code", { className: "md-code", children: o.slice(1, -1) }, s) : /^https?:\/\//i.test(o) ? /* @__PURE__ */ b(
      "a",
      {
        href: o,
        target: "_blank",
        rel: "noopener noreferrer",
        className: "md-link",
        children: o
      },
      s
    ) : /* @__PURE__ */ b(ze.Fragment, { children: o }, s);
  });
}
function lg(e) {
  const t = e.replace(/\r\n/g, `
`).split(`
`), n = [];
  let r = 0;
  for (; r < t.length; ) {
    const s = t[r].trim();
    if (!s) {
      r++;
      continue;
    }
    if (s.startsWith("```")) {
      const a = s.slice(3).trim(), l = [];
      for (r++; r < t.length && !t[r].trim().startsWith("```"); )
        l.push(t[r]), r++;
      r < t.length && t[r].trim().startsWith("```") && r++, n.push({ type: "code", lang: a, code: l.join(`
`) });
      continue;
    }
    if (/^(---|___|\*\*\*)$/.test(s)) {
      n.push({ type: "hr" }), r++;
      continue;
    }
    const i = s.match(/^(#{1,4})\s+(.*)$/);
    if (i) {
      n.push({
        type: "h",
        level: i[1].length,
        content: i[2]
      }), r++;
      continue;
    }
    if (s.startsWith(">")) {
      const a = [];
      for (; r < t.length && t[r].trim().startsWith(">"); )
        a.push(t[r].trim().replace(/^>\s?/, "")), r++;
      n.push({ type: "quote", lines: a });
      continue;
    }
    if (/^[-*]\s+/.test(s)) {
      const a = [];
      for (; r < t.length && /^[-*]\s+/.test(t[r].trim()); )
        a.push(t[r].trim().replace(/^[-*]\s+/, "")), r++;
      n.push({ type: "ul", items: a });
      continue;
    }
    if (/^\d+\.\s+/.test(s)) {
      const a = [];
      for (; r < t.length && /^\d+\.\s+/.test(t[r].trim()); )
        a.push(t[r].trim().replace(/^\d+\.\s+/, "")), r++;
      n.push({ type: "ol", items: a });
      continue;
    }
    if (s.startsWith("|") && s.endsWith("|")) {
      const a = [];
      for (; r < t.length && t[r].trim().startsWith("|") && t[r].trim().endsWith("|"); )
        a.push(t[r].trim()), r++;
      if (a.length >= 2) {
        const l = (h) => h.slice(1, -1).split("|").map((d) => d.trim()), u = l(a[0]), f = a[1].includes("-") ? 2 : 1, p = a.slice(f).map(l);
        n.push({ type: "table", headers: u, rows: p });
        continue;
      }
    }
    const c = [];
    for (; r < t.length && t[r].trim() && !t[r].trim().startsWith("```") && !/^(#{1,4})\s+/.test(t[r].trim()) && !/^[-*]\s+/.test(t[r].trim()) && !/^\d+\.\s+/.test(t[r].trim()) && !t[r].trim().startsWith(">") && !/^(---|___|\*\*\*)$/.test(t[r].trim()); )
      c.push(t[r].trim()), r++;
    c.length > 0 && n.push({ type: "p", lines: c });
  }
  return n;
}
function ug({ code: e, lang: t, streaming: n }) {
  const { status: r, copy: o } = Gi();
  return /* @__PURE__ */ U("div", { className: "md-code-block", children: [
    /* @__PURE__ */ U("div", { className: "md-code-header", children: [
      /* @__PURE__ */ b("span", { children: t || "Code" }),
      !n && /* @__PURE__ */ U(zt, { children: [
        /* @__PURE__ */ U("span", { className: "md-code-status", role: "status", children: [
          r === "copied" && "Copied",
          r === "failed" && "Couldn’t copy"
        ] }),
        /* @__PURE__ */ b(
          "button",
          {
            type: "button",
            className: "chat-message-action",
            "aria-label": "Copy code",
            title: "Copy code",
            disabled: r === "copying",
            onClick: () => void o(e),
            children: r === "copied" ? /* @__PURE__ */ b(ro, { size: 15, "aria-hidden": "true" }) : /* @__PURE__ */ b(ci, { size: 15, "aria-hidden": "true" })
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ b("pre", { className: "md-pre", children: /* @__PURE__ */ b("code", { children: e.split(`
`).map((s, i) => /* @__PURE__ */ U("span", { className: "md-code-line", children: [
      /* @__PURE__ */ b("span", { className: "md-code-number", "aria-hidden": "true", children: i + 1 }),
      /* @__PURE__ */ b("span", { children: s || " " })
    ] }, i)) }) })
  ] });
}
const qs = ze.memo(function({
  text: t,
  streaming: n = !1,
  sources: r
}) {
  if (!t) return null;
  const o = lg(t), s = (i) => ag(i, r);
  return /* @__PURE__ */ b("div", { className: "md-content", children: o.map((i, c) => {
    switch (i.type) {
      case "h":
        return i.level === 1 ? /* @__PURE__ */ b("h2", { className: "md-h1", children: s(i.content) }, c) : i.level === 2 ? /* @__PURE__ */ b("h3", { className: "md-h2", children: s(i.content) }, c) : i.level === 3 ? /* @__PURE__ */ b("h4", { className: "md-h3", children: s(i.content) }, c) : /* @__PURE__ */ b("h5", { className: "md-h4", children: s(i.content) }, c);
      case "ul":
        return /* @__PURE__ */ b("ul", { className: "md-ul", children: i.items.map((a, l) => /* @__PURE__ */ b("li", { className: "md-li", children: s(a) }, l)) }, c);
      case "ol":
        return /* @__PURE__ */ b("ol", { className: "md-ol", children: i.items.map((a, l) => /* @__PURE__ */ b("li", { className: "md-li", children: s(a) }, l)) }, c);
      case "code":
        return /* @__PURE__ */ b(ug, { code: i.code, lang: i.lang, streaming: n }, c);
      case "quote":
        return /* @__PURE__ */ b("blockquote", { className: "md-quote", children: i.lines.map((a, l) => /* @__PURE__ */ b("p", { children: s(a) }, l)) }, c);
      case "hr":
        return /* @__PURE__ */ b("hr", { className: "md-hr" }, c);
      case "table":
        return /* @__PURE__ */ b("div", { className: "md-table-wrap", children: /* @__PURE__ */ U("table", { className: "md-table", children: [
          /* @__PURE__ */ b("thead", { children: /* @__PURE__ */ b("tr", { children: i.headers.map((a, l) => /* @__PURE__ */ b("th", { children: s(a) }, l)) }) }),
          /* @__PURE__ */ b("tbody", { children: i.rows.map((a, l) => /* @__PURE__ */ b("tr", { children: a.map((u, f) => /* @__PURE__ */ b("td", { children: s(u) }, f)) }, l)) })
        ] }) }, c);
      case "p":
      default:
        return /* @__PURE__ */ b("p", { className: "md-p", children: i.lines.map((a, l) => /* @__PURE__ */ U(ze.Fragment, { children: [
          s(a),
          l < i.lines.length - 1 && /* @__PURE__ */ b("br", {})
        ] }, l)) }, c);
    }
  }) });
}), fg = ta(async () => ({ default: (await import("streamdown")).Streamdown })), qc = Qn(null);
function jc() {
  const e = Wt(qc);
  if (!e) throw new Error("Reasoning parts must be rendered inside Reasoning.");
  return e;
}
function dg({
  isStreaming: e = !1,
  open: t,
  defaultOpen: n,
  onOpenChange: r,
  duration: o,
  className: s,
  ...i
}) {
  const [c, a] = Se(n), [l, u] = Se(), f = Ae(null), p = t ?? c ?? e;
  qe(() => {
    e ? f.current = performance.now() : f.current !== null && (u(Math.round((performance.now() - f.current) / 1e3)), f.current = null);
  }, [e]);
  function h(d) {
    t === void 0 && a(d), r == null || r(d);
  }
  return /* @__PURE__ */ b(qc.Provider, { value: { isStreaming: e, isOpen: p, setIsOpen: h, duration: o ?? l }, children: /* @__PURE__ */ b(wt, { className: s, children: /* @__PURE__ */ b(Di, { ...i, open: p, onOpenChange: h }) }) });
}
function pg({
  getThinkingMessage: e,
  children: t,
  icon: n,
  description: r,
  ...o
}) {
  const { isStreaming: s, duration: i } = jc(), c = s ? "Thinking" : i === void 0 ? "Thought" : `Thought for ${i}s`;
  return /* @__PURE__ */ b(Fi, { ...o, children: /* @__PURE__ */ U(Vt, { status: s ? "running" : void 0, children: [
    /* @__PURE__ */ b(Tt, { children: n ?? (s ? /* @__PURE__ */ b(ai, { size: 14, className: "trace-spinner" }) : /* @__PURE__ */ b(ii, { size: 14 })) }),
    /* @__PURE__ */ b($t, { children: t ?? (e == null ? void 0 : e(s, i)) ?? c }),
    r && /* @__PURE__ */ b(rn, { "aria-hidden": s || void 0, children: r })
  ] }) });
}
function hg({ children: e, className: t, ...n }) {
  const { isStreaming: r } = jc();
  return /* @__PURE__ */ b(Li, { className: ue("reasoning-content", t), ...n, children: typeof e == "string" ? /* @__PURE__ */ b(na, { fallback: /* @__PURE__ */ b("div", { className: "md-content reasoning-text", children: e }), children: /* @__PURE__ */ b(fg, { className: "md-content", isAnimating: r, mode: r ? "streaming" : "static", children: e }) }) : e });
}
function gg(e) {
  return e === "create_ticket" ? "Support ticket processed" : e === "get_customer" ? "Account verified" : e === "get_ticket" ? "Ticket status loaded" : "Information retrieved";
}
const mg = ({
  status: e = "complete",
  progressText: t,
  progressSteps: n = [],
  durationMs: r,
  toolCalls: o = []
}) => {
  const s = e === "pending", i = e === "stopped", [c, a] = Se(0);
  qe(() => {
    if (!s) return;
    const f = Date.now(), p = setInterval(() => {
      a(Number(((Date.now() - f) / 1e3).toFixed(1)));
    }, 250);
    return () => clearInterval(p);
  }, [s]);
  const l = n.length > 0 || o.length > 0, u = r === void 0 ? void 0 : Number((r / 1e3).toFixed(1));
  return l ? /* @__PURE__ */ U(dg, { className: "chat-response-trace", isStreaming: s, duration: u, children: [
    /* @__PURE__ */ b(
      pg,
      {
        getThinkingMessage: i ? () => "Response stopped" : void 0,
        icon: i ? /* @__PURE__ */ b(li, { size: 12 }) : void 0,
        description: s ? `${c.toFixed(1)}s` : void 0
      }
    ),
    /* @__PURE__ */ b(hg, { children: /* @__PURE__ */ U(wt, { children: [
      n.map((f, p) => /* @__PURE__ */ U(ni, { children: [
        /* @__PURE__ */ b(fa, { children: /* @__PURE__ */ b("span", { className: "chat-progress-dot" }) }),
        /* @__PURE__ */ b(ri, { children: f })
      ] }, `${f}-${p}`)),
      o.map((f, p) => /* @__PURE__ */ U(Vt, { children: [
        /* @__PURE__ */ b(Tt, { children: /* @__PURE__ */ b(Fa, { size: 13 }) }),
        /* @__PURE__ */ b($t, { children: gg(f.toolName) })
      ] }, `${f.toolName}-${p}`))
    ] }) })
  ] }) : /* @__PURE__ */ b(wt, { className: "chat-response-trace", children: /* @__PURE__ */ U(Vt, { status: s ? "running" : void 0, children: [
    /* @__PURE__ */ b(Tt, { children: s ? /* @__PURE__ */ b(ai, { size: 14, className: "trace-spinner" }) : /* @__PURE__ */ b(ii, { size: 14 }) }),
    /* @__PURE__ */ b($t, { children: s ? t || "Thinking" : i ? "Response stopped" : "Thought" }),
    s ? /* @__PURE__ */ U(rn, { "aria-hidden": "true", children: [
      c.toFixed(1),
      "s"
    ] }) : !i && u !== void 0 && /* @__PURE__ */ U(rn, { children: [
      u,
      "s"
    ] })
  ] }) });
}, bg = ({ message: e, onEdit: t }) => {
  var h, d, g, m;
  const n = no(), r = (n == null ? void 0 : n.hideInspectSources) ?? !1, o = (n == null ? void 0 : n.showGroundedSources) ?? !1, s = e.role === "user", i = e.status === "error", c = e.status === "pending", a = e.status === "stopped", l = e.id.startsWith("welcome"), u = e.role === "assistant" && !l && !i, f = u && (c || a || e.durationMs !== void 0 || !!((h = e.progressSteps) != null && h.length || (d = e.sources) != null && d.length || (g = e.toolCalls) != null && g.length || e.usage)), p = u && !c && !a && e.content.trim().length > 0;
  return /* @__PURE__ */ U(oo, { align: s ? "end" : "start", children: [
    e.role === "assistant" && /* @__PURE__ */ b(ui, { className: "avatar-circle", "aria-hidden": "true", children: /* @__PURE__ */ b("img", { src: yo, alt: "VPS Logo", style: { width: "16px", height: "16px" } }) }),
    /* @__PURE__ */ U(so, { children: [
      f && /* @__PURE__ */ b(Ba, { children: /* @__PURE__ */ b(
        mg,
        {
          status: c ? "pending" : a ? "stopped" : "complete",
          progressText: e.progressText,
          progressSteps: e.progressSteps,
          durationMs: e.durationMs,
          toolCalls: e.toolCalls
        }
      ) }),
      s ? /* @__PURE__ */ b($r, { align: "end", children: /* @__PURE__ */ b(Hr, { className: "msg-user-pre", children: e.content }) }) : l || i ? /* @__PURE__ */ b($r, { variant: i ? "destructive" : "muted", children: /* @__PURE__ */ b(Hr, { children: /* @__PURE__ */ b(qs, { text: e.content }) }) }) : e.content && /* @__PURE__ */ U("div", { className: "chat-message-body", children: [
        /* @__PURE__ */ b(
          qs,
          {
            text: e.content,
            streaming: c,
            sources: u && !c && !a && !r ? e.sources : void 0
          }
        ),
        u && !c && !a && o && ((m = e.sources) != null && m.length) ? /* @__PURE__ */ b(ig, { sources: e.sources, hideInspectSources: r }) : null
      ] }),
      p && n && /* @__PURE__ */ b(kr, { children: /* @__PURE__ */ b(ju, { message: e, onFeedback: n.toggleMessageFeedback }) }),
      s && !i && /* @__PURE__ */ U(kr, { children: [
        t && /* @__PURE__ */ b(
          "button",
          {
            type: "button",
            className: "chat-message-action",
            "aria-label": "Edit message",
            title: "Edit message",
            disabled: (n == null ? void 0 : n.status) === "awaiting" || (n == null ? void 0 : n.status) === "connecting" || !!(n != null && n.pendingTicket),
            onClick: () => t(e.content),
            children: /* @__PURE__ */ b(Ia, { size: 14, "aria-hidden": "true" })
          }
        ),
        /* @__PURE__ */ b(ro, { size: 13, className: "msg-tick", "aria-hidden": "true" })
      ] })
    ] })
  ] });
}, vg = ({ onEdit: e }) => {
  const { messages: t, status: n, suggestions: r, showSuggestions: o, sendMessage: s } = er(), i = n === "awaiting" || n === "connecting", c = t.filter((a) => a.status !== "error");
  return /* @__PURE__ */ b(
    $u,
    {
      autoScroll: !0,
      defaultScrollPosition: "last-anchor",
      scrollPreviousItemPeek: 64,
      children: /* @__PURE__ */ U(Hu, { children: [
        /* @__PURE__ */ b(Uu, { "aria-label": "Chat messages", children: /* @__PURE__ */ U(zu, { "aria-busy": i, children: [
          c.length === 0 && /* @__PURE__ */ b(hs, { messageId: "welcome", children: /* @__PURE__ */ b(qu, {}) }),
          c.map((a) => /* @__PURE__ */ b(
            hs,
            {
              messageId: a.streamId ?? a.id,
              "data-role": a.role,
              scrollAnchor: a.role === "user",
              children: /* @__PURE__ */ b(bg, { message: a, onEdit: e })
            },
            a.streamId ?? a.id
          ))
        ] }) }),
        /* @__PURE__ */ b(Wu, {})
      ] })
    }
  );
}, yg = () => {
  const { pendingTicket: e, ticketBusy: t, userContext: n, confirmTicket: r, cancelTicket: o } = er(), s = !n.customerId && !n.email, [i, c] = Se("");
  return e ? /* @__PURE__ */ U(
    "div",
    {
      className: "ticket-card",
      role: "region",
      "aria-label": "Create support ticket",
      children: [
        /* @__PURE__ */ b("h3", { className: "ticket-card-title", children: "Create support ticket?" }),
        /* @__PURE__ */ b("p", { className: "ticket-card-desc", children: "I can open a support request for you. Nothing is created until you confirm." }),
        /* @__PURE__ */ b("p", { className: "ticket-card-body", children: e.description }),
        s && /* @__PURE__ */ U("label", { className: "ticket-id-label", children: [
          "Customer ID or email",
          /* @__PURE__ */ b(
            "input",
            {
              value: i,
              onChange: (a) => c(a.target.value),
              className: "ticket-id-input",
              placeholder: "CUST-1001 or you@company.com",
              autoComplete: "email"
            }
          )
        ] }),
        /* @__PURE__ */ U("div", { className: "ticket-actions", children: [
          /* @__PURE__ */ b(
            "button",
            {
              type: "button",
              onClick: o,
              disabled: t,
              className: "ticket-cancel-btn",
              children: "Cancel"
            }
          ),
          /* @__PURE__ */ b(
            "button",
            {
              type: "button",
              onClick: () => void r(i),
              disabled: t || s && !i.trim(),
              className: "ticket-confirm-btn",
              children: t ? "Creating…" : "Create ticket"
            }
          )
        ] })
      ]
    }
  ) : null;
}, Gc = ({
  className: e,
  onClose: t,
  showMinimize: n,
  title: r,
  subtitle: o,
  envStage: s,
  envPulse: i = !0
}) => {
  const { messages: c, sendMessage: a, stopResponse: l, status: u, error: f, resetConversation: p, retryLast: h, pendingTicket: d, soundEnabled: g, toggleSound: m } = er(), v = Ae(null), C = u === "awaiting" || u === "connecting", w = c[c.length - 1], E = C ? w == null ? void 0 : w.progressText : (w == null ? void 0 : w.status) === "stopped" ? "Response stopped" : void 0;
  return /* @__PURE__ */ U(
    "section",
    {
      className: `chat-panel${e ? ` ${e}` : ""}`,
      "aria-label": "VPS AI Assistant",
      children: [
        /* @__PURE__ */ b(
          jl,
          {
            title: r,
            subtitle: o,
            onClose: t,
            onReset: () => void p(),
            showMinimize: n,
            soundEnabled: g,
            onToggleSound: m,
            envStage: s,
            envPulse: i
          }
        ),
        /* @__PURE__ */ b("div", { className: "chat-panel-body", children: /* @__PURE__ */ b(vg, { onEdit: (T) => {
          var S;
          return (S = v.current) == null ? void 0 : S.edit(T);
        } }) }),
        /* @__PURE__ */ b(ni, { className: "sr-only", role: "status", children: /* @__PURE__ */ b(ri, { children: E }) }),
        f && u === "error" && /* @__PURE__ */ b(zl, { message: f, onRetry: () => void h() }),
        /* @__PURE__ */ b(yg, {}),
        /* @__PURE__ */ b(
          ru,
          {
            ref: v,
            onSend: (T) => void a(T),
            onStop: C ? l : void 0,
            disabled: C || !!d
          }
        )
      ]
    }
  );
}, Cg = ({
  open: e,
  onClose: t,
  envStage: n,
  envPulse: r = !0
}) => e ? /* @__PURE__ */ b(
  "div",
  {
    id: "vps-chatbot-widget-panel",
    className: "widget-panel",
    children: /* @__PURE__ */ b(
      Gc,
      {
        onClose: t,
        showMinimize: !0,
        title: "VPS AI Assistant",
        envStage: n,
        envPulse: r
      }
    )
  }
) : null, Eg = ({
  open: e,
  onToggle: t
}) => /* @__PURE__ */ b(
  "button",
  {
    type: "button",
    onClick: t,
    "aria-expanded": e,
    "aria-controls": "vps-chatbot-widget-panel",
    "aria-label": e ? "Close assistant" : "Open assistant",
    className: "widget-trigger-btn",
    children: e ? /* @__PURE__ */ b(La, { size: 22 }) : /* @__PURE__ */ b(xa, { size: 24 })
  }
), js = ({
  defaultOpen: e = !1,
  open: t,
  onOpenChange: n,
  envStage: r,
  envPulse: o = !0
}) => {
  const [s, i] = Se(e), c = t ?? s, a = (l) => {
    n == null || n(l), t === void 0 && i(l);
  };
  return /* @__PURE__ */ U(zt, { children: [
    /* @__PURE__ */ b(
      Cg,
      {
        open: c,
        onClose: () => a(!1),
        envStage: r,
        envPulse: o
      }
    ),
    /* @__PURE__ */ b(Eg, { open: c, onToggle: () => a(!c) })
  ] });
}, kg = ({
  apiBaseUrl: e,
  apiUrl: t,
  proxyUrl: n,
  userContext: r,
  role: o,
  roleId: s,
  client: i,
  welcomeMessage: c,
  suggestions: a,
  disableSuggestions: l,
  initialMessage: u,
  hideInspectSources: f,
  showGroundedSources: p,
  modelId: h,
  ...d
}) => {
  const g = no(), m = e ?? t ?? n;
  return !!g && (!m || Lt(m) === Lt(g == null ? void 0 : g.apiBaseUrl)) && !r && o === void 0 && s === void 0 && i === void 0 && c === void 0 && !a && l === void 0 && !u && f === void 0 && p === void 0 && h === void 0 ? /* @__PURE__ */ b(js, { ...d }) : /* @__PURE__ */ b(
    Qs,
    {
      apiBaseUrl: m,
      userContext: r,
      role: o,
      roleId: s,
      client: i,
      welcomeMessage: c,
      suggestions: a,
      disableSuggestions: l,
      initialMessage: u,
      hideInspectSources: f,
      showGroundedSources: p,
      modelId: h,
      children: /* @__PURE__ */ b(js, { ...d })
    }
  );
}, wg = ({
  open: e,
  onClose: t,
  subtitle: n,
  title: r,
  envStage: o,
  envPulse: s = !0
}) => /* @__PURE__ */ U(zt, { children: [
  /* @__PURE__ */ b(
    "div",
    {
      className: `embedded-overlay ${e ? "embedded-overlay--open" : "embedded-overlay--closed"}`,
      hidden: !e,
      onClick: t,
      "aria-hidden": "true"
    }
  ),
  /* @__PURE__ */ b(
    "aside",
    {
      id: "vps-embedded-chat-panel",
      className: `embedded-panel ${e ? "embedded-panel--open" : "embedded-panel--closed"}`,
      "aria-hidden": !e,
      children: e && /* @__PURE__ */ b(
        Gc,
        {
          onClose: t,
          title: r || "VPS AI Assistant",
          subtitle: n,
          envStage: o,
          envPulse: s
        }
      )
    }
  )
] }), Sg = 5, _r = 8, Kc = "vps-embedded-assistant-top", Gs = 16;
function Tg(e, t, n) {
  return Math.min(n, Math.max(t, e));
}
function Ks(e, t) {
  const n = Math.max(
    _r,
    window.innerHeight - t - _r
  );
  return Tg(e, _r, n);
}
function Rg() {
  try {
    const e = window.localStorage.getItem(Kc);
    if (!e) return null;
    const t = Number(e);
    return Number.isFinite(t) ? t : null;
  } catch {
    return null;
  }
}
function xg(e) {
  try {
    window.localStorage.setItem(Kc, String(e));
  } catch {
  }
}
const Pg = ({
  onOpen: e
}) => {
  const t = Ae(null), n = Ae({
    pointerId: null,
    startY: 0,
    startTop: 0,
    moved: !1
  }), [r, o] = Se(
    () => typeof window > "u" ? null : Rg()
  ), s = Ae(r), i = Ae(!1), [c, a] = Se(!1), [l, u] = Se(!1);
  qe(() => {
    s.current = r;
  }, [r]), qe(() => {
    const d = t.current;
    if (!d) return;
    const g = () => {
      o((m) => {
        const C = Ks(m ?? Gs, d.offsetHeight);
        return s.current = C, C;
      });
    };
    return g(), window.addEventListener("resize", g), () => window.removeEventListener("resize", g);
  }, []);
  const f = (d) => {
    if (d.button !== 0) return;
    const g = d.currentTarget, m = g.getBoundingClientRect();
    n.current = {
      pointerId: d.pointerId,
      startY: d.clientY,
      startTop: m.top,
      moved: !1
    };
    try {
      g.setPointerCapture(d.pointerId);
    } catch {
    }
  }, p = (d) => {
    if (n.current.pointerId !== d.pointerId) return;
    const g = d.clientY - n.current.startY;
    if (!n.current.moved && Math.abs(g) < Sg) return;
    n.current.moved = !0, a(!0);
    const m = Ks(
      n.current.startTop + g,
      d.currentTarget.offsetHeight
    );
    s.current = m, o(m);
  }, h = (d) => {
    var m, v;
    if (n.current.pointerId !== d.pointerId) return;
    try {
      (v = (m = d.currentTarget).hasPointerCapture) != null && v.call(m, d.pointerId) && d.currentTarget.releasePointerCapture(d.pointerId);
    } catch {
    }
    const g = n.current.moved;
    n.current.pointerId = null, n.current.moved = !1, a(!1), g && (i.current = !0, s.current != null && xg(s.current));
  };
  return /* @__PURE__ */ U(
    "button",
    {
      ref: t,
      type: "button",
      onPointerDown: f,
      onPointerMove: p,
      onPointerUp: h,
      onPointerCancel: h,
      onMouseEnter: () => u(!0),
      onMouseLeave: () => u(!1),
      onClick: () => {
        if (i.current) {
          i.current = !1;
          return;
        }
        e();
      },
      "aria-expanded": !1,
      "aria-controls": "vps-embedded-chat-panel",
      "aria-label": "Assistant",
      className: `embedded-trigger-btn ${c ? "embedded-trigger-btn--grabbing" : "embedded-trigger-btn--grab"}${l ? " embedded-trigger-btn--expanded" : " embedded-trigger-btn--collapsed"}`,
      style: {
        top: r ?? Gs,
        transform: void 0
      },
      children: [
        /* @__PURE__ */ b("img", { src: yo, alt: "", className: "embedded-trigger-icon", "aria-hidden": "true" }),
        /* @__PURE__ */ b("span", { className: "embedded-trigger-label", children: "Assistant" })
      ]
    }
  );
}, Ys = ({
  defaultOpen: e = !1,
  open: t,
  onOpenChange: n,
  showTrigger: r = !0,
  envStage: o,
  envPulse: s = !0
}) => {
  const [i, c] = Se(e), a = t ?? i, l = (u) => {
    n == null || n(u), t === void 0 && c(u);
  };
  return qe(() => {
    if (a) {
      window.history.pushState({ vpsChatOpen: !0 }, "");
      const u = () => {
        l(!1);
      };
      return window.addEventListener("popstate", u), () => {
        window.removeEventListener("popstate", u);
      };
    }
  }, [a]), /* @__PURE__ */ U(zt, { children: [
    r && !a && /* @__PURE__ */ b(Pg, { onOpen: () => l(!0) }),
    /* @__PURE__ */ b(
      wg,
      {
        open: a,
        onClose: () => l(!1),
        envStage: o,
        envPulse: s
      }
    )
  ] });
}, Ng = ({
  apiBaseUrl: e,
  apiUrl: t,
  proxyUrl: n,
  userContext: r,
  role: o,
  roleId: s,
  client: i,
  welcomeMessage: c,
  suggestions: a,
  disableSuggestions: l,
  initialMessage: u,
  hideInspectSources: f,
  showGroundedSources: p,
  modelId: h,
  ...d
}) => {
  const g = no(), m = e ?? t ?? n;
  return !!g && (!m || Lt(m) === Lt(g == null ? void 0 : g.apiBaseUrl)) && !r && o === void 0 && s === void 0 && i === void 0 && c === void 0 && !a && l === void 0 && !u && f === void 0 && p === void 0 && h === void 0 ? /* @__PURE__ */ b(Ys, { ...d }) : /* @__PURE__ */ b(
    Qs,
    {
      apiBaseUrl: m,
      userContext: r,
      role: o,
      roleId: s,
      client: i,
      welcomeMessage: c,
      suggestions: a,
      disableSuggestions: l,
      initialMessage: u,
      hideInspectSources: f,
      showGroundedSources: p,
      modelId: h,
      children: /* @__PURE__ */ b(Ys, { ...d })
    }
  );
}, Mg = {
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
  Gc as ChatPanel,
  Qs as ChatProvider,
  kg as ChatbotWidget,
  Mg as ColorPalette,
  Ng as EmbeddedChatbot,
  dr as buildApiUrl,
  Ag as chatApi,
  Zs as createChatApi,
  Lt as resolveApiBaseUrl,
  aa as useChatContext,
  er as useChatbot,
  no as useOptionalChatContext
};
