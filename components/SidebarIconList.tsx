import Link from "next/link";
import type { Game } from "@/lib/games";

export default function SidebarIconList({
  games,
  title,
}: {
  games: Game[];
  title?: string;
}) {
  if (!games.length) return null;
  return (
    <div className="side-list">
      {title && <h3 className="side-list__title">{title}</h3>}
      {games.map((g) => (
        <Link
          key={g.slug}
          href={`/game/${g.slug}`}
          className="side-item group"
          title={g.title}
        >
          <div className="side-item__thumb">
            <img
              src={g.cover}
              alt={g.title}
              className="side-item__img"
              loading="lazy"
            />
            {/* Name overlay: hidden by default, shown on hover */}
            <span className="side-item__name">{g.title}</span>
          </div>
        </Link>
      ))}
    </div>
  );
}
