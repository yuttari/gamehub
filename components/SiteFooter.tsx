import Link from "next/link";
import { categories } from "@/lib/games";

export default function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-black/5 bg-white">
      <div className="container-page grid gap-10 py-12 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-500 text-sm font-black text-white">
              G
            </span>
            <span className="text-base font-extrabold text-ink-900">GameHub</span>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-ink-500">
            Free online games, play instantly, no download. Curated open-source games to brighten your day.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-bold text-ink-900">Categories</h4>
          <ul className="mt-3 space-y-2">
            {categories.slice(0, 5).map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/category/${c.slug}`}
                  className="text-sm text-ink-500 transition-colors hover:text-brand-600"
                >
                  {c.emoji} {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-bold text-ink-900">About</h4>
          <ul className="mt-3 space-y-2 text-sm text-ink-500">
            <li>
              <Link href="/privacy-policy" className="transition-colors hover:text-brand-600">
                About Us
              </Link>
            </li>
            <li>
              <Link href="/privacy-policy#privacy" className="transition-colors hover:text-brand-600">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/privacy-policy#license" className="transition-colors hover:text-brand-600">
                Open Source
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-bold text-ink-900">Have Fun</h4>
          <p className="mt-3 text-sm text-ink-500">
            All games are open-source or originally rewritten — safe to play and share.
          </p>
        </div>
      </div>
      <div className="border-t border-black/5 py-5">
        <p className="container-page text-center text-xs text-ink-400">
          © {new Date().getFullYear()} GameHub. Game copyrights belong to their respective authors, used under open-source licenses.
        </p>
      </div>
    </footer>
  );
}
