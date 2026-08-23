import Link from "next/link";
import type { Game } from "@/lib/games";

export default function IconCard({ game }: { game: Game }) {
  return (
    <Link href={`/game/${game.slug}`} className="icon-card group animate-fade-up" title={game.title}>
      <div className="icon-card__thumb">
        <img src={game.cover} alt={game.title} loading="lazy" />
        {/* Name overlay: hidden by default, appears at the bottom inside the icon on hover */}
        <span className="icon-card__name">{game.title}</span>
      </div>
    </Link>
  );
}
