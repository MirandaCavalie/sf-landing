"use client";

import { Bike, Car, CarTaxiFront, ExternalLink, Navigation, TrainFront, TramFront } from "lucide-react";

type Mode = {
  name: string;
  use: string;
  cost: string;
  Icon: typeof Bike;
  bg: string;
  url: string;
};

const MODES: Mode[] = [
  { name: "Lime", use: "Default for getting around", cost: "~$7/mo + $3/ride", Icon: Bike, bg: "from-emerald-400 to-emerald-600", url: "https://www.li.me/" },
  { name: "Muni", use: "Rainy days, longer trips", cost: "~$5 day pass", Icon: TramFront, bg: "from-red-500 to-rose-700", url: "https://www.sfmta.com/getting-around/muni/munimobile" },
  { name: "BART", use: "Airport (SFO) & East Bay", cost: "~$10 from SFO", Icon: TrainFront, bg: "from-sky-500 to-blue-700", url: "https://www.bart.gov/" },
  { name: "Waymo", use: "Late nights, feels safest", cost: "Like Uber", Icon: Car, bg: "from-slate-700 to-slate-900", url: "https://waymo.com/" },
  { name: "Uber / Lyft", use: "When nothing else works", cost: "$$", Icon: CarTaxiFront, bg: "from-zinc-500 to-zinc-700", url: "https://www.lyft.com/" },
];

export default function TransportGuide() {
  return (
    <section className="mb-10">
      <a
        href="https://maps.google.com/?q=San+Francisco"
        target="_blank"
        rel="noreferrer"
        className="flex items-center gap-4 overflow-hidden rounded-2xl bg-gradient-to-br from-[#1a73e8] to-[#0b57d0] p-5 text-white shadow-lg transition hover:brightness-105"
      >
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15">
          <Navigation className="h-7 w-7" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-lg font-semibold">Just use Google Maps</span>
          <span className="block text-sm text-white/80">Best way to move in SF: live Muni, BART, Lime and walking times in one app.</span>
        </span>
        <ExternalLink className="h-5 w-5 shrink-0 text-white/70" />
      </a>

      <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-5">
        {MODES.map(({ name, use, cost, Icon, bg, url }) => (
          <a key={name} href={url} target="_blank" rel="noreferrer" className="ticket group overflow-hidden">
            <div className={`flex aspect-[4/3] items-center justify-center bg-gradient-to-br ${bg}`}>
              <Icon className="h-10 w-10 text-white transition duration-300 group-hover:scale-110" strokeWidth={1.6} />
            </div>
            <div className="p-3">
              <p className="font-semibold">{name}</p>
              <p className="text-xs text-ink/60">{use}</p>
              <p className="mt-1.5 text-xs font-medium text-bridge-ink">{cost}</p>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
