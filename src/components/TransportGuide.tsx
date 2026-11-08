"use client";

import { ExternalLink } from "lucide-react";

// Little animated scenes, one per way of getting around. Pure SVG + CSS keyframes (see globals.css .tg-*).

function Lime() {
  return (
    <svg viewBox="0 0 160 110" className="h-full w-full">
      <circle cx="128" cy="24" r="10" fill="#ffd27a" />
      <path d="M0 92 L160 62 L160 110 L0 110 Z" fill="#bfe7cf" />
      <path d="M0 92 L160 62" stroke="#8fd1ab" strokeWidth="2" />
      {/* houses on the hill */}
      <g fill="#fff" stroke="#8fd1ab" strokeWidth="1.5">
        <path d="M108 66 l8-8 l8 8 v-0 v12 h-16 z" />
        <path d="M128 62 l8-8 l8 8 v14 h-16 z" />
      </g>
      <g className="tg-roll">
        <g transform="translate(34 64) rotate(-10)">
          <rect x="4" y="18" width="30" height="4" rx="2" fill="#16a34a" />
          <rect x="28" y="0" width="3" height="20" rx="1.5" fill="#16a34a" />
          <rect x="24" y="-1" width="11" height="3" rx="1.5" fill="#0f172a" />
          <circle cx="7" cy="24" r="5" fill="#0f172a" />
          <circle cx="31" cy="24" r="5" fill="#0f172a" />
          <circle cx="7" cy="24" r="2" fill="#fff" />
          <circle cx="31" cy="24" r="2" fill="#fff" />
        </g>
      </g>
      <g className="tg-wind" stroke="#16a34a" strokeLinecap="round" strokeWidth="2" opacity=".5">
        <path d="M14 70 h10" />
        <path d="M10 78 h14" />
      </g>
    </svg>
  );
}

function Muni() {
  return (
    <svg viewBox="0 0 160 110" className="h-full w-full">
      <path d="M0 90 Q80 60 160 40 L160 110 L0 110 Z" fill="#f7d6d3" />
      <path d="M0 90 Q80 60 160 40" stroke="#e8a9a3" strokeWidth="2" fill="none" />
      <path d="M0 52 Q80 22 160 2" stroke="#c9827b" strokeWidth="1" fill="none" strokeDasharray="2 3" />
      <g className="tg-climb">
        <g transform="translate(46 50) rotate(-17)">
          <line x1="22" y1="-8" x2="24" y2="2" stroke="#7a2e28" strokeWidth="1.5" />
          <rect x="0" y="2" width="48" height="22" rx="5" fill="#e23b2e" />
          <rect x="0" y="16" width="48" height="5" fill="#f5c542" />
          <g fill="#fff">
            <rect x="5" y="6" width="8" height="7" rx="1.5" />
            <rect x="16" y="6" width="8" height="7" rx="1.5" />
            <rect x="27" y="6" width="8" height="7" rx="1.5" />
            <rect x="38" y="6" width="6" height="7" rx="1.5" />
          </g>
          <circle cx="11" cy="25" r="3.5" fill="#3b0d0a" />
          <circle cx="37" cy="25" r="3.5" fill="#3b0d0a" />
        </g>
      </g>
    </svg>
  );
}

function Bart() {
  return (
    <svg viewBox="0 0 160 110" className="h-full w-full">
      <rect width="160" height="110" fill="#dbe8fb" />
      <path d="M20 110 V58 a60 60 0 0 1 120 0 V110 Z" fill="#b9d0f3" />
      <path d="M32 110 V60 a48 48 0 0 1 96 0 V110 Z" fill="#20314f" />
      <g className="tg-zoom">
        <g transform="translate(44 66)">
          <path d="M0 6 Q0 0 8 0 H64 Q76 0 80 12 V30 H0 Z" fill="#e9eef6" />
          <path d="M66 3 Q74 4 78 14 H66 Z" fill="#7fb3f0" />
          <rect x="0" y="16" width="80" height="4" fill="#2f7de1" />
          <g fill="#7fb3f0">
            <rect x="8" y="5" width="10" height="8" rx="2" />
            <rect x="24" y="5" width="10" height="8" rx="2" />
            <rect x="40" y="5" width="10" height="8" rx="2" />
          </g>
          <circle cx="74" cy="24" r="2" fill="#ffe08a" className="tg-blink" />
        </g>
      </g>
      <g stroke="#9ec0ee" strokeWidth="2" strokeLinecap="round" className="tg-lines">
        <path d="M34 74 h8" />
        <path d="M34 84 h12" />
      </g>
      <rect x="32" y="100" width="96" height="3" fill="#0f1a2c" />
    </svg>
  );
}

function Waymo() {
  return (
    <svg viewBox="0 0 160 110" className="h-full w-full">
      <rect width="160" height="110" fill="#141b2d" />
      <g fill="#fff" className="tg-twinkle">
        <circle cx="20" cy="18" r="1.2" />
        <circle cx="52" cy="10" r="1" />
        <circle cx="96" cy="22" r="1.3" />
        <circle cx="140" cy="14" r="1" />
        <circle cx="118" cy="34" r="0.9" />
      </g>
      <path d="M118 18 a10 10 0 1 0 8 16 a8 8 0 1 1 -8 -16 z" fill="#f8e7b0" />
      <rect y="88" width="160" height="22" fill="#232c42" />
      <g stroke="#f5c542" strokeWidth="2" strokeDasharray="8 8" className="tg-road">
        <path d="M0 99 H200" />
      </g>
      <g transform="translate(42 58)">
        <path d="M6 22 Q8 8 24 6 H50 Q64 7 70 18 L76 22 V32 H6 Z" fill="#f4f6fb" />
        <path d="M26 10 H48 Q58 11 62 19 H22 Z" fill="#9db4d8" />
        <rect x="32" y="0" width="12" height="6" rx="3" fill="#cfd8e8" />
        <circle cx="38" cy="3" r="2" fill="#3fd0ff" className="tg-spin-glow" />
        <circle cx="20" cy="32" r="6" fill="#0b1020" />
        <circle cx="62" cy="32" r="6" fill="#0b1020" />
        <circle cx="76" cy="24" r="2" fill="#ffe08a" />
        <path d="M78 24 L110 18 V32 Z" fill="#ffe08a" opacity=".18" />
      </g>
    </svg>
  );
}

function Rideshare() {
  return (
    <svg viewBox="0 0 160 110" className="h-full w-full">
      <rect width="160" height="110" fill="#efece8" />
      <g stroke="#ddd8d1" strokeWidth="6">
        <path d="M0 40 H160" />
        <path d="M110 0 V110" />
      </g>
      <path d="M30 86 Q70 86 110 40" stroke="#121212" strokeWidth="2" strokeDasharray="3 4" fill="none" className="tg-route" />
      <g className="tg-bounce">
        <path d="M110 14 a10 10 0 0 1 10 10 c0 8 -10 18 -10 18 s-10 -10 -10 -18 a10 10 0 0 1 10 -10 z" fill="#f04a23" />
        <circle cx="110" cy="24" r="3.5" fill="#fff" />
      </g>
      <g transform="translate(14 74)">
        <path d="M2 10 Q4 2 14 2 H26 Q34 2 38 10 V16 H2 Z" fill="#121212" />
        <rect x="12" y="-3" width="12" height="5" rx="1.5" fill="#f5c542" />
        <circle cx="10" cy="16" r="4" fill="#3a3a3a" />
        <circle cx="30" cy="16" r="4" fill="#3a3a3a" />
      </g>
    </svg>
  );
}

const MODES = [
  { name: "Lime", emoji: "🛴", use: "Your default ride", cost: "~$7/mo + $3/ride", Art: Lime, bg: "bg-[#e8f7ee]", url: "https://www.li.me/" },
  { name: "Muni", emoji: "🚋", use: "Rainy days, long trips", cost: "~$5 day pass", Art: Muni, bg: "bg-[#fdeeec]", url: "https://www.sfmta.com/getting-around/muni/munimobile" },
  { name: "BART", emoji: "🚇", use: "SFO & East Bay only", cost: "~$10 from SFO", Art: Bart, bg: "bg-[#e8f1fd]", url: "https://www.bart.gov/" },
  { name: "Waymo", emoji: "🌙", use: "Late nights, safest", cost: "Uber-ish price", Art: Waymo, bg: "bg-[#141b2d]", url: "https://waymo.com/" },
  { name: "Uber / Lyft", emoji: "🚕", use: "Backup plan", cost: "$$", Art: Rideshare, bg: "bg-[#efece8]", url: "https://www.lyft.com/" },
];

export default function TransportGuide() {
  return (
    <section className="mb-10">
      <a
        href="https://maps.google.com/?q=San+Francisco"
        target="_blank"
        rel="noreferrer"
        className="group relative flex items-center gap-4 overflow-hidden rounded-2xl border border-black/5 bg-white p-5 shadow-sm transition hover:shadow-md"
      >
        <span className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#e8f0fe]">
          <span className="absolute inset-0 animate-ping rounded-2xl bg-[#1a73e8]/15 [animation-duration:2.4s]" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icons/googlemaps.svg" alt="Google Maps" className="relative h-7 w-7 transition group-hover:scale-110" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-lg font-semibold">Just use Google Maps</span>
          <span className="block text-sm text-ink/60">Live Muni, BART, Lime and walking times. One app, done.</span>
        </span>
        <ExternalLink className="h-5 w-5 shrink-0 text-ink/40" />
      </a>

      <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-5">
        {MODES.map(({ name, emoji, use, cost, Art, bg, url }) => (
          <a key={name} href={url} target="_blank" rel="noreferrer" className="ticket tg-card group overflow-hidden">
            <div className={`aspect-[16/11] ${bg}`}>
              <Art />
            </div>
            <div className="p-3">
              <p className="flex items-center gap-1.5 font-semibold">
                {name === "Uber / Lyft" ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/icons/uber.svg" alt="" className="h-4 w-4" />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/icons/lyft.svg" alt="" className="h-4 w-4" />
                  </>
                ) : (
                  <span>{emoji}</span>
                )}
                {name}
              </p>
              <p className="text-xs text-ink/60">{use}</p>
              <p className="mt-2 inline-block rounded-full bg-black/[0.04] px-2 py-0.5 text-xs font-medium">{cost}</p>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
