"use client";

import { useEffect, useState } from "react";

// Publisher ID (fill in NEXT_PUBLIC_ADSENSE_CLIENT in .env.local after AdSense approval)
const CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

type Consent = "" | "granted" | "denied";

/**
 * Centralizes AdSense script injection and EU/EEA cookie consent.
 * - CLIENT not set: no ads at all (MVP / pre-approval), no banner.
 * - CLIENT set and visitor undecided: show a consent banner (GDPR / ePrivacy).
 * - After accept: inject adsbygoogle.js and persist the choice; reject never loads ads.
 */
export default function AdManager() {
  const [consent, setConsent] = useState<Consent>("");
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const c = (localStorage.getItem("ad-consent") as Consent) || "";
    if (c === "granted" || c === "denied") {
      setConsent(c);
    } else if (CLIENT) {
      setShowBanner(true);
    }
  }, []);

  useEffect(() => {
    if (consent !== "granted" || !CLIENT) return;
    if (document.getElementById("adsbygoogle-js")) return;
    const s = document.createElement("script");
    s.id = "adsbygoogle-js";
    s.async = true;
    s.crossOrigin = "anonymous";
    s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${CLIENT}`;
    document.head.appendChild(s);
  }, [consent]);

  const accept = () => {
    localStorage.setItem("ad-consent", "granted");
    setConsent("granted");
    setShowBanner(false);
  };
  const reject = () => {
    localStorage.setItem("ad-consent", "denied");
    setConsent("denied");
    setShowBanner(false);
  };

  if (!CLIENT || !showBanner) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] px-3 pb-3 sm:px-4">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-3 rounded-2xl bg-surface p-4 shadow-card-hover ring-1 ring-black/5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-relaxed text-ink-600">
          We use cookies and Google AdSense to show personalized ads and improve our service.
          By continuing to browse, you acknowledge and agree to our
          <a href="/privacy-policy" className="font-semibold text-brand-600 hover:underline">
            Privacy Policy
          </a>
          .
        </p>
        <div className="flex shrink-0 gap-2">
          <button
            onClick={reject}
            className="rounded-full px-4 py-2 text-sm font-bold text-ink-500 transition-colors hover:bg-surface-muted"
          >
            Reject
          </button>
          <button
            onClick={accept}
            className="rounded-full bg-brand-500 px-5 py-2 text-sm font-bold text-white shadow-sm transition-transform hover:scale-[1.03]"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
