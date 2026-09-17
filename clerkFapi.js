export const CLERK_FAPI = "https://frontend-api.clerk.dev";
export const CLERK_PROXY_URL =
  "https://akilli-orman-gozlemcisi-software.vercel.app/__clerk";

const DROP = new Set([
  "host",
  "connection",
  "content-length",
  "transfer-encoding",
  "keep-alive",
]);

const CORS_DROP = [
  "access-control-allow-origin",
  "access-control-allow-credentials",
  "access-control-allow-headers",
  "access-control-allow-methods",
  "access-control-expose-headers",
];

const RESPONSE_DROP = [
  ...CORS_DROP,
  "content-encoding",
  "content-length",
  "transfer-encoding",
  "content-security-policy",
  "content-security-policy-report-only",
];

const FAPI_ORIGIN = new URL(CLERK_FAPI).origin;

export function clerkFapiDest(requestUrl) {
  const url = new URL(requestUrl, CLERK_PROXY_URL);
  const rest = url.pathname
    .replace(/^\/api\/clerk-proxy/, "")
    .replace(/^\/__clerk/, "")
    .replace(/^\/+/, "");
  const dest = new URL(CLERK_FAPI);
  dest.pathname = `/${rest}`;
  dest.search = url.search;
  if (dest.origin !== FAPI_ORIGIN) {
    throw new Error("Clerk dest");
  }
  return dest;
}

export function clerkClientIp(request) {
  const vercel = (
    request.headers.get("x-real-ip") ||
    request.headers.get("x-vercel-forwarded-for") ||
    ""
  ).trim();
  if (vercel) return vercel.split(",")[0].trim();
  return (request.headers.get("x-forwarded-for") || "").split(",")[0].trim();
}

export function clerkFapiHeaders(request, secret) {
  const headers = new Headers();
  for (const [key, value] of request.headers.entries()) {
    if (DROP.has(key.toLowerCase())) continue;
    headers.set(key, value);
  }
  headers.set("Clerk-Proxy-Url", process.env.CLERK_PROXY_URL || CLERK_PROXY_URL);
  headers.set("Clerk-Secret-Key", secret);
  const ip = clerkClientIp(request);
  if (ip) headers.set("X-Forwarded-For", ip);
  return headers;
}

export async function clerkFapiRequestInit(request, secret) {
  const headers = clerkFapiHeaders(request, secret);
  const init = {
    method: request.method,
    headers,
    redirect: "manual",
  };
  if (request.method !== "GET" && request.method !== "HEAD") {
    init.body = await request.arrayBuffer();
  }
  return init;
}

export function clerkFapiFollow(method, dest) {
  return method === "GET" && dest.pathname.startsWith("/npm/");
}

export function clerkFapiLocation(location) {
  const raw = String(location || "");
  return raw.replace(/https:\/\/frontend-api\.clerk\.(dev|services)/i, CLERK_PROXY_URL);
}

const ALLOWED_ORIGINS = new Set([
  "https://akilli-orman-gozlemcisi-software.vercel.app",
  ...(process.env.CLERK_PROXY_ALLOWED_ORIGINS || "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean),
]);

export function clerkFapiResponseHeaders(upstream, request) {
  const out = new Headers(upstream);
  for (const name of RESPONSE_DROP) out.delete(name);
  const origin = request.headers.get("origin");
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    out.set("Access-Control-Allow-Origin", origin);
    out.set("Access-Control-Allow-Credentials", "true");
    out.set("Vary", "Origin");
  }
  const loc = out.get("Location") || out.get("location");
  if (loc) out.set("Location", clerkFapiLocation(loc));
  return out;
}
