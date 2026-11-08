"use client";

import { ExternalLink, MapPin } from "lucide-react";
import { useState } from "react";
import Pager, { PAGE_SIZE } from "@/components/ui/Pager";
import spaces from "@/data/lans-spaces.json";

type Space = { name: string; address: string | null; price: string | null; url: string; image: string | null };

// Free / non-LANS spots worth knowing, each with a real link.
const MORE = [
  { name: "AngelList Founders Café", note: "Free for founders, apply first", where: "90 Gold St", url: "https://ns.com/dashboard/founders-cafe" },
  { name: "Capital One Café", note: "Free to sit, good Wi‑Fi", where: "Union Square", url: "https://www.google.com/maps/search/?api=1&query=Capital+One+Caf%C3%A9+San+Francisco" },
  { name: "Salesforce Park", note: "Free rooftop park, daytime only", where: "SoMa", url: "https://www.google.com/maps/search/?api=1&query=Salesforce+Park+San+Francisco" },
  { name: "Industrious Union Square", note: "Polished rooms for investor meetings", where: "77 Geary St", url: "https://www.industriousoffice.com/locations/77-geary-street-5th-floor" },
  { name: "All LANS day passes", note: "Book any space in the app", where: "SF", url: "https://lans.app/spaces/california/san-francisco/" },
];

const title = (s: string) => s.replace(/\b\w/g, (c) => c.toUpperCase());

export default function WorkSpaces() {
  const list = spaces as Space[];
  const [page, setPage] = useState(0);
  return (
    <section className="mb-10">
      <div className="mb-4 flex items-end justify-between gap-3">
        <h2 className="text-xl font-semibold tracking-tight">Day passes</h2>
        <a href="https://lans.app/spaces/california/san-francisco/" target="_blank" rel="noreferrer" className="text-sm text-ink/55 hover:text-ink">
          via LANS ↗
        </a>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {list.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE).map((s) => (
          <a
            key={s.url}
            href={s.url}
            target="_blank"
            rel="noreferrer"
            className="ticket group overflow-hidden"
          >
            <div className="relative aspect-[4/3] overflow-hidden bg-black/5">
              {s.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={s.image} alt={s.name} loading="lazy" className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]" />
              )}
              {s.price && (
                <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold shadow-sm">{s.price}</span>
              )}
            </div>
            <div className="p-4">
              <p className="font-semibold leading-tight">{title(s.name)}</p>
              {s.address && (
                <p className="mt-1 flex items-center gap-1 truncate text-xs text-ink/55">
                  <MapPin className="h-3 w-3 shrink-0" /> {s.address}
                </p>
              )}
              <p className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-bridge-ink">
                Book day pass <ExternalLink className="h-3.5 w-3.5" />
              </p>
            </div>
          </a>
        ))}
      </div>

      <Pager page={page} total={list.length} onChange={setPage} />

      <h2 className="mb-3 mt-10 text-xl font-semibold tracking-tight">Free & other spots</h2>
      <ul className="ticket divide-y divide-black/5">
        {MORE.map((m) => (
          <li key={m.name}>
            <a href={m.url} target="_blank" rel="noreferrer" className="flex items-center gap-3 px-4 py-3 hover:bg-black/[0.02]">
              <span className="min-w-0 flex-1">
                <span className="block font-medium">{m.name}</span>
                <span className="block text-xs text-ink/55">
                  {m.note} · {m.where}
                </span>
              </span>
              <ExternalLink className="h-4 w-4 shrink-0 text-ink/40" />
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
