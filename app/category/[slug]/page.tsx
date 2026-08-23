import { notFound } from "next/navigation";
import Link from "next/link";
import IconCard from "@/components/IconCard";
import AdSlot from "@/components/AdSlot";
import { getGamesByCategory, getCategory, categories } from "@/lib/games";

export function generateStaticParams() {
  return categories.map((c) => ({ slug: c.slug }));
}

export default function CategoryPage({ params }: { params: { slug: string } }) {
  const cat = getCategory(params.slug);
  if (!cat) notFound();

  const list = getGamesByCategory(cat.slug);

  return (
    <div>
      <div className="topbar sticky top-0 z-40">
        <Link href="/" className="topbar__logo">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-500 text-sm font-black text-white">
            G
          </span>
          <b>GameHub</b>
        </Link>
        <Link href="/more" className="topbar__search">
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          Search / More
        </Link>
      </div>

      <div className="container-page py-8">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{cat.emoji}</span>
          <h1 className="text-3xl font-black tracking-tight text-ink-900">
            {cat.name} Games
          </h1>
        </div>
        <p className="mt-2 text-ink-500">{list.length} games · Play instantly</p>

        <AdSlot label="Ad · Category Top" height="h-16 mt-6" />

        {list.length ? (
          <div className="play-grid mt-8">
            {list.map((g, i) => (
              <div key={g.slug} className="contents">
                <IconCard game={g} />
                {i === 6 && (
                  <AdSlot label="Ad · Strip" className="ad-strip col-span-full my-1" height="h-16" />
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-12 rounded-3xl bg-white p-12 text-center shadow-card">
            <span className="text-4xl">🚧</span>
            <p className="mt-3 font-bold text-ink-700">More games coming to this category soon…</p>
            <Link href="/" className="btn-primary mt-5">
              Back to Home
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
