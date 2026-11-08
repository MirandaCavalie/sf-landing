"use client";

import {
  BedDouble,
  CalendarDays,
  Check,
  ChevronDown,
  Copy,
  ExternalLink,
  Laptop,
  Lightbulb,
  Map as MapIcon,
  MapPin,
  RefreshCw,
  Ticket,
  TramFront,
  TriangleAlert,
  Users,
} from "lucide-react";
import { signOut } from "next-auth/react";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import Chat from "@/components/Chat";
import StaySpaces from "@/components/StaySpaces";
import TransportGuide from "@/components/TransportGuide";
import WorkSpaces from "@/components/WorkSpaces";
import { LogoMark } from "@/components/brand/Logo";
import type { MapPoint } from "@/components/PlanMap";
import { playbook, type Tip } from "@/data/playbook";
import { dayLabel, laIso } from "@/lib/calendar";
import type { Outreach, Profile, Section, Week } from "@/lib/agents";

const PlanMap = dynamic(() => import("@/components/PlanMap"), {
  ssr: false,
  loading: () => <div className="h-[460px] animate-pulse rounded-2xl bg-black/5" />,
});

type Plan = Record<string, unknown>;
type Tab = "week" | "map" | "basecamp" | "moving" | "work" | "scene" | "people";

const TABS: { id: Tab; label: string; Icon: typeof CalendarDays }[] = [
  { id: "week", label: "Plan", Icon: CalendarDays },
  { id: "map", label: "Map", Icon: MapIcon },
  { id: "basecamp", label: "Stay", Icon: BedDouble },
  { id: "moving", label: "Getting around", Icon: TramFront },
  { id: "work", label: "Work", Icon: Laptop },
  { id: "scene", label: "Scene", Icon: Ticket },
  { id: "people", label: "People", Icon: Users },
];

const GUIDE: Partial<Record<Tab, { title: string; tips: Tip[] }[]>> = {
  basecamp: [
    { title: "Neighborhoods", tips: playbook.neighborhoods },
    { title: "Housing", tips: playbook.housing },
    { title: "Budget", tips: playbook.budget },
  ],
  moving: [{ title: "Transport", tips: playbook.transport }],
  work: [{ title: "Work spots", tips: playbook.workSpots }],
  scene: [
    { title: "Where things happen", tips: playbook.ecosystem },
    { title: "Calendars & communities", tips: playbook.social },
    { title: "Unwritten rules", tips: playbook.culture },
  ],
};

const KIND: Record<string, { label: string; color: string }> = {
  work: { label: "Work", color: "#1f3a5f" },
  coffee: { label: "Coffee chat", color: "#f04a23" },
  event: { label: "Event", color: "#d97706" },
  explore: { label: "Explore", color: "#0f9d76" },
  logistics: { label: "Logistics", color: "#8a8f98" },
};

const mapsUrl = (q: string) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${q}, San Francisco`)}`;

export default function Dashboard({
  profile,
  plan,
  google,
  user,
  onReset,
}: {
  profile: Profile;
  plan: Plan;
  google: boolean;
  user: { name?: string; image?: string };
  onReset: () => void;
}) {
  const [tab, setTab] = useState<Tab>("week");
  const week = plan.coordinator as Week | undefined;
  const context = JSON.stringify({ profile, plan }).slice(0, 14000);
  const isSection = tab === "basecamp" || tab === "moving" || tab === "work" || tab === "scene";

  return (
    <div className="min-h-screen bg-[#f6f4f0] lg:grid lg:grid-cols-[1fr_400px]">
      <main className="mx-auto w-full max-w-4xl px-4 pb-28 sm:px-8 lg:pb-12">
        <header className="flex items-center justify-between py-5">
          <span className="flex items-center gap-2">
            <LogoMark className="h-7 w-7" />
            <span className="font-semibold tracking-tight">SF Landing</span>
          </span>
          <div className="flex items-center gap-4 text-sm text-ink/60">
            <button onClick={onReset} className="hover:text-ink">
              Edit trip
            </button>
            <button onClick={() => signOut()} className="hover:text-ink">
              Sign out
            </button>
            {user.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.image} alt="" className="h-8 w-8 rounded-full" />
            )}
          </div>
        </header>

        <Hero profile={profile} week={week} />

        <nav className="sticky top-0 z-10 -mx-4 mt-6 overflow-x-auto bg-[#f6f4f0]/90 px-4 py-2 backdrop-blur sm:mx-0 sm:px-0">
          <div className="inline-flex gap-1 rounded-full bg-black/5 p-1">
            {TABS.map(({ id, label, Icon }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium transition ${
                  tab === id ? "bg-white text-ink shadow-sm" : "text-ink/55 hover:text-ink"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>
        </nav>

        <div className="mt-5">
          {tab === "week" && (week ? <WeekView week={week} google={google} /> : <Missing />)}
          {tab === "map" && <MapView plan={plan} />}
          {tab === "people" && (
            <>
              <NetworkView />
              {plan.people ? <PeopleView o={plan.people as Outreach} /> : <Missing />}
            </>
          )}
          {isSection && (
            <>
              {tab === "basecamp" && <StaySpaces />}
              {tab === "work" && <WorkSpaces />}
              {tab === "moving" && <TransportGuide />}
              {plan[tab] ? <SectionView s={plan[tab] as Section} /> : <Missing />}
              <GuideView groups={GUIDE[tab] ?? []} />
            </>
          )}
        </div>
      </main>

      <Chat context={context} variant="docked" seed={{ profile, plan, key: `${profile.arrival}:${week?.tagline ?? ""}` }} />
    </div>
  );
}

function todayLA() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "America/Los_Angeles" });
}

function daysBetween(a: string, b: string) {
  return Math.round((new Date(`${b}T12:00:00Z`).getTime() - new Date(`${a}T12:00:00Z`).getTime()) / 86400000);
}

function Hero({ profile, week }: { profile: Profile; week?: Week }) {
  const today = todayLA();
  const until = daysBetween(today, profile.arrival);
  const status =
    until > 1 ? `Landing in ${until} days` : until === 1 ? "Landing tomorrow" : until === 0 ? "Landing today" : `Day ${1 - until} in SF`;

  const items = week?.days.flatMap((d, di) => d.items.map((it) => ({ ...it, date: d.date, day: di + 1 }))) ?? [];
  const now = new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "America/Los_Angeles" });
  const next = items.find((it) => it.date > today || (it.date === today && it.end > now)) ?? items[0];
  const count = (k: string) => items.filter((it) => it.kind === k).length;
  const stats = [
    { n: items.length, label: "plans" },
    { n: count("coffee"), label: "coffee chats" },
    { n: count("event"), label: "events" },
    { n: count("work"), label: "work blocks" },
  ];

  const key = `sfl:todo:${profile.arrival}`;
  const [done, setDone] = useState<number[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(key) ?? "[]");
    } catch {
      return [];
    }
  });
  const toggle = (i: number) => {
    const v = done.includes(i) ? done.filter((x) => x !== i) : [...done, i];
    setDone(v);
    try {
      localStorage.setItem(key, JSON.stringify(v));
    } catch {}
  };

  return (
    <section data-enter className="grid gap-3 lg:grid-cols-[1.4fr_1fr]">
      <div className="ticket p-6">
        <p className="text-sm font-medium text-bridge-ink">{status}</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">Your first week in SF</h1>
        <p className="mt-1 text-sm text-ink/55">
          {dayLabel(profile.arrival)} · {profile.stayLength} · {profile.budget.toLowerCase()} budget
        </p>
        <div className="mt-5 grid grid-cols-4 gap-2">
          {stats.map((s) => (
            <div key={s.label} className="rounded-xl bg-black/[0.03] px-3 py-2.5">
              <p className="text-2xl font-semibold tabular-nums">{s.n}</p>
              <p className="text-xs text-ink/55">{s.label}</p>
            </div>
          ))}
        </div>
        {next && (
          <div className="mt-4 flex items-center gap-3 rounded-xl bg-ink p-3.5 text-white">
            <div className="shrink-0 text-center">
              <p className="text-[11px] uppercase text-white/60">Day {next.day}</p>
              <p className="text-sm font-semibold tabular-nums">{next.start}</p>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-white/60">Next up</p>
              <p className="truncate font-medium">{next.title}</p>
              <p className="truncate text-xs text-white/60">{next.place}</p>
            </div>
            <a
              href={mapsUrl(next.place)}
              target="_blank"
              rel="noreferrer"
              className="flex shrink-0 items-center gap-1 rounded-full bg-white/15 px-3 py-1.5 text-xs font-medium hover:bg-white/25"
            >
              <MapPin className="h-3.5 w-3.5" /> Directions
            </a>
          </div>
        )}
      </div>

      {week && (
        <div className="ticket p-6">
          <h2 className="font-semibold">Before you land</h2>
          <p className="mt-0.5 text-xs text-ink/55">
            {done.length}/{week.secrets.length} done
          </p>
          <ul className="mt-4 space-y-2">
            {week.secrets.map((s, i) => (
              <li key={i}>
                <button
                  onClick={() => toggle(i)}
                  className={`flex w-full items-start gap-2.5 rounded-xl p-2.5 text-left text-sm transition hover:bg-black/[0.03] ${
                    done.includes(i) ? "text-ink/40 line-through" : ""
                  }`}
                >
                  <span
                    className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                      done.includes(i) ? "border-bridge bg-bridge text-white" : "border-black/25"
                    }`}
                  >
                    {done.includes(i) && <Check className="h-3 w-3" />}
                  </span>
                  {s}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

function Missing() {
  return <p className="text-sm text-ink/60">Didn&apos;t load. Ask the agent.</p>;
}

function Title({ children, sub }: { children: React.ReactNode; sub?: string }) {
  return (
    <div className="mb-4">
      <h2 className="text-xl font-semibold tracking-tight">{children}</h2>
      {sub && <p className="mt-0.5 text-sm text-ink/60">{sub}</p>}
    </div>
  );
}

function WeekView({ week, google }: { week: Week; google: boolean }) {
  const [day, setDay] = useState(0);
  const [sync, setSync] = useState<{ done: number; total: number; error?: string } | null>(null);
  const d = week.days[day];
  const total = week.days.reduce((n, x) => n + x.items.length, 0);
  const finished = sync && sync.done === sync.total && !sync.error;

  async function addAll() {
    const items = week.days.flatMap((x) => x.items.map((it) => ({ ...it, date: x.date })));
    setSync({ done: 0, total: items.length });
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      const r = await fetch("/api/calendar", {
        method: "POST",
        body: JSON.stringify({
          title: it.title,
          start: laIso(it.date, it.start),
          end: laIso(it.date, it.end),
          location: it.place,
          description: it.note,
        }),
      });
      if (!r.ok) {
        setSync({ done: i, total: items.length, error: (await r.json()).error ?? "Calendar error" });
        return;
      }
      setSync({ done: i + 1, total: items.length });
    }
  }

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {week.days.map((x, i) => {
            const [wd, , num] = dayLabel(x.date).replace(",", "").split(" ");
            return (
              <button
                key={x.date}
                onClick={() => setDay(i)}
                className={`flex w-14 shrink-0 flex-col items-center rounded-2xl py-2 text-xs transition ${
                  i === day ? "bg-ink text-white" : "bg-white text-ink/70 hover:text-ink"
                }`}
              >
                <span className="opacity-70">{wd}</span>
                <span className="text-base font-semibold">{num}</span>
              </button>
            );
          })}
        </div>
        {google && (
          <button
            onClick={addAll}
            disabled={!!sync && !sync.error && !finished}
            className="flex items-center gap-2 rounded-full bg-bridge px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:brightness-95 disabled:opacity-60"
          >
            {finished ? <Check className="h-4 w-4" /> : <CalendarDays className="h-4 w-4" />}
            {finished
              ? `${sync.total} events on your calendar`
              : sync && !sync.error
                ? `Adding ${sync.done} of ${sync.total}…`
                : `Add all ${total} to Google Calendar`}
          </button>
        )}
      </div>
      {sync?.error && <p className="mt-2 text-sm text-bridge-ink">{sync.error}</p>}

      <div className="mt-6">
        <Title sub={d.theme}>
          Day {day + 1} · {dayLabel(d.date)}
        </Title>
        <ol className="relative ml-1.5 space-y-3 border-l border-black/10 pl-6">
          {d.items.map((it, i) => (
            <li key={i} className="relative">
              <span
                className="absolute -left-[31px] top-5 h-3 w-3 rounded-full ring-4 ring-[#f6f4f0]"
                style={{ background: KIND[it.kind]?.color }}
              />
              <div className="ticket p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="font-semibold">{it.title}</h3>
                  <span className="text-sm tabular-nums text-ink/50">
                    {it.start}–{it.end}
                  </span>
                </div>
                <p className="mt-1 text-sm text-ink/70">{it.note}</p>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
                  <span className="rounded-full px-2 py-0.5 font-medium text-white" style={{ background: KIND[it.kind]?.color }}>
                    {KIND[it.kind]?.label}
                  </span>
                  <a href={mapsUrl(it.place)} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-ink/60 hover:text-ink">
                    <MapPin className="h-3.5 w-3.5" />
                    {it.place}
                  </a>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

type SFEvent = {
  source: "Luma" | "Partiful";
  title: string;
  url: string;
  start: string;
  venue: string | null;
  neighborhood: string | null;
  lat: number | null;
  lng: number | null;
  going: number | null;
};

const SOURCE_COLOR = { Luma: "#0ea5e9", Partiful: "#e11d74" } as const;

const laTime = (iso: string) =>
  new Date(iso).toLocaleString("en-US", { weekday: "short", hour: "numeric", minute: "2-digit", timeZone: "America/Los_Angeles" });

function MapView({ plan }: { plan: Plan }) {
  const week = plan.coordinator as Week | undefined;
  const from = week?.days[0]?.date;
  const to = week?.days[week.days.length - 1]?.date;
  const [events, setEvents] = useState<SFEvent[] | null>(null);
  const [state, setState] = useState<"idle" | "live" | "error">("idle");
  const [show, setShow] = useState({ plan: true, events: true });

  useEffect(() => {
    if (!from || !to) return;
    fetch(`/api/events?from=${from}&to=${to}`)
      .then((r) => r.json())
      .then((d) => setEvents(d.events ?? []))
      .catch(() => setEvents([]));
  }, [from, to]);

  async function refreshLive() {
    if (!from || !to) return;
    setState("live");
    try {
      const d = await fetch(`/api/events?from=${from}&to=${to}&live=1`).then((r) => r.json());
      setEvents(d.events ?? []);
      setState("idle");
    } catch {
      setState("error");
    }
  }

  const points: MapPoint[] = [];
  if (show.events)
    (events ?? []).forEach((e) => {
      if (e.lat !== null && e.lng !== null)
        points.push({
          lat: e.lat,
          lng: e.lng,
          title: e.title,
          subtitle: `${laTime(e.start)} · ${e.venue ?? e.neighborhood ?? ""}${e.going ? ` · ${e.going} going` : ""}`,
          color: SOURCE_COLOR[e.source],
          size: Math.min(34, 12 + Math.sqrt(e.going ?? 9) * 1.6),
          url: e.url,
        });
    });
  if (show.plan)
    week?.days.forEach((d, di) =>
      d.items.forEach((it) => {
        if (typeof it.lat === "number" && typeof it.lng === "number")
          points.push({
            lat: it.lat,
            lng: it.lng,
            title: it.title,
            subtitle: `Day ${di + 1} · ${it.start} · ${it.place}`,
            color: KIND[it.kind]?.color ?? "#121212",
            label: String(di + 1),
          });
      }),
    );

  const byDay = new Map<string, SFEvent[]>();
  (events ?? []).forEach((e) => {
    const k = new Date(e.start).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric", timeZone: "America/Los_Angeles" });
    byDay.set(k, [...(byDay.get(k) ?? []), e]);
  });

  return (
    <section>
      <Title sub="Bigger bubble = more people going.">What&apos;s on that week</Title>
      <div className="mb-3 flex flex-wrap items-center gap-2 text-sm">
        {(["plan", "events"] as const).map((k) => (
          <button
            key={k}
            onClick={() => setShow({ ...show, [k]: !show[k] })}
            className={`rounded-full px-3 py-1.5 font-medium transition ${show[k] ? "bg-ink text-white" : "bg-black/5 text-ink/60"}`}
          >
            {k === "plan" ? "Your plan" : `Events${events ? ` (${events.length})` : ""}`}
          </button>
        ))}
        <span className="flex items-center gap-1.5 text-xs text-ink/60">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: SOURCE_COLOR.Luma }} /> Luma
          <span className="ml-2 h-2.5 w-2.5 rounded-full" style={{ background: SOURCE_COLOR.Partiful }} /> Partiful
        </span>
        <button
          onClick={refreshLive}
          disabled={state === "live"}
          className="ml-auto flex items-center gap-1.5 rounded-full bg-black/5 px-3 py-1.5 text-ink/70 hover:text-ink disabled:opacity-60"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${state === "live" ? "animate-spin" : ""}`} />
          {state === "live" ? "Scraping Luma & Partiful…" : "Refresh events"}
        </button>
      </div>
      {state === "error" && <p className="mb-2 text-sm text-bridge-ink">Live refresh failed; showing the last snapshot.</p>}
      <div className="ticket overflow-hidden p-1.5">
        <PlanMap points={points} />
      </div>

      {events && events.length > 0 && (
        <div className="mt-8 space-y-6">
          {[...byDay.entries()].map(([day, list]) => (
            <div key={day}>
              <h3 className="mb-2 text-sm font-semibold text-ink/70">{day}</h3>
              <ul className="ticket divide-y divide-black/5">
                {list.map((e) => (
                  <li key={e.url}>
                    <a href={e.url} target="_blank" rel="noreferrer" className="flex items-center gap-3 px-4 py-3 hover:bg-black/[0.02]">
                      <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: SOURCE_COLOR[e.source] }} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium">{e.title}</span>
                        <span className="block truncate text-xs text-ink/55">
                          {laTime(e.start)} · {e.venue ?? e.neighborhood ?? "SF"}
                        </span>
                      </span>
                      {e.going ? <span className="shrink-0 text-xs text-ink/50">{e.going} going</span> : null}
                      <ExternalLink className="h-3.5 w-3.5 shrink-0 text-ink/40" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
      {events && events.length === 0 && <p className="mt-4 text-sm text-ink/60">No scraped events for these dates yet. Try Refresh live.</p>}
    </section>
  );
}

function SectionView({ s }: { s: Section }) {
  return (
    <section>
      <Title>{s.headline}</Title>
      <div className="grid gap-3 md:grid-cols-3">
        {s.picks.slice(0, 3).map((p) => (
          <article key={p.name} className="ticket flex flex-col p-5">
            <h3 className="font-semibold leading-tight">{p.name}</h3>
            <p className="mt-1.5 flex-1 text-sm text-ink/70">{p.one_liner}</p>
            <p className="mt-3 flex gap-1.5 rounded-xl bg-[#fff4ef] p-2.5 text-sm">
              <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-bridge" />
              {p.insider}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
              {p.cost && <span className="rounded-full bg-black/5 px-2 py-0.5 font-medium">{p.cost}</span>}
              {p.needs_verification && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-amber-800">Double-check</span>}
              <a href={mapsUrl(p.name)} target="_blank" rel="noreferrer" className="ml-auto flex items-center gap-1 text-ink/60 hover:text-ink">
                <MapPin className="h-3.5 w-3.5" /> Maps
              </a>
            </div>
          </article>
        ))}
      </div>
      {s.watch_out && (
        <p className="mt-3 flex gap-2 rounded-2xl bg-amber-50 p-4 text-sm text-amber-900">
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
          {s.watch_out}
        </p>
      )}
    </section>
  );
}

function GuideView({ groups }: { groups: { title: string; tips: Tip[] }[] }) {
  const [open, setOpen] = useState<string | null>(groups[0]?.title ?? null);
  const visible = groups.filter((g) => g.tips.length);
  if (!visible.length) return null;
  return (
    <section className="mt-10">
      <Title>More local tips</Title>
      <div className="space-y-2">
        {visible.map((g) => (
          <div key={g.title} className="ticket overflow-hidden">
            <button
              onClick={() => setOpen(open === g.title ? null : g.title)}
              className="flex w-full items-center justify-between px-5 py-4 text-left font-medium"
            >
              {g.title}
              <span className="flex items-center gap-2 text-sm text-ink/50">
                {g.tips.length}
                <ChevronDown className={`h-4 w-4 transition ${open === g.title ? "rotate-180" : ""}`} />
              </span>
            </button>
            {open === g.title && (
              <ul className="divide-y divide-black/5 border-t border-black/5">
                {g.tips.map((t) => (
                  <li key={t.name} className="px-5 py-3.5">
                    <div className="flex flex-wrap items-baseline gap-x-2">
                      <span className="font-medium">{t.name}</span>
                      {t.cost && <span className="text-xs text-ink/50">{t.cost}</span>}
                      {t.verify && <span className="text-xs text-amber-700">double-check</span>}
                    </div>
                    {t.where && <p className="text-xs text-ink/50">{t.where}</p>}
                    <p className="mt-1 text-sm text-ink/70">{t.insight}</p>
                    {t.source && (
                      <a
                        href={t.source.url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-1 inline-flex items-center gap-1 text-xs text-bay hover:underline"
                      >
                        {t.source.name} <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

type Contact = {
  id: string;
  notionUrl: string;
  name: string;
  role: string;
  company: string;
  location: string;
  inSF: boolean;
  relationship: string | null;
  lastContact: string | null;
  nextStep: string;
  linkedin: string | null;
};

const REL_COLOR: Record<string, string> = {
  Strong: "bg-emerald-50 text-emerald-700",
  Warm: "bg-sky-50 text-sky-700",
  Light: "bg-black/5 text-ink/60",
  Unknown: "bg-amber-50 text-amber-700",
};

// Asks the docked agent to plan an in-person 1:1 (Chat listens for this event).
const askAgent = (text: string) => window.dispatchEvent(new CustomEvent("sfl:ask", { detail: text }));

function NetworkView() {
  const [data, setData] = useState<{ contacts?: Contact[]; error?: string } | null>(null);
  const [all, setAll] = useState(false);

  useEffect(() => {
    fetch("/api/crm")
      .then(async (r) => setData(await r.json()))
      .catch(() => setData({ error: "network" }));
  }, []);

  if (!data || data.error === "private") return null;
  if (data.error)
    return (
      <section className="mb-10">
        <Title>Your people in SF</Title>
        <p className="ticket p-4 text-sm text-ink/70">Notion isn&apos;t connected yet ({data.error}).</p>
      </section>
    );

  const contacts = (data.contacts ?? []).filter((c) => all || c.inSF);
  return (
    <section className="mb-10">
      <Title sub="From your Notion CRM.">
        <span className="inline-flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icons/notion.svg" alt="" className="h-5 w-5" /> Your people in SF
        </span>
      </Title>
      <div className="mb-3 flex items-center gap-2 text-sm">
        <button onClick={() => setAll(false)} className={`rounded-full px-3 py-1.5 font-medium ${!all ? "bg-ink text-white" : "bg-black/5 text-ink/60"}`}>
          In SF ({(data.contacts ?? []).filter((c) => c.inSF).length})
        </button>
        <button onClick={() => setAll(true)} className={`rounded-full px-3 py-1.5 font-medium ${all ? "bg-ink text-white" : "bg-black/5 text-ink/60"}`}>
          Everyone ({data.contacts?.length ?? 0})
        </button>
      </div>
      <div className="ticket overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="text-xs text-ink/50">
            <tr className="border-b border-black/5">
              <th className="px-4 py-3 font-medium">Person</th>
              <th className="px-4 py-3 font-medium">Relationship</th>
              <th className="px-4 py-3 font-medium">Next step</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {contacts.map((c) => (
              <tr key={c.id} className="align-top">
                <td className="px-4 py-3">
                  <a href={c.notionUrl} target="_blank" rel="noreferrer" className="font-medium hover:underline">
                    {c.name}
                  </a>
                  <p className="text-xs text-ink/55">{[c.role, c.company].filter(Boolean).join(" · ") || "—"}</p>
                  <p className="text-xs text-ink/40">{c.location || "Location unknown"}</p>
                </td>
                <td className="px-4 py-3">
                  {c.relationship && <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${REL_COLOR[c.relationship] ?? ""}`}>{c.relationship}</span>}
                  {c.lastContact && <p className="mt-1 text-xs text-ink/45">Last: {c.lastContact}</p>}
                </td>
                <td className="max-w-[220px] px-4 py-3 text-ink/70">
                  <p className="line-clamp-2" title={c.nextStep}>{c.nextStep || "—"}</p>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    {c.linkedin && (
                      <a href={c.linkedin} target="_blank" rel="noreferrer" className="rounded-full bg-black/5 px-3 py-1.5 text-xs font-medium">
                        LinkedIn
                      </a>
                    )}
                    <button
                      onClick={() =>
                        askAgent(
                          `Plan an in-person 1:1 with ${c.name}${c.role ? ` (${c.role}${c.company ? ` at ${c.company}` : ""})` : ""} during my first week. Our relationship is ${c.relationship ?? "unknown"}${c.nextStep ? ` and my next step is: ${c.nextStep}` : ""}. Suggest a good café near my plan, draft a short message I can send, and propose a calendar slot.`,
                        )
                      }
                      className="whitespace-nowrap rounded-full bg-bridge px-3 py-1.5 text-xs font-medium text-white"
                    >
                      Plan a 1:1
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {contacts.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-ink/55">
                  Nobody in your CRM has an SF location yet. Switch to Everyone.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function PeopleView({ o }: { o: Outreach }) {
  const [copied, setCopied] = useState<string | null>(null);
  const copy = (t: string) => {
    navigator.clipboard.writeText(t);
    setCopied(t);
    setTimeout(() => setCopied(null), 1500);
  };
  return (
    <section>
      <Title sub="Copy, paste, send.">Who to meet</Title>
      <div className="grid gap-3 md:grid-cols-3">
        {o.targets.slice(0, 3).map((t) => (
          <article key={t.who} className="ticket flex flex-col p-5">
            <h3 className="font-semibold leading-tight">{t.who}</h3>
            <p className="mt-1 text-sm text-ink/60">{t.why}</p>
            <p className="mt-3 flex-1 whitespace-pre-wrap rounded-xl bg-black/[0.03] p-3 text-sm">{t.dm}</p>
            <div className="mt-3 flex gap-2 text-sm">
              <button
                onClick={() => copy(t.dm)}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-ink px-3 py-2 font-medium text-white"
              >
                {copied === t.dm ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied === t.dm ? "Copied" : "Copy message"}
              </button>
              <a
                target="_blank"
                rel="noreferrer"
                href={`https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(t.linkedin_search)}`}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-black/5 px-3 py-2 font-medium"
              >
                Find on LinkedIn <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </article>
        ))}
      </div>
      <div className="ticket mt-4 p-5">
        <h3 className="font-semibold">Post on X</h3>
        <p className="mt-2 whitespace-pre-wrap text-sm text-ink/80">{o.x_post}</p>
        <a
          target="_blank"
          rel="noreferrer"
          href={`https://x.com/intent/post?text=${encodeURIComponent(o.x_post)}`}
          className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-sm font-medium text-white"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icons/x.svg" alt="" className="h-3.5 w-3.5 invert" /> Post on X
        </a>
      </div>
    </section>
  );
}
