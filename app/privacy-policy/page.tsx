import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy & Licenses",
  description:
    "GameHub privacy policy, cookie and advertising disclosure, and open-source license notices.",
};

export default function PrivacyPolicy() {
  return (
    <div className="container-page max-w-3xl py-12">
      <h1 className="text-3xl font-black tracking-tight text-ink-900">Privacy Policy & Licenses</h1>
      <p className="mt-3 text-sm text-ink-400">Last updated: 2026</p>

      <section id="privacy" className="mt-10 scroll-mt-24">
        <h2 className="text-xl font-bold text-ink-900">1. Information we collect</h2>
        <p className="mt-3 text-[15px] leading-relaxed text-ink-600">
          GameHub is a static game portal. We do not require accounts and do not
          knowingly collect personal information such as names, emails, or payment
          details. We may collect anonymous, aggregated usage data (such as page
          views and game plays) through privacy-friendly analytics.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-bold text-ink-900">2. Advertising & cookies</h2>
        <p className="mt-3 text-[15px] leading-relaxed text-ink-600">
          We use Google AdSense to display advertisements. AdSense and its partners
          may use cookies and similar technologies to serve personalized ads based on
          your prior visits and to measure ad performance. You can control ad
          personalization at any time via{" "}
          <a
            href="https://www.google.com/settings/ads"
            className="font-semibold text-brand-600 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Google Ads Settings
          </a>
          . For users in the EEA/UK, ads are shown only after explicit consent is
          provided through our cookie banner.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-bold text-ink-900">3. Third-party links</h2>
        <p className="mt-3 text-[15px] leading-relaxed text-ink-600">
          Our games are embedded from the same origin and are free, open-source, or
          self-developed titles. We are not responsible for the content or practices
          of any external sites linked from advertisements.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-bold text-ink-900">4. Contact</h2>
        <p className="mt-3 text-[15px] leading-relaxed text-ink-600">
          Questions about this policy? Contact us at{" "}
          <span className="font-semibold text-ink-800">privacy@gamehub.example</span>.
        </p>
      </section>

      <section id="license" className="mt-10 scroll-mt-24 border-t border-black/5 pt-8">
        <h2 className="text-xl font-bold text-ink-900">Open-source licenses</h2>
        <p className="mt-3 text-[15px] leading-relaxed text-ink-600">
          All games on GameHub are either self-developed or redistributed under
          permissive open-source licenses (MIT / BSD-3-Clause). Credit and license
          notices are preserved in each game&apos;s source. No copyrighted or
          proprietary games are hosted on this site.
        </p>
      </section>

      <div className="mt-10">
        <Link href="/" className="text-sm font-semibold text-brand-600 hover:underline">
          ← Back to games
        </Link>
      </div>
    </div>
  );
}
