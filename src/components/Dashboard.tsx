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
  Ticket,
  TramFront,
  TriangleAlert,
  Users,
} from "lucide-react";
import { signOut } from "next-auth/react";
import dynamic from "next/dynamic";
import { useState } from "react";
import Chat from "@/components/Chat";
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
  event: { label: "Event", color: "#7c3aed" },
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

        <section className="ticket p-6">
          <h1 className="text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">
            {week?.tagline ?? "Your SF landing plan"}
          </h1>
          <p className="mt-1 text-sm text-ink/60">
            Landing {dayLabel(profile.arrival)} · {profile.stayLength} · {profile.budget.toLowerCase()} budget
          </p>
          {week && (
            <ul className="mt-5 grid gap-2 sm:grid-cols-3">
              {week.secrets.map((s, i) => (
                <li key={i} className="flex gap-2 rounded-xl bg-[#fff4ef] p-3 text-sm leading-snug">
                  <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-bridge" />
                  {s}
                </li>
              ))}
            </ul>
          )}
        </section>

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
          {tab === "people" && (plan.people ? <PeopleView o={plan.people as Outreach} /> : <Missing />)}
          {isSection && (
            <>
              {plan[tab] ? <SectionView s={plan[tab] as Section} /> : <Missing />}
              <GuideView groups={GUIDE[tab] ?? []} />
            </>
          )}
        </div>
      </main>

      <Chat context={context} variant="docked" />
    </div>
  );
}

function Missing() {
  return <p className="text-sm text-ink/60">This part didn&apos;t load. Ask the agent and it will fill it in.</p>;
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

function MapView({ plan }: { plan: Plan }) {
  const week = plan.coordinator as Week | undefined;
  const points: MapPoint[] = [];
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
  return (
    <section>
      <Title sub="Every stop of your first week. The number is the day.">Your week on the map</Title>
      {points.length ? (
        <div className="ticket overflow-hidden p-1.5">
          <PlanMap points={points} />
        </div>
      ) : (
        <p className="text-sm text-ink/60">Plan your trip again to get the map (older plans don&apos;t have locations).</p>
      )}
      <div className="mt-3 flex flex-wrap gap-3 text-xs text-ink/70">
        {Object.values(KIND).map((k) => (
          <span key={k.label} className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: k.color }} />
            {k.label}
          </span>
        ))}
      </div>
    </section>
  );
}

function SectionView({ s }: { s: Section }) {
  return (
    <section>
      <Title sub="Picked for you by your agent">{s.headline}</Title>
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
      <Title sub="What locals know, from our playbook and SF founder guides">The full local guide</Title>
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

function PeopleView({ o }: { o: Outreach }) {
  const [copied, setCopied] = useState<string | null>(null);
  const copy = (t: string) => {
    navigator.clipboard.writeText(t);
    setCopied(t);
    setTimeout(() => setCopied(null), 1500);
  };
  return (
    <section>
      <Title sub="Messages are drafted. You send them.">{o.headline}</Title>
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
                {copied === t.dm ? "Copied" : "Copy"}
              </button>
              <a
                target="_blank"
                rel="noreferrer"
                href={`https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(t.linkedin_search)}`}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-black/5 px-3 py-2 font-medium"
              >
                LinkedIn <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </article>
        ))}
      </div>
      <div className="ticket mt-4 p-5">
        <h3 className="font-semibold">Announce your landing on X</h3>
        <p className="mt-2 whitespace-pre-wrap text-sm text-ink/80">{o.x_post}</p>
        <a
          target="_blank"
          rel="noreferrer"
          href={`https://x.com/intent/post?text=${encodeURIComponent(o.x_post)}`}
          className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-sm font-medium text-white"
        >
          Post on X <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
    </section>
  );
}
