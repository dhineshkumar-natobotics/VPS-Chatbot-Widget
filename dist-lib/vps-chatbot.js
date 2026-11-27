var Zc = Object.defineProperty;
var ea = (e, t, n) => t in e ? Zc(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n;
var ce = (e, t, n) => ea(e, typeof t != "symbol" ? t + "" : t, n);
import { jsx as b, jsxs as $, Fragment as Ut } from "react/jsx-runtime";
import * as y from "react";
import je, { useState as Re, useRef as Fe, useEffect as Ke, useCallback as We, createContext as er, useContext as qt, useMemo as Tt, forwardRef as Js, createElement as nn, useId as Ar, useImperativeHandle as ta, useLayoutEffect as na, lazy as ra, Suspense as oa } from "react";
import * as yt from "react-dom";
const sa = {};
function Lt(e) {
  return e != null && e.trim() !== "" ? e.trim().replace(/\/+$/, "") : String("").trim().replace(/\/+$/, "");
}
function pr(e, t) {
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
  return o && !ia(o) ? {
    code: (i = r == null ? void 0 : r.error) == null ? void 0 : i.code,
    message: o,
    requestId: (c = r == null ? void 0 : r.error) == null ? void 0 : c.request_id
  } : n >= 500 ? { message: "I couldn't process that request right now." } : n === 0 ? { message: "Something went wrong while connecting. Please try again." } : { message: t };
}
function ia(e) {
  return /traceback|sql|exception|stack|api[_ ]?key|password/i.test(e);
}
function hr(e) {
  return {
    chunkId: e.chunk_id,
    source: e.source,
    score: e.score,
    title: e.title,
    ...e.url ? { url: e.url } : {},
    snippet: e.snippet
  };
}
function mr(e) {
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
function ca(e) {
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
async function br(e) {
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
    const i = pr(t, r);
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
    const c = await br(s);
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
            ...s != null && s.service ? { service: s.service } : {},
            ...s != null && s.modelId ? { model_id: s.modelId } : {}
          })
        }
      );
      return {
        requestId: c.request_id,
        sessionId: c.session_id,
        answer: c.answer,
        sources: (c.sources || []).map(hr),
        toolCalls: (c.tool_calls || []).map(mr),
        usage: gr(c.usage),
        durationMs: c.duration_ms,
        suggestions: c.suggestions
      };
    },
    async sendMessageStream(r, o, s, i, c, a) {
      var u, d;
      const l = pr(t, `/api/v1/sessions/${r}/messages/stream`);
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
            ...s != null && s.service ? { service: s.service } : {},
            ...s != null && s.modelId ? { model_id: s.modelId } : {}
          })
        });
        if (!p.ok) {
          if (p.status === 404 || p.status === 405)
            return await this.sendMessage(r, o, s, a);
          const E = await br(p);
          throw Zo(
            E,
            "I couldn't process that request right now.",
            p.status
          );
        }
        if (!p.body || (d = (u = p.headers) == null ? void 0 : u.get("content-type")) != null && d.includes("application/json")) {
          const E = Jo(await br(p));
          if (typeof E.answer != "string" || !E.usage)
            throw { message: "The response stream ended unexpectedly." };
          return {
            requestId: E.request_id,
            sessionId: E.session_id,
            answer: E.answer,
            sources: (E.sources || []).map(hr),
            toolCalls: (E.tool_calls || []).map(mr),
            usage: gr(E.usage),
            durationMs: E.duration_ms,
            suggestions: E.suggestions
          };
        }
        const h = p.body.getReader(), f = new TextDecoder();
        let m = "";
        const g = { value: null }, v = (E) => {
          const C = E.split(/\r?\n/).filter((S) => S.startsWith("data:")).map((S) => S.slice(5).trimStart()).join(`
`);
          if (!C) return;
          let T = {};
          try {
            const S = JSON.parse(C);
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
            g.value = {
              requestId: T.request_id || "",
              sessionId: T.session_id || r,
              answer: T.answer || "",
              sources: (T.sources || []).map(hr),
              toolCalls: (T.tool_calls || []).map(mr),
              usage: T.usage ? gr(T.usage) : { model: "", promptTokens: 0, completionTokens: 0, totalTokens: 0 },
              durationMs: T.duration_ms,
              suggestions: T.suggestions
            };
          else if (T.type === "error")
            throw {
              message: T.message || "I couldn't process that request right now.",
              requestId: T.request_id
            };
        };
        try {
          for (; !g.value; ) {
            const { done: E, value: C } = await h.read();
            if (E) break;
            if (m += f.decode(C, { stream: !0 }), m.length > 1e6)
              throw { message: "The response stream was too large." };
            const T = m.split(/\r?\n\r?\n/);
            m = T.pop() || "";
            for (const S of T)
              if (v(S), g.value) break;
          }
          m += f.decode(), !g.value && m.trim() && v(m);
        } finally {
          await h.cancel().catch(() => {
          }), h.releaseLock();
        }
        const w = g.value;
        if (w)
          return w;
        throw { message: "The response stream ended before the answer was complete." };
      } catch (p) {
        throw !(p instanceof Error) && p && typeof p == "object" && "message" in p ? p : { message: "Something went wrong while connecting. Please try again." };
      }
    },
    async getHistory(r) {
      try {
        return ((await n(
          `/api/v1/sessions/${r}/messages`
        )).messages || []).map(ca);
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
        const r = pr(t, "/health");
        return (await fetch(r)).ok;
      } catch {
        return !1;
      }
    }
  };
}
const Dm = Zs(), aa = [
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
], Xt = ["vessel", "tot"], la = {
  1: {
    name: "CC Report",
    client: "web",
    services: Xt,
    topics: "finding, filtering, and downloading reports",
    questions: ["How do I download a fuel report?", "How do I filter lubricant reports?", "How do I find a transformer oil report?"],
    serviceQuestions: {
      vessel: ["How do I download a fuel report?", "How do I filter lubricant reports?"],
      tot: ["How do I find a transformer oil report?", "How do I download a transformer oil report as a PDF?"]
    }
  },
  2: {
    name: "Client Admin",
    client: "admin",
    services: Xt,
    topics: "client access, Vessel and TOT workflows, and VPS support",
    questions: ["How do I add a client user?", "How do I find reports for a vessel or transformer?", "Why is a portal menu missing for a client user?"]
  },
  6: {
    name: "Fleet Manager",
    client: "web",
    services: ["vessel"],
    topics: "vessels, marine samples, reports, and fleet trends",
    questions: ["How do I find reports for a vessel?", "Where can I find a vessel's sample status?", "How do I review fleet fuel trends?"]
  },
  7: {
    name: "High Level Management",
    client: "web",
    services: Xt,
    topics: "management dashboards and trend comparisons",
    questions: ["How do I compare fuel trends across vessels?", "How do I review transformer oil trends?", "Where is the CII Dashboard?"]
  },
  9: {
    name: "Sampler",
    client: "mobile",
    services: Xt,
    topics: "sample pre-registration, barcode scanning, and labels in the mobile app",
    questions: ["How do I pre-register a vessel sample in the mobile app?", "How do I scan a sample label?", "How do I pre-register a transformer sample in the mobile app?"],
    serviceQuestions: {
      vessel: ["How do I pre-register a vessel sample in the mobile app?", "How do I scan a vessel sample label?"],
      tot: ["How do I pre-register a transformer sample in the mobile app?", "How do I scan a transformer sample label?"]
    },
    webQuestions: ["How do I pre-register a vessel sample in the portal?", "How do I pre-register a transformer sample in the portal?"],
    webServiceQuestions: {
      vessel: ["How do I pre-register a vessel sample in the portal?", "Where can I download my fuel report?"],
      tot: ["How do I pre-register a transformer sample in the portal?", "Where can I download a transformer oil report?"]
    }
  },
  10: {
    name: "VPS Admin",
    client: "admin",
    services: Xt,
    topics: "Vessel and TOT workflows, portal administration, and VPS support",
    questions: ["How do I review a portal registration request?", "Where do I find vessel reports?", "How do I view transformer oil test trends?"]
  },
  11: {
    name: "Transoil",
    client: "web",
    services: ["tot"],
    topics: "transformer assets, oil reports, and trends",
    questions: ["How do I find my transformer equipment?", "Where can I download a transformer oil report?", "How do I review transformer oil trends?"]
  },
  12: {
    name: "Bunker Master Only",
    client: "mobile",
    services: ["vessel"],
    topics: "Bunker Master access, calculators, and Fuel Change-Over",
    questions: ["How do I request Bunker Master access?", "Where can I find the Bunker Master calculators?", "How do I download the Fuel Change-Over workbook?"]
  },
  13: {
    name: "Fleet Manager Transoil",
    client: "web",
    services: ["tot"],
    topics: "transformer equipment, reports, and fleet trends",
    questions: ["How do I compare transformer oil trends for equipment?", "How do I filter transformer oil reports by site?", "How do I pre-register a transformer sample?"]
  }
};
function ei(e) {
  return la[e];
}
const es = "vps-chatbot-response-sound";
function ua() {
  const [e, t] = Re(!0), n = Fe(!0), r = Fe(null);
  Ke(() => {
    try {
      n.current = window.localStorage.getItem(es) !== "off", t(n.current);
    } catch {
    }
    return () => {
      var c;
      (c = r.current) == null || c.close().catch(() => {
      }), r.current = null;
    };
  }, []);
  const o = We(() => {
    if (!(!n.current || typeof AudioContext > "u"))
      try {
        const c = r.current ?? (r.current = new AudioContext());
        c.state !== "running" && c.resume().catch(() => {
        });
      } catch {
      }
  }, []), s = We(() => {
    const c = !n.current;
    n.current = c, t(c);
    try {
      window.localStorage.setItem(es, c ? "on" : "off");
    } catch {
    }
    c && o();
  }, [o]), i = We(() => {
    const c = r.current;
    if (!(!n.current || (c == null ? void 0 : c.state) !== "running"))
      try {
        const a = c.currentTime;
        for (const [l, u] of [660, 880].entries()) {
          const d = a + l * 0.09, p = c.createOscillator(), h = c.createGain();
          p.frequency.value = u, h.gain.setValueAtTime(1e-3, d), h.gain.exponentialRampToValueAtTime(0.06, d + 0.015), h.gain.exponentialRampToValueAtTime(1e-3, d + 0.14), p.connect(h), h.connect(c.destination), p.onended = () => {
            p.disconnect(), h.disconnect();
          }, p.start(d), p.stop(d + 0.15);
        }
      } catch {
      }
  }, []);
  return { soundEnabled: e, toggleSound: s, prepareSound: o, playSound: i };
}
const no = er(null);
function da() {
  const e = qt(no);
  if (!e)
    throw new Error("useChatbot must be used inside ChatProvider.");
  return e;
}
function ro() {
  return qt(no);
}
function At(e, t, n, r) {
  if (typeof performance.measure != "function") return;
  const o = `vps-chatbot:${e}`;
  performance.clearMeasures(o), performance.measure(o, { start: t, end: n, detail: r ? { requestId: r } : null });
}
const fa = `Hello! I am your **VPS Veritas assistant**.

I can help you with:
- **Fuel Quality Testing (FQT)** & **Oil Condition Monitoring (OCM)**
- **Fuel Defect Reporting (FDR)** — report and track bunker defect incidents
- **Bunker Master** — manage bunkering operations, BDN logs, and surveys
- **FSC & FSQ E-Forms** — paperless fuel system checks and bunker sample pre-registration
- **Samplogic** sample logistics, report downloads, and support tickets

Feel free to ask a question or select one of the suggested topics below!`;
function ts(e) {
  return `${e}-${crypto.randomUUID()}`;
}
function pa(e) {
  if (e && typeof e == "object" && "message" in e) {
    const t = String(e.message);
    if (t && !/traceback|sql|exception|stack|api[_ ]?key|password/i.test(t))
      return t;
  }
  return "I couldn't process that request right now.";
}
const ti = (e) => {
  var o, s, i, c, a;
  const t = e.roleId ?? ((o = e.userContext) == null ? void 0 : o.roleId), n = e.client ?? ((s = e.userContext) == null ? void 0 : s.client) ?? ((i = ei(t)) == null ? void 0 : i.client), r = JSON.stringify([t, n, (c = e.userContext) == null ? void 0 : c.customerId, (a = e.userContext) == null ? void 0 : a.email]);
  return /* @__PURE__ */ b(ha, { ...e, roleId: t, client: n }, r);
}, ha = ({
  children: e,
  userContext: t = {},
  role: n,
  roleId: r,
  client: o,
  service: s,
  welcomeMessage: i,
  suggestions: c,
  disableSuggestions: a = !1,
  initialMessage: l,
  apiBaseUrl: u,
  apiUrl: d,
  proxyUrl: p,
  api: h,
  hideInspectSources: f = !1,
  showGroundedSources: m = !1,
  modelId: g = "auto"
}) => {
  var He;
  const v = u ?? d ?? p, w = Tt(
    () => h ?? Zs(v),
    [h, v]
  ), E = ei(r), C = s ?? t.service, T = Tt(() => {
    if (c) return c;
    if (!E) return aa;
    const K = o === "web" && E.webQuestions, J = K ? E.webServiceQuestions : E.serviceQuestions;
    return (C && (J == null ? void 0 : J[C]) || K || E.questions).map((L) => ({ label: L, query: L }));
  }, [C, o, E, c]), S = Tt(() => ({
    ...t,
    role: n ?? t.role ?? (E == null ? void 0 : E.name),
    ...r !== void 0 ? { roleId: r } : {},
    ...o !== void 0 ? { client: o } : {},
    ...s !== void 0 ? { service: s } : {}
  }), [t, n, r, o, E, s]), R = Tt(() => i === "" ? null : {
    id: "welcome-default",
    role: "assistant",
    content: i ?? (E ? `Hello! I’m your **VPS Veritas assistant**. I can help with ${E.topics}. What would you like to do?` : fa),
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    status: "complete"
  }, [E, i]), [x, P] = Re(null), [O, N] = Re(() => R ? [R] : []), [_, D] = Re("idle"), [A, I] = Re(null), F = Fe(null), U = Fe(!1), k = Fe(null), M = Fe(null), z = Fe(!1), [j, ae] = Re([]), [re, B] = Re(g), { soundEnabled: G, toggleSound: V, prepareSound: H, playSound: Z } = ua();
  je.useEffect(() => B(g), [g]), je.useEffect(() => {
    var J;
    let K = !0;
    return ae([]), (J = w.listModels) == null || J.call(w).then((ue) => {
      K && ae((ue == null ? void 0 : ue.models) || []);
    }).catch(() => {
    }), () => {
      K = !1;
    };
  }, [w]);
  const oe = We((K) => {
    !z.current && (K === "auto" || j.some((J) => J.id === K && J.configured)) && B(K);
  }, [j]);
  je.useEffect(() => () => {
    var K;
    return (K = k.current) == null ? void 0 : K.abort();
  }, []), je.useLayoutEffect(() => {
    const K = M.current;
    if (!K) return;
    const J = O.find((L) => L.id === K.messageId), ue = performance.now();
    (J == null ? void 0 : J.status) === "complete" && K.completedAt !== void 0 ? (At("completion-to-commit", K.completedAt, ue), At("submit-to-complete-commit", K.startedAt, ue), M.current = null) : (J == null ? void 0 : J.status) === "pending" && J.content && K.firstTokenAt !== void 0 && !K.firstCommitRecorded && (At("first-token-to-commit", K.firstTokenAt, ue), K.firstCommitRecorded = !0);
  }, [O]);
  const ee = We(async (K) => {
    if (x) return x;
    D("connecting");
    const J = await w.createSession(K);
    if (K.aborted) throw new DOMException("Aborted", "AbortError");
    return P(J.sessionId), J.sessionId;
  }, [x, w]), te = We(
    async (K) => {
      if (z.current) return;
      H(), z.current = !0;
      const J = new AbortController();
      k.current = J;
      let ue, L = "";
      const Y = () => {
        ue !== void 0 && cancelAnimationFrame(ue), ue = void 0;
      };
      F.current = K;
      const Te = {
        id: ts("user"),
        role: "user",
        content: K,
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        status: "complete"
      }, me = ts("asst"), xe = "Preparing your answer…", q = {
        id: me,
        streamId: me,
        role: "assistant",
        content: "",
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        status: "pending",
        progressText: xe,
        progressSteps: [xe]
      }, Q = performance.now(), X = { messageId: me, startedAt: Q };
      M.current = X, N((Se) => [...Se, Te, q]), D("awaiting"), I(null);
      const ie = (Se) => {
        const fe = Se.trim();
        !fe || J.signal.aborted || N(
          (Ae) => Ae.map(
            (Ie) => Ie.id === me && Ie.progressText !== fe ? {
              ...Ie,
              progressText: fe,
              progressSteps: [...Ie.progressSteps ?? [], fe]
            } : Ie
          )
        );
      };
      try {
        const Se = await ee(J.signal), fe = performance.now();
        At("request-preparation", Q, fe);
        const Ae = w.sendMessageStream ? await w.sendMessageStream(
          Se,
          K,
          {
            roleId: S.roleId,
            client: S.client,
            service: S.service,
            modelId: re
          },
          ie,
          (Ie) => {
            J.signal.aborted || (Ie && X.firstTokenAt === void 0 && (X.firstTokenAt = performance.now(), At("first-token-received", fe, X.firstTokenAt)), L += Ie, ue === void 0 && (ue = requestAnimationFrame(() => {
              ue = void 0, J.signal.aborted || N((Xe) => Xe.map((ze) => ze.id === me ? { ...ze, content: L } : ze));
            })));
          },
          J.signal
        ) : await w.sendMessage(Se, K, {
          roleId: S.roleId,
          client: S.client,
          service: S.service,
          modelId: re
        }, J.signal);
        if (Y(), J.signal.aborted) return;
        X.messageId = Ae.requestId || me, X.completedAt = performance.now(), At("completion-received", fe, X.completedAt, Ae.requestId), N(
          (Ie) => Ie.map(
            (Xe) => Xe.id === me ? {
              ...Xe,
              id: Ae.requestId || me,
              content: Ae.answer,
              status: "complete",
              progressText: void 0,
              sources: Ae.sources,
              suggestions: Ae.suggestions,
              toolCalls: Ae.toolCalls,
              usage: Ae.usage,
              durationMs: Math.max(
                Math.round(performance.now() - Q),
                Ae.durationMs ?? 0
              )
            } : Xe
          )
        ), D("idle"), Z();
      } catch (Se) {
        if (Y(), M.current === X && (M.current = null), J.signal.aborted) return;
        const fe = pa(Se);
        N(
          (Ae) => Ae.map(
            (Ie) => Ie.id === me ? { ...Ie, content: fe, status: "error", progressText: void 0 } : Ie
          )
        ), I(fe), D("error");
      } finally {
        Y(), k.current === J && (k.current = null, z.current = !1);
      }
    },
    [ee, w, S.client, S.roleId, S.service, re, H, Z]
  ), W = We(
    async (K) => {
      const J = K.trim();
      !J || _ === "awaiting" || _ === "connecting" || await te(J);
    },
    [te, _]
  ), ne = We(async () => {
    if (z.current) return;
    const K = F.current;
    K && (N((J) => J.filter((ue) => ue.status !== "error")), await te(K));
  }, [te]), se = We(() => {
    const K = k.current;
    K && (K.abort(), k.current = null, z.current = !1, M.current = null, N((J) => J.map(
      (ue) => ue.status === "pending" ? { ...ue, status: "stopped", progressText: void 0 } : ue
    )), D("idle"));
  }, []), be = We(
    (K, J) => {
      N((ue) => ue.map(
        (L) => L.id === K ? { ...L, feedback: L.feedback === J ? void 0 : J } : L
      ));
    },
    []
  ), ve = We(async () => {
  }, []), Oe = We(() => {
  }, []), Ne = We(async () => {
    var K;
    (K = k.current) == null || K.abort(), k.current = null, z.current = !1, P(null), N(R ? [R] : []), D("idle"), I(null), F.current = null, x && await w.closeSession(x);
  }, [x, w, R]);
  je.useEffect(() => {
    !l || U.current || (U.current = !0, W(l));
  }, [l, W]);
  const we = (He = O[O.length - 1]) == null ? void 0 : He.suggestions, De = Tt(
    () => ({
      messages: O,
      status: _,
      error: A,
      sessionId: x,
      pendingTicket: null,
      ticketBusy: !1,
      lastTicket: null,
      suggestions: we != null && we.length ? we.map((K) => ({ label: K, query: K })) : T,
      showSuggestions: !a && _ === "idle" && (O.length === 0 || O.length === 1 && O[0].id === "welcome-default" || O.some((K) => K.role === "assistant" && K.status === "complete" && !K.id.startsWith("welcome"))),
      suggestionBadgesEnabled: !a,
      userContext: S,
      apiBaseUrl: w.apiBaseUrl,
      hideInspectSources: f,
      showGroundedSources: m,
      soundEnabled: G,
      toggleSound: V,
      sendMessage: W,
      stopResponse: se,
      toggleMessageFeedback: be,
      retryLast: ne,
      confirmTicket: ve,
      cancelTicket: Oe,
      resetConversation: Ne,
      models: j,
      selectedModelId: re,
      selectModel: oe
    }),
    [
      O,
      _,
      A,
      x,
      T,
      we,
      a,
      S,
      w.apiBaseUrl,
      f,
      m,
      G,
      V,
      W,
      se,
      be,
      ne,
      ve,
      Oe,
      Ne,
      j,
      re,
      oe
    ]
  );
  return /* @__PURE__ */ b(no.Provider, { value: De, children: e });
};
function ni(e) {
  var t, n, r = "";
  if (typeof e == "string" || typeof e == "number") r += e;
  else if (typeof e == "object") if (Array.isArray(e)) {
    var o = e.length;
    for (t = 0; t < o; t++) e[t] && (n = ni(e[t])) && (r && (r += " "), r += n);
  } else for (n in e) e[n] && (r && (r += " "), r += n);
  return r;
}
function ri() {
  for (var e, t, n = 0, r = "", o = arguments.length; n < o; n++) (e = arguments[n]) && (t = ni(e)) && (r && (r += " "), r += t);
  return r;
}
function le(...e) {
  return ri(e);
}
function oi({
  className: e,
  variant: t = "default",
  ...n
}) {
  return /* @__PURE__ */ b("div", { ...n, "data-slot": "marker", "data-variant": t, className: le("chat-marker", e) });
}
function ma({ className: e, ...t }) {
  return /* @__PURE__ */ b("span", { ...t, "data-slot": "marker-icon", className: le("chat-marker-icon", e), "aria-hidden": "true" });
}
function si({ className: e, ...t }) {
  return /* @__PURE__ */ b("span", { ...t, "data-slot": "marker-content", className: le("chat-marker-content", e) });
}
function tr() {
  return da();
}
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const ga = (e) => e.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase(), ii = (...e) => e.filter((t, n, r) => !!t && t.trim() !== "" && r.indexOf(t) === n).join(" ").trim();
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
var ba = {
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
const va = Js(
  ({
    color: e = "currentColor",
    size: t = 24,
    strokeWidth: n = 2,
    absoluteStrokeWidth: r,
    className: o = "",
    children: s,
    iconNode: i,
    ...c
  }, a) => nn(
    "svg",
    {
      ref: a,
      ...ba,
      width: t,
      height: t,
      stroke: e,
      strokeWidth: r ? Number(n) * 24 / Number(t) : n,
      className: ii("lucide", o),
      ...c
    },
    [
      ...i.map(([l, u]) => nn(l, u)),
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
    ({ className: r, ...o }, s) => nn(va, {
      ref: s,
      iconNode: t,
      className: ii(`lucide-${ga(e)}`, r),
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
const ya = ye("ArrowDown", [
  ["path", { d: "M12 5v14", key: "s699le" }],
  ["path", { d: "m19 12-7 7-7-7", key: "1idqje" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const wa = ye("ArrowLeft", [
  ["path", { d: "m12 19-7-7 7-7", key: "1l729n" }],
  ["path", { d: "M19 12H5", key: "x3x0zl" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Ca = ye("ArrowUp", [
  ["path", { d: "m5 12 7-7 7 7", key: "hav0vg" }],
  ["path", { d: "M12 19V5", key: "x0mq9r" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Ea = ye("BookOpen", [
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
const Sa = ye("BotMessageSquare", [
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
const oo = ye("Check", [["path", { d: "M20 6 9 17l-5-5", key: "1gmf2c" }]]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Ta = ye("ChevronLeft", [
  ["path", { d: "m15 18-6-6 6-6", key: "1wnfg3" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const ci = ye("ChevronRight", [
  ["path", { d: "m9 18 6-6-6-6", key: "mthhwq" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Ra = ye("CircleAlert", [
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
const ai = ye("CircleCheck", [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["path", { d: "m9 12 2 2 4-4", key: "dzmm74" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const xa = ye("ClipboardCheck", [
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
const li = ye("Copy", [
  ["rect", { width: "14", height: "14", x: "8", y: "8", rx: "2", ry: "2", key: "17jyea" }],
  ["path", { d: "M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2", key: "zix9uf" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Ia = ye("ExternalLink", [
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
const Pa = ye("FlaskConical", [
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
const Oa = ye("Library", [
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
const ui = ye("LoaderCircle", [
  ["path", { d: "M21 12a9 9 0 1 1-6.219-8.56", key: "13zald" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const _a = ye("MessageSquare", [
  ["path", { d: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z", key: "1lielz" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const ka = ye("Microscope", [
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
const Aa = ye("Minus", [["path", { d: "M5 12h14", key: "1ays0h" }]]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Na = ye("Pencil", [
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
const Ma = ye("RefreshCw", [
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
const di = ye("Square", [
  ["rect", { width: "18", height: "18", x: "3", y: "3", rx: "2", key: "afitv7" }]
]);
/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Da = ye("TestTubeDiagonal", [
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
const Fa = ye("ThumbsDown", [
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
const La = ye("ThumbsUp", [
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
const Ba = ye("Volume2", [
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
const Va = ye("VolumeX", [
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
const Ha = ye("Wrench", [
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
const $a = ye("X", [
  ["path", { d: "M18 6 6 18", key: "1bl5f8" }],
  ["path", { d: "m6 6 12 12", key: "d8bk6v" }]
]);
function so({
  align: e = "start",
  className: t,
  ...n
}) {
  return /* @__PURE__ */ b("div", { ...n, "data-slot": "message", "data-align": e, className: le("chat-message", t) });
}
function fi({ className: e, ...t }) {
  return /* @__PURE__ */ b("div", { ...t, "data-slot": "message-avatar", className: le("chat-message-avatar", e) });
}
function io({ className: e, ...t }) {
  return /* @__PURE__ */ b("div", { ...t, "data-slot": "message-content", className: le("chat-message-content", e) });
}
function Wa({ className: e, ...t }) {
  return /* @__PURE__ */ b("div", { ...t, "data-slot": "message-header", className: le("chat-message-header", e) });
}
function Nr({ className: e, ...t }) {
  return /* @__PURE__ */ b("div", { ...t, "data-slot": "message-footer", className: le("chat-message-footer", e) });
}
const lt = {
  ...y
}, ns = {};
function ot(e, t) {
  const n = y.useRef(ns);
  return n.current === ns && (n.current = e(t)), n;
}
const vr = lt.useInsertionEffect, Ua = (
  // React 17 doesn't have useInsertionEffect.
  vr && // Preact replaces useInsertionEffect with useLayoutEffect and fires too late.
  vr !== lt.useLayoutEffect ? vr : (e) => e()
);
function de(e) {
  const t = ot(qa).current;
  return t.next = e, Ua(t.effect), t.trampoline;
}
function qa() {
  const e = {
    next: void 0,
    callback: za,
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
function za() {
  if (process.env.NODE_ENV !== "production")
    throw (
      /* minify-error-disabled */
      new Error("Base UI: Cannot call an event handler while rendering.")
    );
}
function Mr(e, t, n, r) {
  const o = ot(pi).current;
  return Ga(o, e, t, n, r) && hi(o, [e, t, n, r]), o.callback;
}
function ja(e) {
  const t = ot(pi).current;
  return Ka(t, e) && hi(t, e), t.callback;
}
function pi() {
  return {
    callback: null,
    cleanup: null,
    refs: []
  };
}
function Ga(e, t, n, r, o) {
  return e.refs[0] !== t || e.refs[1] !== n || e.refs[2] !== r || e.refs[3] !== o;
}
function Ka(e, t) {
  return e.refs.length !== t.length || e.refs.some((n, r) => n !== t[r]);
}
function hi(e, t) {
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
const Ya = parseInt(y.version, 10);
function mi(e) {
  return Ya >= e;
}
function rs(e) {
  if (!/* @__PURE__ */ y.isValidElement(e))
    return null;
  const t = e, n = t.props;
  return (mi(19) ? n == null ? void 0 : n.ref : t.ref) ?? null;
}
function Dr(e, t) {
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
let Fr;
process.env.NODE_ENV !== "production" && (Fr = /* @__PURE__ */ new Set());
function gi(e, t) {
  return function(...r) {
    if (process.env.NODE_ENV !== "production") {
      const o = r.join(" "), s = `${t}: ${o}`, i = `${e}:${s}`;
      Fr.has(i) || (Fr.add(i), e === "warn" ? console.warn(s) : console.error(s));
    }
  };
}
const co = gi("warn", "Base UI");
function ao() {
}
const Xa = Object.freeze([]), Ue = Object.freeze({});
function Qa(e, t) {
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
function Ja(e, t) {
  return typeof e == "function" ? e(t) : e;
}
function bi(e, t) {
  return typeof e == "function" ? e(t) : e;
}
const vi = {};
function lo(e, t, n, r, o) {
  if (!n && !r && !e)
    return Vn(t);
  let s = Vn(e);
  return t && (s = Mn(s, t)), n && (s = Mn(s, n)), r && (s = Mn(s, r)), s;
}
function Za(e) {
  if (e.length === 0)
    return vi;
  if (e.length === 1)
    return Vn(e[0]);
  let t = Vn(e[0]);
  for (let n = 1; n < e.length; n += 1)
    t = Mn(t, e[n]);
  return t;
}
function Vn(e) {
  return wi(e) ? {
    ...e(vi)
  } : el(e);
}
function Mn(e, t) {
  return wi(t) ? t(e) : tl(e, t);
}
function el(e) {
  const t = {
    ...e
  };
  for (const n in t) {
    const r = t[n];
    yi(n, r) && (t[n] = Ci(r));
  }
  return t;
}
function tl(e, t) {
  if (!t)
    return e;
  for (const n in t) {
    const r = t[n];
    switch (n) {
      case "style": {
        e[n] = Dr(e.style, r);
        break;
      }
      case "className": {
        e[n] = Ei(e.className, r);
        break;
      }
      default:
        yi(n, r) ? e[n] = nl(e[n], r) : e[n] = r;
    }
  }
  return e;
}
function yi(e, t) {
  const n = e.charCodeAt(0), r = e.charCodeAt(1), o = e.charCodeAt(2);
  return n === 111 && r === 110 && o >= 65 && o <= 90 && (typeof t == "function" || typeof t > "u");
}
function wi(e) {
  return typeof e == "function";
}
function nl(e, t) {
  return t ? e ? (...n) => {
    const r = n[0];
    if (Si(r)) {
      const s = r;
      Hn(s);
      const i = t(...n);
      return s.baseUIHandlerPrevented || e == null || e(...n), i;
    }
    const o = t(...n);
    return e == null || e(...n), o;
  } : Ci(t) : e;
}
function Ci(e) {
  return e && ((...t) => {
    const n = t[0];
    return Si(n) && Hn(n), e(...t);
  });
}
function Hn(e) {
  return e.preventBaseUIHandler = () => {
    e.baseUIHandlerPrevented = !0;
  }, e;
}
function Ei(e, t) {
  return t ? e ? t + " " + e : t : e;
}
function Si(e) {
  return e != null && typeof e == "object" && "nativeEvent" in e;
}
function wt(e, t, n = {}) {
  let r = t.render;
  n.enabled !== !1 && (r = al(r));
  const o = rl(t, n, r);
  if (n.enabled === !1)
    return null;
  const s = n.state ?? Ue;
  return ll(e, r, o, s);
}
function rl(e, t, n) {
  const {
    className: r,
    style: o
  } = e, {
    state: s = Ue,
    ref: i,
    props: c,
    stateAttributesMapping: a,
    enabled: l = !0
  } = t, u = l ? Ja(r, s) : void 0, d = l ? bi(o, s) : void 0, p = l ? Qa(s, a) : Ue, h = l && c ? ol(c) : void 0, f = l ? Dr(p, h) ?? {} : Ue;
  return typeof document < "u" && (l ? Array.isArray(i) ? f.ref = ja([f.ref, rs(n), ...i]) : f.ref = Mr(f.ref, rs(n), i) : Mr(null, null)), l ? (u !== void 0 && (f.className = Ei(f.className, u)), d !== void 0 && (f.style = Dr(f.style, d)), f) : Ue;
}
function ol(e) {
  return Array.isArray(e) ? Za(e) : lo(void 0, e);
}
const sl = Symbol.for("react.lazy"), il = /^[A-Z][A-Za-z0-9$]*$/, cl = /[a-z]/;
function al(e) {
  if ((e == null ? void 0 : e.$$typeof) !== sl)
    return e;
  const t = y.Children.toArray(e)[0];
  return /* @__PURE__ */ y.isValidElement(t) ? t : e;
}
function ll(e, t, n, r) {
  if (t) {
    if (typeof t == "function")
      return process.env.NODE_ENV !== "production" && ul(t), t(n, r);
    const o = lo(n, t.props);
    if (o.ref = n.ref, process.env.NODE_ENV !== "production" && !/* @__PURE__ */ y.isValidElement(t))
      throw new Error(["Base UI: The `render` prop was provided an invalid React element as `React.isValidElement(render)` is `false`.", "A valid React element must be provided to the `render` prop because it is cloned with props to replace the default element.", "https://base-ui.com/r/invalid-render-prop"].join(`
`));
    return /* @__PURE__ */ y.cloneElement(t, o);
  }
  return dl(e, n);
}
function ul(e) {
  const t = e.name;
  t.length !== 0 && il.test(t) && cl.test(t) && co(`The \`render\` prop received a function named \`${t}\` that starts with an uppercase letter.`, "This usually means a React component was passed directly as `render={Component}`.", "Base UI calls `render` as a plain function, which can break the Rules of Hooks during reconciliation.", "If this is an intentional render callback, rename it to start with a lowercase letter.", "Use `render={<Component />}` or `render={(props) => <Component {...props} />}` instead.", "https://base-ui.com/r/invalid-render-prop");
}
function dl(e, t) {
  return e === "button" ? /* @__PURE__ */ nn("button", {
    type: "button",
    ...t,
    key: t.key
  }) : e === "img" ? /* @__PURE__ */ nn("img", {
    alt: "",
    ...t,
    key: t.key
  }) : /* @__PURE__ */ y.createElement(e, t);
}
const $n = gi("error", "Base UI");
function fl({
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
      !o && os(l) !== os(t) && $n([`A component is changing the default ${r} state of an uncontrolled ${n} after being initialized. To suppress this warning opt to use a controlled ${n}.`].join(`
`));
    }, [t]);
  }
  const a = y.useCallback((l) => {
    o || i(l);
  }, []);
  return [c, a];
}
function os(e) {
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
function Ti() {
  const [, e] = y.useState({});
  return y.useCallback(() => {
    e({});
  }, []);
}
let ss = 0;
function pl(e, t = "mui") {
  const n = y.useRef(void 0), r = Ti(), o = e ?? n.current;
  return y.useEffect(() => {
    n.current == null && (ss += 1, n.current = `${t}-${ss}`, e == null && r());
  }, [e, t, r]), o;
}
const is = lt.useId;
function nr(e, t) {
  if (is !== void 0) {
    const n = is();
    return e ?? (t ? `${t}-${n}` : n);
  }
  return pl(e, t);
}
function Ri(e) {
  return nr(e, "base-ui");
}
function ke(e, t, n, r) {
  let o = !1, s = !1;
  const i = Ue;
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
const xi = "none", rr = "trigger-press", et = "trigger-hover", Dn = "trigger-focus", hl = "outside-press", ml = "focus-out", uo = "escape-key", Lr = "imperative-action", gl = () => {
}, he = typeof document < "u" ? y.useLayoutEffect : gl;
function fo(e) {
  y.useEffect(e, Xa);
}
const En = null;
let cs = globalThis.requestAnimationFrame;
class bl {
  constructor() {
    /* This implementation uses an array as a backing data-structure for frame callbacks.
     * It allows `O(1)` callback cancelling by inserting a `null` in the array, though it
     * never calls the native `cancelAnimationFrame` if there are no frames left. This can
     * be much more efficient if there is a call pattern that alterns as
     * "request-cancel-request-cancel-…".
     * But in the case of "request-request-…-cancel-cancel-…", it leaves the final animation
     * frame to run anyway. We turn that frame into a `O(1)` no-op via `callbacksCount`. */
    ce(this, "callbacks", []);
    ce(this, "callbacksCount", 0);
    ce(this, "nextId", 1);
    ce(this, "startId", 1);
    ce(this, "isScheduled", !1);
    ce(this, "tick", (t) => {
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
    const r = process.env.NODE_ENV !== "production" && cs !== requestAnimationFrame && (cs = requestAnimationFrame, !0);
    return (!this.isScheduled || r) && (requestAnimationFrame(this.tick), this.isScheduled = !0), n;
  }
  cancel(t) {
    const n = t - this.startId;
    n < 0 || n >= this.callbacks.length || this.callbacks[n] !== null && (this.callbacks[n] = null, this.callbacksCount -= 1);
  }
}
let Sn = new bl();
class Ve {
  constructor() {
    ce(this, "currentId", En);
    ce(this, "cancel", () => {
      this.currentId !== En && (Sn.cancel(this.currentId), this.currentId = En);
    });
    ce(this, "disposeEffect", () => this.cancel);
  }
  static create() {
    return new Ve();
  }
  static request(t) {
    return Sn.request(t);
  }
  static cancel(t) {
    return Sn.cancel(t);
  }
  /**
   * Executes `fn` after `delay`, clearing any previously scheduled call.
   */
  request(t) {
    this.cancel(), this.currentId = Sn.request(() => {
      this.currentId = En, t();
    });
  }
}
function vl() {
  const e = ot(Ve.create).current;
  return fo(e.disposeEffect), e;
}
function Ii(e, t = !1, n = !1, r = !1) {
  const [o, s] = y.useState(e && t ? "idle" : void 0), [i, c] = y.useState(e && !r);
  return e && !i && (c(!0), s("starting")), !e && i && o !== "ending" && !n && s("ending"), !e && !i && o === "ending" && s(void 0), he(() => {
    if (!e && i && o !== "ending" && n) {
      const a = Ve.request(() => {
        s("ending");
      });
      return () => {
        Ve.cancel(a);
      };
    }
  }, [e, i, o, n]), he(() => {
    if (!e || t || o === void 0)
      return;
    const a = Ve.request(() => {
      s(void 0);
    });
    return () => {
      Ve.cancel(a);
    };
  }, [t, e, o]), he(() => {
    if (!e || !t)
      return;
    e && i && o !== "idle" && s("starting");
    const a = Ve.request(() => {
      s("idle");
    });
    return () => {
      Ve.cancel(a);
    };
  }, [t, e, i, o]), {
    mounted: i,
    setMounted: c,
    transitionStatus: o
  };
}
function yl(e) {
  const {
    open: t,
    defaultOpen: n = !1,
    onOpenChange: r,
    disabled: o
  } = e, [s, i] = fl({
    controlled: t,
    default: n,
    name: "Collapsible",
    state: "open"
  }), {
    mounted: c,
    setMounted: a,
    transitionStatus: l
  } = Ii(s, !0, !0), u = Ri(), [d, p] = y.useState(), h = d === null ? void 0 : d ?? u, f = de((m) => {
    const g = !s, v = ke(rr, m.nativeEvent);
    r(g, v), !v.isCanceled && i(g);
  });
  return y.useMemo(() => ({
    defaultPanelId: u,
    disabled: o,
    handleTrigger: f,
    mounted: c,
    open: s,
    panelId: h,
    setMounted: a,
    setOpen: i,
    setPanelIdState: p,
    transitionStatus: l
  }), [u, o, f, c, s, h, a, i, p, l]);
}
function wl(e, t) {
  return function(r, ...o) {
    const s = new URL(e);
    return s.searchParams.set("code", r.toString()), o.forEach((i) => s.searchParams.append("args[]", i)), `${t} error #${r}; visit ${s} for the full message.`;
  };
}
const _t = wl("https://base-ui.com/production-error", "Base UI"), po = /* @__PURE__ */ y.createContext(void 0);
process.env.NODE_ENV !== "production" && (po.displayName = "CollapsibleRootContext");
function Pi() {
  const e = y.useContext(po);
  if (e === void 0)
    throw new Error(process.env.NODE_ENV !== "production" ? "Base UI: CollapsibleRootContext is missing. Collapsible parts must be placed within <Collapsible.Root>." : _t(15));
  return e;
}
const ho = "data-starting-style", Cl = "data-ending-style", El = {
  [ho]: ""
}, Sl = {
  [Cl]: ""
}, mo = {
  transitionStatus(e) {
    return e === "starting" ? El : e === "ending" ? Sl : null;
  }
}, Tl = "data-open", Rl = "data-closed", Tn = ho, xl = "data-panel-open", Il = {
  [Tl]: ""
}, Pl = {
  [Rl]: ""
}, Ol = {
  open(e) {
    return e ? {
      [xl]: ""
    } : null;
  }
}, _l = {
  open(e) {
    return e ? Il : Pl;
  }
}, Oi = {
  ..._l,
  ...mo
}, _i = /* @__PURE__ */ y.forwardRef(function(t, n) {
  const {
    render: r,
    className: o,
    defaultOpen: s = !1,
    disabled: i = !1,
    onOpenChange: c,
    open: a,
    style: l,
    ...u
  } = t, d = de(c), p = yl({
    open: a,
    defaultOpen: s,
    onOpenChange: d,
    disabled: i
  }), h = y.useMemo(() => ({
    open: p.open,
    disabled: p.disabled,
    transitionStatus: p.transitionStatus
  }), [p.open, p.disabled, p.transitionStatus]), f = y.useMemo(() => ({
    ...p,
    onOpenChange: d,
    state: h
  }), [p, d, h]), m = wt("div", t, {
    state: h,
    ref: n,
    props: u,
    stateAttributesMapping: Oi
  });
  return /* @__PURE__ */ b(po.Provider, {
    value: f,
    children: m
  });
});
process.env.NODE_ENV !== "production" && (_i.displayName = "CollapsibleRoot");
function or() {
  return typeof window < "u";
}
function qe(e) {
  return go(e) ? (e.nodeName || "").toLowerCase() : "#document";
}
function Me(e) {
  var t;
  return (e == null || (t = e.ownerDocument) == null ? void 0 : t.defaultView) || window;
}
function ft(e) {
  var t;
  return (t = (go(e) ? e.ownerDocument : e.document) || window.document) == null ? void 0 : t.documentElement;
}
function go(e) {
  return or() ? e instanceof Node || e instanceof Me(e).Node : !1;
}
function ge(e) {
  return or() ? e instanceof Element || e instanceof Me(e).Element : !1;
}
function Le(e) {
  return or() ? e instanceof HTMLElement || e instanceof Me(e).HTMLElement : !1;
}
function Bt(e) {
  return !or() || typeof ShadowRoot > "u" ? !1 : e instanceof ShadowRoot || e instanceof Me(e).ShadowRoot;
}
function sr(e) {
  const {
    overflow: t,
    overflowX: n,
    overflowY: r,
    display: o
  } = Ye(e);
  return /auto|scroll|overlay|hidden|clip/.test(t + r + n) && o !== "inline" && o !== "contents";
}
function kl(e) {
  return /^(table|td|th)$/.test(qe(e));
}
function ir(e) {
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
const Al = /transform|translate|scale|rotate|perspective|filter/, Nl = /paint|layout|strict|content/, St = (e) => !!e && e !== "none";
let yr;
function bo(e) {
  const t = ge(e) ? Ye(e) : e;
  return St(t.transform) || St(t.translate) || St(t.scale) || St(t.rotate) || St(t.perspective) || !vo() && (St(t.backdropFilter) || St(t.filter)) || Al.test(t.willChange || "") || Nl.test(t.contain || "");
}
function Ml(e) {
  let t = gt(e);
  for (; Le(t) && !ht(t); ) {
    if (bo(t))
      return t;
    if (ir(t))
      return null;
    t = gt(t);
  }
  return null;
}
function vo() {
  return yr == null && (yr = typeof CSS < "u" && CSS.supports && CSS.supports("-webkit-backdrop-filter", "none")), yr;
}
function ht(e) {
  return /^(html|body|#document)$/.test(qe(e));
}
function Ye(e) {
  return Me(e).getComputedStyle(e);
}
function cr(e) {
  return ge(e) ? {
    scrollLeft: e.scrollLeft,
    scrollTop: e.scrollTop
  } : {
    scrollLeft: e.scrollX,
    scrollTop: e.scrollY
  };
}
function gt(e) {
  if (qe(e) === "html")
    return e;
  const t = (
    // Step into the shadow DOM of the parent of a slotted node.
    e.assignedSlot || // DOM Element detected.
    e.parentNode || // ShadowRoot detected.
    Bt(e) && e.host || // Fallback.
    ft(e)
  );
  return Bt(t) ? t.host : t;
}
function ki(e) {
  const t = gt(e);
  return ht(t) ? (e.ownerDocument || e).body : Le(t) && sr(t) ? t : ki(t);
}
function rn(e, t, n) {
  var r;
  t === void 0 && (t = []), n === void 0 && (n = !0);
  const o = ki(e), s = o === ((r = e.ownerDocument) == null ? void 0 : r.body), i = Me(o);
  if (s) {
    const c = Br(i);
    return t.concat(i, i.visualViewport || [], sr(o) ? o : [], c && n ? rn(c) : []);
  } else
    return t.concat(o, rn(o, [], n));
}
function Br(e) {
  return e.parent && Object.getPrototypeOf(e.parent) ? e.frameElement : null;
}
const Ai = /* @__PURE__ */ y.createContext(void 0);
process.env.NODE_ENV !== "production" && (Ai.displayName = "CompositeRootContext");
function Dl(e = !1) {
  const t = y.useContext(Ai);
  if (t === void 0 && !e)
    throw new Error(process.env.NODE_ENV !== "production" ? "Base UI: CompositeRootContext is missing. Composite parts must be placed within <Composite.Root>." : _t(16));
  return t;
}
function Fl(e) {
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
function rt(e) {
  return (e == null ? void 0 : e.ownerDocument) || document;
}
function wr(e, t, {
  detail: n = 0,
  pointerType: r = ""
} = {}) {
  e.dispatchEvent(new (Me(e)).PointerEvent("click", {
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
function Ni(e = {}) {
  const {
    disabled: t = !1,
    focusableWhenDisabled: n,
    tabIndex: r = 0,
    native: o = !0,
    composite: s
  } = e, i = y.useRef(null), c = Dl(!0), a = s ?? c !== void 0, {
    props: l
  } = Fl({
    focusableWhenDisabled: n,
    disabled: t,
    composite: a,
    tabIndex: r,
    isNativeButton: o
  });
  process.env.NODE_ENV !== "production" && y.useEffect(() => {
    var f, m;
    if (!i.current)
      return;
    const h = Rn(i.current);
    if (o) {
      if (!h) {
        const g = ((f = lt.captureOwnerStack) == null ? void 0 : f.call(lt)) || "";
        $n(`A component that acts as a button expected a native <button> because the \`nativeButton\` prop is true. Rendering a non-<button> removes native button semantics, which can impact forms and accessibility. Use a real <button> in the \`render\` prop, or set \`nativeButton\` to \`false\`.${g}`);
      }
    } else if (h) {
      const g = ((m = lt.captureOwnerStack) == null ? void 0 : m.call(lt)) || "";
      $n(`A component that acts as a button expected a non-<button> because the \`nativeButton\` prop is false. Rendering a <button> keeps native behavior while Base UI applies non-native attributes and handlers, which can add unintended extra attributes (such as \`role\` or \`aria-disabled\`). Use a non-<button> in the \`render\` prop, or set \`nativeButton\` to \`true\`.${g}`);
    }
  }, [o]);
  const u = y.useCallback(() => {
    const h = i.current;
    Rn(h) && a && t && l.disabled === void 0 && h.disabled && (h.disabled = !1);
  }, [t, l.disabled, a]);
  he(u, [u]);
  const d = y.useCallback((h = {}) => {
    const {
      onClick: f,
      onMouseDown: m,
      onKeyUp: g,
      onKeyDown: v,
      onPointerDown: w,
      ...E
    } = h;
    return lo({
      onClick(C) {
        if (t) {
          C.preventDefault();
          return;
        }
        f == null || f(C);
      },
      onMouseDown(C) {
        t || m == null || m(C);
      },
      onKeyDown(C) {
        if (t || (Hn(C), v == null || v(C), C.baseUIHandlerPrevented))
          return;
        const T = C.target === C.currentTarget, S = C.currentTarget, R = Rn(S), x = !o && Ll(S), P = T && (o ? R : !x), O = C.key === "Enter", N = C.key === " ", _ = S.getAttribute("role"), D = (_ == null ? void 0 : _.startsWith("menuitem")) || _ === "option" || _ === "gridcell";
        if (T && a && N) {
          if (C.defaultPrevented && D)
            return;
          C.preventDefault(), (!o || R) && (C.preventBaseUIHandler(), wr(S, C));
          return;
        }
        if (!P || o || !N && !O) {
          T && x && N && C.preventDefault();
          return;
        }
        C.defaultPrevented || (C.preventDefault(), O && (C.preventBaseUIHandler(), wr(S, C)));
      },
      onKeyUp(C) {
        if (!t) {
          if (Hn(C), g == null || g(C), C.target === C.currentTarget && o && a && Rn(C.currentTarget) && C.key === " ") {
            C.preventDefault();
            return;
          }
          C.baseUIHandlerPrevented || C.target === C.currentTarget && !o && !a && !C.defaultPrevented && C.key === " " && (C.preventBaseUIHandler(), wr(C.currentTarget, C));
        }
      },
      onPointerDown(C) {
        if (t) {
          C.preventDefault();
          return;
        }
        w == null || w(C);
      }
    }, o ? {
      type: "button"
    } : {
      role: "button"
    }, l, E);
  }, [t, l, a, o]), p = de((h) => {
    i.current = h, u();
  });
  return {
    getButtonProps: d,
    buttonRef: p
  };
}
function Rn(e) {
  return Le(e) && e.tagName === "BUTTON";
}
function Ll(e) {
  return Le(e) && e.tagName === "A" && !!e.href;
}
const Bl = {
  ...Ol,
  ...mo
}, Mi = /* @__PURE__ */ y.forwardRef(function(t, n) {
  const {
    panelId: r,
    open: o,
    handleTrigger: s,
    state: i,
    disabled: c
  } = Pi(), {
    className: a,
    disabled: l = c,
    render: u,
    nativeButton: d = !0,
    style: p,
    ...h
  } = t, {
    getButtonProps: f,
    buttonRef: m
  } = Ni({
    disabled: l,
    native: d
  });
  return wt("button", t, {
    state: i,
    ref: [n, m],
    props: [{
      "aria-controls": o ? r : void 0,
      "aria-expanded": o,
      onClick: s
    }, h, f],
    stateAttributesMapping: Bl
  });
});
process.env.NODE_ENV !== "production" && (Mi.displayName = "CollapsibleTrigger");
function Ee(e, t, n, r) {
  return e.addEventListener(t, n, r), () => {
    e.removeEventListener(t, n, r);
  };
}
const Qt = 0;
class bt {
  constructor() {
    ce(this, "currentId", Qt);
    ce(this, "clear", () => {
      this.currentId !== Qt && (clearTimeout(this.currentId), this.currentId = Qt);
    });
    ce(this, "disposeEffect", () => this.clear);
  }
  static create() {
    return new bt();
  }
  /**
   * Executes `fn` after `delay`, clearing any previously scheduled call.
   */
  start(t, n) {
    this.clear(), this.currentId = setTimeout(() => {
      this.currentId = Qt, n();
    }, t);
  }
  isStarted() {
    return this.currentId !== Qt;
  }
}
function Zt() {
  const e = ot(bt.create).current;
  return fo(e.disposeEffect), e;
}
function tt(e) {
  const t = ot(Vl, e).current;
  return t.next = e, he(t.effect), t;
}
function Vl(e) {
  const t = {
    current: e,
    next: e,
    effect: () => {
      t.current = t.next;
    }
  };
  return t;
}
function Hl(e) {
  return e == null ? e : "current" in e ? e.current : e;
}
function as(e, t) {
  return e.getAnimations(t).filter((n) => {
    var o;
    const r = (o = n.effect) == null ? void 0 : o.getTiming();
    return (r == null ? void 0 : r.duration) !== 1 / 0 && (r == null ? void 0 : r.iterations) !== 1 / 0;
  });
}
let xn = null;
function $l(e) {
  if (!xn) {
    const t = [];
    xn = t, queueMicrotask(() => {
      xn = null, yt.flushSync(() => {
        for (const n of t)
          n();
      });
    });
  }
  xn.push(e);
}
function Di(e, t = !1, n = !1) {
  const r = vl();
  return de((o, s = null) => {
    r.cancel();
    const i = Hl(e);
    if (i == null)
      return;
    const c = i, a = () => {
      if (!n) {
        yt.flushSync(o);
        return;
      }
      $l(() => {
        s != null && s.aborted || o();
      });
    };
    if (typeof c.getAnimations != "function" || globalThis.BASE_UI_ANIMATIONS_DISABLED) {
      o();
      return;
    }
    function l() {
      Promise.all(as(c).map((u) => u.finished.then(ao))).then(() => {
        s != null && s.aborted || a();
      }, () => {
        if (s != null && s.aborted)
          return;
        if (as(c).some((d) => d.pending || d.playState !== "finished")) {
          l();
          return;
        }
        a();
      });
    }
    if (t) {
      const u = ho;
      if (!c.hasAttribute(u)) {
        r.request(l);
        return;
      }
      const d = new MutationObserver(() => {
        c.hasAttribute(u) || (d.disconnect(), l());
      });
      d.observe(c, {
        attributes: !0,
        attributeFilter: [u]
      }), s == null || s.addEventListener("abort", () => d.disconnect(), {
        once: !0
      });
      return;
    }
    r.request(l);
  });
}
function yo(e) {
  const {
    enabled: t = !0,
    open: n,
    ref: r,
    batch: o = !1,
    onComplete: s
  } = e, i = de(s), c = Di(r, n, o);
  y.useEffect(() => {
    if (!t)
      return;
    const a = new AbortController();
    return c(i, a.signal), () => {
      a.abort();
    };
  }, [t, n, i, c]);
}
const Nt = {
  height: void 0,
  width: void 0
};
function Wl(e) {
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
  } = e, d = y.useRef(null), p = y.useRef(null), [h, f] = y.useState(Nt), m = y.useRef(Nt), g = y.useRef(!1), v = y.useRef(c), w = y.useRef(!1), [E, C] = y.useState(!1), T = y.useRef(null), S = Mr(t, d), R = tt(c), x = Di(d), P = !c && !s, O = E ? "idle" : u, N = c && // These 2 refs are safe to read in render, they are only written from committed
  // layout/effect paths and gate one-shot motion suppression for the next open
  // lifecycle. They intentionally expose the last committed motion snapshot.
  (v.current || w.current), _ = !c && s && // These 2 refs are also safe to read in render, both hold the last committed
  // animation mode and measurement. This fallback only restores a previously
  // measured pixel size after the live dimensions state has been reset back to `auto`.
  p.current === "css-animation" && h.height === void 0 && h.width === void 0 ? m.current : h, D = n && P && p.current !== "css-animation", A = de((M, z = !0) => {
    z && (m.current = M), f(M);
  }), I = de(() => {
    var M;
    (M = T.current) == null || M.call(T), T.current = null;
  }), F = de((M) => {
    I(), T.current = () => {
      T.current = null, M();
    };
  }), U = de(() => {
    c && s && p.current === "css-animation" && (w.current = !0);
  });
  he(() => {
    !E || u === "starting" || C(!1);
  }, [E, u]), y.useEffect(() => () => {
    U(), I();
  }, [U, I]), he(() => {
    c || (v.current = !1, w.current = !1);
    const M = d.current;
    if (!M)
      return;
    !c && T.current && I();
    const z = Ul(M, N);
    if (p.current = z, c && u === "idle" && v.current && z === "css-animation") {
      m.current = Mt(M);
      return;
    }
    if (c && u === "starting") {
      const re = g.current;
      if (g.current = !1, z === "none") {
        A(Mt(M)), C(!0);
        return;
      }
      if (z === "css-transition") {
        const V = ql(M);
        if (A(Mt(M)), !re)
          return V;
        const H = In(M, "transition-duration", "0s");
        return F(H), C(!0), V;
      }
      A(Mt(M));
      const B = In(M, "animation-name", "none");
      if (!re) {
        B();
        return;
      }
      const G = In(M, "animation-duration", "0s");
      B(), F(G), C(!0);
      return;
    }
    if (!c && s && (u === "idle" || u === "starting")) {
      if (z === "none") {
        A(Nt, !1), a(!1);
        return;
      }
      A(Mt(M));
      return;
    }
    if (u !== "ending")
      return;
    if (z === "none") {
      a(!1);
      return;
    }
    const j = Mt(M);
    if (!(j.height > 0 || j.width > 0)) {
      a(!1);
      return;
    }
    A(j), z === "css-animation" && In(M, "animation-name", "none")();
  }, [s, c, I, A, a, F, N, u]), yo({
    enabled: c && s && O === "idle",
    open: !0,
    ref: d,
    onComplete() {
      c && A(Nt, !1);
    }
  }), y.useEffect(() => {
    if (c || !s || O !== "ending")
      return;
    if (!d.current) {
      a(!1), A(Nt, !1);
      return;
    }
    const z = new AbortController();
    let j = -1;
    function ae() {
      R.current || (a(!1), A(Nt, !1));
    }
    return j = Ve.request(() => {
      x(ae, z.signal);
    }), () => {
      Ve.cancel(j), z.abort();
    };
  }, [R, s, c, O, x, A, a]), he(() => {
    const M = d.current;
    !M || !n || !P || M.setAttribute("hidden", "until-found");
  }, [P, n]), y.useEffect(function() {
    const z = d.current;
    if (!z)
      return;
    const j = bt.create();
    let ae = -1;
    const re = (V, H) => {
      j.start(0, () => {
        R.current || (ae = Ve.request(() => {
          R.current || (V && (g.current = !1), H && z.setAttribute(Tn, ""), z.setAttribute("hidden", "until-found"));
        }));
      });
    }, G = Ee(z, "beforematch", (V) => {
      const H = ke(xi, V);
      if (i(!0, H), H.isCanceled) {
        re(!1, !1);
        return;
      }
      g.current = !0;
      const Z = z.hasAttribute(Tn);
      z.removeAttribute(Tn), l(!0), re(!0, Z);
    });
    return () => {
      j.clear(), Ve.cancel(ae), G();
    };
  }, [R, i, l]);
  const k = o || n || s || c;
  return {
    height: _.height,
    props: {
      ...D ? {
        [Tn]: ""
      } : void 0,
      hidden: P,
      id: r
    },
    ref: S,
    shouldPreventOpenAnimation: N,
    shouldRender: k,
    transitionStatus: O,
    width: _.width
  };
}
function Mt(e) {
  return {
    height: e.scrollHeight,
    width: e.scrollWidth
  };
}
function Ul(e, t) {
  const n = Me(e).getComputedStyle(e), r = (n.animationName.split(",").map((s) => s.trim()).some((s) => s !== "" && s !== "none") || t) && ls(n.animationDuration), o = ls(n.transitionDuration);
  return r && o ? (process.env.NODE_ENV !== "production" && co("CSS transitions and CSS animations both detected on Collapsible or Accordion panel.", "Only one of either animation type should be used."), "css-transition") : o ? "css-transition" : r ? "css-animation" : "none";
}
function ls(e) {
  return e.split(",").map((t) => t.trim()).some((t) => t !== "" && Number.parseFloat(t) > 0);
}
function In(e, t, n) {
  const r = e.style.getPropertyValue(t), o = e.style.getPropertyPriority(t);
  return e.style.setProperty(t, n), () => {
    if (r === "") {
      e.style.removeProperty(t);
      return;
    }
    e.style.setProperty(t, r, o);
  };
}
function ql(e) {
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
  const r = Ve.request(n);
  return () => {
    Ve.cancel(r), n();
  };
}
const zl = "--collapsible-panel-height", jl = "--collapsible-panel-width", Fi = /* @__PURE__ */ y.forwardRef(function(t, n) {
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
    o && s === !1 && co("The `keepMounted={false}` prop on `Collapsible.Panel` is ignored when `hiddenUntilFound` is enabled, since the panel must remain mounted while closed.");
  }, [o, s]);
  const {
    defaultPanelId: u,
    mounted: d,
    onOpenChange: p,
    open: h,
    setMounted: f,
    setPanelIdState: m,
    setOpen: g,
    state: v,
    transitionStatus: w
  } = Pi(), E = o ?? !1, C = s ?? !1, T = c || void 0, S = T ?? u;
  he(() => (m((U) => T ?? (U === null ? void 0 : U)), () => {
    m((U) => U === T ? null : U);
  }), [T, m]);
  const {
    height: R,
    props: x,
    ref: P,
    shouldPreventOpenAnimation: O,
    shouldRender: N,
    transitionStatus: _,
    width: D
  } = Wl({
    externalRef: n,
    hiddenUntilFound: E,
    id: S,
    keepMounted: C,
    mounted: d,
    onOpenChange: p,
    open: h,
    setMounted: f,
    setOpen: g,
    transitionStatus: w
  }), A = {
    ...v,
    transitionStatus: _
  }, I = bi(a, A), F = wt("div", {
    ...t,
    style: void 0
  }, {
    state: A,
    ref: P,
    props: [
      x,
      {
        style: {
          [zl]: R === void 0 ? "auto" : `${R}px`,
          [jl]: D === void 0 ? "auto" : `${D}px`
        }
      },
      l,
      I ? {
        style: I
      } : void 0,
      // Resolve the public `style` prop so temporary `animationName: 'none'`
      // can still win after user's inline styles have been merged.
      O ? {
        style: {
          animationName: "none"
        }
      } : void 0
    ],
    stateAttributesMapping: Oi
  });
  return N ? F : null;
});
process.env.NODE_ENV !== "production" && (Fi.displayName = "CollapsiblePanel");
function Rt({ className: e, ...t }) {
  return /* @__PURE__ */ b("div", { "data-slot": "trace", className: le("trace", e), ...t });
}
function Vt({
  className: e,
  status: t,
  ...n
}) {
  return /* @__PURE__ */ b("span", { "data-slot": "trace-line", "data-status": t, className: le("trace-line", e), ...n });
}
function It({ className: e, ...t }) {
  return /* @__PURE__ */ b("span", { "data-slot": "trace-icon", className: le("trace-icon", e), ...t, "aria-hidden": "true" });
}
function Ht({ className: e, ...t }) {
  return /* @__PURE__ */ b("span", { "data-slot": "trace-title", className: le("trace-title", e), ...t });
}
function on({ className: e, ...t }) {
  return /* @__PURE__ */ b("span", { "data-slot": "trace-description", className: le("trace-description", e), ...t });
}
function Li(e) {
  return /* @__PURE__ */ b(_i, { "data-slot": "trace-collapsible", ...e });
}
function Bi({
  children: e,
  className: t,
  ...n
}) {
  return /* @__PURE__ */ $(
    Mi,
    {
      type: "button",
      "data-slot": "trace-collapsible-trigger",
      className: le("trace-trigger", t),
      ...n,
      children: [
        e,
        /* @__PURE__ */ b(It, { className: "trace-chevron", children: /* @__PURE__ */ b(ci, { size: 13 }) })
      ]
    }
  );
}
function Vi({
  className: e,
  ...t
}) {
  return /* @__PURE__ */ b(
    Fi,
    {
      ...t,
      "data-slot": "trace-collapsible-content",
      className: le("trace-content", e)
    }
  );
}
const Gl = ({ message: e, onRetry: t }) => /* @__PURE__ */ b(
  so,
  {
    className: "chat-error-banner",
    role: "alert",
    children: /* @__PURE__ */ $(io, { children: [
      /* @__PURE__ */ b(Rt, { className: "chat-message-body", children: /* @__PURE__ */ $(Vt, { status: "error", children: [
        /* @__PURE__ */ b(It, { children: /* @__PURE__ */ b(Ra, { size: 14 }) }),
        /* @__PURE__ */ b(Ht, { className: "chat-error-title", children: e })
      ] }) }),
      t && /* @__PURE__ */ b(Nr, { children: /* @__PURE__ */ b("button", { type: "button", onClick: t, className: "chat-error-retry-btn", children: "Try again" }) })
    ] })
  }
), Kl = {
  alpha: {
    label: "Alpha",
    Icon: Pa,
    variant: "env-badge--alpha",
    tooltip: "Alpha build — internal testing only"
  },
  beta: {
    label: "Beta",
    Icon: Da,
    variant: "env-badge--beta",
    tooltip: "Beta build — public pre-release"
  },
  gamma: {
    label: "Gamma",
    Icon: ka,
    variant: "env-badge--gamma",
    tooltip: "Gamma / Release Candidate"
  },
  qa: {
    label: "QA",
    Icon: xa,
    variant: "env-badge--qa",
    tooltip: "Quality Assurance build"
  }
}, Yl = ({
  stage: e,
  pulse: t = !0,
  className: n = ""
}) => {
  if (!e) return null;
  const { label: r, Icon: o, variant: s, tooltip: i } = Kl[e];
  return /* @__PURE__ */ $(
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
}, wo = "data:image/svg+xml,%3csvg%20width='300'%20height='322'%20viewBox='0%200%20300%20322'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3cpath%20d='M213.058%2052.9833C228.726%2054.9056%20244.193%2057.9635%20259.583%2061.4059C269.998%2063.5987%20280.269%2066.4233%20290.34%2069.864C292.753%2070.7216%20295.072%2071.8691%20297.438%2072.8214C298.27%2073.1024%20298.978%2073.6651%20299.439%2074.4125C299.9%2075.1598%20300.085%2076.0447%20299.963%2076.9144C299.963%2077.4408%20299.963%2077.9672%20299.963%2078.4936C299.963%20112.823%20299.963%20147.15%20299.963%20181.475C299.985%20185.264%20298.951%20188.983%20296.976%20192.217C289.695%20204.395%20281.876%20216.225%20273.844%20227.918C264.972%20240.848%20255.632%20253.458%20245.66%20265.577C240.775%20271.492%20235.924%20277.472%20230.944%20283.322C227.815%20286.989%20224.438%20290.419%20221.232%20294.039C214.578%20301.551%20207.54%20308.696%20200.394%20315.728C199.125%20317.122%20197.691%20318.355%20196.124%20319.402C194.628%20320.262%20192.963%20320.789%20191.244%20320.945C187.118%20321.36%20182.97%20321.524%20178.823%20321.436C155.756%20320.549%20132.653%20321.288%20109.568%20321.04C108.093%20321.056%20106.63%20320.771%20105.27%20320.203C103.909%20319.634%20102.679%20318.794%20101.654%20317.734C95.4904%20311.523%2089.2326%20305.419%2083.1227%20299.132C79.4615%20295.346%2076.0664%20291.295%2072.5767%20287.349C69.087%20283.404%2065.4258%20279.382%2061.9893%20275.289C57.9732%20270.492%2053.9925%20265.66%2050.2071%20260.686C43.1094%20251.323%2035.9466%20241.966%2029.1269%20232.39C23.2654%20224.156%2017.7884%20215.651%2012.2403%20207.205C9.05229%20202.354%206.0712%20197.362%202.97778%20192.447C0.696594%20189.116%20-0.326373%20185.083%200.091433%20181.067C0.156556%20180.164%200.168387%20179.257%200.126902%20178.352V78.3221C0.126902%2073.8446%200.387122%2073.2532%204.69898%2071.7212C10.661%2069.5978%2016.6645%2067.5336%2022.739%2065.8065C34.7232%2062.4186%2046.872%2059.643%2059.1384%2057.4904C68.2649%2055.8283%2077.4741%2054.4916%2086.6006%2053.0129C87.0442%2052.936%2087.4937%2052.8591%2087.9314%2052.7526L90.2973%2052.2913C90.2973%2052.8236%2090.2973%2056.68%2090.2973%2057.2064C90.2973%2098.2351%2090.2815%20139.27%2090.25%20180.31C90.1517%20184.707%2091.5027%20189.013%2094.0946%20192.566C99.4178%20199.953%20104.611%20207.488%20110.106%20214.764C117.925%20225.103%20125.88%20235.341%20133.972%20245.479C138.059%20250.583%20142.536%20255.386%20146.984%20260.207C149.823%20263.294%20150.569%20263.164%20153.378%20260.023L153.68%20259.686C155.555%20257.527%20157.448%20255.38%20159.317%20253.215C162.363%20249.667%20165.539%20246.236%20168.413%20242.569C175.381%20233.697%20182.307%20224.724%20189.062%20215.657C194.977%20207.743%20200.631%20199.646%20206.374%20191.607C208.444%20188.701%20209.517%20185.202%20209.432%20181.635C209.373%20160.815%20209.403%20139.995%20209.403%20119.175V56.9107C209.403%2056.2305%20209.403%2053.2495%20209.403%2052.5693'%20fill='white'/%3e%3cpath%20d='M90.3197%2052.5822C90.3612%2049.0806%2090.3197%2043.1185%2090.3197%2039.6347V8.54682C90.3197%207.87845%2090.3197%207.20414%2090.3197%206.53578C90.2821%206.17841%2090.3153%205.81714%2090.4174%205.47261C90.5195%205.12808%2090.6886%204.80708%2090.915%204.52799C91.1413%204.24889%2091.4205%204.01719%2091.7365%203.84613C92.0525%203.67507%2092.3992%203.56802%2092.7566%203.53111C94.2873%203.22177%2095.8362%203.01037%2097.3938%202.89822C101.534%202.4901%20105.674%202.11747%20109.815%201.75075C112.849%201.47867%20115.895%201.24801%20118.935%200.993674C119.231%200.993674%20119.527%200.904963%20119.823%200.893134C124.134%200.72752%20128.452%200.526411%20132.77%200.414031C139.696%200.236588%20146.622%200.0118295%20153.548%200C159.357%200%20165.165%200.171503%20170.967%200.455411C177.805%200.792552%20184.636%201.2835%20191.462%201.804C195.987%202.15297%20200.5%202.67346%20205.019%203.14072C208.284%203.47786%20209.283%204.55433%20209.301%207.94348C209.336%2014.9466%20209.301%2021.9555%20209.301%2028.9645C209.301%2035.8197%20209.301%2045.727%20209.301%2052.5822L206.344%2052.316C203.315%2051.9729%20200.281%2051.6299%20197.241%2051.3637C190.569%2050.7722%20183.909%2050.0861%20177.225%2049.6958C171.311%2049.3468%20165.313%2049.1753%20159.363%2049.2167C148.633%2049.3054%20137.898%2048.7375%20127.175%2049.6011C122.135%2050.0092%20117.066%2050.1216%20112.027%2050.5238C105.799%2051.0147%2099.606%2051.6358%2093.36%2052.2628'%20fill='%23FF4717'/%3e%3c/svg%3e", Xl = ({
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
}) => /* @__PURE__ */ $("header", { className: "chat-header", children: [
  /* @__PURE__ */ $("div", { className: "chat-header-left", children: [
    o && /* @__PURE__ */ b(
      "button",
      {
        type: "button",
        onClick: o,
        className: "icon-btn-back",
        "aria-label": "Back",
        children: /* @__PURE__ */ b(wa, { size: 16 })
      }
    ),
    /* @__PURE__ */ b(
      "div",
      {
        className: "avatar-circle",
        "aria-hidden": "true",
        children: /* @__PURE__ */ b("img", { src: wo, alt: "VPS Logo", style: { width: "16px", height: "16px" } })
      }
    ),
    /* @__PURE__ */ $("div", { children: [
      /* @__PURE__ */ $("div", { className: "chat-header-title-row", children: [
        /* @__PURE__ */ b("h2", { className: "chat-header-title", children: e }),
        /* @__PURE__ */ b(Yl, { stage: a, pulse: l })
      ] }),
      /* @__PURE__ */ b("p", { className: "chat-header-subtitle", children: t || "Customer portal support" })
    ] })
  ] }),
  /* @__PURE__ */ $("div", { className: "chat-header-actions", children: [
    i && /* @__PURE__ */ b(
      "button",
      {
        type: "button",
        className: "icon-btn-action chat-sound-btn",
        "aria-label": "Response sound",
        "aria-pressed": !!s,
        title: s ? "Mute response sound" : "Enable response sound",
        onClick: i,
        children: s ? /* @__PURE__ */ b(Ba, { size: 16, "aria-hidden": "true" }) : /* @__PURE__ */ b(Va, { size: 16, "aria-hidden": "true" })
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
        children: /* @__PURE__ */ b(Ma, { size: 15 })
      }
    ),
    n && /* @__PURE__ */ b(
      "button",
      {
        type: "button",
        onClick: n,
        className: "icon-btn-action",
        "aria-label": c ? "Minimize chat" : "Close chat",
        children: /* @__PURE__ */ b(Aa, { size: 16 })
      }
    )
  ] })
] });
function Ql(e, t) {
  const n = Fe(e);
  Ke(() => {
    var r;
    n.current && !e && ((r = t.current) == null || r.focus()), n.current = e;
  }, [e, t]);
}
function Jl({ className: e, ...t }) {
  return /* @__PURE__ */ b("div", { ...t, "data-slot": "input-group", className: le("chat-input-group", e) });
}
function Zl({ className: e, ...t }) {
  return /* @__PURE__ */ b("textarea", { ...t, "data-slot": "input-group-textarea", className: le("chat-textarea", e) });
}
function eu({ className: e, ...t }) {
  return /* @__PURE__ */ b("div", { ...t, "data-slot": "input-group-addon", className: le("chat-input-actions", e) });
}
function us({ className: e, ...t }) {
  return /* @__PURE__ */ b("button", { type: "button", ...t, "data-slot": "input-group-button", className: le("chat-send-btn", e) });
}
const Hi = /* @__PURE__ */ y.forwardRef(function(t, n) {
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
    buttonRef: d
  } = Ni({
    disabled: s,
    focusableWhenDisabled: i,
    native: c
  });
  return wt("button", t, {
    state: {
      disabled: s
    },
    ref: [n, d],
    props: [l, u]
  });
});
process.env.NODE_ENV !== "production" && (Hi.displayName = "Button");
const ds = (e) => typeof e == "boolean" ? `${e}` : e === 0 ? "0" : e, fs = ri, tu = (e, t) => (n) => {
  var r;
  if ((t == null ? void 0 : t.variants) == null) return fs(e, n == null ? void 0 : n.class, n == null ? void 0 : n.className);
  const { variants: o, defaultVariants: s } = t, i = Object.keys(o).map((l) => {
    const u = n == null ? void 0 : n[l], d = s == null ? void 0 : s[l];
    if (u === null) return null;
    const p = ds(u) || ds(d);
    return o[l][p];
  }), c = n && Object.entries(n).reduce((l, u) => {
    let [d, p] = u;
    return p === void 0 || (l[d] = p), l;
  }, {}), a = t == null || (r = t.compoundVariants) === null || r === void 0 ? void 0 : r.reduce((l, u) => {
    let { class: d, className: p, ...h } = u;
    return Object.entries(h).every((f) => {
      let [m, g] = f;
      return Array.isArray(g) ? g.includes({
        ...s,
        ...c
      }[m]) : {
        ...s,
        ...c
      }[m] === g;
    }) ? [
      ...l,
      d,
      p
    ] : l;
  }, []);
  return fs(e, i, a, n == null ? void 0 : n.class, n == null ? void 0 : n.className);
}, nu = tu("vps-ui-button", {
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
    Hi,
    {
      type: "button",
      "data-slot": "button",
      ...r,
      className: (o) => le(
        nu({ variant: t, size: n }),
        typeof e == "function" ? e(o) : e
      )
    }
  );
}
function ru({ className: e, ...t }) {
  return /* @__PURE__ */ b(
    "div",
    {
      ...t,
      className: le("flex scroll-fade-x scrollbar-none gap-2 overflow-x-auto overscroll-x-contain", e),
      "data-slot": "suggestions"
    }
  );
}
function ou({
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
      className: (c) => le("shrink-0", typeof r == "function" ? r(c) : r),
      onClick: () => t == null ? void 0 : t(e),
      children: n ?? e
    }
  );
}
function su(e, t) {
  const n = t.trim().toLowerCase();
  return n ? e.filter(
    (r) => r.label.toLowerCase().includes(n) || r.query.toLowerCase().includes(n)
  ) : e;
}
const iu = ({
  suggestions: e,
  onSelect: t,
  disabled: n,
  variant: r = "list"
}) => e.length ? /* @__PURE__ */ b(
  ru,
  {
    className: r === "badge" ? "chat-suggestion-strip" : "suggestions-list",
    role: "list",
    "aria-label": "Suggested questions",
    children: e.map((o) => /* @__PURE__ */ b("div", { role: "listitem", children: /* @__PURE__ */ b(
      ou,
      {
        suggestion: o.query,
        disabled: n,
        onClick: () => t(o),
        title: o.query,
        children: o.label
      }
    ) }, o.query))
  }
) : null, cu = ({
  onSend: e,
  onStop: t,
  disabled: n = !1,
  placeholder: r = "Ask something…",
  ref: o
}) => {
  const { suggestions: s, showSuggestions: i, suggestionBadgesEnabled: c, models: a, selectedModelId: l, selectModel: u } = tr(), [d, p] = Re(""), h = Fe(null), f = Ar(), m = Ar(), g = (C) => {
    C && (C.style.height = "auto", C.style.height = `${Math.min(C.scrollHeight, 96)}px`);
  };
  Ql(n, h), ta(o, () => ({
    edit(C) {
      var T;
      n || (p(C), (T = h.current) == null || T.focus());
    }
  }), [n]), Ke(() => {
    g(h.current);
  }, [d]);
  const v = Tt(() => {
    if (!c || n) return [];
    const C = d.trim();
    return C ? su(s, C) : i ? s : [];
  }, [n, i, c, s, d]), w = (C) => {
    p(C.query);
    const T = h.current;
    T == null || T.focus();
  }, E = () => {
    const C = d.trim();
    !C || n || (e(C), p(""));
  };
  return /* @__PURE__ */ $("div", { className: "chat-input-wrapper", children: [
    /* @__PURE__ */ b(
      iu,
      {
        variant: "badge",
        suggestions: v,
        onSelect: w,
        disabled: n
      }
    ),
    /* @__PURE__ */ $("form", { onSubmit: (C) => {
      C.preventDefault(), E();
    }, children: [
      /* @__PURE__ */ b("label", { htmlFor: f, className: "sr-only", children: "Chat message" }),
      /* @__PURE__ */ $(Jl, { children: [
        /* @__PURE__ */ b(
          Zl,
          {
            id: f,
            ref: h,
            rows: 1,
            value: d,
            disabled: n,
            placeholder: r,
            onChange: (C) => p(C.target.value),
            onKeyDown: (C) => {
              var T;
              C.key === "Enter" && !C.shiftKey && !C.nativeEvent.isComposing && (C.preventDefault(), (T = C.currentTarget.form) == null || T.requestSubmit());
            }
          }
        ),
        /* @__PURE__ */ $(eu, { children: [
          a.length > 1 && /* @__PURE__ */ $("div", { className: "chat-model-picker", children: [
            /* @__PURE__ */ b("label", { htmlFor: m, className: "sr-only", children: "AI model" }),
            /* @__PURE__ */ $(
              "select",
              {
                id: m,
                value: l,
                disabled: n,
                onChange: (C) => u(C.target.value),
                children: [
                  /* @__PURE__ */ b("option", { value: "auto", children: "Automatic" }),
                  a.map((C) => /* @__PURE__ */ b("option", { value: C.id, disabled: !C.configured, children: C.label }, C.id))
                ]
              }
            )
          ] }),
          t ? /* @__PURE__ */ b(us, { onClick: t, "aria-label": "Stop response", title: "Stop response", children: /* @__PURE__ */ b(di, { size: 13, fill: "currentColor", "aria-hidden": "true" }) }) : /* @__PURE__ */ b(us, { type: "submit", disabled: n || !d.trim(), "aria-label": "Send message", title: "Send message", children: /* @__PURE__ */ b(Ca, { size: 16, "aria-hidden": "true" }) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ $("p", { className: "chat-input-footer", children: [
      /* @__PURE__ */ b("span", { className: "chat-input-note", children: "AI can make mistakes." }),
      "Powered by ",
      /* @__PURE__ */ b("span", { className: "chat-input-footer-brand", children: "VPS Veritas AI" })
    ] })
  ] });
};
function au({ defaultTagName: e, props: t, render: n, state: r = {}, stateAttributesMapping: o }) {
  let s = Vr(lu(r, o), t);
  if (!n) return y.createElement(e, s);
  if (typeof n == "function") return n(s, r);
  if (!y.isValidElement(n)) return null;
  let i = n.props, c = { ...Vr(s, i), ref: dn(s.ref, i.ref) };
  return y.cloneElement(n, c);
}
function Vr(...e) {
  let t = {};
  for (let n of e) {
    if (!n) continue;
    let r = n;
    for (let o of Object.keys(r)) {
      let s = r[o];
      if (s === void 0) continue;
      let i = t[o];
      o === "className" ? t[o] = [i, s].filter(Boolean).join(" ") : o === "style" ? t[o] = { ...i, ...s } : o === "ref" ? t[o] = dn(i, s) : du(o) && typeof i == "function" && typeof s == "function" ? t[o] = uu(s, i) : t[o] = s;
    }
  }
  return t;
}
function lu(e, t) {
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
function uu(e, t) {
  return function(n) {
    e(n), n.defaultPrevented || t(n);
  };
}
function du(e) {
  return /^on[A-Z]/.test(e);
}
function dn(...e) {
  let t = e.filter(Boolean);
  if (t.length !== 0) return (n) => {
    for (let r of t) typeof r == "function" ? r(n) : r && (r.current = n);
  };
}
var fu = 8, pu = 64, hu = 0, Wn = 0.5, mu = 180, gu = /* @__PURE__ */ new Set(["ArrowDown", "ArrowUp", "End", "Home", "PageDown", "PageUp", " "]), $i = { start: !1, end: !1 }, bu = [], Un = { currentAnchorId: null, visibleMessageIds: bu };
function vu({ content: e, scrollEdgeThreshold: t, spacer: n, viewport: r }) {
  if (!r || !e) return $i;
  let o = Eo({ content: e, spacer: n, viewport: r });
  return { start: r.scrollTop > t, end: o - r.scrollTop - r.clientHeight > t };
}
function yu({ content: e, scrollMargin: t, scrollPreviousItemPeek: n, spacer: r, viewport: o, visibleMessageIds: s }) {
  if (!e || !o) return Un;
  let i = o.getBoundingClientRect(), c = i.top + t + n, a = typeof IntersectionObserver > "u", l = [], u = null;
  for (let d of sn(e, r)) {
    let p = d.dataset.messageId;
    if (!p) continue;
    let h = d.dataset.scrollAnchor === "true", f = h || a ? d.getBoundingClientRect() : null;
    (a && f ? f.bottom > c && f.top < i.bottom : s.has(p)) && l.push(p), h && f && f.top <= c + Wn && (u = p);
  }
  return l.length === 0 && u === null ? Un : { currentAnchorId: u, visibleMessageIds: l };
}
function sn(e, t) {
  return Array.from(e.children).filter((n) => n instanceof HTMLElement && n !== t);
}
function wu(e, t) {
  for (let n = t; n < e.length; n++) {
    let r = e[n];
    if ((r == null ? void 0 : r.dataset.scrollAnchor) === "true") return r;
  }
  return null;
}
function Cu(e, t) {
  for (let n of e) if (n.dataset.scrollAnchor === "true" && !t.has(n)) return n;
  return null;
}
function Eu(e, t) {
  var r;
  let n = 0;
  for (let o = t; o < e.length; o++) if (((r = e[o]) == null ? void 0 : r.dataset.scrollAnchor) === "true" && (n += 1, n > 1)) return !0;
  return !1;
}
function Su(e) {
  for (let t = e.length - 1; t >= 0; t--) {
    let n = e[t];
    if ((n == null ? void 0 : n.dataset.scrollAnchor) === "true") return n;
  }
  return null;
}
function Tu({ content: e, spacer: t, viewport: n }) {
  let r = n.getBoundingClientRect();
  for (let o of sn(e, t)) {
    if (!o.dataset.messageId) continue;
    let s = o.getBoundingClientRect();
    if (s.bottom > r.top && s.top < r.bottom) return o;
  }
  return null;
}
function Ru({ align: e, element: t, scrollMargin: n, spacer: r, viewport: o }) {
  let s = Wi(t, o), i = t.getBoundingClientRect().height, c = Pu(r);
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
function Wi(e, t) {
  let n = e.getBoundingClientRect(), r = t.getBoundingClientRect();
  return n.top - r.top + t.scrollTop;
}
function Fn(e, t) {
  return e.getBoundingClientRect().top - t.getBoundingClientRect().top;
}
function xu({ content: e, scrollTop: t, spacer: n, viewport: r }) {
  let o = Eo({ content: e, spacer: n, viewport: r });
  return t + r.clientHeight - o;
}
function Eo({ content: e, spacer: t, viewport: n }) {
  let r = sn(e, t), o = Ui(e), s = n.getBoundingClientRect(), i = n.scrollTop, c = o.start + o.end;
  for (let a of r) {
    let l = a.getBoundingClientRect();
    c = Math.max(c, l.bottom - s.top + i + o.end);
  }
  return c;
}
function Iu(e) {
  return Math.max(0, e.scrollHeight - e.clientHeight);
}
function Ui(e) {
  let t = window.getComputedStyle(e);
  return { end: Hr(t.paddingBlockEnd || t.paddingBottom), start: Hr(t.paddingBlockStart || t.paddingTop) };
}
function Pu(e) {
  let t = e == null ? void 0 : e.parentElement;
  return t ? Ui(t) : { end: 0, start: 0 };
}
function Ou(e) {
  if (!e) return 0;
  let t = window.getComputedStyle(e), n = t.rowGap === "normal" ? t.gap : t.rowGap;
  return Hr(n);
}
function Hr(e) {
  if (!e) return 0;
  let t = Number.parseFloat(e);
  return Number.isFinite(t) ? t : 0;
}
function qi(e, t) {
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
function ps(e, t) {
  return qi(e, t);
}
function _u() {
  return qi(Un, Au);
}
function ku(e, t) {
  return e.start === t.start && e.end === t.end;
}
function Au(e, t) {
  return e.currentAnchorId !== t.currentAnchorId || e.visibleMessageIds.length !== t.visibleMessageIds.length ? !1 : e.visibleMessageIds.every((n, r) => n === t.visibleMessageIds[r]);
}
function Nu({ autoScroll: e, defaultScrollPosition: t, scrollEdgeThreshold: n, scrollMargin: r, scrollPreviousItemPeek: o }) {
  let s = y.useRef(e), i = y.useRef(!1), c = y.useRef(null), a = y.useRef(!1), l = y.useRef(n), u = y.useRef(0), d = y.useRef(null), p = y.useRef(0), h = y.useRef(e ? "following-bottom" : "free-scrolling"), f = y.useRef(/* @__PURE__ */ new Map()), m = y.useRef(null), g = y.useRef(null), v = y.useRef(null), w = y.useRef(o), E = y.useRef(!0), C = y.useRef(null), T = y.useRef(r), S = y.useRef(null), R = y.useRef(0), x = y.useRef(0), P = y.useRef(null), O = y.useRef(null), N = y.useRef(null), _ = y.useRef(null), D = y.useRef(null), A = y.useRef(null), I = y.useRef(null), F = y.useRef(null), U = y.useRef(null), k = y.useRef(/* @__PURE__ */ new Set()), M = y.useRef(/* @__PURE__ */ new WeakSet());
  return N.current === null && (N.current = ps(t === "end" || t === "last-anchor", (z, j) => z === j)), _.current === null && (_.current = ps($i, ku)), U.current === null && (U.current = _u()), s.current = e, l.current = n, T.current = r, w.current = o, { autoScrollRef: s, autoscrollingRef: i, autoscrollingTimeoutRef: D, streamingTurnRef: v, contentRef: c, defaultScrollPositionAppliedRef: a, firstItemRef: d, itemCountRef: u, lastScrollTopRef: p, messageElementsRef: f, modeRef: h, pendingScrollFrameRef: S, pendingScrollToMessageRef: m, prependRestoreRef: g, preserveScrollOnPrependRef: E, pendingDefaultScrollStore: N.current, rootRef: C, scrollEdgeThresholdRef: l, scrollMarginRef: T, scrollPreviousItemPeekRef: w, spacerGapRef: R, spacerHeightRef: x, spacerRef: P, stateFrameRef: O, stateStore: _.current, viewportRef: A, visibilityFrameRef: I, visibilityObserverRef: F, visibilityStore: U.current, visibleMessageIdsRef: k, handledScrollAnchorsRef: M };
}
function zi(e) {
  e.pendingDefaultScrollStore.setSnapshot(!1);
}
function Ln(e) {
  e.defaultScrollPositionAppliedRef.current = !0, zi(e);
}
function Mu({ refs: e, commitScrollState: t, scheduleStateCommit: n, scheduleVisibilitySync: r }) {
  let { streamingTurnRef: o, autoScrollRef: s, autoscrollingRef: i, autoscrollingTimeoutRef: c, contentRef: a, itemCountRef: l, messageElementsRef: u, modeRef: d, pendingScrollToMessageRef: p, prependRestoreRef: h, scrollMarginRef: f, scrollPreviousItemPeekRef: m, spacerGapRef: g, spacerHeightRef: v, spacerRef: w, viewportRef: E } = e, C = y.useCallback((_) => {
    c.current !== null && (window.clearTimeout(c.current), c.current = null), i.current !== _ && (i.current = _, t()), _ && (c.current = window.setTimeout(() => {
      c.current = null, i.current = !1, t();
    }, mu));
  }, [t]), T = y.useCallback((_) => {
    let D = w.current;
    if (!D) return;
    let A = Math.max(0, Math.ceil(_));
    v.current !== A && (v.current = A, D.hidden = A === 0, D.style.height = `${A}px`, D.style.marginTop = A > 0 ? `${-g.current}px` : "");
  }, []), S = y.useCallback((_, { behavior: D = "auto", autoscrolling: A = !1 } = {}) => {
    let I = E.current;
    if (!I) return;
    let F = Math.max(0, _);
    if (Math.abs(I.scrollTop - F) <= Wn) {
      I.scrollTop = F, t();
      return;
    }
    A && C(!0), I.scrollTo({ top: F, behavior: D }), n();
  }, [t, n, C]), R = y.useCallback(({ behavior: _ = "auto" } = {}) => E.current ? (T(0), o.current = null, d.current = "free-scrolling", S(0, { behavior: _ }), r(), !0) : !1, [r, S, T]), x = y.useCallback(({ behavior: _ = "auto" } = {}) => {
    let D = E.current;
    return D ? (T(0), o.current = null, d.current = s.current ? "following-bottom" : "free-scrolling", S(Iu(D), { autoscrolling: !0, behavior: _ }), r(), !0) : !1;
  }, [r, S, T]), P = y.useCallback((_, { align: D = "start", behavior: A = "auto", scrollMargin: I = f.current } = {}, { keepPreviousPeek: F = !1 } = {}) => {
    let U = a.current, k = E.current;
    if (!U || !k || !U.contains(_)) return !1;
    let M = Ru({ align: D, element: _, scrollMargin: F ? I + m.current : I, spacer: w.current, viewport: k }), z = xu({ content: U, scrollTop: M, spacer: w.current, viewport: k });
    return T(z), h.current = { element: _, viewportTop: Fn(_, k) }, d.current = F ? "anchored-to-message" : "settling-jump", o.current = F ? _ : null, S(M, { behavior: A }), r(), !0;
  }, [r, S, T]), O = y.useCallback(() => {
    let _ = o.current;
    return !_ || !_.isConnected || d.current !== "anchored-to-message" ? !1 : P(_, { align: "start" }, { keepPreviousPeek: !0 });
  }, [P]), N = y.useCallback((_, D) => {
    let A = u.current.get(_);
    return A ? (Ln(e), P(A, D) ? (p.current = null, !0) : (p.current = { messageId: _, options: D }, !0)) : l.current === 0 ? (p.current = { messageId: _, options: D }, Ln(e), !0) : !1;
  }, [P]);
  return { flushPendingScrollToMessage: y.useCallback(() => {
    let _ = p.current;
    if (!_) return !1;
    let D = u.current.get(_.messageId);
    return !D || !P(D, _.options) ? !1 : (p.current = null, Ln(e), !0);
  }, [P]), reanchorToAnchoredMessage: O, scrollToElement: P, scrollToEnd: x, scrollToMessage: N, scrollToStart: R };
}
function hs(e, t) {
  return y.useCallback((n) => {
    e.current = n, n && t();
  }, [e, t]);
}
function Du({ autoScroll: e = !1, defaultScrollPosition: t = "end", scrollEdgeThreshold: n = fu, scrollPreviousItemPeek: r = pu, scrollMargin: o = hu }) {
  let s = Nu({ autoScroll: e, defaultScrollPosition: t, scrollEdgeThreshold: n, scrollMargin: o, scrollPreviousItemPeek: r }), { streamingTurnRef: i, autoScrollRef: c, autoscrollingRef: a, autoscrollingTimeoutRef: l, contentRef: u, defaultScrollPositionAppliedRef: d, firstItemRef: p, itemCountRef: h, lastScrollTopRef: f, messageElementsRef: m, modeRef: g, pendingScrollFrameRef: v, pendingScrollToMessageRef: w, prependRestoreRef: E, preserveScrollOnPrependRef: C, pendingDefaultScrollStore: T, rootRef: S, scrollEdgeThresholdRef: R, scrollMarginRef: x, scrollPreviousItemPeekRef: P, spacerGapRef: O, spacerHeightRef: N, spacerRef: _, stateFrameRef: D, stateStore: A, viewportRef: I, visibilityFrameRef: F, visibilityObserverRef: U, visibilityStore: k, visibleMessageIdsRef: M, handledScrollAnchorsRef: z } = s, j = y.useRef(t);
  j.current !== t && (j.current = t, d.current = !1);
  let ae = y.useCallback((q) => {
    let Q = S.current, X = I.current, ie = [q.start && "start", q.end && "end"].filter(Boolean).join(" "), Se = a.current;
    for (let fe of [Q, X]) fe && (ie ? fe.setAttribute("data-scrollable", ie) : fe.removeAttribute("data-scrollable"), fe.toggleAttribute("data-autoscrolling", Se));
  }, []), re = y.useCallback((q) => {
    var ie;
    let Q = ((ie = I.current) == null ? void 0 : ie.scrollTop) ?? 0, X = Q < f.current - Wn;
    f.current = Q, c.current && !q.end && g.current !== "settling-jump" && g.current !== "anchored-to-message" ? g.current = "following-bottom" : g.current === "following-bottom" && q.end && X && !a.current && (g.current = "free-scrolling");
  }, []), B = y.useCallback(() => {
    let q = vu({ content: u.current, scrollEdgeThreshold: R.current, spacer: _.current, viewport: I.current });
    re(q);
    let Q = g.current === "following-bottom" ? { ...q, end: !1 } : q;
    ae(Q), A.setSnapshot(Q);
  }, [re, A, ae]), G = y.useCallback(() => {
    D.current === null && (D.current = window.requestAnimationFrame(() => {
      D.current = null, B();
    }));
  }, [B]), V = y.useCallback(() => {
    k.hasListeners() && F.current === null && (F.current = window.requestAnimationFrame(() => {
      F.current = null, k.hasListeners() && k.setSnapshot(yu({ content: u.current, scrollMargin: x.current, scrollPreviousItemPeek: P.current, spacer: _.current, viewport: I.current, visibleMessageIds: M.current }));
    }));
  }, [k]), { flushPendingScrollToMessage: H, reanchorToAnchoredMessage: Z, scrollToElement: oe, scrollToEnd: ee, scrollToMessage: te, scrollToStart: W } = Mu({ refs: s, commitScrollState: B, scheduleStateCommit: G, scheduleVisibilitySync: V }), ne = y.useCallback(() => {
    let q = E.current, Q = I.current;
    if (!q || !Q || !q.element.isConnected) return !1;
    let X = Fn(q.element, Q) - q.viewportTop;
    return Math.abs(X) <= Wn ? !1 : (Q.scrollTop += X, q.viewportTop = Fn(q.element, Q), G(), V(), !0);
  }, [G, V]), se = y.useCallback(() => {
    let q = u.current, Q = I.current;
    if (!q || !Q) {
      E.current = null;
      return;
    }
    let X = Tu({ content: q, spacer: _.current, viewport: Q });
    E.current = X ? { element: X, viewportTop: Fn(X, Q) } : null;
  }, []), be = y.useCallback(() => {
    v.current === null && (v.current = window.requestAnimationFrame(() => {
      v.current = null, H() && se();
    }));
  }, [se, H]), ve = y.useCallback(() => {
    if (!t || d.current || h.current === 0) return !1;
    let q = !1;
    if (t === "last-anchor") {
      let Q = u.current, X = I.current, ie = Q && X ? Su(sn(Q, _.current)) : null;
      if (!Q || !X || !ie) q = ee({ behavior: "auto" });
      else {
        let Se = Wi(ie, X);
        q = Eo({ content: Q, spacer: _.current, viewport: X }) - Se <= X.clientHeight ? ee({ behavior: "auto" }) : oe(ie, { align: "start" }, { keepPreviousPeek: !0 });
      }
    } else q = t === "end" ? ee({ behavior: "auto" }) : W({ behavior: "auto" });
    return q ? (Ln(s), !0) : !1;
  }, [t, oe, ee, W]), Oe = y.useCallback(() => {
    let q = u.current;
    if (!q) return;
    let Q = sn(q, _.current), X = h.current, ie = p.current;
    h.current = Q.length, p.current = Q[0] ?? null, (() => {
      if (H()) return;
      if (X === 0) {
        if (ve() || Q.length > 0 && c.current && ee({ behavior: "auto" })) return;
        B(), V();
        return;
      }
      let Se = ie ? Q.indexOf(ie) : -1;
      if (C.current && Se > 0) {
        ne();
        return;
      }
      if (Q.length > X) {
        let fe = wu(Q, X);
        if (fe) {
          if (c.current && g.current === "following-bottom" && Eu(Q, X)) {
            ee({ behavior: "auto" });
            return;
          }
          oe(fe, { align: "start" }, { keepPreviousPeek: !0 }), z.current.add(fe);
          return;
        }
      }
      if (Q.length === X) {
        let fe = Cu(Q, z.current);
        if (fe) {
          oe(fe, { align: "start" }, { keepPreviousPeek: !0 }), z.current.add(fe);
          return;
        }
      }
      g.current === "following-bottom" && c.current ? ee({ behavior: "auto" }) : (B(), V());
    })(), se();
  }, [ve, se, B, H, ne, V, oe, ee]), Ne = y.useCallback(() => {
    if (g.current === "following-bottom" && c.current) {
      ee({ behavior: "auto" });
      return;
    }
    let q = N.current;
    if (Z()) {
      c.current && q > 0 && N.current === 0 && ee({ behavior: "auto" });
      return;
    }
    G(), V();
  }, [Z, G, V, ee]), we = y.useCallback(() => {
    let q = I.current;
    if (!(!q || !k.hasListeners())) {
      if (typeof IntersectionObserver > "u") {
        V();
        return;
      }
      U.current || (U.current = new IntersectionObserver((Q) => {
        for (let X of Q) {
          let ie = X.target.dataset.messageId;
          ie && (X.isIntersecting ? M.current.add(ie) : M.current.delete(ie));
        }
        V();
      }, { root: q, rootMargin: `${-(x.current + P.current)}px 0px 0px 0px`, threshold: [0, 0.01, 0.5, 1] })), m.current.forEach((Q) => {
        var X;
        (X = U.current) == null || X.observe(Q);
      }), V();
    }
  }, [V, k]), De = y.useCallback(() => {
    var q;
    F.current !== null && (window.cancelAnimationFrame(F.current), F.current = null), (q = U.current) == null || q.disconnect(), U.current = null, M.current.clear(), k.setSnapshot(Un);
  }, [k]), He = y.useCallback((q, Q, X) => {
    var ie, Se, fe;
    if (Q) {
      m.current.set(q, Q), (ie = U.current) == null || ie.observe(Q), V(), ((Se = w.current) == null ? void 0 : Se.messageId) === q && be();
      return;
    }
    X && m.current.get(q) === X && (m.current.delete(q), M.current.delete(q), (fe = U.current) == null || fe.unobserve(X), V());
  }, [be, V]), K = y.useCallback(() => {
    (g.current === "following-bottom" || g.current === "anchored-to-message" || g.current === "settling-jump") && (i.current = null, g.current = "free-scrolling");
  }, []), J = y.useCallback(() => ae(A.getSnapshot()), [A, ae]), ue = hs(S, J), L = hs(I, J), Y = y.useCallback((q) => {
    u.current = q;
  }, []), Te = y.useCallback((q) => {
    _.current = q, O.current = Ou((q == null ? void 0 : q.parentElement) ?? null);
  }, []), me = y.useCallback(() => {
    B(), V(), se();
  }, [se, B, V]), xe = y.useMemo(() => ({ handleContentChange: Oe, handleResize: Ne, observeVisibility: we, pendingDefaultScrollStore: T, preserveScrollOnPrependRef: C, scrollToEnd: ee, scrollToMessage: te, scrollToStart: W, setContentElement: Y, setRootElement: ue, setSpacerElement: Te, setViewportElement: L, stateStore: A, syncAfterScroll: me, unobserveVisibility: De, userScrollIntent: K, viewportRef: I, visibilityStore: k }), [Oe, Ne, we, T, ee, te, W, Y, ue, Te, L, A, me, De, K, k]);
  return y.useLayoutEffect(() => {
    ve() || h.current === 0 && zi(s);
  }, [ve]), y.useEffect(() => () => {
    var q;
    D.current !== null && (window.cancelAnimationFrame(D.current), D.current = null), F.current !== null && (window.cancelAnimationFrame(F.current), F.current = null), l.current !== null && (window.clearTimeout(l.current), l.current = null), v.current !== null && (window.cancelAnimationFrame(v.current), v.current = null), (q = U.current) == null || q.disconnect(), U.current = null;
  }, []), y.useLayoutEffect(() => {
    if (e && g.current === "following-bottom" && h.current > 0) {
      ee({ behavior: "auto" });
      return;
    }
    B();
  }, [e, B, ee]), { context: xe, registerMessage: He };
}
function Fu(e) {
  let t = y.useRef(e);
  return t.current = e, t;
}
var ji = y.createContext(null), Gi = y.createContext(null);
function fn() {
  let e = y.useContext(ji);
  if (!e) throw new Error("useMessageScroller must be used within a MessageScroller.");
  return e;
}
function Lu() {
  let e = y.useContext(Gi);
  if (!e) throw new Error("MessageScrollerItem must be used within a MessageScroller.");
  return e;
}
function Bu({ autoScroll: e = !1, children: t, defaultScrollPosition: n = "end", scrollEdgeThreshold: r, scrollPreviousItemPeek: o, scrollMargin: s }) {
  let { context: i, registerMessage: c } = Du({ autoScroll: e, defaultScrollPosition: n, scrollEdgeThreshold: r, scrollPreviousItemPeek: o, scrollMargin: s });
  return b(ji.Provider, { value: i, children: b(Gi.Provider, { value: c, children: t }) });
}
function Ki() {
  let { pendingDefaultScrollStore: e } = fn();
  return y.useSyncExternalStore(e.subscribe, e.getSnapshot, e.getSnapshot);
}
function Vu({ children: e, ...t }) {
  let { setRootElement: n } = fn(), r = Ki();
  return b("div", { ref: n, ...t, ...r ? { "data-pending-scroll": "" } : null, children: e });
}
function Hu({ "aria-label": e, children: t, onKeyDown: n, onScroll: r, onTouchMove: o, onWheel: s, preserveScrollOnPrepend: i = !0, ref: c, role: a, tabIndex: l, ...u }) {
  let { handleResize: d, preserveScrollOnPrependRef: p, setViewportElement: h, syncAfterScroll: f, userScrollIntent: m, viewportRef: g } = fn(), v = Ki();
  p.current = i;
  let w = y.useCallback((R) => {
    var x;
    h(R), (x = dn(c)) == null || x(R);
  }, [c, h]);
  function E(R) {
    f(), r == null || r(R);
  }
  function C(R) {
    m(), s == null || s(R);
  }
  function T(R) {
    m(), o == null || o(R);
  }
  function S(R) {
    gu.has(R.key) && m(), n == null || n(R);
  }
  return y.useEffect(() => {
    let R = g.current;
    if (!R || typeof ResizeObserver > "u") return;
    let x = 0, P = new ResizeObserver(() => {
      window.cancelAnimationFrame(x), x = window.requestAnimationFrame(d);
    });
    return P.observe(R), () => {
      window.cancelAnimationFrame(x), P.disconnect();
    };
  }, [d, g]), b("div", { ref: w, role: a ?? "region", "aria-label": e ?? "Messages", tabIndex: l ?? 0, onKeyDown: S, onScroll: E, onTouchMove: T, onWheel: C, ...u, ...v ? { "data-pending-scroll": "" } : null, children: t });
}
function $u({ "aria-relevant": e, children: t, ref: n, role: r, spacerClassName: o, ...s }) {
  let { handleContentChange: i, handleResize: c, setContentElement: a, setSpacerElement: l } = fn(), u = y.useRef(null), d = y.useCallback((p) => {
    var h;
    u.current = p, a(p), (h = dn(n)) == null || h(p);
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
    let h = 0, f = new ResizeObserver(() => {
      window.cancelAnimationFrame(h), h = window.requestAnimationFrame(c);
    });
    return f.observe(p), () => {
      window.cancelAnimationFrame(h), f.disconnect();
    };
  }, [c]), $("div", { ref: d, role: r ?? "log", "aria-relevant": e ?? "additions", ...s, children: [t, b("div", { ref: l, "aria-hidden": "true", "data-message-scroller-spacer": "", hidden: !0, className: o })] });
}
function Wu({ messageId: e, ref: t, scrollAnchor: n = !1, ...r }) {
  let o = Lu(), s = y.useRef(null), i = y.useCallback((c) => {
    var l;
    let a = s.current;
    s.current = c, e && o(e, c, a), (l = dn(t)) == null || l(c);
  }, [e, t, o]);
  return b("div", { ref: i, "data-message-id": e, "data-scroll-anchor": n ? "true" : "false", ...r });
}
function Uu({ behavior: e = "smooth", children: t, direction: n = "end", onClick: r, render: o, tabIndex: s, type: i = "button", ...c }) {
  let { scrollToEnd: a, scrollToStart: l, stateStore: u } = fn(), d = Fu(r), p = y.useCallback((g) => u.subscribe(g), [u]), h = y.useCallback(() => {
    let g = u.getSnapshot();
    return n === "start" ? g.start : g.end;
  }, [n, u]), f = y.useSyncExternalStore(p, h, h), m = y.useCallback((g) => {
    var v;
    f && ((v = d.current) == null || v.call(d, g), g.defaultPrevented || (g.currentTarget.blur(), n === "start" ? l({ behavior: e }) : a({ behavior: e })));
  }, [e, n, f, d, a, l]);
  return au({ defaultTagName: "button", props: Vr({ type: i, inert: !f, tabIndex: f ? s : -1, children: t ?? $("span", { children: ["Scroll to ", n] }), onClick: m }, c), render: o, state: { active: f, direction: n }, stateAttributesMapping: { active: (g) => ({ "data-active": g ? "true" : "false" }) } });
}
var zt = { Provider: Bu, Root: Vu, Viewport: Hu, Content: $u, Item: Wu, Button: Uu };
function qu(e) {
  return /* @__PURE__ */ b(zt.Provider, { ...e });
}
function zu({
  className: e,
  ...t
}) {
  return /* @__PURE__ */ b(
    zt.Root,
    {
      "data-slot": "message-scroller",
      className: le("msg-scroller-root", e),
      ...t
    }
  );
}
function ju({
  className: e,
  ...t
}) {
  return /* @__PURE__ */ b(
    zt.Viewport,
    {
      "data-slot": "message-scroller-viewport",
      className: le("msg-scroller-viewport", e),
      ...t
    }
  );
}
function Gu({
  className: e,
  ...t
}) {
  return /* @__PURE__ */ b(
    zt.Content,
    {
      "data-slot": "message-scroller-content",
      className: le("msg-scroller-content", e),
      ...t
    }
  );
}
function ms({
  className: e,
  scrollAnchor: t = !1,
  ...n
}) {
  return /* @__PURE__ */ b(
    zt.Item,
    {
      "data-slot": "message-scroller-item",
      scrollAnchor: t,
      className: le("msg-scroller-item", e),
      ...n
    }
  );
}
function Ku({
  direction: e = "end",
  className: t,
  children: n,
  ...r
}) {
  return /* @__PURE__ */ b(
    zt.Button,
    {
      "data-slot": "message-scroller-button",
      direction: e,
      className: le("msg-scroller-btn", t),
      ...r,
      children: n ?? /* @__PURE__ */ $(Ut, { children: [
        /* @__PURE__ */ b(
          ya,
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
  return /* @__PURE__ */ b("div", { ...r, "data-slot": "bubble", "data-align": e, "data-variant": t, className: le("chat-bubble", n) });
}
function Wr({ className: e, ...t }) {
  return /* @__PURE__ */ b("div", { ...t, "data-slot": "bubble-content", className: le("chat-bubble-content", e) });
}
const Yu = () => /* @__PURE__ */ $(so, { children: [
  /* @__PURE__ */ b(fi, { className: "avatar-circle", "aria-hidden": "true", children: /* @__PURE__ */ b(Sa, { size: 15 }) }),
  /* @__PURE__ */ b(io, { children: /* @__PURE__ */ b($r, { children: /* @__PURE__ */ b(Wr, { children: "Hello — I am the VPS Veritas assistant. Ask about reports, sample status, registration, or support, or choose a suggested question." }) }) })
] });
function Yi() {
  const [e, t] = Re("idle");
  Ke(() => {
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
function Xu({ message: e, onFeedback: t }) {
  const { status: n, copy: r } = Yi();
  return /* @__PURE__ */ $("div", { className: "chat-message-actions", role: "group", "aria-label": "Response actions", children: [
    /* @__PURE__ */ b(
      "button",
      {
        type: "button",
        className: "chat-message-action",
        "aria-label": "Copy response",
        title: "Copy response",
        disabled: n === "copying",
        onClick: () => void r(e.content),
        children: n === "copied" ? /* @__PURE__ */ b(oo, { size: 16, "aria-hidden": "true" }) : /* @__PURE__ */ b(li, { size: 16, "aria-hidden": "true" })
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
        children: /* @__PURE__ */ b(La, { size: 16, "aria-hidden": "true" })
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
        children: /* @__PURE__ */ b(Fa, { size: 16, "aria-hidden": "true" })
      }
    ),
    /* @__PURE__ */ $("span", { className: "chat-message-copy-status", role: "status", children: [
      n === "copied" && "Copied",
      n === "failed" && "Couldn’t copy"
    ] })
  ] });
}
function So(e) {
  const t = e.trim();
  if (!/[\u0000-\u001f\u007f]/.test(t) && /^(https?:\/\/|mailto:|\/(?!\/)|#)/i.test(t))
    return t;
}
function Qu(e) {
  return Object.prototype.toString.call(e) === "[object Object]";
}
function gs(e) {
  return Qu(e) || Array.isArray(e);
}
function Ju() {
  return !!(typeof window < "u" && window.document && window.document.createElement);
}
function To(e, t) {
  const n = Object.keys(e), r = Object.keys(t);
  if (n.length !== r.length) return !1;
  const o = JSON.stringify(Object.keys(e.breakpoints || {})), s = JSON.stringify(Object.keys(t.breakpoints || {}));
  return o !== s ? !1 : n.every((i) => {
    const c = e[i], a = t[i];
    return typeof c == "function" ? `${c}` == `${a}` : !gs(c) || !gs(a) ? c === a : To(c, a);
  });
}
function bs(e) {
  return e.concat().sort((t, n) => t.name > n.name ? 1 : -1).map((t) => t.options);
}
function Zu(e, t) {
  if (e.length !== t.length) return !1;
  const n = bs(e), r = bs(t);
  return n.every((o, s) => {
    const i = r[s];
    return To(o, i);
  });
}
function Ro(e) {
  return typeof e == "number";
}
function Ur(e) {
  return typeof e == "string";
}
function ar(e) {
  return typeof e == "boolean";
}
function vs(e) {
  return Object.prototype.toString.call(e) === "[object Object]";
}
function Pe(e) {
  return Math.abs(e);
}
function xo(e) {
  return Math.sign(e);
}
function en(e, t) {
  return Pe(e - t);
}
function ed(e, t) {
  if (e === 0 || t === 0 || Pe(e) <= Pe(t)) return 0;
  const n = en(Pe(e), Pe(t));
  return Pe(n / e);
}
function td(e) {
  return Math.round(e * 100) / 100;
}
function cn(e) {
  return an(e).map(Number);
}
function nt(e) {
  return e[pn(e)];
}
function pn(e) {
  return Math.max(0, e.length - 1);
}
function Io(e, t) {
  return t === pn(e);
}
function ys(e, t = 0) {
  return Array.from(Array(e), (n, r) => t + r);
}
function an(e) {
  return Object.keys(e);
}
function Xi(e, t) {
  return [e, t].reduce((n, r) => (an(r).forEach((o) => {
    const s = n[o], i = r[o], c = vs(s) && vs(i);
    n[o] = c ? Xi(s, i) : i;
  }), n), {});
}
function qr(e, t) {
  return typeof t.MouseEvent < "u" && e instanceof t.MouseEvent;
}
function nd(e, t) {
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
function ln() {
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
function rd(e, t, n, r) {
  const o = ln(), s = 1e3 / 60;
  let i = null, c = 0, a = 0;
  function l() {
    o.add(e, "visibilitychange", () => {
      e.hidden && f();
    });
  }
  function u() {
    h(), o.clear();
  }
  function d(g) {
    if (!a) return;
    i || (i = g, n(), n());
    const v = g - i;
    for (i = g, c += v; c >= s; )
      n(), c -= s;
    const w = c / s;
    r(w), a && (a = t.requestAnimationFrame(d));
  }
  function p() {
    a || (a = t.requestAnimationFrame(d));
  }
  function h() {
    t.cancelAnimationFrame(a), i = null, c = 0, a = 0;
  }
  function f() {
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
function od(e, t) {
  const n = t === "rtl", r = e === "y", o = r ? "y" : "x", s = r ? "x" : "y", i = !r && n ? -1 : 1, c = u(), a = d();
  function l(f) {
    const {
      height: m,
      width: g
    } = f;
    return r ? m : g;
  }
  function u() {
    return r ? "top" : n ? "right" : "left";
  }
  function d() {
    return r ? "bottom" : n ? "left" : "right";
  }
  function p(f) {
    return f * i;
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
function Pt(e = 0, t = 0) {
  const n = Pe(e - t);
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
function Qi(e, t, n) {
  const {
    constrain: r
  } = Pt(0, e), o = e + 1;
  let s = i(t);
  function i(p) {
    return n ? Pe((o + p) % o) : r(p);
  }
  function c() {
    return s;
  }
  function a(p) {
    return s = i(p), d;
  }
  function l(p) {
    return u().set(c() + p);
  }
  function u() {
    return Qi(e, c(), n);
  }
  const d = {
    get: c,
    set: a,
    add: l,
    clone: u
  };
  return d;
}
function sd(e, t, n, r, o, s, i, c, a, l, u, d, p, h, f, m, g, v, w) {
  const {
    cross: E,
    direction: C
  } = e, T = ["INPUT", "SELECT", "TEXTAREA"], S = {
    passive: !1
  }, R = ln(), x = ln(), P = Pt(50, 225).constrain(h.measure(20)), O = {
    mouse: 300,
    touch: 400
  }, N = {
    mouse: 500,
    touch: 600
  }, _ = f ? 43 : 25;
  let D = !1, A = 0, I = 0, F = !1, U = !1, k = !1, M = !1;
  function z(W) {
    if (!w) return;
    function ne(be) {
      (ar(w) || w(W, be)) && V(be);
    }
    const se = t;
    R.add(se, "dragstart", (be) => be.preventDefault(), S).add(se, "touchmove", () => {
    }, S).add(se, "touchend", () => {
    }).add(se, "touchstart", ne).add(se, "mousedown", ne).add(se, "touchcancel", Z).add(se, "contextmenu", Z).add(se, "click", oe, !0);
  }
  function j() {
    R.clear(), x.clear();
  }
  function ae() {
    const W = M ? n : t;
    x.add(W, "touchmove", H, S).add(W, "touchend", Z).add(W, "mousemove", H, S).add(W, "mouseup", Z);
  }
  function re(W) {
    const ne = W.nodeName || "";
    return T.includes(ne);
  }
  function B() {
    return (f ? N : O)[M ? "mouse" : "touch"];
  }
  function G(W, ne) {
    const se = d.add(xo(W) * -1), be = u.byDistance(W, !f).distance;
    return f || Pe(W) < P ? be : g && ne ? be * 0.5 : u.byIndex(se.get(), 0).distance;
  }
  function V(W) {
    const ne = qr(W, r);
    M = ne, k = f && ne && !W.buttons && D, D = en(o.get(), i.get()) >= 2, !(ne && W.button !== 0) && (re(W.target) || (F = !0, s.pointerDown(W), l.useFriction(0).useDuration(0), o.set(i), ae(), A = s.readPoint(W), I = s.readPoint(W, E), p.emit("pointerDown")));
  }
  function H(W) {
    if (!qr(W, r) && W.touches.length >= 2) return Z(W);
    const se = s.readPoint(W), be = s.readPoint(W, E), ve = en(se, A), Oe = en(be, I);
    if (!U && !M && (!W.cancelable || (U = ve > Oe, !U)))
      return Z(W);
    const Ne = s.pointerMove(W);
    ve > m && (k = !0), l.useFriction(0.3).useDuration(0.75), c.start(), o.add(C(Ne)), W.preventDefault();
  }
  function Z(W) {
    const se = u.byDistance(0, !1).index !== d.get(), be = s.pointerUp(W) * B(), ve = G(C(be), se), Oe = ed(be, ve), Ne = _ - 10 * Oe, we = v + Oe / 50;
    U = !1, F = !1, x.clear(), l.useDuration(Ne).useFriction(we), a.distance(ve, !f), M = !1, p.emit("pointerUp");
  }
  function oe(W) {
    k && (W.stopPropagation(), W.preventDefault(), k = !1);
  }
  function ee() {
    return F;
  }
  return {
    init: z,
    destroy: j,
    pointerDown: ee
  };
}
function id(e, t) {
  let r, o;
  function s(d) {
    return d.timeStamp;
  }
  function i(d, p) {
    const f = `client${(p || e.scroll) === "x" ? "X" : "Y"}`;
    return (qr(d, t) ? d : d.touches[0])[f];
  }
  function c(d) {
    return r = d, o = d, i(d);
  }
  function a(d) {
    const p = i(d) - i(o), h = s(d) - s(r) > 170;
    return o = d, h && (r = d), p;
  }
  function l(d) {
    if (!r || !o) return 0;
    const p = i(o) - i(r), h = s(d) - s(r), f = s(d) - s(o) > 170, m = p / h;
    return h && !f && Pe(m) > 0.1 ? m : 0;
  }
  return {
    pointerDown: c,
    pointerMove: a,
    pointerUp: l,
    readPoint: i
  };
}
function cd() {
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
function ad(e) {
  function t(r) {
    return e * (r / 100);
  }
  return {
    measure: t
  };
}
function ld(e, t, n, r, o, s, i) {
  const c = [e].concat(r);
  let a, l, u = [], d = !1;
  function p(g) {
    return o.measureSize(i.measure(g));
  }
  function h(g) {
    if (!s) return;
    l = p(e), u = r.map(p);
    function v(w) {
      for (const E of w) {
        if (d) return;
        const C = E.target === e, T = r.indexOf(E.target), S = C ? l : u[T], R = p(C ? e : r[T]);
        if (Pe(R - S) >= 0.5) {
          g.reInit(), t.emit("resize");
          break;
        }
      }
    }
    a = new ResizeObserver((w) => {
      (ar(s) || s(g, w)) && v(w);
    }), n.requestAnimationFrame(() => {
      c.forEach((w) => a.observe(w));
    });
  }
  function f() {
    d = !0, a && a.disconnect();
  }
  return {
    init: h,
    destroy: f
  };
}
function ud(e, t, n, r, o, s) {
  let i = 0, c = 0, a = o, l = s, u = e.get(), d = 0;
  function p() {
    const S = r.get() - e.get(), R = !a;
    let x = 0;
    return R ? (i = 0, n.set(r), e.set(r), x = S) : (n.set(e), i += S / a, i *= l, u += i, e.add(i), x = u - d), c = xo(x), d = u, T;
  }
  function h() {
    const S = r.get() - t.get();
    return Pe(S) < 1e-3;
  }
  function f() {
    return a;
  }
  function m() {
    return c;
  }
  function g() {
    return i;
  }
  function v() {
    return E(o);
  }
  function w() {
    return C(s);
  }
  function E(S) {
    return a = S, T;
  }
  function C(S) {
    return l = S, T;
  }
  const T = {
    direction: m,
    duration: f,
    velocity: g,
    seek: p,
    settled: h,
    useBaseFriction: w,
    useBaseDuration: v,
    useFriction: C,
    useDuration: E
  };
  return T;
}
function dd(e, t, n, r, o) {
  const s = o.measure(10), i = o.measure(50), c = Pt(0.1, 0.99);
  let a = !1;
  function l() {
    return !(a || !e.reachedAny(n.get()) || !e.reachedAny(t.get()));
  }
  function u(h) {
    if (!l()) return;
    const f = e.reachedMin(t.get()) ? "min" : "max", m = Pe(e[f] - t.get()), g = n.get() - t.get(), v = c.constrain(m / i);
    n.subtract(g * v), !h && Pe(g) < s && (n.set(e.constrain(n.get())), r.useDuration(25).useBaseFriction());
  }
  function d(h) {
    a = !h;
  }
  return {
    shouldConstrain: l,
    constrain: u,
    toggleActive: d
  };
}
function fd(e, t, n, r, o) {
  const s = Pt(-t + e, 0), i = d(), c = u(), a = p();
  function l(f, m) {
    return en(f, m) <= 1;
  }
  function u() {
    const f = i[0], m = nt(i), g = i.lastIndexOf(f), v = i.indexOf(m) + 1;
    return Pt(g, v);
  }
  function d() {
    return n.map((f, m) => {
      const {
        min: g,
        max: v
      } = s, w = s.constrain(f), E = !m, C = Io(n, m);
      return E ? v : C || l(g, w) ? g : l(v, w) ? v : w;
    }).map((f) => parseFloat(f.toFixed(3)));
  }
  function p() {
    if (t <= e + o) return [s.max];
    if (r === "keepSnaps") return i;
    const {
      min: f,
      max: m
    } = c;
    return i.slice(f, m);
  }
  return {
    snapsContained: a,
    scrollContainLimit: c
  };
}
function pd(e, t, n) {
  const r = t[0], o = n ? r - e : nt(t);
  return {
    limit: Pt(o, r)
  };
}
function hd(e, t, n, r) {
  const s = t.min + 0.1, i = t.max + 0.1, {
    reachedMin: c,
    reachedMax: a
  } = Pt(s, i);
  function l(p) {
    return p === 1 ? a(n.get()) : p === -1 ? c(n.get()) : !1;
  }
  function u(p) {
    if (!l(p)) return;
    const h = e * (p * -1);
    r.forEach((f) => f.add(h));
  }
  return {
    loop: u
  };
}
function md(e) {
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
function gd(e, t, n, r, o) {
  const {
    startEdge: s,
    endEdge: i
  } = e, {
    groupSlides: c
  } = o, a = d().map(t.measure), l = p(), u = h();
  function d() {
    return c(r).map((m) => nt(m)[i] - m[0][s]).map(Pe);
  }
  function p() {
    return r.map((m) => n[s] - m[s]).map((m) => -Pe(m));
  }
  function h() {
    return c(l).map((m) => m[0]).map((m, g) => m + a[g]);
  }
  return {
    snaps: l,
    snapsAligned: u
  };
}
function bd(e, t, n, r, o, s) {
  const {
    groupSlides: i
  } = o, {
    min: c,
    max: a
  } = r, l = u();
  function u() {
    const p = i(s), h = !e || t === "keepSnaps";
    return n.length === 1 ? [s] : h ? p : p.slice(c, a).map((f, m, g) => {
      const v = !m, w = Io(g, m);
      if (v) {
        const E = nt(g[0]) + 1;
        return ys(E);
      }
      if (w) {
        const E = pn(s) - nt(g)[0] + 1;
        return ys(E, nt(g)[0]);
      }
      return f;
    });
  }
  return {
    slideRegistry: l
  };
}
function vd(e, t, n, r, o) {
  const {
    reachedAny: s,
    removeOffset: i,
    constrain: c
  } = r;
  function a(f) {
    return f.concat().sort((m, g) => Pe(m) - Pe(g))[0];
  }
  function l(f) {
    const m = e ? i(f) : c(f), g = t.map((w, E) => ({
      diff: u(w - m, 0),
      index: E
    })).sort((w, E) => Pe(w.diff) - Pe(E.diff)), {
      index: v
    } = g[0];
    return {
      index: v,
      distance: m
    };
  }
  function u(f, m) {
    const g = [f, f + n, f - n];
    if (!e) return f;
    if (!m) return a(g);
    const v = g.filter((w) => xo(w) === m);
    return v.length ? a(v) : nt(g) - n;
  }
  function d(f, m) {
    const g = t[f] - o.get(), v = u(g, m);
    return {
      index: f,
      distance: v
    };
  }
  function p(f, m) {
    const g = o.get() + f, {
      index: v,
      distance: w
    } = l(g), E = !e && s(g);
    if (!m || E) return {
      index: v,
      distance: f
    };
    const C = t[v] - w, T = f + u(C, 0);
    return {
      index: v,
      distance: T
    };
  }
  return {
    byDistance: p,
    byIndex: d,
    shortcut: u
  };
}
function yd(e, t, n, r, o, s, i) {
  function c(d) {
    const p = d.distance, h = d.index !== t.get();
    s.add(p), p && (r.duration() ? e.start() : (e.update(), e.render(1), e.update())), h && (n.set(t.get()), t.set(d.index), i.emit("select"));
  }
  function a(d, p) {
    const h = o.byDistance(d, p);
    c(h);
  }
  function l(d, p) {
    const h = t.clone().set(d), f = o.byIndex(h.get(), p);
    c(f);
  }
  return {
    distance: a,
    index: l
  };
}
function wd(e, t, n, r, o, s, i, c) {
  const a = {
    passive: !0,
    capture: !0
  };
  let l = 0;
  function u(h) {
    if (!c) return;
    function f(m) {
      if ((/* @__PURE__ */ new Date()).getTime() - l > 10) return;
      i.emit("slideFocusStart"), e.scrollLeft = 0;
      const w = n.findIndex((E) => E.includes(m));
      Ro(w) && (o.useDuration(0), r.index(w, 0), i.emit("slideFocus"));
    }
    s.add(document, "keydown", d, !1), t.forEach((m, g) => {
      s.add(m, "focus", (v) => {
        (ar(c) || c(h, v)) && f(g);
      }, a);
    });
  }
  function d(h) {
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
    return Ro(a) ? a : a.get();
  }
  return {
    get: n,
    set: r,
    add: o,
    subtract: s
  };
}
function Ji(e, t) {
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
    const h = td(e.direction(p));
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
function Cd(e, t, n, r, o, s, i, c, a) {
  const u = cn(o), d = cn(o).reverse(), p = v().concat(w());
  function h(R, x) {
    return R.reduce((P, O) => P - o[O], x);
  }
  function f(R, x) {
    return R.reduce((P, O) => h(P, x) > 0 ? P.concat([O]) : P, []);
  }
  function m(R) {
    return s.map((x, P) => ({
      start: x - r[P] + 0.5 + R,
      end: x + t - 0.5 + R
    }));
  }
  function g(R, x, P) {
    const O = m(x);
    return R.map((N) => {
      const _ = P ? 0 : -n, D = P ? n : 0, A = P ? "end" : "start", I = O[N][A];
      return {
        index: N,
        loopPoint: I,
        slideLocation: Jt(-1),
        translate: Ji(e, a[N]),
        target: () => c.get() > I ? _ : D
      };
    });
  }
  function v() {
    const R = i[0], x = f(d, R);
    return g(x, n, !1);
  }
  function w() {
    const R = t - i[0] - 1, x = f(u, R);
    return g(x, -n, !0);
  }
  function E() {
    return p.every(({
      index: R
    }) => {
      const x = u.filter((P) => P !== R);
      return h(x, t) <= 0.1;
    });
  }
  function C() {
    p.forEach((R) => {
      const {
        target: x,
        translate: P,
        slideLocation: O
      } = R, N = x();
      N !== O.get() && (P.to(N), O.set(N));
    });
  }
  function T() {
    p.forEach((R) => R.translate.clear());
  }
  return {
    canLoop: E,
    clear: T,
    loop: C,
    loopPoints: p
  };
}
function Ed(e, t, n) {
  let r, o = !1;
  function s(a) {
    if (!n) return;
    function l(u) {
      for (const d of u)
        if (d.type === "childList") {
          a.reInit(), t.emit("slidesChanged");
          break;
        }
    }
    r = new MutationObserver((u) => {
      o || (ar(n) || n(a, u)) && l(u);
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
function Sd(e, t, n, r) {
  const o = {};
  let s = null, i = null, c, a = !1;
  function l() {
    c = new IntersectionObserver((f) => {
      a || (f.forEach((m) => {
        const g = t.indexOf(m.target);
        o[g] = m;
      }), s = null, i = null, n.emit("slidesInView"));
    }, {
      root: e.parentElement,
      threshold: r
    }), t.forEach((f) => c.observe(f));
  }
  function u() {
    c && c.disconnect(), a = !0;
  }
  function d(f) {
    return an(o).reduce((m, g) => {
      const v = parseInt(g), {
        isIntersecting: w
      } = o[v];
      return (f && w || !f && !w) && m.push(v), m;
    }, []);
  }
  function p(f = !0) {
    if (f && s) return s;
    if (!f && i) return i;
    const m = d(f);
    return f && (s = m), f || (i = m), m;
  }
  return {
    init: l,
    destroy: u,
    get: p
  };
}
function Td(e, t, n, r, o, s) {
  const {
    measureSize: i,
    startEdge: c,
    endEdge: a
  } = e, l = n[0] && o, u = f(), d = m(), p = n.map(i), h = g();
  function f() {
    if (!l) return 0;
    const w = n[0];
    return Pe(t[c] - w[c]);
  }
  function m() {
    if (!l) return 0;
    const w = s.getComputedStyle(nt(r));
    return parseFloat(w.getPropertyValue(`margin-${a}`));
  }
  function g() {
    return n.map((w, E, C) => {
      const T = !E, S = Io(C, E);
      return T ? p[E] + u : S ? p[E] + d : C[E + 1][c] - w[c];
    }).map(Pe);
  }
  return {
    slideSizes: p,
    slideSizesWithGaps: h,
    startGap: u,
    endGap: d
  };
}
function Rd(e, t, n, r, o, s, i, c, a) {
  const {
    startEdge: l,
    endEdge: u,
    direction: d
  } = e, p = Ro(n);
  function h(v, w) {
    return cn(v).filter((E) => E % w === 0).map((E) => v.slice(E, E + w));
  }
  function f(v) {
    return v.length ? cn(v).reduce((w, E, C) => {
      const T = nt(w) || 0, S = T === 0, R = E === pn(v), x = o[l] - s[T][l], P = o[l] - s[E][u], O = !r && S ? d(i) : 0, N = !r && R ? d(c) : 0, _ = Pe(P - N - (x + O));
      return C && _ > t + a && w.push(E), R && w.push(v.length), w;
    }, []).map((w, E, C) => {
      const T = Math.max(C[E - 1] || 0);
      return v.slice(T, w);
    }) : [];
  }
  function m(v) {
    return p ? h(v, n) : f(v);
  }
  return {
    groupSlides: m
  };
}
function xd(e, t, n, r, o, s, i) {
  const {
    align: c,
    axis: a,
    direction: l,
    startIndex: u,
    loop: d,
    duration: p,
    dragFree: h,
    dragThreshold: f,
    inViewThreshold: m,
    slidesToScroll: g,
    skipSnaps: v,
    containScroll: w,
    watchResize: E,
    watchSlides: C,
    watchDrag: T,
    watchFocus: S
  } = s, R = 2, x = cd(), P = x.measure(t), O = n.map(x.measure), N = od(a, l), _ = N.measureSize(P), D = ad(_), A = nd(c, _), I = !d && !!w, F = d || !!w, {
    slideSizes: U,
    slideSizesWithGaps: k,
    startGap: M,
    endGap: z
  } = Td(N, P, O, n, F, o), j = Rd(N, _, g, d, P, O, M, z, R), {
    snaps: ae,
    snapsAligned: re
  } = gd(N, A, P, O, j), B = -nt(ae) + nt(k), {
    snapsContained: G,
    scrollContainLimit: V
  } = fd(_, B, re, w, R), H = I ? G : re, {
    limit: Z
  } = pd(B, H, d), oe = Qi(pn(H), u, d), ee = oe.clone(), te = cn(n), W = ({
    dragHandler: q,
    scrollBody: Q,
    scrollBounds: X,
    options: {
      loop: ie
    }
  }) => {
    ie || X.constrain(q.pointerDown()), Q.seek();
  }, ne = ({
    scrollBody: q,
    translate: Q,
    location: X,
    offsetLocation: ie,
    previousLocation: Se,
    scrollLooper: fe,
    slideLooper: Ae,
    dragHandler: Ie,
    animation: Xe,
    eventHandler: ze,
    scrollBounds: ct,
    options: {
      loop: Ct
    }
  }, Et) => {
    const jt = q.settled(), bn = !ct.shouldConstrain(), Gt = Ct ? jt : jt && bn, Kt = Gt && !Ie.pointerDown();
    Kt && Xe.stop();
    const vn = X.get() * Et + Se.get() * (1 - Et);
    ie.set(vn), Ct && (fe.loop(q.direction()), Ae.loop()), Q.to(ie.get()), Kt && ze.emit("settle"), Gt || ze.emit("scroll");
  }, se = rd(r, o, () => W(xe), (q) => ne(xe, q)), be = 0.68, ve = H[oe.get()], Oe = Jt(ve), Ne = Jt(ve), we = Jt(ve), De = Jt(ve), He = ud(Oe, we, Ne, De, p, be), K = vd(d, H, B, Z, De), J = yd(se, oe, ee, He, K, De, i), ue = md(Z), L = ln(), Y = Sd(t, n, i, m), {
    slideRegistry: Te
  } = bd(I, w, H, V, j, te), me = wd(e, n, Te, J, He, L, i, S), xe = {
    ownerDocument: r,
    ownerWindow: o,
    eventHandler: i,
    containerRect: P,
    slideRects: O,
    animation: se,
    axis: N,
    dragHandler: sd(N, e, r, o, De, id(N, o), Oe, se, J, He, K, oe, i, D, h, f, v, be, T),
    eventStore: L,
    percentOfView: D,
    index: oe,
    indexPrevious: ee,
    limit: Z,
    location: Oe,
    offsetLocation: we,
    previousLocation: Ne,
    options: s,
    resizeHandler: ld(t, i, o, n, N, E, x),
    scrollBody: He,
    scrollBounds: dd(Z, we, De, He, D),
    scrollLooper: hd(B, Z, we, [Oe, we, Ne, De]),
    scrollProgress: ue,
    scrollSnapList: H.map(ue.get),
    scrollSnaps: H,
    scrollTarget: K,
    scrollTo: J,
    slideLooper: Cd(N, _, B, U, k, ae, H, we, n),
    slideFocus: me,
    slidesHandler: Ed(t, i, C),
    slidesInView: Y,
    slideIndexes: te,
    slideRegistry: Te,
    slidesToScroll: j,
    target: De,
    translate: Ji(N, t)
  };
  return xe;
}
function Id() {
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
    return e[l] = r(l).filter((d) => d !== u), a;
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
const Pd = {
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
function Od(e) {
  function t(s, i) {
    return Xi(s, i || {});
  }
  function n(s) {
    const i = s.breakpoints || {}, c = an(i).filter((a) => e.matchMedia(a).matches).map((a) => i[a]).reduce((a, l) => t(a, l), {});
    return t(s, c);
  }
  function r(s) {
    return s.map((i) => an(i.breakpoints || {})).reduce((i, c) => i.concat(c), []).map(e.matchMedia);
  }
  return {
    mergeOptions: t,
    optionsAtMedia: n,
    optionsMediaQueries: r
  };
}
function _d(e) {
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
function qn(e, t, n) {
  const r = e.ownerDocument, o = r.defaultView, s = Od(o), i = _d(s), c = ln(), a = Id(), {
    mergeOptions: l,
    optionsAtMedia: u,
    optionsMediaQueries: d
  } = s, {
    on: p,
    off: h,
    emit: f
  } = a, m = N;
  let g = !1, v, w = l(Pd, qn.globalOptions), E = l(w), C = [], T, S, R;
  function x() {
    const {
      container: te,
      slides: W
    } = E;
    S = (Ur(te) ? e.querySelector(te) : te) || e.children[0];
    const se = Ur(W) ? S.querySelectorAll(W) : W;
    R = [].slice.call(se || S.children);
  }
  function P(te) {
    const W = xd(e, S, R, r, o, te, a);
    if (te.loop && !W.slideLooper.canLoop()) {
      const ne = Object.assign({}, te, {
        loop: !1
      });
      return P(ne);
    }
    return W;
  }
  function O(te, W) {
    g || (w = l(w, te), E = u(w), C = W || C, x(), v = P(E), d([w, ...C.map(({
      options: ne
    }) => ne)]).forEach((ne) => c.add(ne, "change", N)), E.active && (v.translate.to(v.location.get()), v.animation.init(), v.slidesInView.init(), v.slideFocus.init(ee), v.eventHandler.init(ee), v.resizeHandler.init(ee), v.slidesHandler.init(ee), v.options.loop && v.slideLooper.loop(), S.offsetParent && R.length && v.dragHandler.init(ee), T = i.init(ee, C)));
  }
  function N(te, W) {
    const ne = j();
    _(), O(l({
      startIndex: ne
    }, te), W), a.emit("reInit");
  }
  function _() {
    v.dragHandler.destroy(), v.eventStore.clear(), v.translate.clear(), v.slideLooper.clear(), v.resizeHandler.destroy(), v.slidesHandler.destroy(), v.slidesInView.destroy(), v.animation.destroy(), i.destroy(), c.clear();
  }
  function D() {
    g || (g = !0, c.clear(), _(), a.emit("destroy"), a.clear());
  }
  function A(te, W, ne) {
    !E.active || g || (v.scrollBody.useBaseFriction().useDuration(W === !0 ? 0 : E.duration), v.scrollTo.index(te, ne || 0));
  }
  function I(te) {
    const W = v.index.add(1).get();
    A(W, te, -1);
  }
  function F(te) {
    const W = v.index.add(-1).get();
    A(W, te, 1);
  }
  function U() {
    return v.index.add(1).get() !== j();
  }
  function k() {
    return v.index.add(-1).get() !== j();
  }
  function M() {
    return v.scrollSnapList;
  }
  function z() {
    return v.scrollProgress.get(v.offsetLocation.get());
  }
  function j() {
    return v.index.get();
  }
  function ae() {
    return v.indexPrevious.get();
  }
  function re() {
    return v.slidesInView.get();
  }
  function B() {
    return v.slidesInView.get(!1);
  }
  function G() {
    return T;
  }
  function V() {
    return v;
  }
  function H() {
    return e;
  }
  function Z() {
    return S;
  }
  function oe() {
    return R;
  }
  const ee = {
    canScrollNext: U,
    canScrollPrev: k,
    containerNode: Z,
    internalEngine: V,
    destroy: D,
    off: h,
    on: p,
    emit: f,
    plugins: G,
    previousScrollSnap: ae,
    reInit: m,
    rootNode: H,
    scrollNext: I,
    scrollPrev: F,
    scrollProgress: z,
    scrollSnapList: M,
    scrollTo: A,
    selectedScrollSnap: j,
    slideNodes: oe,
    slidesInView: re,
    slidesNotInView: B
  };
  return O(t, n), setTimeout(() => a.emit("init"), 0), ee;
}
qn.globalOptions = void 0;
function Po(e = {}, t = []) {
  const n = Fe(e), r = Fe(t), [o, s] = Re(), [i, c] = Re(), a = We(() => {
    o && o.reInit(n.current, r.current);
  }, [o]);
  return Ke(() => {
    To(n.current, e) || (n.current = e, a());
  }, [e, a]), Ke(() => {
    Zu(r.current, t) || (r.current = t, a());
  }, [t, a]), Ke(() => {
    if (Ju() && i) {
      qn.globalOptions = Po.globalOptions;
      const l = qn(i, n.current, r.current);
      return s(l), () => l.destroy();
    } else
      s(void 0);
  }, [i, s]), [c, o];
}
Po.globalOptions = void 0;
const zr = [];
let jr;
function kd() {
  return jr;
}
function Ad(e) {
  zr.push(e);
}
function Zi(e) {
  const t = (n, r) => {
    const o = ot(Md).current;
    let s;
    try {
      jr = o;
      for (const i of zr)
        i.before(o);
      s = e(n, r);
      for (const i of zr)
        i.after(o);
      o.didInitialize = !0;
    } finally {
      jr = void 0;
    }
    return s;
  };
  return t.displayName = e.displayName || e.name, t;
}
function Nd(e) {
  return /* @__PURE__ */ y.forwardRef(Zi(e));
}
function Md() {
  return {
    didInitialize: !1
  };
}
function Dd() {
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
  userAgent: Fd,
  platform: Ld,
  maxTouchPoints: Bd
} = Dd(), lr = Fd.toLowerCase(), un = Ld.toLowerCase(), ec = /^i(os$|p)/.test(un) || un === "macintel" && Bd > 1, ws = "android", Vd = un === ws || lr.includes(ws), tc = !ec && un.startsWith("mac");
un.startsWith("win");
const Hd = tc || ec;
var Qs;
const hn = typeof CSS < "u" && !!((Qs = CSS.supports) != null && Qs.call(CSS, "-webkit-backdrop-filter:none"));
!hn && lr.includes("firefox");
!hn && lr.includes("chrom");
const $d = Hd, Wd = /jsdom|happydom/.test(lr);
function Ud(e) {
  return "nativeEvent" in e;
}
function qd(e) {
  return e.pointerType === "" && e.isTrusted ? !0 : Vd && e.pointerType ? e.type === "click" && e.buttons === 1 : e.detail === 0 && !e.pointerType;
}
function Gr(e, t) {
  const n = ["mouse", "pen"];
  return n.push("", void 0), n.includes(e);
}
function zd(e) {
  const t = e.type;
  return t === "click" || t === "mousedown" || t === "keydown" || t === "keyup";
}
function Kr(e) {
  var n;
  let t = e.activeElement;
  for (; ((n = t == null ? void 0 : t.shadowRoot) == null ? void 0 : n.activeElement) != null; )
    t = t.shadowRoot.activeElement;
  return t;
}
function _e(e, t) {
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
function Yr(e, t) {
  let n = e;
  for (; n; ) {
    if (ge(n) && n.matches(t))
      return n;
    n = n.assignedSlot ?? n.parentNode ?? (Bt(n) ? n.host : null);
  }
  return null;
}
function xt(e) {
  return "composedPath" in e ? e.composedPath()[0] ?? e.target : e.target;
}
const jd = "data-base-ui-focusable", nc = "input:not([type='hidden']):not([disabled]),[contenteditable]:not([contenteditable='false']),textarea:not([disabled])", Gd = "data-open", Kd = "data-closed", Yd = "data-anchor-hidden", Xd = "data-popup-open", Qd = {
  [Xd]: ""
}, Jd = {
  [Gd]: ""
}, Zd = {
  [Kd]: ""
}, ef = {
  [Yd]: ""
}, tf = {
  open(e) {
    return e ? Qd : null;
  }
}, rc = {
  open(e) {
    return e ? Jd : Zd;
  },
  anchorHidden(e) {
    return e ? ef : null;
  }
}, nf = {
  ...rc,
  ...mo
}, Cs = "data-trigger-disabled";
function zn(e, t) {
  if (!ge(e))
    return !1;
  const n = e;
  if (t.hasElement(n))
    return !n.hasAttribute(Cs);
  for (const [, r] of t.entries())
    if (_e(r, n))
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
function rf(e) {
  return e.matches("html,body");
}
function of(e) {
  return Le(e) && e.matches(nc);
}
function sf(e) {
  return Yr(e, `button,a[href],[role="button"],select,[tabindex]:not([tabindex="-1"]),${nc}`) != null;
}
function cf(e) {
  if (!e || Wd)
    return !0;
  try {
    return e.matches(":focus-visible");
  } catch {
    return !0;
  }
}
function af(e, t) {
  return t != null && !Gr(t) ? 0 : typeof e == "function" ? e() : e;
}
function Xr(e, t, n) {
  const r = af(e, n);
  return typeof r == "number" ? r : r == null ? void 0 : r[t];
}
function Es(e) {
  return typeof e == "function" ? e() : e;
}
function oc(e, t) {
  return t || e === "click" || e === "mousedown";
}
function lf(e) {
  return (e == null ? void 0 : e.includes("mouse")) && e !== "mousedown";
}
function mt(...e) {
  return () => {
    for (let t = 0; t < e.length; t += 1) {
      const n = e[t];
      n && n();
    }
  };
}
const uf = {
  clipPath: "inset(50%)",
  overflow: "hidden",
  whiteSpace: "nowrap",
  border: 0,
  padding: 0,
  width: 1,
  height: 1,
  margin: -1
}, df = {
  ...uf,
  position: "fixed",
  margin: 0,
  top: 0,
  left: 0
}, Qr = /* @__PURE__ */ y.forwardRef(function(t, n) {
  const [r, o] = y.useState();
  return he(() => {
    $d && hn && o("button");
  }, []), /* @__PURE__ */ b("span", {
    ...t,
    ref: n,
    style: df,
    "aria-hidden": r ? void 0 : !0,
    ...{
      tabIndex: 0,
      // Role is only for VoiceOver
      role: r
    },
    "data-base-ui-focus-guard": ""
  });
});
process.env.NODE_ENV !== "production" && (Qr.displayName = "FocusGuard");
const $t = Math.min, ut = Math.max, jn = Math.round, Pn = Math.floor, dt = (e) => ({
  x: e,
  y: e
}), ff = {
  left: "right",
  right: "left",
  bottom: "top",
  top: "bottom"
};
function sc(e, t, n) {
  return ut(e, $t(t, n));
}
function vt(e, t) {
  return typeof e == "function" ? e(t) : e;
}
function Ge(e) {
  return e.split("-")[0];
}
function it(e) {
  return e.split("-")[1];
}
function Oo(e) {
  return e === "x" ? "y" : "x";
}
function _o(e) {
  return e === "y" ? "height" : "width";
}
function Je(e) {
  const t = e[0];
  return t === "t" || t === "b" ? "y" : "x";
}
function ko(e) {
  return Oo(Je(e));
}
function pf(e, t, n) {
  n === void 0 && (n = !1);
  const r = it(e), o = ko(e), s = _o(o);
  let i = o === "x" ? r === (n ? "end" : "start") ? "right" : "left" : r === "start" ? "bottom" : "top";
  return t.reference[s] > t.floating[s] && (i = Gn(i)), [i, Gn(i)];
}
function hf(e) {
  const t = Gn(e);
  return [Jr(e), t, Jr(t)];
}
function Jr(e) {
  return e.includes("start") ? e.replace("start", "end") : e.replace("end", "start");
}
const Ss = ["left", "right"], Ts = ["right", "left"], mf = ["top", "bottom"], gf = ["bottom", "top"];
function bf(e, t, n) {
  switch (e) {
    case "top":
    case "bottom":
      return n ? t ? Ts : Ss : t ? Ss : Ts;
    case "left":
    case "right":
      return t ? mf : gf;
    default:
      return [];
  }
}
function vf(e, t, n, r) {
  const o = it(e);
  let s = bf(Ge(e), n === "start", r);
  return o && (s = s.map((i) => i + "-" + o), t && (s = s.concat(s.map(Jr)))), s;
}
function Gn(e) {
  const t = Ge(e);
  return ff[t] + e.slice(t.length);
}
function yf(e) {
  var t, n, r, o;
  return {
    top: (t = e.top) != null ? t : 0,
    right: (n = e.right) != null ? n : 0,
    bottom: (r = e.bottom) != null ? r : 0,
    left: (o = e.left) != null ? o : 0
  };
}
function ic(e) {
  return typeof e != "number" ? yf(e) : {
    top: e,
    right: e,
    bottom: e,
    left: e
  };
}
function Kn(e) {
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
function wf(e) {
  return e.visibility === "hidden" || e.visibility === "collapse";
}
function Cf(e, t = e ? Ye(e) : null) {
  return !e || !e.isConnected || !t || wf(t) ? !1 : typeof e.checkVisibility == "function" ? e.checkVisibility() : t.display !== "none" && t.display !== "contents";
}
const Ef = 'a[href],button,input,select,textarea,summary,details,iframe,object,embed,[tabindex],[contenteditable]:not([contenteditable="false"]),audio[controls],video[controls]';
function Sf(e) {
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
    if (qe(t) === "summary")
      return t;
  return null;
}
function Tf(e, t) {
  const n = Zr(t);
  return !!n && (e === n || _e(n, e));
}
function cc(e) {
  const t = e ? qe(e) : "";
  return e != null && e.matches(Ef) && (t !== "summary" || e.parentElement != null && qe(e.parentElement) === "details" && Zr(e.parentElement) === e) && (t !== "details" || Zr(e) == null) && (t !== "input" || e.type !== "hidden");
}
function Rf(e) {
  if (!cc(e) || !e.isConnected || e.matches(":disabled"))
    return !1;
  for (let t = e; t; t = Sf(t)) {
    const n = t !== e, r = qe(t) === "slot";
    if (t.hasAttribute("inert") || n && qe(t) === "details" && !t.open && !Tf(e, t) || t.hasAttribute("hidden") || !r && !xf(t, n))
      return !1;
  }
  return !0;
}
function xf(e, t) {
  const n = Ye(e);
  return t ? n.display !== "none" : Cf(e, n);
}
function If(e) {
  const t = e.tabIndex;
  if (t < 0) {
    const n = qe(e);
    if (n === "details" || n === "audio" || n === "video" || Le(e) && e.isContentEditable)
      return 0;
  }
  return t;
}
function Er(e) {
  if (qe(e) !== "input")
    return null;
  const t = e;
  return t.type === "radio" && t.name !== "" ? t : null;
}
function Pf(e, t) {
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
function ac(e) {
  if (Le(e) && qe(e) === "slot") {
    const t = e.assignedElements({
      flatten: !0
    });
    if (t.length > 0)
      return t;
  }
  return Le(e) && e.shadowRoot ? Array.from(e.shadowRoot.children) : Array.from(e.children);
}
function lc(e, t) {
  ac(e).forEach((n) => {
    cc(n) && t.push(n), lc(n, t);
  });
}
function uc(e, t, n) {
  ac(e).forEach((r) => {
    Le(r) && r.matches(t) && n.push(r), uc(r, t, n);
  });
}
function Of(e) {
  const t = [];
  return lc(e, t), t.filter(Rf);
}
function dc(e) {
  const t = Of(e);
  return t.filter((n) => If(n) >= 0 && Pf(n, t));
}
function fc(e, t) {
  const n = dc(e), r = n.length;
  if (r === 0)
    return;
  const o = Kr(rt(e)), s = n.indexOf(o), i = s === -1 ? t === 1 ? 0 : r - 1 : s + t;
  return n[i];
}
function _f(e) {
  return fc(rt(e).body, 1) || e;
}
function kf(e) {
  return fc(rt(e).body, -1) || e;
}
function Sr(e, t) {
  const n = t || e.currentTarget, r = e.relatedTarget;
  return !r || !_e(n, r);
}
function Af(e) {
  dc(e).forEach((n) => {
    n.dataset.tabindex = n.getAttribute("tabindex") || "", n.setAttribute("tabindex", "-1");
  });
}
function Rs(e) {
  const t = [];
  uc(e, "[data-tabindex]", t), t.forEach((n) => {
    const r = n.dataset.tabindex;
    delete n.dataset.tabindex, r ? n.setAttribute("tabindex", r) : n.removeAttribute("tabindex");
  });
}
function Wt(e, t, n = !0) {
  return e.filter((o) => o.parentId === t).flatMap((o) => {
    var s;
    return [...!n || (s = o.context) != null && s.open ? [o] : [], ...Wt(e, o.id, n)];
  });
}
function Ao(e) {
  return `data-base-ui-${e}`;
}
const Nf = {
  style: {
    transition: "none"
  }
}, Mf = {
  fallbackAxisSide: "end"
}, Df = {
  clipPath: "inset(50%)",
  position: "fixed",
  top: 0,
  left: 0
}, No = /* @__PURE__ */ y.createContext(null);
process.env.NODE_ENV !== "production" && (No.displayName = "PortalContext");
const Ff = () => y.useContext(No), Lf = Ao("portal");
function pc(e = {}) {
  const {
    ref: t,
    container: n,
    componentProps: r = Ue,
    elementProps: o
  } = e, s = nr(), i = Ff(), c = i == null ? void 0 : i.portalNode, [a, l] = y.useState(null), [u, d] = y.useState(null), p = de((g) => {
    g !== null && d(g);
  }), h = y.useRef(null);
  he(() => {
    if (n === null) {
      h.current && (h.current = null, d(null), l(null));
      return;
    }
    const g = (n && (go(n) ? n : n.current)) ?? c ?? document.body;
    if (g == null) {
      h.current && (h.current = null, d(null), l(null));
      return;
    }
    h.current !== g && (h.current = g, d(null), l(g));
  }, [n, c]);
  const f = wt("div", r, {
    ref: [t, p],
    props: [{
      id: s,
      [Lf]: ""
    }, o]
  }), m = a && f ? /* @__PURE__ */ yt.createPortal(f, a) : null;
  return {
    node: u,
    // `id` and `render` props can override or remove the generated ID. Use the exact
    // rendered value so `aria-owns` never points at an ID absent from the DOM.
    nodeId: /* @__PURE__ */ y.isValidElement(f) ? f.props.id : void 0,
    subtree: m
  };
}
const Bf = /* @__PURE__ */ y.forwardRef(function(t, n) {
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
    nodeId: d,
    subtree: p
  } = pc({
    container: c,
    ref: n,
    componentProps: t,
    elementProps: l
  }), h = y.useRef(null), f = y.useRef(null), m = y.useRef(null), g = y.useRef(null), [v, w] = y.useState(null), E = y.useRef(!1), C = v == null ? void 0 : v.modal, T = v == null ? void 0 : v.open, S = !!v && !v.modal && v.open && !!u;
  y.useEffect(() => {
    if (!u || C)
      return;
    function x(P) {
      u && P.relatedTarget && Sr(P) && (P.type === "focusin" ? E.current && (Rs(u), E.current = !1) : (Af(u), E.current = !0));
    }
    return mt(Ee(u, "focusin", x, !0), Ee(u, "focusout", x, !0));
  }, [u, C]), he(() => {
    !u || T !== !0 || !E.current || (Rs(u), E.current = !1);
  }, [T, u]);
  const R = y.useMemo(() => ({
    beforeOutsideRef: h,
    afterOutsideRef: f,
    beforeInsideRef: m,
    afterInsideRef: g,
    portalNode: u,
    setFocusManagerState: w
  }), [u]);
  return /* @__PURE__ */ $(y.Fragment, {
    children: [p, /* @__PURE__ */ $(No.Provider, {
      value: R,
      children: [S && u && /* @__PURE__ */ b(Qr, {
        "data-type": "outside",
        ref: h,
        onFocus: (x) => {
          var P;
          if (Sr(x, u))
            (P = m.current) == null || P.focus();
          else {
            const O = v ? v.domReference : null, N = kf(O);
            N == null || N.focus();
          }
        }
      }), S && u && /* @__PURE__ */ b("span", {
        role: a,
        "aria-owns": d,
        style: Df
      }), u && /* @__PURE__ */ yt.createPortal(i, u), S && u && /* @__PURE__ */ b(Qr, {
        "data-type": "outside",
        ref: f,
        onFocus: (x) => {
          var P;
          if (Sr(x, u))
            (P = g.current) == null || P.focus();
          else {
            const O = v ? v.domReference : null, N = _f(O);
            N == null || N.focus(), v != null && v.closeOnFocusOut && (v == null || v.onOpenChange(!1, ke(ml, x.nativeEvent)));
          }
        }
      })]
    })]
  });
});
process.env.NODE_ENV !== "production" && (Bf.displayName = "FloatingPortal");
function hc() {
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
class Vf {
  constructor() {
    ce(this, "nodesRef", {
      current: []
    });
    ce(this, "events", hc());
  }
  addNode(t) {
    this.nodesRef.current.push(t);
  }
  removeNode(t) {
    const n = this.nodesRef.current.findIndex((r) => r === t);
    n !== -1 && this.nodesRef.current.splice(n, 1);
  }
}
const Mo = /* @__PURE__ */ y.createContext(null);
process.env.NODE_ENV !== "production" && (Mo.displayName = "FloatingNodeContext");
const Do = /* @__PURE__ */ y.createContext(null);
process.env.NODE_ENV !== "production" && (Do.displayName = "FloatingTreeContext");
const ur = () => {
  var e;
  return ((e = y.useContext(Mo)) == null ? void 0 : e.id) || null;
}, mn = (e) => {
  const t = y.useContext(Do);
  return e ?? t;
};
function Hf(e) {
  const t = nr(), n = mn(e), r = ur();
  return he(() => {
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
function $f(e) {
  const {
    children: t,
    id: n
  } = e, r = ur();
  return /* @__PURE__ */ b(Mo.Provider, {
    value: y.useMemo(() => ({
      id: n,
      parentId: r
    }), [n, r]),
    children: t
  });
}
function Wf(e) {
  const {
    children: t,
    externalTree: n
  } = e, r = ot(() => n ?? new Vf()).current;
  return /* @__PURE__ */ b(Do.Provider, {
    value: r,
    children: t
  });
}
function Uf() {
  return !1;
}
function qf(e) {
  return {
    escapeKey: typeof e == "boolean" ? e : (e == null ? void 0 : e.escapeKey) ?? !1,
    outsidePress: typeof e == "boolean" ? e : (e == null ? void 0 : e.outsidePress) ?? !0
  };
}
function zf(e, t = {}) {
  const {
    enabled: n = !0,
    escapeKey: r = !0,
    outsidePress: o = !0,
    outsidePressEvent: s = "sloppy",
    referencePress: i = Uf,
    bubbles: c,
    externalTree: a
  } = t, l = e.useState("open"), u = e.useState("floatingElement"), {
    dataRef: d,
    events: p
  } = e.context, h = mn(a), f = de(typeof o == "function" ? o : () => !1), m = typeof o == "function" ? f : o, g = m !== !1, v = de(() => s), {
    escapeKey: w,
    outsidePress: E
  } = qf(c), C = y.useRef(!1), T = y.useRef(!1), S = y.useRef(!1), R = y.useRef(!1), x = y.useRef(!1), P = y.useRef(""), O = y.useRef(null), N = Zt(), _ = Zt(), D = Zt(), A = de(() => {
    _.clear(), d.current.insideReactTree = !1;
  }), I = de((B) => {
    var H;
    const G = (H = d.current.floatingContext) == null ? void 0 : H.nodeId;
    return (h ? Wt(h.nodesRef.current, G) : []).some((Z) => {
      var oe;
      return ((oe = Z.context) == null ? void 0 : oe.open) && !Z.context.dataRef.current[B];
    });
  }), F = de((B) => Cr(B, e.select("floatingElement")) || Cr(B, e.select("domReferenceElement"))), U = de((B) => {
    i() && e.setOpen(!1, ke(rr, B.nativeEvent));
  }), k = de((B) => {
    if (!l || !n || !r || B.key !== "Escape")
      return;
    const G = Ud(B) ? B.nativeEvent : B;
    if (x.current || G.isComposing || !w && I("__escapeKeyBubbles"))
      return;
    const V = ke(uo, G);
    e.setOpen(!1, V), V.isCanceled || B.preventDefault(), !w && !V.isPropagationAllowed && B.stopPropagation();
  }), M = de(() => {
    d.current.insideReactTree = !0, _.start(0, A);
  }), z = de((B) => {
    if (!l || !n || B.button !== 0)
      return;
    const G = xt(B.nativeEvent);
    _e(e.select("floatingElement"), G) && (C.current || (C.current = !0, T.current = !1));
  }), j = de((B) => {
    !l || !n || (B.defaultPrevented || B.nativeEvent.defaultPrevented) && C.current && (T.current = !0);
  });
  y.useEffect(() => {
    function B(G) {
      G.open || (R.current = !1);
    }
    return p.on("openchange", B), () => {
      p.off("openchange", B);
    };
  }, [p]), y.useEffect(() => A, [A]), y.useEffect(() => {
    if (!l || !n)
      return l || (R.current = !1, x.current = !1, P.current = "", O.current = null), A;
    d.current.__escapeKeyBubbles = w, d.current.__outsidePressBubbles = E;
    const B = new bt(), G = rt(u);
    function V() {
      D.clear(), x.current = !0;
    }
    function H() {
      x.current = !0, D.start(
        // 0ms or 1ms don't work in Safari. 5ms appears to consistently work.
        // Only apply to WebKit for the test to remain 0ms.
        hn ? 5 : 0,
        () => {
          x.current = !1;
        }
      );
    }
    function Z() {
      S.current = !0, B.start(0, () => {
        S.current = !1;
      });
    }
    function oe() {
      C.current = !1, T.current = !1;
    }
    function ee() {
      const L = P.current, Y = L === "pen" || !L ? "mouse" : L, Te = v(), me = typeof Te == "function" ? Te() : Te;
      return typeof me == "string" ? me : me[Y];
    }
    function te(L) {
      const Y = ee();
      return Y === "intentional" && L.type !== "click" || Y === "sloppy" && L.type === "click";
    }
    function W(L) {
      var me;
      const Y = (me = d.current.floatingContext) == null ? void 0 : me.nodeId, Te = h && Wt(h.nodesRef.current, Y).some((xe) => {
        var q;
        return Cr(L, (q = xe.context) == null ? void 0 : q.elements.floating);
      });
      return F(L) || Te;
    }
    function ne(L) {
      if (te(L)) {
        L.type !== "click" && !F(L) && (B.clear(), S.current = !1), A();
        return;
      }
      if (d.current.insideReactTree) {
        A();
        return;
      }
      const Y = xt(L), Te = `[${Ao("inert")}]`, me = ge(Y) ? Y.getRootNode() : null, xe = Array.from((Bt(me) ? me : rt(e.select("floatingElement"))).querySelectorAll(Te)), q = e.context.triggerElements;
      if (Y && (q.hasElement(Y) || q.hasMatchingElement((X) => _e(X, Y))))
        return;
      let Q = ge(Y) ? Y : null;
      for (; Q && !ht(Q); ) {
        const X = gt(Q);
        if (ht(X) || !ge(X))
          break;
        Q = X;
      }
      if (!(xe.length && ge(Y) && !rf(Y) && // Clicked on a direct ancestor (e.g. FloatingOverlay).
      !_e(Y, e.select("floatingElement")) && // If the target root element contains none of the markers, then the
      // element was injected after the floating element rendered.
      xe.every((X) => !_e(Q, X)))) {
        if (Le(Y) && !("touches" in L)) {
          const X = ht(Y), ie = Ye(Y), Se = /auto|scroll/, fe = X || Se.test(ie.overflowX), Ae = X || Se.test(ie.overflowY), Ie = fe && Y.clientWidth > 0 && Y.scrollWidth > Y.clientWidth, Xe = Ae && Y.clientHeight > 0 && Y.scrollHeight > Y.clientHeight, ze = ie.direction === "rtl", ct = Xe && (ze ? L.offsetX <= Y.offsetWidth - Y.clientWidth : L.offsetX > Y.clientWidth), Ct = Ie && L.offsetY > Y.clientHeight;
          if (ct || Ct)
            return;
        }
        if (!W(L)) {
          if (ee() === "intentional") {
            if (L.detail !== 0 && !qd(L) && !R.current)
              return;
            if (S.current) {
              B.clear(), S.current = !1;
              return;
            }
          }
          typeof m == "function" && !m(L) || I("__outsidePressBubbles") || (e.setOpen(!1, ke(hl, L)), A());
        }
      }
    }
    function se(L) {
      ee() !== "sloppy" || L.pointerType === "touch" || !e.select("open") || !n || F(L) || ne(L);
    }
    function be(L) {
      if (ee() !== "sloppy" || !e.select("open") || !n || F(L))
        return;
      const Y = L.touches[0];
      Y && (O.current = {
        startTime: Date.now(),
        startX: Y.clientX,
        startY: Y.clientY,
        dismissOnTouchEnd: !1,
        dismissOnMouseDown: !0
      }, N.start(1e3, () => {
        O.current && (O.current.dismissOnTouchEnd = !1, O.current.dismissOnMouseDown = !1);
      }));
    }
    function ve(L, Y) {
      const Te = xt(L);
      if (!Te)
        return;
      const me = Ee(Te, L.type, () => {
        Y(L), me();
      });
    }
    function Oe(L) {
      P.current = "touch", ve(L, be);
    }
    function Ne(L) {
      N.clear(), L.type === "pointerdown" && (L.button === 0 && (R.current = !0), P.current = L.pointerType), !(L.type === "mousedown" && O.current && !O.current.dismissOnMouseDown) && ve(L, (Y) => {
        Y.type === "pointerdown" ? se(Y) : ne(Y);
      });
    }
    function we(L) {
      if (L.type === "pointercancel" && (R.current = !1), !C.current)
        return;
      const Y = T.current;
      if (oe(), ee() === "intentional") {
        if (L.type === "pointercancel") {
          Y && Z();
          return;
        }
        if (!W(L)) {
          if (Y) {
            Z();
            return;
          }
          typeof m == "function" && !m(L) || (B.clear(), S.current = !0, A());
        }
      }
    }
    function De(L) {
      if (ee() !== "sloppy" || !O.current || F(L))
        return;
      const Y = L.touches[0];
      if (!Y)
        return;
      const Te = Math.abs(Y.clientX - O.current.startX), me = Math.abs(Y.clientY - O.current.startY), xe = Math.sqrt(Te * Te + me * me);
      xe > 5 && (O.current.dismissOnTouchEnd = !0), xe > 10 && (ne(L), N.clear(), O.current = null);
    }
    function He(L) {
      ve(L, De);
    }
    function K(L) {
      ee() !== "sloppy" || !O.current || F(L) || (O.current.dismissOnTouchEnd && ne(L), N.clear(), O.current = null);
    }
    function J(L) {
      ve(L, K);
    }
    const ue = mt(r && mt(Ee(G, "keydown", k), Ee(G, "compositionstart", V), Ee(G, "compositionend", H)), g && mt(Ee(G, "click", Ne, !0), Ee(G, "pointerdown", Ne, !0), Ee(G, "pointerup", we, !0), Ee(G, "pointercancel", we, !0), Ee(G, "mousedown", Ne, !0), Ee(G, "mouseup", we, !0), Ee(G, "touchstart", Oe, {
      capture: !0,
      passive: !0
    }), Ee(G, "touchmove", He, {
      capture: !0,
      passive: !0
    }), Ee(G, "touchend", J, {
      capture: !0,
      passive: !0
    })));
    return () => {
      ue(), B.clear(), oe(), S.current = !1;
    };
  }, [d, u, r, g, m, l, n, w, E, k, A, v, I, F, h, e, N, D]);
  const ae = y.useMemo(() => ({
    onKeyDown: k,
    onPointerDown: U,
    onClick: U
  }), [k, U]), re = y.useMemo(() => ({
    onKeyDown: k,
    // `onMouseDown` may be blocked if `event.preventDefault()` is called in
    // `onPointerDown`, such as with <NumberField.ScrubArea>.
    // See https://github.com/mui/base-ui/pull/3379
    onPointerDown: j,
    onMouseDown: j,
    onClickCapture: M,
    onMouseDownCapture(B) {
      M(), z(B);
    },
    onPointerDownCapture(B) {
      M(), z(B);
    },
    onMouseUpCapture: M,
    onTouchEndCapture: M,
    onTouchMoveCapture: M
  }), [k, M, z, j]);
  return y.useMemo(() => n ? {
    reference: ae,
    floating: re,
    trigger: ae
  } : {}, [n, ae, re]);
}
function Yn(e, t, n, r) {
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
function jf(e) {
  return {
    left: e.left,
    top: e.top,
    right: e.right,
    bottom: e.bottom,
    width: e.width,
    height: e.height
  };
}
function mc(e) {
  const t = [];
  let n, r = Number.POSITIVE_INFINITY, o = Number.POSITIVE_INFINITY, s = Number.NEGATIVE_INFINITY, i = Number.NEGATIVE_INFINITY;
  for (const c of Array.from(e).sort((a, l) => a.top - l.top)) {
    if (r = Math.min(r, c.left), o = Math.min(o, c.top), s = Math.max(s, c.right), i = Math.max(i, c.bottom), !n || c.top - n.top > n.height / 2)
      t.push(jf(c));
    else {
      const a = t[t.length - 1];
      a.left = Math.min(a.left, c.left), a.right = Math.max(a.right, c.right), a.bottom = Math.max(a.bottom, c.bottom), a.width = a.right - a.left, a.height = a.bottom - a.top;
    }
    n = c;
  }
  return {
    lines: t,
    fallback: Yn(r, o, s, i)
  };
}
function gc(e, t, n) {
  return e.findIndex((r) => t > r.left - 2 && t < r.right + 2 && n > r.top - 2 && n < r.bottom + 2);
}
function xs(e) {
  return Yn(e.left, e.top, e.right, e.bottom);
}
function Gf(e, t, n) {
  const {
    lines: r
  } = mc(e.getClientRects());
  if (r.length < 2)
    return;
  const o = gc(r, t, n);
  return {
    x: t,
    y: n,
    lineIndex: o === -1 ? void 0 : o,
    element: e
  };
}
function Kf(e, t, n) {
  const {
    lines: r,
    fallback: o
  } = mc(e.getClientRects());
  if (r.length < 2)
    return null;
  const s = n == null ? void 0 : n.x, i = n == null ? void 0 : n.y, c = t[0];
  if ((n == null ? void 0 : n.lineIndex) != null && r[n.lineIndex])
    return xs(r[n.lineIndex]);
  if (s != null && i != null) {
    const f = gc(r, s, i);
    if (f !== -1)
      return xs(r[f]);
  }
  if (r.length === 2 && r[0].left > r[1].right && s != null && i != null)
    return o;
  if (c === "t" || c === "b") {
    const f = r[0], m = r[r.length - 1], g = c === "t" ? f : m;
    return Yn(g.left, f.top, g.right, m.bottom);
  }
  const a = c === "l";
  let l = r[0].left, u = r[0].right, d = a ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY, p = r[0], h = r[0];
  for (const f of r) {
    l = Math.min(l, f.left), u = Math.max(u, f.right);
    const m = a ? f.left : f.right;
    a && m < d || !a && m > d ? (d = m, p = f, h = f) : m === d && (h = f);
  }
  return Yn(l, p.top, u, h.bottom);
}
function Yf(e) {
  return "contextElement" in e && e.contextElement ? e.contextElement : ge(e) ? e : void 0;
}
function Xf(e, t) {
  function n(o) {
    bc(e, o.currentTarget, o.clientX, o.clientY);
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
function bc(e, t, n, r) {
  const o = Gf(t, n, r);
  return e.current = o, o;
}
function Qf(e) {
  return {
    name: "inline",
    async fn(t) {
      const n = t.elements.reference;
      if (typeof (n == null ? void 0 : n.getClientRects) != "function")
        return {};
      const r = Yf(n), o = e.current, s = (o == null ? void 0 : o.element) === n || (o == null ? void 0 : o.element) === r ? o : void 0, i = Kf(n, t.placement, s);
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
class Jf {
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
    ce(this, "attachedStores", []);
    /**
     * Store of the root that currently controls the handle: the most recently attached one still
     * mounted, or `null` when no root is attached. Imperative methods are no-ops while this is `null`.
     */
    ce(this, "attachedStoreValue", null);
    /**
     * Listeners notified when `attachedStore` changes, so detached triggers can follow the store pointer.
     */
    ce(this, "storeListeners", /* @__PURE__ */ new Set());
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
      (n.overlapWarningFrame ?? (n.overlapWarningFrame = Ve.create())).request(() => {
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
        throw new Error(process.env.NODE_ENV !== "production" ? `Base UI: ${this.componentName}Handle.open() was called with the trigger id "${t}", but no matching trigger is registered with this handle. An anchored popup cannot open without a trigger to anchor to. Pass the id of a mounted ${this.componentName}.Trigger that has this handle set on its "handle" prop.` : _t(99, this.componentName, t, this.componentName));
      process.env.NODE_ENV !== "production" && console.warn(`Base UI: ${this.componentName}Handle.open: No trigger found with id "${t}". The popup will open, but the trigger will not be associated with it.`);
    }
    n.setOpen(!0, ke(Lr, void 0, r));
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
    t.setOpen(!1, ke(Lr));
  }
}
function Zf(e) {
  const {
    popupStore: t,
    treatPopupAsFloatingElement: n = !1,
    floatingRootContext: r,
    floatingId: o,
    nested: s,
    onOpenChange: i
  } = e, c = t.useState("open"), a = t.useState("activeTriggerElement"), l = t.useState(n ? "popupElement" : "positionerElement"), u = i;
  return t.useSyncedValue("floatingId", o), he(() => {
    const d = {
      open: c,
      floatingId: o,
      referenceElement: a,
      floatingElement: l
    };
    ge(a) && (d.domReferenceElement = a), r.state.positionReference === r.state.referenceElement && (d.positionReference = a), r.update(d);
  }, [c, o, a, l, r]), r.context.onOpenChange = u, r.context.nested = s, r;
}
function ep(e) {
  const {
    open: t,
    ref: n,
    preventUnmountOnClose: r,
    setPreventUnmountOnClose: o,
    onUnmount: s,
    animateInitialOpen: i
  } = e, c = de(o), {
    mounted: a,
    setMounted: l,
    transitionStatus: u
  } = Ii(t, !1, !1, i), d = t ? !1 : r;
  he(() => {
    t && c(!1);
  }, [t, c]);
  const p = y.useRef(a), h = y.useRef(!1), f = Ti(), m = () => {
    p.current = !1, l(!1), s();
  };
  he(() => {
    p.current = a, h.current && (h.current = !1, !t && a && m());
  });
  const g = de(() => {
    if (p.current) {
      if (t) {
        h.current = !0, f();
        return;
      }
      m();
    }
  });
  return yo({
    enabled: a && !t && !d,
    open: t,
    ref: n,
    onComplete() {
      t || g();
    }
  }), {
    mounted: a,
    transitionStatus: u,
    preventUnmountingOnClose: d,
    forceUnmount: g
  };
}
const tp = {
  tabIndex: -1,
  [jd]: ""
};
function np(e, t = !1) {
  const n = nr(), r = ur() != null, o = ot(() => e(n, r)).current;
  return Zf({
    popupStore: o,
    treatPopupAsFloatingElement: t,
    floatingRootContext: o.state.floatingRootContext,
    floatingId: n,
    nested: r,
    onOpenChange: o.setOpen
  }), o;
}
function rp({
  handle: e,
  store: t
}) {
  return he(() => e.attachStore(t), [e, t]), null;
}
function Is(e) {
  const t = e.context.triggerElements.size;
  e.select("open") && e.state.triggerCount !== t && e.set("triggerCount", t);
}
function op(e, t) {
  const n = y.useRef(null);
  return de((r) => {
    const o = n.current;
    if (o !== null) {
      if (o.element === r && o.store === t && o.id === e)
        return;
      n.current = null;
      const s = o.store;
      s.context.triggerElements.getById(o.id) === o.element && (s.context.triggerElements.delete(o.id), Is(s));
    }
    r !== null && e !== void 0 && (n.current = {
      store: t,
      id: e,
      element: r
    }, t.context.triggerElements.add(e, r), Is(t));
  });
}
function sp(e, t, n, r = !1) {
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
function ip(e) {
  let t = !1;
  return e.preventUnmountOnClose = () => {
    t = !0;
  }, () => t;
}
function cp(e, t, n, r = {}) {
  var u, d, p;
  const o = n.reason, s = o === et, i = t && o === Dn, c = !t && (o === rr || o === uo), a = ip(n);
  if ((d = (u = e.context).onOpenChange) == null || d.call(u, t, n), n.isCanceled)
    return;
  (p = r.onBeforeDispatch) == null || p.call(r), e.state.floatingRootContext.dispatchOpenChange(t, n);
  const l = () => {
    const h = sp(e.state, t, n.trigger, a()), f = {
      ...r.extraState,
      ...h
    };
    i ? f.instantType = "focus" : c ? f.instantType = "dismiss" : s && (f.instantType = void 0), e.update(f);
  };
  s ? yt.flushSync(l) : l();
}
function ap(e, t, n, r) {
  const o = n.useState("isMountedByTrigger", e), s = op(e, n), i = de((a) => {
    const l = n.select("open"), u = n.select("activeTriggerId");
    if (u === e) {
      const d = {
        activeTriggerElement: a,
        ...l ? r : null
      };
      n.update(d);
      return;
    }
    if (u == null && l && !n.state.openedWithoutTrigger) {
      const d = {
        activeTriggerId: e ?? null,
        activeTriggerElement: a,
        ...r
      };
      n.update(d);
    }
  }), c = de((a) => {
    s(a), a && i(a);
  });
  return he(() => (c(t.current), () => c(null)), [c, t, n, e]), he(() => {
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
function lp(e, t = {}) {
  const {
    closeOnActiveTriggerUnmount: n = !1
  } = t, r = y.useRef(null), o = e.useState("open"), s = e.useState("triggerCount"), i = e.useState("activeTriggerId"), c = e.useState("activeTriggerElement");
  he(() => {
    if (!o) {
      r.current = null, e.state.triggerCount !== 0 && e.set("triggerCount", 0), e.state.openedWithoutTrigger && e.set("openedWithoutTrigger", !1);
      return;
    }
    const a = e.context.triggerElements.size, l = {};
    e.state.triggerCount !== a && (l.triggerCount = a);
    const u = e.select("activeTriggerId");
    let d = null;
    if (u) {
      const p = e.context.triggerElements.getById(u);
      if (p)
        r.current = u, p !== e.state.activeTriggerElement && (l.activeTriggerElement = p);
      else {
        for (const [h, f] of e.context.triggerElements.entries())
          if (f === e.state.activeTriggerElement) {
            l.activeTriggerId = h, l.activeTriggerElement = f, r.current = h;
            break;
          }
        l.activeTriggerId === void 0 && (r.current === u ? d = u : r.current = null);
      }
    } else
      r.current = null;
    if (!d && !u && !e.state.openedWithoutTrigger && a === 1) {
      const p = e.context.triggerElements.entries().next();
      if (!p.done) {
        const [h, f] = p.value;
        l.activeTriggerId = h, l.activeTriggerElement = f, r.current = h;
      }
    }
    (l.triggerCount !== void 0 || l.activeTriggerId !== void 0 || l.activeTriggerElement !== void 0) && e.update(l), d && n && queueMicrotask(() => {
      if (e.select("open") && e.select("activeTriggerId") === d && !e.context.triggerElements.getById(d)) {
        const p = ke(xi);
        e.setOpen(!1, p), p.isCanceled || e.update({
          activeTriggerId: null,
          activeTriggerElement: null
        });
      }
    });
  }, [o, e, s, i, c, n]);
}
function up(e, t, n, r) {
  const {
    mounted: o,
    transitionStatus: s,
    forceUnmount: i
  } = ep({
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
  return ot(() => (t.set("mounted", o), null)), t.useSyncedValues({
    mounted: o,
    transitionStatus: s
  }), {
    forceUnmount: i,
    transitionStatus: s
  };
}
function dp(e, t) {
  e.useSyncedValues(t), he(() => () => {
    e.update({
      activeTriggerProps: Ue,
      inactiveTriggerProps: Ue,
      popupProps: Ue
    });
  }, [e]);
}
let Dt;
function fp(e) {
  Dt ?? (Dt = /* @__PURE__ */ new WeakMap());
  let t = Dt.get(e);
  return t || (t = /* @__PURE__ */ new WeakMap(), Dt.set(e, t)), t;
}
class vc {
  constructor() {
    ce(this, "idMap", /* @__PURE__ */ new Map());
  }
  /**
   * Adds a trigger element with the given ID.
   *
   * Note: The provided element is assumed to not be registered under multiple IDs.
   */
  add(t, n) {
    if (process.env.NODE_ENV !== "production") {
      const r = fp(this), o = r.get(n);
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
var On = { exports: {} }, Tr = {};
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
function pp() {
  if (Ps) return Tr;
  Ps = 1;
  var e = je;
  function t(d, p) {
    return d === p && (d !== 0 || 1 / d === 1 / p) || d !== d && p !== p;
  }
  var n = typeof Object.is == "function" ? Object.is : t, r = e.useState, o = e.useEffect, s = e.useLayoutEffect, i = e.useDebugValue;
  function c(d, p) {
    var h = p(), f = r({ inst: { value: h, getSnapshot: p } }), m = f[0].inst, g = f[1];
    return s(
      function() {
        m.value = h, m.getSnapshot = p, a(m) && g({ inst: m });
      },
      [d, h, p]
    ), o(
      function() {
        return a(m) && g({ inst: m }), d(function() {
          a(m) && g({ inst: m });
        });
      },
      [d]
    ), i(h), h;
  }
  function a(d) {
    var p = d.getSnapshot;
    d = d.value;
    try {
      var h = p();
      return !n(d, h);
    } catch {
      return !0;
    }
  }
  function l(d, p) {
    return p();
  }
  var u = typeof window > "u" || typeof window.document > "u" || typeof window.document.createElement > "u" ? l : c;
  return Tr.useSyncExternalStore = e.useSyncExternalStore !== void 0 ? e.useSyncExternalStore : u, Tr;
}
var Rr = {};
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
function hp() {
  return Os || (Os = 1, process.env.NODE_ENV !== "production" && (function() {
    function e(h, f) {
      return h === f && (h !== 0 || 1 / h === 1 / f) || h !== h && f !== f;
    }
    function t(h, f) {
      u || o.startTransition === void 0 || (u = !0, console.error(
        "You are using an outdated, pre-release alpha of React 18 that does not support useSyncExternalStore. The use-sync-external-store shim will not work correctly. Upgrade to a newer pre-release."
      ));
      var m = f();
      if (!d) {
        var g = f();
        s(m, g) || (console.error(
          "The result of getSnapshot should be cached to avoid an infinite loop"
        ), d = !0);
      }
      g = i({
        inst: { value: m, getSnapshot: f }
      });
      var v = g[0].inst, w = g[1];
      return a(
        function() {
          v.value = m, v.getSnapshot = f, n(v) && w({ inst: v });
        },
        [h, m, f]
      ), c(
        function() {
          return n(v) && w({ inst: v }), h(function() {
            n(v) && w({ inst: v });
          });
        },
        [h]
      ), l(m), m;
    }
    function n(h) {
      var f = h.getSnapshot;
      h = h.value;
      try {
        var m = f();
        return !s(h, m);
      } catch {
        return !0;
      }
    }
    function r(h, f) {
      return f();
    }
    typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u" && typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart == "function" && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart(Error());
    var o = je, s = typeof Object.is == "function" ? Object.is : e, i = o.useState, c = o.useEffect, a = o.useLayoutEffect, l = o.useDebugValue, u = !1, d = !1, p = typeof window > "u" || typeof window.document > "u" || typeof window.document.createElement > "u" ? r : t;
    Rr.useSyncExternalStore = o.useSyncExternalStore !== void 0 ? o.useSyncExternalStore : p, typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u" && typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop == "function" && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop(Error());
  })()), Rr;
}
var _s;
function Fo() {
  return _s || (_s = 1, process.env.NODE_ENV === "production" ? On.exports = pp() : On.exports = hp()), On.exports;
}
var Lo = Fo(), _n = { exports: {} }, xr = {};
/**
 * @license React
 * use-sync-external-store-shim/with-selector.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var ks;
function mp() {
  if (ks) return xr;
  ks = 1;
  var e = je, t = Fo();
  function n(l, u) {
    return l === u && (l !== 0 || 1 / l === 1 / u) || l !== l && u !== u;
  }
  var r = typeof Object.is == "function" ? Object.is : n, o = t.useSyncExternalStore, s = e.useRef, i = e.useEffect, c = e.useMemo, a = e.useDebugValue;
  return xr.useSyncExternalStoreWithSelector = function(l, u, d, p, h) {
    var f = s(null);
    if (f.current === null) {
      var m = { hasValue: !1, value: null };
      f.current = m;
    } else m = f.current;
    f = c(
      function() {
        function v(S) {
          if (!w) {
            if (w = !0, E = S, S = p(S), h !== void 0 && m.hasValue) {
              var R = m.value;
              if (h(R, S))
                return C = R;
            }
            return C = S;
          }
          if (R = C, r(E, S)) return R;
          var x = p(S);
          return h !== void 0 && h(R, x) ? (E = S, R) : (E = S, C = x);
        }
        var w = !1, E, C, T = d === void 0 ? null : d;
        return [
          function() {
            return v(u());
          },
          T === null ? void 0 : function() {
            return v(T());
          }
        ];
      },
      [u, d, p, h]
    );
    var g = o(l, f[0], f[1]);
    return i(
      function() {
        m.hasValue = !0, m.value = g;
      },
      [g]
    ), a(g), g;
  }, xr;
}
var Ir = {};
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
function gp() {
  return As || (As = 1, process.env.NODE_ENV !== "production" && (function() {
    function e(l, u) {
      return l === u && (l !== 0 || 1 / l === 1 / u) || l !== l && u !== u;
    }
    typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u" && typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart == "function" && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart(Error());
    var t = je, n = Fo(), r = typeof Object.is == "function" ? Object.is : e, o = n.useSyncExternalStore, s = t.useRef, i = t.useEffect, c = t.useMemo, a = t.useDebugValue;
    Ir.useSyncExternalStoreWithSelector = function(l, u, d, p, h) {
      var f = s(null);
      if (f.current === null) {
        var m = { hasValue: !1, value: null };
        f.current = m;
      } else m = f.current;
      f = c(
        function() {
          function v(S) {
            if (!w) {
              if (w = !0, E = S, S = p(S), h !== void 0 && m.hasValue) {
                var R = m.value;
                if (h(R, S))
                  return C = R;
              }
              return C = S;
            }
            if (R = C, r(E, S))
              return R;
            var x = p(S);
            return h !== void 0 && h(R, x) ? (E = S, R) : (E = S, C = x);
          }
          var w = !1, E, C, T = d === void 0 ? null : d;
          return [
            function() {
              return v(u());
            },
            T === null ? void 0 : function() {
              return v(T());
            }
          ];
        },
        [u, d, p, h]
      );
      var g = o(l, f[0], f[1]);
      return i(
        function() {
          m.hasValue = !0, m.value = g;
        },
        [g]
      ), a(g), g;
    }, typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u" && typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop == "function" && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop(Error());
  })()), Ir;
}
var Ns;
function bp() {
  return Ns || (Ns = 1, process.env.NODE_ENV === "production" ? _n.exports = mp() : _n.exports = gp()), _n.exports;
}
var vp = bp();
const yp = mi(19), wp = yp ? Ep : Sp;
function yc(e, t, n, r, o) {
  return wp(e, t, n, r, o);
}
function Cp(e, t, n, r, o) {
  const s = y.useCallback(() => t(e.getSnapshot(), n, r, o), [e, t, n, r, o]);
  return Lo.useSyncExternalStore(e.subscribe, s, s);
}
Ad({
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
    }), Lo.useSyncExternalStore(e.subscribe, e.getSnapshot, e.getSnapshot));
  }
});
function Ep(e, t, n, r, o) {
  const s = kd();
  if (!s)
    return Cp(e, t, n, r, o);
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
function Sp(e, t, n, r, o) {
  return vp.useSyncExternalStoreWithSelector(e.subscribe, e.getSnapshot, e.getSnapshot, (s) => t(s, n, r, o));
}
class Tp {
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
    ce(this, "subscribe", (t) => (this.listeners.add(t), () => {
      this.listeners.delete(t);
    }));
    /**
     * Returns the current state of the store.
     */
    ce(this, "getSnapshot", () => this.state);
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
    return yc(this, t, n, r, o);
  }
}
class Bo extends Tp {
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
    he(() => {
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
    he(() => (r.state[t] !== n && r.set(t, n), () => {
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
    he(() => {
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
    if (he(() => {
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
    return y.useDebugValue(t), yc(this, this.selectors[t], n, r, o);
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
    const r = de(n ?? ao);
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
const Rp = {
  open: (e) => e.open,
  transitionStatus: (e) => e.transitionStatus,
  domReferenceElement: (e) => e.domReferenceElement,
  referenceElement: (e) => e.positionReference ?? e.referenceElement,
  floatingElement: (e) => e.floatingElement,
  floatingId: (e) => e.floatingId
};
class xp extends Bo {
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
      events: hc(),
      nested: o,
      triggerElements: i
    }, Rp);
    /**
     * Syncs the event used by hover logic to distinguish hover-open from click-like interaction.
     */
    ce(this, "syncOpenEvent", (n, r) => {
      (!n || !this.state.open || // Prevent a pending hover-open from overwriting a click-open event, while allowing
      // click events to upgrade a hover-open.
      r != null && zd(r)) && (this.context.dataRef.current.openEvent = n ? r : void 0);
    });
    /**
     * Runs the root-owned side effects for an open state change.
     */
    ce(this, "dispatchOpenChange", (n, r) => {
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
    ce(this, "setOpen", (n, r) => {
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
function Ip(e, t, n = !1) {
  return {
    open: !1,
    openProp: void 0,
    mounted: !1,
    transitionStatus: void 0,
    floatingRootContext: new xp({
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
    activeTriggerProps: Ue,
    inactiveTriggerProps: Ue,
    popupProps: Ue
  };
}
const tn = (e) => e.triggerIdProp ?? e.activeTriggerId, Xn = (e) => e.openProp ?? e.open, Ms = (e) => {
  var n;
  return (((n = e.popupElement) == null ? void 0 : n.id) ?? e.floatingId) || void 0;
};
function wc(e, t) {
  return t !== void 0 && Xn(e) && tn(e) === t;
}
function Pp(e, t) {
  return wc(e, t) ? !0 : t !== void 0 && Xn(e) && tn(e) == null && !e.openedWithoutTrigger && e.triggerCount === 1;
}
const Op = {
  open: Xn,
  mounted: (e) => e.mounted,
  // `open` is written synchronously on an open change; `mounted`/`transitionStatus` sync in a
  // layout effect. Match useTransitionStatus so a retained popup does not miss its starting phase.
  transitionStatus: (e) => Xn(e) && !e.mounted ? "starting" : e.transitionStatus,
  floatingRootContext: (e) => e.floatingRootContext,
  triggerCount: (e) => e.triggerCount,
  preventUnmountingOnClose: (e) => e.preventUnmountingOnClose,
  payload: (e) => e.payload,
  activeTriggerId: tn,
  activeTriggerElement: (e) => e.mounted ? e.activeTriggerElement : null,
  popupId: Ms,
  /**
   * Whether the trigger with the given ID was used to open the popup.
   */
  isTriggerActive: (e, t) => t !== void 0 && tn(e) === t,
  /**
   * Whether the popup is open and was activated by a trigger with the given ID.
   */
  isOpenedByTrigger: (e, t) => wc(e, t),
  /**
   * Whether the popup is mounted and was activated by a trigger with the given ID.
   */
  isMountedByTrigger: (e, t) => t !== void 0 && tn(e) === t && e.mounted,
  triggerProps: (e, t) => t ? e.activeTriggerProps : e.inactiveTriggerProps,
  /**
   * Popup id for the trigger that currently owns the open popup.
   */
  triggerPopupId: (e, t) => Pp(e, t) ? Ms(e) : void 0,
  popupProps: (e) => e.popupProps,
  popupElement: (e) => e.popupElement,
  positionerElement: (e) => e.positionerElement
};
function _p(e) {
  const t = y.useCallback((r) => e === void 0 ? ao : e.subscribeStore(r), [e]), n = y.useCallback(() => e === void 0 ? void 0 : e.store, [e]);
  return Lo.useSyncExternalStore(t, n, () => e == null ? void 0 : e.serverStore);
}
const Pr = tc && hn;
function kp(e, t = {}) {
  const {
    enabled: n = !0,
    delay: r
  } = t, {
    events: o,
    dataRef: s
  } = e.context, i = y.useRef(!1), c = y.useRef(null), a = y.useRef(!0), l = Zt();
  y.useEffect(() => {
    const d = e.select("domReferenceElement");
    if (!n)
      return;
    const p = Me(d);
    function h() {
      const g = e.select("domReferenceElement");
      !e.select("open") && Le(g) && g === Kr(rt(g)) && (i.current = !0, c.current = g);
    }
    function f() {
      a.current = !0;
    }
    function m() {
      a.current = !1;
    }
    return mt(Ee(p, "blur", h), Pr && Ee(p, "keydown", f, !0), Pr && Ee(p, "pointerdown", m, !0));
  }, [e, n]), y.useEffect(() => {
    if (!n)
      return;
    function d(p) {
      if (p.reason === rr || p.reason === uo) {
        const h = e.select("domReferenceElement");
        ge(h) && (c.current = h, i.current = !0);
      }
    }
    return o.on("openchange", d), () => {
      o.off("openchange", d);
    };
  }, [o, n, e]);
  const u = y.useMemo(() => {
    function d() {
      i.current = !1, c.current = null;
    }
    return {
      onMouseLeave() {
        d();
      },
      onFocus(p) {
        const h = p.currentTarget;
        if (i.current) {
          if (c.current === h)
            return;
          d();
        }
        const f = xt(p.nativeEvent);
        if (ge(f)) {
          if (Pr && !p.relatedTarget) {
            if (!a.current && !of(f))
              return;
          } else if (!cf(f))
            return;
        }
        const m = zn(p.relatedTarget, e.context.triggerElements), {
          nativeEvent: g,
          currentTarget: v
        } = p;
        if (e.select("open") && m || !r) {
          e.setOpen(!0, ke(Dn, g, v));
          return;
        }
        l.start(r, () => {
          i.current || e.setOpen(!0, ke(Dn, g, v));
        });
      },
      onBlur(p) {
        d();
        const h = p.relatedTarget, f = p.nativeEvent, m = ge(h) && h.hasAttribute(Ao("focus-guard")) && h.getAttribute("data-type") === "outside";
        l.start(0, () => {
          var E;
          const g = e.select("domReferenceElement"), v = Kr(rt(g));
          !h && v === g || _e((E = s.current.floatingContext) == null ? void 0 : E.refs.floating.current, v) || _e(g, v) || m || zn(h ?? v, e.context.triggerElements) || e.setOpen(!1, ke(Dn, f));
        });
      }
    };
  }, [s, r, e, l]);
  return y.useMemo(() => n ? {
    reference: u,
    trigger: u
  } : {}, [n, u]);
}
class Vo {
  constructor() {
    ce(this, "pointerType");
    ce(this, "interactedInside", !1);
    ce(this, "handler");
    ce(this, "blockMouseMove", !0);
    ce(this, "performedPointerEventsMutation", !1);
    ce(this, "pointerEventsScopeElement", null);
    ce(this, "pointerEventsReferenceElement", null);
    ce(this, "pointerEventsFloatingElement", null);
    ce(this, "restTimeoutPending", !1);
    ce(this, "openChangeTimeout", new bt());
    ce(this, "restTimeout", new bt());
    ce(this, "handleCloseOptions");
    ce(this, "dispose", () => {
      this.openChangeTimeout.clear(), this.restTimeout.clear();
    });
    ce(this, "disposeEffect", () => this.dispose);
  }
  static create() {
    return new Vo();
  }
}
const Qn = /* @__PURE__ */ new WeakMap();
function Jn(e) {
  var n, r, o;
  if (!e.performedPointerEventsMutation)
    return;
  const t = e.pointerEventsScopeElement;
  t && Qn.get(t) === e && ((n = e.pointerEventsScopeElement) == null || n.style.removeProperty("pointer-events"), (r = e.pointerEventsReferenceElement) == null || r.style.removeProperty("pointer-events"), (o = e.pointerEventsFloatingElement) == null || o.style.removeProperty("pointer-events"), Qn.delete(t)), e.performedPointerEventsMutation = !1, e.pointerEventsScopeElement = null, e.pointerEventsReferenceElement = null, e.pointerEventsFloatingElement = null;
}
function Cc(e, t) {
  const {
    scopeElement: n,
    referenceElement: r,
    floatingElement: o
  } = t, s = Qn.get(n);
  s && s !== e && Jn(s), Jn(e), e.performedPointerEventsMutation = !0, e.pointerEventsScopeElement = n, e.pointerEventsReferenceElement = r, e.pointerEventsFloatingElement = o, Qn.set(n, e), n.style.pointerEvents = "none", r.style.pointerEvents = "auto", o.style.pointerEvents = "auto";
}
function Ec(e) {
  const t = e.context.dataRef.current, n = ot(() => t.hoverInteractionState ?? Vo.create()).current;
  return t.hoverInteractionState || (t.hoverInteractionState = n), fo(t.hoverInteractionState.disposeEffect), t.hoverInteractionState;
}
function Ap(e, t = {}) {
  const {
    enabled: n = !0,
    closeDelay: r = 0,
    nodeId: o
  } = t, s = e.useState("open"), i = e.useState("floatingElement"), c = e.useState("domReferenceElement"), {
    dataRef: a
  } = e.context, l = mn(), u = ur(), d = Ec(e), p = Zt(), h = de(() => {
    var g;
    return oc((g = a.current.openEvent) == null ? void 0 : g.type, d.interactedInside);
  }), f = de(() => {
    var g;
    return lf((g = a.current.openEvent) == null ? void 0 : g.type);
  }), m = de(() => {
    Jn(d);
  });
  he(() => {
    s || (d.pointerType = void 0, d.restTimeoutPending = !1, d.interactedInside = !1, m());
  }, [s, d, m]), y.useEffect(() => m, [m]), he(() => {
    var g, v, w, E, C;
    if (n && s && (g = d.handleCloseOptions) != null && g.blockPointerEvents && f() && ge(c) && i) {
      const T = c, S = i, R = rt(i), x = (w = (v = l == null ? void 0 : l.nodesRef.current.find((_) => _.id === u)) == null ? void 0 : v.context) == null ? void 0 : w.elements.floating;
      x && (x.style.pointerEvents = "");
      const P = d.pointerEventsScopeElement !== S ? d.pointerEventsScopeElement : null, O = x !== S ? x : null, N = ((C = (E = d.handleCloseOptions) == null ? void 0 : E.getScope) == null ? void 0 : C.call(E)) ?? P ?? O ?? Yr(T, "[data-rootownerid]") ?? R.body;
      return Cc(d, {
        scopeElement: N,
        referenceElement: T,
        floatingElement: S
      }), () => {
        m();
      };
    }
  }, [n, s, c, i, d, f, l, u, m]), y.useEffect(() => {
    if (!n)
      return;
    function g() {
      return !!(l && u && Wt(l.nodesRef.current, u).length > 0);
    }
    function v(R) {
      const x = Xr(r, "close", d.pointerType), P = () => {
        e.setOpen(!1, ke(et, R)), l == null || l.events.emit("floating.closed", R);
      };
      x ? d.openChangeTimeout.start(x, P) : (d.openChangeTimeout.clear(), P());
    }
    function w(R) {
      const x = xt(R);
      if (!sf(x)) {
        d.interactedInside = !1;
        return;
      }
      d.interactedInside = Yr(x, "[aria-haspopup]") != null;
    }
    function E() {
      d.openChangeTimeout.clear(), p.clear(), l == null || l.events.off("floating.closed", T), m();
    }
    function C(R) {
      var N;
      if (g() && l) {
        l.events.on("floating.closed", T);
        return;
      }
      if (zn(R.relatedTarget, e.context.triggerElements))
        return;
      const x = ((N = a.current.floatingContext) == null ? void 0 : N.nodeId) ?? o, P = R.relatedTarget;
      if (!(l && x && ge(P) && Wt(l.nodesRef.current, x, !1).some((_) => {
        var D;
        return _e((D = _.context) == null ? void 0 : D.elements.floating, P);
      }))) {
        if (d.handler) {
          d.handler(R);
          return;
        }
        m(), f() && !h() && v(R);
      }
    }
    function T(R) {
      !l || !u || g() || p.start(0, () => {
        l.events.off("floating.closed", T), e.setOpen(!1, ke(et, R)), l.events.emit("floating.closed", R);
      });
    }
    const S = i;
    return mt(S && Ee(S, "mouseenter", E), S && Ee(S, "mouseleave", C), S && Ee(S, "pointerdown", w, !0), () => {
      l == null || l.events.off("floating.closed", T);
    });
  }, [n, i, e, a, r, o, f, h, m, d, l, u, p]);
}
const Np = {
  current: null
};
function Mp(e, t = {}) {
  const {
    enabled: n = !0,
    delay: r = 0,
    handleClose: o = null,
    mouseOnly: s = !1,
    restMs: i = 0,
    move: c = !0,
    triggerElementRef: a = Np,
    externalTree: l,
    isActiveTrigger: u = !0,
    getHandleCloseContext: d,
    isClosing: p,
    shouldOpen: h,
    guardStaleOpen: f = !1
  } = t, {
    dataRef: m,
    events: g
  } = e.context, v = mn(l), w = Ec(e), E = y.useRef(!1), C = tt(o), T = tt(r), S = tt(i), R = tt(n), x = tt(h), P = tt(p), O = de(() => {
    var I;
    return oc((I = m.current.openEvent) == null ? void 0 : I.type, w.interactedInside);
  }), N = de(() => {
    var I;
    return ((I = x.current) == null ? void 0 : I.call(x)) !== !1;
  }), _ = de((I, F, U) => {
    const k = e.context.triggerElements;
    if (k.hasElement(F))
      return !I || !_e(I, F);
    if (!ge(U))
      return !1;
    const M = U;
    return k.hasMatchingElement((z) => _e(z, M)) && (!I || !_e(I, M));
  }), D = de(() => {
    if (!w.handler)
      return;
    rt(e.select("domReferenceElement")).removeEventListener("mousemove", w.handler), w.handler = void 0;
  }), A = de(() => {
    Jn(w);
  });
  return u && (w.handleCloseOptions = o == null ? void 0 : o.__options), y.useEffect(() => D, [D]), y.useEffect(() => {
    if (!n)
      return;
    function I(F) {
      F.open ? E.current = !1 : (E.current = F.reason === et, D(), w.openChangeTimeout.clear(), w.restTimeout.clear(), w.blockMouseMove = !0, w.restTimeoutPending = !1);
    }
    return g.on("openchange", I), () => {
      g.off("openchange", I);
    };
  }, [n, g, w, D]), y.useEffect(() => {
    if (!n)
      return;
    function I(j, ae = !0) {
      const re = Xr(T.current, "close", w.pointerType);
      re ? w.openChangeTimeout.start(re, () => {
        e.setOpen(!1, ke(et, j)), v == null || v.events.emit("floating.closed", j);
      }) : ae && (w.openChangeTimeout.clear(), e.setOpen(!1, ke(et, j)), v == null || v.events.emit("floating.closed", j));
    }
    const F = a.current ?? (u ? e.select("domReferenceElement") : null);
    if (!ge(F))
      return;
    function U(j) {
      var ve;
      if (w.openChangeTimeout.clear(), w.blockMouseMove = !1, s && !Gr(w.pointerType))
        return;
      const ae = Es(S.current), re = Xr(T.current, "open", w.pointerType), B = xt(j), G = j.currentTarget ?? null, V = e.select("domReferenceElement");
      let H = G;
      if (ge(B) && !e.context.triggerElements.hasElement(B)) {
        for (const Oe of e.context.triggerElements.elements())
          if (_e(Oe, B)) {
            H = Oe;
            break;
          }
      }
      ge(G) && ge(V) && !e.context.triggerElements.hasElement(G) && _e(G, V) && (H = V);
      const Z = H == null ? !1 : _(V, H, B), oe = e.select("open"), ee = ((ve = P.current) == null ? void 0 : ve.call(P)) ?? e.select("transitionStatus") === "ending", te = !oe && ee && E.current, W = !Z && ge(H) && ge(V) && _e(V, H) && te, ne = ae > 0 && !re, se = Z && (oe || te) || W, be = !oe || Z;
      if (se) {
        N() && e.setOpen(!0, ke(et, j, H));
        return;
      }
      ne || (re ? w.openChangeTimeout.start(re, () => {
        be && N() && e.setOpen(!0, ke(et, j, H));
      }) : be && N() && e.setOpen(!0, ke(et, j, H)));
    }
    function k(j) {
      if (O()) {
        A();
        return;
      }
      D();
      const ae = e.select("domReferenceElement"), re = rt(ae);
      w.restTimeout.clear(), w.restTimeoutPending = !1;
      const B = m.current.floatingContext ?? (d == null ? void 0 : d());
      if (zn(j.relatedTarget, e.context.triggerElements))
        return;
      if (C.current && B) {
        e.select("open") || w.openChangeTimeout.clear();
        const V = a.current;
        w.handler = C.current({
          ...B,
          tree: v,
          x: j.clientX,
          y: j.clientY,
          onClose() {
            A(), D(), R.current && !O() && V === e.select("domReferenceElement") && I(j, !0);
          }
        }), re.addEventListener("mousemove", w.handler), w.handler(j);
        return;
      }
      (w.pointerType === "touch" ? !_e(e.select("floatingElement"), j.relatedTarget) : !0) && I(j);
    }
    function M(j) {
      _e(F, j.relatedTarget) || (w.openChangeTimeout.clear(), w.restTimeout.clear(), w.restTimeoutPending = !1);
    }
    const z = f ? Ee(F, "mouseout", M) : void 0;
    return c ? mt(Ee(F, "mousemove", U, {
      once: !0
    }), Ee(F, "mouseenter", U), Ee(F, "mouseleave", k), z) : mt(Ee(F, "mouseenter", U), Ee(F, "mouseleave", k), z);
  }, [D, A, m, T, e, n, C, w, u, _, O, s, c, S, a, v, R, d, P, N, f]), y.useMemo(() => {
    if (!n)
      return;
    function I(F) {
      w.pointerType = F.pointerType;
    }
    return {
      onPointerDown: I,
      onPointerEnter: I,
      onMouseMove(F) {
        var B, G, V;
        const {
          nativeEvent: U
        } = F, k = F.currentTarget, M = e.select("domReferenceElement"), z = e.select("open"), j = _(M, k, F.target);
        if (s && !Gr(w.pointerType))
          return;
        if (z && j && ((B = w.handleCloseOptions) != null && B.blockPointerEvents)) {
          const H = e.select("floatingElement");
          if (H) {
            const Z = ((V = (G = w.handleCloseOptions) == null ? void 0 : G.getScope) == null ? void 0 : V.call(G)) ?? k.ownerDocument.body;
            Cc(w, {
              scopeElement: Z,
              referenceElement: k,
              floatingElement: H
            });
          }
        }
        const ae = Es(S.current);
        if (z && !j || ae === 0 || !j && w.restTimeoutPending && F.movementX ** 2 + F.movementY ** 2 < 2)
          return;
        w.restTimeout.clear();
        function re() {
          if (w.restTimeoutPending = !1, O())
            return;
          const H = e.select("open");
          !w.blockMouseMove && (!H || j) && N() && e.setOpen(!0, ke(et, U, k));
        }
        w.pointerType === "touch" ? yt.flushSync(() => {
          re();
        }) : j && z ? re() : (w.restTimeoutPending = !0, w.restTimeout.start(ae, re));
      }
    };
  }, [n, w, O, _, s, e, S, N]);
}
const Ds = 0.1, Dp = Ds * Ds, Ce = 0.5;
function kn(e, t, n, r, o, s) {
  return r >= t != s >= t && e <= (o - n) * (t - r) / (s - r) + n;
}
function An(e, t, n, r, o, s, i, c, a, l) {
  let u = !1;
  return kn(e, t, n, r, o, s) && (u = !u), kn(e, t, o, s, i, c) && (u = !u), kn(e, t, i, c, a, l) && (u = !u), kn(e, t, a, l, n, r) && (u = !u), u;
}
function Fp(e, t, n) {
  return e >= n.x && e <= n.x + n.width && t >= n.y && t <= n.y + n.height;
}
function Nn(e, t, n, r, o, s) {
  const i = Math.min(n, o), c = Math.max(n, o), a = Math.min(r, s), l = Math.max(r, s);
  return e >= i && e <= c && t >= a && t <= l;
}
function Lp(e = {}) {
  const {
    blockPointerEvents: t = !1
  } = e, n = new bt(), r = ({
    x: o,
    y: s,
    placement: i,
    elements: c,
    onClose: a,
    nodeId: l,
    tree: u
  }) => {
    const d = i == null ? void 0 : i.split("-")[0];
    let p = !1, h = null, f = null, m = typeof performance < "u" ? performance.now() : 0;
    function g(w, E) {
      const C = performance.now(), T = C - m;
      if (h === null || f === null || T === 0)
        return h = w, f = E, m = C, !1;
      const S = w - h, R = E - f, x = S * S + R * R, P = T * T * Dp;
      return h = w, f = E, m = C, x < P;
    }
    function v() {
      n.clear(), a();
    }
    return function(E) {
      n.clear();
      const C = c.domReference, T = c.floating;
      if (!C || !T || d == null || o == null || s == null)
        return;
      const {
        clientX: S,
        clientY: R
      } = E, x = xt(E), P = E.type === "mouseleave", O = _e(T, x), N = _e(C, x);
      if (O && (p = !0, !P))
        return;
      if (N && (p = !1, !P)) {
        p = !0;
        return;
      }
      if (P && ge(E.relatedTarget) && _e(T, E.relatedTarget))
        return;
      function _() {
        return !!(u && Wt(u.nodesRef.current, l).length > 0);
      }
      function D() {
        _() || v();
      }
      if (_())
        return;
      const A = C.getBoundingClientRect(), I = T.getBoundingClientRect(), F = o > I.right - I.width / 2, U = s > I.bottom - I.height / 2, k = I.width > A.width, M = I.height > A.height, z = (k ? A : I).left, j = (k ? A : I).right, ae = (M ? A : I).top, re = (M ? A : I).bottom;
      if (d === "top" && s >= A.bottom - 1 || d === "bottom" && s <= A.top + 1 || d === "left" && o >= A.right - 1 || d === "right" && o <= A.left + 1) {
        D();
        return;
      }
      let B = !1;
      switch (d) {
        case "top":
          B = Nn(S, R, z, A.top + 1, j, I.bottom - 1);
          break;
        case "bottom":
          B = Nn(S, R, z, I.top + 1, j, A.bottom - 1);
          break;
        case "left":
          B = Nn(S, R, I.right - 1, re, A.left + 1, ae);
          break;
        case "right":
          B = Nn(S, R, A.right - 1, re, I.left + 1, ae);
          break;
      }
      if (B)
        return;
      if (p && !Fp(S, R, A)) {
        D();
        return;
      }
      if (!P && g(S, R)) {
        D();
        return;
      }
      let G = !1;
      switch (d) {
        case "top": {
          const V = k ? Ce / 2 : Ce * 4, H = k || F ? o + V : o - V, Z = k ? o - V : F ? o + V : o - V, oe = s + Ce + 1, ee = F || k ? I.bottom - Ce : I.top, te = F ? k ? I.bottom - Ce : I.top : I.bottom - Ce;
          G = An(S, R, H, oe, Z, oe, I.left, ee, I.right, te);
          break;
        }
        case "bottom": {
          const V = k ? Ce / 2 : Ce * 4, H = k || F ? o + V : o - V, Z = k ? o - V : F ? o + V : o - V, oe = s - Ce, ee = F || k ? I.top + Ce : I.bottom, te = F ? k ? I.top + Ce : I.bottom : I.top + Ce;
          G = An(S, R, H, oe, Z, oe, I.left, ee, I.right, te);
          break;
        }
        case "left": {
          const V = M ? Ce / 2 : Ce * 4, H = M || U ? s + V : s - V, Z = M ? s - V : U ? s + V : s - V, oe = o + Ce + 1, ee = U || M ? I.right - Ce : I.left, te = U ? M ? I.right - Ce : I.left : I.right - Ce;
          G = An(S, R, ee, I.top, te, I.bottom, oe, H, oe, Z);
          break;
        }
        case "right": {
          const V = M ? Ce / 2 : Ce * 4, H = M || U ? s + V : s - V, Z = M ? s - V : U ? s + V : s - V, oe = o - Ce, ee = U || M ? I.left + Ce : I.right, te = U ? M ? I.left + Ce : I.right : I.left + Ce;
          G = An(S, R, oe, H, oe, Z, ee, I.top, te, I.bottom);
          break;
        }
      }
      G ? p || n.start(40, D) : D();
    };
  };
  return r.__options = {
    ...e,
    blockPointerEvents: t
  }, r;
}
function Fs(e, t, n) {
  let {
    reference: r,
    floating: o
  } = e;
  const s = Je(t), i = ko(t), c = _o(i), a = Ge(t), l = s === "y", u = r.x + r.width / 2 - o.width / 2, d = r.y + r.height / 2 - o.height / 2, p = r[c] / 2 - o[c] / 2;
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
        y: d
      };
      break;
    case "left":
      h = {
        x: r.x - o.width,
        y: d
      };
      break;
    default:
      h = {
        x: r.x,
        y: r.y
      };
  }
  const f = it(t);
  return f && (h[i] += p * (f === "end" ? 1 : -1) * (n && l ? -1 : 1)), h;
}
async function Bp(e, t) {
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
    elementContext: d = "floating",
    altBoundary: p = !1,
    padding: h = 0
  } = vt(t, e), f = ic(h), g = c[p ? d === "floating" ? "reference" : "floating" : d], v = Kn(await s.getClippingRect({
    element: (n = await (s.isElement == null ? void 0 : s.isElement(g))) == null || n ? g : g.contextElement || await (s.getDocumentElement == null ? void 0 : s.getDocumentElement(c.floating)),
    boundary: l,
    rootBoundary: u,
    strategy: a
  })), w = d === "floating" ? {
    x: r,
    y: o,
    width: i.floating.width,
    height: i.floating.height
  } : i.reference, E = await (s.getOffsetParent == null ? void 0 : s.getOffsetParent(c.floating)), C = await (s.isElement == null ? void 0 : s.isElement(E)) && await (s.getScale == null ? void 0 : s.getScale(E)) || {
    x: 1,
    y: 1
  }, T = Kn(s.convertOffsetParentRelativeRectToViewportRelativeRect ? await s.convertOffsetParentRelativeRectToViewportRelativeRect({
    elements: c,
    rect: w,
    offsetParent: E,
    strategy: a
  }) : w);
  return {
    top: (v.top - T.top + f.top) / C.y,
    bottom: (T.bottom - v.bottom + f.bottom) / C.y,
    left: (v.left - T.left + f.left) / C.x,
    right: (T.right - v.right + f.right) / C.x
  };
}
const Vp = 50, Hp = async (e, t, n) => {
  const {
    placement: r = "bottom",
    strategy: o = "absolute",
    middleware: s = [],
    platform: i
  } = n, c = i.detectOverflow ? i : {
    ...i,
    detectOverflow: Bp
  }, a = await (i.isRTL == null ? void 0 : i.isRTL(t));
  let l = await i.getElementRects({
    reference: e,
    floating: t,
    strategy: o
  }), {
    x: u,
    y: d
  } = Fs(l, r, a), p = r, h = 0;
  const f = {};
  for (let m = 0; m < s.length; m++) {
    const g = s[m];
    if (!g)
      continue;
    const {
      name: v,
      fn: w
    } = g, {
      x: E,
      y: C,
      data: T,
      reset: S
    } = await w({
      x: u,
      y: d,
      initialPlacement: r,
      placement: p,
      strategy: o,
      middlewareData: f,
      rects: l,
      platform: c,
      elements: {
        reference: e,
        floating: t
      }
    });
    u = E ?? u, d = C ?? d, f[v] = {
      ...f[v],
      ...T
    }, S && h < Vp && (h++, typeof S == "object" && (S.placement && (p = S.placement), S.rects && (l = S.rects === !0 ? await i.getElementRects({
      reference: e,
      floating: t,
      strategy: o
    }) : S.rects), {
      x: u,
      y: d
    } = Fs(l, p, a)), m = -1);
  }
  return {
    x: u,
    y: d,
    placement: p,
    strategy: o,
    middlewareData: f
  };
}, $p = function(e) {
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
        crossAxis: d = !0,
        fallbackPlacements: p,
        fallbackStrategy: h = "bestFit",
        fallbackAxisSideDirection: f = "none",
        flipAlignment: m = !0,
        ...g
      } = vt(e, t);
      if ((n = s.arrow) != null && n.alignmentOffset)
        return {};
      const v = Ge(o), w = Je(c), E = Ge(c) === c, C = await (a.isRTL == null ? void 0 : a.isRTL(l.floating)), T = p || (E || !m ? [Gn(c)] : hf(c)), S = f !== "none";
      !p && S && T.push(...vf(c, m, f, C));
      const R = [c, ...T], x = await a.detectOverflow(t, g), P = [];
      let O = ((r = s.flip) == null ? void 0 : r.overflows) || [];
      if (u && P.push(x[v]), d) {
        const A = pf(o, i, C);
        P.push(x[A[0]], x[A[1]]);
      }
      if (O = [...O, {
        placement: o,
        overflows: P
      }], !P.every((A) => A <= 0)) {
        var N, _;
        const A = (((N = s.flip) == null ? void 0 : N.index) || 0) + 1, I = R[A];
        if (I && (!(d === "alignment" ? w !== Je(I) : !1) || // We leave the current main axis only if every placement on that axis
        // overflows the main axis.
        O.every((k) => Je(k.placement) === w ? k.overflows[0] > 0 : !0)))
          return {
            data: {
              index: A,
              overflows: O
            },
            reset: {
              placement: I
            }
          };
        let F = (_ = O.filter((U) => U.overflows[0] <= 0).sort((U, k) => U.overflows[1] - k.overflows[1])[0]) == null ? void 0 : _.placement;
        if (!F)
          switch (h) {
            case "bestFit": {
              var D;
              const U = (D = O.filter((k) => {
                if (S) {
                  const M = Je(k.placement);
                  return M === w || // Create a bias to the `y` side axis due to horizontal
                  // reading directions favoring greater width.
                  M === "y";
                }
                return !0;
              }).map((k) => [k.placement, k.overflows.filter((M) => M > 0).reduce((M, z) => M + z, 0)]).sort((k, M) => k[1] - M[1])[0]) == null ? void 0 : D[0];
              U && (F = U);
              break;
            }
            case "initialPlacement":
              F = c;
              break;
          }
        if (o !== F)
          return {
            reset: {
              placement: F
            }
          };
      }
      return {};
    }
  };
}, Sc = /* @__PURE__ */ new Set(["left", "top"]);
async function Wp(e, t) {
  const {
    placement: n,
    platform: r,
    elements: o
  } = e, s = await (r.isRTL == null ? void 0 : r.isRTL(o.floating)), i = Ge(n), c = it(n), a = Je(n) === "y", l = Sc.has(i) ? -1 : 1, u = s && a ? -1 : 1, d = vt(t, e);
  let {
    mainAxis: p,
    crossAxis: h,
    alignmentAxis: f
  } = typeof d == "number" ? {
    mainAxis: d,
    crossAxis: 0,
    alignmentAxis: null
  } : {
    mainAxis: d.mainAxis || 0,
    crossAxis: d.crossAxis || 0,
    alignmentAxis: d.alignmentAxis
  };
  return c && typeof f == "number" && (h = c === "end" ? f * -1 : f), a ? {
    x: h * u,
    y: p * l
  } : {
    x: p * l,
    y: h * u
  };
}
const Up = function(e) {
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
      } = t, a = await Wp(t, e);
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
}, qp = function(e) {
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
          fn: (w) => {
            let {
              x: E,
              y: C
            } = w;
            return {
              x: E,
              y: C
            };
          }
        },
        ...l
      } = vt(e, t), u = {
        x: n,
        y: r
      }, d = await s.detectOverflow(t, l), p = Je(o), h = Oo(p);
      let f = u[h], m = u[p];
      const g = (w, E) => sc(E + d[w === "y" ? "top" : "left"], E, E - d[w === "y" ? "bottom" : "right"]);
      i && (f = g(h, f)), c && (m = g(p, m));
      const v = a.fn({
        ...t,
        [h]: f,
        [p]: m
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
}, zp = function(e) {
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
        crossAxis: d = !0
      } = vt(e, t), p = {
        x: o,
        y: s
      }, h = Je(i), f = Oo(h);
      let m = p[f], g = p[h];
      const v = vt(l, t), w = typeof v == "number" ? {
        mainAxis: v,
        crossAxis: 0
      } : {
        mainAxis: (n = v.mainAxis) != null ? n : 0,
        crossAxis: (r = v.crossAxis) != null ? r : 0
      };
      if (u) {
        const T = f === "y" ? "height" : "width", S = c.reference[f] - c.floating[T] + w.mainAxis, R = c.reference[f] + c.reference[T] - w.mainAxis;
        m < S ? m = S : m > R && (m = R);
      }
      if (d) {
        var E, C;
        const T = f === "y" ? "width" : "height", S = Sc.has(Ge(i)), R = c.reference[h] - c.floating[T] + (S && ((E = a.offset) == null ? void 0 : E[h]) || 0) + (S ? 0 : w.crossAxis), x = c.reference[h] + c.reference[T] + (S ? 0 : ((C = a.offset) == null ? void 0 : C[h]) || 0) - (S ? w.crossAxis : 0);
        g < R ? g = R : g > x && (g = x);
      }
      return {
        [f]: m,
        [h]: g
      };
    }
  };
}, jp = function(e) {
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
      } = vt(e, t), a = await o.detectOverflow(t, c), l = Ge(n), u = it(n), d = Je(n) === "y", {
        width: p,
        height: h
      } = r.floating;
      let f, m;
      l === "top" || l === "bottom" ? (f = l, m = u === (await (o.isRTL == null ? void 0 : o.isRTL(s.floating)) ? "start" : "end") ? "left" : "right") : (m = l, f = u === "end" ? "top" : "bottom");
      const g = h - a.top - a.bottom, v = p - a.left - a.right, w = $t(h - a[f], g), E = $t(p - a[m], v), C = t.middlewareData.shift, T = !C;
      let S = w, R = E;
      C != null && C.enabled.x && (R = v), C != null && C.enabled.y && (S = g), T && !u && (d ? R = p - 2 * ut(a.left, a.right) : S = h - 2 * ut(a.top, a.bottom)), await i({
        ...t,
        availableWidth: R,
        availableHeight: S
      });
      const x = await o.getDimensions(s.floating);
      return p !== x.width || h !== x.height ? {
        reset: {
          rects: !0
        }
      } : {};
    }
  };
};
function Tc(e) {
  const t = Ye(e);
  let n = parseFloat(t.width) || 0, r = parseFloat(t.height) || 0;
  const o = Le(e), s = o ? e.offsetWidth : n, i = o ? e.offsetHeight : r, c = jn(n) !== s || jn(r) !== i;
  return c && (n = s, r = i), {
    width: n,
    height: r,
    $: c
  };
}
function Ho(e) {
  return ge(e) ? e : e.contextElement;
}
function Ft(e) {
  const t = Ho(e);
  if (!Le(t))
    return dt(1);
  const n = t.getBoundingClientRect(), {
    width: r,
    height: o,
    $: s
  } = Tc(t);
  let i = (s ? jn(n.width) : n.width) / r, c = (s ? jn(n.height) : n.height) / o;
  return (!i || !Number.isFinite(i)) && (i = 1), (!c || !Number.isFinite(c)) && (c = 1), {
    x: i,
    y: c
  };
}
const Gp = /* @__PURE__ */ dt(0);
function Rc(e) {
  const t = Me(e);
  return !vo() || !t.visualViewport ? Gp : {
    x: t.visualViewport.offsetLeft,
    y: t.visualViewport.offsetTop
  };
}
function Kp(e, t, n) {
  return t === void 0 && (t = !1), !!n && t && n === Me(e);
}
function Ot(e, t, n, r) {
  t === void 0 && (t = !1), n === void 0 && (n = !1);
  const o = e.getBoundingClientRect(), s = Ho(e);
  let i = dt(1);
  t && (r ? ge(r) && (i = Ft(r)) : i = Ft(e));
  const c = Kp(s, n, r) ? Rc(s) : dt(0);
  let a = (o.left + c.x) / i.x, l = (o.top + c.y) / i.y, u = o.width / i.x, d = o.height / i.y;
  if (s && r) {
    const p = Me(s), h = ge(r) ? Me(r) : r;
    let f = p, m = Br(f);
    for (; m && h !== f; ) {
      const g = Ft(m), v = m.getBoundingClientRect(), w = Ye(m), E = v.left + (m.clientLeft + parseFloat(w.paddingLeft)) * g.x, C = v.top + (m.clientTop + parseFloat(w.paddingTop)) * g.y;
      a *= g.x, l *= g.y, u *= g.x, d *= g.y, a += E, l += C, f = Me(m), m = Br(f);
    }
  }
  return Kn({
    width: u,
    height: d,
    x: a,
    y: l
  });
}
function dr(e, t) {
  const n = cr(e).scrollLeft;
  return t ? t.left + n : Ot(ft(e)).left + n;
}
function xc(e, t) {
  const n = e.getBoundingClientRect(), r = n.left + t.scrollLeft - dr(e, n), o = n.top + t.scrollTop;
  return {
    x: r,
    y: o
  };
}
function Yp(e) {
  let {
    elements: t,
    rect: n,
    offsetParent: r,
    strategy: o
  } = e;
  const s = o === "fixed", i = ft(r), c = t ? ir(t.floating) : !1;
  if (r === i || c && s)
    return n;
  let a = {
    scrollLeft: 0,
    scrollTop: 0
  }, l = dt(1);
  const u = dt(0), d = Le(r);
  if ((d || !s) && ((qe(r) !== "body" || sr(i)) && (a = cr(r)), d)) {
    const h = Ot(r);
    l = Ft(r), u.x = h.x + r.clientLeft, u.y = h.y + r.clientTop;
  }
  const p = i && !d && !s ? xc(i, a) : dt(0);
  return {
    width: n.width * l.x,
    height: n.height * l.y,
    x: n.x * l.x - a.scrollLeft * l.x + u.x + p.x,
    y: n.y * l.y - a.scrollTop * l.y + u.y + p.y
  };
}
function Xp(e) {
  return e.getClientRects ? Array.from(e.getClientRects()) : [];
}
function Qp(e) {
  const t = cr(e), n = e.ownerDocument.body, r = ut(e.scrollWidth, e.clientWidth, n.scrollWidth, n.clientWidth), o = ut(e.scrollHeight, e.clientHeight, n.scrollHeight, n.clientHeight);
  let s = -t.scrollLeft + dr(e);
  const i = -t.scrollTop;
  return Ye(n).direction === "rtl" && (s += ut(e.clientWidth, n.clientWidth) - r), {
    width: r,
    height: o,
    x: s,
    y: i
  };
}
const Jp = 25;
function Zp(e, t, n) {
  n === void 0 && (n = "viewport");
  const r = n === "layoutViewport", o = Me(e), s = ft(e), i = o.visualViewport;
  let c = s.clientWidth, a = s.clientHeight, l = 0, u = 0;
  if (i) {
    const p = !vo() || t === "fixed";
    r ? p || (l = -i.offsetLeft, u = -i.offsetTop) : (c = i.width, a = i.height, p && (l = i.offsetLeft, u = i.offsetTop));
  }
  if (dr(s) <= 0) {
    const p = s.ownerDocument, h = p.body, f = getComputedStyle(h), m = p.compatMode === "CSS1Compat" && parseFloat(f.marginLeft) + parseFloat(f.marginRight) || 0, g = Math.abs(s.clientWidth - h.clientWidth - m), v = getComputedStyle(s).scrollbarGutter === "stable both-edges" ? g / 2 : g;
    v <= Jp && (c -= v);
  }
  return {
    width: c,
    height: a,
    x: l,
    y: u
  };
}
function eh(e, t) {
  const n = Ot(e, !0, t === "fixed"), r = n.top + e.clientTop, o = n.left + e.clientLeft, s = Ft(e), i = e.clientWidth * s.x, c = e.clientHeight * s.y, a = o * s.x, l = r * s.y;
  return {
    width: i,
    height: c,
    x: a,
    y: l
  };
}
function Ls(e, t, n) {
  let r;
  if (t === "viewport" || t === "layoutViewport")
    r = Zp(e, n, t);
  else if (t === "document")
    r = Qp(ft(e));
  else if (ge(t))
    r = eh(t, n);
  else {
    const o = Rc(e);
    r = {
      x: t.x - o.x,
      y: t.y - o.y,
      width: t.width,
      height: t.height
    };
  }
  return Kn(r);
}
function th(e, t) {
  const n = t.get(e);
  if (n)
    return n;
  let r = rn(e, [], !1).filter((c) => ge(c) && qe(c) !== "body"), o = null;
  const s = Ye(e).position === "fixed";
  let i = s ? gt(e) : e;
  for (; ge(i) && !ht(i); ) {
    const c = Ye(i), a = bo(i), l = o ? o.position : s ? "fixed" : "";
    !a && (l === "fixed" || l === "absolute" && c.position === "static") ? r = r.filter((d) => d !== i) : o = c, i = gt(i);
  }
  return t.set(e, r), r;
}
function nh(e) {
  let {
    element: t,
    boundary: n,
    rootBoundary: r,
    strategy: o
  } = e;
  const i = [...n === "clippingAncestors" ? ir(t) ? [] : th(t, this._c) : [].concat(n), r], c = Ls(t, i[0], o);
  let a = c.top, l = c.right, u = c.bottom, d = c.left;
  for (let p = 1; p < i.length; p++) {
    const h = Ls(t, i[p], o);
    a = ut(h.top, a), l = $t(h.right, l), u = $t(h.bottom, u), d = ut(h.left, d);
  }
  return {
    width: l - d,
    height: u - a,
    x: d,
    y: a
  };
}
function rh(e) {
  const {
    width: t,
    height: n
  } = Tc(e);
  return {
    width: t,
    height: n
  };
}
function oh(e, t, n) {
  const r = Le(t), o = ft(t), s = n === "fixed", i = Ot(e, !0, s, t);
  let c = {
    scrollLeft: 0,
    scrollTop: 0
  };
  const a = dt(0);
  if ((r || !s) && ((qe(t) !== "body" || sr(o)) && (c = cr(t)), r)) {
    const p = Ot(t, !0, s, t);
    a.x = p.x + t.clientLeft, a.y = p.y + t.clientTop;
  }
  !r && o && (a.x = dr(o));
  const l = o && !r && !s ? xc(o, c) : dt(0), u = i.left + c.scrollLeft - a.x - l.x, d = i.top + c.scrollTop - a.y - l.y;
  return {
    x: u,
    y: d,
    width: i.width,
    height: i.height
  };
}
function Or(e) {
  return Ye(e).position === "static";
}
function Bs(e, t) {
  if (!Le(e) || Ye(e).position === "fixed")
    return null;
  if (t)
    return t(e);
  let n = e.offsetParent;
  return ft(e) === n && (n = n.ownerDocument.body), n;
}
function Ic(e, t) {
  const n = Me(e);
  if (ir(e))
    return n;
  if (!Le(e)) {
    let o = gt(e);
    for (; o && !ht(o); ) {
      if (ge(o) && !Or(o))
        return o;
      o = gt(o);
    }
    return n;
  }
  let r = Bs(e, t);
  for (; r && kl(r) && Or(r); )
    r = Bs(r, t);
  return r && ht(r) && Or(r) && !bo(r) ? n : r || Ml(e) || n;
}
const sh = async function(e) {
  const t = this.getOffsetParent || Ic, n = this.getDimensions, r = await n(e.floating);
  return {
    reference: oh(e.reference, await t(e.floating), e.strategy),
    floating: {
      x: 0,
      y: 0,
      width: r.width,
      height: r.height
    }
  };
};
function ih(e) {
  return Ye(e).direction === "rtl";
}
const ch = {
  convertOffsetParentRelativeRectToViewportRelativeRect: Yp,
  getDocumentElement: ft,
  getClippingRect: nh,
  getOffsetParent: Ic,
  getElementRects: sh,
  getClientRects: Xp,
  getDimensions: rh,
  getScale: Ft,
  isElement: ge,
  isRTL: ih
};
function Pc(e, t) {
  return e.x === t.x && e.y === t.y && e.width === t.width && e.height === t.height;
}
function ah(e, t, n) {
  let r = null, o;
  const s = ft(e);
  function i() {
    var u;
    clearTimeout(o), (u = r) == null || u.disconnect(), r = null;
  }
  function c(u, d) {
    u === void 0 && (u = !1), d === void 0 && (d = 1), i();
    const p = e.getBoundingClientRect(), {
      left: h,
      top: f,
      width: m,
      height: g
    } = p;
    if (u || t(), !m || !g)
      return;
    const v = Pn(f), w = Pn(s.clientWidth - (h + m)), E = Pn(s.clientHeight - (f + g)), C = Pn(h), S = {
      rootMargin: -v + "px " + -w + "px " + -E + "px " + -C + "px",
      threshold: ut(0, $t(1, d)) || 1
    };
    let R = !0;
    function x(P) {
      const O = P[0].intersectionRatio;
      if (!Pc(p, e.getBoundingClientRect()))
        return c();
      if (O !== d) {
        if (!R)
          return c();
        O ? c(!1, O) : o = setTimeout(() => {
          c(!1, 1e-7);
        }, 1e3);
      }
      R = !1;
    }
    try {
      r = new IntersectionObserver(x, {
        ...S,
        // Handle <iframe>s
        root: s.ownerDocument
      });
    } catch {
      r = new IntersectionObserver(x, S);
    }
    r.observe(e);
  }
  const a = Me(e), l = () => c(n);
  return a.addEventListener("resize", l), c(!0), () => {
    a.removeEventListener("resize", l), i();
  };
}
function Vs(e, t, n, r) {
  r === void 0 && (r = {});
  const {
    ancestorScroll: o = !0,
    ancestorResize: s = !0,
    elementResize: i = typeof ResizeObserver == "function",
    layoutShift: c = typeof IntersectionObserver == "function",
    animationFrame: a = !1
  } = r, l = Ho(e), u = o || s ? [...l ? rn(l) : [], ...t ? rn(t) : []] : [];
  u.forEach((v) => {
    o && v.addEventListener("scroll", n), s && v.addEventListener("resize", n);
  });
  const d = l && c ? ah(l, n, s) : null;
  let p = -1, h = null;
  i && (h = new ResizeObserver((v) => {
    let [w] = v;
    w && w.target === l && h && t && (h.unobserve(t), cancelAnimationFrame(p), p = requestAnimationFrame(() => {
      var E;
      (E = h) == null || E.observe(t);
    })), n();
  }), l && !a && h.observe(l), t && h.observe(t));
  let f, m = a ? Ot(e) : null;
  a && g();
  function g() {
    const v = Ot(e);
    m && !Pc(m, v) && n(), m = v, f = requestAnimationFrame(g);
  }
  return n(), () => {
    var v;
    u.forEach((w) => {
      o && w.removeEventListener("scroll", n), s && w.removeEventListener("resize", n);
    }), d == null || d(), (v = h) == null || v.disconnect(), h = null, a && cancelAnimationFrame(f);
  };
}
const lh = Up, uh = qp, dh = $p, fh = jp, ph = zp, hh = (e, t, n) => {
  const r = /* @__PURE__ */ new Map(), o = n ?? {}, s = {
    ...ch,
    ...o.platform,
    _c: r
  };
  return Hp(e, t, {
    ...o,
    platform: s
  });
};
var mh = typeof document < "u", gh = function() {
}, Bn = mh ? na : gh;
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
function Oc(e) {
  return typeof window > "u" ? 1 : (e.ownerDocument.defaultView || window).devicePixelRatio || 1;
}
function Hs(e, t) {
  const n = Oc(e);
  return Math.round(t * n) / n;
}
function _r(e) {
  const t = y.useRef(e);
  return Bn(() => {
    t.current = e;
  }), t;
}
function bh(e) {
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
  } = e, [u, d] = y.useState({
    x: 0,
    y: 0,
    strategy: n,
    placement: t,
    middlewareData: {},
    isPositioned: !1
  }), [p, h] = y.useState(r);
  Zn(p, r) || h(r);
  const [f, m] = y.useState(null), [g, v] = y.useState(null), w = y.useCallback((k) => {
    k !== S.current && (S.current = k, m(k));
  }, []), E = y.useCallback((k) => {
    k !== R.current && (R.current = k, v(k));
  }, []), C = s || f, T = i || g, S = y.useRef(null), R = y.useRef(null), x = y.useRef(u), P = a != null, O = _r(a), N = _r(o), _ = _r(l), D = y.useCallback(() => {
    if (!S.current || !R.current)
      return;
    const k = {
      placement: t,
      strategy: n,
      middleware: p
    };
    N.current && (k.platform = N.current), hh(S.current, R.current, k).then((M) => {
      const z = {
        ...M,
        // The floating element's position may be recomputed while it's closed
        // but still mounted (such as when transitioning out). To ensure
        // `isPositioned` will be `false` initially on the next open, avoid
        // setting it to `true` when `open === false` (must be specified).
        isPositioned: _.current !== !1
      };
      A.current && !Zn(x.current, z) && (x.current = z, yt.flushSync(() => {
        d(z);
      }));
    });
  }, [p, t, n, N, _]);
  Bn(() => {
    l === !1 && x.current.isPositioned && (x.current.isPositioned = !1, d((k) => ({
      ...k,
      isPositioned: !1
    })));
  }, [l]);
  const A = y.useRef(!1);
  Bn(() => (A.current = !0, () => {
    A.current = !1;
  }), []), Bn(() => {
    if (C && (S.current = C), T && (R.current = T), C && T) {
      if (O.current)
        return O.current(C, T, D);
      D();
    }
  }, [C, T, D, O, P]);
  const I = y.useMemo(() => ({
    reference: S,
    floating: R,
    setReference: w,
    setFloating: E
  }), [w, E]), F = y.useMemo(() => ({
    reference: C,
    floating: T
  }), [C, T]), U = y.useMemo(() => {
    const k = {
      position: n,
      left: 0,
      top: 0
    };
    if (!F.floating)
      return k;
    const M = Hs(F.floating, u.x), z = Hs(F.floating, u.y);
    return c ? {
      ...k,
      transform: "translate(" + M + "px, " + z + "px)",
      ...Oc(F.floating) >= 1.5 && {
        willChange: "transform"
      }
    } : {
      position: n,
      left: M,
      top: z
    };
  }, [n, c, F.floating, u.x, u.y]);
  return y.useMemo(() => ({
    ...u,
    update: D,
    refs: I,
    elements: F,
    floatingStyles: U
  }), [u, D, I, F, U]);
}
const vh = (e, t) => {
  const n = lh(e);
  return {
    name: n.name,
    fn: n.fn,
    options: [e, t]
  };
}, yh = (e, t) => {
  const n = uh(e);
  return {
    name: n.name,
    fn: n.fn,
    options: [e, t]
  };
}, wh = (e, t) => ({
  fn: ph(e).fn,
  options: [e, t]
}), Ch = (e, t) => {
  const n = dh(e);
  return {
    name: n.name,
    fn: n.fn,
    options: [e, t]
  };
}, Eh = (e, t) => {
  const n = fh(e);
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
    throw new Error(process.env.NODE_ENV !== "production" ? "Base UI: PreviewCardRootContext is missing. PreviewCard parts must be placed within <PreviewCard.Root>." : _t(50));
  return t;
}
class Sh extends Bo {
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
const Th = 600, _c = 300, kc = {
  ...Op,
  instantType: (e) => e.instantType,
  adaptiveOrigin: (e) => e.adaptiveOrigin,
  closeDelay: (e) => e.closeDelay
};
class Rh extends Bo {
  constructor(n, r, o) {
    const s = new vc();
    super(Ac(n, s, r, o), Nc(s), kc);
    ce(this, "setOpen", (n, r) => {
      const {
        inlineRectCoordsRef: o
      } = this.context;
      cp(this, n, r, {
        onBeforeDispatch() {
          var i;
          const s = r.event;
          n && r.reason === et && r.trigger && "clientX" in s && "clientY" in s && ((i = o.current) == null ? void 0 : i.element) !== r.trigger && bc(o, r.trigger, s.clientX, s.clientY);
        }
      });
    });
  }
}
function xh() {
  const e = new vc();
  return new Sh(Object.freeze(Ac(void 0, e)), Object.freeze(Nc(e)), kc);
}
function Ac(e, t, n, r = !1) {
  return {
    ...Ip(t, n, r),
    instantType: void 0,
    adaptiveOrigin: void 0,
    closeDelay: _c,
    ...e
  };
}
function Nc(e) {
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
  } = e, u = np((v, w) => new Rh({
    open: n,
    openProp: t,
    activeTriggerId: a,
    triggerIdProp: c
  }, v, w));
  u.useControlledProp("openProp", t), u.useControlledProp("triggerIdProp", c), u.useContextCallback("onOpenChange", r), u.useContextCallback("onOpenChangeComplete", o);
  const d = u.useState("open"), p = u.useState("activeTriggerId"), h = u.useState("mounted"), f = u.useState("payload");
  lp(u, {
    closeOnActiveTriggerUnmount: !0
  });
  const {
    forceUnmount: m
  } = up(d, u, () => {
    u.context.inlineRectCoordsRef.current = void 0;
  });
  he(() => {
    d && p == null && u.set("payload", void 0);
  }, [u, p, d]), y.useImperativeHandle(s, () => ({
    unmount: m,
    close: () => u.setOpen(!1, ke(Lr))
  }), [m, u]);
  const g = d || h || i != null;
  return /* @__PURE__ */ $($o.Provider, {
    value: u,
    children: [i && /* @__PURE__ */ b(rp, {
      handle: i,
      store: u
    }), g && /* @__PURE__ */ b(Ih, {
      store: u
    }), typeof l == "function" ? l({
      payload: f
    }) : l]
  });
}
function Ih({
  store: e
}) {
  const t = e.useState("floatingRootContext"), n = zf(t);
  return dp(e, {
    activeTriggerProps: n.reference,
    inactiveTriggerProps: n.trigger,
    popupProps: n.floating
  }), null;
}
const Mc = Zi(function(t) {
  return gn(!0) ? /* @__PURE__ */ b($s, {
    ...t
  }) : /* @__PURE__ */ b(Wf, {
    children: /* @__PURE__ */ b($s, {
      ...t
    })
  });
});
process.env.NODE_ENV !== "production" && (Mc.displayName = "PreviewCardRoot");
const Wo = /* @__PURE__ */ y.createContext(void 0);
process.env.NODE_ENV !== "production" && (Wo.displayName = "PreviewCardPortalContext");
function Ph() {
  const e = y.useContext(Wo);
  if (e === void 0)
    throw new Error(process.env.NODE_ENV !== "production" ? "Base UI: <PreviewCard.Portal> is missing." : _t(48));
  return e;
}
const Dc = /* @__PURE__ */ y.forwardRef(function(t, n) {
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
  } = pc({
    container: o,
    ref: n,
    componentProps: t,
    elementProps: a
  });
  return !u && !l ? null : /* @__PURE__ */ $(y.Fragment, {
    children: [u, l && /* @__PURE__ */ yt.createPortal(r, l)]
  });
});
process.env.NODE_ENV !== "production" && (Dc.displayName = "FloatingPortalLite");
const Fc = /* @__PURE__ */ y.forwardRef(function(t, n) {
  const {
    keepMounted: r = !1,
    ...o
  } = t;
  return gn().useState("mounted") || r ? /* @__PURE__ */ b(Wo.Provider, {
    value: r,
    children: /* @__PURE__ */ b(Dc, {
      ref: n,
      ...o
    })
  }) : null;
});
process.env.NODE_ENV !== "production" && (Fc.displayName = "PreviewCardPortal");
const Lc = Nd(function(t, n) {
  const {
    render: r,
    className: o,
    delay: s,
    closeDelay: i,
    id: c,
    payload: a,
    handle: l,
    style: u,
    ...d
  } = t, p = gn(!0), f = _p(l) ?? p;
  if (!f)
    throw new Error(process.env.NODE_ENV !== "production" ? "Base UI: <PreviewCard.Trigger> must be either used within a <PreviewCard.Root> component or provided with a handle." : _t(89));
  const m = Ri(c), g = f.useState("isTriggerActive", m), v = f.useState("isOpenedByTrigger", m), w = f.useState("floatingRootContext"), E = f.context.inlineRectCoordsRef, C = y.useRef(null), T = s ?? Th, S = i ?? _c, {
    registerTrigger: R,
    isMountedByThisTrigger: x
  } = ap(m, C, f, {
    payload: a,
    closeDelay: S
  }), P = Mp(w, {
    mouseOnly: !0,
    move: !1,
    handleClose: Lp(),
    delay: () => ({
      open: T,
      close: S
    }),
    triggerElementRef: C,
    isActiveTrigger: g,
    isClosing: () => f.select("transitionStatus") === "ending"
  }), O = kp(w, {
    delay: T
  }), N = {
    open: v
  }, _ = f.useState("triggerProps", x), D = Xf(E, v);
  return wt("a", t, {
    state: N,
    ref: [n, R, C],
    props: [P, O.reference, _, D, {
      id: m
    }, d],
    stateAttributesMapping: tf
  });
});
process.env.NODE_ENV !== "production" && (Lc.displayName = "PreviewCardTrigger");
const Uo = /* @__PURE__ */ y.createContext(void 0);
process.env.NODE_ENV !== "production" && (Uo.displayName = "PreviewCardPositionerContext");
function Oh() {
  const e = y.useContext(Uo);
  if (e === void 0)
    throw new Error(process.env.NODE_ENV !== "production" ? "Base UI: PreviewCardPositionerContext is missing. PreviewCardPositioner parts must be placed within <PreviewCard.Positioner>." : _t(49));
  return e;
}
function _h(e) {
  const {
    nodeId: t,
    externalTree: n,
    rootContext: r
  } = e, o = r.useState("referenceElement"), s = r.useState("floatingElement"), i = r.useState("domReferenceElement"), c = r.useState("open"), a = r.useState("floatingId"), [l, u] = y.useState(null), d = y.useRef(null), p = mn(n), h = y.useMemo(() => ({
    reference: o,
    floating: s,
    domReference: i
  }), [o, s, i]), f = bh({
    ...e,
    elements: {
      ...h,
      ...l && {
        reference: l
      }
    }
  }), m = y.useCallback((E) => {
    const C = ge(E) ? {
      getBoundingClientRect: () => E.getBoundingClientRect(),
      getClientRects: () => E.getClientRects(),
      contextElement: E
    } : E;
    u(C), f.refs.setReference(C);
  }, [f.refs]), g = y.useMemo(() => ({
    ...f.refs,
    setPositionReference: m,
    domReference: d
  }), [f.refs, m]), v = y.useMemo(() => ({
    ...f.elements,
    domReference: i
  }), [f.elements, i]), w = y.useMemo(() => ({
    ...f,
    dataRef: r.context.dataRef,
    open: c,
    onOpenChange: r.setOpen,
    events: r.context.events,
    floatingId: a,
    refs: g,
    elements: v,
    nodeId: t,
    rootStore: r
  }), [f, g, v, t, r, c, a]);
  return he(() => {
    i && (d.current = i);
  }, [i]), he(() => {
    r.context.dataRef.current.floatingContext = w;
    const E = p == null ? void 0 : p.nodesRef.current.find((C) => C.id === t);
    E && (E.context = w);
  }), y.useMemo(() => ({
    ...f,
    context: w,
    refs: g,
    elements: v,
    rootStore: r
  }), [f, g, v, w, r]);
}
const Bc = /* @__PURE__ */ y.createContext(void 0);
process.env.NODE_ENV !== "production" && (Bc.displayName = "DirectionContext");
function kh() {
  const e = y.useContext(Bc);
  return (e == null ? void 0 : e.direction) ?? "ltr";
}
const Ah = (e) => ({
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
    } = vt(e, t) || {};
    if (l == null)
      return {};
    const d = ic(u), p = {
      x: n,
      y: r
    }, h = ko(o), f = _o(h), m = await i.getDimensions(l), g = h === "y", v = g ? "top" : "left", w = g ? "bottom" : "right", E = g ? "clientHeight" : "clientWidth", C = s.reference[f] + s.reference[h] - p[h] - s.floating[f], T = p[h] - s.reference[h], S = c.floating[E] || s.floating[f], R = C / 2 - T / 2, x = S / 2 - m[f] / 2 - 1, P = Math.min(d[v], x), O = Math.min(d[w], x), N = P, _ = S - m[f] - O, D = S / 2 - m[f] / 2 + R, A = sc(N, D, _), I = !a.arrow && it(o) != null && D !== A && s.reference[f] / 2 - (D < N ? P : O) - m[f] / 2 < 0, F = I ? D < N ? D - N : D - _ : 0;
    return {
      [h]: p[h] + F,
      data: {
        [h]: A,
        centerOffset: D - A - F,
        ...I && {
          alignmentOffset: F
        }
      },
      reset: I
    };
  }
}), Nh = (e, t) => {
  const {
    name: n,
    fn: r
  } = Ah(e);
  return {
    name: n,
    fn: r,
    options: [e, t]
  };
}, Mh = {
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
}, Dh = {
  sideX: "left",
  sideY: "top"
}, Fh = "--available-width", Lh = "--available-height", Bh = "--anchor-width", Vh = "--anchor-height", Hh = "--transform-origin", Ws = Fh, Us = Lh;
function Vc(e, t, n) {
  const r = e === "inline-start" || e === "inline-end";
  return {
    top: "top",
    right: r ? n ? "inline-start" : "inline-end" : "right",
    bottom: "bottom",
    left: r ? n ? "inline-end" : "inline-start" : "left"
  }[t];
}
function qs(e, t, n) {
  const {
    rects: r,
    placement: o
  } = e;
  return {
    side: Vc(t, Ge(o), n),
    align: it(o) || "center",
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
function $h(e) {
  return Wh(e, _h);
}
function Wh(e, t) {
  var Kt, vn;
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
    arrowPadding: d = 5,
    disableAnchorTracking: p = !1,
    inline: h,
    // Private parameters
    keepMounted: f = !1,
    floatingRootContext: m,
    mounted: g,
    collisionAvoidance: v,
    shift: w,
    nodeId: E,
    adaptiveOrigin: C,
    lazyFlip: T = !1,
    externalTree: S
  } = e, R = v.side || "flip", x = v.align || "flip", P = v.fallbackAxisSide || "end", O = (w == null ? void 0 : w.crossAxis) ?? !1, N = w == null ? void 0 : w.rootBoundary, _ = typeof n == "function" ? n : void 0, D = de(_), A = _ ? D : n, I = tt(n), F = tt(g), k = kh() === "rtl", [M, z] = y.useState(null);
  !g && M !== null && z(null);
  const j = T === "placement", ae = M ? Ge(M) : null, re = M && j ? it(M) || "center" : null, B = ae || {
    top: "top",
    right: "right",
    bottom: "bottom",
    left: "left",
    "inline-end": k ? "left" : "right",
    "inline-start": k ? "right" : "left"
  }[o], G = re || i, V = G === "center" ? B : `${B}-${G}`;
  let H = l;
  typeof H == "number" ? H = {
    top: H,
    right: H,
    bottom: H,
    left: H
  } : H && (H = {
    top: H.top || 0,
    right: H.right || 0,
    bottom: H.bottom || 0,
    left: H.left || 0
  });
  const Z = 1, oe = o === "bottom" ? Z : 0, ee = o === "top" ? Z : 0, te = o === "right" ? Z : 0, W = o === "left" ? Z : 0, ne = {
    boundary: a === "clipping-ancestors" ? "clippingAncestors" : a,
    padding: H
  }, se = y.useRef(null), be = tt(s), ve = tt(c), Oe = typeof s != "function" ? s : 0, Ne = typeof c != "function" ? c : 0, we = [];
  h && we.push(h), we.push(vh((pe) => {
    const Be = qs(pe, o, k), Qe = typeof be.current == "function" ? be.current(Be) : be.current, $e = typeof ve.current == "function" ? ve.current(Be) : ve.current;
    return {
      mainAxis: Qe,
      crossAxis: $e,
      alignmentAxis: $e
    };
  }, [Oe, Ne, k, o]));
  const De = x === "none" && R !== "shift", He = !De && (u || O || R === "shift"), K = R === "none" ? null : Ch({
    ...ne,
    // Ensure the popup flips if it's been limited by its --available-height and it resizes.
    // Since the size() padding is smaller than the flip() padding, flip() will take precedence.
    padding: {
      top: H.top + Z + oe,
      right: H.right + Z + W,
      bottom: H.bottom + Z + ee,
      left: H.left + Z + te
    },
    mainAxis: !O && R === "flip",
    crossAxis: x === "flip" ? "alignment" : !1,
    fallbackAxisSideDirection: P
  }), J = De ? null : yh({
    ...ne,
    // Use the Layout Viewport to avoid shifting around when pinch-zooming.
    rootBoundary: N,
    mainAxis: x !== "none",
    crossAxis: He,
    limiter: u || O ? void 0 : wh((pe) => {
      if (!se.current)
        return {};
      const {
        width: Be,
        height: Qe
      } = se.current.getBoundingClientRect(), $e = Je(Ge(pe.placement)), st = $e === "y" ? Be : Qe, Ze = $e === "y" ? H.left + H.right : H.top + H.bottom;
      return {
        offset: st / 2 + Ze / 2
      };
    })
  }, [ne, u, O, N, H, x]);
  R === "shift" || x === "shift" || G === "center" ? we.push(J, K) : we.push(K, J), we.push(Eh({
    ...ne,
    apply({
      elements: {
        floating: pe
      },
      availableWidth: Be,
      availableHeight: Qe,
      rects: $e
    }) {
      if (!F.current)
        return;
      const st = pe.style;
      st.setProperty(Ws, `${Be}px`), st.setProperty(Us, `${Qe}px`);
      const Ze = Me(pe).devicePixelRatio || 1, {
        x: yn,
        y: kt,
        width: wn,
        height: pt
      } = $e.reference, at = (Math.round((yn + wn) * Ze) - Math.round(yn * Ze)) / Ze, Yt = (Math.round((kt + pt) * Ze) - Math.round(kt * Ze)) / Ze;
      st.setProperty(Bh, `${at}px`), st.setProperty(Vh, `${Yt}px`);
    }
  }), Nh((pe) => ({
    // `transform-origin` calculations rely on an element existing. If the arrow hasn't been set,
    // we'll create a fake element.
    element: se.current || rt(pe.elements.floating).createElement("div"),
    // No padding for the fake arrow: it would displace aligned popups on narrow anchors.
    padding: se.current ? d : 0
  }), [d]), {
    name: "transformOrigin",
    fn(pe) {
      var jo, Go, Ko, Yo, Xo, Qo;
      const {
        elements: {
          floating: Be
        },
        middlewareData: Qe,
        placement: $e,
        platform: st,
        rects: Ze,
        y: yn
      } = pe, kt = Ge($e), wn = it($e), pt = Je(kt) === "y", at = se.current, Yt = typeof s == "function" ? s(qs(pe, o, k)) : s;
      let Cn;
      if (!at && wn && Math.abs(pt ? ((jo = Qe.shift) == null ? void 0 : jo.x) || 0 : ((Go = Qe.shift) == null ? void 0 : Go.y) || 0) <= 1)
        Cn = wn === "start" === (pt && ((Ko = st.isRTL) == null ? void 0 : Ko.call(st, Be)) === !0) ? "100%" : "0%";
      else {
        const Qc = pt ? ((Yo = Qe.arrow) == null ? void 0 : Yo.x) || 0 : ((Xo = Qe.arrow) == null ? void 0 : Xo.y) || 0, Jc = pt ? (at == null ? void 0 : at.clientWidth) || 0 : (at == null ? void 0 : at.clientHeight) || 0;
        Cn = `${Qc + Jc / 2}px`;
      }
      let fr = kt === "top" || kt === "left" ? `calc(100% + ${Yt}px)` : `${-Yt}px`;
      return He && pt && Math.abs(((Qo = Qe.shift) == null ? void 0 : Qo.y) || 0) > Yt && (fr = `${Ze.reference.y + Ze.reference.height / 2 - yn}px`), Be.style.setProperty(Hh, pt ? `${Cn} ${fr}` : `${fr} ${Cn}`), {};
    }
  }, Mh, C), he(() => {
    !g && m && m.update({
      referenceElement: null,
      floatingElement: null,
      domReferenceElement: null,
      positionReference: null
    });
  }, [g, m]);
  const ue = y.useMemo(() => ({
    ancestorScroll: !p,
    elementResize: !p && typeof ResizeObserver < "u",
    layoutShift: !p && typeof IntersectionObserver < "u"
  }), [p]), {
    refs: L,
    elements: Y,
    x: Te,
    y: me,
    middlewareData: xe,
    update: q,
    placement: Q,
    context: X,
    isPositioned: ie,
    floatingStyles: Se
  } = t({
    rootContext: m,
    open: f ? g : void 0,
    placement: V,
    middleware: we,
    strategy: r,
    whileElementsMounted: f ? void 0 : (...pe) => Vs(...pe, ue),
    nodeId: E,
    externalTree: S
  }), {
    sideX: fe,
    sideY: Ae
  } = xe.adaptiveOrigin || Dh, Ie = ie ? r : "fixed", Xe = y.useMemo(() => {
    let pe;
    return ie ? C ? pe = {
      position: Ie,
      [fe]: Te,
      [Ae]: me
    } : pe = {
      ...Se,
      position: Ie
    } : pe = {
      position: Ie,
      top: 0,
      left: 0
    }, pe[Ws] = "100vw", pe[Us] = "100vh", ie || (pe.opacity = 0), pe;
  }, [C, Ie, fe, Te, Ae, me, Se, ie]), ze = y.useRef(null);
  he(() => {
    if (!g)
      return;
    const pe = I.current, Be = typeof pe == "function" ? pe() : pe, $e = (zs(Be) ? Be.current : Be) || null || null;
    $e !== ze.current && (L.setPositionReference($e), ze.current = $e);
  }, [g, L, A, I]), y.useEffect(() => {
    if (!g)
      return;
    const pe = I.current;
    typeof pe != "function" && zs(pe) && pe.current !== ze.current && (L.setPositionReference(pe.current), ze.current = pe.current);
  }, [g, L, A, I]), y.useEffect(() => {
    if (f && g && Y.reference && Y.floating)
      return Vs(Y.reference, Y.floating, q, ue);
  }, [f, g, Y, q, ue]);
  const ct = Ge(Q), Ct = Vc(o, ct, k), Et = it(Q) || "center", jt = !!((Kt = xe.hide) != null && Kt.referenceHidden);
  he(() => {
    T && g && ie && (ct !== B || j && Et !== G) && z(Q);
  }, [T, j, g, ie, Q, ct, Et, B, G]);
  const bn = y.useMemo(() => {
    var pe, Be;
    return {
      position: "absolute",
      top: (pe = xe.arrow) == null ? void 0 : pe.y,
      left: (Be = xe.arrow) == null ? void 0 : Be.x
    };
  }, [xe.arrow]), Gt = ((vn = xe.arrow) == null ? void 0 : vn.centerOffset) !== 0;
  return y.useMemo(() => ({
    positionerStyles: Xe,
    arrowStyles: bn,
    arrowRef: se,
    arrowUncentered: Gt,
    side: Ct,
    align: Et,
    physicalSide: ct,
    anchorHidden: jt,
    refs: L,
    context: X,
    isPositioned: ie,
    update: q
  }), [Xe, bn, se, Gt, Ct, Et, ct, jt, L, X, ie, q]);
}
function zs(e) {
  return e != null && "current" in e;
}
function Hc(e) {
  return e === "starting" ? Nf : Ue;
}
function Uh(e, t, {
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
  return c && (a.pointerEvents = "none"), wt("div", e, {
    state: t,
    ref: s,
    props: [{
      role: "presentation",
      hidden: i,
      style: a
    }, Hc(r), o],
    stateAttributesMapping: rc
  });
}
const $c = /* @__PURE__ */ y.forwardRef(function(t, n) {
  const {
    render: r,
    className: o,
    anchor: s,
    positionMethod: i = "absolute",
    side: c = "bottom",
    align: a = "center",
    sideOffset: l = 0,
    alignOffset: u = 0,
    collisionBoundary: d = "clipping-ancestors",
    collisionPadding: p = 5,
    arrowPadding: h = 5,
    sticky: f = !1,
    disableAnchorTracking: m = !1,
    collisionAvoidance: g = Mf,
    style: v,
    ...w
  } = t, E = gn(), C = Ph(), T = Hf(), S = E.useState("open"), R = E.useState("mounted"), x = E.useState("floatingRootContext"), P = E.useState("instantType"), O = E.useState("transitionStatus"), N = E.useState("adaptiveOrigin"), _ = E.context.inlineRectCoordsRef, D = $h({
    anchor: s,
    floatingRootContext: x,
    positionMethod: i,
    mounted: R,
    side: c,
    sideOffset: l,
    align: a,
    alignOffset: u,
    arrowPadding: h,
    collisionBoundary: d,
    collisionPadding: p,
    sticky: f,
    disableAnchorTracking: m,
    keepMounted: C,
    nodeId: T,
    collisionAvoidance: g,
    adaptiveOrigin: N,
    inline: Qf(_)
  }), A = D.update;
  he(() => {
    S && R && A();
  }, [S, R, A]);
  const I = {
    open: S,
    side: D.side,
    align: D.align,
    anchorHidden: D.anchorHidden,
    instant: P
  }, F = Uh(t, I, {
    styles: D.positionerStyles,
    transitionStatus: O,
    props: w,
    refs: [n, E.useStateSetter("positionerElement")],
    hidden: !R,
    inert: !S
  });
  return /* @__PURE__ */ b(Uo.Provider, {
    value: D,
    children: /* @__PURE__ */ b($f, {
      id: T,
      children: F
    })
  });
});
process.env.NODE_ENV !== "production" && ($c.displayName = "PreviewCardPositioner");
const Wc = /* @__PURE__ */ y.forwardRef(function(t, n) {
  const {
    className: r,
    render: o,
    style: s,
    ...i
  } = t, c = gn(), {
    side: a,
    align: l
  } = Oh(), u = c.useState("open"), d = c.useState("instantType"), p = c.useState("transitionStatus"), h = c.useState("popupProps"), f = c.useState("floatingRootContext"), m = c.useState("closeDelay");
  return yo({
    open: u,
    ref: c.context.popupRef,
    onComplete() {
      var w, E;
      u && ((E = (w = c.context).onOpenChangeComplete) == null || E.call(w, !0));
    }
  }), Ap(f, {
    closeDelay: m
  }), wt("div", t, {
    state: {
      open: u,
      side: a,
      align: l,
      instant: d,
      transitionStatus: p
    },
    ref: [n, c.context.popupRef, c.useStateSetter("popupElement")],
    props: [tp, h, Hc(p), i],
    stateAttributesMapping: nf
  });
});
process.env.NODE_ENV !== "production" && (Wc.displayName = "PreviewCardPopup");
class qh extends Jf {
  constructor() {
    super(xh(), "PreviewCard");
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
function zh() {
  return new qh();
}
const jh = zh;
function Gh(e) {
  return /* @__PURE__ */ b(Mc, { ...e });
}
function Kh(e) {
  return /* @__PURE__ */ b(Lc, { "data-slot": "hover-card-trigger", ...e });
}
function Yh({
  className: e,
  side: t = "bottom",
  sideOffset: n = 6,
  align: r = "center",
  alignOffset: o = 0,
  ...s
}) {
  return /* @__PURE__ */ b(Fc, { children: /* @__PURE__ */ b(
    $c,
    {
      align: r,
      alignOffset: o,
      side: t,
      sideOffset: n,
      className: "vps-hover-card-positioner",
      children: /* @__PURE__ */ b(
        Wc,
        {
          "data-slot": "hover-card-content",
          ...s,
          className: (i) => le(
            "vps-hover-card",
            typeof e == "function" ? e(i) : e
          )
        }
      )
    }
  ) });
}
function Xh({ className: e, ...t }) {
  return /* @__PURE__ */ b("span", { className: le("inline-citation", e), ...t });
}
const qo = er(null);
function Uc(e) {
  !e.popup || !e.focusRequested || !e.handle.isOpen || (e.focusRequested = !1, e.popup.focus());
}
function Qh({
  handle: e,
  onOpenChange: t,
  openDelay: n = 80,
  closeDelay: r = 180,
  ...o
}) {
  const [s] = Re(() => jh()), i = e ?? s, c = Tt(() => ({
    handle: i,
    openDelay: n,
    closeDelay: r,
    trigger: null,
    popup: null,
    focusRequested: !1
  }), [i, n, r]);
  return /* @__PURE__ */ b(qo.Provider, { value: c, children: /* @__PURE__ */ b(
    Gh,
    {
      ...o,
      handle: i,
      onOpenChange: (a, l) => {
        var u, d;
        t == null || t(a, l), !a && l.reason === "escape-key" && ((u = c.popup) != null && u.contains(document.activeElement)) && ((d = c.trigger) == null || d.focus());
      }
    }
  ) });
}
function eo(e) {
  try {
    return new URL(e).hostname || e;
  } catch {
    return e;
  }
}
function Jh({
  sources: e,
  delay: t,
  closeDelay: n,
  id: r,
  children: o,
  onClick: s,
  ...i
}) {
  const c = qt(qo), a = Ar(), l = r ?? a, u = e[0], d = u ? eo(u) : "Source";
  return /* @__PURE__ */ b(
    Kh,
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
            s == null || s(p), !(!c || p.defaultPrevented) && (c.trigger = p.currentTarget, c.focusRequested = !0, c.handle.open(l), Uc(c));
          }
        }
      ),
      children: o ?? (e.length > 1 ? `${d} +${e.length - 1}` : d)
    }
  );
}
function Zh({ ref: e, onBlur: t, ...n }) {
  const r = qt(qo);
  return /* @__PURE__ */ b(
    Yh,
    {
      tabIndex: -1,
      role: "dialog",
      "aria-label": "Source preview",
      ...n,
      ref: (o) => {
        typeof e == "function" ? e(o) : e && (e.current = o), r && (r.popup = o, o && Uc(r));
      },
      onBlur: (o) => {
        t == null || t(o), !(!r || o.defaultPrevented) && o.relatedTarget !== r.trigger && !o.currentTarget.contains(o.relatedTarget) && r.handle.close();
      }
    }
  );
}
const qc = er(null);
function zo() {
  const e = qt(qc);
  if (!e) throw new Error("Citation carousel parts must be rendered inside InlineCitationCarousel.");
  return e;
}
function em({
  opts: e,
  plugins: t,
  orientation: n = "horizontal",
  setApi: r,
  className: o,
  ...s
}) {
  const [i, c] = Po({ ...e, axis: n === "vertical" ? "y" : "x" }, t), [{ selected: a, count: l }, u] = Re({ selected: 0, count: 0 });
  return Ke(() => {
    if (!c) return;
    r == null || r(c);
    const d = () => u({ selected: c.selectedScrollSnap(), count: c.scrollSnapList().length });
    return d(), c.on("select", d).on("reInit", d), () => {
      c.off("select", d).off("reInit", d);
    };
  }, [c, r]), /* @__PURE__ */ b(qc.Provider, { value: { viewportRef: i, api: c, selected: a, count: l }, children: /* @__PURE__ */ b(
    "div",
    {
      role: "region",
      "aria-roledescription": "carousel",
      ...s,
      className: le("inline-citation-carousel", o),
      "data-orientation": n
    }
  ) });
}
function tm({ className: e, ...t }) {
  const { viewportRef: n } = zo();
  return /* @__PURE__ */ b("div", { ref: n, className: "inline-citation-viewport", children: /* @__PURE__ */ b("div", { className: le("inline-citation-track", e), ...t }) });
}
function nm({ className: e, ...t }) {
  return /* @__PURE__ */ b("div", { role: "group", "aria-roledescription": "slide", className: le("inline-citation-slide", e), ...t });
}
function rm({ className: e, ...t }) {
  return /* @__PURE__ */ b("div", { className: le("inline-citation-carousel-header", e), ...t });
}
function om({ children: e, ...t }) {
  const { selected: n, count: r } = zo();
  return /* @__PURE__ */ b("div", { "aria-live": "polite", ...t, children: e ?? (r ? `${n + 1}/${r}` : "") });
}
function zc({ next: e, children: t, disabled: n, onClick: r, ...o }) {
  const { api: s } = zo(), i = e ? s == null ? void 0 : s.canScrollNext() : s == null ? void 0 : s.canScrollPrev();
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
      children: t ?? (e ? /* @__PURE__ */ b(ci, { size: 14, "aria-hidden": "true" }) : /* @__PURE__ */ b(Ta, { size: 14, "aria-hidden": "true" }))
    }
  );
}
function sm(e) {
  return /* @__PURE__ */ b(zc, { ...e, next: !1 });
}
function im(e) {
  return /* @__PURE__ */ b(zc, { ...e, next: !0 });
}
function cm({ title: e, url: t, description: n, className: r, children: o, ...s }) {
  const i = t ? So(t) : void 0;
  return /* @__PURE__ */ $("div", { className: le("inline-citation-source", r), ...s, children: [
    /* @__PURE__ */ b("div", { className: "inline-citation-title", children: e || (i ? eo(i) : "Source") }),
    i && /* @__PURE__ */ $("a", { href: i, target: "_blank", rel: "noopener noreferrer", children: [
      eo(i),
      /* @__PURE__ */ b("span", { className: "sr-only", children: " (opens in a new tab)" })
    ] }),
    n && /* @__PURE__ */ b("p", { children: n }),
    o
  ] });
}
function am({ className: e, ...t }) {
  return /* @__PURE__ */ b("blockquote", { className: le("inline-citation-quote", e), ...t });
}
const lm = {
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
function jc(e) {
  const n = (e.split(/[/\\]/).pop() || "").replace(/\.md$/i, "").toLowerCase();
  for (const [r, o] of Object.entries(lm))
    if (n.includes(r))
      return o;
  return null;
}
function to(e) {
  return e.title ? e.title : (e.source.split(/[/\\]/).pop() || e.source).replace(/\.md$/i, "").replace(/[-_]/g, " ").replace(/\b\w/g, (n) => n.toUpperCase());
}
const um = ({
  sources: e,
  hideInspectSources: t = !1,
  showInspectSources: n = !0,
  defaultExpanded: r = !1,
  maxSources: o = 5
}) => {
  const s = t || n === !1, [i, c] = Re(r && !s), [a, l] = Re(null);
  if (!e || !e.length) return null;
  const u = e.slice(0, o), d = u.length === 1 ? "source" : "sources", p = /* @__PURE__ */ $(Vt, { children: [
    /* @__PURE__ */ b(It, { children: /* @__PURE__ */ b(Oa, { size: 14 }) }),
    /* @__PURE__ */ b(Ht, { children: `${u.length} retrieved VPS ${d}` }),
    !s && /* @__PURE__ */ b(on, { children: i ? "Hide Details" : "Inspect Sources" })
  ] }), h = /* @__PURE__ */ b(Rt, { className: "grounded-source-rows", children: u.map((f, m) => {
    const g = a === m, v = /* @__PURE__ */ $(Vt, { children: [
      /* @__PURE__ */ b(It, { children: /* @__PURE__ */ b(Ea, { size: 13 }) }),
      /* @__PURE__ */ $(Ht, { children: [
        "[S",
        m + 1,
        "] ",
        to(f)
      ] }),
      /* @__PURE__ */ $(on, { title: "Ranking score, not a probability of correctness", children: [
        "Score ",
        f.score.toFixed(2)
      ] })
    ] });
    return s ? /* @__PURE__ */ b("div", { children: v }, `${f.chunkId}-${m}`) : /* @__PURE__ */ b(
      "button",
      {
        type: "button",
        className: `trace-trigger${i && g ? " grounded-source-selected" : ""}`,
        "aria-pressed": i && g,
        onClick: () => {
          c(!0), l(g ? null : m);
        },
        title: f.source,
        children: v
      },
      `${f.chunkId}-${m}`
    );
  }) });
  return s ? /* @__PURE__ */ $(Rt, { className: "grounded-sources-card", children: [
    p,
    h
  ] }) : /* @__PURE__ */ b(Rt, { className: "grounded-sources-card", children: /* @__PURE__ */ $(Li, { open: i, onOpenChange: c, children: [
    /* @__PURE__ */ b(Bi, { children: p }),
    h,
    /* @__PURE__ */ b(Vi, { children: /* @__PURE__ */ b("div", { className: "grounded-sources-details-list", children: u.map((f, m) => {
      const g = to(f), v = jc(f.source);
      return /* @__PURE__ */ $(
        "div",
        {
          className: `grounded-detail-item${a === m ? " grounded-detail-item--highlighted" : ""}`,
          children: [
            /* @__PURE__ */ $("div", { className: "grounded-detail-top", children: [
              /* @__PURE__ */ $("div", { className: "grounded-detail-title-group", children: [
                /* @__PURE__ */ $("span", { className: "grounded-detail-index", children: [
                  "[",
                  m + 1,
                  "]"
                ] }),
                /* @__PURE__ */ b("span", { className: "grounded-detail-title", children: g })
              ] }),
              /* @__PURE__ */ $("div", { className: "grounded-detail-meta", children: [
                /* @__PURE__ */ $("span", { className: "grounded-detail-score", children: [
                  "Rank score ",
                  f.score.toFixed(2)
                ] }),
                v && /* @__PURE__ */ $(
                  "a",
                  {
                    href: v.path,
                    onClick: (E) => {
                      E.preventDefault(), window.location.href = v.path;
                    },
                    className: "grounded-route-link",
                    title: `Navigate to ${v.label}`,
                    children: [
                      /* @__PURE__ */ b("span", { children: v.label }),
                      /* @__PURE__ */ b(Ia, { size: 10, "aria-hidden": "true" })
                    ]
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ b("div", { className: "grounded-detail-path", children: /* @__PURE__ */ b("code", { children: f.source }) }),
            f.snippet && /* @__PURE__ */ $("p", { className: "grounded-detail-snippet", children: [
              '"',
              f.snippet,
              '"'
            ] })
          ]
        },
        `detail-${f.chunkId}-${m}`
      );
    }) }) })
  ] }) });
};
function dm({ label: e, sources: t }) {
  const n = t.map((r) => {
    var i;
    const o = to(r), s = So(r.url || r.source) ?? ((i = jc(r.source)) == null ? void 0 : i.path);
    return {
      key: r.chunkId,
      label: s || o,
      content: /* @__PURE__ */ $(Ut, { children: [
        /* @__PURE__ */ b(cm, { title: o, url: s }),
        r.snippet && /* @__PURE__ */ b(am, { children: r.snippet })
      ] })
    };
  });
  return /* @__PURE__ */ b(Xh, { children: /* @__PURE__ */ $(Qh, { children: [
    /* @__PURE__ */ b(Jh, { sources: n.map((r) => r.label), "aria-label": "View sources " + e, children: e }),
    /* @__PURE__ */ b(Zh, { children: n.length === 1 ? n[0].content : /* @__PURE__ */ $(em, { "aria-label": "Sources", children: [
      /* @__PURE__ */ $(rm, { children: [
        /* @__PURE__ */ b(om, {}),
        /* @__PURE__ */ b(sm, {}),
        /* @__PURE__ */ b(im, {})
      ] }),
      /* @__PURE__ */ b(tm, { children: n.map((r, o) => /* @__PURE__ */ b(nm, { "aria-label": "Source " + (o + 1), children: r.content }, r.key + "-" + o)) })
    ] }) })
  ] }) });
}
function fm(e, t) {
  if (!e) return [];
  const n = /(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|https?:\/\/[^\s]+|\[S\d+(?:\s*,\s*S\d+)*\])/g;
  return e.split(n).map((o, s) => {
    if (!o) return null;
    if (t != null && t.length && /^\[S\d+(?:\s*,\s*S\d+)*\]$/.test(o)) {
      const c = [...new Set(o.match(/\d+/g))].map((a) => t[Number(a) - 1]);
      if (c.every((a) => a !== void 0))
        return /* @__PURE__ */ b(dm, { label: o, sources: c }, s);
    }
    const i = o.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (i) {
      const c = i[1], a = i[2], l = So(a);
      if (!l) return /* @__PURE__ */ b(je.Fragment, { children: c }, s);
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
    ) : /* @__PURE__ */ b(je.Fragment, { children: o }, s);
  });
}
function pm(e) {
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
        const l = (h) => h.slice(1, -1).split("|").map((f) => f.trim()), u = l(a[0]), d = a[1].includes("-") ? 2 : 1, p = a.slice(d).map(l);
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
function hm({ code: e, lang: t, streaming: n }) {
  const { status: r, copy: o } = Yi();
  return /* @__PURE__ */ $("div", { className: "md-code-block", children: [
    /* @__PURE__ */ $("div", { className: "md-code-header", children: [
      /* @__PURE__ */ b("span", { children: t || "Code" }),
      !n && /* @__PURE__ */ $(Ut, { children: [
        /* @__PURE__ */ $("span", { className: "md-code-status", role: "status", children: [
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
            children: r === "copied" ? /* @__PURE__ */ b(oo, { size: 15, "aria-hidden": "true" }) : /* @__PURE__ */ b(li, { size: 15, "aria-hidden": "true" })
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ b("pre", { className: "md-pre", children: /* @__PURE__ */ b("code", { children: e.split(`
`).map((s, i) => /* @__PURE__ */ $("span", { className: "md-code-line", children: [
      /* @__PURE__ */ b("span", { className: "md-code-number", "aria-hidden": "true", children: i + 1 }),
      /* @__PURE__ */ b("span", { children: s || " " })
    ] }, i)) }) })
  ] });
}
const js = je.memo(function({
  text: t,
  streaming: n = !1,
  sources: r
}) {
  if (!t) return null;
  const o = pm(t), s = (i) => fm(i, r);
  return /* @__PURE__ */ b("div", { className: "md-content", children: o.map((i, c) => {
    switch (i.type) {
      case "h":
        return i.level === 1 ? /* @__PURE__ */ b("h2", { className: "md-h1", children: s(i.content) }, c) : i.level === 2 ? /* @__PURE__ */ b("h3", { className: "md-h2", children: s(i.content) }, c) : i.level === 3 ? /* @__PURE__ */ b("h4", { className: "md-h3", children: s(i.content) }, c) : /* @__PURE__ */ b("h5", { className: "md-h4", children: s(i.content) }, c);
      case "ul":
        return /* @__PURE__ */ b("ul", { className: "md-ul", children: i.items.map((a, l) => /* @__PURE__ */ b("li", { className: "md-li", children: s(a) }, l)) }, c);
      case "ol":
        return /* @__PURE__ */ b("ol", { className: "md-ol", children: i.items.map((a, l) => /* @__PURE__ */ b("li", { className: "md-li", children: s(a) }, l)) }, c);
      case "code":
        return /* @__PURE__ */ b(hm, { code: i.code, lang: i.lang, streaming: n }, c);
      case "quote":
        return /* @__PURE__ */ b("blockquote", { className: "md-quote", children: i.lines.map((a, l) => /* @__PURE__ */ b("p", { children: s(a) }, l)) }, c);
      case "hr":
        return /* @__PURE__ */ b("hr", { className: "md-hr" }, c);
      case "table":
        return /* @__PURE__ */ b("div", { className: "md-table-wrap", children: /* @__PURE__ */ $("table", { className: "md-table", children: [
          /* @__PURE__ */ b("thead", { children: /* @__PURE__ */ b("tr", { children: i.headers.map((a, l) => /* @__PURE__ */ b("th", { children: s(a) }, l)) }) }),
          /* @__PURE__ */ b("tbody", { children: i.rows.map((a, l) => /* @__PURE__ */ b("tr", { children: a.map((u, d) => /* @__PURE__ */ b("td", { children: s(u) }, d)) }, l)) })
        ] }) }, c);
      case "p":
      default:
        return /* @__PURE__ */ b("p", { className: "md-p", children: i.lines.map((a, l) => /* @__PURE__ */ $(je.Fragment, { children: [
          s(a),
          l < i.lines.length - 1 && /* @__PURE__ */ b("br", {})
        ] }, l)) }, c);
    }
  }) });
}), mm = ra(async () => ({ default: (await import("streamdown")).Streamdown })), Gc = er(null);
function Kc() {
  const e = qt(Gc);
  if (!e) throw new Error("Reasoning parts must be rendered inside Reasoning.");
  return e;
}
function gm({
  isStreaming: e = !1,
  open: t,
  defaultOpen: n,
  onOpenChange: r,
  duration: o,
  className: s,
  ...i
}) {
  const [c, a] = Re(n), [l, u] = Re(), d = Fe(null), p = t ?? c ?? e;
  Ke(() => {
    e ? d.current = performance.now() : d.current !== null && (u(Math.round((performance.now() - d.current) / 1e3)), d.current = null);
  }, [e]);
  function h(f) {
    t === void 0 && a(f), r == null || r(f);
  }
  return /* @__PURE__ */ b(Gc.Provider, { value: { isStreaming: e, isOpen: p, setIsOpen: h, duration: o ?? l }, children: /* @__PURE__ */ b(Rt, { className: s, children: /* @__PURE__ */ b(Li, { ...i, open: p, onOpenChange: h }) }) });
}
function bm({
  getThinkingMessage: e,
  children: t,
  icon: n,
  description: r,
  ...o
}) {
  const { isStreaming: s, duration: i } = Kc(), c = s ? "Thinking" : i === void 0 ? "Thought" : `Thought for ${i}s`;
  return /* @__PURE__ */ b(Bi, { ...o, children: /* @__PURE__ */ $(Vt, { status: s ? "running" : void 0, children: [
    /* @__PURE__ */ b(It, { children: n ?? (s ? /* @__PURE__ */ b(ui, { size: 14, className: "trace-spinner" }) : /* @__PURE__ */ b(ai, { size: 14 })) }),
    /* @__PURE__ */ b(Ht, { children: t ?? (e == null ? void 0 : e(s, i)) ?? c }),
    r && /* @__PURE__ */ b(on, { "aria-hidden": s || void 0, children: r })
  ] }) });
}
function vm({ children: e, className: t, ...n }) {
  const { isStreaming: r } = Kc();
  return /* @__PURE__ */ b(Vi, { className: le("reasoning-content", t), ...n, children: typeof e == "string" ? /* @__PURE__ */ b(oa, { fallback: /* @__PURE__ */ b("div", { className: "md-content reasoning-text", children: e }), children: /* @__PURE__ */ b(mm, { className: "md-content", isAnimating: r, mode: r ? "streaming" : "static", children: e }) }) : e });
}
function ym(e) {
  return e === "create_ticket" ? "Support ticket processed" : e === "get_customer" ? "Account verified" : e === "get_ticket" ? "Ticket status loaded" : "Information retrieved";
}
const wm = ({
  status: e = "complete",
  progressText: t,
  progressSteps: n = [],
  durationMs: r,
  toolCalls: o = []
}) => {
  const s = e === "pending", i = e === "stopped", [c, a] = Re(0);
  Ke(() => {
    if (!s) return;
    const d = Date.now(), p = setInterval(() => {
      a(Number(((Date.now() - d) / 1e3).toFixed(1)));
    }, 250);
    return () => clearInterval(p);
  }, [s]);
  const l = n.length > 0 || o.length > 0, u = r === void 0 ? void 0 : Number((r / 1e3).toFixed(1));
  return l ? /* @__PURE__ */ $(gm, { className: "chat-response-trace", isStreaming: s, duration: u, children: [
    /* @__PURE__ */ b(
      bm,
      {
        getThinkingMessage: i ? () => "Response stopped" : void 0,
        icon: i ? /* @__PURE__ */ b(di, { size: 12 }) : void 0,
        description: s ? `${c.toFixed(1)}s` : void 0
      }
    ),
    /* @__PURE__ */ b(vm, { children: /* @__PURE__ */ $(Rt, { children: [
      n.map((d, p) => /* @__PURE__ */ $(oi, { children: [
        /* @__PURE__ */ b(ma, { children: /* @__PURE__ */ b("span", { className: "chat-progress-dot" }) }),
        /* @__PURE__ */ b(si, { children: d })
      ] }, `${d}-${p}`)),
      o.map((d, p) => /* @__PURE__ */ $(Vt, { children: [
        /* @__PURE__ */ b(It, { children: /* @__PURE__ */ b(Ha, { size: 13 }) }),
        /* @__PURE__ */ b(Ht, { children: ym(d.toolName) })
      ] }, `${d.toolName}-${p}`))
    ] }) })
  ] }) : /* @__PURE__ */ b(Rt, { className: "chat-response-trace", children: /* @__PURE__ */ $(Vt, { status: s ? "running" : void 0, children: [
    /* @__PURE__ */ b(It, { children: s ? /* @__PURE__ */ b(ui, { size: 14, className: "trace-spinner" }) : /* @__PURE__ */ b(ai, { size: 14 }) }),
    /* @__PURE__ */ b(Ht, { children: s ? t || "Thinking" : i ? "Response stopped" : "Thought" }),
    s ? /* @__PURE__ */ $(on, { "aria-hidden": "true", children: [
      c.toFixed(1),
      "s"
    ] }) : !i && u !== void 0 && /* @__PURE__ */ $(on, { children: [
      u,
      "s"
    ] })
  ] }) });
}, Cm = ({ message: e, onEdit: t }) => {
  var h, f, m, g;
  const n = ro(), r = (n == null ? void 0 : n.hideInspectSources) ?? !1, o = (n == null ? void 0 : n.showGroundedSources) ?? !1, s = e.role === "user", i = e.status === "error", c = e.status === "pending", a = e.status === "stopped", l = e.id.startsWith("welcome"), u = e.role === "assistant" && !l && !i, d = u && (c || a || e.durationMs !== void 0 || !!((h = e.progressSteps) != null && h.length || (f = e.sources) != null && f.length || (m = e.toolCalls) != null && m.length || e.usage)), p = u && !c && !a && e.content.trim().length > 0;
  return /* @__PURE__ */ $(so, { align: s ? "end" : "start", children: [
    e.role === "assistant" && /* @__PURE__ */ b(fi, { className: "avatar-circle", "aria-hidden": "true", children: /* @__PURE__ */ b("img", { src: wo, alt: "VPS Logo", style: { width: "16px", height: "16px" } }) }),
    /* @__PURE__ */ $(io, { children: [
      d && /* @__PURE__ */ b(Wa, { children: /* @__PURE__ */ b(
        wm,
        {
          status: c ? "pending" : a ? "stopped" : "complete",
          progressText: e.progressText,
          progressSteps: e.progressSteps,
          durationMs: e.durationMs,
          toolCalls: e.toolCalls
        }
      ) }),
      s ? /* @__PURE__ */ b($r, { align: "end", children: /* @__PURE__ */ b(Wr, { className: "msg-user-pre", children: e.content }) }) : l || i ? /* @__PURE__ */ b($r, { variant: i ? "destructive" : "muted", children: /* @__PURE__ */ b(Wr, { children: /* @__PURE__ */ b(js, { text: e.content }) }) }) : e.content && /* @__PURE__ */ $("div", { className: "chat-message-body", children: [
        /* @__PURE__ */ b(
          js,
          {
            text: e.content,
            streaming: c,
            sources: u && !c && !a && !r ? e.sources : void 0
          }
        ),
        u && !c && !a && o && ((g = e.sources) != null && g.length) ? /* @__PURE__ */ b(um, { sources: e.sources, hideInspectSources: r }) : null
      ] }),
      p && n && /* @__PURE__ */ b(Nr, { children: /* @__PURE__ */ b(Xu, { message: e, onFeedback: n.toggleMessageFeedback }) }),
      s && !i && /* @__PURE__ */ $(Nr, { children: [
        t && /* @__PURE__ */ b(
          "button",
          {
            type: "button",
            className: "chat-message-action",
            "aria-label": "Edit message",
            title: "Edit message",
            disabled: (n == null ? void 0 : n.status) === "awaiting" || (n == null ? void 0 : n.status) === "connecting" || !!(n != null && n.pendingTicket),
            onClick: () => t(e.content),
            children: /* @__PURE__ */ b(Na, { size: 14, "aria-hidden": "true" })
          }
        ),
        /* @__PURE__ */ b(oo, { size: 13, className: "msg-tick", "aria-hidden": "true" })
      ] })
    ] })
  ] });
}, Em = ({ onEdit: e }) => {
  const { messages: t, status: n, suggestions: r, showSuggestions: o, sendMessage: s } = tr(), i = n === "awaiting" || n === "connecting", c = t.filter((a) => a.status !== "error");
  return /* @__PURE__ */ b(
    qu,
    {
      autoScroll: !0,
      defaultScrollPosition: "last-anchor",
      scrollPreviousItemPeek: 64,
      children: /* @__PURE__ */ $(zu, { children: [
        /* @__PURE__ */ b(ju, { "aria-label": "Chat messages", children: /* @__PURE__ */ $(Gu, { "aria-busy": i, children: [
          c.length === 0 && /* @__PURE__ */ b(ms, { messageId: "welcome", children: /* @__PURE__ */ b(Yu, {}) }),
          c.map((a) => /* @__PURE__ */ b(
            ms,
            {
              messageId: a.streamId ?? a.id,
              "data-role": a.role,
              scrollAnchor: a.role === "user",
              children: /* @__PURE__ */ b(Cm, { message: a, onEdit: e })
            },
            a.streamId ?? a.id
          ))
        ] }) }),
        /* @__PURE__ */ b(Ku, {})
      ] })
    }
  );
}, Sm = () => {
  const { pendingTicket: e, ticketBusy: t, userContext: n, confirmTicket: r, cancelTicket: o } = tr(), s = !n.customerId && !n.email, [i, c] = Re("");
  return e ? /* @__PURE__ */ $(
    "div",
    {
      className: "ticket-card",
      role: "region",
      "aria-label": "Create support ticket",
      children: [
        /* @__PURE__ */ b("h3", { className: "ticket-card-title", children: "Create support ticket?" }),
        /* @__PURE__ */ b("p", { className: "ticket-card-desc", children: "I can open a support request for you. Nothing is created until you confirm." }),
        /* @__PURE__ */ b("p", { className: "ticket-card-body", children: e.description }),
        s && /* @__PURE__ */ $("label", { className: "ticket-id-label", children: [
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
        /* @__PURE__ */ $("div", { className: "ticket-actions", children: [
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
}, Yc = ({
  className: e,
  onClose: t,
  showMinimize: n,
  title: r,
  subtitle: o,
  envStage: s,
  envPulse: i = !0
}) => {
  const { messages: c, sendMessage: a, stopResponse: l, status: u, error: d, resetConversation: p, retryLast: h, pendingTicket: f, soundEnabled: m, toggleSound: g } = tr(), v = Fe(null), w = u === "awaiting" || u === "connecting", E = c[c.length - 1], C = w ? E == null ? void 0 : E.progressText : (E == null ? void 0 : E.status) === "stopped" ? "Response stopped" : void 0;
  return /* @__PURE__ */ $(
    "section",
    {
      className: `chat-panel${e ? ` ${e}` : ""}`,
      "aria-label": "VPS AI Assistant",
      children: [
        /* @__PURE__ */ b(
          Xl,
          {
            title: r,
            subtitle: o,
            onClose: t,
            onReset: () => void p(),
            showMinimize: n,
            soundEnabled: m,
            onToggleSound: g,
            envStage: s,
            envPulse: i
          }
        ),
        /* @__PURE__ */ b("div", { className: "chat-panel-body", children: /* @__PURE__ */ b(Em, { onEdit: (T) => {
          var S;
          return (S = v.current) == null ? void 0 : S.edit(T);
        } }) }),
        /* @__PURE__ */ b(oi, { className: "sr-only", role: "status", children: /* @__PURE__ */ b(si, { children: C }) }),
        d && u === "error" && /* @__PURE__ */ b(Gl, { message: d, onRetry: () => void h() }),
        /* @__PURE__ */ b(Sm, {}),
        /* @__PURE__ */ b(
          cu,
          {
            ref: v,
            onSend: (T) => void a(T),
            onStop: w ? l : void 0,
            disabled: w || !!f
          }
        )
      ]
    }
  );
}, Tm = ({
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
      Yc,
      {
        onClose: t,
        showMinimize: !0,
        title: "VPS AI Assistant",
        envStage: n,
        envPulse: r
      }
    )
  }
) : null, Rm = ({
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
    children: e ? /* @__PURE__ */ b($a, { size: 22 }) : /* @__PURE__ */ b(_a, { size: 24 })
  }
), Gs = ({
  defaultOpen: e = !1,
  open: t,
  onOpenChange: n,
  envStage: r,
  envPulse: o = !0
}) => {
  const [s, i] = Re(e), c = t ?? s, a = (l) => {
    n == null || n(l), t === void 0 && i(l);
  };
  return /* @__PURE__ */ $(Ut, { children: [
    /* @__PURE__ */ b(
      Tm,
      {
        open: c,
        onClose: () => a(!1),
        envStage: r,
        envPulse: o
      }
    ),
    /* @__PURE__ */ b(Rm, { open: c, onToggle: () => a(!c) })
  ] });
}, Fm = ({
  apiBaseUrl: e,
  apiUrl: t,
  proxyUrl: n,
  userContext: r,
  role: o,
  roleId: s,
  client: i,
  service: c,
  welcomeMessage: a,
  suggestions: l,
  disableSuggestions: u,
  initialMessage: d,
  hideInspectSources: p,
  showGroundedSources: h,
  modelId: f,
  ...m
}) => {
  const g = ro(), v = e ?? t ?? n;
  return !!g && (!v || Lt(v) === Lt(g == null ? void 0 : g.apiBaseUrl)) && !r && o === void 0 && s === void 0 && i === void 0 && c === void 0 && a === void 0 && !l && u === void 0 && !d && p === void 0 && h === void 0 && f === void 0 ? /* @__PURE__ */ b(Gs, { ...m }) : /* @__PURE__ */ b(
    ti,
    {
      apiBaseUrl: v,
      userContext: r,
      role: o,
      roleId: s,
      client: i,
      service: c,
      welcomeMessage: a,
      suggestions: l,
      disableSuggestions: u,
      initialMessage: d,
      hideInspectSources: p,
      showGroundedSources: h,
      modelId: f,
      children: /* @__PURE__ */ b(Gs, { ...m })
    }
  );
}, xm = ({
  open: e,
  onClose: t,
  subtitle: n,
  title: r,
  envStage: o,
  envPulse: s = !0
}) => /* @__PURE__ */ $(Ut, { children: [
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
        Yc,
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
] }), Im = 5, kr = 8, Xc = "vps-embedded-assistant-top", Ks = 16;
function Pm(e, t, n) {
  return Math.min(n, Math.max(t, e));
}
function Ys(e, t) {
  const n = Math.max(
    kr,
    window.innerHeight - t - kr
  );
  return Pm(e, kr, n);
}
function Om() {
  try {
    const e = window.localStorage.getItem(Xc);
    if (!e) return null;
    const t = Number(e);
    return Number.isFinite(t) ? t : null;
  } catch {
    return null;
  }
}
function _m(e) {
  try {
    window.localStorage.setItem(Xc, String(e));
  } catch {
  }
}
const km = ({
  onOpen: e
}) => {
  const t = Fe(null), n = Fe({
    pointerId: null,
    startY: 0,
    startTop: 0,
    moved: !1
  }), [r, o] = Re(
    () => typeof window > "u" ? null : Om()
  ), s = Fe(r), i = Fe(!1), [c, a] = Re(!1), [l, u] = Re(!1);
  Ke(() => {
    s.current = r;
  }, [r]), Ke(() => {
    const f = t.current;
    if (!f) return;
    const m = () => {
      o((g) => {
        const w = Ys(g ?? Ks, f.offsetHeight);
        return s.current = w, w;
      });
    };
    return m(), window.addEventListener("resize", m), () => window.removeEventListener("resize", m);
  }, []);
  const d = (f) => {
    if (f.button !== 0) return;
    const m = f.currentTarget, g = m.getBoundingClientRect();
    n.current = {
      pointerId: f.pointerId,
      startY: f.clientY,
      startTop: g.top,
      moved: !1
    };
    try {
      m.setPointerCapture(f.pointerId);
    } catch {
    }
  }, p = (f) => {
    if (n.current.pointerId !== f.pointerId) return;
    const m = f.clientY - n.current.startY;
    if (!n.current.moved && Math.abs(m) < Im) return;
    n.current.moved = !0, a(!0);
    const g = Ys(
      n.current.startTop + m,
      f.currentTarget.offsetHeight
    );
    s.current = g, o(g);
  }, h = (f) => {
    var g, v;
    if (n.current.pointerId !== f.pointerId) return;
    try {
      (v = (g = f.currentTarget).hasPointerCapture) != null && v.call(g, f.pointerId) && f.currentTarget.releasePointerCapture(f.pointerId);
    } catch {
    }
    const m = n.current.moved;
    n.current.pointerId = null, n.current.moved = !1, a(!1), m && (i.current = !0, s.current != null && _m(s.current));
  };
  return /* @__PURE__ */ $(
    "button",
    {
      ref: t,
      type: "button",
      onPointerDown: d,
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
        top: r ?? Ks,
        transform: void 0
      },
      children: [
        /* @__PURE__ */ b("img", { src: wo, alt: "", className: "embedded-trigger-icon", "aria-hidden": "true" }),
        /* @__PURE__ */ b("span", { className: "embedded-trigger-label", children: "Assistant" })
      ]
    }
  );
}, Xs = ({
  defaultOpen: e = !1,
  open: t,
  onOpenChange: n,
  showTrigger: r = !0,
  envStage: o,
  envPulse: s = !0
}) => {
  const [i, c] = Re(e), a = t ?? i, l = (u) => {
    n == null || n(u), t === void 0 && c(u);
  };
  return Ke(() => {
    if (a) {
      window.history.pushState({ vpsChatOpen: !0 }, "");
      const u = () => {
        l(!1);
      };
      return window.addEventListener("popstate", u), () => {
        window.removeEventListener("popstate", u);
      };
    }
  }, [a]), /* @__PURE__ */ $(Ut, { children: [
    r && !a && /* @__PURE__ */ b(km, { onOpen: () => l(!0) }),
    /* @__PURE__ */ b(
      xm,
      {
        open: a,
        onClose: () => l(!1),
        envStage: o,
        envPulse: s
      }
    )
  ] });
}, Lm = ({
  apiBaseUrl: e,
  apiUrl: t,
  proxyUrl: n,
  userContext: r,
  role: o,
  roleId: s,
  client: i,
  service: c,
  welcomeMessage: a,
  suggestions: l,
  disableSuggestions: u,
  initialMessage: d,
  hideInspectSources: p,
  showGroundedSources: h,
  modelId: f,
  ...m
}) => {
  const g = ro(), v = e ?? t ?? n;
  return !!g && (!v || Lt(v) === Lt(g == null ? void 0 : g.apiBaseUrl)) && !r && o === void 0 && s === void 0 && i === void 0 && c === void 0 && a === void 0 && !l && u === void 0 && !d && p === void 0 && h === void 0 && f === void 0 ? /* @__PURE__ */ b(Xs, { ...m }) : /* @__PURE__ */ b(
    ti,
    {
      apiBaseUrl: v,
      userContext: r,
      role: o,
      roleId: s,
      client: i,
      service: c,
      welcomeMessage: a,
      suggestions: l,
      disableSuggestions: u,
      initialMessage: d,
      hideInspectSources: p,
      showGroundedSources: h,
      modelId: f,
      children: /* @__PURE__ */ b(Xs, { ...m })
    }
  );
}, Bm = {
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
  la as CUSTOMER_PORTAL_ROLES,
  Yc as ChatPanel,
  ti as ChatProvider,
  Fm as ChatbotWidget,
  Bm as ColorPalette,
  Lm as EmbeddedChatbot,
  pr as buildApiUrl,
  Dm as chatApi,
  Zs as createChatApi,
  Lt as resolveApiBaseUrl,
  da as useChatContext,
  tr as useChatbot,
  ro as useOptionalChatContext
};
