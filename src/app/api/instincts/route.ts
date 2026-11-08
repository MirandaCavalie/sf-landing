import { auth } from "@/auth";
import type { Profile } from "@/lib/agents";
import { noticeInstincts } from "@/lib/instincts";

export const runtime = "nodejs";
export const maxDuration = 120;

// POST { profile, plan } -> { instincts: [...] }
export async function POST(req: Request) {
  const { profile, plan } = (await req.json()) as { profile: Profile; plan: Record<string, unknown> };
  const session = await auth();
  const email = session?.user?.email?.toLowerCase();
  const isOwner = Boolean(email && email === process.env.CRM_OWNER_EMAIL?.toLowerCase());
  try {
    return Response.json({ instincts: await noticeInstincts(profile, plan, isOwner) });
  } catch (e) {
    return Response.json({ instincts: [], error: (e as Error).message }, { status: 200 });
  }
}
