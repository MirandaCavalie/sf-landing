// Reads the owner's Notion networking CRM ("Network" database).
// Env: NOTION_TOKEN (read-only integration with access to the database), NOTION_CRM_DB.

export type Contact = {
  id: string;
  notionUrl: string;
  name: string;
  role: string;
  company: string;
  location: string;
  inSF: boolean;
  relationship: string | null;
  status: string | null;
  types: string[];
  metVia: string | null;
  lastContact: string | null;
  nextStep: string;
  linkedin: string | null;
};

type Prop = {
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

export const crmConfigured = () => Boolean(process.env.NOTION_TOKEN && process.env.NOTION_CRM_DB);

export async function fetchContacts(): Promise<Contact[]> {
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
    if (!r.ok) throw new Error(`notion_${r.status}`);
    const d = (await r.json()) as { results: Page[]; has_more: boolean; next_cursor: string | null };
    pages.push(...d.results);
    cursor = d.has_more ? (d.next_cursor ?? undefined) : undefined;
  } while (cursor && pages.length < 500);

  return pages.map((p) => {
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
}
