/** @type {import('next').NextConfig} */
const isExport = process.env.STATIC_EXPORT === "1";

const securityHeaders = [
  // Clickjacking protection: only allow this site itself to embed pages in an iframe
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Content-Security-Policy", value: [
    "default-src 'self'",
    // Our own scripts + Google AdSense scripts; 'unsafe-inline' for Next's injected and inline styles
    "script-src 'self' 'unsafe-inline' https://pagead2.googlesyndication.com https://*.googlesyndication.com",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self'",
    "frame-src 'self' https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'self'",
    "upgrade-insecure-requests",
  ].join("; ") },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "geolocation=(), microphone=(), camera=(), payment=()" },
];

const nextConfig = {
  reactStrictMode: true,
  // Per-build cache-buster for embedded game iframes. Inlined into client bundles at build time,
  // so every `next build` yields a new query string on the game URL and the browser is forced to
  // fetch a fresh copy instead of replaying a cached one.
  env: { NEXT_PUBLIC_GAME_VER: String(Date.now()) },
  // Export each route as a directory (game/match3/index.html) so it can be
  // opened without the .html extension on both local preview and Cloudflare.
  trailingSlash: true,
  // Static export mode (for sandbox/static hosting). Skips server-only headers().
  ...(isExport ? { output: "export" } : {}),
  ...(isExport
    ? {}
    : {
        async headers() {
          return [{ source: "/:path*", headers: securityHeaders }];
        },
      }),
};

module.exports = nextConfig;
