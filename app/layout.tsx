import type { Metadata } from "next";
import "./globals.css";
import SiteFooter from "@/components/SiteFooter";
import AdManager from "@/components/AdManager";

const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

export const metadata: Metadata = {
  title: {
    default: "GameHub — Free Online Games, Play Instantly",
    template: "%s — GameHub",
  },
  description:
    "GameHub offers a curated collection of free HTML5 games — puzzle, arcade, casual, multiplayer. Play instantly, no download.",
  keywords: ["online games", "html5 games", "free games", "puzzle", "arcade", "casual"],
  openGraph: {
    title: "GameHub — Free Online Games",
    description: "Curated free HTML5 games, play instantly.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {ADSENSE_CLIENT && (
          <meta name="google-adsense-account" content={ADSENSE_CLIENT} />
        )}
      </head>
      <body className="min-h-screen flex flex-col">
        <main className="flex-1">{children}</main>
        <SiteFooter />
        <AdManager />
      </body>
    </html>
  );
}
