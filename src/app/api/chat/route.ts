import type Anthropic from "@anthropic-ai/sdk";
import { auth } from "@/auth";
import { runChat, type ChatEvent } from "@/lib/chat-agent";

export const runtime = "nodejs";
export const maxDuration = 300;

type Body = { messages: { role: "user" | "assistant"; content: string }[]; context?: string };

export async function POST(req: Request) {
  const { messages, context } = (await req.json()) as Body;
  const history: Anthropic.Beta.BetaMessageParam[] = messages
    .filter((m) => m.content.trim())
    .slice(-20)
    .map((m) => ({ role: m.role, content: m.content }));

  // What the agent may know about who's asking and which accounts are connected.
  const session = await auth();
  const email = session?.user?.email?.toLowerCase();
  const user = {
    name: session?.user?.name ?? null,
    google: Boolean(session?.connected?.google),
    linkedin: Boolean(session?.connected?.linkedin),
    isOwner: Boolean(email && email === process.env.CRM_OWNER_EMAIL?.toLowerCase()),
  };

  const enc = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const emit = (e: ChatEvent) => controller.enqueue(enc.encode(JSON.stringify(e) + "\n"));
      try {
        await runChat(history, context ?? "", user, emit);
      } catch (err) {
        emit({ type: "error", error: (err as Error).message });
      }
      emit({ type: "done" });
      controller.close();
    },
  });
  return new Response(stream, { headers: { "Content-Type": "application/x-ndjson" } });
}
