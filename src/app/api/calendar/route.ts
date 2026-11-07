import { getToken } from "next-auth/jwt";
import { z } from "zod/v4";

const EventInput = z.object({
  title: z.string().min(1),
  start: z.string(), // ISO 8601 with offset
  end: z.string(),
  location: z.string().optional(),
  description: z.string().optional(),
});

// Called only when the human clicks "Add to Google Calendar" on a card the agent proposed.
export async function POST(req: Request) {
  const token = await getToken({ req, secret: process.env.AUTH_SECRET, secureCookie: req.url.startsWith("https") });
  const accessToken = token?.googleAccessToken as string | undefined;
  if (!accessToken) return Response.json({ error: "Connect Google first" }, { status: 401 });

  const parsed = EventInput.safeParse(await req.json());
  if (!parsed.success) return Response.json({ error: "Invalid event" }, { status: 400 });
  const e = parsed.data;

  const res = await fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events", {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      summary: e.title,
      location: e.location,
      description: `${e.description ?? ""}\n\nPlanned with SF Landing`.trim(),
      start: { dateTime: e.start, timeZone: "America/Los_Angeles" },
      end: { dateTime: e.end, timeZone: "America/Los_Angeles" },
    }),
  });
  const body = await res.json();
  if (!res.ok) return Response.json({ error: body?.error?.message ?? "Calendar error" }, { status: res.status });
  return Response.json({ id: body.id, link: body.htmlLink });
}
