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

  return (
    <div
      className={`relative w-full overflow-hidden rounded-3xl bg-black shadow-float ${className}`}
    >
      {/* Fixed-height container: maximize the visible area, avoid cropping portrait/square games */}
      <div className="relative h-[72vh] w-full min-h-[540px] max-h-[880px]">
        {!loaded && (
          <div className="absolute inset-0 grid place-items-center bg-surface-sunken">
            <div className="flex flex-col items-center gap-3 text-ink-400">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-ink-300 border-t-brand-500" />
              <span className="text-sm font-semibold">Loading {title}…</span>
            </div>
          </div>
        )}
        <iframe
          src={src}
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
