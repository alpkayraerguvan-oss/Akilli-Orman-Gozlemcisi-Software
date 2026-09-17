import { parseStation } from "./stationPair.js";

// SECURITY: unsafeMetadata is writable by the signed-in user themselves via
// the Clerk client SDK, so it is an unverified client claim, not a proof of
// station ownership. It is safe today only because supabase/schema.sql's RLS
// ignores it and hard-locks every anon/authenticated read to
// station_id = 'AOG-DEMO-1'. Before any RLS policy trusts a per-station
// identity, that identity must come from a server-verified table (e.g.
// user_stations, populated by a trusted backend path) — never from
// unsafeMetadata directly — or a signed-in user could bind themselves to,
// and read, someone else's station.
export function stationFromUser(user) {
  const meta = user?.unsafeMetadata;
  return parseStation(String(meta?.stationId || ""));
}

export async function bindStationToUser(user, raw) {
  const stationId = parseStation(raw);
  if (!user || !stationId) return "";
  await user.update({
    unsafeMetadata: { ...user.unsafeMetadata, stationId },
  });
  return stationId;
}
