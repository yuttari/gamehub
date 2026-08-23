import type { MetadataRoute } from "next";
import { getAllGames, categories } from "@/lib/games";

const BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://gamehub.example";

export default function sitemap(): MetadataRoute.Sitemap {
  const games = getAllGames();
  const staticRoutes = ["", "/more", "/privacy-policy"].map((p) => ({
    url: `${BASE}${p}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: p === "" ? 1 : 0.6,
  }));
  const gameRoutes = games.map((g) => ({
    url: `${BASE}/game/${g.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));
  const categoryRoutes = categories.map((c) => ({
    url: `${BASE}/category/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  return [...staticRoutes, ...gameRoutes, ...categoryRoutes];
}
