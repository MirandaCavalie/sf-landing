import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod/v4";
import { playbook } from "@/data/playbook";

const client = new Anthropic();
const MODEL = "claude-opus-5-5";

export type Profile = {
  name: string;
  building: string;
  arrival: string;
  stayLength: string;
  budget: string;
  lookingFor: string;
  vibe: string;
  wantToMeet: string;
};

// ---------- Output schemas ----------

const Pick = z.object({
  name: z.string(),
  why_you: z.string().describe("Why this fits THIS person specifically, 1 sentence"),
  insider: z.string().describe("The non-obvious local tip, 1 sentence"),
  cost: z.string().nullable(),
  needs_verification: z.boolean(),
});

export const SectionSchema = z.object({
  headline: z.string().describe("Punchy 4-8 word headline"),
  picks: z.array(Pick),
  watch_out: z.array(z.string()).describe("Honest warnings locals would give"),
});
export type Section = z.infer<typeof SectionSchema>;

export const OutreachSchema = z.object({
  headline: z.string(),
  targets: z.array(
    z.object({
      who: z.string().describe("Type of person, e.g. 'Seed-stage fintech founder in SF'"),
      why: z.string(),
      linkedin_search: z.string().describe("Keywords to paste in LinkedIn people search"),
      dm: z.string().describe("Short LinkedIn DM, <300 chars, specific, offers to pay for coffee"),
    }),
  ),
  x_post: z.string().describe("A post for X announcing the trip and inviting coffee chats"),
});
export type Outreach = z.infer<typeof OutreachSchema>;

export const WeekSchema = z.object({
  tagline: z.string(),
  secrets: z.array(z.string()).describe("Top 3 things nobody tells newcomers, for this person"),
  days: z.array(
    z.object({
      day: z.string(),
      morning: z.string(),
      afternoon: z.string(),
      evening: z.string(),
    }),
  ),
});
export type Week = z.infer<typeof WeekSchema>;

// ---------- Agents ----------

export type AgentId = "basecamp" | "moving" | "work" | "scene" | "people";

export const AGENTS: Record<AgentId, { label: string; emoji: string; brief: string; data: unknown }> = {
  basecamp: {
    label: "Base Camp",
    emoji: "🏠",
    brief:
      "You pick where this person should stay: neighborhoods ranked for their goals, budget and stay length, plus housing strategy. Be honest about areas to avoid.",
    data: { neighborhoods: playbook.neighborhoods, housing: playbook.housing },
  },
  moving: {
    label: "Getting Around",
    emoji: "🛴",
    brief:
      "You design how this person moves around SF for their stay length and budget. Compare options with real costs and say which one a local would actually pick.",
    data: { transport: playbook.transport },
  },
  work: {
    label: "Where to Work",
    emoji: "☕",
    brief:
      "You find where this person should work from: hidden cafés with good Wi‑Fi, free spots, cheap day passes and monthly coworkings. Favor the non-obvious over the famous.",
    data: { workSpots: playbook.workSpots },
  },
  scene: {
    label: "The Scene",
    emoji: "🎟️",
    brief:
      "You map the SF tech and social scene for this person: which venues, communities, calendars and parties to plug into, given what they're looking for and their vibe.",
    data: { ecosystem: playbook.ecosystem, social: playbook.social, culture: playbook.culture },
  },
  people: {
    label: "Coffee Agent",
    emoji: "🤝",
    brief:
      "You plan who this person should meet in their first weeks and draft the outreach. Messages must be specific, short, human, and offer to pay for coffee. The human sends them — you only draft.",
    data: { culture: playbook.culture, social: playbook.social },
  },
};

const SYSTEM = `You are part of SF Landing, a team of agents that helps founders and builders land in San Francisco like a local.
Your edge is insider knowledge, not generic advice. Ground every recommendation in the PLAYBOOK you are given; you may add widely known facts, but never invent specific prices, addresses or event dates.
If a playbook item has verify: true, set needs_verification to true for it.
Write in the same language the person used in their profile. Be concise, warm and direct.`;

function profileText(p: Profile) {
  return `PERSON
Name: ${p.name}
Building: ${p.building}
Arrives: ${p.arrival} — staying ${p.stayLength}
Budget: ${p.budget}
Looking for: ${p.lookingFor}
Vibe / interests: ${p.vibe}
Wants to meet: ${p.wantToMeet || "(not specified)"}`;
}

async function callAgent<T>(id: AgentId, p: Profile, schema: z.ZodType<T>): Promise<T> {
  const agent = AGENTS[id];
  const res = await client.beta.messages.parse({
    model: MODEL,
    max_tokens: 16000,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    output_config: { effort: "low", format: betaZodOutputFormat(schema) },
    system: [{ type: "text", text: SYSTEM, cache_control: { type: "ephemeral" } }],
    messages: [
      {
        role: "user",
        content: `ROLE: ${agent.label}. ${agent.brief}\n\nPLAYBOOK:\n${JSON.stringify(agent.data)}\n\n${profileText(p)}`,
      },
    ],
  });
  if (res.stop_reason === "refusal") throw new Error(`${agent.label} declined the request`);
  if (!res.parsed_output) throw new Error(`${agent.label} returned no structured output`);
  return res.parsed_output;
}

export function runSpecialist(id: AgentId, p: Profile) {
  return id === "people" ? callAgent(id, p, OutreachSchema) : callAgent(id, p, SectionSchema);
}

export async function runCoordinator(p: Profile, results: Record<string, unknown>): Promise<Week> {
  const res = await client.beta.messages.parse({
    model: MODEL,
    max_tokens: 16000,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    output_config: { effort: "low", format: betaZodOutputFormat(WeekSchema) },
    system: [{ type: "text", text: SYSTEM, cache_control: { type: "ephemeral" } }],
    messages: [
      {
        role: "user",
        content: `ROLE: Coordinator. Merge your teammates' findings into this person's first 7 days in SF (Day 1 = arrival). Each slot is one concrete action using a specific place/event/person-type from the findings. Include at least 3 coffee chats and 2 events. Then list the top 3 secrets.\n\nTEAM FINDINGS:\n${JSON.stringify(results)}\n\n${profileText(p)}`,
      },
    ],
  });
  if (res.stop_reason === "refusal") throw new Error("Coordinator declined the request");
  if (!res.parsed_output) throw new Error("Coordinator returned no structured output");
  return res.parsed_output;
}
