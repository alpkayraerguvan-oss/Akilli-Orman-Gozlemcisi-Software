import { asChatKip, cleanReply, mdReply } from "../src/chatStore.js";
import { INJECTION_HINT, looksLikeInjection, sanitizeUser } from "../src/chatGuard.js";

export const config = { runtime: "edge" };

function json(status, payload) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
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
