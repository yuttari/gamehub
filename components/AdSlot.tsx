"use client";

import { useEffect, useRef } from "react";

const CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

export default function AdSlot({
  slot,
  label = "Ad",
  className = "",
  height = "h-24",
  format = "auto",
  responsive = true,
}: {
  slot?: string;
  label?: string;
  className?: string;
  height?: string;
  format?: string;
  responsive?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (CLIENT && slot && typeof window !== "undefined") {
      try {
        // Global array injected by the AdSense script
        (window as any).adsbygoogle = (window as any).adsbygoogle || [];
        (window as any).adsbygoogle.push({});
      } catch {
        /* Ignore if the script isn't ready yet */
      }
    }
  }, [slot]);

  // CLIENT configured: render a manual ad unit when slot is given, otherwise defer to "auto ads" (no placeholder).
  if (CLIENT) {
    if (!slot) return null;
    return (
      <div ref={ref} className={`overflow-hidden ${className}`} aria-label={`${label} (AdSense)`}>
        <ins
          className="adsbygoogle"
          style={{ display: "block" }}
          data-ad-client={CLIENT}
          data-ad-slot={slot}
          data-ad-format={format}
          data-full-width-responsive={responsive}
        />
      </div>
    );
  }

  // No publisher ID: render a placeholder so the MVP layout doesn't collapse.
  return (
    <div className={`ad-slot ${height} ${className}`} aria-label={`${label} (AdSense pending)`}>
      <span className="flex items-center gap-2">
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="M3 15l5-4 4 3 3-2 6 5" />
        </svg>
        {label}
      </span>
    </div>
  );
}
