"use client";

import { signIn, signOut } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import type { Action, ChatEvent } from "@/lib/chat-agent";

type Turn =
  | { role: "user"; text: string }
  | { role: "assistant"; text: string }
  | { role: "tool"; label: string }
  | { role: "action"; action: Action }
  | { role: "error"; text: string };

type Connected = { google: boolean; linkedin: boolean; name?: string; image?: string };

const STARTERS = [
  "What tech events in SF should I go to the week I land?",
  "Find me someone to grab coffee with on Day 2",
  "Is my neighborhood safe at night? Where should I avoid?",
  "Write my X post announcing I'm landing",
];

export default function Chat({ context, variant = "floating" }: { context: string; variant?: "floating" | "docked" }) {
  const docked = variant === "docked";
  const [open, setOpen] = useState(false);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [conn, setConn] = useState<Connected>({ google: false, linkedin: false });
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((s) => {
        if (s?.connected) setConn({ ...s.connected, name: s.user?.name, image: s.user?.image });
      })
      .catch(() => {});
  }, []);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [turns]);

  async function send(text: string) {
    if (!text.trim() || busy) return;
    const next: Turn[] = [...turns, { role: "user", text }];
    setTurns(next);
    setInput("");
    setBusy(true);
    const history = next
      .filter((t): t is Extract<Turn, { role: "user" | "assistant" }> => t.role === "user" || t.role === "assistant")
      .map((t) => ({ role: t.role, content: t.text }));
    try {
      const res = await fetch("/api/chat", { method: "POST", body: JSON.stringify({ messages: history, context }) });
      const reader = res.body!.getReader();
      const dec = new TextDecoder();
      let buf = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop()!;
        for (const l of lines) {
          if (!l.trim()) continue;
          const e = JSON.parse(l) as ChatEvent;
          if (e.type === "text") setTurns((t) => [...t, { role: "assistant", text: e.text }]);
          if (e.type === "tool") setTurns((t) => [...t, { role: "tool", label: e.label }]);
          if (e.type === "action") setTurns((t) => [...t, { role: "action", action: e.action }]);
          if (e.type === "error") setTurns((t) => [...t, { role: "error", text: e.error }]);
        }
      }
    } catch (err) {
      setTurns((t) => [...t, { role: "error", text: (err as Error).message }]);
    }
    setBusy(false);
  }

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        className={`${docked ? "lg:hidden " : ""}fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full bg-bridge px-5 py-3 text-sm font-medium text-white shadow-lg transition hover:-translate-y-0.5`}
      >
        {open ? "✕ Close" : "✦ Ask your SF local"}
      </button>

      {(open || docked) && (
        <div
          className={`${
            open
              ? "fixed inset-x-3 bottom-20 top-3 z-50 flex rounded-2xl shadow-2xl sm:inset-x-auto sm:right-5 sm:top-auto sm:h-[640px] sm:w-[420px]"
              : "hidden"
          } flex-col overflow-hidden border border-black/10 bg-white ${
            docked ? "lg:sticky lg:inset-auto lg:top-0 lg:z-auto lg:flex lg:h-screen lg:w-full lg:rounded-none lg:border-y-0 lg:border-r-0 lg:shadow-none" : ""
          }`}
        >
          {/* Header + connectors */}
          <div className="border-b border-black/5 px-5 py-4">
            <div className="flex items-center justify-between">
              <p className="font-semibold tracking-tight">
                Your SF local <span className="text-bridge">●</span>
              </p>
              <span className="text-xs text-ink/50">Knows your plan</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <Connector label="Google Calendar" on={conn.google} onClick={() => signIn("google")} />
              <Connector label="LinkedIn" on={conn.linkedin} onClick={() => signIn("linkedin")} />
              {(conn.google || conn.linkedin) && (
                <button onClick={() => signOut()} className="px-2 py-1 text-ink/50 hover:text-ink">
                  Sign out
                </button>
              )}
            </div>
          </div>

          {/* Transcript */}
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {turns.length === 0 && (
              <div>
                <p className="text-sm text-ink/70">
                  {conn.name ? `Hey ${conn.name.split(" ")[0]}! ` : ""}I know your plan. I search our insider playbook and the live web, find people to
                  meet, draft your messages and put things on your calendar. Try:
                </p>
                <div className="mt-3 flex flex-col gap-2">
                  {STARTERS.map((s) => (
                    <button key={s} onClick={() => send(s)} className="rounded-xl border border-black/10 px-3 py-2.5 text-left text-sm transition hover:border-bridge/40 hover:bg-[#fff4ef]">
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {turns.map((t, i) => (
              <TurnView key={i} t={t} google={conn.google} />
            ))}
            {busy && <p className="blink text-xs text-bridge">Thinking…</p>}
            <div ref={endRef} />
          </div>

          {/* Composer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="m-3 flex rounded-full border border-black/10 bg-[#f6f4f0] p-1"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about landing in SF…"
              className="flex-1 bg-transparent px-3 py-2 text-sm outline-none"
            />
            <button disabled={busy} className="rounded-full bg-ink px-4 text-sm font-medium text-white disabled:opacity-50">
              Send
            </button>
          </form>
        </div>
      )}
    </>
  );
}

function Connector({ label, on, onClick }: { label: string; on: boolean; onClick: () => void }) {
  return on ? (
    <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-700">● {label}</span>
  ) : (
    <button onClick={onClick} className="rounded-full border border-black/10 px-2.5 py-1 hover:bg-black/5">
      + Connect {label}
    </button>
  );
}

function TurnView({ t, google }: { t: Turn; google: boolean }) {
  if (t.role === "user")
    return <p className="ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-ink px-3.5 py-2 text-sm text-white">{t.text}</p>;
  if (t.role === "assistant") return <p className="max-w-[95%] whitespace-pre-wrap text-sm leading-relaxed">{t.text}</p>;
  if (t.role === "tool") return <p className="text-xs text-ink/45">↳ {t.label}</p>;
  if (t.role === "error") return <p className="text-xs text-bridge-ink">⚠ {t.text}</p>;
  return <ActionCard a={t.action} google={google} />;
}

function ActionCard({ a, google }: { a: Action; google: boolean }) {
  const [state, setState] = useState<string | null>(null);
  const base = "rounded-2xl border border-black/5 bg-[#f6f4f0] p-3.5 text-sm";
  const btn = "mt-2 inline-block rounded-full bg-ink px-3 py-1.5 text-xs font-medium text-white";

  if (a.kind === "linkedin_search")
    return (
      <div className={base}>
        <p className="text-xs font-medium text-ink/50">LinkedIn · you send it</p>
        <p className="mt-1 font-semibold">{a.keywords}</p>
        <p className="text-ink/60">{a.why}</p>
        <p className="mt-2 whitespace-pre-wrap rounded-lg bg-white p-2 text-xs">{a.dm}</p>
        <div className="flex gap-2">
          <button className={btn} onClick={() => (navigator.clipboard.writeText(a.dm), setState("copied"))}>
            {state === "copied" ? "Copied ✓" : "Copy DM"}
          </button>
          <a
            className={btn}
            target="_blank"
            rel="noreferrer"
            href={`https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(a.keywords)}`}
          >
            Open search ↗
          </a>
        </div>
      </div>
    );

  if (a.kind === "x_post")
    return (
      <div className={base}>
        <p className="text-xs font-medium text-ink/50">X post · you post it</p>
        <p className="mt-1 whitespace-pre-wrap">{a.text}</p>
        <a className={btn} target="_blank" rel="noreferrer" href={`https://x.com/intent/post?text=${encodeURIComponent(a.text)}`}>
          Open in X ↗
        </a>
      </div>
    );

  const when = new Date(a.start).toLocaleString("en-US", {
    weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: "America/Los_Angeles",
  });
  async function addGoogle() {
    setState("adding");
    const r = await fetch("/api/calendar", { method: "POST", body: JSON.stringify(a) });
    const j = await r.json();
    setState(r.ok ? `added:${j.link}` : `error:${j.error}`);
  }
  return (
    <div className={base}>
      <p className="text-xs font-medium text-ink/50">Calendar · you confirm</p>
      <p className="mt-1 font-semibold">{a.title}</p>
      <p className="text-ink/60">
        {when}
        {a.location ? ` · ${a.location}` : ""}
      </p>
      {state?.startsWith("added:") ? (
        <a className={btn} target="_blank" rel="noreferrer" href={state.slice(6)}>
          Added ✓ open ↗
        </a>
      ) : (
        <div className="flex gap-2">
          {google && (
            <button className={btn} onClick={addGoogle} disabled={state === "adding"}>
              {state === "adding" ? "Adding…" : "Add to Google Calendar"}
            </button>
          )}
          <button className={btn} onClick={() => downloadIcs(a)}>
            Download .ics
          </button>
        </div>
      )}
      {state?.startsWith("error:") && <p className="mt-1 text-xs text-bridge">{state.slice(6)}</p>}
    </div>
  );
}

function downloadIcs(a: Extract<Action, { kind: "calendar" }>) {
  const fmt = (s: string) => new Date(s).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const esc = (s = "") => s.replace(/([,;\\])/g, "\\$1").replace(/\n/g, "\\n");
  const ics = [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//SF Landing//EN", "BEGIN:VEVENT",
    `UID:${Date.now()}@sflanding`, `DTSTAMP:${fmt(new Date().toISOString())}`,
    `DTSTART:${fmt(a.start)}`, `DTEND:${fmt(a.end)}`,
    `SUMMARY:${esc(a.title)}`, `LOCATION:${esc(a.location)}`, `DESCRIPTION:${esc(a.description)}`,
    "END:VEVENT", "END:VCALENDAR",
  ].join("\r\n");
  const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `${a.title.replace(/\W+/g, "-")}.ics`;
  link.click();
  URL.revokeObjectURL(url);
}
