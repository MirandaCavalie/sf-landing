import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod/v4";
import { playbook } from "@/data/playbook";

const client = new Anthropic();
const MODEL = "claude-opus-5-5";

export type Profile = {
  name: string;
  building: string;
  arrival: string; // YYYY-MM-DD
  stayLength: string;
  budget: string;
  lookingFor: string;
  vibe: string;
  wantToMeet: string;
};

// ---------- Output schemas (kept deliberately short: a newcomer needs 3 good answers, not 12) ----------

const Pick = z.object({
  name: z.string(),
  one_liner: z.string().describe("Why it fits them. Max 8 words, no fluff."),
  insider: z.string().describe("One insider tip. Max 10 words."),
  cost: z.string().nullable().describe("Short, e.g. 'Free', '~$10/day'. Null if unknown."),
  needs_verification: z.boolean(),
  lat: z.number().nullable().describe("Approximate latitude in SF if this is a physical place, else null"),
  lng: z.number().nullable().describe("Approximate longitude, else null"),
});

export const SectionSchema = z.object({
  headline: z.string().describe("The answer in max 6 words, e.g. 'Mission, near Valencia'"),
  picks: z.array(Pick).describe("Exactly 3 picks, best first"),
  watch_out: z.string().nullable().describe("The ONE warning. Max 10 words."),
});
export type Section = z.infer<typeof SectionSchema>;

export const OutreachSchema = z.object({
  headline: z.string(),
  targets: z
    .array(
      z.object({
        who: z.string().describe("Type of person, max 5 words, e.g. 'Pre-seed fintech founder'"),
        why: z.string().describe("Max 6 words"),
        linkedin_search: z.string().describe("Keywords for LinkedIn people search"),
        dm: z.string().describe("LinkedIn DM, max 2 short sentences (<160 chars): who you are + the ask (coffee on me). No filler."),
      }),
    )
    .describe("Exactly 3 targets"),
  x_post: z.string().describe("Post for X, max 2 short lines (<140 chars): landing dates + what you want + DMs open"),
});
export type Outreach = z.infer<typeof OutreachSchema>;

export const WeekSchema = z.object({
  tagline: z.string().describe("Their week in max 7 words"),
  secrets: z.array(z.string()).describe("Exactly 3 to-dos before landing, imperative and specific, max 8 words each (e.g. 'Apply to AngelList Founders Café')"),
  days: z
    .array(
      z.object({
        date: z.string().describe("YYYY-MM-DD"),
        theme: z.string().describe("2-3 words, e.g. 'Land & settle'"),
        items: z
          .array(
            z.object({
              start: z.string().describe("HH:MM 24h, local SF time"),
              end: z.string().describe("HH:MM 24h"),
              title: z.string().describe("Max 5 words"),
              place: z.string().describe("Specific place or neighborhood"),
              kind: z.enum(["work", "coffee", "event", "explore", "logistics"]),
              note: z.string().describe("Tip, max 8 words"),
              lat: z.number().describe("Approximate latitude of the place in San Francisco/Bay Area"),
              lng: z.number().describe("Approximate longitude"),
            }),
          )
          .describe("3-4 items"),
      }),
    )
    .describe("Exactly 7 days starting on the arrival date"),
});
export type Week = z.infer<typeof WeekSchema>;

// ---------- Agents ----------

export type AgentId = "basecamp" | "moving" | "work" | "scene" | "people";

export const AGENTS: Record<AgentId, { label: string; emoji: string; brief: string; data: unknown }> = {
  basecamp: {
    label: "Where to stay",
    emoji: "🏠",
    brief:
      "Pick where this person should stay: neighborhoods and housing strategy for their goals, budget and stay length. Be honest about areas to avoid.",
    data: { neighborhoods: playbook.neighborhoods, housing: playbook.housing, budget: playbook.budget },
  },
  moving: {
    label: "Getting around",
    emoji: "🛴",
    brief: "Decide how this person should move around SF for their stay length and budget, with real costs. Say what a local would actually pick.",
    data: { transport: playbook.transport },
  },
  work: {
    label: "Where to work",
    emoji: "☕",
    brief: "Pick where this person should work from: hidden cafés with good Wi‑Fi, free spots, cheap day passes, monthly desks. Favor the non-obvious.",
    data: { workSpots: playbook.workSpots },
  },
  scene: {
    label: "The scene",
    emoji: "🎟️",
    brief: "Pick the venues, communities, calendars and parties this person should plug into, given their goals and vibe.",
    data: { ecosystem: playbook.ecosystem, social: playbook.social, culture: playbook.culture },
  },
  people: {
    label: "Who to meet",
    emoji: "🤝",
    brief: "Plan who this person should meet first and draft the outreach. Short, specific, human, offers to pay for coffee. The human sends them.",
    data: { culture: playbook.culture, social: playbook.social },
  },
};

const SYSTEM = `You are part of SF Landing, a team of agents that helps founders and builders land in San Francisco like a local.
Your edge is insider knowledge, not generic advice. Ground every recommendation in the PLAYBOOK; you may add widely known facts, but never invent prices, addresses or event dates.
If a playbook item has verify: true, set needs_verification to true for it.
Be ruthlessly concise: respect every word limit. The user is busy and lazy: give the direct answer, no filler words, no em dashes, no 'consider', no explanations they didn't ask for.
Write in English.`;

function profileText(p: Profile) {
  return `PERSON
Name: ${p.name}
Building / doing: ${p.building}
Arrives: ${p.arrival} — staying ${p.stayLength}
Budget: ${p.budget}
Here to: ${p.lookingFor}
Vibe: ${p.vibe}
Wants to meet: ${p.wantToMeet || "(not specified)"}`;
}

async function callAgent<T>(role: string, content: string, schema: z.ZodType<T>): Promise<T> {
  const res = await client.beta.messages.parse({
    model: MODEL,
    max_tokens: 16000,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    output_config: { effort: "low", format: betaZodOutputFormat(schema) },
    system: [{ type: "text", text: SYSTEM, cache_control: { type: "ephemeral" } }],
    messages: [{ role: "user", content }],
  });
  if (res.stop_reason === "refusal") throw new Error(`${role} declined the request`);
  if (!res.parsed_output) throw new Error(`${role} returned no structured output`);
  return res.parsed_output;
}

export function runSpecialist(id: AgentId, p: Profile) {
  const a = AGENTS[id];
  const content = `ROLE: ${a.label}. ${a.brief}\n\nPLAYBOOK:\n${JSON.stringify(a.data)}\n\n${profileText(p)}`;
  return id === "people" ? callAgent(a.label, content, OutreachSchema) : callAgent(a.label, content, SectionSchema);
}

export function runCoordinator(p: Profile, results: Record<string, unknown>): Promise<Week> {
  const content = `ROLE: Coordinator. Turn your teammates' findings into this person's first 7 days in SF, starting on ${p.arrival} (Day 1 = arrival; keep Day 1 light: land, check in, one easy thing).
Each item is one concrete, scheduled action at a specific place from the findings. Across the week include at least 3 coffee chats (with the person-types from 'Who to meet'), 2-3 events/communities, focused work blocks at the recommended spots, and one fun SF experience matching their vibe. Realistic times, no overlaps, travel time in mind.
Then the 3 most useful to-dos before they land (secrets field).

TEAM FINDINGS:
${JSON.stringify(results)}

${profileText(p)}`;
  return callAgent("Coordinator", content, WeekSchema);
}
