// Decorative Golden Gate silhouette over international-orange fog.
export function BridgeHero() {
  const susp = Array.from({ length: 21 }, (_, i) => 40 + i * 36);
  return (
    <svg viewBox="0 0 800 300" className="h-full w-full" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f6704a" />
          <stop offset="1" stopColor="#f04a23" />
        </linearGradient>
        <linearGradient id="fog" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fbfaf7" stopOpacity="0" />
          <stop offset="1" stopColor="#fbfaf7" stopOpacity=".85" />
        </linearGradient>
      </defs>
      <rect width="800" height="300" fill="url(#sky)" />
      <circle cx="650" cy="70" r="38" fill="#fbfaf7" opacity=".35" />
      <g fill="#8f2310">
        {[220, 580].map((x) => (
          <g key={x}>
            <rect x={x - 11} y="85" width="7" height="190" />
            <rect x={x + 4} y="85" width="7" height="190" />
            {[110, 150, 190].map((y) => (
              <rect key={y} x={x - 11} y={y} width="22" height="5" />
            ))}
            <rect x={x - 13} y="78" width="26" height="8" />
          </g>
        ))}
        <rect x="0" y="212" width="800" height="7" />
      </g>
      <g stroke="#8f2310" strokeWidth="1.5" fill="none">
        <path d={`M0 190 Q110 175 220 85`} />
        <path d={`M220 85 Q400 245 580 85`} />
        <path d={`M580 85 Q690 175 800 190`} />
        {susp.map((x) => {
          if (x > 220 && x < 580) {
            const t = (x - 220) / 360;
            const y = 85 + 320 * t * (1 - t);
            return <line key={x} x1={x} y1={y} x2={x} y2="212" />;
          }
          return null;
        })}
      </g>
      <rect y="150" width="800" height="150" fill="url(#fog)" />
      <rect y="250" width="800" height="50" fill="#fbfaf7" opacity=".9" />
    </svg>
  );
}
