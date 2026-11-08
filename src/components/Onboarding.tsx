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
  // Local date, not toISOString(): after 4pm in SF, UTC is already tomorrow.
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
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
    <main data-enter className="mx-auto max-w-2xl px-4 py-10 sm:px-8">
      <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
        Hey {first}, <span className="text-bridge-ink">when do you land?</span>
      </h1>

      <form
        className="ticket mt-8 space-y-6 p-6"
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
            className="w-full rounded-xl border border-black/10 bg-[#f6f4f0] px-3 py-2.5 outline-none transition focus:border-bridge"
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
            className="w-full rounded-xl border border-black/10 bg-[#f6f4f0] px-3 py-2.5 outline-none transition focus:border-bridge"
          />
        </Field>
        <Field label="Anyone specific you want to meet? (optional)">
          <input
            value={wantToMeet}
            onChange={(e) => setWantToMeet(e.target.value)}
            placeholder="e.g. fintech founders, pre-seed angels"
            className="w-full rounded-xl border border-black/10 bg-[#f6f4f0] px-3 py-2.5 outline-none transition focus:border-bridge"
          />
        </Field>
        <div className="flex justify-end pt-2">
          <button className="rounded-full bg-bridge px-6 py-3 font-medium text-white shadow-lg shadow-bridge/25 transition hover:brightness-95">
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
      <p className="mb-2 text-sm font-medium text-ink/70">{label}</p>
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
            className={`rounded-full border px-3.5 py-1.5 text-sm transition ${on ? "border-ink bg-ink text-white" : "border-black/10 bg-white hover:border-black/25"}`}
          >
            {o}
          </button>
        );
      })}
    </div>
  );
}
