import snapshot from "@/data/events-snapshot.json";
import { scrapeSF, type SFEvent } from "@/lib/events";

export const runtime = "nodejs";
export const maxDuration = 300;

// Per-instance cache so repeated live scrapes for the same week don't re-run Apify.
const cache = new Map<string, { at: number; events: SFEvent[] }>();
const TTL = 6 * 60 * 60 * 1000;

function inRange(e: SFEvent, from: string, to: string) {
  const t = new Date(e.start).getTime();
  return t >= new Date(`${from}T00:00:00-08:00`).getTime() && t <= new Date(`${to}T23:59:59-08:00`).getTime();
}

// GET /api/events?from=YYYY-MM-DD&to=YYYY-MM-DD[&live=1]
// Default serves the last scraped snapshot (instant); live=1 runs the Apify scrapers (~1-3 min).
export async function GET(req: Request) {
  const url = new URL(req.url);
  const from = url.searchParams.get("from") ?? new Date().toISOString().slice(0, 10);
  const to = url.searchParams.get("to") ?? from;
  const live = url.searchParams.get("live") === "1";

  const snap = (snapshot as SFEvent[]).filter((e) => inRange(e, from, to));
  if (!live || !process.env.APIFY_TOKEN) return Response.json({ source: "snapshot", events: snap });

  const key = `${from}:${to}`;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < TTL) return Response.json({ source: "cache", events: hit.events });

  const events = await scrapeSF(from, to);
  cache.set(key, { at: Date.now(), events });
  return Response.json({ source: "live", scrapedAt: new Date().toISOString(), events });
}
