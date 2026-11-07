// Live SF events from Luma and Partiful, scraped with Apify actors.
export type SFEvent = {
  source: "Luma" | "Partiful";
  title: string;
  url: string;
  start: string; // ISO
  end: string | null;
  venue: string | null;
  neighborhood: string | null;
  lat: number | null;
  lng: number | null;
  going: number | null;
  cover: string | null;
};

const APIFY = "https://api.apify.com/v2/acts";

async function runActor(actor: string, input: unknown, timeoutSecs: number): Promise<unknown[]> {
  const res = await fetch(`${APIFY}/${actor}/run-sync-get-dataset-items?timeout=${timeoutSecs}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.APIFY_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(`${actor}: ${res.status}`);
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

type LumaRow = {
  name: string;
  eventUrl: string;
  startAt: string;
  endAt?: string;
  coverUrl?: string;
  guestCount?: number;
  location?: { name?: string; neighborhood?: string; city?: string; latitude?: number; longitude?: number; isVirtual?: boolean };
};

type PartifulRow = {
  title: string;
  url: string;
  startDate: string;
  endDate?: string;
  coverImageUrl?: string;
  goingCount?: number;
  location?: string | { name?: string; address?: string; neighborhood?: string; latitude?: number; longitude?: number } | null;
};

export function normalizeLuma(rows: unknown[]): SFEvent[] {
  return (rows as LumaRow[])
    .filter((r) => r?.name && r.location && !r.location.isVirtual)
    .map((r) => ({
      source: "Luma",
      title: r.name,
      url: r.eventUrl,
      start: r.startAt,
      end: r.endAt ?? null,
      venue: r.location?.name ?? null,
      neighborhood: r.location?.neighborhood ?? r.location?.city ?? null,
      lat: r.location?.latitude ?? null,
      lng: r.location?.longitude ?? null,
      going: r.guestCount ?? null,
      cover: r.coverUrl ?? null,
    }));
}

// Partiful only returns a text address, so we geocode it with OpenStreetMap Nominatim (max 1 req/s).
async function geocode(q: string): Promise<[number, number] | null> {
  try {
    const r = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`, {
      headers: { "User-Agent": "sf-landing/1.0 (hackathon demo)" },
    });
    const d = (await r.json()) as { lat: string; lon: string }[];
    return d[0] ? [Number(d[0].lat), Number(d[0].lon)] : null;
  } catch {
    return null;
  }
}

export async function normalizePartiful(rows: unknown[], maxGeocode = 20): Promise<SFEvent[]> {
  const out: SFEvent[] = [];
  let geocoded = 0;
  for (const r of rows as PartifulRow[]) {
    if (!r?.title || !r.url) continue;
    const addr = typeof r.location === "string" ? r.location : (r.location?.address ?? null);
    let coords: [number, number] | null = null;
    if (addr && geocoded < maxGeocode) {
      geocoded++;
      coords = await geocode(addr);
      await new Promise((ok) => setTimeout(ok, 1100));
    }
    out.push({
      source: "Partiful",
      title: r.title,
      url: r.url,
      start: r.startDate,
      end: r.endDate ?? null,
      venue: addr ? addr.split(",")[0] : null,
      neighborhood: null,
      lat: coords?.[0] ?? null,
      lng: coords?.[1] ?? null,
      going: r.goingCount ?? null,
      cover: r.coverImageUrl ?? null,
    });
  }
  return out;
}

export async function scrapeSF(from: string, to: string): Promise<SFEvent[]> {
  const [luma, partiful] = await Promise.allSettled([
    runActor(
      "solidcode~luma-scraper",
      { discoverCity: "sf", category: "tech", dateFrom: from, dateTo: to, eventType: "in_person", scrapeEventDetails: false, maxResults: 80, maxEventsPerUrl: 80 },
      200,
    ),
    runActor("heliostech~partiful-event-scraper", { cities: ["sf"], maxEventsPerCity: 40, fetchEventDetails: true }, 200),
  ]);
  const events = [
    ...(luma.status === "fulfilled" ? normalizeLuma(luma.value) : []),
    ...(partiful.status === "fulfilled" ? await normalizePartiful(partiful.value) : []),
  ];
  const lo = new Date(`${from}T00:00:00-08:00`).getTime();
  const hi = new Date(`${to}T23:59:59-08:00`).getTime();
  return events
    .filter((e) => {
      const t = new Date(e.start).getTime();
      return t >= lo && t <= hi;
    })
    .sort((a, b) => a.start.localeCompare(b.start));
}
