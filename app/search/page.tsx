"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import IconCard from "@/components/IconCard";
import AdSlot from "@/components/AdSlot";
import { searchGames } from "@/lib/games";

export default function SearchPage() {
  const [q, setQ] = useState("");

  // Read ?q= from the URL on the client so the page can be statically exported
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      setQ(params.get("q") ?? "");
    }
  }, []);

  const results = useMemo(() => searchGames(q), [q]);

  return (
    <div>
      <div className="topbar sticky top-0 z-40">
        <Link href="/" className="topbar__logo">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-500 text-sm font-black text-white">
            G
          </span>
          <b>GameHub</b>
        </Link>
        <div className="relative ml-auto w-full max-w-xs">
          <input
            autoFocus
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

      <div className="container-page py-8">
        <p className="mb-5 text-sm text-ink-400">
          {q ? (
            <>
              Found <span className="font-bold text-ink-700">{results.length}</span> games for “<span className="font-bold text-ink-700">{q}</span>”
            </>
          ) : (
            "Type a keyword to find games"
          )}
        </p>

        {results.length ? (
          <div className="play-grid">
            {results.map((g, i) => (
              <div key={g.slug} className="contents">
                <IconCard game={g} />
                {i === 9 && (
                  <AdSlot label="Ad · Strip" className="ad-strip col-span-full my-1" height="h-16" />
                )}
              </div>
            ))}
          </div>
        ) : q ? (
          <div className="rounded-3xl bg-white p-12 text-center shadow-card">
            <span className="text-4xl">🔍</span>
            <p className="mt-3 font-bold text-ink-700">No games found</p>
            <Link href="/" className="btn-primary mt-5">
              Back to Home
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );
}
