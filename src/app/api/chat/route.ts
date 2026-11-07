import type Anthropic from "@anthropic-ai/sdk";
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

  const enc = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const emit = (e: ChatEvent) => controller.enqueue(enc.encode(JSON.stringify(e) + "\n"));
      try {
        await runChat(history, context ?? "", emit);
      } catch (err) {
        emit({ type: "error", error: (err as Error).message });
      }
      emit({ type: "done" });
      controller.close();
    },
  });
  return new Response(stream, { headers: { "Content-Type": "application/x-ndjson" } });
}
