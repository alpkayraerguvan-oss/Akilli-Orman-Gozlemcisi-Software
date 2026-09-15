import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useUser } from "@clerk/react";
import { useLang } from "./lang.js";
import { Shell } from "./SiteNav.jsx";
import {
  asChatKip,
  CHAT_KIPS,
  chatModel,
  kipTemp,
  kipTokens,
  mdReply,
  newThreadId,
  readKip,
  readThreads,
  cleanReply,
  titleFromQuestion,
  writeKip,
  writeThreads,
} from "./chatStore.js";
import { chatLoadHint } from "./chatHint.js";
import { INJECTION_HINT, looksLikeInjection } from "./chatGuard.js";
import "./site.css";
import "./asistan.css";

async function askPi(question, kip, signal) {
  let res;
  try {
    res = await fetch("/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal,
      body: JSON.stringify({
        model: chatModel(kip),
        messages: [{ role: "user", content: question }],
        max_tokens: kipTokens(kip),
        temperature: kipTemp(kip),
      }),
    });
  } catch (err) {
    if (isAbort(err)) throw err;
    const fail = new Error(err?.message || "Failed to fetch");
    fail.status = 0;
    throw fail;
  }
  if (!res.ok) {
    let detail = "";
    try {
      const fail = await res.json();
      detail = String(fail?.error?.message || fail?.error || "").trim();
    } catch {
      /* not json */
    }
    const fail = new Error(detail || "Failed to fetch");
    fail.status = res.status;
    throw fail;
  }
  let data;
  try {
    data = await res.json();
  } catch (err) {
    if (isAbort(err)) throw err;
    const fail = new Error("Failed to fetch");
    fail.status = 502;
    throw fail;
  }
  const msg = data?.choices?.[0]?.message || {};
  return cleanReply(msg.content, question);
}

async function askChat(question, kip, signal) {
  const local = cleanReply(mdReply(question), question);
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 2500);
  const onParent = () => ctrl.abort();
  signal?.addEventListener("abort", onParent);
  const canceled = () => {
    const err = new Error("Aborted");
    err.name = "AbortError";
    return err;
  };
  try {
    if (signal?.aborted) throw canceled();
    const raw = await askPi(question, kip, ctrl.signal);
    if (signal?.aborted) throw canceled();
    const text = String(raw || "").trim();
    if (text) return text;
    return local;
  } catch (err) {
    if (signal?.aborted) throw canceled();
    return local;
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", onParent);
  }
}

function isAbort(err) {
  return err?.name === "AbortError";
}

export default function Asistan({ product = "software" }) {
  const { copy } = useLang();
  const { user } = useUser();
  const userId = user?.id || "";
  const [params, setParams] = useSearchParams();
  const [kip, setKip] = useState("hizli");
  const [threads, setThreads] = useState([]);
  const [activeId, setActiveId] = useState("");
  const [q, setQ] = useState("");
  const [busyId, setBusyId] = useState("");
  const [err, setErr] = useState({ id: "", text: "" });
  const endRef = useRef(null);
  const aliveRef = useRef(true);
  const inflight = useRef(new Map());

  useEffect(() => {
    aliveRef.current = true;
    return () => {
      aliveRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!userId) return;
    const saved = readThreads(userId);
    setThreads(saved);
    setActiveId(saved[0]?.id || "");
    setErr({ id: "", text: "" });
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    const fromUrl = params.get("kip");
    const value = asChatKip(fromUrl || readKip(userId));
    setKip(value);
    writeKip(value, userId);
    if (fromUrl !== value) setParams({ kip: value }, { replace: true });
  }, [userId, params, setParams]);

  const active = useMemo(
    () => threads.find((row) => row.id === activeId) || null,
    [threads, activeId],
  );
  const lines = active?.lines || [];
  const waiting = busyId === activeId && Boolean(activeId);
  const shownErr = err.text && err.id === activeId ? err.text : "";

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [lines.length, waiting]);

  function saveThreads(next) {
    const saved = writeThreads(next, userId);
    if (aliveRef.current) setThreads(saved);
    return saved;
  }

  function pickKip(next) {
    const value = writeKip(next, userId);
    setKip(value);
    setParams({ kip: value }, { replace: true });
  }

  function startThread() {
    const id = newThreadId();
    setThreads((prev) =>
      writeThreads([{ id, title: "Yeni sohbet", kip, lines: [] }, ...prev], userId),
    );
    setActiveId(id);
    setErr({ id: "", text: "" });
    setQ("");
  }

  function dropThread(id) {
    if (!window.confirm("Bu sohbet silinsin mi?")) return;
    inflight.current.get(id)?.abort();
    inflight.current.delete(id);
    if (busyId === id) setBusyId("");
    const next = writeThreads(
      threads.filter((row) => row.id !== id),
      userId,
    );
    setThreads(next);
    if (id === activeId) setActiveId(next[0]?.id || "");
    if (err.id === id) setErr({ id: "", text: "" });
  }

  async function onAsk(e) {
    e.preventDefault();
    const text = q.trim();
    const id = activeId || newThreadId();
    if (!text || busyId === id) return;
    setQ("");
    setErr({ id: "", text: "" });
    inflight.current.get(id)?.abort();
    const ac = new AbortController();
    inflight.current.set(id, ac);
    setBusyId(id);
    if (!activeId) setActiveId(id);
    setThreads((prev) => {
      const has = prev.some((row) => row.id === id);
      const list = has
        ? prev
        : [{ id, title: titleFromQuestion(text), kip, lines: [] }, ...prev];
      return writeThreads(
        list.map((row) =>
          row.id === id
            ? {
                ...row,
                title: row.lines.length ? row.title : titleFromQuestion(text),
                kip,
                lines: [...row.lines, { who: "sen", text }],
              }
            : row,
        ),
        userId,
      );
    });
    if (looksLikeInjection(text)) {
      inflight.current.delete(id);
      setBusyId((cur) => (cur === id ? "" : cur));
      setErr({ id, text: chatLoadHint(400, INJECTION_HINT) });
      return;
    }
    try {
      const raw = await askChat(text, kip, ac.signal);
      const reply =
        String(raw || "").trim() ||
        "Asistan boş yanıt döndürdü. Hızlı cevapları dene.";
      saveThreads(
        readThreads(userId).map((row) =>
          row.id === id ? { ...row, lines: [...row.lines, { who: "pi", text: reply }] } : row,
        ),
      );
    } catch (e) {
      if (isAbort(e)) return;
      const reply = cleanReply(mdReply(text), text);
      saveThreads(
        readThreads(userId).map((row) =>
          row.id === id ? { ...row, lines: [...row.lines, { who: "pi", text: reply }] } : row,
        ),
      );
    } finally {
      if (inflight.current.get(id) === ac) inflight.current.delete(id);
      setBusyId((cur) => (cur === id ? "" : cur));
    }
  }

  function onComposerKey(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      e.currentTarget.form?.requestSubmit();
    }
  }

  return (
    <Shell product={product} footer={false}>
      <div className="owui">
        <aside className="owui-side">
          <button type="button" className="owui-new" onClick={startThread}>
            Yeni sohbet
          </button>
          <p className="owui-side-label">Sohbetler</p>
          <nav className="owui-chats" aria-label="Sohbetler">
            {threads.length ? (
              threads.map((row) => (
                <div
                  key={row.id}
                  className={row.id === activeId ? "owui-chat is-on" : "owui-chat"}
                >
                  <button
                    type="button"
                    className="owui-chat-open"
                    aria-current={row.id === activeId ? "true" : undefined}
                    onClick={() => setActiveId(row.id)}
                  >
                    {row.title}
                  </button>
                  <button
                    type="button"
                    className="owui-chat-drop"
                    aria-label={`${row.title} sohbetini sil`}
                    onClick={() => dropThread(row.id)}
                  >
                    Sil
                  </button>
                </div>
              ))
            ) : (
              <p className="owui-muted">Kayıtlı sohbet yok.</p>
            )}
          </nav>
        </aside>

        <section className="owui-main">
          <header className="owui-bar">
            <div className="owui-models" role="group" aria-label="Yanıt kipi">
              {CHAT_KIPS.map((id) => (
                <button
                  key={id}
                  type="button"
                  className={kip === id ? "is-on" : undefined}
                  aria-pressed={kip === id}
                  onClick={() => pickKip(id)}
                >
                  {copy.asistan[id]}
                </button>
              ))}
            </div>
          </header>

          <div className="owui-thread">
            {lines.length ? (
              <ul className="owui-log">
                {lines.map((line, i) => (
                  <li
                    key={`${line.who}-${i}`}
                    className={line.who === "sen" ? "owui-msg is-user" : "owui-msg is-bot"}
                  >
                    <span className="owui-who">{line.who === "sen" ? "Sen" : "Asistan"}</span>
                    <p>{line.text}</p>
                  </li>
                ))}
                {waiting ? (
                  <li className="owui-msg is-bot is-wait" aria-live="polite">
                    <span className="owui-who">Asistan</span>
                    <p>Yanıt hazırlanıyor…</p>
                  </li>
                ) : null}
              </ul>
            ) : (
              <div className="owui-empty">
                <h1>Asistan</h1>
                <p>
                  Kutunun ölçümleri, alarm kuralı ve kaplama hakkında soru
                  sorabilirsin. Asistan alarm yazmaz.
                </p>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {shownErr ? (
            <p className="owui-alert" role="alert">
              {shownErr}
            </p>
          ) : null}

          <form className="owui-composer" onSubmit={onAsk}>
            <label className="visually-hidden" htmlFor="ask-pi">
              Soru
            </label>
            <textarea
              id="ask-pi"
              name="soru"
              rows={1}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={onComposerKey}
              placeholder="Sorunu yaz"
              autoComplete="off"
              disabled={waiting}
            />
            <button type="submit" className="hit" disabled={waiting || !q.trim()}>
              {waiting ? "…" : "Gönder"}
            </button>
          </form>
        </section>
      </div>
    </Shell>
  );
}
