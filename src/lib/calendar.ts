// Turns "2026-11-09" + "09:30" into an ISO string with the correct America/Los_Angeles offset (PST/PDT).
export function laIso(date: string, time: string) {
  const probe = new Date(`${date}T12:00:00Z`);
  const tz =
    new Intl.DateTimeFormat("en-US", { timeZone: "America/Los_Angeles", timeZoneName: "shortOffset" })
      .formatToParts(probe)
      .find((p) => p.type === "timeZoneName")?.value ?? "GMT-8";
  const h = Number(tz.replace("GMT", "") || "-8");
  const offset = `${h < 0 ? "-" : "+"}${String(Math.abs(h)).padStart(2, "0")}:00`;
  return `${date}T${time.padStart(5, "0")}:00${offset}`;
}

export function dayLabel(date: string) {
  return new Date(`${date}T12:00:00Z`).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}
