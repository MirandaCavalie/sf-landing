"use client";

import { useCallback, useEffect, useState } from "react";
import AuthGate from "@/components/AuthGate";
import Building, { type Status } from "@/components/Building";
import Dashboard from "@/components/Dashboard";
import Intro from "@/components/Intro";
import Onboarding from "@/components/Onboarding";
import type { Profile } from "@/lib/agents";

type Stage = "loading" | "intro" | "auth" | "onboard" | "building" | "dash";
type Session = { user?: { name?: string; image?: string }; connected?: { google: boolean; linkedin: boolean } } | null;

const KEY = "sfl:v2";

function load(): { profile: Profile; plan: Record<string, unknown> } | null {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "null");
  } catch {
    return null;
  }
}
function save(v: { profile: Profile; plan: Record<string, unknown> } | null) {
  try {
    if (v) localStorage.setItem(KEY, JSON.stringify(v));
    else localStorage.removeItem(KEY);
  } catch {}
}

export default function Home() {
  const [stage, setStage] = useState<Stage>("loading");
  const [session, setSession] = useState<Session>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [plan, setPlan] = useState<Record<string, unknown>>({});
  const [status, setStatus] = useState<Record<string, Status>>({});
  // ?demo plays a recorded real run without sign-in: offline backup for live demos.
  const [demo, setDemo] = useState(false);

  const route = useCallback((s: Session, isDemo: boolean) => {
    const saved = load();
    if (isDemo) return setStage("onboard");
    if (!s?.connected?.google) return setStage("auth");
    if (saved) {
      setProfile(saved.profile);
      setPlan(saved.plan);
      return setStage("dash");
    }
    setStage("onboard");
  }, []);

  useEffect(() => {
    const isDemo = new URLSearchParams(window.location.search).has("demo");
    setDemo(isDemo);
    fetch("/api/auth/session")
      .then((r) => r.json())
      .catch(() => null)
      .then((s: Session) => {
        setSession(s);
        let seen = false;
        try {
          seen = sessionStorage.getItem("sfl:intro") === "1";
        } catch {}
        if (!seen) setStage("intro");
        else route(s, isDemo);
      });
  }, [route]);

  async function plan_(p: Profile) {
    setProfile(p);
    setPlan({});
    setStatus({});
    setStage("building");
    const res = demo
      ? await fetch("/demo-run.ndjson")
      : await fetch("/api/plan", { method: "POST", body: JSON.stringify(p) });
    const text = demo ? await res.text() : null;
    const reader = text ? paced(text) : res.body!.getReader();
    const dec = new TextDecoder();
    const out: Record<string, unknown> = {};
    let buf = "";
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      const lines = buf.split("\n");
      buf = lines.pop()!;
      for (const line of lines) {
        if (!line.trim()) continue;
        const e = JSON.parse(line);
        if (e.type === "agent_start") setStatus((s) => ({ ...s, [e.id]: "boarding" }));
        if (e.type === "agent_done") {
          out[e.id] = e.data;
          setStatus((s) => ({ ...s, [e.id]: "landed" }));
        }
        if (e.type === "agent_error") setStatus((s) => ({ ...s, [e.id]: "delayed" }));
      }
    }
    setPlan(out);
    if (!demo) save({ profile: p, plan: out });
    setTimeout(() => setStage("dash"), 600);
  }

  if (stage === "loading") return <div className="min-h-screen bg-ink" />;
  if (stage === "intro")
    return (
      <Intro
        onDone={() => {
          try {
            sessionStorage.setItem("sfl:intro", "1");
          } catch {}
          route(session, demo);
        }}
      />
    );
  if (stage === "auth") return <AuthGate />;
  if (stage === "onboard") return <Onboarding name={session?.user?.name ?? (demo ? "Sofía Ramírez" : "")} onSubmit={plan_} />;
  if (stage === "building") return <Building status={status} />;
  return (
    <Dashboard
      profile={profile!}
      plan={plan}
      google={!!session?.connected?.google}
      user={session?.user ?? {}}
      onReset={() => {
        save(null);
        setStage("onboard");
      }}
    />
  );
}

// Re-emits recorded NDJSON lines with realistic delays so the board animates.
function paced(text: string) {
  const enc = new TextEncoder();
  const lines = text.split("\n").filter(Boolean);
  let i = 0;
  return {
    async read(): Promise<{ done: boolean; value?: Uint8Array }> {
      if (i >= lines.length) return { done: true };
      const line = lines[i++];
      await new Promise((r) => setTimeout(r, line.includes("agent_done") ? 900 + Math.random() * 1200 : 120));
      return { done: false, value: enc.encode(line + "\n") };
    },
  };
}
