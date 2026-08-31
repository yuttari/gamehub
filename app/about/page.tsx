import Link from "next/link";

export default function AboutPage() {
  return (
    <div>
      <div className="topbar sticky top-0 z-40">
        <Link href="/" className="topbar__logo">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-500 text-sm font-black text-white">
            H
          </span>
          <b>Have Fun</b>
        </Link>
        <Link href="/more" className="topbar__search">
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          Search / More
        </Link>
      </div>

      <div className="container-page max-w-3xl py-12">
      <h1 className="text-3xl font-black tracking-tight text-ink-900">About Have Fun</h1>
      <p className="mt-4 leading-relaxed text-ink-500">
        Have Fun is a free online gaming platform featuring a curated collection of open-source HTML5 games.
        Every game is used under its respective open-source license (MIT / CC0 / CC-BY) or originally rewritten by us,
        so you can play and share them freely — no download, no login required.
      </p>

      <h2 id="privacy" className="mt-10 text-xl font-bold text-ink-900">
        Privacy Policy
      </h2>
      <p className="mt-3 leading-relaxed text-ink-500">
        We do not require registration or login, and we do not collect your personal information.
        Ads on the site are served by Google AdSense, whose delivery and tracking follow Google's Privacy Policy.
        You can refuse third-party cookies through your browser settings.
      </p>

      <h2 id="license" className="mt-10 text-xl font-bold text-ink-900">
        Open Source
      </h2>
      <p className="mt-3 leading-relaxed text-ink-500">
        Third-party games featured here remain the copyright of their respective authors and are displayed and
        distributed under the open-source licenses they declare (such as MIT, CC0, CC-BY), with original attribution
        and license text preserved. If you believe any game raises a copyright issue, please contact us via the
        About page and we will address it promptly.
      </p>

      <h2 className="mt-10 text-xl font-bold text-ink-900">Contact Us</h2>
      <p className="mt-3 leading-relaxed text-ink-500">
        Business cooperation or copyright claims: hello@havefun.example
      </p>
      </div>
    </div>
  );
}
