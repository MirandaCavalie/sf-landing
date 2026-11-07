"use client";

import { signIn } from "next-auth/react";
import { BridgeHero } from "@/components/brand/BridgeHero";
import { Wordmark } from "@/components/brand/Logo";

export default function AuthGate() {
  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 sm:px-8">
      <header className="py-6">
        <Wordmark />
      </header>
      <section className="grid flex-1 items-center gap-10 pb-16 md:grid-cols-[1.1fr_1fr]">
        <div>
          <h1 className="font-display text-6xl uppercase leading-[0.9] sm:text-8xl">
            Land like
            <br />
            <span className="mt-2 inline-block bg-bridge px-2 pt-1 text-paper">a local.</span>
          </h1>
          <p className="mt-6 max-w-md text-lg">
            Tell us when you land. A crew of AI agents plans your first week in SF: where to stay, where to work, who to
            meet, which events matter. Then puts it on your calendar.
          </p>
          <button
            onClick={() => signIn("google")}
            className="mt-8 flex items-center gap-3 border-2 border-ink bg-paper px-6 py-4 text-lg font-semibold shadow-[6px_6px_0_var(--bridge)] transition hover:-translate-x-0.5 hover:-translate-y-0.5"
          >
            <GoogleG /> Continue with Google
          </button>
          <p className="mt-4 max-w-sm font-mono text-[11px] uppercase leading-relaxed tracking-wider text-bay">
            We only add events you approve. Nothing is posted or sent without your click.
          </p>
        </div>
        <div className="hidden md:block">
          <BridgeHero />
        </div>
      </section>
    </main>
  );
}

function GoogleG() {
  return (
    <svg viewBox="0 0 48 48" className="h-6 w-6" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.3-.4-3.5z" />
    </svg>
  );
}
