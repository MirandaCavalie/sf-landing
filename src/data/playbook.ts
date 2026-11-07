// The SF Landing insider playbook.
// This is the moat: things locals know and generic "moving to SF" guides don't say.
// `verify: true` = a price/schedule a human should double-check before the demo.

export type Tip = {
  name: string;
  where?: string;
  cost?: string;
  insight: string;
  tags?: string[];
  verify?: boolean;
  source?: { name: string; url: string };
};

export const neighborhoods: Tip[] = [
  {
    name: "SoMa / South Park",
    insight:
      "Ground zero for startups: EF, YC-adjacent offices, South Park Commons, most Luma events are a walk away. Great for days, quiet and empty at night — pick your blocks carefully.",
    tags: ["founder", "events", "walkable"],
  },
  {
    name: "Mission / Valencia",
    insight:
      "Best cafés, food and energy in the city, sunnier than the west side. A lot of founders and hacker houses live here. 16th & Mission BART area is rough at night; Valencia corridor feels much better.",
    tags: ["social", "latino", "nightlife", "hacker houses"],
  },
  {
    name: "Hayes Valley / Duboce / Lower Haight",
    insight:
      "Central, walkable, very livable. Short ride to SoMa. Popular with early-stage founders who want a 'real neighborhood' feel.",
    tags: ["livable", "central"],
  },
  {
    name: "Nob Hill / Russian Hill / North Beach",
    insight: "Pretty and safe-feeling, but hills are real and you're further from the SoMa event circuit.",
    tags: ["safe", "quiet"],
  },
  {
    name: "Richmond / Sunset",
    insight:
      "Cheaper and calm, but foggy and far — 30–45 min to SoMa events. Fine for a long stay, bad for a 2–4 week 'meet everyone' sprint.",
    tags: ["budget", "far"],
  },
  {
    name: "Tenderloin & Market St (roughly 5th–8th)",
    insight:
      "Be careful here, especially at night. Cheap listings 'near Union Square' are often actually Tenderloin — check the map before booking.",
    tags: ["caution"],
  },
  { name: "Dogpatch / Potrero Hill", insight: "Quiet, sunny pocket with a steady cluster of YC and YC-adjacent founders.", tags: ["founder"], source: { name: "VC Corner — Moving to SF (2026)", url: "https://www.thevccorner.com/p/guide-moving-to-san-francisco-startup-2026" } },
  { name: "Marina / Fort Mason", insight: "Skews toward operators and experienced founders; Founders Inc's campus is at Fort Mason.", tags: ["operators"], source: { name: "VC Corner — Moving to SF (2026)", url: "https://www.thevccorner.com/p/guide-moving-to-san-francisco-startup-2026" } },
];

export const housing: Tip[] = [
  {
    name: "Hacker houses",
    insight:
      "Best ROI for a short stay: you live with builders, and your roommates become your network. Find them via Luma/X posts and founder group chats.",
    tags: ["founder", "short stay"],
  },
  {
    name: "Furnished sublets (1–3 months)",
    insight:
      "Facebook groups, Craigslist sublets and Furnished Finder. Never wire a deposit before seeing the place or video-calling inside it.",
    tags: ["sublet"],
  },
  { name: "Shared room in SoMa", cost: "~$1,500–2,500/mo", insight: "The usual range for shared living near the action; roommates bring it down.", verify: true, source: { name: "VC Corner — Moving to SF (2026)", url: "https://www.thevccorner.com/p/guide-moving-to-san-francisco-startup-2026" } },
  { name: "Rents are negotiable right now", insight: "One-bedroom rents hit multi-year lows, so landlords negotiate and short leases are easier to get.", verify: true, source: { name: "VC Corner — Moving to SF (2026)", url: "https://www.thevccorner.com/p/guide-moving-to-san-francisco-startup-2026" } },
  { name: "Beware shady sublets", insight: "Sublet scams are a known newcomer pain point: verify the person and the lease before paying.", source: { name: "LaunchPad SF (Michelle Fang)", url: "https://technbiz.blogspot.com/2025/06/launchpad-sf.html" } },
];

export const transport: Tip[] = [
  {
    name: "Lime (monthly pass)",
    cost: "~$7/mo pass + ~$3 per ride",
    insight:
      "Best value for a 1-month stay: almost anywhere in the city in ~20 min, no waiting for buses. The real local move for event-hopping.",
    tags: ["best value", "short stay"],
    verify: true,
  },
  {
    name: "Muni bus / metro",
    cost: "~$5 day pass on MuniMobile app",
    insight: "Cheap and fine for daytime. Use the MuniMobile or Clipper in Apple/Google Wallet.",
    tags: ["budget"],
    verify: true,
  },
  {
    name: "BART",
    insight: "For SFO/OAK airports and the East Bay. Not great for moving inside SF.",
    tags: ["airport"],
  },
  {
    name: "Lyft / Uber / Waymo",
    insight:
      "Late nights after events. Waymo is the SF experience everyone should try once — and it feels safer at night.",
    tags: ["night", "safe"],
  },
];

export const workSpots: Tip[] = [
  {
    name: "Salesforce Park",
    where: "Rooftop park over Salesforce Transit Center, SoMa",
    cost: "Free",
    insight: "Free rooftop garden in the middle of SoMa. Laptop-friendly benches, perfect between meetings.",
    tags: ["free", "outdoor"],
  },
  {
    name: "Capital One Café",
    cost: "Free to sit",
    insight:
      "Not just for customers — open seating, solid Wi‑Fi, discounted coffee. Almost nobody from out of town knows about it.",
    tags: ["free", "wifi", "hidden"],
    verify: true,
  },
  {
    name: "Medium Café",
    insight: "Lesser-known café that works for coworking: good internet, good coffee, not packed.",
    tags: ["hidden", "wifi"],
    verify: true,
  },
  {
    name: "Core Café",
    insight: "The well-known option — expect it to be busy. Go early or have a backup.",
    tags: ["popular"],
    verify: true,
  },
  {
    name: "IKEA (Market St)",
    where: "945 Market St",
    insight: "Surprisingly good place to sit and work for hours with cheap food. Locals know.",
    tags: ["budget", "hidden"],
    verify: true,
  },
  {
    name: "Day-pass coworkings (~$10/day)",
    cost: "~$10/day if you're on a budget",
    insight: "There are coworkings that sell cheap day passes — way better than paying for a full month on a short trip.",
    tags: ["budget"],
    verify: true,
  },
  {
    name: "Tandem & monthly coworkings",
    insight: "If you're staying a month+, a monthly desk gives you a base, meeting rooms, and a community to plug into.",
    tags: ["monthly"],
    verify: true,
  },
  { name: "AngelList Founders Café", where: "90 Gold St, Financial District", cost: "Free · apply for access", insight: "Invite-only founder café: fast Wi‑Fi, outlets, free coffee, open late, plus cofounder-matching mixers.", tags: ["free", "founders"], verify: true, source: { name: "AngelList Founders Café", url: "https://ns.com/dashboard/founders-cafe" } },
  { name: "Sightglass", insight: "Top café by founder spending in Mercury's data; deals really do get closed over coffee here.", tags: ["coffee chats"], source: { name: "Mercury data via Fast Company", url: "https://briefly-prod.herokuapp.com/anchor/SOMA_SF/story/inside-san-franciscos-coffeehouse-fueled-ai-scene-where-million-dollar-deals-happen-over-cortados" } },
  { name: "Saint Frank, Equator, Ritual, CoffeeShop", insight: "The rest of Mercury's top-5 founder cafés: good default spots to suggest for a coffee chat.", tags: ["coffee chats"], source: { name: "Mercury data via Fast Company", url: "https://briefly-prod.herokuapp.com/anchor/SOMA_SF/story/inside-san-franciscos-coffeehouse-fueled-ai-scene-where-million-dollar-deals-happen-over-cortados" } },
];

export const ecosystem: Tip[] = [
  {
    name: "Entrepreneurs First (EF)",
    where: "501 Folsom St",
    insight: "Hosts a huge share of SF hackathons and founder events. If you're new, start here.",
    tags: ["hackathons", "founders"],
  },
  { name: "First Round Capital", insight: "Regular founder events and talks in SF.", tags: ["vc", "events"] },
  { name: "Founders Inc", where: "Fort Mason", insight: "Builder-heavy events and demo nights.", tags: ["builders"] },
  {
    name: "South Park Commons",
    insight: "Community for people in the 'figuring out what to build' stage. Events are high-signal.",
    tags: ["community", "pre-idea"],
  },
  {
    name: "Y Combinator",
    insight: "Everyone knows YC — but it's not the only door. The rooms above are often easier to get into and just as useful.",
    tags: ["vc"],
  },
  { name: "Latitud", insight: "LatAm-focused founder program and community; the obvious door for Latin American founders.", tags: ["latino"], source: { name: "LaunchPad SF (Michelle Fang)", url: "https://technbiz.blogspot.com/2025/06/launchpad-sf.html" } },
  { name: "Unshackled Ventures", insight: "Pre-seed fund for immigrant founders that also helps with visa pathways.", tags: ["immigrant", "visa"], source: { name: "VC Corner — Moving to SF (2026)", url: "https://www.thevccorner.com/p/guide-moving-to-san-francisco-startup-2026" } },
  { name: "Pre-seed funds to know", insight: "Precursor, Hustle Fund and 2048 write early checks; target a specific partner, not the firm.", tags: ["raise"], source: { name: "VC Corner — Moving to SF (2026)", url: "https://www.thevccorner.com/p/guide-moving-to-san-francisco-startup-2026" } },
  { name: "Visas: O-1 and IEP", insight: "O-1 (extraordinary ability) takes a few months if well prepared; Entrepreneur Parole needs funding traction.", tags: ["visa"], verify: true, source: { name: "VC Corner — Moving to SF (2026)", url: "https://www.thevccorner.com/p/guide-moving-to-san-francisco-startup-2026" } },
];

export const social: Tip[] = [
  {
    name: "Luma (luma.com)",
    insight: "Where ~90% of SF tech events live. Follow calendars, not just events, and apply early — good ones fill up.",
    tags: ["events"],
  },
  { name: "Partiful", insight: "Where the parties and more casual hangouts live.", tags: ["parties"] },
  {
    name: "El Gato Volador",
    insight: "Latino party in SF, posted on Luma. Great way to meet the Latino tech community.",
    tags: ["latino", "parties"],
    verify: true,
  },
  {
    name: "X / Twitter",
    insight:
      "Most SF tech plans get announced on X. Post 'landing in SF on X dates, building Y, coffee's on me' — people actually reply.",
    tags: ["outreach"],
  },
  { name: "Cerebral Valley", insight: "The AI builder community in SF; their events and hackathons are where AI founders meet.", tags: ["ai"], source: { name: "Michelle Fang — Starter Guide to SF", url: "https://www.producthunt.com/products/starter-guide-to-sf-for-founders" } },
  { name: "AI Tinkerers", insight: "Small, technical AI meetups with demos instead of pitches.", tags: ["ai"], source: { name: "VC Corner — Moving to SF (2026)", url: "https://www.thevccorner.com/p/guide-moving-to-san-francisco-startup-2026" } },
  { name: "SF IRL & Startup Digest", insight: "Michelle Fang's curated SF event lists; subscribe so the right events come to you.", tags: ["events"], source: { name: "Michelle Fang — Starter Guide to SF", url: "https://www.producthunt.com/products/starter-guide-to-sf-for-founders" } },
  { name: "Founders Running Club", insight: "Weekly runs that double as low-pressure founder networking.", tags: ["outdoors"], source: { name: "Michelle Fang — Starter Guide to SF", url: "https://www.producthunt.com/products/starter-guide-to-sf-for-founders" } },
];

export const culture: Tip[] = [
  { name: "Coffee chats are the currency", insight: "Asking a stranger for a 30-min coffee is normal here. Offer to pay ('coffee's on me') and be specific about why them." },
  { name: "Show, don't pitch", insight: "People care what you've built. Bring a demo on your phone, not a deck." },
  { name: "Layers", insight: "It's cold and foggy in summer and changes block to block. Always carry a jacket." },
  { name: "Hackathons = networking", insight: "Weekend hackathons are the fastest way to meet builders. Go even if you don't plan to win." },
  { name: "Small rooms beat big mixers", insight: "20–50 person dinners and meetups are where real relationships start.", source: { name: "VC Corner — Moving to SF (2026)", url: "https://www.thevccorner.com/p/guide-moving-to-san-francisco-startup-2026" } },
  { name: "Listen first", insight: "In your first weeks, ask more than you pitch; people remember who was curious.", source: { name: "VC Corner — Moving to SF (2026)", url: "https://www.thevccorner.com/p/guide-moving-to-san-francisco-startup-2026" } },
  { name: "Ship something by week 3", insight: "Don't stay in stealth: share a landing page or demo by your third week.", source: { name: "VC Corner — Moving to SF (2026)", url: "https://www.thevccorner.com/p/guide-moving-to-san-francisco-startup-2026" } },
  { name: "Your first month", insight: "Week 1: housing + a regular workspace. Week 2: small events and coffees. Week 3: share something. Week 4: find your core five.", source: { name: "VC Corner — Moving to SF (2026)", url: "https://www.thevccorner.com/p/guide-moving-to-san-francisco-startup-2026" } },
];

export const budget: Tip[] = [
  { name: "Startup credits", insight: "Claim AWS, Google Cloud and OpenAI startup credits before you spend a dollar on infra.", source: { name: "VC Corner — Moving to SF (2026)", url: "https://www.thevccorner.com/p/guide-moving-to-san-francisco-startup-2026" } },
  { name: "Incorporation", insight: "Stripe Atlas or Clerky for a Delaware C-corp; YC SAFE is the default for early rounds.", source: { name: "VC Corner — Moving to SF (2026)", url: "https://www.thevccorner.com/p/guide-moving-to-san-francisco-startup-2026" } },
  { name: "City fee waiver", insight: "San Francisco waives the first-year business registration fee for new businesses.", verify: true, source: { name: "VC Corner — Moving to SF (2026)", url: "https://www.thevccorner.com/p/guide-moving-to-san-francisco-startup-2026" } },
];

export const playbook = { neighborhoods, housing, budget, transport, workSpots, ecosystem, social, culture };
export type Playbook = typeof playbook;
