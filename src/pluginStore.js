const KEY = "aog-plugins-v1";

export const ALARM_MODES = ["sabit", "takvim", "yalniz_ml"];

export const PLUGIN_CATALOG = [
  {
    id: "hop",
    title: "Mesh sistemi",
    body: "ESP32-S3, 433 MHz AOG paketini bir kez hop=1 ile tekrarlar.",
  },
  {
    id: "pi",
    title: "Asistan",
    body: "Sorular Asistan sayfasından gider. Asistan alarm yazmaz.",
  },
  {
    id: "ml",
    title: "Makine öğrenmesi",
    body: "Karar takvimi Öğrenme sayfasındadır. İlk iki ay sabit karar kullanılır. İkinci aydan sonra dinamik algoritma, altıncı aydan sonra öğrenme kararlara katılır; sekizinci aya kadar payı artar. On ikinci ayda sabit karar ve dinamik algoritma kapanır.",
  },
];

const PLUGIN_IDS = PLUGIN_CATALOG.map((p) => p.id);

export function defaultPlugins() {
  return {
    version: 1,
    hopOn: false,
    hopNote: "",
    piOn: false,
    piUrl: "",
    alarmMode: "sabit",
    commissionedAt: "",
    added: [],
  };
}

function asMode(raw) {
  return ALARM_MODES.includes(raw) ? raw : "sabit";
}

function asAdded(raw, parsed) {
  const fromStore = Array.isArray(raw) ? raw : null;
  const ids = fromStore
    ? fromStore.filter((id) => PLUGIN_IDS.includes(id))
    : [
        parsed?.hopOn ? "hop" : null,
        parsed?.piOn ? "pi" : null,
        parsed?.alarmMode && parsed.alarmMode !== "sabit" ? "ml" : null,
      ].filter(Boolean);
  return [...new Set(ids)];
}

export function pluginAdded(plug, id) {
  return (plug?.added || []).includes(id);
}

export function alarmModeFor(plug) {
  if (!pluginAdded(plug, "ml")) return "sabit";
  return asMode(plug?.alarmMode);
}

export function readPlugins() {
  const base = defaultPlugins();
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) || "");
    if (!parsed || parsed.version !== 1) return base;
    const added = asAdded(parsed.added, parsed);
    return {
      ...base,
      hopOn: added.includes("hop") ? Boolean(parsed.hopOn) : false,
      hopNote: String(parsed.hopNote || "").slice(0, 80),
      piOn: added.includes("pi") ? Boolean(parsed.piOn) : false,
      piUrl: String(parsed.piUrl || "").slice(0, 200),
      alarmMode: asMode(parsed.alarmMode),
      commissionedAt: String(parsed.commissionedAt || "").slice(0, 32),
      added,
    };
  } catch {
    return base;
  }
}

export function asHttpUrl(raw) {
  const t = String(raw || "").trim();
  if (!t) return "";
  try {
    const u = new URL(t);
    if (u.protocol !== "http:" && u.protocol !== "https:") return "";
    if (u.username || u.password) return "";
    return `${u.protocol}//${u.host}`;
  } catch {
    return "";
  }
}

export function writePlugins(next) {
  const cur = readPlugins();
  const added = asAdded(next.added ?? cur.added, { ...cur, ...next });
  const out = {
    ...cur,
    ...next,
    version: 1,
    added,
    hopOn: added.includes("hop") ? Boolean(next.hopOn ?? cur.hopOn) : false,
    piOn: added.includes("pi") ? Boolean(next.piOn ?? cur.piOn) : false,
    alarmMode: asMode(next.alarmMode ?? cur.alarmMode),
  };
  try {
    localStorage.setItem(KEY, JSON.stringify(out));
  } catch {
    // Private browsing / quota-exceeded: keep the in-memory value, drop persistence.
  }
  return out;
}

export function addPlugin(id) {
  if (!PLUGIN_IDS.includes(id)) return readPlugins();
  const cur = readPlugins();
  if (cur.added.includes(id)) return cur;
  const patch = { added: [...cur.added, id] };
  if (id === "hop") patch.hopOn = true;
  if (id === "pi") patch.piOn = true;
  return writePlugins(patch);
}

export function removePlugin(id) {
  const cur = readPlugins();
  const patch = { added: cur.added.filter((x) => x !== id) };
  if (id === "hop") patch.hopOn = false;
  if (id === "pi") patch.piOn = false;
  if (id === "ml") patch.alarmMode = "sabit";
  return writePlugins(patch);
}
