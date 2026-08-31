import Link from "next/link";
import IconCard from "@/components/IconCard";
import AdSlot from "@/components/AdSlot";
import { getAllGames } from "@/lib/games";

export default function HomePage() {
  const all = getAllGames();
  // Ad strip insertion point (visual rhythm, keeps core area unobstructed)
  const stripAfter = 7;

  return (
    <div>
      {/* Top bar: brand + search/more entry (secondary area) */}
      <div className="topbar sticky top-0 z-40">
        <Link href="/" className="topbar__logo">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-500 text-sm font-black text-white">
            G
          </span>
          <b>Have Fun</b>
        </Link>
        <Link href="/more" className="topbar__search">
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          Search / More Games
        </Link>
      </div>

      <div className="container-page py-6 sm:py-8">
        {/* Hero ad banner (Poki-style) */}
        <AdSlot label="Ad · Hero Banner" className="ad-hero mb-6" height="h-28 sm:h-32" />

        {/* All games around the core: a plain grid, show everything, click to play */}
        <div className="play-grid">
          {all.map((g, i) => (
            <div key={g.slug} className="contents">
              <IconCard game={g} />
              {/* Strip ad: spans a full row, inserted after the first few */}
              {i === stripAfter && (
                <AdSlot
                  label="Ad · Strip"
                  className="ad-strip col-span-full my-1"
                  height="h-16"
                />
              )}
            </div>
          ))}
          {/* One more strip at the end to balance the layout */}
          <AdSlot label="Ad · Strip" className="ad-strip col-span-full my-1" height="h-16" />
        </div>

        {/* Bottom hero ad banner */}
        <AdSlot label="Ad · Bottom Banner" className="ad-hero mt-8" height="h-28 sm:h-32" />
      </div>
    </div>
  );
}
