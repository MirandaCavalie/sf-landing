# SF Landing — land like a local

A crew of AI agents that lands founders and builders in San Francisco with the insights nobody tells you: the $10 coworkings, the cafés with real Wi‑Fi, which blocks to skip at night, the Luma calendars that matter — and drafts your first coffee chats.

Built at the Anything Applied Agentic Hackathon (EF, 501 Folsom, Nov 7 2026).

## How it works

```
Boarding pass (profile)
        │
        ▼
 /api/plan  ── runs in parallel ──►  🏠 Base Camp     (neighborhoods, housing, where NOT to stay)
                                     🛴 Getting Around (Lime pass vs Muni vs Waymo, real costs)
                                     ☕ Where to Work  (hidden cafés, free spots, day passes)
                                     🎟️ The Scene      (EF, SPC, Founders Inc, Luma, Partiful, parties)
                                     🤝 Coffee Agent   (who to meet + LinkedIn DMs + X post)
        │
        ▼
 🗓️ Coordinator → your first 7 days + top 3 secrets
```

- Every agent is grounded in `src/data/playbook.ts`, our curated insider knowledge base. Items marked `verify` need a human to double-check the price or schedule.
- Agents use Claude (`claude-opus-5-5`) with structured outputs and stream their status to an airport-style arrivals board.
- **The human sends every message.** The Coffee Agent only drafts DMs and opens LinkedIn search or the X composer. LinkedIn forbids automated messaging, and sending them yourself keeps your account safe.

## Run it

```bash
cp .env.example .env.local   # add your ANTHROPIC_API_KEY
npm install
npm run dev                  # http://localhost:3000
```

## Grow the playbook

Add tips to `src/data/playbook.ts`. That file is the product: the more local, specific and honest it is, the better every agent gets.
