import { asChatKip, cleanReply, mdReply } from "../src/chatStore.js";
import { INJECTION_HINT, looksLikeInjection, sanitizeUser } from "../src/chatGuard.js";

export const config = { runtime: "edge" };

function json(status, payload, extraHeaders) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...extraHeaders },
  });
}

// Best-effort per-warm-instance rate limit (edge instances aren't shared
// across regions, but this still blunts a single-source burst/loop).
const WINDOW_MS = 10_000;
const MAX_PER_WINDOW = 8;
const hits = new Map();

function clientIp(request) {
  const fwd =
    request.headers.get("x-real-ip") || request.headers.get("x-forwarded-for") || "";
  return fwd.split(",")[0].trim() || "unknown";
}

function tooMany(ip) {
  const now = Date.now();
  const arr = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  arr.push(now);
  hits.set(ip, arr);
  if (hits.size > 5000) hits.clear();
  return arr.length > MAX_PER_WINDOW;
}

function lastUser(payload) {
  const msgs = payload && Array.isArray(payload.messages) ? payload.messages : [];
  for (let i = msgs.length - 1; i >= 0; i -= 1) {
    const row = msgs[i];
    if (row && row.role === "user") return String(row.content || "").trim();
  }
  return "";
}

export default async function handler(request) {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204 });
  }
  if (request.method === "GET") {
    return json(200, { ok: true, kips: ["hizli", "orta", "derin"] });
  }
  if (request.method !== "POST") {
    return json(405, { error: { message: "İstek okunamadı. Soruyu kısaltıp yeniden gönder." } });
  }
  if (tooMany(clientIp(request))) {
    return json(
      429,
      { error: { message: "Çok sık istek. Biraz sonra tekrar dene." } },
      { "Retry-After": "10" },
    );
  }
  let payload;
  try {
    payload = await request.json();
  } catch {
    return json(400, { error: { message: "İstek okunamadı. Soruyu kısaltıp yeniden gönder." } });
  }
  if (!payload || typeof payload !== "object") {
    return json(400, { error: { message: "İstek okunamadı. Soruyu kısaltıp yeniden gönder." } });
  }
  const question = sanitizeUser(lastUser(payload));
  if (!question) {
    return json(400, { error: { message: "İstek okunamadı. Soruyu kısaltıp yeniden gönder." } });
  }
  if (looksLikeInjection(question)) {
    return json(400, { error: { message: INJECTION_HINT } });
  }
  const kip = asChatKip(payload.model);
  return json(200, {
    model: kip,
    choices: [{ message: { role: "assistant", content: cleanReply(mdReply(question), question) } }],
  });
}
