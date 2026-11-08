"use client";

import { ExternalLink, MapPin, Star, TriangleAlert } from "lucide-react";
import { useState } from "react";
import Pager, { PAGE_SIZE } from "@/components/ui/Pager";
import stays from "@/data/stays.json";

type Stay = {
  name: string;
  kind: "Hostel" | "Hotel";
  street: string | null;
  neighborhood: string;
  perNight: number;
  total: number;
  rating: number | null;
  reviews: number | null;
  image: string | null;
  url: string;
  caution: boolean;
};

const FILTERS = ["All", "Hostels", "Hotels", "Nob Hill"] as const;
type Filter = (typeof FILTERS)[number];

// Other ways to find a place for a few weeks, each a real link.
const MORE = [
  { name: "Hacker houses", note: "Live with builders; found via X and Luma posts", url: "https://x.com/search?q=hacker%20house%20sf&f=live" },
  { name: "Furnished Finder", note: "Furnished 1–3 month rentals", url: "https://www.furnishedfinder.com/housing/San-Francisco/California" },
  { name: "Craigslist sublets", note: "Cheapest, but never wire money before a video tour", url: "https://sfbay.craigslist.org/search/sfc/sub" },
];

export default function StaySpaces() {
  const [filter, setFilter] = useState<Filter>("All");
  const [page, setPage] = useState(0);
  const list = (stays as Stay[]).filter((s) =>
    filter === "All" ? true : filter === "Hostels" ? s.kind === "Hostel" : filter === "Hotels" ? s.kind === "Hotel" : s.neighborhood === "Nob Hill",
  );

  return (
    <section className="mb-10">
      <div className="mb-1 flex flex-wrap items-end justify-between gap-3">
        <h2 className="text-xl font-semibold tracking-tight">Places to stay</h2>
        <span className="text-xs text-ink/50">Nov 9–16 · 1 guest · via Booking.com</span>
      </div>
      <p className="mb-4 text-sm text-ink/60">Tip: Nob Hill is often cheaper than Union Square and still a walk to SoMa.</p>

      <div className="mb-4 flex flex-wrap gap-2 text-sm">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => {
              setFilter(f);
              setPage(0);
            }}
            className={`rounded-full px-3 py-1.5 font-medium ${filter === f ? "bg-ink text-white" : "bg-black/5 text-ink/60 hover:text-ink"}`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {list.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE).map((s) => (
          <a key={s.url} href={s.url} target="_blank" rel="noreferrer" className="ticket group overflow-hidden">
            <div className="relative aspect-[4/3] overflow-hidden bg-black/5">
              {s.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={s.image} alt={s.name} loading="lazy" className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]" />
              )}
              <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold shadow-sm">
                ${s.perNight}
                <span className="font-normal text-ink/60">/night</span>
              </span>
              <span
                className={`absolute right-3 top-3 rounded-full px-2 py-1 text-[11px] font-medium shadow-sm ${
                  s.kind === "Hostel" ? "bg-emerald-50 text-emerald-700" : "bg-sky-50 text-sky-700"
                }`}
              >
                {s.kind}
              </span>
            </div>
            <div className="p-4">
              <p className="line-clamp-1 font-semibold leading-tight">{s.name}</p>
              <p className="mt-1 flex items-center gap-1 truncate text-xs text-ink/55">
                <MapPin className="h-3 w-3 shrink-0" /> {s.neighborhood}
                {s.rating !== null && (
                  <>
                    <span className="mx-1">·</span>
                    <Star className="h-3 w-3 shrink-0 fill-amber-400 text-amber-400" /> {s.rating}
                    {s.reviews ? <span className="text-ink/40">({s.reviews.toLocaleString()})</span> : null}
                  </>
                )}
              </p>
              {s.caution && (
                <p className="mt-2 inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] text-amber-800">
                  <TriangleAlert className="h-3 w-3" /> Tenderloin edge: fine by day, careful at night
                </p>
              )}
              <div className="mt-3 flex items-center justify-between text-sm">
                <span className="text-ink/55">${s.total.toLocaleString()} for 7 nights</span>
                <span className="inline-flex items-center gap-1 font-medium text-bridge-ink">
                  See deal <ExternalLink className="h-3.5 w-3.5" />
                </span>
              </div>
            </div>
          </a>
        ))}
      </div>

      <Pager page={page} total={list.length} onChange={setPage} />

      <h2 className="mb-3 mt-10 text-xl font-semibold tracking-tight">Staying a month or more</h2>
      <ul className="ticket divide-y divide-black/5">
        {MORE.map((m) => (
          <li key={m.name}>
            <a href={m.url} target="_blank" rel="noreferrer" className="flex items-center gap-3 px-4 py-3 hover:bg-black/[0.02]">
              <span className="min-w-0 flex-1">
                <span className="block font-medium">{m.name}</span>
                <span className="block text-xs text-ink/55">{m.note}</span>
              </span>
              <ExternalLink className="h-4 w-4 shrink-0 text-ink/40" />
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
