import Link from "next/link";
import type { Game } from "@/lib/games";

export default function GameCard({ game }: { game: Game }) {
  return (
    <Link href={`/game/${game.slug}/`} className="game-card group animate-fade-up">
      <div className="game-card__thumb">
        {/* Real cover image (SVG-generated, consistent style) */}
        <img src={game.cover} alt={game.title} loading="lazy" />
        <span className="game-card__badge">{game.players ?? "Single"}</span>
      </div>
      <h3 className="game-card__title game-card__title-clamp">{game.title}</h3>
    </Link>
  );
}
