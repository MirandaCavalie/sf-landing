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
];

export const culture: Tip[] = [
  { name: "Coffee chats are the currency", insight: "Asking a stranger for a 30-min coffee is normal here. Offer to pay ('coffee's on me') and be specific about why them." },
  { name: "Show, don't pitch", insight: "People care what you've built. Bring a demo on your phone, not a deck." },
  { name: "Layers", insight: "It's cold and foggy in summer and changes block to block. Always carry a jacket." },
  { name: "Hackathons = networking", insight: "Weekend hackathons are the fastest way to meet builders. Go even if you don't plan to win." },
];

export const playbook = { neighborhoods, housing, transport, workSpots, ecosystem, social, culture };
export type Playbook = typeof playbook;
