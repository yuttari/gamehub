export type GameLicense = "MIT" | "CC0" | "CC-BY" | "Custom" | "Self-made";

export interface Game {
  slug: string;
  title: string;
  description: string;
  tags: string[];
  category: string; // primary category slug
  cover: string; // /covers/xxx.png
  path: string; // /games/xxx/index.html
  license: GameLicense;
  author: string;
  sourceUrl?: string;
  featured?: boolean;
  players?: string; // e.g. "Single" / "1-2 Players"
  rating?: number; // 0-5
  plays?: string; // e.g. "1.2k plays"
  developer?: string;
  release?: string; // e.g. "Oct 2022"
}

export interface Category {
  slug: string;
  name: string;
  emoji: string;
}

// ---- Categories (Poki-inspired but more focused) ----
export const categories: Category[] = [
  { slug: "puzzle", name: "Puzzle", emoji: "🧩" },
  { slug: "arcade", name: "Arcade", emoji: "👾" },
  { slug: "action", name: "Action", emoji: "⚔️" },
  { slug: "shooting", name: "Shooting", emoji: "🔫" },
  { slug: "racing", name: "Racing", emoji: "🏁" },
  { slug: "io", name: "Multiplayer", emoji: "🌐" },
  { slug: "board", name: "Board", emoji: "♟️" },
  { slug: "casual", name: "Casual", emoji: "🎈" },
  { slug: "beauty", name: "Beauty", emoji: "💄" },
  { slug: "kids", name: "Kids", emoji: "🧸" },
  { slug: "two-player", name: "2 Player", emoji: "👥" },
  { slug: "classic", name: "Classic", emoji: "🕹️" },
];

import gamesData from "@/data/games.json";

const games: Game[] = gamesData as Game[];

export function getAllGames(): Game[] {
  return games;
}

export function getFeaturedGames(): Game[] {
  return games.filter((g) => g.featured);
}

export function getGameBySlug(slug: string): Game | undefined {
  return games.find((g) => g.slug === slug);
}

export function getGamesByCategory(slug: string): Game[] {
  return games.filter((g) => g.category === slug || g.tags.includes(slug));
}

export function getCategory(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}

export function searchGames(q: string): Game[] {
  const t = q.trim().toLowerCase();
  if (!t) return [];
  return games.filter(
    (g) =>
      g.title.toLowerCase().includes(t) ||
      g.description.toLowerCase().includes(t) ||
      g.tags.some((tag) => tag.toLowerCase().includes(t))
  );
}
