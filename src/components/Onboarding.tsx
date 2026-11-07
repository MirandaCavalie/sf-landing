"use client";

import { useState } from "react";
import type { Profile } from "@/lib/agents";

const STAY = ["1 week", "2–4 weeks", "1–3 months", "Moving here"];
const BUDGET = ["Tight", "Medium", "Comfortable"];
const GOALS = ["Find a cofounder", "Raise money", "Meet users", "Hire", "Find a job", "Explore the scene"];
const VIBES = ["Parties", "Quiet cafés", "Hackathons", "Outdoors", "Latino community", "Women in tech"];

function nextMonday() {
  const d = new Date();
  d.setDate(d.getDate() + ((8 - d.getDay()) % 7 || 7));
  return d.toISOString().slice(0, 10);
}

export default function Onboarding({ name, onSubmit }: { name: string; onSubmit: (p: Profile) => void }) {
  const [arrival, setArrival] = useState(nextMonday());
  const [stay, setStay] = useState("2–4 weeks");
  const [budget, setBudget] = useState("Tight");
  const [goals, setGoals] = useState<string[]>(["Find a cofounder"]);
  const [vibes, setVibes] = useState<string[]>(["Quiet cafés"]);
  const [building, setBuilding] = useState("");
  const [wantToMeet, setWantToMeet] = useState("");

  const first = name.split(" ")[0] || "there";

  return (
    <main className="mx-auto max-w-2xl px-4 py-10 sm:px-8">
      <p className="font-mono text-xs uppercase tracking-widest text-bay">Boarding pass · 30 seconds</p>
      <h1 className="mt-2 font-display text-5xl uppercase leading-none sm:text-6xl">
        Hey {first}, <span className="text-bridge-ink">when do you land?</span>
      </h1>

      <form
        className="ticket ticket-notch mt-8 space-y-6 p-6"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit({
            name,
            arrival,
            stayLength: stay,
            budget,
            lookingFor: goals.join(", "),
            vibe: vibes.join(", "),
            building: building || "Not specified",
            wantToMeet,
          });
        }}
      >
        <Field label="Arriving">
          <input
            type="date"
            required
            value={arrival}
            onChange={(e) => setArrival(e.target.value)}
            className="w-full border-b-2 border-ink/20 bg-transparent py-1 text-lg outline-none focus:border-bridge"
          />
        </Field>
        <Field label="Staying">
          <Chips options={STAY} value={[stay]} onToggle={(v) => setStay(v)} />
        </Field>
        <Field label="Budget">
          <Chips options={BUDGET} value={[budget]} onToggle={(v) => setBudget(v)} />
        </Field>
        <Field label="I'm here to">
          <Chips options={GOALS} value={goals} onToggle={(v) => setGoals(toggle(goals, v))} />
        </Field>
        <Field label="My vibe">
          <Chips options={VIBES} value={vibes} onToggle={(v) => setVibes(toggle(vibes, v))} />
        </Field>
        <Field label="What are you building? (optional)">
          <input
            value={building}
            onChange={(e) => setBuilding(e.target.value)}
            placeholder="e.g. AI invoicing for LatAm SMBs"
            className="w-full border-b-2 border-ink/20 bg-transparent py-1 text-lg outline-none focus:border-bridge"
          />
        </Field>
        <Field label="Anyone specific you want to meet? (optional)">
          <input
            value={wantToMeet}
            onChange={(e) => setWantToMeet(e.target.value)}
            placeholder="e.g. fintech founders, pre-seed angels"
            className="w-full border-b-2 border-ink/20 bg-transparent py-1 text-lg outline-none focus:border-bridge"
          />
        </Field>
        <div className="perforated -mx-6 flex justify-end px-6 pt-5">
          <button className="bg-bridge px-6 py-3 font-display text-2xl uppercase tracking-wide text-paper transition hover:-translate-y-0.5">
            Plan my landing →
          </button>
        </div>
      </form>
    </main>
  );
}

function toggle(list: string[], v: string) {
  return list.includes(v) ? list.filter((x) => x !== v) : [...list, v];
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 font-mono text-[11px] uppercase tracking-widest text-bay">{label}</p>
      {children}
    </div>
  );
}

function Chips({ options, value, onToggle }: { options: string[]; value: string[]; onToggle: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const on = value.includes(o);
        return (
          <button
            type="button"
            key={o}
            onClick={() => onToggle(o)}
            aria-pressed={on}
            className={`border-2 border-ink px-3 py-1.5 text-sm transition ${on ? "bg-ink text-paper" : "bg-paper hover:bg-fog"}`}
          >
            {o}
          </button>
        );
      })}
    </div>
  );
}
