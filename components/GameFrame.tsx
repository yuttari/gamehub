"use client";

import { useState } from "react";

export default function GameFrame({
  src,
  title,
  className = "",
}: {
  src: string;
  title: string;
  className?: string;
}) {
  const [loaded, setLoaded] = useState(false);

  // Append a per-build version query so the embedded game is always fetched fresh (no stale cache).
  const ver = process.env.NEXT_PUBLIC_GAME_VER || "1";
  const vSrc = src + (src.includes("?") ? "&" : "?") + "gv=" + ver;

  return (
    <div
      className={`relative w-full overflow-hidden rounded-3xl bg-black shadow-float ${className}`}
    >
      {/* Landscape stage: height capped to be smaller than width so the play area stays wide (16:9-ish) */}
      <div className="relative mx-auto aspect-[16/9] w-full max-h-[calc(100vh-120px)]">
        {!loaded && (
          <div className="absolute inset-0 grid place-items-center bg-surface-sunken">
            <div className="flex flex-col items-center gap-3 text-ink-400">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-ink-300 border-t-brand-500" />
              <span className="text-sm font-semibold">Loading {title}…</span>
            </div>
          </div>
        )}
        <iframe
          src={vSrc}
          title={title}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          className="absolute inset-0 h-full w-full border-0"
          allow="autoplay; fullscreen; gamepad"
        />
      </div>
    </div>
  );
}
