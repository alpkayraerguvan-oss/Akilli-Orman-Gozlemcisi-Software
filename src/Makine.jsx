import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Shell } from "./SiteNav.jsx";
import { STATION_ID } from "./config.js";
import { useLang } from "./lang.js";
import { supabase } from "./supabase.js";
import {
  ALARM_MODES,
  addPlugin,
  pluginAdded,
  readPlugins,
  removePlugin,
  writePlugins,
} from "./pluginStore.js";
import "./site.css";
import "./makine.css";

function scoreLabel(live) {
  if (live.score == null) return "-";
  return live.score.toLocaleString("tr-TR", {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  });
}

function scoreState(live, m) {
  if (live.model === "logreg-wait") return m.bekliyor;
  if (live.model === "logreg") return m.egitildi;
  if (live.score == null) return m.yok;
  return "";
}

export default function Makine({ product = "software" }) {
  const { copy } = useLang();
  const m = copy.makine;
  const [plug, setPlug] = useState(() => readPlugins());
  const [note, setNote] = useState("");
  const [live, setLive] = useState({ score: null, model: "" });
  const on = pluginAdded(plug, "ml");
  const MODE_LABEL = {
    sabit: m.sabit,
    takvim: m.takvim,
    yalniz_ml: m.yalniz,
  };

  useEffect(() => {
    let ignore = false;
    supabase
      .from("scores")
      .select("score,model")
      .eq("station_id", STATION_ID)
      .order("created_at", { ascending: false })
      .limit(1)
      .then(({ data, error }) => {
        if (ignore || error || !data?.[0]) return;
        const n = Number(data[0].score);
        setLive({
          score: Number.isFinite(n) ? n : 0,
          model: String(data[0].model || ""),
        });
      })
      .catch(() => {});
    return () => {
      ignore = true;
    };
  }, []);

  function commit(patch) {
    const next = writePlugins({ commissionedAt: plug.commissionedAt, ...patch });
    setPlug(next);
    setNote(m.kaydedildi);
  }

  function saveDate(e) {
    e.preventDefault();
    commit({ commissionedAt: String(plug.commissionedAt || "").slice(0, 32) });
  }

  return (
    <Shell product={product}>
      <article className="coat-page ml-page">
        <header className="ml-head">
          <h1>{m.h1}</h1>
        </header>

        <p>{m.how}</p>

        <section className="ml-set" aria-labelledby="ml-set-title">
          <h2 id="ml-set-title">{m.ayar}</h2>

          <div className="ml-field">
            <span>{m.eklenti}</span>
            {on ? (
              <button
                type="button"
                className="hit ghost"
                onClick={() => {
                  setPlug(removePlugin("ml"));
                  setNote(m.kapandi);
                }}
              >
                {m.kapat}
              </button>
            ) : (
              <button
                type="button"
                className="hit"
                onClick={() => {
                  setPlug(addPlugin("ml"));
                  setNote(m.acildi);
                }}
              >
                {m.ac}
              </button>
            )}
          </div>

          <div className="ml-field">
            <span id="ml-alarm-label">{m.alarm}</span>
            <div className="ml-kips" role="group" aria-labelledby="ml-alarm-label">
              {ALARM_MODES.map((mode) => (
                <button
                  key={mode}
                  type="button"
                  disabled={!on}
                  aria-pressed={on && plug.alarmMode === mode}
                  className={on && plug.alarmMode === mode ? "is-on" : undefined}
                  onClick={() => on && commit({ alarmMode: mode })}
                >
                  {MODE_LABEL[mode]}
                </button>
              ))}
            </div>
          </div>

          {on && plug.alarmMode === "takvim" ? (
            <form className="ml-field ml-date" onSubmit={saveDate}>
              <label htmlFor="commissioned-at">{m.kurulu}</label>
              <input
                id="commissioned-at"
                name="kurulu"
                type="date"
                value={String(plug.commissionedAt || "").slice(0, 10)}
                onChange={(e) => setPlug({ ...plug, commissionedAt: e.target.value })}
              />
              <button type="submit" className="hit ghost">
                {m.kaydet}
              </button>
            </form>
          ) : null}

          <div className="ml-field">
            <span>{m.skor}</span>
            <p className="ml-score">
              <b>{scoreLabel(live)}</b>
              {scoreState(live, m) ? <span>{scoreState(live, m)}</span> : null}
            </p>
          </div>
        </section>

        {note ? (
          <p className="ml-note" role="status">
            {note}
          </p>
        ) : null}

        <nav className="coat-next" aria-label={copy.home.next}>
          <Link className="fold-go" to="/dashboard">
            {m.pano}
          </Link>
        </nav>
      </article>
    </Shell>
  );
}
