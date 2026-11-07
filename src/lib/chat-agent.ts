import Anthropic from "@anthropic-ai/sdk";
import { betaZodTool } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod/v4";
import { playbook } from "@/data/playbook";

const client = new Anthropic();

// UI "action cards" the agent can produce. The human always takes the final step.
export type Action =
  | { kind: "linkedin_search"; keywords: string; why: string; dm: string }
  | { kind: "x_post"; text: string }
  | { kind: "calendar"; title: string; start: string; end: string; location?: string; description?: string };

export type ChatEvent =
  | { type: "text"; text: string }
  | { type: "tool"; name: string; label: string }
  | { type: "action"; action: Action }
  | { type: "error"; error: string }
  | { type: "done" };

const SYSTEM = `You are SF Landing's local agent: a warm, sharp friend who has lived in San Francisco's startup scene for years.
You help founders and builders land in SF: where to stay, how to move, where to work, which events/communities to join, and who to meet.

How you work:
- Use search_playbook first for anything about neighborhoods, transport, work spots, ecosystem, social life or culture. That is your insider knowledge; prefer it over generic advice. Items flagged verify:true must be presented as "double-check".
- Use web_search for anything time-sensitive (this week's events on Luma/Partiful, opening hours, current prices). Cite the source name briefly.
- When the person wants to meet someone, call suggest_linkedin_search with a crisp keyword search and a short DM (<300 chars, specific, "coffee's on me"). You cannot message anyone yourself: the human sends it.
- When they want to announce their trip, call draft_x_post.
- When a concrete plan with a date/time emerges, call propose_calendar_event so they can add it with one click. Times are America/Los_Angeles; use ISO 8601 with offset (-08:00 in winter, -07:00 in summer). Today is ${new Date().toISOString().slice(0, 10)}.
- Be very brief: answer first, max 3 short bullets or 2 sentences. The user is busy; no intros, no filler, no recap. Answer in the language the person writes in.
- Never invent addresses, prices or event dates. If you don't know, search or say so.`;

const CATEGORIES = Object.keys(playbook) as (keyof typeof playbook)[];

export async function runChat(
  messages: Anthropic.Beta.BetaMessageParam[],
  context: string,
  emit: (e: ChatEvent) => void,
) {
  const searchPlaybook = betaZodTool({
    name: "search_playbook",
    description: `Search SF Landing's curated insider playbook. Categories: ${CATEGORIES.join(", ")}. Returns matching tips as JSON.`,
    inputSchema: z.object({
      category: z.enum(CATEGORIES as [string, ...string[]]).optional(),
      query: z.string().describe("Keywords, e.g. 'cheap coworking', 'latino', 'night safety'"),
    }),
    run: async ({ category, query }) => {
      emit({ type: "tool", name: "search_playbook", label: `Searching the playbook: ${query}` });
      const pools = category ? [[category, playbook[category as keyof typeof playbook]]] : Object.entries(playbook);
      const words = query.toLowerCase().split(/\W+/).filter((w) => w.length > 2);
      const hits = pools.flatMap(([cat, tips]) =>
        (tips as { name: string; insight: string; tags?: string[] }[])
          .filter((t) => {
            const hay = `${t.name} ${t.insight} ${(t.tags ?? []).join(" ")}`.toLowerCase();
            return words.length === 0 || words.some((w) => hay.includes(w));
          })
          .map((t) => ({ category: cat, ...t })),
      );
      // Small playbook: if keyword match is empty, hand back the whole category so the model can reason.
      return JSON.stringify(hits.length ? hits : pools.map(([cat, tips]) => ({ category: cat, tips })));
    },
  });

  const suggestLinkedin = betaZodTool({
    name: "suggest_linkedin_search",
    description: "Show the person a card that opens a LinkedIn people search plus a ready-to-send DM they copy and send themselves.",
    inputSchema: z.object({
      keywords: z.string(),
      why: z.string().describe("Why this kind of person, one sentence"),
      dm: z.string().max(400),
    }),
    run: async (input) => {
      emit({ type: "tool", name: "suggest_linkedin_search", label: `Finding people: ${input.keywords}` });
      emit({ type: "action", action: { kind: "linkedin_search", ...input } });
      return "Card shown. The person will search and send the DM themselves.";
    },
  });

  const draftX = betaZodTool({
    name: "draft_x_post",
    description: "Show the person a ready-to-post X (Twitter) post announcing their SF trip and inviting coffee chats.",
    inputSchema: z.object({ text: z.string().max(280) }),
    run: async ({ text }) => {
      emit({ type: "tool", name: "draft_x_post", label: "Drafting your X post" });
      emit({ type: "action", action: { kind: "x_post", text } });
      return "Draft shown. The person will review and post it.";
    },
  });

  const proposeEvent = betaZodTool({
    name: "propose_calendar_event",
    description: "Propose a calendar event. The person sees a card and clicks to add it to Google Calendar (or download .ics).",
    inputSchema: z.object({
      title: z.string(),
      start: z.string().describe("ISO 8601 with offset"),
      end: z.string().describe("ISO 8601 with offset"),
      location: z.string().optional(),
      description: z.string().optional(),
    }),
    run: async (input) => {
      emit({ type: "tool", name: "propose_calendar_event", label: `Proposing: ${input.title}` });
      emit({ type: "action", action: { kind: "calendar", ...input } });
      return "Event card shown; the person decides whether to add it.";
    },
  });

  const runner = client.beta.messages.toolRunner({
    model: "claude-opus-5-5",
    max_tokens: 16000,
    max_iterations: 8,
    output_config: { effort: "low" },
    system: [
      { type: "text", text: SYSTEM, cache_control: { type: "ephemeral" } },
      { type: "text", text: `CONTEXT ABOUT THIS PERSON AND THEIR PLAN:\n${context || "(none yet)"}` },
    ],
    tools: [
      searchPlaybook,
      suggestLinkedin,
      draftX,
      proposeEvent,
      { type: "web_search_20260209", name: "web_search", max_uses: 3 },
    ],
    messages,
  });

  for await (const message of runner) {
    for (const block of message.content) {
      if (block.type === "text" && block.text.trim()) emit({ type: "text", text: block.text });
      if (block.type === "server_tool_use" && block.name === "web_search") {
        const q = (block.input as { query?: string }).query ?? "";
        emit({ type: "tool", name: "web_search", label: `Searching the web: ${q}` });
      }
    }
    if (message.stop_reason === "refusal") {
      emit({ type: "error", error: "The agent declined that request." });
      break;
    }
  }
}
