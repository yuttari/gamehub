"use client";

import Link from "next/link";
import { useState } from "react";
import { categories } from "@/lib/games";

export default function SiteHeader() {
  const [q, setQ] = useState("");
  const [catOpen, setCatOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-white/80 backdrop-blur-xl">
      <div className="container-page flex h-16 items-center gap-4">
        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-500 text-lg font-black text-white shadow-float">
            G
          </span>
          <span className="hidden text-lg font-extrabold tracking-tight text-ink-900 sm:block">
            GameHub
          </span>
        </Link>

        {/* Category dropdown (desktop) */}
        <div className="relative hidden md:block">
          <button
            onClick={() => setCatOpen((v) => !v)}
            className="btn-ghost"
            aria-expanded={catOpen}
          >
            Categories <span className="text-xs">▾</span>
          </button>
          {catOpen && (
            <div
              className="absolute left-0 top-12 grid w-[420px] grid-cols-2 gap-1 rounded-2xl border border-black/5 bg-white p-2 shadow-float"
              onMouseLeave={() => setCatOpen(false)}
            >
              {categories.map((c) => (
                <Link
                  key={c.slug}
                  href={`/category/${c.slug}`}
                  className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-ink-700 transition-colors hover:bg-surface-muted"
                  onClick={() => setCatOpen(false)}
                >
                  <span className="text-lg">{c.emoji}</span>
                  {c.name}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Search */}
        <form
          className="relative ml-auto flex-1 max-w-md"
          onSubmit={(e) => {
            e.preventDefault();
            if (q.trim()) window.location.href = `/search?q=${encodeURIComponent(q)}`;
          }}
        >
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search games…"
            className="w-full rounded-full border border-black/10 bg-surface-muted py-2.5 pl-10 pr-4 text-sm text-ink-900 outline-none transition focus:border-brand-300 focus:bg-white focus:ring-2 focus:ring-brand-200"
          />
          <svg
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" />
          </svg>
        </form>
      </div>

      {/* Mobile category horizontal scroll */}
      <div className="container-page flex gap-2 overflow-x-auto pb-3 md:hidden">
        {categories.map((c) => (
          <Link
            key={c.slug}
            href={`/category/${c.slug}`}
            className="shrink-0 rounded-full bg-surface-muted px-3 py-1.5 text-xs font-semibold text-ink-700"
          >
            {c.emoji} {c.name}
          </Link>
        ))}
      </div>
    </header>
  );
}
