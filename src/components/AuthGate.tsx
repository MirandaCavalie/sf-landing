"use client";

import { ArrowRight, BedDouble, Coffee, Laptop } from "lucide-react";
import { signIn } from "next-auth/react";
import { useMemo } from "react";
import SFScene from "@/components/SFScene";
import { LogoMark } from "@/components/brand/Logo";
import events from "@/data/events-snapshot.json";
import spaces from "@/data/lans-spaces.json";
import stays from "@/data/stays.json";

type Ev = { title: string; start: string; source: string; url: string };

function price(s: string | null) {
  return Number((s ?? "").replace(/[^\d]/g, "")) || Infinity;
}

export default function AuthGate() {
  // Real numbers from the scraped data, so the first screen proves itself.
  const { weekEvents, ticker } = useMemo(() => {
    const now = Date.now();
    const week = (events as Ev[]).filter((e) => {
      const t = new Date(e.start).getTime();
      return t > now && t < now + 7 * 86400000;
    });
    const list = (week.length ? week : (events as Ev[])).slice(0, 18);
    return { weekEvents: week.length || events.length, ticker: list };
  }, []);
  const cheapestStay = Math.min(...stays.map((s) => s.perNight));
  const cheapestDesk = Math.min(...spaces.map((s) => price(s.price)));
  const stayPhoto = stays.find((s) => s.image)?.image;
  const deskPhoto = spaces.find((s) => s.image)?.image;

  const facts = [
    { value: `${weekEvents}`, label: "tech events this week" },
    { value: `$${cheapestStay}`, label: "hostels per night" },
    { value: `$${cheapestDesk}`, label: "coworking day pass" },
  ];

  return (
    <main className="bg-[#f6f4f0]">
      {/* Screen 1: the intro's scene, now parked, with the pitch on top */}
      <section className="relative flex min-h-[100svh] flex-col overflow-hidden bg-[#121b2e] text-white">
        <SFScene animate={false} />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#121b2e]/85 via-[#121b2e]/35 to-transparent" />
        {/* Blend the flat water bands at the bottom into the night so the ticker floats on it */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[38%] bg-gradient-to-t from-[#121b2e] via-[#121b2e]/70 to-transparent" />

        <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5 sm:px-8">
          <span className="flex items-center gap-2">
            <LogoMark className="h-8 w-8" />
            <span className="font-semibold tracking-tight">SF Landing</span>
          </span>
          {/* Full reload on purpose: ?demo is read once on mount. */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a href="/?demo" className="rounded-full px-3 py-1.5 text-sm text-white/75 hover:text-white">
            Try the demo
          </a>
        </header>

        <div data-enter className="relative z-10 mx-auto w-full max-w-6xl flex-1 px-4 pt-[6vh] sm:px-8">
          <h1 className="max-w-3xl text-[clamp(48px,7.5vw,96px)] font-medium leading-[0.95] tracking-[-0.035em] [text-shadow:0_4px_24px_rgba(18,18,18,.3)]">
            Land in SF
            <br />
            <span className="text-[#ff8a5c]">like a local.</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg text-white/85">
            Tell us when you land. Agents plan your first week: where to sleep, where to work, who to meet over coffee and
            what&apos;s on. Then it&apos;s on your calendar.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <button
              onClick={() => signIn("google")}
              className="flex items-center gap-3 rounded-full bg-white px-6 py-3.5 font-medium text-ink shadow-xl transition hover:-translate-y-0.5"
            >
              <GoogleG /> Continue with Google
            </button>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a href="/?demo" className="flex items-center gap-1.5 rounded-full px-4 py-3 text-white/85 hover:text-white">
              See a sample plan <ArrowRight className="h-4 w-4" />
            </a>
          </div>
          {/* One frosted bar so the facts stay readable over any part of the scene (deck, towers, sky) */}
          <p className="mt-8 inline-flex flex-wrap items-center gap-x-4 gap-y-1.5 rounded-2xl border border-white/10 bg-[#121b2e]/70 px-4 py-2.5 text-sm text-white/80 shadow-lg backdrop-blur-md">
            {facts.map((f, i) => (
              <span key={f.label} className="flex items-center gap-4">
                {i > 0 && <span className="h-3.5 w-px bg-white/20" />}
                <span>
                  <strong className="font-semibold text-white">{f.value}</strong> {f.label}
                </span>
              </span>
            ))}
          </p>
        </div>

        {/* Live strip of real events (Luma + Partiful), duplicated for a seamless loop */}
        <div className="ticker relative z-10 overflow-hidden py-5 [mask-image:linear-gradient(90deg,transparent,black_12%,black_88%,transparent)]">
          <div className="ticker-track flex w-max items-center gap-6 whitespace-nowrap text-[13px] tracking-wide text-white/55">
            {[...ticker, ...ticker].map((e, i) => (
              <a key={i} href={e.url} target="_blank" rel="noreferrer" className="flex items-center gap-6 transition hover:text-white">
                <span className="h-px w-6 bg-white/25" />
                {e.title}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Screen 2: what you actually get, with real photos from the data */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-8">
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Your first week, done for you</h2>
        <p className="mt-2 max-w-xl text-ink/60">Real places, real prices, real people. You just say yes.</p>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <Preview Icon={BedDouble} title="Where to sleep" line={`42 hostels and hotels, from $${cheapestStay}/night`} photo={stayPhoto} />
          <Preview Icon={Laptop} title="Where to work" line={`Coworking day passes from $${cheapestDesk}`} photo={deskPhoto} />
          <div className="ticket flex flex-col overflow-hidden">
            <div className="flex aspect-[4/3] flex-col justify-center gap-2 bg-[#fff4ef] p-5">
              <div className="rounded-2xl bg-white p-3 text-sm shadow-sm">
                <p className="font-semibold">☕ Coffee with a founder</p>
                <p className="mt-0.5 text-xs text-ink/55">Tue 10:00 · Sightglass, SoMa</p>
                <p className="mt-2 rounded-xl bg-[#f6f4f0] p-2 text-[13px]">Hi! I&apos;m in SF from Monday. Coffee&apos;s on me?</p>
              </div>
              <div className="flex gap-1.5 text-[11px] font-medium">
                <span className="rounded-full bg-ink px-2.5 py-1 text-white">Copy message</span>
                <span className="rounded-full bg-[#0a66c2] px-2.5 py-1 text-white">Open LinkedIn</span>
                <span className="rounded-full bg-bridge px-2.5 py-1 text-white">Add to calendar</span>
              </div>
            </div>
            <div className="flex items-center gap-2 p-4">
              <Coffee className="h-4 w-4 text-bridge" />
              <div>
                <p className="font-semibold">Who to meet</p>
                <p className="text-sm text-ink/60">1:1 coffees drafted, you hit send</p>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-12 flex justify-center">
          <button
            onClick={() => signIn("google")}
            className="flex items-center gap-3 rounded-full bg-ink px-6 py-3.5 font-medium text-white shadow-lg transition hover:-translate-y-0.5"
          >
            <GoogleG /> Plan my landing
          </button>
        </div>
      </section>
    </main>
  );
}

function Preview({ Icon, title, line, photo }: { Icon: typeof Coffee; title: string; line: string; photo?: string | null }) {
  return (
    <div className="ticket group flex flex-col overflow-hidden">
      <div className="aspect-[4/3] overflow-hidden bg-black/5">
        {photo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo} alt="" className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]" />
        )}
      </div>
      <div className="flex items-center gap-2 p-4">
        <Icon className="h-4 w-4 text-bridge" />
        <div>
          <p className="font-semibold">{title}</p>
          <p className="text-sm text-ink/60">{line}</p>
        </div>
      </div>
    </div>
  );
}

function GoogleG() {
  return (
    <svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.3-.4-3.5z" />
    </svg>
  );
}
