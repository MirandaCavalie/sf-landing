"use client";

import { useState } from "react";
import type { Outreach, Profile, Section, Week } from "@/lib/agents";

type Status = "idle" | "boarding" | "landed" | "delayed";
const BOARD: { id: string; label: string; emoji: string; gate: string }[] = [
  { id: "basecamp", label: "Base Camp", emoji: "🏠", gate: "A1" },
  { id: "moving", label: "Getting Around", emoji: "🛴", gate: "A2" },
  { id: "work", label: "Where to Work", emoji: "☕", gate: "B1" },
  { id: "scene", label: "The Scene", emoji: "🎟️", gate: "B2" },
  { id: "people", label: "Coffee Agent", emoji: "🤝", gate: "C1" },
  { id: "coordinator", label: "Your First Week", emoji: "🗓️", gate: "C2" },
];

const DEMO: Profile = {
  name: "Sofía",
  building: "AI tool for Latin American SMBs to automate invoicing",
  arrival: "Next Monday",
  stayLength: "1 month",
  budget: "Tight — bootstrapped",
  lookingFor: "Technical cofounder and first angel investors",
  vibe: "Latina, loves parties and meeting people, works best in cafés",
  wantToMeet: "Fintech founders, Latino founders in SF, pre-seed angels",
};

const EMPTY: Profile = { name: "", building: "", arrival: "", stayLength: "", budget: "", lookingFor: "", vibe: "", wantToMeet: "" };

const FIELDS: { key: keyof Profile; label: string; placeholder: string; wide?: boolean }[] = [
  { key: "name", label: "Passenger", placeholder: "Your name" },
  { key: "arrival", label: "Arriving", placeholder: "e.g. Nov 15" },
  { key: "stayLength", label: "Staying", placeholder: "2 weeks / 1 month / moving" },
  { key: "budget", label: "Budget", placeholder: "Tight / medium / comfy" },
  { key: "building", label: "Building", placeholder: "What are you working on?", wide: true },
  { key: "lookingFor", label: "Looking for", placeholder: "Cofounder, investors, users, a job…", wide: true },
  { key: "vibe", label: "Your vibe", placeholder: "Parties? Quiet cafés? Latino community? Outdoors?", wide: true },
  { key: "wantToMeet", label: "Want to meet", placeholder: "Types of people or specific names", wide: true },
];

export default function Home() {
  const [profile, setProfile] = useState<Profile>(EMPTY);
  const [status, setStatus] = useState<Record<string, Status>>({});
  const [data, setData] = useState<Record<string, unknown>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [running, setRunning] = useState(false);

  async function land() {
    setRunning(true);
    setData({});
    setErrors({});
    setStatus({});
    // ?replay plays back a recorded real run (offline backup for live demos).
    const replay = new URLSearchParams(window.location.search).has("replay");
    const res = replay
      ? await fetch("/demo-run.ndjson")
      : await fetch("/api/plan", { method: "POST", body: JSON.stringify(profile) });
    const reader = replay ? paced(await res.text()) : res.body!.getReader();
    const dec = new TextDecoder();
    let buf = "";
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      const lines = buf.split("\n");
      buf = lines.pop()!;
      for (const line of lines) {
        if (!line.trim()) continue;
        const e = JSON.parse(line);
        if (e.type === "agent_start") setStatus((s) => ({ ...s, [e.id]: "boarding" }));
        if (e.type === "agent_done") {
          setStatus((s) => ({ ...s, [e.id]: "landed" }));
          setData((d) => ({ ...d, [e.id]: e.data }));
        }
        if (e.type === "agent_error") {
          setStatus((s) => ({ ...s, [e.id]: "delayed" }));
          setErrors((x) => ({ ...x, [e.id]: e.error }));
        }
      }
    }
    setRunning(false);
  }

  const started = Object.keys(status).length > 0;
  const week = data.coordinator as Week | undefined;

  return (
    <main className="mx-auto max-w-6xl px-4 pb-24 sm:px-8">
      {/* Header */}
      <header className="flex items-center justify-between py-6 font-mono text-xs uppercase tracking-widest">
        <span className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded-full bg-bridge" /> SF Landing
        </span>
        <span className="hidden sm:inline">SFO → Your new life · 37.77°N 122.42°W</span>
      </header>

      {/* Hero */}
      <section className="grid gap-8 pt-6 md:grid-cols-[1.2fr_1fr] md:items-end">
        <div>
          <p className="font-mono text-sm uppercase tracking-widest text-bay">Arrivals · San Francisco</p>
          <h1 className="font-display text-6xl uppercase leading-[0.9] sm:text-8xl">
            Land like
            <br />
            <span className="text-bridge">a local.</span>
          </h1>
        </div>
        <p className="max-w-md text-lg">
          Not another &ldquo;moving to SF&rdquo; guide. A crew of AI agents that knows the $10 coworkings, the cafés with real
          Wi‑Fi, which blocks to skip at night, the Luma calendars that matter — and books your first coffees.
        </p>
      </section>

      {/* Boarding pass form */}
      <section className="ticket mt-12">
        <div className="flex items-center justify-between border-b-2 border-ink bg-ink px-5 py-3 font-mono text-xs uppercase tracking-widest text-paper">
          <span>Boarding pass</span>
          <button
            type="button"
            onClick={() => setProfile(DEMO)}
            className="rounded-sm border border-paper/40 px-2 py-1 hover:bg-paper hover:text-ink"
          >
            Load demo passenger
          </button>
        </div>
        <div className="grid gap-x-6 gap-y-4 p-5 sm:grid-cols-4">
          {FIELDS.map((f) => (
            <label key={f.key} className={f.wide ? "sm:col-span-2" : ""}>
              <span className="block font-mono text-[11px] uppercase tracking-widest text-bay">{f.label}</span>
              <input
                value={profile[f.key]}
                onChange={(e) => setProfile({ ...profile, [f.key]: e.target.value })}
                placeholder={f.placeholder}
                className="mt-1 w-full border-b-2 border-ink/20 bg-transparent py-1 text-lg outline-none focus:border-bridge"
              />
            </label>
          ))}
        </div>
        <div className="perforated flex flex-wrap items-center justify-between gap-4 px-5 py-4">
          <span className="font-mono text-xs uppercase tracking-widest text-bay">
            Gate 501 Folsom · Crew: 6 agents
          </span>
          <button
            onClick={land}
            disabled={running || !profile.name || !profile.building}
            className="bg-bridge px-6 py-3 font-display text-2xl uppercase tracking-wide text-paper transition hover:translate-x-[2px] hover:translate-y-[2px] disabled:opacity-40"
          >
            {running ? "Landing…" : "Land me in SF →"}
          </button>
        </div>
      </section>

      {/* Arrivals board */}
      {started && (
        <section className="mt-12 overflow-hidden rounded-sm bg-ink font-mono text-paper">
          <div className="grid grid-cols-[3rem_1fr_6rem] gap-2 border-b border-paper/20 px-5 py-3 text-[11px] uppercase tracking-widest text-mist sm:grid-cols-[4rem_1fr_6rem_8rem]">
            <span>Gate</span>
            <span>Agent</span>
            <span className="hidden sm:block">Flight</span>
            <span className="text-right">Status</span>
          </div>
          {BOARD.map((b, i) => {
            const s = status[b.id] ?? "idle";
            return (
              <div
                key={b.id}
                className="grid grid-cols-[3rem_1fr_6rem] items-center gap-2 border-b border-paper/10 px-5 py-3 sm:grid-cols-[4rem_1fr_6rem_8rem]"
              >
                <span className="text-mist">{b.gate}</span>
                <span className="truncate text-base">
                  {b.emoji} {b.label}
                </span>
                <span className="hidden text-mist sm:block">SFL {100 + i * 7}</span>
                <span
                  className={`text-right text-sm uppercase ${
                    s === "landed" ? "text-green-400" : s === "delayed" ? "text-bridge" : s === "boarding" ? "blink text-yellow-300" : "text-mist"
                  }`}
                >
                  {s === "idle" ? "Scheduled" : s}
                </span>
              </div>
            );
          })}
        </section>
      )}

      {Object.entries(errors).map(([id, msg]) => (
        <p key={id} className="mt-3 font-mono text-sm text-bridge">
          {id}: {msg}
        </p>
      ))}

      {/* First week */}
      {week && (
        <section className="mt-16">
          <SectionTitle kicker="Itinerary" title={week.tagline} />
          <div className="mb-8 grid gap-4 md:grid-cols-3">
            {week.secrets.map((s, i) => (
              <div key={i} className="ticket p-5">
                <p className="font-mono text-[11px] uppercase tracking-widest text-bridge">Secret #{i + 1}</p>
                <p className="mt-2 text-lg leading-snug">{s}</p>
              </div>
            ))}
          </div>
          <div className="ticket divide-y-2 divide-dashed divide-ink/30">
            {week.days.map((d) => (
              <div key={d.day} className="grid gap-3 p-5 md:grid-cols-[8rem_1fr_1fr_1fr]">
                <p className="font-display text-2xl uppercase">{d.day}</p>
                <Slot label="AM" text={d.morning} />
                <Slot label="PM" text={d.afternoon} />
                <Slot label="Night" text={d.evening} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Specialist sections */}
      <div className="mt-16 grid gap-10 lg:grid-cols-2">
        {(["basecamp", "moving", "work", "scene"] as const).map((id) =>
          data[id] ? <SectionCard key={id} id={id} s={data[id] as Section} /> : null,
        )}
      </div>

      {data.people ? <OutreachCard o={data.people as Outreach} /> : null}

      <footer className="mt-24 font-mono text-xs uppercase tracking-widest text-bay">
        Built at the Anything Applied Agentic Hackathon · EF, 501 Folsom · Nov 7, 2026
      </footer>
    </main>
  );
}

// Re-emits recorded NDJSON lines with realistic delays so the board animates.
function paced(text: string) {
  const enc = new TextEncoder();
  const lines = text.split("\n").filter(Boolean);
  let i = 0;
  return {
    async read(): Promise<{ done: boolean; value?: Uint8Array }> {
      if (i >= lines.length) return { done: true };
      const line = lines[i++];
      await new Promise((r) => setTimeout(r, line.includes("agent_done") ? 1200 + Math.random() * 1500 : 150));
      return { done: false, value: enc.encode(line + "\n") };
    },
  };
}

function SectionTitle({ kicker, title }: { kicker: string; title: string }) {
  return (
    <div className="mb-6">
      <p className="font-mono text-xs uppercase tracking-widest text-bay">{kicker}</p>
      <h2 className="font-display text-4xl uppercase leading-none sm:text-5xl">{title}</h2>
    </div>
  );
}

function Slot({ label, text }: { label: string; text: string }) {
  return (
    <div>
      <p className="font-mono text-[11px] uppercase tracking-widest text-bridge">{label}</p>
      <p className="mt-1 leading-snug">{text}</p>
    </div>
  );
}

function SectionCard({ id, s }: { id: string; s: Section }) {
  const b = BOARD.find((x) => x.id === id)!;
  return (
    <section>
      <SectionTitle kicker={`${b.emoji} ${b.label}`} title={s.headline} />
      <div className="space-y-4">
        {s.picks.map((p) => (
          <div key={p.name} className="ticket p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="text-xl font-bold">{p.name}</h3>
              <div className="flex gap-2 font-mono text-xs">
                {p.cost && <span className="bg-ink px-2 py-0.5 text-paper">{p.cost}</span>}
                {p.needs_verification && <span className="border border-ink px-2 py-0.5">verify</span>}
              </div>
            </div>
            <p className="mt-2">{p.why_you}</p>
            <p className="mt-2 border-l-4 border-bridge pl-3 text-sm italic">🔑 {p.insider}</p>
          </div>
        ))}
        {s.watch_out.length > 0 && (
          <div className="border-2 border-bridge bg-bridge/10 p-4">
            <p className="font-mono text-xs uppercase tracking-widest text-bridge">Watch out</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              {s.watch_out.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}

function OutreachCard({ o }: { o: Outreach }) {
  const [copied, setCopied] = useState<string | null>(null);
  const copy = (t: string) => {
    navigator.clipboard.writeText(t);
    setCopied(t);
    setTimeout(() => setCopied(null), 1500);
  };
  return (
    <section className="mt-16">
      <SectionTitle kicker="🤝 Coffee Agent · you hit send" title={o.headline} />
      <div className="grid gap-4 md:grid-cols-2">
        {o.targets.map((t) => (
          <div key={t.who} className="ticket flex flex-col p-5">
            <h3 className="text-lg font-bold">{t.who}</h3>
            <p className="mt-1 text-sm text-bay">{t.why}</p>
            <p className="mt-4 flex-1 whitespace-pre-wrap rounded-sm bg-fog p-3 font-mono text-sm">{t.dm}</p>
            <div className="mt-4 flex flex-wrap gap-2 font-mono text-xs uppercase">
              <button onClick={() => copy(t.dm)} className="bg-ink px-3 py-2 text-paper">
                {copied === t.dm ? "Copied ✓" : "Copy DM"}
              </button>
              <a
                target="_blank"
                rel="noreferrer"
                href={`https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(t.linkedin_search)}`}
                className="border-2 border-ink px-3 py-2"
              >
                Find on LinkedIn ↗
              </a>
            </div>
          </div>
        ))}
      </div>
      <div className="ticket mt-6 p-5">
        <p className="font-mono text-xs uppercase tracking-widest text-bay">Post on X</p>
        <p className="mt-2 whitespace-pre-wrap text-lg">{o.x_post}</p>
        <a
          target="_blank"
          rel="noreferrer"
          href={`https://x.com/intent/post?text=${encodeURIComponent(o.x_post)}`}
          className="mt-4 inline-block bg-bridge px-4 py-2 font-mono text-xs uppercase text-paper"
        >
          Open in X ↗
        </a>
      </div>
    </section>
  );
}
