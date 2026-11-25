import { jsx as s, jsxs as v, Fragment as Be } from "react/jsx-runtime";
import * as d from "react";
import ce, { createContext as Tt, useContext as at, useMemo as Me, useState as j, useRef as ne, useCallback as le, forwardRef as Ft, createElement as Xe, useId as Qe, useEffect as _e, useImperativeHandle as er } from "react";
const tr = {};
function Ce(e) {
  return e != null && e.trim() !== "" ? e.trim().replace(/\/+$/, "") : String("").trim().replace(/\/+$/, "");
}
function Ue(e, t) {
  const r = Ce(e);
  if (!r)
    return t;
  if (r.endsWith("/api") && t.startsWith("/api/"))
    return `${r}${t.slice(4)}`;
  if (r.endsWith("/api") && t === "/health") {
    const a = r.slice(0, -4);
    return a ? `${a}/health` : "/health";
  }
  const n = t.startsWith("/") ? t : `/${t}`;
  return `${r}${n}`;
}
function pt(e) {
  return e && typeof e == "object" && "data" in e && e.success !== !1 ? e.data : e;
}
function ft(e, t, r) {
  var o, i, l;
  const n = e, a = (o = n == null ? void 0 : n.error) == null ? void 0 : o.message;
  return a && !rr(a) ? {
    code: (i = n == null ? void 0 : n.error) == null ? void 0 : i.code,
    message: a,
    requestId: (l = n == null ? void 0 : n.error) == null ? void 0 : l.request_id
  } : r >= 500 ? { message: "I couldn't process that request right now." } : r === 0 ? { message: "Something went wrong while connecting. Please try again." } : { message: t };
}
function rr(e) {
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
function nr(e) {
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
async function Ze(e) {
  const t = await e.text();
  if (!t) return {};
  try {
    return JSON.parse(t);
  } catch {
    return {};
  }
}
function Rt(e) {
  const t = Ce(e);
  async function r(n, a) {
    let o;
    const i = Ue(t, n);
    try {
      o = await fetch(i, {
        ...a,
        headers: {
          "Content-Type": "application/json",
          ...(a == null ? void 0 : a.headers) ?? {}
        }
      });
    } catch {
      throw { message: "Something went wrong while connecting. Please try again." };
    }
    if (o.status === 204)
      return;
    const l = await Ze(o);
    if (!o.ok)
      throw ft(
        l,
        "I couldn't process that request right now.",
        o.status
      );
    return pt(l);
  }
  return {
    apiBaseUrl: t,
    async listModels() {
      try {
        const n = await r("/api/v1/models");
        return { defaultModelId: n.default_model_id, complexModelId: n.complex_model_id, models: n.models || [] };
      } catch {
        return null;
      }
    },
    async createSession(n) {
      const a = await r("/api/v1/sessions", {
        method: "POST",
        signal: n,
        body: JSON.stringify({})
      });
      return { sessionId: a.session_id, createdAt: a.created_at };
    },
    async sendMessage(n, a, o, i) {
      const l = await r(
        `/api/v1/sessions/${n}/messages`,
        {
          method: "POST",
          signal: i,
          body: JSON.stringify({
            message: a,
            ...(o == null ? void 0 : o.roleId) !== void 0 ? { role_id: o.roleId } : {},
            ...o != null && o.client ? { client: o.client } : {},
            ...o != null && o.modelId ? { model_id: o.modelId } : {}
          })
        }
      );
      return {
        requestId: l.request_id,
        sessionId: l.session_id,
        answer: l.answer,
        sources: (l.sources || []).map(je),
        toolCalls: (l.tool_calls || []).map(Ye),
        usage: Je(l.usage),
        durationMs: l.duration_ms
      };
    },
    async sendMessageStream(n, a, o, i, l, c) {
      var b, k;
      const f = Ue(t, `/api/v1/sessions/${n}/messages/stream`);
      try {
        const u = await fetch(f, {
          method: "POST",
          signal: c,
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            message: a,
            ...(o == null ? void 0 : o.roleId) !== void 0 ? { role_id: o.roleId } : {},
            ...o != null && o.client ? { client: o.client } : {},
            ...o != null && o.modelId ? { model_id: o.modelId } : {}
          })
        });
        if (!u.ok) {
          if (u.status === 404 || u.status === 405)
            return await this.sendMessage(n, a, o, c);
          const F = await Ze(u);
          throw ft(
            F,
            "I couldn't process that request right now.",
            u.status
          );
        }
        if (!u.body || (k = (b = u.headers) == null ? void 0 : b.get("content-type")) != null && k.includes("application/json")) {
          const F = pt(await Ze(u));
          if (typeof F.answer != "string" || !F.usage)
            throw { message: "The response stream ended unexpectedly." };
          return {
            requestId: F.request_id,
            sessionId: F.session_id,
            answer: F.answer,
            sources: (F.sources || []).map(je),
            toolCalls: (F.tool_calls || []).map(Ye),
            usage: Je(F.usage),
            durationMs: F.duration_ms
          };
        }
        const m = u.body.getReader(), p = new TextDecoder();
        let g = "";
        const h = { value: null }, w = (F) => {
          const y = F.split(/\r?\n/).filter((M) => M.startsWith("data:")).map((M) => M.slice(5).trimStart()).join(`
`);
          if (!y) return;
          let C = {};
          try {
            const M = JSON.parse(y);
            if (!M || typeof M != "object") return;
            C = M;
          } catch {
            return;
          }
          if (C.type === "progress" && typeof C.stage == "string")
            i == null || i(C.stage);
          else if (C.type === "token" && typeof C.text == "string")
            l == null || l(C.text);
          else if (C.type === "complete")
            h.value = {
              requestId: C.request_id || "",
              sessionId: C.session_id || n,
              answer: C.answer || "",
              sources: (C.sources || []).map(je),
              toolCalls: (C.tool_calls || []).map(Ye),
              usage: C.usage ? Je(C.usage) : { model: "", promptTokens: 0, completionTokens: 0, totalTokens: 0 },
              durationMs: C.duration_ms
            };
          else if (C.type === "error")
            throw {
              message: C.message || "I couldn't process that request right now.",
              requestId: C.request_id
            };
        };
        try {
          for (; !h.value; ) {
            const { done: F, value: y } = await m.read();
            if (F) break;
            if (g += p.decode(y, { stream: !0 }), g.length > 1e6)
              throw { message: "The response stream was too large." };
            const C = g.split(/\r?\n\r?\n/);
            g = C.pop() || "";
            for (const M of C)
              if (w(M), h.value) break;
          }
          g += p.decode(), !h.value && g.trim() && w(g);
        } finally {
          await m.cancel().catch(() => {
          }), m.releaseLock();
        }
        const P = h.value;
        if (P)
          return P;
        throw { message: "The response stream ended before the answer was complete." };
      } catch (u) {
        throw !(u instanceof Error) && u && typeof u == "object" && "message" in u ? u : { message: "Something went wrong while connecting. Please try again." };
      }
    },
    async getHistory(n) {
      try {
        return ((await r(
          `/api/v1/sessions/${n}/messages`
        )).messages || []).map(nr);
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
        const n = Ue(t, "/health");
        return (await fetch(n)).ok;
      } catch {
        return !1;
      }
    }
  };
}
const ss = Rt(), sr = [
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
], lt = Tt(null);
function or() {
  const e = at(lt);
  if (!e)
    throw new Error("useChatbot must be used inside ChatProvider.");
  return e;
}
function it() {
  return at(lt);
}
function ke(e, t, r, n) {
  if (typeof performance.measure != "function") return;
  const a = `vps-chatbot:${e}`;
  performance.clearMeasures(a), performance.measure(a, { start: t, end: r, detail: n ? { requestId: n } : null });
}
const ar = `Hello! I am your **VPS Veritas assistant**.

I can help you with:
- **Fuel Quality Testing (FQT)** & **Oil Condition Monitoring (OCM)**
- **Fuel Defect Reporting (FDR)** — report and track bunker defect incidents
- **Bunker Master** — manage bunkering operations, BDN logs, and surveys
- **FSC & FSQ E-Forms** — paperless fuel system checks and bunker sample pre-registration
- **Samplogic** sample logistics, report downloads, and support tickets

Feel free to ask a question or select one of the suggested topics below!`;
function mt(e) {
  return `${e}-${crypto.randomUUID()}`;
}
function lr(e) {
  if (e && typeof e == "object" && "message" in e) {
    const t = String(e.message);
    if (t && !/traceback|sql|exception|stack|api[_ ]?key|password/i.test(t))
      return t;
  }
  return "I couldn't process that request right now.";
}
const Et = ({
  children: e,
  userContext: t = {},
  role: r,
  roleId: n,
  client: a,
  welcomeMessage: o,
  suggestions: i = sr,
  disableSuggestions: l = !1,
  initialMessage: c,
  apiBaseUrl: f,
  apiUrl: b,
  proxyUrl: k,
  api: u,
  hideInspectSources: m = !1,
  showGroundedSources: p = !1,
  modelId: g = "auto"
}) => {
  const h = f ?? b ?? k, w = Me(
    () => u ?? Rt(h),
    [u, h]
  ), P = Me(() => ({
    ...t,
    ...r !== void 0 ? { role: r } : {},
    ...n !== void 0 ? { roleId: n } : {},
    ...a !== void 0 ? { client: a } : {}
  }), [t, r, n, a]), F = Me(() => o === "" ? null : {
    id: "welcome-default",
    role: "assistant",
    content: o || ar,
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    status: "complete"
  }, [o]), [y, C] = j(null), [M, I] = j(() => F ? [F] : []), [V, z] = j("idle"), [ue, ee] = j(null), S = ne(null), N = ne(!1), D = ne(null), x = ne(null), L = ne(!1), [H, $] = j([]), [J, ae] = j(g);
  ce.useEffect(() => ae(g), [g]), ce.useEffect(() => {
    var R;
    let T = !0;
    return $([]), (R = w.listModels) == null || R.call(w).then((B) => {
      T && $((B == null ? void 0 : B.models) || []);
    }).catch(() => {
    }), () => {
      T = !1;
    };
  }, [w]);
  const ge = le((T) => {
    !L.current && (T === "auto" || H.some((R) => R.id === T && R.configured)) && ae(T);
  }, [H]);
  ce.useEffect(() => () => {
    var T;
    return (T = D.current) == null ? void 0 : T.abort();
  }, []), ce.useLayoutEffect(() => {
    const T = x.current;
    if (!T) return;
    const R = M.find((te) => te.id === T.messageId), B = performance.now();
    (R == null ? void 0 : R.status) === "complete" && T.completedAt !== void 0 ? (ke("completion-to-commit", T.completedAt, B), ke("submit-to-complete-commit", T.startedAt, B), x.current = null) : (R == null ? void 0 : R.status) === "pending" && R.content && T.firstTokenAt !== void 0 && !T.firstCommitRecorded && (ke("first-token-to-commit", T.firstTokenAt, B), T.firstCommitRecorded = !0);
  }, [M]);
  const be = le(async (T) => {
    if (y) return y;
    z("connecting");
    const R = await w.createSession(T);
    if (T.aborted) throw new DOMException("Aborted", "AbortError");
    return C(R.sessionId), R.sessionId;
  }, [y, w]), ve = le(
    async (T) => {
      if (L.current) return;
      L.current = !0;
      const R = new AbortController();
      D.current = R;
      let B, te = "";
      const pe = () => {
        B !== void 0 && cancelAnimationFrame(B), B = void 0;
      };
      S.current = T;
      const qe = {
        id: mt("user"),
        role: "user",
        content: T,
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        status: "complete"
      }, re = mt("asst"), Re = "Preparing your answer…", Oe = {
        id: re,
        streamId: re,
        role: "assistant",
        content: "",
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        status: "pending",
        progressText: Re,
        progressSteps: [Re]
      }, Ee = performance.now(), se = { messageId: re, startedAt: Ee };
      x.current = se, I((oe) => [...oe, qe, Oe]), z("awaiting"), ee(null);
      const ze = (oe) => {
        const Q = oe.trim();
        !Q || R.signal.aborted || I(
          (K) => K.map(
            (Y) => Y.id === re && Y.progressText !== Q ? {
              ...Y,
              progressText: Q,
              progressSteps: [...Y.progressSteps ?? [], Q]
            } : Y
          )
        );
      };
      try {
        const oe = await be(R.signal), Q = performance.now();
        ke("request-preparation", Ee, Q);
        const K = w.sendMessageStream ? await w.sendMessageStream(
          oe,
          T,
          {
            roleId: P.roleId,
            client: P.client,
            modelId: J
          },
          ze,
          (Y) => {
            R.signal.aborted || (Y && se.firstTokenAt === void 0 && (se.firstTokenAt = performance.now(), ke("first-token-received", Q, se.firstTokenAt)), te += Y, B === void 0 && (B = requestAnimationFrame(() => {
              B = void 0, R.signal.aborted || I((fe) => fe.map((Ae) => Ae.id === re ? { ...Ae, content: te } : Ae));
            })));
          },
          R.signal
        ) : await w.sendMessage(oe, T, {
          roleId: P.roleId,
          client: P.client,
          modelId: J
        }, R.signal);
        if (pe(), R.signal.aborted) return;
        se.messageId = K.requestId || re, se.completedAt = performance.now(), ke("completion-received", Q, se.completedAt, K.requestId), I(
          (Y) => Y.map(
            (fe) => fe.id === re ? {
              ...fe,
              id: K.requestId || re,
              content: K.answer,
              status: "complete",
              progressText: void 0,
              sources: K.sources,
              toolCalls: K.toolCalls,
              usage: K.usage,
              durationMs: Math.max(
                Math.round(performance.now() - Ee),
                K.durationMs ?? 0
              )
            } : fe
          )
        ), z("idle");
      } catch (oe) {
        if (pe(), x.current === se && (x.current = null), R.signal.aborted) return;
        const Q = lr(oe);
        I(
          (K) => K.map(
            (Y) => Y.id === re ? { ...Y, content: Q, status: "error", progressText: void 0 } : Y
          )
        ), ee(Q), z("error");
      } finally {
        pe(), D.current === R && (D.current = null, L.current = !1);
      }
    },
    [be, w, P.client, P.roleId, J]
  ), Z = le(
    async (T) => {
      const R = T.trim();
      !R || V === "awaiting" || V === "connecting" || await ve(R);
    },
    [ve, V]
  ), de = le(async () => {
    if (L.current) return;
    const T = S.current;
    T && (I((R) => R.filter((B) => B.status !== "error")), await ve(T));
  }, [ve]), W = le(() => {
    const T = D.current;
    T && (T.abort(), D.current = null, L.current = !1, x.current = null, I((R) => R.map(
      (B) => B.status === "pending" ? { ...B, status: "stopped", progressText: void 0 } : B
    )), z("idle"));
  }, []), ye = le(
    (T, R) => {
      I((B) => B.map(
        (te) => te.id === T ? { ...te, feedback: te.feedback === R ? void 0 : R } : te
      ));
    },
    []
  ), Fe = le(async () => {
  }, []), he = le(() => {
  }, []), U = le(async () => {
    var T;
    (T = D.current) == null || T.abort(), D.current = null, L.current = !1, C(null), I(F ? [F] : []), z("idle"), ee(null), S.current = null, y && await w.closeSession(y);
  }, [y, w, F]);
  ce.useEffect(() => {
    !c || N.current || (N.current = !0, Z(c));
  }, [c, Z]);
  const Le = Me(
    () => ({
      messages: M,
      status: V,
      error: ue,
      sessionId: y,
      pendingTicket: null,
      ticketBusy: !1,
      lastTicket: null,
      suggestions: i,
      showSuggestions: !l && (M.length === 0 || M.length === 1 && M[0].id === "welcome-default"),
      suggestionBadgesEnabled: !l,
      userContext: P,
      apiBaseUrl: w.apiBaseUrl,
      hideInspectSources: m,
      showGroundedSources: p,
      sendMessage: Z,
      stopResponse: W,
      toggleMessageFeedback: ye,
      retryLast: de,
      confirmTicket: Fe,
      cancelTicket: he,
      resetConversation: U,
      models: H,
      selectedModelId: J,
      selectModel: ge
    }),
    [
      M,
      V,
      ue,
      y,
      i,
      l,
      P,
      w.apiBaseUrl,
      m,
      p,
      Z,
      W,
      ye,
      de,
      Fe,
      he,
      U,
      H,
      J,
      ge
    ]
  );
  return /* @__PURE__ */ s(lt.Provider, { value: Le, children: e });
};
function At(e) {
  var t, r, n = "";
  if (typeof e == "string" || typeof e == "number") n += e;
  else if (typeof e == "object") if (Array.isArray(e)) {
    var a = e.length;
    for (t = 0; t < a; t++) e[t] && (r = At(e[t])) && (n && (n += " "), n += r);
  } else for (r in e) e[r] && (n && (n += " "), n += r);
  return n;
}
function ir() {
  for (var e, t, r = 0, n = "", a = arguments.length; r < a; r++) (e = arguments[r]) && (t = At(e)) && (n && (n += " "), n += t);
  return n;
}
function q(...e) {
  return ir(e);
}
function Mt({
  className: e,
  variant: t = "default",
  ...r
}) {
  return /* @__PURE__ */ s("div", { ...r, "data-slot": "marker", "data-variant": t, className: q("chat-marker", e) });
}
function cr({ className: e, ...t }) {
  return /* @__PURE__ */ s("span", { ...t, "data-slot": "marker-icon", className: q("chat-marker-icon", e), "aria-hidden": "true" });
}
function It({ className: e, ...t }) {
  return /* @__PURE__ */ s("span", { ...t, "data-slot": "marker-content", className: q("chat-marker-content", e) });
}
function Ge() {
  return or();
}
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const ur = (e) => e.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase(), Nt = (...e) => e.filter((t, r, n) => !!t && t.trim() !== "" && n.indexOf(t) === r).join(" ").trim();
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
var dr = {
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
const hr = Ft(
  ({
    color: e = "currentColor",
    size: t = 24,
    strokeWidth: r = 2,
    absoluteStrokeWidth: n,
    className: a = "",
    children: o,
    iconNode: i,
    ...l
  }, c) => Xe(
    "svg",
    {
      ref: c,
      ...dr,
      width: t,
      height: t,
      stroke: e,
      strokeWidth: n ? Number(r) * 24 / Number(t) : r,
      className: Nt("lucide", a),
      ...l
    },
    [
      ...i.map(([f, b]) => Xe(f, b)),
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
const O = (e, t) => {
  const r = Ft(
    ({ className: n, ...a }, o) => Xe(hr, {
      ref: o,
      iconNode: t,
      className: Nt(`lucide-${ur(e)}`, n),
      ...a
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
const pr = O("ArrowDown", [
  ["path", { d: "M12 5v14", key: "s699le" }],
  ["path", { d: "m19 12-7 7-7-7", key: "1idqje" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const fr = O("ArrowLeft", [
  ["path", { d: "m12 19-7-7 7-7", key: "1l729n" }],
  ["path", { d: "M19 12H5", key: "x3x0zl" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const mr = O("ArrowUp", [
  ["path", { d: "m5 12 7-7 7 7", key: "hav0vg" }],
  ["path", { d: "M12 19V5", key: "x0mq9r" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const gr = O("BookOpen", [
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
const Dt = O("BotMessageSquare", [
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
const ct = O("Check", [["path", { d: "M20 6 9 17l-5-5", key: "1gmf2c" }]]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const br = O("ChevronRight", [
  ["path", { d: "m9 18 6-6-6-6", key: "mthhwq" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const vr = O("CircleAlert", [
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
const yr = O("CircleCheck", [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["path", { d: "m9 12 2 2 4-4", key: "dzmm74" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const kr = O("ClipboardCheck", [
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
const Bt = O("Copy", [
  ["rect", { width: "14", height: "14", x: "8", y: "8", rx: "2", ry: "2", key: "17jyea" }],
  ["path", { d: "M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2", key: "zix9uf" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const wr = O("ExternalLink", [
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
const _r = O("FlaskConical", [
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
const Cr = O("Library", [
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
const Sr = O("LoaderCircle", [
  ["path", { d: "M21 12a9 9 0 1 1-6.219-8.56", key: "13zald" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Pt = O("MessageSquare", [
  ["path", { d: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z", key: "1lielz" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Tr = O("Microscope", [
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
const Fr = O("Minus", [["path", { d: "M5 12h14", key: "1ays0h" }]]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Rr = O("Pencil", [
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
const Er = O("RefreshCw", [
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
const xt = O("Square", [
  ["rect", { width: "18", height: "18", x: "3", y: "3", rx: "2", key: "afitv7" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Ar = O("TestTubeDiagonal", [
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
const Mr = O("ThumbsDown", [
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
const Ir = O("ThumbsUp", [
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
const Nr = O("Wrench", [
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
const Dr = O("X", [
  ["path", { d: "M18 6 6 18", key: "1bl5f8" }],
  ["path", { d: "m6 6 12 12", key: "d8bk6v" }]
]);
function ut({
  align: e = "start",
  className: t,
  ...r
}) {
  return /* @__PURE__ */ s("div", { ...r, "data-slot": "message", "data-align": e, className: q("chat-message", t) });
}
function Lt({ className: e, ...t }) {
  return /* @__PURE__ */ s("div", { ...t, "data-slot": "message-avatar", className: q("chat-message-avatar", e) });
}
function dt({ className: e, ...t }) {
  return /* @__PURE__ */ s("div", { ...t, "data-slot": "message-content", className: q("chat-message-content", e) });
}
function Br({ className: e, ...t }) {
  return /* @__PURE__ */ s("div", { ...t, "data-slot": "message-header", className: q("chat-message-header", e) });
}
function et({ className: e, ...t }) {
  return /* @__PURE__ */ s("div", { ...t, "data-slot": "message-footer", className: q("chat-message-footer", e) });
}
function we({ className: e, ...t }) {
  return /* @__PURE__ */ s("div", { "data-slot": "trace", className: q("trace", e), ...t });
}
function Ie({
  className: e,
  status: t,
  ...r
}) {
  return /* @__PURE__ */ s("span", { "data-slot": "trace-line", "data-status": t, className: q("trace-line", e), ...r });
}
function Se({ className: e, ...t }) {
  return /* @__PURE__ */ s("span", { "data-slot": "trace-icon", className: q("trace-icon", e), ...t, "aria-hidden": "true" });
}
function Ne({ className: e, ...t }) {
  return /* @__PURE__ */ s("span", { "data-slot": "trace-title", className: q("trace-title", e), ...t });
}
function tt({ className: e, ...t }) {
  return /* @__PURE__ */ s("span", { "data-slot": "trace-description", className: q("trace-description", e), ...t });
}
const qt = Tt(null);
function Ot() {
  const e = at(qt);
  if (!e) throw new Error("Trace disclosure parts require TraceCollapsible.");
  return e;
}
function zt({
  open: e,
  defaultOpen: t = !1,
  onOpenChange: r,
  children: n,
  ...a
}) {
  const [o, i] = j(t), l = Qe(), c = e ?? o;
  function f() {
    e === void 0 && i(!c), r == null || r(!c);
  }
  return /* @__PURE__ */ s(qt.Provider, { value: { contentId: l, open: c, toggle: f }, children: /* @__PURE__ */ s("div", { "data-slot": "trace-collapsible", ...a, children: n }) });
}
function Ht({
  children: e,
  className: t,
  onClick: r,
  ...n
}) {
  const { contentId: a, open: o, toggle: i } = Ot();
  return /* @__PURE__ */ v(
    "button",
    {
      ...n,
      type: "button",
      "data-slot": "trace-collapsible-trigger",
      className: q("trace-trigger", t),
      "aria-expanded": o,
      "aria-controls": a,
      onClick: (l) => {
        r == null || r(l), l.defaultPrevented || i();
      },
      children: [
        e,
        /* @__PURE__ */ s(Se, { className: "trace-chevron", children: /* @__PURE__ */ s(br, { size: 13 }) })
      ]
    }
  );
}
function $t({
  children: e,
  className: t,
  keepMounted: r = !1,
  ...n
}) {
  const { contentId: a, open: o } = Ot();
  return /* @__PURE__ */ s(
    "div",
    {
      ...n,
      id: a,
      "data-slot": "trace-collapsible-content",
      className: q("trace-content", t),
      hidden: !o,
      children: (o || r) && e
    }
  );
}
const Pr = ({ message: e, onRetry: t }) => /* @__PURE__ */ s(
  ut,
  {
    className: "chat-error-banner",
    role: "alert",
    children: /* @__PURE__ */ v(dt, { children: [
      /* @__PURE__ */ s(we, { className: "chat-message-body", children: /* @__PURE__ */ v(Ie, { status: "error", children: [
        /* @__PURE__ */ s(Se, { children: /* @__PURE__ */ s(vr, { size: 14 }) }),
        /* @__PURE__ */ s(Ne, { className: "chat-error-title", children: e })
      ] }) }),
      t && /* @__PURE__ */ s(et, { children: /* @__PURE__ */ s("button", { type: "button", onClick: t, className: "chat-error-retry-btn", children: "Try again" }) })
    ] })
  }
), xr = {
  alpha: {
    label: "Alpha",
    Icon: _r,
    variant: "env-badge--alpha",
    tooltip: "Alpha build — internal testing only"
  },
  beta: {
    label: "Beta",
    Icon: Ar,
    variant: "env-badge--beta",
    tooltip: "Beta build — public pre-release"
  },
  gamma: {
    label: "Gamma",
    Icon: Tr,
    variant: "env-badge--gamma",
    tooltip: "Gamma / Release Candidate"
  },
  qa: {
    label: "QA",
    Icon: kr,
    variant: "env-badge--qa",
    tooltip: "Quality Assurance build"
  }
}, Lr = ({
  stage: e,
  pulse: t = !0,
  className: r = ""
}) => {
  if (!e) return null;
  const { label: n, Icon: a, variant: o, tooltip: i } = xr[e];
  return /* @__PURE__ */ v(
    "span",
    {
      className: `env-badge-inline ${o} ${r}`.trim(),
      title: i,
      "aria-label": `${n} build`,
      role: "status",
      children: [
        /* @__PURE__ */ s(a, { size: 10, className: "env-badge-icon", "aria-hidden": "true" }),
        /* @__PURE__ */ s("span", { className: "env-badge-inline-label", children: n })
      ]
    }
  );
}, qr = (e) => /* @__PURE__ */ s(
  "svg",
  {
    width: e.width || "24px",
    height: e.height || "24px",
    viewBox: "0 0 24 24",
    role: "img",
    xmlns: "http://www.w3.org/2000/svg",
    fill: e.Color || "currentColor",
    ...e,
    children: /* @__PURE__ */ s("path", { d: "M11.999 0c-2.25 0-4.5.06-6.6.21a5.57 5.57 0 0 0-5.19 5.1c-.24 3.21-.27 6.39-.06 9.6a5.644 5.644 0 0 0 5.7 5.19h3.15v-3.9h-3.15c-.93.03-1.74-.63-1.83-1.56-.18-3-.15-6 .06-9 .06-.84.72-1.47 1.56-1.53 2.04-.15 4.2-.21 6.36-.21s4.32.09 6.36.18c.81.06 1.5.69 1.56 1.53.24 3 .24 6 .06 9-.12.93-.9 1.62-1.83 1.59h-3.15l-6 3.9V24l6-3.9h3.15c2.97.03 5.46-2.25 5.7-5.19.21-3.18.18-6.39-.03-9.57a5.57 5.57 0 0 0-5.19-5.1c-2.13-.18-4.38-.24-6.63-.24zm-5.04 8.76c-.36 0-.66.3-.66.66v2.34c0 .33.18.63.48.78 1.62.78 3.42 1.2 5.22 1.26 1.8-.06 3.6-.48 5.22-1.26.3-.15.48-.45.48-.78V9.42c0-.09-.03-.15-.09-.21a.648.648 0 0 0-.87-.36c-1.5.66-3.12 1.02-4.77 1.05-1.65-.03-3.27-.42-4.77-1.08a.566.566 0 0 0-.24-.06z" })
  }
), Or = ({
  title: e = "VPS AI Assistant",
  subtitle: t = "Customer portal support",
  onClose: r,
  onReset: n,
  onBack: a,
  showMinimize: o = !1,
  envStage: i,
  envPulse: l = !0
}) => /* @__PURE__ */ v("header", { className: "chat-header", children: [
  /* @__PURE__ */ v("div", { className: "chat-header-left", children: [
    a && /* @__PURE__ */ s(
      "button",
      {
        type: "button",
        onClick: a,
        className: "icon-btn-back",
        "aria-label": "Back",
        children: /* @__PURE__ */ s(fr, { size: 16 })
      }
    ),
    /* @__PURE__ */ s(
      "div",
      {
        className: "avatar-circle",
        "aria-hidden": "true",
        children: /* @__PURE__ */ s(qr, { width: "16px", height: "16px", color: "white" })
      }
    ),
    /* @__PURE__ */ v("div", { children: [
      /* @__PURE__ */ v("div", { className: "chat-header-title-row", children: [
        /* @__PURE__ */ s("h2", { className: "chat-header-title", children: e }),
        /* @__PURE__ */ s(Lr, { stage: i, pulse: l })
      ] }),
      /* @__PURE__ */ s("p", { className: "chat-header-subtitle", children: t || "Customer portal support" })
    ] })
  ] }),
  /* @__PURE__ */ v("div", { className: "chat-header-actions", children: [
    n && /* @__PURE__ */ s(
      "button",
      {
        type: "button",
        onClick: n,
        className: "icon-btn-action",
        "aria-label": "Start a new conversation",
        title: "New conversation",
        children: /* @__PURE__ */ s(Er, { size: 15 })
      }
    ),
    r && /* @__PURE__ */ s(
      "button",
      {
        type: "button",
        onClick: r,
        className: "icon-btn-action",
        "aria-label": o ? "Minimize chat" : "Close chat",
        children: /* @__PURE__ */ s(Fr, { size: 16 })
      }
    )
  ] })
] });
function zr(e, t) {
  const r = ne(e);
  _e(() => {
    var n;
    r.current && !e && ((n = t.current) == null || n.focus()), r.current = e;
  }, [e, t]);
}
function Hr({ className: e, ...t }) {
  return /* @__PURE__ */ s("div", { ...t, "data-slot": "input-group", className: q("chat-input-group", e) });
}
function $r({ className: e, ...t }) {
  return /* @__PURE__ */ s("textarea", { ...t, "data-slot": "input-group-textarea", className: q("chat-textarea", e) });
}
function Wr({ className: e, ...t }) {
  return /* @__PURE__ */ s("div", { ...t, "data-slot": "input-group-addon", className: q("chat-input-actions", e) });
}
function gt({ className: e, ...t }) {
  return /* @__PURE__ */ s("button", { type: "button", ...t, "data-slot": "input-group-button", className: q("chat-send-btn", e) });
}
function Vr(e, t) {
  const r = t.trim().toLowerCase();
  return r ? e.filter(
    (n) => n.label.toLowerCase().includes(r) || n.query.toLowerCase().includes(r)
  ) : e;
}
const Gr = ({
  suggestions: e,
  onSelect: t,
  disabled: r,
  variant: n = "list"
}) => e.length ? n === "badge" ? /* @__PURE__ */ s(
  "ul",
  {
    className: "suggestions-badge-list",
    "aria-label": "Suggested questions",
    children: e.map((a) => /* @__PURE__ */ s("li", { className: "suggestion-badge-item", children: /* @__PURE__ */ s(
      "button",
      {
        type: "button",
        disabled: r,
        onClick: () => t(a),
        title: a.query,
        className: "suggestion-badge-btn",
        children: a.label
      }
    ) }, a.query))
  }
) : /* @__PURE__ */ s("div", { className: "suggestions-list", children: e.map((a) => /* @__PURE__ */ s(
  "button",
  {
    type: "button",
    disabled: r,
    onClick: () => t(a),
    className: "suggestion-list-btn",
    children: a.label
  },
  a.query
)) }) : null, Ur = ({
  onSend: e,
  onStop: t,
  disabled: r = !1,
  placeholder: n = "Ask something…",
  ref: a
}) => {
  const { suggestions: o, showSuggestions: i, suggestionBadgesEnabled: l, models: c, selectedModelId: f, selectModel: b } = Ge(), [k, u] = j(""), m = ne(null), p = Qe(), g = Qe(), h = (y) => {
    y && (y.style.height = "auto", y.style.height = `${Math.min(y.scrollHeight, 96)}px`);
  };
  zr(r, m), er(a, () => ({
    edit(y) {
      var C;
      r || (u(y), (C = m.current) == null || C.focus());
    }
  }), [r]), _e(() => {
    h(m.current);
  }, [k]);
  const w = Me(() => {
    if (!l || r) return [];
    const y = k.trim();
    return y ? Vr(o, y) : i ? o : [];
  }, [r, i, l, o, k]), P = (y) => {
    u(y.query);
    const C = m.current;
    C == null || C.focus();
  }, F = () => {
    const y = k.trim();
    !y || r || (e(y), u(""));
  };
  return /* @__PURE__ */ v("div", { className: "chat-input-wrapper", children: [
    /* @__PURE__ */ s(
      Gr,
      {
        variant: "badge",
        suggestions: w,
        onSelect: P,
        disabled: r
      }
    ),
    /* @__PURE__ */ v("form", { onSubmit: (y) => {
      y.preventDefault(), F();
    }, children: [
      /* @__PURE__ */ s("label", { htmlFor: p, className: "sr-only", children: "Chat message" }),
      /* @__PURE__ */ v(Hr, { children: [
        /* @__PURE__ */ s(
          $r,
          {
            id: p,
            ref: m,
            rows: 1,
            value: k,
            disabled: r,
            placeholder: n,
            onChange: (y) => u(y.target.value),
            onKeyDown: (y) => {
              var C;
              y.key === "Enter" && !y.shiftKey && !y.nativeEvent.isComposing && (y.preventDefault(), (C = y.currentTarget.form) == null || C.requestSubmit());
            }
          }
        ),
        /* @__PURE__ */ v(Wr, { children: [
          c.length > 1 && /* @__PURE__ */ v("div", { className: "chat-model-picker", children: [
            /* @__PURE__ */ s("label", { htmlFor: g, className: "sr-only", children: "AI model" }),
            /* @__PURE__ */ v(
              "select",
              {
                id: g,
                value: f,
                disabled: r,
                onChange: (y) => b(y.target.value),
                children: [
                  /* @__PURE__ */ s("option", { value: "auto", children: "Automatic" }),
                  c.map((y) => /* @__PURE__ */ s("option", { value: y.id, disabled: !y.configured, children: y.label }, y.id))
                ]
              }
            )
          ] }),
          t ? /* @__PURE__ */ s(gt, { onClick: t, "aria-label": "Stop response", title: "Stop response", children: /* @__PURE__ */ s(xt, { size: 13, fill: "currentColor", "aria-hidden": "true" }) }) : /* @__PURE__ */ s(gt, { type: "submit", disabled: r || !k.trim(), "aria-label": "Send message", title: "Send message", children: /* @__PURE__ */ s(mr, { size: 16, "aria-hidden": "true" }) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ v("p", { className: "chat-input-footer", children: [
      /* @__PURE__ */ s("span", { className: "chat-input-note", children: "AI can make mistakes." }),
      "Powered by ",
      /* @__PURE__ */ s("span", { className: "chat-input-footer-brand", children: "VPS Veritas AI" })
    ] })
  ] });
};
function jr({ defaultTagName: e, props: t, render: r, state: n = {}, stateAttributesMapping: a }) {
  let o = rt(Yr(n, a), t);
  if (!r) return d.createElement(e, o);
  if (typeof r == "function") return r(o, n);
  if (!d.isValidElement(r)) return null;
  let i = r.props, l = { ...rt(o, i), ref: Pe(o.ref, i.ref) };
  return d.cloneElement(r, l);
}
function rt(...e) {
  let t = {};
  for (let r of e) {
    if (!r) continue;
    let n = r;
    for (let a of Object.keys(n)) {
      let o = n[a];
      if (o === void 0) continue;
      let i = t[a];
      a === "className" ? t[a] = [i, o].filter(Boolean).join(" ") : a === "style" ? t[a] = { ...i, ...o } : a === "ref" ? t[a] = Pe(i, o) : Zr(a) && typeof i == "function" && typeof o == "function" ? t[a] = Jr(o, i) : t[a] = o;
    }
  }
  return t;
}
function Yr(e, t) {
  var n;
  let r = {};
  for (let a of Object.keys(e)) {
    let o = e[a], i = (n = t == null ? void 0 : t[a]) == null ? void 0 : n.call(t, o);
    if (i) {
      Object.assign(r, i);
      continue;
    }
    if (a === "slot") {
      r["data-slot"] = o;
      continue;
    }
    let l = `data-${String(a).replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}`;
    typeof o == "boolean" ? r[l] = o ? "" : void 0 : o != null && (r[l] = String(o));
  }
  return r;
}
function Jr(e, t) {
  return function(r) {
    e(r), r.defaultPrevented || t(r);
  };
}
function Zr(e) {
  return /^on[A-Z]/.test(e);
}
function Pe(...e) {
  let t = e.filter(Boolean);
  if (t.length !== 0) return (r) => {
    for (let n of t) typeof n == "function" ? n(r) : n && (n.current = r);
  };
}
var Kr = 8, Xr = 64, Qr = 0, We = 0.5, en = 180, tn = /* @__PURE__ */ new Set(["ArrowDown", "ArrowUp", "End", "Home", "PageDown", "PageUp", " "]), Wt = { start: !1, end: !1 }, rn = [], Ve = { currentAnchorId: null, visibleMessageIds: rn };
function nn({ content: e, scrollEdgeThreshold: t, spacer: r, viewport: n }) {
  if (!n || !e) return Wt;
  let a = ht({ content: e, spacer: r, viewport: n });
  return { start: n.scrollTop > t, end: a - n.scrollTop - n.clientHeight > t };
}
function sn({ content: e, scrollMargin: t, scrollPreviousItemPeek: r, spacer: n, viewport: a, visibleMessageIds: o }) {
  if (!e || !a) return Ve;
  let i = a.getBoundingClientRect(), l = i.top + t + r, c = typeof IntersectionObserver > "u", f = [], b = null;
  for (let k of De(e, n)) {
    let u = k.dataset.messageId;
    if (!u) continue;
    let m = k.dataset.scrollAnchor === "true", p = m || c ? k.getBoundingClientRect() : null;
    (c && p ? p.bottom > l && p.top < i.bottom : o.has(u)) && f.push(u), m && p && p.top <= l + We && (b = u);
  }
  return f.length === 0 && b === null ? Ve : { currentAnchorId: b, visibleMessageIds: f };
}
function De(e, t) {
  return Array.from(e.children).filter((r) => r instanceof HTMLElement && r !== t);
}
function on(e, t) {
  for (let r = t; r < e.length; r++) {
    let n = e[r];
    if ((n == null ? void 0 : n.dataset.scrollAnchor) === "true") return n;
  }
  return null;
}
function an(e, t) {
  for (let r of e) if (r.dataset.scrollAnchor === "true" && !t.has(r)) return r;
  return null;
}
function ln(e, t) {
  var n;
  let r = 0;
  for (let a = t; a < e.length; a++) if (((n = e[a]) == null ? void 0 : n.dataset.scrollAnchor) === "true" && (r += 1, r > 1)) return !0;
  return !1;
}
function cn(e) {
  for (let t = e.length - 1; t >= 0; t--) {
    let r = e[t];
    if ((r == null ? void 0 : r.dataset.scrollAnchor) === "true") return r;
  }
  return null;
}
function un({ content: e, spacer: t, viewport: r }) {
  let n = r.getBoundingClientRect();
  for (let a of De(e, t)) {
    if (!a.dataset.messageId) continue;
    let o = a.getBoundingClientRect();
    if (o.bottom > n.top && o.top < n.bottom) return a;
  }
  return null;
}
function dn({ align: e, element: t, scrollMargin: r, spacer: n, viewport: a }) {
  let o = Vt(t, a), i = t.getBoundingClientRect().height, l = fn(n);
  if (e === "center") {
    let c = Math.max(0, a.clientHeight - l.start - l.end);
    return o - l.start - (c - i) / 2 - r;
  }
  if (e === "end") return o - a.clientHeight + i + l.end + r;
  if (e === "nearest") {
    let c = o + i, f = a.scrollTop + l.start, b = a.scrollTop + a.clientHeight - l.end;
    return o >= f && c <= b ? a.scrollTop : o < f ? o - l.start - r : c - a.clientHeight + l.end + r;
  }
  return o - l.start - r;
}
function Vt(e, t) {
  let r = e.getBoundingClientRect(), n = t.getBoundingClientRect();
  return r.top - n.top + t.scrollTop;
}
function He(e, t) {
  return e.getBoundingClientRect().top - t.getBoundingClientRect().top;
}
function hn({ content: e, scrollTop: t, spacer: r, viewport: n }) {
  let a = ht({ content: e, spacer: r, viewport: n });
  return t + n.clientHeight - a;
}
function ht({ content: e, spacer: t, viewport: r }) {
  let n = De(e, t), a = Gt(e), o = r.getBoundingClientRect(), i = r.scrollTop, l = a.start + a.end;
  for (let c of n) {
    let f = c.getBoundingClientRect();
    l = Math.max(l, f.bottom - o.top + i + a.end);
  }
  return l;
}
function pn(e) {
  return Math.max(0, e.scrollHeight - e.clientHeight);
}
function Gt(e) {
  let t = window.getComputedStyle(e);
  return { end: nt(t.paddingBlockEnd || t.paddingBottom), start: nt(t.paddingBlockStart || t.paddingTop) };
}
function fn(e) {
  let t = e == null ? void 0 : e.parentElement;
  return t ? Gt(t) : { end: 0, start: 0 };
}
function mn(e) {
  if (!e) return 0;
  let t = window.getComputedStyle(e), r = t.rowGap === "normal" ? t.gap : t.rowGap;
  return nt(r);
}
function nt(e) {
  if (!e) return 0;
  let t = Number.parseFloat(e);
  return Number.isFinite(t) ? t : 0;
}
function Ut(e, t) {
  let r = e, n = /* @__PURE__ */ new Set();
  return { getSnapshot: () => r, hasListeners: () => n.size > 0, setSnapshot: (a) => {
    t(r, a) || (r = a, n.forEach((o) => o()));
  }, subscribe: (a, o, i) => {
    let l = n.size === 0;
    return n.add(a), l && (o == null || o()), () => {
      n.delete(a), n.size === 0 && (i == null || i());
    };
  } };
}
function bt(e, t) {
  return Ut(e, t);
}
function gn() {
  return Ut(Ve, vn);
}
function bn(e, t) {
  return e.start === t.start && e.end === t.end;
}
function vn(e, t) {
  return e.currentAnchorId !== t.currentAnchorId || e.visibleMessageIds.length !== t.visibleMessageIds.length ? !1 : e.visibleMessageIds.every((r, n) => r === t.visibleMessageIds[n]);
}
function yn({ autoScroll: e, defaultScrollPosition: t, scrollEdgeThreshold: r, scrollMargin: n, scrollPreviousItemPeek: a }) {
  let o = d.useRef(e), i = d.useRef(!1), l = d.useRef(null), c = d.useRef(!1), f = d.useRef(r), b = d.useRef(0), k = d.useRef(null), u = d.useRef(0), m = d.useRef(e ? "following-bottom" : "free-scrolling"), p = d.useRef(/* @__PURE__ */ new Map()), g = d.useRef(null), h = d.useRef(null), w = d.useRef(null), P = d.useRef(a), F = d.useRef(!0), y = d.useRef(null), C = d.useRef(n), M = d.useRef(null), I = d.useRef(0), V = d.useRef(0), z = d.useRef(null), ue = d.useRef(null), ee = d.useRef(null), S = d.useRef(null), N = d.useRef(null), D = d.useRef(null), x = d.useRef(null), L = d.useRef(null), H = d.useRef(null), $ = d.useRef(/* @__PURE__ */ new Set()), J = d.useRef(/* @__PURE__ */ new WeakSet());
  return ee.current === null && (ee.current = bt(t === "end" || t === "last-anchor", (ae, ge) => ae === ge)), S.current === null && (S.current = bt(Wt, bn)), H.current === null && (H.current = gn()), o.current = e, f.current = r, C.current = n, P.current = a, { autoScrollRef: o, autoscrollingRef: i, autoscrollingTimeoutRef: N, streamingTurnRef: w, contentRef: l, defaultScrollPositionAppliedRef: c, firstItemRef: k, itemCountRef: b, lastScrollTopRef: u, messageElementsRef: p, modeRef: m, pendingScrollFrameRef: M, pendingScrollToMessageRef: g, prependRestoreRef: h, preserveScrollOnPrependRef: F, pendingDefaultScrollStore: ee.current, rootRef: y, scrollEdgeThresholdRef: f, scrollMarginRef: C, scrollPreviousItemPeekRef: P, spacerGapRef: I, spacerHeightRef: V, spacerRef: z, stateFrameRef: ue, stateStore: S.current, viewportRef: D, visibilityFrameRef: x, visibilityObserverRef: L, visibilityStore: H.current, visibleMessageIdsRef: $, handledScrollAnchorsRef: J };
}
function jt(e) {
  e.pendingDefaultScrollStore.setSnapshot(!1);
}
function $e(e) {
  e.defaultScrollPositionAppliedRef.current = !0, jt(e);
}
function kn({ refs: e, commitScrollState: t, scheduleStateCommit: r, scheduleVisibilitySync: n }) {
  let { streamingTurnRef: a, autoScrollRef: o, autoscrollingRef: i, autoscrollingTimeoutRef: l, contentRef: c, itemCountRef: f, messageElementsRef: b, modeRef: k, pendingScrollToMessageRef: u, prependRestoreRef: m, scrollMarginRef: p, scrollPreviousItemPeekRef: g, spacerGapRef: h, spacerHeightRef: w, spacerRef: P, viewportRef: F } = e, y = d.useCallback((S) => {
    l.current !== null && (window.clearTimeout(l.current), l.current = null), i.current !== S && (i.current = S, t()), S && (l.current = window.setTimeout(() => {
      l.current = null, i.current = !1, t();
    }, en));
  }, [t]), C = d.useCallback((S) => {
    let N = P.current;
    if (!N) return;
    let D = Math.max(0, Math.ceil(S));
    w.current !== D && (w.current = D, N.hidden = D === 0, N.style.height = `${D}px`, N.style.marginTop = D > 0 ? `${-h.current}px` : "");
  }, []), M = d.useCallback((S, { behavior: N = "auto", autoscrolling: D = !1 } = {}) => {
    let x = F.current;
    if (!x) return;
    let L = Math.max(0, S);
    if (Math.abs(x.scrollTop - L) <= We) {
      x.scrollTop = L, t();
      return;
    }
    D && y(!0), x.scrollTo({ top: L, behavior: N }), r();
  }, [t, r, y]), I = d.useCallback(({ behavior: S = "auto" } = {}) => F.current ? (C(0), a.current = null, k.current = "free-scrolling", M(0, { behavior: S }), n(), !0) : !1, [n, M, C]), V = d.useCallback(({ behavior: S = "auto" } = {}) => {
    let N = F.current;
    return N ? (C(0), a.current = null, k.current = o.current ? "following-bottom" : "free-scrolling", M(pn(N), { autoscrolling: !0, behavior: S }), n(), !0) : !1;
  }, [n, M, C]), z = d.useCallback((S, { align: N = "start", behavior: D = "auto", scrollMargin: x = p.current } = {}, { keepPreviousPeek: L = !1 } = {}) => {
    let H = c.current, $ = F.current;
    if (!H || !$ || !H.contains(S)) return !1;
    let J = dn({ align: N, element: S, scrollMargin: L ? x + g.current : x, spacer: P.current, viewport: $ }), ae = hn({ content: H, scrollTop: J, spacer: P.current, viewport: $ });
    return C(ae), m.current = { element: S, viewportTop: He(S, $) }, k.current = L ? "anchored-to-message" : "settling-jump", a.current = L ? S : null, M(J, { behavior: D }), n(), !0;
  }, [n, M, C]), ue = d.useCallback(() => {
    let S = a.current;
    return !S || !S.isConnected || k.current !== "anchored-to-message" ? !1 : z(S, { align: "start" }, { keepPreviousPeek: !0 });
  }, [z]), ee = d.useCallback((S, N) => {
    let D = b.current.get(S);
    return D ? ($e(e), z(D, N) ? (u.current = null, !0) : (u.current = { messageId: S, options: N }, !0)) : f.current === 0 ? (u.current = { messageId: S, options: N }, $e(e), !0) : !1;
  }, [z]);
  return { flushPendingScrollToMessage: d.useCallback(() => {
    let S = u.current;
    if (!S) return !1;
    let N = b.current.get(S.messageId);
    return !N || !z(N, S.options) ? !1 : (u.current = null, $e(e), !0);
  }, [z]), reanchorToAnchoredMessage: ue, scrollToElement: z, scrollToEnd: V, scrollToMessage: ee, scrollToStart: I };
}
function vt(e, t) {
  return d.useCallback((r) => {
    e.current = r, r && t();
  }, [e, t]);
}
function wn({ autoScroll: e = !1, defaultScrollPosition: t = "end", scrollEdgeThreshold: r = Kr, scrollPreviousItemPeek: n = Xr, scrollMargin: a = Qr }) {
  let o = yn({ autoScroll: e, defaultScrollPosition: t, scrollEdgeThreshold: r, scrollMargin: a, scrollPreviousItemPeek: n }), { streamingTurnRef: i, autoScrollRef: l, autoscrollingRef: c, autoscrollingTimeoutRef: f, contentRef: b, defaultScrollPositionAppliedRef: k, firstItemRef: u, itemCountRef: m, lastScrollTopRef: p, messageElementsRef: g, modeRef: h, pendingScrollFrameRef: w, pendingScrollToMessageRef: P, prependRestoreRef: F, preserveScrollOnPrependRef: y, pendingDefaultScrollStore: C, rootRef: M, scrollEdgeThresholdRef: I, scrollMarginRef: V, scrollPreviousItemPeekRef: z, spacerGapRef: ue, spacerHeightRef: ee, spacerRef: S, stateFrameRef: N, stateStore: D, viewportRef: x, visibilityFrameRef: L, visibilityObserverRef: H, visibilityStore: $, visibleMessageIdsRef: J, handledScrollAnchorsRef: ae } = o, ge = d.useRef(t);
  ge.current !== t && (ge.current = t, k.current = !1);
  let be = d.useCallback((_) => {
    let E = M.current, A = x.current, G = [_.start && "start", _.end && "end"].filter(Boolean).join(" "), me = c.current;
    for (let X of [E, A]) X && (G ? X.setAttribute("data-scrollable", G) : X.removeAttribute("data-scrollable"), X.toggleAttribute("data-autoscrolling", me));
  }, []), ve = d.useCallback((_) => {
    var G;
    let E = ((G = x.current) == null ? void 0 : G.scrollTop) ?? 0, A = E < p.current - We;
    p.current = E, l.current && !_.end && h.current !== "settling-jump" && h.current !== "anchored-to-message" ? h.current = "following-bottom" : h.current === "following-bottom" && _.end && A && !c.current && (h.current = "free-scrolling");
  }, []), Z = d.useCallback(() => {
    let _ = nn({ content: b.current, scrollEdgeThreshold: I.current, spacer: S.current, viewport: x.current });
    ve(_);
    let E = h.current === "following-bottom" ? { ..._, end: !1 } : _;
    be(E), D.setSnapshot(E);
  }, [ve, D, be]), de = d.useCallback(() => {
    N.current === null && (N.current = window.requestAnimationFrame(() => {
      N.current = null, Z();
    }));
  }, [Z]), W = d.useCallback(() => {
    $.hasListeners() && L.current === null && (L.current = window.requestAnimationFrame(() => {
      L.current = null, $.hasListeners() && $.setSnapshot(sn({ content: b.current, scrollMargin: V.current, scrollPreviousItemPeek: z.current, spacer: S.current, viewport: x.current, visibleMessageIds: J.current }));
    }));
  }, [$]), { flushPendingScrollToMessage: ye, reanchorToAnchoredMessage: Fe, scrollToElement: he, scrollToEnd: U, scrollToMessage: Le, scrollToStart: T } = kn({ refs: o, commitScrollState: Z, scheduleStateCommit: de, scheduleVisibilitySync: W }), R = d.useCallback(() => {
    let _ = F.current, E = x.current;
    if (!_ || !E || !_.element.isConnected) return !1;
    let A = He(_.element, E) - _.viewportTop;
    return Math.abs(A) <= We ? !1 : (E.scrollTop += A, _.viewportTop = He(_.element, E), de(), W(), !0);
  }, [de, W]), B = d.useCallback(() => {
    let _ = b.current, E = x.current;
    if (!_ || !E) {
      F.current = null;
      return;
    }
    let A = un({ content: _, spacer: S.current, viewport: E });
    F.current = A ? { element: A, viewportTop: He(A, E) } : null;
  }, []), te = d.useCallback(() => {
    w.current === null && (w.current = window.requestAnimationFrame(() => {
      w.current = null, ye() && B();
    }));
  }, [B, ye]), pe = d.useCallback(() => {
    if (!t || k.current || m.current === 0) return !1;
    let _ = !1;
    if (t === "last-anchor") {
      let E = b.current, A = x.current, G = E && A ? cn(De(E, S.current)) : null;
      if (!E || !A || !G) _ = U({ behavior: "auto" });
      else {
        let me = Vt(G, A);
        _ = ht({ content: E, spacer: S.current, viewport: A }) - me <= A.clientHeight ? U({ behavior: "auto" }) : he(G, { align: "start" }, { keepPreviousPeek: !0 });
      }
    } else _ = t === "end" ? U({ behavior: "auto" }) : T({ behavior: "auto" });
    return _ ? ($e(o), !0) : !1;
  }, [t, he, U, T]), qe = d.useCallback(() => {
    let _ = b.current;
    if (!_) return;
    let E = De(_, S.current), A = m.current, G = u.current;
    m.current = E.length, u.current = E[0] ?? null, (() => {
      if (ye()) return;
      if (A === 0) {
        if (pe() || E.length > 0 && l.current && U({ behavior: "auto" })) return;
        Z(), W();
        return;
      }
      let me = G ? E.indexOf(G) : -1;
      if (y.current && me > 0) {
        R();
        return;
      }
      if (E.length > A) {
        let X = on(E, A);
        if (X) {
          if (l.current && h.current === "following-bottom" && ln(E, A)) {
            U({ behavior: "auto" });
            return;
          }
          he(X, { align: "start" }, { keepPreviousPeek: !0 }), ae.current.add(X);
          return;
        }
      }
      if (E.length === A) {
        let X = an(E, ae.current);
        if (X) {
          he(X, { align: "start" }, { keepPreviousPeek: !0 }), ae.current.add(X);
          return;
        }
      }
      h.current === "following-bottom" && l.current ? U({ behavior: "auto" }) : (Z(), W());
    })(), B();
  }, [pe, B, Z, ye, R, W, he, U]), re = d.useCallback(() => {
    if (h.current === "following-bottom" && l.current) {
      U({ behavior: "auto" });
      return;
    }
    let _ = ee.current;
    if (Fe()) {
      l.current && _ > 0 && ee.current === 0 && U({ behavior: "auto" });
      return;
    }
    de(), W();
  }, [Fe, de, W, U]), Re = d.useCallback(() => {
    let _ = x.current;
    if (!(!_ || !$.hasListeners())) {
      if (typeof IntersectionObserver > "u") {
        W();
        return;
      }
      H.current || (H.current = new IntersectionObserver((E) => {
        for (let A of E) {
          let G = A.target.dataset.messageId;
          G && (A.isIntersecting ? J.current.add(G) : J.current.delete(G));
        }
        W();
      }, { root: _, rootMargin: `${-(V.current + z.current)}px 0px 0px 0px`, threshold: [0, 0.01, 0.5, 1] })), g.current.forEach((E) => {
        var A;
        (A = H.current) == null || A.observe(E);
      }), W();
    }
  }, [W, $]), Oe = d.useCallback(() => {
    var _;
    L.current !== null && (window.cancelAnimationFrame(L.current), L.current = null), (_ = H.current) == null || _.disconnect(), H.current = null, J.current.clear(), $.setSnapshot(Ve);
  }, [$]), Ee = d.useCallback((_, E, A) => {
    var G, me, X;
    if (E) {
      g.current.set(_, E), (G = H.current) == null || G.observe(E), W(), ((me = P.current) == null ? void 0 : me.messageId) === _ && te();
      return;
    }
    A && g.current.get(_) === A && (g.current.delete(_), J.current.delete(_), (X = H.current) == null || X.unobserve(A), W());
  }, [te, W]), se = d.useCallback(() => {
    (h.current === "following-bottom" || h.current === "anchored-to-message" || h.current === "settling-jump") && (i.current = null, h.current = "free-scrolling");
  }, []), ze = d.useCallback(() => be(D.getSnapshot()), [D, be]), oe = vt(M, ze), Q = vt(x, ze), K = d.useCallback((_) => {
    b.current = _;
  }, []), Y = d.useCallback((_) => {
    S.current = _, ue.current = mn((_ == null ? void 0 : _.parentElement) ?? null);
  }, []), fe = d.useCallback(() => {
    Z(), W(), B();
  }, [B, Z, W]), Ae = d.useMemo(() => ({ handleContentChange: qe, handleResize: re, observeVisibility: Re, pendingDefaultScrollStore: C, preserveScrollOnPrependRef: y, scrollToEnd: U, scrollToMessage: Le, scrollToStart: T, setContentElement: K, setRootElement: oe, setSpacerElement: Y, setViewportElement: Q, stateStore: D, syncAfterScroll: fe, unobserveVisibility: Oe, userScrollIntent: se, viewportRef: x, visibilityStore: $ }), [qe, re, Re, C, U, Le, T, K, oe, Y, Q, D, fe, Oe, se, $]);
  return d.useLayoutEffect(() => {
    pe() || m.current === 0 && jt(o);
  }, [pe]), d.useEffect(() => () => {
    var _;
    N.current !== null && (window.cancelAnimationFrame(N.current), N.current = null), L.current !== null && (window.cancelAnimationFrame(L.current), L.current = null), f.current !== null && (window.clearTimeout(f.current), f.current = null), w.current !== null && (window.cancelAnimationFrame(w.current), w.current = null), (_ = H.current) == null || _.disconnect(), H.current = null;
  }, []), d.useLayoutEffect(() => {
    if (e && h.current === "following-bottom" && m.current > 0) {
      U({ behavior: "auto" });
      return;
    }
    Z();
  }, [e, Z, U]), { context: Ae, registerMessage: Ee };
}
function _n(e) {
  let t = d.useRef(e);
  return t.current = e, t;
}
var Yt = d.createContext(null), Jt = d.createContext(null);
function xe() {
  let e = d.useContext(Yt);
  if (!e) throw new Error("useMessageScroller must be used within a MessageScroller.");
  return e;
}
function Cn() {
  let e = d.useContext(Jt);
  if (!e) throw new Error("MessageScrollerItem must be used within a MessageScroller.");
  return e;
}
function Sn({ autoScroll: e = !1, children: t, defaultScrollPosition: r = "end", scrollEdgeThreshold: n, scrollPreviousItemPeek: a, scrollMargin: o }) {
  let { context: i, registerMessage: l } = wn({ autoScroll: e, defaultScrollPosition: r, scrollEdgeThreshold: n, scrollPreviousItemPeek: a, scrollMargin: o });
  return s(Yt.Provider, { value: i, children: s(Jt.Provider, { value: l, children: t }) });
}
function Zt() {
  let { pendingDefaultScrollStore: e } = xe();
  return d.useSyncExternalStore(e.subscribe, e.getSnapshot, e.getSnapshot);
}
function Tn({ children: e, ...t }) {
  let { setRootElement: r } = xe(), n = Zt();
  return s("div", { ref: r, ...t, ...n ? { "data-pending-scroll": "" } : null, children: e });
}
function Fn({ "aria-label": e, children: t, onKeyDown: r, onScroll: n, onTouchMove: a, onWheel: o, preserveScrollOnPrepend: i = !0, ref: l, role: c, tabIndex: f, ...b }) {
  let { handleResize: k, preserveScrollOnPrependRef: u, setViewportElement: m, syncAfterScroll: p, userScrollIntent: g, viewportRef: h } = xe(), w = Zt();
  u.current = i;
  let P = d.useCallback((I) => {
    var V;
    m(I), (V = Pe(l)) == null || V(I);
  }, [l, m]);
  function F(I) {
    p(), n == null || n(I);
  }
  function y(I) {
    g(), o == null || o(I);
  }
  function C(I) {
    g(), a == null || a(I);
  }
  function M(I) {
    tn.has(I.key) && g(), r == null || r(I);
  }
  return d.useEffect(() => {
    let I = h.current;
    if (!I || typeof ResizeObserver > "u") return;
    let V = 0, z = new ResizeObserver(() => {
      window.cancelAnimationFrame(V), V = window.requestAnimationFrame(k);
    });
    return z.observe(I), () => {
      window.cancelAnimationFrame(V), z.disconnect();
    };
  }, [k, h]), s("div", { ref: P, role: c ?? "region", "aria-label": e ?? "Messages", tabIndex: f ?? 0, onKeyDown: M, onScroll: F, onTouchMove: C, onWheel: y, ...b, ...w ? { "data-pending-scroll": "" } : null, children: t });
}
function Rn({ "aria-relevant": e, children: t, ref: r, role: n, spacerClassName: a, ...o }) {
  let { handleContentChange: i, handleResize: l, setContentElement: c, setSpacerElement: f } = xe(), b = d.useRef(null), k = d.useCallback((u) => {
    var m;
    b.current = u, c(u), (m = Pe(r)) == null || m(u);
  }, [r, c]);
  return d.useLayoutEffect(() => {
    let u = b.current;
    if (!u || (i(), typeof MutationObserver > "u")) return;
    let m = new MutationObserver(() => {
      i();
    });
    return m.observe(u, { childList: !0 }), () => m.disconnect();
  }, [i]), d.useEffect(() => {
    let u = b.current;
    if (!u || typeof ResizeObserver > "u") return;
    let m = 0, p = new ResizeObserver(() => {
      window.cancelAnimationFrame(m), m = window.requestAnimationFrame(l);
    });
    return p.observe(u), () => {
      window.cancelAnimationFrame(m), p.disconnect();
    };
  }, [l]), v("div", { ref: k, role: n ?? "log", "aria-relevant": e ?? "additions", ...o, children: [t, s("div", { ref: f, "aria-hidden": "true", "data-message-scroller-spacer": "", hidden: !0, className: a })] });
}
function En({ messageId: e, ref: t, scrollAnchor: r = !1, ...n }) {
  let a = Cn(), o = d.useRef(null), i = d.useCallback((l) => {
    var f;
    let c = o.current;
    o.current = l, e && a(e, l, c), (f = Pe(t)) == null || f(l);
  }, [e, t, a]);
  return s("div", { ref: i, "data-message-id": e, "data-scroll-anchor": r ? "true" : "false", ...n });
}
function An({ behavior: e = "smooth", children: t, direction: r = "end", onClick: n, render: a, tabIndex: o, type: i = "button", ...l }) {
  let { scrollToEnd: c, scrollToStart: f, stateStore: b } = xe(), k = _n(n), u = d.useCallback((h) => b.subscribe(h), [b]), m = d.useCallback(() => {
    let h = b.getSnapshot();
    return r === "start" ? h.start : h.end;
  }, [r, b]), p = d.useSyncExternalStore(u, m, m), g = d.useCallback((h) => {
    var w;
    p && ((w = k.current) == null || w.call(k, h), h.defaultPrevented || (h.currentTarget.blur(), r === "start" ? f({ behavior: e }) : c({ behavior: e })));
  }, [e, r, p, k, c, f]);
  return jr({ defaultTagName: "button", props: rt({ type: i, inert: !p, tabIndex: p ? o : -1, children: t ?? v("span", { children: ["Scroll to ", r] }), onClick: g }, l), render: a, state: { active: p, direction: r }, stateAttributesMapping: { active: (h) => ({ "data-active": h ? "true" : "false" }) } });
}
var Te = { Provider: Sn, Root: Tn, Viewport: Fn, Content: Rn, Item: En, Button: An };
function Mn(e) {
  return /* @__PURE__ */ s(Te.Provider, { ...e });
}
function In({
  className: e,
  ...t
}) {
  return /* @__PURE__ */ s(
    Te.Root,
    {
      "data-slot": "message-scroller",
      className: q("msg-scroller-root", e),
      ...t
    }
  );
}
function Nn({
  className: e,
  ...t
}) {
  return /* @__PURE__ */ s(
    Te.Viewport,
    {
      "data-slot": "message-scroller-viewport",
      className: q("msg-scroller-viewport", e),
      ...t
    }
  );
}
function Dn({
  className: e,
  ...t
}) {
  return /* @__PURE__ */ s(
    Te.Content,
    {
      "data-slot": "message-scroller-content",
      className: q("msg-scroller-content", e),
      ...t
    }
  );
}
function yt({
  className: e,
  scrollAnchor: t = !1,
  ...r
}) {
  return /* @__PURE__ */ s(
    Te.Item,
    {
      "data-slot": "message-scroller-item",
      scrollAnchor: t,
      className: q("msg-scroller-item", e),
      ...r
    }
  );
}
function Bn({
  direction: e = "end",
  className: t,
  children: r,
  ...n
}) {
  return /* @__PURE__ */ s(
    Te.Button,
    {
      "data-slot": "message-scroller-button",
      direction: e,
      className: q("msg-scroller-btn", t),
      ...n,
      children: r ?? /* @__PURE__ */ v(Be, { children: [
        /* @__PURE__ */ s(
          pr,
          {
            size: 16,
            "aria-hidden": "true",
            className: e === "start" ? "rotate-180" : void 0
          }
        ),
        /* @__PURE__ */ s("span", { className: "sr-only", children: e === "end" ? "Jump to latest" : "Jump to start" })
      ] })
    }
  );
}
function st({
  align: e = "start",
  variant: t = "muted",
  className: r,
  ...n
}) {
  return /* @__PURE__ */ s("div", { ...n, "data-slot": "bubble", "data-align": e, "data-variant": t, className: q("chat-bubble", r) });
}
function ot({ className: e, ...t }) {
  return /* @__PURE__ */ s("div", { ...t, "data-slot": "bubble-content", className: q("chat-bubble-content", e) });
}
const Pn = () => /* @__PURE__ */ v(ut, { children: [
  /* @__PURE__ */ s(Lt, { className: "avatar-circle", "aria-hidden": "true", children: /* @__PURE__ */ s(Dt, { size: 15 }) }),
  /* @__PURE__ */ s(dt, { children: /* @__PURE__ */ s(st, { children: /* @__PURE__ */ s(ot, { children: "Hello — I am the VPS Veritas assistant. Ask about reports, sample status, registration, or support, or choose a suggested question." }) }) })
] });
function Kt() {
  const [e, t] = j("idle");
  _e(() => {
    if (e !== "copied") return;
    const n = window.setTimeout(() => t("idle"), 2e3);
    return () => window.clearTimeout(n);
  }, [e]);
  async function r(n) {
    t("copying");
    try {
      await navigator.clipboard.writeText(n), t("copied");
    } catch {
      t("failed");
    }
  }
  return { status: e, copy: r };
}
function xn({ message: e, onFeedback: t }) {
  const { status: r, copy: n } = Kt();
  return /* @__PURE__ */ v("div", { className: "chat-message-actions", role: "group", "aria-label": "Response actions", children: [
    /* @__PURE__ */ s(
      "button",
      {
        type: "button",
        className: "chat-message-action",
        "aria-label": "Copy response",
        title: "Copy response",
        disabled: r === "copying",
        onClick: () => void n(e.content),
        children: r === "copied" ? /* @__PURE__ */ s(ct, { size: 16, "aria-hidden": "true" }) : /* @__PURE__ */ s(Bt, { size: 16, "aria-hidden": "true" })
      }
    ),
    /* @__PURE__ */ s(
      "button",
      {
        type: "button",
        className: "chat-message-action",
        "aria-label": "Like response",
        title: "Like response",
        "aria-pressed": e.feedback === "like",
        onClick: () => t(e.id, "like"),
        children: /* @__PURE__ */ s(Ir, { size: 16, "aria-hidden": "true" })
      }
    ),
    /* @__PURE__ */ s(
      "button",
      {
        type: "button",
        className: "chat-message-action",
        "aria-label": "Dislike response",
        title: "Dislike response",
        "aria-pressed": e.feedback === "dislike",
        onClick: () => t(e.id, "dislike"),
        children: /* @__PURE__ */ s(Mr, { size: 16, "aria-hidden": "true" })
      }
    ),
    /* @__PURE__ */ v("span", { className: "chat-message-copy-status", role: "status", children: [
      r === "copied" && "Copied",
      r === "failed" && "Couldn’t copy"
    ] })
  ] });
}
function Ln(e) {
  const t = e.trim();
  if (!/[\u0000-\u001f\u007f]/.test(t) && /^(https?:\/\/|mailto:|\/(?!\/)|#)/i.test(t))
    return t;
}
function ie(e) {
  if (!e) return [];
  const t = /(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|https?:\/\/[^\s]+)/g;
  return e.split(t).map((n, a) => {
    if (!n) return null;
    const o = n.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (o) {
      const i = o[1], l = o[2], c = Ln(l);
      if (!c) return /* @__PURE__ */ s(ce.Fragment, { children: i }, a);
      const f = /^https?:\/\//i.test(l);
      return /* @__PURE__ */ s(
        "a",
        {
          href: c,
          target: f ? "_blank" : void 0,
          rel: f ? "noopener noreferrer" : void 0,
          className: "md-link",
          children: i
        },
        a
      );
    }
    return n.startsWith("**") && n.endsWith("**") && n.length >= 4 ? /* @__PURE__ */ s("strong", { children: n.slice(2, -2) }, a) : n.startsWith("*") && n.endsWith("*") && n.length >= 2 ? /* @__PURE__ */ s("em", { children: n.slice(1, -1) }, a) : n.startsWith("`") && n.endsWith("`") && n.length >= 2 ? /* @__PURE__ */ s("code", { className: "md-code", children: n.slice(1, -1) }, a) : /^https?:\/\//i.test(n) ? /* @__PURE__ */ s(
      "a",
      {
        href: n,
        target: "_blank",
        rel: "noopener noreferrer",
        className: "md-link",
        children: n
      },
      a
    ) : /* @__PURE__ */ s(ce.Fragment, { children: n }, a);
  });
}
function qn(e) {
  const t = e.replace(/\r\n/g, `
`).split(`
`), r = [];
  let n = 0;
  for (; n < t.length; ) {
    const o = t[n].trim();
    if (!o) {
      n++;
      continue;
    }
    if (o.startsWith("```")) {
      const c = o.slice(3).trim(), f = [];
      for (n++; n < t.length && !t[n].trim().startsWith("```"); )
        f.push(t[n]), n++;
      n < t.length && t[n].trim().startsWith("```") && n++, r.push({ type: "code", lang: c, code: f.join(`
`) });
      continue;
    }
    if (/^(---|___|\*\*\*)$/.test(o)) {
      r.push({ type: "hr" }), n++;
      continue;
    }
    const i = o.match(/^(#{1,4})\s+(.*)$/);
    if (i) {
      r.push({
        type: "h",
        level: i[1].length,
        content: i[2]
      }), n++;
      continue;
    }
    if (o.startsWith(">")) {
      const c = [];
      for (; n < t.length && t[n].trim().startsWith(">"); )
        c.push(t[n].trim().replace(/^>\s?/, "")), n++;
      r.push({ type: "quote", lines: c });
      continue;
    }
    if (/^[-*]\s+/.test(o)) {
      const c = [];
      for (; n < t.length && /^[-*]\s+/.test(t[n].trim()); )
        c.push(t[n].trim().replace(/^[-*]\s+/, "")), n++;
      r.push({ type: "ul", items: c });
      continue;
    }
    if (/^\d+\.\s+/.test(o)) {
      const c = [];
      for (; n < t.length && /^\d+\.\s+/.test(t[n].trim()); )
        c.push(t[n].trim().replace(/^\d+\.\s+/, "")), n++;
      r.push({ type: "ol", items: c });
      continue;
    }
    if (o.startsWith("|") && o.endsWith("|")) {
      const c = [];
      for (; n < t.length && t[n].trim().startsWith("|") && t[n].trim().endsWith("|"); )
        c.push(t[n].trim()), n++;
      if (c.length >= 2) {
        const f = (m) => m.slice(1, -1).split("|").map((p) => p.trim()), b = f(c[0]), k = c[1].includes("-") ? 2 : 1, u = c.slice(k).map(f);
        r.push({ type: "table", headers: b, rows: u });
        continue;
      }
    }
    const l = [];
    for (; n < t.length && t[n].trim() && !t[n].trim().startsWith("```") && !/^(#{1,4})\s+/.test(t[n].trim()) && !/^[-*]\s+/.test(t[n].trim()) && !/^\d+\.\s+/.test(t[n].trim()) && !t[n].trim().startsWith(">") && !/^(---|___|\*\*\*)$/.test(t[n].trim()); )
      l.push(t[n].trim()), n++;
    l.length > 0 && r.push({ type: "p", lines: l });
  }
  return r;
}
function On({ code: e, lang: t, streaming: r }) {
  const { status: n, copy: a } = Kt();
  return /* @__PURE__ */ v("div", { className: "md-code-block", children: [
    /* @__PURE__ */ v("div", { className: "md-code-header", children: [
      /* @__PURE__ */ s("span", { children: t || "Code" }),
      !r && /* @__PURE__ */ v(Be, { children: [
        /* @__PURE__ */ v("span", { className: "md-code-status", role: "status", children: [
          n === "copied" && "Copied",
          n === "failed" && "Couldn’t copy"
        ] }),
        /* @__PURE__ */ s(
          "button",
          {
            type: "button",
            className: "chat-message-action",
            "aria-label": "Copy code",
            title: "Copy code",
            disabled: n === "copying",
            onClick: () => void a(e),
            children: n === "copied" ? /* @__PURE__ */ s(ct, { size: 15, "aria-hidden": "true" }) : /* @__PURE__ */ s(Bt, { size: 15, "aria-hidden": "true" })
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ s("pre", { className: "md-pre", children: /* @__PURE__ */ s("code", { children: e.split(`
`).map((o, i) => /* @__PURE__ */ v("span", { className: "md-code-line", children: [
      /* @__PURE__ */ s("span", { className: "md-code-number", "aria-hidden": "true", children: i + 1 }),
      /* @__PURE__ */ s("span", { children: o || " " })
    ] }, i)) }) })
  ] });
}
const kt = ce.memo(function({
  text: t,
  streaming: r = !1
}) {
  if (!t) return null;
  const n = qn(t);
  return /* @__PURE__ */ s("div", { className: "md-content", children: n.map((a, o) => {
    switch (a.type) {
      case "h":
        return a.level === 1 ? /* @__PURE__ */ s("h2", { className: "md-h1", children: ie(a.content) }, o) : a.level === 2 ? /* @__PURE__ */ s("h3", { className: "md-h2", children: ie(a.content) }, o) : a.level === 3 ? /* @__PURE__ */ s("h4", { className: "md-h3", children: ie(a.content) }, o) : /* @__PURE__ */ s("h5", { className: "md-h4", children: ie(a.content) }, o);
      case "ul":
        return /* @__PURE__ */ s("ul", { className: "md-ul", children: a.items.map((i, l) => /* @__PURE__ */ s("li", { className: "md-li", children: ie(i) }, l)) }, o);
      case "ol":
        return /* @__PURE__ */ s("ol", { className: "md-ol", children: a.items.map((i, l) => /* @__PURE__ */ s("li", { className: "md-li", children: ie(i) }, l)) }, o);
      case "code":
        return /* @__PURE__ */ s(On, { code: a.code, lang: a.lang, streaming: r }, o);
      case "quote":
        return /* @__PURE__ */ s("blockquote", { className: "md-quote", children: a.lines.map((i, l) => /* @__PURE__ */ s("p", { children: ie(i) }, l)) }, o);
      case "hr":
        return /* @__PURE__ */ s("hr", { className: "md-hr" }, o);
      case "table":
        return /* @__PURE__ */ s("div", { className: "md-table-wrap", children: /* @__PURE__ */ v("table", { className: "md-table", children: [
          /* @__PURE__ */ s("thead", { children: /* @__PURE__ */ s("tr", { children: a.headers.map((i, l) => /* @__PURE__ */ s("th", { children: ie(i) }, l)) }) }),
          /* @__PURE__ */ s("tbody", { children: a.rows.map((i, l) => /* @__PURE__ */ s("tr", { children: i.map((c, f) => /* @__PURE__ */ s("td", { children: ie(c) }, f)) }, l)) })
        ] }) }, o);
      case "p":
      default:
        return /* @__PURE__ */ s("p", { className: "md-p", children: a.lines.map((i, l) => /* @__PURE__ */ v(ce.Fragment, { children: [
          ie(i),
          l < a.lines.length - 1 && /* @__PURE__ */ s("br", {})
        ] }, l)) }, o);
    }
  }) });
});
function zn(e) {
  return e === "create_ticket" ? "Support ticket processed" : e === "get_customer" ? "Account verified" : e === "get_ticket" ? "Ticket status loaded" : "Information retrieved";
}
const Hn = ({
  status: e = "complete",
  progressText: t,
  progressSteps: r = [],
  durationMs: n,
  toolCalls: a = []
}) => {
  const o = e === "pending", i = e === "stopped", [l, c] = j(0), [f, b] = j();
  _e(() => {
    if (!o) return;
    const g = Date.now(), h = setInterval(() => {
      c(Number(((Date.now() - g) / 1e3).toFixed(1)));
    }, 250);
    return () => clearInterval(h);
  }, [o]);
  const k = i ? void 0 : o ? `${l.toFixed(1)}s` : n === void 0 ? void 0 : `${(n / 1e3).toFixed(1)}s`, u = r.length > 0 || a.length > 0, p = /* @__PURE__ */ v(Ie, { status: o ? "running" : void 0, children: [
    /* @__PURE__ */ s(Se, { children: o ? /* @__PURE__ */ s(Sr, { size: 14, className: "trace-spinner" }) : i ? /* @__PURE__ */ s(xt, { size: 12 }) : /* @__PURE__ */ s(yr, { size: 14 }) }),
    /* @__PURE__ */ s(Ne, { children: o ? u ? "Working…" : t || "Preparing your answer…" : i ? "Response stopped" : "Response generated" }),
    k && /* @__PURE__ */ s(tt, { "aria-hidden": o || void 0, children: k })
  ] });
  return /* @__PURE__ */ s(we, { className: "chat-response-trace", children: u ? /* @__PURE__ */ v(zt, { open: f ?? o, onOpenChange: b, children: [
    /* @__PURE__ */ s(Ht, { children: p }),
    /* @__PURE__ */ s($t, { children: /* @__PURE__ */ v(we, { children: [
      r.map((g, h) => /* @__PURE__ */ v(Mt, { children: [
        /* @__PURE__ */ s(cr, { children: /* @__PURE__ */ s("span", { className: "chat-progress-dot" }) }),
        /* @__PURE__ */ s(It, { children: g })
      ] }, `${g}-${h}`)),
      a.map((g, h) => /* @__PURE__ */ v(Ie, { children: [
        /* @__PURE__ */ s(Se, { children: /* @__PURE__ */ s(Nr, { size: 13 }) }),
        /* @__PURE__ */ s(Ne, { children: zn(g.toolName) })
      ] }, `${g.toolName}-${h}`))
    ] }) })
  ] }) : p });
}, $n = {
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
function Wn(e) {
  const r = (e.split(/[/\\]/).pop() || "").replace(/\.md$/i, "").toLowerCase();
  for (const [n, a] of Object.entries($n))
    if (r.includes(n))
      return a;
  return null;
}
function wt(e) {
  return e.title ? e.title : (e.source.split(/[/\\]/).pop() || e.source).replace(/\.md$/i, "").replace(/[-_]/g, " ").replace(/\b\w/g, (r) => r.toUpperCase());
}
const Vn = ({
  sources: e,
  hideInspectSources: t = !1,
  showInspectSources: r = !0,
  defaultExpanded: n = !1,
  maxSources: a = 5
}) => {
  const o = t || r === !1, [i, l] = j(n && !o), [c, f] = j(null);
  if (!e || !e.length) return null;
  const b = e.slice(0, a), k = b.length === 1 ? "source" : "sources", u = /* @__PURE__ */ v(Ie, { children: [
    /* @__PURE__ */ s(Se, { children: /* @__PURE__ */ s(Cr, { size: 14 }) }),
    /* @__PURE__ */ s(Ne, { children: `${b.length} retrieved VPS ${k}` }),
    !o && /* @__PURE__ */ s(tt, { children: i ? "Hide Details" : "Inspect Sources" })
  ] }), m = /* @__PURE__ */ s(we, { className: "grounded-source-rows", children: b.map((p, g) => {
    const h = c === g, w = /* @__PURE__ */ v(Ie, { children: [
      /* @__PURE__ */ s(Se, { children: /* @__PURE__ */ s(gr, { size: 13 }) }),
      /* @__PURE__ */ v(Ne, { children: [
        "[S",
        g + 1,
        "] ",
        wt(p)
      ] }),
      /* @__PURE__ */ v(tt, { title: "Ranking score, not a probability of correctness", children: [
        "Score ",
        p.score.toFixed(2)
      ] })
    ] });
    return o ? /* @__PURE__ */ s("div", { children: w }, `${p.chunkId}-${g}`) : /* @__PURE__ */ s(
      "button",
      {
        type: "button",
        className: `trace-trigger${i && h ? " grounded-source-selected" : ""}`,
        "aria-pressed": i && h,
        onClick: () => {
          l(!0), f(h ? null : g);
        },
        title: p.source,
        children: w
      },
      `${p.chunkId}-${g}`
    );
  }) });
  return o ? /* @__PURE__ */ v(we, { className: "grounded-sources-card", children: [
    u,
    m
  ] }) : /* @__PURE__ */ s(we, { className: "grounded-sources-card", children: /* @__PURE__ */ v(zt, { open: i, onOpenChange: l, children: [
    /* @__PURE__ */ s(Ht, { children: u }),
    m,
    /* @__PURE__ */ s($t, { children: /* @__PURE__ */ s("div", { className: "grounded-sources-details-list", children: b.map((p, g) => {
      const h = wt(p), w = Wn(p.source);
      return /* @__PURE__ */ v(
        "div",
        {
          className: `grounded-detail-item${c === g ? " grounded-detail-item--highlighted" : ""}`,
          children: [
            /* @__PURE__ */ v("div", { className: "grounded-detail-top", children: [
              /* @__PURE__ */ v("div", { className: "grounded-detail-title-group", children: [
                /* @__PURE__ */ v("span", { className: "grounded-detail-index", children: [
                  "[",
                  g + 1,
                  "]"
                ] }),
                /* @__PURE__ */ s("span", { className: "grounded-detail-title", children: h })
              ] }),
              /* @__PURE__ */ v("div", { className: "grounded-detail-meta", children: [
                /* @__PURE__ */ v("span", { className: "grounded-detail-score", children: [
                  "Rank score ",
                  p.score.toFixed(2)
                ] }),
                w && /* @__PURE__ */ v(
                  "a",
                  {
                    href: w.path,
                    onClick: (F) => {
                      F.preventDefault(), window.location.href = w.path;
                    },
                    className: "grounded-route-link",
                    title: `Navigate to ${w.label}`,
                    children: [
                      /* @__PURE__ */ s("span", { children: w.label }),
                      /* @__PURE__ */ s(wr, { size: 10, "aria-hidden": "true" })
                    ]
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ s("div", { className: "grounded-detail-path", children: /* @__PURE__ */ s("code", { children: p.source }) }),
            p.snippet && /* @__PURE__ */ v("p", { className: "grounded-detail-snippet", children: [
              '"',
              p.snippet,
              '"'
            ] })
          ]
        },
        `detail-${p.chunkId}-${g}`
      );
    }) }) })
  ] }) });
}, Gn = ({ message: e, onEdit: t }) => {
  var m, p, g, h;
  const r = it(), n = (r == null ? void 0 : r.hideInspectSources) ?? !1, a = (r == null ? void 0 : r.showGroundedSources) ?? !1, o = e.role === "user", i = e.status === "error", l = e.status === "pending", c = e.status === "stopped", f = e.id.startsWith("welcome"), b = e.role === "assistant" && !f && !i, k = b && (l || c || e.durationMs !== void 0 || !!((m = e.progressSteps) != null && m.length || (p = e.sources) != null && p.length || (g = e.toolCalls) != null && g.length || e.usage)), u = b && !l && !c && e.content.trim().length > 0;
  return /* @__PURE__ */ v(ut, { align: o ? "end" : "start", children: [
    e.role === "assistant" && /* @__PURE__ */ s(Lt, { className: "avatar-circle", "aria-hidden": "true", children: /* @__PURE__ */ s(Dt, { size: 15 }) }),
    /* @__PURE__ */ v(dt, { children: [
      k && /* @__PURE__ */ s(Br, { children: /* @__PURE__ */ s(
        Hn,
        {
          status: l ? "pending" : c ? "stopped" : "complete",
          progressText: e.progressText,
          progressSteps: e.progressSteps,
          durationMs: e.durationMs,
          toolCalls: e.toolCalls
        }
      ) }),
      o ? /* @__PURE__ */ s(st, { align: "end", children: /* @__PURE__ */ s(ot, { className: "msg-user-pre", children: e.content }) }) : f || i ? /* @__PURE__ */ s(st, { variant: i ? "destructive" : "muted", children: /* @__PURE__ */ s(ot, { children: /* @__PURE__ */ s(kt, { text: e.content }) }) }) : e.content && /* @__PURE__ */ v("div", { className: "chat-message-body", children: [
        /* @__PURE__ */ s(kt, { text: e.content, streaming: l }),
        b && !l && !c && a && ((h = e.sources) != null && h.length) ? /* @__PURE__ */ s(Vn, { sources: e.sources, hideInspectSources: n }) : null
      ] }),
      u && r && /* @__PURE__ */ s(et, { children: /* @__PURE__ */ s(xn, { message: e, onFeedback: r.toggleMessageFeedback }) }),
      o && !i && /* @__PURE__ */ v(et, { children: [
        t && /* @__PURE__ */ s(
          "button",
          {
            type: "button",
            className: "chat-message-action",
            "aria-label": "Edit message",
            title: "Edit message",
            disabled: (r == null ? void 0 : r.status) === "awaiting" || (r == null ? void 0 : r.status) === "connecting" || !!(r != null && r.pendingTicket),
            onClick: () => t(e.content),
            children: /* @__PURE__ */ s(Rr, { size: 14, "aria-hidden": "true" })
          }
        ),
        /* @__PURE__ */ s(ct, { size: 13, className: "msg-tick", "aria-hidden": "true" })
      ] })
    ] })
  ] });
}, Un = ({ onEdit: e }) => {
  const { messages: t, status: r } = Ge(), n = r === "awaiting" || r === "connecting", a = t.filter((o) => o.status !== "error");
  return /* @__PURE__ */ s(
    Mn,
    {
      autoScroll: !0,
      defaultScrollPosition: "last-anchor",
      scrollPreviousItemPeek: 64,
      children: /* @__PURE__ */ v(In, { children: [
        /* @__PURE__ */ s(Nn, { "aria-label": "Chat messages", children: /* @__PURE__ */ v(Dn, { "aria-busy": n, children: [
          a.length === 0 && /* @__PURE__ */ s(yt, { messageId: "welcome", children: /* @__PURE__ */ s(Pn, {}) }),
          a.map((o) => /* @__PURE__ */ s(
            yt,
            {
              messageId: o.streamId ?? o.id,
              "data-role": o.role,
              scrollAnchor: o.role === "user",
              children: /* @__PURE__ */ s(Gn, { message: o, onEdit: e })
            },
            o.streamId ?? o.id
          ))
        ] }) }),
        /* @__PURE__ */ s(Bn, {})
      ] })
    }
  );
}, jn = () => {
  const { pendingTicket: e, ticketBusy: t, userContext: r, confirmTicket: n, cancelTicket: a } = Ge(), o = !r.customerId && !r.email, [i, l] = j("");
  return e ? /* @__PURE__ */ v(
    "div",
    {
      className: "ticket-card",
      role: "region",
      "aria-label": "Create support ticket",
      children: [
        /* @__PURE__ */ s("h3", { className: "ticket-card-title", children: "Create support ticket?" }),
        /* @__PURE__ */ s("p", { className: "ticket-card-desc", children: "I can open a support request for you. Nothing is created until you confirm." }),
        /* @__PURE__ */ s("p", { className: "ticket-card-body", children: e.description }),
        o && /* @__PURE__ */ v("label", { className: "ticket-id-label", children: [
          "Customer ID or email",
          /* @__PURE__ */ s(
            "input",
            {
              value: i,
              onChange: (c) => l(c.target.value),
              className: "ticket-id-input",
              placeholder: "CUST-1001 or you@company.com",
              autoComplete: "email"
            }
          )
        ] }),
        /* @__PURE__ */ v("div", { className: "ticket-actions", children: [
          /* @__PURE__ */ s(
            "button",
            {
              type: "button",
              onClick: a,
              disabled: t,
              className: "ticket-cancel-btn",
              children: "Cancel"
            }
          ),
          /* @__PURE__ */ s(
            "button",
            {
              type: "button",
              onClick: () => void n(i),
              disabled: t || o && !i.trim(),
              className: "ticket-confirm-btn",
              children: t ? "Creating…" : "Create ticket"
            }
          )
        ] })
      ]
    }
  ) : null;
}, Xt = ({
  className: e,
  onClose: t,
  showMinimize: r,
  title: n,
  subtitle: a,
  envStage: o,
  envPulse: i = !0
}) => {
  const { messages: l, sendMessage: c, stopResponse: f, status: b, error: k, resetConversation: u, retryLast: m, pendingTicket: p } = Ge(), g = ne(null), h = b === "awaiting" || b === "connecting", w = l[l.length - 1], P = h ? w == null ? void 0 : w.progressText : (w == null ? void 0 : w.status) === "stopped" ? "Response stopped" : void 0;
  return /* @__PURE__ */ v(
    "section",
    {
      className: `chat-panel${e ? ` ${e}` : ""}`,
      "aria-label": "VPS AI Assistant",
      children: [
        /* @__PURE__ */ s(
          Or,
          {
            title: n,
            subtitle: a,
            onClose: t,
            onReset: () => void u(),
            showMinimize: r,
            envStage: o,
            envPulse: i
          }
        ),
        /* @__PURE__ */ s("div", { className: "chat-panel-body", children: /* @__PURE__ */ s(Un, { onEdit: (F) => {
          var y;
          return (y = g.current) == null ? void 0 : y.edit(F);
        } }) }),
        /* @__PURE__ */ s(Mt, { className: "sr-only", role: "status", children: /* @__PURE__ */ s(It, { children: P }) }),
        k && b === "error" && /* @__PURE__ */ s(Pr, { message: k, onRetry: () => void m() }),
        /* @__PURE__ */ s(jn, {}),
        /* @__PURE__ */ s(
          Ur,
          {
            ref: g,
            onSend: (F) => void c(F),
            onStop: h ? f : void 0,
            disabled: h || !!p
          }
        )
      ]
    }
  );
}, Yn = ({
  open: e,
  onClose: t,
  envStage: r,
  envPulse: n = !0
}) => e ? /* @__PURE__ */ s(
  "div",
  {
    id: "vps-chatbot-widget-panel",
    className: "widget-panel",
    children: /* @__PURE__ */ s(
      Xt,
      {
        onClose: t,
        showMinimize: !0,
        title: "VPS AI Assistant",
        envStage: r,
        envPulse: n
      }
    )
  }
) : null, Jn = ({
  open: e,
  onToggle: t
}) => /* @__PURE__ */ s(
  "button",
  {
    type: "button",
    onClick: t,
    "aria-expanded": e,
    "aria-controls": "vps-chatbot-widget-panel",
    "aria-label": e ? "Close assistant" : "Open assistant",
    className: "widget-trigger-btn",
    children: e ? /* @__PURE__ */ s(Dr, { size: 22 }) : /* @__PURE__ */ s(Pt, { size: 24 })
  }
), _t = ({
  defaultOpen: e = !1,
  open: t,
  onOpenChange: r,
  envStage: n,
  envPulse: a = !0
}) => {
  const [o, i] = j(e), l = t ?? o, c = (f) => {
    r == null || r(f), t === void 0 && i(f);
  };
  return /* @__PURE__ */ v(Be, { children: [
    /* @__PURE__ */ s(
      Yn,
      {
        open: l,
        onClose: () => c(!1),
        envStage: n,
        envPulse: a
      }
    ),
    /* @__PURE__ */ s(Jn, { open: l, onToggle: () => c(!l) })
  ] });
}, os = ({
  apiBaseUrl: e,
  apiUrl: t,
  proxyUrl: r,
  userContext: n,
  role: a,
  roleId: o,
  client: i,
  welcomeMessage: l,
  suggestions: c,
  disableSuggestions: f,
  initialMessage: b,
  hideInspectSources: k,
  showGroundedSources: u,
  modelId: m,
  ...p
}) => {
  const g = it(), h = e ?? t ?? r;
  return !!g && (!h || Ce(h) === Ce(g == null ? void 0 : g.apiBaseUrl)) && !n && a === void 0 && o === void 0 && i === void 0 && l === void 0 && !c && f === void 0 && !b && k === void 0 && u === void 0 && m === void 0 ? /* @__PURE__ */ s(_t, { ...p }) : /* @__PURE__ */ s(
    Et,
    {
      apiBaseUrl: h,
      userContext: n,
      role: a,
      roleId: o,
      client: i,
      welcomeMessage: l,
      suggestions: c,
      disableSuggestions: f,
      initialMessage: b,
      hideInspectSources: k,
      showGroundedSources: u,
      modelId: m,
      children: /* @__PURE__ */ s(_t, { ...p })
    }
  );
}, Zn = ({
  open: e,
  onClose: t,
  subtitle: r,
  title: n,
  envStage: a,
  envPulse: o = !0
}) => /* @__PURE__ */ v(Be, { children: [
  /* @__PURE__ */ s(
    "div",
    {
      className: `embedded-overlay ${e ? "embedded-overlay--open" : "embedded-overlay--closed"}`,
      hidden: !e,
      onClick: t,
      "aria-hidden": "true"
    }
  ),
  /* @__PURE__ */ s(
    "aside",
    {
      id: "vps-embedded-chat-panel",
      className: `embedded-panel ${e ? "embedded-panel--open" : "embedded-panel--closed"}`,
      "aria-hidden": !e,
      children: e && /* @__PURE__ */ s(
        Xt,
        {
          onClose: t,
          title: n || "VPS AI Assistant",
          subtitle: r,
          envStage: a,
          envPulse: o
        }
      )
    }
  )
] }), Kn = 5, Ke = 8, Qt = "vps-embedded-assistant-top";
function Xn(e, t, r) {
  return Math.min(r, Math.max(t, e));
}
function Ct(e, t) {
  const r = Math.max(
    Ke,
    window.innerHeight - t - Ke
  );
  return Xn(e, Ke, r);
}
function Qn() {
  try {
    const e = window.localStorage.getItem(Qt);
    if (!e) return null;
    const t = Number(e);
    return Number.isFinite(t) ? t : null;
  } catch {
    return null;
  }
}
function es(e) {
  try {
    window.localStorage.setItem(Qt, String(e));
  } catch {
  }
}
const ts = ({
  onOpen: e
}) => {
  const t = ne(null), r = ne({
    pointerId: null,
    startY: 0,
    startTop: 0,
    moved: !1
  }), [n, a] = j(
    () => typeof window > "u" ? null : Qn()
  ), o = ne(n), i = ne(!1), [l, c] = j(!1);
  _e(() => {
    o.current = n;
  }, [n]), _e(() => {
    const u = t.current;
    if (!u) return;
    const m = () => {
      a((p) => {
        const g = p ?? Math.round(window.innerHeight / 2 - u.offsetHeight / 2), h = Ct(g, u.offsetHeight);
        return o.current = h, h;
      });
    };
    return m(), window.addEventListener("resize", m), () => window.removeEventListener("resize", m);
  }, []);
  const f = (u) => {
    if (u.button !== 0) return;
    const m = u.currentTarget, p = m.getBoundingClientRect();
    r.current = {
      pointerId: u.pointerId,
      startY: u.clientY,
      startTop: p.top,
      moved: !1
    };
    try {
      m.setPointerCapture(u.pointerId);
    } catch {
    }
  }, b = (u) => {
    if (r.current.pointerId !== u.pointerId) return;
    const m = u.clientY - r.current.startY;
    if (!r.current.moved && Math.abs(m) < Kn) return;
    r.current.moved = !0, c(!0);
    const p = Ct(
      r.current.startTop + m,
      u.currentTarget.offsetHeight
    );
    o.current = p, a(p);
  }, k = (u) => {
    var p, g;
    if (r.current.pointerId !== u.pointerId) return;
    try {
      (g = (p = u.currentTarget).hasPointerCapture) != null && g.call(p, u.pointerId) && u.currentTarget.releasePointerCapture(u.pointerId);
    } catch {
    }
    const m = r.current.moved;
    r.current.pointerId = null, r.current.moved = !1, c(!1), m && (i.current = !0, o.current != null && es(o.current));
  };
  return /* @__PURE__ */ v(
    "button",
    {
      ref: t,
      type: "button",
      onPointerDown: f,
      onPointerMove: b,
      onPointerUp: k,
      onPointerCancel: k,
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
      className: `embedded-trigger-btn ${l ? "embedded-trigger-btn--grabbing" : "embedded-trigger-btn--grab"}`,
      style: {
        top: n ?? "50%",
        transform: n == null ? "translateY(-50%)" : void 0
      },
      children: [
        /* @__PURE__ */ s(Pt, { size: 16 }),
        "Assistant"
      ]
    }
  );
}, St = ({
  defaultOpen: e = !1,
  open: t,
  onOpenChange: r,
  showTrigger: n = !0,
  envStage: a,
  envPulse: o = !0
}) => {
  const [i, l] = j(e), c = t ?? i, f = (b) => {
    r == null || r(b), t === void 0 && l(b);
  };
  return /* @__PURE__ */ v(Be, { children: [
    n && !c && /* @__PURE__ */ s(ts, { onOpen: () => f(!0) }),
    /* @__PURE__ */ s(
      Zn,
      {
        open: c,
        onClose: () => f(!1),
        envStage: a,
        envPulse: o
      }
    )
  ] });
}, as = ({
  apiBaseUrl: e,
  apiUrl: t,
  proxyUrl: r,
  userContext: n,
  role: a,
  roleId: o,
  client: i,
  welcomeMessage: l,
  suggestions: c,
  disableSuggestions: f,
  initialMessage: b,
  hideInspectSources: k,
  showGroundedSources: u,
  modelId: m,
  ...p
}) => {
  const g = it(), h = e ?? t ?? r;
  return !!g && (!h || Ce(h) === Ce(g == null ? void 0 : g.apiBaseUrl)) && !n && a === void 0 && o === void 0 && i === void 0 && l === void 0 && !c && f === void 0 && !b && k === void 0 && u === void 0 && m === void 0 ? /* @__PURE__ */ s(St, { ...p }) : /* @__PURE__ */ s(
    Et,
    {
      apiBaseUrl: h,
      userContext: n,
      role: a,
      roleId: o,
      client: i,
      welcomeMessage: l,
      suggestions: c,
      disableSuggestions: f,
      initialMessage: b,
      hideInspectSources: k,
      showGroundedSources: u,
      modelId: m,
      children: /* @__PURE__ */ s(St, { ...p })
    }
  );
}, ls = {
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
  Xt as ChatPanel,
  Et as ChatProvider,
  os as ChatbotWidget,
  ls as ColorPalette,
  as as EmbeddedChatbot,
  Ue as buildApiUrl,
  ss as chatApi,
  Rt as createChatApi,
  Ce as resolveApiBaseUrl,
  or as useChatContext,
  Ge as useChatbot,
  it as useOptionalChatContext
};
