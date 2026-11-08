import Anthropic from "@anthropic-ai/sdk";
import { betaZodTool } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod/v4";
import { playbook } from "@/data/playbook";
import { crmConfigured, fetchContacts } from "@/lib/crm";

const client = new Anthropic();

// UI "action cards" the agent can produce. The human always takes the final step.
export type Action =
  | { kind: "linkedin_search"; keywords: string; why: string; dm: string }
  | { kind: "x_post"; text: string }
  | { kind: "calendar"; title: string; start: string; end: string; location?: string; description?: string }
  | {
      kind: "coffee_invite";
      person: string;
      linkedin_url: string | null;
      why: string;
      message: string;
      cafe: string;
      start: string;
      end: string;
    };

export type ChatUser = { name: string | null; google: boolean; linkedin: boolean; isOwner: boolean };

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
- Getting 1:1 coffees is your core job. When they want to meet people, ask about their network, or want coffees/1:1s: first call search_my_network (if available) to find people they ALREADY know in SF, then call draft_coffee_invite for the best 1-3 of them (a specific café near their plan + a concrete slot in their first week + a short personal message in their voice). For new people they don't know yet, call suggest_linkedin_search.
- Messages: max 2 short sentences, personal (mention how they know each other or the next step from the CRM), offer coffee on them. Write in the person's language.
- About LinkedIn: when connected, say so. LinkedIn does not let any app read connections or send messages, so you draft and the user sends in one click (copy + open profile). Their network comes from their Notion CRM, which stores each contact's LinkedIn. Never say "I can't access your LinkedIn" without explaining what you CAN do.
- When they want to announce their trip, call draft_x_post.
- When a concrete plan with a date/time emerges, call propose_calendar_event so they can add it with one click. Times are America/Los_Angeles; use ISO 8601 with offset (-08:00 in winter, -07:00 in summer). Today is ${new Date().toISOString().slice(0, 10)}.
- Be very brief: answer first, max 3 short bullets or 2 sentences. The user is busy; no intros, no filler, no recap. Answer in the language the person writes in.
- Never invent addresses, prices or event dates. If you don't know, search or say so.`;

const CATEGORIES = Object.keys(playbook) as (keyof typeof playbook)[];

export async function runChat(
  messages: Anthropic.Beta.BetaMessageParam[],
  context: string,
  user: ChatUser,
  emit: (e: ChatEvent) => void,
) {
  const searchNetwork = betaZodTool({
    name: "search_my_network",
    description:
      "Search the user's own networking CRM (Notion, includes each contact's LinkedIn URL, role, company, location, relationship, last contact and next step). Use it to find people they already know, especially in San Francisco, for 1:1 coffees.",
    inputSchema: z.object({
      query: z.string().describe("Optional keywords: role, company, interest. Empty string for everyone."),
      only_sf: z.boolean().describe("true to return only contacts located in SF / Bay Area"),
    }),
    run: async ({ query, only_sf }) => {
      emit({ type: "tool", name: "search_my_network", label: `Searching your network${query ? `: ${query}` : ""}` });
      const all = await fetchContacts();
      const words = query.toLowerCase().split(/\W+/).filter((w) => w.length > 2);
      const hits = all.filter((c) => {
        if (only_sf && !c.inSF) return false;
        if (!words.length) return true;
        const hay = `${c.name} ${c.role} ${c.company} ${c.types.join(" ")} ${c.nextStep}`.toLowerCase();
        return words.some((w) => hay.includes(w));
      });
      return JSON.stringify((hits.length ? hits : all.filter((c) => !only_sf || c.inSF)).slice(0, 25));
    },
  });

  const coffeeInvite = betaZodTool({
    name: "draft_coffee_invite",
    description:
      "Show a 1:1 coffee invite card for ONE specific person: the message to send, their LinkedIn, the café and a proposed time slot the user can add to their calendar.",
    inputSchema: z.object({
      person: z.string(),
      linkedin_url: z.string().nullable().describe("Their LinkedIn URL if known (from the CRM), else null"),
      why: z.string().describe("Why meet them now, max 10 words"),
      message: z.string().max(320).describe("The DM to send, max 2 short sentences"),
      cafe: z.string().describe("Specific café or spot, e.g. 'Sightglass, SoMa'"),
      start: z.string().describe("ISO 8601 with offset, America/Los_Angeles"),
      end: z.string().describe("ISO 8601 with offset"),
    }),
    run: async (input) => {
      emit({ type: "tool", name: "draft_coffee_invite", label: `Drafting coffee with ${input.person}` });
      emit({ type: "action", action: { kind: "coffee_invite", ...input } });
      return "Invite card shown; the user will send it and add it to their calendar.";
    },
  });
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
      {
        type: "text",
        text: `WHO IS ASKING: ${user.name ?? "unknown"}. Connected accounts: Google Calendar ${user.google ? "YES" : "no"}, LinkedIn ${user.linkedin ? "YES (signed in; identity only)" : "no"}, Notion CRM network ${user.isOwner && crmConfigured() ? "YES (use search_my_network)" : "no"}.\n\nCONTEXT ABOUT THIS PERSON AND THEIR PLAN:\n${context || "(none yet)"}`,
      },
    ],
    tools: [
      searchPlaybook,
      suggestLinkedin,
      draftX,
      proposeEvent,
      coffeeInvite,
      ...(user.isOwner && crmConfigured() ? [searchNetwork] : []),
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
