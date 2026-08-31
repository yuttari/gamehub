import { notFound } from "next/navigation";
import Link from "next/link";
import GameFrame from "@/components/GameFrame";
import IconCard from "@/components/IconCard";
import AdSlot from "@/components/AdSlot";
import SidebarIconList from "@/components/SidebarIconList";
import { getGameBySlug, getAllGames, getGamesByCategory, categories } from "@/lib/games";

export function generateStaticParams() {
  return getAllGames().map((g) => ({ slug: g.slug }));
}

export default function GamePage({ params }: { params: { slug: string } }) {
  const game = getGameBySlug(params.slug);
  if (!game) notFound();

  const others = getAllGames().filter((g) => g.slug !== game.slug);
  const related = getGamesByCategory(game.category)
    .filter((g) => g.slug !== game.slug)
    .slice(0, 6);

  // Left: related-category games; Right: popular games + ads
  const leftGames = related.length >= 4 ? related : others.slice(0, 6);
  const rightGames = others
    .filter((g) => !leftGames.find((l) => l.slug === g.slug))
    .slice(0, 5);

  return (
    <div>
      {/* Top bar: back to home + search */}
      <div className="topbar sticky top-0 z-40">
        <Link href="/" className="topbar__logo">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-500 text-sm font-black text-white">
            H
          </span>
          <b>Have Fun</b>
        </Link>
        <Link href="/more" className="topbar__search">
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          Search / More
        </Link>
      </div>

      {/* Poki-style three-column layout: icons | game+info | icons+ads */}
      <div className="game-stage">
        {/* Left sidebar: related games */}
        <aside className="game-stage__side">
          <AdSlot label="Ad" className="ad-sky h-40 shrink-0" />
          <SidebarIconList title="Similar" games={leftGames} />
          <AdSlot label="Ad" className="ad-sky h-56 shrink-0" />
        </aside>

        {/* Center main area: game + similar + categories + details */}
        <main className="game-stage__main">
          {/* Game canvas */}
          <GameFrame src={game.path} title={game.title} />

          {/* Two rows of similar games */}
          <section>
            <div className="section-title">
              <h2 className="section-title__h">🔥 Similar Games</h2>
              <Link href="/more" className="section-title__link">
                All Games →
              </Link>
            </div>
            <div className="rec-grid mt-5">
              {others.slice(0, 12).map((g) => (
                <IconCard key={g.slug} game={g} />
              ))}
            </div>
          </section>

          {/* Category browse icons */}
          <section>
            <div className="section-title">
              <h2 className="section-title__h">🗂️ Categories</h2>
              <Link href="/more" className="section-title__link">
                Browse All →
              </Link>
            </div>
            <div className="cat-grid mt-5">
              {categories.map((c) => (
                <Link key={c.slug} href={`/category/${c.slug}`} className="cat-chip group">
                  <span className="cat-chip__emoji">{c.emoji}</span>
                  <span className="cat-chip__name">{c.name}</span>
                </Link>
              ))}
            </div>
          </section>

          {/* Game info panel (Poki style: title + rating + description + metadata) — last */}
          <section className="info-panel">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-surface-sunken shadow-card">
                  <img src={game.cover} alt={game.title} className="h-full w-full object-cover" />
                </div>
                <div>
                  <h1 className="text-2xl font-black tracking-tight text-ink-900 sm:text-3xl">
                    {game.title}
                  </h1>
                  <p className="mt-1 text-sm font-semibold text-ink-400">
                    By {game.developer ?? "Have Fun"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {game.rating && (
                  <span className="rating">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                    {game.rating.toFixed(1)}
                  </span>
                )}
                {game.plays && (
                  <span className="rounded-full bg-surface-muted px-3 py-1 text-sm font-bold text-ink-500">
                    {game.plays}
                  </span>
                )}
              </div>
            </div>

            <p className="mt-5 max-w-3xl text-[15px] leading-relaxed text-ink-600">
              {game.description}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {game.tags.map((t) => (
                <Link
                  key={t}
                  href={`/category/${t}`}
                  className="rounded-full bg-surface-muted px-3 py-1 text-xs font-semibold text-ink-500 transition-colors hover:bg-brand-100 hover:text-brand-700"
                >
                  #{t}
                </Link>
              ))}
            </div>

            <div className="mt-5 grid gap-0 sm:grid-cols-2">
              <div className="info-row">
                <span className="info-row__label">
                  <svg className="h-4 w-4 text-brand-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                  </svg>
                  Controls
                </span>
                <span className="info-row__value">Mouse / Touch / Keyboard</span>
              </div>
              <div className="info-row">
                <span className="info-row__label">
                  <svg className="h-4 w-4 text-brand-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="3" width="20" height="14" rx="2" />
                    <path d="M8 21h8" />
                    <path d="M12 17v4" />
                  </svg>
                  Devices
                </span>
                <span className="info-row__value">PC / Mobile / Tablet</span>
              </div>
              <div className="info-row">
                <span className="info-row__label">
                  <svg className="h-4 w-4 text-brand-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 6v6l4 2" />
                  </svg>
                  Released
                </span>
                <span className="info-row__value">{game.release ?? "2024"}</span>
              </div>
              <div className="info-row">
                <span className="info-row__label">
                  <svg className="h-4 w-4 text-brand-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                  Players
                </span>
                <span className="info-row__value">{game.players ?? "Single"}</span>
              </div>
            </div>
          </section>

          {/* Banner ad */}
          <AdSlot label="Ad · Banner" className="ad-strip h-20" />
        </main>

        {/* Right sidebar: popular + ads */}
        <aside className="game-stage__side">
          <SidebarIconList title="Popular Now" games={rightGames} />
          <AdSlot label="Ad" className="ad-sky h-64 shrink-0" />
          <SidebarIconList title="Classics" games={others.slice(6, 11)} />
          <AdSlot label="Ad" className="ad-sky h-40 shrink-0" />
        </aside>
      </div>
    </div>
  );
}
