# SF Landing

**Live:** [sflanding.com](https://sflanding.com) · sample plan without signing in: [sflanding.com/?demo](https://sflanding.com/?demo)

Land in San Francisco like a local. Tell it when you land and a crew of AI agents plans your first week: where to sleep, where to work, how to get around, which events matter and who to meet for coffee. Then it puts the week on your Google Calendar.

Built at the Anything Applied Agentic Hackathon (Entrepreneurs First, SF, Nov 7 2026).

## The flow

1. **Intro**: an electric car lands on the Golden Gate, and the landing page continues on the same scene with real numbers (events this week, cheapest hostel, cheapest day pass) and a ticker of real events.
2. **Sign in with Google**, required. It also grants `calendar.events`, so the plan can be added to your calendar.
3. **30-second form**: arrival date, length of stay, budget, goals and vibe.
4. **Planning**: six agents work in parallel on an airport-style arrivals board.
5. **Dashboard**:

| Tab | What you get |
|---|---|
| Plan | Countdown, week in numbers, *Next up* with directions, a *Before you land* checklist, and a day-by-day timeline. One click adds all of it to Google Calendar |
| Map | Your plan stops plus that week's Luma and Partiful events (bubble size = attendance) |
| Stay | 3 picks + 42 real hostels and budget hotels from Booking.com (photo, price per night, rating), filters including Nob Hill, Tenderloin-edge warnings |
| Getting around | Google Maps first, then Lime, Muni, BART, Waymo and Uber/Lyft with costs |
| Work | 3 picks + coworking day passes from LANS (photo, price, booking link) and free spots |
| Scene | Communities, venues and calendars from the playbook |
| People | Your SF contacts from your Notion CRM (owner only), suggested people to meet, drafted DMs and an X post |

6. **The agent** (right panel) is proactive. When the plan opens, it shows **Noticed for you**: 3–4 instincts built from real signals (weather forecast, events that fit a free window, contacts in SF you haven't seen, gaps in the plan), each with a one-tap action.

**Nothing is sent for you.** LinkedIn doesn't let apps read connections or send messages, so the agent drafts and you send: copy the message, open the profile, add the coffee to your calendar.

## How it works

```
Form ─► /api/plan ─┬─ Where to stay   ─┐
                   ├─ Getting around   │  Claude (claude-opus-5-5), structured outputs,
                   ├─ Where to work    ├─ grounded in src/data/playbook.ts
                   ├─ The scene        │
                   └─ Who to meet     ─┘
                             │
                             ▼
                   Coordinator ─► 7 scheduled days (times, places, coordinates) + 3 pre-landing to-dos
```

| Piece | Where |
|---|---|
| Planning agents + coordinator | `src/lib/agents.ts`, `src/app/api/plan` (streams NDJSON to the board) |
| Chat agent (Claude tool runner) | `src/lib/chat-agent.ts`, `src/app/api/chat` |
| Instincts (proactive nudges) | `src/lib/instincts.ts`, `src/app/api/instincts` (weather via Open-Meteo) |
| Events (Luma + Partiful via Apify) | `src/lib/events.ts`, `src/app/api/events` (snapshot by default, `?live=1` scrapes) |
| Notion CRM (read-only, owner only) | `src/lib/crm.ts`, `src/app/api/crm` |
| Google Calendar | `src/app/api/calendar` |
| Auth (Google + LinkedIn) | `src/auth.ts` (Auth.js; both connections are kept on one session) |
| Map | `src/components/PlanMap.tsx` (MapLibre + OpenFreeMap, no API key) |

### Chat agent tools

| Tool | What it does |
|---|---|
| `search_playbook` | Searches the insider playbook |
| `web_search` | Live web search for anything time-sensitive |
| `search_my_network` | Searches the owner's Notion CRM (role, location, relationship, next step, LinkedIn) |
| `draft_coffee_invite` | Card for one person: message, café, time slot → Copy · Open LinkedIn · Add to calendar |
| `suggest_linkedin_search` | LinkedIn people search + a ready DM, for people you don't know yet |
| `draft_x_post` | Opens X's composer with a draft |
| `propose_calendar_event` | One click to Google Calendar, or a `.ics` download |

## Data

| File | Source | Refresh |
|---|---|---|
| `src/data/playbook.ts` | Curated local knowledge, each tip with a source link where it has one; `verify: true` = double-check | Edit by hand |
| `src/data/events-snapshot.json` | Luma (`solidcode/luma-scraper`) + Partiful (`heliostech/partiful-event-scraper`) via Apify, Partiful addresses geocoded with Nominatim | *Refresh events* on the Map tab, or `GET /api/events?from=…&to=…&live=1` |
| `src/data/stays.json` | Booking.com via Apify (`voyager/booking-scraper`), Nov 9–16, 1 guest | Re-run the scraper |
| `src/data/lans-spaces.json` | LANS SF directory (name, price, address, photo) | Re-scrape the directory |

Prices are snapshots for the dates above.

## Run it locally

```bash
cp .env.example .env.local
npm install
npm run dev        # http://localhost:3000
```

| Variable | For |
|---|---|
| `ANTHROPIC_API_KEY` | All agents |
| `AUTH_SECRET` | Auth.js (`openssl rand -base64 32`) |
| `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` | Google sign-in + Calendar |
| `AUTH_LINKEDIN_ID`, `AUTH_LINKEDIN_SECRET` | LinkedIn sign-in |
| `APIFY_TOKEN` | Live event scraping |
| `NOTION_TOKEN`, `NOTION_CRM_DB` | Notion CRM (read-only integration shared with the database) |
| `CRM_OWNER_EMAIL` | The only account that can see the CRM |

`/?demo` replays a recorded plan (`public/demo-run.ndjson`) without sign-in and without calling the planning agents.

### OAuth setup

- **Google**: Google Cloud Console → enable *Google Calendar API* → Google Auth Platform (External, testing; add test users) → Web client. Redirect URI: `<origin>/api/auth/callback/google`.
- **LinkedIn**: linkedin.com/developers → create an app tied to a company page → Products: *Sign In with LinkedIn using OpenID Connect*. Redirect URI: `<origin>/api/auth/callback/linkedin`.

Registered origins: `http://localhost:3000`, `https://sf-landing-seven.vercel.app`, `https://www.sflanding.com` (`sflanding.com` redirects to `www`).

## Deploy

Vercel project `sf-landing`, connected to this repo: every merge to `main` deploys to production. Environment variables live in Vercel (plus `AUTH_TRUST_HOST=true`). Manual deploy:

```bash
npx vercel deploy --prod --scope mirandas-projects-c0316355
```
