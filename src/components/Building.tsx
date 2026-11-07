"use client";

import { useEffect, useState } from "react";
import { Wordmark } from "@/components/brand/Logo";

export type Status = "boarding" | "landed" | "delayed";

export const CREW = [
  { id: "basecamp", label: "Where to stay", emoji: "🏠", gate: "A1" },
  { id: "moving", label: "Getting around", emoji: "🛴", gate: "A2" },
  { id: "work", label: "Where to work", emoji: "☕", gate: "B1" },
  { id: "scene", label: "The scene", emoji: "🎟️", gate: "B2" },
  { id: "people", label: "Who to meet", emoji: "🤝", gate: "C1" },
  { id: "coordinator", label: "Your first week", emoji: "🗓️", gate: "C2" },
];

const TIPS = [
  "Most SF tech events live on Luma. Follow calendars, not just events.",
  "Coffee chats are the currency here. Offer to pay and say why them.",
  "Bring a jacket. Always. Karl the Fog doesn't care that it's summer.",
  "Capital One Café lets anyone sit and work. Almost nobody knows.",
  "Cheap 'near Union Square' listings are often in the Tenderloin. Check the map.",
];

export default function Building({ status }: { status: Record<string, Status> }) {
  const [tip, setTip] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTip((i) => (i + 1) % TIPS.length), 3500);
    return () => clearInterval(t);
  }, []);

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-8">
      <Wordmark />
      <h1 className="mt-10 text-4xl font-semibold tracking-tight sm:text-5xl">
        Your crew is <span className="text-bridge-ink">planning your landing</span>
      </h1>
      <section className="mt-8 overflow-hidden rounded-2xl bg-ink font-mono text-paper shadow-xl">
        {CREW.map((b) => {
          const s = status[b.id];
          return (
            <div key={b.id} className="flex items-center gap-4 border-b border-paper/10 px-5 py-3">
              <span className="w-8 text-mist">{b.gate}</span>
              <span className="flex-1 truncate">
                {b.emoji} {b.label}
              </span>
              <span
                className={`text-sm uppercase ${
                  s === "landed" ? "text-green-400" : s === "delayed" ? "text-[#ff7a57]" : s === "boarding" ? "blink text-yellow-300" : "text-mist"
                }`}
              >
                {s ?? "scheduled"}
              </span>
            </div>
          );
        })}
      </section>
      <p key={tip} className="mt-8 text-lg">
        🔑 {TIPS[tip]}
      </p>
    </main>
  );
}
