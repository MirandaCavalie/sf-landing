import { AGENTS, AgentId, Profile, runCoordinator, runSpecialist } from "@/lib/agents";

export const runtime = "nodejs";
export const maxDuration = 300;

// Streams NDJSON events so the UI can show every agent working in parallel.
export async function POST(req: Request) {
  const profile = (await req.json()) as Profile;
  const enc = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (e: object) => controller.enqueue(enc.encode(JSON.stringify(e) + "\n"));
      const ids = Object.keys(AGENTS) as AgentId[];
      const results: Record<string, unknown> = {};

      ids.forEach((id) => send({ type: "agent_start", id }));
      await Promise.all(
        ids.map(async (id) => {
          try {
            results[id] = await runSpecialist(id, profile);
            send({ type: "agent_done", id, data: results[id] });
          } catch (err) {
            send({ type: "agent_error", id, error: (err as Error).message });
          }
        }),
      );

      send({ type: "agent_start", id: "coordinator" });
      try {
        const week = await runCoordinator(profile, results);
        send({ type: "agent_done", id: "coordinator", data: week });
      } catch (err) {
        send({ type: "agent_error", id: "coordinator", error: (err as Error).message });
      }
      controller.close();
    },
  });

  return new Response(stream, { headers: { "Content-Type": "application/x-ndjson" } });
}
