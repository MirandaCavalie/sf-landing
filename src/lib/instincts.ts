import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod/v4";
import snapshot from "@/data/events-snapshot.json";
import type { Profile, Week } from "@/lib/agents";
import { crmConfigured, fetchContacts } from "@/lib/crm";
import type { SFEvent } from "@/lib/events";

// "Instincts": things the agent notices on its own, before the user asks.
// We gather cheap, real signals in code, then let the model pick and phrase the few that matter.

const client = new Anthropic();

export const InstinctSchema = z.object({
  instincts: z
    .array(
      z.object({
        emoji: z.string().describe("One emoji"),
        title: z.string().describe("What you noticed, max 8 words"),
        detail: z.string().describe("Why it matters to them, max 14 words, concrete (names, days, places)"),
        action: z.string().describe("Button label, verb + object, max 3 words"),
        prompt: z.string().describe("What the user would ask the agent to do when they press it, first person, specific"),
      }),
    )
    .describe("3 or 4 instincts, most useful first"),
});
export type Instinct = z.infer<typeof InstinctSchema>["instincts"][number];

async function weather(from: string, to: string) {
  try {
    const r = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=37.7749&longitude=-122.4194&daily=precipitation_probability_max,temperature_2m_max,temperature_2m_min&temperature_unit=fahrenheit&timezone=America/Los_Angeles&start_date=${from}&end_date=${to}`,
      { cache: "no-store" },
    );
    const d = await r.json();
    return (d.daily?.time ?? []).map((t: string, i: number) => ({
      date: t,
      rain: d.daily.precipitation_probability_max[i],
      high: Math.round(d.daily.temperature_2m_max[i]),
      low: Math.round(d.daily.temperature_2m_min[i]),
    }));
  } catch {
    return [];
  }
}

function gaps(week: Week) {
  // Free windows of 2h+ between 9:00 and 21:00 on each day.
  return week.days.flatMap((d) => {
    const busy = [...d.items].sort((a, b) => a.start.localeCompare(b.start));
    const out: string[] = [];
    let cursor = "09:00";
    for (const it of busy) {
      if (it.start > cursor && toMin(it.start) - toMin(cursor) >= 120) out.push(`${d.date} ${cursor}-${it.start}`);
      if (it.end > cursor) cursor = it.end;
    }
    if (toMin("21:00") - toMin(cursor) >= 120) out.push(`${d.date} ${cursor}-21:00`);
    return out;
  });
}
const toMin = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5));

export async function noticeInstincts(profile: Profile, plan: Record<string, unknown>, isOwner: boolean): Promise<Instinct[]> {
  const week = plan.coordinator as Week | undefined;
  if (!week?.days?.length) return [];
  const from = week.days[0].date;
  const to = week.days[week.days.length - 1].date;
  const lo = new Date(`${from}T00:00:00-08:00`).getTime();
  const hi = new Date(`${to}T23:59:59-08:00`).getTime();

  const events = (snapshot as SFEvent[])
    .filter((e) => {
      const t = new Date(e.start).getTime();
      return t >= lo && t <= hi;
    })
    .map((e) => ({ title: e.title, start: e.start, venue: e.venue ?? e.neighborhood, going: e.going, source: e.source }));

  const [forecast, contacts] = await Promise.all([
    weather(from, to),
    isOwner && crmConfigured() ? fetchContacts().catch(() => []) : Promise.resolve([]),
  ]);
  const network = contacts
    .filter((c) => c.inSF)
    .map((c) => ({ name: c.name, role: c.role, company: c.company, relationship: c.relationship, lastContact: c.lastContact, nextStep: c.nextStep }));

  const signals = {
    person: profile,
    plan: week.days.map((d) => ({ date: d.date, items: d.items.map((i) => `${i.start} ${i.kind}: ${i.title} @ ${i.place}`) })),
    freeWindows: gaps(week),
    weather: forecast,
    eventsThatWeek: events.slice(0, 40),
    networkInSF: network,
  };

  const res = await client.beta.messages.parse({
    model: "claude-opus-5-5",
    max_tokens: 4000,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    output_config: { effort: "low", format: betaZodOutputFormat(InstinctSchema) },
    system:
      "You are SF Landing's proactive agent. Look at the user's plan and real signals and surface only what a sharp local friend would text them unprompted: a concrete opportunity or risk they haven't acted on. Prefer: people from their network in SF they should see (use real names), a specific event that fits their goals and a free window, weather that breaks a plan item (rain >40% on a scooter/outdoor day), a free window to fill. Never generic tips. Be specific with days (e.g. 'Thu'), names and places. English.",
    messages: [{ role: "user", content: `SIGNALS:\n${JSON.stringify(signals)}` }],
  });
  if (res.stop_reason === "refusal" || !res.parsed_output) return [];
  return res.parsed_output.instincts.slice(0, 4);
}
