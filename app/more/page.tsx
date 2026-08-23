"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import IconCard from "@/components/IconCard";
import AdSlot from "@/components/AdSlot";
import { getAllGames, categories } from "@/lib/games";

export default function MorePage() {
  const all = getAllGames();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    return all.filter((g) => {
      const matchCat = !cat || g.category === cat || g.tags.includes(cat);
      const matchQ =
        !t ||
        g.title.toLowerCase().includes(t) ||
        g.description.toLowerCase().includes(t) ||
        g.tags.some((tag) => tag.toLowerCase().includes(t));
      return matchCat && matchQ;
    });
  }, [q, cat, all]);

  return (
    <div>
      {/* Top: back + search */}
      <div className="topbar sticky top-0 z-40">
        <Link href="/" className="topbar__logo">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-500 text-sm font-black text-white">
            G
          </span>
          <b>GameHub</b>
        </Link>
        <div className="relative ml-auto w-full max-w-xs">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search games…"
            className="w-full rounded-full border border-black/10 bg-surface-muted py-2 pl-9 pr-3 text-sm text-ink-900 outline-none transition focus:border-brand-300 focus:bg-white focus:ring-2 focus:ring-brand-200"
          />
          <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" />
          </svg>
        </div>
      </div>

      <div className="container-page py-6">
        {/* Category filter */}
        <div className="flex gap-2 overflow-x-auto pb-4">
          <button
            onClick={() => setCat(null)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-bold transition ${
              cat === null ? "bg-brand-500 text-white" : "bg-surface-muted text-ink-700"
            }`}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c.slug}
              onClick={() => setCat(c.slug)}
              className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-bold transition ${
                cat === c.slug ? "bg-brand-500 text-white" : "bg-surface-muted text-ink-700"
              }`}
            >
              {c.emoji} {c.name}
            </button>
          ))}
        </div>

        <p className="mb-4 text-sm text-ink-400">
          {filtered.length} games{ q ? ` · Keyword “${q}”` : "" }{ cat ? " · Filtered by category" : "" }
        </p>

        {/* Grid + interspersed strip ads */}
        <div className="play-grid">
          {filtered.map((g, i) => (
            <div key={g.slug} className="contents">
              <IconCard game={g} />
              {i === 9 && (
                <AdSlot label="Ad · Strip" className="ad-strip col-span-full my-1" height="h-16" />
              )}
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full rounded-3xl bg-white p-12 text-center shadow-card">
              <span className="text-4xl">🔍</span>
              <p className="mt-3 font-bold text-ink-700">No games found</p>
              <button onClick={() => { setQ(""); setCat(null); }} className="btn-primary mt-5">
                Clear Filters
              </button>
            </div>
          )}
        </div>

        <AdSlot label="Ad · Bottom Banner" className="ad-hero mt-8" height="h-28 sm:h-32" />
      </div>
    </div>
  );
}
