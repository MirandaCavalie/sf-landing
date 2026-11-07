import { auth } from "@/auth";

export const runtime = "nodejs";

// Reads the owner's Notion networking CRM ("Network" database) and returns contacts.
// Private: only the signed-in owner (CRM_OWNER_EMAIL) gets data; everyone else gets 403.
// Env: NOTION_TOKEN (internal integration with access to the database), NOTION_CRM_DB, CRM_OWNER_EMAIL.

type Prop = {
  type: string;
  title?: { plain_text: string }[];
  rich_text?: { plain_text: string }[];
  select?: { name: string } | null;
  multi_select?: { name: string }[];
  url?: string | null;
  date?: { start: string } | null;
};
type Page = { id: string; url: string; properties: Record<string, Prop> };

const text = (p?: Prop) =>
  p?.title?.map((t) => t.plain_text).join("") ?? p?.rich_text?.map((t) => t.plain_text).join("") ?? "";

const SF = /san francisco|\bsf\b|bay area|oakland|berkeley|palo alto|mountain view|menlo park|silicon valley/i;

export async function GET() {
  const session = await auth();
  const email = session?.user?.email?.toLowerCase();
  if (!email || email !== process.env.CRM_OWNER_EMAIL?.toLowerCase()) {
    return Response.json({ error: "private" }, { status: 403 });
  }
  if (!process.env.NOTION_TOKEN || !process.env.NOTION_CRM_DB) {
    return Response.json({ error: "not_configured" }, { status: 503 });
  }

  const pages: Page[] = [];
  let cursor: string | undefined;
  do {
    const r = await fetch(`https://api.notion.com/v1/databases/${process.env.NOTION_CRM_DB}/query`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.NOTION_TOKEN}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ page_size: 100, start_cursor: cursor }),
      cache: "no-store",
    });
    if (!r.ok) return Response.json({ error: `notion_${r.status}` }, { status: 502 });
    const d = (await r.json()) as { results: Page[]; has_more: boolean; next_cursor: string | null };
    pages.push(...d.results);
    cursor = d.has_more ? (d.next_cursor ?? undefined) : undefined;
  } while (cursor && pages.length < 500);

  const contacts = pages.map((p) => {
    const pr = p.properties;
    const location = text(pr["Location"]);
    return {
      id: p.id,
      notionUrl: p.url,
      name: text(pr["Name"]),
      role: text(pr["Role"]),
      company: text(pr["Company"]),
      location,
      inSF: SF.test(location),
      relationship: pr["Relationship"]?.select?.name ?? null,
      status: pr["Status"]?.select?.name ?? null,
      types: pr["Contact Type"]?.multi_select?.map((m) => m.name) ?? [],
      metVia: pr["Met Via"]?.select?.name ?? null,
      lastContact: pr["Last Contact"]?.date?.start ?? null,
      nextStep: text(pr["Next Step"]),
      linkedin: pr["LinkedIn"]?.url ?? null,
    };
  });
  return Response.json({ contacts });
}
