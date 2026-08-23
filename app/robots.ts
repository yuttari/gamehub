import type { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://gamehub.example";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Games are static single files and need not be indexed; everything else is allowed
      disallow: ["/games/", "/covers/"],
    },
    sitemap: `${BASE}/sitemap.xml`,
  };
}
