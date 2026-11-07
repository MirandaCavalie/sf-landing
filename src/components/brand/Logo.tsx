export function LogoMark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <rect width="64" height="64" rx="14" fill="var(--bridge)" />
      <g fill="var(--paper)">
        <rect x="16" y="14" width="6" height="36" />
        <rect x="42" y="14" width="6" height="36" />
        <rect x="4" y="46" width="56" height="4" />
      </g>
      <path d="M0 40 Q19 50 19 16 Q32 52 45 16 Q45 50 64 40" fill="none" stroke="var(--paper)" strokeWidth="2.5" />
    </svg>
  );
}

export function Wordmark() {
  return (
    <span className="flex items-center gap-2">
      <LogoMark />
      <span className="font-display text-2xl uppercase leading-none tracking-wide">
        SF <span className="text-bridge-ink">Landing</span>
      </span>
    </span>
  );
}
