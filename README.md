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

## Agent chat + connectors

The floating **"Ask your SF local"** button opens a tool-using agent (`src/lib/chat-agent.ts`):

| Tool | What it does |
|---|---|
| `search_playbook` | Searches our insider playbook |
| `web_search` | Live web search (this week's Luma/Partiful events, prices, hours) |
| `suggest_linkedin_search` | Card with a LinkedIn people search + a ready DM (you send it) |
| `draft_x_post` | Card that opens X's composer with the draft (you post it) |
| `propose_calendar_event` | Card → one click adds it to Google Calendar, or download `.ics` |

### Connect Google (Calendar) and LinkedIn

Add to `.env.local` (generate `AUTH_SECRET` with `openssl rand -base64 32`):

```
AUTH_SECRET=
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=
AUTH_LINKEDIN_ID=
AUTH_LINKEDIN_SECRET=
```

- **Google:** Google Cloud Console → APIs & Services → enable *Google Calendar API* → OAuth consent screen (External, add yourself as test user, scope `calendar.events`) → Credentials → OAuth client ID (Web). Redirect URI: `http://localhost:3000/api/auth/callback/google`.
- **LinkedIn:** linkedin.com/developers → Create app → Products: *Sign In with LinkedIn using OpenID Connect* → Auth tab. Redirect URI: `http://localhost:3000/api/auth/callback/linkedin`.

LinkedIn only gives third-party apps your name, photo and email: it does not let apps search people or send messages. That's why the agent drafts the DM and the human sends it.
