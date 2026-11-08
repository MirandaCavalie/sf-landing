"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

export const PAGE_SIZE = 6; // two rows on desktop (3 columns)

export default function Pager({ page, total, onChange }: { page: number; total: number; onChange: (p: number) => void }) {
  const pages = Math.ceil(total / PAGE_SIZE);
  if (pages <= 1) return null;
  const go = (p: number) => onChange(Math.min(pages - 1, Math.max(0, p)));
  const btn = "flex h-9 min-w-9 items-center justify-center rounded-full px-3 text-sm font-medium transition";
  return (
    <nav className="mt-5 flex items-center justify-center gap-1.5" aria-label="Pages">
      <button onClick={() => go(page - 1)} disabled={page === 0} aria-label="Previous page" className={`${btn} bg-black/5 disabled:opacity-30`}>
        <ChevronLeft className="h-4 w-4" />
      </button>
      {Array.from({ length: pages }, (_, i) => (
        <button
          key={i}
          onClick={() => go(i)}
          aria-current={i === page ? "page" : undefined}
          className={`${btn} ${i === page ? "bg-ink text-white" : "text-ink/60 hover:bg-black/5"}`}
        >
          {i + 1}
        </button>
      ))}
      <button onClick={() => go(page + 1)} disabled={page === pages - 1} aria-label="Next page" className={`${btn} bg-black/5 disabled:opacity-30`}>
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
}
