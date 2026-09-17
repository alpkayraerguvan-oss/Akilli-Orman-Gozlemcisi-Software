import { asStationId } from "./stationPair.js";

// Never hardcode a real project URL/key here — a fork/clone that forgets to
// set env vars would otherwise talk to production by default. Fail loudly
// instead, same policy as NTFY_TOPIC below.
export const supabaseUrl = String(
  import.meta.env.VITE_SUPABASE_URL ||
    import.meta.env.NEXT_PUBLIC_Akilli_Orman_Gozlemcisi_SUPABASE_URL ||
    "",
).trim();
if (!supabaseUrl) {
  throw new Error("VITE_SUPABASE_URL is not set");
}

export const supabaseAnon = String(
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
    import.meta.env.NEXT_PUBLIC_Akilli_Orman_Gozlemcisi_SUPABASE_ANON_KEY ||
    "",
).trim();
if (!supabaseAnon) {
  throw new Error("VITE_SUPABASE_ANON_KEY is not set");
}

export const STATION_ID = asStationId(import.meta.env.VITE_STATION_ID) || "AOG-DEMO-1";

// ntfy.sh topics are publish credentials: anyone who knows the name can post.
// Never hardcode one here; set VITE_NTFY_TOPIC in the deploy environment.
export const NTFY_TOPIC = String(
  import.meta.env.VITE_NTFY_TOPIC || import.meta.env.NEXT_PUBLIC_NTFY_TOPIC || "",
).trim();

export { DISPLAY_PIN, withDisplayPin } from "./displayPin.js";
