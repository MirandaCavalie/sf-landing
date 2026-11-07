"use client";

import { signOut } from "next-auth/react";
import { useState } from "react";
import Chat from "@/components/Chat";
import { Wordmark } from "@/components/brand/Logo";
import { dayLabel, laIso } from "@/lib/calendar";
import type { Outreach, Profile, Section, Week } from "@/lib/agents";

type Plan = Record<string, unknown>;
type Tab = "week" | "basecamp" | "moving" | "work" | "scene" | "people";

const TABS: { id: Tab; label: string; emoji: string }[] = [
  { id: "week", label: "Your week", emoji: "🗓️" },
  { id: "basecamp", label: "Stay", emoji: "🏠" },
  { id: "moving", label: "Move", emoji: "🛴" },
  { id: "work", label: "Work", emoji: "☕" },
  { id: "scene", label: "Scene", emoji: "🎟️" },
  { id: "people", label: "People", emoji: "🤝" },
];

const KIND: Record<string, { icon: string; color: string }> = {
  work: { icon: "☕", color: "bg-bay text-paper" },
  coffee: { icon: "🤝", color: "bg-bridge text-paper" },
  event: { icon: "🎟️", color: "bg-ink text-paper" },
  explore: { icon: "🌉", color: "bg-mist text-ink" },
  logistics: { icon: "🧳", color: "bg-fog text-ink border border-ink" },
};

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

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[1fr_400px]">
      <main className="mx-auto w-full max-w-4xl px-4 pb-28 sm:px-8 lg:pb-12">
        <header className="flex items-center justify-between py-5">
          <Wordmark />
          <div className="flex items-center gap-3 font-mono text-[11px] uppercase">
            <button onClick={onReset} className="underline">
              Edit trip
            </button>
            <button onClick={() => signOut()} className="text-bay underline">
              Sign out
            </button>
            {user.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.image} alt="" className="h-8 w-8 rounded-full border-2 border-ink" />
            )}
          </div>
        </header>

        {/* Summary */}
        <section className="ticket ticket-notch p-5 sm:p-6">
          <h1 className="font-display text-3xl uppercase leading-tight sm:text-4xl">
            {week?.tagline ?? "Your SF landing plan"}
          </h1>
          <p className="mt-2 text-sm text-bay">
            Landing {dayLabel(profile.arrival)} for {profile.stayLength}, {profile.budget.toLowerCase()} budget
          </p>
          {week && (
            <ol className="mt-4 grid gap-2 sm:grid-cols-3">
              {week.secrets.map((s, i) => (
                <li key={i} className="border-l-4 border-bridge pl-3 text-sm leading-snug">
                  <span className="font-mono text-[10px] uppercase text-bridge-ink">Secret {i + 1}</span>
                  <br />
                  {s}
                </li>
              ))}
            </ol>
          )}
        </section>

        {/* Tabs */}
        <nav className="sticky top-0 z-10 -mx-4 mt-6 flex gap-1 overflow-x-auto bg-fog/95 px-4 py-2 backdrop-blur sm:mx-0 sm:px-0">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`shrink-0 border-2 border-ink px-3 py-1.5 text-sm font-semibold transition ${
                tab === t.id ? "bg-ink text-paper" : "bg-paper hover:bg-fog"
              }`}
            >
              {t.emoji} {t.label}
            </button>
          ))}
        </nav>

        <div className="mt-4">
          {tab === "week" && week && <WeekView week={week} google={google} />}
          {tab === "people" && plan.people ? <PeopleView o={plan.people as Outreach} /> : null}
          {tab !== "week" && tab !== "people" && plan[tab] ? <SectionView s={plan[tab] as Section} /> : null}
          {!plan[tab === "week" ? "coordinator" : tab] && (
            <p className="font-mono text-sm text-bridge-ink">This part of the plan didn&apos;t load. Ask the agent →</p>
          )}
        </div>
      </main>

      <Chat context={context} variant="docked" />
    </div>
  );
}

function WeekView({ week, google }: { week: Week; google: boolean }) {
  const [day, setDay] = useState(0);
  const [sync, setSync] = useState<{ done: number; total: number; error?: string } | null>(null);
  const d = week.days[day];
  const total = week.days.reduce((n, x) => n + x.items.length, 0);

  async function addAll() {
    const items = week.days.flatMap((x) => x.items.map((it) => ({ ...it, date: x.date })));
    setSync({ done: 0, total: items.length });
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      const r = await fetch("/api/calendar", {
        method: "POST",
        body: JSON.stringify({
          title: `${KIND[it.kind]?.icon ?? ""} ${it.title}`.trim(),
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

  const finished = sync && sync.done === sync.total && !sync.error;

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 overflow-x-auto">
          {week.days.map((x, i) => (
            <button
              key={x.date}
              onClick={() => setDay(i)}
              className={`shrink-0 px-3 py-2 text-left font-mono text-[11px] uppercase leading-tight ${
                i === day ? "bg-bridge text-paper" : "bg-paper text-ink hover:bg-paper/60"
              }`}
            >
              Day {i + 1}
              <br />
              <span className="opacity-80">{dayLabel(x.date)}</span>
            </button>
          ))}
        </div>
        {google ? (
          <button
            onClick={addAll}
            disabled={!!sync && !sync.error && !finished}
            className="border-2 border-ink bg-ink px-4 py-2 font-mono text-xs uppercase text-paper disabled:opacity-60"
          >
            {finished
              ? `✓ ${sync.total} events on your calendar`
              : sync && !sync.error
                ? `Adding ${sync.done}/${sync.total}…`
                : `📅 Add week to Google Calendar (${total})`}
          </button>
        ) : null}
      </div>
      {sync?.error && <p className="mt-2 font-mono text-xs text-bridge-ink">⚠ {sync.error}</p>}

      <h2 className="mt-5 font-display text-3xl uppercase">
        {dayLabel(d.date)} · <span className="text-bridge-ink">{d.theme}</span>
      </h2>
      <ol className="mt-4 space-y-3">
        {d.items.map((it, i) => (
          <li key={i} className="ticket grid grid-cols-[4.5rem_1fr] gap-3 p-4">
            <div className="font-mono text-sm">
              {it.start}
              <br />
              <span className="text-bay">{it.end}</span>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className={`px-1.5 py-0.5 font-mono text-[10px] uppercase ${KIND[it.kind]?.color}`}>
                  {KIND[it.kind]?.icon} {it.kind}
                </span>
                <h3 className="font-semibold">{it.title}</h3>
              </div>
              <p className="mt-1 text-sm">📍 {it.place}</p>
              <p className="mt-1 text-sm text-bay">{it.note}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

function SectionView({ s }: { s: Section }) {
  return (
    <section>
      <h2 className="font-display text-3xl uppercase leading-tight sm:text-4xl">{s.headline}</h2>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {s.picks.slice(0, 3).map((p, i) => (
          <article key={p.name} className="ticket flex flex-col p-4">
            <p className="font-mono text-[10px] uppercase text-bridge-ink">#{i + 1}</p>
            <h3 className="text-lg font-bold leading-tight">{p.name}</h3>
            <p className="mt-1 flex-1 text-sm">{p.one_liner}</p>
            <p className="mt-3 border-l-4 border-bridge pl-2 text-sm italic">🔑 {p.insider}</p>
            <div className="mt-3 flex gap-2 font-mono text-[10px] uppercase">
              {p.cost && <span className="bg-ink px-1.5 py-0.5 text-paper">{p.cost}</span>}
              {p.needs_verification && <span className="border border-ink px-1.5 py-0.5">verify</span>}
            </div>
          </article>
        ))}
      </div>
      {s.watch_out && (
        <p className="mt-4 border-2 border-bridge bg-bridge/10 p-3 text-sm">
          <span className="font-mono text-[10px] uppercase text-bridge-ink">Watch out · </span>
          {s.watch_out}
        </p>
      )}
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
      <h2 className="font-display text-3xl uppercase leading-tight sm:text-4xl">{o.headline}</h2>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {o.targets.slice(0, 3).map((t) => (
          <article key={t.who} className="ticket flex flex-col p-4">
            <h3 className="font-bold leading-tight">{t.who}</h3>
            <p className="mt-1 text-sm text-bay">{t.why}</p>
            <p className="mt-3 flex-1 whitespace-pre-wrap bg-fog p-2 font-mono text-xs">{t.dm}</p>
            <div className="mt-3 flex flex-wrap gap-2 font-mono text-[10px] uppercase">
              <button onClick={() => copy(t.dm)} className="bg-ink px-2 py-1.5 text-paper">
                {copied === t.dm ? "Copied ✓" : "Copy DM"}
              </button>
              <a
                target="_blank"
                rel="noreferrer"
                href={`https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(t.linkedin_search)}`}
                className="border-2 border-ink px-2 py-1"
              >
                Find on LinkedIn ↗
              </a>
            </div>
          </article>
        ))}
      </div>
      <div className="ticket mt-4 p-4">
        <p className="font-mono text-[10px] uppercase tracking-widest text-bay">Announce your landing on X</p>
        <p className="mt-1 whitespace-pre-wrap">{o.x_post}</p>
        <a
          target="_blank"
          rel="noreferrer"
          href={`https://x.com/intent/post?text=${encodeURIComponent(o.x_post)}`}
          className="mt-3 inline-block bg-bridge px-3 py-1.5 font-mono text-[10px] uppercase text-paper"
        >
          Open in X ↗
        </a>
      </div>
    </section>
  );
}
