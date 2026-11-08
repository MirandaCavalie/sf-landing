import { auth } from "@/auth";
import { crmConfigured, fetchContacts } from "@/lib/crm";

export const runtime = "nodejs";

// Private: only the signed-in owner (CRM_OWNER_EMAIL) gets data; everyone else gets 403.
export async function GET() {
  const session = await auth();
  const email = session?.user?.email?.toLowerCase();
  if (!email || email !== process.env.CRM_OWNER_EMAIL?.toLowerCase()) {
    return Response.json({ error: "private" }, { status: 403 });
  }
  if (!crmConfigured()) return Response.json({ error: "not_configured" }, { status: 503 });
  try {
    return Response.json({ contacts: await fetchContacts() });
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 502 });
  }
}
